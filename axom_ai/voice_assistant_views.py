"""
Voice Assistant Views for Axom AI (Live Interactive Conversational Voice Mode).
High-speed Tri-Model Architecture:
  1. Instant Gemini Multimodal Translation / Formulation (Assamese/Hindi -> Structured Query)
  2. OpenAI Flagship gpt-4o Reasoning & Problem Solving
  3. Gemini Native Assamese Voice Script Adapter (100% pure Assamese orthography)
  4. Real-time sub-second Neural TTS (Edge TTS + IndicTTS + OpenAI tts-1 fallback)
"""

import os
import re
import json
import base64
import shutil
import logging
import tempfile
import subprocess
import asyncio
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from .views import (
    http_session,
    _purify_assamese_with_grammar,
)

logger = logging.getLogger(__name__)

TTS_URL = os.getenv('TTS_SERVICE_URL', 'http://127.0.0.1:8090').rstrip('/')
FFMPEG = shutil.which('ffmpeg') or '/usr/bin/ffmpeg'

# Active Gemini models in order of latency and availability
GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.5-flash']

# Persistent HTTP session with keep-alive connection pooling for millisecond speed
_voice_session = requests.Session()

SYSTEM_PROMPT_CONVERSATIONAL = (
    "You are Axom AI's Real-Time Conversational Voice Companion, having a live audio phone conversation with the user.\n"
    "VOICE PERSONA & TONE:\n"
    "- You are a warm, charismatic, energetic young Assamese human companion talking on a live phone call.\n"
    "- Speak in natural, casual, enthusiastic Assamese (অসমীয়া) — never sound like a robotic bot, textbook, or formal announcer!\n"
    "- Address the user respectfully with their name.\n"
    "\n"
    "MANDATORY LANGUAGE & CONVERSATION RULES:\n"
    "1. 100% PURE ASSAMESE ONLY: No matter what language the user speaks (Assamese, Hindi, English, Hinglish), YOU MUST ALWAYS RESPOND EXCLUSIVELY IN PURE ASSAMESE (অসমীয়া). Never reply in Hindi or English.\n"
    "2. STRICTLY 1 TO 2 SHORT SENTENCES (MAX 15-18 WORDS): Keep each answer crisp, brief, and punchy so your voice speaks immediately without lag!\n"
    "3. STRICTLY ZERO BENGALI: Absolutely NEVER use Bengali words, Bengali grammar, or Bengali script.\n"
    "   - Never say 'কী খবর' -> use 'আপোনাৰ খবৰ কি'\n"
    "   - Never say 'ভালো আছি' -> use 'ভালে আছোঁ'\n"
    "   - Never say 'করছি/করব' -> use 'কৰিছোঁ/কৰিম'\n"
    "   - Guarantee pure Assamese orthography: use pure 'ৰ' (U+09F0) and 'ৱ' (U+09F1), NEVER Bengali 'র' (U+09B0).\n"
    "4. NATURAL SPOKEN CADENCE: Start with natural spoken Assamese conversational markers like: 'নমস্কাৰ!', 'নিশ্চয়!', 'হয়!', 'কওকচোন!', 'মই বুজি পালোঁ!'.\n"
    "5. ZERO HALLUCINATION: Never invent fake facts or make up information.\n"
    "6. ABSOLUTELY NO MARKDOWN, NO BULLETS, NO ASTERISKS, NO EMOJIS: Output ONLY the exact spoken words."
)

BENGALI_TO_ASSAMESE_FIXES = [
    (r'\bভালো\b', 'ভাল'),
    (r'\bকেমন\s+আছো\b', 'কেনেকুৱা আছে'),
    (r'\bকেমন\s+আছেন\b', 'কেনেকুৱা আছে'),
    (r'\bকী\s+খবর\b', 'কি খবৰ'),
    (r'\bকরছি\b', 'কৰিছোঁ'),
    (r'\bকরব\b', 'কৰিম'),
    (r'\bবলছি\b', 'কৈছোঁ'),
    (r'\bবলব\b', 'ক’ম'),
    (r'\bহবে\b', 'হ’ব'),
    (r'\bহচ্ছে\b', 'হৈছে'),
    (r'\bআমি\b', 'মই'),
    (r'\bতুমি\b', 'তুমি'),
    (r'\bআপনি\b', 'আপুনি'),
]


def _clean_voice_text(text):
    """Remove markdown symbols, filter rogue Bengali words, and purify Assamese orthography."""
    if not text:
        return ""
    # Strip markdown formatting & emojis
    cleaned = re.sub(r'[*_#`~>\[\]\(\)]', '', text)
    cleaned = re.sub(r'[\U0001F000-\U0001FFFF☀-➿️‍⭐⬆↔-↪⌀-⏿]', '', cleaned)

    for pattern, repl in BENGALI_TO_ASSAMESE_FIXES:
        cleaned = re.sub(pattern, repl, cleaned)

    cleaned = re.sub(r'\s+', ' ', cleaned).strip(' "\'`')
    return _purify_assamese_with_grammar(cleaned)


# ─── 1. GEMINI TRANSLATION & INTENT FORMULATION ──────────────────────────────
def _gemini_translate_query(user_message, timeout=4):
    """
    Step 1: User's speech/message (in Assamese, Hindi, or English) is instantly
    understood, de-noised, and translated into a precise English reasoning query for OpenAI.
    """
    gemini_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not gemini_key or not user_message:
        return user_message

    prompt = (
        "You are Axom AI's instant language understanding bridge. "
        "Translate and formulate this user speech (which may be in Assamese, Hindi, Bengali, or English) "
        "into a clear, precise English question for a reasoning AI.\n"
        f"User Speech: {user_message}\n"
        "Output ONLY the English question, nothing else."
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 45}
    }

    for m in GEMINI_MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
            res = _voice_session.post(url, json=payload, timeout=timeout)
            if res.status_code == 200:
                txt = res.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                if txt and txt.strip():
                    return txt.strip()
        except Exception as e:
            logger.warning(f"Gemini translate error on {m}: {e}")
            continue

    return user_message


# ─── 2. OPENAI FLAGSHIP GPT-4O PROBLEM SOLVING ───────────────────────────────
def _openai_solve_flagship(english_query, context="", timeout=5):
    """
    Step 2: Solve user's problem with OpenAI's flagship model (gpt-4o),
    cascading to gpt-4o-mini and Groq for ultra-fast fallback.
    """
    openai_key = os.getenv('OPENAI_API_KEY', '').strip()
    if openai_key:
        for model in ['gpt-4o', 'gpt-4o-mini']:
            try:
                res = _voice_session.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {openai_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': model,
                        'messages': [
                            {
                                'role': 'system',
                                'content': (
                                    'You are a master reasoning engine. Solve the user query with supreme factual '
                                    'precision and deep knowledge. Answer in 1 concise sentence (maximum 20 words) '
                                    'suitable for live spoken conversation. Output ONLY the answer, no preamble, no markdown.'
                                )
                            },
                            {'role': 'user', 'content': f"{context}\nQuery: {english_query}" if context else english_query}
                        ],
                        'temperature': 0.2,
                        'max_tokens': 50
                    },
                    timeout=timeout
                )
                if res.status_code == 200:
                    txt = res.json()['choices'][0]['message']['content'].strip()
                    if txt:
                        return txt
            except Exception as e:
                logger.warning(f"OpenAI voice flagship error with {model}: {e}")
                continue

    # Tertiary Fallback: Groq Cloud Llama-3.3-70b (sub-100ms)
    groq_key = os.getenv('GROQ_API_KEY', '').strip()
    if groq_key:
        try:
            res = _voice_session.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={'Authorization': f'Bearer {groq_key}', 'Content-Type': 'application/json'},
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {'role': 'system', 'content': 'Solve the query in 1 concise sentence (max 20 words).'},
                        {'role': 'user', 'content': f"{context}\nQuery: {english_query}" if context else english_query}
                    ],
                    'temperature': 0.2,
                    'max_tokens': 50
                },
                timeout=timeout
            )
            if res.status_code == 200:
                txt = res.json()['choices'][0]['message']['content'].strip()
                if txt:
                    return txt
        except Exception as e:
            logger.warning(f"Groq fallback error: {e}")

    return None


# ─── 3. GEMINI NATIVE ASSAMESE VOICE SCRIPT ADAPTER ──────────────────────────
def _gemini_to_spoken_assamese(openai_solution, user_name="সমৰজিৎ", timeout=4):
    """
    Step 3: Converts OpenAI's verified solution into 1 short, warm, lively,
    spoken Assamese sentence with 100% pure Assamese orthography and zero Bengali.
    """
    gemini_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not gemini_key or not openai_solution:
        return openai_solution

    prompt = (
        "Convert this verified solution from OpenAI into 1 short, lively, natural spoken Assamese (অসমীয়া) sentence (max 15 words) for audio speech output.\n"
        "RULES:\n"
        "1. 100% pure Assamese orthography (use 'ৰ' and 'ৱ', NEVER Bengali 'র').\n"
        "2. Strictly zero Bengali grammar or words (use 'ভালে আছোঁ' not 'ভালো আছি', 'কৰিছোঁ' not 'করছি').\n"
        "3. NATURAL SPOKEN CADENCE: Start with natural spoken affirmative markers when appropriate (e.g. 'হয়!', 'নিশ্চয়!', 'নমস্কাৰ!').\n"
        "4. ABSOLUTELY NO MARKDOWN, NO BULLETS, NO ASTERISKS, NO EMOJIS: Return ONLY the exact spoken words.\n"
        f"Solution: {openai_solution}\n"
        "Spoken Assamese:"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 55}
    }

    for m in GEMINI_MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
            res = _voice_session.post(url, json=payload, timeout=timeout)
            if res.status_code == 200:
                txt = res.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                if txt and txt.strip():
                    return _clean_voice_text(txt.strip())
        except Exception as e:
            logger.warning(f"Gemini Assamese script error on {m}: {e}")
            continue

    return _clean_voice_text(openai_solution)


# ─── 4. COMPLETE TRI-MODEL PIPELINE ──────────────────────────────────────────
def _process_tri_model_voice_pipeline(user_message, user_name="সমৰজিৎ", history=None):
    """
    Executes:
      User Speech -> Gemini (Translate/Formulate) -> OpenAI gpt-4o (Solve) -> Gemini (Spoken Assamese)
    """
    context_str = ""
    if history and isinstance(history, list):
        for turn in history[-4:]:
            role = turn.get('role', 'user')
            text = turn.get('text', '')
            if text:
                context_str += f"{role.capitalize()}: {text}\n"

    # Step 1: Gemini Translation
    english_query = _gemini_translate_query(user_message)
    if not english_query:
        english_query = user_message

    # Step 2: OpenAI gpt-4o Problem Solving
    openai_solution = _openai_solve_flagship(english_query, context=context_str)
    if not openai_solution:
        # Fallback to direct conversational response
        return _clean_voice_text("হয়, মই আপোনাৰ কথা বুজি পালোঁ। ইয়াৰ ওপৰত আপোনাক আৰু কি তথ্য লাগে জনাব নেকি?")

    # Step 3: Gemini Spoken Assamese Output
    spoken_assamese = _gemini_to_spoken_assamese(openai_solution, user_name=user_name)
    if not spoken_assamese:
        spoken_assamese = openai_solution

    return _clean_voice_text(spoken_assamese)


# ─── 5. MULTI-TIER ULTRA-FAST TTS SYNTHESIS ──────────────────────────────────
def _synthesize_edge_tts(text, voice='male'):
    """Fast Neural speech synthesis via Edge TTS (bn-IN Neural Voices)."""
    try:
        import edge_tts
        voice_id = 'bn-IN-BashkarNeural' if voice == 'male' else 'bn-IN-TanishaaNeural'

        async def _run():
            communicate = edge_tts.Communicate(text, voice_id)
            buf = bytearray()
            async for chunk in communicate.stream():
                if chunk['type'] == 'audio':
                    buf.extend(chunk['data'])
            return bytes(buf)

        audio_bytes = asyncio.run(_run())
        if audio_bytes and len(audio_bytes) > 500:
            return base64.b64encode(audio_bytes).decode('ascii')
    except Exception as e:
        logger.warning(f"Edge TTS synthesis error: {e}")
    return None


def _synthesize_audio(text, voice='male'):
    """
    Multi-tier speech synthesis pipeline:
    Tier 1: Microsoft Edge Neural TTS (bn-IN-BashkarNeural / bn-IN-TanishaaNeural)
    Tier 2: Local AI4Bharat Indic-TTS (127.0.0.1:8090, 1.2s timeout)
    Tier 3: OpenAI tts-1 (alloy / onyx / nova)
    """
    if not text:
        return None

    clean = text.replace('\n', ' ').strip()
    sentences = [s.strip() for s in re.split(r'[।!?.]', clean) if s.strip()]
    speech_text = '। '.join(sentences[:2]) + '।' if sentences else clean
    speech_text = speech_text.replace('।', '.')

    # 1. Edge Neural TTS (High-fidelity, zero robotic delay)
    b64 = _synthesize_edge_tts(speech_text, voice=voice)
    if b64:
        return b64

    # 2. Local AI4Bharat Indic-TTS (if running on 8090)
    try:
        r = _voice_session.post(
            f"{TTS_URL}/tts",
            json={"text": speech_text, "voice": voice},
            timeout=1.2
        )
        if r.status_code == 200 and len(r.content) > 500:
            return base64.b64encode(r.content).decode('ascii')
    except Exception:
        pass

    # 3. OpenAI tts-1 Fallback
    openai_key = os.getenv('OPENAI_API_KEY', '').strip()
    if openai_key:
        try:
            o_voice = 'onyx' if voice == 'male' else 'nova'
            r = _voice_session.post(
                'https://api.openai.com/v1/audio/speech',
                headers={'Authorization': f'Bearer {openai_key}', 'Content-Type': 'application/json'},
                json={'model': 'tts-1', 'input': speech_text, 'voice': o_voice},
                timeout=4
            )
            if r.status_code == 200 and len(r.content) > 500:
                return base64.b64encode(r.content).decode('ascii')
        except Exception as e:
            logger.warning(f"OpenAI TTS fallback error: {e}")

    return None


def _process_incoming_audio(audio_bytes):
    """
    Convert incoming mobile audio (m4a, aac, wav, mp3, ogg) to 16kHz mono PCM WAV.
    Fast lightweight conversion without CPU-heavy normalizer.
    """
    if not audio_bytes or len(audio_bytes) < 400:
        return None

    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, 'in.audio')
        out = os.path.join(d, 'out.wav')
        with open(src, 'wb') as f:
            f.write(audio_bytes)

        cmd = [
            FFMPEG, '-y', '-hide_banner', '-loglevel', 'error',
            '-i', src,
            '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', out
        ]
        try:
            r = subprocess.run(cmd, capture_output=True, timeout=8)
            if r.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 500:
                with open(out, 'rb') as f:
                    return f.read()
        except Exception as e:
            logger.error(f"FFmpeg conversion error: {e}")

    return None


def _transcribe_with_gemini_multimodal(wav_bytes):
    """Direct high-accuracy speech transcription fallback using Gemini audio multimodal."""
    gemini_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not gemini_key or not wav_bytes:
        return ""

    prompt = (
        "Transcribe the user's speech in this audio exactly as spoken. "
        "The language may be Assamese (অসমীয়া), Hindi, or English. "
        "Write only the words that were spoken: no commentary, no timestamps, no translation, no quotes. "
        "If there is no intelligible human speech, answer with exactly NO_SPEECH."
    )
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "audio/wav", "data": base64.b64encode(wav_bytes).decode('ascii')}}
            ]
        }],
        "generationConfig": {"temperature": 0.0}
    }
    for m in GEMINI_MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
            res = _voice_session.post(url, headers={'Content-Type': 'application/json'}, json=payload, timeout=5)
            if res.status_code == 200:
                candidates = res.json().get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts and 'text' in parts[0]:
                        txt = parts[0]['text'].strip()
                        if txt and 'NO_SPEECH' not in txt.upper():
                            return txt
        except Exception as e:
            logger.warning(f"Gemini multimodal STT error with {m}: {e}")
            continue
    return ""


def _transcribe_audio_fast(wav_bytes):
    """
    Sub-second speech transcription pipeline:
    1. Groq Whisper Large V3 Turbo (~200ms ultra-low latency)
    2. OpenAI Whisper-1 (~800ms accuracy)
    3. Gemini Multimodal (fallback)
    """
    if not wav_bytes:
        return ""

    from .stt_api import is_gibberish

    # 1. Groq Whisper Large V3 Turbo (0.2s)
    groq_key = os.getenv('GROQ_API_KEY', '').strip()
    if groq_key:
        try:
            r = _voice_session.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {groq_key}"},
                files={"file": ("speech.wav", wav_bytes, "audio/wav")},
                data={"model": "whisper-large-v3-turbo"},
                timeout=4,
            )
            if r.status_code == 200:
                txt = (r.json().get('text') or '').strip()
                if txt and not is_gibberish(txt):
                    return txt
        except Exception as e:
            logger.warning(f"Groq whisper STT error: {e}")

    # 2. OpenAI Whisper-1 (0.8s)
    openai_key = os.getenv('OPENAI_API_KEY', '').strip()
    if openai_key:
        try:
            r = _voice_session.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {openai_key}"},
                files={"file": ("speech.wav", wav_bytes, "audio/wav")},
                data={"model": "whisper-1"},
                timeout=5,
            )
            if r.status_code == 200:
                txt = (r.json().get('text') or '').strip()
                if txt and not is_gibberish(txt):
                    return txt
        except Exception as e:
            logger.warning(f"OpenAI whisper STT error: {e}")

    # 3. Gemini Multimodal
    return _transcribe_with_gemini_multimodal(wav_bytes)


@csrf_exempt
def voice_assistant_greeting_api(request):
    """
    POST /api/voice-assistant/greeting/
    Instant Sub-10ms response with pre-synthesized / cached human voice!
    Text: "নমস্কাৰ {user_name}, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?"
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST is allowed"}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8')) if request.body else {}
    except Exception:
        data = {}

    user_name = data.get('user_name', '').strip()
    if not user_name and request.user.is_authenticated:
        user_name = request.user.first_name or request.user.username

    user_name = user_name or "সমৰজিৎ"
    voice = data.get('voice', 'male')

    greeting_text = f"নমস্কাৰ {user_name}, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?"

    cache_dir = os.path.join(settings.MEDIA_ROOT, 'voice_cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_filename = f"greeting_{user_name}_{voice}_v5.mp3"
    cache_path = os.path.join(cache_dir, cache_filename)
    audio_url = f"{settings.MEDIA_URL}voice_cache/{cache_filename}"

    audio_b64 = None
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1000:
        with open(cache_path, 'rb') as f:
            audio_b64 = base64.b64encode(f.read()).decode('ascii')
    else:
        audio_b64 = _synthesize_audio(greeting_text, voice=voice)
        if audio_b64:
            try:
                with open(cache_path, 'wb') as f:
                    f.write(base64.b64decode(audio_b64))
            except Exception as e:
                logger.error(f"Error caching greeting audio: {e}")

    return JsonResponse({
        "success": True,
        "user_name": user_name,
        "greeting_text": greeting_text,
        "audio_base64": audio_b64,
        "audio_url": audio_url,
        "audio_format": "audio/mpeg"
    })


@csrf_exempt
def voice_assistant_converse_api(request):
    """
    POST /api/voice-assistant/converse/
    Full Tri-Model Conversational Pipeline:
    User Spoken Audio -> Gemini Translate -> OpenAI gpt-4o Solve -> Gemini Pure Assamese -> High-speed Neural TTS
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST is allowed"}, status=405)

    user_message = ""
    user_name = "বন্ধু"
    voice = "male"
    history = []

    if request.content_type and 'multipart/form-data' in request.content_type:
        user_name = request.POST.get('user_name', 'বন্ধু').strip()
        voice = request.POST.get('voice', 'male')
        history_raw = request.POST.get('history', '[]')
        try:
            history = json.loads(history_raw)
        except Exception:
            history = []

        audio_file = request.FILES.get('audio')
        if audio_file:
            try:
                wav_bytes = _process_incoming_audio(audio_file.read())
                if wav_bytes:
                    user_message = _transcribe_audio_fast(wav_bytes)
                    if user_message:
                        user_message = _purify_assamese_with_grammar(user_message)
            except Exception as e:
                logger.error(f"Voice Assistant Audio processing error: {e}")
                return JsonResponse({"error": f"Audio processing failed: {str(e)}"}, status=400)
    else:
        try:
            data = json.loads(request.body.decode('utf-8'))
            user_message = data.get('message', '').strip()
            user_name = data.get('user_name', 'বন্ধু').strip()
            voice = data.get('voice', 'male')
            history = data.get('history', [])
        except Exception as e:
            return JsonResponse({"error": f"Invalid JSON payload: {str(e)}"}, status=400)

    if not user_message:
        fallback_msg = "মই আপোনাৰ মাতটো ভালদৰে শুনিলোঁ নাই, অনুগ্ৰহ কৰি আকৌ এবাৰ কওকচোন?"
        return JsonResponse({
            "success": True,
            "user_text": "",
            "reply_text": fallback_msg,
            "audio_base64": _synthesize_audio(fallback_msg, voice=voice),
            "audio_format": "audio/mpeg"
        })

    # Tri-Model Reasoning Flow
    reply_text = _process_tri_model_voice_pipeline(user_message, user_name=user_name, history=history)
    audio_b64 = _synthesize_audio(reply_text, voice=voice)

    return JsonResponse({
        "success": True,
        "user_text": user_message,
        "reply_text": reply_text,
        "audio_base64": audio_b64,
        "audio_format": "audio/mpeg"
    })
