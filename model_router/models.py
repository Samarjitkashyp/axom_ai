from django.db import models
from django.utils import timezone


class ModelProvider(models.Model):
    """Registered LLM model available for rotation."""
    TIER_CHOICES = [
        ('free_mini', 'Free Mini/Nano (2.5M/day)'),
        ('free_large', 'Free Large (250K/day)'),
        ('paid', 'Paid (credit-based)'),
    ]
    name = models.CharField(max_length=64, unique=True, help_text="Display name, e.g. GPT-5-mini")
    model_id = models.CharField(max_length=128, unique=True, help_text="API model ID, e.g. gpt-5-mini")
    tier = models.CharField(max_length=16, choices=TIER_CHOICES, default='free_mini')
    daily_token_limit = models.PositiveIntegerField(default=2_500_000, help_text="Free tokens per day (0 = unlimited paid)")
    priority = models.PositiveIntegerField(default=10, help_text="Lower = tried first")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', 'name']

    def __str__(self):
        return f"{self.name} ({self.tier})"


class DailyModelUsage(models.Model):
    """Tracks token usage per model per day for rotation & admin dashboard."""
    model_provider = models.ForeignKey(ModelProvider, on_delete=models.CASCADE, related_name='daily_usage')
    date = models.DateField(default=timezone.now)
    input_tokens = models.PositiveBigIntegerField(default=0)
    output_tokens = models.PositiveBigIntegerField(default=0)
    request_count = models.PositiveIntegerField(default=0)
    errors = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('model_provider', 'date')
        ordering = ['-date']

    @property
    def total_tokens(self):
        return self.input_tokens + self.output_tokens

    def __str__(self):
        return f"{self.model_provider.name} | {self.date} | {self.total_tokens:,} tokens"
