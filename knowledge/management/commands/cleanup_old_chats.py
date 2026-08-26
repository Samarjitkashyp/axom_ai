from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from knowledge.models import ChatSession


class Command(BaseCommand):
    help = "Delete non-pinned chat sessions not updated in the last N days (default 60)."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=60,
                            help='Delete non-pinned chats older than this many days.')

    def handle(self, *args, **options):
        days = options['days']
        cutoff = timezone.now() - timedelta(days=days)
        qs = ChatSession.objects.filter(pinned=False, updated_at__lt=cutoff)
        count = qs.count()
        qs.delete()
        self.stdout.write(self.style.SUCCESS(
            f"Deleted {count} chat session(s) older than {days} days (pinned kept)."))
