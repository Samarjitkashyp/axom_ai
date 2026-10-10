import json
from smtplib import SMTPException
from unittest import mock

from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase, override_settings

from superadmin.models import ContactMessage

MAIL = dict(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_HOST='smtp.example.test',
    CONTACT_TO_EMAIL='support@aiaxom.co.in',
    DEFAULT_FROM_EMAIL='Axom AI <support@aiaxom.co.in>',
)


def payload(**kw):
    data = {'name': 'Asha Das', 'email': 'asha@example.com', 'phone': '+91 98765 43210', 'category': 'general',
            'subject': 'Hello', 'message': 'I would like to know about the API plans.'}
    data.update(kw)
    return data


@override_settings(**MAIL)
class ContactSubmitTests(TestCase):
    def post(self, data, **extra):
        return self.client.post('/api/contact/submit/', data=json.dumps(data), content_type='application/json', **extra)

    def test_message_is_saved_and_mailed_to_support_with_reply_to(self):
        r = self.post(payload())
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertTrue(body['success'])
        self.assertRegex(body['ticket'], r'^AXM-\d{6}$')
        row = ContactMessage.objects.get()
        self.assertEqual((row.ticket, row.status, row.email_sent, row.email_error), (body['ticket'], 'new', True, ''))
        self.assertEqual(len(mail.outbox), 1)
        m = mail.outbox[0]
        self.assertEqual(m.to, ['support@aiaxom.co.in'])
        self.assertEqual(m.reply_to, ['asha@example.com'])
        self.assertIn(row.ticket, m.subject)
        self.assertIn('I would like to know about the API plans.', m.body)

    def test_invalid_input_is_rejected_and_nothing_is_stored(self):
        for bad in ({'name': ''}, {'name': 'A'}, {'email': 'not-an-email'}, {'email': 'a@b'}, {'message': 'short'}, {'message': 'x' * 5001},
                    {'category': 'hacking'}, {'phone': 'call me maybe'}):
            r = self.post(payload(**bad))
            self.assertEqual(r.status_code, 400, bad)
            self.assertFalse(r.json()['success'])
        self.assertEqual(ContactMessage.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_line_breaks_cannot_inject_mail_headers(self):
        self.assertEqual(self.post(payload(email='a@example.com\r\nBcc: victim@example.com')).status_code, 400)
        r = self.post(payload(name='Eve\r\nBcc: victim@example.com', subject='Hi\nBcc: x@example.com'))
        self.assertEqual(r.status_code, 200)
        m = mail.outbox[0]
        self.assertNotIn('\n', m.subject)
        self.assertEqual(m.bcc, [])
        self.assertNotIn('\n', ContactMessage.objects.get().name)

    def test_bot_trap_pretends_success_and_stores_nothing(self):
        r = self.post(payload(hp_trap='http://spam.example'))
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()['success'])
        self.assertEqual((ContactMessage.objects.count(), len(mail.outbox)), (0, 0))

    def test_same_message_twice_gives_one_row_one_mail_and_the_same_ticket(self):
        a = self.post(payload()).json()
        b = self.post(payload()).json()
        self.assertEqual(a['ticket'], b['ticket'])
        self.assertEqual((ContactMessage.objects.count(), len(mail.outbox)), (1, 1))

    def test_limits_per_email_and_per_ip(self):
        for i in range(3):
            self.assertEqual(self.post(payload(message='A different question number %d about plans' % i)).status_code, 200)
        self.assertEqual(self.post(payload(message='One more different question about the plans')).status_code, 429)
        ContactMessage.objects.all().delete()
        for i in range(5):
            self.assertEqual(self.post(payload(email='u%d@example.com' % i, message='Question number %d from one address' % i), REMOTE_ADDR='203.0.113.9').status_code, 200)
        self.assertEqual(self.post(payload(email='u9@example.com', message='Sixth question from the same address'), REMOTE_ADDR='203.0.113.9').status_code, 429)
        self.assertEqual(self.post(payload(email='u9@example.com', message='Sixth question from another address'), REMOTE_ADDR='203.0.113.10').status_code, 200)

    def test_a_mail_failure_keeps_the_message_and_flags_it(self):
        with mock.patch('django.core.mail.message.EmailMessage.send', side_effect=SMTPException('535 Authentication Failed')):
            r = self.post(payload())
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()['success'])
        row = ContactMessage.objects.get()
        self.assertFalse(row.email_sent)
        self.assertIn('Authentication Failed', row.email_error)

    @override_settings(EMAIL_HOST='')
    def test_without_mail_settings_the_message_is_still_saved(self):
        r = self.post(payload())
        self.assertEqual(r.status_code, 200)
        row = ContactMessage.objects.get()
        self.assertFalse(row.email_sent)
        self.assertIn('not configured', row.email_error)

    def test_method_origin_and_size_checks(self):
        self.assertEqual(self.client.get('/api/contact/submit/').status_code, 405)
        self.assertEqual(self.post(payload(), HTTP_ORIGIN='https://evil.example').status_code, 403)
        self.assertEqual(self.post(payload(), HTTP_ORIGIN='https://chat.aiaxom.co.in').status_code, 200)
        big = self.client.post('/api/contact/submit/', data=json.dumps(payload(message='y' * 30000)), content_type='application/json')
        self.assertEqual(big.status_code, 413)


@override_settings(**MAIL)
class ContactAdminTests(TestCase):
    def setUp(self):
        self.msg = ContactMessage.objects.create(name='Asha', email='asha@example.com', category='api', subject='Plans', message='Tell me about the API plans please.', ticket='AXM-100001')

    def login(self):
        self.client.force_login(User.objects.create_superuser('boss', 'boss@example.com', 'pw-not-used'))

    def act(self, action):
        return self.client.post('/axomai-admin/contact-messages/action/', data=json.dumps({'id': self.msg.id, 'action': action}), content_type='application/json')

    def test_page_needs_a_superuser_and_lists_messages(self):
        self.assertNotEqual(self.client.get('/axomai-admin/contact-messages/').status_code, 200)
        self.login()
        r = self.client.get('/axomai-admin/contact-messages/')
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'AXM-100001')
        self.assertContains(r, 'not e-mailed')
        self.assertContains(self.client.get('/axomai-admin/contact-messages/?status=spam'), 'No messages here yet')
        self.assertContains(self.client.get('/axomai-admin/contact-messages/?q=asha'), 'AXM-100001')

    def test_status_actions_and_resend(self):
        self.login()
        for action, expected in (('read', 'read'), ('replied', 'replied'), ('spam', 'spam'), ('new', 'new')):
            self.assertEqual(self.act(action).status_code, 200)
            self.msg.refresh_from_db()
            self.assertEqual(self.msg.status, expected)
        r = self.act('resend')
        self.assertEqual(r.status_code, 200)
        self.msg.refresh_from_db()
        self.assertTrue(self.msg.email_sent)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(self.act('delete-everything').status_code, 400)

    def test_resend_reports_a_failure(self):
        self.login()
        with mock.patch('django.core.mail.message.EmailMessage.send', side_effect=SMTPException('connection refused')):
            r = self.act('resend')
        self.assertEqual(r.status_code, 502)
        self.assertIn('connection refused', r.json()['error'])
