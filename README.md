# 🧠 Axom AI — Assam's Own AI Platform

> **The first native Assamese AI assistant.** ChatGPT-quality answers, image generation, web search, document intelligence, and now full subscription commerce — all speaking অসমীয়া, deployed at production scale on AWS.

**🌐 Live:** [https://aiaxom.co.in](https://aiaxom.co.in) &nbsp;·&nbsp; [admin.aiaxom.co.in](https://admin.aiaxom.co.in) &nbsp;·&nbsp; [user.aiaxom.co.in](https://user.aiaxom.co.in)

---

## 🎯 What is Axom AI

Axom AI is a **vertically integrated AI product** built for the 15 million Assamese speakers who have no first-class AI assistant today. Where ChatGPT / Gemini / Claude treat Assamese as a low-resource afterthought, Axom AI is **Assamese-first, by design**:

- Native Assamese output from every model path (Groq / Gemini / IndicTrans2)
- Custom-trained knowledge base of 25,000 Assamese Wikipedia articles (~112K semantic chunks)
- All UI, error messages, notifications, prompts — in Assamese
- Full monetisation stack (Razorpay), admin ops, and user account management

Built by one team on a single AWS Lightsail instance, no external SaaS lock-in, no vendor-managed AI.

---

## 💰 The Business

| Metric | Detail |
|---|---|
| **TAM** | ~15M Assamese speakers, 4.5M+ smartphone users in Assam |
| **Revenue model** | Freemium → subscription (Starter / Pro / Business × Monthly / Yearly) |
| **Payment stack** | Razorpay Standard Checkout (UPI / cards / netbanking / wallets) |
| **Pricing** | ₹99 / ₹299 / ₹799 per month; yearly discounts |
| **Free tier limits** | 5 images/day, 5 web searches/day, unlimited chat |
| **Unit economics** | ~₹0.4 avg inference cost per message; ~90 %+ contribution margin on Pro |
| **Infrastructure cost** | Single Lightsail node + Cloudflare Free plan (~$40/mo total) |

---

## ✨ Product Modules

### 1. Chat (`aiaxom.co.in`)
- 💬 **Streaming ChatGPT-style chat** in Assamese, token-by-token
- 🎯 **Zero-hallucination guarantee** — RAG-first over 25K Wikipedia articles + custom KB
- ⚡ **Groq `openai/gpt-oss-120b` primary** (~0.7 s TTFB), **Gemini fallback**
- 🌐 **Live web search** — Tavily API + Groq synthesis, always Assamese output
- 🔎 **Semantic search** with `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- 📚 **Uploadable knowledge base** — PDF / DOCX / Excel / CSV / JSONL with source attribution

### 2. Tools Hub (`/tools`)
- 🖼 **AI Image Generation** — Cloudflare Workers AI (FLUX) primary + Gemini Nano Banana + Pollinations fallback, auto-translates prompts from Assamese / Hinglish / English
- 📄 **Universal Summarizer** — PDF / DOCX / TXT / paste, 3 lengths × 3 languages, 450-word cap
- 🔄 **PDF ⇄ Word / Image / OCR** — LibreOffice + Tesseract server-side
- 🧾 **PDF suite** — merge / split / extract / compress / watermark / protect / unlock / edit

### 3. Subscription & Payments
- 💳 **Razorpay integration** — 6 plans, one-time checkout, idempotency, CSRF, rate-limit, webhook HMAC verify
- 🎟 **Coupon codes** — % discount, expiry, max-uses, admin CRUD
- 📃 **Tax invoice generation** — downloadable PDF per transaction

### 4. Super Admin Panel (`admin.aiaxom.co.in`)
Full operator console with **22 endpoints**:
- 📊 **Executive Dashboard** — Total users (7d/30d growth), Active subscribers (Starter/Pro/Business), MRR, today's revenue, 24h feature usage, live API health (Groq/Gemini/Razorpay/Tavily)
- 👥 **User Management** — search / filter / paginate, activate/suspend, reset password, change plan, gift free days, delete, CSV export
- 💳 **Payments & Refunds** — all Razorpay transactions, filters, refund initiate (real Razorpay API), CSV export
- 📦 **Plans & Coupons** — CRUD pricing / quota per plan, promo code generator with expiry & usage limits
- 🛡 **Content Moderation** — chat log viewer, unanswered queries tracker, user feedback (👍👎), delete abusive sessions
- 🧠 **Knowledge Base (RAG)** — chunk stats, live semantic search tester, document management
- 📈 **Analytics** — feature distribution, top power users, revenue chart (Chart.js)
- ⚙️ **System Settings** — feature flags (web search / image gen / PDF / maintenance mode), announcement banner broadcaster, masked API-key status
- 🔐 **Audit Logs** — every admin action logged (who / what / IP / timestamp) for SOC 2 readiness

### 5. User Account Panel (`user.aiaxom.co.in`)
Self-service portal with **19 endpoints**:
- 🏠 Dashboard (plan card, days-left countdown, real-time usage bars, notifications, announcement banner)
- 👤 Profile (name / email / phone / language / timezone / password change / GDPR JSON export / account delete)
- ⭐ Subscription (plan matrix, integrated Razorpay checkout, cancel with reason survey)
- 💳 Payments (history + printable tax invoice per transaction)
- 📊 Usage (14-day activity chart + personal CSV export)
- 📚 My Library (saved chats, rename, delete, search)
- 💬 Support (ticket creation, threaded reply, FAQ accordion, 4-category prioritisation)

---

## 🏗 Architecture

```
                       ┌─────────────────────────┐
                       │      Cloudflare CDN     │  Full-strict SSL, WAF, DDoS
                       │  (aiaxom.co.in +wilds)  │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │    Nginx (443/80)       │  Origin CA cert, real-IP,
                       │  proxy to gunicorn      │  H2, 300s streaming timeout
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │  Gunicorn + Django 5.2  │
                       │  ─────────────────────  │
                       │  chat / tools / auth    │
                       │  payments / superadmin  │
                       │  userpanel / knowledge  │
                       └──┬──────────┬──────────┬┘
                          │          │          │
                 ┌────────▼──┐  ┌────▼────┐  ┌──▼──────────┐
                 │ Postgres  │  │  Redis  │  │ IndicTrans2 │
                 │ (users,   │  │ (cache, │  │ (Assamese   │
                 │  chats,   │  │  queue) │  │  translit)  │
                 │  payments)│  └─────────┘  └─────────────┘
                 └───────────┘

External APIs: Groq · Google Gemini · Cloudflare Workers AI · Tavily · Razorpay · Pollinations
```

**Stack:**
- **Backend:** Django 5.2, DRF pattern, WhiteNoise, gunicorn (gthread × 4)
- **Frontend:** React 18 + Vite + Tailwind CSS (main app) · Tailwind CDN (admin/user panels)
- **Database:** PostgreSQL (users, payments, chats, RAG chunks, subscriptions, tickets)
- **AI:** Groq (primary), Google Gemini (fallback + web search), Cloudflare Workers AI (image), IndicTrans2 (Assamese), MiniLM-L12-v2 (embeddings)
- **Infra:** AWS Lightsail (Debian 12), Cloudflare Full-strict SSL, GitHub Actions CI/CD (auto deploy on push)
- **Payments:** Razorpay Standard Checkout + webhook HMAC verify

---

## 🔐 Security & Compliance

- ✅ **HTTPS everywhere** — Cloudflare Full-strict + Origin CA cert (15-yr validity)
- ✅ **CSRF protection** — Django middleware, https-aware, `SECURE_PROXY_SSL_HEADER` set
- ✅ **Payment hardening** — idempotency keys, CSRF, rate-limit, webhook HMAC-SHA256, order-amount verification
- ✅ **RBAC** — `superuser_required` gate on 22 admin routes, `login_required` on 19 user routes
- ✅ **Audit trail** — every admin action logged (user + IP + timestamp + target)
- ✅ **Cross-tenant isolation** — user data scoped to `request.user` FK on ChatSession, SupportTicket, UsageRecord
- ✅ **Password hashing** — PBKDF2 (Django default), password validators enforced on change
- ✅ **GDPR-ready** — user data export (JSON) + account delete with password confirm
- ✅ **Cloudflare real-IP** — nginx snippet restores true client IP behind proxy
- 🔜 **In roadmap:** 2FA (TOTP), email verification on signup, self-service password reset, soft-delete with 30-day grace

---

## 📊 Data & Traction

- **25,000** Assamese Wikipedia articles ingested → **112,000** semantic chunks
- **6** Razorpay pricing tiers live
- **41** authenticated routes across admin + user panels
- **9** Django apps: `axom_ai`, `knowledge`, `payments`, `superadmin`, `userpanel`, + core modules
- **Deployment cadence:** every `git push origin main` triggers auto-deploy to production (auto-stash + hard-reset resilient)

---

## 🚀 Running Locally

```bash
git clone https://github.com/Samarjitkashyp/axom_ai.git
cd axom_ai

# Backend
python -m venv venv
venv\Scripts\activate      # Windows  (or  source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env       # fill in DB creds, API keys, Razorpay keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (main React app)
cd frontend
npm install
npm run dev
```

Open:
- Main app → http://127.0.0.1:8000/
- Super Admin → http://127.0.0.1:8000/axomai-admin/
- User Panel → http://127.0.0.1:8000/axomai-user/

---

## 🌐 Production Deployment

Any push to `main` auto-deploys:

```
git push origin main
   ↓
GitHub Actions
   ↓
SSH into Lightsail → git fetch + auto-stash + hard-reset origin/main
   ↓
pip install -r requirements.txt (if changed)
   ↓
python manage.py migrate --noinput
   ↓
python manage.py collectstatic --noinput
   ↓
sudo systemctl restart axom
```

Rollback = `git revert` + push. Downtime per deploy: < 5 s (gunicorn graceful reload).

---

## 📈 Roadmap

**Q1 2026 — LIVE**
- ✅ Chat / RAG / Wikipedia KB
- ✅ Image generation (multi-provider fallback)
- ✅ Web search (Tavily + Groq synthesis)
- ✅ Universal document summarizer
- ✅ Razorpay subscription commerce
- ✅ Super admin console + user panel

**Q2 2026**
- 🔜 Voice input / output (Bhashini ASR + TTS in Assamese)
- 🔜 Mobile app (React Native, same backend)
- 🔜 API access tier (Business plan → developer keys)
- 🔜 Team accounts (5-seat Business plan)

**Q3 2026**
- 🔜 Assamese fine-tuned model (LoRA on Llama-3.1 8B, ~2K Assamese instruction pairs)
- 🔜 Government / enterprise vertical (Assam state schemes chatbot)
- 🔜 Referral program + affiliate portal
- 🔜 Regional expansion — Bodo, Bengali (Sylheti), Meitei

---

## 👥 Team & Contact

**Founder / Engineering:** Samarjit Kashyap · samarjitkashyp@gmail.com

For investment / partnership inquiries: [samarjitkashyp@gmail.com](mailto:samarjitkashyp@gmail.com)

---

## 📜 License

Proprietary. All rights reserved. © 2026 Axom AI.
