"""
Import Assamese Wikipedia dump into the Axom AI knowledge base.

Downloads aswiki-latest-pages-articles.xml.bz2, stream-parses it,
cleans wikitext → plain Assamese text, chunks long articles, and
creates QAPair records ready for semantic search (embeddings are
computed inline in small batches to stay within 8 GB RAM).

Usage:
    python manage.py import_assamese_wiki                  # full import
    python manage.py import_assamese_wiki --limit 50       # first 50 articles (test)
    python manage.py import_assamese_wiki --dry-run        # parse & print, no DB writes
    python manage.py import_assamese_wiki --skip-embed     # insert without embedding (run backfill_embeddings later)
    python manage.py import_assamese_wiki --resume         # skip articles already imported
"""
import bz2
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from knowledge.models import KnowledgeDocument, QAPair
from knowledge.utils import _embed_texts, _QA_CACHE

DUMP_URL = 'https://dumps.wikimedia.org/aswiki/latest/aswiki-latest-pages-articles.xml.bz2'
MW_NS = '{http://www.mediawiki.org/xml/export-0.11/}'
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150
MIN_ARTICLE_LEN = 200
EMBED_BATCH = 64


# ── wikitext → plain text ───────────────────────────────────────────────

def _strip_nested(text, open_tok, close_tok):
    """Remove nested blocks like {{ ... }} or {| ... |}."""
    result, depth, i = [], 0, 0
    while i < len(text):
        if text[i:i+len(open_tok)] == open_tok:
            depth += 1
            i += len(open_tok)
        elif text[i:i+len(close_tok)] == close_tok:
            depth = max(depth - 1, 0)
            i += len(close_tok)
        else:
            if depth == 0:
                result.append(text[i])
            i += 1
    return ''.join(result)


def clean_wikitext(raw):
    """Convert raw wikitext to readable plain text (no extra dependencies)."""
    text = raw
    # Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    # Remove <ref> tags and content
    text = re.sub(r'<ref[^>]*/>', '', text)
    text = re.sub(r'<ref[^>]*>.*?</ref>', '', text, flags=re.DOTALL)
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove nested templates {{ ... }}
    text = _strip_nested(text, '{{', '}}')
    # Remove wiki tables {| ... |}
    text = _strip_nested(text, '{|', '|}')
    # Remove categories, files, images  [[Category:...]], [[File:...]]
    text = re.sub(r'\[\[(Category|শ্ৰেণী|File|Image|চিত্ৰ|ফাইল):[^\]]*\]\]', '', text, flags=re.IGNORECASE)
    # Convert [[link|display]] → display,  [[link]] → link
    text = re.sub(r'\[\[[^|\]]*\|([^\]]+)\]\]', r'\1', text)
    text = re.sub(r'\[\[([^\]]+)\]\]', r'\1', text)
    # Remove external links [http://... text] → text
    text = re.sub(r'\[https?://\S+\s+([^\]]+)\]', r'\1', text)
    text = re.sub(r'\[https?://\S+\]', '', text)
    # Remove bold/italic markers
    text = text.replace("'''", '').replace("''", '')
    # Remove heading markers (== ... ==)
    text = re.sub(r'^=+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*=+$', '', text, flags=re.MULTILINE)
    # Remove list/indent markers
    text = re.sub(r'^[*#:;]+\s*', '', text, flags=re.MULTILINE)
    # Remove magic words / behavior switches
    text = re.sub(r'__[A-Z]+__', '', text)
    # Collapse whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


# ── chunking ────────────────────────────────────────────────────────────

def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks, breaking at paragraph/sentence boundaries."""
    if len(text) <= size:
        return [text]
    chunks, start = [], 0
    min_advance = size // 2
    while start < len(text):
        end = start + size
        if end < len(text):
            # try paragraph break, then sentence break — only in the back half
            search_from = start + min_advance
            brk = text.rfind('\n\n', search_from, end)
            if brk == -1:
                brk = text.rfind('।', search_from, end)
            if brk == -1:
                brk = text.rfind('. ', search_from, end)
            if brk > search_from:
                end = brk + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < len(text) else end
    return chunks


# ── XML streaming ───────────────────────────────────────────────────────

def iter_articles(source):
    """Yield (title, text, page_id) from a MediaWiki XML dump (file path or file-like).
    Only main-namespace (ns=0) non-redirect pages."""
    context = ET.iterparse(source, events=('end',))
    for event, elem in context:
        if elem.tag == f'{MW_NS}page':
            ns_el = elem.find(f'{MW_NS}ns')
            if ns_el is not None and ns_el.text == '0':
                redirect = elem.find(f'{MW_NS}redirect')
                if redirect is None:
                    title_el = elem.find(f'{MW_NS}title')
                    id_el = elem.find(f'{MW_NS}id')
                    rev = elem.find(f'{MW_NS}revision')
                    text_el = rev.find(f'{MW_NS}text') if rev is not None else None
                    if title_el is not None and text_el is not None and text_el.text:
                        yield (
                            title_el.text.strip(),
                            text_el.text,
                            id_el.text if id_el is not None else '0',
                        )
            elem.clear()


# ── command ─────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Import Assamese Wikipedia articles into the knowledge base.'

    def add_arguments(self, parser):
        parser.add_argument('--dump', type=str, default='',
                            help='Path to local .xml.bz2 dump (skips download).')
        parser.add_argument('--limit', type=int, default=0,
                            help='Import only the first N articles (0 = all).')
        parser.add_argument('--dry-run', action='store_true',
                            help='Parse and print stats without writing to the DB.')
        parser.add_argument('--skip-embed', action='store_true',
                            help='Skip embedding; run backfill_embeddings later.')
        parser.add_argument('--resume', action='store_true',
                            help='Skip articles whose QAPairs already exist.')
        parser.add_argument('--batch', type=int, default=100,
                            help='Articles per DB batch (default 100).')
        parser.add_argument('--min-len', type=int, default=MIN_ARTICLE_LEN,
                            help=f'Skip articles shorter than this (default {MIN_ARTICLE_LEN} chars).')

    def handle(self, *args, **options):
        dump_path = options['dump']
        limit = options['limit']
        dry_run = options['dry_run']
        skip_embed = options['skip_embed']
        resume = options['resume']
        batch_size = options['batch']
        min_len = options['min_len']

        # ── 1. Get the dump file ────────────────────────────────────────
        if not dump_path:
            dump_path = os.path.join(os.path.dirname(__file__), '..', '..', '..',
                                     'aswiki-latest-pages-articles.xml.bz2')
            dump_path = os.path.abspath(dump_path)
            if not os.path.exists(dump_path):
                self.stdout.write(f'Downloading dump to {dump_path} ...')
                req = urllib.request.Request(DUMP_URL, headers={
                    'User-Agent': 'AxomAI-WikiImport/1.0 (samarjitkashyp@gmail.com)',
                })
                with urllib.request.urlopen(req) as resp:
                    total = int(resp.headers.get('Content-Length', 0))
                    downloaded = 0
                    with open(dump_path, 'wb') as out:
                        while True:
                            chunk = resp.read(1024 * 256)
                            if not chunk:
                                break
                            out.write(chunk)
                            downloaded += len(chunk)
                            if total > 0:
                                pct = min(100, downloaded * 100 // total)
                                self.stdout.write(f'\r  {pct}% ({downloaded / 1e6:.1f} MB)', ending='')
                            else:
                                self.stdout.write(f'\r  {downloaded / 1e6:.1f} MB', ending='')
                self.stdout.write('')

        if not os.path.exists(dump_path):
            self.stderr.write(self.style.ERROR(f'Dump not found: {dump_path}'))
            return

        self.stdout.write(f'Using dump: {dump_path} ({os.path.getsize(dump_path) / 1e6:.1f} MB)')

        # ── 2. Prepare the parent KnowledgeDocument ─────────────────────
        doc = None
        if not dry_run:
            doc = KnowledgeDocument.objects.filter(
                title='Assamese Wikipedia', file_type='wikipedia',
            ).first()
            if doc is None:
                doc = KnowledgeDocument(
                    title='Assamese Wikipedia',
                    file_type='wikipedia',
                    status='Processing',
                    source_name='Wikipedia (Assamese)',
                    source_url='https://as.wikipedia.org',
                )
                doc.file.save(
                    'assamese_wikipedia_meta.txt',
                    ContentFile(b'Assamese Wikipedia dump import\n'),
                    save=False,
                )
                doc.save()
                self.stdout.write(f'Created KnowledgeDocument id={doc.id}')
            else:
                self.stdout.write(f'Reusing KnowledgeDocument id={doc.id}')

        # ── 3. Existing titles (for --resume) ───────────────────────────
        existing_titles = set()
        if resume and doc:
            existing_titles = set(
                QAPair.objects.filter(document=doc)
                .values_list('source_name', flat=True)
                .distinct()
            )
            self.stdout.write(f'Resume mode: {len(existing_titles)} articles already imported')

        # ── 4. Stream-parse and import ──────────────────────────────────
        stats = {'articles': 0, 'skipped_short': 0, 'skipped_resume': 0,
                 'chunks': 0, 'embedded': 0}
        pending_pairs = []

        with bz2.open(dump_path, 'rb') as f:
            for title, raw_text, page_id in iter_articles(f):
                # Check limit
                if limit and stats['articles'] >= limit:
                    break

                # Resume check
                article_src = f'Wikipedia: {title}'
                if resume and article_src in existing_titles:
                    stats['skipped_resume'] += 1
                    continue

                # Clean
                cleaned = clean_wikitext(raw_text)
                if len(cleaned) < min_len:
                    stats['skipped_short'] += 1
                    continue

                stats['articles'] += 1
                wiki_url = f'https://as.wikipedia.org/wiki/{title.replace(" ", "_")}'

                # Chunk
                chunks = chunk_text(cleaned)
                stats['chunks'] += len(chunks)

                if dry_run:
                    if stats['articles'] <= 5:
                        self.stdout.write(f'\n--- {title} ({len(cleaned)} chars, {len(chunks)} chunks) ---')
                        self.stdout.write(cleaned[:300] + '...\n')
                    continue

                # Build QAPair objects
                for i, chunk in enumerate(chunks):
                    q_text = f'{title}\n\n{chunk}' if len(chunks) > 1 else chunk
                    pending_pairs.append(QAPair(
                        document=doc,
                        question=q_text,
                        answer=chunk,
                        answer_assamese=chunk,
                        source_name=article_src,
                        source_url=wiki_url,
                    ))

                # Flush batch
                if len(pending_pairs) >= batch_size * 5:
                    embedded = self._flush(pending_pairs, skip_embed)
                    stats['embedded'] += embedded
                    pending_pairs = []
                    self.stdout.write(
                        f'  ... {stats["articles"]} articles, '
                        f'{stats["chunks"]} chunks, '
                        f'{stats["embedded"]} embedded'
                    )

        # Final flush
        if pending_pairs:
            stats['embedded'] += self._flush(pending_pairs, skip_embed)

        # Mark document as processed
        if doc:
            doc.status = 'Processed'
            doc.save(update_fields=['status'])
            import knowledge.utils as ku
            ku._QA_CACHE = None

        # ── 5. Summary ──────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Import complete ==='))
        self.stdout.write(f'  Articles imported : {stats["articles"]}')
        self.stdout.write(f'  Chunks created    : {stats["chunks"]}')
        self.stdout.write(f'  Embedded          : {stats["embedded"]}')
        self.stdout.write(f'  Skipped (short)   : {stats["skipped_short"]}')
        self.stdout.write(f'  Skipped (resume)  : {stats["skipped_resume"]}')
        if skip_embed and not dry_run:
            self.stdout.write(self.style.WARNING(
                'Embeddings skipped — run: python manage.py backfill_embeddings --no-prep'))

    def _flush(self, pairs, skip_embed):
        """Bulk-create QAPairs and optionally embed them. Returns embed count."""
        QAPair.objects.bulk_create(pairs, ignore_conflicts=False)
        if skip_embed:
            return 0
        # Embed in small batches to stay memory-safe
        embedded = 0
        for i in range(0, len(pairs), EMBED_BATCH):
            batch = pairs[i:i + EMBED_BATCH]
            vecs = _embed_texts([p.question for p in batch])
            if vecs and len(vecs) == len(batch):
                for p, v in zip(batch, vecs):
                    p.embedding = json.dumps(v)
                QAPair.objects.bulk_update(batch, ['embedding'])
                embedded += len(batch)
        return embedded

