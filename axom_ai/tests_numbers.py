from django.test import SimpleTestCase

from axom_ai.assamese_numbers import numbers_to_digits as n


class AssameseNumbers(SimpleTestCase):
    def test_years_and_amounts(self):
        self.assertEqual(n('দুই হাজাৰ চৌবিশ'), '2024')
        self.assertEqual(n('এক হাজাৰ নশ সাতচল্লিশ'), '1947')
        self.assertEqual(n('উনৈশশ সাতচল্লিশ'), '1947')
        self.assertEqual(n('পাঁচ লাখ'), '500000')
        self.assertEqual(n('এক কোটি'), '10000000')
        self.assertEqual(n('দুশ পঞ্চাশ'), '250')
        self.assertEqual(n('শ'), '100')

    def test_inside_a_sentence(self):
        self.assertEqual(n('মোৰ বয়স পঁচিশ বছৰ'), 'মোৰ বয়স 25 বছৰ')
        self.assertEqual(n('দাম পাঁচশ টকা।'), 'দাম 500 টকা।')
        self.assertEqual(n('সি বিশ, মই ত্ৰিশ'), 'সি 20, মই 30')

    def test_endings_stay_after_the_digits(self):
        self.assertEqual(n('মই দুই হাজাৰ চৌবিশত গৈছিলো'), 'মই 2024ত গৈছিলো')
        self.assertEqual(n('পঁচিশৰ'), '25ৰ')
        self.assertEqual(n('পাঁচশ টকাক'), '500 টকাক')

    def test_left_alone(self):
        for s in ['এক জন মানুহ', 'দুই তিনি', 'এক দুই তিনি চাৰি', 'আমি ঘৰলৈ গ\'লো', 'এবাৰ আহিব', 'দহ', 'বাৰ', '', 'ন']:
            self.assertEqual(n(s), s)

    def test_unknown_word_is_never_guessed(self):
        self.assertEqual(n('এক হাজাৰ নশ চৌৰাশী'), '1900 চৌৰাশী')      # 84 is not in the list: the rest stays a word

    def test_none_and_empty(self):
        self.assertEqual(n(None), None)
