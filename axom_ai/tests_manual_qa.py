import io
import json
import shutil
import tempfile
from unittest import mock

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from knowledge.models import QAPair
from knowledge import utils as kutils

TMP_MEDIA = tempfile.mkdtemp(prefix='qa_media_')


def _png(size=(20, 20)):
    buf = io.BytesIO()
    Image.new('RGB', size, 'white').save(buf, 'PNG')
    return buf.getvalue()


@override_settings(MEDIA_ROOT=TMP_MEDIA)
class ManualQATests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.admin = User.objects.create_superuser('boss', 'boss@example.com', 'pw-12345-xyz')
        self.client.force_login(self.admin)
        kutils._QA_CACHE = None

    def _save(self, **extra):
        data = {'question': 'What is Bihu?', 'answer': 'A festival of Assam.'}
        data.update(extra)
        return self.client.post('/axomai-admin/questions-upload/save/', data)

    def test_sidebar_and_page(self):
        r = self.client.get('/axomai-admin/questions-upload/')
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'Questions Upload')
        self.assertContains(self.client.get('/axomai-admin/document-verify/'), 'Manual Q&amp;A')

    def test_everything_needs_a_superuser(self):
        self.client.logout()
        for url in ('/axomai-admin/questions-upload/', '/axomai-admin/document-verify/api/manual/list/'):
            self.assertEqual(self.client.get(url).status_code, 302)
        self.assertEqual(self.client.post('/axomai-admin/questions-upload/save/', {}).status_code, 302)
        self.assertEqual(self.client.post('/axomai-admin/document-verify/api/manual/1/approve/').status_code, 302)

    def test_saved_entry_is_pending_and_not_used_by_chat(self):
        r = self._save()
        self.assertEqual(r.status_code, 200)
        qa = QAPair.objects.get()
        self.assertEqual(qa.status, 'pending')
        self.assertEqual(qa.created_by, 'boss')
        self.assertEqual(qa.document.file_type, 'manual')
        ans, _asm, _src = kutils.find_instant_answer('What is Bihu?')
        self.assertIsNone(ans)

    def test_validation(self):
        self.assertEqual(self._save(question='hi').status_code, 400)
        self.assertEqual(self._save(answer='').status_code, 400)
        bad = SimpleUploadedFile('x.png', b'not a picture', content_type='image/png')
        self.assertEqual(self._save(image=bad).status_code, 400)
        self.assertEqual(QAPair.objects.count(), 0)

    def test_photo_is_stored_and_served_to_admin_only(self):
        r = self._save(image=SimpleUploadedFile('evil.php', _png(), content_type='image/png'))
        self.assertEqual(r.status_code, 200)
        qa = QAPair.objects.get()
        self.assertTrue(qa.image.name.endswith('.png'))
        img = self.client.get('/axomai-admin/document-verify/api/manual/%d/image/' % qa.id)
        self.assertEqual(img.status_code, 200)
        self.assertEqual(img['Content-Type'], 'image/png')
        self.client.logout()
        self.assertEqual(self.client.get('/axomai-admin/document-verify/api/manual/%d/image/' % qa.id).status_code, 302)

    def test_edit_then_approve_makes_it_live(self):
        self._save()
        qa = QAPair.objects.get()
        base = '/axomai-admin/document-verify/api/manual/%d/' % qa.id
        r = self.client.post(base + 'edit/', data=json.dumps({'question': 'When is Bihu celebrated?', 'answer': 'In April.', 'answer_assamese': ''}), content_type='application/json')
        self.assertEqual(r.status_code, 200)
        with mock.patch('knowledge.utils._embed_texts', return_value=[[0.1, 0.2]]):
            r = self.client.post(base + 'approve/')
        self.assertEqual(r.status_code, 200)
        qa.refresh_from_db()
        self.assertEqual(qa.status, 'approved')
        self.assertEqual(qa.question, 'When is Bihu celebrated?')
        self.assertTrue(qa.embedding)
        ans, _asm, _src = kutils.find_instant_answer('When is Bihu celebrated?')
        self.assertEqual(ans, 'In April.')
        # an approved entry can no longer be edited or rejected
        self.assertEqual(self.client.post(base + 'reject/').status_code, 400)

    def test_rejected_stays_out_of_chat_and_delete_removes_photo(self):
        self._save(image=SimpleUploadedFile('a.png', _png(), content_type='image/png'))
        qa = QAPair.objects.get()
        base = '/axomai-admin/document-verify/api/manual/%d/' % qa.id
        self.assertEqual(self.client.post(base + 'reject/').status_code, 200)
        self.assertIsNone(kutils.find_instant_answer('What is Bihu?')[0])
        self.assertEqual(self.client.post(base + 'delete/').status_code, 200)
        self.assertEqual(QAPair.objects.count(), 0)

    def test_other_pairs_are_unaffected(self):
        from knowledge.models import KnowledgeDocument
        doc = KnowledgeDocument.objects.create(title='Crawl: x.com', file_type='crawl')
        pair = QAPair.objects.create(document=doc, question='What is Bihu?', answer='Old answer.')
        self.assertEqual(pair.status, 'approved')
        self.assertEqual(kutils.find_instant_answer('What is Bihu?')[0], 'Old answer.')
        listing = self.client.get('/axomai-admin/document-verify/api/manual/list/').json()
        self.assertEqual(listing['items'], [])

    def test_invalid_action_and_method(self):
        self.assertEqual(self.client.post('/axomai-admin/document-verify/api/manual/1/explode/').status_code, 400)
        self.assertEqual(self.client.get('/axomai-admin/document-verify/api/manual/1/approve/').status_code, 405)


    def _approved_with_photo(self):
        self._save(image=SimpleUploadedFile('a.png', _png(), content_type='image/png'), answer_assamese='অসমীয়া উত্তৰ')
        qa = QAPair.objects.get()
        with mock.patch('knowledge.utils._embed_texts', return_value=None):
            self.client.post('/axomai-admin/document-verify/api/manual/%d/approve/' % qa.id)
        return qa

    def _chat(self, prompt, language='english'):
        return self.client.post('/api/chat/', data=json.dumps({'prompt': prompt, 'language': language}), content_type='application/json')

    def test_chat_answers_approved_manual_qa_with_photo(self):
        qa = self._approved_with_photo()
        r = self._chat('What is Bihu?')
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body['engine'], 'manual-qa')
        self.assertEqual(body['response'], 'A festival of Assam.')
        self.assertEqual(body['image_url'], '/api/qa-image/%d/' % qa.id)
        self.assertEqual(self._chat('What is Bihu?', 'assamese').json()['response'], 'অসমীয়া উত্তৰ')
        self.client.logout()                                   # the photo is public once approved
        img = self.client.get(body['image_url'])
        self.assertEqual((img.status_code, img['Content-Type']), (200, 'image/png'))

    def test_chat_ignores_pending_and_photo_stays_private(self):
        self._save(image=SimpleUploadedFile('a.png', _png(), content_type='image/png'))
        qa = QAPair.objects.get()
        self.assertIsNone(kutils.find_manual_answer('What is Bihu?'))     # pending: the chat never sees it
        self.client.logout()
        self.assertEqual(self.client.get('/api/qa-image/%d/' % qa.id).status_code, 404)
