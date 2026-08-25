# 🧠 Axom AI — Free Model Training Guide (Hindi)

Apne model ko **free me train (fine-tune)** karne ka poora tarika. Train cloud pe (free GPU),
chalao apne PC pe.

---

## Kya-kya files hain
| File | Kaam |
|------|------|
| `axom_finetune.ipynb` | Ready notebook — Kaggle/Colab me chalao |
| `sample_data.jsonl` | Data ka example format — isi tarah apna data banao |
| `README_TRAINING.md` | Yeh guide |

---

## Step 1 — Apna data banao (sabse zaroori)
`sample_data.jsonl` kholo. Har line ek example hai:
```json
{"instruction": "sawal yahan", "output": "jawab yahan"}
```
Apni `data.jsonl` banao — jitne zyada + achhe examples (100-1000+), utna behtar model.
Yehi woh "knowledge/style" hai jo model seekhega.

## Step 2 — Kaggle account (free)
1. https://www.kaggle.com par free account banao (phone verify karo — GPU ke liye zaroori).
2. **Code → New Notebook** kholo.
3. Upar **File → Import Notebook** → `axom_finetune.ipynb` upload karo.
4. Right panel → **Settings → Accelerator → GPU T4 x2** (ya P100) on karo.

> Colab bhi chalega (colab.research.google.com), par Kaggle zyada free hours (30/week) deta hai.

## Step 3 — Apna data upload karo
- Kaggle: right panel → **+ Add Input → Upload** → apni `data.jsonl` daalo.
  (Notebook me `DATA_PATH` us file ke path se match karao — cell 4 me likha hai.)
- Colab: left me folder icon → upload `data.jsonl`.

## Step 4 — Run All
Notebook me upar **Run All** dabao. Yeh apne aap:
1. Unsloth install karega
2. Base model (Llama-3.2-1B) load karega
3. Tumhare data pe train karega (chhote data pe ~5-15 min)
4. Test karega
5. **GGUF file** banayega (Ollama-ready)

## Step 5 — GGUF download karo
Aakhri cell `.gguf` file ka path print karega (jaise `axom_model.Q4_K_M.gguf`).
Us par right-click → **Download** (Kaggle me Output section me milegा).

## Step 6 — Apne PC ke Ollama me chalao
1. Downloaded `.gguf` file ko ek folder me rakho.
2. Usi folder me ek file banao naam **`Modelfile`** (koi extension nahi), andar:
   ```
   FROM ./axom_model.Q4_K_M.gguf
   ```
3. Terminal me:
   ```
   ollama create axom -f Modelfile
   ```
4. Axom AI project ke `.env` me:
   ```
   OLLAMA_MODEL=axom
   ```
5. Django restart:
   ```
   python manage.py runserver
   ```

🎉 Ab tumhara **apna fine-tuned model** Axom AI me chal raha hai!

---

## ⚠️ Important
- **Train vs RAG:** Agar sirf documents se jawab chahiye, to train ki zaroorat nahi —
  admin panel me PDF/DOCX upload karo (RAG). Fine-tuning tab karo jab model ka
  **behaviour/style/tone** ya deeply-embedded knowledge chahiye.
- **Data quality = model quality.** Kam par achhe examples > bahut saare ghatiya examples.
- Base model badalna ho to notebook cell 2 me `unsloth/Qwen2.5-1.5B-Instruct` etc. try karo.
