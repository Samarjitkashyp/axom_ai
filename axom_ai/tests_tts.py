import json
from unittest import mock

import requests
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase

from superadmin.models import SystemSetting
from userpanel.models import UsageRecord

AUDIO = b'ID3\x04\x00fake-mp3'


class FakeResp:
    def __init__(self, status=200, content=AUDIO, cache='miss'):
        self.status_code = status
        self.content = content
        self.headers = {'X-Cache': cache}


def post(client, text='অসম ভাৰতৰ এটা ৰাজ্য।', **extra):
    return client.post('/api/tts/speak/', data=json.dumps(dict({'text': text}, **extra)), content_type='application/json')


class TtsSpeakTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('asha', 'a@example.com', 'pw-12345-xyz')

    def test_audio_is_returned_and_a_new_sentence_is_counted(self):
        self.client.force_login(self.user)
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            r = post(self.client, voice='female')
        self.assertEqual((r.status_code, r['Content-Type'], r.content), (200, 'audio/mpeg', AUDIO))
        self.assertEqual(m.call_args[0][0], 'http://127.0.0.1:8090/tts')
        self.assertEqual(m.call_args[1]['json'], {'text': 'অসম ভাৰতৰ এটা ৰাজ্য।', 'voice': 'female', 'cache_only': False})
        self.assertEqual(UsageRecord.objects.filter(user=self.user, action_type='tts').count(), 1)

    def test_a_replayed_sentence_is_free(self):
        self.client.force_login(self.user)
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(cache='hit')):
            self.assertEqual(post(self.client).status_code, 200)
        self.assertEqual(UsageRecord.objects.filter(action_type='tts').count(), 0)

    def test_unknown_voice_becomes_male(self):
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            post(self.client, voice='robot')
        self.assertEqual(m.call_args[1]['json']['voice'], 'male')

    def test_guests_are_counted_by_address(self):
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()):
            for _ in range(3):
                self.assertEqual(post(self.client).status_code, 200)
        from axom_ai.tts_api import used_today
        req = mock.Mock(user=mock.Mock(is_authenticated=False), META={'REMOTE_ADDR': '127.0.0.1'})
        self.assertEqual(used_today(req), 3)

    def test_over_the_limit_only_replays_what_is_already_made(self):
        SystemSetting.set_setting('tts_daily_free', '2')
        self.client.force_login(self.user)
        for _ in range(2):
            UsageRecord.objects.create(user=self.user, action_type='tts')
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(status=404)) as m:
            r = post(self.client)
        self.assertEqual(m.call_args[1]['json']['cache_only'], True)
        self.assertEqual(r.status_code, 429)
        body = r.json()
        self.assertEqual((body['limit'], body['used'], body['upgrade_required']), (2, 2, True))
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(cache='hit')):
            self.assertEqual(post(self.client).status_code, 200)
        self.assertEqual(UsageRecord.objects.filter(action_type='tts').count(), 2)

    def test_paid_plan_has_its_own_limit(self):
        SystemSetting.set_setting('tts_daily_free', '1')
        SystemSetting.set_setting('tts_daily_pro', '5')
        self.client.force_login(self.user)
        UsageRecord.objects.create(user=self.user, action_type='tts')
        with mock.patch('axom_ai.tts_api.has_active_plan', return_value=True), mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            self.assertEqual(post(self.client).status_code, 200)
        self.assertEqual(m.call_args[1]['json']['cache_only'], False)

    def test_yesterdays_use_does_not_count(self):
        from datetime import timedelta
        from django.utils import timezone
        self.client.force_login(self.user)
        old = UsageRecord.objects.create(user=self.user, action_type='tts')
        UsageRecord.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=2))
        from axom_ai.tts_api import used_today
        req = mock.Mock(user=self.user)
        self.assertEqual(used_today(req), 0)

    def test_switched_off(self):
        SystemSetting.set_setting('tts_enabled', False)
        with mock.patch('axom_ai.tts_api.requests.post') as m:
            r = post(self.client)
        self.assertEqual((r.status_code, r.json()['disabled']), (503, True))
        m.assert_not_called()

    def test_bad_requests_never_reach_the_service(self):
        with mock.patch('axom_ai.tts_api.requests.post') as m:
            self.assertEqual(post(self.client, text='   ').status_code, 400)
            self.assertEqual(post(self.client, text='অ' * 601).status_code, 413)
            self.assertEqual(self.client.post('/api/tts/speak/', data='not json', content_type='application/json').status_code, 400)
            self.assertEqual(self.client.get('/api/tts/speak/').status_code, 405)
        m.assert_not_called()

    def test_service_answers_become_plain_statuses(self):
        for status, expect in ((422, 422), (413, 413), (503, 503), (500, 502)):
            with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(status=status)):
                self.assertEqual(post(self.client).status_code, expect, status)
        with mock.patch('axom_ai.tts_api.requests.post', side_effect=requests.ConnectionError()):
            r = post(self.client)
        self.assertEqual(r.status_code, 503)
        self.assertIn('not available', r.json()['error'])

    def test_preflight(self):
        r = self.client.options('/api/tts/speak/', HTTP_ORIGIN='https://chat.aiaxom.co.in')
        self.assertEqual(r.status_code, 204)


class TtsSettingsTests(TestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_superuser('boss', 'b@example.com', 'pw-12345-xyz'))

    def save(self, **data):
        return self.client.post('/axomai-admin/settings/save/', data=json.dumps(data), content_type='application/json')

    def test_page_shows_defaults(self):
        r = self.client.get('/axomai-admin/settings/')
        self.assertContains(r, 'id="flagTts"')
        self.assertContains(r, 'value="40"')
        self.assertContains(r, 'value="600"')

    def test_limits_saved_and_validated(self):
        self.assertEqual(self.save(tts_daily_free='10', tts_daily_pro=' 900 ', tts_enabled=False).status_code, 200)
        self.assertEqual(SystemSetting.get_setting('tts_daily_free', '40'), '10')
        self.assertEqual(SystemSetting.get_setting('tts_daily_pro', '600'), '900')
        self.assertFalse(SystemSetting.is_enabled('tts_enabled', True))
        for bad in ('x', '-1', '100001', ''):
            self.assertEqual(self.save(tts_daily_free=bad).status_code, 400, bad)
