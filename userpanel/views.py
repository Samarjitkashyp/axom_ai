import os
import csv
import json
import time
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
from .models import (
    UserProfile,
    SupportTicket,
    TicketReply,
    UsageRecord,
    InAppNotification,
    DeviceRegistration,
    UserLoginAttempt,
)


def _client_ip(request):
    """Safely extract client IP address across reverse proxies, Cloudflare, and Nginx."""
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        return cf_ip.strip()[:64]
    
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
        if client_ip:
            return client_ip[:64]
            
    x_real_ip = request.META.get('HTTP_X_REAL_IP')
    if x_real_ip:
        return x_real_ip.strip()[:64]
        
    return (request.META.get('REMOTE_ADDR') or '127.0.0.1').strip()[:64]


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
    if request.user.is_authenticated:
        return redirect('/axomai-user/')

    client_ip = _client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    lockout_info = None
    remaining_attempts = 3

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
            _clear_failed_attempts(client_ip, u)
            login(request, user)
            UserProfile.objects.get_or_create(user=user)

            # Link any current session chats to this user
            if request.session.session_key:
                ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

            nxt = request.GET.get('next', '/axomai-user/')
            return redirect(nxt)

    return render(request, 'userpanel/login.html', {
        'error': error,
        'is_locked': False,
        'lockout_info': lockout_info,
        'remaining_attempts': remaining_attempts,
        'client_ip': client_ip
    })


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('/axomai-user/')

    from axom_ai.security import (
        get_client_ip,
        get_device_id,
        check_device_registration_allowed,
        record_device_registration,
    )
    import re

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
        elif len(p1) < 6:
            error = 'Password must be at least 6 characters long.'
        elif p1 != p2:
            error = 'Passwords do not match.'
        elif User.objects.filter(username__iexact=u).exists():
            error = 'This username is already taken. Please choose another.'
        elif email and User.objects.filter(email__iexact=email).exists():
            error = 'An account with this email address already exists.'
        else:
            try:
                user = User.objects.create_user(
                    username=u,
                    email=email if email else f"{u}@user.aiaxom.co.in",
                    password=p1,
                )
                UserProfile.objects.get_or_create(user=user)
                record_device_registration(
                    user=user,
                    ip=ip,
                    device_id=device_id,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                login(request, user)

                # Link existing chats
                if request.session.session_key:
                    ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

                response = redirect('/axomai-user/')
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



def logout_view(request):
    logout(request)
    return redirect('/axomai-user/login/')


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


@login_required(login_url='/axomai-user/login/')
def dashboard(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    limits = _get_user_limits(user)

    # Calculate today's usage
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


@login_required(login_url='/axomai-user/login/')
def profile_page(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'profile',
        'profile': profile,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/profile.html', context)


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
def payments_page(request):
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'payments',
        'payments': payments,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/payments.html', context)


@login_required(login_url='/axomai-user/login/')
def invoice_view(request, payment_id):
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    context = {
        'payment': payment,
        'user': request.user,
        'date': payment.paid_at or payment.created_at,
        'amount_rs': payment.amount / 100.0,
    }
    return render(request, 'userpanel/invoice.html', context)


@login_required(login_url='/axomai-user/login/')
def usage_page(request):
    user = request.user

    total_images = UsageRecord.objects.filter(user=user, action_type='image').count()
    total_searches = UsageRecord.objects.filter(user=user, action_type='search').count()
    total_pdf = UsageRecord.objects.filter(user=user, action_type='pdf').count()
    total_summaries = UsageRecord.objects.filter(user=user, action_type='summarize').count()

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
        'labels_json': json.dumps(labels),
        'images_json': json.dumps(daily_images),
        'searches_json': json.dumps(daily_searches),
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/usage.html', context)


@login_required(login_url='/axomai-user/login/')
def export_usage_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="my_axom_ai_usage_{timezone.now():%Y%m%d}.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Action Type', 'Details', 'Timestamp'])

    for r in UsageRecord.objects.filter(user=request.user).order_by('-created_at'):
        writer.writerow([r.id, r.action_type, r.details, r.created_at.strftime('%Y-%m-%d %H:%M:%S')])

    return response


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
def support_page(request):
    tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
    unread_notif_count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
    context = {
        'active': 'support',
        'tickets': tickets,
        'unread_notif_count': unread_notif_count,
    }
    return render(request, 'userpanel/support.html', context)


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
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


@login_required(login_url='/axomai-user/login/')
@require_POST
def delete_account_api(request):
    """Soft delete pattern: marks account inactive & terminates session gracefully."""
    try:
        data = json.loads(request.body)
        password = data.get('password', '')

        if not request.user.check_password(password):
            return JsonResponse({'success': False, 'error': 'Incorrect password.'}, status=400)

        user = request.user
        # Soft delete
        user.is_active = False
        user.save()

        # Expire plan
        user_plan = UserPlan.objects.filter(user=user).first()
        if user_plan:
            user_plan.status = 'expired'
            user_plan.save()

        logout(request)
        return JsonResponse({'success': True, 'message': 'Account deactivated successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='/axomai-user/login/')
@require_POST
def mark_notifications_read_api(request):
    InAppNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True})
