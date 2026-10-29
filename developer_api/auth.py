import time
import hashlib
from functools import wraps
from django.http import JsonResponse
from django.core.cache import cache
from django.db.models import Q
from .models import DeveloperApiKey

def openai_error_response(message, error_type="invalid_request_error", code=None, status=400):
    return JsonResponse({
        "error": {
            "message": message,
            "type": error_type,
            "param": None,
            "code": code
        }
    }, status=status)

def extract_api_key(request):
    auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION') or ''
    if auth_header.startswith('Bearer '):
        return auth_header[7:].strip()
    
    # Also support X-Api-Key
    x_api_key = request.headers.get('X-Api-Key') or request.META.get('HTTP_X_API_KEY') or ''
    if x_api_key:
        return x_api_key.strip()
        
    return None

def require_developer_api_key(view_func):
    """
    Middleware decorator that enforces API key authentication, rate-limiting, and quota tracking.
    Now includes:
    - Cryptographic SHA-256 token hash lookup (zero plaintext leakage)
    - Dual lookup backward compatibility for existing keys
    - Inactive / deactivated user account checks (preventing zombie keys)
    - IP address whitelisting enforcement
    - Endpoint scope (chat vs translate) authorization
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        key_str = extract_api_key(request)
        if not key_str:
            return openai_error_response(
                "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. 'Authorization: Bearer YOUR_KEY')",
                error_type="invalid_request_error",
                code="missing_api_key",
                status=401
            )

        # Hash key for secure lookup
        token_hash = hashlib.sha256(key_str.encode('utf-8')).hexdigest()
        cache_key = f"api_key_lookup:{token_hash}"
        key_id = cache.get(cache_key)
        
        api_key = None
        if key_id:
            try:
                api_key = DeveloperApiKey.objects.select_related('user').get(id=key_id, is_active=True)
            except DeveloperApiKey.DoesNotExist:
                cache.delete(cache_key)

        if not api_key:
            # Dual lookup: check hashed_key first, fallback to legacy key field
            api_key = DeveloperApiKey.objects.filter(
                Q(hashed_key=token_hash) | Q(key=key_str),
                is_active=True
            ).select_related('user').first()
            
            if not api_key:
                return openai_error_response(
                    f"Incorrect API key provided: {key_str[:12]}...",
                    error_type="authentication_error",
                    code="invalid_api_key",
                    status=401
                )
            # Cache the lookup
            cache.set(cache_key, api_key.id, timeout=120)

        # 1. Inactive / Deleted User check (prevents zombie keys from deleted accounts)
        if api_key.user and not api_key.user.is_active:
            return openai_error_response(
                "The user account associated with this API key is inactive or deleted.",
                error_type="authentication_error",
                code="account_inactive",
                status=401
            )

        # 2. IP Restriction Whitelist check
        from axom_ai.security import get_client_ip
        client_ip = (get_client_ip(request) or '127.0.0.1')[:64]
        
        if api_key.allowed_ips:
            allowed_ips = [ip.strip() for ip in api_key.allowed_ips.split(',') if ip.strip()]
            if allowed_ips and client_ip not in allowed_ips:
                return openai_error_response(
                    f"Access denied: Client IP '{client_ip}' is not authorized to use this API key.",
                    error_type="permission_error",
                    code="ip_forbidden",
                    status=403
                )

        # 3. Endpoint Scope / Permission check
        req_path = request.path.lower()
        if api_key.permissions == 'chat' and ('/translate' in req_path):
            return openai_error_response(
                "Access denied: This API key is restricted to Chat completions only.",
                error_type="permission_error",
                code="insufficient_scope",
                status=403
            )
        elif api_key.permissions == 'translate' and ('/chat/' in req_path):
            return openai_error_response(
                "Access denied: This API key is restricted to Translation endpoints only.",
                error_type="permission_error",
                code="insufficient_scope",
                status=403
            )

        # 4. Rate Limit check (per minute window in cache)
        minute_window = int(time.time() // 60)
        is_demo_key = (api_key.key and api_key.key.startswith('sk_live_axom_demo_')) or (api_key.key_prefix and 'demo' in api_key.key_prefix)
        if is_demo_key:
            # Strictly limit demo key per IP: 5 requests per minute
            rate_key = f"rate_limit:demo:{client_ip}:{minute_window}"
            rate_limit = 5
        else:
            rate_key = f"rate_limit:{api_key.id}:{minute_window}"
            rate_limit = api_key.rate_limit_per_minute
        
        current_reqs = cache.get(rate_key, 0)
        
        if current_reqs >= rate_limit:
            if is_demo_key:
                return openai_error_response(
                    "Demo Rate Limit Exceeded: The public sandbox demo key is strictly limited to 5 requests per minute per IP. Please sign in to the Axom AI Developer Console at https://user.aiaxom.co.in to generate your own free personal API key with 1,000 monthly requests.",
                    error_type="requests",
                    code="demo_rate_limit_exceeded",
                    status=429
                )
            try:
                from developer_api.models import DeveloperApiRequestLog
                DeveloperApiRequestLog.objects.create(
                    api_key=api_key,
                    user=api_key.user,
                    endpoint=request.path_info,
                    method=request.method,
                    model_name='axom-indic-1',
                    status_code=429,
                    ip_address=client_ip,
                    tokens_used=0,
                    latency_ms=1,
                )
            except Exception:
                pass
            return openai_error_response(
                f"Rate limit exceeded: You are allowed {api_key.rate_limit_per_minute} requests per minute on your {api_key.tier} tier.",
                error_type="requests",
                code="rate_limit_exceeded",
                status=429
            )
            
        cache.set(rate_key, current_reqs + 1, timeout=70)

        # 5. Monthly Quota check (bypassed for public demo key which has per-minute IP throttling)
        if not is_demo_key and not api_key.has_quota():
            try:
                from developer_api.models import DeveloperApiRequestLog
                DeveloperApiRequestLog.objects.create(
                    api_key=api_key,
                    user=api_key.user,
                    endpoint=request.path_info,
                    method=request.method,
                    model_name='axom-indic-1',
                    status_code=429,
                    ip_address=client_ip,
                    tokens_used=0,
                    latency_ms=1,
                )
            except Exception:
                pass
            return openai_error_response(
                f"You have exhausted your monthly quota ({api_key.monthly_quota} requests). Please upgrade your plan at https://aiaxom.co.in",
                error_type="insufficient_quota",
                code="quota_exceeded",
                status=429
            )

        # Record usage
        request.developer_api_start_time = time.time()
        api_key.record_usage()
        
        # Attach to request for view to use if needed
        request.developer_api_key = api_key

        response = view_func(request, *args, **kwargs)

        # Log successful developer API request
        try:
            latency = int((time.time() - getattr(request, 'developer_api_start_time', time.time())) * 1000)
            from developer_api.models import DeveloperApiRequestLog
            DeveloperApiRequestLog.objects.create(
                api_key=api_key,
                user=api_key.user,
                endpoint=request.path_info,
                method=request.method,
                model_name=getattr(request, 'developer_api_model_used', 'axom-indic-1'),
                status_code=getattr(response, 'status_code', 200),
                ip_address=client_ip,
                tokens_used=getattr(request, 'developer_api_tokens_used', 0),
                latency_ms=max(1, latency),
            )
        except Exception:
            pass

        return response

    return wrapped_view
