# Axom AI

**Assamese-first AI platform:** chat with live sources, voice in and out, document and image tools, and an admin console. Built and operated from Guwahati, Assam.

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey)

| Surface | URL |
|---|---|
| Website, blog, pricing | https://aiaxom.co.in |
| Chat workspace | https://chat.aiaxom.co.in |
| Tools | https://aiaxom.co.in/tools |
| Admin console | https://admin.aiaxom.co.in/axomai-admin/ |
| Content CMS | https://content.aiaxom.co.in |

---

## Overview

General-purpose AI models handle Assamese poorly: they mix in Bengali script, mistranslate, and miss local context. Axom AI is built around Assamese from the start.

- **Chat** answers in natural Assamese, grounded in a knowledge base (RAG) and optional live web search.
- **Voice** supports speaking to the chat (voice typing) and listening to answers in Assamese (text-to-speech).
- **Tools** cover PDF, image and video utilities, AI image generation, converters and more. Most run in the browser.
- **Admin console** manages users, plans, content, models, language quality and audio training from a single place.

## Features

**Chat**
- Streaming answers with a model router and automatic fallback between providers.
- Retrieval over an indexed knowledge base, with source attribution and user document upload.
- Assamese quality layer: script clean-up, admin-defined language rules (keep-English terms, grammar, vocabulary) and number-to-words writing.
- Web search toggle with per-IP daily limits.

**Voice**
- Voice typing: server-side speech-to-text with noise gating, automatic stop on silence and rule-based Assamese number handling.
- Text-to-speech: self-hosted Assamese voice service (`deploy/axom-tts`) with male and female voices, sentence-by-sentence playback and a disk cache.
- **Audio Training** (admin): number words, voice-typing corrections and pronunciations, stored in the database and applied without a deploy.

**Platform**
- Plans, coupons and payments through Razorpay (order verification, signature check, idempotency).
- CMS-driven pages (blog, pricing, FAQ, tool pages) and shared header and footer across Django and Next.js.
- Cookie consent (analytics off until accepted) and privacy and cookie policy pages.

## Architecture

```
                      Cloudflare (TLS, proxy)
                              │
                           nginx
        ┌─────────────┬───────┴────────┬──────────────┐
   Next.js SSR     Django (gunicorn)   Assamese TTS   Crawler bot
   :3000           :8000               :8090          :8001 (separate repo)
   site, tools,    API, chat, admin,   FastAPI        FastAPI
   chat UI         CMS, payments
                        │
          ┌─────────────┼──────────────┐
      PostgreSQL       Redis + Celery   LLM providers
      (data, RAG)      (background)     (OpenAI, Gemini, Groq)
```

Subdomains (`admin.`, `chat.`, `content.`, `user.`) are routed to their sections by `axom_ai/subdomain_middleware.py`; access to `admin.` and `content.` is permission-checked per user.

## Repository layout

```
axom_ai/          Django project: settings, chat and voice APIs, middleware, tests
knowledge/        Knowledge base (RAG), chat sessions, Q&A
payments/         Plans, orders, Razorpay integration
superadmin/       Admin console (users, plans, language rules, audio training, ...)
userpanel/        End-user account panel and support tickets
contentcms/       CMS: blog, pages, header and footer, tool pages
model_router/     LLM routing and fallback
next-frontend/    Next.js 14 app: site, tools, chat UI, cookie consent
deploy/           Deployment scripts and service files (TTS, translation)
frontend/         Vite app (not served in production)
```

Related repositories: [axomai-bot](https://github.com/Samarjitkashyp/axomai-bot) (crawler and document ingestion) and [axomai-browser](https://github.com/Samarjitkashyp/axomai-browser).

## Getting started

**Prerequisites:** Python 3.11+, Node.js 20, PostgreSQL 15, Redis, `ffmpeg` (voice features).

```bash
# 1. Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # fill in the values (see Configuration)
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver      # http://127.0.0.1:8000

# 2. Frontend
cd next-frontend
npm ci
npm run dev                     # http://localhost:3000
```

Locally the sections are reached by path: `/axomai-admin/`, `/axomai-user/`, `/axomai-content/`.

## Configuration

All settings come from environment variables. Copy [`.env.example`](.env.example) to `.env`; never commit `.env`.

| Group | Variables |
|---|---|
| Core | `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_*`, `REDIS_URL` |
| LLM providers | `OPENAI_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `STRICT_KB_MODE` |
| Voice | `TTS_SERVICE_URL`, `STT_PRIMARY`, `STT_OPENAI_MODEL`, `STT_GEMINI_MODELS` |
| Search and media | `TAVILY_API_KEY`, `GOOGLE_SEARCH_API_KEY`, `PEXELS_API_KEY`, `CF_API_TOKEN` |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Email and bot protection | `EMAIL_HOST*`, `CONTACT_TO_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |

## Testing

```bash
python manage.py test                                   # Django tests (needs a Postgres user that can create databases)
python manage.py test axom_ai.tests_stt axom_ai.tests_number_words   # a subset

node next-frontend/tests/stt-front.check.js             # front-end logic checks
node next-frontend/tests/cookie-consent.check.mjs
bash next-frontend/tests/undefined-names.check.sh
```

## Admin console

Dashboard, Users, Payments, Plans and Coupons, Moderation, Knowledge Base, Analytics, AI Models, Tools, Language Rules, Audio Training, Contact Messages, Document Verify, Settings and Audit Log.

- Superusers see everything. Other users see only the sections granted in **Users → Manage → Access**.
- Sign-in is protected by a 3-strike, 24-hour lockout per IP and username, and every login is audit-logged.
- The layout is responsive and works on phones.

## Deployment

The application runs on a single Linux server behind nginx and Cloudflare, with systemd services (`axom`, `axom-next`, `axom-celery`, `axom-tts`).

```bash
git pull --ff-only origin main
source venv/bin/activate && pip install -r requirements.txt
python manage.py migrate && python manage.py collectstatic --noinput
cd next-frontend && npm ci && npm run build && cd ..
sudo systemctl restart axom axom-next
```

Take a backup before any migration. First-time setup is described in [`deploy/DEPLOY.md`](deploy/DEPLOY.md); the voice service in [`deploy/axom-tts/README.md`](deploy/axom-tts/README.md). A manual GitHub Actions workflow is in [`.github/workflows`](.github/workflows).

## Security

- CSRF protection, input sanitising and database access through the Django ORM.
- Per-user permission checks on privileged subdomains and admin sections.
- Razorpay payments verified by signature and order, and processed idempotently.
- Rate limits on chat, search and image generation; daily caps for voice features.
- Secrets are read from the environment only.

To report a vulnerability, email the maintainer directly instead of opening a public issue.

## Contributing

1. Branch from `main` (`feature/short-name`).
2. Keep changes focused; add or update tests.
3. Open a pull request; merge after review.

## License and contact

Proprietary software. All rights reserved. © 2026 Axom AI.

Maintainer: Samarjit Kashyap, samarjitkashyp@gmail.com
