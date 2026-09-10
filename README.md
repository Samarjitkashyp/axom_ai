# 🧠 Axom AI — Assam's Premier Indigenous AI Platform

> **Pioneering Artificial Intelligence in Assam, Built for the World.**  
> Axom AI is the first indigenous Assamese generative AI platform — engineered to bridge the linguistic divide for 15+ million Assamese speakers with native conversational intelligence, multimodal creative suites, ChatGPT-style live web search grounding, IP-based anti-abuse security, and regional computing infrastructure.

**🌐 Official Portal:** [https://aiaxom.co.in](https://aiaxom.co.in)

---

## 🎯 What is Axom AI?

Mainstream global AI models frequently treat Assamese as a low-resource afterthought — commonly mistranslating, substituting Bengali script characters (such as replacing ‘ৰ’ with ‘র’ or ‘ৱ’ with ‘ব’), or failing to understand Northeast Indian regional and cultural context.

**Axom AI is Assamese-first, by design:**
- **Authentic Assamese Output:** High-fidelity script processing with zero script confusion or regional grammar degradation.
- **Indigenous Knowledge Base:** Custom RAG pipeline indexed over 25,000+ Assamese Wikipedia articles, historical chronicles, and cultural repositories (~112,000 semantic vector chunks).
- **Hybrid Multi-Model Orchestration:** Groq LPU inference (~0.7s TTFB) backed by IndicTrans2, Gemini fallback, and regional multilingual embeddings.
- **ChatGPT-Style Live Web Search Grounding:** Real-time Google Programmable Custom Search Engine (with Tavily fallback) delivering live Assam news, government exams, and current events directly in Assamese.
- **IP-Based Security & Anti-Abuse Protection:** Strict 5 daily web searches limit per IP/device and single-account-per-device enforcement to eliminate spam and multi-account bot abuse.
- **Multimodal Intelligence:** Generative FLUX image synthesis, AI video/image finders, universal document intelligence, and OCR.
- **Enterprise-Grade Infrastructure:** Full subscription commerce (UPI/Razorpay), administrative governance, and automated CI/CD deployment.

---

## ✨ Core Product Modules

### 1. Conversational AI & Neural Chat
- 💬 **Streaming Low-Latency Chat:** Native Assamese generation with streaming token-by-token delivery.
- 🎯 **RAG-Grounded Accuracy:** Vector search over 112K+ semantic knowledge chunks to eliminate hallucinations.
- ⚡ **Groq LPU Acceleration:** High-speed inference streaming tokens at sub-second response times.
- 🌐 **ChatGPT-Style Live Web Search:** Real-time web search grounding with live status steps, spinning radar globe animation, query tags, and citation badges.
- 📚 **Custom Document RAG:** Users can upload PDF, DOCX, CSV, Excel, or JSONL documents with exact citation attribution.

### 2. IP-Based Security & Device Protection
- 🛡 **Daily Web Search Quota (5 Searches/Day per IP):** Strict IP-level enforcement ensuring fair access across all users, backed by atomic Django cache counters and sliding-window persistence.
- 🔒 **Single Account Per Device Enforcement:** Users are restricted from creating multiple accounts from the same physical device or IP address. Dual-layer identification leverages client IP tracking and persistent browser device fingerprinting.
- ⏱ **Burst Rate Throttling:** Sliding-window burst rate limiter prevents rapid-fire automated scraping and DDoS spam.
- 🍪 **Persistent Device Token Authentication:** Hardened, long-lived device identification token prevents session hijacking and incognito multi-account circumvention.

### 3. Multimodal AI Tools Hub
- 🖼 **FLUX AI Image Generation:** Text-to-image synthesis converting Assamese, Hinglish, or English prompts into photorealistic visuals.
- 🎬 **Video & Media Discovery:** Intelligent video finder and media discovery engine tailored for educational and creative workflows.
- 📊 **Architecture & Diagram Generator:** Automated Mermaid-based flowcharts, sequence diagrams, and architecture visualization.
- 📄 **Universal Document Summarizer:** Multilingual PDF/DOCX/TXT synthesis with customizable summary lengths.
- 🧾 **Complete Document & OCR Suite:** Tesseract-powered regional OCR, PDF merge, split, compress, watermark, and format conversions.

### 4. Subscription Commerce & Payments
- 💳 **Indigenous Payment Gateway:** Seamless Razorpay integration supporting UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit cards.
- 🎟 **Promotional Engine:** Flexible promo codes, discount percentages, usage caps, and expiration limits.
- 🧾 **Automated Tax Invoicing:** Instant downloadable PDF invoices generated for every transaction.

### 5. Search & Generative Engine Optimization (SEO / GEO / AEO)
- 🚀 **Google Position 0 & SGE Optimization:** Target-engineered for queries including *"Assam AI"*, *"AI in Assam"*, *"Axom AI"*, and *"Assam Artificial Intelligence"*.
- 📑 **Comprehensive Schema.org Graph:** Multi-entity JSON-LD schema spanning `Organization`, `SoftwareApplication`, `AboutPage`, `FAQPage`, and `BreadcrumbList`.
- 🤖 **AI Crawler Friendly:** Fully indexable by Googlebot, Bingbot, GPTBot, Google-Extended, PerplexityBot, and ClaudeBot.
- 🏛 **Authoritative Citation Factsheet:** Standardized machine-readable entity definitions and copyable BibTeX/APA citation records.

---

## 🏗 High-Level Architecture

```
                       ┌─────────────────────────┐
                       │      Cloudflare CDN     │  Full-Strict SSL, WAF, DDoS Protection
                       │     (aiaxom.co.in)      │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │     Nginx Web Server    │  Reverse Proxy, SSL Termination,
                       │       (Port 80/443)     │  HTTP/2, Real-IP Restoration
                       └───────┬───────────┬─────┘
                               │           │
           ┌───────────────────▼───┐   ┌───▼─────────────────────┐
           │ Next.js 14 SSR Server │   │  Django 5.2 (Gunicorn)  │
           │  (Port 3000)          │   │  (Port 8000)            │
           │  - Landing Page       │   │  - REST API Endpoints   │
           │  - Chatbot Workspace  │   │  - Auth & Device Guard  │
           │  - Dynamic About Page │   │  - IP-Based Rate Limit  │
           │  - Blog & Insights    │   │  - Multimodal Tools     │
           │  - Regional FAQ Hub   │   │  - Payments & Billing   │
           └───────────────────────┘   └───────────┬─────────────┘
                                                   │
                ┌──────────────────────────────────┼─────────────────────────┐
                │                                  │                         │
       ┌────────▼─────────┐              ┌─────────▼─────────┐     ┌─────────▼─────────┐
       │ PostgreSQL DB    │              │ Vector Embeddings │     │ External AI APIs  │
       │ Users, Devices,  │              │ 112K+ Knowledge   │     │ Groq LPUs, Gemini,│
       │ Usage, Payments  │              │ Chunks (MiniLM)   │     │ Google CSE, FLUX  │
       └──────────────────┘              └───────────────────┘     └───────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Public Frontend** | Next.js 14 (App Router, Server-Side Rendering, Tailwind CSS) |
| **Interactive Apps** | React 18, Tailwind CSS, KaTeX, Mermaid.js |
| **Backend Framework** | Django 5.2, Django REST Framework, WhiteNoise, Gunicorn |
| **Database** | PostgreSQL 15 |
| **AI Inference** | Groq LPU (`llama-3.3-70b-versatile`), Google Gemini, IndicTrans2 |
| **Web Search Grounding** | Google Programmable Custom Search JSON API + Tavily Search Fallback |
| **Security & Rate Limits** | IP-Based Daily Quotas (5/day), Device Fingerprinting, Anti-Multi-Account Guard |
| **Vector Search / RAG** | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| **Image & OCR** | Cloudflare Workers AI (FLUX.1-Schnell), Tesseract OCR, PyMuPDF |
| **Payments** | Razorpay Standard Checkout + HMAC-SHA256 Webhook Verification |
| **Infrastructure** | AWS Lightsail (Debian Linux), Cloudflare CDN, Systemd Services |
| **CI / CD** | GitHub Actions Automated SSH Deployment Pipeline |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- PostgreSQL 15+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Samarjitkashyp/axom_ai.git
cd axom_ai
```

### 2. Backend Setup (Django)
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
python manage.py migrate

# Create superuser for local testing
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

### 3. Frontend Setup (Next.js SSR)
```bash
cd next-frontend
npm install
npm run dev
```

---

## 🔄 CI/CD Deployment Pipeline

The project incorporates an automated **GitHub Actions CI/CD pipeline** configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

```
Push to main branch
       │
       ▼
GitHub Actions CI Runner
  ├── 1. Set up Python 3.12 & Node.js 20
  ├── 2. Install dependencies & verify packages
  ├── 3. Run PostgreSQL service container
  ├── 4. Execute Django system check & test migrations
  └── 5. Build React / Next.js frontend bundles
       │
       ▼ (If CI checks pass)
Deploy Stage (SSH to Production Server)
  ├── 1. Fetch and align latest commits from origin/main
  ├── 2. Install any updated Python requirements
  ├── 3. Automatically rebuild Next.js app on source changes
  ├── 4. Apply pending database migrations (`python manage.py migrate`)
  ├── 5. Collect production static files (`python manage.py collectstatic`)
  └── 6. Gracefully reload production application services (`systemctl restart axom axom-next`)
```

### Configuring Deployment Secrets in GitHub:
To activate automated server deployment, configure the following secrets in your repository (**Settings → Secrets and variables → Actions**):
- `LIGHTSAIL_HOST`: Server IP address or hostname
- `LIGHTSAIL_USER`: SSH username (`admin`)
- `LIGHTSAIL_SSH_KEY`: Private SSH Key (.pem content)

---

## 🔐 Security & Anti-Abuse Architecture

- **Strict Daily IP Search Limiting:** Maximum 5 web searches per day per IP address across all sessions, preventing search API quota depletion.
- **Single-Account Device Restriction:** Each device / IP network is restricted to a single registered user account, eliminating multi-account bot abuse and farm creation.
- **Strict SSL / TLS Encryption:** Cloudflare Full-strict SSL with 15-year Origin Certificate.
- **CSRF & Injection Hardening:** Complete CSRF token verification, SQL injection protection, and input sanitization across all forms and API endpoints.
- **HMAC Payment Security:** Razorpay order ID verification, amount mismatch checks, idempotency tracking, and cryptographic signature validation.
- **Role-Based Access Control:** Enterprise RBAC enforcing staff and superuser permissions across administrative routes and session authentication across user endpoints.
- **Audit Logging:** Comprehensive logging of administrative actions with timestamp, actor identity, and originating IP addresses.

---

## 👥 Team & Contact

- **Lead Architect & Founder:** Samarjit Kashyap
- **Email:** [samarjitkashyp@gmail.com](mailto:samarjitkashyp@gmail.com)
- **Website:** [https://aiaxom.co.in](https://aiaxom.co.in)

---

## 📜 License

Proprietary software. All rights reserved. © 2026 Axom AI.
