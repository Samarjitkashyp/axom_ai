# -*- coding: utf-8 -*-
"""Axom AI Assamese text-to-speech service (AI4Bharat Indic-TTS: FastPitch + HiFi-GAN, MIT licence).

Listens on 127.0.0.1 only; the Django site (/api/tts/) is its only caller. One sentence per request:
    POST /tts   {"text": "...", "voice": "male" | "female"}   ->  audio/mpeg
Runs as the isolated `tts` user. One sentence is spoken at a time (the server has 2 CPU cores): the others wait in a short queue, and a full
queue answers 503 so that the site is never slowed down. The same sentence is spoken once; the audio is kept on disk (cache).
"""
import asyncio
import hashlib
import os
import re
import subprocess
import tempfile
import time
import logging
from typing import Optional

import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

log = logging.getLogger("axom-tts")
logging.basicConfig(level=logging.INFO)

BASE = os.environ.get("TTS_BASE", "/srv/axom-tts")
MODEL = BASE + "/models/as"
CACHE = BASE + "/cache"
VERSION = "v1"                  # change it when the voice, the speed or the text rules change: the cache starts again
LENGTH_SCALE = 1.12             # a little slower than the model's own speed: clearer
MAX_CHARS = 400
MAX_QUEUE = int(os.environ.get("TTS_MAX_QUEUE", "6"))
FFMPEG = "/usr/bin/ffmpeg"
VOICES = ("male", "female")

# noise and rumble out, silence at both ends trimmed, even loudness, a little air at the ends (the chain that was chosen from the samples)
CHAIN = ("highpass=f=70,"
         "afftdn=nr=10:nf=-45:tn=0,"
         "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,"
         "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse,"
         "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,"
         "loudnorm=I=-16:TP=-1.5:LRA=9,"
         "adelay=100:all=1,apad=pad_dur=0.2")

# ---------------------------------------------------------------- the text
ASSAMESE_DIGITS = {"০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"}
DIGIT_WORDS = {"0": "শূন্য", "1": "এক", "2": "দুই", "3": "তিনি", "4": "চাৰি", "5": "পাঁচ", "6": "ছয়", "7": "সাত", "8": "আঠ", "9": "ন"}
EMOJI = re.compile("[\U0001F000-\U0001FFFF☀-➿️‍⭐⬆↔-↪⌀-⏿]")


def _digits(m: "re.Match") -> str:
    return " ".join(DIGIT_WORDS[c] for c in m.group(0))


def prepare(text: str) -> str:
    """The text as the model can speak it: markdown, links, emoji out; the danda is a full stop (the model has no danda: it was dropped and the
    pause was lost); numbers are read digit by digit (the model has no digits); English letters are dropped (the model has none)."""
    t = text or ""
    t = re.sub(r"```.*?```", " ", t, flags=re.S)                   # code blocks are not read
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", t)                    # pictures
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)                 # [text](link) -> text
    t = re.sub(r"https?://\S+|www\.\S+", " ", t)
    t = re.sub(r"[*_#>~|]+", " ", t)
    t = re.sub(r"(?m)^\s*[-+•]\s+", "", t)
    t = EMOJI.sub(" ", t)
    for a, d in ASSAMESE_DIGITS.items():
        t = t.replace(a, d)
    t = re.sub(r"(\d)\.(\d)", lambda m: m.group(1) + " দশমিক " + m.group(2), t)
    t = t.replace("%", " শতাংশ ")
    t = re.sub(r"\d", lambda m: " " + DIGIT_WORDS[m.group(0)] + " ", t)
    t = re.sub(r"[A-Za-z]+", " ", t)
    t = t.replace("।", ".").replace("॥", ".").replace("!", ".")
    t = re.sub(r"[\"“”‘’«»()\[\]{}<>/\\@&=+^:;]", " ", t)
    t = re.sub(r"\s*([,.?])\s*", r"\1 ", t)
    t = re.sub(r"([,.?]\s*){2,}", lambda m: m.group(0).strip()[0] + " ", t)
    t = re.sub(r"\s+", " ", t).strip(" ,-")
    if not re.search(r"[ঀ-৿]", t):                       # no Assamese letters left: nothing to say
        return ""
    if t and t[-1] not in ".?":
        t += "."
    return t


# ---------------------------------------------------------------- the model
_syn = None
_lock = asyncio.Lock()          # one sentence at a time
_waiting = 0


def load_model():
    global _syn
    from TTS.utils.synthesizer import Synthesizer
    torch.set_num_threads(2)
    cfg = open(MODEL + "/fastpitch/config.json", encoding="utf-8").read().replace("models/v1/as/fastpitch/speakers.pth", MODEL + "/fastpitch/speakers.pth")
    local_cfg = MODEL + "/fastpitch/config.local.json"
    open(local_cfg, "w", encoding="utf-8").write(cfg)
    t0 = time.time()
    _syn = Synthesizer(tts_checkpoint=MODEL + "/fastpitch/slim_model.pth", tts_config_path=local_cfg, tts_speakers_file=MODEL + "/fastpitch/speakers.pth",
                       vocoder_checkpoint=MODEL + "/hifigan/slim_model.pth", vocoder_config=MODEL + "/hifigan/config.json", use_cuda=False)
    _syn.tts_model.length_scale = LENGTH_SCALE
    log.info("Assamese voice loaded in %.1fs", time.time() - t0)


def _synthesize(text: str, voice: str) -> bytes:
    wav = _syn.tts(text, speaker_name=voice)
    with tempfile.TemporaryDirectory(dir=BASE + "/tmp") as d:
        raw, out = d + "/raw.wav", d + "/out.mp3"
        sf.write(raw, wav, _syn.output_sample_rate)
        r = subprocess.run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-af", CHAIN, "-ar", "44100", "-ac", "1",
                            "-codec:a", "libmp3lame", "-b:a", "96k", out], capture_output=True, text=True, timeout=60)
        if r.returncode or not os.path.exists(out):
            raise RuntimeError("ffmpeg: " + r.stderr[-200:])
        with open(out, "rb") as f:
            return f.read()


def _cache_path(text: str, voice: str) -> str:
    h = hashlib.sha256(("%s|%s|%s" % (VERSION, voice, text)).encode("utf-8")).hexdigest()
    return "%s/%s/%s.mp3" % (CACHE, h[:2], h)


# ---------------------------------------------------------------- the API
app = FastAPI(title="Axom AI Assamese TTS", docs_url=None, redoc_url=None, openapi_url=None)


class Req(BaseModel):
    text: str
    voice: Optional[str] = "male"
    cache_only: bool = False        # only play back what was already made (a person whose daily limit is used up)


@app.on_event("startup")
async def startup():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(BASE + "/tmp", exist_ok=True)
    await asyncio.get_running_loop().run_in_executor(None, load_model)


@app.get("/health")
async def health():
    return {"ok": _syn is not None, "waiting": _waiting, "version": VERSION}


@app.post("/tts")
async def tts(req: Req):
    global _waiting
    voice = req.voice if req.voice in VOICES else "male"
    text = prepare(req.text)
    if not text or not re.search(r"[ঀ-৿]", text):
        raise HTTPException(status_code=422, detail="Nothing to read in Assamese.")
    if len(text) > MAX_CHARS:
        raise HTTPException(status_code=413, detail="Text too long (%d characters at most)." % MAX_CHARS)
    path = _cache_path(text, voice)
    if os.path.isfile(path):
        with open(path, "rb") as f:
            return Response(f.read(), media_type="audio/mpeg", headers={"X-Cache": "hit"})
    if req.cache_only:
        raise HTTPException(status_code=404, detail="Not made yet.")
    if _syn is None:
        raise HTTPException(status_code=503, detail="The voice is still loading.")
    if _waiting >= MAX_QUEUE:
        raise HTTPException(status_code=503, detail="The voice is busy; try again in a moment.", headers={"Retry-After": "5"})
    _waiting += 1
    try:
        async with _lock:
            if os.path.isfile(path):                         # the same sentence was made while this one waited
                with open(path, "rb") as f:
                    return Response(f.read(), media_type="audio/mpeg", headers={"X-Cache": "hit"})
            t0 = time.time()
            audio = await asyncio.get_running_loop().run_in_executor(None, _synthesize, text, voice)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            tmp = path + ".tmp"
            with open(tmp, "wb") as f:
                f.write(audio)
            os.replace(tmp, path)
            log.info("spoke %d characters in %.1fs", len(text), time.time() - t0)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("synthesis failed")
        raise HTTPException(status_code=500, detail="The voice could not be made (%s)." % type(e).__name__)
    finally:
        _waiting -= 1
    return Response(audio, media_type="audio/mpeg", headers={"X-Cache": "miss"})
