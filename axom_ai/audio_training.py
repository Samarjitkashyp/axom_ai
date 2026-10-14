"""The word lists of Audio Training (admin: /axomai-admin/audio-training/), read by voice typing and the Assamese voice.

Three lists: number words (a spoken number word and its value), voice typing corrections (a heard word and the right one) and
pronunciations (a written word and how it is read aloud). Each list is remembered for a minute; saving in the admin forgets it at once.
When the database cannot be read the lists are empty and the voice features work as they did before.
"""
import logging
import re

from django.core.cache import cache

log = logging.getLogger(__name__)
SECONDS = 60
NUMBER, HEARD, SPOKEN = 'number_word', 'transcript_fix', 'pronunciation'


def _key(kind):
    return 'audio_training:' + kind


def forget(kind):
    cache.delete(_key(kind))


def clean_source(value):
    return re.sub(r'\s+', ' ', (value or '')).strip()[:200]


def clean_target(kind, value):
    """The target as it will be stored, or None when it is not valid for this kind."""
    value = re.sub(r'\s+', ' ', (value or '')).strip()[:200]
    if kind == NUMBER:
        value = value.translate(str.maketrans('০১২৩৪৫৬৭৮৯', '0123456789'))
        if not re.fullmatch(r'\d{1,2}', value):
            return None
        return str(int(value))
    return value or None


def entries(kind):
    """{source: target} of the active entries of a kind."""
    hit = cache.get(_key(kind))
    if hit is not None:
        return hit
    try:
        from superadmin.models import AudioTrainingEntry
        data = {e.source: e.target for e in AudioTrainingEntry.objects.filter(kind=kind, is_active=True)}
    except Exception:                                   # database not ready (tests, migration): the built-in behaviour only
        log.warning('audio training list %s could not be read', kind, exc_info=True)
        return {}
    cache.set(_key(kind), data, SECONDS)
    return data


def number_words():
    """{word: value} for the number words the admin added."""
    out = {}
    for word, digits in entries(NUMBER).items():
        try:
            out[word] = int(digits)
        except ValueError:
            continue
    return out


def replace_words(text, mapping):
    """Whole-word replacement, longest first. A word is whole when the characters around it are not letters, digits or Assamese marks."""
    if not text or not mapping:
        return text
    for src in sorted(mapping, key=len, reverse=True):
        text = re.sub(r'(?<![\wঀ-৿])' + re.escape(src) + r'(?![\wঀ-৿])', lambda m, t=mapping[src]: t, text)
    return text


def fix_heard(text):
    return replace_words(text, entries(HEARD))


def fix_pronunciation(text):
    return replace_words(text, entries(SPOKEN))
