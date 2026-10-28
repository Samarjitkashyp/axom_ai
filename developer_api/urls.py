from django.urls import path
from . import views

urlpatterns = [
    # OpenAI compatible v1 endpoints
    path('models', views.v1_models, name='v1_models'),
    path('chat/completions', views.v1_chat_completions, name='v1_chat_completions'),
    path('translate', views.v1_translate, name='v1_translate'),
    
    # Key management endpoint
    path('developer/keys', views.manage_keys_api, name='manage_keys_api'),
    path('developer/keys/', views.manage_keys_api, name='manage_keys_api_slash'),
]
