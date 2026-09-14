import os
import json
import re
import time
from datetime import datetime
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
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


from axom_ai.security import (
    get_client_ip,
    get_device_id,
    get_websearch_daily_count,
    increment_websearch_daily_count,
    is_websearch_burst_limited,
    check_device_registration_allowed,
    record_device_registration,
    WEBSEARCH_DAILY_LIMIT,
)

def _client_ip(request):
    return get_client_ip(request)


# ---------------------------------------------------------------------------
# Web Search Grounding (Google Custom Search API + Fallback)
# ---------------------------------------------------------------------------
GOOGLE_SEARCH_API_KEY = os.getenv('GOOGLE_SEARCH_API_KEY', '').strip()
GOOGLE_SEARCH_CX = os.getenv('GOOGLE_SEARCH_CX', '').strip()
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY', '').strip()
GOOGLE_OAUTH_CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID', '514662966676-fo4atqrjblkn8sadd2t0enhqi5mch5aq.apps.googleusercontent.com').strip()


_WEBSEARCH_DAILY_LIMIT = WEBSEARCH_DAILY_LIMIT  # Hard cap: Strictly 5 per day per IP
_WEBSEARCH_CACHE = {}       # {md5(query): {'timestamp': t, 'results': [...]}}
_WEBSEARCH_CACHE_TTL = 7200 # 2 hours cache to conserve quota and deliver instant answers


def _websearch_daily_count(ip):
    return get_websearch_daily_count(ip)


def _websearch_daily_incr(ip):
    return increment_websearch_daily_count(ip)


def _websearch_burst_limited(ip):
    return is_websearch_burst_limited(ip)



def _optimize_search_query(raw_query: str) -> str:
    """
    Intelligently converts user input (in English, Hindi, Hinglish, Assamese script,
    or phonetic/Romanized Assamese like 'aji news ki hoi', 'botor kiba', 'adre exam ketiya')
    into high-precision Google Search keywords tailored for Assam & Northeast India.
    """
    cleaned = (raw_query or '').strip()
    if not cleaned:
        return cleaned

    lower_q = cleaned.lower()

    # 1. Fast micro-LLM intent rewrite via Groq (~100-150ms)
    try:
        if 'GROQ_API_KEY' in globals() and GROQ_API_KEY:
            opt_system = (
                "You are an expert search query optimizer for Assam and Northeast India.\n"
                "Users may ask in English, Hindi, Hinglish, Assamese script (অসমীয়া), "
                "or Romanized Assamese written in Latin English letters (e.g., 'aji news ki hoi', 'botor kiba', 'adre exam ketiya', 'bihu ketiya').\n"
                "Your task: Convert the user's intent into 1 crisp, high-precision Google search query in English "
                "that will find real-time, verified news, facts, or information from Assam news portals and Indian websites.\n"
                "Rules:\n"
                "- If asking for news or daily updates without specifying a state/city, default the context to Assam.\n"
                "- Understand Romanized Assamese: 'aji/ajir' = today, 'khobor/batari/barta/samachar/news' = news, 'botor' = weather, 'ketiya' = when/date, 'kiba' = what/how, 'kun' = who.\n"
                "- Strip conversational filler ('ki hoi', 'kya hai', 'batao', 'please', 'tell me').\n"
                "- Output ONLY the clean search keywords (3 to 6 words). No quotes, no markdown, no explanations."
            )
            opt_prompt = f"User input: {cleaned}\nOptimized Google search query:"
            rewritten = _groq_generate(opt_system, opt_prompt, timeout=4)
            if rewritten:
                rewritten = re.sub(r'[\r\n\t"\']+', ' ', rewritten).strip()
                rewritten = re.sub(r'^(search query|query|optimized query)\s*:\s*', '', rewritten, flags=re.IGNORECASE).strip()
                if 3 <= len(rewritten) <= 120:
                    return rewritten
    except Exception:
        pass

    # 2. Rule-based intelligent fallback if LLM times out or is offline
    is_news = any(w in lower_q for w in ('news', 'khobor', 'khabar', 'batari', 'barta', 'samachar', 'headline', 'taza'))
    is_today = any(w in lower_q for w in ('aji', 'ajir', 'aaj', 'today', 'current', 'latest', 'aajir'))
    is_weather = any(w in lower_q for w in ('weather', 'botor', 'mausam', 'barish', 'boroxun', 'temperature'))

    if is_news and is_today:
        return "Assam latest news headlines today Pratidin Time"
    elif is_news:
        clean_words = re.sub(r'\b(ki|hoi|hai|kya|batao|please|tell|me|kiba|koba|ne)\b', '', lower_q).strip()
        return f"Assam news {clean_words}".strip()
    elif is_weather and ('guwahati' in lower_q or 'assam' in lower_q):
        loc = 'Guwahati' if 'guwahati' in lower_q else 'Assam'
        return f"{loc} weather forecast today IMD"

    return cleaned


def _purify_assamese_with_grammar(text: str) -> str:
    """
    Purifies Assamese generated text using curated rules from the Axom AI RAG Grammar Base
    (Assamese Grammar Seed through Vol 10).
    - Eliminates Bengali script contamination (Bengali 'র' -> Assamese 'ৰ').
    - Fixes false friends & loan calques ('বন্যা' -> 'বানপানী', 'ক্ৰোৰ' -> 'কোটি').
    - Fixes animal gender and classifiers ('মহিলা হাতী' -> 'মাইকী হাতী', 'গৰাকী হাতী' -> 'টা হাতী').
    - Ensures proper word boundary spacing for key proper nouns ('হিমন্ত বিশ্ব শৰ্মা').
    - Preserves modern technical, medical, and institutional terms in English.
    """
    if not text:
        return text

    # 1. Standardize script: Bengali 'র' (U+09B0) -> Assamese 'ৰ' (U+09F0)
    text = text.replace('\u09b0', '\u09f0')

    # 2. Proper Nouns & Spacing (Chief Minister & Key Entities)
    text = re.sub(r'হিমন্তবিশ্বাস\s*শৰ্মা', 'হিমন্ত বিশ্ব শৰ্মা', text)
    text = re.sub(r'হিমন্তবিশ্বাস', 'হিমন্ত বিশ্ব', text)
    text = re.sub(r'ড°?\s*হিমন্ত\s*বিশ্ব\s*শৰ্মা', 'ড° হিমন্ত বিশ্ব শৰ্মা', text)

    # 3. Vocabulary Calques: Flood (বন্যা -> বানপানী / বান)
    text = re.sub(r'বন্যাৰ', 'বানপানীৰ', text)
    text = re.sub(r'বন্যাজনিত', 'বানজনিত', text)
    text = re.sub(r'বন্যাদুৰ্গত', 'বানপীড়িত', text)
    text = re.sub(r'বন্যা\s*পীড়িত', 'বানপীড়িত', text)
    text = re.sub(r'বন্যা', 'বানপানী', text)

    # 4. Hindi number calques: ক্ৰোৰ -> কোটি
    text = re.sub(r'ক্ৰোৰ', 'কোটি', text)

    # 5. Animals: female animal (মহিলা -> মাইকী)
    text = re.sub(r'মহিলা\s+(হাতী|বাঘ|পহু|ঘোঁৰা|জন্তু|পশু|গৰু|মহ|কুকুৰ|মেকুৰী)', r'মাইকী \1', text)

    # 6. Animal Classifiers: গৰাকী is strictly for humans, animals take টা / জনী
    text = re.sub(
        r'(\d+|ন[\'’]?|দহ|পাঁচ|চাৰি|তিনি|দু|এক|কেইবা)\s*গৰাকী\s+মাইকী\s+(হাতী|বাঘ|পহু|ঘোঁৰা|জন্তু|পশু|গৰু|মহ|কুকুৰ|মেকুৰী)',
        r'\1 জনী মাইকী \2', text
    )
    text = re.sub(
        r'(\d+|ন[\'’]?|দহ|পাঁচ|চাৰি|তিনি|দু|এক|কেইবা)\s*গৰাকী\s+(হাতী|বাঘ|পহু|ঘোঁৰা|জন্তু|পশু|গৰু|মহ|কুকুৰ|মেকুৰী)',
        r'\1 টা \2', text
    )
    text = re.sub(
        r'গৰাকী\s+(হাতী|বাঘ|পহু|ঘোঁৰা|জন্তু|পশু|গৰু|মহ|কুকুৰ|মেকুৰী)',
        r'টা \1', text
    )

    # 7. Medical & Technical terms: Open-Heart Surgery & institutional clarity
    text = re.sub(r'হৃদয়শল্য\s*চিকিৎসা|হৃদয়শল্য\s*অস্ত্ৰোপচাৰ|হৃদয়শল্য', 'Open-Heart Surgery', text)

    # 8. Private Partner / Startups / Tech
    text = re.sub(r'প্ৰাইভেট\s*অংশীদাৰ', 'ব্যক্তিগত অংশীদাৰ (Private Partner)', text)

    # 9. Hindi news intrusions: তাজা খবৰ -> শেহতীয়া বাতৰি
    text = re.sub(r'আজ\s*কি\s*তাজা\s*খবৰ', 'আজিৰ শেহতীয়া বাতৰি', text)
    text = re.sub(r'তাজা\s*খবৰ', 'শেহতীয়া বাতৰি', text)

    # 10. Common Chandrabindu / Verb endings from RAG Vol 3
    text = re.sub(r'\bমই\s+ভাল\s+আছো\b', 'মই ভাল আছোঁ', text)
    text = re.sub(r'\bমই\s+আছো\b', 'মই আছোঁ', text)

    # Tidy spacing
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text


def _perform_web_search(raw_query, max_results=5):
    """
    Search the web using Google Programmable Custom Search JSON API as primary,
    with query optimization, query sanitization, 2-hour caching, and automatic fallback to Tavily Search API.
    Returns: (hits, error_str, engine_name, query_used)
    Each hit: {'title': str, 'url': str, 'content': str}
    """
    import hashlib

    # 1. Optimize query for search engine (converts 'aji news ki hoi' -> 'Assam latest news headlines today')
    optimized_query = _optimize_search_query(raw_query)

    # Sanitize query: strip control characters, clean spaces, cap to 200 chars
    cleaned = re.sub(r'[\r\n\t]+', ' ', optimized_query).strip()
    query = re.sub(r'[^\w\s\u0980-\u09FF\.\,\-\?\!\'\"]', ' ', cleaned)
    query = re.sub(r'\s{2,}', ' ', query).strip()[:200]
    if not query:
        query = raw_query[:200]

    # 2. Check 2-hour query cache
    raw_hash = hashlib.md5(raw_query.lower().strip().encode('utf-8')).hexdigest()
    opt_hash = hashlib.md5(query.lower().strip().encode('utf-8')).hexdigest()
    now = time.time()

    for h in (raw_hash, opt_hash):
        cached = _WEBSEARCH_CACHE.get(h)
        if cached and (now - cached.get('timestamp', 0) < _WEBSEARCH_CACHE_TTL):
            return cached.get('results', []), None, 'google_cache', query

    hits = []
    engine_used = None

    # 3. Primary: Google Programmable Custom Search JSON API
    if GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX:
        try:
            params = {
                'key': GOOGLE_SEARCH_API_KEY,
                'cx': GOOGLE_SEARCH_CX,
                'q': query,
                'num': min(max(max_results, 1), 10),
                'gl': 'in',
                'cr': 'countryIN',
                'safe': 'active',
            }
            headers = {
                'Referer': 'https://chat.aiaxom.co.in/',
                'User-Agent': 'AxomAI/1.0 (GoogleCustomSearch)',
            }
            res = http_session.get(
                'https://customsearch.googleapis.com/customsearch/v1',
                params=params,
                headers=headers,
                timeout=8,
            )
            if res.status_code == 200:
                data = res.json()
                items = data.get('items', [])
                for item in items:
                    title = item.get('title', '').strip()
                    link = item.get('link', '').strip()
                    snippet = item.get('snippet', '').strip()
                    if link and title:
                        hits.append({'title': title, 'url': link, 'content': snippet})
                if hits:
                    engine_used = 'google_custom_search'
        except Exception:
            pass

    # 4. Fallback: Tavily Search API if Google API fails or has quota issues
    if not hits and TAVILY_API_KEY:
        try:
            t_res = http_session.post(
                'https://api.tavily.com/search',
                json={
                    'api_key': TAVILY_API_KEY,
                    'query': query,
                    'max_results': max_results,
                    'search_depth': 'basic',
                },
                timeout=8,
            )
            if t_res.status_code == 200:
                raw_results = t_res.json().get('results', [])
                for r in raw_results:
                    title = r.get('title', '').strip()
                    url = r.get('url', '').strip()
                    content = r.get('content', '').strip()
                    if url and title:
                        hits.append({'title': title, 'url': url, 'content': content})
                if hits:
                    engine_used = 'tavily_search'
        except Exception:
            pass

    if hits:
        cache_entry = {'timestamp': now, 'results': hits}
        _WEBSEARCH_CACHE[raw_hash] = cache_entry
        _WEBSEARCH_CACHE[opt_hash] = cache_entry
        return hits, None, engine_used, query

    return None, "No web search results available.", None, query


# ---------------------------------------------------------------------------
# Greeting fast-path: matched in chat_api_view before any KB / LLM call so a
# plain "hi" never triggers the 114k-embedding semantic search or a Gemini
# request. Keep this small and pure-Python — it runs on every message.
# ---------------------------------------------------------------------------
_GREETING_WORDS = {
    # English / shorthand
    'hi', 'hii', 'hiii', 'hey', 'heyy', 'hello', 'helo', 'hlo', 'hlw', 'hlwo',
    'yo', 'sup', 'howdy', 'hola', 'gm', 'gn', 'ty', 'thanks', 'thnx', 'thx',
    'good', 'morning', 'evening', 'night', 'afternoon',
    # Hindi / Hinglish
    'namaste', 'namaskar', 'namaskaar', 'pranam', 'salam', 'salaam',
    # Assamese
    'নমস্কাৰ', 'নমষ্কাৰ', 'হেৰো', 'ছালাম',
    # single-word small-talk seeds
    'kaise', 'kese', 'kya', 'haal', 'ho', 'kemon', 'khobor', 'kbr',
    'test', 'testing',
}
_GREETING_REPLIES = [
    "নমস্কাৰ! আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰো?",
    "নমস্কাৰ! অসম সম্পৰ্কীয় কি জানিব বিচাৰে?",
    "নমস্কাৰ! মই আপোনাক কেনেকৈ সহায় কৰিব পাৰিম?",
    "নমস্কাৰ! কি বিষয়ে জানিব বিচাৰিছে?",
]


def _is_greeting(text):
    """True when `text` is a bare greeting / small-talk phrase (no real query)."""
    if not text or len(text) > 40:
        return False
    import re as _re
    stripped = _re.sub(r"[^\w\sঀ-৿]", " ", text.strip().lower())
    words = [w for w in stripped.split() if w]
    if not words or len(words) > 4:
        return False
    # Every token must be a greeting/small-talk token — otherwise it's a real
    # question that happens to be short (e.g. "who is dispur cm").
    return all(w in _GREETING_WORDS for w in words)


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
        user = request.user if (hasattr(request, 'user') and request.user.is_authenticated) else None
        sess, created = ChatSession.objects.get_or_create(
            session_key=key, client_id=client_id,
            defaults={'title': ((title or user_text) or 'New Chat')[:60], 'user': user},
        )
        if user and not sess.user:
            sess.user = user
            sess.save(update_fields=['user'])
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
    "ক্ষমা কৰিব, এই বিষয়ে মোৰ ওচৰত এতিয়া নিশ্চিত (verified) তথ্য নাই। "
    "মই কেৱল মোৰ নিজা তথ্যভাণ্ডাৰৰ (knowledge base) ওপৰত ভিত্তি কৰি সঠিক উত্তৰ দিব পাৰো। "
    "অসম সম্পৰ্কীয় আন কিবা প্ৰশ্ন হ'লে সুধিব পাৰে।"
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
    # Bare domain (aiaxom.co.in / www.aiaxom.co.in) → premium landing page.
    # Chat lives on chat.aiaxom.co.in (and localhost for dev).
    host = request.get_host().split(':')[0].lower()
    LANDING_HOSTS = {'aiaxom.co.in', 'www.aiaxom.co.in'}
    if host in LANDING_HOSTS:
        ctx = {}
        try:
            from contentcms.views import get_landing_content_payload
            ctx['cms'] = get_landing_content_payload()
        except Exception:
            ctx['cms'] = {}
        return render(request, 'landing.html', ctx)
    return render(request, 'index.html')


@ensure_csrf_cookie
def blog_detail_view(request, slug):
    from contentcms.models import InsightArticle, SiteSEOSetting
    from contentcms.views import get_landing_content_payload
    from django.shortcuts import get_object_or_404
    from django.db.models import Count

    # Find article by slug or ID
    article = InsightArticle.objects.filter(slug=slug, is_published=True).first()
    if not article and slug.isdigit():
        article = InsightArticle.objects.filter(id=int(slug), is_published=True).first()
    if not article:
        article = get_object_or_404(InsightArticle, slug=slug)

    # Categories with counts
    all_articles = InsightArticle.objects.filter(is_published=True)
    total_count = all_articles.count()
    
    # Calculate category counts
    cat_counts_raw = all_articles.values('category').annotate(count=Count('id'))
    cat_counts_map = {item['category']: item['count'] for item in cat_counts_raw}
    
    categories_list = []
    for val, label in InsightArticle.CATEGORY_CHOICES:
        categories_list.append({
            'val': val,
            'label': label,
            'count': cat_counts_map.get(val, 0)
        })

    # Recent articles (excluding current)
    recent_articles = all_articles.exclude(id=article.id).order_by('-published_at')[:4]

    # Related articles (same category or recent)
    related_articles = all_articles.filter(category=article.category).exclude(id=article.id)[:4]
    if len(related_articles) < 4:
        extra = all_articles.exclude(id=article.id).exclude(id__in=[r.id for r in related_articles])[:(4 - len(related_articles))]
        related_articles = list(related_articles) + list(extra)

    cms = get_landing_content_payload()
    seo = SiteSEOSetting.objects.first()

    ctx = {
        'article': article,
        'recent_articles': recent_articles,
        'related_articles': related_articles,
        'categories_list': categories_list,
        'total_articles_count': total_count,
        'cms': cms,
        'seo': seo,
    }
    return render(request, 'blog_detail.html', ctx)


@ensure_csrf_cookie
def blog_list_view(request):
    import json
    from contentcms.models import InsightArticle, SiteSEOSetting
    from contentcms.views import get_landing_content_payload
    from django.db.models import Count, Q
    from django.http import JsonResponse

    q = request.GET.get('q', '').strip()
    cat = request.GET.get('category', '').strip()

    all_published = InsightArticle.objects.filter(is_published=True).order_by('-published_at', '-id')
    total_count = all_published.count()

    cat_counts_raw = all_published.values('category').annotate(count=Count('id'))
    cat_counts_map = {item['category']: item['count'] for item in cat_counts_raw}

    categories_list = []
    active_category_label = ""
    for val, label in InsightArticle.CATEGORY_CHOICES:
        if cat == val:
            active_category_label = label
        categories_list.append({
            'val': val,
            'label': label,
            'count': cat_counts_map.get(val, 0)
        })

    # Prepare structured articles payload for React
    articles_data = []
    category_labels_dict = dict(InsightArticle.CATEGORY_CHOICES)
    for art in all_published:
        cat_label = category_labels_dict.get(art.category, art.get_category_display() or art.category)
        link = art.external_link.strip() if art.external_link and art.external_link.strip().startswith('http') else f"/blog/{art.slug}/"
        articles_data.append({
            'id': art.id,
            'title': art.title,
            'slug': art.slug,
            'category': art.category,
            'category_label': cat_label,
            'excerpt': art.excerpt,
            'content_snippet': (art.content[:400] if art.content else ''),
            'read_time': art.read_time,
            'cover_image_url': art.cover_image_url or '',
            'gradient_from': art.gradient_from or '#a855f7',
            'gradient_to': art.gradient_to or '#ec4899',
            'author_name': art.author_name or 'Axom AI Team',
            'published_at': art.published_at.strftime('%b %d, %Y') if art.published_at else '',
            'link': link,
            'is_featured': getattr(art, 'is_featured', False),
        })

    # If requested as AJAX/JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.GET.get('format') == 'json':
        return JsonResponse({
            'articles': articles_data,
            'categories': categories_list,
            'total_count': total_count,
        })

    cms = get_landing_content_payload()
    seo = SiteSEOSetting.objects.first()

    ctx = {
        'articles_json': json.dumps(articles_data),
        'categories_json': json.dumps(categories_list),
        'total_count': total_count,
        'active_category': cat,
        'active_category_label': active_category_label,
        'search_query': q,
        'cms': cms,
        'seo': seo,
    }
    return render(request, 'blog_list.html', ctx)


def blog_list_redirect(request):
    return redirect('blog_list')


@ensure_csrf_cookie
def faq_page_view(request):
    """Dedicated Public FAQ Page (https://aiaxom.co.in/faq)."""
    from contentcms.models import FAQPageConfig, LandingFAQ, SiteSEOSetting
    from contentcms.views import _ensure_default_faqs
    _ensure_default_faqs()
    config = FAQPageConfig.objects.first()
    if not config:
        config = FAQPageConfig.objects.create()
    faqs = LandingFAQ.objects.filter(is_active=True).order_by('order', 'id')
    seo = SiteSEOSetting.objects.first()
    return render(request, 'faq.html', {
        'config': config,
        'faqs': faqs,
        'seo': seo,
    })


@ensure_csrf_cookie
def about_page_view(request):
    """Dedicated Public About Page (https://aiaxom.co.in/about/)."""
    from contentcms.models import SiteSEOSetting, AboutPageConfig
    seo = SiteSEOSetting.objects.first()
    config = AboutPageConfig.objects.first()
    if not config:
        config = AboutPageConfig.objects.create()
    return render(request, 'about.html', {
        'seo': seo,
        'config': config,
    })


def robots_txt_view(request):
    """Serve SEO & AI-crawler optimized robots.txt directly from Django."""
    from django.http import HttpResponse
    content = """User-agent: *
Allow: /
Disallow: /admin-panel/
Disallow: /axomai-admin/
Disallow: /axomai-user/
Disallow: /axomai-content/
Disallow: /api/

# Explicitly allow top AI search bots & LLM crawlers for GEO
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

Sitemap: https://aiaxom.co.in/sitemap.xml
Host: https://aiaxom.co.in
"""
    return HttpResponse(content.strip(), content_type="text/plain; charset=utf-8")


def sitemap_xml_view(request):
    """Serve dynamic XML sitemap including Homepage, About, FAQ, Blog and Articles."""
    from django.http import HttpResponse
    from django.utils import timezone
    from contentcms.models import InsightArticle
    now_str = timezone.now().strftime('%Y-%m-%d')
    
    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        '    <loc>https://aiaxom.co.in/</loc>',
        f'    <lastmod>{now_str}</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '  <url>',
        '    <loc>https://aiaxom.co.in/about/</loc>',
        f'    <lastmod>{now_str}</lastmod>',
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.95</priority>',
        '  </url>',
        '  <url>',
        '    <loc>https://aiaxom.co.in/faq/</loc>',
        f'    <lastmod>{now_str}</lastmod>',
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.90</priority>',
        '  </url>',
        '  <url>',
        '    <loc>https://aiaxom.co.in/blog/</loc>',
        f'    <lastmod>{now_str}</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>0.90</priority>',
        '  </url>',
    ]
    
    try:
        articles = InsightArticle.objects.filter(is_published=True).order_by('-published_at')
        for art in articles:
            pub_date = art.published_at.strftime('%Y-%m-%d') if art.published_at else now_str
            xml.extend([
                '  <url>',
                f'    <loc>https://aiaxom.co.in/blog/{art.slug}/</loc>',
                f'    <lastmod>{pub_date}</lastmod>',
                '    <changefreq>monthly</changefreq>',
                '    <priority>0.80</priority>',
                '  </url>',
            ])
    except Exception:
        pass

    xml.append('</urlset>')
    return HttpResponse('\n'.join(xml), content_type="application/xml; charset=utf-8")


@ensure_csrf_cookie
def admin_panel_view(request):
    # The React SPA (served from index.html) renders the admin dashboard when
    # window.isStaff is true. Gate access server-side: anonymous or non-staff
    # users are sent to the dedicated admin login page instead of the chat view.
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('admin_login')
    return render(request, 'index.html')


AUTH_ALLOWED_ORIGINS = {
    'https://aiaxom.co.in',
    'https://www.aiaxom.co.in',
    'https://chat.aiaxom.co.in',
    'https://content.aiaxom.co.in',
    'https://admin.aiaxom.co.in',
    'https://user.aiaxom.co.in',
}


def _apply_cross_subdomain_cors(request, response):
    origin = request.headers.get('Origin') or request.META.get('HTTP_ORIGIN', '')
    if origin and (
        origin in AUTH_ALLOWED_ORIGINS
        or origin.endswith('.aiaxom.co.in')
        or 'localhost' in origin
        or '127.0.0.1' in origin
    ):
        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        req_headers = request.headers.get('Access-Control-Request-Headers')
        response['Access-Control-Allow-Headers'] = req_headers or 'Content-Type, X-CSRFToken, X-Device-Id, Authorization, Cookie'
        response['Access-Control-Expose-Headers'] = 'X-Engine, X-From-Database, X-Source'
    return response


def _chat_cors_view(view_func):
    import functools
    @functools.wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if request.method == 'OPTIONS':
            from django.http import HttpResponse
            return _apply_cross_subdomain_cors(request, HttpResponse(status=204))
        resp = view_func(request, *args, **kwargs)
        return _apply_cross_subdomain_cors(request, resp)
    return wrapped


@csrf_exempt
@_chat_cors_view
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

    MAX_PROMPT_CHARS = 4000
    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]

    import re

    # -----------------------------------------------------------------------
    # Fast path: a bare greeting ("hi", "hlw", "namaskar", "নমস্কাৰ" …) skips
    # the 114k-row semantic search AND any LLM call — returns a native
    # Assamese greeting instantly. Also side-steps STRICT_KB_MODE, which
    # would otherwise reply "don't know" for a friendly hello.
    # -----------------------------------------------------------------------
    if _is_greeting(prompt):
        import random
        reply = random.choice(_GREETING_REPLIES)
        _save_chat(request, client_id, prompt, reply)
        return JsonResponse({
            'response': reply, 'from_database': False, 'source_docs': [],
            'web_search': False, 'sources': [], 'engine': 'greeting',
        })

    # -----------------------------------------------------------------------
    # WEB SEARCH FAST PATH — Google Custom Search API (with Tavily fallback).
    # Runs BEFORE the KB tier so a user who toggled 🌐 explicitly gets fresh
    # web results with citations. Per-device daily cap & burst throttle enforced.
    # -----------------------------------------------------------------------
    if web_search:
        ws_ip = _client_ip(request)

        # 1. Burst rate limiting (prevents rapid-fire scraping / spamming)
        if _websearch_burst_limited(ws_ip):
            return JsonResponse({
                'error': (
                    'Too many web searches in a short period. '
                    'Please wait a few seconds before searching again.'
                ),
            }, status=429)

        # 2. Strict daily quota limit (Max 5 web searches per day per IP/device)
        daily_cap = _WEBSEARCH_DAILY_LIMIT  # Strictly 5 searches per day per IP
        ws_used = _websearch_daily_count(ws_ip)
        if ws_used >= daily_cap:
            return JsonResponse({
                'error': (
                    f"দৈনিক ৱেব সন্ধানৰ সীমা সমাপ্ত হ'ল ({daily_cap}/{daily_cap})। "
                    f"You have reached the maximum daily limit of {daily_cap} web searches per day for this device/IP. Please try again tomorrow."
                ),
                'websearch_limit': daily_cap,
                'used_today': ws_used,
                'remaining_today': 0,
            }, status=429)

        # 3. Perform search (Google Custom Search -> Tavily fallback -> Cache)
        search_res = _perform_web_search(prompt, max_results=5)
        if len(search_res) == 4:
            hits, err, engine_used, query_used = search_res
        else:
            hits, err, engine_used = search_res[:3]
            query_used = prompt

        if hits is None:
            return JsonResponse({
                'error': (
                    'Web search is temporarily unavailable. '
                    f'({err or "Please try again later"})'
                ),
            }, status=503)
        if not hits:
            return JsonResponse({
                'error': 'No web results found for that query. Try rephrasing.',
            }, status=404)

        # Build grounded context for the LLM to synthesise from.
        context_lines = []
        for i, h in enumerate(hits, 1):
            snippet = (h.get('content') or '')[:600].strip()
            context_lines.append(
                f"[{i}] {h['title']}\n{snippet}\nURL: {h['url']}"
            )
        context = '\n\n'.join(context_lines)

        current_date_str = datetime.now().strftime('%d %B %Y (%A)')
        ws_system = (
            f"Today's real-time date is: {current_date_str}.\n"
            "You are Axom AI, a highly capable AI assistant.\n"
            "Your task: Use the real-time web search results provided below to answer the user's question accurately.\n\n"
            "LANGUAGE RULES:\n"
            "1. Reply STRICTLY in 100% natural, fluent Assamese using Assamese script (অসমীয়া).\n"
            "2. EVERY single word MUST be in Assamese script — NO English words, NO Hindi words, NO Bengali words "
            "written in any script. The ONLY exceptions are: proper nouns (people names, place names, organization "
            "names like AIIMS, IIT), technical/scientific terms that have no Assamese equivalent, and numbers.\n"
            "3. Use proper Assamese, NOT Bengali: use ৰ (not র), কৰ (not কর), হয় (not হয়).\n"
            "4. Use 'বানপানী' (not Bengali 'বন্যা'), 'কোটি' (not Hindi 'ক্ৰোৰ').\n"
            "5. NEVER use Hindi words like 'তাজা', 'খবৰ', 'আজ', 'লেকিন', 'ঔৰ' etc.\n\n"
            "FORMATTING RULES (VERY IMPORTANT):\n"
            "6. Structure your response with CLEAR TOPIC SECTIONS using ### headings in Assamese.\n"
            "   Example: ### আহোম ৰাজবংশৰ ইতিহাস\n"
            "7. Use a blank line between each section/paragraph for readability.\n"
            "8. When there are multiple pieces of information, organize them under separate ### headings.\n"
            "9. Keep each paragraph focused on ONE topic — do NOT dump everything in one block.\n"
            "10. Use **bold** for important terms, names, dates, and key facts.\n"
            "11. Use bullet points (- item) for listing multiple items.\n"
            "12. Use '।' (Assamese full stop) at end of sentences, not '.' (English period).\n"
            "13. NEVER invent facts. Base your reply directly on the provided search results.\n"
            "14. Do NOT include inline citation markers like [1], [2], (1).\n"
        )
        ws_prompt = (
            f"Web search results:\n\n{context}\n\n"
            f"User question: {prompt}\n\n"
            f"Answer in pure, natural Assamese (অসমীয়া script):"
        )

        # Primary: OpenAI rotation (free-tier models first)
        answer = None
        try:
            from model_router.router import openai_generate
            oai_text, oai_model = openai_generate(ws_system, ws_prompt, timeout=45)
            if oai_text:
                answer = oai_text
        except Exception:
            pass
        # Fallback 1: Groq
        if not answer:
            answer = _groq_generate(ws_system, ws_prompt, timeout=45)
        # Fallback 2: Gemini
        if not answer:
            gk = os.getenv('GEMINI_API_KEY', '').strip()
            if gk:
                answer = _gemini_generate(
                    gk, ws_system, ws_prompt,
                    ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-lite-latest'],
                )
        if not answer:
            return JsonResponse({
                'error': 'AI service is busy. Please try again in a moment.',
            }, status=503)

        # Assamese safety layer — if the response has too much English/Hindi,
        # rewrite it in proper Assamese while keeping facts and formatting.
        indic_chars = sum(1 for ch in answer if 'ঀ' <= ch <= '৿')
        if indic_chars < max(20, int(len(answer) * 0.25)):
            asm_fix_sys = (
                "Rewrite the following text COMPLETELY in natural, authentic "
                "Assamese (অসমীয়া script). EVERY word must be in Assamese script "
                "except proper nouns and technical terms. Preserve ALL facts, "
                "names, dates, numbers exactly. Keep ### headings and **bold** formatting. "
                "Use proper Assamese vocabulary: ৰ (not র), কৰ (not কর). "
                "Do NOT add citation markers like [1], [2]. "
                "Do NOT leave ANY Hindi or English common words — translate them all."
            )
            asm = None
            try:
                from model_router.router import openai_generate as _oai_fix
                asm, _ = _oai_fix(asm_fix_sys, answer, timeout=30)
            except Exception:
                pass
            if not asm:
                asm = _groq_generate(asm_fix_sys, answer, timeout=30)
            if asm and asm.strip():
                answer = asm.strip()

        # Belt-and-suspenders: strip any inline citation markers the model
        # slipped in despite the prompt — [1], [1,2], [1][2], (1), (Source 1),
        # ¹²³ superscript digits, and stray "Source 1 :" / "(source 1)" tags.
        answer = re.sub(r'\[\s*(?:source\s*)?\d+(?:\s*[,;]\s*\d+)*\s*\](?:\s*\[\s*\d+\s*\])*',
                        '', answer, flags=re.IGNORECASE)
        answer = re.sub(r'\(\s*(?:source|src|ref)\.?\s*\d+\s*\)', '', answer,
                        flags=re.IGNORECASE)
        answer = re.sub(r'[⁰¹²³⁴-⁹]+', '', answer)
        # Tidy up any double spaces / stray "  ." left behind.
        answer = re.sub(r'\s+([।.,;:!?])', r'\1', answer)
        answer = re.sub(r'\s{2,}', ' ', answer).strip()

        # RAG Grammar Purity Layer: Guarantee zero Bengali/Hindi loanwords, correct classifiers & terms
        answer = _purify_assamese_with_grammar(answer)

        _websearch_daily_incr(ws_ip)
        _save_chat(request, client_id, prompt, answer)
        return JsonResponse({
            'response': answer,
            'from_database': False,
            'source_docs': [],
            'web_search': True,
            'sources': [
                {'title': h['title'], 'uri': h['url']} for h in hits
            ],
            'engine': f'{engine_used}+openai',
            'websearch_limit': daily_cap,
            'used_today': ws_used + 1,
            'remaining_today': max(0, daily_cap - (ws_used + 1)),
        })

    # Language the user picked for the reply.
    LANG_LABEL = {
        'english': 'English',
        'hinglish': 'Hinglish (Hindi written in Roman/English letters)',
        'assamese': 'the Assamese language using Assamese script (অসমীয়া)',
    }
    target_lang = LANG_LABEL.get(language, LANG_LABEL['hinglish'])

    # 1. System prompt — general-purpose AI assistant (ChatGPT style).
    today = datetime.now().strftime('%A, %d %B %Y')
    system_instruction = (
        f"Today's date is {today}. You are Axom AI — a friendly, knowledgeable, and highly capable "
        "AI assistant that can help with ANY topic: science, math, coding, history, geography, "
        "health, technology, education, current affairs, creative writing, and everything else — "
        "just like ChatGPT. You have special expertise in Assam and Northeast India, but you are "
        "NOT limited to Assam topics. Answer ANY question the user asks, thoroughly and helpfully. "
        "ALWAYS reply in natural, native, everyday Assamese using correct Assamese script (অসমীয়া) and "
        "grammar — the way an educated Assamese person actually speaks. "
        "Users may write in Roman Assamese (e.g. 'Bihu kunuba hoi?'), Hindi, Hinglish, or English — "
        "understand all of these, but ALWAYS reply in Assamese script. "
        "Do NOT write English words in Assamese script: greet with নমস্কাৰ (never হ্যালো/হাই), "
        "say ধন্যবাদ (never থেংক ইউ). "
        "CRITICAL SCRIPT RULE: You MUST use Assamese ৰ (U+09F0), NEVER Bengali র (U+09B0). "
        "Examples: কৰ (not কর), ধৰ্ম (not ধর্ম), পূৰ্ণ (not পূর্ণ), সংৰক্ষণ (not সংরক্ষণ), পৰিচালনা (not পরিচালনা). "
        "Never use Bengali vocabulary or grammar — use a simpler Assamese word instead. "
        "When knowledge-base context is provided, synthesize it into a clear, natural conversational "
        "answer — do not copy-paste or dump raw text. Prefer that context and base your answer on it. "
        "When NO knowledge-base context is provided, answer from your own knowledge like ChatGPT would — "
        "give detailed, informative, helpful answers. NEVER say you don't know or can't answer. "
        "FORMATTING RULES:\n"
        "- Use ### headings (in Assamese) to organize topics.\n"
        "- Use **bold** for key terms, names, dates, and important facts.\n"
        "- Use - bullet lists when listing multiple items.\n"
        "- Use blank lines between paragraphs and sections.\n"
        "- Keep each section focused on one topic.\n"
        "- Do NOT dump everything in one big block.\n"
        "- Do NOT use markdown tables (| column | format) — use bullet lists or numbered lists instead.\n"
        "- Use '।' (Assamese full stop) at end of sentences.\n"
        "IMPORTANT: Never invent specific facts — names of people or officials, who currently holds a "
        "post, dates, or statistics. If you are not sure, say so honestly in Assamese instead of guessing."
    )

    # 2. KB search skipped — go directly to GPT (ChatGPT style).
    #    KB data is insufficient; GPT provides faster, better answers for all topics.
    kb_answer, kb_source = None, None
    custom_context = ""
    source_docs = []

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

    # Direct GPT prompt — no KB context, no translation step.
    final_prompt = f"{hist_block}User Question: {prompt}"

    # 5. Ollama local model skipped — GPT gives much better answers.

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

    def _purify_stream(gen):
        """Wrap a text-chunk generator so every chunk passes through
        _purify_assamese_with_grammar (Bengali র→ৰ, vocab fixes, etc.)."""
        for chunk in gen:
            yield _purify_assamese_with_grammar(chunk)

    # 6a. PRIMARY: OpenAI free-tier model rotation — streams through up to 17
    #     models (9 mini/nano + 8 large) using daily free quotas before paid Luna.
    if not web_search:
        try:
            from model_router.router import openai_stream
            oai_gen, oai_model = openai_stream(
                system_instruction, final_prompt,
                on_done=lambda txt: _save_chat(request, client_id, prompt, _purify_assamese_with_grammar(txt)))
            if oai_gen is not None:
                sresp = StreamingHttpResponse(_purify_stream(oai_gen), content_type='text/plain; charset=utf-8')
                sresp['X-Engine'] = f'openai:{oai_model}'
                sresp['X-From-Database'] = 'true' if custom_context else 'false'
                sresp['X-Source-Docs'] = json.dumps(source_docs, ensure_ascii=True)
                sresp['X-Source'] = json.dumps(kb_source) if kb_source else ''
                sresp['Cache-Control'] = 'no-cache'
                sresp['X-Accel-Buffering'] = 'no'
                return sresp
        except Exception:
            pass

    # 6b. FALLBACK 1: Groq streaming — fast and free.
    if GROQ_API_KEY and not web_search:
        gstream = _groq_stream_response(
            system_instruction, final_prompt,
            lambda txt: _save_chat(request, client_id, prompt, _purify_assamese_with_grammar(txt)))
        if gstream is not None:
            sresp = StreamingHttpResponse(_purify_stream(gstream), content_type='text/plain; charset=utf-8')
            sresp['X-Engine'] = 'groq'
            sresp['X-From-Database'] = 'true' if custom_context else 'false'
            sresp['X-Source-Docs'] = json.dumps(source_docs, ensure_ascii=True)
            sresp['X-Source'] = json.dumps(kb_source) if kb_source else ''
            sresp['Cache-Control'] = 'no-cache'
            sresp['X-Accel-Buffering'] = 'no'
            return sresp

    # 6c. STREAM the general/RAG answer from Gemini so the first words reach the
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
                                        purified = _purify_assamese_with_grammar(part['text'])
                                        acc.append(purified)
                                        yield purified
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

    # ── Non-streaming fallbacks: OpenAI → Groq → Gemini ──

    # Non-streaming OpenAI fallback
    if not web_search:
        try:
            from model_router.router import openai_generate
            oai_text, oai_model = openai_generate(system_instruction, final_prompt)
            if oai_text:
                if language == 'assamese':
                    oai_text = _purify_assamese_with_grammar(oai_text)
                _save_chat(request, client_id, prompt, oai_text)
                return JsonResponse({
                    'response': oai_text,
                    'from_database': bool(custom_context),
                    'source_docs': source_docs,
                    'web_search': web_search,
                    'sources': [],
                    'engine': f'openai:{oai_model}',
                    'source': kb_source,
                })
        except Exception as err:
            last_error = str(err)

    # Non-streaming Groq fallback
    if GROQ_API_KEY and not web_search:
        groq_text = _groq_generate(system_instruction, final_prompt)
        if groq_text:
            if language == 'assamese':
                groq_text = _purify_assamese_with_grammar(groq_text)
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

    # Non-streaming Gemini fallback (also handles web_search grounding)
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
            if web_search and 'gemma' not in model_id:
                payload["tools"] = [{"googleSearch": {}}]

            res = http_session.post(url, headers=headers, json=payload, timeout=8)
            res_data = res.json()

            if res.status_code == 200 and 'candidates' in res_data and len(res_data['candidates']) > 0:
                candidate = res_data['candidates'][0]
                parts = candidate.get('content', {}).get('parts', [])
                if parts and 'text' in parts[0]:
                    response_text = parts[0]['text']

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

                    if web_search and language == 'assamese':
                        indic_chars = sum(
                            1 for ch in response_text
                            if 'ঀ' <= ch <= '৿'
                        )
                        if indic_chars < max(20, len(response_text) * 0.15):
                            rewrite_sys = (
                                "Rewrite the following text in clear, natural, "
                                "everyday Assamese (অসমীয়া) using the correct "
                                "Assamese script. Preserve every fact, name, "
                                "date and number exactly. Keep any URLs "
                                "unchanged. Output plain prose only — no "
                                "Markdown, no bullets, no HTML."
                            )
                            asm = _groq_generate(rewrite_sys, response_text,
                                                 timeout=30)
                            if asm and asm.strip():
                                response_text = asm.strip()

                    if language == 'assamese':
                        response_text = _purify_assamese_with_grammar(response_text)
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




def _attach_global_auth_cookies(request, response, device_id=None):
    """
    Ensures that sessionid, csrftoken, and auth state cookies are issued
    with wildcard domain (.aiaxom.co.in) and Secure flag so authentication
    is shared instantly and reliably across all subdomains.
    """
    cookie_domain = settings.SESSION_COOKIE_DOMAIN
    cookie_secure = settings.SESSION_COOKIE_SECURE
    cookie_samesite = settings.SESSION_COOKIE_SAMESITE

    if getattr(request, 'session', None) and request.session.session_key:
        response.set_cookie(
            settings.SESSION_COOKIE_NAME,
            request.session.session_key,
            max_age=settings.SESSION_COOKIE_AGE,
            domain=cookie_domain,
            path=settings.SESSION_COOKIE_PATH,
            secure=cookie_secure,
            httponly=settings.SESSION_COOKIE_HTTPONLY,
            samesite=cookie_samesite,
        )

    is_auth = bool(getattr(request, 'user', None) and request.user.is_authenticated)
    if is_auth:
        response.set_cookie(
            'axom_user_auth',
            '1',
            max_age=settings.SESSION_COOKIE_AGE,
            domain=cookie_domain,
            path='/',
            secure=cookie_secure,
            httponly=False,
            samesite='Lax',
        )
    else:
        response.delete_cookie('axom_user_auth', domain=cookie_domain, path='/')

    if device_id:
        response.set_cookie(
            'axom_device_uid',
            device_id,
            max_age=315360000,
            domain=cookie_domain,
            path='/',
            secure=cookie_secure,
            httponly=False,
            samesite='Lax',
        )

    return _apply_cross_subdomain_cors(request, response)


@csrf_exempt
def login_api_view(request):
    if request.method == 'OPTIONS':
        from django.http import HttpResponse
        return _apply_cross_subdomain_cors(request, HttpResponse(status=204))
    if request.method != 'POST':
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Only POST is allowed'}, status=405))
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        device_id = get_device_id(request, fallback_body=data)
    except Exception:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Invalid request data'}, status=400))

    from django.contrib.auth import authenticate, login
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        display_name = (user.get_full_name() or user.first_name or user.username).strip()
        resp = JsonResponse({
            'success': True,
            'username': user.username,
            'name': display_name,
            'is_staff': bool(user.is_staff),
        })
        return _attach_global_auth_cookies(request, resp, device_id=device_id)
    else:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Invalid username or password'}, status=400))


@csrf_exempt
def logout_api_view(request):
    if request.method == 'OPTIONS':
        from django.http import HttpResponse
        return _apply_cross_subdomain_cors(request, HttpResponse(status=204))
    from django.contrib.auth import logout
    logout(request)
    resp = JsonResponse({'success': True, 'message': 'Logged out successfully'})
    cookie_domain = settings.SESSION_COOKIE_DOMAIN
    resp.delete_cookie(settings.SESSION_COOKIE_NAME, domain=cookie_domain, path='/')
    resp.delete_cookie('axom_user_auth', domain=cookie_domain, path='/')
    resp.delete_cookie(settings.SESSION_COOKIE_NAME, path='/')
    resp.delete_cookie('axom_user_auth', path='/')
    return _apply_cross_subdomain_cors(request, resp)


@csrf_exempt
def register_api_view(request):
    """
    User Registration API with strict device and IP security.
    Constraint: Only 1 account is permitted per device / IP address.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    ip = get_client_ip(request)

    try:
        data = json.loads(request.body.decode('utf-8'))
        username = str(data.get('username', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        password = str(data.get('password', '')).strip()
        confirm_password = str(data.get('confirm_password', '')).strip()
        device_id = get_device_id(request, fallback_body=data)
    except Exception:
        return JsonResponse({'error': 'Invalid request payload.'}, status=400)

    # 1. Multi-account restriction check per device and IP
    allowed, err_msg = check_device_registration_allowed(ip=ip, device_id=device_id)
    if not allowed:
        return JsonResponse({
            'error': err_msg,
            'code': 'DEVICE_REGISTRATION_RESTRICTED',
        }, status=403)

    # 2. Input Validation
    if not username or len(username) < 3:
        return JsonResponse({'error': 'Username must be at least 3 characters long.'}, status=400)
    if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
        return JsonResponse({'error': 'Username can only contain letters, numbers, dots, and underscores.'}, status=400)
    if len(password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters long.'}, status=400)
    if confirm_password and password != confirm_password:
        return JsonResponse({'error': 'Passwords do not match.'}, status=400)

    from django.contrib.auth.models import User
    from django.contrib.auth import login

    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'This username is already taken. Please choose another.'}, status=400)

    if email and User.objects.filter(email__iexact=email).exists():
        return JsonResponse({'error': 'An account with this email address already exists.'}, status=400)

    # 3. Create User and UserProfile
    try:
        user = User.objects.create_user(
            username=username,
            email=email if email else f"{username}@user.aiaxom.co.in",
            password=password,
        )
        from userpanel.models import UserProfile
        UserProfile.objects.get_or_create(user=user)

        # 4. Enforce & record device registration to block future signups from this device/IP
        record_device_registration(
            user=user,
            ip=ip,
            device_id=device_id,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        # 5. Log in user immediately
        login(request, user)

        # 6. Build response with persistent device cookie
        resp = JsonResponse({
            'success': True,
            'username': user.username,
            'name': user.username,
            'is_staff': bool(user.is_staff),
            'message': 'Account created successfully!',
        })
        return _attach_global_auth_cookies(request, resp, device_id=device_id)
    except Exception as e:
        logger.exception("Error creating user account: %s", e)
        return _apply_cross_subdomain_cors(
            request,
            JsonResponse({'error': 'An unexpected error occurred while creating your account. Please try again.'}, status=500)
        )


@csrf_exempt
def google_auth_api_view(request):
    """
    Handles Google OAuth 2.0 (Google Identity Services) ID token login and registration.
    - If user exists by email -> Logs in immediately.
    - If user does not exist -> Strictly checks device limit (single-account policy).
      If allowed, creates User & Profile, records device registration, and logs in.
    """
    if request.method == 'OPTIONS':
        from django.http import HttpResponse
        return _apply_cross_subdomain_cors(request, HttpResponse(status=204))
    if request.method != 'POST':
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Only POST method is allowed'}, status=405))

    ip = get_client_ip(request)

    try:
        data = json.loads(request.body.decode('utf-8'))
        credential = str(data.get('credential', '')).strip()
        device_id = get_device_id(request, fallback_body=data)
    except Exception:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Invalid request payload.'}, status=400))

    if not credential:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Google authentication credential is required.'}, status=400))

    # 1. Verify token with Google's official tokeninfo endpoint
    try:
        tokeninfo_url = 'https://oauth2.googleapis.com/tokeninfo'
        g_res = http_session.get(tokeninfo_url, params={'id_token': credential}, timeout=8)
        if g_res.status_code != 200:
            return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Invalid or expired Google authentication token.'}, status=401))
        id_info = g_res.json()
    except Exception as e:
        logger.exception("Error verifying Google ID token: %s", e)
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Failed to verify Google token with authentication service.'}, status=502))

    # 2. Validate token attributes
    aud = id_info.get('aud', '')
    if aud != GOOGLE_OAUTH_CLIENT_ID:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Google token audience mismatch.'}, status=401))

    iss = id_info.get('iss', '')
    if iss not in ('accounts.google.com', 'https://accounts.google.com'):
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Untrusted token issuer.'}, status=401))

    email = id_info.get('email', '').strip().lower()
    email_verified = id_info.get('email_verified')
    if str(email_verified).lower() not in ('true', '1') or not email:
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Unverified Google email address.'}, status=400))

    full_name = id_info.get('name', '').strip()
    picture_url = id_info.get('picture', '').strip()

    from django.contrib.auth.models import User
    from django.contrib.auth import login
    from userpanel.models import UserProfile

    # 3. Check if user already exists with this email
    user = User.objects.filter(email__iexact=email).first()

    if user:
        # Existing user logging in: allowed without creating duplicate accounts
        login(request, user)

        # Update profile avatar if empty
        try:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if picture_url and not profile.avatar_url:
                profile.avatar_url = picture_url
                profile.save(update_fields=['avatar_url'])
        except Exception:
            pass

        # Link any anonymous session chats
        if request.session.session_key:
            from knowledge.models import ChatSession
            ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

        display_name = (user.get_full_name() or user.first_name or user.username).strip()
        resp = JsonResponse({
            'success': True,
            'username': user.username,
            'name': display_name,
            'email': user.email,
            'is_staff': bool(user.is_staff),
            'is_new': False,
            'message': 'Logged in successfully with Google!',
        })
        return _attach_global_auth_cookies(request, resp, device_id=device_id)

    # 4. New user registration via Google: STRICT DEVICE & IP CHECK
    allowed, err_msg = check_device_registration_allowed(ip=ip, device_id=device_id)
    if not allowed:
        return _apply_cross_subdomain_cors(request, JsonResponse({
            'error': err_msg,
            'code': 'DEVICE_REGISTRATION_RESTRICTED',
        }, status=403))

    # Derive unique username from email
    base_username = re.sub(r'[^a-zA-Z0-9_]', '', email.split('@')[0])[:20] or 'user'
    derived_username = base_username
    counter = 1
    while User.objects.filter(username__iexact=derived_username).exists():
        derived_username = f"{base_username}_{counter}"
        counter += 1

    try:
        user = User.objects.create_user(
            username=derived_username,
            email=email,
            first_name=full_name[:30] if full_name else '',
        )
        user.set_unusable_password()
        user.save()

        # Create Profile
        UserProfile.objects.get_or_create(user=user, defaults={'avatar_url': picture_url})

        # Record device registration
        record_device_registration(
            user=user,
            ip=ip,
            device_id=device_id,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        login(request, user)

        if request.session.session_key:
            from knowledge.models import ChatSession
            ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

        display_name = (user.get_full_name() or user.first_name or user.username).strip()
        resp = JsonResponse({
            'success': True,
            'username': user.username,
            'name': display_name,
            'email': user.email,
            'is_staff': bool(user.is_staff),
            'is_new': True,
            'message': 'Account created successfully with Google!',
        })
        return _attach_global_auth_cookies(request, resp, device_id=device_id)
    except Exception as e:
        logger.exception("Error creating user from Google OAuth: %s", e)
        return _apply_cross_subdomain_cors(request, JsonResponse({'error': 'Failed to create user account with Google.'}, status=500))




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
    if target not in ('pdf', 'docx', 'png', 'jpg', 'webp'):
        return JsonResponse({'error': 'Invalid target. Use pdf, docx, png, jpg or webp.'}, status=400)

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
            if len(saved) > 1:
                pdf_outputs = []
                for s_path, s_ext, s_stem in saved:
                    if s_ext not in OFFICE_EXTS:
                        continue
                    cur_out = os.path.join(out_dir, f"{s_stem}_{uid}.pdf")
                    if fc.office_available():
                        produced = fc.convert_office_to_pdf(s_path, out_dir)
                        if os.path.abspath(produced) != os.path.abspath(cur_out):
                            os.replace(produced, cur_out)
                    else:
                        convert_doc_to_pdf(s_path, cur_out)
                    pdf_outputs.append(cur_out)
                out = os.path.join(out_dir, f"converted_batch_{uid}.zip")
                fc.zip_files(pdf_outputs, out)
                out_name = f"converted_{len(pdf_outputs)}_documents.zip"
            else:
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
        elif target in ('png', 'jpg', 'webp') and src_ext in (
                '.jfif', '.webp', '.bmp', '.tiff', '.tif', '.gif', '.ico',
                '.avif', '.heic', '.heif', '.png', '.jpg', '.jpeg'):
            from PIL import Image as PILImage
            out = os.path.join(out_dir, f"{stem}_{uid}.{target}")
            img = PILImage.open(saved[0][0])
            if img.mode in ('RGBA', 'LA', 'P') and target == 'jpg':
                img = img.convert('RGB')
            elif img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGBA' if target == 'png' else 'RGB')
            save_opts = {}
            if target == 'webp':
                save_opts = {'quality': 90}
            elif target == 'jpg':
                save_opts = {'quality': 95}
            img.save(out, **save_opts)
            out_name = f"{stem}.{target}"
        elif target in ('png', 'jpg', 'webp') and src_ext == '.svg':
            import cairosvg
            out = os.path.join(out_dir, f"{stem}_{uid}.{target}")
            if target == 'png':
                cairosvg.svg2png(url=saved[0][0], write_to=out, output_width=2048)
            else:
                png_tmp = out + '.tmp.png'
                cairosvg.svg2png(url=saved[0][0], write_to=png_tmp, output_width=2048)
                from PIL import Image as PILImage
                img = PILImage.open(png_tmp).convert('RGB')
                img.save(out, quality=95 if target == 'jpg' else 90)
                os.remove(png_tmp)
            out_name = f"{stem}.{target}"
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
                 'extract', 'numbers', 'watermark', 'wmremove', 'protect', 'unlock', 'ocr'}
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
            text = (request.POST.get('text', '') or 'CONFIDENTIAL').strip()[:80]
            out = os.path.join(out_dir, f"{stem}_{uid}_watermarked.pdf")
            T.watermark_pdf(
                first_path, text, out,
                opacity=request.POST.get('opacity', '0.15'),
                size=request.POST.get('size', '48'),
                color=request.POST.get('color', '#888888'),
                rotation=request.POST.get('rotation', '45'),
                position=(request.POST.get('position', 'diagonal') or 'diagonal').lower(),
            )
            out_name = f"{stem}_watermarked.pdf"
        elif op == 'wmremove':
            out = os.path.join(out_dir, f"{stem}_{uid}_clean.pdf")
            T.remove_watermark(first_path, out)
            out_name = f"{stem}_clean.pdf"
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


def detect_watermark_api(request):
    """Scan a PDF for watermark indicators. Returns JSON (no file)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)
    f = request.FILES.get('file')
    if not f or not f.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Please upload a .pdf file.'}, status=400)
    if f.size > 40 * 1024 * 1024:
        return JsonResponse({'error': 'File exceeds the 40MB limit.'}, status=400)

    import uuid
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    path = os.path.join(upload_dir, f"wd_{uuid.uuid4().hex[:8]}.pdf")
    with open(path, 'wb+') as d:
        for chunk in f.chunks():
            d.write(chunk)
    try:
        from knowledge.watermark_tools import detect_watermark
        info = detect_watermark(path)
    except Exception as e:
        return JsonResponse({'error': f'Scan failed: {str(e)}'}, status=500)
    finally:
        try:
            os.remove(path)
        except Exception:
            pass
    return JsonResponse({'success': True, **info})


def remove_watermark_api(request):
    """Remove user-selected watermark regions. POST: file, regions (JSON), mode."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)
    f = request.FILES.get('file')
    if not f or not f.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Please upload a .pdf file.'}, status=400)
    if f.size > 40 * 1024 * 1024:
        return JsonResponse({'error': 'File exceeds the 40MB limit.'}, status=400)

    try:
        regions = json.loads(request.POST.get('regions', '{}'))
    except Exception:
        regions = {}
    if not regions:
        return JsonResponse({'error': 'Select at least one watermark region to remove.'}, status=400)
    mode = (request.POST.get('mode', 'inpaint') or 'inpaint').lower()

    import uuid
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    out_dir = os.path.join(settings.MEDIA_ROOT, 'converted_files')
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)
    uid = uuid.uuid4().hex[:8]
    stem = "".join(c for c in os.path.splitext(f.name)[0] if c.isalnum() or c in (' ', '_', '-')).strip() or 'file'
    in_path = os.path.join(upload_dir, f"{stem}_{uid}.pdf")
    out = os.path.join(out_dir, f"{stem}_{uid}_nowm.pdf")
    with open(in_path, 'wb+') as d:
        for chunk in f.chunks():
            d.write(chunk)
    try:
        from knowledge.watermark_tools import remove_watermark_regions
        remove_watermark_regions(in_path, out, regions, mode)
    except Exception as e:
        return JsonResponse({'error': f'Removal failed: {str(e)}'}, status=500)

    fname = os.path.basename(out)
    size = os.path.getsize(out)
    size_str = f"{size / 1024:.1f} KB" if size < 1024 * 1024 else f"{size / (1024 * 1024):.2f} MB"
    return JsonResponse({
        'success': True, 'filename': fname, 'output_name': f"{stem}_nowm.pdf",
        'download_url': f"/api/download-converted-file/{fname}", 'file_size': size_str,
    })


# ---------------------------------------------------------------------------
# Image generation
# Primary  : Google Gemini image models
#            - Normal  : gemini-2.5-flash-image  (Nano Banana)
#            - Extreme : gemini-3-pro-image      (falls back to 2.5-flash-image
#                        if 3-pro is not yet enabled on the project)
# Fallback : Cloudflare Workers AI  ->  Pollinations.ai
# ---------------------------------------------------------------------------
_CF_API_TOKEN = os.getenv('CF_API_TOKEN', '').strip()
_CF_ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID', '').strip()

# Model constants for Cloudflare Workers AI (kept as safety fallback)
_CF_MODEL_FLUX_SCHNELL = '@cf/black-forest-labs/flux-1-schnell'
_CF_MODEL_SDXL_LIGHTNING = '@cf/bytedance/stable-diffusion-xl-lightning'
_CF_MODEL_SDXL_BASE = '@cf/stabilityai/stable-diffusion-xl-base-1.0'

# Gemini image models (primary)
_GEMINI_IMG_API_KEY = os.getenv('GEMINI_IMAGE_API_KEY', '').strip() or os.getenv('GEMINI_API_KEY', '').strip()
_GEMINI_IMG_MODEL_NORMAL = os.getenv('GEMINI_IMG_MODEL_NORMAL', 'gemini-2.5-flash-image').strip()
_GEMINI_IMG_MODEL_EXTREME = os.getenv('GEMINI_IMG_MODEL_EXTREME', 'gemini-3-pro-image').strip()
_GEMINI_IMG_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'

# Vertex AI (Google Cloud billing) — preferred over AI Studio endpoint when configured
_VERTEX_SA_JSON_PATH = os.getenv('GEMINI_VERTEX_SA_JSON', '').strip()
_VERTEX_PROJECT_ID = os.getenv('GEMINI_VERTEX_PROJECT_ID', '').strip()
_VERTEX_LOCATION = os.getenv('GEMINI_VERTEX_LOCATION', 'us-central1').strip()
_VERTEX_ENDPOINT = 'https://{loc}-aiplatform.googleapis.com/v1/projects/{proj}/locations/{loc}/publishers/google/models/{model}:generateContent'
_VERTEX_CREDS = None
_VERTEX_TOKEN_CACHE = {'token': None, 'expiry_ts': 0}


def _vertex_get_token():
    """Return a valid OAuth access token for Vertex AI, refreshing every ~55 min."""
    global _VERTEX_CREDS
    now = time.time()
    if _VERTEX_TOKEN_CACHE['token'] and now < _VERTEX_TOKEN_CACHE['expiry_ts']:
        return _VERTEX_TOKEN_CACHE['token']
    if not _VERTEX_SA_JSON_PATH or not os.path.exists(_VERTEX_SA_JSON_PATH):
        return None
    try:
        from google.oauth2 import service_account as _sa
        from google.auth.transport.requests import Request as _GAuthRequest
        if _VERTEX_CREDS is None:
            _VERTEX_CREDS = _sa.Credentials.from_service_account_file(
                _VERTEX_SA_JSON_PATH,
                scopes=['https://www.googleapis.com/auth/cloud-platform'],
            )
        _VERTEX_CREDS.refresh(_GAuthRequest())
        _VERTEX_TOKEN_CACHE['token'] = _VERTEX_CREDS.token
        # Google tokens live 1 hour — refresh 5 min early to be safe
        _VERTEX_TOKEN_CACHE['expiry_ts'] = now + 55 * 60
        return _VERTEX_CREDS.token
    except Exception as e:
        return None


def _vertex_generate_image(prompt, model, timeout=90):
    """Generate an image via Vertex AI Gemini image model (Google Cloud billing).
    Returns (PIL.Image, model_id) on success, or (None, error_string) on failure."""
    if not (_VERTEX_SA_JSON_PATH and _VERTEX_PROJECT_ID):
        return None, 'Vertex AI not configured (GEMINI_VERTEX_SA_JSON / GEMINI_VERTEX_PROJECT_ID missing)'
    token = _vertex_get_token()
    if not token:
        return None, 'Vertex AI OAuth token not available (service account JSON invalid or google-auth not installed)'
    try:
        from PIL import Image as _PILImage
        import io as _io
        import base64 as _b64
    except Exception as e:
        return None, f'Pillow not available: {e}'

    url = _VERTEX_ENDPOINT.format(loc=_VERTEX_LOCATION, proj=_VERTEX_PROJECT_ID, model=model)
    # Vertex requires explicit role on each content item; AI Studio doesn't.
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt[:2000]}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    try:
        r = http_session.post(
            url,
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            json=body, timeout=timeout,
        )
        if r.status_code != 200:
            return None, f'Vertex HTTP {r.status_code}: {r.text[:200]}'
        data = r.json()
        cands = data.get('candidates') or []
        for c in cands:
            parts = (c.get('content') or {}).get('parts') or []
            for p in parts:
                inline = p.get('inlineData') or p.get('inline_data') or {}
                b64 = inline.get('data') or ''
                mime = inline.get('mimeType') or inline.get('mime_type') or ''
                if b64 and 'image' in mime:
                    raw = _b64.b64decode(b64)
                    img = _PILImage.open(_io.BytesIO(raw)).convert('RGB')
                    return img, f'vertex/{model}'
        return None, 'Vertex returned no image (likely safety-blocked or text-only)'
    except Exception as e:
        return None, str(e)[:300]

# Rate limits (persistent across gunicorn restart via Django cache; memory as fallback)
_IMGGEN_RATE_LIMIT = int(os.getenv('IMGGEN_RATE_LIMIT', '4'))          # per burst window
_IMGGEN_RATE_WINDOW = int(os.getenv('IMGGEN_RATE_WINDOW', '60'))       # seconds
_IMGGEN_HITS = {}
_IMGGEN_TIMEOUT = int(os.getenv('IMGGEN_TIMEOUT', '90'))
_IMGGEN_DAILY_LIMIT = int(os.getenv('IMGGEN_DAILY_LIMIT', '5'))
_IMGGEN_DAILY_HITS = {}   # in-memory fallback: ip -> {'date': 'YYYY-MM-DD', 'count': int}


def _gemini_generate_image(prompt, model, timeout=90, ref_image_b64=None, ref_image_mime=None):
    """Generate or edit an image via Google Gemini image models.
    When ref_image_b64 is provided, sends the reference image alongside the
    text prompt so Gemini can edit/transform it (ChatGPT-style image editing).
    Returns (PIL.Image, model_id) on success, or (None, error_string) on failure."""
    if not _GEMINI_IMG_API_KEY:
        return None, 'Gemini image key not configured (GEMINI_IMAGE_API_KEY)'
    try:
        from PIL import Image as _PILImage
        import io as _io
        import base64 as _b64
    except Exception as e:
        return None, f'Pillow not available: {e}'

    url = _GEMINI_IMG_ENDPOINT.format(model=model)

    parts = []
    if ref_image_b64:
        parts.append({
            "inlineData": {
                "mimeType": ref_image_mime or "image/png",
                "data": ref_image_b64,
            }
        })
    parts.append({"text": prompt[:2000]})

    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    try:
        r = http_session.post(
            url,
            headers={
                'Content-Type': 'application/json',
                'x-goog-api-key': _GEMINI_IMG_API_KEY,
            },
            json=body, timeout=timeout,
        )
        if r.status_code != 200:
            return None, f'Gemini HTTP {r.status_code}: {r.text[:200]}'
        data = r.json()
        cands = data.get('candidates') or []
        for c in cands:
            cparts = (c.get('content') or {}).get('parts') or []
            for p in cparts:
                inline = p.get('inlineData') or p.get('inline_data') or {}
                b64 = inline.get('data') or ''
                mime = inline.get('mimeType') or inline.get('mime_type') or ''
                if b64 and 'image' in mime:
                    raw = _b64.b64decode(b64)
                    img = _PILImage.open(_io.BytesIO(raw)).convert('RGB')
                    return img, f'gemini/{model}'
        return None, 'Gemini returned no image (likely safety-blocked or text-only)'
    except Exception as e:
        return None, str(e)[:300]


def _cloudflare_generate_image(prompt, width, height, model=None, timeout=60):
    """Generate an image via Cloudflare Workers AI with the specified model.
    Returns (PIL.Image, model_id) on success, or (None, error_string) on failure."""
    if not _CF_API_TOKEN or not _CF_ACCOUNT_ID:
        return None, 'Cloudflare not configured (CF_API_TOKEN / CF_ACCOUNT_ID missing)'
    try:
        from PIL import Image as _PILImage
        import io as _io
        import base64 as _b64
    except Exception as e:
        return None, f'Pillow not available: {e}'

    target_model = model or _CF_MODEL_FLUX_SCHNELL
    url = f'https://api.cloudflare.com/client/v4/accounts/{_CF_ACCOUNT_ID}/ai/run/{target_model}'

    # Fast models (FLUX schnell, SDXL Lightning) use 4-8 steps; Base 1.0 uses 20 steps
    if 'base-1.0' in target_model:
        body = {'prompt': prompt[:2000], 'num_steps': 20}
    elif 'lightning' in target_model:
        body = {'prompt': prompt[:2000], 'num_steps': 4}
    else:
        body = {'prompt': prompt[:2000], 'steps': 4}

    try:
        r = http_session.post(
            url,
            headers={'Authorization': f'Bearer {_CF_API_TOKEN}',
                     'Content-Type': 'application/json'},
            json=body, timeout=timeout,
        )
        if r.status_code != 200:
            return None, f'Cloudflare HTTP {r.status_code}: {r.text[:150]}'
        data = r.json()
        if not data.get('success'):
            errs = data.get('errors') or 'unknown'
            return None, f'Cloudflare error: {str(errs)[:150]}'
        img_b64 = (data.get('result') or {}).get('image', '')
        if not img_b64:
            return None, 'Cloudflare returned no image data'
        raw = _b64.b64decode(img_b64)
        img = _PILImage.open(_io.BytesIO(raw)).convert('RGB')
        return img, f'cloudflare/{target_model}'
    except Exception as e:
        return None, str(e)[:300]


# Pollinations.ai fallback (100% free, no key needed)
_POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/'


def _pollinations_generate_image(prompt, width, height, model='flux', timeout=60):
    """Generate an image via Pollinations.ai with the requested model."""
    try:
        from PIL import Image as _PILImage
        import io as _io
        import urllib.parse as _up
        import secrets as _secrets
    except Exception as e:
        return None, f'Pillow not available: {e}'

    encoded = _up.quote(prompt[:500], safe='')
    seed = _secrets.randbelow(1_000_000)
    url = (
        f'{_POLLINATIONS_URL}{encoded}'
        f'?width={int(width)}&height={int(height)}'
        f'&model={model}&nologo=true&seed={seed}'
    )
    try:
        r = http_session.get(url, timeout=timeout)
        if r.status_code != 200:
            return None, f'Pollinations HTTP {r.status_code}'
        img = _PILImage.open(_io.BytesIO(r.content)).convert('RGB')
        return img, f'pollinations/{model}'
    except Exception as e:
        return None, str(e)[:300]


# -- Prompt normaliser -----------------------------------------------------
_ASCII_ONLY = re.compile(r'^[\x00-\x7F]*$')
_LIKELY_ENGLISH_WORDS = re.compile(
    r'\b(the|a|an|with|and|of|on|in|to|at|for|by|from|as|is|are|was|were|'
    r'photo|photograph|image|picture|painting|illustration|portrait|landscape|'
    r'style|realistic|cartoon|anime|render|scene|background|foreground)\b',
    re.IGNORECASE)
_HINGLISH_MARKERS = re.compile(
    r'\b('
    r'hai|hain|tha|thi|the|raha|rahi|rahe|hoga|hogi|hoge|kar|karna|karo|kiya|'
    r'ka|ki|ke|ko|se|mein|mai|par|aur|nahi|nahin|kyu|kyun|kya|kaisa|kaise|'
    r'wala|wali|wale|kuch|sab|sabse|bahut|thoda|thodi|chhota|chhoti|bada|badi|'
    r'billi|kutta|kitab|ghar|pani|roti|bacha|bachi|larka|larki|admi|aurat|'
    r'phool|patta|surya|chand|tara|nadi|pahad|jungle|khet|gaon|shahar|'
    r'kori|kora|kore|xote|xopun|axe|nai|nohoi|hoi|ase|xotu|xori'
    r')\b', re.IGNORECASE)


def _looks_like_english(prompt):
    if not prompt:
        return False
    if not _ASCII_ONLY.match(prompt):
        return False
    if _HINGLISH_MARKERS.search(prompt):
        return False
    return bool(_LIKELY_ENGLISH_WORDS.search(prompt))


def _translate_prompt_for_image(prompt, has_ref_image=False):
    """Rewrite an arbitrary-language prompt into a clean English image-gen
    prompt using OpenAI GPT (primary) with Groq/Gemini fallback.
    Returns (english_prompt, was_translated:bool)."""
    if not prompt or not prompt.strip():
        return '', False
    prompt = prompt.strip()
    if not has_ref_image and _looks_like_english(prompt):
        return prompt, False

    if has_ref_image:
        system = (
            "You rewrite image-EDITING prompts into clear, natural ENGLISH. "
            "The user has attached a reference image and wants to EDIT it. "
            "The user may write in English, Hindi, Assamese, Hinglish, or "
            "Roman-Hindi/Assamese. Translate the meaning faithfully. "
            "Make it explicit that this is an image editing request on the "
            "attached image — e.g. 'Edit this image: ...' or 'Modify the "
            "uploaded image: ...'. Keep it concise (under 80 words). "
            "Output ONLY the English prompt, no quotes, no preface."
        )
    else:
        system = (
            "You rewrite image-generation prompts into clear, natural ENGLISH. "
            "The user may write in English, Hindi, Assamese, Hinglish, or Roman-"
            "Hindi/Assamese. Translate the meaning faithfully, keep it concise "
            "(under 60 words), and phrase it as a visual scene description "
            "suitable for a text-to-image model. Output ONLY the English prompt, "
            "no quotes, no preface, no explanation."
        )

    out = None
    try:
        from model_router.router import openai_generate
        out, _ = openai_generate(system, prompt, timeout=15)
    except Exception:
        pass
    if not out:
        out = _groq_generate(system, prompt, timeout=15)
    if not out:
        gk = os.getenv('GEMINI_API_KEY', '').strip()
        if gk:
            out = _gemini_generate(
                gk, system, prompt,
                ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'],
            )
    if not out:
        return prompt, False
    out = out.strip().strip('"').strip("'").strip()
    return out or prompt, bool(out and out != prompt)


def _imggen_key(ip, device=''):
    """Compound key: whichever is stricter (ip OR device) blocks."""
    if device:
        return f'{ip}|{device[:64]}'
    return ip


def _imggen_daily_count(ip, device=''):
    """How many images this IP+device has generated today (UTC).
    Reads from Django cache first (persistent across gunicorn restarts),
    falls back to in-memory dict."""
    from datetime import datetime, timezone
    from django.core.cache import cache as _dj_cache
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    key_ip = f'imggen_daily:{today}:{ip}'
    key_dev = f'imggen_daily:{today}:{device[:64]}' if device else None

    # Cache-first (persistent)
    ip_ct = 0
    dev_ct = 0
    try:
        v = _dj_cache.get(key_ip)
        if v is not None:
            ip_ct = int(v)
    except Exception:
        pass
    if key_dev:
        try:
            v = _dj_cache.get(key_dev)
            if v is not None:
                dev_ct = int(v)
        except Exception:
            pass

    # Memory fallback (in case cache dropped)
    entry = _IMGGEN_DAILY_HITS.get(_imggen_key(ip, device))
    mem_ct = 0
    if entry and entry.get('date') == today:
        mem_ct = int(entry.get('count', 0))

    # Whichever is higher (strictest) wins
    return max(ip_ct, dev_ct, mem_ct)


def _imggen_daily_incr(ip, device=''):
    """Record one successful generation against IP + device daily bucket."""
    from datetime import datetime, timezone
    from django.core.cache import cache as _dj_cache
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    key_ip = f'imggen_daily:{today}:{ip}'
    for k in filter(None, [key_ip, f'imggen_daily:{today}:{device[:64]}' if device else None]):
        try:
            cur = _dj_cache.get(k) or 0
            _dj_cache.set(k, int(cur) + 1, timeout=86400)
        except Exception:
            pass
    mem_key = _imggen_key(ip, device)
    entry = _IMGGEN_DAILY_HITS.get(mem_key)
    if not entry or entry.get('date') != today:
        entry = {'date': today, 'count': 0}
    entry['count'] = int(entry.get('count', 0)) + 1
    _IMGGEN_DAILY_HITS[mem_key] = entry


def _imggen_rate_limited(ip, device=''):
    """Sliding-window burst limit on IP + device. Either exceeding = block."""
    now = time.time()
    mem_key = _imggen_key(ip, device)
    hits = [t for t in _IMGGEN_HITS.get(mem_key, []) if now - t < _IMGGEN_RATE_WINDOW]
    if len(hits) >= _IMGGEN_RATE_LIMIT:
        _IMGGEN_HITS[mem_key] = hits
        return True
    hits.append(now)
    _IMGGEN_HITS[mem_key] = hits
    return False


# Basic prompt safety filter — cheapest defence before we spend API quota
_IMG_BLOCKED_TERMS = re.compile(
    r'\b('
    r'nude|nudity|naked|nsfw|porn|pornographic|sex|sexual|erotic|xxx|'
    r'child|minor|underage|loli|shota|pedo|cp|'
    r'gore|beheading|dismember|torture|snuff|'
    r'terror|bomb|weapon|isis|nazi|swastika'
    r')\b', re.IGNORECASE
)


def _imggen_prompt_safe(prompt):
    """Cheap keyword filter for obviously unsafe prompts. Gemini's own
    safety classifier is the real gate — this stops abuse before we
    even bill the API."""
    if not prompt:
        return False, 'Prompt is empty.'
    if _IMG_BLOCKED_TERMS.search(prompt):
        return False, 'Prompt contains disallowed content (NSFW / violence / illegal). Please try a different prompt.'
    return True, ''


def _check_user_premium_status(request):
    """Helper to check if request user has an active paid subscription plan."""
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', False):
        return False, 'free', None
    if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
        return True, 'pro', None
    plan_obj = getattr(user, 'plan', None) if hasattr(user, 'plan') else None
    if plan_obj and plan_obj.is_active():
        return True, plan_obj.plan, plan_obj
    return False, 'free', None


@csrf_exempt
def user_status_api(request):
    """Returns current user plan, daily quota usage, and model routing configuration."""
    if request.method == 'OPTIONS':
        from django.http import HttpResponse
        return _apply_cross_subdomain_cors(request, HttpResponse(status=204))

    from axom_ai.security import get_device_id as _get_dev
    ip = _client_ip(request)
    device = _get_dev(request)
    import logging
    _log = logging.getLogger('django')
    _log.warning(
        "[AUTH_CHECK] host=%s | ip=%s | user=%s | auth=%s | cookies=%s",
        request.get_host(), ip, getattr(request, 'user', None),
        getattr(getattr(request, 'user', None), 'is_authenticated', False),
        dict(request.COOKIES)
    )
    is_premium, plan_name, _ = _check_user_premium_status(request)
    used_today = _imggen_daily_count(ip, device)
    user = getattr(request, 'user', None)
    is_auth = bool(user and getattr(user, 'is_authenticated', False))

    if is_premium:
        daily_limit = 100 if 'pro' in plan_name else (50 if 'starter' in plan_name else 500)
    else:
        daily_limit = _IMGGEN_DAILY_LIMIT

    # Same models across all tiers now — Gemini for both normal and extreme
    models_config = {
        'normal': {
            'id': _GEMINI_IMG_MODEL_NORMAL,
            'name': 'Normal Quality (Gemini 2.5 Flash Image)',
            'desc': 'Balanced speed + quality · Gemini 2.5 Flash Image (Nano Banana)',
        },
        'extreme': {
            'id': _GEMINI_IMG_MODEL_EXTREME,
            'name': 'Extreme Quality (Gemini 3 Pro Image)',
            'desc': 'Master fidelity · Gemini 3 Pro Image',
        },
    }

    full_name = ''
    if is_auth and user:
        full_name = (user.get_full_name() or user.first_name or user.username).strip()

    resp = JsonResponse({
        'is_authenticated': is_auth,
        'username': getattr(user, 'username', '') if is_auth else '',
        'name': full_name,
        'email': getattr(user, 'email', '') if is_auth else '',
        'is_staff': bool(getattr(user, 'is_staff', False)) if is_auth else False,
        'is_premium': is_premium,
        'plan_name': plan_name,
        'daily_limit': daily_limit,
        'used_today': used_today,
        'remaining_today': max(0, daily_limit - used_today),
        'models': models_config,
    })

    return _attach_global_auth_cookies(request, resp, device_id=device)


@csrf_exempt
def generate_image_api(request):
    """
    POST JSON: {prompt, quality?: 'normal'|'extreme', width?, height?, device_id?}.

    Model routing (paid, single-source):
      - Normal  : gemini-2.5-flash-image  (Nano Banana)
      - Extreme : gemini-3-pro-image      (auto-falls back to 2.5-flash-image
                  if 3-pro is not enabled on the API key)
      - Emergency safety net : Cloudflare Workers AI -> Pollinations.ai
        (used only when Gemini errors — keeps the tool functional even during
        a Gemini outage / quota exhaustion; the response labels which engine
        actually rendered the image so the frontend can flag downgraded output.)

    Security:
      - IP + device_id (X-Device-Id header or cookie) daily cap  (5/day free tier)
      - Sliding-window burst limit (4 / 60 s) on IP+device
      - Cache-backed counters (Django cache) so counts survive gunicorn restart
      - Prompt keyword filter for NSFW / illegal content
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    from axom_ai.security import get_device_id as _get_dev
    ip = _client_ip(request)
    is_premium, plan_name, _ = _check_user_premium_status(request)

    content_type = request.content_type or ''
    if 'multipart' in content_type:
        payload = {}
        for k in ('prompt', 'quality', 'width', 'height', 'negative_prompt', 'seed', 'device_id'):
            v = request.POST.get(k)
            if v is not None:
                payload[k] = v
    else:
        try:
            payload = json.loads(request.body.decode('utf-8') or '{}')
        except Exception:
            payload = {}
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    device = _get_dev(request, payload)

    # 1) Daily quota (per IP+device — whichever is stricter blocks)
    used_today = _imggen_daily_count(ip, device)
    daily_cap = 100 if is_premium else _IMGGEN_DAILY_LIMIT
    if not is_premium and used_today >= _IMGGEN_DAILY_LIMIT:
        return JsonResponse({
            'error': (
                f"You have used all {_IMGGEN_DAILY_LIMIT} free images for today from this device. "
                f"Please upgrade for higher quotas."
            ),
            'daily_limit': _IMGGEN_DAILY_LIMIT,
            'used_today': used_today,
            'is_premium': False,
        }, status=429)
    if is_premium and used_today >= daily_cap:
        return JsonResponse({
            'error': f'Daily cap of {daily_cap} images reached for this plan.',
            'daily_limit': daily_cap, 'used_today': used_today, 'is_premium': True,
        }, status=429)

    # 2) Burst rate-limit
    if _imggen_rate_limited(ip, device):
        return JsonResponse({
            'error': f'Too many requests. Please wait ~{_IMGGEN_RATE_WINDOW}s before generating again.',
        }, status=429)

    # Parse reference image (for image editing — ChatGPT/Gemini style)
    ref_image_b64 = None
    ref_image_mime = None
    _MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

    if 'multipart' in content_type:
        uploaded = request.FILES.get('image')
        if uploaded:
            if uploaded.size > _MAX_IMAGE_BYTES:
                return JsonResponse({'error': 'Image must be under 5 MB.'}, status=400)
            allowed_mimes = {'image/png', 'image/jpeg', 'image/webp', 'image/gif'}
            fmime = uploaded.content_type or ''
            if fmime not in allowed_mimes:
                return JsonResponse({'error': f'Unsupported image type: {fmime}. Use PNG, JPEG, WebP, or GIF.'}, status=400)
            import base64 as _b64_img
            ref_image_b64 = _b64_img.b64encode(uploaded.read()).decode('ascii')
            ref_image_mime = fmime
    else:
        ref_b64_field = payload.get('ref_image', '')
        if ref_b64_field:
            import base64 as _b64_img
            if ref_b64_field.startswith('data:'):
                header, _, b64data = ref_b64_field.partition(',')
                ref_image_mime = header.split(':')[1].split(';')[0] if ':' in header else 'image/png'
                ref_b64_field = b64data
            else:
                ref_image_mime = 'image/png'
            try:
                raw_bytes = _b64_img.b64decode(ref_b64_field)
                if len(raw_bytes) > _MAX_IMAGE_BYTES:
                    return JsonResponse({'error': 'Image must be under 5 MB.'}, status=400)
                ref_image_b64 = ref_b64_field
            except Exception:
                return JsonResponse({'error': 'Invalid base64 image data.'}, status=400)

    original_prompt = (payload.get('prompt') or '').strip()
    if not original_prompt:
        return JsonResponse({'error': 'Prompt is required.'}, status=400)
    if len(original_prompt) > 1000:
        return JsonResponse({'error': 'Prompt exceeds 1000 characters.'}, status=400)

    # 3) Content safety filter
    ok, safety_err = _imggen_prompt_safe(original_prompt)
    if not ok:
        return JsonResponse({'error': safety_err}, status=400)

    # 4) Translate to clean English if needed (with editing context when ref image attached)
    prompt, was_translated = _translate_prompt_for_image(original_prompt, has_ref_image=bool(ref_image_b64))

    # Clamp geometry (Gemini ignores explicit width/height but keep for CF fallback)
    def _clamp_dim(v, default=1024):
        try:
            n = int(v)
        except Exception:
            return default
        return max(256, min(1536, (n // 8) * 8))

    width = _clamp_dim(payload.get('width'), 1024)
    height = _clamp_dim(payload.get('height'), 1024)
    quality = (payload.get('quality') or 'normal').strip().lower()
    if quality not in ('normal', 'extreme'):
        quality = 'normal'

    # 5) Model routing — Gemini for both tiers, model changes by quality
    if quality == 'extreme':
        gemini_model = _GEMINI_IMG_MODEL_EXTREME
        gemini_fallback = _GEMINI_IMG_MODEL_NORMAL
        display_model_name = 'Gemini 3 Pro Image'
        cf_safety_model = _CF_MODEL_SDXL_LIGHTNING
        poll_safety_model = 'turbo'
    else:
        gemini_model = _GEMINI_IMG_MODEL_NORMAL
        gemini_fallback = _GEMINI_IMG_MODEL_NORMAL  # already the same
        display_model_name = 'Gemini 2.5 Flash Image'
        cf_safety_model = _CF_MODEL_FLUX_SCHNELL
        poll_safety_model = 'flux'

    t0 = time.time()
    engine = None
    engine_model = None
    pil_img = None
    tried_errors = []

    # Primary A: Vertex AI (Google Cloud billing) — preferred when configured
    if _VERTEX_SA_JSON_PATH and _VERTEX_PROJECT_ID:
        img, info = _vertex_generate_image(prompt, gemini_model, timeout=_IMGGEN_TIMEOUT)
        if img is not None:
            pil_img = img
            engine = 'gemini-vertex'
            engine_model = display_model_name
        else:
            tried_errors.append(f'Vertex ({gemini_model}): {info}')
            # Try Vertex with fallback model (extreme -> normal) before switching engine
            if pil_img is None and gemini_fallback and gemini_fallback != gemini_model:
                img2, info2 = _vertex_generate_image(prompt, gemini_fallback, timeout=_IMGGEN_TIMEOUT)
                if img2 is not None:
                    pil_img = img2
                    engine = 'gemini-vertex'
                    engine_model = f'Gemini 2.5 Flash Image (Vertex fallback)'
                else:
                    tried_errors.append(f'Vertex ({gemini_fallback}): {info2}')

    # Primary B: Gemini AI Studio (prepaid credits) — fallback of Vertex or primary if Vertex not configured
    if pil_img is None and _GEMINI_IMG_API_KEY:
        img, info = _gemini_generate_image(prompt, gemini_model, timeout=_IMGGEN_TIMEOUT, ref_image_b64=ref_image_b64, ref_image_mime=ref_image_mime)
        if img is not None:
            pil_img = img
            engine = 'gemini'
            engine_model = display_model_name
        else:
            tried_errors.append(f'Gemini AI Studio ({gemini_model}): {info}')
            if gemini_fallback and gemini_fallback != gemini_model:
                img2, info2 = _gemini_generate_image(prompt, gemini_fallback, timeout=_IMGGEN_TIMEOUT, ref_image_b64=ref_image_b64, ref_image_mime=ref_image_mime)
                if img2 is not None:
                    pil_img = img2
                    engine = 'gemini'
                    engine_model = f'Gemini 2.5 Flash Image (AI Studio fallback)'
                else:
                    tried_errors.append(f'Gemini AI Studio ({gemini_fallback}): {info2}')

    # Safety net: Cloudflare Workers AI
    if pil_img is None and _CF_API_TOKEN and _CF_ACCOUNT_ID:
        cf_img, cf_info = _cloudflare_generate_image(
            prompt, width, height, model=cf_safety_model, timeout=_IMGGEN_TIMEOUT)
        if cf_img is not None:
            pil_img = cf_img
            engine = 'cloudflare'
            engine_model = f'{display_model_name} (Cloudflare fallback)'
        else:
            tried_errors.append(f'Cloudflare ({cf_safety_model}): {cf_info}')

    # Final safety net: Pollinations.ai
    if pil_img is None:
        pl_img, pl_info = _pollinations_generate_image(
            prompt, width, height, model=poll_safety_model, timeout=_IMGGEN_TIMEOUT)
        if pl_img is not None:
            pil_img = pl_img
            engine = 'pollinations'
            engine_model = f'{display_model_name} (Pollinations fallback)'
        else:
            tried_errors.append(f'Pollinations ({poll_safety_model}): {pl_info}')

    if pil_img is None:
        return JsonResponse({
            'error': 'Image generation failed. ' + ' | '.join(tried_errors),
        }, status=502)

    # Success: record against daily bucket (IP + device)
    _imggen_daily_incr(ip, device)
    used_after = _imggen_daily_count(ip, device)

    import io, base64
    buf = io.BytesIO()
    pil_img.save(buf, format='PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return JsonResponse({
        'success': True,
        'image': f'data:image/png;base64,{b64}',
        'model': engine,
        'model_id': engine_model,
        'engine': engine,
        'width': pil_img.size[0],
        'height': pil_img.size[1],
        'ms': int((time.time() - t0) * 1000),
        'daily_limit': _IMGGEN_DAILY_LIMIT,
        'used_today': used_after,
        'remaining_today': max(0, _IMGGEN_DAILY_LIMIT - used_after),
        'original_prompt': original_prompt,
        'used_prompt': prompt,
        'translated': was_translated,
        'quality': quality,
    })


# =============================================================================
# SUMMARIZE — universal summarizer for PDF / DOCX / TXT / pasted text.
# Groq primary, Gemini fallback. Assamese output by default.
# =============================================================================

_SUMMARIZE_MAX_CHARS = 60_000          # per-request text cap (safety)
_SUMMARIZE_CHUNK_CHARS = 12_000        # split threshold for map-reduce
_SUMMARIZE_MAX_FILE_MB = 40
# Product cap for the launch tier — keeps latency + cost predictable while
# the summarizer is free. Frontend enforces the same number so users see it
# up-front for pasted text; server enforces it for uploaded files.
_SUMMARIZE_MAX_WORDS = 450

_SUMMARY_LENGTH_HINTS = {
    'short':    ('a very short summary — 3 to 4 sentences', '~80 words'),
    'medium':   ('a clear summary — one intro paragraph plus 4 to 6 key points',
                 '~200 words'),
    'detailed': ('a detailed summary — an intro paragraph, all key points as short '
                 'paragraphs, and a one-line takeaway at the end',
                 '~450 words'),
}

_SUMMARY_LANG_LABEL = {
    'assamese': 'natural, native Assamese (অসমীয়া script)',
    'english':  'clear, natural English',
    'hindi':    'clear, natural Hindi (Devanagari script)',
}


def _extract_docx_text(path, max_chars=_SUMMARIZE_MAX_CHARS):
    """Pull text out of a .docx (paragraphs + tables), capped for prompt safety."""
    from docx import Document
    doc = Document(path)
    parts, total = [], 0
    for p in doc.paragraphs:
        t = (p.text or '').strip()
        if t:
            parts.append(t)
            total += len(t)
            if total > max_chars:
                break
    if total < max_chars:
        for tbl in doc.tables:
            for row in tbl.rows:
                line = ' | '.join(c.text.strip() for c in row.cells if c.text.strip())
                if line:
                    parts.append(line)
                    total += len(line)
                    if total > max_chars:
                        break
            if total > max_chars:
                break
    return '\n'.join(parts)[:max_chars].strip()


def _extract_txt(path, max_chars=_SUMMARIZE_MAX_CHARS):
    for enc in ('utf-8', 'utf-16', 'latin-1'):
        try:
            with open(path, 'r', encoding=enc) as fh:
                return fh.read(max_chars).strip()
        except (UnicodeDecodeError, OSError):
            continue
    return ''


def _chunk_text(text, chunk_size=_SUMMARIZE_CHUNK_CHARS):
    """Break long text on paragraph boundaries where possible."""
    if len(text) <= chunk_size:
        return [text]
    chunks, buf, buf_len = [], [], 0
    for para in text.split('\n'):
        if buf_len + len(para) + 1 > chunk_size and buf:
            chunks.append('\n'.join(buf))
            buf, buf_len = [], 0
        buf.append(para)
        buf_len += len(para) + 1
    if buf:
        chunks.append('\n'.join(buf))
    return chunks


def _summarize_text(text, length='medium', language='assamese'):
    """Groq-first, Gemini-fallback summarizer. Handles long docs via map-reduce."""
    length_desc, target = _SUMMARY_LENGTH_HINTS.get(length, _SUMMARY_LENGTH_HINTS['medium'])
    lang_label = _SUMMARY_LANG_LABEL.get(language, _SUMMARY_LANG_LABEL['assamese'])

    def _one(system, prompt):
        out = _groq_generate(system, prompt, timeout=60)
        if out:
            return out
        gk = os.getenv('GEMINI_API_KEY', '').strip()
        if gk:
            return _gemini_generate(
                gk, system, prompt,
                ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'],
            )
        return None

    chunks = _chunk_text(text)

    # Short doc: one call and done.
    if len(chunks) == 1:
        system = (
            f"You are Axom AI. Summarise the document below into {length_desc} "
            f"({target}). Write in {lang_label}. Keep every fact faithful — never "
            f"invent names, dates or numbers. Output plain prose only (no Markdown, "
            f"no bullets with -/*, no HTML). If a list is needed, write items as "
            f"ordinary sentences separated by commas."
        )
        prompt = f"Document:\n{chunks[0]}"
        return _one(system, prompt)

    # Long doc: map-reduce.
    partials = []
    for i, ch in enumerate(chunks, 1):
        sys_ch = (
            f"You are summarising a section ({i} of {len(chunks)}) of a longer "
            f"document. Extract the key facts and figures in {lang_label}, in 5-8 "
            f"short sentences. No headings, no bullets."
        )
        out = _one(sys_ch, f"Section:\n{ch}")
        if out:
            partials.append(out)
    if not partials:
        return None

    combined = '\n\n'.join(partials)
    sys_final = (
        f"You are Axom AI. Below are section summaries of one document. Combine "
        f"them into {length_desc} ({target}) in {lang_label}. Remove repetition, "
        f"keep every fact faithful, and never invent details. Plain prose only."
    )
    return _one(sys_final, f"Section summaries:\n{combined}")


def summarize_api(request):
    """
    Universal summarizer.

    POST multipart:  file=<pdf|docx|txt>,  length=short|medium|detailed,  language=assamese|english|hindi
    POST JSON:       {text, length, language}
    Returns:         {success, summary, chars_in, chars_out, engine}
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'},
                            status=429)
    if not GROQ_API_KEY and not os.getenv('GEMINI_API_KEY'):
        return JsonResponse({'error': 'AI service is not configured.'}, status=503)

    length = 'medium'
    language = 'assamese'
    text = ''

    content_type = (request.META.get('CONTENT_TYPE') or '').lower()
    is_json = content_type.startswith('application/json')

    if is_json:
        try:
            payload = json.loads(request.body.decode('utf-8') or '{}')
        except Exception:
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
        text = (payload.get('text') or '').strip()
        length = (payload.get('length') or 'medium').lower()
        language = (payload.get('language') or 'assamese').lower()
        if not text:
            return JsonResponse({'error': 'Please provide text to summarise.'}, status=400)
    else:
        length = (request.POST.get('length') or 'medium').lower()
        language = (request.POST.get('language') or 'assamese').lower()
        pasted = (request.POST.get('text') or '').strip()
        f = request.FILES.get('file')

        if pasted:
            text = pasted
        elif f:
            if f.size > _SUMMARIZE_MAX_FILE_MB * 1024 * 1024:
                return JsonResponse({
                    'error': f'File exceeds the {_SUMMARIZE_MAX_FILE_MB} MB limit.',
                }, status=400)
            ext = os.path.splitext(f.name)[1].lower()
            if ext not in ('.pdf', '.docx', '.txt'):
                return JsonResponse({
                    'error': 'Supported types: .pdf, .docx, .txt (or paste text).',
                }, status=400)
            import uuid as _uuid
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, f"sum_{_uuid.uuid4().hex[:8]}{ext}")
            with open(path, 'wb+') as d:
                for chunk in f.chunks():
                    d.write(chunk)
            try:
                if ext == '.pdf':
                    text = _extract_pdf_text(path, max_chars=_SUMMARIZE_MAX_CHARS)
                elif ext == '.docx':
                    text = _extract_docx_text(path)
                else:
                    text = _extract_txt(path)
            finally:
                try:
                    os.remove(path)
                except Exception:
                    pass
            if not text:
                return JsonResponse({
                    'error': 'No readable text found. If this is a scanned PDF, run OCR first.',
                }, status=400)
        else:
            return JsonResponse({'error': 'Attach a file or paste some text.'}, status=400)

    if length not in _SUMMARY_LENGTH_HINTS:
        length = 'medium'
    if language not in _SUMMARY_LANG_LABEL:
        language = 'assamese'
    if len(text) > _SUMMARIZE_MAX_CHARS:
        text = text[:_SUMMARIZE_MAX_CHARS]

    # Enforce the 450-word launch-tier cap. The frontend also blocks this for
    # pasted text; the server catch is for uploaded files where the user can't
    # see the word count in advance, and for any client that bypasses the UI.
    word_count = len(text.split())
    if word_count > _SUMMARIZE_MAX_WORDS:
        return JsonResponse({
            'error': (
                f'This document has about {word_count} words, but Axom AI can '
                f'currently summarise up to {_SUMMARIZE_MAX_WORDS} words at a '
                f'time. Please trim the text or split the file into smaller '
                f'sections.'
            ),
            'word_count': word_count,
            'word_limit': _SUMMARIZE_MAX_WORDS,
        }, status=413)

    t0 = time.time()
    summary = _summarize_text(text, length=length, language=language)
    if not summary:
        return JsonResponse({
            'error': 'The AI service is busy. Please try again in a moment.',
        }, status=503)

    return JsonResponse({
        'success': True,
        'summary': summary,
        'chars_in': len(text),
        'chars_out': len(summary),
        'length': length,
        'language': language,
        'engine': 'groq+gemini',
        'ms': int((time.time() - t0) * 1000),
    })


# =============================================================================
# AI IMAGE FINDER (Pexels Stock & Creative Photos API)
# =============================================================================

PEXELS_API_KEY = os.getenv('PEXELS_API_KEY', 'tFXBOrGoNROyvUYDwsRdoRKkc5u8K0vGLhWzNTVCU9Xqqd9pQxqRGbEn').strip()
PEXELS_BASE_URL = 'https://api.pexels.com/v1'


def search_stock_images_api(request):
    """
    Search and browse high-resolution stock & AI photos using Pexels API.
    GET params:
      query: search keyword (e.g. 'nature', 'assam', 'office')
      page: page number (int, default 1)
      per_page: items per page (int, default 24, max 50)
      orientation: landscape | portrait | square (optional)
      size: large | medium | small (optional)
      color: color name or hex (optional)
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed.'}, status=405)

    if not PEXELS_API_KEY:
        return JsonResponse({'error': 'Pexels API key is not configured.'}, status=503)

    query = (request.GET.get('query') or '').strip()
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1

    try:
        per_page = min(50, max(1, int(request.GET.get('per_page', 24))))
    except (ValueError, TypeError):
        per_page = 24

    orientation = (request.GET.get('orientation') or '').strip().lower()
    size = (request.GET.get('size') or '').strip().lower()
    color = (request.GET.get('color') or '').strip().lower()

    headers = {
        'Authorization': PEXELS_API_KEY,
        'User-Agent': 'AxomAI/1.0',
    }

    params = {
        'page': page,
        'per_page': per_page,
    }
    if orientation in ('landscape', 'portrait', 'square'):
        params['orientation'] = orientation
    if size in ('large', 'medium', 'small'):
        params['size'] = size
    if color and color != 'all':
        params['color'] = color

    try:
        if query or orientation or color or size:
            # Pexels search endpoint requires a query parameter to apply filters
            search_query = query if query else (f"{color} aesthetic" if color else 'trending wallpaper')
            params['query'] = search_query
            url = f"{PEXELS_BASE_URL}/search"
        else:
            url = f"{PEXELS_BASE_URL}/curated"

        resp = http_session.get(url, headers=headers, params=params, timeout=15)
        if resp.status_code != 200:
            return JsonResponse({
                'error': f'Pexels API returned status {resp.status_code}: {resp.text[:200]}'
            }, status=resp.status_code)

        data = resp.json()
        photos = []
        for p in data.get('photos', []):
            w = p.get('width', 0)
            h = p.get('height', 0)
            # Strict post-filter check for orientation accuracy
            if orientation == 'landscape' and w and h and w <= h:
                continue
            if orientation == 'portrait' and w and h and h <= w:
                continue
            if orientation == 'square' and w and h:
                ratio = w / h
                if ratio < 0.8 or ratio > 1.25:
                    continue

            photos.append({
                'id': p.get('id'),
                'width': w,
                'height': h,
                'url': p.get('url'),
                'photographer': p.get('photographer') or 'Anonymous Photographer',
                'photographer_url': p.get('photographer_url') or '',
                'avg_color': p.get('avg_color') or '#1e1e2d',
                'alt': p.get('alt') or query or 'High Quality Photo',
                'src': p.get('src', {}),
            })

        return JsonResponse({
            'success': True,
            'total_results': data.get('total_results', len(photos)),
            'page': data.get('page', page),
            'per_page': data.get('per_page', per_page),
            'next_page': data.get('next_page'),
            'prev_page': data.get('prev_page'),
            'photos': photos,
            'query': query,
            'orientation': orientation,
            'color': color,
        })

    except requests.exceptions.Timeout:
        return JsonResponse({'error': 'Image search request timed out. Please try again.'}, status=504)
    except Exception as e:
        return JsonResponse({'error': f'Failed to fetch images: {str(e)}'}, status=500)


def download_stock_image_api(request):
    """
    Proxy download endpoint so user can save images directly with an attachment header.
    GET params:
      url: image URL
      name: desired filename (optional)
    """
    img_url = (request.GET.get('url') or '').strip()
    if not img_url or not (img_url.startswith('https://images.pexels.com/') or img_url.startswith('http')):
        return JsonResponse({'error': 'Valid image URL is required.'}, status=400)

    filename = (request.GET.get('name') or 'axom-image.jpg').strip()
    if not filename.endswith(('.jpg', '.jpeg', '.png', '.webp')):
        filename += '.jpg'

    try:
        resp = http_session.get(img_url, stream=True, timeout=25)
        if resp.status_code != 200:
            return JsonResponse({'error': 'Could not download image.'}, status=502)

        content_type = resp.headers.get('Content-Type', 'image/jpeg')
        response = StreamingHttpResponse(resp.iter_content(chunk_size=8192), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# =============================================================================
# AI VIDEO FINDER (Pexels Stock & 4K/HD Motion Videos API)
# =============================================================================

def search_stock_videos_api(request):
    """
    Search and browse high-resolution 4K and HD stock videos using Pexels Video API.
    GET params:
      query: search keyword (e.g. 'nature', 'assam', 'aerial drone', 'technology')
      page: page number (int, default 1)
      per_page: items per page (int, default 18, max 50)
      orientation: landscape | portrait | square (optional)
      size: large (4K) | medium (Full HD) | small (HD) (optional)
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed.'}, status=405)

    if not PEXELS_API_KEY:
        return JsonResponse({'error': 'Pexels API key is not configured.'}, status=503)

    query = (request.GET.get('query') or '').strip()
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1

    try:
        per_page = min(50, max(1, int(request.GET.get('per_page', 18))))
    except (ValueError, TypeError):
        per_page = 18

    orientation = (request.GET.get('orientation') or '').strip().lower()
    size = (request.GET.get('size') or '').strip().lower()

    headers = {
        'Authorization': PEXELS_API_KEY,
        'User-Agent': 'AxomAI/1.0',
    }

    params = {
        'page': page,
        'per_page': per_page,
    }
    if orientation in ('landscape', 'portrait', 'square'):
        params['orientation'] = orientation
    if size in ('large', 'medium', 'small'):
        params['size'] = size

    try:
        if query or orientation or size:
            search_query = query if query else 'trending footage'
            params['query'] = search_query
            url = f"{PEXELS_BASE_URL}/videos/search"
        else:
            url = f"{PEXELS_BASE_URL}/videos/popular"

        resp = http_session.get(url, headers=headers, params=params, timeout=15)
        if resp.status_code != 200:
            return JsonResponse({
                'error': f'Pexels Video API returned status {resp.status_code}: {resp.text[:200]}'
            }, status=resp.status_code)

        data = resp.json()
        videos = []
        for v in data.get('videos', []):
            w = v.get('width', 0)
            h = v.get('height', 0)

            # Strict orientation check
            if orientation == 'landscape' and w and h and w <= h:
                continue
            if orientation == 'portrait' and w and h and h <= w:
                continue
            if orientation == 'square' and w and h:
                ratio = w / h
                if ratio < 0.8 or ratio > 1.25:
                    continue

            # Parse and organize video files
            raw_files = v.get('video_files', [])
            # Filter mp4 files only
            mp4_files = [f for f in raw_files if f.get('file_type', '').startswith('video/mp4')]
            if not mp4_files:
                mp4_files = raw_files

            # Sort by resolution (width * height descending)
            sorted_files = sorted(
                mp4_files,
                key=lambda f: (f.get('width') or 0) * (f.get('height') or 0),
                reverse=True
            )

            # Assign human quality labels
            formatted_files = []
            for f in sorted_files:
                fw = f.get('width') or 0
                fh = f.get('height') or 0
                if fw >= 3800 or fh >= 2100:
                    quality_label = '4K UHD'
                elif fw >= 1900 or fh >= 1050:
                    quality_label = '1080p FHD'
                elif fw >= 1200 or fh >= 700:
                    quality_label = '720p HD'
                else:
                    quality_label = f'{fh}p SD' if fh else 'SD'

                formatted_files.append({
                    'id': f.get('id'),
                    'quality': f.get('quality'),
                    'label': quality_label,
                    'file_type': f.get('file_type'),
                    'width': fw,
                    'height': fh,
                    'fps': f.get('fps'),
                    'link': f.get('link'),
                })

            # Pick optimal preview file: a lightweight SD / 540p / 720p file for instant hover playback
            preview_file = None
            for f in reversed(formatted_files):
                fh = f.get('height') or 0
                if 300 <= fh <= 720:
                    preview_file = f
                    break
            if not preview_file and formatted_files:
                preview_file = formatted_files[-1]

            videos.append({
                'id': v.get('id'),
                'width': w,
                'height': h,
                'url': v.get('url'),
                'image': v.get('image'),
                'duration': v.get('duration') or 0,
                'user': {
                    'id': v.get('user', {}).get('id'),
                    'name': v.get('user', {}).get('name') or 'Pexels Videographer',
                    'url': v.get('user', {}).get('url') or '',
                },
                'video_files': formatted_files,
                'preview_url': preview_file.get('link') if preview_file else (formatted_files[0]['link'] if formatted_files else ''),
                'highest_quality': formatted_files[0]['label'] if formatted_files else 'HD',
            })

        return JsonResponse({
            'success': True,
            'total_results': data.get('total_results', len(videos)),
            'page': data.get('page', page),
            'per_page': data.get('per_page', per_page),
            'next_page': data.get('next_page'),
            'prev_page': data.get('prev_page'),
            'videos': videos,
            'query': query,
            'orientation': orientation,
            'size': size,
        })

    except requests.exceptions.Timeout:
        return JsonResponse({'error': 'Video search request timed out. Please try again.'}, status=504)
    except Exception as e:
        return JsonResponse({'error': f'Failed to fetch videos: {str(e)}'}, status=500)


def download_stock_video_api(request):
    """
    Proxy download endpoint so user can save stock videos directly with an attachment header.
    GET params:
      url: direct video URL (from videos.pexels.com or player.vimeo.com)
      name: desired filename (optional)
    """
    vid_url = (request.GET.get('url') or '').strip()
    if not vid_url or not vid_url.startswith(('https://videos.pexels.com/', 'https://images.pexels.com/', 'https://player.vimeo.com/', 'https://')):
        return JsonResponse({'error': 'Valid video URL is required.'}, status=400)

    filename = (request.GET.get('name') or 'axom-video.mp4').strip()
    if not filename.endswith(('.mp4', '.mov', '.webm')):
        filename += '.mp4'

    try:
        resp = http_session.get(vid_url, stream=True, timeout=60)
        if resp.status_code != 200:
            return JsonResponse({'error': 'Could not stream video download.'}, status=502)

        content_type = resp.headers.get('Content-Type', 'video/mp4')
        response = StreamingHttpResponse(resp.iter_content(chunk_size=65536), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# =============================================================================
# AI DIAGRAM GENERATOR (Mermaid.js / PlantUML / C4 Architecture)
# =============================================================================

_DIAGGEN_DAILY_LIMIT = int(os.getenv('DIAGGEN_DAILY_LIMIT', '10'))  # free tier cap
_DIAGGEN_RATE_LIMIT = int(os.getenv('DIAGGEN_RATE_LIMIT', '15'))   # max burst reqs
_DIAGGEN_RATE_WINDOW = int(os.getenv('DIAGGEN_RATE_WINDOW', '60'))  # seconds
_DIAGGEN_DAILY_HITS = {}  # {ip: {'date': 'YYYY-MM-DD', 'count': N}}
_DIAGGEN_HITS = {}        # {ip: [timestamp, ...]}


def _diaggen_daily_count(ip):
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    entry = _DIAGGEN_DAILY_HITS.get(ip)
    if not entry or entry.get('date') != today:
        return 0
    return int(entry.get('count', 0))


def _diaggen_daily_incr(ip):
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    entry = _DIAGGEN_DAILY_HITS.get(ip)
    if not entry or entry.get('date') != today:
        entry = {'date': today, 'count': 0}
    entry['count'] = int(entry.get('count', 0)) + 1
    _DIAGGEN_DAILY_HITS[ip] = entry


def _diaggen_rate_limited(ip):
    now = time.time()
    hits = [t for t in _DIAGGEN_HITS.get(ip, []) if now - t < _DIAGGEN_RATE_WINDOW]
    if len(hits) >= _DIAGGEN_RATE_LIMIT:
        _DIAGGEN_HITS[ip] = hits
        return True
    hits.append(now)
    _DIAGGEN_HITS[ip] = hits
    return False


@csrf_exempt
def generate_diagram_api(request):
    """
    Synthesize valid Mermaid.js / PlantUML diagram code from natural language prompts.
    POST JSON: { prompt, diagram_type?: 'flowchart'|'sequence'|'er'|'class'|'state'|'mindmap'|'c4', theme?: string, edit_code?: string }
    Returns: { success, code, diagram_type, title, explanation, engine, used_today, remaining_today }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed.'}, status=405)

    ip = _client_ip(request)
    is_premium, plan_name, _ = _check_user_premium_status(request)

    used_today = _diaggen_daily_count(ip)
    daily_cap = 100 if is_premium else _DIAGGEN_DAILY_LIMIT

    if not is_premium and used_today >= _DIAGGEN_DAILY_LIMIT:
        return JsonResponse({
            'error': f'You have reached the free limit of {_DIAGGEN_DAILY_LIMIT} diagrams per day. Please upgrade to Pro for unlimited diagrams!',
            'daily_limit': _DIAGGEN_DAILY_LIMIT,
            'used_today': used_today,
            'is_premium': False,
        }, status=429)

    if _diaggen_rate_limited(ip):
        return JsonResponse({'error': 'Too many requests. Please wait a moment before generating again.'}, status=429)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    prompt = (payload.get('prompt') or '').strip()
    if not prompt:
        return JsonResponse({'error': 'Prompt is required.'}, status=400)
    if len(prompt) > 2000:
        return JsonResponse({'error': 'Prompt exceeds 2000 characters limit.'}, status=400)

    diagram_type = (payload.get('diagram_type') or 'flowchart').strip().lower()
    edit_code = (payload.get('edit_code') or '').strip()

    # System instruction for Mermaid code generation with strict syntax constraints
    system_prompt = (
        "You are an expert software architect and visual diagram engineer for Axom AI.\n"
        "Generate 100% syntactically correct, beautiful, modern MERMAID.JS diagram code based on the user's prompt.\n\n"
        "STRICT MERMAID SYNTAX RULES:\n"
        "1. Output ONLY valid Mermaid code inside ```mermaid ... ``` or raw code without conversational preface.\n"
        "2. Shape Syntax Rules (ALWAYS double quote all label text inside brackets/braces):\n"
        "   - Standard box: NodeID[\"Label Here\"]\n"
        "   - Decision/Condition: NodeID{\"Decision Question?\"}  (CRITICAL: NEVER combine braces with brackets like {[...]})\n"
        "   - Rounded box: NodeID(\"Label Here\")\n"
        "   - Stadium/Pill: NodeID([\"Label Here\"])\n"
        "   - Database: NodeID[(\"Database Table\")]\n"
        "   - Subroutine: NodeID[[\"Subroutine Name\"]]\n"
        "3. ALWAYS enclose node labels and edge texts in double quotes if they contain spaces, hyphens, colons, parentheses or punctuation (e.g. A[\"Cart Review\"] -->|Yes| B{\"Is Logged In?\"}).\n"
        "4. For Flowcharts use: `flowchart TD` or `flowchart LR`\n"
        "5. For Architecture diagrams use: `flowchart TD` or `flowchart LR` with well-defined subgraphs (e.g. `subgraph Client[\"Client App\"] ... end` and `subgraph Cloud[\"AWS Cloud Infra\"] ... end`).\n"
        "6. For Sequence diagrams use: `sequenceDiagram`\n"
        "   - Add `autonumber` on line 2\n"
        "   - Use `actor User` / `participant Gateway`\n"
        "   - Messages: `User->>Gateway: Request` / `Gateway-->>User: Response` (NEVER use flowchart arrows like '-->' or '==>')\n"
        "7. For Database ER diagrams use: `erDiagram`\n"
        "   - Entities: `USER { string id PK, string email }`\n"
        "   - Relationships: `USER ||--o{ ORDER : places`\n"
        "8. For State diagrams use: `stateDiagram-v2`\n"
        "   - `[*] --> State1`\n"
        "   - `State1 --> State2: Transition`\n"
        "9. For Class diagrams use: `classDiagram`\n"
        "10. For Mindmaps use: `mindmap` (Start with `mindmap` on line 1, root node `root((Central Topic))` on line 2, and use 2-space indentation for tree branches).\n"
        "11. For Gantt charts use: `gantt`\n"
    )

    user_query = f"Diagram Type: {diagram_type}\nUser Prompt: {prompt}"
    if edit_code:
        user_query += f"\n\nExisting Mermaid Code to update/modify:\n{edit_code}"

    t0 = time.time()
    code_out = _groq_generate(system_prompt, user_query, timeout=25)
    if not code_out:
        gk = os.getenv('GEMINI_API_KEY', '').strip()
        if gk:
            code_out = _gemini_generate(gk, system_prompt, user_query, ['gemini-2.5-flash', 'gemini-1.5-flash'])

    if not code_out:
        return JsonResponse({'error': 'Diagram generation failed. The AI engine is currently busy.'}, status=503)

    # Clean up output code: remove markdown codeblocks if present
    clean_code = code_out.strip()
    if '```mermaid' in clean_code:
        clean_code = clean_code.split('```mermaid', 1)[1].split('```', 1)[0].strip()
    elif '```' in clean_code:
        clean_code = clean_code.split('```', 1)[1].split('```', 1)[0].strip()

    # Post-process & sanitize common LLM syntax slips in Mermaid:
    # 1. Normalize unicode characters (non-breaking hyphens, en-dashes, em-dashes, non-breaking spaces)
    clean_code = clean_code.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\xa0', ' ')
    # 2. Fix invalid decision shape {["Label"]} or {[Label]} -> {"Label"}
    clean_code = re.sub(r'\{\s*\[\s*"([^"]*)"\s*\]\s*\}', r'{"\1"}', clean_code)
    clean_code = re.sub(r'\{\s*\[\s*\'([^\']*)\'\s*\]\s*\}', r'{"\1"}', clean_code)
    clean_code = re.sub(r'\{\s*\[([^\]]+)\]\s*\}', r'{"\1"}', clean_code)
    # 3. Fix invalid square brackets inside stadium (["..."]) or (["..."])
    clean_code = re.sub(r'\(\s*\[\s*\"([^\"]*)\"\s*\]\s*\)', r'(["\1"])', clean_code)
    # 4. Wrap unquoted parentheses in node boxes: e.g. Node[Payment (UPI/Cards)] -> Node["Payment (UPI/Cards)"]
    clean_code = re.sub(r'(\b[A-Za-z0-9_]+)\[([^"\]\n\r]*\([^"\]\n\r]*\)[^"\]\n\r]*)\]', r'\1["\2"]', clean_code)
    # 5. Wrap unquoted parentheses in decision nodes: Node{Is Valid (Check)?} -> Node{"Is Valid (Check)?"}
    clean_code = re.sub(r'(\b[A-Za-z0-9_]+)\{([^"\}\n\r]*\([^"\}\n\r]*\)[^"\}\n\r]*)\}', r'\1{"\2"}', clean_code)
    # 6. Wrap unquoted parentheses in round nodes: Node(Start (Run)) -> Node("Start (Run)")
    clean_code = re.sub(r'(\b[A-Za-z0-9_]+)\(([^"\)\n\r]*\([^"\)\n\r]*\)[^"\)\n\r]*)\)', r'\1("\2")', clean_code)
    # 7. Normalize architecture-beta to flowchart TD if emitted
    if diagram_type == 'architecture' and clean_code.strip().startswith(('architecture-beta', 'architecture')):
        clean_code = re.sub(r'^(architecture-beta|architecture)[^\n]*\n', 'flowchart TD\n', clean_code.strip())

    # Increment daily usage
    _diaggen_daily_incr(ip)
    used_after = _diaggen_daily_count(ip)

    return JsonResponse({
        'success': True,
        'code': clean_code,
        'diagram_type': diagram_type,
        'prompt': prompt,
        'engine': 'Groq LLaMA 3.3',
        'ms': int((time.time() - t0) * 1000),
        'daily_limit': daily_cap,
        'used_today': used_after,
        'remaining_today': max(0, daily_cap - used_after),
        'is_premium': is_premium,
    })


# ---------------------------------------------------------------------------
# Video Compressor APIs (Celery + Redis + FFmpeg)
# ---------------------------------------------------------------------------
from axom_ai.video_compress import (
    FREE_MAX_UPLOAD_BYTES,
    PRO_MAX_UPLOAD_BYTES,
    FREE_DAILY_LIMIT,
    PRO_DAILY_LIMIT,
    FREE_MAX_DURATION_SEC,
    PRO_MAX_DURATION_SEC,
    PRESETS,
    get_daily_video_count,
    increment_daily_video_count,
    probe_video,
    dispatch_compression_job,
    read_job,
    delete_job_files,
)
from payments.utils import has_active_plan


@csrf_exempt
def video_compress_upload_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)

    ip = _client_ip(request)
    device_id = get_device_id(request)
    rate_key = f"{ip}:{device_id}"

    is_pro = has_active_plan(request.user)
    max_upload = PRO_MAX_UPLOAD_BYTES if is_pro else FREE_MAX_UPLOAD_BYTES
    daily_limit = PRO_DAILY_LIMIT if is_pro else FREE_DAILY_LIMIT
    max_duration = PRO_MAX_DURATION_SEC if is_pro else FREE_MAX_DURATION_SEC

    # Check daily quota
    used_today = get_daily_video_count(rate_key)
    if used_today >= daily_limit:
        return JsonResponse({
            'error': f'Daily limit of {daily_limit} video compressions reached. Upgrade to Pro for unlimited priority compressions.',
            'upgrade_required': not is_pro,
            'limit': daily_limit,
            'used_today': used_today,
        }, status=429 if is_pro else 402)

    video_file = request.FILES.get('video') or request.FILES.get('file')
    if not video_file:
        return JsonResponse({'error': 'No video file provided.'}, status=400)

    # Size check
    if video_file.size > max_upload:
        limit_mb = int(max_upload / (1024 * 1024))
        return JsonResponse({
            'error': f'File exceeds {limit_mb}MB limit. Upgrade to Pro to compress larger videos up to 100MB.',
            'upgrade_required': not is_pro,
            'file_size': video_file.size,
            'limit_bytes': max_upload,
        }, status=402 if not is_pro else 400)

    # Preset check
    preset_key = request.POST.get('preset', 'whatsapp').lower().strip()
    if preset_key not in PRESETS:
        preset_key = 'whatsapp'

    preset_info = PRESETS[preset_key]
    if preset_info.get('pro_only') and not is_pro:
        return JsonResponse({
            'error': f'{preset_info["label"]} preset is exclusive to Pro users. Upgrade to unlock full 1080p HD encoding.',
            'upgrade_required': True,
        }, status=402)

    # Pro-exclusive Studio Controls (Aspect ratio, Resolution, Format)
    aspect_ratio = request.POST.get('aspect_ratio', 'original').strip()
    resolution = request.POST.get('resolution', 'original').strip()
    format_ext = request.POST.get('format', 'mp4').strip().lower()

    if aspect_ratio not in ('original', '9:16', '16:9', '1:1', '4:5'):
        aspect_ratio = 'original'
    if resolution not in ('original', '1080p', '720p', '480p', '360p'):
        resolution = 'original'
    if format_ext not in ('mp4', 'webm', 'mov'):
        format_ext = 'mp4'

    is_custom = (aspect_ratio != 'original') or (resolution != 'original') or (format_ext != 'mp4')
    if is_custom and not is_pro:
        return JsonResponse({
            'error': 'Target Aspect Ratio (9:16, 16:9, 1:1, 4:5), Custom Resolution, and Container format options are exclusive to Pro VIP members.',
            'upgrade_required': True,
        }, status=402)

    # Save to temp upload location
    import uuid
    from pathlib import Path
    upload_ext = os.path.splitext(video_file.name)[1].lower() or '.mp4'
    if upload_ext not in ('.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'):
        return JsonResponse({'error': 'Unsupported video format. Please upload MP4, MOV, MKV, AVI, or WebM.'}, status=400)

    temp_id = uuid.uuid4().hex[:12]
    temp_dir = Path(settings.MEDIA_ROOT) / 'video_compress'
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_path = str(temp_dir / f"raw_{temp_id}{upload_ext}")

    try:
        with open(temp_path, 'wb+') as dest:
            for chunk in video_file.chunks():
                dest.write(chunk)
    except Exception as e:
        return JsonResponse({'error': f'Failed to store uploaded video: {str(e)}'}, status=500)

    # Probe metadata
    probe = probe_video(temp_path)
    duration = probe.get('duration', 0)
    if duration > max_duration:
        try:
            os.remove(temp_path)
        except Exception:
            pass
        limit_min = int(max_duration / 60)
        return JsonResponse({
            'error': f'Video duration ({int(duration)}s) exceeds the {limit_min}-minute limit for your tier.',
            'upgrade_required': not is_pro,
            'duration': duration,
        }, status=402 if not is_pro else 400)

    # Increment quota
    increment_daily_video_count(rate_key)

    # Dispatch Celery task
    task_id, err = dispatch_compression_job(
        input_path=temp_path,
        preset_key=preset_key,
        duration=duration,
        user_id=request.user.id if request.user.is_authenticated else None,
        is_pro=is_pro,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        format_ext=format_ext,
        orig_w=probe.get('width', 0),
        orig_h=probe.get('height', 0),
    )

    if err:
        return JsonResponse({'error': err}, status=503)

    return JsonResponse({
        'success': True,
        'task_id': task_id,
        'probe': probe,
        'preset': preset_key,
        'preset_label': preset_info['label'],
        'aspect_ratio': aspect_ratio,
        'resolution': resolution,
        'format': format_ext,
        'is_pro': is_pro,
        'daily_used': used_today + 1,
        'daily_limit': daily_limit,
    })


def video_compress_status_api(request, task_id):
    if not task_id or not re.match(r'^[A-Za-z0-9_]+$', task_id):
        return JsonResponse({'error': 'Invalid task ID'}, status=400)

    data = read_job(task_id)
    if not data:
        return JsonResponse({'error': 'Task not found or has expired.'}, status=404)

    return JsonResponse({
        'success': True,
        'task_id': task_id,
        'status': data.get('status', 'queued'),
        'progress': data.get('progress', 0),
        'input_size': data.get('input_size', 0),
        'output_size': data.get('output_size', 0),
        'duration': data.get('duration', 0),
        'aspect_ratio': data.get('aspect_ratio', 'original'),
        'resolution': data.get('resolution', 'original'),
        'format': data.get('format', 'mp4'),
        'download_url': data.get('download_url'),
        'output_filename': data.get('output_filename'),
        'error': data.get('error'),
    })


def video_compress_download_api(request, filename):
    import mimetypes
    from django.http import FileResponse, Http404
    clean = os.path.basename(filename)
    allowed_exts = ('.mp4', '.webm', '.mov')
    if not any(clean.endswith(ext) for ext in allowed_exts) or '..' in clean:
        raise Http404("Invalid video request.")

    file_path = os.path.join(settings.MEDIA_ROOT, 'video_compress', clean)
    if not os.path.exists(file_path):
        raise Http404("Video file not found or has expired.")

    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'video/mp4'

    resp = FileResponse(open(file_path, 'rb'), content_type=content_type)
    resp['Content-Disposition'] = f'attachment; filename="axom_compressed_{clean}"'
    return resp


@csrf_exempt
def video_compress_delete_api(request, task_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST is allowed.'}, status=405)

    if not task_id or not re.match(r'^[A-Za-z0-9_]+$', task_id):
        return JsonResponse({'error': 'Invalid task ID'}, status=400)

    deleted = delete_job_files(task_id)
    return JsonResponse({
        'success': True,
        'deleted': deleted,
        'message': 'Video permanently deleted from server memory.',
    })


# ── Screenshot to Code (Gemini Vision) ────────────────────────────────
@csrf_exempt
def screenshot_to_code_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    image_b64 = body.get('image', '')
    mime_type = body.get('mime_type', 'image/png')
    framework = body.get('framework', 'html')

    if not image_b64:
        return JsonResponse({'error': 'No image provided'}, status=400)

    api_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not api_key:
        return JsonResponse({'error': 'API key not configured'}, status=500)

    fw_instructions = {
        'html': 'Generate clean, semantic HTML5 with embedded CSS in a <style> tag. Use modern CSS (flexbox/grid). Make it responsive.',
        'tailwind': 'Generate HTML using Tailwind CSS utility classes via CDN. Include <script src="https://cdn.tailwindcss.com"></script>. Make it responsive.',
        'react': 'Generate a React functional component (JSX) with inline styles or CSS modules. Export default the component. Make it responsive.',
    }

    system_prompt = (
        "You are an expert frontend developer. The user will provide a screenshot of a UI/website. "
        "Your job is to recreate the UI as closely as possible using code. "
        "Pay close attention to layout, spacing, colors, fonts, borders, shadows, and every visual detail. "
        "Output ONLY the code — no explanations, no markdown fences, no commentary. "
        "Do not wrap in ```html or ``` blocks. Just raw code. "
        + fw_instructions.get(framework, fw_instructions['html'])
    )

    user_prompt = "Convert this screenshot into code. Recreate every visual element as accurately as possible."

    payload = {
        "contents": [{
            "parts": [
                {"text": user_prompt},
                {"inline_data": {"mime_type": mime_type, "data": image_b64}},
            ]
        }],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {"maxOutputTokens": 8192, "temperature": 0.2},
    }

    models = ["gemini-3.6-flash", "gemini-3-flash-preview", "gemini-2.5-flash"]
    headers = {'Content-Type': 'application/json'}

    for model_id in models:
        try:
            url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
                   f"{model_id}:generateContent?key={api_key}")
            res = http_session.post(url, headers=headers, json=payload, timeout=60)
            if res.status_code == 200:
                cands = res.json().get('candidates', [])
                if cands:
                    parts = cands[0].get('content', {}).get('parts', [])
                    if parts and parts[0].get('text', '').strip():
                        code = parts[0]['text'].strip()
                        if code.startswith('```'):
                            lines = code.split('\n')
                            lines = lines[1:]
                            if lines and lines[-1].strip() == '```':
                                lines = lines[:-1]
                            code = '\n'.join(lines)
                        return JsonResponse({'code': code, 'model': model_id})
        except requests.RequestException:
            continue

    return JsonResponse({'error': 'Failed to generate code. Please try again.'}, status=502)


# ── Background Removal (U-2-Net AI) ───────────────────────────────────
_rembg_session = None

def _get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        from rembg import new_session
        _rembg_session = new_session('u2net')
    return _rembg_session

@csrf_exempt
def remove_background_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    try:
        data = json.loads(request.body)
        image_b64 = data.get('image', '')
        if not image_b64:
            return JsonResponse({'error': 'No image provided'}, status=400)

        import base64
        from io import BytesIO
        from rembg import remove
        from PIL import Image

        # Parse optional solid background color for mathematically perfect edge compositing
        bgcolor = data.get('bgcolor')
        parsed_bgcolor = None
        if bgcolor:
            if isinstance(bgcolor, (list, tuple)) and len(bgcolor) in (3, 4):
                parsed_bgcolor = (int(bgcolor[0]), int(bgcolor[1]), int(bgcolor[2]), int(bgcolor[3]) if len(bgcolor) == 4 else 255)
            elif isinstance(bgcolor, str) and bgcolor.startswith('#'):
                h = bgcolor.lstrip('#')
                if len(h) == 6:
                    parsed_bgcolor = (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
                elif len(h) == 3:
                    parsed_bgcolor = (int(h[0]*2, 16), int(h[1]*2, 16), int(h[2]*2, 16), 255)

        quality = str(data.get('quality', 'standard')).lower().strip()
        is_extreme = (quality == 'extreme') or bool(data.get('alpha_matting', False))

        img_bytes = base64.b64decode(image_b64)
        input_image = Image.open(BytesIO(img_bytes)).convert('RGBA')

        # Limit maximum dimension to 2560px to ensure crisp quality while safeguarding memory
        max_dim = 2560
        if max(input_image.size) > max_dim:
            input_image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        remove_kwargs = {
            'session': _get_rembg_session(),
            'post_process_mask': False,
        }
        if parsed_bgcolor is not None:
            remove_kwargs['bgcolor'] = parsed_bgcolor

        if is_extreme:
            # Extreme HD Mode: Bayesian / KNN Alpha Matting for sub-pixel hair, fur, and multi-object contour isolation
            remove_kwargs['alpha_matting'] = True
            remove_kwargs['alpha_matting_foreground_threshold'] = 240
            remove_kwargs['alpha_matting_background_threshold'] = 15
            remove_kwargs['alpha_matting_erode_size'] = 6

        output_image = remove(input_image, **remove_kwargs)

        buf = BytesIO()
        output_image.save(buf, format='PNG', optimize=True)
        result_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return JsonResponse({
            'image': result_b64,
            'model': 'u2net',
            'quality': 'extreme' if is_extreme else 'standard',
            'width': output_image.width,
            'height': output_image.height,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── Multi-Layer Depth Decomposition (Ultra-Fast 60MB MiDaS ONNX) ───────
_midas_session = None

def _get_midas_session():
    global _midas_session
    if _midas_session is None:
        import onnxruntime as ort
        model_dir = os.path.expanduser("~/.rembg/models")
        model_path = os.path.join(model_dir, "midas_small.onnx")
        if not os.path.exists(model_path):
            import urllib.request
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            url = "https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx"
            urllib.request.urlretrieve(url, model_path)
        _midas_session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    return _midas_session

@csrf_exempt
def depth_layers_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    try:
        data = json.loads(request.body)
        image_b64 = data.get('image', '')
        if not image_b64:
            return JsonResponse({'error': 'No image provided'}, status=400)

        import base64
        from io import BytesIO
        import numpy as np
        from PIL import Image

        img_bytes = base64.b64decode(image_b64)
        orig_img = Image.open(BytesIO(img_bytes)).convert('RGB')

        # Limit maximum dimension to 1920px for safety & speed
        max_dim = 1920
        if max(orig_img.size) > max_dim:
            orig_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        orig_w, orig_h = orig_img.size

        # MiDaS v2.1 Small uses 256x256 normalized input (0.14s on CPU)
        img_resized = orig_img.resize((256, 256), Image.Resampling.BICUBIC)
        img_np = np.array(img_resized, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_norm = (img_np - mean) / std
        img_tensor = np.transpose(img_norm, (2, 0, 1))[None, ...].astype(np.float32)

        sess = _get_midas_session()
        input_name = sess.get_inputs()[0].name
        pred = sess.run(None, {input_name: img_tensor})[0].squeeze()

        # Min-max normalize to 0..255 (255 = closest foreground, 0 = farthest sky)
        d_min = pred.min()
        d_max = pred.max()
        depth_norm = ((pred - d_min) / (d_max - d_min + 1e-6) * 255.0).astype(np.uint8)

        depth_img = Image.fromarray(depth_norm).resize((orig_w, orig_h), Image.Resampling.BICUBIC)

        buf = BytesIO()
        depth_img.save(buf, format='PNG')
        depth_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return JsonResponse({
            'depth_map': depth_b64,
            'width': orig_w,
            'height': orig_h,
            'default_layers': [
                {'id': 'layer-1', 'name': 'Foreground (Closest)', 'depthMin': 175, 'depthMax': 255, 'visible': True, 'opacity': 1},
                {'id': 'layer-2', 'name': 'Midground (Trees & Valley)', 'depthMin': 110, 'depthMax': 185, 'visible': True, 'opacity': 1},
                {'id': 'layer-3', 'name': 'Distant Hills & Mountains', 'depthMin': 45, 'depthMax': 120, 'visible': True, 'opacity': 1},
                {'id': 'layer-4', 'name': 'Sky & Horizon (Farthest)', 'depthMin': 0, 'depthMax': 50, 'visible': True, 'opacity': 1},
            ]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)




