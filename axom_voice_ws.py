"""
Axom AI Live Real-Time Voice WebSocket Gateway.
Provides sub-second full-duplex conversational audio streaming,
instant barge-in / interruption, and pure Assamese speech.
Runs on 127.0.0.1:8001 (proxied by Nginx /ws/).
"""

import os
import sys
import json
import time
import base64
import asyncio
import logging
import urllib.parse
from io import BytesIO

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axom_ai.settings')
import django
django.setup()

from django.conf import settings
import websockets
from axom_ai.voice_assistant_views import (
    SYSTEM_PROMPT_CONVERSATIONAL,
    _clean_voice_text,
    _generate_assistant_text,
    _synthesize_audio,
    _process_incoming_audio,
    _transcribe_audio_fast,
    _transcribe_with_gemini_multimodal,
)
from axom_ai.stt_api import transcribe

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("axom_voice_ws")

HOST = "127.0.0.1"
PORT = 8085


class VoiceSession:
    def __init__(self, websocket, user_name="সমৰজিৎ", voice="male"):
        self.ws = websocket
        self.user_name = user_name
        self.voice = voice
        self.history = []
        self.audio_buffer = bytearray()
        self.current_task = None
        self.is_active = True

    async def send_json(self, data):
        try:
            await self.ws.send(json.dumps(data))
        except Exception as e:
            logger.warning(f"Error sending frame: {e}")

    async def send_instant_greeting(self):
        """Send instant pre-cached greeting audio within 10 milliseconds."""
        greeting_text = f"নমস্কাৰ {self.user_name}, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?"
        cache_dir = os.path.join(settings.MEDIA_ROOT, 'voice_cache')
        cache_path = os.path.join(cache_dir, f"greeting_{self.user_name}_{self.voice}_v4.mp3")

        audio_b64 = None
        if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1000:
            with open(cache_path, 'rb') as f:
                audio_b64 = base64.b64encode(f.read()).decode('ascii')
        else:
            audio_b64 = _synthesize_audio(greeting_text, voice=self.voice)

        await self.send_json({
            "event": "greeting",
            "user_name": self.user_name,
            "text": greeting_text,
            "audio": audio_b64,
            "audio_format": "audio/mpeg"
        })

    async def handle_interrupt(self):
        """Instantly abort current generation or speech output."""
        logger.info(f"Barge-in interrupt received for {self.user_name}")
        if self.current_task and not self.current_task.done():
            self.current_task.cancel()
            self.current_task = None
        self.audio_buffer.clear()
        await self.send_json({"event": "interrupted"})

    async def process_speech_turn(self):
        """Process collected audio buffer and generate natural conversational response."""
        if not self.audio_buffer or len(self.audio_buffer) < 400:
            self.audio_buffer.clear()
            await self.send_json({
                "event": "status",
                "text": "মই শুনি আছোঁ, কওক..."
            })
            return

        raw_bytes = bytes(self.audio_buffer)
        self.audio_buffer.clear()

        await self.send_json({"event": "status", "text": "ভাবি আছোঁ... (Thinking)"})

        # 1. Convert incoming audio to 16kHz PCM WAV
        wav_bytes = await asyncio.to_thread(_process_incoming_audio, raw_bytes)
        if not wav_bytes:
            fallback = "মই আপোনাৰ মাতটো ভালদৰে শুনিলোঁ নাই, অনুগ্ৰহ কৰি আকৌ এবাৰ কওকচোন?"
            audio = await asyncio.to_thread(_synthesize_audio, fallback, voice=self.voice)
            await self.send_json({
                "event": "reply",
                "user_text": "",
                "reply_text": fallback,
                "audio": audio
            })
            return

        # 2. Transcribe using fast multi-tier STT
        user_text = await asyncio.to_thread(_transcribe_audio_fast, wav_bytes)

        if not user_text:
            fallback = "মই আপোনাৰ মাতটো ভালদৰে শুনিলোঁ নাই, অনুগ্ৰহ কৰি আকৌ এবাৰ কওকচোন?"
            audio = await asyncio.to_thread(_synthesize_audio, fallback, voice=self.voice)
            await self.send_json({
                "event": "reply",
                "user_text": "",
                "reply_text": fallback,
                "audio": audio
            })
            return

        await self.send_json({"event": "user_transcript", "text": user_text})

        # 3. Build context & generate Assamese response
        context_str = ""
        for turn in self.history[-4:]:
            context_str += f"{turn.get('role', 'user').capitalize()}: {turn.get('text', '')}\n"

        user_prompt = (
            f"{context_str}"
            f"User ({self.user_name}): {user_text}\n"
            f"Axom AI (Respond in 1 short, lively, spoken conversational Assamese sentence of max 12-15 words with 100% pure Assamese orthography and zero Bengali):"
        )

        reply_text = await asyncio.to_thread(_generate_assistant_text, SYSTEM_PROMPT_CONVERSATIONAL, user_prompt)
        if not reply_text:
            reply_text = "হয়, মই আপোনাৰ কথা বুজি পালোঁ। কওকচোন আজি মই আপোনাক আৰু কিদৰে সহায় কৰিম?"

        reply_text = _clean_voice_text(reply_text)
        self.history.append({"role": "user", "text": user_text})
        self.history.append({"role": "assistant", "text": reply_text})

        # 4. Synthesize speech using high-fidelity model
        audio_b64 = await asyncio.to_thread(_synthesize_audio, reply_text, voice=self.voice)

        await self.send_json({
            "event": "reply",
            "user_text": user_text,
            "reply_text": reply_text,
            "audio": audio_b64,
            "audio_format": "audio/mpeg"
        })


async def ws_handler(websocket):
    raw_path = getattr(websocket, "path", None)
    if not raw_path and hasattr(websocket, "request"):
        raw_path = websocket.request.path

    query = {}
    if raw_path and "?" in raw_path:
        query = urllib.parse.parse_qs(raw_path.split("?", 1)[1])

    user_name = query.get("user_name", ["সমৰজিৎ"])[0] or "সমৰজিৎ"
    voice = query.get("voice", ["male"])[0] or "male"

    logger.info(f"Client connected: user={user_name}, voice={voice}")
    session = VoiceSession(websocket, user_name=user_name, voice=voice)

    # Send instant greeting
    await session.send_instant_greeting()

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                # Binary audio chunk from Flutter
                session.audio_buffer.extend(message)
            elif isinstance(message, str):
                try:
                    payload = json.loads(message)
                except Exception:
                    continue

                event = payload.get("event")
                if event == "audio_chunk":
                    chunk_data = payload.get("data")
                    if chunk_data:
                        session.audio_buffer.extend(base64.b64decode(chunk_data))

                elif event == "speech_end":
                    # User stopped speaking, process turn
                    if session.current_task and not session.current_task.done():
                        session.current_task.cancel()
                    session.current_task = asyncio.create_task(session.process_speech_turn())

                elif event == "interrupt":
                    await session.handle_interrupt()

                elif event == "ping":
                    await session.send_json({"event": "pong"})

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {user_name}")
    finally:
        if session.current_task and not session.current_task.done():
            session.current_task.cancel()


async def main():
    logger.info(f"Starting Axom AI Live Real-Time Voice Gateway on ws://{HOST}:{PORT}")
    async with websockets.serve(ws_handler, HOST, PORT, ping_interval=20, ping_timeout=20):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
