from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import secrets
import hashlib

def generate_key_string():
    return f"sk_live_axom_{secrets.token_hex(20)}"

class DeveloperApiKey(models.Model):
    TIER_CHOICES = [
        ('free', 'Free Tier (1,000 req/mo)'),
        ('starter', 'Starter Tier (5,000 req/mo)'),
        ('developer', 'Developer Tier (25,000 req/mo)'),
        ('business', 'Business Tier (100,000 req/mo)'),
        ('enterprise', 'Enterprise Tier (Custom)'),
    ]

    PERMISSION_CHOICES = [
        ('all', 'All Endpoints (Chat + Translation)'),
        ('chat', 'Chat Completions Only'),
        ('translate', 'Translation Only'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='developer_api_keys')
    key = models.CharField(max_length=80, unique=True, db_index=True, default=generate_key_string)
    hashed_key = models.CharField(max_length=64, db_index=True, unique=True, null=True, blank=True)
    key_prefix = models.CharField(max_length=24, blank=True, default='')
    key_suffix = models.CharField(max_length=8, blank=True, default='')
    
    name = models.CharField(max_length=120, default='Default API Key')
    owner_email = models.EmailField(blank=True, null=True)
    tier = models.CharField(max_length=30, choices=TIER_CHOICES, default='free')
    is_active = models.BooleanField(default=True)
    
    # Scoped permissions and IP restrictions
    permissions = models.CharField(max_length=50, choices=PERMISSION_CHOICES, default='all')
    allowed_ips = models.TextField(blank=True, default='', help_text='Comma-separated allowed client IPs. Empty allows all IPs.')
    
    monthly_quota = models.IntegerField(default=1000)
    current_usage = models.IntegerField(default=0)
    rate_limit_per_minute = models.IntegerField(default=60)
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'developer_api_keys'
        verbose_name = 'Developer API Key'
        verbose_name_plural = 'Developer API Keys'

    def __str__(self):
        return f"{self.name} ({self.masked_key[:18]}...) - {self.tier}"

    @property
    def masked_key(self):
        if self.key_prefix and self.key_suffix:
            return f"{self.key_prefix}{'•' * 18}{self.key_suffix}"
        if len(self.key) <= 18:
            return self.key
        return f"{self.key[:14]}{'•' * 20}{self.key[-4:]}"

    def has_quota(self):
        return self.is_active and (self.current_usage < self.monthly_quota)

    def record_usage(self):
        self.current_usage += 1
        self.last_used_at = timezone.now()
        self.save(update_fields=['current_usage', 'last_used_at'])


class DeveloperApiRequestLog(models.Model):
    """
    Granular audit logging for all developer API requests.
    Tracks endpoint, model, status, tokens, latency, and client IP.
    """
    api_key = models.ForeignKey(DeveloperApiKey, on_delete=models.CASCADE, related_name='request_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='api_request_logs')
    endpoint = models.CharField(max_length=100, db_index=True)
    method = models.CharField(max_length=10, default='POST')
    model_name = models.CharField(max_length=60, blank=True, default='axom-indic-1')
    status_code = models.IntegerField(default=200, db_index=True)
    ip_address = models.CharField(max_length=64, blank=True, default='')
    tokens_used = models.IntegerField(default=0)
    latency_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'developer_api_request_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['api_key', '-created_at']),
        ]

    def __str__(self):
        return f"{self.endpoint} ({self.status_code}) - {self.created_at:%Y-%m-%d %H:%M:%S}"

    @property
    def masked_ip(self):
        if not self.ip_address:
            return '—'
        parts = self.ip_address.split('.')
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.***.***"
        return self.ip_address[:8] + '***'
