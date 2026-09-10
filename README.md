# 🧠 Axom AI — Assam's Premier Indigenous AI Platform

> **Pioneering Artificial Intelligence in Assam, Built for the World.**  
> Axom AI is the first indigenous Assamese generative AI platform — engineered to bridge the linguistic divide for 15+ million Assamese speakers with native conversational intelligence, multimodal creative suites, live web synthesis, and regional computing infrastructure.

**🌐 Official Portal:** [https://aiaxom.co.in](https://aiaxom.co.in)

---

## 🎯 What is Axom AI?

Mainstream global AI models (ChatGPT, Google Gemini, Claude) frequently treat Assamese as a low-resource afterthought — commonly mistranslating, substituting Bengali script characters (like replacing ‘ৰ’ with ‘র’), or failing to understand regional Northeast Indian cultural context.

**Axom AI is Assamese-first, by design:**
- **Authentic Assamese Output:** High-fidelity script processing with zero script confusion or regional grammar degradation.
- **Indigenous Knowledge Base:** Custom RAG pipeline indexed over 25,000+ Assamese Wikipedia articles, historical chronicles, and cultural repositories (~112,000 semantic vector chunks).
- **Hybrid Multi-Model Orchestration:** Groq LPU inference (~0.7s TTFB) backed by IndicTrans2, Gemini fallback, and regional multilingual embeddings.
- **Multimodal Intelligence:** Generative FLUX image synthesis, AI video/image finders, universal document intelligence, and OCR.
- **Enterprise-Grade Infrastructure:** Full subscription commerce (UPI/Razorpay), administrative governance, role-based access control, and automated CI/CD deployment.

---

## ✨ Core Product Modules

### 1. Conversational AI & Neural Chat
- 💬 **Streaming Low-Latency Chat:** Native Assamese generation with streaming token-by-token delivery.
- 🎯 **RAG-Grounded Accuracy:** Vector search over 112K+ semantic knowledge chunks to eliminate hallucinations.
- ⚡ **Groq LPU Acceleration:** High-speed inference streaming tokens at sub-second response times.
- 🌐 **Real-Time Live Web Search:** Tavily API integration synthesizing real-time Assam news, government job notifications, and current events directly into Assamese.
- 📚 **Custom Document RAG:** Users can upload PDF, DOCX, CSV, Excel, or JSONL documents with exact citation attribution.

### 2. Multimodal AI Tools Hub
- 🖼 **FLUX AI Image Generation:** Text-to-image synthesis converting Assamese, Hinglish, or English prompts into photorealistic visuals.
- 🎬 **Video & Media Discovery:** Intelligent video finder and media discovery engine tailored for educational and creative workflows.
- 📊 **Architecture & Diagram Generator:** Automated Mermaid-based flowcharts, sequence diagrams, and architecture visualization.
- 📄 **Universal Document Summarizer:** Multilingual PDF/DOCX/TXT synthesis with customizable summary lengths.
- 🧾 **Complete Document & OCR Suite:** Tesseract-powered regional OCR, PDF merge, split, compress, watermark, and format conversions.

### 3. Subscription Commerce & Payments
- 💳 **Indigenous Payment Gateway:** Seamless Razorpay integration supporting UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit cards.
- 🎟 **Promotional Engine:** Flexible promo codes, discount percentages, usage caps, and expiration limits.
- 🧾 **Automated Tax Invoicing:** Instant downloadable PDF invoices generated for every transaction.

### 4. Search, Answer & Generative Engine Optimization (SEO / GEO / AEO)
- 🚀 **Google Position 0 & SGE Optimization:** Target-engineered for queries including *"Assam AI"*, *"AI in Assam"*, *"Axom AI"*, and *"Assam Artificial Intelligence"*.
- 📑 **Comprehensive Schema.org Graph:** Multi-entity JSON-LD schema spanning `Organization`, `SoftwareApplication`, `AboutPage`, `FAQPage`, and `BreadcrumbList`.
- 🤖 **AI Crawler Friendly:** Fully indexable by Googlebot, Bingbot, GPTBot, Google-Extended, PerplexityBot, and ClaudeBot.
- 🏛 **Authoritative Citation Factsheet:** Standardized machine-readable entity definitions and copyable BibTeX/APA citation records.

### 5. Administrative Management Suite
- 📊 **Executive Dashboard:** Live metrics tracking user growth, active subscribers, revenue, inference latency, and external API health.
- 👥 **User & Access Management:** Granular user administration, plan management, session auditing, and account lifecycle controls.
- 🛡 **Content Moderation & Audit Trails:** Real-time query logs, user feedback analytics, and tamper-proof action auditing for SOC 2 readiness.
- 📰 **Integrated Content Management (CMS):** Full dynamic editing suite for landing page sections, insights articles, FAQs, testimonials, and the official About Us portal.
- ⚙️ **System Settings & Flags:** Instant toggle controls for web search, image generation, OCR tools, and maintenance broadcasts.

### 6. User Account Workspace
- 🏠 **Personal Dashboard:** Plan entitlements, real-time quota usage bars, notifications, and account settings.
- 📚 **Library & Session History:** Saved chats, searchable conversation archives, and export capabilities.
- 💳 **Billing & Invoices:** Transaction logs, subscription upgrade/downgrade matrix, and tax receipts.
- 💬 **Support Desk:** Integrated ticket management with threaded replies and categorized help center.
- 🔒 **Data Privacy:** Full GDPR-compliant JSON data export and account management.

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
           │  - Dynamic About Page │   │  - Auth & Middleware    │
           │  - Blog & Insights    │   │  - Multimodal Tools     │
           │  - Regional FAQ Hub   │   │  - Content CMS Engine   │
           └───────────────────────┘   │  - Payments & Billing   │
                                       └───────────┬─────────────┘
                                                   │
                ┌──────────────────────────────────┼─────────────────────────┐
                │                                  │                         │
       ┌────────▼─────────┐              ┌─────────▼─────────┐     ┌─────────▼─────────┐
       │ PostgreSQL DB    │              │ Vector Embeddings │     │ External AI APIs  │
       │ Users, Payments, │              │ 112K+ Knowledge   │     │ Groq LPUs, Gemini,│
       │ Articles, CMS    │              │ Chunks (MiniLM)   │     │ FLUX, Tavily      │
       └──────────────────┘              └───────────────────┘     └───────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Public Frontend** | Next.js 14 (App Router, Server-Side Rendering, Tailwind CSS) |
| **Interactive Apps** | React 18, Vite, Tailwind CSS, KaTeX, Mermaid.js |
| **Backend Framework** | Django 5.2, Django REST Framework, WhiteNoise, Gunicorn |
| **Database** | PostgreSQL 15 |
| **AI Inference** | Groq LPU (`openai/gpt-oss-120b`), Google Gemini, IndicTrans2 |
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

### 3. Frontend Setup (React App)
```bash
cd frontend
npm install
npm run dev
```

### 4. Public Site Setup (Next.js)
```bash
cd ../next-frontend
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
  └── 5. Build React frontend bundle
       │
       ▼ (If CI checks pass)
Deploy Stage (SSH to Production Server)
  ├── 1. Fetch and align latest commits from origin/main
  ├── 2. Install any updated Python requirements
  ├── 3. Automatically rebuild frontend bundles on source changes
  ├── 4. Automatically rebuild Next.js app on source changes
  ├── 5. Apply pending database migrations (`python manage.py migrate`)
  ├── 6. Collect production static files (`python manage.py collectstatic`)
  └── 7. Gracefully reload production application services
```

### Configuring Deployment Secrets in GitHub:
To activate automated server deployment, configure the following secrets in your repository (**Settings → Secrets and variables → Actions**):
- `LIGHTSAIL_HOST`: Server IP address or hostname
- `LIGHTSAIL_USER`: SSH username (`admin`)
- `LIGHTSAIL_SSH_KEY`: Private SSH Key (.pem content)

---

## 🔐 Security & Data Governance

- **Strict SSL / TLS Encryption:** Cloudflare Full-strict SSL with 15-year Origin Certificate.
- **CSRF & Injection Hardening:** Complete CSRF token verification, SQL injection protection, and input sanitization across all forms and API endpoints.
- **HMAC Payment Security:** Razorpay order ID verification, amount mismatch checks, idempotency tracking, and cryptographic signature validation.
- **Role-Based Access Control:** Enterprise RBAC enforcing superuser gates across administrative routes and session authentication across user endpoints.
- **Audit Logging:** Comprehensive logging of administrative actions with timestamp, actor identity, and originating IP addresses.

---

## 👥 Team & Contact

- **Lead Architect & Founder:** Samarjit Kashyap
- **Email:** [samarjitkashyp@gmail.com](mailto:samarjitkashyp@gmail.com)
- **Website:** [https://aiaxom.co.in](https://aiaxom.co.in)

---

## 📜 License

Proprietary software. All rights reserved. © 2026 Axom AI.
