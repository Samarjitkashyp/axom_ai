from django.db import models
from django.conf import settings
from django.utils import timezone


class SystemSetting(models.Model):
    """Key-value dynamic system configuration for feature flags and settings."""
    key = models.CharField(max_length=64, unique=True, db_index=True)
    value = models.TextField(blank=True, default="")
    description = models.CharField(max_length=255, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"

    @classmethod
    def get_setting(cls, key: str, default: str = "") -> str:
        try:
            obj = cls.objects.filter(key=key).first()
            return obj.value if obj else default
        except Exception:
            return default

    @classmethod
    def set_setting(cls, key: str, value: str, description: str = ""):
        cls.objects.update_or_create(
            key=key,
            defaults={"value": str(value), "description": description or key}
        )

    @classmethod
    def is_enabled(cls, key: str, default: bool = True) -> bool:
        val = cls.get_setting(key, str(default)).strip().lower()
        return val in ("true", "1", "yes", "on")


class CouponCode(models.Model):
    """Discount and promotional coupon codes."""
    code = models.CharField(max_length=32, unique=True, db_index=True)
    discount_percent = models.PositiveIntegerField(default=10)
    max_uses = models.PositiveIntegerField(default=100)
    uses_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self) -> bool:
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        if self.uses_count >= self.max_uses:
            return False
        return True

    def __str__(self):
        return f"{self.code} ({self.discount_percent}% off)"


class CustomPlanOverride(models.Model):
    """Custom pricing and quota override per plan."""
    plan_key = models.CharField(max_length=32, unique=True, db_index=True)
    name = models.CharField(max_length=64)
    price_in_rupees = models.DecimalField(max_digits=10, decimal_places=2, default=199.00)
    duration_days = models.PositiveIntegerField(default=30)
    images_per_day = models.IntegerField(default=5, help_text="-1 for unlimited")
    searches_per_day = models.IntegerField(default=10, help_text="-1 for unlimited")
    chat_per_day = models.IntegerField(default=-1, help_text="-1 for unlimited")
    pdf_tools_access = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (₹{self.price_in_rupees})"


class SubdomainPermission(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subdomain_perm',
    )
    admin_access = models.BooleanField(default=False)
    content_access = models.BooleanField(default=False)
    bot_access = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        flags = []
        if self.admin_access:
            flags.append('admin')
        if self.content_access:
            flags.append('content')
        if self.bot_access:
            flags.append('bot')
        return f"{self.user.username}: {', '.join(flags) or 'chat-only'}"


class AuditLog(models.Model):
    """Audit log of Superadmin actions for security & compliance."""
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_audit_logs"
    )
    action = models.CharField(max_length=64)
    target = models.CharField(max_length=255, blank=True, default="")
    details = models.TextField(blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.action} on {self.target}"
