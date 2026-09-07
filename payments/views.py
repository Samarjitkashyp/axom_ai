import json
import logging
from datetime import timedelta

import razorpay
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from .models import PLAN_CATALOG, Payment, UserPlan

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


@csrf_exempt
@require_POST
def create_order(request):
    """Body: { "plan": "pro_monthly" } -> Razorpay order for that plan."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "login required"}, status=401)

    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid json"}, status=400)

    plan_id = (body.get("plan") or "").strip()
    plan = PLAN_CATALOG.get(plan_id)
    if not plan:
        return JsonResponse({"error": f"unknown plan '{plan_id}'"}, status=400)

    try:
        client = _client()
        order = client.order.create({
            "amount": plan["amount"],
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"plan": plan_id, "user_id": str(request.user.id), "username": request.user.username},
        })
    except Exception as e:
        log.exception("razorpay order.create failed")
        return JsonResponse({"error": f"gateway error: {e}"}, status=502)

    Payment.objects.create(
        user=request.user,
        plan=plan_id,
        amount=plan["amount"],
        currency="INR",
        razorpay_order_id=order["id"],
        status="created",
    )

    return JsonResponse({
        "order_id": order["id"],
        "amount": plan["amount"],
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan": plan_id,
        "plan_label": plan["label"],
        "days": plan["days"],
        "user_name": request.user.get_full_name() or request.user.username,
        "user_email": request.user.email or "",
    })


@csrf_exempt
@require_POST
def verify_payment(request):
    """Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } -> activate UserPlan."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "login required"}, status=401)

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

    plan = PLAN_CATALOG[payment.plan]
    now = timezone.now()

    user_plan, _ = UserPlan.objects.get_or_create(
        user=request.user,
        defaults={"plan": payment.plan, "started_at": now, "expires_at": now + timedelta(days=plan["days"])},
    )
    # If already exists (renewal / upgrade): extend from later of (now, current expiry) when same plan;
    # otherwise reset from now.
    if user_plan.plan == payment.plan and user_plan.status == "active" and user_plan.expires_at > now:
        base = user_plan.expires_at
    else:
        base = now
    user_plan.plan = payment.plan
    user_plan.started_at = user_plan.started_at or now
    user_plan.expires_at = base + timedelta(days=plan["days"])
    user_plan.status = "active"
    user_plan.save()

    payment.razorpay_payment_id = payment_id
    payment.razorpay_signature = signature
    payment.status = "paid"
    payment.paid_at = now
    payment.save()

    return JsonResponse({"ok": True, "plan": _plan_status_dict(user_plan)})


@require_GET
def plan_status(request):
    """GET current user's plan (or anonymous placeholder)."""
    if not request.user.is_authenticated:
        return JsonResponse({"active": False, "anonymous": True})
    user_plan = UserPlan.objects.filter(user=request.user).first()
    return JsonResponse(_plan_status_dict(user_plan))
