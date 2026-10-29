import os
import csv
import json
import time
import hashlib
from functools import wraps
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_POST

from payments.models import Payment, UserPlan, PLAN_CATALOG
from superadmin.models import CustomPlanOverride, SystemSetting, CouponCode, UserCustomQuota
from knowledge.models import ChatSession, ChatMessage
from developer_api.models import DeveloperApiKey, generate_key_string
from .models import (
    UserProfile,
    SupportTicket,
    TicketReply,
    UsageRecord,
    InAppNotification,
    DeviceRegistration,
    UserLoginAttempt,
)


def user_login_required(view_func):
    """
    Enforces authentication for userpanel pages.
    - Redirects cleanly to '/login/?next=...' when on user subdomain ('user.aiaxom.co.in' / 'user.aiaxom.local').
    - Ensures inactive/deactivated users are logged out immediately.
    - Requires verified email to access dashboard and features.
    """
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        host = request.get_host().split(':')[0].lower()
        from axom_ai.subdomain_middleware import USER_HOSTS
        is_user_host = host in USER_HOSTS
        
        if not request.user.is_authenticated:
            login_url = '/login/' if is_user_host else '/axomai-user/login/'
            current_path = request.path_info
            if is_user_host and current_path.startswith('/axomai-user'):
                clean_path = current_path[len('/axomai-user'):] or '/'
            else:
                clean_path = current_path
            return redirect(f"{login_url}?next={clean_path}")
            
        if not request.user.is_active:
            logout(request)
            login_url = '/login/' if is_user_host else '/axomai-user/login/'
            return redirect(login_url)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if not profile.is_email_verified:
            logout(request)
            login_url = '/login/' if is_user_host else '/axomai-user/login/'
            return redirect(f"{login_url}?unverified=1")
            
        return view_func(request, *args, **kwargs)
    return _wrapped


def _rate_limited(key: str, max_calls: int, per_seconds: int) -> bool:
    """Sliding-window rate limit backed by Django's cache."""
    now = time.time()
    hits = [t for t in (cache.get(key) or []) if t > now - per_seconds]
    if len(hits) >= max_calls:
        cache.set(key, hits, timeout=per_seconds + 5)
        return True
    hits.append(now)
    cache.set(key, hits, timeout=per_seconds + 5)
    return False


def _client_ip(request):
    """The visitor's address as nginx saw it (X-Real-IP); one shared, trusted helper: axom_ai.security.get_client_ip."""
    from axom_ai.security import get_client_ip
    return (get_client_ip(request) or '127.0.0.1')[:64]


def _sanitize_input(val, max_len=150):
    """Sanitize input against null bytes, control characters and length overflows."""
    if not val:
        return ''
    cleaned = str(val).replace('\x00', '').strip()
    return cleaned[:max_len]


def _get_active_lockout(ip, username):
    """Check if IP or username is currently locked out."""
    now = timezone.now()
    filters = Q(ip_address=ip)
    if username:
        filters |= Q(username=username)
    
    attempts = UserLoginAttempt.objects.filter(filters, is_locked=True)
    for record in attempts:
        if record.locked_until and record.locked_until > now:
            diff = record.locked_until - now
            seconds = max(0, int(diff.total_seconds()))
            hours = seconds // 3600
            mins = (seconds % 3600) // 60
            return {
                'is_locked': True,
                'record': record,
                'locked_until': record.locked_until,
                'hours': hours,
                'mins': mins,
                'seconds': seconds,
            }
        elif record.locked_until and record.locked_until <= now:
            # Lockout expired, automatically reset
            record.is_locked = False
            record.failed_count = 0
            record.locked_until = None
            record.save(update_fields=['is_locked', 'failed_count', 'locked_until', 'updated_at'])
            
    return {'is_locked': False}


def _record_failed_attempt(ip, username, user_agent):
    """Record a failed user login attempt and apply 24-hour lockout on 3rd failure."""
    now = timezone.now()
    record, _ = UserLoginAttempt.objects.get_or_create(
        ip_address=ip,
        defaults={'username': username, 'user_agent': user_agent[:500]}
    )
    
    if record.locked_until and record.locked_until <= now:
        record.failed_count = 0
        record.is_locked = False
        record.locked_until = None

    record.failed_count += 1
    record.username = username or record.username
    record.user_agent = user_agent[:500]
    record.last_failed_at = now

    if record.failed_count >= 3:
        record.is_locked = True
        record.locked_until = now + timedelta(days=1)
        record.save()
        return {
            'is_locked': True,
            'failed_count': record.failed_count,
            'remaining_attempts': 0,
            'locked_until': record.locked_until,
            'hours': 24,
            'mins': 0,
        }
    else:
        record.save()
        return {
            'is_locked': False,
            'failed_count': record.failed_count,
            'remaining_attempts': max(0, 3 - record.failed_count),
        }


def _clear_failed_attempts(ip, username):
    """Clear failed attempts upon successful login."""
    filters = Q(ip_address=ip)
    if username:
        filters |= Q(username=username)
    UserLoginAttempt.objects.filter(filters).update(
        failed_count=0,
        is_locked=False,
        locked_until=None
    )


def login_view(request):
    error = None
    host = request.get_host().split(':')[0].lower()
    from axom_ai.subdomain_middleware import USER_HOSTS
    is_user_host = host in USER_HOSTS
    default_home = '/' if is_user_host else '/axomai-user/'

    verified_banner = bool(request.GET.get('verified'))
    unverified_param = bool(request.GET.get('unverified'))

    if request.user.is_authenticated and request.user.is_active:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if profile.is_email_verified:
            return redirect(default_home)

    client_ip = _client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    lockout_info = None
    remaining_attempts = 3
    unverified_email = None

    if unverified_param:
        error = "Please verify your email address to access your developer console."

    # Check pre-existing IP lockout
    active_lock = _get_active_lockout(client_ip, '')
    if active_lock.get('is_locked'):
        lockout_info = active_lock
        h, m = active_lock['hours'], active_lock['mins']
        error = f"Security Lockout Active: Too many failed login attempts. This IP address is locked for 24 hours ({h}h {m}m remaining). For security, unauthorized brute force requests are blocked."
        return render(request, 'userpanel/login.html', {
            'error': error,
            'is_locked': True,
            'lockout_info': lockout_info,
            'remaining_attempts': 0,
            'client_ip': client_ip
        })

    if request.method == 'POST':
        raw_u = request.POST.get('username', '')
        raw_p = request.POST.get('password', '')
        
        u = _sanitize_input(raw_u, max_len=150)
        p = _sanitize_input(raw_p, max_len=256)

        # Check lockout on username specifically
        if u:
            user_lock = _get_active_lockout(client_ip, u)
            if user_lock.get('is_locked'):
                lockout_info = user_lock
                h, m = user_lock['hours'], user_lock['mins']
                error = f"Security Lockout Active: Account '{u}' is locked for 24 hours ({h}h {m}m remaining). Contact support at support@aiaxom.co.in."
                return render(request, 'userpanel/login.html', {
                    'error': error,
                    'is_locked': True,
                    'lockout_info': lockout_info,
                    'remaining_attempts': 0,
                    'client_ip': client_ip,
                    'last_username': u
                })

        user = authenticate(request, username=u, password=p) if (u and p) else None

        if user is None:
            fail_result = _record_failed_attempt(client_ip, u, user_agent)
            if fail_result.get('is_locked'):
                lockout_info = fail_result
                error = "🚨 Extreme Security Lockout: 3 consecutive failed login attempts detected. Your IP address and account have been LOCKED FOR 24 HOURS. All further attempts are automatically blocked."
                remaining_attempts = 0
                return render(request, 'userpanel/login.html', {
                    'error': error,
                    'is_locked': True,
                    'lockout_info': lockout_info,
                    'remaining_attempts': 0,
                    'client_ip': client_ip,
                    'last_username': u
                })
            else:
                rem = fail_result.get('remaining_attempts', 1)
                remaining_attempts = rem
                error = f"Invalid username or password. Warning: {rem} attempt{'s' if rem != 1 else ''} remaining before a mandatory 24-HOUR SECURITY LOCKOUT."
        elif not user.is_active:
            error = 'This account has been deactivated. Please contact support.'
        else:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.is_email_verified:
                unverified_email = user.email
                return render(request, 'userpanel/login.html', {
                    'error': None,
                    'unverified_email': unverified_email,
                    'is_locked': False,
                    'lockout_info': None,
                    'remaining_attempts': 3,
                    'client_ip': client_ip
                })

            _clear_failed_attempts(client_ip, u)
            login(request, user)
            UserProfile.objects.get_or_create(user=user)

            # Link any current session chats to this user
            if request.session.session_key:
                ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

            nxt = request.GET.get('next', default_home)
            if is_user_host and nxt.startswith('/axomai-user'):
                nxt = nxt[len('/axomai-user'):] or '/'
            return redirect(nxt)

    return render(request, 'userpanel/login.html', {
        'error': error,
        'verified': verified_banner,
        'unverified_email': unverified_email,
        'is_locked': False,
        'lockout_info': lockout_info,
        'remaining_attempts': remaining_attempts,
        'client_ip': client_ip
    })


def signup_view(request):
    host = request.get_host().split(':')[0].lower()
    from axom_ai.subdomain_middleware import USER_HOSTS
    is_user_host = host in USER_HOSTS
    default_home = '/' if is_user_host else '/axomai-user/'

    if request.user.is_authenticated and request.user.is_active:
        return redirect(default_home)

    from axom_ai.security import (
        get_client_ip,
        get_device_id,
        check_device_registration_allowed,
        record_device_registration,
    )
    import re
    import secrets

    ip = get_client_ip(request)
    device_id = get_device_id(request)
    error = None
    device_blocked = False

    # Pre-check device / IP restriction
    allowed, err_msg = check_device_registration_allowed(ip=ip, device_id=device_id)
    if not allowed:
        device_blocked = True
        error = err_msg

    if request.method == 'POST':
        if device_blocked:
            return render(request, 'userpanel/signup.html', {
                'error': error,
                'device_blocked': True,
            })

        u = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip().lower()
        p1 = request.POST.get('password', '')
        p2 = request.POST.get('confirm_password', '')

        # Rate limit signup attempts per IP
        if _rate_limited(f"user_signup_rate:{ip}", max_calls=5, per_seconds=3600):
            return render(request, 'userpanel/signup.html', {
                'error': 'Too many registration attempts. Please wait an hour or sign in.',
                'device_blocked': False,
            })

        if not u or len(u) < 3:
            error = 'Username must be at least 3 characters.'
        elif not re.match(r'^[a-zA-Z0-9_.-]+$', u):
            error = 'Username can only contain letters, numbers, dots, and underscores.'
        elif not email or not re.match(r'^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$', email):
            error = 'A valid email address is required for account verification and activation.'
        elif len(p1) < 6:
            error = 'Password must be at least 6 characters long.'
        elif p1 != p2:
            error = 'Passwords do not match.'
        elif User.objects.filter(username__iexact=u).exists():
            error = 'This username is already taken. Please choose another.'
        elif User.objects.filter(email__iexact=email).exists():
            error = 'An account with this email address already exists. Please sign in or use another email.'
        else:
            try:
                # Generate cryptographic verification token
                token = secrets.token_urlsafe(32)

                user = User.objects.create_user(
                    username=u,
                    email=email,
                    password=p1,
                )
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.is_email_verified = False
                profile.email_verification_token = token
                profile.email_verification_sent_at = timezone.now()
                profile.save(update_fields=['is_email_verified', 'email_verification_token', 'email_verification_sent_at', 'updated_at'])

                record_device_registration(
                    user=user,
                    ip=ip,
                    device_id=device_id,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )

                # Send verification email via Zoho SMTP
                from .emails import send_verification_email
                send_verification_email(user, token, request=request)

                response = render(request, 'userpanel/signup.html', {
                    'verification_sent': True,
                    'email': email,
                })
                response.set_cookie(
                    'axom_device_uid',
                    device_id,
                    max_age=315360000,
                    httponly=False,
                    samesite='Lax',
                )
                return response
            except Exception as e:
                error = f'An unexpected error occurred: {e}'

    return render(request, 'userpanel/signup.html', {
        'error': error,
        'device_blocked': device_blocked,
    })


def verify_email_view(request, token):
    """
    Verifies user's email address using the token sent to their inbox.
    Upon successful verification:
    - Marks profile.is_email_verified = True
    - Clears token
    - Activates user (is_active = True)
    - Auto logs the developer in
    - Redirects directly to the account dashboard ('/')
    """
    token = (token or '').strip()
    profile = UserProfile.objects.filter(email_verification_token=token).select_related('user').first()

    if not profile or not token:
        return render(request, 'userpanel/verify_result.html', {
            'success': False,
            'title': 'Invalid Verification Link',
            'message': 'This verification link is invalid, already used, or expired.',
            'can_resend': False
        })

    # Check 24-hour expiration
    now = timezone.now()
    if profile.email_verification_sent_at and (now - profile.email_verification_sent_at).total_seconds() > 86400:
        return render(request, 'userpanel/verify_result.html', {
            'success': False,
            'title': 'Verification Link Expired',
            'message': 'This verification link has expired (24-hour limit exceeded). Please click below to request a fresh link.',
            'can_resend': True,
            'email': profile.user.email
        })

    user = profile.user
    user.is_active = True
    user.save(update_fields=['is_active'])

    profile.is_email_verified = True
    profile.email_verification_token = ''
    profile.save(update_fields=['is_email_verified', 'email_verification_token', 'updated_at'])

    # Log user in
    login(request, user)

    if request.session.session_key:
        ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

    InAppNotification.objects.create(
        user=user,
        title="Email Verified",
        message="Your email address has been verified. Welcome to the Axom AI Developer Platform!",
        notif_type="success"
    )

    host = request.get_host().split(':')[0].lower()
    from axom_ai.subdomain_middleware import USER_HOSTS
    dest = '/?verified=1' if host in USER_HOSTS else '/axomai-user/?verified=1'
    return redirect(dest)


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_POST
def resend_verification_api(request):
    """
    API endpoint to resend an email verification link.
    Rate limited to 3 resends per hour per IP / email.
    """
    raw_email = ''
    if request.content_type == 'application/json':
        try:
            body = json.loads(request.body.decode('utf-8'))
            raw_email = body.get('email', '')
        except Exception:
            pass
    if not raw_email:
        raw_email = request.POST.get('email', '')

    email = _sanitize_input(raw_email, max_len=254).strip().lower()
    if not email:
        return JsonResponse({'success': False, 'error': 'Please provide a valid email address.'}, status=400)

    ip = _client_ip(request)
    if _rate_limited(f"resend_verify:{ip}:{email}", max_calls=3, per_seconds=3600):
        return JsonResponse({
            'success': False,
            'error': 'Too many verification emails requested. Please wait an hour before requesting again.'
        }, status=429)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return JsonResponse({
            'success': True,
            'message': 'If an account exists with this email, a new verification link has been sent.'
        })

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if profile.is_email_verified:
        return JsonResponse({
            'success': True,
            'message': 'This email address is already verified. You can sign in directly.'
        })

    import secrets
    new_token = secrets.token_urlsafe(32)
    profile.email_verification_token = new_token
    profile.email_verification_sent_at = timezone.now()
    profile.save(update_fields=['email_verification_token', 'email_verification_sent_at', 'updated_at'])

    from .emails import send_verification_email
    send_verification_email(user, new_token, request=request)

    return JsonResponse({
        'success': True,
        'message': f'A fresh verification link has been sent to {email}. Please check your inbox and spam folder.'
    })


def logout_view(request):
    logout(request)
    host = request.get_host().split(':')[0].lower()
    from axom_ai.subdomain_middleware import USER_HOSTS
    return redirect('/login/' if host in USER_HOSTS else '/axomai-user/login/')


def _get_user_limits(user):
    """Compute daily quota limits for user based on their active plan."""
    now = timezone.now()
    plan_name = "free"
    is_active_plan = False
    plan_obj = UserPlan.objects.filter(user=user).first()

    if plan_obj and plan_obj.is_active():
        plan_name = plan_obj.plan
        is_active_plan = True

    override = CustomPlanOverride.objects.filter(plan_key=plan_name).first()

    if is_active_plan:
        if 'starter' in plan_name:
            img_limit = override.images_per_day if override else 5
            search_limit = override.searches_per_day if override else 15
        elif 'pro' in plan_name:
            img_limit = override.images_per_day if override else 25
            search_limit = override.searches_per_day if override else 50
        elif 'business' in plan_name:
            img_limit = override.images_per_day if override else -1
            search_limit = override.searches_per_day if override else -1
        else:
            img_limit = override.images_per_day if override else 10
            search_limit = override.searches_per_day if override else 20
    else:
        # Free Tier
        img_limit = int(SystemSetting.get_setting('daily_image_limit_free', '3'))
        search_limit = int(SystemSetting.get_setting('daily_search_limit_free', '5'))

    chat_limit = -1
    # Check for per-user custom quota override set by Superadmin
    cq = UserCustomQuota.objects.filter(user=user).first()
    if cq:
        if cq.images_per_day != -1:
            img_limit = -1 if cq.images_per_day == -2 else cq.images_per_day
        if cq.searches_per_day != -1:
            search_limit = -1 if cq.searches_per_day == -2 else cq.searches_per_day
        if cq.chat_per_day != -1:
            chat_limit = -1 if cq.chat_per_day == -2 else cq.chat_per_day

    return {
        'plan_name': plan_name,
        'is_active': is_active_plan,
        'plan_obj': plan_obj,
        'img_limit': img_limit,
        'search_limit': search_limit,
        'chat_limit': chat_limit,
    }


@user_login_required
def dashboard(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    limits = _get_user_limits(user)

    # Calculate today's usage
    # Developer API Keys Management
    api_keys = DeveloperApiKey.objects.filter(user=user, is_active=True).order_by('-created_at')
    revoked_keys = DeveloperApiKey.objects.filter(user=user, is_active=False).order_by('-created_at')[:10]
    total_active_keys = api_keys.count()
    total_api_calls = sum(k.current_usage for k in api_keys)
    total_monthly_quota = sum(k.monthly_quota for k in api_keys) if api_keys.exists() else 1000
    quota_percent = min(100, int((total_api_calls / max(1, total_monthly_quota)) * 100))
    rate_limit_per_minute = max([k.rate_limit_per_minute for k in api_keys], default=60)
    first_key = api_keys.first()

    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_images = UsageRecord.objects.filter(user=user, action_type='image', created_at__gte=today_start).count()
    today_searches = UsageRecord.objects.filter(user=user, action_type='search', created_at__gte=today_start).count()
    today_pdf = UsageRecord.objects.filter(user=user, action_type='pdf', created_at__gte=today_start).count()

    days_left = 0
    if limits['plan_obj'] and limits['plan_obj'].is_active():
        days_left = max(0, (limits['plan_obj'].expires_at - timezone.now()).days)

    # Scoped chat sessions (user FK + session fallback)
    recent_chats = ChatSession.objects.filter(
        Q(user=user) | Q(session_key=request.session.session_key)
    ).order_by('-updated_at')[:4]

    recent_tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')[:3]

    # In-app notifications
    notifications = InAppNotification.objects.filter(user=user, is_read=False)[:5]
    unread_notif_count = InAppNotification.objects.filter(user=user, is_read=False).count()

    # Global announcement banner
    banner = SystemSetting.get_setting('announcement_banner', '')

    context = {
        'active': 'dashboard',
        'profile': profile,
        'limits': limits,
        'api_keys': api_keys,
        'revoked_keys': revoked_keys,
        'total_active_keys': total_active_keys,
        'total_api_calls': total_api_calls,
        'total_monthly_quota': total_monthly_quota,
        'quota_percent': quota_percent,
        'rate_limit_per_minute': rate_limit_per_minute,
        'first_key': first_key,
        'today_images': today_images,
        'today_searches': today_searches,
        'today_pdf': today_pdf,
        'days_left': days_left,
        'recent_chats': recent_chats,
        'recent_tickets': recent_tickets,
        'notifications': notifications,
        'unread_notif_count': unread_notif_count,
        'banner': banner,
    }
    return render(request, 'userpanel/dashboard.html', context)


@user_login_required
def profile_page(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'profile',
        'profile': profile,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/profile.html', context)


@user_login_required
@require_POST
def update_profile_api(request):
    try:
        data = json.loads(request.body)
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        language = data.get('language', 'as')
        timezone_val = data.get('timezone', 'Asia/Kolkata')

        if email and User.objects.filter(email=email).exclude(id=user.id).exists():
            return JsonResponse({'success': False, 'error': 'This email is already associated with another account.'}, status=400)

        user.first_name = first_name
        user.last_name = last_name
        if email:
            user.email = email
        user.save()

        profile.phone = phone
        profile.language = language
        profile.timezone = timezone_val
        profile.save()

        return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
@require_POST
def change_password_api(request):
    try:
        # Rate limit password change attempts
        if _rate_limited(f"pwd_change:{request.user.id}", max_calls=5, per_seconds=300):
            return JsonResponse({'success': False, 'error': 'Too many password attempts. Please wait 5 minutes.'}, status=429)

        data = json.loads(request.body)
        old_pass = data.get('old_password', '')
        new_pass = data.get('new_password', '')

        if not request.user.check_password(old_pass):
            return JsonResponse({'success': False, 'error': 'Current password does not match.'}, status=400)

        # Standard Django Password Validation
        try:
            validate_password(new_pass, request.user)
        except ValidationError as err:
            return JsonResponse({'success': False, 'error': '; '.join(err.messages)}, status=400)

        request.user.set_password(new_pass)
        request.user.save()
        update_session_auth_hash(request, request.user)

        InAppNotification.objects.create(
            user=request.user,
            title="Password Changed",
            message="Your account password was updated successfully.",
            notif_type="success"
        )

        return JsonResponse({'success': True, 'message': 'Password changed successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
def subscription_page(request):
    user = request.user
    limits = _get_user_limits(user)
    plans_catalog = PLAN_CATALOG
    overrides = {o.plan_key: o for o in CustomPlanOverride.objects.all()}

    plans_list = []
    for key, info in plans_catalog.items():
        override = overrides.get(key)
        plans_list.append({
            'key': key,
            'label': override.name if override else info['label'],
            'price': float(override.price_in_rupees) if override else info['amount'] / 100.0,
            'days': override.duration_days if override else info['days'],
            'images_limit': override.images_per_day if override else (5 if 'starter' in key else (25 if 'pro' in key else 'Unlimited')),
            'searches_limit': override.searches_per_day if override else (15 if 'starter' in key else (50 if 'pro' in key else 'Unlimited')),
            'is_current': limits['plan_name'] == key and limits['is_active'],
        })

    days_left = 0
    if limits['plan_obj'] and limits['plan_obj'].is_active():
        days_left = max(0, (limits['plan_obj'].expires_at - timezone.now()).days)

    unread_notif_count = InAppNotification.objects.filter(user=user, is_read=False).count()

    context = {
        'active': 'subscription',
        'limits': limits,
        'plans_list': plans_list,
        'days_left': days_left,
        'razorpay_key': getattr(settings, 'RAZORPAY_KEY_ID', ''),
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/subscription.html', context)


@user_login_required
@require_POST
def cancel_subscription_api(request):
    try:
        data = json.loads(request.body)
        reason = data.get('reason', 'User requested cancellation')

        user_plan = UserPlan.objects.filter(user=request.user).first()
        if user_plan:
            user_plan.status = 'expired'
            user_plan.save()

        InAppNotification.objects.create(
            user=request.user,
            title="Subscription Cancelled",
            message=f"Your subscription has been cancelled. Reason noted: {reason}",
            notif_type="info"
        )
        return JsonResponse({'success': True, 'message': 'Subscription cancelled successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
def payments_page(request):
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'payments',
        'payments': payments,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/payments.html', context)


@user_login_required
def invoice_view(request, payment_id):
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    context = {
        'payment': payment,
        'user': request.user,
        'date': payment.paid_at or payment.created_at,
        'amount_rs': payment.amount / 100.0,
    }
    return render(request, 'userpanel/invoice.html', context)


@user_login_required
def usage_page(request):
    user = request.user

    total_images = UsageRecord.objects.filter(user=user, action_type='image').count()
    total_searches = UsageRecord.objects.filter(user=user, action_type='search').count()
    total_pdf = UsageRecord.objects.filter(user=user, action_type='pdf').count()
    total_summaries = UsageRecord.objects.filter(user=user, action_type='summarize').count()
    dev_keys = DeveloperApiKey.objects.filter(user=user)
    total_api_requests = sum(k.current_usage for k in dev_keys)

    labels = []
    daily_images = []
    daily_searches = []

    for i in range(14, -1, -1):
        day_date = (timezone.now() - timedelta(days=i)).date()
        labels.append(day_date.strftime('%d %b'))
        day_start = timezone.make_aware(datetime.combine(day_date, datetime.min.time()))
        day_end = timezone.make_aware(datetime.combine(day_date, datetime.max.time()))

        imgs = UsageRecord.objects.filter(user=user, action_type='image', created_at__range=(day_start, day_end)).count()
        srchs = UsageRecord.objects.filter(user=user, action_type='search', created_at__range=(day_start, day_end)).count()

        daily_images.append(imgs)
        daily_searches.append(srchs)

    unread_notif_count = InAppNotification.objects.filter(user=user, is_read=False).count()

    context = {
        'active': 'usage',
        'total_images': total_images,
        'total_searches': total_searches,
        'total_pdf': total_pdf,
        'total_summaries': total_summaries,
        'total_api_requests': total_api_requests,
        'labels_json': json.dumps(labels),
        'images_json': json.dumps(daily_images),
        'searches_json': json.dumps(daily_searches),
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/usage.html', context)


@user_login_required
def export_usage_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="my_axom_ai_usage_{timezone.now():%Y%m%d}.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Action Type', 'Details', 'Timestamp'])

    for r in UsageRecord.objects.filter(user=request.user).order_by('-created_at'):
        writer.writerow([r.id, r.action_type, r.details, r.created_at.strftime('%Y-%m-%d %H:%M:%S')])

    return response


@user_login_required
def library_page(request):
    q = request.GET.get('q', '').strip()
    session_key = request.session.session_key

    chats_qs = ChatSession.objects.filter(
        Q(user=request.user) | Q(session_key=session_key)
    ).distinct()

    if q:
        chats_qs = chats_qs.filter(title__icontains=q)

    chats = chats_qs.order_by('-updated_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()

    context = {
        'active': 'library',
        'chats': chats,
        'q': q,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/library.html', context)


@user_login_required
@require_POST
def rename_chat_api(request, session_id):
    try:
        data = json.loads(request.body)
        new_title = data.get('title', '').strip()
        if not new_title:
            return JsonResponse({'success': False, 'error': 'Title cannot be empty.'}, status=400)

        chat = get_object_or_404(
            ChatSession,
            Q(id=session_id) & (Q(user=request.user) | Q(session_key=request.session.session_key))
        )
        chat.title = new_title[:200]
        chat.save()

        return JsonResponse({'success': True, 'message': 'Chat renamed successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
@require_POST
def delete_chat_api(request, session_id):
    try:
        chat = get_object_or_404(
            ChatSession,
            Q(id=session_id) & (Q(user=request.user) | Q(session_key=request.session.session_key))
        )
        chat.delete()
        return JsonResponse({'success': True, 'message': 'Chat conversation deleted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
def support_page(request):
    tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'support',
        'tickets': tickets,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/support.html', context)


@user_login_required
def ticket_detail_view(request, ticket_id):
    ticket = get_object_or_404(SupportTicket, id=ticket_id, user=request.user)
    replies = ticket.replies.all().order_by('created_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'support',
        'ticket': ticket,
        'replies': replies,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/ticket_detail.html', context)


@user_login_required
@require_POST
def create_ticket_api(request):
    try:
        # Rate limiting: max 5 tickets per 10 minutes per user
        if _rate_limited(f"create_ticket:{request.user.id}", max_calls=5, per_seconds=600):
            return JsonResponse({'success': False, 'error': 'Ticket submission limit reached. Please wait a few minutes.'}, status=429)

        data = json.loads(request.body)
        subject = data.get('subject', '').strip()
        category = data.get('category', 'general')
        priority = data.get('priority', 'medium')
        message = data.get('message', '').strip()

        if not subject or not message:
            return JsonResponse({'success': False, 'error': 'Subject and message are required.'}, status=400)

        ticket = SupportTicket.objects.create(
            ticket_id=SupportTicket.generate_ticket_id(),
            user=request.user,
            subject=subject,
            category=category,
            priority=priority,
            status='open'
        )
        TicketReply.objects.create(
            ticket=ticket,
            user=request.user,
            is_admin=False,
            message=message
        )

        return JsonResponse({'success': True, 'message': f'Ticket {ticket.ticket_id} created successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
@require_POST
def reply_ticket_api(request, ticket_id):
    try:
        if _rate_limited(f"reply_ticket:{request.user.id}", max_calls=15, per_seconds=300):
            return JsonResponse({'success': False, 'error': 'Too many replies submitted. Please wait.'}, status=429)

        data = json.loads(request.body)
        message = data.get('message', '').strip()
        if not message:
            return JsonResponse({'success': False, 'error': 'Reply message cannot be empty.'}, status=400)

        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=request.user)
        TicketReply.objects.create(
            ticket=ticket,
            user=request.user,
            is_admin=False,
            message=message
        )
        ticket.status = 'open'
        ticket.save()

        return JsonResponse({'success': True, 'message': 'Reply submitted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
def export_user_data_json(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    data = {
        'account': {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(),
        },
        'profile': {
            'phone': profile.phone,
            'language': profile.language,
            'timezone': profile.timezone,
        },
        'payments': [
            {
                'order_id': p.razorpay_order_id,
                'payment_id': p.razorpay_payment_id,
                'plan': p.plan,
                'amount_rupees': p.amount / 100.0,
                'status': p.status,
                'created_at': p.created_at.isoformat(),
            }
            for p in Payment.objects.filter(user=user)
        ],
        'tickets': [
            {
                'ticket_id': t.ticket_id,
                'subject': t.subject,
                'status': t.status,
                'created_at': t.created_at.isoformat(),
            }
            for t in SupportTicket.objects.filter(user=user)
        ]
    }

    response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="axom_ai_data_{user.username}.json"'
    return response


@user_login_required
@require_POST
def delete_account_api(request):
    """Soft delete pattern: marks account inactive, revokes all API keys & terminates session gracefully."""
    try:
        data = json.loads(request.body)
        password = data.get('password', '')

        if not request.user.check_password(password):
            return JsonResponse({'success': False, 'error': 'Incorrect password.'}, status=400)

        user = request.user
        # Soft delete user
        user.is_active = False
        user.save()

        # Expire active plan
        user_plan = UserPlan.objects.filter(user=user).first()
        if user_plan:
            user_plan.status = 'expired'
            user_plan.save()

        # Revoke all developer API keys & purge from cache immediately
        user_keys = DeveloperApiKey.objects.filter(user=user, is_active=True)
        for k in user_keys:
            k.is_active = False
            k.save(update_fields=['is_active'])
            if k.hashed_key:
                cache.delete(f"api_key_lookup:{k.hashed_key}")
            if k.key:
                cache.delete(f"api_key_lookup:{k.key}")

        logout(request)
        return JsonResponse({'success': True, 'message': 'Account deactivated and all API keys permanently revoked.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@user_login_required
@require_POST
def mark_notifications_read_api(request):
    InAppNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True})


@user_login_required
@require_POST
def create_api_key_api(request):
    """
    Industry-standard secure API Key Generation for authenticated developers.
    - Limits active keys per developer to 5.
    - Determines tier & rate limits based on active UserPlan.
    - Cryptographic SHA-256 hashing (raw key is NEVER stored in database).
    - Scoped endpoint permissions (all / chat / translate) & IP whitelisting.
    - Returns the raw secret key ONCE in response for secure storage.
    """
    user = request.user
    
    # Rate limit key generation to prevent abuse (max 5 keys per 10 minutes)
    if _rate_limited(f"create_key:{user.id}", max_calls=5, per_seconds=600):
        return JsonResponse({
            'success': False,
            'error': 'Too many key creation requests. Please wait a few minutes.'
        }, status=429)

    # Check active keys cap (max 5 active keys per user)
    active_count = DeveloperApiKey.objects.filter(user=user, is_active=True).count()
    if active_count >= 5:
        return JsonResponse({
            'success': False,
            'error': 'Active key limit reached. You can have a maximum of 5 active API keys. Please revoke an unused key before creating a new one.'
        }, status=400)
    
    # Parse key name, allowed_ips, permissions from JSON or POST body
    raw_name = ''
    raw_ips = ''
    raw_perms = 'all'
    if request.content_type == 'application/json':
        try:
            body = json.loads(request.body.decode('utf-8'))
            raw_name = body.get('name', '')
            raw_ips = body.get('allowed_ips', '')
            raw_perms = body.get('permissions', 'all')
        except Exception:
            pass
    if not raw_name:
        raw_name = request.POST.get('name', '')
    if not raw_ips:
        raw_ips = request.POST.get('allowed_ips', '')
    if raw_perms == 'all' and request.POST.get('permissions'):
        raw_perms = request.POST.get('permissions', 'all')
        
    key_name = _sanitize_input(raw_name, max_len=80) or f"Secret Key {active_count + 1}"
    allowed_ips = _sanitize_input(raw_ips, max_len=500).strip()
    permissions = raw_perms if raw_perms in ('all', 'chat', 'translate') else 'all'
    
    # Determine tier & quota based on active UserPlan
    plan_obj = UserPlan.objects.filter(user=user).first()
    plan_name = plan_obj.plan if (plan_obj and plan_obj.is_active()) else 'free'
    
    if 'business' in plan_name:
        tier = 'business'
        monthly_quota = 100000
        rate_limit = 300
    elif 'pro' in plan_name:
        tier = 'developer'
        monthly_quota = 25000
        rate_limit = 120
    else:
        tier = 'free'
        monthly_quota = 1000
        rate_limit = 60
    
    import secrets
    # Generate cryptographically secure random key
    raw_key = generate_key_string()
    key_hash = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
    key_prefix = raw_key[:14]
    key_suffix = raw_key[-4:]
    # Masked representation stored in DB so raw secret key is NEVER stored on server
    masked_db_key = f"{key_prefix}••••{key_suffix}_{secrets.token_hex(4)}"
    
    api_key_obj = DeveloperApiKey.objects.create(
        user=user,
        key=masked_db_key,
        hashed_key=key_hash,
        key_prefix=key_prefix,
        key_suffix=key_suffix,
        name=key_name,
        owner_email=user.email or f"{user.username}@user.aiaxom.co.in",
        tier=tier,
        is_active=True,
        permissions=permissions,
        allowed_ips=allowed_ips,
        monthly_quota=monthly_quota,
        current_usage=0,
        rate_limit_per_minute=rate_limit,
    )
    
    # Record in UsageRecord
    UsageRecord.objects.create(
        user=user,
        action_type='chat',
        details=f"Created API Key '{key_name}' (ID: {api_key_obj.id}, Scope: {permissions})"
    )
    
    # In-App Notification
    InAppNotification.objects.create(
        user=user,
        title="New API Key Generated",
        message=f"Secret key '{key_name}' was created successfully.",
        notif_type="success"
    )
    
    return JsonResponse({
        'success': True,
        'message': 'API Key generated successfully!',
        'api_key': {
            'id': api_key_obj.id,
            'name': api_key_obj.name,
            'raw_key': raw_key,  # Transmitted ONLY ONCE
            'masked_key': api_key_obj.masked_key,
            'permissions': api_key_obj.permissions,
            'permissions_display': api_key_obj.get_permissions_display(),
            'allowed_ips': api_key_obj.allowed_ips,
            'tier': api_key_obj.get_tier_display(),
            'monthly_quota': api_key_obj.monthly_quota,
            'rate_limit_per_minute': api_key_obj.rate_limit_per_minute,
            'created_at': api_key_obj.created_at.strftime('%d %b %Y'),
        }
    })


@user_login_required
@require_POST
def revoke_api_key_api(request, key_id):
    """
    Securely revoke an API key owned by the authenticated developer.
    Clears active status and invalidates cache.
    """
    user = request.user
    key_obj = get_object_or_404(DeveloperApiKey, id=key_id, user=user)
    
    if not key_obj.is_active:
        return JsonResponse({
            'success': False,
            'error': 'This API key has already been revoked.'
        }, status=400)
    
    key_obj.is_active = False
    key_obj.save(update_fields=['is_active'])
    
    # Invalidate cache key lookup immediately
    if key_obj.hashed_key:
        cache.delete(f"api_key_lookup:{key_obj.hashed_key}")
    if key_obj.key:
        cache.delete(f"api_key_lookup:{key_obj.key}")
    
    UsageRecord.objects.create(
        user=user,
        action_type='chat',
        details=f"Revoked API Key '{key_obj.name}' (ID: {key_obj.id})"
    )
    
    InAppNotification.objects.create(
        user=user,
        title="API Key Revoked",
        message=f"Secret key '{key_obj.name}' has been permanently revoked.",
        notif_type="warning"
    )
    
    return JsonResponse({
        'success': True,
        'message': f"API Key '{key_obj.name}' has been permanently revoked."
    })
