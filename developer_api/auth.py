import time
from functools import wraps
from django.http import JsonResponse
from django.core.cache import cache
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

        # Lookup key in DB (cached in Redis/Local Cache for 60s for speed)
        cache_key = f"api_key_lookup:{key_str}"
        key_id = cache.get(cache_key)
        
        api_key = None
        if key_id:
            try:
                api_key = DeveloperApiKey.objects.get(id=key_id, is_active=True)
            except DeveloperApiKey.DoesNotExist:
                cache.delete(cache_key)

        if not api_key:
            try:
                api_key = DeveloperApiKey.objects.get(key=key_str, is_active=True)
                cache.set(cache_key, api_key.id, timeout=120)
            except DeveloperApiKey.DoesNotExist:
                return openai_error_response(
                    f"Incorrect API key provided: {key_str[:12]}...",
                    error_type="authentication_error",
                    code="invalid_api_key",
                    status=401
                )

        # Rate Limit check (per minute window in cache)
        minute_window = int(time.time() // 60)
        rate_key = f"rate_limit:{api_key.id}:{minute_window}"
        current_reqs = cache.get(rate_key, 0)
        
        if current_reqs >= api_key.rate_limit_per_minute:
            return openai_error_response(
                f"Rate limit exceeded: You are allowed {api_key.rate_limit_per_minute} requests per minute on your {api_key.tier} tier.",
                error_type="requests",
                code="rate_limit_exceeded",
                status=429
            )
            
        cache.set(rate_key, current_reqs + 1, timeout=70)

        # Monthly Quota check
        if not api_key.has_quota():
            return openai_error_response(
                f"You have exhausted your monthly quota ({api_key.monthly_quota} requests). Please upgrade your plan at https://aiaxom.co.in",
                error_type="insufficient_quota",
                code="quota_exceeded",
                status=429
            )

        # Record usage
        api_key.record_usage()
        
        # Attach to request for view to use if needed
        request.developer_api_key = api_key

        return view_func(request, *args, **kwargs)

    return wrapped_view
