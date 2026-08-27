"""
Import Assamese answers produced by `export_assamese` and apply them to matching
QAPairs (matched by exact question text). Lets the server reuse the reviewed
Assamese without calling Gemini again.

Usage:
    python manage.py import_assamese                    # <- assamese_export.json
    python manage.py import_assamese --in mine.json
    python manage.py import_assamese --overwrite        # replace existing Assamese too
"""
import json

from django.core.management.base import BaseCommand
from knowledge.models import QAPair


class Command(BaseCommand):
    help = "Import Assamese answers from a JSON file and apply them to QAPairs by question."

    def add_arguments(self, parser):
        parser.add_argument('--in', dest='infile', default='assamese_export.json',
                            help='Input JSON path (default assamese_export.json).')
        parser.add_argument('--overwrite', action='store_true',
                            help='Overwrite answers that already have Assamese.')

    def handle(self, *args, **options):
        try:
            with open(options['infile'], encoding='utf-8') as f:
                rows = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {options['infile']}"))
            return

        # Map question -> id for fast lookup (questions are effectively unique keys here).
        by_q = {}
        for qa in QAPair.objects.all().only('id', 'question', 'answer_assamese'):
            by_q.setdefault(qa.question, qa)

        updated, skipped, missing = 0, 0, 0
        for r in rows:
            qa = by_q.get(r.get('question', ''))
            asm = (r.get('answer_assamese') or '').strip()
            if qa is None:
                missing += 1
                continue
            if not asm:
                continue
            if qa.answer_assamese.strip() and not options['overwrite']:
                skipped += 1
                continue
            qa.answer_assamese = asm
            qa.save(update_fields=['answer_assamese'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Imported: updated {updated}, skipped {skipped} (already had Assamese), "
            f"missing {missing} (no matching question)."))
