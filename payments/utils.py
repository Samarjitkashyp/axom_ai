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
