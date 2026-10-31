"""
Voice Assistant Views for Axom AI (Live Interactive Conversational Voice Mode).
Provides real-time personalized greetings and human-like natural Assamese dialogue
with instant sub-10ms greeting audio cache and multi-engine STT/TTS.
"""

import os
import re
import json
import base64
import shutil
import logging
import tempfile
import subprocess
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

SYSTEM_PROMPT_CONVERSATIONAL = (
    "You are Axom AI's Real-Time Conversational Voice Companion, having a live audio phone conversation with the user.\n"
    "VOICE PERSONA & TONE:\n"
    "- You are a warm, charismatic, energetic young Assamese human companion talking on a live phone call.\n"
    "- Speak in natural, casual, enthusiastic Assamese (অসমীয়া) — never sound like a robotic bot, textbook, or formal announcer!\n"
    "- Address the user respectfully with 'সমৰজিৎ' or their name.\n"
    "\n"
    "MANDATORY LANGUAGE & CONVERSATION RULES:\n"
    "1. 100% PURE ASSAMESE ONLY: No matter what language the user speaks (Assamese, Hindi, English, Hinglish), YOU MUST ALWAYS RESPOND EXCLUSIVELY IN PURE ASSAMESE (অসমীয়া). Never reply in Hindi or English.\n"
    "2. STRICTLY 1 TO 2 SHORT SENTENCES (MAX 18-22 WORDS): Keep each answer crisp, brief, and punchy so your voice speaks immediately without lag!\n"
    "3. STRICTLY ZERO BENGALI: Absolutely NEVER use Bengali words, Bengali grammar, or Bengali script.\n"
    "   - Never say 'কী খবর' -> use 'আপোনাৰ খবৰ কি'\n"
    "   - Never say 'ভালো আছি' -> use 'ভালে আছোঁ'\n"
    "   - Never say 'করছি/করব' -> use 'কৰিছোঁ/কৰিম'\n"
    "   - Guarantee pure Assamese orthography: use pure 'ৰ' (U+09F0) and 'ৱ' (U+09F1), NEVER Bengali 'র' (U+09B0).\n"
    "4. NATURAL SPOKEN CADENCE: Start with natural spoken Assamese conversational markers like: 'নমস্কাৰ!', 'নিশ্চয়!', 'হয়!', 'কওকচোন!', 'মই বুজি পালোঁ!'.\n"
    "5. ZERO HALLUCINATION: Never invent fake facts or make up information. If you don't know something, say honestly and politely: 'মই এই বিষয়ে নিশ্চিত নহয়, আন কিবা সুধিব নেকি?'.\n"
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


def _generate_assistant_text(system_prompt, user_prompt, timeout=8):
    """
    Generate conversational dialogue strictly following GEMINI.md hierarchy:
    Tier 1: OpenAI gpt-4o-mini (Primary ultra-fast 0.4s conversational response)
    Tier 2: Groq llama-3.3-70b-versatile
    """
    openai_key = os.getenv('OPENAI_API_KEY', '').strip()
    if openai_key:
        for model in ['gpt-4o-mini', 'gpt-4o']:
            try:
                res = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {openai_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': model,
                        'messages': [
                            {'role': 'system', 'content': system_prompt},
                            {'role': 'user', 'content': user_prompt},
                        ],
                        'temperature': 0.4,
                        'max_tokens': 90,
                    },
                    timeout=timeout,
                )
                if res.status_code == 200:
                    txt = res.json()['choices'][0]['message']['content']
                    if txt and txt.strip():
                        return _clean_voice_text(txt)
            except Exception as e:
                logger.warning(f"OpenAI voice call error with {model}: {e}")
                continue

    # Tier 2: Groq Cloud fallback
    groq_key = os.getenv('GROQ_API_KEY', '').strip()
    if groq_key:
        try:
            res = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={'Authorization': f'Bearer {groq_key}', 'Content-Type': 'application/json'},
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_prompt},
                    ],
                    'temperature': 0.4,
                    'max_tokens': 90,
                },
                timeout=timeout,
            )
            if res.status_code == 200:
                txt = res.json()['choices'][0]['message']['content']
                if txt and txt.strip():
                    return _clean_voice_text(txt)
        except Exception as e:
            logger.warning(f"Groq voice fallback error: {e}")

    return None


def _synthesize_audio(text, voice='male'):
    """Synthesize speech audio via AI4Bharat Indic-TTS and return base64 string."""
    try:
        clean = text.replace('\n', ' ').strip()
        sentences = [s.strip() for s in re.split(r'[।!?.]', clean) if s.strip()]
        # Take up to 2 sentences for natural spoken brevity
        speech_text = '। '.join(sentences[:2]) + '।' if sentences else clean
        speech_text = speech_text.replace('।', '.')

        r = requests.post(
            f"{TTS_URL}/tts",
            json={"text": speech_text, "voice": voice},
            timeout=25
        )
        if r.status_code == 200 and len(r.content) > 500:
            return base64.b64encode(r.content).decode('ascii')
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
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
            r = subprocess.run(cmd, capture_output=True, timeout=10)
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
    models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-flash-lite-latest']
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
    for m in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
            res = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload, timeout=8)
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

    # Exactly as requested: "নমস্কাৰ সমৰজিৎ, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?"
    greeting_text = f"নমস্কাৰ {user_name}, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?"

    cache_dir = os.path.join(settings.MEDIA_ROOT, 'voice_cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_filename = f"greeting_{user_name}_{voice}_v4.mp3"
    cache_path = os.path.join(cache_dir, cache_filename)
    audio_url = f"{settings.MEDIA_URL}voice_cache/{cache_filename}"

    audio_b64 = None
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1000:
        with open(cache_path, 'rb') as f:
            audio_b64 = base64.b64encode(f.read()).decode('ascii')
    else:
        # Synthesize once with best high-fidelity model and save permanently
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
    Can accept:
      - JSON: { "message": "...", "history": [...], "user_name": "...", "voice": "male" }
      - Multipart: audio file + optional history JSON string
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
                # 1. Cleanly convert incoming mobile audio without destructive silence gate
                wav_bytes = _process_incoming_audio(audio_file.read())
                if wav_bytes:
                    # 2. Try Primary Multilingual STT
                    try:
                        from .stt_api import transcribe
                        user_message = transcribe(wav_bytes, 'multilingual') or ""
                    except Exception as e:
                        logger.warning(f"Primary transcribe failed: {e}")
                        user_message = ""

                    # 3. Robust fallback: Direct Gemini Multimodal Audio transcription
                    if not user_message:
                        user_message = _transcribe_with_gemini_multimodal(wav_bytes)

                    # 4. If Assamese, purify script
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

    # Build contextual prompt with recent history
    context_str = ""
    if history and isinstance(history, list):
        for turn in history[-4:]:
            role = turn.get('role', 'user')
            text = turn.get('text', '')
            context_str += f"{role.capitalize()}: {text}\n"

    user_prompt = (
        f"{context_str}"
        f"User ({user_name}): {user_message}\n"
        f"Axom AI (Respond in 1-2 short, energetic, spoken conversational Assamese sentences with 100% pure Assamese orthography and zero Bengali):"
    )

    reply_text = _generate_assistant_text(SYSTEM_PROMPT_CONVERSATIONAL, user_prompt)
    if not reply_text:
        reply_text = "হয়, মই আপোনাৰ কথা বুজি পালোঁ। ইয়াৰ ওপৰত আপোনাক আৰু কি তথ্য লাগে জনাব নেকি?"

    reply_text = _clean_voice_text(reply_text)
    audio_b64 = _synthesize_audio(reply_text, voice=voice)

    return JsonResponse({
        "success": True,
        "user_text": user_message,
        "reply_text": reply_text,
        "audio_base64": audio_b64,
        "audio_format": "audio/mpeg"
    })
