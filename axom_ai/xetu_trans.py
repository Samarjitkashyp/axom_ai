"""
Axom AI Xetu - Sovereign English <-> Assamese Neural Translation Engine.
Powered by axom-ai/axomai-trans-xetu (IndicTrans2 distilled 200M Transformer).
High-precision grammar, authentic Assamese inflections, and zero Bengali contamination.
"""

import os
import re
import sys
import time
import logging
import threading
from functools import lru_cache
import torch

logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN", "")
REPO_ID = "axom-ai/axomai-trans-xetu"

_XETU_ENGINE = None
_INIT_LOCK = threading.Lock()

# Thread-safe in-memory cache for fast repeated translations (e.g. greetings, common UI phrases)
_TRANSLATION_CACHE = {}
_CACHE_LOCK = threading.Lock()
_MAX_CACHE_SIZE = 1000


def _patch_indictrans_files_if_needed(model_dir):
    """
    Ensures compatibility between IndicTrans2 custom modeling code and modern transformers (>=4.36 / 5.x).
    Fixes:
      1. transformers.onnx removal in configuration_indictrans.py
      2. _special_tokens_map initialization in tokenization_indictrans.py
      3. tie_weights signature (*args, **kwargs) and _tie_weights in modeling_indictrans.py
    """
    try:
        cfg_file = os.path.join(model_dir, 'configuration_indictrans.py')
        if os.path.exists(cfg_file):
            with open(cfg_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if "from transformers.onnx import" in content:
                content = content.replace(
                    "from transformers.onnx import OnnxConfig, OnnxSeq2SeqConfigWithPast\nfrom transformers.onnx.utils import compute_effective_axis_dimension",
                    "try:\n    from transformers.onnx import OnnxConfig, OnnxSeq2SeqConfigWithPast\n    from transformers.onnx.utils import compute_effective_axis_dimension\nexcept Exception:\n    OnnxConfig = object\n    OnnxSeq2SeqConfigWithPast = object\n    compute_effective_axis_dimension = None"
                )
                with open(cfg_file, 'w', encoding='utf-8') as f:
                    f.write(content)

        tok_file = os.path.join(model_dir, 'tokenization_indictrans.py')
        if os.path.exists(tok_file):
            with open(tok_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if "self._special_tokens_map = {}" not in content and "self.src_vocab_fp = src_vocab_fp" in content:
                content = content.replace(
                    "self.src_vocab_fp = src_vocab_fp",
                    "self._special_tokens_map = {}\n        self.src_vocab_fp = src_vocab_fp",
                    1
                )
                with open(tok_file, 'w', encoding='utf-8') as f:
                    f.write(content)

        mod_file = os.path.join(model_dir, 'modeling_indictrans.py')
        if os.path.exists(mod_file):
            with open(mod_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if "# AXOM_TIED_WEIGHTS_PATCHED" not in content:
                content = re.sub(
                    r'    def tie_weights\([^\)]*\):[\s\S]*?(?=\n    def get_encoder)',
                    '''    def tie_weights(self, *args, **kwargs):
        # AXOM_TIED_WEIGHTS_PATCHED
        if getattr(self.config, 'share_decoder_input_output_embed', False):
            try:
                self.lm_head.weight = self.model.decoder.embed_tokens.weight
            except Exception:
                pass''',
                    content
                )
                with open(mod_file, 'w', encoding='utf-8') as f:
                    f.write(content)
    except Exception as e:
        logger.warning(f"Note on IndicTrans compatibility patching: {e}")


def _locate_or_download_xetu():
    """Locates existing local model assets or downloads from private Hugging Face repo."""
    # 1. Check custom environment variable
    custom_dir = os.getenv("XETU_MODEL_DIR")
    if custom_dir and os.path.exists(os.path.join(custom_dir, "model.safetensors")):
        _patch_indictrans_files_if_needed(custom_dir)
        return custom_dir

    # 2. Check application media path
    app_media = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "media", "models", "xetu_trans"))
    if os.path.exists(os.path.join(app_media, "model.safetensors")):
        _patch_indictrans_files_if_needed(app_media)
        return app_media

    # 3. Check Linux home deployment path
    linux_path = "/home/admin/axom_ai/media/models/xetu_trans"
    if os.path.exists(os.path.join(linux_path, "model.safetensors")):
        _patch_indictrans_files_if_needed(linux_path)
        return linux_path

    # 4. Download from private Hugging Face repo
    try:
        from huggingface_hub import snapshot_download
        logger.info(f"Downloading Xetu Translation model from {REPO_ID}...")
        download_dir = snapshot_download(
            repo_id=REPO_ID,
            token=HF_TOKEN,
            local_dir=app_media,
            local_dir_use_symlinks=False
        )
        _patch_indictrans_files_if_needed(download_dir)
        return download_dir
    except Exception as e:
        logger.warning(f"Could not download Xetu Translation model: {e}")
        return None


class XetuTranslationEngine:
    """Thread-safe singleton engine for English -> Assamese Translation."""

    def __init__(self, model_dir):
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator

        self.transliterator = UnicodeIndicTransliterator
        self.device = torch.device("cpu")

        # Optimize PyTorch CPU inference threads
        torch.set_num_threads(min(4, os.cpu_count() or 4))

        logger.info(f"Loading Xetu Translation Engine from {model_dir}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir, trust_remote_code=True)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir, trust_remote_code=True)
        self.model.eval()
        logger.info("Xetu Translation Engine loaded successfully!")

    def translate_sentence(self, sentence: str) -> str:
        """Translates a single English sentence to pure Assamese."""
        if not sentence or not sentence.strip():
            return sentence

        s = sentence.strip()

        # Check Cache
        with _CACHE_LOCK:
            if s in _TRANSLATION_CACHE:
                return _TRANSLATION_CACHE[s]

        # Prepare IndicTrans input format: 'src_lang tgt_lang text'
        formatted_input = f"eng_Latn asm_Beng {s}"
        inputs = self.tokenizer([formatted_input], return_tensors="pt", padding=True)

        with torch.inference_mode():
            # Greedy search (num_beams=1) with use_cache=False for low-latency CPU inference
            outputs = self.model.generate(
                **inputs,
                max_length=256,
                num_beams=1,
                use_cache=False
            )

        raw_deva = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

        # Transliterate internal Devanagari representation into authentic Assamese script
        as_text = self.transliterator.transliterate(raw_deva, "hi", "as")

        # Native Assamese Orthography Guard: Convert any rogue Bengali 'র' to Assamese 'ৰ'
        clean_as = as_text.replace('\u09b0', '\u09f0')

        # Store in cache
        with _CACHE_LOCK:
            if len(_TRANSLATION_CACHE) < _MAX_CACHE_SIZE:
                _TRANSLATION_CACHE[s] = clean_as

        return clean_as


def get_xetu_engine():
    """Thread-safe singleton accessor for Xetu Translation Engine."""
    global _XETU_ENGINE
    if _XETU_ENGINE is not None:
        return _XETU_ENGINE

    with _INIT_LOCK:
        if _XETU_ENGINE is not None:
            return _XETU_ENGINE

        model_dir = _locate_or_download_xetu()
        if not model_dir:
            return None

        try:
            _XETU_ENGINE = XetuTranslationEngine(model_dir)
            return _XETU_ENGINE
        except Exception as e:
            logger.error(f"Failed to initialize Xetu Translation Engine: {e}")
            return None


def xetu_translate_en_to_as(text: str) -> str:
    """
    Public entrypoint for English -> Assamese text translation.
    Handles paragraphs by translating sentence-by-sentence to maintain high quality.
    """
    if not text or not text.strip():
        return text

    engine = get_xetu_engine()
    if not engine:
        return text

    try:
        # Split into paragraphs to preserve layout/markdown
        paragraphs = text.split("\n")
        translated_paragraphs = []

        for p in paragraphs:
            if not p.strip():
                translated_paragraphs.append("")
                continue

            # If line is code block or pure markdown header/separator, preserve
            if p.strip().startswith("```") or p.strip().startswith("---"):
                translated_paragraphs.append(p)
                continue

            # Split paragraph into sentences (. / ? / !)
            sentences = re.split(r'(?<=[.?!])\s+', p)
            translated_sentences = []
            for s in sentences:
                if s.strip():
                    translated_sentences.append(engine.translate_sentence(s))
                else:
                    translated_sentences.append(s)

            translated_paragraphs.append(" ".join(translated_sentences))

        return "\n".join(translated_paragraphs)
    except Exception as e:
        logger.warning(f"Xetu translation fallback: {e}")
        return text


def xetu_stream_sentence_buffer(chunk_generator):
    """
    Real-time sentence buffering streamer for live chat:
    Accumulates incoming English LLM chunks into complete sentences.
    As soon as a sentence is complete (. ? ! or newline), it translates it via Xetu
    and yields the pure Assamese sentence immediately!
    """
    engine = get_xetu_engine()
    if not engine:
        # If Xetu is unavailable, pass-through generator
        for chunk in chunk_generator:
            yield chunk
        return

    buffer = ""
    in_code_block = False

    for chunk in chunk_generator:
        buffer += chunk

        # Track code blocks: do not translate programming code
        if "```" in chunk:
            in_code_block = not in_code_block

        if in_code_block:
            # Yield code directly without translation
            yield chunk
            buffer = ""
            continue

        # Check if we have one or more complete sentences or newlines in the buffer
        # Matches sentence boundaries: (punct followed by space, or newline)
        split_pos = -1
        for match in re.finditer(r'([.?!]\s+|\n+)', buffer):
            split_pos = match.end()

        if split_pos > 0:
            ready_part = buffer[:split_pos]
            buffer = buffer[split_pos:]

            # Translate the completed sentence segment
            try:
                translated = xetu_translate_en_to_as(ready_part)
                yield translated
            except Exception as e:
                logger.warning(f"Sentence translation error: {e}")
                yield ready_part

    # Flush any remaining text in buffer
    if buffer.strip():
        try:
            yield xetu_translate_en_to_as(buffer)
        except Exception:
            yield buffer
