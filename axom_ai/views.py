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


def _client_ip(request):
    fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    return fwd.split(',')[0].strip() if fwd else request.META.get('REMOTE_ADDR', '?')


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
    # WEB SEARCH FAST PATH — Tavily search + Groq/Gemma synthesis in Assamese.
    # Runs BEFORE the KB tier so a user who toggled 🌐 explicitly gets fresh
    # web results. Per-device daily cap enforced first (English message when
    # exceeded); grounded English snippets are synthesised into Assamese by
    # Groq (Gemini/Cloudflare Gemma as fallbacks).
    # -----------------------------------------------------------------------
    if web_search:
        ws_ip = _client_ip(request)
        ws_used = _websearch_daily_count(ws_ip)
        if ws_used >= _WEBSEARCH_DAILY_LIMIT:
            return JsonResponse({
                'error': (
                    f"You can only do {_WEBSEARCH_DAILY_LIMIT} web searches "
                    f"per day in Axom AI. You have used all of today's quota "
                    f"from this device. Please come back tomorrow."
                ),
                'websearch_limit': _WEBSEARCH_DAILY_LIMIT,
                'used_today': ws_used,
            }, status=429)

        hits, err = _tavily_search(prompt, max_results=5)
        if hits is None:
            return JsonResponse({
                'error': (
                    'Web search is not available right now. '
                    f'({err or "unknown error"})'
                ),
            }, status=503)
        if not hits:
            return JsonResponse({
                'error': 'No web results found for that query. Try rephrasing.',
            }, status=404)

        # Build a compact grounded context for the LLM to synthesise from.
        context_lines = []
        for i, h in enumerate(hits, 1):
            snippet = (h.get('content') or '')[:600].strip()
            context_lines.append(
                f"[{i}] {h['title']}\n{snippet}\nURL: {h['url']}"
            )
        context = '\n\n'.join(context_lines)

        ws_system = (
            "You are Axom AI. Use ONLY the web search results below to answer "
            "the user's question. Reply in natural, native Assamese using "
            "correct Assamese script (অসমীয়া) — never in English or Bengali. "
            "Write plain, flowing prose only — NO inline citation markers like "
            "[1], [2], (1), (2), or (Source 1). The user will see the source "
            "URLs separately below the answer. Never invent facts that are "
            "not in the results. If the results don't contain the answer, say "
            "so honestly in Assamese. No Markdown, no bullets, no HTML."
        )
        ws_prompt = (
            f"Web search results:\n\n{context}\n\n"
            f"User question: {prompt}\n\n"
            f"Answer in Assamese (অসমীয়া script):"
        )

        answer = _groq_generate(ws_system, ws_prompt, timeout=45)
        if not answer:
            gk = os.getenv('GEMINI_API_KEY', '').strip()
            if gk:
                answer = _gemini_generate(
                    gk, ws_system, ws_prompt,
                    ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'],
                )
        if not answer:
            return JsonResponse({
                'error': 'AI service is busy. Please try again in a moment.',
            }, status=503)

        # Assamese safety layer — if the synthesiser drifted to English, ask
        # Groq to rewrite it in Assamese script while keeping facts+URLs.
        indic_chars = sum(1 for ch in answer if 'ঀ' <= ch <= '৿')
        if indic_chars < max(20, int(len(answer) * 0.15)):
            asm = _groq_generate(
                "Rewrite the following text in clear, natural, everyday "
                "Assamese (অসমীয়া script). Preserve every fact, name, date, "
                "number and URL exactly. Do NOT add inline citation markers "
                "like [1], [2], (1), (2). Plain prose only — no Markdown.",
                answer, timeout=30,
            )
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
            'engine': 'tavily+groq',
            'websearch_limit': _WEBSEARCH_DAILY_LIMIT,
            'used_today': ws_used + 1,
            'remaining_today': max(0, _WEBSEARCH_DAILY_LIMIT - (ws_used + 1)),
        })

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
        "grammar — the way an educated Assamese person actually speaks. "
        "Users may write in Roman Assamese (e.g. 'Bihu kunuba hoi?'), Hindi, Hinglish, or English — "
        "understand all of these, but ALWAYS reply in Assamese script. "
        "Do NOT write English words in Assamese script: greet with নমস্কাৰ (never হ্যালো/হাই), "
        "say ধন্যবাদ (never থেংক ইউ). "
        "Use proper Assamese, NOT Bengali: use ৰ (not র), কৰ (not কর), হয় (not হয়). "
        "Never use Bengali vocabulary or grammar — use a simpler Assamese word instead. "
        "When knowledge-base context is provided, synthesize it into a clear, natural conversational "
        "answer — do not copy-paste or dump raw text. Prefer that context and base your answer on it. "
        "STRICT OUTPUT FORMAT — write plain Assamese prose ONLY. NEVER use Markdown, tables, pipes (|), "
        "dashes as bullets (-, •, *), HTML tags (<br>, <b>, <i>), headings (#), blockquotes (>), or any "
        "special formatting characters. Use ordinary sentences and paragraphs separated by blank lines. "
        "When a list is genuinely needed, write items as normal Assamese sentences with commas or "
        "৷ (Assamese full stop), not as bullet points. "
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
    is_wiki = kb_source and str(kb_source.get('name', '')).startswith('Wikipedia:')
    if kb_answer:
        if is_wiki:
            pass  # Wikipedia → synthesize a natural response via LLM below
        elif language == 'assamese' and kb_assamese.strip():
            # Verified Assamese record → return it directly (accurate, no model).
            _save_chat(request, client_id, prompt, kb_assamese)
            return JsonResponse({
                'response': kb_assamese, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'db-assamese',
                'source': kb_source,
            })
        elif language == 'hinglish':
            # Stored data is already Hinglish → return verbatim (fast, no model).
            _save_chat(request, client_id, prompt, kb_answer)
            return JsonResponse({
                'response': kb_answer, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'instant',
                'source': kb_source,
            })
        else:
            # English, or Assamese without a stored record → translate the exact answer.
            translate_source = kb_answer

    custom_context = translate_source or (kb_answer if is_wiki else "")
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
                "OUTPUT FORMAT: plain Assamese prose only. NO Markdown, NO tables, NO "
                "pipes (|), NO dashes/bullets (-, •, *), NO HTML tags (<br>, <b>), NO "
                "headings (#) and NO blockquotes (>). Write ordinary sentences and "
                "paragraphs separated by blank lines. "
                "Output only the Assamese text, nothing else:\n\n"
                f"{translate_source}"
            )
        else:
            final_prompt = (
                f"Rewrite the following information in {target_lang}. Keep every fact exactly "
                f"the same. Do not add, remove, or change any information. Output only the "
                f"rewritten text:\n\n{translate_source}"
            )
    elif is_wiki and kb_answer:
        wiki_context = kb_assamese or kb_answer
        final_prompt = (
            f"Relevant Wikipedia content (use this to answer):\n\n"
            f"{wiki_context}\n\n"
            f"{hist_block}User Question: {prompt}\n\n"
            f"Answer the question using the Wikipedia content above. Keep your answer "
            f"natural, conversational, and focused on what the user asked — do not "
            f"dump the entire passage. Reply in natural Assamese (অসমীয়া)."
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
            and USE_INDICTRANS and not (is_wiki and kb_answer)):
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

                    # Safety: on web-search answers Gemini sometimes drifts
                    # out of Assamese because its grounding chunks are in
                    # English. If Assamese was requested but the reply has
                    # almost no Assamese/Bengali script characters, ask Groq
                    # to rewrite it faithfully in Assamese while keeping every
                    # fact (and source list) intact.
                    if web_search and language == 'assamese':
                        # Count characters in the Assamese/Bengali script range.
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
        return JsonResponse({
            'success': True,
            'username': user.username,
            'is_staff': bool(user.is_staff),
        })
    else:
        return JsonResponse({'error': 'Invalid username or password'}, status=400)


def logout_api_view(request):
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


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
# Image generation via Cloudflare Workers AI + Pollinations.ai fallback.
# ---------------------------------------------------------------------------
_CF_API_TOKEN = os.getenv('CF_API_TOKEN', '').strip()
_CF_ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID', '').strip()

# Model constants for Cloudflare Workers AI
_CF_MODEL_FLUX_SCHNELL = '@cf/black-forest-labs/flux-1-schnell'
_CF_MODEL_SDXL_LIGHTNING = '@cf/bytedance/stable-diffusion-xl-lightning'
_CF_MODEL_SDXL_BASE = '@cf/stabilityai/stable-diffusion-xl-base-1.0'

_IMGGEN_RATE_LIMIT = int(os.getenv('IMGGEN_RATE_LIMIT', '6'))
_IMGGEN_RATE_WINDOW = int(os.getenv('IMGGEN_RATE_WINDOW', '60'))
_IMGGEN_HITS = {}
_IMGGEN_TIMEOUT = int(os.getenv('IMGGEN_TIMEOUT', '60'))
_IMGGEN_DAILY_LIMIT = int(os.getenv('IMGGEN_DAILY_LIMIT', '5'))
_IMGGEN_DAILY_HITS = {}   # ip -> {'date': 'YYYY-MM-DD', 'count': int}


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


def _translate_prompt_for_image(prompt):
    """Rewrite an arbitrary-language prompt into a clean English image-gen
    prompt. Returns (english_prompt, was_translated:bool)."""
    if not prompt or not prompt.strip():
        return '', False
    prompt = prompt.strip()
    if _looks_like_english(prompt):
        return prompt, False
    system = (
        "You rewrite image-generation prompts into clear, natural ENGLISH. "
        "The user may write in English, Hindi, Assamese, Hinglish, or Roman-"
        "Hindi/Assamese. Translate the meaning faithfully, keep it concise "
        "(under 60 words), and phrase it as a visual scene description "
        "suitable for a text-to-image model. Output ONLY the English prompt, "
        "no quotes, no preface, no explanation."
    )
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


def _imggen_daily_count(ip):
    """How many images this IP has generated today (UTC calendar day)."""
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    entry = _IMGGEN_DAILY_HITS.get(ip)
    if not entry or entry.get('date') != today:
        return 0
    return int(entry.get('count', 0))


def _imggen_daily_incr(ip):
    """Record one successful generation against the IP's daily bucket."""
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    entry = _IMGGEN_DAILY_HITS.get(ip)
    if not entry or entry.get('date') != today:
        entry = {'date': today, 'count': 0}
    entry['count'] = int(entry.get('count', 0)) + 1
    _IMGGEN_DAILY_HITS[ip] = entry


def _imggen_rate_limited(ip):
    now = time.time()
    hits = [t for t in _IMGGEN_HITS.get(ip, []) if now - t < _IMGGEN_RATE_WINDOW]
    if len(hits) >= _IMGGEN_RATE_LIMIT:
        _IMGGEN_HITS[ip] = hits
        return True
    hits.append(now)
    _IMGGEN_HITS[ip] = hits
    return False


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
    ip = _client_ip(request)
    is_premium, plan_name, _ = _check_user_premium_status(request)
    used_today = _imggen_daily_count(ip)
    user = getattr(request, 'user', None)
    is_auth = bool(user and getattr(user, 'is_authenticated', False))

    if is_premium:
        daily_limit = 100 if 'pro' in plan_name else (50 if 'starter' in plan_name else 500)
        models_config = {
            'normal': {
                'id': 'SDXL Turbo',
                'name': 'Normal (SDXL Turbo)',
                'desc': 'Fast Generation · ~2-4 s · SDXL Turbo',
            },
            'extreme': {
                'id': 'SDXL 1.0',
                'name': 'Extreme Quality (SDXL 1.0)',
                'desc': 'Master Fidelity · ~8-12 s · SDXL 1.0 Base',
            },
        }
    else:
        daily_limit = _IMGGEN_DAILY_LIMIT
        models_config = {
            'normal': {
                'id': 'FLUX.1 Schnell',
                'name': 'Normal (FLUX.1 Schnell)',
                'desc': 'Fast · ~3-8 s · FLUX.1 Schnell on Cloudflare',
            },
            'extreme': {
                'id': 'SDXL Turbo',
                'name': 'Extreme Quality (SDXL Turbo)',
                'desc': 'High Speed & Clarity · ~2-5 s · SDXL Turbo',
            },
        }

    return JsonResponse({
        'is_authenticated': is_auth,
        'username': getattr(user, 'username', '') if is_auth else '',
        'is_staff': bool(getattr(user, 'is_staff', False)) if is_auth else False,
        'is_premium': is_premium,
        'plan_name': plan_name,
        'daily_limit': daily_limit,
        'used_today': used_today,
        'remaining_today': max(0, daily_limit - used_today),
        'models': models_config,
    })


@csrf_exempt
def generate_image_api(request):
    """
    POST JSON: {prompt, quality?: 'normal'|'extreme', width?, height?, negative_prompt?, seed?}.
    
    Plan-Based Model Architecture:
      - Free Plan (IP-based limit: 5 images/day):
          * Normal: FLUX.1 Schnell (Cloudflare @cf/black-forest-labs/flux-1-schnell, fallback: Pollinations flux)
          * Extreme: SDXL Turbo (Cloudflare @cf/bytedance/stable-diffusion-xl-lightning, fallback: Pollinations turbo)
      - Premium Plan:
          * Normal: SDXL Turbo (Fast)
          * Extreme: SDXL 1.0 (Cloudflare @cf/stabilityai/stable-diffusion-xl-base-1.0, fallback: Pollinations sdxl)
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    ip = _client_ip(request)
    is_premium, plan_name, _ = _check_user_premium_status(request)

    # 1) Quota verification:
    # Free users are capped at 5 images/day per IP. Premium users have elevated quotas.
    used_today = _imggen_daily_count(ip)
    daily_cap = 100 if is_premium else _IMGGEN_DAILY_LIMIT
    if not is_premium and used_today >= _IMGGEN_DAILY_LIMIT:
        return JsonResponse({
            'error': (
                f"You have used all {_IMGGEN_DAILY_LIMIT} free images for today from this device. "
                f"Please upgrade to Premium for high-speed generation with SDXL 1.0!"
            ),
            'daily_limit': _IMGGEN_DAILY_LIMIT,
            'used_today': used_today,
            'is_premium': False,
        }, status=429)

    # 2) Rate-limit burst protection (max 6 requests / 60s)
    if _imggen_rate_limited(ip):
        return JsonResponse({
            'error': f'Too many requests. Please wait ~{_IMGGEN_RATE_WINDOW}s before generating again.',
        }, status=429)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    original_prompt = (payload.get('prompt') or '').strip()
    if not original_prompt:
        return JsonResponse({'error': 'Prompt is required.'}, status=400)
    if len(original_prompt) > 1000:
        return JsonResponse({'error': 'Prompt exceeds 1000 characters.'}, status=400)

    # Translate prompt to clean visual English via Groq if non-English
    prompt, was_translated = _translate_prompt_for_image(original_prompt)

    # Clamp geometry defensively (256 - 1536px, multiples of 8)
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

    # 3) Determine exact AI Model routing based on User Tier & Quality selection:
    if not is_premium:
        # FREE PLAN:
        # Normal -> FLUX.1 Schnell | Extreme -> SDXL Turbo
        if quality == 'extreme':
            cf_model = _CF_MODEL_SDXL_LIGHTNING
            poll_model = 'turbo'
            display_model_name = 'SDXL Turbo'
        else:
            cf_model = _CF_MODEL_FLUX_SCHNELL
            poll_model = 'flux'
            display_model_name = 'FLUX.1 Schnell'
    else:
        # PREMIUM PLAN:
        # Normal -> SDXL Turbo | Extreme -> SDXL 1.0 Base
        if quality == 'extreme':
            cf_model = _CF_MODEL_SDXL_BASE
            poll_model = 'sdxl'
            display_model_name = 'SDXL 1.0 (Master Ultra Quality)'
        else:
            cf_model = _CF_MODEL_SDXL_LIGHTNING
            poll_model = 'turbo'
            display_model_name = 'SDXL Turbo'

    t0 = time.time()
    engine = None
    engine_model = None
    pil_img = None
    tried_errors = []

    # Primary: Cloudflare Workers AI
    if _CF_API_TOKEN and _CF_ACCOUNT_ID:
        cf_img, cf_info = _cloudflare_generate_image(
            prompt, width, height, model=cf_model, timeout=_IMGGEN_TIMEOUT)
        if cf_img is not None:
            pil_img = cf_img
            engine = 'cloudflare'
            engine_model = display_model_name
        else:
            tried_errors.append(f'Cloudflare ({cf_model}): {cf_info}')

    # Secondary: Pollinations.ai with matching model fallback
    if pil_img is None:
        pl_img, pl_info = _pollinations_generate_image(
            prompt, width, height, model=poll_model, timeout=_IMGGEN_TIMEOUT)
        if pl_img is not None:
            pil_img = pl_img
            engine = 'pollinations'
            engine_model = f'{display_model_name} (Pollinations)'
        else:
            tried_errors.append(f'Pollinations ({poll_model}): {pl_info}')

    if pil_img is None:
        return JsonResponse({
            'error': 'Image generation failed. ' + ' | '.join(tried_errors),
        }, status=502)

    # Success: record against daily bucket
    _imggen_daily_incr(ip)
    used_after = _imggen_daily_count(ip)

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


