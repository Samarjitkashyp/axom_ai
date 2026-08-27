"""
Export every stored Assamese translation as a small JSON file keyed by question
text. Pair this with `import_assamese` to copy the reviewed Assamese answers to
the server without re-spending Gemini quota there.

Usage:
    python manage.py export_assamese                 # -> assamese_export.json
    python manage.py export_assamese --out mine.json
"""
import json

from django.core.management.base import BaseCommand
from knowledge.models import QAPair


class Command(BaseCommand):
    help = "Export QAPair Assamese answers to a JSON file (keyed by question)."

    def add_arguments(self, parser):
        parser.add_argument('--out', default='assamese_export.json',
                            help='Output JSON path (default assamese_export.json).')

    def handle(self, *args, **options):
        rows = []
        for qa in QAPair.objects.filter(answer_assamese__gt='').iterator():
            rows.append({'question': qa.question, 'answer_assamese': qa.answer_assamese})
        out = options['out']
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
        self.stdout.write(self.style.SUCCESS(f"Exported {len(rows)} Assamese answers to {out}"))
