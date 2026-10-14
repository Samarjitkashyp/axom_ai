import json
from unittest import mock

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase

from axom_ai import audio_training
from axom_ai.assamese_numbers import numbers_to_digits
from superadmin.models import AudioTrainingEntry


def save(client, **data):
    return client.post('/axomai-admin/audio-training/save/', data=json.dumps(data), content_type='application/json')


class AudioTrainingTests(TestCase):
    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_superuser('boss', 'boss@example.com', 'x')
        self.client.force_login(self.admin)

    def test_page_and_sidebar_link(self):
        r = self.client.get('/axomai-admin/audio-training/')
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'Audio Training')
        self.assertContains(self.client.get('/axomai-admin/language-rules/'), '/axomai-admin/audio-training/')

    def test_only_a_superuser_can_use_it(self):
        self.client.logout()
        self.assertNotEqual(self.client.get('/axomai-admin/audio-training/').status_code, 200)
        self.assertNotEqual(save(self.client, kind='number_word', source='চৌৰাশী', target='84').status_code, 200)
        self.assertEqual(AudioTrainingEntry.objects.count(), 0)

    def test_add_edit_toggle_delete(self):
        r = save(self.client, kind='number_word', source='চৌৰাশী', target='৮৪')           # Assamese digits are accepted
        self.assertEqual(r.json()['success'], True)
        e = AudioTrainingEntry.objects.get()
        self.assertEqual((e.kind, e.source, e.target, e.is_active), ('number_word', 'চৌৰাশী', '84', True))
        self.assertEqual(save(self.client, id=e.id, kind='number_word', source='চৌৰাশী', target='85').json()['success'], True)
        e.refresh_from_db()
        self.assertEqual(e.target, '85')
        self.assertEqual(self.client.post('/axomai-admin/audio-training/toggle/%d/' % e.id).json()['is_active'], False)
        self.assertEqual(self.client.post('/axomai-admin/audio-training/delete/%d/' % e.id).json()['success'], True)
        self.assertEqual(AudioTrainingEntry.objects.count(), 0)

    def test_bad_input_is_refused(self):
        for data in [dict(kind='number_word', source='চৌৰাশী', target='abc'), dict(kind='number_word', source='চৌৰাশী', target='150'), dict(kind='number_word', source='চৌৰাশী', target='1000'),
                     dict(kind='number_word', source='', target='84'), dict(kind='nope', source='a', target='b'),
                     dict(kind='pronunciation', source='HTML', target='')]:
            self.assertEqual(save(self.client, **data).status_code, 400, data)
        self.assertEqual(AudioTrainingEntry.objects.count(), 0)

    def test_a_word_cannot_be_added_twice(self):
        save(self.client, kind='transcript_fix', source='পাইথন', target='Python')
        self.assertEqual(save(self.client, kind='transcript_fix', source='পাইথন', target='Python 3').status_code, 400)

    def test_number_words_reach_the_converter_at_once(self):
        self.assertEqual(numbers_to_digits('চৌৰাশী', audio_training.number_words()), 'চৌৰাশী')
        save(self.client, kind='number_word', source='চৌৰাশী', target='84')
        words = audio_training.number_words()
        self.assertEqual(words, {'চৌৰাশী': 84})
        self.assertEqual(numbers_to_digits('এক হাজাৰ নশ চৌৰাশী', words), '1984')
        self.assertEqual(numbers_to_digits('আমি চৌৰাশীত', words), 'আমি 84ত')
        # switched off: forgotten at once
        e = AudioTrainingEntry.objects.get()
        self.client.post('/axomai-admin/audio-training/toggle/%d/' % e.id)
        self.assertEqual(audio_training.number_words(), {})

    def test_corrections_and_pronunciations_replace_whole_words_only(self):
        save(self.client, kind='transcript_fix', source='পাইথন', target='Python')
        save(self.client, kind='pronunciation', source='HTML', target='এইচ টি এম এল')
        self.assertEqual(audio_training.fix_heard('মই পাইথন শিকো'), 'মই Python শিকো')
        self.assertEqual(audio_training.fix_heard('পাইথনৰ'), 'পাইথনৰ')                      # part of a longer word: left alone
        self.assertEqual(audio_training.fix_pronunciation('HTML শিকোঁ। XHTML'), 'এইচ টি এম এল শিকোঁ। XHTML')

    def test_a_broken_database_changes_nothing(self):
        with mock.patch('superadmin.models.AudioTrainingEntry.objects') as m:
            m.filter.side_effect = RuntimeError('db down')
            cache.clear()
            self.assertEqual(audio_training.fix_heard('abc'), 'abc')
            self.assertEqual(audio_training.number_words(), {})

    def test_hundreds_and_a_year_said_with_added_words(self):
        self.assertEqual(save(self.client, kind='number_word', source='ন\u200cওশ', target='900').json()['success'], True)      # a ZWNJ typed inside the word is dropped
        self.assertEqual(save(self.client, kind='number_word', source='চৈৰাশী', target='84').json()['success'], True)
        self.assertEqual(AudioTrainingEntry.objects.get(target='900').source, 'নওশ')
        words = audio_training.number_words()
        self.assertEqual(numbers_to_digits('এক হাজাৰ নওশ চৈৰাশী', words), '1984')
        self.assertEqual(numbers_to_digits('এক হাজাৰ ন\u200cওশ চৈৰাশী', words), '1984')
        self.assertEqual(numbers_to_digits('নওশ', words), '900')

    def test_the_last_added_or_changed_entry_is_listed_first(self):
        save(self.client, kind='number_word', source='এক', target='1')
        save(self.client, kind='number_word', source='দুই', target='2')
        save(self.client, kind='number_word', source='তিনি', target='3')
        order = [e.source for e in self.client.get('/axomai-admin/audio-training/').context['entries']]
        self.assertEqual(order, ['তিনি', 'দুই', 'এক'])
        first = AudioTrainingEntry.objects.get(source='এক')
        save(self.client, id=first.id, kind='number_word', source='এক', target='1', note='edited')
        order = [e.source for e in self.client.get('/axomai-admin/audio-training/').context['entries']]
        self.assertEqual(order[0], 'এক')
