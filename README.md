# 🧠 Axom AI

A self-hosted, multilingual AI chat assistant built with **Django + React**. It answers from
your own knowledge base using **semantic search (BAAI/bge-m3)**, runs a **local LLM (Ollama)**
offline with a **Google Gemini** fallback, and replies in **English, Hinglish, or Assamese**.

> 🌐 **Live demo:** http://3.6.237.64:8000 &nbsp;·&nbsp; deployed on AWS Lightsail with an automated CI/CD pipeline.

---

## ✨ Features

- 💬 **ChatGPT-style chat** — token-by-token streaming with a typing indicator
- 🎯 **Accurate, no hallucination** — answers come verbatim from your knowledge base; the model
  is told never to invent names/dates/facts and to say "not certain" instead
- 🌏 **Multilingual replies** — pick **English / Hinglish / অসমীয়া (Assamese)** per message
- 🔎 **Semantic search (bge-m3)** — matches questions by *meaning*, across wording and language
  ("When is Bihu?" ↔ "Rongali Bihu kya hai?")
- ⚡ **Instant answers** — exact keyword matches return in milliseconds, no model call
- 🧠 **Conversation memory** — follow-ups ("aur batao", "detail me") keep context (token-budget window)
- 📚 **Knowledge base** — upload PDF, DOCX, Excel, CSV, TXT, or **JSONL** (Q&A) from the admin panel
- 🗂️ **Chat management** — pin / delete via a 3-dot menu, archive old chats, dedicated **Settings** page
- 🔐 **Secure admin panel** — staff-only document management
- 🛡️ **Production-ready** — per-IP rate limiting, health endpoint, storage limits + auto-cleanup
- 📱 **Responsive + theming** — mobile layout, dark/light theme toggle
- 🖥️ **Runs on modest hardware** — small local models work on CPU-only machines

### How an answer is produced

```
User question  (+ chosen reply language)
   │
   ├─ 1. INSTANT       → exact keyword match to a stored Q&A?    → verbatim (0 ms)
   │
   ├─ 2. SEMANTIC      → closest meaning match (bge-m3 ≥ threshold)? → verbatim from the data
   │        └─ language routing: verified Assamese record → used directly;
   │           Hinglish → verbatim; English/Assamese → translated (facts kept exact)
   │
   └─ 3. MODEL         → nothing in the KB → local Ollama (offline) or Gemini,
            answering in the chosen language and refusing to invent specific facts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2 (Python) |
| Frontend | React 19 + Vite |
| Database | PostgreSQL |
| Semantic search | `BAAI/bge-m3` via sentence-transformers (multilingual embeddings) |
| Local LLM | Ollama (`qwen2.5:0.5b` / `llama3.2:1b`, or your own fine-tuned model) |
| Cloud LLM | Google Gemini API (streaming, translation, fallback) |
| Doc parsing | pypdf, python-docx, openpyxl, Pillow |
| Serving | Gunicorn + WhiteNoise |

---

## 📋 Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js 18+](https://nodejs.org/) (only to rebuild the frontend)
- [Ollama](https://ollama.com/download) (for the local model — optional if you use Gemini only)

---

## ⚡ Quick Start (copy-paste)

```bash
# 1. clone + enter
git clone https://github.com/Samarjitkashyp/axom_ai.git
cd axom_ai

# 2. python env + dependencies  (installs Django, bge-m3, etc.)
python -m venv venv
venv\Scripts\activate            # Windows   (mac/linux: source venv/bin/activate)
pip install -r requirements.txt

# 3. create the PostgreSQL database (run once in psql)
#    CREATE DATABASE axom_ai;
#    CREATE USER axom_user WITH PASSWORD 'your_db_password';
#    ALTER DATABASE axom_ai OWNER TO axom_user;

# 4. config
copy .env.example .env           # Windows   (mac/linux: cp .env.example .env)
#    then edit .env → set SECRET_KEY, DB_PASSWORD, GEMINI_API_KEY

# 5. database tables + admin login
python manage.py migrate
python manage.py createsuperuser

# 6. local model (optional — skip if USE_LOCAL_LLM=False)
ollama pull qwen2.5:0.5b

# 7. run
python manage.py runserver
```

Then open **http://127.0.0.1:8000/**. To load knowledge: go to **/admin-panel/**, upload a
`.jsonl` file, then run `python manage.py backfill_embeddings` so semantic search works.

> The first time semantic search runs, **bge-m3 (~2 GB)** downloads automatically and loads into
> RAM (needs ~2–3 GB free). The first query is slow; after that it's fast.

The detailed, explained version of every step is below.

---

## 🚀 Setup — Step by Step

### 1. Clone
```bash
git clone https://github.com/Samarjitkashyp/axom_ai.git
cd axom_ai
```

### 2. Virtual environment + dependencies
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
> This installs `sentence-transformers` (for bge-m3). The model (~2 GB) downloads automatically
> the first time semantic search runs.

### 3. PostgreSQL
```sql
CREATE DATABASE axom_ai;
CREATE USER axom_user WITH PASSWORD 'your_db_password';
ALTER DATABASE axom_ai OWNER TO axom_user;
```

### 4. Environment variables
```bash
cp .env.example .env
```
Edit `.env` — at minimum: `SECRET_KEY`, `DB_*`, and `GEMINI_API_KEY`
(free key: https://aistudio.google.com/apikey). See **Configuration** below for all options.

> ⚠️ Never commit your real `.env` — it's already in `.gitignore`.

### 5. Migrate + admin user
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Local model (optional — for offline replies)
```bash
ollama pull qwen2.5:0.5b     # fast, low-end PCs
# or  ollama pull llama3.2:1b
```
Set `OLLAMA_MODEL` in `.env`. To run Gemini-only, set `USE_LOCAL_LLM=False`.

### 7. (Optional) Rebuild the frontend
A prebuilt bundle is committed in `static/dist/`, so the app runs without this. Only if you
change React code in `frontend/`:
```bash
cd frontend && npm install && npm run build && cd ..
```

### 8. Run
```bash
python manage.py runserver
```

| Page | URL |
|------|-----|
| 💬 Chat | http://127.0.0.1:8000/ |
| 🔐 Admin panel | http://127.0.0.1:8000/admin-panel/ |
| ⚙️ Django admin | http://127.0.0.1:8000/admin/ |
| ❤️ Health check | http://127.0.0.1:8000/health/ |

---

## 📖 Usage

### Chatting
Type a question and pick a **reply language** (English / Hinglish / অসমীয়া) below the input.
Answers stream in live. Follow-ups keep context.

### Adding knowledge
1. Open **/admin-panel/** and log in as a staff user.
2. Upload **PDF, DOCX, Excel, CSV, TXT, or JSONL**.
3. Content is parsed into Q&A pairs / chunks and embedded for semantic search.

**JSONL format** (best — powers instant + semantic answers):
```json
{"instruction": "What is the capital of Assam?", "output": "The capital of Assam is Dispur."}
```
For verified Assamese answers, set `answer_assamese` on a `QAPair` (via Django admin) — it is then
used directly for Assamese replies instead of translation.

### Embeddings
After uploading data, generate embeddings so semantic search works:
```bash
python manage.py backfill_embeddings   # dedupes, trims paraphrases, embeds with bge-m3
```

---

## ⚙️ Configuration (`.env`)

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` | Django basics |
| `DB_*` | PostgreSQL connection |
| `GEMINI_API_KEY` | Gemini (streaming, translation, fallback) |
| `USE_LOCAL_LLM` | `True` = local Ollama first; `False` = Gemini only |
| `OLLAMA_MODEL` / `OLLAMA_*` | local model + performance knobs |
| `SEMANTIC_THRESHOLD` | min similarity to accept a KB match (default 0.72) |
| `STRICT_KB_MODE` | `True` = say "don't know" when not in KB; `False` = general answers |
| `CHAT_RATE_LIMIT` / `CHAT_RATE_WINDOW` | per-IP rate limit |
| `MEMORY_CHAR_BUDGET` | conversation context size |
| `MAX_MSGS_PER_SESSION` / `MAX_SESSIONS_PER_KEY` | storage limits |

---

## 🎓 Train your own model (free)

Fine-tune a small model on your data using a **free GPU** on Kaggle/Colab, then run it locally.
See **[training/README_TRAINING.md](training/README_TRAINING.md)** (ready-to-run notebook + sample data).

After training you get a `.gguf` — load it into Ollama:
```bash
# in a folder with your .gguf, create a file "Modelfile":  FROM ./your-model.Q4_K_M.gguf
ollama create axom-custom -f Modelfile
```
Then set `OLLAMA_MODEL=axom-custom`.

> ℹ️ Model files (`.gguf`) are **not** in this repo — they exceed GitHub's limits. Train your own or `ollama pull` a base model.

---

## ☁️ Deployment (AWS Lightsail)

Runs in **Gemini-only mode** by default on small instances; bge-m3 semantic search runs on
2 GB+ RAM (with **1 Gunicorn worker** so the model loads once). Static files via **WhiteNoise**.

One-shot deploy — see **[deploy/DEPLOY.md](deploy/DEPLOY.md)**:
```bash
curl -O https://raw.githubusercontent.com/Samarjitkashyp/axom_ai/main/deploy/deploy.sh
# edit GEMINI_API_KEY + DB_PASSWORD, then:
bash deploy.sh
```
Sets up swap, PostgreSQL, virtualenv, `.env`, migrations, static files, and a Gunicorn service.

**Uptime monitoring:** point any monitor (e.g. UptimeRobot) at `http://<host>:8000/health/`.
**Storage cleanup:** a weekly cron runs `python manage.py cleanup_old_chats`.

---

## 🔄 CI/CD (GitHub Actions)

Every push to `main` runs `.github/workflows/deploy.yml`:
```
git push  →  CI: Django check + migrate + React build
          →  CD: SSH to server → git pull → migrate → collectstatic → restart Gunicorn
          →  live site updated automatically
```
Uses SSH secrets (`LIGHTSAIL_HOST`, `LIGHTSAIL_USER`, `LIGHTSAIL_SSH_KEY`). Tests must pass before deploy.

---

## 📁 Project Structure

```
axom_ai/
├── axom_ai/            # Django project — chat API, language routing, streaming, views
├── knowledge/          # KB app — models, ingestion, semantic search, chat history
│   └── management/     # backfill_embeddings, cleanup_old_chats commands
├── frontend/           # React + Vite source (build → static/dist)
├── static/             # CSS/JS + built frontend bundle
├── templates/          # Django templates (index, admin login)
├── training/           # Fine-tuning notebook + guide + sample data
├── deploy/             # Lightsail deploy script + guide
├── .github/workflows/  # CI/CD pipeline
├── requirements.txt
├── .env.example
└── manage.py
```

---

## 🩺 Troubleshooting

- **Semantic search returns nothing** → run `python manage.py backfill_embeddings` after uploading data.
- **First semantic reply is slow (~15s)** → bge-m3 is loading into RAM; it stays warm afterwards (pre-warmed on startup).
- **Answers come from Gemini, not local** → Ollama isn't running (`ollama serve`), or `USE_LOCAL_LLM=False`.
- **Out-of-memory with bge-m3** → use **1 Gunicorn worker**, or a smaller embedding model / more RAM.
- **Admin panel shows chat instead of dashboard** → log in as a **staff** user at `/admin-panel/login/`.

---

## 📜 License

For educational / personal use.
