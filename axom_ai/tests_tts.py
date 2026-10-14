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

    def test_pronunciation_entries_are_applied_before_numbers_are_written_out(self):
        from superadmin.models import AudioTrainingEntry
        AudioTrainingEntry.objects.create(kind='pronunciation', source='2004', target='দুই হাজাৰ চাৰি')
        AudioTrainingEntry.objects.create(kind='pronunciation', source='HTML', target='এইচ টি এম এল')
        self.client.force_login(self.user)
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m,                 mock.patch('axom_ai.voice_text.normalize_numbers') as numbers:
            r = post(self.client, text='সাল 2004 আৰু HTML।')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(m.call_args[1]['json']['text'], 'সাল দুই হাজাৰ চাৰি আৰু এইচ টি এম এল।')
        numbers.assert_not_called()                                    # no digit was left, so nobody is asked to write numbers out

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


class OldOpenVoiceRoutesAreGone(TestCase):
    def test_the_old_public_routes_do_not_exist_any_more(self):
        for url in ('/api/chat/tts/', '/api/tts/synthesize/'):
            r = self.client.post(url, data=json.dumps({'text': 'অসম'}), content_type='application/json')
            self.assertEqual(r.status_code, 404, url)

    def test_the_phonetics_endpoint_still_works(self):
        r = self.client.post('/api/chat/phonetics/', data=json.dumps({'text': 'অসম'}), content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()['success'])


class NumbersAreWrittenOutTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_digits_are_rewritten_as_assamese_words_before_the_voice(self):
        with mock.patch('axom_ai.voice_text._ask', return_value='আজি তাপমাত্ৰা পঁচিশ ডিগ্ৰী।') as ask, \
                mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            self.assertEqual(post(self.client, text='আজি তাপমাত্ৰা ২৫ ডিগ্ৰী।').status_code, 200)
        self.assertEqual(m.call_args[1]['json']['text'], 'আজি তাপমাত্ৰা পঁচিশ ডিগ্ৰী।')
        ask.assert_called_once()

    def test_a_replay_does_not_ask_gemini_again(self):
        with mock.patch('axom_ai.voice_text._ask', return_value='আজি পঁচিশ ডিগ্ৰী।') as ask, mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(cache='hit')):
            post(self.client, text='আজি ২৫ ডিগ্ৰী।')
            post(self.client, text='আজি ২৫ ডিগ্ৰী।')
        self.assertEqual(ask.call_count, 1)

    def test_when_gemini_fails_the_text_goes_as_it_is(self):
        with mock.patch('axom_ai.voice_text._ask', return_value=None), mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            post(self.client, text='আজি ২৫ ডিগ্ৰী।')
        self.assertEqual(m.call_args[1]['json']['text'], 'আজি ২৫ ডিগ্ৰী।')

    def test_a_bad_rewrite_is_refused(self):
        with mock.patch('axom_ai.voice_text._ask', return_value='আজি ২৫ ডিগ্ৰী।'), mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            post(self.client, text='আজি ২৫ ডিগ্ৰী।')                       # a digit is still there
        self.assertEqual(m.call_args[1]['json']['text'], 'আজি ২৫ ডিগ্ৰী।')

    def test_no_digits_no_gemini(self):
        with mock.patch('axom_ai.voice_text._ask') as ask, mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()):
            post(self.client, text='অসম ভাৰতৰ এটা ৰাজ্য।')
        ask.assert_not_called()

    def test_over_the_limit_never_asks_gemini(self):
        SystemSetting.set_setting('tts_daily_free', '0')
        with mock.patch('axom_ai.voice_text._ask') as ask, mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp(status=404)) as m:
            r = post(self.client, text='আজি ২৫ ডিগ্ৰী।')
        ask.assert_not_called()
        self.assertEqual((r.status_code, m.call_args[1]['json']['cache_only']), (429, True))

    def test_rewrite_checks(self):
        from axom_ai import voice_text as vt
        self.assertTrue(vt.valid_rewrite('২৫ ডিগ্ৰী', 'পঁচিশ ডিগ্ৰী'))
        self.assertFalse(vt.valid_rewrite('২৫ ডিগ্ৰী', ''))                  # empty
        self.assertFalse(vt.valid_rewrite('২৫ ডিগ্ৰী', '25 degrees'))        # not Assamese
        self.assertFalse(vt.valid_rewrite('২৫ ডিগ্ৰী', 'পঁচিশ ২ ডিগ্ৰী'))     # a digit left
        self.assertFalse(vt.valid_rewrite('২৫ ডিগ্ৰী', 'অ' * 400))           # far too long
        self.assertTrue(vt.has_digits('মোৰ ৩ টা'))
        self.assertTrue(vt.has_digits('I have 3'))
        self.assertFalse(vt.has_digits('মোৰ তিনিটা'))

    def test_currency_symbol_is_dropped(self):
        from axom_ai import voice_text as vt
        with mock.patch('axom_ai.voice_text._ask', return_value='দাম ₹পাঁচশ টকা।'):
            self.assertEqual(vt.normalize_numbers('দাম ₹৫০০ টকা।'), 'দাম পাঁচশ টকা।')

    def test_gemini_http_failures_fall_through_the_models(self):
        from axom_ai import voice_text as vt

        class R:
            def __init__(self, status, text=None):
                self.status_code = status
                self._t = text

            def json(self):
                return {'candidates': [{'content': {'parts': [{'text': self._t}]}}]}
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k'}), \
                mock.patch('axom_ai.voice_text.requests.post', side_effect=[R(404), R(429), R(200, 'পঁচিশ ডিগ্ৰী')]) as p:
            self.assertEqual(vt._ask('২৫ ডিগ্ৰী'), 'পঁচিশ ডিগ্ৰী')
        self.assertEqual(p.call_count, 3)
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': ''}):
            self.assertIsNone(vt._ask('২৫'))
