import os
import json
import time
from datetime import datetime
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
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
        history = data.get('history', [])
        if not isinstance(history, list):
            history = []
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not prompt:
        return JsonResponse({'error': 'Prompt cannot be empty'}, status=400)

    import re

    # 1. System prompt — general-purpose AI assistant (ChatGPT / DeepSeek style).
    today = datetime.now().strftime('%A, %d %B %Y')
    system_instruction = (
        f"Today's date is {today}. "
        "You are Axom AI, a helpful, knowledgeable, and friendly general-purpose AI assistant. "
        "You can answer questions and help with any topic, including history, science, mathematics, "
        "programming and code, general knowledge, writing, reasoning, and everyday advice. "
        "Give clear, accurate, and well-structured answers. Use Markdown formatting (headings, bullet "
        "points, and code blocks) where it improves readability. If you are unsure about something, say so "
        "honestly instead of making up facts. When internal database context is provided, prefer it and "
        "cite the relevant details from it. "
        "IMPORTANT: Never invent specific facts — such as names of people or officials, "
        "who currently holds a government post, dates, or statistics. If you do not reliably "
        "know a specific factual answer, clearly say you are not certain instead of guessing a name or number."
    )

    sem_score = 0.0
    if not web_search:
        # 2a. INSTANT ANSWER: exact/near keyword match to a stored Q&A → verbatim
        #     answer immediately (no model, no latency).
        instant = find_instant_answer(prompt)
        if instant:
            _save_chat(request, client_id, prompt, instant)
            return JsonResponse({
                'response': instant, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'instant',
            })

        # 2b. SEMANTIC ANSWER: match the question by MEANING (embeddings) — catches
        #     different wording/language ("New Year" ↔ "Bihu"). Returns the stored
        #     answer verbatim, so it is always factually consistent with the data.
        sem_answer, sem_score = semantic_find_answer(prompt)
        if sem_answer:
            _save_chat(request, client_id, prompt, sem_answer)
            return JsonResponse({
                'response': sem_answer, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'semantic',
            })

    # 2c. Keyword-chunk RAG removed: semantic search already covers the Q&A
    #     knowledge base, and single common-word chunk matches (e.g. "assam")
    #     pulled off-topic context. Anything semantic misses now goes to the
    #     general model, which is instructed not to invent specific facts.
    custom_context, source_docs = "", []

    # 3. Optional strict gate (off by default so greetings / general chat still work):
    #    only blocks answers when explicitly enabled AND nothing relevant was found.
    if (not web_search) and (not custom_context) and STRICT_KB_MODE:
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
                        'engine': 'gemini'
                    })

            if 'error' in res_data and 'message' in res_data['error']:
                last_error = res_data['error']['message']
        except Exception as err:
            last_error = str(err)
            continue

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
