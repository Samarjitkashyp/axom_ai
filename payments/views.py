import hashlib
import hmac
import json
import logging
import time
from datetime import timedelta

import razorpay
from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from .models import PLAN_CATALOG, Payment, UserPlan


def _rate_limited(key: str, max_calls: int, per_seconds: int) -> bool:
    """Simple sliding-window rate limit backed by Django's cache. Returns True if the
    caller has exceeded the budget in the last `per_seconds`. Keeps timestamps in a list."""
    now = time.time()
    hits = [t for t in (cache.get(key) or []) if t > now - per_seconds]
    if len(hits) >= max_calls:
        cache.set(key, hits, timeout=per_seconds + 5)
        return True
    hits.append(now)
    cache.set(key, hits, timeout=per_seconds + 5)
    return False

log = logging.getLogger(__name__)


def _client():
    key = settings.RAZORPAY_KEY_ID
    secret = settings.RAZORPAY_KEY_SECRET
    if not key or not secret:
        raise RuntimeError("Razorpay keys not configured (set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env)")
    return razorpay.Client(auth=(key, secret))


def _plan_status_dict(user_plan: UserPlan | None):
    if not user_plan:
        return {"active": False, "plan": None, "expires_at": None, "days_left": 0}
    now = timezone.now()
    if user_plan.status == "active" and user_plan.expires_at <= now:
        user_plan.status = "expired"
        user_plan.save(update_fields=["status", "updated_at"])
    days_left = max(0, (user_plan.expires_at - now).days) if user_plan.expires_at else 0
    return {
        "active": user_plan.status == "active",
        "plan": user_plan.plan,
        "plan_label": PLAN_CATALOG.get(user_plan.plan, {}).get("label", user_plan.plan),
        "started_at": user_plan.started_at.isoformat() if user_plan.started_at else None,
        "expires_at": user_plan.expires_at.isoformat() if user_plan.expires_at else None,
        "days_left": days_left,
        "status": user_plan.status,
    }


@require_POST
def create_order(request):
    """Body: { "plan": "pro_monthly" } -> Razorpay order for that plan.
    CSRF-protected. Rate-limited: 5 orders / minute / user."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "login required"}, status=401)
    if _rate_limited(f"pay:order:{request.user.id}", max_calls=5, per_seconds=60):
        return JsonResponse({"error": "too many attempts — try again in a minute"}, status=429)

    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid json"}, status=400)

    plan_id = (body.get("plan") or "").strip()
    coupon_code = (body.get("coupon") or "").strip().upper()
    plan = PLAN_CATALOG.get(plan_id)
    if not plan:
        return JsonResponse({"error": f"unknown plan '{plan_id}'"}, status=400)

    final_amount = plan["amount"]
    applied_coupon_str = ""
    if coupon_code:
        try:
            from superadmin.models import CouponCode
            c = CouponCode.objects.filter(code=coupon_code).first()
            if c and c.is_valid():
                discount = int(final_amount * (c.discount_percent / 100.0))
                final_amount = max(100, final_amount - discount)
                applied_coupon_str = c.code
        except Exception:
            pass

    try:
        client = _client()
        order = client.order.create({
            "amount": final_amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "plan": plan_id,
                "user_id": str(request.user.id),
                "username": request.user.username,
                "coupon": applied_coupon_str
            },
        })
    except Exception as e:
        log.exception("razorpay order.create failed")
        return JsonResponse({"error": f"gateway error: {e}"}, status=502)

    Payment.objects.create(
        user=request.user,
        plan=plan_id,
        amount=final_amount,
        currency="INR",
        coupon_code=applied_coupon_str,
        razorpay_order_id=order["id"],
        status="created",
    )

    return JsonResponse({
        "order_id": order["id"],
        "amount": final_amount,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan": plan_id,
        "plan_label": plan["label"],
        "days": plan["days"],
        "coupon_applied": applied_coupon_str,
        "user_name": request.user.get_full_name() or request.user.username,
        "user_email": request.user.email or "",
    })


@require_POST
def verify_payment(request):
    """Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } -> activate UserPlan.
    CSRF-protected. Rate-limited: 15 verifies / minute / user."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "login required"}, status=401)
    if _rate_limited(f"pay:verify:{request.user.id}", max_calls=15, per_seconds=60):
        return JsonResponse({"error": "too many verify attempts"}, status=429)

    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid json"}, status=400)

    order_id = body.get("razorpay_order_id", "")
    payment_id = body.get("razorpay_payment_id", "")
    signature = body.get("razorpay_signature", "")
    if not (order_id and payment_id and signature):
        return JsonResponse({"error": "missing fields"}, status=400)

    try:
        payment = Payment.objects.get(razorpay_order_id=order_id, user=request.user)
    except Payment.DoesNotExist:
        return JsonResponse({"error": "order not found"}, status=404)

    # Idempotency: already processed? Return the current plan snapshot instead of re-extending.
    if payment.status == "paid":
        user_plan = UserPlan.objects.filter(user=request.user).first()
        return JsonResponse({"ok": True, "already_processed": True, "plan": _plan_status_dict(user_plan)})

    try:
        client = _client()
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
    except razorpay.errors.SignatureVerificationError:
        payment.status = "failed"
        payment.save(update_fields=["status"])
        return JsonResponse({"error": "signature mismatch"}, status=400)
    except Exception as e:
        log.exception("signature verify crashed")
        return JsonResponse({"error": f"verify error: {e}"}, status=500)

    payment.razorpay_payment_id = payment_id
    payment.razorpay_signature = signature
    user_plan = _activate_plan(request.user, payment)
    return JsonResponse({"ok": True, "plan": _plan_status_dict(user_plan)})


def _activate_plan(user, payment) -> UserPlan:
    """Idempotent plan activation from a verified Payment. Extends same-plan-active,
    otherwise resets duration from now. Marks Payment paid."""
    plan = PLAN_CATALOG[payment.plan]
    now = timezone.now()
    user_plan, _ = UserPlan.objects.get_or_create(
        user=user,
        defaults={"plan": payment.plan, "started_at": now, "expires_at": now + timedelta(days=plan["days"])},
    )
    if user_plan.plan == payment.plan and user_plan.status == "active" and user_plan.expires_at > now:
        base = user_plan.expires_at
    else:
        base = now
    user_plan.plan = payment.plan
    user_plan.started_at = user_plan.started_at or now
    user_plan.expires_at = base + timedelta(days=plan["days"])
    user_plan.status = "active"
    user_plan.save()

    payment.status = "paid"
    payment.paid_at = now
    payment.save()

    if getattr(payment, 'coupon_code', None):
        try:
            from superadmin.models import CouponCode
            c = CouponCode.objects.filter(code=payment.coupon_code).first()
            if c:
                c.uses_count += 1
                c.save(update_fields=['uses_count'])
        except Exception:
            pass

    return user_plan


@require_GET
def plan_status(request):
    """GET current user's plan (or anonymous placeholder)."""
    if not request.user.is_authenticated:
        return JsonResponse({"active": False, "anonymous": True})
    user_plan = UserPlan.objects.filter(user=request.user).first()
    return JsonResponse(_plan_status_dict(user_plan))


@csrf_exempt  # webhooks are server-to-server; we authenticate via HMAC signature instead
@require_POST
def razorpay_webhook(request):
    """Razorpay server-to-server callback. Configure in Razorpay Dashboard ->
    Settings -> Webhooks with URL /api/payment/webhook/ and event `payment.captured`.
    We authenticate the request via HMAC-SHA256 of raw body against RAZORPAY_WEBHOOK_SECRET."""
    secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "") or ""
    if not secret:
        log.warning("webhook hit but RAZORPAY_WEBHOOK_SECRET not configured")
        return JsonResponse({"error": "webhook not configured"}, status=503)

    received_sig = request.headers.get("X-Razorpay-Signature", "")
    raw = request.body  # bytes
    expected_sig = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(received_sig, expected_sig):
        log.warning("webhook signature mismatch")
        return JsonResponse({"error": "bad signature"}, status=400)

    try:
        payload = json.loads(raw or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid json"}, status=400)

    event = payload.get("event", "")
    if event != "payment.captured":
        # We only act on capture. Ignore payment.authorized, refunded, etc for now.
        return JsonResponse({"ok": True, "ignored": event})

    pentity = (payload.get("payload", {}).get("payment", {}) or {}).get("entity", {}) or {}
    order_id = pentity.get("order_id", "")
    payment_id = pentity.get("id", "")
    if not order_id or not payment_id:
        return JsonResponse({"error": "missing ids in event"}, status=400)

    try:
        payment = Payment.objects.get(razorpay_order_id=order_id)
    except Payment.DoesNotExist:
        log.warning("webhook for unknown order %s", order_id)
        return JsonResponse({"error": "order not found"}, status=404)

    # Idempotent: already processed -> ack silently
    if payment.status == "paid":
        return JsonResponse({"ok": True, "already_processed": True})

    payment.razorpay_payment_id = payment_id
    payment.razorpay_signature = ""  # webhooks don't have client-side sig; HMAC on body already verified
    _activate_plan(payment.user, payment)
    return JsonResponse({"ok": True, "activated": payment.plan})
