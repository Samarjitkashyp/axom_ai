"""
Smart Model Router — rotates across OpenAI free-tier models to maximize
free daily token usage before falling back to paid models.

Priority order:
  1. Free mini/nano models (2.5M tokens/day each, 9 models = ~22.5M free)
  2. Free large models (250K tokens/day each, 8 models = ~2M free)
  3. Paid model (GPT-5.6 Luna — $5 credit)

Token counting: uses tiktoken if available, otherwise estimates ~1.3 tokens/word.
"""

import os
import json
import logging
import requests
from datetime import date
from django.core.cache import cache
from django.db.models import F

logger = logging.getLogger('model_router')

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
MAX_OUTPUT_TOKENS = 2048
MAX_INPUT_CHARS = 12000

# Rough token estimator (tiktoken is optional)
try:
    import tiktoken
    _enc = tiktoken.encoding_for_model('gpt-4o-mini')
    def _count_tokens(text):
        return len(_enc.encode(text))
except Exception:
    def _count_tokens(text):
        return max(1, int(len(text.split()) * 1.3))


# ── session-scoped HTTP pool ──
_http = requests.Session()
_http.headers.update({'Content-Type': 'application/json'})


def _cache_key(model_id):
    return f"model_tokens:{model_id}:{date.today().isoformat()}"


def _get_daily_tokens(model_id):
    """Get today's total token count for a model from cache."""
    return cache.get(_cache_key(model_id), 0)


def _add_tokens(model_id, input_tok, output_tok):
    """Atomically increment today's token count in cache + persist to DB."""
    total = input_tok + output_tok
    key = _cache_key(model_id)
    try:
        cache.incr(key, total)
    except ValueError:
        cache.set(key, total, timeout=90000)  # 25 hours

    # Async DB persist (best-effort, don't block the response)
    try:
        from .models import DailyModelUsage, ModelProvider
        provider = ModelProvider.objects.filter(model_id=model_id).first()
        if provider:
            usage, _ = DailyModelUsage.objects.get_or_create(
                model_provider=provider, date=date.today(),
                defaults={'input_tokens': 0, 'output_tokens': 0, 'request_count': 0, 'errors': 0},
            )
            DailyModelUsage.objects.filter(pk=usage.pk).update(
                input_tokens=F('input_tokens') + input_tok,
                output_tokens=F('output_tokens') + output_tok,
                request_count=F('request_count') + 1,
            )
    except Exception as e:
        logger.warning("model_router DB persist failed: %s", e)


def _record_error(model_id):
    """Record an API error for a model."""
    try:
        from .models import DailyModelUsage, ModelProvider
        provider = ModelProvider.objects.filter(model_id=model_id).first()
        if provider:
            usage, _ = DailyModelUsage.objects.get_or_create(
                model_provider=provider, date=date.today(),
                defaults={'input_tokens': 0, 'output_tokens': 0, 'request_count': 0, 'errors': 0},
            )
            DailyModelUsage.objects.filter(pk=usage.pk).update(errors=F('errors') + 1)
    except Exception:
        pass


def get_available_model():
    """Pick the best available model: first free model with remaining quota,
    then fall back to paid Luna."""
    from .models import ModelProvider

    providers = ModelProvider.objects.filter(is_active=True).order_by('priority')
    for p in providers:
        if p.daily_token_limit == 0:
            # Paid model — always available (until credit runs out)
            continue
        used = _get_daily_tokens(p.model_id)
        remaining = p.daily_token_limit - used
        if remaining > 50_000:  # keep 50K buffer
            return p
    # All free models exhausted — use first paid model
    paid = providers.filter(tier='paid').first()
    if paid:
        return paid
    # Absolute fallback — return any active model
    return providers.first()


def get_all_model_status():
    """Return status of all models for admin dashboard."""
    from .models import ModelProvider
    today = date.today()
    result = []
    for p in ModelProvider.objects.filter(is_active=True).order_by('priority'):
        used = _get_daily_tokens(p.model_id)
        limit = p.daily_token_limit
        remaining = max(0, limit - used) if limit > 0 else None
        pct = round((used / limit) * 100, 1) if limit > 0 else 0
        result.append({
            'id': p.id,
            'name': p.name,
            'model_id': p.model_id,
            'tier': p.tier,
            'tier_display': p.get_tier_display(),
            'daily_limit': limit,
            'used_today': used,
            'remaining': remaining,
            'usage_pct': pct,
            'is_exhausted': (remaining is not None and remaining <= 50_000),
            'priority': p.priority,
        })
    return result


def openai_generate(system, prompt, timeout=30):
    """One-shot OpenAI chat completion using the best available model.
    Returns (text, model_id) or (None, None) on failure."""
    if not OPENAI_API_KEY:
        return None, None

    system = (system or '')[:MAX_INPUT_CHARS]
    prompt = (prompt or '')[:MAX_INPUT_CHARS]

    model_provider = get_available_model()
    if not model_provider:
        return None, None

    model_id = model_provider.model_id
    input_tokens = _count_tokens(system) + _count_tokens(prompt)

    try:
        r = _http.post(
            OPENAI_URL,
            headers={'Authorization': f'Bearer {OPENAI_API_KEY}'},
            json={
                'model': model_id,
                'max_tokens': MAX_OUTPUT_TOKENS,
                'messages': [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': prompt},
                ],
            },
            timeout=timeout,
        )
        if r.status_code == 200:
            data = r.json()
            txt = data['choices'][0]['message']['content']
            usage = data.get('usage', {})
            in_tok = usage.get('prompt_tokens', input_tokens)
            out_tok = usage.get('completion_tokens', _count_tokens(txt or ''))
            _add_tokens(model_id, in_tok, out_tok)
            if txt and txt.strip():
                return txt.strip(), model_id
        else:
            _record_error(model_id)
            logger.warning("OpenAI %s returned %d: %s", model_id, r.status_code, r.text[:200])
    except (requests.RequestException, KeyError, IndexError, ValueError) as e:
        _record_error(model_id)
        logger.warning("OpenAI %s error: %s", model_id, e)

    return None, None


def openai_stream(system, prompt, on_done=None, timeout=30):
    """Streaming OpenAI chat completion. Returns a text-chunk generator
    or None if the stream can't be opened."""
    if not OPENAI_API_KEY:
        return None, None

    system = (system or '')[:MAX_INPUT_CHARS]
    prompt = (prompt or '')[:MAX_INPUT_CHARS]

    model_provider = get_available_model()
    if not model_provider:
        return None, None

    model_id = model_provider.model_id
    input_tokens = _count_tokens(system) + _count_tokens(prompt)

    try:
        r = _http.post(
            OPENAI_URL,
            headers={'Authorization': f'Bearer {OPENAI_API_KEY}'},
            json={
                'model': model_id,
                'max_tokens': MAX_OUTPUT_TOKENS,
                'stream': True,
                'stream_options': {'include_usage': True},
                'messages': [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': prompt},
                ],
            },
            stream=True,
            timeout=timeout,
        )
    except requests.RequestException:
        _record_error(model_id)
        return None, None

    if r.status_code != 200:
        _record_error(model_id)
        r.close()
        return None, None

    def gen():
        acc = []
        in_tok = input_tokens
        out_tok = 0
        try:
            for raw in r.iter_lines():
                if not raw:
                    continue
                line = raw.decode('utf-8', 'ignore')
                if not line.startswith('data:'):
                    continue
                data = line[5:].strip()
                if data == '[DONE]':
                    break
                try:
                    obj = json.loads(data)
                except Exception:
                    continue
                # Extract usage from the final chunk
                if 'usage' in obj:
                    in_tok = obj['usage'].get('prompt_tokens', in_tok)
                    out_tok = obj['usage'].get('completion_tokens', out_tok)
                for choice in obj.get('choices', []):
                    delta = choice.get('delta', {})
                    if delta.get('content'):
                        acc.append(delta['content'])
                        yield delta['content']
        finally:
            r.close()
            full_text = ''.join(acc)
            if not out_tok:
                out_tok = _count_tokens(full_text)
            _add_tokens(model_id, in_tok, out_tok)
            if on_done and full_text:
                on_done(full_text)

    return gen(), model_id


def seed_default_models():
    """Populate ModelProvider with the default free-tier rotation + Luna paid.
    Safe to call multiple times (skips existing)."""
    from .models import ModelProvider

    defaults = [
        # Free mini/nano — 2.5M tokens/day each
        ('GPT-5.4-mini', 'gpt-5.4-mini', 'free_mini', 2_500_000, 1),
        ('GPT-5.4-nano', 'gpt-5.4-nano', 'free_mini', 2_500_000, 2),
        ('GPT-5-mini', 'gpt-5-mini', 'free_mini', 2_500_000, 3),
        ('GPT-5-nano', 'gpt-5-nano', 'free_mini', 2_500_000, 4),
        ('GPT-4.1-mini', 'gpt-4.1-mini', 'free_mini', 2_500_000, 5),
        ('GPT-4.1-nano', 'gpt-4.1-nano', 'free_mini', 2_500_000, 6),
        ('GPT-4o-mini', 'gpt-4o-mini', 'free_mini', 2_500_000, 7),
        ('o3-mini', 'o3-mini', 'free_mini', 2_500_000, 8),
        ('o4-mini', 'o4-mini', 'free_mini', 2_500_000, 9),
        # Free large — 250K tokens/day each
        ('GPT-5.4', 'gpt-5.4', 'free_large', 250_000, 20),
        ('GPT-5.2', 'gpt-5.2', 'free_large', 250_000, 21),
        ('GPT-5.1', 'gpt-5.1', 'free_large', 250_000, 22),
        ('GPT-5', 'gpt-5', 'free_large', 250_000, 23),
        ('GPT-4.1', 'gpt-4.1', 'free_large', 250_000, 24),
        ('GPT-4o', 'gpt-4o', 'free_large', 250_000, 25),
        ('o1', 'o1', 'free_large', 250_000, 26),
        ('o3', 'o3', 'free_large', 250_000, 27),
        # Paid — Luna
        ('GPT-5.6 Luna', 'gpt-5.6-luna', 'paid', 0, 100),
    ]

    created = 0
    for name, model_id, tier, limit, priority in defaults:
        _, was_created = ModelProvider.objects.get_or_create(
            model_id=model_id,
            defaults={
                'name': name,
                'tier': tier,
                'daily_token_limit': limit,
                'priority': priority,
            },
        )
        if was_created:
            created += 1
    return created
