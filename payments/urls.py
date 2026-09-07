from django.urls import path

from . import views

urlpatterns = [
    path("payment/create-order/", views.create_order, name="payment_create_order"),
    path("payment/verify/", views.verify_payment, name="payment_verify"),
    path("payment/webhook/", views.razorpay_webhook, name="payment_webhook"),
    path("plan/status/", views.plan_status, name="plan_status"),
]
