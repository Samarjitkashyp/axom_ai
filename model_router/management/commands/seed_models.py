from django.core.management.base import BaseCommand
from model_router.router import seed_default_models


class Command(BaseCommand):
    help = 'Seed default OpenAI model providers for the free-tier rotation'

    def handle(self, *args, **options):
        created = seed_default_models()
        self.stdout.write(self.style.SUCCESS(f'{created} model(s) created.'))
