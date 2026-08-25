# 🧠 Axom AI

A self-hosted AI chat assistant built with **Django + React**, powered by a **local LLM (Ollama)** with a **Google Gemini** fallback and a **RAG knowledge base** you can feed with your own documents.

It runs fully offline for everyday questions and only uses the cloud (Gemini) for live web search or as a backup.

> 🌐 **Live demo:** http://3.6.237.64:8000 &nbsp;·&nbsp; deployed on AWS Lightsail with an automated CI/CD pipeline (see below).

---

## ✨ Features

- 💬 **ChatGPT-style chat UI** — streaming responses, token-by-token, with a typing indicator
- 🧩 **3-layer hybrid answer engine** (see below) — fast *and* accurate
- 📚 **Knowledge base / RAG** — upload PDF, DOCX, Excel, CSV, TXT, or JSONL from the admin panel; the model answers using your data
- ⚡ **Instant Answer** — exact Q&A matches return in milliseconds, no model needed
- 🔐 **Secure admin panel** — staff-only document management
- 🌐 **Web search** — real-time answers with sources (via Gemini grounding)
- 🖥️ **Runs on modest hardware** — small local models work on CPU-only machines

### How answers are produced

```
User question
   │
   ├─ 1. INSTANT ANSWER   → exact/near match in stored Q&A?  → return instantly (0 ms)
   │
   ├─ 2. RAG + LOCAL LLM  → relevant document context found? → local model answers (streamed)
   │
   └─ 3. GEMINI FALLBACK  → web search, or local unavailable → Gemini answers (with sources)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2 (Python) |
| Frontend | React 19 + Vite |
| Database | PostgreSQL |
| Local LLM | Ollama (`qwen2.5:0.5b` / `llama3.2:1b`, or your own fine-tuned model) |
| Cloud LLM | Google Gemini API |
| Doc parsing | pypdf, python-docx, openpyxl, Pillow |

---

## 📋 Prerequisites

Install these first:

- [Python 3.11+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js 18+](https://nodejs.org/) (only if you want to rebuild the frontend)
- [Ollama](https://ollama.com/download) (for the local model)

---

## 🚀 Setup — Step by Step (A to Z)

### 1. Clone the repository
```bash
git clone https://github.com/Samarjitkashyp/axom_ai.git
cd axom_ai
```

### 2. Create a Python virtual environment & install dependencies
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Set up PostgreSQL
Create a database and user (adjust names/passwords as you like):
```sql
CREATE DATABASE axom_ai;
CREATE USER axom_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE axom_ai TO axom_user;
```

### 4. Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
Then edit `.env`:
- `SECRET_KEY` — any long random string
- `DB_*` — match the database you created above
- `GEMINI_API_KEY` — free key from https://aistudio.google.com/apikey (needed for web search / fallback)
- `OLLAMA_MODEL` — the local model to use (see step 6)

> ⚠️ **Never commit your real `.env`** — it holds secrets. It is already in `.gitignore`.

### 5. Run migrations & create an admin user
```bash
python manage.py migrate
python manage.py createsuperuser
```
The superuser can log into the admin panel to manage the knowledge base.

### 6. Install the local model (Ollama)
Make sure Ollama is installed and running, then pull a small model:
```bash
ollama pull qwen2.5:0.5b     # fastest, good for low-end PCs
# or
ollama pull llama3.2:1b      # slightly better quality, a bit slower
```
Set the same name in `.env` → `OLLAMA_MODEL=qwen2.5:0.5b`.

> Want your **own fine-tuned model**? See [training/README_TRAINING.md](training/README_TRAINING.md).

### 7. (Optional) Rebuild the frontend
A prebuilt bundle is already included in `static/dist/`, so the app runs without this step.
Only needed if you change React code in `frontend/`:
```bash
cd frontend
npm install
npm run build     # outputs to ../static/dist
cd ..
```

### 8. Run the server
```bash
python manage.py runserver
```

Open in your browser:
| Page | URL |
|------|-----|
| 💬 Chat | http://127.0.0.1:8000/ |
| 🔐 Admin panel | http://127.0.0.1:8000/admin-panel/ |
| ⚙️ Django admin | http://127.0.0.1:8000/admin/ |

---

## 📖 Usage

### Chatting
Just type a question. Normal questions are answered by the local model (offline). Toggle **Web Search** to get live answers with sources via Gemini.

### Adding knowledge (RAG)
1. Go to **/admin-panel/** and log in with your superuser account.
2. Upload a file — **PDF, DOCX, Excel, CSV, TXT, or JSONL**.
3. The file is parsed into searchable chunks. Now the model answers using that content.

**JSONL format** (best for exact Q&A — powers the Instant Answer layer):
```json
{"instruction": "What is the capital of Assam?", "output": "The capital of Assam is Dispur."}
{"instruction": "...", "output": "..."}
```
Each `instruction → output` pair also becomes an **instant** answer (returned in milliseconds on an exact/near match).

---

## 🎓 Train your own model (free)

You can fine-tune a small model on your own data using a **free GPU** on Kaggle/Colab, then run it locally.

See the full guide: **[training/README_TRAINING.md](training/README_TRAINING.md)**
It includes a ready-to-run notebook (`training/axom_finetune.ipynb`) and a sample dataset.

After training you get a `.gguf` file — load it into Ollama:
```bash
# In a folder containing your model.gguf, create a file named "Modelfile":
#   FROM ./your-model.Q4_K_M.gguf
ollama create axom-custom -f Modelfile
```
Then set `OLLAMA_MODEL=axom-custom` in `.env`.

> ℹ️ **Model files are not included in this repo** — `.gguf` files are large (hundreds of MB) and exceed GitHub's limits. Train your own with the notebook above, or `ollama pull` a base model.

---

## ☁️ Deployment (AWS Lightsail)

The app is deployed on an AWS Lightsail instance in **Gemini-only mode** (`USE_LOCAL_LLM=False`),
since small cloud instances don't have enough RAM for a local model. Static files are served by
**WhiteNoise** (no separate web server needed) and the app runs under **Gunicorn**.

A one-shot deploy script is included — see **[deploy/DEPLOY.md](deploy/DEPLOY.md)**:
```bash
curl -O https://raw.githubusercontent.com/Samarjitkashyp/axom_ai/main/deploy/deploy.sh
# edit GEMINI_API_KEY + DB_PASSWORD inside, then:
bash deploy.sh
```
It sets up swap, PostgreSQL, the virtualenv, `.env`, migrations, static files, and a Gunicorn
service automatically.

---

## 🔄 CI/CD (GitHub Actions)

Every push to `main` runs an automated pipeline (`.github/workflows/deploy.yml`):

```
git push  →  CI: Django check + migrate + React build
          →  CD: SSH to server → git pull → migrate → collectstatic → restart Gunicorn
          →  live site updated automatically
```

Deployment uses SSH secrets stored in the repo (`LIGHTSAIL_HOST`, `LIGHTSAIL_USER`,
`LIGHTSAIL_SSH_KEY`). Tests must pass before deployment runs.

---

## 📁 Project Structure

```
axom_ai/
├── axom_ai/            # Django project (settings, urls, chat API views)
├── knowledge/          # Knowledge base app (models, upload/RAG, instant answer)
├── frontend/           # React + Vite source (build → static/dist)
├── static/             # CSS/JS + built frontend bundle (static/dist)
├── templates/          # Django templates (index, admin login)
├── training/           # Fine-tuning notebook + guide + sample data
├── deploy/             # Lightsail deploy script + deployment guide
├── .github/workflows/  # CI/CD pipeline (GitHub Actions)
├── requirements.txt
├── .env.example        # Copy to .env and fill in
└── manage.py
```

---

## 🩺 Troubleshooting

- **Answers come from Gemini, not the local model** → Ollama isn't running. Start it (`ollama serve`) or open the Ollama app.
- **First answer is slow (~10s), then fast** → The model is loading into RAM (cold start). It stays warm afterwards (`OLLAMA_KEEP_ALIVE`).
- **`ollama serve` says "address already in use"** → Ollama is already running. That's fine.
- **Admin panel shows the chat instead of the dashboard** → You must log in as a **staff** user at `/admin-panel/login/`.

---

## 📜 License

This project is for educational/personal use.
