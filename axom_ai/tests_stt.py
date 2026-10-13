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


# words go on and off: a tone that is on for 0.35 s and off for 0.35 s stands for a voice (a steady tone would be taken for a hum)
TONE = "aevalsrc='sin(2*PI*220*t)*gt(sin(2*PI*t/0.7),0)':s=48000"
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


class ReadersTests(TestCase):
    """OpenAI reads first (fast); Gemini is the second reader; a reader that is "in high demand" gets one more try; the wait has an end."""

    class R:
        def __init__(self, status, text=None, key='text'):
            self.status_code = status
            self._t = text
            self._key = key

        def json(self):
            if self._key == 'openai':
                return {'text': self._t}
            return {'candidates': [{'content': {'parts': [{'text': self._t}]}}]}

    def env(self, openai='o'):
        return mock.patch.dict('os.environ', {'GEMINI_API_KEY': 'k', 'OPENAI_API_KEY': openai})

    def test_openai_reads_first_and_gemini_is_not_asked(self):
        with self.env(), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(200, 'নমস্কাৰ', key='openai')) as p:
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'নমস্কাৰ')
        self.assertEqual(p.call_count, 1)
        self.assertIn('api.openai.com', p.call_args[0][0])

    def test_gemini_reads_when_openai_cannot(self):
        def fake(url, **kw):
            return self.R(500, key='openai') if 'openai' in url else self.R(200, 'ঠিক আছে')
        with self.env(), mock.patch('axom_ai.stt_api.time.sleep'), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake) as p:
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'ঠিক আছে')
        self.assertIn('api.openai.com', p.call_args_list[0][0][0])
        self.assertIn('generativelanguage', p.call_args_list[1][0][0])

    def test_without_an_openai_key_gemini_reads_and_a_busy_model_gets_one_more_try(self):
        with self.env(openai=''), mock.patch('axom_ai.stt_api.time.sleep'), \
                mock.patch('axom_ai.stt_api.requests.post', side_effect=[self.R(503), self.R(200, 'ঠিক আছে')]) as p:
            self.assertEqual(stt_api.transcribe(b'RIFF', 'assamese'), 'ঠিক আছে')
        self.assertEqual(p.call_args_list[0][0][0], p.call_args_list[1][0][0])          # the same Gemini model, twice

    def test_gemini_first_when_asked_to(self):
        calls = []

        def fake(url, **kw):
            calls.append(url)
            return self.R(200, 'ঠিক', key='openai') if 'openai' in url else self.R(200, 'ঠিক')
        with self.env(), mock.patch('axom_ai.stt_api.PRIMARY', 'gemini'), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
            stt_api.transcribe(b'RIFF', 'assamese')
        self.assertIn('generativelanguage', calls[0])

    def test_assamese_is_sent_with_no_prompt_and_no_language_code(self):
        seen = {}

        def fake(url, **kw):
            seen.update(kw['data'])
            return self.R(200, 'নমস্কাৰ', key='openai')
        with self.env(), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
            stt_api.transcribe(b'RIFF', 'assamese')
        self.assertNotIn('language', seen)                       # OpenAI answers 400 to 'as'
        self.assertNotIn('prompt', seen)                         # with noise only it said an Assamese prompt back as the text

    def test_english_and_hindi_get_a_language_code(self):
        for lang, code in (('english', 'en'), ('hinglish', 'hi')):
            seen = {}

            def fake(url, **kw):
                seen.update(kw['data'])
                return self.R(200, 'hello', key='openai')
            with self.env(), mock.patch('axom_ai.stt_api.requests.post', side_effect=fake):
                stt_api.transcribe(b'RIFF', lang)
            self.assertEqual(seen['language'], code)

    def test_a_stock_phrase_on_noise_is_not_speech(self):
        for phrase in ('Thank you.', 'thanks for watching!', 'You'):
            with self.env(), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(200, phrase, key='openai')):
                self.assertEqual(stt_api.transcribe(b'RIFF', 'english'), '', phrase)
        with self.env(), mock.patch('axom_ai.stt_api.requests.post', return_value=self.R(200, 'Thank you for your help with the form', key='openai')):
            self.assertEqual(stt_api.transcribe(b'RIFF', 'english'), 'Thank you for your help with the form')

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


@skipUnless(HAVE_FFMPEG, 'ffmpeg is needed')
class OnlyNoiseTests(TestCase):
    """A recording of only noise (a fan, a hum, rain, a road) must not be written down: a recogniser asked to do that sometimes invents text."""

    def setUp(self):
        cache.clear()

    def test_steady_noise_is_not_speech_and_is_not_sent_or_counted(self):
        for spec in ('anoisesrc=c=pink:a=0.1:r=48000', 'anoisesrc=c=brown:a=0.2:r=48000', 'sine=frequency=120:sample_rate=48000', 'anoisesrc=c=white:a=0.1:r=48000'):
            audio = make_audio(spec, seconds=3)
            wav, secs, db = stt_api.clean_audio(audio)
            self.assertLess(stt_api.speech_dynamics(wav), stt_api.MIN_DYNAMICS, spec)
            with mock.patch('axom_ai.stt_api.transcribe') as tr:
                r = post(self.client, audio)
            self.assertEqual((r.status_code, r.json()['text']), (200, ''), spec)
            tr.assert_not_called()
        self.assertEqual(UsageRecord.objects.filter(action_type='stt').count(), 0)

    def test_speech_like_changes_of_loudness_pass(self):
        # a tone that is on and off like words: 0.4 s sound, 0.3 s pause, five times
        audio = make_audio("aevalsrc='sin(2*PI*220*t)*gt(sin(2*PI*t/0.7),0)':s=48000:d=3.5", seconds=3.5)
        wav, secs, db = stt_api.clean_audio(audio)
        self.assertGreater(stt_api.speech_dynamics(wav), 3)


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
