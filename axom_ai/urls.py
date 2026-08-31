from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
import knowledge.views as knowledge_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'),
    path('api/chat/', views.chat_api_view, name='chat_api'),
    path('api/history/', views.chat_history_view, name='chat_history'),
    path('api/history/action/', views.chat_action_view, name='chat_action'),
    path('api/feedback/', views.feedback_view, name='feedback'),
    path('api/login/', views.login_api_view, name='login_api'),
    path('health/', views.health_view, name='health'),
    
    # Custom Admin Authentication & Dashboard Routes
    path('admin-panel/login/', knowledge_views.admin_login_view, name='admin_login'),
    path('admin-panel/logout/', knowledge_views.admin_logout_view, name='admin_logout'),
    path('admin-panel/', views.admin_panel_view, name='admin_panel'),
    
    # Knowledge Base Upload / Delete APIs
    path('api/documents/', knowledge_views.list_documents_api, name='list_documents'),
    path('api/upload/', knowledge_views.upload_document_api, name='upload_document'),
    path('api/delete-document/<int:doc_id>/', knowledge_views.delete_document_api, name='delete_document'),

    # Document to PDF Converter APIs
    path('api/convert-doc/', views.convert_doc_api, name='convert_doc_api'),
    path('api/download-converted-pdf/<str:filename>', views.download_converted_pdf_view, name='download_converted_pdf_raw'),
    path('api/download-converted-pdf/<str:filename>/', views.download_converted_pdf_view, name='download_converted_pdf'),

    # Unified file converter (PDF<->Word, image<->PDF)
    path('api/convert-file/', views.convert_file_api, name='convert_file_api'),
    path('api/download-converted-file/<str:filename>', views.download_converted_file_view, name='download_converted_file_raw'),
    path('api/download-converted-file/<str:filename>/', views.download_converted_file_view, name='download_converted_file'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
