import os
import json
import time
from datetime import datetime
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings
from knowledge.utils import search_knowledge_base, find_instant_answer, semantic_find_answer

# Global HTTP Session for connection pooling & ultra-fast API calls
http_session = requests.Session()

# ---------------------------------------------------------------------------
# Simple per-IP rate limit (protects the public chat + Gemini quota from abuse).
# In-memory is fine because we run a single Gunicorn worker.
# ---------------------------------------------------------------------------
RATE_LIMIT = int(os.getenv('CHAT_RATE_LIMIT', '20'))       # messages
RATE_WINDOW = int(os.getenv('CHAT_RATE_WINDOW', '60'))     # per this many seconds
_RATE_HITS = {}

# Memory management knobs.
MEMORY_CHAR_BUDGET = int(os.getenv('MEMORY_CHAR_BUDGET', '3500'))   # conversation context budget
MAX_MSGS_PER_SESSION = int(os.getenv('MAX_MSGS_PER_SESSION', '100'))  # messages kept per chat
MAX_SESSIONS_PER_KEY = int(os.getenv('MAX_SESSIONS_PER_KEY', '50'))   # non-pinned chats kept


def _client_ip(request):
    fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    return fwd.split(',')[0].strip() if fwd else request.META.get('REMOTE_ADDR', '?')


def _is_rate_limited(ip):
    now = time.time()
    hits = [t for t in _RATE_HITS.get(ip, []) if now - t < RATE_WINDOW]
    if len(hits) >= RATE_LIMIT:
        _RATE_HITS[ip] = hits
        return True
    hits.append(now)
    _RATE_HITS[ip] = hits
    return False


# ---------------------------------------------------------------------------
# Server-side chat history (persists across sessions, unlike localStorage).
# Keyed by the browser's Django session so it works for anonymous users too.
# ---------------------------------------------------------------------------
def _save_chat(request, client_id, user_text, assistant_text, title=None):
    """Persist one user+assistant exchange. Never raises (best-effort)."""
    try:
        from knowledge.models import ChatSession, ChatMessage
        if not request.session.session_key:
            request.session.save()
        key = request.session.session_key
        if not key or not client_id:
            return
        sess, _ = ChatSession.objects.get_or_create(
            session_key=key, client_id=client_id,
            defaults={'title': ((title or user_text) or 'New Chat')[:60]},
        )
        ChatMessage.objects.create(session=sess, role='user', text=user_text)
        if assistant_text:
            ChatMessage.objects.create(session=sess, role='assistant', text=assistant_text)
        sess.save(update_fields=['updated_at'])

        # --- storage limits ---
        # 1. cap messages per session (drop the oldest beyond the limit)
        msg_ids = list(sess.messages.order_by('-created_at').values_list('id', flat=True))
        if len(msg_ids) > MAX_MSGS_PER_SESSION:
            ChatMessage.objects.filter(id__in=msg_ids[MAX_MSGS_PER_SESSION:]).delete()
        # 2. cap non-pinned sessions per browser (drop the oldest beyond the limit)
        extra = list(
            ChatSession.objects.filter(session_key=key, pinned=False)
            .order_by('-updated_at').values_list('id', flat=True)[MAX_SESSIONS_PER_KEY:]
        )
        if extra:
            ChatSession.objects.filter(id__in=extra).delete()
    except Exception:
        pass


def _log_unanswered(prompt, language):
    """Record a question the knowledge base couldn't answer (dedup by text)."""
    try:
        from knowledge.models import UnansweredQuery
        q = (prompt or '').strip()
        if len(q) < 5:
            return
        from django.db.models import F
        obj, created = UnansweredQuery.objects.get_or_create(
            question=q, defaults={'language': language},
        )
        if not created:
            UnansweredQuery.objects.filter(pk=obj.pk).update(count=F('count') + 1, resolved=False)
    except Exception:
        pass


def feedback_view(request):
    """Store a 👍 / 👎 on an answer."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST is allowed'}, status=405)
    try:
        from knowledge.models import Feedback
        data = json.loads(request.body.decode('utf-8'))
        rating = data.get('rating')
        if rating not in ('up', 'down'):
            return JsonResponse({'error': 'rating must be up/down'}, status=400)
        Feedback.objects.create(
            question=str(data.get('question', ''))[:2000],
            answer=str(data.get('answer', ''))[:4000],
            rating=rating,
            language=str(data.get('language', 'hinglish'))[:16],
        )
        return JsonResponse({'ok': True})
    except Exception:
        return JsonResponse({'ok': False}, status=400)


def chat_history_view(request):
    """Return this browser-session's saved conversations (newest first)."""
    from knowledge.models import ChatSession
    key = request.session.session_key
    out = []
    if key:
        qs = ChatSession.objects.filter(session_key=key).prefetch_related('messages')[:200]
        for s in qs:
            out.append({
                'id': s.client_id,
                'title': s.title,
                'time': s.updated_at.strftime('%b %d, %H:%M'),
                'pinned': s.pinned,
                'messages': [{'role': m.role, 'text': m.text} for m in s.messages.all()],
            })
    return JsonResponse({'sessions': out})


def chat_action_view(request):
    """Manage saved chats: pin/unpin, delete one, or clear all — for this session."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST is allowed'}, status=405)
    from knowledge.models import ChatSession
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    key = request.session.session_key
    if not key:
        return JsonResponse({'ok': True})

    action = data.get('action')
    qs = ChatSession.objects.filter(session_key=key)

    if action == 'clear':
        qs.delete()
        return JsonResponse({'ok': True})

    cid = data.get('session_id')
    if not cid:
        return JsonResponse({'error': 'session_id required'}, status=400)
    sess = qs.filter(client_id=cid).first()
    if not sess:
        return JsonResponse({'ok': True})

    if action == 'delete':
        sess.delete()
        return JsonResponse({'ok': True})
    if action == 'pin':
        sess.pinned = not sess.pinned
        sess.save(update_fields=['pinned'])
        return JsonResponse({'ok': True, 'pinned': sess.pinned})
    return JsonResponse({'error': 'Unknown action'}, status=400)


def health_view(request):
    """Lightweight health check for uptime monitors."""
    return JsonResponse({'status': 'ok'})

# ---------------------------------------------------------------------------
# Local LLM (Ollama) configuration — primary engine, Gemini is the fallback.
# ---------------------------------------------------------------------------
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen2.5:0.5b')
# Set USE_LOCAL_LLM=False in .env to disable the local model and use Gemini only.
USE_LOCAL_LLM = os.getenv('USE_LOCAL_LLM', 'True').lower() in ('true', '1', 't')
# Performance knobs (tuned for a low-end CPU-only machine).
OLLAMA_NUM_PREDICT = int(os.getenv('OLLAMA_NUM_PREDICT', '400'))   # cap output length
OLLAMA_NUM_THREAD = int(os.getenv('OLLAMA_NUM_THREAD', '4'))        # physical CPU cores
OLLAMA_KEEP_ALIVE = os.getenv('OLLAMA_KEEP_ALIVE', '30m')           # keep model warm in RAM

# STRICT_KB_MODE: when there is no relevant knowledge-base context, answer with an
# honest "I don't know" instead of letting the model invent a (possibly wrong) reply.
# Set STRICT_KB_MODE=False in .env to allow free general-purpose answers instead.
STRICT_KB_MODE = os.getenv('STRICT_KB_MODE', 'False').lower() in ('true', '1', 't')
DONT_KNOW_MSG = (
    "Iske baare me mere paas abhi pakki (verified) jaankari nahi hai. "
    "Main sirf apne knowledge base ke aadhaar par hi sahi jawab de sakta hoon."
)

# IndicTrans2 (AI4Bharat) translation microservice — runs in its own venv on the
# server and gives specialised, natural Assamese. Used only for the general
# (non knowledge-base) Assamese path, where an English answer is available to
# translate. KB answers use their stored/verified Assamese instead.
INDICTRANS_URL = os.getenv('INDICTRANS_URL', 'http://127.0.0.1:8765')
USE_INDICTRANS = os.getenv('USE_INDICTRANS', 'True').lower() in ('true', '1', 't')


def _indic_translate(text):
    """English -> Assamese via the IndicTrans2 service. Returns None on any failure."""
    if not USE_INDICTRANS or not text.strip():
        return None
    try:
        r = http_session.post(f"{INDICTRANS_URL}/translate",
                              json={'text': text}, timeout=60)
        if r.status_code == 200:
            arr = r.json().get('translations') or []
            if arr and arr[0].strip():
                return arr[0].strip()
    except requests.RequestException:
        pass
    return None


def _gemini_generate(api_key, system, prompt, models):
    """One-shot (non-streaming) Gemini call; returns plain text or None."""
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system}]},
    }
    for model_id in models:
        try:
            url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
                   f"{model_id}:generateContent?key={api_key}")
            res = http_session.post(url, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                cands = res.json().get('candidates', [])
                if cands:
                    parts = cands[0].get('content', {}).get('parts', [])
                    if parts and parts[0].get('text', '').strip():
                        return parts[0]['text'].strip()
        except requests.RequestException:
            continue
    return None


# Groq — OpenAI-compatible API, very fast, generous free tier. Used as the
# automatic fallback when Gemini fails (e.g. its free daily quota is exhausted),
# so users still get a real answer instead of an error.
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-120b')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'


def _groq_generate(system, prompt, timeout=30):
    """One-shot Groq chat completion; returns plain text or None on any failure."""
    if not GROQ_API_KEY:
        return None
    try:
        r = http_session.post(
            GROQ_URL,
            headers={'Authorization': f'Bearer {GROQ_API_KEY}',
                     'Content-Type': 'application/json'},
            json={'model': GROQ_MODEL, 'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt}]},
            timeout=timeout)
        if r.status_code == 200:
            txt = r.json()['choices'][0]['message']['content']
            if txt and txt.strip():
                return txt.strip()
    except (requests.RequestException, KeyError, IndexError, ValueError):
        pass
    return None


def _groq_stream_response(system, prompt, on_done, timeout=30):
    """Start a STREAMING Groq completion. Returns a text-chunk generator if the
    stream opens (HTTP 200), else None so the caller can fall back to Gemini.
    `on_done(full_text)` is called once the stream finishes (to persist it)."""
    if not GROQ_API_KEY:
        return None
    try:
        r = http_session.post(
            GROQ_URL,
            headers={'Authorization': f'Bearer {GROQ_API_KEY}',
                     'Content-Type': 'application/json'},
            json={'model': GROQ_MODEL, 'stream': True, 'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt}]},
            stream=True, timeout=timeout)
    except requests.RequestException:
        return None
    if r.status_code != 200:
        r.close()
        return None

    def gen():
        acc = []
        try:
            for raw in r.iter_lines():
                if not raw:
                    continue
                line = raw.decode('utf-8', 'ignore')
                if not line.startswith('data:'):
                    continue
                data = line[5:].strip()
                if data == '[DONE]':
                    break
                try:
                    delta = json.loads(data)['choices'][0]['delta'].get('content')
                except (ValueError, KeyError, IndexError):
                    continue
                if delta:
                    acc.append(delta)
                    yield delta
        finally:
            r.close()
            on_done(''.join(acc))
    return gen()


def call_local_llm(final_prompt, system_instruction, timeout=120):
    """
    Query the local Ollama model. Returns the generated text on success,
    or None if the server is unreachable / returns an error (so the caller
    can fall back to Gemini). Note: no web-search grounding is available here.
    """
    try:
        payload = {
            'model': OLLAMA_MODEL,
            'prompt': final_prompt,
            'system': system_instruction,
            'stream': False,
            'keep_alive': OLLAMA_KEEP_ALIVE,
            'options': {
                'num_predict': OLLAMA_NUM_PREDICT,
                'num_thread': OLLAMA_NUM_THREAD,
                'temperature': 0.7,
            },
        }
        res = http_session.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=timeout)
        if res.status_code == 200:
            text = res.json().get('response', '').strip()
            if text:
                return text
    except Exception:
        pass
    return None


@ensure_csrf_cookie
def home_view(request):
    return render(request, 'index.html')

@ensure_csrf_cookie
def admin_panel_view(request):
    # The React SPA (served from index.html) renders the admin dashboard when
    # window.isStaff is true. Gate access server-side: anonymous or non-staff
    # users are sent to the dedicated admin login page instead of the chat view.
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('admin_login')
    return render(request, 'index.html')

def chat_api_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse(
            {'error': 'Bahut zyada messages — thodi der ruk kar dobara try karo.'},
            status=429,
        )

    try:
        data = json.loads(request.body.decode('utf-8'))
        prompt = data.get('prompt', '').strip()
        web_search = data.get('web_search', False)
        client_id = str(data.get('session_id', '') or '')
        # Axom AI is Assamese-only: every reply is in Assamese, whatever the
        # user typed in (English/Hindi/Hinglish) and whatever the client sends.
        language = 'assamese'
        history = data.get('history', [])
        if not isinstance(history, list):
            history = []
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not prompt:
        return JsonResponse({'error': 'Prompt cannot be empty'}, status=400)

    import re

    # Language the user picked for the reply.
    LANG_LABEL = {
        'english': 'English',
        'hinglish': 'Hinglish (Hindi written in Roman/English letters)',
        'assamese': 'the Assamese language using Assamese script (অসমীয়া)',
    }
    target_lang = LANG_LABEL.get(language, LANG_LABEL['hinglish'])

    # 1. System prompt — general-purpose AI assistant (ChatGPT / DeepSeek style).
    today = datetime.now().strftime('%A, %d %B %Y')
    system_instruction = (
        f"Today's date is {today}. You are Axom AI — a friendly, knowledgeable assistant focused on "
        "Assam (its history, culture, festivals, tourism, food, geography and people). "
        "ALWAYS reply in natural, native, everyday Assamese using correct Assamese script (অসমীয়া) and "
        "grammar — the way an educated Assamese person actually speaks. Do NOT write English words in "
        "Assamese script: greet with নমস্কাৰ (never হ্যালো/হাই), say ধন্যবাদ (never থেংক ইউ), and use the "
        "Assamese ৰ, not the Bengali র. "
        "Give clear, accurate, well-structured answers; use simple Markdown where it helps readability. "
        "When internal database context is provided, prefer it and base your answer on it. "
        "IMPORTANT: Never invent specific facts — names of people or officials, who currently holds a "
        "post, dates, or statistics. If you are not sure, say so honestly in Assamese instead of guessing."
    )

    # 2. Find a knowledge-base answer (exact keyword match → semantic meaning match).
    kb_answer, kb_assamese, kb_source = None, '', None
    if not web_search:
        ia, ia_asm, ia_src = find_instant_answer(prompt)
        if ia:
            kb_answer, kb_assamese, kb_source = ia, ia_asm, ia_src
        else:
            sa, sa_asm, _score, sa_src = semantic_find_answer(prompt)
            if sa:
                kb_answer, kb_assamese, kb_source = sa, sa_asm, sa_src

    # A source is only worth returning if it actually names something.
    def _clean_source(src):
        if src and (str(src.get('name', '')).strip() or str(src.get('url', '')).strip()):
            return {'name': str(src.get('name', '')).strip(), 'url': str(src.get('url', '')).strip()}
        return None
    kb_source = _clean_source(kb_source)

    # 2b. Language routing for a KB hit (Hybrid: verified record first, else translate).
    translate_source = None
    if kb_answer:
        if language == 'assamese' and kb_assamese.strip():
            # Verified Assamese record → return it directly (accurate, no model).
            _save_chat(request, client_id, prompt, kb_assamese)
            return JsonResponse({
                'response': kb_assamese, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'db-assamese',
                'source': kb_source,
            })
        if language == 'hinglish':
            # Stored data is already Hinglish → return verbatim (fast, no model).
            _save_chat(request, client_id, prompt, kb_answer)
            return JsonResponse({
                'response': kb_answer, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'instant',
                'source': kb_source,
            })
        # English, or Assamese without a stored record → translate the exact answer.
        translate_source = kb_answer

    custom_context = translate_source or ""
    source_docs = []

    # Log questions the knowledge base couldn't answer — a gap to fill later.
    if (not web_search) and (not kb_answer):
        _log_unanswered(prompt, language)

    # 3. Strict gate (only when there is NO KB answer and strict mode is enabled).
    if (not web_search) and (not kb_answer) and STRICT_KB_MODE:
        _save_chat(request, client_id, prompt, DONT_KNOW_MSG)
        return JsonResponse({
            'response': DONT_KNOW_MSG, 'from_database': False, 'source_docs': [],
            'web_search': False, 'sources': [], 'engine': 'no-answer',
        })

    # 4. Formulate the model prompt with recent conversation for follow-up context.
    #    Memory management: keep the newest turns within a character budget (so short
    #    messages give more context, long ones fewer) — older turns are dropped.
    hist_block = ""
    turns = []
    used = 0
    for h in reversed(history):  # newest first
        if not isinstance(h, dict):
            continue
        t = str(h.get('text', '')).strip()
        if not t:
            continue
        who = 'Assistant' if h.get('role') == 'assistant' else 'User'
        line = f"{who}: {t}"
        if turns and used + len(line) > MEMORY_CHAR_BUDGET:
            break
        turns.append(line)
        used += len(line)
    turns.reverse()  # back to chronological order
    if turns:
        hist_block = "Conversation so far:\n" + "\n".join(turns) + "\n\n"

    if translate_source:
        # Translate the exact KB answer into the chosen language — keep facts identical.
        if language == 'assamese':
            # Assamese-tuned prompt: aim for natural, native, fluent Assamese —
            # not a stiff word-by-word transliteration. This meaningfully improves
            # readability without any extra model or dependency.
            final_prompt = (
                "You are a native Assamese (অসমীয়া) speaker and professional translator. "
                "Translate the information below into natural, fluent, everyday Assamese "
                "using correct Assamese script and grammar. Write the way an educated "
                "Assamese person would actually speak or write — NOT a literal, "
                "word-for-word translation, and NOT Bengali. Use proper Assamese "
                "vocabulary (e.g. use Assamese-specific words and verb forms, the "
                "Assamese 'ৰ' not Bengali 'র'). Keep every fact, name, number, and place "
                "exactly the same — do not add, remove, or change any information. "
                "Keep proper nouns (like Dispur, Guwahati, Kaziranga) readable. "
                "Output only the Assamese text, nothing else:\n\n"
                f"{translate_source}"
            )
        else:
            final_prompt = (
                f"Rewrite the following information in {target_lang}. Keep every fact exactly "
                f"the same. Do not add, remove, or change any information. Output only the "
                f"rewritten text:\n\n{translate_source}"
            )
    else:
        # system_instruction is sent separately (Gemini systemInstruction / Ollama system).
        final_prompt = f"{hist_block}User Question: {prompt}"

    # 5. PRIMARY ENGINE: local Ollama model, STREAMED token-by-token so the first
    #    word reaches the user immediately. Skipped for web_search (needs Gemini's
    #    Google Search grounding). On connection failure we fall through to Gemini.
    if USE_LOCAL_LLM and not web_search:
        try:
            ollama_res = http_session.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    'model': OLLAMA_MODEL,
                    'prompt': final_prompt,
                    'system': system_instruction,
                    'stream': True,
                    'keep_alive': OLLAMA_KEEP_ALIVE,
                    'options': {
                        'num_predict': OLLAMA_NUM_PREDICT,
                        'num_thread': OLLAMA_NUM_THREAD,
                        'temperature': 0.7,
                    },
                },
                stream=True,
                timeout=120,
            )
        except Exception:
            ollama_res = None

        if ollama_res is not None and ollama_res.status_code == 200:
            def token_stream():
                acc = []
                try:
                    for line in ollama_res.iter_lines():
                        if not line:
                            continue
                        try:
                            obj = json.loads(line)
                        except Exception:
                            continue
                        chunk = obj.get('response', '')
                        if chunk:
                            acc.append(chunk)
                            yield chunk
                        if obj.get('done'):
                            break
                finally:
                    ollama_res.close()
                    _save_chat(request, client_id, prompt, ''.join(acc))

            stream_resp = StreamingHttpResponse(
                token_stream(), content_type='text/plain; charset=utf-8'
            )
            stream_resp['X-Engine'] = 'local'
            stream_resp['X-From-Database'] = 'true' if custom_context else 'false'
            stream_resp['X-Source-Docs'] = json.dumps(source_docs, ensure_ascii=True)
            stream_resp['Cache-Control'] = 'no-cache'
            stream_resp['X-Accel-Buffering'] = 'no'
            return stream_resp
        # else: local unreachable — fall through to Gemini below

    # 6. FALLBACK ENGINE: Google Gemini (also the primary engine for web_search).
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        if custom_context:
            return JsonResponse({
                'response': f"Information from Database Knowledge Base:\n\n{custom_context}",
                'from_database': True,
                'source_docs': source_docs
            })
        return JsonResponse({'error': 'Local model unavailable and Gemini API key is not configured on the server.'}, status=500)

    # Model IDs verified as available for this API key via ListModels + a live
    # generateContent probe, ordered fastest-first (lite flash models first).
    # NOTE: gemini-1.5/2.0/2.5 are NOT offered on this key ("no longer available
    # to new users"), so only the confirmed-working 3.x flash models are listed.
    candidate_models = [
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash',
        'gemini-3-flash-preview',
    ]

    # 6-pre. Assamese WITHOUT a KB hit: get an English answer from Gemini, then
    #        translate it to Assamese with IndicTrans2 (specialised, natural
    #        Assamese). IndicTrans2 needs English input — Hinglish gives poor
    #        output — so we ask Gemini in English here. Any failure (service down,
    #        empty result) falls through to the normal Assamese flow below.
    if (language == 'assamese' and not translate_source and not web_search
            and USE_INDICTRANS):
        en_system = (
            f"Today's date is {today}. Always write your reply in clear, natural English. "
            "You are Axom AI, a helpful, knowledgeable, and friendly assistant. Give a "
            "clear, accurate, well-structured answer. IMPORTANT: Never invent specific "
            "facts — names of people or officials, who currently holds a post, dates, or "
            "statistics. If you are unsure, say you are not certain instead of guessing."
        )
        # Groq is primary; Gemini is the fallback if Groq is unavailable.
        english_answer = _groq_generate(en_system, f"{hist_block}User Question: {prompt}")
        if not english_answer:
            english_answer = _gemini_generate(
                api_key, en_system, f"{hist_block}User Question: {prompt}", candidate_models)
        if english_answer:
            asm = _indic_translate(english_answer)
            if asm:
                _save_chat(request, client_id, prompt, asm)
                return JsonResponse({
                    'response': asm, 'from_database': False, 'source_docs': [],
                    'web_search': False, 'sources': [], 'engine': 'indictrans2',
                })

    # 6-primary. GROQ is the primary engine — stream it token-by-token for a
    #            super-fast first word and accurate answers. Gemini is the
    #            fallback below (and still handles web_search grounding).
    if GROQ_API_KEY and not web_search:
        gstream = _groq_stream_response(
            system_instruction, final_prompt,
            lambda txt: _save_chat(request, client_id, prompt, txt))
        if gstream is not None:
            sresp = StreamingHttpResponse(gstream, content_type='text/plain; charset=utf-8')
            sresp['X-Engine'] = 'groq'
            sresp['X-From-Database'] = 'true' if custom_context else 'false'
            sresp['X-Source-Docs'] = json.dumps(source_docs, ensure_ascii=True)
            sresp['X-Source'] = json.dumps(kb_source) if kb_source else ''
            sresp['Cache-Control'] = 'no-cache'
            sresp['X-Accel-Buffering'] = 'no'
            return sresp

    # 6a. STREAM the general/RAG answer from Gemini so the first words reach the
    #     user immediately (feels fast). web_search stays non-streaming below —
    #     it needs the grounding metadata (sources) that arrives at the end.
    if not web_search:
        for model_id in candidate_models:
            try:
                s_url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
                         f"{model_id}:streamGenerateContent?alt=sse&key={api_key}")
                g_res = http_session.post(
                    s_url,
                    json={
                        "contents": [{"parts": [{"text": final_prompt}]}],
                        "systemInstruction": {"parts": [{"text": system_instruction}]},
                    },
                    stream=True, timeout=30,
                )
            except Exception:
                continue
            if g_res.status_code == 200:
                def gemini_stream(resp=g_res):
                    acc = []
                    try:
                        for raw in resp.iter_lines():
                            if not raw:
                                continue
                            line = raw.decode('utf-8', 'ignore')
                            if not line.startswith('data:'):
                                continue
                            data = line[5:].strip()
                            if not data:
                                continue
                            try:
                                obj = json.loads(data)
                            except Exception:
                                continue
                            for cand in obj.get('candidates', []):
                                for part in cand.get('content', {}).get('parts', []):
                                    if part.get('text'):
                                        acc.append(part['text'])
                                        yield part['text']
                    finally:
                        resp.close()
                        _save_chat(request, client_id, prompt, ''.join(acc))

                sresp = StreamingHttpResponse(gemini_stream(), content_type='text/plain; charset=utf-8')
                sresp['X-Engine'] = 'gemini'
                sresp['X-From-Database'] = 'true' if custom_context else 'false'
                sresp['X-Source-Docs'] = json.dumps(source_docs, ensure_ascii=True)
                sresp['X-Source'] = json.dumps(kb_source) if kb_source else ''
                sresp['Cache-Control'] = 'no-cache'
                sresp['X-Accel-Buffering'] = 'no'
                return sresp
            g_res.close()
        # streaming failed for all models — fall through to the non-streaming loop

    last_error = ""

    for model_id in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": final_prompt}
                        ]
                    }
                ],
                "systemInstruction": {
                    "parts": [
                        {"text": system_instruction}
                    ]
                }
            }
            # Enable Google Search grounding tool if web_search is active (only for Gemini models)
            if web_search and 'gemma' not in model_id:
                payload["tools"] = [{"googleSearch": {}}]

            # Short 8s timeout for maximum speed
            res = http_session.post(url, headers=headers, json=payload, timeout=8)
            res_data = res.json()

            if res.status_code == 200 and 'candidates' in res_data and len(res_data['candidates']) > 0:
                candidate = res_data['candidates'][0]
                parts = candidate.get('content', {}).get('parts', [])
                if parts and 'text' in parts[0]:
                    response_text = parts[0]['text']
                    
                    # Extract unique source links from grounding metadata
                    sources = []
                    seen_uris = set()
                    if web_search:
                        metadata = candidate.get('groundingMetadata', {})
                        chunks = metadata.get('groundingChunks', [])
                        for chunk in chunks:
                            web = chunk.get('web', {})
                            uri = web.get('uri')
                            title = web.get('title')
                            if uri and uri not in seen_uris:
                                seen_uris.add(uri)
                                sources.append({'title': title or uri, 'uri': uri})

                        # Fallback: Parse markdown or raw links directly from response text
                        md_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', response_text)
                        for title, uri in md_links:
                            if uri not in seen_uris:
                                seen_uris.add(uri)
                                sources.append({'title': title, 'uri': uri})

                        raw_links = re.findall(r'(https?://[^\s\)\`]+)', response_text)
                        for uri in raw_links:
                            uri_clean = uri.rstrip('.,;)*`')
                            if uri_clean not in seen_uris:
                                seen_uris.add(uri_clean)
                                sources.append({'title': uri_clean, 'uri': uri_clean})

                    _save_chat(request, client_id, prompt, response_text)
                    return JsonResponse({
                        'response': response_text,
                        'from_database': bool(custom_context),
                        'source_docs': source_docs,
                        'web_search': web_search,
                        'sources': sources,
                        'engine': 'gemini',
                        'source': kb_source,
                    })

            if 'error' in res_data and 'message' in res_data['error']:
                last_error = res_data['error']['message']
        except Exception as err:
            last_error = str(err)
            continue

    # Groq fallback: Gemini failed (commonly its free daily quota is exhausted).
    # Groq is fast and has a generous free tier, so the user still gets a real
    # answer — including the translated/rewritten text for the KB-translate path.
    if GROQ_API_KEY and not web_search:
        groq_text = _groq_generate(system_instruction, final_prompt)
        if groq_text:
            _save_chat(request, client_id, prompt, groq_text)
            return JsonResponse({
                'response': groq_text,
                'from_database': bool(custom_context),
                'source_docs': source_docs,
                'web_search': web_search,
                'sources': [],
                'engine': 'groq',
                'source': kb_source,
            })

    # Fast Fallback: If API fails or is rate-limited, return database context if available!
    if custom_context:
        return JsonResponse({
            'response': f"📄 Found in Database Knowledge Base ({', '.join(source_docs)}):\n\n{custom_context}",
            'from_database': True,
            'source_docs': source_docs
        })

    if 'Quota exceeded' in last_error or '429' in last_error:
        return JsonResponse({
            'error': 'Google Gemini API Rate Limit reached for Free Tier. Please retry in a minute.'
        }, status=429)

    return JsonResponse({'error': f"API Error: {last_error}"}, status=400)


def login_api_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST is allowed'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
    except Exception:
        return JsonResponse({'error': 'Invalid request data'}, status=400)

    from django.contrib.auth import authenticate, login
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'success': True, 'username': user.username})
    else:
        return JsonResponse({'error': 'Invalid username or password'}, status=400)


def convert_doc_api(request):
    """
    API endpoint to convert DOC, DOCX, TXT, and RTF documents to PDF.
    Accepts multipart/form-data with 'file'.
    Returns JSON with download link, file size, page count, and status.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse(
            {'error': 'Too many requests. Please wait a moment.'},
            status=429,
        )

    uploaded_file = request.FILES.get('file') or request.FILES.get('doc_file')
    if not uploaded_file:
        return JsonResponse({'error': 'No document file provided for conversion.'}, status=400)

    # Validate file size (max 25MB)
    max_size = 25 * 1024 * 1024
    if uploaded_file.size > max_size:
        return JsonResponse({'error': 'File size exceeds the 25MB limit.'}, status=400)

    # Validate file extension
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    allowed_exts = ['.docx', '.doc', '.txt', '.rtf', '.md', '.csv']
    if ext not in allowed_exts:
        return JsonResponse({
            'error': f'Unsupported file type: {ext}. Supported types: .docx, .doc, .txt, .rtf'
        }, status=400)

    import uuid
    from knowledge.doc_converter import convert_doc_to_pdf

    # Setup directories in MEDIA_ROOT
    media_root = settings.MEDIA_ROOT
    upload_dir = os.path.join(media_root, 'uploads')
    output_dir = os.path.join(media_root, 'converted_pdfs')
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # Unique file identifiers
    unique_id = uuid.uuid4().hex[:8]
    clean_stem = "".join(c for c in os.path.splitext(uploaded_file.name)[0] if c.isalnum() or c in (' ', '_', '-')).strip()
    if not clean_stem:
        clean_stem = "document"

    input_filename = f"{clean_stem}_{unique_id}{ext}"
    input_path = os.path.join(upload_dir, input_filename)
    output_filename = f"{clean_stem}_{unique_id}.pdf"
    output_path = os.path.join(output_dir, output_filename)

    # Save uploaded file
    try:
        with open(input_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
    except Exception as e:
        return JsonResponse({'error': f'Failed to save uploaded file: {str(e)}'}, status=500)

    # Perform conversion
    try:
        out_pdf, page_count, file_size_str = convert_doc_to_pdf(input_path, output_path)
    except Exception as e:
        # Cleanup upload if conversion failed
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
        except Exception:
            pass
        return JsonResponse({'error': f'Conversion failed: {str(e)}'}, status=500)

    # Relative download URL
    download_url = f"{settings.MEDIA_URL}converted_pdfs/{output_filename}"
    direct_download_url = f"/api/download-converted-pdf/{output_filename}"

    return JsonResponse({
        'success': True,
        'original_name': uploaded_file.name,
        'pdf_name': f"{clean_stem}.pdf",
        'filename': output_filename,
        'download_url': download_url,
        'direct_download_url': direct_download_url,
        'page_count': page_count,
        'file_size': file_size_str,
        'message': f"'{uploaded_file.name}' was successfully converted to PDF!",
    })


def download_converted_pdf_view(request, filename):
    """Serve converted PDF with Content-Disposition attachment for clean downloading."""
    import mimetypes
    from django.http import FileResponse, Http404

    # Sanitize filename
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(settings.MEDIA_ROOT, 'converted_pdfs', clean_filename)

    if not os.path.exists(file_path):
        raise Http404("Converted PDF file not found.")

    response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
    # Use clean download name
    download_name = clean_filename
    if '_' in clean_filename:
        # Remove unique id hash if desired, or keep clean
        parts = clean_filename.rsplit('_', 1)
        if len(parts) == 2 and parts[1].endswith('.pdf'):
            download_name = f"{parts[0]}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{download_name}"'
    return response


def convert_file_api(request):
    """
    Unified file converter (multipart POST):
      target=pdf   : docx/doc/txt/rtf/md/csv -> PDF, or png/jpg/webp -> PDF
      target=docx  : pdf -> Word (.docx)
      target=png   : pdf -> PNG image(s)  (zipped if multi-page)
      target=jpg   : pdf -> JPG image(s)  (zipped if multi-page)
    Send one file as 'file', or many images as 'files' (for images -> PDF).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)

    target = (request.POST.get('target', '') or '').lower().strip()
    if target not in ('pdf', 'docx', 'png', 'jpg'):
        return JsonResponse({'error': 'Invalid target. Use pdf, docx, png or jpg.'}, status=400)

    files = request.FILES.getlist('files') or (
        [request.FILES['file']] if 'file' in request.FILES else [])
    if not files:
        return JsonResponse({'error': 'No file provided for conversion.'}, status=400)

    max_size = 25 * 1024 * 1024
    for f in files:
        if f.size > max_size:
            return JsonResponse({'error': 'A file exceeds the 25MB limit.'}, status=400)

    import uuid
    media_root = settings.MEDIA_ROOT
    upload_dir = os.path.join(media_root, 'uploads')
    out_dir = os.path.join(media_root, 'converted_files')
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)
    uid = uuid.uuid4().hex[:8]

    def _save(f):
        ext = os.path.splitext(f.name)[1].lower()
        stem = "".join(c for c in os.path.splitext(f.name)[0]
                       if c.isalnum() or c in (' ', '_', '-')).strip() or 'file'
        path = os.path.join(upload_dir, f"{stem}_{uid}{ext}")
        with open(path, 'wb+') as d:
            for chunk in f.chunks():
                d.write(chunk)
        return path, ext, stem

    saved = [_save(f) for f in files]
    src_ext, stem = saved[0][1], saved[0][2]

    from knowledge.doc_converter import convert_doc_to_pdf
    from knowledge import file_converters as fc

    OFFICE_EXTS = ('.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.odt',
                   '.odp', '.ods', '.rtf', '.html', '.htm', '.epub', '.txt', '.md', '.csv')
    try:
        if target == 'pdf' and src_ext in OFFICE_EXTS:
            out = os.path.join(out_dir, f"{stem}_{uid}.pdf")
            if fc.office_available():
                produced = fc.convert_office_to_pdf(saved[0][0], out_dir)
                if os.path.abspath(produced) != os.path.abspath(out):
                    os.replace(produced, out)
            else:
                # Local dev without LibreOffice — ReportLab handles docx/txt/rtf.
                convert_doc_to_pdf(saved[0][0], out)
            out_name = f"{stem}.pdf"
        elif target == 'pdf' and src_ext in ('.png', '.jpg', '.jpeg', '.webp'):
            out = os.path.join(out_dir, f"{stem}_{uid}.pdf")
            fc.convert_images_to_pdf([s[0] for s in saved], out)
            out_name = f"{stem}.pdf"
        elif target == 'docx' and src_ext == '.pdf':
            out = os.path.join(out_dir, f"{stem}_{uid}.docx")
            fc.convert_pdf_to_docx(saved[0][0], out)
            out_name = f"{stem}.docx"
        elif target in ('png', 'jpg') and src_ext == '.pdf':
            imgs = fc.convert_pdf_to_images(saved[0][0], os.path.join(out_dir, f"{stem}_{uid}"), fmt=target)
            if len(imgs) == 1:
                out, out_name = imgs[0], f"{stem}.{target}"
            else:
                out = os.path.join(out_dir, f"{stem}_{uid}.zip")
                fc.zip_files(imgs, out)
                out_name = f"{stem}_images.zip"
        else:
            return JsonResponse(
                {'error': f'Cannot convert "{src_ext}" to "{target}".'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Conversion failed: {str(e)}'}, status=500)

    fname = os.path.basename(out)
    size = os.path.getsize(out)
    size_str = (f"{size / 1024:.1f} KB" if size < 1024 * 1024
                else f"{size / (1024 * 1024):.2f} MB")
    return JsonResponse({
        'success': True,
        'filename': fname,
        'output_name': out_name,
        'download_url': f"/api/download-converted-file/{fname}",
        'file_size': size_str,
        'message': f"Converted to {out_name}",
    })


def download_converted_file_view(request, filename):
    """Serve any converted file (pdf/docx/png/jpg/zip) as a download."""
    import mimetypes
    from django.http import FileResponse, Http404
    clean = os.path.basename(filename)
    path = os.path.join(settings.MEDIA_ROOT, 'converted_files', clean)
    if not os.path.exists(path):
        raise Http404("Converted file not found.")
    ctype = mimetypes.guess_type(clean)[0] or 'application/octet-stream'
    resp = FileResponse(open(path, 'rb'), content_type=ctype)
    resp['Content-Disposition'] = f'attachment; filename="{clean}"'
    return resp


def pdf_tool_api(request):
    """
    PDF operations (multipart POST), selected by `op`:
      merge     : combine many PDFs ('files') into one
      split     : each page -> its own PDF (returned as a .zip)
      compress  : shrink a PDF
      rotate    : rotate pages (param `angle`=90/180/270, optional `pages`)
      delete    : remove pages (param `pages`, e.g. "2,4-6")
      extract   : keep only some pages (param `pages`)
      numbers   : stamp page numbers
      watermark : add a text watermark (param `text`)
      protect   : add a password (param `password`)
      unlock    : remove a password (param `password`)
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)

    op = (request.POST.get('op', '') or '').lower().strip()
    valid_ops = {'merge', 'split', 'compress', 'rotate', 'delete',
                 'extract', 'numbers', 'watermark', 'protect', 'unlock', 'ocr'}
    if op not in valid_ops:
        return JsonResponse({'error': f'Unknown operation: {op}'}, status=400)

    files = request.FILES.getlist('files') or (
        [request.FILES['file']] if 'file' in request.FILES else [])
    if not files:
        return JsonResponse({'error': 'No PDF file provided.'}, status=400)

    max_size = 40 * 1024 * 1024
    for f in files:
        if f.size > max_size:
            return JsonResponse({'error': 'A file exceeds the 40MB limit.'}, status=400)
        if not f.name.lower().endswith('.pdf'):
            return JsonResponse({'error': 'PDF tools accept .pdf files only.'}, status=400)

    import uuid
    media_root = settings.MEDIA_ROOT
    upload_dir = os.path.join(media_root, 'uploads')
    out_dir = os.path.join(media_root, 'converted_files')
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)
    uid = uuid.uuid4().hex[:8]

    saved = []
    for idx, f in enumerate(files):
        stem = "".join(c for c in os.path.splitext(f.name)[0]
                       if c.isalnum() or c in (' ', '_', '-')).strip() or 'file'
        path = os.path.join(upload_dir, f"{stem}_{uid}_{idx}.pdf")
        with open(path, 'wb+') as d:
            for chunk in f.chunks():
                d.write(chunk)
        saved.append((path, stem))

    first_path, stem = saved[0]
    pages = request.POST.get('pages', '').strip()
    from knowledge import pdf_tools as T

    try:
        if op == 'merge':
            out = os.path.join(out_dir, f"merged_{uid}.pdf")
            T.merge_pdfs([s[0] for s in saved], out)
            out_name = "merged.pdf"
        elif op == 'split':
            parts = T.split_pdf(first_path, os.path.join(out_dir, f"{stem}_{uid}"))
            out = os.path.join(out_dir, f"{stem}_{uid}_pages.zip")
            T.zip_files(parts, out)
            out_name = f"{stem}_pages.zip"
        elif op == 'compress':
            level = (request.POST.get('level', 'moderate') or 'moderate').lower()
            out = os.path.join(out_dir, f"{stem}_{uid}_compressed.pdf")
            from knowledge import file_converters as fc
            try:
                fc.compress_pdf_best(first_path, out, level)
            except Exception:
                T.compress_pdf(first_path, out)  # last-resort fallback
            out_name = f"{stem}_compressed.pdf"
        elif op == 'rotate':
            angle = request.POST.get('angle', '90')
            out = os.path.join(out_dir, f"{stem}_{uid}_rotated.pdf")
            T.rotate_pdf(first_path, angle, out, pages or None)
            out_name = f"{stem}_rotated.pdf"
        elif op == 'delete':
            out = os.path.join(out_dir, f"{stem}_{uid}.pdf")
            T.delete_pages(first_path, pages, out)
            out_name = f"{stem}.pdf"
        elif op == 'extract':
            out = os.path.join(out_dir, f"{stem}_{uid}_extracted.pdf")
            T.extract_pages(first_path, pages, out)
            out_name = f"{stem}_extracted.pdf"
        elif op == 'numbers':
            out = os.path.join(out_dir, f"{stem}_{uid}_numbered.pdf")
            T.add_page_numbers(first_path, out)
            out_name = f"{stem}_numbered.pdf"
        elif op == 'watermark':
            text = (request.POST.get('text', '') or 'CONFIDENTIAL').strip()[:60]
            out = os.path.join(out_dir, f"{stem}_{uid}_watermarked.pdf")
            T.watermark_pdf(first_path, text, out)
            out_name = f"{stem}_watermarked.pdf"
        elif op == 'protect':
            pw = request.POST.get('password', '').strip()
            if not pw:
                return JsonResponse({'error': 'A password is required.'}, status=400)
            out = os.path.join(out_dir, f"{stem}_{uid}_protected.pdf")
            T.protect_pdf(first_path, pw, out)
            out_name = f"{stem}_protected.pdf"
        elif op == 'unlock':
            pw = request.POST.get('password', '').strip()
            out = os.path.join(out_dir, f"{stem}_{uid}_unlocked.pdf")
            T.unlock_pdf(first_path, pw, out)
            out_name = f"{stem}_unlocked.pdf"
        elif op == 'ocr':
            from knowledge import file_converters as fc
            out = os.path.join(out_dir, f"{stem}_{uid}_searchable.pdf")
            fc.ocr_pdf(first_path, out)
            out_name = f"{stem}_searchable.pdf"
    except Exception as e:
        return JsonResponse({'error': f'Operation failed: {str(e)}'}, status=400)

    fname = os.path.basename(out)
    size = os.path.getsize(out)
    orig = os.path.getsize(first_path)
    size_str = (f"{size / 1024:.1f} KB" if size < 1024 * 1024
                else f"{size / (1024 * 1024):.2f} MB")
    return JsonResponse({
        'success': True,
        'filename': fname,
        'output_name': out_name,
        'download_url': f"/api/download-converted-file/{fname}",
        'file_size': size_str,
        'original_bytes': orig,
        'output_bytes': size,
        'message': f"Done: {out_name}",
    })


def _extract_pdf_text(path, max_chars=16000):
    """Pull text out of a PDF for the AI tools (capped so prompts stay fast)."""
    import pymupdf
    doc = pymupdf.open(path)
    parts, total = [], 0
    try:
        for page in doc:
            t = page.get_text()
            parts.append(t)
            total += len(t)
            if total > max_chars:
                break
    finally:
        doc.close()
    return "\n".join(parts)[:max_chars].strip()


def pdf_ai_api(request):
    """
    Groq-powered PDF tools (multipart POST), selected by `op`:
      chat      : answer `question` using the PDF's text
      summarize : summarise the PDF
      translate : translate the PDF into `lang` (assamese|english|hindi)
    Returns {'text': ...} — no file download.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)
    if not GROQ_API_KEY:
        return JsonResponse({'error': 'AI service is not configured.'}, status=503)

    op = (request.POST.get('op', '') or '').lower().strip()
    if op not in ('chat', 'summarize', 'translate'):
        return JsonResponse({'error': f'Unknown AI operation: {op}'}, status=400)

    f = request.FILES.get('file')
    if not f:
        return JsonResponse({'error': 'No PDF file provided.'}, status=400)
    if not f.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Please upload a .pdf file.'}, status=400)
    if f.size > 40 * 1024 * 1024:
        return JsonResponse({'error': 'File exceeds the 40MB limit.'}, status=400)

    import uuid
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    path = os.path.join(upload_dir, f"ai_{uuid.uuid4().hex[:8]}.pdf")
    with open(path, 'wb+') as d:
        for chunk in f.chunks():
            d.write(chunk)

    text = _extract_pdf_text(path)
    try:
        os.remove(path)
    except Exception:
        pass
    if not text:
        return JsonResponse({
            'error': 'No readable text found. This looks like a scanned PDF — use the OCR tool first.'
        }, status=400)

    if op == 'chat':
        question = (request.POST.get('question', '') or '').strip()
        if not question:
            return JsonResponse({'error': 'Please type a question.'}, status=400)
        system = ("You are Axom AI. Answer the user's question using ONLY the document below. "
                  "Reply in natural, native Assamese (অসমীয়া). If the answer is not in the "
                  "document, say so honestly in Assamese.")
        prompt = f"Document:\n{text}\n\nQuestion: {question}"
    elif op == 'summarize':
        system = ("You are Axom AI. Summarise the document below in clear, natural Assamese "
                  "(অসমীয়া) — a short intro then the key points as bullet points.")
        prompt = f"Document:\n{text}"
    else:  # translate
        lang = (request.POST.get('lang', 'assamese') or 'assamese').lower()
        label = {'assamese': 'Assamese (অসমীয়া script)', 'english': 'English',
                 'hindi': 'Hindi (Devanagari)'}.get(lang, 'Assamese (অসমীয়া script)')
        system = (f"You are a professional translator. Translate the document below into {label}. "
                  "Keep the meaning faithful and the language natural. Output only the translation.")
        prompt = f"Document:\n{text}"

    answer = _groq_generate(system, prompt, timeout=60)
    if not answer:
        answer = _gemini_generate(os.getenv('GEMINI_API_KEY', ''), system, prompt,
                                  ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'])
    if not answer:
        return JsonResponse({'error': 'The AI service is busy. Please try again in a moment.'},
                            status=503)

    return JsonResponse({'success': True, 'text': answer, 'op': op})
