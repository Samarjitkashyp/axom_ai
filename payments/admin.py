from django.contrib import admin

from .models import Payment, UserPlan


@admin.register(UserPlan)
class UserPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "started_at", "expires_at")
    list_filter = ("plan", "status")
    search_fields = ("user__username", "user__email")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "amount", "status", "razorpay_order_id", "created_at")
    list_filter = ("plan", "status")
    search_fields = ("user__username", "razorpay_order_id", "razorpay_payment_id")
    readonly_fields = ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "created_at", "paid_at")
