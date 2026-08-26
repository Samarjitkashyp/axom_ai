import os
import sys
import threading
from django.apps import AppConfig


class KnowledgeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'knowledge'

    def ready(self):
        # Pre-warm the semantic model in a background thread so the first user
        # query isn't slow. Only under a running server (skip one-off management
        # commands like migrate/collectstatic), and only if the KB has data.
        skip = {'migrate', 'makemigrations', 'collectstatic', 'check', 'shell',
                'backfill_embeddings', 'test', 'createsuperuser', 'loaddata',
                'dumpdata', 'sqlmigrate', 'showmigrations'}
        if any(cmd in sys.argv for cmd in skip):
            return
        if os.getenv('AXOM_WARMUP', 'True').lower() not in ('true', '1', 't'):
            return

        def _warm():
            try:
                from knowledge.models import QAPair
                if QAPair.objects.exclude(embedding='').exists():
                    from knowledge.utils import _get_model
                    _get_model()
            except Exception:
                pass

        threading.Thread(target=_warm, daemon=True).start()
