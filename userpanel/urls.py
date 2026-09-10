from django.urls import path
from . import views

app_name = 'userpanel'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_page, name='profile'),
    path('profile/update/', views.update_profile_api, name='update_profile'),
    path('profile/password/', views.change_password_api, name='change_password'),
    path('subscription/', views.subscription_page, name='subscription'),
    path('subscription/cancel/', views.cancel_subscription_api, name='cancel_subscription'),
    path('payments/', views.payments_page, name='payments'),
    path('payments/invoice/<int:payment_id>/', views.invoice_view, name='invoice'),
    path('usage/', views.usage_page, name='usage'),
    path('usage/export/', views.export_usage_csv, name='export_usage'),
    path('library/', views.library_page, name='library'),
    path('library/rename/<int:session_id>/', views.rename_chat_api, name='rename_chat'),
    path('library/delete/<int:session_id>/', views.delete_chat_api, name='delete_chat'),
    path('support/', views.support_page, name='support'),
    path('support/ticket/<int:ticket_id>/', views.ticket_detail_view, name='ticket_detail'),
    path('support/create/', views.create_ticket_api, name='create_ticket'),
    path('support/reply/<int:ticket_id>/', views.reply_ticket_api, name='reply_ticket'),
    path('export-data/', views.export_user_data_json, name='export_data'),
    path('delete-account/', views.delete_account_api, name='delete_account'),
    path('notifications/read-all/', views.mark_notifications_read_api, name='read_notifications'),
]
