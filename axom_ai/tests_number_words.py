import json
import random
from unittest import mock

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase

from axom_ai import number_words as nw
from superadmin.models import AudioTrainingEntry, SubdomainPermission, SystemSetting

PW = 'Sturdy-Pass-9271'
# what the admin added (the built-in words cover 0-50 and the tens)
ADMIN = [('চৌৰাশী', 84, False), ('নশ', 900, False), ('এশ', 100, False), ('দুশ', 200, False), ('একাত্তৰ', 71, False)]
TABLE = nw.words_table(ADMIN)


def fin(text, mode='small', top=9999):
    return nw.finish(text, mode, top, TABLE)


class WordsTests(TestCase):
    def test_numbers_become_assamese_words(self):
        self.assertEqual(nw.to_words(0, TABLE), 'শূন্য')
        self.assertEqual(nw.to_words(25, TABLE), 'পঁচিশ')
        self.assertEqual(nw.to_words(84, TABLE), 'চৌৰাশী')
        self.assertEqual(nw.to_words(200, TABLE), 'দুশ')
        self.assertEqual(nw.to_words(2004, TABLE), 'দুই হাজাৰ চাৰি')
        self.assertEqual(nw.to_words(1984, TABLE), 'এক হাজাৰ নশ চৌৰাশী')
        self.assertEqual(nw.to_words(500000, TABLE), None)              # পাঁচশ (500) is not in the list: no guessing
        self.assertEqual(nw.to_words(100000, TABLE), 'এক লাখ')
        self.assertEqual(nw.to_words(10000000, TABLE), 'এক কোটি')

    def test_a_missing_word_means_digits_stay(self):
        self.assertIsNone(nw.to_words(73, TABLE))                       # 73 is not in the list
        self.assertEqual(fin('মোৰ বয়স 73 বছৰ'), 'মোৰ বয়স 73 বছৰ')
        self.assertEqual(fin('মোৰ বয়স 71 বছৰ'), 'মোৰ বয়স একাত্তৰ বছৰ')

    def test_preferred_spelling_wins(self):
        table = nw.words_table([('নশ', 900, False), ('নৱশ', 900, True)])
        self.assertEqual(table[900], 'নৱশ')
        table = nw.words_table([('নৱশ', 900, False), ('নশ', 900, False)])
        self.assertEqual(table[900], 'নৱশ')                             # none preferred: the first
        self.assertEqual(nw.words_table([('চৈৰাশী', 84, True)])[84], 'চৈৰাশী')


class TextTests(TestCase):
    def test_modes(self):
        self.assertEqual(fin('সাল 2004 আৰু 25 জন', 'off'), 'সাল 2004 আৰু 25 জন')
        self.assertEqual(fin('সাল 2004 আৰু 25 জন', 'years'), 'সাল দুই হাজাৰ চাৰি আৰু 25 জন')
        self.assertEqual(fin('সাল 2004 আৰু 25 জন', 'small'), 'সাল দুই হাজাৰ চাৰি আৰু পঁচিশ জন')

    def test_the_limit(self):
        self.assertEqual(fin('সংখ্যা 12000 টা', 'small', 9999), 'সংখ্যা 12000 টা')
        self.assertEqual(fin('সংখ্যা 2004 টা', 'small', 1000), 'সংখ্যা 2004 টা')

    def test_endings_stay(self):
        self.assertEqual(fin('2004ত আৰু 84ৰ'), 'দুই হাজাৰ চাৰিত আৰু চৌৰাশীৰ')

    def test_things_that_are_not_just_a_number_stay_as_digits(self):
        for s in ['তাৰিখ 15/10/2026 ত', 'সময় 10:30 বজাত', 'ফোন 9876543210 ত', 'দাম ₹500 টকা', 'দাম $20 হ\'ব', '50% নম্বৰ',
                  'মান 3.5 হ\'ব', 'মান 1,000 হ\'ব', 'ID AX-123 ত', 'কোড A12 ত', 'বছৰ 2004-05 ত', 'নম্বৰ 007 ত', 'পৃষ্ঠা 5km দূৰ', 'সংখ্যা 12345678 ত']:
            self.assertEqual(fin(s), s, s)

    def test_list_numbers_tables_code_and_links(self):
        text = '১ম পৰ্যায়\n1. প্ৰথম পদক্ষেপ 25 জন\n2) দ্বিতীয়\n| সাল | 2004 |\n```\nx = 2004\n```\nআৰু `5` কোড আৰু https://x.in/2004 আৰু 25 জন'
        out = fin(text)
        self.assertIn('1. প্ৰথম পদক্ষেপ পঁচিশ জন', out)           # the list number stays, the number in the sentence is written
        self.assertIn('2) দ্বিতীয়', out)
        self.assertIn('| সাল | 2004 |', out)
        self.assertIn('x = 2004', out)
        self.assertIn('`5`', out)
        self.assertIn('https://x.in/2004', out)
        self.assertTrue(out.endswith('আৰু পঁচিশ জন'))

    def test_english_answers_are_not_touched(self):
        self.assertEqual(fin('The year is 2004 and 25 people came.'), 'The year is 2004 and 25 people came.')

    def test_whole_answer_and_streamed_answer_are_the_same(self):
        text = ('মোৰ জন্ম 1984 চনত হৈছিল আৰু 25 জন বন্ধু আছিল।\nতাৰিখ 15/10/2026, সময় 10:30, ফোন 9876543210, দাম ₹500।\n'
                '1. প্ৰথম 2004\n```\nx = 7\n```\nআৰু 100 টা, 900 জন, 84 বছৰ। 2004.')
        whole = fin(text)
        self.assertIn('এক হাজাৰ নশ চৌৰাশী', whole)
        rng = random.Random(5)
        for _ in range(300):
            s = nw.NumberWordStream('small', 9999, TABLE)
            out, i = [], 0
            while i < len(text):
                j = i + rng.randint(1, 7)
                out.append(s.feed(text[i:j]))
                i = j
            out.append(s.flush())
            self.assertEqual(''.join(out), whole)

    def test_a_number_cut_between_two_chunks_is_whole_again(self):
        s = nw.NumberWordStream('small', 9999, TABLE)
        parts = [s.feed('মোৰ বয়স 7'), s.feed('1 বছৰ'), s.flush()]
        self.assertEqual(''.join(parts), 'মোৰ বয়স একাত্তৰ বছৰ')
        s = nw.NumberWordStream('small', 9999, TABLE)
        parts = [s.feed('তাৰিখ 15/'), s.feed('10/2026 ত'), s.flush()]
        self.assertEqual(''.join(parts), 'তাৰিখ 15/10/2026 ত')            # held until the slash is known not to end the number

    def test_voice_writes_all_it_can(self):
        cache.clear()
        self.assertEqual(nw.for_voice('সাল 2004 আৰু ₹500'), 'সাল দুই হাজাৰ চাৰি আৰু ₹500')
        self.assertEqual(nw.for_voice('hello'), 'hello')


class SettingsAndChatTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_default_is_off_and_the_setting_is_read(self):
        self.assertEqual(nw.current_settings(), ('off', 9999))
        SystemSetting.set_setting(nw.SETTING_MODE, 'years')
        SystemSetting.set_setting(nw.SETTING_MAX, '500')
        nw.forget()
        self.assertEqual(nw.current_settings(), ('years', 500))
        SystemSetting.set_setting(nw.SETTING_MODE, 'nonsense')
        nw.forget()
        self.assertEqual(nw.current_settings()[0], 'off')

    def test_the_chat_helper_and_the_model_instruction(self):
        from axom_ai import views
        self.assertEqual(views._assamese_final('সাল 2004 ত'), 'সাল 2004 ত')               # off
        self.assertNotIn('NUMBERS:', views._get_language_rules_block())
        SystemSetting.set_setting(nw.SETTING_MODE, 'small')
        nw.forget()
        views._LANG_RULES_CACHE.update(text='', ts=0)
        self.assertEqual(views._assamese_final('সাল 2004 ত'), 'সাল দুই হাজাৰ চাৰি ত')
        self.assertIn('NUMBERS:', views._get_language_rules_block())

    def test_the_list_of_audio_training_is_used(self):
        AudioTrainingEntry.objects.create(kind='number_word', source='চৈৰাশী', target='84', preferred=True)
        AudioTrainingEntry.objects.create(kind='number_word', source='চৌৰাশী', target='84')
        AudioTrainingEntry.objects.create(kind='transcript_fix', source='84', target='x')           # another kind: ignored
        cache.clear()
        self.assertEqual(nw.cached_table()[84], 'চৈৰাশী')

    def test_voice_uses_the_words(self):
        from axom_ai.tests_tts import FakeResp
        user = User.objects.create_user('v', 'v@example.com', PW)
        self.client.force_login(user)
        with mock.patch('axom_ai.tts_api.requests.post', return_value=FakeResp()) as m:
            r = self.client.post('/api/tts/speak/', data=json.dumps({'text': 'সাল 2004 ত'}), content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(m.call_args[1]['json']['text'], 'সাল দুই হাজাৰ চাৰি ত')


def api(client, path, **data):
    return client.post('/axomai-admin/language-rules/numbers/' + path, data=json.dumps(data), content_type='application/json')


class AdminNumbersTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('lr', 'lr@example.com', PW)
        SubdomainPermission.objects.create(user=self.user, admin_access=True, admin_sections=['language_rules'])
        self.client.force_login(self.user)

    def test_the_page_has_a_numbers_tab(self):
        AudioTrainingEntry.objects.create(kind='number_word', source='চৌৰাশী', target='84')
        html = self.client.get('/axomai-admin/language-rules/').content.decode()
        for needle in ['id="numbers-panel"', 'Numbers (1)', 'চৌৰাশী', 'numSaveSettings()', 'Write numbers as words in Assamese answers', 'id="num-modal"']:
            self.assertIn(needle, html)

    def test_add_edit_prefer_toggle_delete(self):
        r = api(self.client, 'save/', source='চৌৰাশী', target='84')
        self.assertEqual(r.json()['success'], True)
        a = AudioTrainingEntry.objects.get(source='চৌৰাশী')
        self.assertEqual((a.kind, a.target, a.preferred), ('number_word', '84', False))
        api(self.client, 'save/', source='চৈৰাশী', target='৮৪', preferred=True)               # Assamese digits are accepted
        b = AudioTrainingEntry.objects.get(source='চৈৰাশী')
        self.assertTrue(b.preferred)
        self.assertEqual(nw.cached_table()[84], 'চৈৰাশী')
        api(self.client, 'prefer/%d/' % a.id)                                              # only one preferred per value
        a.refresh_from_db(); b.refresh_from_db()
        self.assertEqual((a.preferred, b.preferred), (True, False))
        self.assertEqual(nw.cached_table()[84], 'চৌৰাশী')
        self.assertEqual(api(self.client, 'toggle/%d/' % a.id).json()['is_active'], False)
        self.assertEqual(nw.cached_table()[84], 'চৈৰাশী')                                    # a switched-off word is not used
        self.assertEqual(api(self.client, 'delete/%d/' % b.id).json()['success'], True)
        self.assertEqual(AudioTrainingEntry.objects.filter(kind='number_word').count(), 1)

    def test_bad_input(self):
        for data in [dict(source='', target='84'), dict(source='চৌৰাশী', target='abc'), dict(source='চৌৰাশী', target='150'), dict(source='চৌৰাশী', target='1000')]:
            self.assertEqual(api(self.client, 'save/', **data).status_code, 400, data)
        api(self.client, 'save/', source='চৌৰাশী', target='84')
        self.assertEqual(api(self.client, 'save/', source='চৌৰাশী', target='85').status_code, 400)       # the word is there already

    def test_only_number_entries_can_be_touched_here(self):
        other = AudioTrainingEntry.objects.create(kind='pronunciation', source='HTML', target='এইচ টি এম এল')
        for path in ['prefer/%d/', 'toggle/%d/', 'delete/%d/']:
            self.assertEqual(api(self.client, path % other.id).status_code, 404, path)
        self.assertTrue(AudioTrainingEntry.objects.filter(id=other.id).exists())

    def test_settings(self):
        self.assertEqual(api(self.client, 'settings/', mode='small', max=5000).json()['success'], True)
        self.assertEqual(nw.current_settings(), ('small', 5000))
        for data in [dict(mode='all', max=5), dict(mode='small', max=0), dict(mode='small', max='x'), dict(mode='small', max=99999999)]:
            self.assertEqual(api(self.client, 'settings/', **data).status_code, 400, data)
        self.assertEqual(nw.current_settings(), ('small', 5000))

    def test_preview(self):
        r = self.client.get('/axomai-admin/language-rules/numbers/preview/?n=2004').json()
        self.assertEqual(r['words'], 'দুই হাজাৰ চাৰি')
        self.assertIsNone(self.client.get('/axomai-admin/language-rules/numbers/preview/?n=73').json()['words'])
        self.assertIsNone(self.client.get('/axomai-admin/language-rules/numbers/preview/?n=abc').json()['words'])

    def test_who_may_use_it(self):
        other = User.objects.create_user('au', 'au@example.com', PW)
        SubdomainPermission.objects.create(user=other, admin_access=True, admin_sections=['audio_training'])       # another section only
        self.client.force_login(other)
        self.assertEqual(api(self.client, 'save/', source='চৌৰাশী', target='84').status_code, 302)
        self.assertEqual(self.client.post('/axomai-admin/language-rules/numbers/settings/', data='{}', content_type='application/json').status_code, 302)
        self.assertFalse(AudioTrainingEntry.objects.exists())
        self.client.logout()
        self.assertEqual(api(self.client, 'save/', source='চৌৰাশী', target='84').status_code, 302)
