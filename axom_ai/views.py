import os
import json
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from knowledge.utils import search_knowledge_base, find_instant_answer, semantic_find_answer

# Global HTTP Session for connection pooling & ultra-fast API calls
http_session = requests.Session()

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

    try:
        data = json.loads(request.body.decode('utf-8'))
        prompt = data.get('prompt', '').strip()
        web_search = data.get('web_search', False)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not prompt:
        return JsonResponse({'error': 'Prompt cannot be empty'}, status=400)

    import re

    # 1. System prompt — general-purpose AI assistant (ChatGPT / DeepSeek style).
    system_instruction = (
        "You are Axom AI, a helpful, knowledgeable, and friendly general-purpose AI assistant. "
        "You can answer questions and help with any topic, including history, science, mathematics, "
        "programming and code, general knowledge, writing, reasoning, and everyday advice. "
        "Give clear, accurate, and well-structured answers. Use Markdown formatting (headings, bullet "
        "points, and code blocks) where it improves readability. If you are unsure about something, say so "
        "honestly instead of making up facts. When internal database context is provided, prefer it and "
        "cite the relevant details from it."
    )

    if not web_search:
        # 2a. INSTANT ANSWER: exact/near keyword match to a stored Q&A → verbatim
        #     answer immediately (no model, no latency).
        instant = find_instant_answer(prompt)
        if instant:
            return JsonResponse({
                'response': instant, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'instant',
            })

        # 2b. SEMANTIC ANSWER: match the question by MEANING (embeddings) — catches
        #     different wording/language ("New Year" ↔ "Bihu"). Returns the stored
        #     answer verbatim, so it is always factually consistent with the data.
        sem_answer, sem_score = semantic_find_answer(prompt)
        if sem_answer:
            return JsonResponse({
                'response': sem_answer, 'from_database': True, 'source_docs': [],
                'web_search': False, 'sources': [], 'engine': 'semantic',
            })

    # 2c. Keyword chunk search (mainly for PDF/free-text docs without Q&A pairs).
    if web_search:
        custom_context, source_docs = "", []
    else:
        custom_context, source_docs = search_knowledge_base(prompt, top_k=1)

    # 3. Optional strict gate (off by default so greetings / general chat still work):
    #    only blocks answers when explicitly enabled AND nothing relevant was found.
    if (not web_search) and (not custom_context) and STRICT_KB_MODE:
        return JsonResponse({
            'response': DONT_KNOW_MSG, 'from_database': False, 'source_docs': [],
            'web_search': False, 'sources': [], 'engine': 'no-answer',
        })

    # 4. Formulate prompt. With DB context, force the model to answer ONLY from that
    #    context and to say "don't know" rather than guess or combine facts.
    if custom_context:
        final_prompt = (
            f"{system_instruction}\n\n"
            f"Answer the user's question using ONLY the context below. Do NOT use any "
            f"outside knowledge and do NOT combine unrelated facts. If the answer is not "
            f"clearly present in the context, reply EXACTLY with this and nothing else:\n"
            f"\"{DONT_KNOW_MSG}\"\n\n"
            f"Context:\n----------------------------------------\n"
            f"{custom_context}\n"
            f"----------------------------------------\n\n"
            f"User Question: {prompt}\n\nAnswer (from the context only):"
        )
    else:
        final_prompt = f"{system_instruction}\n\nUser Question: {prompt}"

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
                            yield chunk
                        if obj.get('done'):
                            break
                finally:
                    ollama_res.close()

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
