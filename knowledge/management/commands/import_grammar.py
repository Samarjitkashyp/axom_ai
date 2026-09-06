"""
Import a JSONL of grammar Q&A pairs into the knowledge base.

    python manage.py import_grammar path/to/grammar.jsonl [--title "..."] [--replace]

Each line is a JSON object with the shape used elsewhere in the KB:
    {"question": "...", "answer": "...", "answer_assamese": "...", "source_name": "..."}

By default this UPSERTS into a KnowledgeDocument named
"Assamese Grammar Seed" (customisable with --title) — running it again
with an updated file replaces the pairs cleanly.

The command copies the file into MEDIA_ROOT/documents/ so it lives under
Django's normal media flow, then calls the same `create_qa_pairs()` that
the admin panel upload uses — including the auto-embed step. So the new
grammar rows are searchable immediately, no separate `backfill_embeddings`
run needed.
"""
from __future__ import annotations

import os
import shutil
import uuid

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from knowledge.models import KnowledgeDocument
from knowledge.utils import create_qa_pairs


class Command(BaseCommand):
    help = "Import a JSONL grammar file into the KB (upserts by title)."

    def add_arguments(self, parser):
        parser.add_argument("path", help="Path to the JSONL file on the server.")
        parser.add_argument(
            "--title",
            default="Assamese Grammar Seed",
            help="KnowledgeDocument title to upsert into.",
        )
        parser.add_argument(
            "--source-name",
            default="Axom AI — curated Assamese grammar",
            help="Fallback source name for pairs that don't set their own.",
        )
        parser.add_argument(
            "--source-url",
            default="",
            help="Optional source URL shown alongside answers.",
        )
        parser.add_argument(
            "--replace",
            action="store_true",
            help="If a document with the same title exists, delete it first "
                 "(default: reuse it and replace its Q/A pairs).",
        )

    def handle(self, *args, **opts):
        src_path = os.path.abspath(opts["path"])
        if not os.path.isfile(src_path):
            raise CommandError(f"File not found: {src_path}")

        title = opts["title"].strip()
        replace = opts["replace"]

        # Optionally start clean
        if replace:
            deleted, _ = KnowledgeDocument.objects.filter(title=title).delete()
            if deleted:
                self.stdout.write(f"Deleted {deleted} existing document(s) titled '{title}'.")

        # Reuse existing (upsert) OR create new
        doc = KnowledgeDocument.objects.filter(title=title).first()
        if doc:
            self.stdout.write(f"Reusing existing document id={doc.id} — its Q/A pairs will be replaced.")
        else:
            doc = KnowledgeDocument(
                title=title,
                file_type="jsonl",
                source_name=opts["source_name"].strip()[:255],
                source_url=opts["source_url"].strip()[:500],
                status="Processed",
            )

        # Copy the JSONL into MEDIA_ROOT/documents/ (a filename Django manages
        # for us) so the model's FileField resolves to a stable path.
        with open(src_path, "rb") as f:
            fname = f"grammar_{uuid.uuid4().hex[:8]}.jsonl"
            doc.file.save(fname, File(f), save=False)

        doc.file_size = os.path.getsize(doc.file.path) if doc.file else 0
        doc.status = "Processed"
        doc.save()

        # Build QAPair rows + embed them — same code path as admin panel upload.
        create_qa_pairs(doc)

        total = doc.qa_pairs.count()
        with_asm = doc.qa_pairs.exclude(answer_assamese="").count()
        with_emb = doc.qa_pairs.exclude(embedding="").count()
        self.stdout.write(self.style.SUCCESS(
            f"OK -> {total} Q/A pairs imported into '{title}' (id={doc.id})."
        ))
        self.stdout.write(
            f"  - {with_asm}/{total} carry a verified answer_assamese."
        )
        self.stdout.write(
            f"  - {with_emb}/{total} embedded (searchable immediately)."
        )
