from functools import wraps

from django.http import JsonResponse
from django.utils import timezone

from .models import UserPlan


def get_user_plan(user):
    """Return the user's UserPlan, auto-marking it expired if past expiry. None for anon."""
    if not user or not user.is_authenticated:
        return None
    plan = UserPlan.objects.filter(user=user).first()
    if plan and plan.status == "active" and plan.expires_at <= timezone.now():
        plan.status = "expired"
        plan.save(update_fields=["status", "updated_at"])
    return plan


def has_active_plan(user) -> bool:
    plan = get_user_plan(user)
    return bool(plan and plan.status == "active")


def paid_only(*, allowed_plans=None, message="This feature requires an active paid plan."):
    """Decorator to gate a view behind an active UserPlan.

    Usage:
        from payments.utils import paid_only

        @paid_only()  # any active plan
        def some_api(request): ...

        @paid_only(allowed_plans=["pro_monthly", "pro_yearly", "business_monthly", "business_yearly"])
        def pro_only_api(request): ...

    Anonymous or free users get HTTP 402 (Payment Required) with a machine-readable body:
        { "error": "...", "plan_required": true, "current_plan": "..." }
    """
    def deco(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            plan = get_user_plan(request.user)
            active = bool(plan and plan.status == "active")
            plan_ok = active and (allowed_plans is None or plan.plan in allowed_plans)
            if not plan_ok:
                return JsonResponse({
                    "error": message,
                    "plan_required": True,
                    "current_plan": plan.plan if plan else None,
                    "allowed_plans": list(allowed_plans) if allowed_plans else "any-active",
                }, status=402)
            return view(request, *args, **kwargs)
        return wrapped
    return deco
