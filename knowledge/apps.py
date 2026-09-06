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

        # Fully import knowledge.utils in the main thread BEFORE gunicorn's
        # preload forks worker processes. Otherwise the warmup thread below may
        # still be mid-import at fork time, leaving each worker with a
        # "partially initialized" knowledge.utils in sys.modules that raises
        # a bogus circular-import ImportError on the first request.
        try:
            import knowledge.utils  # noqa: F401
        except Exception:
            pass

        def _warm():
            try:
                from knowledge.models import QAPair
                if QAPair.objects.exclude(embedding='').exists():
                    from knowledge.utils import _get_model, _load_qa_matrix
                    _get_model()
                    _load_qa_matrix()
            except Exception:
                pass

        threading.Thread(target=_warm, daemon=True).start()
