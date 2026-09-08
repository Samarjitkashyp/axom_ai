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
from superadmin.models import CustomPlanOverride, SystemSetting, CouponCode
from knowledge.models import ChatSession, ChatMessage
from .models import UserProfile, SupportTicket, TicketReply, UsageRecord, InAppNotification


def _rate_limited(key: str, max_calls: int, per_seconds: int) -> bool:
    """Sliding-window rate limiter using cache."""
    now = time.time()
    hits = [t for t in (cache.get(key) or []) if t > now - per_seconds]
    if len(hits) >= max_calls:
        cache.set(key, hits, timeout=per_seconds + 5)
        return True
    hits.append(now)
    cache.set(key, hits, timeout=per_seconds + 5)
    return False


def login_view(request):
    error = None
    if request.user.is_authenticated:
        return redirect('/axomai-user/')

    if request.method == 'POST':
        u = request.POST.get('username', '').strip()
        p = request.POST.get('password', '')

        # Rate limit login attempts per IP
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        if _rate_limited(f"user_login_rate:{ip}", max_calls=12, per_seconds=300):
            return render(request, 'userpanel/login.html', {'error': 'Too many login attempts. Please wait 5 minutes.'})

        user = authenticate(request, username=u, password=p)
        if user is None:
            error = 'Invalid username or password.'
        elif not user.is_active:
            error = 'This account has been deactivated. Please contact support.'
        else:
            login(request, user)
            UserProfile.objects.get_or_create(user=user)

            # Link any current session chats to this user
            if request.session.session_key:
                ChatSession.objects.filter(session_key=request.session.session_key, user__isnull=True).update(user=user)

            return redirect('/axomai-user/')
    return render(request, 'userpanel/login.html', {'error': error})


def logout_view(request):
    logout(request)
    return redirect('/axomai-user/login/')


def _get_user_limits(user):
    """Compute daily quota limits for user based on their active plan."""
    now = timezone.now()
    plan_name = "free"
    is_active_plan = False
    plan_obj = getattr(user, 'plan', None) if hasattr(user, 'plan') else None

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

    return {
        'plan_name': plan_name,
        'is_active': is_active_plan,
        'plan_obj': plan_obj,
        'img_limit': img_limit,
        'search_limit': search_limit,
        'chat_limit': -1,
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

        if hasattr(request.user, 'plan'):
            request.user.plan.status = 'expired'
            request.user.plan.save()

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
        if hasattr(user, 'plan'):
            user.plan.status = 'expired'
            user.plan.save()

        logout(request)
        return JsonResponse({'success': True, 'message': 'Account deactivated successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='/axomai-user/login/')
@require_POST
def mark_notifications_read_api(request):
    InAppNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True})
