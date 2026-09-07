from django.conf import settings
from django.db import models
from django.utils import timezone


PLAN_CHOICES = [
    ("starter_monthly",  "Axom AI Starter Monthly"),
    ("pro_monthly",      "Axom AI Pro Monthly"),
    ("business_monthly", "Axom AI Business Monthly"),
    ("starter_yearly",   "Axom AI Starter Yearly"),
    ("pro_yearly",       "Axom AI Pro Yearly"),
    ("business_yearly",  "Axom AI Business Yearly"),
]

# amount in paise (₹ * 100), duration in days
PLAN_CATALOG = {
    "starter_monthly":  {"amount":  19900, "days":  30, "label": "Axom AI Starter Monthly"},
    "pro_monthly":      {"amount":  49900, "days":  30, "label": "Axom AI Pro Monthly"},
    "business_monthly": {"amount": 149900, "days":  30, "label": "Axom AI Business Monthly"},
    "starter_yearly":   {"amount": 190800, "days": 365, "label": "Axom AI Starter Yearly"},
    "pro_yearly":       {"amount": 478800, "days": 365, "label": "Axom AI Pro Yearly"},
    "business_yearly":  {"amount":1438800, "days": 365, "label": "Axom AI Business Yearly"},
}


class UserPlan(models.Model):
    STATUS = [("active", "active"), ("expired", "expired"), ("pending", "pending")]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="plan")
    plan = models.CharField(max_length=32, choices=PLAN_CHOICES)
    started_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    status = models.CharField(max_length=16, choices=STATUS, default="active")
    updated_at = models.DateTimeField(auto_now=True)

    def is_active(self) -> bool:
        return self.status == "active" and self.expires_at > timezone.now()

    def __str__(self):
        return f"{self.user} · {self.plan} · {self.status} · till {self.expires_at:%Y-%m-%d}"


class Payment(models.Model):
    STATUS = [("created", "created"), ("paid", "paid"), ("failed", "failed")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    plan = models.CharField(max_length=32, choices=PLAN_CHOICES)
    amount = models.IntegerField(help_text="amount in paise")
    currency = models.CharField(max_length=8, default="INR")

    razorpay_order_id = models.CharField(max_length=64, unique=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True, default="", db_index=True)
    razorpay_signature = models.CharField(max_length=128, blank=True, default="")

    status = models.CharField(max_length=16, choices=STATUS, default="created")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            # Enforce idempotency: any non-empty razorpay_payment_id is globally unique.
            # (blank rows — orders that never completed — are exempt via the condition.)
            models.UniqueConstraint(
                fields=["razorpay_payment_id"],
                condition=~models.Q(razorpay_payment_id=""),
                name="uniq_razorpay_payment_id_when_set",
            ),
        ]

    def __str__(self):
        return f"{self.user} · {self.plan} · {self.status} · ₹{self.amount/100:.2f}"
