# AXOM AI — System Architecture & Agent Rules

This file documents the core development principles, architecture patterns, and LLM prioritization rules for the **Axom AI** codebase. **Always follow these rules across all future tasks.**

---

## 1. 🧠 Mandatory LLM Model Hierarchy & Fallback Rule

Whenever calling AI/LLM models for tools (including AI Notes Generator, Chat, Summarization, and Document Processing), you **MUST** follow this strict priority chain:

### **Tier 1: OpenAI (Primary — Strong Model First with Step-by-Step Cascade)**
* **Strongest Model First:** Always query OpenAI's strongest flagship model first (**`gpt-4o`**).
* **Step-by-Step Cascade:** If `gpt-4o` is exhausted, rate-limited, or fails, step down sequentially:
  1. `gpt-4o` (Flagship pedagogical & reasoning model)
  2. `o3-mini` (High-reasoning STEM/math model)
  3. `gpt-4o-mini` (High-speed efficient model)
  4. Active rotation models configured in `model_router` (`ModelProvider` table)
* **DO NOT** immediately fall back to Google Gemini on a single OpenAI model error. Only move to Tier 2 when **all** active OpenAI models fail or are exhausted.

### **Tier 2: Google Gemini (Secondary Fallback)**
* Only triggered if Tier 1 (all OpenAI models) is exhausted or unavailable.
* Cascade order:
  1. `gemini-2.5-flash`
  2. `gemini-1.5-flash`
  3. `gemini-flash-latest`
* Handles large document context and native Indic regional language processing.

### **Tier 3: Groq Cloud (Tertiary — Ultra-Fast Safety Net)**
* Only triggered if both Tier 1 (OpenAI) and Tier 2 (Gemini) fail.
* Model: `llama-3.3-70b-versatile`.
* Serves as an instant, sub-second failover to guarantee the user never encounters a 500/504 timeout error.

---

## 2. 🎓 AI Notes Generator Architecture

* **Dedicated Frontend Page:** `/tools/ai-notes-generator` (`next-frontend/app/tools/ai-notes-generator/page.tsx`)
* **Interactive Client Component:** `next-frontend/components/tools/AiNotesGenerator.tsx`
* **Backend Module:** `axom_ai/ai_notes_views.py`
* **Django Endpoints:**
  * `POST /api/ai-notes/analyze/` — Document inspection (Pages, Size MB, Word count, Structure check)
  * `POST /api/ai-notes/generate/` — Pedagogical notes generation (with Table of Contents, definitions, formulas, exam points ⭐)
  * `POST /api/ai-notes/refine/` — In-place AI refinements (Shorter, Longer, Simpler, Add Examples, Add Exam Points, Translate)
  * `POST /api/ai-notes/ask/` — Contextual doubt-clearing Q&A grounded in notes
  * `POST /api/ai-notes/study-tools/` — Flashcards, MCQ Quizzes, Exam Practice Questions, and Mermaid Mind Maps
  * `POST /api/ai-notes/export-docx/` — Server-side formatted Microsoft Word `.docx` generation
* **Export Standards:**
  * Microsoft Word: `.docx` via `python-docx` with Axom AI header branding and clean headings.
  * PDF: Direct vector print via specialized `@media print` CSS stylesheet ensuring crisp layout without navbar or sidebars.
* **Multilingual Orthography:**
  * Assamese text must be purified with `_purify_assamese_with_grammar` (correcting Bengali script contamination `র` $\rightarrow$ `ৰ`).
  * Technical terminology (e.g. *Photosynthesis*, *Mitochondria*, *Newton's Laws*) must remain in English when requested.

---

## 3. 🚀 Deployment & Service Reference

* **AWS Lightsail Static IP:** `3.6.237.64` (User: `admin`)
* **SSH Key Path:** `E:\aws-intansec\Nginx-5\LightsailDefaultKey-ap-south-1.pem`
* **Services:**
  * Django Gunicorn: `sudo systemctl restart axom.service`
  * Next.js SSR Frontend: `sudo systemctl restart axom-next.service`
  * Celery Worker: `axom-celery.service`
  * Nginx: `nginx.service`
* **Build Step:** Always verify Next.js builds with `npm run build` inside `next-frontend` and verify Django syntax with `.\venv\Scripts\python.exe manage.py check`.
