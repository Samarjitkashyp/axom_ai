from collections import defaultdict
from django.core.management.base import BaseCommand
from knowledge.models import QAPair
from knowledge.utils import backfill_qa_embeddings


class Command(BaseCommand):
    help = "Prepare Q&A pairs for semantic search: dedupe, trim paraphrases, then embed."

    def add_arguments(self, parser):
        parser.add_argument('--keep', type=int, default=2,
                            help='Max question variants to keep per unique answer (default 2).')
        parser.add_argument('--no-prep', action='store_true',
                            help='Skip dedupe/trim; only embed pending pairs.')

    def handle(self, *args, **options):
        if not options['no_prep']:
            # 1. Drop exact duplicate (question, answer) pairs.
            seen, dup_ids = set(), []
            for qa in QAPair.objects.all().only('id', 'question', 'answer').iterator():
                key = (qa.question.strip().lower(), qa.answer.strip().lower())
                (dup_ids.append(qa.id) if key in seen else seen.add(key))
            self._bulk_delete(dup_ids, "exact duplicates")

            # 2. Keep at most --keep question variants per unique answer.
            keep = options['keep']
            by_ans = defaultdict(list)
            for qa in QAPair.objects.all().only('id', 'answer').iterator():
                by_ans[qa.answer.strip().lower()].append(qa.id)
            extra = [i for ids in by_ans.values() if len(ids) > keep for i in ids[keep:]]
            self._bulk_delete(extra, f"extra variants (keeping {keep}/answer)")

        # 3. Embed everything still missing an embedding.
        pending = QAPair.objects.filter(embedding='').count()
        self.stdout.write(f"Pending to embed: {pending} (total {QAPair.objects.count()})")
        if pending:
            done = backfill_qa_embeddings()
            self.stdout.write(self.style.SUCCESS(f"Embedded {done} pairs."))
            still = QAPair.objects.filter(embedding='').count()
            if still:
                self.stdout.write(self.style.WARNING(
                    f"{still} still pending (rate limit) — rerun to finish."))
        else:
            self.stdout.write(self.style.SUCCESS("All pairs already embedded."))

    def _bulk_delete(self, ids, label):
        if not ids:
            return
        for i in range(0, len(ids), 2000):
            QAPair.objects.filter(id__in=ids[i:i + 2000]).delete()
        self.stdout.write(f"Removed {len(ids)} {label}.")
