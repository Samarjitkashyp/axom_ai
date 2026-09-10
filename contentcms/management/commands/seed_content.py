from django.core.management.base import BaseCommand
from django.utils import timezone
from contentcms.models import (
    SiteHeroConfig,
    PartnerLogo,
    AnnouncementBanner,
    InsightArticle,
    LandingFeature,
    LandingUseCase,
    Testimonial,
    LandingFAQ,
    SiteSEOSetting,
    LandingPricingPlan,
)


class Command(BaseCommand):
    help = 'Seeds initial default content for Axom AI CMS'

    def handle(self, *args, **kwargs):
        # 1. Hero Config
        hero, created = SiteHeroConfig.objects.get_or_create(id=1)
        if created:
            self.stdout.write("Created Hero config.")

        # 1.1 Partner Logos
        if not PartnerLogo.objects.exists():
            default_logos = [
                "Powered by Groq",
                "Google Gemini",
                "Cloudflare Workers AI",
                "Razorpay",
                "Tavily",
                "IndicTrans2",
                "AWS Lightsail",
            ]
            PartnerLogo.objects.bulk_create([
                PartnerLogo(name=name, order=idx+1, is_active=True)
                for idx, name in enumerate(default_logos)
            ])
            self.stdout.write("Created initial Partner / Tech Logos.")

        # 2. Banner
        banner, created = AnnouncementBanner.objects.get_or_create(id=1)
        if created:
            self.stdout.write("Created Announcement Banner.")

        # 3. SEO Settings
        seo, created = SiteSEOSetting.objects.get_or_create(id=1)
        if created:
            self.stdout.write("Created SEO Settings.")

        # 4. Default Articles
        if not InsightArticle.objects.exists():
            InsightArticle.objects.bulk_create([
                InsightArticle(
                    title="How to Use AI Tools for Better Productivity in Assam",
                    slug="how-to-use-ai-tools-for-productivity",
                    category="guides_tutorials",
                    excerpt="Practical AI workflows to save time, create high quality content, and summarize complex research.",
                    content="Full guide on using Axom AI productivity tools...",
                    read_time="5 min read",
                    gradient_from="#c084fc",
                    gradient_to="#9333ea",
                    order=1,
                    published_at=timezone.now().date(),
                    is_published=True,
                ),
                InsightArticle(
                    title="Top AI Tools for Assamese Students in 2026",
                    slug="top-ai-tools-for-assamese-students",
                    category="guides_tutorials",
                    excerpt="Study smarter with Assamese translation, document analysis, and native question-answering.",
                    content="A student's complete guide to AI-assisted study in Assam...",
                    read_time="7 min read",
                    gradient_from="#ec4899",
                    gradient_to="#e11d48",
                    order=2,
                    published_at=timezone.now().date(),
                    is_published=True,
                ),
                InsightArticle(
                    title="How Assam Can Lead the Next Wave of Regional AI Innovation",
                    slug="how-assam-leads-regional-ai-innovation",
                    category="ai_research",
                    excerpt="Regional linguistic AI is the next frontier. How indigenous datasets power true localization.",
                    content="The vision and engineering behind building AI rooted in Assam...",
                    read_time="6 min read",
                    gradient_from="#f59e0b",
                    gradient_to="#ea580c",
                    order=3,
                    published_at=timezone.now().date(),
                    is_published=True,
                ),
                InsightArticle(
                    title="What's New in Axom AI: New Models, Faster Tools & Dark UI",
                    slug="whats-new-in-axom-ai-2026",
                    category="product_update",
                    excerpt="Explore the brand new AI tools hub, FLUX image generation, and instant document summarization.",
                    content="Release notes for Axom AI 2.0...",
                    read_time="4 min read",
                    gradient_from="#06b6d4",
                    gradient_to="#2563eb",
                    order=4,
                    published_at=timezone.now().date(),
                    is_published=True,
                ),
            ])
            self.stdout.write("Created initial Insight articles.")

        # 5. Default Features
        if not LandingFeature.objects.exists():
            LandingFeature.objects.bulk_create([
                LandingFeature(
                    title="Assamese Intelligence",
                    tagline="Native Dialect Understanding",
                    description="Trained specifically on Assamese linguistic structures and cultural nuances for 99.4% translation and conversational accuracy.",
                    badge="Core Engine",
                    icon_class="fa-solid fa-brain",
                    gradient_color="from-purple-500 to-indigo-500",
                    order=1
                ),
                LandingFeature(
                    title="Knowledge Base & RAG 2.0",
                    tagline="25,000+ Wikipedia Articles",
                    description="Zero-hallucination answers powered by semantic vector search across 114,000 verified Assamese knowledge chunks.",
                    badge="RAG 2.0",
                    icon_class="fa-solid fa-database",
                    gradient_color="from-fuchsia-500 to-pink-500",
                    order=2
                ),
                LandingFeature(
                    title="Ultra-Fast Streaming",
                    tagline="Sub-Second Response Latency",
                    description="High-throughput inference with hybrid Groq and Gemini routing delivering instantaneous, token-by-token response streaming.",
                    badge="Fast",
                    icon_class="fa-solid fa-bolt",
                    gradient_color="from-pink-500 to-rose-500",
                    order=3
                ),
                LandingFeature(
                    title="AI Creative Studio",
                    tagline="Image & Art Generation",
                    description="Generate stunning visuals and artworks from Assamese and English prompts with FLUX and multi-provider fallbacks.",
                    badge="Studio",
                    icon_class="fa-solid fa-palette",
                    gradient_color="from-indigo-500 to-cyan-500",
                    order=4
                ),
                LandingFeature(
                    title="Document Intelligence",
                    tagline="PDF & Document Analysis",
                    description="Upload large PDFs, Word documents, and text files for instantaneous contextual summarization and extraction.",
                    badge="Tools",
                    icon_class="fa-solid fa-file-pdf",
                    gradient_color="from-amber-500 to-orange-500",
                    order=5
                ),
                LandingFeature(
                    title="Enterprise Security",
                    tagline="Full Privacy & Encryption",
                    description="Cloudflare Full-strict SSL encryption, CSRF protection, and zero data leakage across tenant accounts.",
                    badge="Security",
                    icon_class="fa-solid fa-shield-halved",
                    gradient_color="from-emerald-500 to-teal-500",
                    order=6
                ),
            ])
            self.stdout.write("Created initial Landing features.")

        # 6. Default Use Cases
        if not LandingUseCase.objects.exists():
            LandingUseCase.objects.bulk_create([
                LandingUseCase(
                    audience_key='students',
                    tab_title='Students',
                    icon_class='fa-solid fa-graduation-cap',
                    card_1_title='Assignment Helper',
                    card_1_desc='Get instant explanations in Assamese, Hindi or English for any subject.',
                    card_1_icon='fa-solid fa-graduation-cap',
                    card_1_color='text-fuchsia-400',
                    card_2_title='Study Summaries',
                    card_2_desc='Turn 100-page PDFs into concise notes in 3 lengths and 3 languages.',
                    card_2_icon='fa-solid fa-file-pdf',
                    card_2_color='text-purple-400',
                    card_3_title='Essay & Report',
                    card_3_desc='Draft essays and research reports with source citations.',
                    card_3_icon='fa-solid fa-pen-nib',
                    card_3_color='text-pink-400',
                    order=1
                ),
                LandingUseCase(
                    audience_key='professionals',
                    tab_title='Professionals',
                    icon_class='fa-solid fa-briefcase',
                    card_1_title='Email Drafting',
                    card_1_desc='Reply to Assamese and English emails in seconds with the right tone.',
                    card_1_icon='fa-solid fa-briefcase',
                    card_1_color='text-blue-400',
                    card_2_title='PDF Workflow',
                    card_2_desc='Merge, split, sign, OCR and compress documents — all in browser.',
                    card_2_icon='fa-solid fa-file-pdf',
                    card_2_color='text-red-400',
                    card_3_title='Data Insights',
                    card_3_desc='Turn Excel and CSV into instant charts and summaries.',
                    card_3_icon='fa-solid fa-chart-simple',
                    card_3_color='text-cyan-400',
                    order=2
                ),
                LandingUseCase(
                    audience_key='businesses',
                    tab_title='Businesses',
                    icon_class='fa-solid fa-building',
                    card_1_title='Customer Support',
                    card_1_desc='AI drafts replies to WhatsApp and email in your brand voice.',
                    card_1_icon='fa-solid fa-building',
                    card_1_color='text-amber-400',
                    card_2_title='Team Collaboration',
                    card_2_desc='Shared knowledge base, team accounts and role management.',
                    card_2_icon='fa-solid fa-users',
                    card_2_color='text-emerald-400',
                    card_3_title='Sales Reports',
                    card_3_desc='Generate weekly performance reports and dashboards on demand.',
                    card_3_icon='fa-solid fa-chart-simple',
                    card_3_color='text-cyan-400',
                    order=3
                ),
                LandingUseCase(
                    audience_key='creators',
                    tab_title='Creators',
                    icon_class='fa-solid fa-palette',
                    card_1_title='Image Generation',
                    card_1_desc='Turn Assamese or English prompts into stunning FLUX visuals.',
                    card_1_icon='fa-solid fa-palette',
                    card_1_color='text-pink-400',
                    card_2_title='Content Ideation',
                    card_2_desc='Scripts, captions and hooks in Assamese for reels and posts.',
                    card_2_icon='fa-solid fa-pen-nib',
                    card_2_color='text-purple-400',
                    card_3_title='Multilingual Reach',
                    card_3_desc='Translate your content to reach English, Hindi and Bengali audiences.',
                    card_3_icon='fa-solid fa-language',
                    card_3_color='text-emerald-400',
                    order=4
                ),
                LandingUseCase(
                    audience_key='researchers',
                    tab_title='Researchers',
                    icon_class='fa-solid fa-magnifying-glass',
                    card_1_title='Live Web Research',
                    card_1_desc='Real-time web search with Assamese-synthesized findings and sources.',
                    card_1_icon='fa-solid fa-globe',
                    card_1_color='text-amber-400',
                    card_2_title='Paper Summaries',
                    card_2_desc='Digest research papers in your language, keep the citations.',
                    card_2_icon='fa-solid fa-file-pdf',
                    card_2_color='text-blue-400',
                    card_3_title='Knowledge Base',
                    card_3_desc='Upload your corpus (JSONL/PDF) and search semantically.',
                    card_3_icon='fa-solid fa-database',
                    card_3_color='text-fuchsia-400',
                    order=5
                ),
                LandingUseCase(
                    audience_key='developers',
                    tab_title='Developers',
                    icon_class='fa-solid fa-code',
                    card_1_title='Code Assistant',
                    card_1_desc='Write, debug and explain in Python, JS, Go — with Assamese comments.',
                    card_1_icon='fa-solid fa-code',
                    card_1_color='text-indigo-400',
                    card_2_title='API Access',
                    card_2_desc='Business tier unlocks REST API for embedding Axom in your apps.',
                    card_2_icon='fa-solid fa-bolt',
                    card_2_color='text-amber-400',
                    card_3_title='Prompt Templates',
                    card_3_desc='Ready-made prompts for common developer tasks.',
                    card_3_icon='fa-solid fa-cubes',
                    card_3_color='text-fuchsia-400',
                    order=6
                ),
            ])
            self.stdout.write("Created initial Use Cases.")

        # 7. Default Testimonials
        if not Testimonial.objects.exists():
            Testimonial.objects.bulk_create([
                Testimonial(
                    name="Pranjal Sarma",
                    role_designation="Student, Cotton University, Guwahati",
                    avatar_initials="PS",
                    quote_assamese="অসমীয়া ভাষাত ইমান সঠিক উত্তৰ আৰু ব্যাকৰণ মই আন কোনো AI ত পোৱা নাই। পঢ়া-শুনাত মোক বহুত সহায় কৰিছে।",
                    quote_english="I haven't seen such accurate Assamese answers and grammar in any other AI. It helped me immensely with my studies.",
                    rating=5,
                    order=1
                ),
                Testimonial(
                    name="Gitashree Barua",
                    role_designation="Digital Marketer, Jorhat",
                    avatar_initials="GB",
                    quote_assamese="স্থানীয় ব্যৱসায়ৰ বাবে অসমীয়া বিজ্ঞাপন আৰু কণ্টেণ্ট লিখিবলৈ Axom AI অতুলনীয়।",
                    quote_english="For writing Assamese ads and content for local businesses, Axom AI is unmatched.",
                    rating=5,
                    order=2
                ),
                Testimonial(
                    name="Dr. Bhaskar Jyoti Das",
                    role_designation="Researcher & Historian, Dibrugarh",
                    avatar_initials="BD",
                    quote_assamese="অসমৰ ইতিহাস আৰু সাহিত্য সম্পৰ্কীয় প্ৰশ্নসমূহৰ তথ্যভিত্তিক উত্তৰ সঁচাকৈয়ে প্ৰশংসনীয়।",
                    quote_english="The factual and referenced answers regarding Assam's history and literature are truly commendable.",
                    rating=5,
                    order=3
                ),
                Testimonial(
                    name="Ananya Hazarika",
                    role_designation="Full-Stack Developer, Guwahati",
                    avatar_initials="AH",
                    quote_assamese="Assamese ভাষাত কোড ব্যাখ্যা আৰু প্ৰম্পট সহায়ক হিচাপে Axom AI মোৰ প্ৰতিদিনের কাম বহুত সহজ কৰি দিছে।",
                    quote_english="Explaining code and getting prompt assistance with Assamese context has made my daily development workflow effortless.",
                    rating=5,
                    order=4
                ),
                Testimonial(
                    name="Rupam Bora",
                    role_designation="Small Business Owner, Tezpur",
                    avatar_initials="RB",
                    quote_assamese="হোৱাটছএপ আৰু ইমেইলত গ্ৰাহকৰ বাবে ক্ষিপ্ৰ অসমীয়া উত্তৰ প্ৰস্তুত কৰাত ই এক আশ্চৰ্যকৰ সঁজুলি।",
                    quote_english="An incredible tool for quickly drafting customer replies in Assamese for WhatsApp and email support.",
                    rating=5,
                    order=5
                ),
            ])
            self.stdout.write("Created initial Testimonials.")

        # 8. Default FAQs
        if not LandingFAQ.objects.exists():
            LandingFAQ.objects.bulk_create([
                LandingFAQ(
                    question="How does Axom AI understand and reply in Assamese?",
                    answer="Axom AI uses fine-tuned models integrated with IndicTrans2 and RAG over 25,000+ curated Assamese articles to guarantee native dialect fluency and accuracy.",
                    category="features",
                    order=1
                ),
                LandingFAQ(
                    question="Is Axom AI free to use?",
                    answer="Yes, Axom AI offers a free plan with daily quotas for chatting, image generation, and document tools. You can upgrade anytime for unlimited usage.",
                    category="pricing",
                    order=2
                ),
                LandingFAQ(
                    question="What payment options are supported for upgrade?",
                    answer="We support all major Indian payment methods via Razorpay including UPI (GPay, PhonePe, Paytm), Cards (Credit/Debit), Netbanking, and Wallets.",
                    category="pricing",
                    order=3
                ),
                LandingFAQ(
                    question="Is my uploaded data and chat history secure?",
                    answer="Yes. All data is protected with SSL encryption, isolated user authentication, and strict privacy controls. You can export or delete your account anytime.",
                    category="privacy",
                    order=4
                ),
            ])
            self.stdout.write("Created initial FAQs.")

        # 9. Default Pricing Plans
        if not LandingPricingPlan.objects.exists():
            LandingPricingPlan.objects.bulk_create([
                LandingPricingPlan(
                    name="Free",
                    plan_slug="free",
                    badge="Starter AI",
                    icon_class="fa-solid fa-sparkles",
                    color_class="text-gray-400",
                    description="Ideal for casual queries, students & basic Assamese chat.",
                    monthly_price=0,
                    yearly_price=0,
                    monthly_words="5,000 words",
                    cta_text="Get Started Free",
                    cta_url="https://chat.aiaxom.co.in/",
                    is_featured=False,
                    features_list="5,000 words per month\nStandard Assamese generation\nLlama 3 8B (Fast Basic AI)\nBasic document conversions (5/day)\nWeb chat history (30 days)\nCommunity support",
                    order=1,
                    is_active=True
                ),
                LandingPricingPlan(
                    name="Starter",
                    plan_slug="starter",
                    badge="Individual",
                    icon_class="fa-solid fa-bolt",
                    color_class="text-sky-400",
                    description="Perfect for researchers, creators and daily regular users.",
                    monthly_price=199,
                    yearly_price=159,
                    monthly_words="50,000 words",
                    cta_text="Upgrade to Starter",
                    cta_url="https://chat.aiaxom.co.in/upgrade",
                    is_featured=False,
                    features_list="50,000 words per month\n2x Faster response speed\nAccess to GPT-4o Mini & Gemma 2\n50 Document conversions/mo\nFull PDF Editor (Signatures & Text)\nPDF Compressor (Extreme Mode)\nExport chat history to PDF & Word\nPriority email support",
                    order=2,
                    is_active=True
                ),
                LandingPricingPlan(
                    name="Pro",
                    plan_slug="pro",
                    badge="⭐ Most Popular",
                    icon_class="fa-solid fa-crown",
                    color_class="text-fuchsia-400",
                    description="Unleash full power: advanced models, OCR & 20+ file tools.",
                    monthly_price=499,
                    yearly_price=399,
                    monthly_words="250,000 words",
                    cta_text="Upgrade to Pro",
                    cta_url="https://chat.aiaxom.co.in/upgrade",
                    is_featured=True,
                    features_list="250,000 words per month\nUltra-fast GPU Compute (Zero Queue)\nClaude 3.5 Sonnet & Llama 3.3 70B\nUnlimited 20+ PDF & Office Tools\nSmart OCR (Extract scanned Assamese/English text)\nInteractive Ask-PDF AI Assistant\nSpeech Voice Mode (Assamese Audio)\nUnlimited chat history & folders\n24/7 Priority Support",
                    order=3,
                    is_active=True
                ),
                LandingPricingPlan(
                    name="Business",
                    plan_slug="business",
                    badge="Team & API",
                    icon_class="fa-solid fa-building",
                    color_class="text-amber-400",
                    description="For offices, institutions & teams needing high volume & API.",
                    monthly_price=1499,
                    yearly_price=1199,
                    monthly_words="1,000,000 words",
                    cta_text="Upgrade to Business",
                    cta_url="https://chat.aiaxom.co.in/upgrade",
                    is_featured=False,
                    features_list="1,000,000 words per month (1M)\nUp to 5 Team member seats\nCustom Knowledge Base (RAG) upload\nDedicated REST API Access & keys\nHighest Priority Compute & SLAs\nAll 20+ PDF & OCR tools included\nCustom invoice & GST billing\nDedicated account manager",
                    order=4,
                    is_active=True
                ),
            ])
            self.stdout.write("Created initial Pricing plans.")

        self.stdout.write(self.style.SUCCESS("Successfully seeded initial Axom AI CMS content!"))
