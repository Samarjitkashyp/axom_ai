import json
from django.contrib.auth import get_user_model
from django.test import TestCase, Client
from .models import HeaderNavItem, HeaderMegaMenuItem
from .menu_utils import (
    build_menu_tree,
    serialize_nav_item,
    serialize_mega_item,
    would_create_cycle,
    apply_menu_reorder,
)

User = get_user_model()


class MultilevelHeaderMenuTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='cmsadmin',
            email='admin@aiaxom.co.in',
            password='StrongTestPassword123!',
        )
        self.client = Client()
        self.client.force_login(self.admin)

        self.root_pdf = HeaderMegaMenuItem.objects.create(
            title='PDF Tools', url='#', order=0, is_active=True
        )
        self.child_merge = HeaderMegaMenuItem.objects.create(
            parent=self.root_pdf, title='Merge PDF', url='/tools/merge-pdf', order=0, is_active=True
        )
        self.child_convert = HeaderMegaMenuItem.objects.create(
            parent=self.root_pdf, title='Converters', url='#', order=1, is_active=True
        )
        self.grandchild_word = HeaderMegaMenuItem.objects.create(
            parent=self.child_convert, title='Word to PDF', url='/tools/word-to-pdf', order=0, is_active=True
        )
        self.hidden_tool = HeaderMegaMenuItem.objects.create(
            parent=self.root_pdf, title='Hidden Beta', url='/tools/beta', order=2, is_active=False
        )

    def test_tree_build_levels_and_active_filter(self):
        tree = build_menu_tree(HeaderMegaMenuItem, serialize_mega_item, active_only=True)
        self.assertEqual(len(tree), 1)
        self.assertEqual(tree[0]['title'], 'PDF Tools')
        children = tree[0]['children']
        self.assertEqual([c['title'] for c in children], ['Merge PDF', 'Converters'])
        self.assertEqual(children[1]['children'][0]['title'], 'Word to PDF')

    def test_inactive_parent_prunes_subtree(self):
        self.root_pdf.is_active = False
        self.root_pdf.save()
        tree = build_menu_tree(HeaderMegaMenuItem, serialize_mega_item, active_only=True)
        self.assertEqual(tree, [])

    def test_cycle_detection_and_rejection(self):
        self.assertTrue(would_create_cycle(HeaderMegaMenuItem, self.root_pdf.id, self.root_pdf.id))
        self.assertTrue(would_create_cycle(HeaderMegaMenuItem, self.root_pdf.id, self.grandchild_word.id))
        self.assertFalse(would_create_cycle(HeaderMegaMenuItem, self.grandchild_word.id, self.root_pdf.id))

        with self.assertRaises(ValueError):
            apply_menu_reorder(
                HeaderMegaMenuItem,
                [
                    {'id': self.root_pdf.id, 'parent_id': self.grandchild_word.id, 'order': 0},
                ],
            )

    def test_drag_drop_reorder_and_nest_endpoints(self):
        # Promote Word to PDF to root first, and nest Merge PDF under Word to PDF
        res = self.client.post(
            '/axomai-content/settings/header/mega/reorder/',
            data=json.dumps({
                'items': [
                    {'id': self.grandchild_word.id, 'parent_id': None, 'order': 0},
                    {'id': self.child_merge.id, 'parent_id': self.grandchild_word.id, 'order': 0},
                    {'id': self.root_pdf.id, 'parent_id': None, 'order': 1},
                ]
            }),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])

        api_res = self.client.get('/api/cms/landing/')
        self.assertEqual(api_res.status_code, 200)
        mega = api_res.json()['header']['mega_menu_items']
        self.assertEqual(mega[0]['title'], 'Word to PDF')
        self.assertEqual(mega[0]['children'][0]['title'], 'Merge PDF')
        self.assertEqual(mega[1]['title'], 'PDF Tools')

    def test_nav_item_reorder_and_submenus(self):
        n1 = HeaderNavItem.objects.create(title='AI Tools', url='/tools', order=0, is_active=True)
        n2 = HeaderNavItem.objects.create(title='Pricing', url='/pricing', order=1, is_active=True)
        res = self.client.post(
            '/axomai-content/settings/header/nav/reorder/',
            data=json.dumps({
                'items': [
                    {'id': n2.id, 'parent_id': None, 'order': 0},
                    {'id': n1.id, 'parent_id': n2.id, 'order': 0},
                ]
            }),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        tree = build_menu_tree(HeaderNavItem, serialize_nav_item, active_only=True)
        self.assertEqual(len(tree), 1)
        self.assertEqual(tree[0]['title'], 'Pricing')
        self.assertEqual(tree[0]['children'][0]['title'], 'AI Tools')

    def test_header_settings_page_renders(self):
        res = self.client.get('/axomai-content/settings/header/')
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, 'megaTreeRoot')
        self.assertContains(res, 'Sortable.min.js')

