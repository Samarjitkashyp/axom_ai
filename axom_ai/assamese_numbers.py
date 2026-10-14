"""Numbers said in Assamese, written as digits (rule based, no AI): "দুই হাজাৰ চৌবিশ" -> "2024".

Only the words listed here are known (0-50, the tens up to 90, শ / হাজাৰ / লাখ / কোটি). A word that is not listed ends a number, it is never
guessed, so an unknown word can only leave a number as words, not turn it into a wrong digit. Digits spoken one by one (a phone number) and
a lone small number (এক, দুই ... as in "a" / "one") stay as words, because there it is not clear that a number was meant.
"""
import re

UNITS = {
    'শূন্য': 0, 'এক': 1, 'দুই': 2, 'তিনি': 3, 'চাৰি': 4, 'পাঁচ': 5, 'ছয়': 6, 'সাত': 7, 'আঠ': 8, 'ন': 9, 'নৱ': 9,
    'দহ': 10, 'এঘাৰ': 11, 'বাৰ': 12, 'তেৰ': 13, 'চৈধ্য': 14, 'পোন্ধৰ': 15, 'ষোল্ল': 16, 'সোতৰ': 17, 'ওঠৰ': 18, 'ঊনৈশ': 19, 'উনৈশ': 19,
    'বিশ': 20, 'একৈশ': 21, 'বাইশ': 22, 'তেইশ': 23, 'চৌবিশ': 24, 'পঁচিশ': 25, 'ছাব্বিশ': 26, 'সাতাইশ': 27, 'আঠাইশ': 28, 'ঊনত্ৰিশ': 29, 'উনত্ৰিশ': 29,
    'ত্ৰিশ': 30, 'একত্ৰিশ': 31, 'বত্ৰিশ': 32, 'তেত্ৰিশ': 33, 'চৌত্ৰিশ': 34, 'পঁইত্ৰিশ': 35, 'ছয়ত্ৰিশ': 36, 'সাতত্ৰিশ': 37, 'আঠত্ৰিশ': 38,
    'ঊনচল্লিশ': 39, 'উনচল্লিশ': 39, 'চল্লিশ': 40, 'একচল্লিশ': 41, 'বিয়াল্লিশ': 42, 'তেতাল্লিশ': 43, 'চৌৱাল্লিশ': 44, 'পঁইতাল্লিশ': 45,
    'ছয়চল্লিশ': 46, 'সাতচল্লিশ': 47, 'আঠচল্লিশ': 48, 'ঊনপঞ্চাশ': 49, 'উনপঞ্চাশ': 49, 'পঞ্চাশ': 50,
    'ষাঠি': 60, 'সত্তৰ': 70, 'আশী': 80, 'নৱৈ': 90, 'নব্বৈ': 90,
}
# the short forms used in front of শ: দুশ (200), তিনিশ / তিনশ (300)
GLUE = {'দু': 2, 'তিন': 3}
HUNDRED = {'শ', 'শত'}
BIG = {'হাজাৰ': 1000, 'হাজাৰ': 1000, 'লাখ': 100000, 'লক্ষ': 100000, 'কোটি': 10000000}
# said alone these are also ordinary words (বাৰ = a time / a day, দহ = a pool): they become digits only inside a longer number
AMBIGUOUS_ALONE = {'বাৰ', 'দহ', 'ন'}
# endings that stick to the last number word (২০২৪ত = in 2024): the digits keep the ending
ENDINGS = ('তকৈ', 'লৈকে', 'লৈ', 'ৰে', 'ক', 'ত', 'ৰ')
EDGE = '.,;:!?।"\'()[]'


def _split(token):
    """(leading marks, word, trailing marks)."""
    m = re.match(r'^([' + re.escape(EDGE) + r']*)(.*?)([' + re.escape(EDGE) + r']*)$', token)
    return m.group(1), m.group(2), m.group(3)


def _kind(word, units=UNITS):
    """('u', value) a number below 100, ('h',) hundred, ('b', factor) thousand and up, or None."""
    if word in units:
        return ('u', units[word])
    if word in HUNDRED:
        return ('h',)
    if word in BIG:
        return ('b', BIG[word])
    # glued hundred: নশ (900), দুশ (200), উনৈশশ (1900)
    if len(word) > 1 and word.endswith('শ') and word not in units:
        front = word[:-1]
        if front in units or front in GLUE:
            return ('uh', units.get(front, GLUE.get(front)))
    return None


def _kind_end(word, units=UNITS):
    """(kind, ending) of a number word, which may carry an ending; (None, '') when it is no number."""
    k = _kind(word, units)
    if k:
        return k, ''
    for e in ENDINGS:
        if word.endswith(e) and len(word) > len(e):
            k = _kind(word[:-len(e)], units)
            if k:
                return k, e
    return None, ''


def _evaluate(parts):
    """The value of a list of parts, or None when they do not make one number."""
    total = 0
    current = 0
    last = None
    for p in parts:
        k = p[0]
        if k == 'u':
            if last == 'u':
                return None                       # two small numbers after each other: digits one by one, not one number
            current += p[1]
        elif k == 'uh':
            if last == 'u':
                return None
            current += p[1] * 100
        elif k == 'h':
            current = (current or 1) * 100
        else:
            total += (current or 1) * p[1]
            current = 0
        last = 'u' if k == 'u' else ('h' if k == 'uh' else k)
    return total + current


def numbers_to_digits(text, extra=None):
    """The text with the numbers that were said as words written as digits. Anything it does not understand is left exactly as it was.
    extra = more number words {word: value} (from Audio Training in the admin)."""
    if not text:
        return text
    units = dict(UNITS, **extra) if extra else UNITS
    tokens = text.split(' ')
    out = []
    i = 0
    while i < len(tokens):
        lead, word, trail = _split(tokens[i])
        kind, ending = _kind_end(word, units)
        if kind is None:
            out.append(tokens[i])
            i += 1
            continue
        # the longest run of number words (marks inside a run, such as a comma, end it; an ending closes it)
        parts = [kind]
        words = [word]
        j = i + 1
        end_trail = trail
        while not end_trail and not ending and j < len(tokens):
            l2, w2, t2 = _split(tokens[j])
            k2, e2 = _kind_end(w2, units)
            if l2 or k2 is None:
                break
            parts.append(k2)
            words.append(w2)
            ending = e2
            end_trail = t2
            j += 1
        # use the longest front part of the run that is one number; the rest is looked at again
        used = len(parts)
        value = _evaluate(parts[:used])
        while value is None and used > 1:
            used -= 1
            value = _evaluate(parts[:used])
        if value is None:
            value = _evaluate(parts[:1])
            used = 1
        lone_small = used == 1 and parts[0][0] == 'u' and (parts[0][1] < 10 or words[0] in AMBIGUOUS_ALONE)
        is_multiple_alone = used == 1 and parts[0][0] == 'u' and parts[0][1] >= 10 and words[0] not in AMBIGUOUS_ALONE
        if value is None or (lone_small and not is_multiple_alone):
            out.append(tokens[i])
            i += 1
            continue
        out.append((lead if used else '') + str(value) + ((ending + end_trail) if used == len(parts) else ''))
        i += used
    return ' '.join(out)
