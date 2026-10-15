import json
from unittest import mock

from django.contrib.auth.models import User
from django.test import Client, TestCase

from payments.app_api import PLAN_INFO, public_plans
from payments.models import PLAN_CATALOG, Payment


class AppPlansTests(TestCase):
    def test_every_plan_has_both_billing_cycles_in_the_catalog(self):
        for info in PLAN_INFO:
            self.assertIn(info['id'] + '_monthly', PLAN_CATALOG)
            self.assertIn(info['id'] + '_yearly', PLAN_CATALOG)

    def test_prices_come_from_the_catalog(self):
        plans = {p['id']: p for p in public_plans()}
        self.assertEqual(plans['pro']['monthly']['amount'] * 100, PLAN_CATALOG['pro_monthly']['amount'])
        self.assertEqual(plans['pro']['yearly']['amount'] * 100, PLAN_CATALOG['pro_yearly']['amount'])

    def test_plans_endpoint_needs_no_login(self):
        r = self.client.get('/api/plans/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()['plans']), len(PLAN_INFO))


class AppPaymentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('asha', 'a@example.com', 'pw-12345-xyz')
        self.client = Client(enforce_csrf_checks=True)          # a browser would need a token; the app has none

    def order(self, plan='pro_monthly'):
        return self.client.post('/api/payment/app/create-order/', data=json.dumps({'plan': plan}), content_type='application/json')

    def test_needs_login(self):
        self.assertEqual(self.order().status_code, 401)

    def test_website_endpoint_still_wants_a_csrf_token(self):
        self.client.force_login(self.user)
        r = self.client.post('/api/payment/create-order/', data=json.dumps({'plan': 'pro_monthly'}), content_type='application/json')
        self.assertEqual(r.status_code, 403)

    def test_app_creates_an_order_without_csrf(self):
        self.client.force_login(self.user)
        fake = mock.Mock()
        fake.order.create.return_value = {'id': 'order_TEST1'}
        with mock.patch('payments.views._client', return_value=fake):
            r = self.order()
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['order_id'], 'order_TEST1')
        self.assertEqual(data['amount'], PLAN_CATALOG['pro_monthly']['amount'])
        self.assertTrue(Payment.objects.filter(razorpay_order_id='order_TEST1', user=self.user, status='created').exists())

    def test_unknown_plan_is_refused(self):
        self.client.force_login(self.user)
        self.assertEqual(self.order('nope').status_code, 400)

    def test_verify_with_a_wrong_signature_does_not_activate(self):
        self.client.force_login(self.user)
        fake = mock.Mock()
        fake.order.create.return_value = {'id': 'order_TEST2'}
        with mock.patch('payments.views._client', return_value=fake):
            self.order()
        import razorpay
        bad = mock.Mock()
        bad.utility.verify_payment_signature.side_effect = razorpay.errors.SignatureVerificationError('x')
        with mock.patch('payments.views._client', return_value=bad):
            r = self.client.post('/api/payment/app/verify/', data=json.dumps({
                'razorpay_order_id': 'order_TEST2', 'razorpay_payment_id': 'pay_1', 'razorpay_signature': 'bad'}),
                content_type='application/json')
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Payment.objects.get(razorpay_order_id='order_TEST2').status, 'failed')
