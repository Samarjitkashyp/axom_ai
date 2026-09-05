"""
Fast embedding for Wikipedia QAPairs: embed each unique article TITLE once,
then copy that vector to every chunk of that article.

~25K short titles instead of ~112K long chunks → finishes in minutes, not days.

Usage:
    python manage.py embed_wiki_titles
"""
import json
from collections import defaultdict

from django.core.management.base import BaseCommand
from knowledge.models import QAPair
from knowledge.utils import _embed_texts


class Command(BaseCommand):
    help = 'Embed Wikipedia QAPairs by article title (fast: one embed per article, shared across chunks).'

    def add_arguments(self, parser):
        parser.add_argument('--batch', type=int, default=128,
                            help='Titles per embedding batch (default 128).')

    def handle(self, *args, **options):
        batch_size = options['batch']

        wiki_pairs = QAPair.objects.filter(
            source_name__startswith='Wikipedia:',
            embedding='',
        ).only('id', 'source_name')

        by_title = defaultdict(list)
        for qa in wiki_pairs.iterator():
            by_title[qa.source_name].append(qa.id)

        titles = list(by_title.keys())
        self.stdout.write(f'{len(titles)} unique titles, {sum(len(v) for v in by_title.values())} QAPairs to embed')

        if not titles:
            self.stdout.write(self.style.SUCCESS('Nothing to embed.'))
            return

        done_titles, done_pairs = 0, 0
        for i in range(0, len(titles), batch_size):
            batch_titles = titles[i:i + batch_size]
            # Strip "Wikipedia: " prefix for embedding
            clean = [t.replace('Wikipedia: ', '', 1) for t in batch_titles]
            vecs = _embed_texts(clean)
            if not vecs or len(vecs) != len(batch_titles):
                self.stderr.write(self.style.ERROR(f'Embedding failed at batch {i}'))
                continue

            for title, vec in zip(batch_titles, vecs):
                ids = by_title[title]
                emb_json = json.dumps(vec)
                QAPair.objects.filter(id__in=ids).update(embedding=emb_json)
                done_pairs += len(ids)

            done_titles += len(batch_titles)
            self.stdout.write(f'  {done_titles}/{len(titles)} titles, {done_pairs} pairs embedded')

        import knowledge.utils as ku
        ku._QA_CACHE = None

        self.stdout.write(self.style.SUCCESS(
            f'Done: {done_titles} titles → {done_pairs} QAPairs embedded'))
