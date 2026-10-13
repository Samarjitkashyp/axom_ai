"""Assamese voice for the chat: POST /api/tts/speak/  {"text": "<one sentence>", "voice": "male"|"female"}  ->  audio/mpeg

The voice itself (AI4Bharat Indic-TTS, FastPitch + HiFi-GAN) runs as a separate local service (axom-tts, 127.0.0.1:8090, its own system user); this
view is the only door to it: it limits how many sentences a person can have made each day (a sentence that is already made is free to replay),
and turns the service's answers into plain HTTP statuses for the chat.
"""
import os
import json
from datetime import datetime, time as dtime

import requests
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from axom_ai import voice_text
from axom_ai.security import get_client_ip
from axom_ai.views import _chat_cors_view
from payments.utils import has_active_plan
from superadmin.models import SystemSetting
from userpanel.models import UsageRecord

TTS_URL = os.getenv('TTS_SERVICE_URL', 'http://127.0.0.1:8090').rstrip('/')
MAX_CHARS = 600                 # the service itself takes 400 characters after cleaning
DEFAULT_FREE = 40               # sentences made per day, signed in without a plan or not signed in
DEFAULT_PRO = 600


def _int_setting(key, default):
    try:
        return max(0, int(SystemSetting.get_setting(key, str(default))))
    except (TypeError, ValueError):
        return default


def _today_start():
    return timezone.make_aware(datetime.combine(timezone.localdate(), dtime.min))


def _guest_key(request):
    return 'tts:guest:%s:%s' % (get_client_ip(request) or 'unknown', timezone.localdate().isoformat())


def used_today(request):
    if request.user.is_authenticated:
        return UsageRecord.objects.filter(user=request.user, action_type='tts', created_at__gte=_today_start()).count()
    return cache.get(_guest_key(request), 0)


def count_one(request):
    if request.user.is_authenticated:
        UsageRecord.objects.create(user=request.user, action_type='tts', details='sentence')
    else:
        key = _guest_key(request)
        try:
            cache.incr(key)
        except ValueError:
            cache.set(key, 1, 90000)


def daily_limit(request):
    if request.user.is_authenticated and has_active_plan(request.user):
        return _int_setting('tts_daily_pro', DEFAULT_PRO)
    return _int_setting('tts_daily_free', DEFAULT_FREE)


def _error(message, status, **extra):
    return JsonResponse(dict({'success': False, 'error': message}, **extra), status=status)


@csrf_exempt
@_chat_cors_view
def tts_speak_api(request):
    if request.method != 'POST':
        return _error('Only POST is allowed.', 405)
    if not SystemSetting.is_enabled('tts_enabled', True):
        return _error('The Assamese voice is switched off right now.', 503, disabled=True)
    try:
        data = json.loads(request.body.decode('utf-8'))
        text = str(data.get('text') or '').strip()
        voice = data.get('voice') if data.get('voice') in ('male', 'female') else 'male'
    except (ValueError, UnicodeDecodeError, AttributeError):
        return _error('Invalid request.', 400)
    if not text:
        return _error('There is no text to read.', 400)
    if len(text) > MAX_CHARS:
        return _error('This sentence is too long to read (%d characters at most).' % MAX_CHARS, 413)

    used, limit = used_today(request), daily_limit(request)
    over = used >= limit
    pro = request.user.is_authenticated and has_active_plan(request.user)
    # numbers are written out as Assamese words first (the voice has no digits); a person over the limit only gets what was remembered
    spoken = (voice_text.normalize_numbers(text, allow_ask=not over) or text) if voice_text.has_digits(text) else text
    try:
        r = requests.post(TTS_URL + '/tts', json={'text': spoken, 'voice': voice, 'cache_only': over}, timeout=75)
    except requests.RequestException:
        return _error('The Assamese voice is not available right now.', 503)

    if r.status_code == 200:
        if r.headers.get('X-Cache') == 'miss':
            count_one(request)
        resp = HttpResponse(r.content, content_type='audio/mpeg')
        resp['Cache-Control'] = 'private, max-age=3600'
        return resp
    if r.status_code == 404 and over:
        return _error('You have used today\'s voice limit (%d sentences).' % limit, 429, limit=limit, used=used, upgrade_required=not pro)
    if r.status_code == 422:
        return _error('Nothing to read in Assamese.', 422)
    if r.status_code == 413:
        return _error('This sentence is too long to read.', 413)
    if r.status_code == 503:
        return _error('The voice is busy; please try again in a moment.', 503, retry=True)
    return _error('The Assamese voice could not be made.', 502)
