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
    """Pick the best available model from the cascade."""
    candidates = get_cascade_models()
    return candidates[0] if candidates else None


def get_cascade_models():
    """Returns an ordered list of OpenAI models following the strict priority chain:
    1. gpt-4o (Flagship pedagogical & reasoning model)
    2. o3-mini (High-reasoning STEM/math model)
    3. gpt-4o-mini (High-speed efficient model)
    4. Active rotation models in ModelProvider with remaining daily quota
    5. Paid fallback models (tier='paid')
    """
    from .models import ModelProvider

    CORE_CASCADE = ['gpt-4o', 'o3-mini', 'gpt-4o-mini']
    candidates = []
    seen = set()

    # 1. Add core models first
    for mid in CORE_CASCADE:
        p = ModelProvider.objects.filter(model_id=mid, is_active=True).first()
        if p:
            used = _get_daily_tokens(p.model_id)
            if p.daily_token_limit == 0 or (p.daily_token_limit - used) > 10_000:
                candidates.append(p)
                seen.add(mid)
        else:
            class SimpleProvider:
                def __init__(self, m_id):
                    self.model_id = m_id
                    self.name = m_id
                    self.daily_token_limit = 0
            candidates.append(SimpleProvider(mid))
            seen.add(mid)

    # 2. Add other active providers from DB ordered by priority
    other_providers = ModelProvider.objects.filter(is_active=True).order_by('priority')
    for p in other_providers:
        if p.model_id in seen:
            continue
        if p.daily_token_limit > 0:
            used = _get_daily_tokens(p.model_id)
            if (p.daily_token_limit - used) <= 10_000:
                continue
        candidates.append(p)
        seen.add(p.model_id)

    return candidates


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


def _format_user_content(prompt, image_b64=None, image_mime=None):
    if not image_b64:
        return prompt
    mime = image_mime or 'image/jpeg'
    if image_b64.startswith('data:'):
        img_url = image_b64
    else:
        img_url = f"data:{mime};base64,{image_b64}"
    return [
        {"type": "text", "text": prompt or "Please inspect this image and provide a detailed, accurate response."},
        {"type": "image_url", "image_url": {"url": img_url, "detail": "auto"}}
    ]


def openai_generate(system, prompt, image_b64=None, image_mime=None, timeout=30):
    """One-shot OpenAI chat completion cascading through candidate models.
    Supports multimodal vision when image_b64 is provided.
    Returns (text, model_id) or (None, None) on complete failure."""
    if not OPENAI_API_KEY:
        return None, None

    system = (system or '')[:MAX_INPUT_CHARS]
    prompt_str = (prompt or '')[:MAX_INPUT_CHARS]

    candidates = get_cascade_models()
    if not candidates:
        return None, None

    # Filter out text-only models like o3-mini when an image is attached
    if image_b64:
        candidates = [c for c in candidates if not str(c.model_id).startswith('o3-') and not str(c.model_id).startswith('o1-')]

    input_tokens = _count_tokens(system) + _count_tokens(prompt_str)
    user_payload = _format_user_content(prompt_str, image_b64, image_mime)

    for model_provider in candidates:
        model_id = model_provider.model_id
        try:
            r = _http.post(
                OPENAI_URL,
                headers={'Authorization': f'Bearer {OPENAI_API_KEY}'},
                json={
                    'model': model_id,
                    'max_tokens': MAX_OUTPUT_TOKENS,
                    'messages': [
                        {'role': 'system', 'content': system},
                        {'role': 'user', 'content': user_payload},
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
                logger.warning("OpenAI %s returned %d: %s, cascading to next model", model_id, r.status_code, r.text[:150])
        except (requests.RequestException, KeyError, IndexError, ValueError) as e:
            _record_error(model_id)
            logger.warning("OpenAI %s error: %s, cascading to next model", model_id, e)

    return None, None


def openai_stream(system, prompt, image_b64=None, image_mime=None, on_done=None, timeout=30):
    """Streaming OpenAI chat completion with cascade fallback.
    Supports multimodal vision when image_b64 is provided.
    Iterates through candidate models in cascade order."""
    if not OPENAI_API_KEY:
        return None, None

    system = (system or '')[:MAX_INPUT_CHARS]
    prompt_str = (prompt or '')[:MAX_INPUT_CHARS]

    candidates = get_cascade_models()
    if not candidates:
        return None, None

    # Filter out text-only models like o3-mini when an image is attached
    if image_b64:
        candidates = [c for c in candidates if not str(c.model_id).startswith('o3-') and not str(c.model_id).startswith('o1-')]

    input_tokens = _count_tokens(system) + _count_tokens(prompt_str)
    user_payload = _format_user_content(prompt_str, image_b64, image_mime)

    for model_provider in candidates:
        model_id = model_provider.model_id
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
                        {'role': 'user', 'content': user_payload},
                    ],
                },
                stream=True,
                timeout=timeout,
            )
        except requests.RequestException as e:
            _record_error(model_id)
            logger.warning("OpenAI %s stream connection failed: %s, cascading", model_id, e)
            continue

        if r.status_code != 200:
            _record_error(model_id)
            logger.warning("OpenAI %s returned %d (%s), cascading to next model", model_id, r.status_code, r.text[:150])
            r.close()
            continue

        def gen(resp=r, m_id=model_id):
            acc = []
            in_tok = input_tokens
            out_tok = 0
            try:
                for raw in resp.iter_lines():
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
                    if obj.get('usage') and isinstance(obj['usage'], dict):
                        in_tok = obj['usage'].get('prompt_tokens', in_tok)
                        out_tok = obj['usage'].get('completion_tokens', out_tok)
                    for choice in obj.get('choices', []):
                        delta = choice.get('delta', {})
                        if delta.get('content'):
                            acc.append(delta['content'])
                            yield delta['content']
            finally:
                resp.close()
                full_text = ''.join(acc)
                if not out_tok:
                    out_tok = _count_tokens(full_text)
                _add_tokens(m_id, in_tok, out_tok)
                if on_done and full_text:
                    on_done(full_text)

        return gen(), model_id

    return None, None


def seed_default_models():
    """Populate ModelProvider with the default cascade + Luna paid.
    Safe to call multiple times (skips existing)."""
    from .models import ModelProvider

    defaults = [
        # Strict Cascade Priority: gpt-4o -> o3-mini -> gpt-4o-mini
        ('GPT-4o', 'gpt-4o', 'free_large', 250_000, 1),
        ('o3-mini', 'o3-mini', 'free_mini', 2_500_000, 2),
        ('GPT-4o-mini', 'gpt-4o-mini', 'free_mini', 2_500_000, 3),
        # Paid — Luna
        ('GPT-5.6 Luna', 'gpt-5.6-luna', 'paid', 0, 100),
    ]

    created = 0
    for name, model_id, tier, limit, priority in defaults:
        obj, was_created = ModelProvider.objects.get_or_create(
            model_id=model_id,
            defaults={
                'name': name,
                'tier': tier,
                'daily_token_limit': limit,
                'priority': priority,
                'is_active': True,
            },
        )
        if was_created:
            created += 1
        else:
            # Keep priority updated to match cascade
            if obj.priority != priority:
                obj.priority = priority
                obj.save(update_fields=['priority'])
    return created
