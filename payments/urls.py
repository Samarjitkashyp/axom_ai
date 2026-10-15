from django.urls import path

from . import app_api, views

urlpatterns = [
    path("payment/create-order/", views.create_order, name="payment_create_order"),
    path("payment/verify/", views.verify_payment, name="payment_verify"),
    path("payment/webhook/", views.razorpay_webhook, name="payment_webhook"),
    path("plan/status/", views.plan_status, name="plan_status"),
    # mobile app: the same session cookie, no CSRF token
    path("plans/", app_api.plans_api, name="plans_api"),
    path("payment/app/create-order/", app_api.create_order_app, name="payment_app_create_order"),
    path("payment/app/verify/", app_api.verify_payment_app, name="payment_app_verify"),
]
