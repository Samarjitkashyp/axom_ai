"""Numbers in Assamese answers written as Assamese words, from the Audio Training number list (one list for voice typing, chat and voice).

The chat asks the model for digits; this module then writes some of them as words, with the spelling the admin chose
(Language Rules -> Numbers tab). It is rule based: it only touches a number when every word it needs is known, and it leaves alone
dates, times, phone numbers, prices, percentages, decimals, list numbers, tables, code and links.

Modes (SystemSetting chat_number_words): off (default) | years (1000-2099 only) | small (every whole number up to chat_number_words_max).
"""
import re

from django.core.cache import cache

from axom_ai.assamese_numbers import UNITS

SETTING_MODE = 'chat_number_words'
SETTING_MAX = 'chat_number_words_max'
MODES = ('off', 'years', 'small')
DEFAULT_MAX = 9999
CACHE_SECONDS = 30
BIG = ((10000000, 'কোটি'), (100000, 'লাখ'), (1000, 'হাজাৰ'))
ASSAMESE = re.compile('[ঀ-৿]')

NUMBER_BEFORE = r'(?<![0-9A-Za-z_ঀ-৿.,:/\-+₹$#@%])'
NUMBER_AFTER = r'(?![0-9A-Za-z_%]|[.,:/\-][0-9])'
SMALL_RE = re.compile(NUMBER_BEFORE + r'(0|[1-9][0-9]{0,6})' + NUMBER_AFTER)
YEAR_RE = re.compile(NUMBER_BEFORE + r'((?:1[0-9]|20)[0-9]{2})' + NUMBER_AFTER)
PROTECT = re.compile(r'(`[^`\n]*`|https?://\S+|\]\([^)\n]*\)|\S+@\S+\.\S+)')
LIST_MARK = re.compile(r'^\s*(?:[-*+]|\d{1,3}[.)])\s+')
HOLD = re.compile(r'[0-9.,:/\-`]*\Z')


# ---------------------------------------------------------------- the settings (cached for half a minute, forgotten when saved)
def current_settings():
    hit = cache.get('number_words:settings')
    if hit is not None:
        return hit
    try:
        from superadmin.models import SystemSetting
        mode = (SystemSetting.get_setting(SETTING_MODE, 'off') or 'off').strip().lower()
        try:
            top = int(SystemSetting.get_setting(SETTING_MAX, str(DEFAULT_MAX)) or DEFAULT_MAX)
        except ValueError:
            top = DEFAULT_MAX
    except Exception:
        return ('off', DEFAULT_MAX)
    value = (mode if mode in MODES else 'off', max(1, min(top, 9999999)))
    cache.set('number_words:settings', value, CACHE_SECONDS)
    return value


def forget():
    cache.delete('number_words:settings')
    cache.delete('number_words:table')


# ---------------------------------------------------------------- the words
def builtin_words():
    """{value: word}: the first spelling of every built-in number word."""
    out = {}
    for word, value in UNITS.items():
        out.setdefault(value, word)
    return out


def words_table(entries):
    """{value: word} to write with: the built-in words, then the admin's. `entries` = [(word, value, preferred)] (the active number
    entries of Audio Training). For one value the entry marked preferred wins, else the first one."""
    table = builtin_words()
    chosen = {}
    for word, value, preferred in entries:
        if value not in chosen or (preferred and not chosen[value][1]):
            chosen[value] = (word, preferred)
    for value, (word, _) in chosen.items():
        table[value] = word
    return table


def _admin_entries():
    try:
        from superadmin.models import AudioTrainingEntry
        out = []
        for r in AudioTrainingEntry.objects.filter(kind='number_word', is_active=True).order_by('source'):
            try:
                out.append((r.source, int(r.target), bool(r.preferred)))
            except ValueError:
                continue
        return out
    except Exception:                                   # the database cannot be read: the built-in words only
        return []


def cached_table():
    hit = cache.get('number_words:table')
    if hit is None:
        hit = words_table(_admin_entries())
        cache.set('number_words:table', hit, CACHE_SECONDS)
    return hit


def to_words(n, table):
    """The number as Assamese words ("দুই হাজাৰ চাৰি"), or None when a word that is needed is not known."""
    if n < 0 or n >= 1000000000:
        return None
    if n == 0:
        return table.get(0)
    parts = []
    for size, name in BIG:
        if n >= size:
            q, n = divmod(n, size)
            if q >= 100:
                return None
            w = to_words(q, table)
            if w is None:
                return None
            parts += [w, name]
    if n >= 100:
        h, n = divmod(n, 100)
        w = table.get(h * 100)
        if w is None:
            return None
        parts.append(w)
    if n:
        w = table.get(n)
        if w is None:
            return None
        parts.append(w)
    return ' '.join(parts)


# ---------------------------------------------------------------- the text
def _replace(token, regex, max_value, table):
    def one(m):
        n = int(m.group(1))
        if n > max_value:
            return m.group(0)
        w = to_words(n, table)
        return w if w else m.group(0)
    return regex.sub(one, token)


def _convert(text, mode, max_value, table, st):
    """The text with its numbers written as words; `st` carries the state from the piece before (code fence, table line, ...)."""
    if mode == 'off' or not text:
        return text
    regex = YEAR_RE if mode == 'years' else SMALL_RE
    top = min(max_value, 2099) if mode == 'years' else max_value
    out = []
    for piece in re.split(r'(\n)', text):
        if piece == '\n':
            out.append(piece)
            st.update(ls=True, skip=False)
            st['prev'] = '\n'
            continue
        if not piece:
            continue
        if ASSAMESE.search(piece):
            st['asm'] = True
        if st['ls']:
            if not piece.strip():                                           # only spaces so far: the line has not really started
                out.append(piece)
                st['prev'] = piece[-1]
                continue
            first = piece.lstrip()
            if first.startswith('```'):
                st['fence'] = not st['fence']
                st['skip'] = True
            elif first.startswith('|'):
                st['skip'] = True
        line_start = st['ls']
        st['ls'] = False
        if st['fence'] or st['skip'] or not st['asm']:
            out.append(piece)
            st['prev'] = piece[-1]
            continue
        body, head = piece, ''
        if line_start:
            m = LIST_MARK.match(piece)
            if m:
                head, body = piece[:m.end()], piece[m.end():]
        converted = []
        prev = (head or st['prev'])[-1:] if (head or st['prev']) else ''
        for i, token in enumerate(PROTECT.split(body)):
            if i % 2 == 1:
                converted.append(token)
            else:
                ctx = prev + token if prev else token
                res = _replace(ctx, regex, top, table)
                converted.append(res[len(prev):] if prev and res.startswith(prev) else res)
            if token:
                prev = token[-1]
        out.append(head + ''.join(converted))
        st['prev'] = piece[-1]
    return ''.join(out)


def _new_state():
    return {'fence': False, 'skip': False, 'ls': True, 'asm': False, 'prev': ''}


class NumberWordStream:
    """Writes numbers as words in a stream of text chunks: a number that is cut between two chunks is held back until it is whole."""

    def __init__(self, mode=None, max_value=None, table=None):
        if mode is None:
            mode, top = current_settings()
            max_value = max_value or top
        self.mode = mode
        self.max_value = max_value or DEFAULT_MAX
        self.table = table if table is not None else (cached_table() if mode != 'off' else {})
        self.buf = ''
        self.st = _new_state()

    def feed(self, chunk):
        if self.mode == 'off' or not chunk:
            return chunk
        self.buf += chunk
        cut = HOLD.search(self.buf).start()
        ready, self.buf = self.buf[:cut], self.buf[cut:]
        return _convert(ready, self.mode, self.max_value, self.table, self.st)

    def flush(self):
        if self.mode == 'off':
            return ''
        rest, self.buf = self.buf, ''
        return _convert(rest, self.mode, self.max_value, self.table, self.st)


def finish(text, mode=None, max_value=None, table=None):
    """A whole answer with its numbers written as words (the setting decides; 'off' leaves the text as it is)."""
    s = NumberWordStream(mode, max_value, table)
    if s.mode == 'off' or not text:
        return text
    s.st['asm'] = bool(ASSAMESE.search(text))              # a whole answer: it is known at once whether it is Assamese
    return s.feed(text) + s.flush()


def for_voice(text):
    """Text that is going to be read aloud: every number the rules can write as words is written (whatever the chat setting is);
    the rest (dates, phone numbers ...) is left for the voice's own number reader."""
    if not text or not re.search(r'[0-9]', text):
        return text
    return finish(text, 'small', 9999999, cached_table())
