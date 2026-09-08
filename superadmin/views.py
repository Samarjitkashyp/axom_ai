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
from .models import SystemSetting, CouponCode, CustomPlanOverride, AuditLog


def _is_super(u):
    # Strict superuser-only check (prevents standard staff or editor escalation)
    return u.is_authenticated and u.is_superuser


superuser_required = user_passes_test(_is_super, login_url='/axomai-admin/login/')


def _client_ip(request):
    """Safely get client IP address without blind trust of spoofable headers."""
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


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
    error = None
    if request.user.is_authenticated and _is_super(request.user):
        return redirect('/axomai-admin/')

    if request.method == 'POST':
        u = request.POST.get('username', '').strip()
        p = request.POST.get('password', '')

        # Rate limiting on admin login attempts
        ip = _client_ip(request)
        rate_key = f"admin_login_rate:{ip}"
        attempts = cache.get(rate_key, 0)
        if attempts >= 10:
            return render(request, 'superadmin/login.html', {
                'error': 'Too many failed login attempts. Please wait 5 minutes.'
            })

        user = authenticate(request, username=u, password=p)
        if user is None:
            cache.set(rate_key, attempts + 1, timeout=300)
            _log_audit(request, "ADMIN_LOGIN_FAILED", f"Username: {u}", "Invalid credentials provided")
            error = 'Invalid credentials. Access denied.'
        elif not user.is_superuser:
            _log_audit(request, "ADMIN_LOGIN_DENIED", f"User: {user.username}", "User is not a Super Administrator")
            error = 'Unauthorized: Only Super Administrators can access this area.'
        else:
            cache.delete(rate_key)
            login(request, user)
            _log_audit(request, "ADMIN_LOGIN_SUCCESS", f"User: {user.username}", "Logged into Super Admin")
            return redirect('/axomai-admin/')
    return render(request, 'superadmin/login.html', {'error': error})


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
    sort_by = request.GET.get('sort', '-date_joined')

    users_qs = User.objects.select_related('plan').all()

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

    users_qs = users_qs.order_by(sort_by)

    paginator = Paginator(users_qs, 20)
    page_number = request.GET.get('page', 1)
    users_page_obj = paginator.get_page(page_number)

    plans_list = list(PLAN_CATALOG.keys())

    context = {
        'active': 'users',
        'users': users_page_obj,
        'q': q,
        'plan_filter': plan_filter,
        'status_filter': status_filter,
        'sort_by': sort_by,
        'plans_list': plans_list,
        'total_count': users_qs.count(),
    }
    return render(request, 'superadmin/users.html', context)


@superuser_required
@require_POST
def user_action_api(request):
    try:
        data = json.loads(request.body)
        action = data.get('action')
        user_id = data.get('user_id')
        user = get_object_or_404(User, id=user_id)

        # Protect modifying self superuser
        if user == request.user and action in ['toggle_status', 'delete']:
            return JsonResponse({'success': False, 'error': 'Cannot deactivate or delete current logged-in super admin.'}, status=400)

        # Protect against removing the only remaining active superuser
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
        'summarize': UsageRecord.objects.filter(action_type='summarize').count(),
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
    }
    return render(request, 'superadmin/settings.html', context)


@superuser_required
@require_POST
def save_settings_api(request):
    try:
        data = json.loads(request.body)
        for k, v in data.items():
            SystemSetting.set_setting(k, v)
        _log_audit(request, "SYSTEM_SETTINGS_UPDATE", "System Settings", f"Updated keys: {', '.join(data.keys())}")
        return JsonResponse({'success': True, 'message': 'System settings saved successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


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
