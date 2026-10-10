from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory, SimpleTestCase

from axom_ai.security import get_client_ip
from axom_ai.settings import _secret_key


def request(**meta):
    req = RequestFactory().get('/')
    req.META.update(meta)
    return req


class ClientIpTests(SimpleTestCase):
    def test_the_address_nginx_sets_wins_over_every_header_a_visitor_can_send(self):
        r = request(HTTP_X_REAL_IP='198.51.100.7', HTTP_X_FORWARDED_FOR='1.2.3.4, 5.6.7.8', HTTP_CF_CONNECTING_IP='9.9.9.9', REMOTE_ADDR='127.0.0.1')
        self.assertEqual(get_client_ip(r), '198.51.100.7')

    def test_forged_headers_alone_are_ignored(self):
        r = request(HTTP_X_FORWARDED_FOR='1.2.3.4', HTTP_CF_CONNECTING_IP='9.9.9.9', REMOTE_ADDR='203.0.113.9')
        self.assertEqual(get_client_ip(r), '203.0.113.9')

    def test_a_malformed_x_real_ip_falls_back_to_the_connection_address(self):
        for bad in ('not-an-ip', '1.2.3', "1.2.3.4'; DROP TABLE x", '  '):
            self.assertEqual(get_client_ip(request(HTTP_X_REAL_IP=bad, REMOTE_ADDR='203.0.113.9')), '203.0.113.9', bad)

    def test_ipv6_is_normalised(self):
        self.assertEqual(get_client_ip(request(HTTP_X_REAL_IP='2001:0db8:0000:0000:0000:0000:0000:0001')), '2001:db8::1')

    def test_without_any_address_it_does_not_crash(self):
        req = RequestFactory().get('/')
        req.META.pop('REMOTE_ADDR', None)
        self.assertEqual(get_client_ip(req), '127.0.0.1')

    def test_the_helpers_of_the_other_apps_use_the_same_trusted_address(self):
        from contentcms.views import _get_client_ip as content_ip
        from superadmin.views import _client_ip as admin_ip
        from userpanel.views import _client_ip as user_ip
        r = request(HTTP_X_REAL_IP='198.51.100.7', HTTP_X_FORWARDED_FOR='1.2.3.4', HTTP_CF_CONNECTING_IP='9.9.9.9')
        for helper in (content_ip, admin_ip, user_ip):
            self.assertEqual(helper(r), '198.51.100.7')
            self.assertEqual(helper(request(HTTP_X_FORWARDED_FOR='1.2.3.4', HTTP_CF_CONNECTING_IP='9.9.9.9', REMOTE_ADDR='203.0.113.9')), '203.0.113.9')


class SecretKeyTests(SimpleTestCase):
    def test_a_configured_key_is_used(self):
        self.assertEqual(_secret_key('  a-real-secret  ', False), 'a-real-secret')

    def test_a_missing_key_is_tolerated_only_in_development(self):
        self.assertTrue(_secret_key('', True).startswith('django-insecure-'))
        self.assertTrue(_secret_key(None, True).startswith('django-insecure-'))

    def test_a_missing_key_in_production_stops_the_app(self):
        for missing in (None, '', '   '):
            with self.assertRaises(ImproperlyConfigured):
                _secret_key(missing, False)
