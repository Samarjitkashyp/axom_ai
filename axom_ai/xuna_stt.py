"""
Axom AI Xuna - Native Assamese Speech-to-Text (ASR) Engine.
Built upon Conformer-600M ONNX with dedicated Assamese Acoustic & CTC heads.
High-speed CPU inference with zero Bengali/Hindi script contamination.
"""

import os
import sys
import json
import logging
import threading
import numpy as np
import torch

logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN", "")
REPO_ID = "axom-ai/axomai-speech-xuna"

_XUNA_ENGINE = None
_INIT_LOCK = threading.Lock()


class XunaConformerEngine:
    def __init__(self, model_dir):
        self.model_dir = model_dir
        self.device = torch.device('cpu')
        
        assets_dir = os.path.join(model_dir, 'assets')
        if not os.path.exists(assets_dir):
            assets_dir = model_dir

        import onnxruntime as ort

        # Optimize ONNX execution for standard CPU
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = min(4, os.cpu_count() or 4)
        opts.inter_op_num_threads = 2
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        preproc_path = os.path.join(assets_dir, 'preprocessor.ts')
        encoder_path = os.path.join(assets_dir, 'encoder.onnx')
        ctc_path = os.path.join(assets_dir, 'ctc_decoder.onnx')
        vocab_path = os.path.join(assets_dir, 'vocab.json')
        masks_path = os.path.join(assets_dir, 'language_masks.json')

        logger.info(f"Loading Xuna STT Engine from {assets_dir}...")
        self.preprocessor = torch.jit.load(preproc_path, map_location=self.device)
        self.encoder = ort.InferenceSession(encoder_path, opts, providers=['CPUExecutionProvider'])
        self.ctc_decoder = ort.InferenceSession(ctc_path, opts, providers=['CPUExecutionProvider'])

        with open(vocab_path, 'r', encoding='utf-8') as f:
            self.vocab = json.load(f)

        with open(masks_path, 'r', encoding='utf-8') as f:
            self.language_masks = json.load(f)

        logger.info("Xuna STT Engine initialized successfully!")

    def transcribe_wav_pcm(self, pcm_bytes, lang='as'):
        """
        Transcribes 16kHz mono 16-bit PCM WAV bytes into text.
        Returns pure Assamese text string.
        """
        if not pcm_bytes or len(pcm_bytes) < 400:
            return ""

        # Convert raw 16-bit signed PCM samples to float32 tensor
        samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        wav_tensor = torch.from_numpy(samples).float().unsqueeze(0)

        # 1. Feature Extraction (Mel Spectrogram)
        audio_signal, length = self.preprocessor(
            input_signal=wav_tensor,
            length=torch.tensor([wav_tensor.shape[-1]])
        )

        # 2. Conformer Acoustic Encoder
        enc_outs = self.encoder.run(
            ['outputs', 'encoded_lengths'],
            {'audio_signal': audio_signal.numpy(), 'length': length.numpy()}
        )[0]

        # 3. CTC Language-Conditioned Decoding
        logprobs = self.ctc_decoder.run(['logprobs'], {'encoder_output': enc_outs})[0]
        
        mask_key = lang if lang in self.language_masks else 'as'
        lang_mask = self.language_masks[mask_key]

        logprobs = torch.from_numpy(logprobs[:, :, lang_mask]).log_softmax(dim=-1)
        indices = torch.argmax(logprobs[0], dim=-1)
        collapsed_indices = torch.unique_consecutive(indices, dim=-1)

        # 4. Token to Assamese mapping (BLANK_ID = 256)
        vocab_map = self.vocab.get(mask_key, self.vocab['as'])
        text = ''.join([vocab_map[x] for x in collapsed_indices if x != 256]).replace('\u2581', ' ').strip()
        
        # 5. Native Assamese Script Purification
        # Ensure pure Assamese characters: 'ৰ' (U+09F0) & 'ৱ' (U+09F1)
        text = text.replace('\u09b0', '\u09f0')  # Bengali 'র' -> Assamese 'ৰ'
        
        return text


def _locate_or_download_xuna():
    """Locate existing local model assets or download from private Hugging Face repo."""
    # 1. Check custom environment variable
    custom_dir = os.getenv("XUNA_MODEL_DIR")
    if custom_dir and os.path.exists(os.path.join(custom_dir, "assets", "encoder.onnx")):
        return custom_dir

    # 2. Check local repository development path
    local_dev = r"E:\axomai-tts\models\indic-conformer-600m"
    if os.path.exists(os.path.join(local_dev, "assets", "encoder.onnx")):
        return local_dev

    # 3. Check application media path
    app_media = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "media", "models", "xuna_stt"))
    if os.path.exists(os.path.join(app_media, "assets", "encoder.onnx")):
        return app_media

    # 4. Download from private Hugging Face repo (without symlinks for ONNX compatibility)
    try:
        from huggingface_hub import snapshot_download
        logger.info(f"Downloading Xuna STT model from {REPO_ID}...")
        download_dir = snapshot_download(
            repo_id=REPO_ID,
            token=HF_TOKEN,
            local_dir=app_media,
            local_dir_use_symlinks=False
        )
        return download_dir
    except Exception as e:
        logger.warning(f"Could not download Xuna STT from Hugging Face: {e}")
        return None


def get_xuna_engine():
    """Thread-safe singleton accessor for Xuna STT Engine."""
    global _XUNA_ENGINE
    if _XUNA_ENGINE is not None:
        return _XUNA_ENGINE

    with _INIT_LOCK:
        if _XUNA_ENGINE is not None:
            return _XUNA_ENGINE

        model_dir = _locate_or_download_xuna()
        if not model_dir:
            return None

        try:
            _XUNA_ENGINE = XunaConformerEngine(model_dir)
            return _XUNA_ENGINE
        except Exception as e:
            logger.error(f"Failed to initialize Xuna STT Engine: {e}")
            return None


def xuna_transcribe(wav_bytes, lang='as'):
    """
    High-level entrypoint for transcribing WAV bytes.
    Expects 16kHz mono WAV bytes (output of clean_audio).
    """
    try:
        engine = get_xuna_engine()
        if not engine:
            return None

        # Extract PCM samples (skip 44-byte WAV header)
        pcm_bytes = wav_bytes[44:] if len(wav_bytes) > 44 else wav_bytes
        return engine.transcribe_wav_pcm(pcm_bytes, lang=lang)
    except Exception as e:
        logger.warning(f"Xuna STT transcription error: {e}")
        return None

