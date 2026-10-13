"""Text helpers for the Assamese voice (axom_ai/tts_api.py).

The voice model has no digits: a sentence with "২৫" would come out as "দুই পাঁচ" (the digits one by one). Here every number is first
written out as Assamese words by Gemini ("পঁচিশ"), the way a person would say it; the rest of the sentence is not touched. The answer is
checked (no digit left, still Assamese, about the same length) and remembered, so a replay does not ask Gemini again. When Gemini is not
available or its answer does not pass the check, None is returned and the voice reads the digits one by one, as before.
"""
import hashlib
import logging
import os
import re

import requests
from django.core.cache import cache

log = logging.getLogger('axom.voice')

DIGITS = re.compile(r'[0-9০-৯]')
ASSAMESE = re.compile(r'[ঀ-৿]')
MODELS = [m for m in os.getenv('VOICE_GEMINI_MODELS', 'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-flash-latest').split(',') if m]
CACHE_SECONDS = 7 * 24 * 3600

PROMPT = (
    "Rewrite the Assamese text below so that EVERY number is written out in Assamese words, exactly as a person would say it aloud, "
    "in Assamese script. Years are said as years (২০২৪ -> দুই হাজাৰ চব্বিশ), amounts as amounts, ordinals as ordinals, "
    "phone numbers and codes digit by digit, decimals with 'দশমিক', % as 'শতাংশ'; never keep a currency symbol (write ₹৫০০ as পাঁচশ টকা). "
    "Change NOTHING else: same words, same order, same punctuation. Do not translate, shorten or explain. Return only the rewritten text.\n\n"
)


def has_digits(text):
    return bool(DIGITS.search(text or ''))


def _key(text):
    return 'voice:num:' + hashlib.sha256(text.encode('utf-8')).hexdigest()


def _gemini_key():
    return os.getenv('GEMINI_API_KEY', '')


def _ask(text):
    key = _gemini_key()
    if not key:
        return None
    for model in MODELS:
        try:
            r = requests.post('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % model,
                              json={'contents': [{'parts': [{'text': PROMPT + text}]}], 'generationConfig': {'temperature': 0}},
                              headers={'x-goog-api-key': key}, timeout=12)
        except requests.RequestException:
            continue
        if r.status_code != 200:
            continue                                  # model gone (404) or quota (429): the next one
        try:
            return r.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        except (KeyError, IndexError, ValueError, TypeError):
            continue
    return None


def valid_rewrite(original, rewritten):
    """The rewrite must have no digit left, still be Assamese, and not be much longer or shorter than a number-for-words swap could make it."""
    if not rewritten or DIGITS.search(rewritten) or not ASSAMESE.search(rewritten):
        return False
    return 0.6 * len(original) <= len(rewritten) <= 6 * len(original) + 40


def normalize_numbers(text, allow_ask=True):
    """The text with its numbers written as Assamese words, or None when that was not possible (the caller then uses the text as it is).
    allow_ask=False only looks at what was remembered (no call to Gemini)."""
    if not has_digits(text):
        return text
    key = _key(text)
    hit = cache.get(key)
    if hit:
        return hit
    if not allow_ask:
        return None
    out = _ask(text)
    if out and valid_rewrite(text, out):
        out = re.sub(r'\s+', ' ', out.replace('₹', ' ')).strip()
        cache.set(key, out, CACHE_SECONDS)
        return out
    if out:
        log.warning('number rewrite refused (%d -> %d characters)', len(text), len(out))
    return None
