import time
import uuid
import logging
from datetime import datetime, timezone
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Strict IP & Device Rate Limiting & Security Configuration
# ---------------------------------------------------------------------------
WEBSEARCH_DAILY_LIMIT = 5   # Hard cap: Exactly max 5 web searches per day per IP/device
WEBSEARCH_BURST_LIMIT = 2   # Max 2 searches per 20 seconds
WEBSEARCH_BURST_WINDOW = 20 # seconds

_WEBSEARCH_DAILY_MEM = {}   # {ip: {'date': 'YYYY-MM-DD', 'count': int}}
_WEBSEARCH_BURST_MEM = {}   # {ip: [timestamp, ...]}


def get_client_ip(request) -> str:
    """Extract real client IP behind reverse proxy / Nginx."""
    fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    if fwd:
        # e.g. "203.0.113.195, 70.41.3.18, 150.172.238.178" -> client is first
        ip = fwd.split(',')[0].strip()
        if ip:
            return ip
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


def get_device_id(request, fallback_body=None) -> str:
    """
    Extract or generate a consistent hardware/browser device identifier.
    Priority:
    1. HTTP Header 'X-Device-Id'
    2. Cookie 'axom_device_uid'
    3. Body payload 'device_id'
    4. Generated unique device token
    """
    device_id = (
        request.headers.get('X-Device-Id', '').strip()
        or request.COOKIES.get('axom_device_uid', '').strip()
    )
    if not device_id and isinstance(fallback_body, dict):
        device_id = str(fallback_body.get('device_id', '')).strip()

    if not device_id:
        device_id = uuid.uuid4().hex
    return device_id[:128]


# ---------------------------------------------------------------------------
# Web Search IP Limits (Strictly 5 per day)
# ---------------------------------------------------------------------------

def get_websearch_daily_count(ip: str) -> int:
    """Returns number of web searches done today from this IP address."""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    cache_key = f"ws_ip_daily:{today}:{ip}"
    
    # 1. Check Django cache
    val = cache.get(cache_key)
    if val is not None:
        try:
            return int(val)
        except (ValueError, TypeError):
            pass

    # 2. Check memory fallback
    entry = _WEBSEARCH_DAILY_MEM.get(ip)
    if entry and entry.get('date') == today:
        return int(entry.get('count', 0))
    return 0


def increment_websearch_daily_count(ip: str) -> int:
    """Increment today's search counter for this IP in cache and memory."""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    cache_key = f"ws_ip_daily:{today}:{ip}"
    
    # Update memory
    entry = _WEBSEARCH_DAILY_MEM.get(ip)
    if not entry or entry.get('date') != today:
        entry = {'date': today, 'count': 0}
    entry['count'] = int(entry.get('count', 0)) + 1
    _WEBSEARCH_DAILY_MEM[ip] = entry
    new_count = entry['count']

    # Update Django cache with 86400s (24h) TTL
    try:
        if cache.get(cache_key) is None:
            cache.set(cache_key, new_count, timeout=86400)
        else:
            try:
                cache.incr(cache_key)
            except Exception:
                cache.set(cache_key, new_count, timeout=86400)
    except Exception:
        pass

    return new_count


def is_websearch_burst_limited(ip: str) -> bool:
    """Sliding-window burst limiter: max 2 searches per 20 seconds."""
    now = time.time()
    hits = [t for t in _WEBSEARCH_BURST_MEM.get(ip, []) if now - t < WEBSEARCH_BURST_WINDOW]
    if len(hits) >= WEBSEARCH_BURST_LIMIT:
        _WEBSEARCH_BURST_MEM[ip] = hits
        return True
    hits.append(now)
    _WEBSEARCH_BURST_MEM[ip] = hits
    return False


# ---------------------------------------------------------------------------
# Device & IP Multi-Account Registration Protection
# "same device se user multiple accounts bana nahi sakte"
# ---------------------------------------------------------------------------

def check_device_registration_allowed(ip: str, device_id: str = "") -> tuple[bool, str]:
    """
    Checks whether creating a new account is permitted from this IP and device.
    Strict Rule: Only 1 account is permitted per device / IP address.
    Returns: (is_allowed: bool, error_message: str)
    """
    clean_ip = (ip or "").strip()
    clean_dev = (device_id or "").strip()

    # 1. Check persistent cache flags
    if clean_dev:
        cached_user_dev = cache.get(f"registered_device:{clean_dev}")
        if cached_user_dev:
            return (
                False,
                "এই ডিভাইচৰ পৰা ইতিমধ্যে এটা একাউণ্ট তৈয়াৰ কৰা হৈছে। একে ডিভাইচৰ পৰা একাধিক একাউণ্ট তৈয়াৰ কৰিব নোৱাৰি। অনুগ্ৰহ কৰি আপোনাৰ একাউণ্টত ল'গ ইন কৰক। "
                f"(An account ({cached_user_dev}) is already registered on this device. Multiple accounts from the same device are prohibited.)"
            )

    if clean_ip and clean_ip not in ('127.0.0.1', 'localhost', '::1'):
        cached_user_ip = cache.get(f"registered_ip:{clean_ip}")
        if cached_user_ip:
            return (
                False,
                "এই ইন্টাৰনেট নেটৱৰ্ক (IP) ৰ পৰা ইতিমধ্যে এটা একাউণ্ট তৈয়াৰ কৰা হৈছে। অনুগ্ৰহ কৰি আপোনাৰ বিদ্যমান একাউণ্টত প্ৰৱেশ কৰক। "
                f"(An account ({cached_user_ip}) has already been registered from this IP address. Only 1 account is permitted per device/IP.)"
            )

    # 2. Check Database DeviceRegistration table
    try:
        from userpanel.models import DeviceRegistration
        
        # Check by device ID
        if clean_dev:
            reg_dev = DeviceRegistration.objects.filter(device_id=clean_dev).select_related('user').first()
            if reg_dev:
                u_name = reg_dev.user.username if reg_dev.user else "User"
                cache.set(f"registered_device:{clean_dev}", u_name, timeout=86400 * 30)
                return (
                    False,
                    "এই ডিভাইচৰ পৰা ইতিমধ্যে এটা একাউণ্ট তৈয়াৰ কৰা হৈছে। একে ডিভাইচৰ পৰা একাধিক একাউণ্ট তৈয়াৰ কৰাৰ অনুমতি নাই। "
                    f"(An account is already associated with this device. Please sign in with your username: '{u_name}'.)"
                )

        # Check by IP address (excluding local dev IPs)
        if clean_ip and clean_ip not in ('127.0.0.1', 'localhost', '::1'):
            reg_ip = DeviceRegistration.objects.filter(ip_address=clean_ip).select_related('user').first()
            if reg_ip:
                u_name = reg_ip.user.username if reg_ip.user else "User"
                cache.set(f"registered_ip:{clean_ip}", u_name, timeout=86400 * 30)
                return (
                    False,
                    "এই IP ঠিকনাৰ পৰা ইতিমধ্যে একাউণ্ট পঞ্জীয়ন কৰা হৈছে। প্ৰতিটো ডিভাইচ বা IP ৰ পৰা মাত্ৰ ১ টা একাউণ্টৰ অনুমতি দিয়া হৈছে। "
                    f"(Only 1 account per device/IP is allowed. An account is already registered from this IP. Please sign in to your account.)"
                )

    except Exception as e:
        logger.warning("Error checking DeviceRegistration model: %s", e)

    return (True, "")


def record_device_registration(user, ip: str, device_id: str = "", user_agent: str = "") -> None:
    """Records the device and IP for this user so subsequent account creations are blocked."""
    clean_ip = (ip or "").strip()
    clean_dev = (device_id or "").strip()
    clean_ua = (user_agent or "")[:500]

    # 1. Update cache immediately
    if clean_dev:
        cache.set(f"registered_device:{clean_dev}", user.username, timeout=86400 * 365)
    if clean_ip and clean_ip not in ('127.0.0.1', 'localhost', '::1'):
        cache.set(f"registered_ip:{clean_ip}", user.username, timeout=86400 * 365)

    # 2. Persist to DB table
    try:
        from userpanel.models import DeviceRegistration
        DeviceRegistration.objects.create(
            user=user,
            ip_address=clean_ip or "127.0.0.1",
            device_id=clean_dev,
            user_agent=clean_ua,
        )
    except Exception as e:
        logger.warning("Failed to record DeviceRegistration in DB: %s", e)
