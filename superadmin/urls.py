from django.urls import path
from . import views

app_name = 'superadmin'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('users/', views.users_page, name='users'),
    path('users/action/', views.user_action_api, name='user_action'),
    path('users/export/', views.export_users_csv, name='export_users'),
    path('subscriptions/', views.subscriptions_page, name='subscriptions'),
    path('subscriptions/refund/', views.refund_payment_api, name='refund_payment'),
    path('subscriptions/export/', views.export_payments_csv, name='export_payments'),
    path('plans/', views.plans_page, name='plans'),
    path('plans/save/', views.save_plan_api, name='save_plan'),
    path('coupons/save/', views.save_coupon_api, name='save_coupon'),
    path('coupons/toggle/<int:coupon_id>/', views.toggle_coupon_api, name='toggle_coupon'),
    path('moderation/', views.moderation_page, name='moderation'),
    path('moderation/delete-chat/<int:session_id>/', views.delete_chat_session_api, name='delete_chat_session'),
    path('moderation/reply-ticket/<int:ticket_id>/', views.admin_reply_ticket_api, name='admin_reply_ticket'),
    path('knowledge/', views.knowledge_page, name='knowledge'),
    path('knowledge/test-search/', views.knowledge_test_search_api, name='knowledge_test_search'),
    path('analytics/', views.analytics_page, name='analytics'),
    path('settings/', views.settings_page, name='settings'),
    path('settings/save/', views.save_settings_api, name='save_settings'),
    path('api/health/', views.api_health_check, name='api_health'),
    path('api/chart-data/', views.chart_data_api, name='chart_data'),
]
