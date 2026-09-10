from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class SiteHeroConfig(models.Model):
    badge_text = models.CharField(max_length=200, default='অসমৰ নিজা AI প্লেটফৰ্ম • Axom AI 2.0')
    badge_link = models.CharField(max_length=255, default='#tools')
    main_heading_prefix = models.CharField(max_length=200, default='The Power of AI,')
    main_heading_highlight = models.CharField(max_length=200, default='Rooted in Assam.')
    subheading_assamese = models.TextField(default='অসমৰ প্ৰথমটো থলুৱা কৃত্ৰিম বুদ্ধিমত্তা সহায়ক — যিয়ে অসমীয়া ভাষা আৰু সংস্কৃতি সঠিকভাৱে বুজি পায়।')
    subheading_english = models.TextField(default='From fluent Assamese chat to instant image generation, document intelligence and automated workflows — built for the next generation of Assam.')
    cta_primary_text = models.CharField(max_length=100, default='Start Chatting Free')
    cta_primary_url = models.CharField(max_length=255, default='https://chat.aiaxom.co.in')
    cta_secondary_text = models.CharField(max_length=100, default='Explore AI Tools')
    cta_secondary_url = models.CharField(max_length=255, default='#tools')
    trust_badge_1 = models.CharField(max_length=100, default='No credit card required')
    trust_badge_2 = models.CharField(max_length=100, default='Fast & secure')
    logo_strip_headline = models.CharField(max_length=150, default='Built with the best')
    logo_strip_active = models.BooleanField(default=True)
    explore_badge = models.CharField(max_length=100, default='Explore')
    explore_title_prefix = models.CharField(max_length=200, default='A Complete AI Toolkit')
    explore_title_highlight = models.CharField(max_length=200, default='for Modern Needs')
    explore_subheading = models.TextField(default='Everything you need to be more productive, creative and informed — in one powerful platform.')
    explore_section_active = models.BooleanField(default=True)
    usecases_badge = models.CharField(max_length=100, default='Use Cases')
    usecases_title_prefix = models.CharField(max_length=200, default='Built for')
    usecases_title_highlight = models.CharField(max_length=200, default='Real People, Real Impact')
    usecases_subheading = models.TextField(default="Whoever you are, wherever you're from — Axom AI adapts to your work.")
    usecases_section_active = models.BooleanField(default=True)
    testimonials_badge = models.CharField(max_length=100, default='Testimonials')
    testimonials_title_prefix = models.CharField(max_length=200, default='Loved by Users')
    testimonials_title_highlight = models.CharField(max_length=200, default='Across Assam')
    testimonials_subheading = models.TextField(default='Real feedback and stories from everyday users, students and businesses.')
    testimonials_section_active = models.BooleanField(default=True)
    pricing_badge = models.CharField(max_length=100, default='Pricing')
    pricing_title_prefix = models.CharField(max_length=200, default='Simple,')
    pricing_title_highlight = models.CharField(max_length=200, default='Transparent Pricing')
    pricing_subheading = models.TextField(default='Choose a plan that fits your needs. Upgrade or cancel anytime.')
    pricing_yearly_discount_badge = models.CharField(max_length=100, default='Save 20%')
    pricing_footer_note = models.TextField(default='All prices in INR (includes GST). Secure Razorpay checkout — UPI · Cards · Netbanking · Wallets.')
    pricing_section_active = models.BooleanField(default=True)
    insights_badge = models.CharField(max_length=100, default='Insights')
    insights_title_prefix = models.CharField(max_length=200, default='Learn, Explore &')
    insights_title_highlight = models.CharField(max_length=200, default='Stay Updated')
    insights_subheading = models.TextField(default='Guides, tips and stories from the Axom AI team and community.')
    insights_view_all_text = models.CharField(max_length=100, default='View all articles')
    insights_view_all_url = models.CharField(max_length=300, default='#')
    insights_section_active = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Hero Section Configuration'
        verbose_name_plural = 'Hero Section Configuration'

    def __str__(self):
        return f"Hero Config ({self.main_heading_highlight})"


class PartnerLogo(models.Model):
    name = models.CharField(max_length=150, help_text='Partner / Tech name e.g. Google Gemini, Groq')
    logo_image_url = models.CharField(max_length=500, blank=True, null=True, help_text='Optional Image URL (if blank, text is shown)')
    website_url = models.CharField(max_length=300, blank=True, null=True, help_text='Optional link')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Partner / Tech Logo'
        verbose_name_plural = 'Partner / Tech Logos'

    def __str__(self):
        return self.name


class AnnouncementBanner(models.Model):
    badge_label = models.CharField(max_length=50, default='NEW')
    message = models.CharField(max_length=300, default='Axom AI 2.0 is now live with enhanced Assamese intelligence and image tools!')
    action_text = models.CharField(max_length=100, default='Try Now →')
    action_url = models.CharField(max_length=255, default='https://chat.aiaxom.co.in')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Announcement Banner'
        verbose_name_plural = 'Announcement Banners'

    def __str__(self):
        return f"Banner: {self.message[:40]}"


class InsightArticle(models.Model):
    CATEGORY_CHOICES = [
        ('ai_research', 'AI Research'),
        ('product_update', 'Product Update'),
        ('culture_language', 'Culture & Language'),
        ('guides_tutorials', 'Guides & Tutorials'),
        ('community', 'Community'),
    ]

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='product_update')
    excerpt = models.TextField(help_text='Short 2-3 line summary shown on the landing cards')
    content = models.TextField(help_text='Full markdown or HTML content of the article', blank=True)
    read_time = models.CharField(max_length=50, default='4 min read')
    cover_image_url = models.CharField(max_length=500, blank=True, null=True, help_text='Image URL or gradient preset')
    gradient_from = models.CharField(max_length=50, default='#a855f7', help_text='Hex or Tailwind color for banner')
    gradient_to = models.CharField(max_length=50, default='#ec4899', help_text='Hex or Tailwind color for banner')
    author_name = models.CharField(max_length=100, default='Axom AI Team')
    external_link = models.CharField(max_length=500, blank=True, help_text='Optional direct link to external article or blog')
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    published_at = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-published_at']
        verbose_name = 'Insight & Blog Article'
        verbose_name_plural = 'Insights & Blog Articles'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'article'
            unique_slug = base_slug
            counter = 1
            while InsightArticle.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class LandingFeature(models.Model):
    title = models.CharField(max_length=150)
    tagline = models.CharField(max_length=100, default='Native Assamese Intelligence')
    description = models.TextField()
    badge = models.CharField(max_length=50, blank=True, default='Core Engine')
    icon_class = models.CharField(max_length=80, default='fa-solid fa-brain', help_text='FontAwesome icon class')
    gradient_color = models.CharField(max_length=100, default='from-purple-500 to-indigo-500')
    action_url = models.CharField(max_length=255, default='https://chat.aiaxom.co.in')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Landing Feature Card'
        verbose_name_plural = 'Landing Feature Cards'

    def __str__(self):
        return f"{self.title} ({self.badge})"


class LandingUseCase(models.Model):
    tab_title = models.CharField(max_length=100)
    audience_key = models.CharField(max_length=50, blank=True, null=True)
    icon_class = models.CharField(max_length=80, default='fa-solid fa-graduation-cap')
    headline = models.CharField(max_length=250, blank=True, default='')
    description = models.TextField(blank=True, default='')
    bullet_points = models.TextField(blank=True, default='', help_text='Optional points')
    
    # Card 1
    card_1_title = models.CharField(max_length=150, default='Assignment Helper')
    card_1_desc = models.TextField(default='Get instant explanations in Assamese, Hindi or English for any subject.')
    card_1_icon = models.CharField(max_length=80, default='fa-solid fa-graduation-cap')
    card_1_color = models.CharField(max_length=50, default='text-fuchsia-400')

    # Card 2
    card_2_title = models.CharField(max_length=150, default='Study Summaries')
    card_2_desc = models.TextField(default='Turn 100-page PDFs into concise notes in 3 lengths and 3 languages.')
    card_2_icon = models.CharField(max_length=80, default='fa-solid fa-file-pdf')
    card_2_color = models.CharField(max_length=50, default='text-purple-400')

    # Card 3
    card_3_title = models.CharField(max_length=150, default='Essay & Report')
    card_3_desc = models.TextField(default='Draft essays and research reports with source citations.')
    card_3_icon = models.CharField(max_length=80, default='fa-solid fa-pen-nib')
    card_3_color = models.CharField(max_length=50, default='text-pink-400')

    cta_text = models.CharField(max_length=100, default='Start for Free')
    cta_url = models.CharField(max_length=255, default='https://chat.aiaxom.co.in')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Use Case Tab'
        verbose_name_plural = 'Use Case Tabs'

    def __str__(self):
        return f"{self.tab_title}"

    def get_cards_list(self):
        return [
            {
                'title': self.card_1_title,
                'desc': self.card_1_desc,
                'icon': self.card_1_icon,
                'color': self.card_1_color,
            },
            {
                'title': self.card_2_title,
                'desc': self.card_2_desc,
                'icon': self.card_2_icon,
                'color': self.card_2_color,
            },
            {
                'title': self.card_3_title,
                'desc': self.card_3_desc,
                'icon': self.card_3_icon,
                'color': self.card_3_color,
            },
        ]


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    role_designation = models.CharField(max_length=200, help_text='e.g., Student, Cotton University / Entrepreneur, Guwahati')
    avatar_initials = models.CharField(max_length=10, default='AK')
    quote_assamese = models.TextField()
    quote_english = models.TextField(blank=True)
    rating = models.PositiveIntegerField(default=5)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Testimonial Review'
        verbose_name_plural = 'Testimonial Reviews'

    def __str__(self):
        return f"{self.name} - {self.role_designation}"


class FAQPageConfig(models.Model):
    badge = models.CharField(max_length=100, default='Help Center & FAQs')
    title_prefix = models.CharField(max_length=200, default='Frequently Asked')
    title_highlight = models.CharField(max_length=200, default='Questions')
    subheading = models.TextField(default='Everything you need to know about Axom AI, our Assamese language intelligence, tools, subscriptions and data privacy.')
    search_placeholder = models.CharField(max_length=200, default='Search questions (e.g., pricing, Assamese AI, file limits)...')
    support_box_title = models.CharField(max_length=200, default='Still have questions?')
    support_box_desc = models.TextField(default="Can't find the answer you're looking for? Our support team and community are here to help.")
    support_button_text = models.CharField(max_length=100, default='Contact Support')
    support_button_url = models.CharField(max_length=300, default='https://user.aiaxom.co.in/support/')
    chat_button_text = models.CharField(max_length=100, default='Ask Axom AI')
    chat_button_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in')
    meta_title = models.CharField(max_length=255, default='FAQs & Help Center — Axom AI')
    meta_description = models.TextField(default='Find answers to common questions about Axom AI models, word limits, plans, and Assamese features.')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'FAQ Page Configuration'
        verbose_name_plural = 'FAQ Page Configuration'

    def __str__(self):
        return "FAQ Page Configuration"


class AboutPageConfig(models.Model):
    # 1. Hero Section
    badge_text = models.CharField(max_length=255, default='অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • PIONEERING ASSAM\'S AI FUTURE')
    main_heading_prefix = models.CharField(max_length=200, default='Pioneering Artificial Intelligence in')
    main_heading_highlight = models.CharField(max_length=200, default='Assam')
    main_heading_suffix = models.CharField(max_length=200, default=', Built for the World.')
    subheading_english = models.TextField(default="Axom AI is Assam's first indigenous generative artificial intelligence platform — engineered to bridge the linguistic divide for 15 million Assamese speakers with native conversational models, multimodal creative suites, and regional computing infrastructure.")
    subheading_assamese = models.TextField(default="অসমীয়া ভাষা, সংস্কৃতি আৰু বৌদ্ধিক ঐতিহ্যক কৃত্ৰিম বুদ্ধিমত্তাৰ বিশ্ব মানচিত্ৰত প্ৰতিষ্ঠা কৰাৰ এক ঐতিহাসিক পদক্ষেপ।")
    
    # Hero Stats
    stat_1_val = models.CharField(max_length=50, default='15M+')
    stat_1_label = models.CharField(max_length=150, default='Assamese Speakers Empowered')
    stat_2_val = models.CharField(max_length=50, default='25K+')
    stat_2_label = models.CharField(max_length=150, default='Assamese Knowledge Chunks')
    stat_3_val = models.CharField(max_length=50, default='<0.8s')
    stat_3_label = models.CharField(max_length=150, default='Ultra-Fast TTFB Latency')
    stat_4_val = models.CharField(max_length=50, default='100%')
    stat_4_label = models.CharField(max_length=150, default='Indigenous Regional LLM')
    
    cta_primary_text = models.CharField(max_length=100, default='Experience Axom AI Free')
    cta_primary_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in')

    # 2. GEO Entity Profile & Knowledge Graph Box
    entity_badge = models.CharField(max_length=200, default='Generative Engine Citation & Entity Profile (GEO Factsheet)')
    entity_title = models.CharField(max_length=255, default='What is Axom AI? (Assam AI Definition)')
    entity_definition = models.TextField(default="Axom AI (stylized as AI Axom, Assamese: অসম এআই) is Assam's flagship indigenous artificial intelligence platform headquartered in Guwahati, Assam, India. Founded by researcher and architect Samarjit Kashyap, the platform delivers native Assamese Large Language Model (LLM) computing, document OCR, generative image synthesis, and real-time Assamese search synthesis for individuals, students, creators, and enterprises across Northeast India.")
    fact_entity_name = models.CharField(max_length=200, default='Axom AI (AI Axom / Assam AI / অসম এআই)')
    fact_official_url = models.CharField(max_length=300, default='https://aiaxom.co.in')
    fact_headquarters = models.CharField(max_length=255, default='Guwahati, Assam, India (PIN: 781001, Geo: 26.1445° N, 91.7362° E)')
    fact_founder = models.CharField(max_length=200, default='Samarjit Kashyap (Lead Architect)')
    fact_languages = models.CharField(max_length=200, default='Assamese (অসমীয়া), English, Indic Transliterations')
    fact_architecture = models.TextField(default='RAG over 25,000+ Assamese Wikipedia articles (~112K chunks), Groq LPU inference, IndicTrans2, Cloudflare FLUX & Gemini fallback')
    fact_coverage = models.CharField(max_length=255, default='Assam (all 35 districts), Northeast India, Pan-India, Global Assamese Diaspora')

    # 3. Why Assam Needs AI
    why_badge = models.CharField(max_length=150, default='The Linguistic Divide')
    why_title = models.CharField(max_length=255, default='Why Does Assam Need an Independent AI Platform?')
    why_subheading = models.TextField(default="Mainstream AI solutions like ChatGPT, Gemini, and Claude were built on English and Western-centric datasets, leaving Northeast India's rich linguistic heritage on the sidelines.")
    why_card_1_title = models.CharField(max_length=200, default='Eliminating Script Confusion')
    why_card_1_desc = models.TextField(default="Standard global LLMs frequently confuse Assamese with Bengali, substituting characters like ‘ৰ’ with ‘র’ or missing regional grammar rules. Axom AI guarantees pure, authentic Assamese script.")
    why_card_2_title = models.CharField(max_length=200, default='Deep Cultural Grounding')
    why_card_2_desc = models.TextField(default="From the historical chronicles of the Ahom Kingdom to the cultural legacy of Srimanta Sankardev, Bihu traditions, and modern Assam governance, Axom AI understands local context without hallucination.")
    why_card_3_title = models.CharField(max_length=200, default='Affordable & Accessible')
    why_card_3_desc = models.TextField(default="Global models cost $20/month (₹1,700+) and require international credit cards. Axom AI provides a free tier and plans starting at ₹99 with native UPI (Google Pay, PhonePe, Paytm) integration for students and grassroots creators.")

    # 4. Four Core Pillars
    pillars_badge = models.CharField(max_length=150, default='State-of-the-Art Architecture')
    pillars_title = models.CharField(max_length=255, default='The Four Technological Pillars of Axom AI')
    pillar_1_title = models.CharField(max_length=200, default='1. Indigenous Assamese Knowledge Base')
    pillar_1_desc = models.TextField(default='Axom AI indexes over 25,000 verified Assamese Wikipedia documents, historical records, folk literature, and educational repositories broken into 112,000+ semantic chunks. Every query leverages multilingual vector embeddings with strict source verification.')
    pillar_2_title = models.CharField(max_length=200, default='2. Multimodal AI Toolset for Assam')
    pillar_2_desc = models.TextField(default='Beyond conversational chat, Axom AI features an integrated generative suite: FLUX-powered AI image synthesis translating Assamese concepts directly into visual art, universal document summarization, PDF extraction, and Tesseract-based regional OCR.')
    pillar_3_title = models.CharField(max_length=200, default='3. Ultra-Low Latency Groq LPU Inference')
    pillar_3_desc = models.TextField(default='Using Groq\'s Language Processing Units (LPUs) paired with IndicTrans2 and AWS Lightsail infrastructure, Axom AI streams tokens at ~0.7 seconds Time to First Byte (TTFB). Even on 4G networks in rural Assam, responses stream fluidly without lag.')
    pillar_4_title = models.CharField(max_length=200, default='4. Real-Time Live Web Search')
    pillar_4_desc = models.TextField(default='Integrated with Tavily Search API, Axom AI browses the live web to fetch real-time Assam news, government job notifications (APSC/ADRE), weather reports, and regional events, synthesizing the latest facts directly into Assamese.')

    # 5. Founder & Vision Section
    founder_badge = models.CharField(max_length=150, default='Leadership & Vision')
    founder_name = models.CharField(max_length=150, default='Samarjit Kashyap')
    founder_title = models.CharField(max_length=150, default='Lead AI Architect & Founder')
    founder_quote_title = models.CharField(max_length=255, default="Building Assam as Northeast India's AI Capital")
    founder_quote = models.TextField(default='"For decades, regional languages of Northeast India were left behind in the digital technology wave. Axom AI was founded with a singular conviction: our language, literature, and youth deserve world-class artificial intelligence tools that understand them natively. We are creating an ecosystem where anyone in Assam can converse with state-of-the-art intelligence in their mother tongue."')
    founder_email = models.CharField(max_length=150, default='samarjitkashyp@gmail.com')

    # 6. Call to Action Banner
    cta_badge = models.CharField(max_length=150, default='Experience the Future Today')
    cta_title = models.CharField(max_length=255, default="Be Part of Assam's AI Revolution")
    cta_desc = models.TextField(default="Join thousands of students, professionals, and creators across Assam who are chatting, researching, creating, and automating with Axom AI.")
    cta_btn_text = models.CharField(max_length=100, default='Start Free Chatting')
    cta_btn_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in')

    # 7. SEO Meta Tags
    meta_title = models.CharField(max_length=255, default="About Axom AI — Assam's Premier Indigenous AI Platform & LLM Ecosystem | Assam AI")
    meta_description = models.TextField(default="Discover Axom AI (https://aiaxom.co.in) — Assam's flagship indigenous Artificial Intelligence platform. Empowering Assam with native Assamese LLMs, ChatGPT-grade reasoning, image generation, document intelligence, and regional digital innovation.")
    meta_keywords = models.TextField(default="Assam AI, AI in Assam, Axom AI, AI Assam, Artificial Intelligence in Assam, Assamese AI, Assamese ChatGPT, Assamese LLM, Guwahati AI, Northeast India AI, Axom AI about, Assam AI platform, Indic AI Assam, Indigenous AI Assam, Assam AI startup, Assamese NLP")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'About Us Page Configuration'
        verbose_name_plural = 'About Us Page Configuration'

    def __str__(self):
        return "About Us Page Configuration"


class LandingFAQ(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('features', 'Features & AI Models'),
        ('pricing', 'Pricing & Payments'),
        ('privacy', 'Data & Privacy'),
    ]

    question = models.CharField(max_length=300)
    answer = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    order = models.PositiveIntegerField(default=0)
    show_on_homepage = models.BooleanField(default=True, help_text='Display in the homepage FAQ section')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Landing FAQ'
        verbose_name_plural = 'Landing FAQs'

    def __str__(self):
        return self.question



class SiteSEOSetting(models.Model):
    meta_title = models.CharField(max_length=200, default="Axom AI — The Power of AI for Everyone | Assam's Native AI Platform")
    meta_description = models.TextField(default="Axom AI is Assam's first indigenous AI platform. Chat in native Assamese, generate AI images, summarize PDFs, and search live web with world-class AI.")
    meta_keywords = models.CharField(max_length=500, default='Axom AI, Assamese AI, Assam AI Assistant, Assamese ChatGPT, Assamese OCR, AI in Assam, Axom LLM')
    og_title = models.CharField(max_length=200, default="Axom AI — Assam's Own AI Platform")
    og_description = models.TextField(default="Native Assamese intelligence, ChatGPT-grade reasoning, image generation, and document tools built for Assam.")
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')
    gtm_container_id = models.CharField(max_length=50, default='GTM-K4N88ZBR')
    footer_tagline = models.CharField(max_length=255, default='অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Made with ❤️ for Assam')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'SEO & Meta Settings'
        verbose_name_plural = 'SEO & Meta Settings'

    def __str__(self):
        return f"SEO Settings ({self.meta_title[:30]})"


class LandingPricingPlan(models.Model):
    name = models.CharField(max_length=100, default='Free')
    plan_slug = models.CharField(max_length=50, default='free')
    badge = models.CharField(max_length=100, default='Starter AI', blank=True)
    icon_class = models.CharField(max_length=80, default='fa-solid fa-sparkles')
    color_class = models.CharField(max_length=80, default='text-gray-400')
    description = models.TextField(default='Ideal for casual queries, students & basic Assamese chat.')
    monthly_price = models.IntegerField(default=0)
    yearly_price = models.IntegerField(default=0)
    monthly_words = models.CharField(max_length=100, default='5,000 words')
    cta_text = models.CharField(max_length=100, default='Get Started Free')
    cta_url = models.CharField(max_length=255, default='https://chat.aiaxom.co.in')
    is_featured = models.BooleanField(default=False)
    features_list = models.TextField(help_text='One bullet per line', default="5,000 words per month\nStandard Assamese generation\nLlama 3 8B (Fast Basic AI)\nBasic document conversions (5/day)\nWeb chat history (30 days)\nCommunity support")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Pricing Plan'
        verbose_name_plural = 'Pricing Plans'

    def __str__(self):
        return f"{self.name} (₹{self.monthly_price}/mo)"

    def get_features(self):
        if not self.features_list:
            return []
        return [f.strip() for f in self.features_list.split('\n') if f.strip()]


class HeaderSettings(models.Model):
    logo_image_url = models.CharField(max_length=500, default='/axom-logo.svg')
    logo_alt_text = models.CharField(max_length=200, default='Axom AI — Smart. Assamese. AI For All.')
    logo_width = models.CharField(max_length=50, default='180px', help_text='Width in px (e.g. 180px or 180)')
    logo_height = models.CharField(max_length=50, default='auto', help_text='Height in px or auto')
    logo_fit = models.CharField(max_length=50, default='contain', choices=[
        ('contain', 'Contain'),
        ('cover', 'Cover'),
        ('fill', 'Fill'),
        ('scale-down', 'Scale Down'),
    ])
    cta_signin_text = models.CharField(max_length=100, default='Sign in')
    cta_signin_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    cta_chat_text = models.CharField(max_length=100, default='Open Chat')
    cta_chat_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Header Setting'
        verbose_name_plural = 'Header Settings'

    def __str__(self):
        return f"Header Settings ({self.logo_alt_text})"


class HeaderNavItem(models.Model):
    title = models.CharField(max_length=100)
    url = models.CharField(max_length=300)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Header Nav Item'
        verbose_name_plural = 'Header Nav Items'

    def __str__(self):
        return f"{self.title} ({self.url})"


class HeaderMegaMenuItem(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True)
    icon_class = models.CharField(max_length=100, default='fa-solid fa-brain')
    color_class = models.CharField(max_length=100, default='text-fuchsia-400')
    url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/tools')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Header Mega Menu Item'
        verbose_name_plural = 'Header Mega Menu Items'

    def __str__(self):
        return f"{self.title} ({self.url})"


class FooterSettings(models.Model):
    logo_image_url = models.CharField(max_length=500, default='/axom-logo.svg')
    logo_width = models.CharField(max_length=50, default='180px', help_text='Width in px')
    logo_height = models.CharField(max_length=50, default='auto', help_text='Height in px or auto')
    logo_fit = models.CharField(max_length=50, default='contain', choices=[
        ('contain', 'Contain'),
        ('cover', 'Cover'),
        ('fill', 'Fill'),
        ('scale-down', 'Scale Down'),
    ])
    description = models.TextField(default='AI for a more inclusive future.\nBuilt in Assam, for the world.')
    tagline = models.CharField(max_length=300, default='অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Smart. Assamese. AI for All.')
    copyright_text = models.CharField(max_length=200, default='Axom AI. All rights reserved.')
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Footer Setting'
        verbose_name_plural = 'Footer Settings'

    def __str__(self):
        return "Footer Settings"


class FooterColumn(models.Model):
    title = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Footer Column'
        verbose_name_plural = 'Footer Columns'

    def __str__(self):
        return self.title


class FooterColumnLink(models.Model):
    column = models.ForeignKey(FooterColumn, related_name='links', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    url = models.CharField(max_length=300)
    order = models.PositiveIntegerField(default=0)
    is_external = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Footer Column Link'
        verbose_name_plural = 'Footer Column Links'

    def __str__(self):
        return f"{self.title} ({self.url})"


class FooterSocialLink(models.Model):
    platform = models.CharField(max_length=100)
    icon_class = models.CharField(max_length=100, default='fa-brands fa-x-twitter')
    url = models.CharField(max_length=300, default='https://x.com')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Footer Social Link'
        verbose_name_plural = 'Footer Social Links'

    def __str__(self):
        return f"{self.platform} ({self.url})"



