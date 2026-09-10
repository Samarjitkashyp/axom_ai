from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from . import views
import knowledge.views as knowledge_views
import contentcms.api_views as contentcms_api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'),
    path('about/', views.about_page_view, name='about_page'),
    path('about', views.about_page_view, name='about_page_no_slash'),
    path('robots.txt', views.robots_txt_view, name='robots_txt'),
    path('sitemap.xml', views.sitemap_xml_view, name='sitemap_xml'),
    path('faq/', views.faq_page_view, name='faq_page'),
    path('faq', views.faq_page_view, name='faq_page_no_slash'),
    path('blog/', views.blog_list_view, name='blog_list'),
    path('blogs/', views.blog_list_view, name='blogs_list'),
    path('blog/<slug:slug>/', views.blog_detail_view, name='blog_detail'),
    path('tools/', views.home_view, name='tools'),
    path('tools', views.home_view, name='tools_no_slash'),
    path('upgrade/', views.home_view, name='upgrade'),
    path('upgrade', views.home_view, name='upgrade_no_slash'),
    path('subscription/', views.home_view, name='subscription'),
    path('subscription', views.home_view, name='subscription_no_slash'),
    path('api/chat/', views.chat_api_view, name='chat_api'),
    path('api/history/', views.chat_history_view, name='chat_history'),
    path('api/history/action/', views.chat_action_view, name='chat_action'),
    path('api/feedback/', views.feedback_view, name='feedback'),
    path('api/login/', views.login_api_view, name='login_api'),
    path('api/logout/', views.logout_api_view, name='logout_api'),
    path('health/', views.health_view, name='health'),
    
    # CMS REST APIs for Next.js Frontend
    path('api/cms/landing/', contentcms_api.cms_landing_api, name='api_cms_landing'),
    path('api/cms/articles/', contentcms_api.cms_articles_api, name='api_cms_articles'),
    path('api/cms/articles/<slug:slug>/', contentcms_api.cms_article_detail_api, name='api_cms_article_detail'),
    path('api/cms/about/', contentcms_api.cms_about_api, name='api_cms_about'),
    
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
    path('api/pdf-tool/', views.pdf_tool_api, name='pdf_tool_api'),
    path('api/pdf-ai/', views.pdf_ai_api, name='pdf_ai_api'),
    path('api/detect-watermark/', views.detect_watermark_api, name='detect_watermark_api'),
    path('api/remove-watermark/', views.remove_watermark_api, name='remove_watermark_api'),
    path('api/generate-image/', views.generate_image_api, name='generate_image_api'),
    path('api/generate-diagram/', views.generate_diagram_api, name='generate_diagram_api'),
    path('api/user-status/', views.user_status_api, name='user_status_api'),
    path('api/stock-images/', views.search_stock_images_api, name='search_stock_images_api'),
    path('api/download-stock-image/', views.download_stock_image_api, name='download_stock_image_api'),
    path('api/stock-videos/', views.search_stock_videos_api, name='search_stock_videos_api'),
    path('api/download-stock-video/', views.download_stock_video_api, name='download_stock_video_api'),
    path('api/summarize/', views.summarize_api, name='summarize_api'),
    path('api/download-converted-file/<str:filename>', views.download_converted_file_view, name='download_converted_file_raw'),
    path('api/download-converted-file/<str:filename>/', views.download_converted_file_view, name='download_converted_file'),

    # Razorpay payments
    path('api/', include('payments.urls')),

    # New: Super Admin panel  (admin.aiaxom.co.in  ->  /axomai-admin/ via middleware)
    path('axomai-admin/', include('superadmin.urls')),

    # New: User Account panel  (user.aiaxom.co.in  ->  /axomai-user/ via middleware)
    path('axomai-user/', include('userpanel.urls')),

    # New: Content CMS panel  (content.aiaxom.co.in  ->  /axomai-content/ via middleware)
    path('axomai-content/', include('contentcms.urls')),

    # Serve uploaded media (partner logos, avatars, documents)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
