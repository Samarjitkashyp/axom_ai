import os
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import KnowledgeDocument, KnowledgeChunk
from .utils import extract_text_from_file, create_knowledge_chunks

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
    return redirect('admin_login')

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

@csrf_exempt
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
    elif ext in ['.xlsx', '.xls', '.csv']:
        file_type = 'excel'
    elif ext in ['.png', '.jpg', '.jpeg', '.webp']:
        file_type = 'image'
    else:
        file_type = 'text'

    try:
        doc = KnowledgeDocument.objects.create(
            title=file_name,
            file=uploaded_file,
            file_type=file_type,
            file_size=file_size,
            status='Processing'
        )

        extracted_text = extract_text_from_file(doc.file.path, file_type)
        doc.extracted_text = extracted_text
        doc.status = 'Indexed'
        doc.save()

        create_knowledge_chunks(doc)

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

@csrf_exempt
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
