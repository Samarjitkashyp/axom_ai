import os
import json
import logging
from urllib.parse import urlparse
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from .models import KnowledgeDocument, KnowledgeChunk, QAPair
from .utils import extract_text_from_file, create_knowledge_chunks, create_qa_pairs, _embed_texts

logger = logging.getLogger('knowledge')

def admin_login_view(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_panel')

    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        user = authenticate(request, username=username, password=password)

        if user is not None and user.is_staff:
            login(request, user)
            return redirect('admin_panel')
        else:
            error = "Invalid admin username or password, or user lacks staff permissions."

    return render(request, 'admin_login.html', {'error': error})

def admin_logout_view(request):
    logout(request)
    return redirect('home')

def admin_panel_view(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('admin_login')

    documents = KnowledgeDocument.objects.all().order_by('-uploaded_at')
    total_docs = documents.count()
    total_chunks = KnowledgeChunk.objects.count()
    total_storage = sum([doc.file_size for doc in documents])

    if total_storage > 1024 * 1024:
        storage_display = f"{total_storage / (1024 * 1024):.2f} MB"
    else:
        storage_display = f"{total_storage / 1024:.1f} KB"

    context = {
        'documents': documents,
        'total_docs': total_docs,
        'total_chunks': total_chunks,
        'storage_display': storage_display,
        'username': request.user.username,
    }
    return render(request, 'admin_panel.html', context)

def upload_document_api(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized. Admin authentication required.'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    uploaded_file = request.FILES['file']
    file_name = uploaded_file.name
    file_size = uploaded_file.size

    ext = os.path.splitext(file_name)[1].lower()
    if ext in ['.pdf']:
        file_type = 'pdf'
    elif ext in ['.docx']:
        file_type = 'docx'
    elif ext in ['.jsonl', '.json']:
        file_type = 'jsonl'
    elif ext in ['.xlsx', '.xls', '.csv']:
        file_type = 'excel'
    elif ext in ['.png', '.jpg', '.jpeg', '.webp']:
        file_type = 'image'
    else:
        file_type = 'text'

    # Optional source attribution — shown with every answer from this document.
    source_name = request.POST.get('source_name', '').strip()[:255]
    source_url = request.POST.get('source_url', '').strip()[:500]

    try:
        doc = KnowledgeDocument.objects.create(
            title=file_name,
            file=uploaded_file,
            file_type=file_type,
            file_size=file_size,
            status='Processing',
            source_name=source_name,
            source_url=source_url,
        )

        extracted_text = extract_text_from_file(doc.file.path, file_type)
        doc.extracted_text = extracted_text
        doc.status = 'Indexed'
        doc.save()

        create_knowledge_chunks(doc)
        create_qa_pairs(doc)

        return JsonResponse({
            'success': True,
            'document': {
                'id': doc.id,
                'title': doc.title,
                'file_type': doc.file_type,
                'uploaded_at': doc.uploaded_at.strftime('%b %d, %Y %H:%M'),
                'file_size': f"{doc.file_size / 1024:.1f} KB",
                'status': doc.status,
                'chunks_count': doc.chunks.count()
            }
        })

    except Exception as e:
        return JsonResponse({'error': f"Processing failed: {str(e)}"}, status=500)

def delete_document_api(request, doc_id):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized. Admin authentication required.'}, status=401)

    if request.method != 'POST' and request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        doc = KnowledgeDocument.objects.get(id=doc_id)
        if doc.file and os.path.exists(doc.file.path):
            os.remove(doc.file.path)
        doc.delete()
        return JsonResponse({'success': True, 'deleted_id': doc_id})
    except KnowledgeDocument.DoesNotExist:
        return JsonResponse({'error': 'Document not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def list_documents_api(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized. Admin authentication required.'}, status=401)
    
    documents = KnowledgeDocument.objects.all().order_by('-uploaded_at')
    total_docs = documents.count()
    total_chunks = KnowledgeChunk.objects.count()
    total_storage = sum([doc.file_size for doc in documents])

    if total_storage > 1024 * 1024:
        storage_display = f"{total_storage / (1024 * 1024):.2f} MB"
    else:
        storage_display = f"{total_storage / 1024:.1f} KB"

    docs_data = []
    for doc in documents:
        docs_data.append({
            'id': doc.id,
            'title': doc.title,
            'file_type': doc.file_type,
            'uploaded_at': doc.uploaded_at.strftime('%b %d, %Y %H:%M'),
            'file_size': f"{doc.file_size / 1024:.1f} KB",
            'status': doc.status,
            'chunks_count': doc.chunks.count()
        })

    return JsonResponse({
        'documents': docs_data,
        'total_docs': total_docs,
        'total_chunks': total_chunks,
        'storage_display': storage_display
    })


@csrf_exempt
def import_crawl_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    token = request.headers.get('X-Bot-Token', '')
    expected = os.getenv('BOT_IMPORT_TOKEN', '')
    if not expected or token != expected:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    seed_url = body.get('seed_url', '').strip()
    job_id = body.get('job_id', '')
    pages = body.get('pages', [])

    if not seed_url or not pages:
        return JsonResponse({'error': 'seed_url and pages required'}, status=400)

    domain = urlparse(seed_url).netloc.replace('www.', '')
    source_name = f'Web: {domain}'
    doc_title = f'Crawl: {domain}'

    doc = KnowledgeDocument.objects.filter(
        title=doc_title, file_type='crawl'
    ).first()
    if not doc:
        doc = KnowledgeDocument.objects.create(
            title=doc_title,
            file_type='crawl',
            status='Indexed',
            source_name=source_name,
            source_url=seed_url,
        )

    existing_urls = set(
        QAPair.objects.filter(document=doc)
        .values_list('source_url', flat=True)
    )

    new_pairs = []
    updated = 0
    for page in pages:
        url = page.get('url', '').strip()
        title = page.get('title', '').strip()
        content = page.get('content', '').strip()
        if not url or not content or len(content) < 50:
            continue

        question = title if title else url
        answer = content[:10000]

        if url in existing_urls:
            QAPair.objects.filter(document=doc, source_url=url).update(
                question=question, answer=answer
            )
            updated += 1
        else:
            new_pairs.append(QAPair(
                document=doc,
                question=question,
                answer=answer,
                source_name=source_name[:255],
                source_url=url[:500],
            ))

    created = 0
    if new_pairs:
        QAPair.objects.bulk_create(new_pairs)
        created = len(new_pairs)

    embedded = 0
    pending = list(
        QAPair.objects.filter(document=doc, embedding='')
        .only('id', 'question')
    )
    batch_size = 256
    for i in range(0, len(pending), batch_size):
        batch = pending[i:i + batch_size]
        vecs = _embed_texts([qa.question for qa in batch])
        if vecs and len(vecs) == len(batch):
            for qa, v in zip(batch, vecs):
                qa.embedding = json.dumps(v)
            QAPair.objects.bulk_update(batch, ['embedding'])
            embedded += len(batch)

    logger.info(
        'import_crawl: %s — created=%d updated=%d embedded=%d',
        domain, created, updated, embedded,
    )

    return JsonResponse({
        'success': True,
        'domain': domain,
        'created': created,
        'updated': updated,
        'embedded': embedded,
    })
