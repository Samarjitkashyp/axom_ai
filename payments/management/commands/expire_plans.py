from django.core.management.base import BaseCommand
from django.utils import timezone

from payments.models import UserPlan


class Command(BaseCommand):
    help = "Mark all UserPlan rows whose expires_at has passed as status='expired'. Safe to run on a daily cron."

    def handle(self, *args, **opts):
        now = timezone.now()
        qs = UserPlan.objects.filter(status="active", expires_at__lte=now)
        count = qs.update(status="expired")
        self.stdout.write(self.style.SUCCESS(f"Marked {count} plan(s) expired at {now:%Y-%m-%d %H:%M} UTC."))
