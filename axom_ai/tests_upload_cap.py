import json

from django.contrib.auth.models import User
from django.test import TestCase

from superadmin.models import SystemSetting


class UploadCapSettingTests(TestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_superuser('boss', 'b@example.com', 'pw-12345-xyz'))

    def save(self, **data):
        return self.client.post('/axomai-admin/settings/save/', data=json.dumps(data), content_type='application/json')

    def test_default_is_500_and_shown_on_the_page(self):
        r = self.client.get('/axomai-admin/settings/')
        self.assertContains(r, 'id="botUploadDailyPages"')
        self.assertContains(r, 'value="500"')

    def test_saved_and_read_back(self):
        self.assertEqual(self.save(bot_upload_daily_pages=' 1200 ').status_code, 200)
        self.assertEqual(SystemSetting.get_setting('bot_upload_daily_pages', '500'), '1200')
        self.assertContains(self.client.get('/axomai-admin/settings/'), 'value="1200"')

    def test_zero_is_allowed(self):
        self.assertEqual(self.save(bot_upload_daily_pages='0').status_code, 200)
        self.assertEqual(SystemSetting.get_setting('bot_upload_daily_pages', '500'), '0')

    def test_bad_values_are_refused_and_nothing_is_saved(self):
        for bad in ('abc', '-5', '100001', '', '3.5'):
            r = self.save(bot_upload_daily_pages=bad)
            self.assertEqual(r.status_code, 400, bad)
        self.assertEqual(SystemSetting.get_setting('bot_upload_daily_pages', '500'), '500')

    def test_other_settings_still_save_without_it(self):
        self.assertEqual(self.save(announcement_banner='Hello').status_code, 200)
        self.assertEqual(SystemSetting.get_setting('bot_upload_daily_pages', '500'), '500')
