from django.urls import path
from . import views

app_name = 'model_router'

urlpatterns = [
    path('', views.models_dashboard, name='dashboard'),
    path('api/status/', views.models_api, name='api_status'),
    path('api/toggle/', views.toggle_model_api, name='api_toggle'),
    path('api/seed/', views.seed_models_api, name='api_seed'),
    path('api/priority/', views.update_priority_api, name='api_priority'),
]
