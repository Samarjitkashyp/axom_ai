import json

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase

from superadmin.models import AudioTrainingEntry, SubdomainPermission

PW = 'Sturdy-Pass-9271'


def act(client, **data):
    return client.post('/axomai-admin/users/action/', data=json.dumps(data), content_type='application/json')


class UserAdminTests(TestCase):
    def setUp(self):
        cache.clear()
        self.boss = User.objects.create_superuser('boss', 'boss@example.com', PW)
        self.client.force_login(self.boss)

    def test_a_superuser_adds_a_normal_user(self):
        r = act(self.client, action='create_user', username='asha_d', email='Asha@Example.com', password=PW, first_name='Asha', last_name='Das')
        self.assertEqual(r.json()['success'], True, r.json())
        u = User.objects.get(username='asha_d')
        self.assertEqual((u.email, u.first_name, u.last_name), ('asha@example.com', 'Asha', 'Das'))
        self.assertEqual((u.is_staff, u.is_superuser, u.is_active), (False, False, True))
        self.assertTrue(u.check_password(PW))
        self.assertFalse(SubdomainPermission.objects.filter(user=u).exists())

    def test_a_new_user_can_get_a_section_at_once(self):
        act(self.client, action='create_user', username='editor1', email='e1@example.com', password=PW, admin_sections=['audio_training', 'nonsense'])
        sp = SubdomainPermission.objects.get(user__username='editor1')
        self.assertEqual((sp.admin_access, sp.admin_sections), (True, ['audio_training']))      # an unknown section is dropped

    def test_bad_new_users_are_refused(self):
        User.objects.create_user('taken', 'taken@example.com', PW)
        for data in [dict(username='ab', email='x@example.com', password=PW), dict(username='has space', email='x@example.com', password=PW),
                     dict(username='fine_name', email='not-an-email', password=PW), dict(username='fine_name', email='x@example.com', password='123'),
                     dict(username='TAKEN', email='x@example.com', password=PW), dict(username='fine_name', email='TAKEN@example.com', password=PW)]:
            r = act(self.client, action='create_user', **data)
            self.assertEqual((r.status_code, r.json()['success']), (400, False), data)
        self.assertEqual(User.objects.count(), 2)

    def test_edit_profile(self):
        u = User.objects.create_user('kim', 'kim@example.com', PW)
        User.objects.create_user('other', 'other@example.com', PW)
        r = act(self.client, action='update_profile', user_id=u.id, email='kim2@example.com', first_name='Kim', last_name='Roy')
        self.assertEqual(r.json()['success'], True)
        u.refresh_from_db()
        self.assertEqual((u.email, u.first_name, u.last_name), ('kim2@example.com', 'Kim', 'Roy'))
        self.assertEqual(act(self.client, action='update_profile', user_id=u.id, email='other@example.com').status_code, 400)

    def test_remove_a_user(self):
        u = User.objects.create_user('gone', 'gone@example.com', PW)
        self.assertEqual(act(self.client, action='delete', user_id=u.id).json()['success'], True)
        self.assertFalse(User.objects.filter(username='gone').exists())

    def test_sections_are_saved_and_turn_the_admin_gate_on(self):
        u = User.objects.create_user('lee', 'lee@example.com', PW)
        r = act(self.client, action='set_permissions', user_id=u.id, admin_access=False, content_access=False, bot_access=False, admin_sections=['audio_training'])
        self.assertEqual(r.json()['success'], True)
        sp = SubdomainPermission.objects.get(user=u)
        self.assertEqual((sp.admin_access, sp.admin_sections), (True, ['audio_training']))
        act(self.client, action='set_permissions', user_id=u.id, admin_access=False, admin_sections=[])
        sp.refresh_from_db()
        self.assertEqual((sp.admin_access, sp.admin_sections), (False, []))

    def test_the_users_page_shows_add_user_profile_and_sections(self):
        html = self.client.get('/axomai-admin/users/').content.decode()
        for needle in ['openAddUser()', 'id="addUserModal"', 'saveProfile()', 'class="sec-check', 'Admin panel sections']:
            self.assertIn(needle, html)

    def test_users_page_summary_pager_and_cards(self):
        User.objects.bulk_create([User(username='person%02d' % i, email='p%02d@example.com' % i) for i in range(25)])        # no password hashing: fast
        User.objects.filter(username='person00').update(is_active=False)
        sp = SubdomainPermission.objects.create(user=User.objects.get(username='person01'), admin_access=True, admin_sections=['audio_training'])
        r = self.client.get('/axomai-admin/users/?q=person&status=')
        st = r.context['stats']
        self.assertEqual((st['total'], st['active'], st['suspended'], st['admins']), (26, 25, 1, 2))      # boss (superuser) + person01 (admin access)
        self.assertEqual(r.context['total_count'], 25)
        html = r.content.decode()
        self.assertIn('Showing', html)
        self.assertIn('Admin panel: Audio Training', self.client.get('/axomai-admin/users/?q=person01').content.decode())
        self.assertEqual(r.context['page_numbers'], [1, 2])
        self.assertEqual(r.context['qs'], 'q=person')
        self.assertIn('?q=person&page=2', html)                                                           # the filter stays in the pager link
        r2 = self.client.get('/axomai-admin/users/?q=a b&page=2')
        self.assertEqual(r2.context['qs'], 'q=a+b')                                                       # url-encoded
        for needle in ['u-table', 'data-label="Email"', 'class="chk"', 'adminConfirm', 'openUserModal(this)', 'switchUserTab']:
            self.assertIn(needle, html)

    def test_empty_search_shows_a_helpful_empty_state(self):
        html = self.client.get('/axomai-admin/users/?q=zzzzzz-nobody').content.decode()
        self.assertIn('No users found', html)
        self.assertIn('Clear filters', html)

    def test_page_numbers_leave_gaps(self):
        User.objects.bulk_create([User(username='bulk%03d' % i, email='b%03d@example.com' % i) for i in range(160)])
        r = self.client.get('/axomai-admin/users/?page=5')
        self.assertEqual(r.context['page_numbers'], [1, None, 4, 5, 6, None, 9])

    def test_only_a_superuser_can_manage_users(self):
        u = User.objects.create_user('nobody', 'nobody@example.com', PW)
        SubdomainPermission.objects.create(user=u, admin_access=True, admin_sections=['audio_training'])
        self.client.force_login(u)
        self.assertEqual(self.client.get('/axomai-admin/users/').status_code, 302)
        r = act(self.client, action='create_user', username='sneaky', email='s@example.com', password=PW)
        self.assertEqual(r.status_code, 302)
        self.assertFalse(User.objects.filter(username='sneaky').exists())


class LimitedAdminTests(TestCase):
    """A user with the Audio Training section: signs in at the admin login, sees and uses only that section."""

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('trainer', 'trainer@example.com', PW)
        self.sp = SubdomainPermission.objects.create(user=self.user, admin_access=True, admin_sections=['audio_training'])

    def login(self, name='trainer', pw=PW):
        return self.client.post('/axomai-admin/login/', {'username': name, 'password': pw})

    def test_signs_in_and_lands_on_audio_training(self):
        r = self.login()
        self.assertEqual((r.status_code, r['Location']), (302, '/axomai-admin/audio-training/'))
        self.assertEqual(self.client.get('/axomai-admin/login/')['Location'], '/axomai-admin/audio-training/')     # already signed in

    def test_next_is_only_followed_to_a_section_that_was_given(self):
        r = self.client.post('/axomai-admin/login/?next=/axomai-admin/users/', {'username': 'trainer', 'password': PW})
        self.assertEqual(r['Location'], '/axomai-admin/audio-training/')

    def test_can_use_audio_training(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.get('/axomai-admin/audio-training/').status_code, 200)
        r = self.client.post('/axomai-admin/audio-training/save/', data=json.dumps({'kind': 'number_word', 'source': 'চৌৰাশী', 'target': '84'}), content_type='application/json')
        self.assertEqual(r.json()['success'], True)
        e = AudioTrainingEntry.objects.get()
        self.assertEqual(self.client.post('/axomai-admin/audio-training/toggle/%d/' % e.id).json()['is_active'], False)
        self.assertEqual(self.client.post('/axomai-admin/audio-training/delete/%d/' % e.id).json()['success'], True)

    def test_nothing_else_of_the_admin_opens(self):
        self.client.force_login(self.user)
        for path in ['/axomai-admin/', '/axomai-admin/users/', '/axomai-admin/language-rules/', '/axomai-admin/settings/', '/axomai-admin/tools/',
                     '/axomai-admin/subscriptions/', '/axomai-admin/contact-messages/', '/axomai-admin/users/export/']:
            r = self.client.get(path)
            self.assertEqual(r.status_code, 302, path)
            self.assertIn('/axomai-admin/login/', r['Location'], path)
        self.assertEqual(self.client.post('/axomai-admin/language-rules/save/', data='{}', content_type='application/json').status_code, 302)

    def test_the_menu_shows_only_the_section(self):
        self.client.force_login(self.user)
        html = self.client.get('/axomai-admin/audio-training/').content.decode()
        self.assertIn('/axomai-admin/audio-training/', html)
        for gone in ['Users Management', 'Language Rules', 'System &amp; Audit', 'System & Audit', 'Contact Messages', 'Document Verify']:
            self.assertNotIn(gone, html)
        self.assertIn('Sign Out', html)
        self.assertIn('Limited access', html)

    def test_a_superuser_still_sees_the_whole_menu(self):
        boss = User.objects.create_superuser('boss', 'boss@example.com', PW)
        self.client.force_login(boss)
        html = self.client.get('/axomai-admin/audio-training/').content.decode()
        for need in ['Users Management', 'Language Rules', 'Audio Training', 'Contact Messages', 'Superadmin']:
            self.assertIn(need, html)

    def test_no_section_or_no_gate_or_inactive_means_no_access(self):
        self.sp.admin_sections = []
        self.sp.save()
        self.assertEqual(self.login().status_code, 200)                                  # the form again, no redirect
        self.sp.admin_sections = ['audio_training']
        self.sp.admin_access = False
        self.sp.save()
        self.assertEqual(self.login().status_code, 200)
        self.sp.admin_access = True
        self.sp.save()
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.login().status_code, 200)

    def test_a_user_without_a_permission_row_gets_nothing(self):
        plain = User.objects.create_user('plain', 'plain@example.com', PW)
        self.assertEqual(self.login('plain').status_code, 200)
        self.client.force_login(plain)
        self.assertEqual(self.client.get('/axomai-admin/audio-training/').status_code, 302)

    def test_language_rules_can_be_given_as_a_section(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.get('/axomai-admin/language-rules/').status_code, 302)                # not given yet
        self.sp.admin_sections = ['audio_training', 'language_rules']
        self.sp.save()
        self.assertEqual(self.client.get('/axomai-admin/language-rules/').status_code, 200)
        r = self.client.post('/axomai-admin/language-rules/save/', data=json.dumps({'category': 'grammar', 'title': 'T', 'content': 'use ৰ not র', 'priority': 1}), content_type='application/json')
        self.assertEqual(r.json()['success'], True)
        html = self.client.get('/axomai-admin/language-rules/').content.decode()
        self.assertIn('Language Rules', html)
        self.assertIn('/axomai-admin/audio-training/', html)
        self.assertNotIn('Users Management', html)
        self.assertEqual(self.client.get('/axomai-admin/users/').status_code, 302)

    def test_only_language_rules_lands_on_language_rules(self):
        self.sp.admin_sections = ['language_rules']
        self.sp.save()
        r = self.client.post('/axomai-admin/login/', {'username': 'trainer', 'password': PW})
        self.assertEqual(r['Location'], '/axomai-admin/language-rules/')
        self.assertEqual(self.client.get('/axomai-admin/audio-training/').status_code, 302)

    def test_a_wrong_password_is_still_refused(self):
        self.assertEqual(self.login(pw='wrong').status_code, 200)
