import json
from datetime import date, timedelta
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.http import require_POST, require_GET

from .models import ModelProvider, DailyModelUsage
from .router import get_all_model_status, seed_default_models


def _is_super(u):
    return u.is_authenticated and u.is_superuser


superuser_required = user_passes_test(_is_super, login_url='/axomai-admin/login/')


@superuser_required
def models_dashboard(request):
    return render(request, 'model_router/dashboard.html', {'active': 'models'})


@superuser_required
def models_api(request):
    """API returning current model status for the admin dashboard."""
    statuses = get_all_model_status()
    today = date.today()

    total_free_limit = sum(s['daily_limit'] for s in statuses if s['daily_limit'] > 0)
    total_used = sum(s['used_today'] for s in statuses)
    total_free_remaining = sum(s['remaining'] for s in statuses if s['remaining'] is not None)
    active_model = None
    for s in statuses:
        if not s['is_exhausted'] and s['daily_limit'] > 0:
            active_model = s['name']
            break
    if not active_model:
        paid = [s for s in statuses if s['daily_limit'] == 0]
        active_model = paid[0]['name'] if paid else 'None'

    # Last 7 days usage for chart
    history = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_usage = DailyModelUsage.objects.filter(date=d)
        day_input = sum(u.input_tokens for u in day_usage)
        day_output = sum(u.output_tokens for u in day_usage)
        day_requests = sum(u.request_count for u in day_usage)
        day_errors = sum(u.errors for u in day_usage)
        history.append({
            'date': d.isoformat(),
            'label': d.strftime('%d %b'),
            'input_tokens': day_input,
            'output_tokens': day_output,
            'total_tokens': day_input + day_output,
            'requests': day_requests,
            'errors': day_errors,
        })

    return JsonResponse({
        'models': statuses,
        'summary': {
            'total_free_limit': total_free_limit,
            'total_used_today': total_used,
            'total_free_remaining': total_free_remaining,
            'active_model': active_model,
            'date': today.isoformat(),
        },
        'history': history,
    })


@superuser_required
@require_POST
def toggle_model_api(request):
    """Enable/disable a model."""
    try:
        data = json.loads(request.body)
        model_id = data.get('model_id')
        is_active = data.get('is_active', True)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    provider = ModelProvider.objects.filter(id=model_id).first()
    if not provider:
        return JsonResponse({'error': 'Model not found'}, status=404)

    provider.is_active = is_active
    provider.save(update_fields=['is_active'])
    return JsonResponse({'success': True, 'name': provider.name, 'is_active': provider.is_active})


@superuser_required
@require_POST
def seed_models_api(request):
    """Seed default model providers."""
    created = seed_default_models()
    return JsonResponse({'success': True, 'created': created})


@superuser_required
@require_POST
def update_priority_api(request):
    """Update model priority."""
    try:
        data = json.loads(request.body)
        model_id = data.get('model_id')
        priority = int(data.get('priority', 10))
    except Exception:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    provider = ModelProvider.objects.filter(id=model_id).first()
    if not provider:
        return JsonResponse({'error': 'Model not found'}, status=404)

    provider.priority = priority
    provider.save(update_fields=['priority'])
    return JsonResponse({'success': True, 'name': provider.name, 'priority': priority})
