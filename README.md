# 🧠 Axom AI — Assam's Premier Indigenous AI Platform

> **Pioneering Artificial Intelligence in Assam, Built for the World.**  
> Axom AI is the first indigenous Assamese generative AI platform — engineered to bridge the linguistic divide for 15+ million Assamese speakers with native conversational intelligence, multimodal creative suites, ChatGPT-style live web search grounding, pure Assamese grammar RAG purification, IP-based anti-abuse security, and unified cross-domain component architectures.

**🌐 Official Portal:** [https://aiaxom.co.in](https://aiaxom.co.in)  
**💬 AI Chat & Tools Workspace:** [https://chat.aiaxom.co.in](https://chat.aiaxom.co.in)  
**🛠 All-in-One Productivity Tools:** [https://chat.aiaxom.co.in/tools](https://chat.aiaxom.co.in/tools)  
**⚙️ Content Management System (CMS):** [https://content.aiaxom.co.in](https://content.aiaxom.co.in)

---

## 🎯 What is Axom AI?

Mainstream global AI models frequently treat Assamese as a low-resource afterthought — commonly mistranslating, substituting Bengali script characters (such as replacing ‘ৰ’ with ‘র’ or ‘ৱ’ with ‘ব’), or failing to understand Northeast Indian regional and cultural context.

**Axom AI is Assamese-first, by design:**
- **Authentic Assamese Output:** High-fidelity script processing with zero script confusion or regional grammar degradation.
- **Pure Assamese Grammar RAG Layer:** Specialized linguistic purification pipeline that verifies vocabulary, verb inflections, and phonetic accuracy against regional grammar rules.
- **Indigenous Knowledge Base:** Custom RAG pipeline indexed over 25,000+ Assamese Wikipedia articles, historical chronicles, and cultural repositories (~112,000 semantic vector chunks).
- **Hybrid Multi-Model Orchestration:** Groq LPU inference (~0.7s TTFB) backed by IndicTrans2, Gemini fallback, and regional multilingual embeddings.
- **ChatGPT-Style Live Web Search Grounding:** Real-time Google Programmable Custom Search Engine (with Tavily fallback) delivering live Assam news, government exams, and current events directly in Assamese.
- **Unified Reusable Component Architecture:** Shared modular Header and Footer across Django templates (`aiaxom.co.in`) and Next.js SSR apps (`chat.aiaxom.co.in/tools`) with dynamic CMS brand logo sync.
- **Smart Multimodal Productivity Suite:** 27+ utilities including auto-detecting Video Compressor (16:9 vs 9:16), FLUX image synthesis, AI video/image finders, and regional OCR.
- **IP-Based Security & Anti-Abuse Protection:** Strict 5 daily web searches limit per IP/device and single-account-per-device enforcement to eliminate spam and multi-account bot abuse.

---

## ✨ Core Product Modules

### 1. Conversational AI & Neural Chat
- 💬 **Streaming Low-Latency Chat:** Native Assamese generation with streaming token-by-token delivery.
- 🎯 **RAG-Grounded Accuracy:** Vector search over 112K+ semantic knowledge chunks to eliminate hallucinations.
- ⚡ **Groq LPU Acceleration:** High-speed inference streaming tokens at sub-second response times.
- 🌐 **ChatGPT-Style Live Web Search:** Real-time web search grounding with live status steps, spinning radar globe animation, query tags, and citation badges.
- 🗣 **Multilingual Intent Translation:** Automatically identifies intent from Hinglish, Romanized Assamese (e.g., *"ajir news ki hoi"*), or English, query-searches Google CSE, and delivers response in pure Assamese.
- 📚 **Custom Document RAG:** Users can upload PDF, DOCX, CSV, Excel, or JSONL documents with exact citation attribution.

### 2. Unified Reusable Header & Footer Architecture
- 🧩 **Django Reusable Partials:** `templates/components/header.html` and `templates/components/footer.html` eliminate redundant code duplication across marketing views.
- 🔄 **Django Global Context Processor:** `contentcms.context_processors.global_header_footer` makes `header` and `footer` database models globally available to all templates without manual context passing.
- 🎨 **Dynamic CMS Brand Logo Sync:** Automatically pulls uploaded logos and dimensions from `HeaderSettings` (`https://content.aiaxom.co.in/axomai-content/settings/header/`) with instantaneous fallback to official high-resolution brand assets.
- 🔗 **Intelligent Cross-Domain Routing:** `resolveUrl` dynamically routes marketing links (`/about`, `/pricing`, `/blog`, `/faq`) to `https://aiaxom.co.in/...` while keeping chat sessions in-app without Next.js middleware 404 rewrites.
- 🛡 **Security Hardening:** External links enforce `rel="noopener noreferrer"` and `target="_blank"` against reverse tabnabbing; mobile drawer guarantees body scroll-lock restoration.
- 🧭 **Tools Page Header & Subnav:** Full Axom AI navigation embedded on `https://chat.aiaxom.co.in/tools` featuring a persistent `← Return to Chat` button, workspace indicator, and dark/light mode toggle.

### 3. All-in-One Productivity Tools Hub (27+ Tools)
- 🎬 **Smart Video Compressor:** Auto-detects aspect ratio (`16:9` widescreen vs `9:16` vertical reels/shorts/TikTok), adjusts bitrate, and manages Pro-tier resolution limits (4K/1080p).
- 🖼 **FLUX AI Image Generation:** Text-to-image synthesis converting Assamese, Hinglish, or English prompts into photorealistic visuals.
- 🔍 **Video & Media Discovery:** Intelligent video finder and media discovery engine tailored for educational and creative workflows.
- 📊 **Architecture & Diagram Generator:** Automated Mermaid-based flowcharts, sequence diagrams, and architecture visualization.
- 📄 **Universal Document Summarizer:** Multilingual PDF/DOCX/TXT synthesis with customizable summary lengths.
- 🧾 **Complete Document & OCR Suite:** Tesseract-powered regional OCR, PDF merge, split, compress, watermark, and format conversions.

### 4. IP-Based Security & Device Protection
- 🛡 **Daily Web Search Quota (5 Searches/Day per IP):** Strict IP-level enforcement ensuring fair access across all users, backed by atomic Django cache counters and sliding-window persistence.
- 🔒 **Single Account Per Device Enforcement:** Users are restricted from creating multiple accounts from the same physical device or IP address. Dual-layer identification leverages client IP tracking and persistent browser device fingerprinting.
- ⏱ **Burst Rate Throttling:** Sliding-window burst rate limiter prevents rapid-fire automated scraping and DDoS spam.
- 🍪 **Persistent Device Token Authentication:** Hardened, long-lived device identification token prevents session hijacking and incognito multi-account circumvention.

### 5. Subscription Commerce & Payments
- 💳 **Indigenous Payment Gateway:** Seamless Razorpay integration supporting UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit cards.
- 🎟 **Promotional Engine:** Flexible promo codes, discount percentages, usage caps, and expiration limits.
- 🧾 **Automated Tax Invoicing:** Instant downloadable PDF invoices generated for every transaction.

### 6. Search & Generative Engine Optimization (SEO / GEO / AEO)
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
           │  - Tools Directory    │   │  - Celery Worker (Redis)│
           │  - Reusable Navbar/   │   │  - IP-Based Rate Limit  │
           │    Footer Components  │   │  - Assamese RAG Pipeline│
           │  - Blog & Regional FAQ│   │  - Video Compression API│
           └───────────────────────┘   └───────────┬─────────────┘
                                                   │
                ┌──────────────────────────────────┼─────────────────────────┐
                │                                  │                         │
       ┌────────▼─────────┐              ┌─────────▼─────────┐     ┌─────────▼─────────┐
       │ PostgreSQL DB    │              │ Vector Embeddings │     │ External AI APIs  │
       │ Users, Devices,  │              │ 112K+ Knowledge   │     │ Groq LPUs, Gemini,│
       │ Usage, CMS Config│              │ Chunks (MiniLM)   │     │ Google CSE, FLUX  │
       └──────────────────┘              └───────────────────┘     └───────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Public Frontend** | Next.js 14 (App Router, Server-Side Rendering, Tailwind CSS) |
| **Interactive Apps** | React 18, Tailwind CSS, KaTeX, Mermaid.js, Lucide Icons |
| **Backend Framework** | Django 5.2, Django REST Framework, WhiteNoise, Gunicorn |
| **Async Task Queue** | Celery 5.4, Redis |
| **Database** | PostgreSQL 15 |
| **AI Inference** | Groq LPU (`llama-3.3-70b-versatile`), Google Gemini 2.0 Flash, IndicTrans2 |
| **Web Search Grounding** | Google Programmable Custom Search JSON API + Tavily Fallback |
| **Grammar & Vector RAG** | Sentence-Transformers (`paraphrase-multilingual-MiniLM-L12-v2`), NLTK |
| **Media & Video Processing** | FFmpeg (H.264 / AAC, 16:9 & 9:16 aspect ratio detection), PyMuPDF |
| **Image & OCR** | Cloudflare Workers AI (FLUX.1-Schnell), Tesseract OCR |
| **Payments** | Razorpay Standard Checkout + HMAC-SHA256 Webhook Verification |
| **Infrastructure** | AWS Lightsail (Debian Linux), Cloudflare CDN, Systemd Services |
| **CI / CD** | GitHub Actions Automated SSH Deployment Pipeline |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- PostgreSQL 15+
- Redis Server (for background tasks)
- FFmpeg (for video compression)
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

The Next.js application will be available at `http://localhost:3000`.

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
  ├── 3. Automatically rebuild Next.js app on source changes (`npm run build`)
  ├── 4. Apply pending database migrations (`python manage.py migrate`)
  ├── 5. Collect production static files (`python manage.py collectstatic`)
  └── 6. Gracefully reload production services (`systemctl restart axom axom-next axom-celery`)
```

### Configuring Deployment Secrets in GitHub:
To activate automated server deployment, configure the following secrets in your repository (**Settings → Secrets and variables → Actions**):
- `LIGHTSAIL_HOST`: Server IP address or hostname
- `LIGHTSAIL_USER`: SSH username (`admin`)
- `LIGHTSAIL_SSH_KEY`: Private SSH Key (.pem content)

---

## 🔐 Security & Anti-Abuse Architecture

- **Strict Daily IP Search Limiting:** Maximum 5 web searches per day per IP address across all sessions, preventing search API quota depletion.
- **Single-Account Device Restriction:** Each device / IP network is restricted to a single registered user account, eliminating multi-account bot abuse.
- **Reverse Tabnabbing Isolation:** Every external link includes `target="_blank"` and `rel="noopener noreferrer"`.
- **Cross-Domain Routing Guard:** Next.js client router checks hostname and resolves marketing URLs directly to `https://aiaxom.co.in`, avoiding 404 path rewrites on subdomains.
- **Strict SSL / TLS Encryption:** Cloudflare Full-strict SSL with 15-year Origin Certificate.
- **CSRF & Injection Hardening:** Complete CSRF token verification, SQL injection protection, and input sanitization across all forms and API endpoints.
- **HMAC Payment Security:** Razorpay order ID verification, amount mismatch checks, idempotency tracking, and cryptographic signature validation.

---

## 👥 Team & Contact

- **Lead Architect & Founder:** Samarjit Kashyap
- **Email:** [samarjitkashyp@gmail.com](mailto:samarjitkashyp@gmail.com)
- **Website:** [https://aiaxom.co.in](https://aiaxom.co.in)

---

## 📜 License

Proprietary software. All rights reserved. © 2026 Axom AI.
