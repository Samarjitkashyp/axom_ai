import json
import shutil
import subprocess
import tempfile
from unittest import mock, skipUnless

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from axom_ai import stt_api
from superadmin.models import SystemSetting
from userpanel.models import UsageRecord

HAVE_FFMPEG = bool(shutil.which('ffmpeg'))


def make_audio(spec, seconds=2, suffix='.webm'):
    """A real recording made with ffmpeg: a tone (stands for a voice) or silence, in the format a browser sends."""
    out = tempfile.mktemp(suffix=suffix)
    codec = ['-c:a', 'libopus'] if suffix == '.webm' else []
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', spec, '-t', str(seconds)] + codec + [out], check=True)
    with open(out, 'rb') as f:
        return f.read()


TONE = 'sine=frequency=300:sample_rate=48000'              # loud enough: counts as sound
SILENCE = 'anullsrc=r=48000:cl=mono'


def post(client, audio=None, **fields):
    data = dict({'language': 'assamese'}, **fields)
    if audio is not None:
        data['audio'] = SimpleUploadedFile('speech.webm', audio, content_type='audio/webm')
    return client.post('/api/stt/', data=data)


@skipUnless(HAVE_FFMPEG, 'ffmpeg is needed')
class SttTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.tone = make_audio(TONE)
        cls.silence = make_audio(SILENCE)

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('asha', 'a@example.com', 'pw-12345-xyz')

    def test_a_recording_is_written_down_and_counted(self):
        self.client.force_login(self.user)
        with mock.patch('axom_ai.stt_api.transcribe', return_value='নমস্কাৰ মই অসম এআই') as tr:
            r = post(self.client, self.tone)
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual((body['success'], body['text']), (True, 'নমস্কাৰ মই অসম এআই'))
        self.assertGreater(body['seconds'], 0.5)
        self.assertEqual(tr.call_args[0][1], 'assamese')
        self.assertTrue(tr.call_args[0][0][:4] == b'RIFF')                  # Gemini gets a clean 16 kHz wav
        self.assertEqual(UsageRecord.objects.filter(user=self.user, action_type='stt').count(), 1)

    def test_silence_is_not_sent_and_not_counted(self):
        self.client.force_login(self.user)
        with mock.patch('axom_ai.stt_api.transcribe') as tr:
            r = post(self.client, self.silence)
        self.assertEqual((r.status_code, r.json()['text']), (200, ''))
        tr.assert_not_called()
        self.assertEqual(UsageRecord.objects.filter(action_type='stt').count(), 0)

    def test_language_goes_to_gemini_and_unknown_means_assamese(self):
        with mock.patch('axom_ai.stt_api.transcribe', return_value='hello') as tr:
            post(self.client, self.tone, language='english')
            self.assertEqual(tr.call_args[0][1], 'english')
            post(self.client, self.tone, language='hinglish')
            self.assertEqual(tr.call_args[0][1], 'hinglish')
            post(self.client, self.tone, language='klingon')
            self.assertEqual(tr.call_args[0][1], 'assamese')

    def test_gemini_down_is_a_503_and_not_counted(self):
        self.client.force_login(self.user)
        with mock.patch('axom_ai.stt_api.transcribe', return_value=None):
            r = post(self.client, self.tone)
        self.assertEqual(r.status_code, 503)
        self.assertEqual(UsageRecord.objects.filter(action_type='stt').count(), 0)

    def test_bad_requests(self):
        self.assertEqual(post(self.client).status_code, 400)
        self.assertEqual(self.client.get('/api/stt/').status_code, 405)
        self.assertEqual(post(self.client, b'not audio at all, just bytes' * 20).status_code, 400)
        self.assertEqual(post(self.client, b'0' * (stt_api.MAX_BYTES + 1)).status_code, 413)

    def test_too_long_a_recording(self):
        long = make_audio(TONE, seconds=stt_api.MAX_SECONDS + 8)
        with mock.patch('axom_ai.stt_api.transcribe') as tr:
            r = post(self.client, long)
        self.assertIn(r.status_code, (200, 413))
        tr.assert_not_called() if r.status_code == 413 else None

    def test_switched_off(self):
        SystemSetting.set_setting('stt_enabled', False)
        with mock.patch('axom_ai.stt_api.transcribe') as tr:
            r = post(self.client, self.tone)
        self.assertEqual((r.status_code, r.json()['disabled']), (503, True))
        tr.assert_not_called()

    def test_daily_limit_and_the_paid_limit(self):
        SystemSetting.set_setting('stt_daily_free', '1')
        SystemSetting.set_setting('stt_daily_pro', '3')
        self.client.force_login(self.user)
        with mock.patch('axom_ai.stt_api.transcribe', return_value='ঠিক আছে'):
            self.assertEqual(post(self.client, self.tone).status_code, 200)
            r = post(self.client, self.tone)
            self.assertEqual(r.status_code, 429)
            self.assertEqual((r.json()['limit'], r.json()['used'], r.json()['upgrade_required']), (1, 1, True))
            with mock.patch('axom_ai.stt_api.has_active_plan', return_value=True):
                self.assertEqual(post(self.client, self.tone).status_code, 200)

    def test_guests_are_counted_by_address(self):
        SystemSetting.set_setting('stt_daily_free', '2')
        with mock.patch('axom_ai.stt_api.transcribe', return_value='ঠিক'):
            self.assertEqual(post(self.client, self.tone).status_code, 200)
            self.assertEqual(post(self.client, self.tone).status_code, 200)
            self.assertEqual(post(self.client, self.tone).status_code, 429)

    def test_clean_audio_measures_speech_and_silence(self):
        wav, secs, db = stt_api.clean_audio(self.tone)
        self.assertTrue(stt_api.has_speech(secs, db))
        self.assertGreater(secs, 0.5)
        self.assertEqual(wav[:4], b'RIFF')
        wav2, secs2, db2 = stt_api.clean_audio(self.silence)
        self.assertFalse(stt_api.has_speech(secs2, db2))

    def test_other_browser_formats(self):
        for suffix in ('.wav', '.ogg', '.m4a'):
            try:
                audio = make_audio(TONE, suffix=suffix)
            except subprocess.CalledProcessError:
                continue
            wav, secs, db = stt_api.clean_audio(audio)
            self.assertTrue(stt_api.has_speech(secs, db), suffix)


class TranscribeTests(TestCase):
    class R:
        def __init__(self, status, text=None):
            self.status_code = status
            self._t = text

        def json(self):
            return {'candidates': [{'content': {'parts': [{'text': self._t}]}}]}

    def test_no_speech_answer_is_an_empty_text(self):
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(200, 'NO_SPEECH')):
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), '')

    def test_text_is_tidied(self):
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(200, '  "How   are\nyou"  ')):
            self.assertEqual(stt_api.transcribe(b'RIFF', 'english'), 'How are you')

    def test_models_are_tried_one_after_the_other(self):
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), \
                mock.patch('axom_ai.stt_api.requests.post', side_effect=[self.R(404), self.R(429), self.R(200, 'ঠিক আছে')]) as p:
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'ঠিক আছে')
        self.assertEqual(p.call_count, 3)
        body = p.call_args[1]['json']['contents'][0]['parts']
        self.assertIn('Assamese', body[0]['text'])
        self.assertEqual(body[1]['inline_data']['mime_type'], 'audio/wav')

    def test_everything_failing_or_no_key_is_none(self):
        import requests
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), mock.patch('axom_ai.stt_api.requests.post', side_effect=requests.ConnectionError()):
            self.assertIsNone(stt_api.transcribe(b'RIFF', 'assamese'))
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': ''}):
            self.assertIsNone(stt_api.transcribe(b'RIFF', 'assamese'))


class SttSettingsTests(TestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_superuser('boss', 'b@example.com', 'pw-12345-xyz'))

    def save(self, **data):
        return self.client.post('/axomai-admin/settings/save/', data=json.dumps(data), content_type='application/json')

    def test_page_and_validation(self):
        r = self.client.get('/axomai-admin/settings/')
        self.assertContains(r, 'id="flagStt"')
        self.assertContains(r, 'value="400"')
        self.assertEqual(self.save(stt_daily_free='15', stt_daily_pro=' 250 ', stt_enabled=False).status_code, 200)
        self.assertEqual(SystemSetting.get_setting('stt_daily_free', '40'), '15')
        self.assertEqual(SystemSetting.get_setting('stt_daily_pro', '400'), '250')
        self.assertFalse(SystemSetting.is_enabled('stt_enabled', True))
        for bad in ('x', '-1', '100001'):
            self.assertEqual(self.save(stt_daily_free=bad).status_code, 400, bad)


class SecondReaderTests(TestCase):
    """Gemini is sometimes 'in high demand' (503) or too slow: one more try, then OpenAI, and never more than DEADLINE_SECONDS."""

    class R:
        def __init__(self, status, text=None, key='text'):
            self.status_code = status
            self._t = text
            self._key = key

        def json(self):
            if self._key == 'openai':
                return {'text': self._t}
            return {'candidates': [{'content': {'parts': [{'text': self._t}]}}]}

    def env(self, openai='ok'):
        return mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': 'o' if openai else ''})

    def test_a_busy_model_gets_one_more_try(self):
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), \
                mock.patch('axom_ai.stt_api.requests.post', side_effect=[self.R(503), self.R(200, 'ঠিক আছে')]) as p:
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'ঠিক আছে')
        self.assertEqual(p.call_count, 2)
        self.assertEqual(p.call_args_list[0][0][0], p.call_args_list[1][0][0])          # the same model, twice

    def test_openai_reads_when_gemini_cannot(self):
        calls = []

        def fake(url, **kw):
            calls.append(url)
            if 'openai' in url:
                return self.R(200, 'নমস্কাৰ', key='openai')
            return self.R(503)
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'নমস্কাৰ')
        self.assertTrue(calls[-1].startswith('https://api.openai.com/v1/audio/transcriptions'))

    def test_openai_is_told_the_language(self):
        seen = {}

        def fake(url, **kw):
            if 'openai' in url:
                seen.update(kw['data'])
                return self.R(200, 'hello', key='openai')
            return self.R(503)
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
            stt_api.transcribe(b'RIFF', 'english')
        self.assertEqual(seen['language'], 'en')

    def test_assamese_is_asked_for_in_a_prompt_not_a_language_code(self):
        seen = {}

        def fake(url, **kw):
            if 'openai' in url:
                seen.update(kw['data'])
                return self.R(200, 'নমস্কাৰ', key='openai')
            return self.R(503)
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
            stt_api.transcribe(b'RIFF', 'assamese')
        self.assertNotIn('language', seen)                       # OpenAI answers 400 to 'as'
        self.assertIn('Assamese', seen['prompt'])

    def test_nobody_available_is_none(self):
        with self.env(openai=''), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(503)):
            self.assertIsNone(stt_api.transcribe(b'RIFF', 'assamese'))
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(503)):
            self.assertIsNone(stt_api.transcribe(b'RIFF', 'assamese'))

    def test_the_wait_has_an_end(self):
        clock = {'t': 0.0}

        def slow(url, **kw):
            clock['t'] += kw['timeout']                            # every call uses all of its time
            import requests
            raise requests.Timeout()
        with self.env(), mock.patch('axom_ai.stt_api.time.monotonic', side_effect=lambda: clock['t']), mock.patch('axom_ai.stt_api.time.sleep'), \
                mock.patch('axom_ai.stt_api.requests.post', side_effect=slow) as p:
            self.assertIsNone(stt_api.transcribe(b'RIFF', 'assamese'))
        self.assertLessEqual(clock['t'], stt_api.DEADLINE_SECONDS + 1)
        self.assertLessEqual(p.call_count, 5)


class NumberRewriteResilienceTests(TestCase):
    def test_a_busy_model_gets_one_more_try_and_a_dead_end_is_none(self):
        from axom_ai import voice_text as vt

        class R:
            def __init__(self, status, text=None):
                self.status_code = status
                self._t = text

            def json(self):
                return {'candidates': [{'content': {'parts': [{'text': self._t}]}}]}
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), mock.patch('axom_ai.voice_text.time.sleep'), \
                mock.patch('axom_ai.voice_text.requests.post', side_effect=[R(503), R(200, 'পঁচিশ')]) as p:
            self.assertEqual(vt._ask('২৫'), 'পঁচিশ')
        self.assertEqual(p.call_count, 2)
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': ''}), mock.patch('axom_ai.voice_text.time.sleep'), \
                mock.patch('axom_ai.voice_text.requests.post', return_value=R(503)):
            self.assertIsNone(vt._ask('২৫'))


class NumberRewriteSecondWriterTests(TestCase):
    def test_openai_writes_the_numbers_when_gemini_cannot(self):
        from axom_ai import voice_text as vt

        class R:
            def __init__(self, status, content=None):
                self.status_code = status
                self._c = content

            def json(self):
                return {'choices': [{'message': {'content': self._c}}]}

        def fake(url, **kw):
            if 'openai' in url:
                return R(200, 'আজি পঁচিশ ডিগ্ৰী।')
            return R(503)
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': 'o'}), mock.patch('axom_ai.voice_text.time.sleep'),                 mock.patch('axom_ai.voice_text.requests.post', side_effect=fake) as p:
            self.assertEqual(vt._ask('আজি ২৫ ডিগ্ৰী।'), 'আজি পঁচিশ ডিগ্ৰী।')
        self.assertIn('api.openai.com', p.call_args[0][0])

    def test_gemini_first_when_it_answers(self):
        from axom_ai import voice_text as vt

        class R:
            status_code = 200

            def json(self):
                return {'candidates': [{'content': {'parts': [{'text': 'পঁচিশ'}]}}]}
        with mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': 'o'}), mock.patch('axom_ai.voice_text.requests.post', return_value=R()) as p:
            self.assertEqual(vt._ask('২৫'), 'পঁচিশ')
        self.assertEqual(p.call_count, 1)
        self.assertIn('generativelanguage', p.call_args[0][0])
