import json
import time
import uuid
import urllib.request
import urllib.error
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache

from .auth import require_developer_api_key, openai_error_response
from .models import DeveloperApiKey

AVAILABLE_MODELS = [
    {
        "id": "axom-indic-1",
        "object": "model",
        "created": 1730000000,
        "owned_by": "axom-ai",
        "permission": [],
        "root": "axom-indic-1",
        "description": "Primary Assamese, Hindi, and English high-reasoning multimodal model"
    },
    {
        "id": "axom-fast",
        "object": "model",
        "created": 1730000000,
        "owned_by": "axom-ai",
        "permission": [],
        "root": "axom-fast",
        "description": "Ultra low-latency Llama-3/Groq powered chat engine"
    },
    {
        "id": "axom-pro",
        "object": "model",
        "created": 1730000000,
        "owned_by": "axom-ai",
        "permission": [],
        "root": "axom-pro",
        "description": "Google Gemini 2.5 Flash / Pro reasoning engine"
    }
]

@csrf_exempt
def v1_models(request):
    """
    Standard OpenAI-compatible GET /v1/models endpoint
    """
    if request.method != 'GET':
        return openai_error_response("Method not allowed", status=405)
    return JsonResponse({
        "object": "list",
        "data": AVAILABLE_MODELS
    })

@csrf_exempt
@require_developer_api_key
def v1_chat_completions(request):
    """
    Standard OpenAI-compatible POST /v1/chat/completions
    """
    if request.method != 'POST':
        return openai_error_response("Only POST method is allowed", status=405)

    try:
        body = json.loads(request.body.decode('utf-8'))
    except Exception:
        return openai_error_response("Invalid JSON body in request", status=400)

    messages = body.get('messages', [])
    if not messages or not isinstance(messages, list):
        return openai_error_response("'messages' is a required array field", status=400)

    model_name = body.get('model', 'axom-indic-1')
    temperature = body.get('temperature', 0.7)

    # Extract last user message
    user_prompt = ""
    for msg in reversed(messages):
        if msg.get('role') == 'user':
            user_prompt = msg.get('content', '')
            break

    if not user_prompt:
        return openai_error_response("No user message found in 'messages'", status=400)

    # Detect language preference from messages or prompt
    language = "assamese"
    raw_lang = body.get('language')
    if raw_lang:
        language = str(raw_lang).lower()

    # Call Axom AI internal Brain on port 8000
    reply_content = ""
    try:
        chat_url = "http://127.0.0.1:8000/api/chat/"
        chat_payload = {
            "prompt": user_prompt,
            "language": language,
            "client_id": f"api_{request.developer_api_key.key[:10]}"
        }
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(chat_url, data=json.dumps(chat_payload).encode('utf-8'), headers=headers, method='POST')
        
        with urllib.request.urlopen(req, timeout=40) as resp:
            resp_bytes = resp.read()
            resp_str = resp_bytes.decode('utf-8', errors='replace').strip()
            try:
                chat_data = json.loads(resp_str)
                reply_content = chat_data.get('response') or chat_data.get('message') or resp_str
            except Exception:
                reply_content = resp_str
    except Exception as e:
        reply_content = f"Axom AI Response: Apologies, inference temporary error: {str(e)}"

    # Estimate token counts
    prompt_tokens = max(1, len(user_prompt.split()))
    completion_tokens = max(1, len(reply_content.split()))
    total_tokens = prompt_tokens + completion_tokens

    completion_id = f"chatcmpl-axom-{uuid.uuid4().hex[:12]}"
    created_ts = int(time.time())

    # Return standard OpenAI specification
    return JsonResponse({
        "id": completion_id,
        "object": "chat.completion",
        "created": created_ts,
        "model": model_name,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": reply_content
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens
        }
    })

@csrf_exempt
@require_developer_api_key
def v1_translate(request):
    """
    POST /v1/translate
    Body: {"text": "...", "source_lang": "en", "target_lang": "as"}
    """
    if request.method != 'POST':
        return openai_error_response("Only POST method is allowed", status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        text = data.get('text', '').strip()
        source_lang = data.get('source_lang', 'en').lower()
        target_lang = data.get('target_lang', 'as').lower()
    except Exception:
        return openai_error_response("Invalid JSON body", status=400)

    if not text:
        return openai_error_response("'text' cannot be empty", status=400)

    # Prompt translation via Axom AI Engine
    prompt = f"Translate the following text from {source_lang} to {target_lang} with high linguistic accuracy and natural phrasing. Do not add explanations:\n\n{text}"
    
    try:
        chat_url = "http://127.0.0.1:8000/api/chat/"
        chat_payload = {"prompt": prompt, "language": "assamese"}
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(chat_url, data=json.dumps(chat_payload).encode('utf-8'), headers=headers, method='POST')
        
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_str = resp.read().decode('utf-8', errors='replace').strip()
            try:
                chat_data = json.loads(resp_str)
                translated = chat_data.get('response') or resp_str
            except Exception:
                translated = resp_str
    except Exception as e:
        translated = f"Translation error: {str(e)}"

    return JsonResponse({
        "success": True,
        "source_lang": source_lang,
        "target_lang": target_lang,
        "original_text": text,
        "translated_text": translated
    })

@csrf_exempt
def manage_keys_api(request):
    """
    Protected endpoint: API key generation and management requires authenticated user login.
    All developers must generate and manage keys via the Developer Console at https://user.aiaxom.co.in
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            "error": {
                "message": "Authentication required. Please sign in to the Axom AI Developer Console at https://user.aiaxom.co.in to generate and manage your secret keys.",
                "type": "authentication_error",
                "code": "login_required"
            }
        }, status=401)

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            name = data.get('name', 'Production API Key')
            tier = data.get('tier', 'free')
            email = data.get('email', '')
        except Exception:
            name = 'Production API Key'
            tier = 'free'
            email = ''

        quotas = {
            'free': 1000,
            'developer': 25000,
            'business': 100000,
            'enterprise': 1000000
        }
        monthly_quota = quotas.get(tier, 1000)

        new_key = DeveloperApiKey.objects.create(
            user=request.user,
            name=name,
            tier=tier,
            owner_email=request.user.email or email,
            monthly_quota=monthly_quota
        )

        return JsonResponse({
            "success": True,
            "message": "New Developer API Key generated successfully",
            "api_key": {
                "id": new_key.id,
                "name": new_key.name,
                "key": new_key.key,
                "tier": new_key.tier,
                "monthly_quota": new_key.monthly_quota,
                "created_at": new_key.created_at.isoformat()
            }
        })

    elif request.method == 'GET':
        if request.user.is_staff or request.user.is_superuser:
            keys = DeveloperApiKey.objects.all().order_by('-created_at')[:50]
        else:
            keys = DeveloperApiKey.objects.filter(user=request.user).order_by('-created_at')[:50]
        out = []
        for k in keys:
            out.append({
                "id": k.id,
                "name": k.name,
                "key_preview": f"{k.key[:16]}...{k.key[-4:]}",
                "tier": k.tier,
                "monthly_quota": k.monthly_quota,
                "current_usage": k.current_usage,
                "is_active": k.is_active,
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None
            })
        return JsonResponse({"keys": out})

    return JsonResponse({"error": "Method not allowed"}, status=405)
