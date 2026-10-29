from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import secrets

def generate_key_string():
    return f"sk_live_axom_{secrets.token_hex(20)}"

class DeveloperApiKey(models.Model):
    TIER_CHOICES = [
        ('free', 'Free Tier (1,000 req/mo)'),
        ('developer', 'Developer Tier (25,000 req/mo)'),
        ('business', 'Business Tier (100,000 req/mo)'),
        ('enterprise', 'Enterprise Tier (Custom)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='developer_api_keys')
    key = models.CharField(max_length=80, unique=True, db_index=True, default=generate_key_string)
    name = models.CharField(max_length=120, default='Default API Key')
    owner_email = models.EmailField(blank=True, null=True)
    tier = models.CharField(max_length=30, choices=TIER_CHOICES, default='free')
    is_active = models.BooleanField(default=True)
    
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
        return f"{self.name} ({self.key[:16]}...) - {self.tier}"

    @property
    def masked_key(self):
        if len(self.key) <= 18:
            return self.key
        return f"{self.key[:14]}{'•' * 20}{self.key[-4:]}"

    def has_quota(self):
        return self.is_active and (self.current_usage < self.monthly_quota)

    def record_usage(self):
        self.current_usage += 1
        self.last_used_at = timezone.now()
        self.save(update_fields=['current_usage', 'last_used_at'])
