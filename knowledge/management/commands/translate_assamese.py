"""
Pre-generate high-quality Assamese for every Q&A answer and store it in
QAPair.answer_assamese. Once populated, Assamese queries are served verbatim
from the database (engine 'db-assamese') — instant, consistent, and with zero
runtime translation cost or extra RAM on the server.

Uses the Gemini API with an Assamese-tuned prompt. The command is RESUMABLE:
it only touches pairs whose answer_assamese is still empty and saves each result
immediately, so it can be stopped and re-run (e.g. after hitting a rate limit).

Usage:
    python manage.py translate_assamese                 # translate all pending
    python manage.py translate_assamese --limit 200     # only 200 this run
    python manage.py translate_assamese --sleep 1.5     # slower (gentler on quota)
"""
import os
import time

import requests
from django.core.management.base import BaseCommand
from knowledge.models import QAPair

# Same models the chat view uses (this API key doesn't offer gemini-1.5/2.0/2.5).
CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
]

# Native-Assamese translation prompt (same intent as the chat view's Assamese path).
PROMPT_TEMPLATE = (
    "You are a native Assamese (অসমীয়া) speaker and professional translator. "
    "Translate the information below into natural, fluent, everyday Assamese using "
    "correct Assamese script and grammar. Write the way an educated Assamese person "
    "would actually speak or write — NOT a literal, word-for-word translation, and "
    "NOT Bengali. Use proper Assamese vocabulary and verb forms (the Assamese 'ৰ' not "
    "Bengali 'র'). Keep every fact, name, number, and place exactly the same — do not "
    "add, remove, or change any information. Keep proper nouns (like Dispur, Guwahati, "
    "Kaziranga) readable. Output only the Assamese text, nothing else:\n\n{answer}"
)


class Command(BaseCommand):
    help = "Translate all Q&A answers into Assamese (stored in answer_assamese) via Gemini."

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=0,
                            help='Max pairs to translate this run (0 = all pending).')
        parser.add_argument('--sleep', type=float, default=0.8,
                            help='Seconds to wait between API calls (default 0.8).')

    def handle(self, *args, **options):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key and not os.getenv('GROQ_API_KEY'):
            self.stdout.write(self.style.ERROR(
                "Neither GEMINI_API_KEY nor GROQ_API_KEY is set. Aborting."))
            return

        pending_qs = QAPair.objects.exclude(answer_assamese__gt='').order_by('id')
        total_pending = pending_qs.count()
        if options['limit']:
            pending_qs = pending_qs[:options['limit']]
        to_do = pending_qs.count()

        self.stdout.write(
            f"Pending Assamese: {total_pending} | this run: {to_do} | "
            f"sleep {options['sleep']}s between calls")
        if not to_do:
            self.stdout.write(self.style.SUCCESS("Nothing to do — all answers already have Assamese."))
            return

        session = requests.Session()
        done, failed = 0, 0

        for qa in pending_qs.iterator():
            src = (qa.answer or '').strip()
            if not src:
                continue
            asm = self._translate(session, api_key, src)
            if asm:
                qa.answer_assamese = asm
                qa.save(update_fields=['answer_assamese'])
                done += 1
                if done % 25 == 0:
                    self.stdout.write(f"  ...{done}/{to_do} translated")
            else:
                failed += 1
                self.stdout.write(self.style.WARNING(f"  skip id={qa.id} (translation failed)"))
            time.sleep(options['sleep'])

        self.stdout.write(self.style.SUCCESS(
            f"Done. Translated {done}, failed {failed}. "
            f"Remaining pending: {QAPair.objects.exclude(answer_assamese__gt='').count()}"))
        if failed:
            self.stdout.write(self.style.WARNING("Re-run the command to retry the failed ones."))

    def _translate(self, session, api_key, text):
        """Translate via Gemini; if it fails (e.g. quota), fall back to Groq."""
        if api_key:
            gem = self._translate_gemini(session, api_key, text)
            if gem:
                return gem
        return self._translate_groq(session, text)

    def _translate_groq(self, session, text):
        """Translate via Groq (OpenAI-compatible) — generous free tier fallback."""
        key = os.getenv('GROQ_API_KEY')
        if not key:
            return None
        prompt = PROMPT_TEMPLATE.format(answer=text)
        model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        for attempt in range(3):
            try:
                r = session.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    headers={'Authorization': f'Bearer {key}',
                             'Content-Type': 'application/json'},
                    json={'model': model, 'messages': [
                        {'role': 'user', 'content': prompt}]},
                    timeout=40)
                if r.status_code == 200:
                    txt = r.json()['choices'][0]['message']['content']
                    if txt and txt.strip():
                        return txt.strip()
                    return None
                if r.status_code == 429 or r.status_code >= 500:
                    time.sleep(2 * (attempt + 1))
                    continue
                return None
            except (requests.RequestException, KeyError, IndexError, ValueError):
                time.sleep(2 * (attempt + 1))
        return None

    def _translate_gemini(self, session, api_key, text):
        """Call Gemini; retry on rate-limit/5xx with backoff; try each candidate model."""
        prompt = PROMPT_TEMPLATE.format(answer=text)
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {'Content-Type': 'application/json'}

        for model_id in CANDIDATE_MODELS:
            url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
                   f"{model_id}:generateContent?key={api_key}")
            for attempt in range(3):
                try:
                    res = session.post(url, headers=headers, json=payload, timeout=30)
                    if res.status_code == 200:
                        data = res.json()
                        cands = data.get('candidates', [])
                        if cands:
                            parts = cands[0].get('content', {}).get('parts', [])
                            if parts and parts[0].get('text', '').strip():
                                return parts[0]['text'].strip()
                        break  # 200 but empty → try next model
                    if res.status_code == 429 or res.status_code >= 500:
                        time.sleep(2 * (attempt + 1))  # backoff: 2s, 4s, 6s
                        continue
                    break  # other 4xx (e.g. model unavailable) → try next model
                except requests.RequestException:
                    time.sleep(2 * (attempt + 1))
        return None
