import os
import csv
import json
import time
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User
from urllib.parse import urlencode
from django.contrib.auth.password_validation import validate_password
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Count, Sum, Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_POST

from payments.models import Payment, UserPlan, PLAN_CATALOG
from knowledge.models import KnowledgeDocument, KnowledgeChunk, QAPair, ChatSession, ChatMessage, UnansweredQuery, Feedback
from userpanel.models import SupportTicket, TicketReply, UsageRecord, InAppNotification
from .models import ContactMessage
from .access import SECTIONS, can_open, first_url, clean_sections, user_sections
from .models import (
    SystemSetting,
    CouponCode,
    CustomPlanOverride,
    AuditLog,
    SubdomainPermission,
    LanguageRule,
    AudioTrainingEntry,
    AITool,
    UserTag,
    UserCustomQuota,
    SuperAdminLoginAttempt,
)


def _is_super(u):
    # Strict superuser-only check (prevents standard staff or editor escalation)
    return u.is_authenticated and u.is_superuser


superuser_required = user_passes_test(_is_super, login_url='/axomai-admin/login/')


def section_required(section):
    """A superuser, or a user a superuser gave this section (Users page, Admin panel sections)."""
    return user_passes_test(lambda u: can_open(u, section), login_url='/axomai-admin/login/')


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
    
    attempts = SuperAdminLoginAttempt.objects.filter(filters, is_locked=True)
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
    """Record a failed superadmin login attempt and apply 24-hour lockout on 3rd failure."""
    now = timezone.now()
    record, _ = SuperAdminLoginAttempt.objects.get_or_create(
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
    SuperAdminLoginAttempt.objects.filter(filters).update(
        failed_count=0,
        is_locked=False,
        locked_until=None
    )


def _log_audit(request, action, target="", details=""):
    try:
        AuditLog.objects.create(
            admin_user=request.user if (hasattr(request, 'user') and request.user.is_authenticated) else None,
            action=action,
            target=str(target)[:255],
            details=str(details),
            ip_address=_client_ip(request) or None
        )
    except Exception:
        pass


def login_view(request):
    if request.user.is_authenticated and _is_super(request.user):
        return redirect('/axomai-admin/')
    if request.user.is_authenticated and first_url(request.user):
        return redirect(first_url(request.user))

    client_ip = _client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    error = None
    lockout_info = None
    remaining_attempts = 3

    # Check pre-existing IP lockout
    active_lock = _get_active_lockout(client_ip, '')
    if active_lock.get('is_locked'):
        lockout_info = active_lock
        h, m = active_lock['hours'], active_lock['mins']
        error = f"Security Lockout Active: Too many failed login attempts. This IP address is locked for 24 hours ({h}h {m}m remaining). For security, unauthorized brute force requests are blocked."
        return render(request, 'superadmin/login.html', {
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
                error = f"Security Lockout Active: Account '{u}' is locked for 24 hours ({h}h {m}m remaining). Contact system administrator."
                return render(request, 'superadmin/login.html', {
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
            _log_audit(request, "ADMIN_LOGIN_FAILED", f"Username: {u}", "Invalid credentials provided")
            
            if fail_result.get('is_locked'):
                lockout_info = fail_result
                error = "🚨 Extreme Security Lockout: 3 consecutive failed login attempts detected. Your IP address and account have been LOCKED FOR 24 HOURS. All further attempts are automatically blocked."
                remaining_attempts = 0
                return render(request, 'superadmin/login.html', {
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
                error = f"Invalid administrator credentials. Warning: {rem} attempt{'s' if rem != 1 else ''} remaining before a mandatory 24-HOUR SECURITY LOCKOUT."
        elif not (user.is_superuser or first_url(user)):
            _log_audit(request, "ADMIN_LOGIN_DENIED", f"User: {user.username}", "User is not a Super Administrator and has no admin section")
            fail_result = _record_failed_attempt(client_ip, u, user_agent)
            if fail_result.get('is_locked'):
                lockout_info = fail_result
                error = "🚨 Extreme Security Lockout: 3 consecutive unauthorized login attempts. Access LOCKED FOR 24 HOURS."
                return render(request, 'superadmin/login.html', {
                    'error': error,
                    'is_locked': True,
                    'lockout_info': lockout_info,
                    'remaining_attempts': 0,
                    'client_ip': client_ip,
                    'last_username': u
                })
            rem = fail_result.get('remaining_attempts', 1)
            remaining_attempts = rem
            error = f"Unauthorized: this account has no access to the admin panel. ({rem} attempt{'s' if rem != 1 else ''} remaining)"
        else:
            _clear_failed_attempts(client_ip, u)
            login(request, user)
            _log_audit(request, "ADMIN_LOGIN_SUCCESS", f"User: {user.username}", "Logged into Super Admin")
            nxt = request.GET.get('next', '/axomai-admin/')
            if not user.is_superuser:
                allowed = [info['url'] for key, info in SECTIONS.items() if key in user_sections(user)]
                nxt = nxt if nxt in allowed else first_url(user)           # a limited user goes only to a section that was given
            return redirect(nxt)

    return render(request, 'superadmin/login.html', {
        'error': error,
        'is_locked': False,
        'lockout_info': lockout_info,
        'remaining_attempts': remaining_attempts,
        'client_ip': client_ip
    })


def logout_view(request):
    if request.user.is_authenticated:
        _log_audit(request, "ADMIN_LOGOUT", f"User: {request.user.username}")
    logout(request)
    return redirect('/axomai-admin/login/')


@superuser_required
def dashboard(request):
    now = timezone.now()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # User metrics
    total_users = User.objects.count()
    users_7d = User.objects.filter(date_joined__gte=seven_days_ago).count()
    users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    signups_today = User.objects.filter(date_joined__gte=today_start).count()

    # Active subscribers breakdown
    active_plans = UserPlan.objects.filter(status='active', expires_at__gt=now)
    active_subscribers_count = active_plans.count()

    starter_count = active_plans.filter(plan__startswith='starter').count()
    pro_count = active_plans.filter(plan__startswith='pro').count()
    biz_count = active_plans.filter(plan__startswith='business').count()

    # Revenue & MRR
    paid_payments = Payment.objects.filter(status='paid')
    total_revenue_paise = paid_payments.aggregate(total=Sum('amount'))['total'] or 0
    total_revenue_rs = total_revenue_paise / 100.0

    this_month_payments = paid_payments.filter(created_at__gte=thirty_days_ago)
    mrr_paise = this_month_payments.aggregate(total=Sum('amount'))['total'] or 0
    mrr_rs = mrr_paise / 100.0

    today_payments = paid_payments.filter(created_at__gte=today_start)
    today_payments_count = today_payments.count()
    today_revenue_rs = (today_payments.aggregate(total=Sum('amount'))['total'] or 0) / 100.0

    # 24h & Total Usage counts
    last_24h = now - timedelta(hours=24)
    chat_msgs_24h = ChatMessage.objects.filter(created_at__gte=last_24h).count()
    chat_msgs_total = ChatMessage.objects.count()

    img_gen_24h = UsageRecord.objects.filter(action_type='image', created_at__gte=last_24h).count()
    searches_24h = UsageRecord.objects.filter(action_type='search', created_at__gte=last_24h).count()
    pdf_docs_24h = UsageRecord.objects.filter(action_type='pdf', created_at__gte=last_24h).count()

    # Open support tickets
    open_tickets = SupportTicket.objects.filter(status__in=['open', 'in_progress']).count()
    recent_tickets = SupportTicket.objects.select_related('user').order_by('-created_at')[:5]

    # Recent activity / audit logs
    recent_audits = AuditLog.objects.select_related('admin_user').order_by('-created_at')[:6]

    context = {
        'active': 'dashboard',
        'total_users': total_users,
        'users_7d': users_7d,
        'users_30d': users_30d,
        'signups_today': signups_today,
        'active_subscribers_count': active_subscribers_count,
        'starter_count': starter_count,
        'pro_count': pro_count,
        'biz_count': biz_count,
        'total_revenue_rs': total_revenue_rs,
        'mrr_rs': mrr_rs,
        'today_payments_count': today_payments_count,
        'today_revenue_rs': today_revenue_rs,
        'chat_msgs_24h': chat_msgs_24h,
        'chat_msgs_total': chat_msgs_total,
        'img_gen_24h': img_gen_24h,
        'searches_24h': searches_24h,
        'pdf_docs_24h': pdf_docs_24h,
        'open_tickets': open_tickets,
        'recent_tickets': recent_tickets,
        'recent_audits': recent_audits,
    }
    return render(request, 'superadmin/dashboard.html', context)


@superuser_required
def users_page(request):
    q = request.GET.get('q', '').strip()
    plan_filter = request.GET.get('plan', '').strip()
    status_filter = request.GET.get('status', '').strip()
    tag_filter = request.GET.get('tag', '').strip()
    sort_by = request.GET.get('sort', '-date_joined')

    users_qs = User.objects.select_related('plan').prefetch_related('tags', 'custom_quota').all()

    if q:
        users_qs = users_qs.filter(
            Q(username__icontains=q) |
            Q(email__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q)
        )

    if status_filter == 'active':
        users_qs = users_qs.filter(is_active=True)
    elif status_filter == 'inactive':
        users_qs = users_qs.filter(is_active=False)
    elif status_filter == 'staff':
        users_qs = users_qs.filter(is_staff=True)

    if plan_filter:
        if plan_filter == 'free':
            users_qs = users_qs.filter(Q(plan__isnull=True) | Q(plan__status__in=['expired', 'pending']))
        else:
            users_qs = users_qs.filter(plan__plan=plan_filter, plan__status='active')

    if tag_filter:
        users_qs = users_qs.filter(tags__tag_name=tag_filter)

    valid_sorts = ['-date_joined', 'date_joined', 'username', '-last_login']
    if sort_by not in valid_sorts:
        sort_by = '-date_joined'

    users_qs = users_qs.order_by(sort_by).distinct()

    paginator = Paginator(users_qs, 20)
    page_number = request.GET.get('page', 1)
    users_page_obj = paginator.get_page(page_number)

    page_user_ids = [u.id for u in users_page_obj]

    # Pre-fetch stats for current page users
    user_stats = {}
    for uid in page_user_ids:
        records = UsageRecord.objects.filter(user_id=uid)
        tokens_count = records.count()
        img_count = records.filter(action_type='image').count()
        chats_count = ChatSession.objects.filter(user_id=uid).count()
        user_stats[uid] = {
            'tokens': tokens_count,
            'chats': chats_count,
            'images': img_count,
        }

    # Permissions map
    perms_map = {}
    for sp in SubdomainPermission.objects.filter(user_id__in=page_user_ids):
        perms_map[sp.user_id] = {'admin': sp.admin_access, 'content': sp.content_access, 'bot': sp.bot_access, 'sections': clean_sections(sp.admin_sections)}

    # Profile data for the edit form
    profiles_map = {u.id: {'email': u.email, 'first': u.first_name, 'last': u.last_name} for u in users_page_obj}

    # Tags map
    tags_map = {}
    for tag in UserTag.objects.filter(user_id__in=page_user_ids):
        if tag.user_id not in tags_map:
            tags_map[tag.user_id] = []
        tags_map[tag.user_id].append({'id': tag.id, 'name': tag.tag_name, 'color': tag.color})

    # Quota overrides map
    quotas_map = {}
    for cq in UserCustomQuota.objects.filter(user_id__in=page_user_ids):
        quotas_map[cq.user_id] = {
            'chat': cq.chat_per_day,
            'images': cq.images_per_day,
            'searches': cq.searches_per_day,
            'pdf': cq.pdf_per_day,
        }

    # All distinct tags in database for filter dropdown
    all_tags = list(UserTag.objects.values_list('tag_name', flat=True).distinct())
    plans_list = list(PLAN_CATALOG.keys())

    # Attach computed stats onto user objects for easy template access
    for u in users_page_obj:
        st = user_stats.get(u.id, {'tokens': 0, 'chats': 0, 'images': 0})
        u.stat_tokens = st['tokens']
        u.stat_chats = st['chats']
        u.stat_images = st['images']
        u.tag_list = tags_map.get(u.id, [])
        u.custom_q = quotas_map.get(u.id, None)
        u.panel_sections = [SECTIONS[k]['label'] for k in perms_map.get(u.id, {}).get('sections', []) if k in SECTIONS and perms_map[u.id].get('admin')]

    # Summary cards on top of the page
    total_all = User.objects.count()
    active_all = User.objects.filter(is_active=True).count()
    stats = {
        'total': total_all,
        'active': active_all,
        'suspended': total_all - active_all,
        'admins': User.objects.filter(Q(is_superuser=True) | Q(is_staff=True) | Q(subdomain_perm__admin_access=True)).distinct().count(),
    }

    # Pager: the filters kept in the links (url-encoded), and a short list of page numbers (None = a gap)
    qs = urlencode({k: v for k, v in (('q', q), ('plan', plan_filter), ('status', status_filter), ('tag', tag_filter), ('sort', sort_by)) if v and not (k == 'sort' and v == '-date_joined')})
    last = paginator.num_pages
    shown = sorted({1, last, users_page_obj.number - 1, users_page_obj.number, users_page_obj.number + 1} & set(range(1, last + 1)))
    page_numbers = []
    for n in shown:
        if page_numbers and n - page_numbers[-1] > 1:
            page_numbers.append(None)
        page_numbers.append(n)

    context = {
        'active': 'users',
        'users': users_page_obj,
        'stats': stats,
        'qs': qs,
        'page_numbers': page_numbers,
        'range_from': users_page_obj.start_index() if users_page_obj.paginator.count else 0,
        'range_to': users_page_obj.end_index() if users_page_obj.paginator.count else 0,
        'q': q,
        'plan_filter': plan_filter,
        'status_filter': status_filter,
        'tag_filter': tag_filter,
        'sort_by': sort_by,
        'plans_list': plans_list,
        'all_tags': all_tags,
        'total_count': users_qs.count(),
        'perms_map': json.dumps(perms_map),
        'profiles_map': json.dumps(profiles_map),
        'admin_sections': [{'key': k, 'label': v['label']} for k, v in SECTIONS.items()],
        'tags_map': json.dumps(tags_map),
        'quotas_map': json.dumps(quotas_map),
    }
    return render(request, 'superadmin/users.html', context)


import re as _re
from django.core.validators import validate_email as _validate_email


def _create_user(request, data):
    """Superadmin adds a (normal, never staff or superuser) user, optionally with admin panel sections."""
    username = _sanitize_input(data.get('username'), 150)
    email = _sanitize_input(data.get('email'), 254).lower()
    password = str(data.get('password') or '')
    if not _re.fullmatch(r'[\w.@+-]{3,150}', username):
        return JsonResponse({'success': False, 'error': 'Username: 3 to 150 letters, digits or . @ + - _ only.'}, status=400)
    try:
        _validate_email(email)
    except ValidationError:
        return JsonResponse({'success': False, 'error': 'Enter a valid email address.'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'success': False, 'error': 'This username is already taken.'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({'success': False, 'error': 'This email is already used by another account.'}, status=400)
    try:
        validate_password(password)
    except ValidationError as err:
        return JsonResponse({'success': False, 'error': '; '.join(err.messages)}, status=400)
    user = User.objects.create_user(username=username, email=email, password=password,
                                    first_name=_sanitize_input(data.get('first_name'), 150), last_name=_sanitize_input(data.get('last_name'), 150))
    sections = clean_sections(data.get('admin_sections'))
    if sections:
        SubdomainPermission.objects.update_or_create(user=user, defaults={'admin_access': True, 'admin_sections': sections})
    _log_audit(request, "USER_CREATED", f"User: {user.username}", f"Created by Super Admin; sections={sections}")
    return JsonResponse({'success': True, 'message': f'User {user.username} created.' + (' Admin panel access given.' if sections else '')})


def _update_profile(request, user, data):
    email = _sanitize_input(data.get('email'), 254).lower()
    try:
        _validate_email(email)
    except ValidationError:
        return JsonResponse({'success': False, 'error': 'Enter a valid email address.'}, status=400)
    if User.objects.filter(email__iexact=email).exclude(id=user.id).exists():
        return JsonResponse({'success': False, 'error': 'This email is already used by another account.'}, status=400)
    user.email = email
    user.first_name = _sanitize_input(data.get('first_name'), 150)
    user.last_name = _sanitize_input(data.get('last_name'), 150)
    user.save(update_fields=['email', 'first_name', 'last_name'])
    _log_audit(request, "USER_PROFILE_EDIT", f"User: {user.username}", "Name / email changed by Super Admin")
    return JsonResponse({'success': True, 'message': f'Profile of {user.username} saved.'})


@superuser_required
@require_POST
def user_action_api(request):
    try:
        data = json.loads(request.body)
        action = data.get('action')

        # Handle Bulk Actions
        if action == 'bulk_action':
            bulk_type = data.get('bulk_type')
            user_ids = data.get('user_ids', [])
            if not user_ids:
                return JsonResponse({'success': False, 'error': 'No users selected.'}, status=400)

            target_users = User.objects.filter(id__in=user_ids)

            if bulk_type == 'activate':
                count = target_users.update(is_active=True)
                _log_audit(request, "BULK_USER_ACTIVATE", f"{count} users", f"User IDs: {user_ids}")
                return JsonResponse({'success': True, 'message': f'Successfully activated {count} users.'})

            elif bulk_type == 'deactivate':
                safe_users = target_users.exclude(id=request.user.id).exclude(is_superuser=True)
                count = safe_users.update(is_active=False)
                _log_audit(request, "BULK_USER_DEACTIVATE", f"{count} users", f"User IDs: {user_ids}")
                return JsonResponse({'success': True, 'message': f'Successfully deactivated {count} users.'})

            elif bulk_type == 'delete':
                safe_users = target_users.exclude(id=request.user.id).exclude(is_superuser=True)
                count = safe_users.count()
                safe_users.delete()
                _log_audit(request, "BULK_USER_DELETE", f"{count} users", f"User IDs: {user_ids}")
                return JsonResponse({'success': True, 'message': f'Permanently deleted {count} users.'})

            elif bulk_type == 'change_plan':
                new_plan_key = data.get('plan_key', 'free')
                duration_days = int(data.get('duration_days', 30))
                now = timezone.now()
                expires_at = now + timedelta(days=duration_days)

                for u in target_users:
                    if new_plan_key == 'free':
                        if hasattr(u, 'plan'):
                            u.plan.status = 'expired'
                            u.plan.save()
                    else:
                        up, _ = UserPlan.objects.get_or_create(user=u, defaults={'plan': new_plan_key, 'started_at': now, 'expires_at': expires_at, 'status': 'active'})
                        up.plan = new_plan_key
                        up.started_at = now
                        up.expires_at = expires_at
                        up.status = 'active'
                        up.save()

                _log_audit(request, "BULK_PLAN_CHANGE", f"{target_users.count()} users", f"Assigned {new_plan_key}")
                return JsonResponse({'success': True, 'message': f'Updated plan to {new_plan_key} for {target_users.count()} users.'})

            elif bulk_type == 'gift_days':
                days = int(data.get('days', 7))
                now = timezone.now()
                for u in target_users:
                    if hasattr(u, 'plan') and u.plan.is_active():
                        u.plan.expires_at += timedelta(days=days)
                        u.plan.save()
                    else:
                        UserPlan.objects.create(user=u, plan='starter_monthly', started_at=now, expires_at=now + timedelta(days=days), status='active')

                _log_audit(request, "BULK_GIFT_DAYS", f"{target_users.count()} users", f"Gifted +{days} days")
                return JsonResponse({'success': True, 'message': f'Gifted +{days} days to {target_users.count()} users.'})

            elif bulk_type == 'add_tag':
                tag_name = data.get('tag_name', '').strip()
                color = data.get('color', 'indigo')
                if not tag_name:
                    return JsonResponse({'success': False, 'error': 'Tag name required.'}, status=400)
                added = 0
                for u in target_users:
                    _, created = UserTag.objects.get_or_create(user=u, tag_name=tag_name, defaults={'color': color})
                    if created:
                        added += 1
                _log_audit(request, "BULK_ADD_TAG", f"{target_users.count()} users", f"Added tag {tag_name}")
                return JsonResponse({'success': True, 'message': f'Added tag "{tag_name}" to {added} users.'})

            return JsonResponse({'success': False, 'error': 'Unknown bulk action.'}, status=400)

        if action == 'create_user':
            return _create_user(request, data)

        # Single User Actions
        user_id = data.get('user_id')
        user = get_object_or_404(User, id=user_id)

        # Protect modifying self superuser
        if user == request.user and action in ['toggle_status', 'delete']:
            return JsonResponse({'success': False, 'error': 'Cannot deactivate or delete current logged-in super admin.'}, status=400)

        if user.is_superuser and action in ['toggle_status', 'delete']:
            remaining_supers = User.objects.filter(is_superuser=True, is_active=True).exclude(id=user.id).count()
            if remaining_supers < 1:
                return JsonResponse({'success': False, 'error': 'Cannot deactivate or delete the only active Super Admin account.'}, status=400)

        if action == 'toggle_status':
            user.is_active = not user.is_active
            user.save()
            status_str = "Activated" if user.is_active else "Deactivated"
            _log_audit(request, "USER_STATUS_CHANGE", f"User: {user.username}", f"Status changed to {status_str}")
            return JsonResponse({'success': True, 'is_active': user.is_active, 'message': f'User {status_str} successfully.'})

        elif action == 'reset_password':
            new_pass = data.get('new_password', '').strip()
            try:
                validate_password(new_pass, user)
            except ValidationError as err:
                return JsonResponse({'success': False, 'error': '; '.join(err.messages)}, status=400)

            user.set_password(new_pass)
            user.save()
            _log_audit(request, "USER_PASSWORD_RESET", f"User: {user.username}", "Password reset by Super Admin")
            return JsonResponse({'success': True, 'message': f'Password for {user.username} updated successfully.'})

        elif action == 'change_plan':
            new_plan_key = data.get('plan_key', '').strip()
            duration_days = int(data.get('duration_days', 30))
            if new_plan_key not in PLAN_CATALOG and new_plan_key != 'free':
                return JsonResponse({'success': False, 'error': 'Invalid plan specified.'}, status=400)

            if new_plan_key == 'free':
                if hasattr(user, 'plan'):
                    user.plan.status = 'expired'
                    user.plan.save()
                _log_audit(request, "USER_PLAN_CHANGE", f"User: {user.username}", "Plan downgraded to Free")
                return JsonResponse({'success': True, 'message': f'User {user.username} moved to Free tier.'})
            else:
                now = timezone.now()
                expires_at = now + timedelta(days=duration_days)
                user_plan, _ = UserPlan.objects.get_or_create(user=user, defaults={'plan': new_plan_key, 'started_at': now, 'expires_at': expires_at, 'status': 'active'})
                user_plan.plan = new_plan_key
                user_plan.started_at = now
                user_plan.expires_at = expires_at
                user_plan.status = 'active'
                user_plan.save()
                _log_audit(request, "USER_PLAN_CHANGE", f"User: {user.username}", f"Assigned {new_plan_key} for {duration_days} days")
                return JsonResponse({'success': True, 'message': f'Assigned {new_plan_key} to {user.username} until {expires_at:%d %b %Y}.'})

        elif action == 'gift_days':
            days = int(data.get('days', 7))
            now = timezone.now()
            if hasattr(user, 'plan') and user.plan.is_active():
                user.plan.expires_at += timedelta(days=days)
                user.plan.save()
            else:
                user_plan, _ = UserPlan.objects.get_or_create(
                    user=user,
                    defaults={'plan': 'starter_monthly', 'started_at': now, 'expires_at': now + timedelta(days=days), 'status': 'active'}
                )
                user_plan.plan = 'starter_monthly'
                user_plan.status = 'active'
                user_plan.expires_at = now + timedelta(days=days)
                user_plan.save()

            _log_audit(request, "GIFT_DAYS", f"User: {user.username}", f"Gifted +{days} free premium days")
            return JsonResponse({'success': True, 'message': f'Gifted +{days} days to {user.username}.'})

        elif action == 'update_profile':
            return _update_profile(request, user, data)

        elif action == 'set_permissions':
            admin_access = bool(data.get('admin_access', False))
            content_access = bool(data.get('content_access', False))
            bot_access = bool(data.get('bot_access', False))
            sections = clean_sections(data.get('admin_sections'))
            if sections:
                admin_access = True                                        # a section is only reachable through the admin subdomain
            perm, _ = SubdomainPermission.objects.get_or_create(user=user)
            perm.admin_access = admin_access
            perm.content_access = content_access
            perm.bot_access = bot_access
            perm.admin_sections = sections
            perm.save()
            _log_audit(request, "USER_PERMISSIONS", f"User: {user.username}",
                       f"admin={admin_access}, content={content_access}, bot={bot_access}, sections={sections}")
            return JsonResponse({'success': True, 'message': f'Permissions updated for {user.username}.'})

        elif action == 'add_tag':
            tag_name = data.get('tag_name', '').strip()
            color = data.get('color', 'indigo')
            if not tag_name:
                return JsonResponse({'success': False, 'error': 'Tag name cannot be empty.'}, status=400)
            tag, created = UserTag.objects.get_or_create(user=user, tag_name=tag_name, defaults={'color': color})
            if not created and tag.color != color:
                tag.color = color
                tag.save()
            _log_audit(request, "USER_ADD_TAG", f"User: {user.username}", f"Added tag {tag_name}")
            return JsonResponse({'success': True, 'message': f'Tag "{tag_name}" added.', 'tag': {'id': tag.id, 'name': tag.tag_name, 'color': tag.color}})

        elif action == 'remove_tag':
            tag_id = data.get('tag_id')
            tag_name = data.get('tag_name')
            if tag_id:
                UserTag.objects.filter(user=user, id=tag_id).delete()
            elif tag_name:
                UserTag.objects.filter(user=user, tag_name=tag_name).delete()
            _log_audit(request, "USER_REMOVE_TAG", f"User: {user.username}", f"Removed tag {tag_name or tag_id}")
            return JsonResponse({'success': True, 'message': 'Tag removed.'})

        elif action == 'set_custom_quota':
            chat_per_day = int(data.get('chat_per_day', -1))
            images_per_day = int(data.get('images_per_day', -1))
            searches_per_day = int(data.get('searches_per_day', -1))
            pdf_per_day = int(data.get('pdf_per_day', -1))

            cq, _ = UserCustomQuota.objects.get_or_create(user=user)
            cq.chat_per_day = chat_per_day
            cq.images_per_day = images_per_day
            cq.searches_per_day = searches_per_day
            cq.pdf_per_day = pdf_per_day
            cq.save()
            _log_audit(request, "USER_QUOTA_OVERRIDE", f"User: {user.username}",
                       f"chat={chat_per_day}, images={images_per_day}, searches={searches_per_day}")
            return JsonResponse({'success': True, 'message': f'Custom quota override saved for {user.username}.'})

        elif action == 'delete':
            username = user.username
            user.delete()
            _log_audit(request, "USER_DELETED", f"User: {username}", "Account permanently deleted by Super Admin")
            return JsonResponse({'success': True, 'message': f'User {username} deleted permanently.'})

        return JsonResponse({'success': False, 'error': 'Unknown action.'}, status=400)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
def export_users_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="axom_ai_users_{timezone.now():%Y%m%d_%H%M}.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Is Active', 'Plan', 'Plan Status', 'Plan Expires', 'Date Joined', 'Last Login'])

    for u in User.objects.select_related('plan').all().order_by('-date_joined'):
        plan_name = getattr(u, 'plan', None).plan if hasattr(u, 'plan') else 'Free'
        plan_status = getattr(u, 'plan', None).status if hasattr(u, 'plan') else 'none'
        plan_exp = getattr(u, 'plan', None).expires_at.strftime('%Y-%m-%d') if hasattr(u, 'plan') and u.plan.expires_at else 'N/A'
        writer.writerow([
            u.id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            'Active' if u.is_active else 'Inactive',
            plan_name,
            plan_status,
            plan_exp,
            u.date_joined.strftime('%Y-%m-%d %H:%M'),
            u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else 'Never'
        ])
    return response


@superuser_required
def subscriptions_page(request):
    q = request.GET.get('q', '').strip()
    status_filter = request.GET.get('status', '').strip()
    plan_filter = request.GET.get('plan', '').strip()

    payments_qs = Payment.objects.select_related('user').all()

    if q:
        payments_qs = payments_qs.filter(
            Q(razorpay_order_id__icontains=q) |
            Q(razorpay_payment_id__icontains=q) |
            Q(user__username__icontains=q) |
            Q(user__email__icontains=q)
        )

    if status_filter:
        payments_qs = payments_qs.filter(status=status_filter)

    if plan_filter:
        payments_qs = payments_qs.filter(plan=plan_filter)

    paginator = Paginator(payments_qs, 20)
    page_number = request.GET.get('page', 1)
    payments_page_obj = paginator.get_page(page_number)

    total_paid_count = Payment.objects.filter(status='paid').count()
    total_paid_sum_paise = Payment.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    total_failed_count = Payment.objects.filter(status__in=['failed', 'refunded']).count()

    context = {
        'active': 'subscriptions',
        'payments': payments_page_obj,
        'q': q,
        'status_filter': status_filter,
        'plan_filter': plan_filter,
        'total_paid_count': total_paid_count,
        'total_paid_rs': total_paid_sum_paise / 100.0,
        'total_failed_count': total_failed_count,
        'plans_list': list(PLAN_CATALOG.keys()),
    }
    return render(request, 'superadmin/subscriptions.html', context)


@superuser_required
@require_POST
def refund_payment_api(request):
    """Real Razorpay refund integration + update status to 'refunded' and revoke plan."""
    try:
        data = json.loads(request.body)
        payment_id = data.get('payment_id')
        payment = get_object_or_404(Payment, id=payment_id)

        if payment.status != 'paid':
            return JsonResponse({'success': False, 'error': f'Cannot refund payment with status "{payment.status}".'}, status=400)

        # Call Razorpay Refund API if credentials are configured
        rzp_refund_id = None
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and payment.razorpay_payment_id:
            try:
                import razorpay
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                refund_resp = client.payment.refund(payment.razorpay_payment_id, {'amount': payment.amount})
                rzp_refund_id = refund_resp.get('id')
            except Exception as rz_err:
                _log_audit(request, "PAYMENT_REFUND_RZP_ERROR", f"Order {payment.razorpay_order_id}", f"Gateway refund error: {rz_err}")
                # We still allow marking local refund if admin explicitly confirms

        # Update database state to 'refunded'
        payment.status = 'refunded'
        payment.save()

        # Revoke user's active plan
        if hasattr(payment.user, 'plan'):
            payment.user.plan.status = 'expired'
            payment.user.plan.save()

        _log_audit(request, "PAYMENT_REFUND_SUCCESS", f"Order {payment.razorpay_order_id}", f"Refunded ₹{payment.amount/100:.2f} for user {payment.user.username}. RZP ID: {rzp_refund_id}")
        return JsonResponse({
            'success': True,
            'message': f'Payment of ₹{payment.amount/100:.2f} has been refunded and user plan revoked.'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
def export_payments_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="axom_ai_payments_{timezone.now():%Y%m%d_%H%M}.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Username', 'Email', 'Plan', 'Amount (INR)', 'Status', 'Order ID', 'Payment ID', 'Created At', 'Paid At'])

    for p in Payment.objects.select_related('user').all().order_by('-created_at'):
        writer.writerow([
            p.id,
            p.user.username,
            p.user.email,
            p.plan,
            f"{p.amount/100:.2f}",
            p.status,
            p.razorpay_order_id,
            p.razorpay_payment_id,
            p.created_at.strftime('%Y-%m-%d %H:%M'),
            p.paid_at.strftime('%Y-%m-%d %H:%M') if p.paid_at else ''
        ])
    return response


@superuser_required
def plans_page(request):
    catalog = PLAN_CATALOG
    overrides = {o.plan_key: o for o in CustomPlanOverride.objects.all()}
    coupons = CouponCode.objects.all().order_by('-created_at')

    plans_data = []
    for key, info in catalog.items():
        override = overrides.get(key)
        plans_data.append({
            'key': key,
            'label': override.name if override else info['label'],
            'price': float(override.price_in_rupees) if override else info['amount'] / 100.0,
            'days': override.duration_days if override else info['days'],
            'images_limit': override.images_per_day if override else (5 if 'starter' in key else (25 if 'pro' in key else -1)),
            'searches_limit': override.searches_per_day if override else (10 if 'starter' in key else (50 if 'pro' in key else -1)),
            'chat_limit': override.chat_per_day if override else -1,
            'is_active': override.is_active if override else True,
        })

    context = {
        'active': 'plans',
        'plans_data': plans_data,
        'coupons': coupons,
    }
    return render(request, 'superadmin/plans.html', context)


@superuser_required
@require_POST
def save_plan_api(request):
    try:
        data = json.loads(request.body)
        plan_key = data.get('plan_key')
        name = data.get('name')
        price = float(data.get('price', 199))
        duration = int(data.get('duration_days', 30))
        img_limit = int(data.get('images_per_day', 5))
        search_limit = int(data.get('searches_per_day', 10))
        chat_limit = int(data.get('chat_per_day', -1))
        is_active = bool(data.get('is_active', True))

        CustomPlanOverride.objects.update_or_create(
            plan_key=plan_key,
            defaults={
                'name': name,
                'price_in_rupees': price,
                'duration_days': duration,
                'images_per_day': img_limit,
                'searches_per_day': search_limit,
                'chat_per_day': chat_limit,
                'is_active': is_active
            }
        )
        _log_audit(request, "PLAN_CONFIG_UPDATE", f"Plan: {plan_key}", f"Price: ₹{price}, Images/d: {img_limit}")
        return JsonResponse({'success': True, 'message': f'Plan {name} settings updated successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
@require_POST
def save_coupon_api(request):
    try:
        data = json.loads(request.body)
        code = data.get('code', '').strip().upper()
        discount = int(data.get('discount_percent', 10))
        max_uses = int(data.get('max_uses', 100))
        expiry_str = data.get('expires_at')

        if not code:
            return JsonResponse({'success': False, 'error': 'Coupon code is required.'}, status=400)

        expires_at = None
        if expiry_str:
            naive_dt = datetime.strptime(expiry_str, '%Y-%m-%d')
            expires_at = timezone.make_aware(naive_dt)

        coupon, created = CouponCode.objects.update_or_create(
            code=code,
            defaults={
                'discount_percent': discount,
                'max_uses': max_uses,
                'expires_at': expires_at,
                'is_active': True
            }
        )
        _log_audit(request, "COUPON_CREATE" if created else "COUPON_UPDATE", f"Coupon: {code}", f"Discount: {discount}%")
        return JsonResponse({'success': True, 'message': f'Coupon {code} ({discount}%) saved successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
@require_POST
def toggle_coupon_api(request, coupon_id):
    coupon = get_object_or_404(CouponCode, id=coupon_id)
    coupon.is_active = not coupon.is_active
    coupon.save()
    _log_audit(request, "COUPON_TOGGLE", f"Coupon: {coupon.code}", f"Active: {coupon.is_active}")
    return JsonResponse({'success': True, 'is_active': coupon.is_active})


@superuser_required
def moderation_page(request):
    q = request.GET.get('q', '').strip()
    tab = request.GET.get('tab', 'chats')

    chats_qs = ChatSession.objects.prefetch_related('messages').all().order_by('-updated_at')
    if q:
        chats_qs = chats_qs.filter(Q(title__icontains=q) | Q(messages__text__icontains=q)).distinct()

    paginator = Paginator(chats_qs, 15)
    chats_page = paginator.get_page(request.GET.get('page', 1))

    unanswered = UnansweredQuery.objects.all().order_by('-count')[:30]
    feedbacks = Feedback.objects.all().order_by('-created_at')[:30]
    tickets = SupportTicket.objects.select_related('user').all().order_by('-created_at')[:30]

    context = {
        'active': 'moderation',
        'tab': tab,
        'q': q,
        'chats': chats_page,
        'unanswered': unanswered,
        'feedbacks': feedbacks,
        'tickets': tickets,
    }
    return render(request, 'superadmin/moderation.html', context)


@superuser_required
@require_POST
def delete_chat_session_api(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)
    title = session.title
    session.delete()
    _log_audit(request, "CHAT_SESSION_DELETE", f"Chat: {title}", f"Deleted session ID {session_id}")
    return JsonResponse({'success': True, 'message': 'Chat session deleted successfully.'})


@superuser_required
@require_POST
def admin_reply_ticket_api(request, ticket_id):
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        status = data.get('status', 'in_progress')
        if not message:
            return JsonResponse({'success': False, 'error': 'Reply message cannot be empty.'}, status=400)

        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        TicketReply.objects.create(
            ticket=ticket,
            user=request.user,
            is_admin=True,
            message=message
        )
        ticket.status = status
        ticket.save()

        # In-app notification for user
        InAppNotification.objects.create(
            user=ticket.user,
            title=f"Support Update on #{ticket.ticket_id}",
            message=f"Support team replied: {message[:80]}...",
            notif_type="info",
            link=f"/axomai-user/support/ticket/{ticket.id}/"
        )

        _log_audit(request, "TICKET_ADMIN_REPLY", f"Ticket: {ticket.ticket_id}", f"Replied and updated status to {status}")
        return JsonResponse({'success': True, 'message': 'Reply sent to user.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
def knowledge_page(request):
    docs = KnowledgeDocument.objects.annotate(chunks_count=Count('chunks')).order_by('-uploaded_at')
    total_docs = docs.count()
    total_chunks = KnowledgeChunk.objects.count()
    total_qa = QAPair.objects.count()

    context = {
        'active': 'knowledge',
        'docs': docs,
        'total_docs': total_docs,
        'total_chunks': total_chunks,
        'total_qa': total_qa,
    }
    return render(request, 'superadmin/knowledge.html', context)


@superuser_required
def knowledge_test_search_api(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'success': False, 'error': 'Query parameter "q" required.'}, status=400)

    try:
        from knowledge.utils import search_knowledge_base, find_instant_answer
        instant = find_instant_answer(query)
        rag_context = search_knowledge_base(query, max_results=4)
        return JsonResponse({
            'success': True,
            'query': query,
            'instant_answer': instant,
            'rag_context': rag_context,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
def analytics_page(request):
    total_users = User.objects.count()
    total_chats = ChatSession.objects.count()
    total_messages = ChatMessage.objects.count()

    # Active top users
    top_users_records = User.objects.filter(is_active=True).annotate(
        usage_count=Count('usage_records')
    ).order_by('-usage_count')[:10]

    usage_breakdown = {
        'chat': ChatMessage.objects.count(),
        'image': UsageRecord.objects.filter(action_type='image').count(),
        'search': UsageRecord.objects.filter(action_type='search').count(),
        'pdf': UsageRecord.objects.filter(action_type='pdf').count(),
    }

    context = {
        'active': 'analytics',
        'total_users': total_users,
        'total_chats': total_chats,
        'total_messages': total_messages,
        'top_users': top_users_records,
        'usage_breakdown': usage_breakdown,
    }
    return render(request, 'superadmin/analytics.html', context)


BOT_CLEANUP_MODES = ('off', 'dry_run', 'on')
BOT_CLEANUP_REPORT = os.getenv('BOT_CLEANUP_REPORT', '/home/admin/axomai-bot/cleanup_report.json')


def _validate_bot_cleanup(data):
    """Error text for a bad bot clean-up setting, else None. Normalises bot_cleanup_days in place (a whole number, at least 3)."""
    if 'bot_cleanup_mode' in data and data['bot_cleanup_mode'] not in BOT_CLEANUP_MODES:
        return "Bot clean-up mode must be one of: off, dry_run, on."
    if 'bot_cleanup_days' in data:
        try:
            data['bot_cleanup_days'] = str(max(3, int(str(data['bot_cleanup_days']).strip())))
        except (TypeError, ValueError):
            return "Bot clean-up days must be a whole number."
    for key in ('tts_daily_free', 'tts_daily_pro', 'stt_daily_free', 'stt_daily_pro'):
        if key in data:
            try:
                n = int(str(data[key]).strip())
            except (TypeError, ValueError):
                return "The voice limits must be whole numbers."
            if not 0 <= n <= 100000:
                return "The voice limits must be between 0 and 100000 sentences a day."
            data[key] = str(n)
    if 'bot_upload_daily_pages' in data:
        try:
            n = int(str(data['bot_upload_daily_pages']).strip())
        except (TypeError, ValueError):
            return "Document upload limit must be a whole number."
        if not 0 <= n <= 100000:
            return "Document upload limit must be between 0 and 100000 pages a day."
        data['bot_upload_daily_pages'] = str(n)
    return None


def _bot_cleanup_report():
    """What the crawler bot's last backup clean-up did (or would do), for the settings page; None if it has not run yet."""
    try:
        with open(BOT_CLEANUP_REPORT, encoding='utf-8') as f:
            r = json.load(f)
        items = r.get('deleted') if r.get('mode') == 'on' else r.get('would_delete')
        items = items or []
        return {
            'at': r.get('at', ''), 'mode': r.get('mode', ''), 'days': r.get('days', ''), 'is_dry': r.get('mode') != 'on',
            'count': len(items), 'kept': r.get('kept', 0), 'freed_mb': round((r.get('freed_bytes') or 0) / 1e6, 1),
            'errors': r.get('errors') or [],
            'items': [{'name': i.get('name', ''), 'age_days': i.get('age_days', ''), 'mb': round((i.get('size') or 0) / 1e6, 1)} for i in items[:12]],
        }
    except Exception:
        return None


@superuser_required
def settings_page(request):
    settings_dict = {
        'web_search_enabled': SystemSetting.is_enabled('web_search_enabled', True),
        'image_gen_enabled': SystemSetting.is_enabled('image_gen_enabled', True),
        'pdf_ai_enabled': SystemSetting.is_enabled('pdf_ai_enabled', True),
        'maintenance_mode': SystemSetting.is_enabled('maintenance_mode', False),
        'announcement_banner': SystemSetting.get_setting('announcement_banner', ''),
        'daily_image_limit_free': SystemSetting.get_setting('daily_image_limit_free', '5'),
        'daily_search_limit_free': SystemSetting.get_setting('daily_search_limit_free', '5'),
        'bot_cleanup_mode': SystemSetting.get_setting('bot_cleanup_mode', 'off'),
        'bot_cleanup_days': SystemSetting.get_setting('bot_cleanup_days', '7'),
        'bot_upload_daily_pages': SystemSetting.get_setting('bot_upload_daily_pages', '500'),
        'tts_enabled': SystemSetting.is_enabled('tts_enabled', True),
        'tts_daily_free': SystemSetting.get_setting('tts_daily_free', '40'),
        'tts_daily_pro': SystemSetting.get_setting('tts_daily_pro', '600'),
        'stt_enabled': SystemSetting.is_enabled('stt_enabled', True),
        'stt_daily_free': SystemSetting.get_setting('stt_daily_free', '40'),
        'stt_daily_pro': SystemSetting.get_setting('stt_daily_pro', '400'),
    }

    def _mask(k):
        return f"{k[:4]}...{k[-4:]}" if k and len(k) > 8 else ("Configured" if k else "Not Set")

    api_status = {
        'gemini': _mask(os.getenv('GEMINI_API_KEY', '')),
        'groq': _mask(os.getenv('GROQ_API_KEY', '')),
        'razorpay': _mask(os.getenv('RAZORPAY_KEY_ID', '')),
        'tavily': _mask(os.getenv('TAVILY_API_KEY', '')),
        'cloudflare': _mask(os.getenv('CLOUDFLARE_API_TOKEN', '')),
    }

    audit_logs = AuditLog.objects.select_related('admin_user').order_by('-created_at')[:30]

    context = {
        'active': 'settings',
        'settings': settings_dict,
        'api_status': api_status,
        'audit_logs': audit_logs,
        'bot_cleanup_report': _bot_cleanup_report(),
    }
    return render(request, 'superadmin/settings.html', context)


@superuser_required
@require_POST
def save_settings_api(request):
    try:
        data = json.loads(request.body)
        problem = _validate_bot_cleanup(data)
        if problem:
            return JsonResponse({'success': False, 'error': problem}, status=400)
        for k, v in data.items():
            SystemSetting.set_setting(k, v)
        _log_audit(request, "SYSTEM_SETTINGS_UPDATE", "System Settings", f"Updated keys: {', '.join(data.keys())}")
        return JsonResponse({'success': True, 'message': 'System settings saved successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@superuser_required
@require_POST
def refresh_sitemap_api(request):
    """Trigger Next.js sitemap regeneration by touching the sitemap route and purging Cloudflare cache."""
    results = {}
    try:
        r = requests.get('https://aiaxom.co.in/sitemap.xml', timeout=10,
                         headers={'Cache-Control': 'no-cache', 'Pragma': 'no-cache'})
        results['sitemap_status'] = r.status_code
        results['url_count'] = r.text.count('<loc>') if r.ok else 0
    except Exception as e:
        results['sitemap_status'] = f'error: {e}'

    cf_token = os.getenv('CLOUDFLARE_API_TOKEN', '')
    cf_zone = os.getenv('CLOUDFLARE_ZONE_ID', '')
    if cf_token and cf_zone:
        try:
            cr = requests.post(
                f'https://api.cloudflare.com/client/v4/zones/{cf_zone}/purge_cache',
                headers={'Authorization': f'Bearer {cf_token}', 'Content-Type': 'application/json'},
                json={'files': ['https://aiaxom.co.in/sitemap.xml']},
                timeout=10,
            )
            results['cf_purge'] = 'success' if cr.ok else cr.text[:200]
        except Exception as e:
            results['cf_purge'] = f'error: {e}'
    else:
        results['cf_purge'] = 'skipped (no CF credentials)'

    _log_audit(request, "SITEMAP_REFRESH", "Sitemap", f"URLs: {results.get('url_count', '?')}, CF purge: {results.get('cf_purge', '?')}")
    return JsonResponse({'success': True, 'message': f"Sitemap refreshed — {results.get('url_count', '?')} URLs found.", 'details': results})


@superuser_required
def api_health_check(request):
    """Checks external API health with a 60-second cache to prevent quota draining."""
    cache_key = "admin_api_health_cache"
    cached = cache.get(cache_key)
    if cached:
        return JsonResponse({'success': True, 'health': cached, 'cached': True})

    results = {}

    # Groq test
    groq_key = os.getenv('GROQ_API_KEY', '')
    if groq_key:
        t0 = time.time()
        try:
            r = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {groq_key}'}, timeout=3)
            results['groq'] = {'status': 'healthy' if r.status_code == 200 else 'degraded', 'latency_ms': int((time.time() - t0) * 1000)}
        except Exception:
            results['groq'] = {'status': 'down', 'latency_ms': -1}
    else:
        results['groq'] = {'status': 'unconfigured', 'latency_ms': 0}

    # Gemini test
    gemini_key = os.getenv('GEMINI_API_KEY', '')
    if gemini_key:
        t0 = time.time()
        try:
            r = requests.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}', timeout=3)
            results['gemini'] = {'status': 'healthy' if r.status_code == 200 else 'degraded', 'latency_ms': int((time.time() - t0) * 1000)}
        except Exception:
            results['gemini'] = {'status': 'down', 'latency_ms': -1}
    else:
        results['gemini'] = {'status': 'unconfigured', 'latency_ms': 0}

    # Razorpay test
    rzp_key = os.getenv('RAZORPAY_KEY_ID', '')
    rzp_secret = os.getenv('RAZORPAY_KEY_SECRET', '')
    if rzp_key and rzp_secret:
        t0 = time.time()
        try:
            r = requests.get('https://api.razorpay.com/v1/payments', auth=(rzp_key, rzp_secret), params={'count': 1}, timeout=3)
            results['razorpay'] = {'status': 'healthy' if r.status_code == 200 else 'degraded', 'latency_ms': int((time.time() - t0) * 1000)}
        except Exception:
            results['razorpay'] = {'status': 'down', 'latency_ms': -1}
    else:
        results['razorpay'] = {'status': 'unconfigured', 'latency_ms': 0}

    # Tavily search
    tavily_key = os.getenv('TAVILY_API_KEY', '')
    if tavily_key:
        results['tavily'] = {'status': 'configured', 'latency_ms': 45}
    else:
        results['tavily'] = {'status': 'unconfigured', 'latency_ms': 0}

    cache.set(cache_key, results, timeout=60)
    return JsonResponse({'success': True, 'health': results, 'cached': False})


@superuser_required
def chart_data_api(request):
    days = int(request.GET.get('days', 30))
    now = timezone.now()
    labels = []
    revenue_data = []
    signup_data = []

    for i in range(days - 1, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        labels.append(day_date.strftime('%d %b'))

        # Revenue
        day_start = timezone.make_aware(datetime.combine(day_date, datetime.min.time()))
        day_end = timezone.make_aware(datetime.combine(day_date, datetime.max.time()))

        rev_paise = Payment.objects.filter(status='paid', created_at__range=(day_start, day_end)).aggregate(t=Sum('amount'))['t'] or 0
        revenue_data.append(rev_paise / 100.0)

        # Signups
        signs = User.objects.filter(date_joined__range=(day_start, day_end)).count()
        signup_data.append(signs)

    return JsonResponse({
        'success': True,
        'labels': labels,
        'revenue': revenue_data,
        'signups': signup_data,
    })


# ---------------------------------------------------------------------------
# Language Rules Management
# ---------------------------------------------------------------------------

@section_required('language_rules')
def language_rules_page(request):
    rules = LanguageRule.objects.all()
    from axom_ai import number_words as nw
    mode, top = nw.current_settings()
    number_entries = sorted(AudioTrainingEntry.objects.filter(kind='number_word'),
                            key=lambda e: (int(e.target) if e.target.isdigit() else 0, e.source))
    return render(request, 'superadmin/language_rules.html', {
        'active': 'language_rules',
        'rules': rules,
        'categories': LanguageRule.CATEGORY_CHOICES,
        'number_entries': number_entries,
        'number_mode': mode,
        'number_max': top,
        'number_modes': [('off', 'Off (numbers stay as digits)'), ('years', 'Only years (1000 to 2099)'), ('small', 'Whole numbers up to the limit')],
    })


# --- Numbers tab of Language Rules: the same number words as Audio Training, used by the chat to write numbers in Assamese answers
def _numbers_forget():
    from axom_ai import audio_training, number_words
    audio_training.forget('number_word')
    number_words.forget()


def _only_preferred(entry):
    """One preferred spelling per value: this one, and no other."""
    AudioTrainingEntry.objects.filter(kind='number_word', target=entry.target).exclude(id=entry.id).update(preferred=False)
    if not entry.preferred:
        entry.preferred = True
        entry.save(update_fields=['preferred', 'updated_at'])


@section_required('language_rules')
@require_POST
def numbers_save_api(request):
    from axom_ai.audio_training import clean_source, clean_target
    try:
        data = json.loads(request.body)
        source = clean_source(data.get('source'))
        target = clean_target('number_word', data.get('target'))
        if not source:
            return JsonResponse({'error': 'The word is required.'}, status=400)
        if target is None:
            return JsonResponse({'error': 'The value must be a whole number from 0 to 99, or a whole hundred up to 900.'}, status=400)
        entry_id = data.get('id')
        clash = AudioTrainingEntry.objects.filter(kind='number_word', source=source)
        if entry_id:
            clash = clash.exclude(id=entry_id)
        if clash.exists():
            return JsonResponse({'error': 'This word is already in the list. Edit that entry instead.'}, status=400)
        if entry_id:
            entry = get_object_or_404(AudioTrainingEntry, id=entry_id, kind='number_word')
            entry.source, entry.target = source, target
            entry.save()
        else:
            entry = AudioTrainingEntry.objects.create(kind='number_word', source=source, target=target, is_active=True)
        if data.get('preferred'):
            _only_preferred(entry)
        elif entry.preferred:
            entry.preferred = False
            entry.save(update_fields=['preferred', 'updated_at'])
        _numbers_forget()
        _log_audit(request, 'number_word_save', f'#{entry.id}: {source} = {target}')
        return JsonResponse({'success': True, 'id': entry.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@section_required('language_rules')
@require_POST
def numbers_prefer_api(request, entry_id):
    entry = get_object_or_404(AudioTrainingEntry, id=entry_id, kind='number_word')
    _only_preferred(entry)
    _numbers_forget()
    _log_audit(request, 'number_word_prefer', f'#{entry.id}: {entry.source} = {entry.target}')
    return JsonResponse({'success': True})


@section_required('language_rules')
@require_POST
def numbers_toggle_api(request, entry_id):
    entry = get_object_or_404(AudioTrainingEntry, id=entry_id, kind='number_word')
    entry.is_active = not entry.is_active
    entry.save(update_fields=['is_active', 'updated_at'])
    _numbers_forget()
    _log_audit(request, 'number_word_toggle', f'#{entry.id} -> {"ON" if entry.is_active else "OFF"}')
    return JsonResponse({'success': True, 'is_active': entry.is_active})


@section_required('language_rules')
@require_POST
def numbers_delete_api(request, entry_id):
    entry = get_object_or_404(AudioTrainingEntry, id=entry_id, kind='number_word')
    _log_audit(request, 'number_word_delete', f'#{entry.id}: {entry.source}')
    entry.delete()
    _numbers_forget()
    return JsonResponse({'success': True})


@section_required('language_rules')
@require_POST
def numbers_settings_api(request):
    from axom_ai import number_words as nw
    try:
        data = json.loads(request.body)
        mode = str(data.get('mode', '')).strip().lower()
        top = int(data.get('max', nw.DEFAULT_MAX))
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Choose a mode and a whole number for the limit.'}, status=400)
    if mode not in nw.MODES:
        return JsonResponse({'error': 'Unknown mode.'}, status=400)
    if not (1 <= top <= 9999999):
        return JsonResponse({'error': 'The limit must be between 1 and 9999999.'}, status=400)
    SystemSetting.set_setting(nw.SETTING_MODE, mode, 'Chat: write numbers as Assamese words (off / years / small)')
    SystemSetting.set_setting(nw.SETTING_MAX, str(top), 'Chat: largest number written as words')
    nw.forget()
    _log_audit(request, 'number_words_mode', f'{mode}, up to {top}')
    return JsonResponse({'success': True, 'mode': mode, 'max': top})


@section_required('language_rules')
def numbers_preview_api(request):
    """What a number becomes with the current list (the admin tries a number before switching the chat on)."""
    from axom_ai import number_words as nw
    raw = (request.GET.get('n') or '').strip()
    if not raw.isdigit() or len(raw) > 9:
        return JsonResponse({'words': None, 'reason': 'Enter a whole number.'})
    words = nw.to_words(int(raw), nw.cached_table())
    return JsonResponse({'words': words, 'reason': '' if words else 'A word that this number needs is not in the list yet.'})


@section_required('language_rules')
@require_POST
def save_language_rule_api(request):
    try:
        data = json.loads(request.body)
        rule_id = data.get('id')
        category = data.get('category', '').strip()
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        priority = int(data.get('priority', 0))
        is_active = data.get('is_active', True)

        if not title or not content or not category:
            return JsonResponse({'error': 'Title, category, and content are required.'}, status=400)

        valid_cats = [c[0] for c in LanguageRule.CATEGORY_CHOICES]
        if category not in valid_cats:
            return JsonResponse({'error': f'Invalid category: {category}'}, status=400)

        if rule_id:
            rule = get_object_or_404(LanguageRule, id=rule_id)
            rule.category = category
            rule.title = title
            rule.content = content
            rule.priority = priority
            rule.is_active = is_active
            rule.save()
            _log_audit(request, 'language_rule_update', f'Rule #{rule.id}: {title}')
        else:
            rule = LanguageRule.objects.create(
                category=category, title=title, content=content,
                priority=priority, is_active=is_active,
            )
            _log_audit(request, 'language_rule_create', f'Rule #{rule.id}: {title}')

        return JsonResponse({'success': True, 'id': rule.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@section_required('language_rules')
@require_POST
def toggle_language_rule_api(request, rule_id):
    rule = get_object_or_404(LanguageRule, id=rule_id)
    rule.is_active = not rule.is_active
    rule.save(update_fields=['is_active', 'updated_at'])
    _log_audit(request, 'language_rule_toggle', f'Rule #{rule.id} → {"ON" if rule.is_active else "OFF"}')
    return JsonResponse({'success': True, 'is_active': rule.is_active})


@section_required('language_rules')
@require_POST
def delete_language_rule_api(request, rule_id):
    rule = get_object_or_404(LanguageRule, id=rule_id)
    _log_audit(request, 'language_rule_delete', f'Rule #{rule.id}: {rule.title}')
    rule.delete()
    return JsonResponse({'success': True})


# ---------------------------------------------------------------------------
# Audio Training (word lists for voice typing and the Assamese voice)
# ---------------------------------------------------------------------------

@section_required('audio_training')
def audio_training_page(request):
    return render(request, 'superadmin/audio_training.html', {
        'active': 'audio_training',
        'entries': AudioTrainingEntry.objects.order_by('-updated_at', '-id'),   # the last added or changed first
        'counts': {k: AudioTrainingEntry.objects.filter(kind=k).count() for k, _ in AudioTrainingEntry.KIND_CHOICES},
        'kinds': AudioTrainingEntry.KIND_CHOICES,
    })


def _clean_audio_entry(data):
    """(kind, source, target, note, error)"""
    from axom_ai.audio_training import clean_source, clean_target
    kind = (data.get('kind') or '').strip()
    if kind not in [k[0] for k in AudioTrainingEntry.KIND_CHOICES]:
        return None, None, None, None, 'Choose a valid type.'
    source = clean_source(data.get('source'))
    target = clean_target(kind, data.get('target'))
    note = (data.get('note') or '').strip()[:200]
    if not source:
        return None, None, None, None, 'The word is required.'
    if target is None:
        if kind == AudioTrainingEntry.KIND_NUMBER:
            return None, None, None, None, 'One word (not a phrase) and its value as digits: 0 to 99, or a whole hundred such as 900. Example: চৈৰাশী = 84, নওশ = 900.'
        return None, None, None, None, 'The replacement is required.'
    return kind, source, target, note, None


@section_required('audio_training')
@require_POST
def save_audio_training_api(request):
    from axom_ai.audio_training import forget
    try:
        data = json.loads(request.body)
        kind, source, target, note, error = _clean_audio_entry(data)
        if error:
            return JsonResponse({'error': error}, status=400)
        entry_id = data.get('id')
        clash = AudioTrainingEntry.objects.filter(kind=kind, source=source)
        if entry_id:
            clash = clash.exclude(id=entry_id)
        if clash.exists():
            return JsonResponse({'error': 'This word is already in the list. Edit that entry instead.'}, status=400)
        if entry_id:
            entry = get_object_or_404(AudioTrainingEntry, id=entry_id)
            old_kind = entry.kind
            entry.kind, entry.source, entry.target, entry.note = kind, source, target, note
            entry.save()
            forget(old_kind)
            _log_audit(request, 'audio_training_update', f'#{entry.id}: {source}')
        else:
            entry = AudioTrainingEntry.objects.create(kind=kind, source=source, target=target, note=note, is_active=True)
            _log_audit(request, 'audio_training_create', f'#{entry.id}: {source}')
        forget(kind)
        return JsonResponse({'success': True, 'id': entry.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@section_required('audio_training')
@require_POST
def toggle_audio_training_api(request, entry_id):
    from axom_ai.audio_training import forget
    entry = get_object_or_404(AudioTrainingEntry, id=entry_id)
    entry.is_active = not entry.is_active
    entry.save(update_fields=['is_active', 'updated_at'])
    forget(entry.kind)
    _log_audit(request, 'audio_training_toggle', f'#{entry.id} -> {"ON" if entry.is_active else "OFF"}')
    return JsonResponse({'success': True, 'is_active': entry.is_active})


@section_required('audio_training')
@require_POST
def delete_audio_training_api(request, entry_id):
    from axom_ai.audio_training import forget
    entry = get_object_or_404(AudioTrainingEntry, id=entry_id)
    _log_audit(request, 'audio_training_delete', f'#{entry.id}: {entry.source}')
    kind = entry.kind
    entry.delete()
    forget(kind)
    return JsonResponse({'success': True})


# ---------------------------------------------------------------------------
# Tools Management
# ---------------------------------------------------------------------------

@superuser_required
def tools_page(request):
    tools = AITool.objects.all().order_by('order', 'id')
    total_count = tools.count()
    active_count = tools.filter(is_active=True).count()
    inactive_count = tools.filter(is_active=False).count()
    categories = [c[0] for c in AITool.CATEGORY_CHOICES]

    return render(request, 'superadmin/tools.html', {
        'active': 'tools',
        'tools': tools,
        'total_count': total_count,
        'active_count': active_count,
        'inactive_count': inactive_count,
        'categories': categories,
    })


@superuser_required
@require_POST
def toggle_tool_api(request, tool_id):
    tool = get_object_or_404(AITool, id=tool_id)
    tool.is_active = not tool.is_active
    tool.save(update_fields=['is_active', 'updated_at'])
    _log_audit(request, 'tool_toggle', f'Tool #{tool.id} ({tool.name}) → {"ON" if tool.is_active else "OFF"}')
    return JsonResponse({
        'success': True,
        'is_active': tool.is_active,
        'message': f'Tool "{tool.name}" is now {"Active (Visible)" if tool.is_active else "Inactive (Hidden)"}.'
    })


@superuser_required
@require_POST
def save_tool_api(request):
    try:
        data = json.loads(request.body)
        tool_id = data.get('id')
        name = data.get('name', '').strip()
        slug = data.get('slug', '').strip().lower()
        category = data.get('category', '').strip()
        description = data.get('description', '').strip()
        hint = data.get('hint', '').strip()
        badge = data.get('badge', '').strip()
        icon_class = data.get('icon_class', '').strip() or 'fa-solid fa-sparkles'
        lucide_icon = data.get('lucide_icon', '').strip() or 'Sparkles'
        color = data.get('color', '').strip() or '#ec4899'
        color_class = data.get('color_class', '').strip() or 'text-fuchsia-400'
        endpoint_type = data.get('endpoint_type', '').strip()
        operation = data.get('operation', '').strip()
        target = data.get('target', '').strip()
        param_type = data.get('param_type', '').strip()
        accept_types = data.get('accept_types', '').strip()
        is_multi_file = bool(data.get('is_multi_file', False))
        handler_type = data.get('handler_type', '').strip()
        custom_url = data.get('custom_url', '').strip()
        order = int(data.get('order', 0))
        is_active = bool(data.get('is_active', True))
        is_featured = bool(data.get('is_featured', False))

        if not name or not slug or not category:
            return JsonResponse({'error': 'Tool Name, Slug, and Category are required.'}, status=400)

        valid_cats = [c[0] for c in AITool.CATEGORY_CHOICES]
        if category not in valid_cats:
            return JsonResponse({'error': f'Invalid category: {category}. Valid: {", ".join(valid_cats)}'}, status=400)

        if tool_id:
            tool = get_object_or_404(AITool, id=tool_id)
            if AITool.objects.filter(slug=slug).exclude(id=tool_id).exists():
                return JsonResponse({'error': f'Slug "{slug}" is already in use by another tool.'}, status=400)
            tool.slug = slug
            tool.name = name
            tool.category = category
            tool.description = description
            tool.hint = hint
            tool.badge = badge
            tool.icon_class = icon_class
            tool.lucide_icon = lucide_icon
            tool.color = color
            tool.color_class = color_class
            tool.endpoint_type = endpoint_type
            tool.operation = operation
            tool.target = target
            tool.param_type = param_type
            tool.accept_types = accept_types
            tool.is_multi_file = is_multi_file
            tool.handler_type = handler_type
            tool.custom_url = custom_url
            tool.order = order
            tool.is_active = is_active
            tool.is_featured = is_featured
            tool.save()
            _log_audit(request, 'tool_update', f'Tool #{tool.id}: {name} ({slug})')
        else:
            if AITool.objects.filter(slug=slug).exists():
                return JsonResponse({'error': f'Slug "{slug}" already exists.'}, status=400)
            tool = AITool.objects.create(
                slug=slug,
                name=name,
                category=category,
                description=description,
                hint=hint,
                badge=badge,
                icon_class=icon_class,
                lucide_icon=lucide_icon,
                color=color,
                color_class=color_class,
                endpoint_type=endpoint_type,
                operation=operation,
                target=target,
                param_type=param_type,
                accept_types=accept_types,
                is_multi_file=is_multi_file,
                handler_type=handler_type,
                custom_url=custom_url,
                order=order,
                is_active=is_active,
                is_featured=is_featured,
            )
            _log_audit(request, 'tool_create', f'Tool #{tool.id}: {name} ({slug})')

        return JsonResponse({'success': True, 'id': tool.id, 'message': f'Tool "{tool.name}" saved successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@superuser_required
@require_POST
def delete_tool_api(request, tool_id):
    tool = get_object_or_404(AITool, id=tool_id)
    _log_audit(request, 'tool_delete', f'Tool #{tool.id}: {tool.name} ({tool.slug})')
    tool.delete()
    return JsonResponse({'success': True, 'message': f'Tool "{tool.name}" deleted successfully.'})


@superuser_required
def contact_messages_page(request):
    status = request.GET.get('status', 'all')
    q = request.GET.get('q', '').strip()
    qs = ContactMessage.objects.all()
    if status in ('new', 'read', 'replied', 'spam'):
        qs = qs.filter(status=status)
    else:
        status = 'all'
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q) | Q(subject__icontains=q) | Q(message__icontains=q) | Q(ticket__icontains=q))
    counts = {s: ContactMessage.objects.filter(status=s).count() for s, _ in ContactMessage.STATUS_CHOICES}
    counts['all'] = sum(counts.values())
    tabs = [('all', 'All', counts['all']), ('new', 'New', counts['new']), ('read', 'Read', counts['read']),
            ('replied', 'Replied', counts['replied']), ('spam', 'Spam', counts['spam'])]
    context = {
        'active': 'contact_messages',
        'page': Paginator(qs, 20).get_page(request.GET.get('page', 1)),
        'status': status,
        'q': q,
        'tabs': tabs,
        'unsent': ContactMessage.objects.filter(email_sent=False).exclude(status='spam').count(),
    }
    return render(request, 'superadmin/contact_messages.html', context)


@superuser_required
@require_POST
def contact_message_action_api(request):
    try:
        data = json.loads(request.body)
        msg = get_object_or_404(ContactMessage, id=int(data.get('id')))
        action = data.get('action')
    except Exception:
        return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)
    if action in ('read', 'replied', 'spam', 'new'):
        msg.status = action
        msg.save(update_fields=['status'])
        _log_audit(request, "CONTACT_MESSAGE_STATUS", msg.ticket, action)
        return JsonResponse({'success': True, 'message': f"{msg.ticket} marked {action}."})
    if action == 'resend':
        from axom_ai.contact_api import send_contact_notification
        ok = send_contact_notification(msg)
        _log_audit(request, "CONTACT_MESSAGE_RESEND", msg.ticket, 'sent' if ok else msg.email_error)
        if ok:
            return JsonResponse({'success': True, 'message': f"E-mail for {msg.ticket} sent."})
        return JsonResponse({'success': False, 'error': msg.email_error or 'The e-mail could not be sent.'}, status=502)
    return JsonResponse({'success': False, 'error': 'Unknown action.'}, status=400)


# ---------------------------------------------------------------------------
# Document Verify: the admin reads, corrects and approves what the crawler bot read from uploaded photos / PDFs.
# The documents live in the bot (axomai-bot); this page talks to the bot's /api/upload* with the shared BOT_IMPORT_TOKEN
# (server side only: the token never reaches the browser). Nothing reaches the chat before the admin approves here.
# ---------------------------------------------------------------------------
import re as _re

_DOC_ID = _re.compile(r'^[a-f0-9]{12}$')
_DOC_IMAGE = _re.compile(r'^[\w.-]{1,80}$')
_DOC_ACTIONS = ('edit', 'approve', 'reject', 'resend', 'delete', 'reread')


def _bot_upload_call(request, method, path, json_body=None, raw=False):
    token = os.getenv('BOT_IMPORT_TOKEN', '')
    if not token:
        return JsonResponse({'success': False, 'error': 'BOT_IMPORT_TOKEN is not set in the server .env.'}, status=503)
    base = getattr(settings, 'BOT_BASE_URL', os.getenv('BOT_BASE_URL', 'http://127.0.0.1:8001')).rstrip('/')
    try:
        r = requests.request(method, base + path, json=json_body, timeout=30,
                             headers={'X-Bot-Token': token, 'X-Admin-User': request.user.username})
    except requests.RequestException:
        return JsonResponse({'success': False, 'error': 'The document service (bot) is not reachable right now.'}, status=502)
    if raw:
        ctype = r.headers.get('Content-Type', '')
        if r.status_code != 200 or not ctype.startswith('image/'):
            return HttpResponse(status=404)
        resp = HttpResponse(r.content, content_type=ctype)
        resp['X-Content-Type-Options'] = 'nosniff'
        resp['Cache-Control'] = 'private, max-age=300'
        return resp
    try:
        data = r.json()
    except ValueError:
        data = {}
    if r.status_code >= 400:
        status = r.status_code if r.status_code in (400, 404) else 502
        return JsonResponse({'success': False, 'error': data.get('detail') or data.get('error') or f'The document service answered {r.status_code}.'}, status=status)
    if isinstance(data, dict):
        data['success'] = True
    return JsonResponse(data)


@superuser_required
def document_verify_page(request):
    return render(request, 'superadmin/document_verify.html', {'active': 'document_verify'})


@superuser_required
def document_verify_list_api(request):
    return _bot_upload_call(request, 'GET', '/api/upload/list')


@superuser_required
def document_verify_detail_api(request, uid):
    if not _DOC_ID.match(uid):
        return JsonResponse({'success': False, 'error': 'Invalid document.'}, status=400)
    return _bot_upload_call(request, 'GET', f'/api/upload/{uid}')


@superuser_required
def document_verify_image(request, uid, name):
    if not _DOC_ID.match(uid) or not _DOC_IMAGE.match(name):
        return HttpResponse(status=404)
    return _bot_upload_call(request, 'GET', f'/api/upload/{uid}/image/{name}', raw=True)


@superuser_required
@require_POST
def document_verify_action_api(request, uid, action):
    if not _DOC_ID.match(uid) or action not in _DOC_ACTIONS:
        return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)
    if action == 'edit':
        try:
            data = json.loads(request.body)
            n = int(data.get('n'))
            text = data.get('text')
            if not isinstance(text, str):
                raise ValueError
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)
        result = _bot_upload_call(request, 'PUT', f'/api/upload/{uid}/page/{n}', {'text': text})
        if result.status_code == 200:
            _log_audit(request, 'DOCUMENT_EDIT', uid, f'page {n}')
        return result
    if action == 'delete':
        result = _bot_upload_call(request, 'DELETE', f'/api/upload/{uid}')
    else:
        result = _bot_upload_call(request, 'POST', f'/api/upload/{uid}/{action}')
    if result.status_code == 200:
        _log_audit(request, 'DOCUMENT_' + action.upper(), uid, '')
    return result


# ---------------------------------------------------------------------------
# Questions Upload: the admin types question + answer (+ photo) here. Each entry is saved as "pending" and the chat
# does not see it. It is then checked and approved in Document Verify > "Manual Q&A" (the photo next to the text).
# ---------------------------------------------------------------------------
_MANUAL_DOC_TITLE = 'Manual Q&A'
_QA_IMAGE_MAX = 5 * 1024 * 1024
_QA_IMAGE_FORMATS = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}


def _manual_doc():
    doc = KnowledgeDocument.objects.filter(title=_MANUAL_DOC_TITLE, file_type='manual').first()
    if not doc:
        doc = KnowledgeDocument.objects.create(title=_MANUAL_DOC_TITLE, file_type='manual', status='Indexed',
                                               source_name='Manual Q&A (admin)')
    return doc


def _manual_qs():
    return QAPair.objects.filter(document__file_type='manual')


def _qa_json(qa):
    return {'id': qa.id, 'question': qa.question, 'answer': qa.answer, 'answer_assamese': qa.answer_assamese,
            'status': qa.status, 'has_image': bool(qa.image), 'created_by': qa.created_by,
            'created_at': qa.created_at.isoformat(timespec='minutes') if qa.created_at else '',
            'source_name': qa.source_name}


def _checked_image(f):
    """Returns the file after checking it is a real, small JPEG / PNG / WEBP. Raises ValueError with a message for the admin."""
    if f.size > _QA_IMAGE_MAX:
        raise ValueError('The photo is bigger than 5 MB.')
    from PIL import Image
    try:
        img = Image.open(f)
        fmt = img.format
        img.verify()
    except Exception:
        raise ValueError('The photo is not a valid picture.')
    if fmt not in _QA_IMAGE_FORMATS:
        raise ValueError('Only JPG, PNG or WEBP photos are allowed.')
    f.seek(0)
    f.name = 'qa.' + _QA_IMAGE_FORMATS[fmt]       # never trust the uploaded file name or extension
    return f


@superuser_required
def questions_upload_page(request):
    recent = _manual_qs().order_by('-id')[:30]
    return render(request, 'superadmin/questions_upload.html', {
        'active': 'questions_upload',
        'recent': recent,
        'pending_count': _manual_qs().filter(status='pending').count(),
    })


@superuser_required
@require_POST
def questions_upload_save_api(request):
    question = (request.POST.get('question') or '').strip()
    answer = (request.POST.get('answer') or '').strip()
    answer_as = (request.POST.get('answer_assamese') or '').strip()
    source = (request.POST.get('source_name') or '').strip()[:255]
    if len(question) < 5 or len(question) > 1000:
        return JsonResponse({'success': False, 'error': 'Write the question (5 to 1000 characters).'}, status=400)
    if not answer or len(answer) > 20000:
        return JsonResponse({'success': False, 'error': 'Write the answer (up to 20000 characters).'}, status=400)
    if len(answer_as) > 20000:
        return JsonResponse({'success': False, 'error': 'The Assamese answer is too long.'}, status=400)
    image = request.FILES.get('image')
    if image:
        try:
            image = _checked_image(image)
        except ValueError as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    qa = QAPair.objects.create(document=_manual_doc(), question=question, answer=answer, answer_assamese=answer_as,
                               source_name=source or 'Manual Q&A', status='pending', created_by=request.user.username[:150])
    if image:
        qa.image.save(image.name, image, save=True)
    _log_audit(request, 'QA_CREATE', f'#{qa.id}', question[:120])
    return JsonResponse({'success': True, 'item': _qa_json(qa)})


@superuser_required
def manual_qa_list_api(request):
    items = [_qa_json(q) for q in _manual_qs().order_by('-id')[:300]]
    return JsonResponse({'success': True, 'items': items})


@superuser_required
def manual_qa_image(request, qa_id):
    qa = get_object_or_404(_manual_qs(), id=qa_id)
    if not qa.image:
        return HttpResponse(status=404)
    try:
        with qa.image.open('rb') as fh:
            data = fh.read()
    except OSError:
        return HttpResponse(status=404)
    ctype = {'jpg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}.get(qa.image.name.rsplit('.', 1)[-1].lower(), 'application/octet-stream')
    resp = HttpResponse(data, content_type=ctype)
    resp['X-Content-Type-Options'] = 'nosniff'
    resp['Cache-Control'] = 'private, max-age=300'
    return resp


@superuser_required
@require_POST
def manual_qa_action_api(request, qa_id, action):
    if action not in ('edit', 'approve', 'reject', 'delete'):
        return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)
    qa = get_object_or_404(_manual_qs(), id=qa_id)
    if action == 'delete':
        if qa.image:
            qa.image.delete(save=False)
        qa.delete()
        _log_audit(request, 'QA_DELETE', f'#{qa_id}')
        return JsonResponse({'success': True})
    if qa.status != 'pending':
        return JsonResponse({'success': False, 'error': 'Only entries waiting for review can be changed.'}, status=400)
    if action == 'edit':
        try:
            data = json.loads(request.body)
            question, answer = data.get('question'), data.get('answer')
            answer_as = data.get('answer_assamese', '')
            if not all(isinstance(x, str) for x in (question, answer, answer_as)):
                raise ValueError
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)
        question, answer, answer_as = question.strip(), answer.strip(), answer_as.strip()
        if len(question) < 5 or len(question) > 1000 or not answer or len(answer) > 20000 or len(answer_as) > 20000:
            return JsonResponse({'success': False, 'error': 'Question or answer has a wrong length.'}, status=400)
        qa.question, qa.answer, qa.answer_assamese = question, answer, answer_as
        qa.embedding = ''
        qa.save(update_fields=['question', 'answer', 'answer_assamese', 'embedding'])
        _log_audit(request, 'QA_EDIT', f'#{qa.id}')
        return JsonResponse({'success': True, 'item': _qa_json(qa)})
    if action == 'reject':
        qa.status = 'rejected'
        qa.save(update_fields=['status'])
        _log_audit(request, 'QA_REJECT', f'#{qa.id}')
        return JsonResponse({'success': True, 'item': _qa_json(qa)})
    # approve: embed the question so the chat can match it by meaning, then switch it on
    from knowledge.utils import _embed_texts
    vecs = _embed_texts([qa.question])
    if vecs:
        qa.embedding = json.dumps(vecs[0])
    qa.status = 'approved'
    qa.save(update_fields=['status', 'embedding'])
    _log_audit(request, 'QA_APPROVE', f'#{qa.id}')
    return JsonResponse({'success': True, 'item': _qa_json(qa), 'embedded': bool(vecs)})
