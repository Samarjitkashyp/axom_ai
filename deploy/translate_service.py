"""
IndicTrans2 English -> Assamese translation microservice.

Runs in its OWN virtualenv (transformers 4.x) so it does not conflict with the
Django app's transformers 5.x / bge-m3 stack. Django calls it over localhost
HTTP for Assamese answers that are not already served verbatim from the DB.

Endpoints:
    GET  /health              -> {"ok": true, "ready": bool}
    POST /translate           -> {"translations": [...]}
        body: {"text": "..."}  or  {"texts": ["...", "..."]}

Run (via gunicorn, 1 worker, model loaded once):
    gunicorn -w 1 -b 127.0.0.1:8765 --timeout 180 translate_service:app
"""
import sys
import types

# --- Compatibility shims (harmless if the symbols already exist) --------------
# IndicTransToolkit's collator imports PreTrainedTokenizerBase from the old path.
try:
    import transformers.tokenization_utils as _tu
    if not hasattr(_tu, 'PreTrainedTokenizerBase'):
        from transformers.tokenization_utils_base import PreTrainedTokenizerBase as _PTB
        _tu.PreTrainedTokenizerBase = _PTB
except Exception:
    pass

# IndicTrans2's custom model code imports transformers.onnx (removed in 5.x).
if 'transformers.onnx' not in sys.modules:
    try:
        import transformers.onnx  # noqa: F401  (exists on transformers 4.x)
    except Exception:
        _onnx = types.ModuleType('transformers.onnx')
        class _OnnxConfig:  # noqa: N801
            pass
        class _OnnxSeq2SeqConfigWithPast:  # noqa: N801
            pass
        _onnx.OnnxConfig = _OnnxConfig
        _onnx.OnnxSeq2SeqConfigWithPast = _OnnxSeq2SeqConfigWithPast
        _onnx.__path__ = []
        _ou = types.ModuleType('transformers.onnx.utils')
        _ou.compute_effective_axis_dimension = (
            lambda dimension, fixed_dimension, num_token_to_add=0: fixed_dimension)
        _onnx.utils = _ou
        sys.modules['transformers.onnx'] = _onnx
        sys.modules['transformers.onnx.utils'] = _ou

import torch  # noqa: E402
from flask import Flask, jsonify, request  # noqa: E402
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer  # noqa: E402
from IndicTransToolkit.processor import IndicProcessor  # noqa: E402

MODEL_NAME = 'ai4bharat/indictrans2-en-indic-dist-200M'
SRC_LANG = 'eng_Latn'
TGT_LANG = 'asm_Beng'

app = Flask(__name__)
_tok = None
_model = None
_ip = None


def _lazy_load():
    global _tok, _model, _ip
    if _model is None:
        _tok = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME, trust_remote_code=True)
        _model.eval()
        _ip = IndicProcessor(inference=True)


@app.get('/health')
def health():
    return jsonify(ok=True, ready=_model is not None)


@app.post('/translate')
def translate():
    _lazy_load()
    data = request.get_json(force=True, silent=True) or {}
    texts = data.get('texts')
    if not texts:
        one = data.get('text')
        texts = [one] if one else []
    texts = [t for t in texts if t and t.strip()]
    if not texts:
        return jsonify(translations=[])
    batch = _ip.preprocess_batch(texts, src_lang=SRC_LANG, tgt_lang=TGT_LANG)
    enc = _tok(batch, truncation=True, padding='longest', return_tensors='pt')
    with torch.no_grad():
        gen = _model.generate(**enc, max_length=256, num_beams=5, num_return_sequences=1)
    out = _ip.postprocess_batch(_tok.batch_decode(gen, skip_special_tokens=True), lang=TGT_LANG)
    return jsonify(translations=out)


if __name__ == '__main__':
    _lazy_load()
    app.run(host='127.0.0.1', port=8765)
