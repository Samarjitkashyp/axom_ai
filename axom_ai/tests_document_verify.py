import json
from unittest import mock

import requests
from django.contrib.auth.models import User
from django.test import TestCase, override_settings

UID = 'a1b2c3d4e5f6'


class FakeResp:
    def __init__(self, status=200, data=None, content=b'', ctype='application/json'):
        self.status_code = status
        self._data = data if data is not None else {}
        self.content = content
        self.headers = {'Content-Type': ctype}

    def json(self):
        return self._data


@override_settings(BOT_BASE_URL='http://bot.test')
class DocumentVerifyTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser('boss', 'boss@example.com', 'pw-12345-xyz')
        self.staff = User.objects.create_user('someone', 'u@example.com', 'pw-12345-xyz')
        self.client.force_login(self.admin)
        patcher = mock.patch.dict('os.environ', {'BOT_IMPORT_TOKEN': 'secret-token'})
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_page_and_sidebar_for_admin(self):
        r = self.client.get('/axomai-admin/document-verify/')
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'Document Verify')
        self.assertContains(r, '/axomai-admin/document-verify/')

    def test_everything_needs_a_superuser(self):
        self.client.logout()
        self.assertEqual(self.client.get('/axomai-admin/document-verify/api/list/').status_code, 302)
        self.client.force_login(self.staff)
        for url in ('/axomai-admin/document-verify/', '/axomai-admin/document-verify/api/list/', '/axomai-admin/document-verify/api/%s/' % UID):
            self.assertEqual(self.client.get(url).status_code, 302, url)
        self.assertEqual(self.client.post('/axomai-admin/document-verify/api/%s/approve/' % UID).status_code, 302)

    def test_list_is_fetched_from_the_bot_with_the_token_and_admin_name(self):
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(data={'uploads': [{'id': UID}], 'daily_limit': 500})) as m:
            r = self.client.get('/axomai-admin/document-verify/api/list/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['uploads'][0]['id'], UID)
        args, kw = m.call_args
        self.assertEqual(args, ('GET', 'http://bot.test/api/upload/list'))
        self.assertEqual(kw['headers'], {'X-Bot-Token': 'secret-token', 'X-Admin-User': 'boss'})

    def test_token_never_goes_to_the_browser(self):
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(data={'uploads': []})):
            r = self.client.get('/axomai-admin/document-verify/api/list/')
        self.assertNotIn('secret-token', r.content.decode())
        self.assertNotIn('secret-token', self.client.get('/axomai-admin/document-verify/').content.decode())

    def test_bad_ids_and_actions_never_reach_the_bot(self):
        with mock.patch('superadmin.views.requests.request') as m:
            self.assertEqual(self.client.get('/axomai-admin/document-verify/api/NOTANID12345/').status_code, 400)
            self.assertEqual(self.client.post('/axomai-admin/document-verify/api/%s/explode/' % UID).status_code, 400)
            self.assertEqual(self.client.post('/axomai-admin/document-verify/api/NOTANID12345/approve/').status_code, 400)
            self.assertEqual(self.client.get('/axomai-admin/document-verify/api/%s/image/..%%2Fmeta.json/' % UID).status_code, 404)
        m.assert_not_called()

    def test_actions_are_post_only(self):
        self.assertEqual(self.client.get('/axomai-admin/document-verify/api/%s/approve/' % UID).status_code, 405)

    def test_approve_reject_resend_delete_are_forwarded(self):
        expected = {'approve': ('POST', '/api/upload/%s/approve' % UID), 'reject': ('POST', '/api/upload/%s/reject' % UID),
                    'reread': ('POST', '/api/upload/%s/reread' % UID),
                    'resend': ('POST', '/api/upload/%s/resend' % UID), 'delete': ('DELETE', '/api/upload/%s' % UID)}
        for action, (method, path) in expected.items():
            with mock.patch('superadmin.views.requests.request', return_value=FakeResp(data={'ok': True})) as m:
                r = self.client.post('/axomai-admin/document-verify/api/%s/%s/' % (UID, action))
            self.assertEqual(r.status_code, 200, action)
            self.assertEqual(m.call_args[0], (method, 'http://bot.test' + path), action)

    def test_edit_sends_the_text(self):
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(data={'ok': True})) as m:
            r = self.client.post('/axomai-admin/document-verify/api/%s/edit/' % UID, data=json.dumps({'n': 2, 'text': 'অসম'}), content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(m.call_args[0], ('PUT', 'http://bot.test/api/upload/%s/page/2' % UID))
        self.assertEqual(m.call_args[1]['json'], {'text': 'অসম'})
        bad = self.client.post('/axomai-admin/document-verify/api/%s/edit/' % UID, data=json.dumps({'n': 'x', 'text': 1}), content_type='application/json')
        self.assertEqual(bad.status_code, 400)

    def test_bot_errors_are_shown_not_hidden(self):
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(status=400, data={'detail': 'This upload is not waiting for review.'})):
            r = self.client.post('/axomai-admin/document-verify/api/%s/approve/' % UID)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.json(), {'success': False, 'error': 'This upload is not waiting for review.'})
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(status=403, data={'detail': 'x'})):
            self.assertEqual(self.client.post('/axomai-admin/document-verify/api/%s/approve/' % UID).status_code, 502)

    def test_bot_down(self):
        with mock.patch('superadmin.views.requests.request', side_effect=requests.ConnectionError()):
            r = self.client.get('/axomai-admin/document-verify/api/list/')
        self.assertEqual(r.status_code, 502)
        self.assertIn('not reachable', r.json()['error'])

    def test_missing_token_is_a_clear_error(self):
        with mock.patch.dict('os.environ', {'BOT_IMPORT_TOKEN': ''}):
            r = self.client.get('/axomai-admin/document-verify/api/list/')
        self.assertEqual(r.status_code, 503)

    def test_images_are_proxied_only_as_images(self):
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(content=b'\xff\xd8\xff', ctype='image/jpeg')):
            r = self.client.get('/axomai-admin/document-verify/api/%s/image/p2.jpg/' % UID)
        self.assertEqual((r.status_code, r['Content-Type'], r['X-Content-Type-Options']), (200, 'image/jpeg', 'nosniff'))
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(content=b'<script>', ctype='text/html')):
            self.assertEqual(self.client.get('/axomai-admin/document-verify/api/%s/image/p2.jpg/' % UID).status_code, 404)

    def test_actions_are_audited(self):
        from superadmin.models import AuditLog
        before = AuditLog.objects.count()
        with mock.patch('superadmin.views.requests.request', return_value=FakeResp(data={'ok': True})):
            self.client.post('/axomai-admin/document-verify/api/%s/approve/' % UID)
        self.assertEqual(AuditLog.objects.count(), before + 1)
