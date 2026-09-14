from django.contrib import admin
from .models import ModelProvider, DailyModelUsage


@admin.register(ModelProvider)
class ModelProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'model_id', 'tier', 'daily_token_limit', 'priority', 'is_active']
    list_editable = ['priority', 'is_active']
    list_filter = ['tier', 'is_active']
    search_fields = ['name', 'model_id']


@admin.register(DailyModelUsage)
class DailyModelUsageAdmin(admin.ModelAdmin):
    list_display = ['model_provider', 'date', 'input_tokens', 'output_tokens', 'request_count', 'errors']
    list_filter = ['date', 'model_provider']
    ordering = ['-date']
