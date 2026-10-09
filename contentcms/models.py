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
    pricing_glance_title = models.CharField(max_length=200, default='Axom AI Pricing at a Glance')
    pricing_glance_badge = models.CharField(max_length=100, default='Zero Foreign Markups')
    pricing_glance_text = models.TextField(
        default='Free (₹0/mo) Ideal for casual queries, students & basic Assamese chat. Starter (₹199/mo or ₹159 billed yearly) Perfect for researchers, creators and daily regular users. Pro (₹499/mo or ₹399 billed yearly) Unleash full power: advanced models, OCR & 20+ file tools. Business (₹1499/mo or ₹1199 billed yearly) For offices, institutions & teams needing high volume & API.',
        blank=True
    )
    pricing_glance_active = models.BooleanField(default=True)
    pricing_comparison_badge = models.CharField(max_length=100, default='Full Plan Comparison')
    pricing_comparison_title = models.CharField(max_length=200, default='Compare Every Feature Side-by-Side')
    pricing_comparison_subheading = models.TextField(default='Detailed breakdown of models, tools, limits, and enterprise capabilities across all Axom AI tiers.')
    pricing_comparison_active = models.BooleanField(default=True)
    pricing_section_active = models.BooleanField(default=True)

    # Pricing Trust & Payment Security Cards (3 Feature Cards)
    pricing_trust_cards_active = models.BooleanField(default=True)
    pricing_trust_card1_title = models.CharField(max_length=200, default='100% Indian Payment Methods')
    pricing_trust_card1_desc = models.TextField(default='Pay seamlessly with Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, MasterCard, and Netbanking from 50+ Indian banks.')
    pricing_trust_card1_tags = models.CharField(max_length=255, default='UPI Autopay, RuPay, Razorpay Secured')
    pricing_trust_card1_icon = models.CharField(max_length=100, default='fa-solid fa-credit-card')

    pricing_trust_card2_title = models.CharField(max_length=200, default='GST Compliant Invoicing')
    pricing_trust_card2_desc = models.TextField(default='Add your company GSTIN during checkout to receive automated tax invoices for full Input Tax Credit (ITC) claiming.')
    pricing_trust_card2_tags = models.CharField(max_length=255, default='Instant PDF Invoices, B2B Friendly')
    pricing_trust_card2_icon = models.CharField(max_length=100, default='fa-solid fa-file-invoice-dollar')

    pricing_trust_card3_title = models.CharField(max_length=200, default='Cancel Anytime with 1 Click')
    pricing_trust_card3_desc = models.TextField(default='No hidden phone calls or dark patterns. Upgrade, downgrade, or cancel your subscription instantly from your settings dashboard.')
    pricing_trust_card3_tags = models.CharField(max_length=255, default='Zero Lock-in, Immediate Downgrade')
    pricing_trust_card3_icon = models.CharField(max_length=100, default='fa-solid fa-rotate-left')

    # Pricing Student & Enterprise Callout Cards (2 Cards)
    pricing_callouts_active = models.BooleanField(default=True)
    pricing_student_badge = models.CharField(max_length=100, default='Education & Research')
    pricing_student_title = models.CharField(max_length=200, default='Student & Academic Rebates')
    pricing_student_desc = models.TextField(default='Are you a student preparing for APSC, UPSC, Assam Police, or studying at Gauhati University, Cotton University, Tezpur University, or IIT Guwahati? We provide special educational subsidies and group lab licensing across Assam.')
    pricing_student_btn_text = models.CharField(max_length=100, default='Request Student Discount')
    pricing_student_btn_url = models.CharField(max_length=300, default='mailto:support@aiaxom.co.in?subject=Student%20Discount%20Inquiry%20-%20Axom%20AI')

    pricing_enterprise_badge = models.CharField(max_length=100, default='Enterprises & Government')
    pricing_enterprise_title = models.CharField(max_length=200, default='Custom LLM & Sovereign AI')
    pricing_enterprise_desc = models.TextField(default='Need on-premise private deployment, customized RAG knowledge bases for regional government departments, news agencies, or bank compliant Assamese document pipelines? Our Guwahati engineering team builds turnkey solutions.')
    pricing_enterprise_btn_text = models.CharField(max_length=100, default='Talk to Enterprise Sales')
    pricing_enterprise_btn_url = models.CharField(max_length=300, default='mailto:support@aiaxom.co.in?subject=Enterprise%20and%20Government%20Inquiry%20-%20Axom%20AI')

    # Pricing Bottom Call to Action (CTA) Banner
    pricing_bottom_cta_active = models.BooleanField(default=True)
    pricing_bottom_cta_heading = models.CharField(max_length=250, default='Experience the Future of Assamese AI')
    pricing_bottom_cta_subheading = models.TextField(default='Join thousands of students, researchers, creators and businesses across Assam accelerating their workflow with Axom AI.')
    pricing_bottom_cta_primary_text = models.CharField(max_length=100, default='Start Chatting Free')
    pricing_bottom_cta_primary_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    pricing_bottom_cta_secondary_text = models.CharField(max_length=100, default='Explore 20+ Tools')
    pricing_bottom_cta_secondary_url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools')

    # Pricing FAQs Header & Section Settings
    pricing_faq_badge = models.CharField(max_length=100, default='Pricing FAQ')
    pricing_faq_title = models.CharField(max_length=200, default='Frequently Asked Questions')
    pricing_faq_subheading = models.TextField(default='Clear answers regarding our billing cycles, word quotas, payment methods, and cancellation policy.')
    pricing_faq_active = models.BooleanField(default=True)

    insights_badge = models.CharField(max_length=100, default='Insights')
    insights_title_prefix = models.CharField(max_length=200, default='Learn, Explore &')
    insights_title_highlight = models.CharField(max_length=200, default='Stay Updated')
    insights_subheading = models.TextField(default='Guides, tips and stories from the Axom AI team and community.')
    insights_view_all_text = models.CharField(max_length=100, default='View all articles')
    insights_view_all_url = models.CharField(max_length=300, default='#')
    insights_section_active = models.BooleanField(default=True)
    entity_badge_text = models.CharField(max_length=150, default="Assam's Sovereign AI Entity Profile")
    entity_verified_text = models.CharField(max_length=100, default='Official Verified Platform')
    entity_heading = models.CharField(max_length=250, default='What is Axom AI? (Assam AI Definition & Architecture)')
    entity_description = models.TextField(
        default=(
            '<strong>Axom AI</strong> (stylized as <strong>AI Axom</strong>, Assamese: '
            '<strong class="font-assamese">অসম এআই</strong>, also commonly referred to as '
            '<strong>Assam AI</strong>) is Assam\'s flagship indigenous artificial intelligence '
            'platform headquartered in Guwahati, Assam, India. Founded by AI researcher '
            '<strong>Samarjit Kashyap</strong>, the platform delivers authentic Assamese Large '
            'Language Model (LLM) reasoning, scanned document OCR, 20+ file utilities, generative '
            'image synthesis, and live web search for students, researchers, businesses, and '
            'creators across Northeast India.'
        ),
        help_text='HTML allowed (e.g. <strong>bold</strong>) — rendered as-is on the homepage.'
    )
    entity_attr1_label = models.CharField(max_length=100, default='Headquarters')
    entity_attr1_value = models.CharField(max_length=200, default='Guwahati, Assam (781001)')
    entity_attr2_label = models.CharField(max_length=100, default='Languages Supported')
    entity_attr2_value = models.CharField(max_length=200, default='Assamese, English, Hindi')
    entity_attr3_label = models.CharField(max_length=100, default='Core Architecture')
    entity_attr3_value = models.CharField(max_length=200, default='Assamese RAG & IndicTrans2')
    entity_attr4_label = models.CharField(max_length=100, default='Pricing in India')
    entity_attr4_value = models.CharField(max_length=200, default='₹0 Free Tier • UPI via Razorpay')
    entity_section_active = models.BooleanField(default=True)
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
    faqs = models.JSONField(default=list, blank=True, help_text='List of FAQs for this article [{"question": "...", "answer": "..."}]')
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
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')
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
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

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


class PricingComparisonCategory(models.Model):
    name = models.CharField(max_length=150, help_text='e.g. Core AI Models & Intelligence')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Pricing Comparison Category'
        verbose_name_plural = 'Pricing Comparison Categories'

    def __str__(self):
        return self.name


class PricingComparisonRow(models.Model):
    category = models.ForeignKey(PricingComparisonCategory, on_delete=models.CASCADE, related_name='rows')
    feature_name = models.CharField(max_length=200, help_text='e.g. Monthly Word Quota')
    free_val = models.CharField(max_length=150, default='true', help_text="Can be 'true', 'false', or text like '5,000 words'")
    starter_val = models.CharField(max_length=150, default='true')
    pro_val = models.CharField(max_length=150, default='true')
    business_val = models.CharField(max_length=150, default='true')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Pricing Comparison Row'
        verbose_name_plural = 'Pricing Comparison Rows'

class PricingFAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Pricing FAQ'
        verbose_name_plural = 'Pricing FAQs'

    def __str__(self):
        return self.question


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
    url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools')
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


DEFAULT_COMPARISON_ROWS = """[
  {
    "feature": "Daily Limit & Cost",
    "axom": "Free 20 files/day (Unlimited on Pro)",
    "other": "1-2 files per day limit",
    "paid": "$10 - $20 / month",
    "axom_check": true,
    "other_check": false
  },
  {
    "feature": "Batch Conversion",
    "axom": "Up to 20 files at once (Pro)",
    "other": "Single file only",
    "paid": "Supported (Paid only)",
    "axom_check": true,
    "other_check": false
  },
  {
    "feature": "Watermarks",
    "axom": "Never (100% Clean)",
    "other": "Added to PDF",
    "paid": "Clean (Paid only)",
    "axom_check": true,
    "other_check": false
  },
  {
    "feature": "Account / Registration",
    "axom": "No signup needed",
    "other": "Often forced signup",
    "paid": "Required signup + Card",
    "axom_check": true,
    "other_check": false
  },
  {
    "feature": "Document Privacy",
    "axom": "Auto-purged immediately",
    "other": "Stored up to 24 hours",
    "paid": "Cloud stored",
    "axom_check": true,
    "other_check": false
  },
  {
    "feature": "Typography & Tables",
    "axom": "High-precision rendering",
    "other": "Frequent alignment errors",
    "paid": "High-precision",
    "axom_check": true,
    "other_check": false
  }
]"""


class WordToPdfToolConfig(models.Model):
    # 1. Hero & Converter Parameters
    hero_badge_text = models.CharField(
        max_length=255, 
        default='⚡ Free: 20 Files / Day • 👑 Pro: Batch Convert 20 Files at Once'
    )
    hero_heading_prefix = models.CharField(max_length=150, default='Free')
    hero_heading_highlight = models.CharField(max_length=150, default='Word to PDF')
    hero_heading_suffix = models.CharField(max_length=150, default='Converter Online')
    hero_description = models.TextField(
        default='Convert your Microsoft Word (.DOCX, .DOC), Rich Text, and text files into professional, print-ready PDF documents instantly. Free accounts can convert up to 20 files per day. Upgrade to Premium for unlimited daily conversions and Pro Batch Mode to convert up to 20 files simultaneously in 1 click!'
    )
    free_daily_limit = models.IntegerField(default=20, help_text="Number of files free users can convert per day")
    pro_batch_limit = models.IntegerField(default=20, help_text="Max files in one batch for Pro users")
    max_file_size_mb = models.IntegerField(default=25, help_text="Max file size in MB")

    # 2. How it works (3 Steps)
    how_it_works_title = models.CharField(max_length=255, default='How to Convert Word to PDF in 3 Easy Steps')
    how_it_works_subheading = models.TextField(default='No complex software installation or account creation required. Fast and frictionless.')
    step_1_title = models.CharField(max_length=150, default='Upload Document')
    step_1_desc = models.TextField(default='Drag and drop your DOCX or DOC file into the converter box above or choose it from your local storage.')
    step_2_title = models.CharField(max_length=150, default='Instant Processing')
    step_2_desc = models.TextField(default='Click Convert. Our high-fidelity document engine parses structures, styles, margins, and media in seconds.')
    step_3_title = models.CharField(max_length=150, default='Download PDF')
    step_3_desc = models.TextField(default='Download your clean, publication-ready PDF document directly to your device. No watermarks, ever.')

    # 3. Why Axom AI (Benefits 6 Cards)
    why_title = models.CharField(max_length=255, default='Why Axom AI Word to PDF is the Superior Choice')
    why_subheading = models.TextField(default='Engineered for students, educators, legal professionals, and businesses who demand accuracy and privacy.')
    benefit_1_title = models.CharField(max_length=150, default='Lossless Layout Fidelity')
    benefit_1_desc = models.TextField(default='Headers, footers, footnotes, complex tables, embedded charts, and custom fonts stay strictly aligned without shifting pages.')
    benefit_2_title = models.CharField(max_length=150, default='Zero Watermarks, 100% Free')
    benefit_2_desc = models.TextField(default='No hidden subscription traps or promotional watermarks stamped across your pages. Clean documents ready for official submissions.')
    benefit_3_title = models.CharField(max_length=150, default='Automatic File Purging')
    benefit_3_desc = models.TextField(default='Documents are processed securely via SSL encryption and purged automatically from our server memory right after conversion.')
    benefit_4_title = models.CharField(max_length=150, default='Universal Device Support')
    benefit_4_desc = models.TextField(default='Works seamlessly on iOS, Android, macOS, Windows, and Linux. No apps or browser extensions needed.')
    benefit_5_title = models.CharField(max_length=150, default='Sub-3-Second Speed')
    benefit_5_desc = models.TextField(default='High-speed optimized micro-services convert standard documents in less than 3 seconds with minimal bandwidth usage.')
    benefit_6_title = models.CharField(max_length=150, default='Multi-Format Compatibility')
    benefit_6_desc = models.TextField(default='Handles DOCX, DOC, RTF, TXT, and ODT with automatic format detection and smart structure extraction.')

    # 4. Comparison Matrix
    comparison_badge = models.CharField(max_length=150, default='Direct Feature Comparison')
    comparison_title = models.CharField(max_length=255, default='Axom AI vs. Traditional Word to PDF Converters')
    comparison_subheading = models.TextField(default='See why users choose Axom AI over paywalled and ad-heavy alternatives.')
    comparison_matrix_json = models.TextField(blank=True, default=DEFAULT_COMPARISON_ROWS, help_text="Custom comparison rows JSON")

    # 5. Technical Specifications
    tech_spec_title = models.CharField(max_length=255, default='Technical Specifications & Supported Standards')
    tech_spec_inputs = models.CharField(max_length=200, default='.docx, .doc, .rtf, .txt, .odt')
    tech_spec_output = models.CharField(max_length=200, default='PDF 1.7 / ISO 32000-1 (Vector)')
    tech_spec_max_size = models.CharField(max_length=100, default='25 Megabytes (MB)')
    tech_spec_security = models.CharField(max_length=100, default='TLS 1.3 / SSL 256-bit')

    # 6. FAQ Section Header
    faq_section_title = models.CharField(max_length=255, default='Frequently Asked Questions')
    faq_section_subheading = models.TextField(default='Got questions about Word to PDF conversion? Find verified answers below.')

    # 7. Bottom CTA Banner
    cta_title = models.CharField(max_length=255, default='Convert Your Word Documents in Seconds')
    cta_desc = models.TextField(default='Experience fast, private, and watermark-free conversions trusted by users across Assam and India.')
    cta_btn_primary_text = models.CharField(max_length=100, default='Upload Word File Now')
    cta_btn_primary_url = models.CharField(max_length=300, default='#converter')
    cta_btn_secondary_text = models.CharField(max_length=100, default='Explore All AI & Document Tools')
    cta_btn_secondary_url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools')

    # 8. SEO & Meta
    meta_title = models.CharField(max_length=255, default='Free Word to PDF Converter Online — Convert DOCX to PDF | Axom AI')
    meta_description = models.TextField(default='Convert Microsoft Word (.docx, .doc) to PDF online for free in seconds. Preserve original formatting, tables, fonts, and images. 100% secure with automatic file deletion.')
    meta_keywords = models.TextField(default='Word to PDF, Word to PDF converter, convert word to pdf online free, docx to pdf converter, doc to pdf, convert word document to pdf, best free word to pdf converter, word to pdf without watermark, axom ai tools, assam ai document converter, free docx to pdf high quality')
    canonical_url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools/word-to-pdf/')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Word to PDF Tool Configuration'
        verbose_name_plural = 'Word to PDF Tool Configuration'

    def __str__(self):
        return "Word to PDF Tool Configuration"


class WordToPdfFAQ(models.Model):
    tool_config = models.ForeignKey(WordToPdfToolConfig, related_name='faqs', on_delete=models.CASCADE, null=True, blank=True)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Word to PDF FAQ'
        verbose_name_plural = 'Word to PDF FAQs'

    def __str__(self):
        return self.question


class ConverterToolConfig(models.Model):
    tool_slug = models.CharField(max_length=60, unique=True, db_index=True)
    tool_name = models.CharField(max_length=120)

    # 1. Hero & Converter Parameters
    hero_badge_text = models.CharField(
        max_length=255, 
        default='⚡ Free: 20 Files / Day • 👑 Pro: Batch Convert 20 Files at Once'
    )
    hero_heading_prefix = models.CharField(max_length=150, default='Free')
    hero_heading_highlight = models.CharField(max_length=150, default='Converter')
    hero_heading_suffix = models.CharField(max_length=150, default='Online')
    hero_description = models.TextField(
        default='Convert documents and media files quickly, securely, and with zero watermarks on Axom AI.'
    )
    free_daily_limit = models.IntegerField(default=20, help_text="Number of files free users can convert per day")
    pro_batch_limit = models.IntegerField(default=20, help_text="Max files in one batch for Pro users")
    max_file_size_mb = models.IntegerField(default=25, help_text="Max file size in MB")

    # 2. How it works (3 Steps)
    how_it_works_title = models.CharField(max_length=255, default='How It Works in 3 Easy Steps')
    how_it_works_subheading = models.TextField(default='No complex software installation or account creation required. Fast and frictionless.')
    step_1_title = models.CharField(max_length=150, default='Upload File')
    step_1_desc = models.TextField(default='Drag and drop your file into the converter box above or choose it from your device.')
    step_2_title = models.CharField(max_length=150, default='Instant Processing')
    step_2_desc = models.TextField(default='Click Convert. Our high-fidelity conversion engine processes your files in seconds.')
    step_3_title = models.CharField(max_length=150, default='Download Output')
    step_3_desc = models.TextField(default='Download your clean, publication-ready output directly to your device. No watermarks, ever.')

    # 3. Why Axom AI (Benefits 6 Cards)
    why_title = models.CharField(max_length=255, default='Why Axom AI is the Superior Choice')
    why_subheading = models.TextField(default='Engineered for students, professionals, and businesses who demand speed, fidelity, and privacy.')
    benefit_1_title = models.CharField(max_length=150, default='Lossless Layout Fidelity')
    benefit_1_desc = models.TextField(default='Formatting, fonts, tables, margins, and graphics remain strictly aligned without shifting pages.')
    benefit_2_title = models.CharField(max_length=150, default='Zero Watermarks, 100% Free')
    benefit_2_desc = models.TextField(default='No hidden subscriptions or promotional watermarks stamped on your files.')
    benefit_3_title = models.CharField(max_length=150, default='Automatic File Purging')
    benefit_3_desc = models.TextField(default='Files are processed securely via SSL encryption and purged automatically from server memory.')
    benefit_4_title = models.CharField(max_length=150, default='Universal Device Support')
    benefit_4_desc = models.TextField(default='Works seamlessly on iOS, Android, macOS, Windows, and Linux without apps or extensions.')
    benefit_5_title = models.CharField(max_length=150, default='Sub-3-Second Speed')
    benefit_5_desc = models.TextField(default='High-speed optimized micro-services convert standard files in less than 3 seconds.')
    benefit_6_title = models.CharField(max_length=150, default='Multi-Format Compatibility')
    benefit_6_desc = models.TextField(default='Handles multiple formats with automatic format detection and smart structure extraction.')

    # 4. Comparison Matrix
    comparison_badge = models.CharField(max_length=150, default='Direct Feature Comparison')
    comparison_title = models.CharField(max_length=255, default='Axom AI vs. Traditional Converters')
    comparison_subheading = models.TextField(default='See why users choose Axom AI over paywalled and ad-heavy alternatives.')
    comparison_matrix_json = models.TextField(blank=True, default=DEFAULT_COMPARISON_ROWS, help_text="Custom comparison rows JSON")

    # 5. Technical Specifications
    tech_spec_title = models.CharField(max_length=255, default='Technical Specifications & Supported Standards')
    tech_spec_inputs = models.CharField(max_length=200, default='Standard Supported Formats')
    tech_spec_output = models.CharField(max_length=200, default='Standard Output Format')
    tech_spec_max_size = models.CharField(max_length=100, default='25 Megabytes (MB)')
    tech_spec_security = models.CharField(max_length=100, default='TLS 1.3 / SSL 256-bit')

    # 6. FAQ Section Header
    faq_section_title = models.CharField(max_length=255, default='Frequently Asked Questions')
    faq_section_subheading = models.TextField(default='Got questions about conversion? Find verified answers below.')

    # 7. Bottom CTA Banner
    cta_title = models.CharField(max_length=255, default='Convert Your Files in Seconds')
    cta_desc = models.TextField(default='Experience fast, private, and watermark-free conversions trusted by users across Assam and India.')
    cta_btn_primary_text = models.CharField(max_length=100, default='Upload File Now')
    cta_btn_primary_url = models.CharField(max_length=300, default='#converter')
    cta_btn_secondary_text = models.CharField(max_length=100, default='Explore All AI & Document Tools')
    cta_btn_secondary_url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools')

    # 8. SEO & Meta
    meta_title = models.CharField(max_length=255, default='Free Converter Online | Axom AI')
    meta_description = models.TextField(default='Convert your files online for free in seconds. 100% secure with automatic file deletion.')
    meta_keywords = models.TextField(default='converter online, free converter, axom ai tools, assam ai converter')
    canonical_url = models.CharField(max_length=300, default='https://aiaxom.co.in/tools/')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Converter Tool Configuration'
        verbose_name_plural = 'Converter Tool Configurations'
        ordering = ['tool_slug']

class ConverterToolFAQ(models.Model):
    tool_config = models.ForeignKey(ConverterToolConfig, related_name='faqs', on_delete=models.CASCADE)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Converter Tool FAQ'
        verbose_name_plural = 'Converter Tool FAQs'

    def __str__(self):
        return f"[{self.tool_config.tool_slug}] {self.question}"


class UseCasesPageConfig(models.Model):
    # 1. Hero Section
    hero_badge_text = models.CharField(max_length=255, default='⚡ Real People • Real Impact • Sovereign Assamese AI')
    hero_heading_prefix = models.CharField(max_length=200, default='Built for')
    hero_heading_highlight = models.CharField(max_length=200, default='Real People, Real Impact')
    hero_heading_suffix = models.CharField(max_length=200, default='', blank=True)
    hero_subtitle = models.TextField(default='From school classrooms in Dibrugarh to administrative offices in Dispur and tech startups in Guwahati — discover how Axom AI is driving everyday productivity, academic success, and regional empowerment across Assam and Northeast India.')

    # 2. AEO Direct Answer Box
    aeo_badge = models.CharField(max_length=200, default='AEO Direct Summary • Generative Engine Overview')
    aeo_title = models.CharField(max_length=255, default='What are the Practical Use Cases of Axom AI?')
    aeo_description = models.TextField(default='Axom AI is designed as a sovereign, multi-purpose artificial intelligence ecosystem specifically customized for the linguistic, cultural, and professional requirements of Assam and Northeast India. Key use cases include bilingual academic tutoring for students, APSC civil services preparation with authentic regional General Knowledge, business communication automation for regional MSMEs, bilingual land and legal record analysis, healthcare outreach translation, and full-stack code development — all delivered over low-latency Indian cloud infrastructure with 100% data sovereignty.')
    aeo_point1 = models.CharField(max_length=200, default='15M+ Assamese Speakers Served')
    aeo_point2 = models.CharField(max_length=200, default='SEBA, AHSEC & APSC Aligned')
    aeo_point3 = models.CharField(max_length=200, default='DPDP Act 2023 Compliant')

    # 3. Impact Metrics (4 Stats)
    stat_1_val = models.CharField(max_length=50, default='15M+')
    stat_1_label = models.CharField(max_length=150, default='Assamese Speakers Empowered')
    stat_2_val = models.CharField(max_length=50, default='30+')
    stat_2_label = models.CharField(max_length=150, default='Integrated AI & Document Tools')
    stat_3_val = models.CharField(max_length=50, default='99.2%')
    stat_3_label = models.CharField(max_length=150, default='Assamese Grammatical Accuracy')
    stat_4_val = models.CharField(max_length=50, default='<0.8s')
    stat_4_label = models.CharField(max_length=150, default='Domestic Indian Cloud Latency')

    # 4. Sectors Section Headings
    sectors_badge = models.CharField(max_length=150, default='In-Depth Industry Solutions')
    sectors_title = models.CharField(max_length=255, default='Explore How Axom AI Powers Every Sector')
    sectors_subtitle = models.TextField(default='Detailed breakdowns of practical workflows, problem-solving capabilities, and proven results.')

    # 5. Comparison Section Headings
    comparison_badge = models.CharField(max_length=150, default='The Sovereign Advantage')
    comparison_title = models.CharField(max_length=255, default='Why Axom AI is Unmatched for Assam & Regional Workflows')
    comparison_subtitle = models.TextField(default='Comparing Axom AI against generic international chatbots and fragmented software.')

    # 6. Sovereign Authority Section
    authority_badge = models.CharField(max_length=150, default='Sovereign AI for Assam & Northeast India')
    authority_title = models.CharField(max_length=255, default='Built in Assam, Serving Millions Worldwide')
    authority_description = models.TextField(default='Headquartered in Guwahati, Assam, Axom AI is committed to building sovereign regional artificial intelligence infrastructure. By developing localized linguistic benchmarks and integrating domestic cloud processing, we ensure that technological advancement preserves our heritage while empowering the next generation of researchers, leaders, and entrepreneurs.')

    # 7. FAQ Section Headings
    faq_badge = models.CharField(max_length=150, default='Answers to Common Questions')
    faq_title = models.CharField(max_length=255, default='Frequently Asked Questions about Axom AI Use Cases')
    faq_subtitle = models.TextField(default='Got questions about how Axom AI fits your specific daily workflow or organization? Find verified answers below.')

    # 8. Bottom CTA Banner
    cta_badge = models.CharField(max_length=150, default='Get Started in 10 Seconds — No Credit Card Required')
    cta_heading = models.CharField(max_length=255, default='Experience the Impact of Sovereign AI Today')
    cta_subheading = models.TextField(default='Join thousands of students, civil servants, business owners, and creators leveraging Axom AI every single day.')
    cta_primary_btn_text = models.CharField(max_length=100, default='Launch AI Chat Workspace')
    cta_primary_btn_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    cta_secondary_btn_text = models.CharField(max_length=100, default='Explore All AI & Document Tools')
    cta_secondary_btn_url = models.CharField(max_length=300, default='/tools')

    # 9. SEO & Meta
    meta_title = models.CharField(max_length=255, default='Axom AI Use Cases — Real-World AI Solutions for Assam & India | Students, Business & Creators')
    meta_description = models.TextField(default='Discover how students, APSC aspirants, businesses, legal experts, healthcare pros, and creators use Axom AI across Assam & Northeast India. Native Assamese AI with real impact.')
    meta_keywords = models.TextField(default='Axom AI use cases, Assam AI use cases, Assamese AI applications, AI in Assam, AI for students Assam, APSC exam AI preparation, AI for Assam government jobs, AI for businesses in Assam, Assamese document translator AI, Assamese legal AI, AI in healthcare Assam, AI for content creators Assamese, sovereign AI India use cases, Northeast India AI solutions')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Use Cases Page Configuration'
        verbose_name_plural = 'Use Cases Page Configuration'

    def __str__(self):
        return "Use Cases Page Configuration"


class UseCaseSector(models.Model):
    page_config = models.ForeignKey(UseCasesPageConfig, related_name='sectors', on_delete=models.CASCADE, null=True, blank=True)
    sector_id = models.CharField(max_length=100, default='students', help_text='Unique slug e.g. students, aspirants, businesses')
    badge = models.CharField(max_length=150, default='Academic Excellence')
    icon_name = models.CharField(max_length=80, default='GraduationCap', help_text='Lucide icon name (GraduationCap, BookOpen, Briefcase, Scale, Stethoscope, Palette, Code2)')
    color_gradient = models.CharField(max_length=150, default='from-fuchsia-500 to-purple-600')
    text_color = models.CharField(max_length=150, default='text-fuchsia-700 dark:text-fuchsia-400')
    border_color = models.CharField(max_length=150, default='border-fuchsia-500/30')
    title = models.CharField(max_length=255, default='Students, Schools & Higher Education')
    short_title = models.CharField(max_length=100, blank=True, default='', help_text='Short label for top quick jump pill bar, e.g. Students, APSC, MSMEs')
    tagline = models.CharField(max_length=255, default='Personalized 24/7 bilingual tutoring in Assamese and English')
    description = models.TextField(default='')
    capabilities_raw = models.TextField(help_text='One bullet capability per line', default='')
    impact_metric = models.CharField(max_length=150, default='40% Time Saved in Study Preparation')
    cta_text = models.CharField(max_length=100, default='Start Studying with AI Tutor')
    cta_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Use Case Sector'
        verbose_name_plural = 'Use Case Sectors'

    def __str__(self):
        return f"{self.title} ({self.sector_id})"


class UseCaseFAQ(models.Model):
    page_config = models.ForeignKey(UseCasesPageConfig, related_name='faqs', on_delete=models.CASCADE, null=True, blank=True)
    question = models.CharField(max_length=350)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Use Case FAQ'
        verbose_name_plural = 'Use Case FAQs'

    def __str__(self):
        return self.question


# ==============================================================================
# CONTACT US PAGE CONFIGURATION (Standalone Page)
# ==============================================================================

class ContactPageConfig(models.Model):
    # 1. Hero Section
    hero_badge_text = models.CharField(max_length=150, default='Official Help Desk & Regional Headquarters')
    hero_title_prefix = models.CharField(max_length=200, default='Get in Touch with')
    hero_title_highlight = models.CharField(max_length=150, default='Axom AI')
    hero_subtitle = models.TextField(default='Have a question about Assamese AI models, need help with your account quota, or exploring an enterprise deployment? Our engineering team in Guwahati is here to assist you.')

    # 2. AEO Direct Answer Summary Box
    aeo_badge = models.CharField(max_length=150, default='Direct Answer • Official Contact Information')
    aeo_how_to_contact_title = models.CharField(max_length=150, default='How to contact Axom AI:')
    aeo_description = models.TextField(default='You can contact Axom AI customer care and technical support by emailing support@aiaxom.co.in or by using the verified contact form below. Axom AI is headquartered in Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001). Standard response times for general queries, billing, and API support are within 4–12 business hours (Monday–Saturday: 9:00 AM – 7:00 PM IST).')
    primary_support_email = models.CharField(max_length=150, default='support@aiaxom.co.in')
    founder_email = models.CharField(max_length=150, default='samarjitkashyp@gmail.com')

    # 3. Channels Section Heading
    channels_badge = models.CharField(max_length=150, default='Direct Response Channels')
    channels_title = models.CharField(max_length=200, default='Choose Your Dedicated Support Department')

    # 4. Form Section Headings
    form_title = models.CharField(max_length=200, default='Send an Official Message')
    form_subtitle = models.CharField(max_length=255, default='Directly logged with our Guwahati headquarters & customer care desk')

    # 5. Guwahati Headquarters & Office Factsheet
    office_title = models.CharField(max_length=200, default='Guwahati Headquarters')
    office_subtitle = models.CharField(max_length=255, default='Indigenous Artificial Intelligence Lab, Assam')
    office_location = models.CharField(max_length=255, default='Guwahati, Kamrup Metropolitan, Assam, India • PIN: 781001')
    office_hours = models.CharField(max_length=200, default='Monday – Saturday: 9:00 AM – 7:00 PM IST')
    office_hours_note = models.CharField(max_length=200, default='(Automated cloud APIs & AI services operate 24/7/365)')
    office_languages = models.CharField(max_length=255, default='English, অসমীয়া (Assamese), हिंदी (Hindi)')
    office_sla_text = models.CharField(max_length=100, default='Average SLA: < 4h')
    security_compliance_title = models.CharField(max_length=200, default='Enterprise Security & DPDP Act 2023 Compliant')
    security_compliance_desc = models.TextField(default='All messages, documents, and technical inquiries submitted through Axom AI are protected with 256-bit TLS encryption. Uploaded files are isolated and never retained for public training without explicit organizational consent.')

    # 6. Audience Breakdown: Who We Help (4 Pillars)
    audience_badge = models.CharField(max_length=150, default='Audience Solutions')
    audience_title = models.CharField(max_length=200, default='Who Can Reach Out to Axom AI?')
    audience_subtitle = models.CharField(max_length=255, default='Dedicated support channels tailored for students, enterprises, creators, and developers')

    audience_1_icon = models.CharField(max_length=80, default='Sparkles')
    audience_1_title = models.CharField(max_length=150, default='Students & Job Aspirants')
    audience_1_desc = models.TextField(default='Assistance with APSC, UPSC, Assamese literature research, essay formulation, and subsidized student accounts.')

    audience_2_icon = models.CharField(max_length=80, default='Briefcase')
    audience_2_title = models.CharField(max_length=150, default='Assam MSMEs & Businesses')
    audience_2_desc = models.TextField(default='Bilingual customer care chatbots, Assamese invoice extraction, marketing copy, and multi-user business plans.')

    audience_3_icon = models.CharField(max_length=80, default='Code2')
    audience_3_title = models.CharField(max_length=150, default='Developers & Engineers')
    audience_3_desc = models.TextField(default='API tokens, webhooks, fine-tuned IndicTrans2 Assamese translation endpoints, and high-concurrency rate limits.')

    audience_4_icon = models.CharField(max_length=80, default='Building')
    audience_4_title = models.CharField(max_length=150, default='Govt & Cultural Bodies')
    audience_4_desc = models.TextField(default='Digitization and OCR for ancient Assamese manuscripts (সাঁচিপাত), archives, and institutional AI partnerships.')

    # 7. FAQ Section Headings
    faq_badge = models.CharField(max_length=150, default='Frequently Asked Questions')
    faq_title = models.CharField(max_length=200, default='Common Questions About Contacting Us')
    faq_subtitle = models.CharField(max_length=255, default='Direct answers to popular questions regarding support, response times, and partnerships')

    # 8. Bottom Fast Assistance Card
    bottom_cta_badge = models.CharField(max_length=150, default='Instant AI Support')
    bottom_cta_heading = models.CharField(max_length=200, default='Need Instant Answers Right Now?')
    bottom_cta_subheading = models.TextField(default='You can immediately query our AI directly in English or Assamese. For live conversational support, launch the Axom AI web application.')
    bottom_cta_primary_btn_text = models.CharField(max_length=100, default='Launch Axom AI Chat')
    bottom_cta_primary_btn_url = models.CharField(max_length=300, default='https://chat.aiaxom.co.in/')
    bottom_cta_secondary_btn_text = models.CharField(max_length=100, default='Browse Full FAQ Knowledgebase')
    bottom_cta_secondary_btn_url = models.CharField(max_length=300, default='/faq')

    # 9. SEO & Meta
    meta_title = models.CharField(max_length=255, default='Contact Axom AI — Customer Support, Business Enquiries & Guwahati Office')
    meta_description = models.TextField(default='Contact Axom AI for customer support, report technical issues, explore enterprise partnerships, or request API integrations. Headquartered in Guwahati, Assam, with rapid 4–12h response.')
    meta_keywords = models.TextField(default='Axom AI contact, Axom AI contact us, contact Axom AI, Axom AI support, Axom AI customer support, Axom AI help, Axom AI customer service, Axom AI support team, contact AI support, AI support Assam, AI company contact Assam, Axom AI office, Axom AI Guwahati, Axom AI Assam, AI company Assam, AI platform Assam')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact Page Configuration'
        verbose_name_plural = 'Contact Page Configuration'

    def __str__(self):
        return "Contact Page Configuration"


class ContactChannelItem(models.Model):
    page_config = models.ForeignKey(ContactPageConfig, related_name='channels', on_delete=models.CASCADE, null=True, blank=True)
    channel_id = models.CharField(max_length=100, default='customer-support', help_text='Unique slug e.g. customer-support, business-partnerships')
    title = models.CharField(max_length=200, default='Customer & Account Support')
    badge = models.CharField(max_length=100, default='Fastest Response')
    email = models.CharField(max_length=150, default='support@aiaxom.co.in')
    desc = models.TextField(default='Assistance with account access, word quotas, subscription upgrades, payments via UPI/Cards, and billing inquiries.')
    turnaround = models.CharField(max_length=150, default='Avg response < 4 business hours')
    icon_name = models.CharField(max_length=80, default='HelpCircle', help_text='Lucide icon name (HelpCircle, Briefcase, Code2, Mail, ShieldCheck, MessageSquare)')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Contact Channel'
        verbose_name_plural = 'Contact Channels'

    def __str__(self):
        return f"{self.title} ({self.email})"


class ContactFAQItem(models.Model):
    page_config = models.ForeignKey(ContactPageConfig, related_name='faqs', on_delete=models.CASCADE, null=True, blank=True)
    question = models.CharField(max_length=350)
    answer = models.TextField()
    category = models.CharField(max_length=150, default='General & Support')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Contact FAQ'
        verbose_name_plural = 'Contact FAQs'

    def __str__(self):
        return self.question


# ==============================================================================
# PRIVACY POLICY PAGE CONFIGURATION (Standalone Page)
# ==============================================================================

class PrivacyPageConfig(models.Model):
    # 1. Hero Section
    hero_badge_text = models.CharField(max_length=200, default='Official Legal Document • Updated for DPDP Act 2023')
    hero_heading_prefix = models.CharField(max_length=150, default='Axom AI')
    hero_heading_highlight = models.CharField(max_length=150, default='Privacy Policy')
    hero_heading_suffix = models.CharField(max_length=150, default='& Data Protection', blank=True)
    hero_subtitle = models.TextField(default='Complete transparency on how Axom AI safeguards your conversations, uploaded files, and personal data under India’s Digital Personal Data Protection (DPDP) Act 2023.')

    # 2. Metadata / Legal Badges Pill Card
    last_updated = models.CharField(max_length=100, default='September 17, 2026')
    effective_date = models.CharField(max_length=100, default='September 17, 2026')
    policy_version = models.CharField(max_length=50, default='2.4')
    data_fiduciary_text = models.CharField(max_length=255, default='Data Fiduciary under India Digital Personal Data Protection (DPDP) Act 2023')
    headquarters_text = models.CharField(max_length=255, default='Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)')
    dpo_email = models.CharField(max_length=150, default='support@aiaxom.co.in')
    grievance_officer = models.CharField(max_length=200, default='Samarjit Kashyap (samarjitkashyp@gmail.com)')

    # 3. 4 Security & Privacy Key Highlight Cards
    card_1_title = models.CharField(max_length=150, default='Zero Model Training')
    card_1_desc = models.TextField(default='We never use your private conversations, customer queries, or uploaded documents to train public AI models.')
    card_1_icon = models.CharField(max_length=80, default='EyeOff')

    card_2_title = models.CharField(max_length=150, default='256-Bit TLS & AES Storage')
    card_2_desc = models.TextField(default='Bank-grade TLS 1.3 encryption in transit and AES-256 encrypted databases hosted in tier-3/4 secure facilities.')
    card_2_icon = models.CharField(max_length=80, default='Lock')

    card_3_title = models.CharField(max_length=150, default='Automated File Purging')
    card_3_desc = models.TextField(default='Files uploaded to converters, PDF utilities, and OCR pipelines are processed in memory sandboxes and purged.')
    card_3_icon = models.CharField(max_length=80, default='Trash2')

    card_4_title = models.CharField(max_length=150, default='DPDP Act 2023 Compliance')
    card_4_desc = models.TextField(default='Statutory data principal rights with dedicated Grievance & Data Protection Officers based in Guwahati, Assam.')
    card_4_icon = models.CharField(max_length=80, default='Scale')

    # 4. AEO Direct Summary Box (Generative Engine Optimization)
    aeo_badge = models.CharField(max_length=150, default='AEO Direct Summary • Verified Data Privacy')
    aeo_title = models.CharField(max_length=255, default='How does Axom AI protect and process user data?')
    aeo_description = models.TextField(default='Axom AI enforces strict data privacy under India’s DPDP Act 2023. User conversations and uploaded documents are processed ephemerally in encrypted memory and NEVER used to train public AI models. All network traffic uses TLS 1.3 256-bit encryption, and users can request full data erasure within 48 hours.')
    aeo_point1 = models.CharField(max_length=200, default='Zero Model Training on Private Data')
    aeo_point2 = models.CharField(max_length=200, default='Automated File & Sandbox Purging')
    aeo_point3 = models.CharField(max_length=200, default='Guwahati DPO & 48h Grievance SLA')

    # 5. Data Erasure & Portability Desk Section
    erasure_section_title = models.CharField(max_length=255, default='Data Erasure & Portability Request (DPDP Act 2023)')
    erasure_section_subtitle = models.TextField(default='Exercise your statutory rights to permanently delete, export, or revoke consent for your personal data.')
    erasure_sla_text = models.CharField(max_length=200, default='Verified requests processed by our Guwahati DPO within 48 business hours.')
    erasure_active = models.BooleanField(default=True)

    # 6. FAQ Section Headings
    faq_badge = models.CharField(max_length=150, default='Common Privacy Questions')
    faq_title = models.CharField(max_length=255, default='Frequently Asked Questions Regarding Privacy & Security')
    faq_subtitle = models.TextField(default='Direct, transparent answers regarding model training, file retention, cookies, and your legal rights.')

    # 7. Bottom Assistance CTA Banner
    cta_badge = models.CharField(max_length=150, default='Dedicated Privacy Desk')
    cta_heading = models.CharField(max_length=255, default='Have Questions About Your Data Privacy?')
    cta_subheading = models.TextField(default='Our Data Protection & Grievance Team in Guwahati is ready to assist you with compliance inquiries, data portability requests, or technical clarifications.')
    cta_primary_btn_text = models.CharField(max_length=100, default='Contact Privacy Officer')
    cta_primary_btn_url = models.CharField(max_length=300, default='mailto:support@aiaxom.co.in?subject=Privacy%20Inquiry%20-%20Axom%20AI')
    cta_secondary_btn_text = models.CharField(max_length=100, default='View Terms of Service')
    cta_secondary_btn_url = models.CharField(max_length=300, default='/terms')

    # 8. SEO / GEO / AEO Meta Tags
    meta_title = models.CharField(max_length=255, default='Axom AI Privacy Policy — Data Protection, Security & DPDP Compliance')
    meta_description = models.TextField(default='Axom AI Privacy Policy: Learn how we protect your data, conversations, and uploaded documents. Fully compliant with India’s DPDP Act 2023 with 256-bit encryption and zero training on private data.')
    meta_keywords = models.TextField(default='Axom AI Privacy Policy, Axom AI privacy, Axom AI data privacy, Axom AI data protection, Axom AI security, Axom AI user privacy, Axom AI data security, Axom AI personal data, Axom AI data protection policy, Is Axom AI safe to use, How does Axom AI protect my data, Does Axom AI use my data to train AI models, DPDP Act 2023 AI privacy Assam')
    canonical_url = models.CharField(max_length=300, default='https://aiaxom.co.in/privacy/')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Privacy Policy Page Configuration'
        verbose_name_plural = 'Privacy Policy Page Configuration'

    def __str__(self):
        return "Privacy Policy Page Configuration"


class PrivacySectionModel(models.Model):
    page_config = models.ForeignKey(PrivacyPageConfig, related_name='sections', on_delete=models.CASCADE, null=True, blank=True)
    section_id = models.CharField(max_length=100, default='introduction', help_text='Anchor ID e.g. introduction, data-fiduciary, data-collection')
    title = models.CharField(max_length=255, default='1. Introduction & Scope')
    short_title = models.CharField(max_length=100, default='Introduction', help_text='Short label for sidebar quick navigation')
    content_raw = models.TextField(help_text='Main paragraphs separated by blank lines', default='')
    subsections_json = models.TextField(blank=True, default='[]', help_text='JSON list of subsections [{"subtitle": "...", "paragraphs": ["..."]}]')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Privacy Policy Section'
        verbose_name_plural = 'Privacy Policy Sections'

    def __str__(self):
        return f"[{self.order}] {self.title}"


class PrivacyFAQItem(models.Model):
    page_config = models.ForeignKey(PrivacyPageConfig, related_name='faqs', on_delete=models.CASCADE, null=True, blank=True)
    question = models.CharField(max_length=350)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Privacy FAQ'
        verbose_name_plural = 'Privacy FAQs'

    def __str__(self):
        return self.question


# ==============================================================================
# TERMS OF SERVICE PAGE CONFIGURATION (Standalone Page)
# ==============================================================================

class TermsPageConfig(models.Model):
    # 1. Hero Section
    hero_badge_text = models.CharField(max_length=200, default='Official Legal Agreement • Effective for All Users')
    hero_heading_prefix = models.CharField(max_length=150, default='Axom AI')
    hero_heading_highlight = models.CharField(max_length=150, default='Terms of Service')
    hero_heading_suffix = models.CharField(max_length=150, default='& User Agreement', blank=True)
    hero_subtitle = models.TextField(default='Clear, fair, and legally binding terms governing your access to Axom AI chat assistants, translation engines, document converters, and APIs.')

    # 2. Metadata / Legal Badges Pill Card
    last_updated = models.CharField(max_length=100, default='September 17, 2026')
    effective_date = models.CharField(max_length=100, default='September 17, 2026')
    terms_version = models.CharField(max_length=50, default='2.4')
    organization_text = models.CharField(max_length=255, default='Axom AI (AI Axom)')
    entity_type_text = models.CharField(max_length=255, default='Indian Artificial Intelligence & Document Processing Platform')
    headquarters_text = models.CharField(max_length=255, default='Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)')
    legal_email = models.CharField(max_length=150, default='support@aiaxom.co.in')
    grievance_officer = models.CharField(max_length=200, default='Samarjit Kashyap (samarjitkashyp@gmail.com)')

    # 3. 4 Commercial & Legal Key Highlight Cards
    card_1_title = models.CharField(max_length=150, default='Commercial Output Rights')
    card_1_desc = models.TextField(default='Users on paid plans retain full commercial exploitation rights over generated text, code, translations, and media.')
    card_1_icon = models.CharField(max_length=80, default='Scale')

    card_2_title = models.CharField(max_length=150, default='Zero Lock-in Billing')
    card_2_desc = models.TextField(default='Transparent INR pricing with 100% Indian payment methods (UPI, RuPay, Cards) and 1-click self-service cancellation.')
    card_2_icon = models.CharField(max_length=80, default='CreditCard')

    card_3_title = models.CharField(max_length=150, default='Strict Acceptable Use')
    card_3_desc = models.TextField(default='Zero tolerance for harmful content, automated scraping abuse, reverse engineering, or platform exploitation.')
    card_3_icon = models.CharField(max_length=80, default='ShieldAlert')

    card_4_title = models.CharField(max_length=150, default='Guwahati Legal Jurisdiction')
    card_4_desc = models.TextField(default='Governed by the laws of India and Information Technology Act 2000 under the exclusive jurisdiction of Guwahati courts.')
    card_4_icon = models.CharField(max_length=80, default='Building')

    # 4. AEO Direct Summary Box (Generative Engine Optimization)
    aeo_badge = models.CharField(max_length=150, default='AEO Direct Summary • Terms Overview')
    aeo_title = models.CharField(max_length=255, default='What are the core terms of using Axom AI?')
    aeo_description = models.TextField(default='Users retain full commercial ownership of all text, code, and media generated on paid tiers. Personal use is free. Prohibited activities include illegal content generation, security reverse-engineering, and scraping. Subscriptions can be cancelled anytime with instant automated billing management under Indian consumer laws.')
    aeo_point1 = models.CharField(max_length=200, default='100% Commercial Output Ownership on Paid Plans')
    aeo_point2 = models.CharField(max_length=200, default='Fair Use Quotas & Anti-Abuse Protection')
    aeo_point3 = models.CharField(max_length=200, default='Guwahati Jurisdiction & Indian Law Binding')

    # 5. FAQ Section Headings
    faq_badge = models.CharField(max_length=150, default='Common Terms Questions')
    faq_title = models.CharField(max_length=255, default='Frequently Asked Questions Regarding Terms of Service')
    faq_subtitle = models.TextField(default='Clear answers regarding commercial ownership, licensing, acceptable use, billing, and cancellations.')

    # 6. Bottom Assistance CTA Banner
    cta_badge = models.CharField(max_length=150, default='Legal & Commercial Desk')
    cta_heading = models.CharField(max_length=255, default='Need Clarification on Licensing or Commercial Use?')
    cta_subheading = models.TextField(default='For enterprise licensing agreements, API volume contracts, or legal inquiries, reach out directly to our Guwahati legal desk.')
    cta_primary_btn_text = models.CharField(max_length=100, default='Contact Legal Desk')
    cta_primary_btn_url = models.CharField(max_length=300, default='mailto:support@aiaxom.co.in?subject=Terms%20and%20Licensing%20Inquiry%20-%20Axom%20AI')
    cta_secondary_btn_text = models.CharField(max_length=100, default='Read Privacy Policy')
    cta_secondary_btn_url = models.CharField(max_length=300, default='/privacy')

    # 7. SEO / GEO / AEO Meta Tags
    meta_title = models.CharField(max_length=255, default='Axom AI Terms of Service — Commercial Rights, Licensing & User Agreement')
    meta_description = models.TextField(default='Read the official Terms of Service for Axom AI. Learn about commercial output ownership, subscription billing, acceptable use policy, and legal rights under Indian law.')
    meta_keywords = models.TextField(default='Axom AI Terms of Service, Axom AI terms, Axom AI terms and conditions, Axom AI user agreement, Axom AI commercial rights, Axom AI acceptable use, Axom AI legal terms, AI terms of service India, Axom AI licensing, Axom AI ownership rights')
    canonical_url = models.CharField(max_length=300, default='https://aiaxom.co.in/terms/')
    og_image_url = models.CharField(max_length=500, default='https://aiaxom.co.in/static/dist/hero/assam.avif')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Terms of Service Page Configuration'
        verbose_name_plural = 'Terms of Service Page Configuration'

    def __str__(self):
        return "Terms of Service Page Configuration"


class TermsSectionModel(models.Model):
    page_config = models.ForeignKey(TermsPageConfig, related_name='sections', on_delete=models.CASCADE, null=True, blank=True)
    section_id = models.CharField(max_length=100, default='acceptance', help_text='Anchor ID e.g. acceptance, eligibility, account-security')
    title = models.CharField(max_length=255, default='1. Acceptance of Terms & Legal Binding')
    short_title = models.CharField(max_length=100, default='Acceptance of Terms', help_text='Short label for sidebar quick navigation')
    content_raw = models.TextField(help_text='Main paragraphs separated by blank lines', default='')
    subsections_json = models.TextField(blank=True, default='[]', help_text='JSON list of subsections [{"subtitle": "...", "paragraphs": ["..."]}]')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Terms of Service Section'
        verbose_name_plural = 'Terms of Service Sections'

    def __str__(self):
        return f"[{self.order}] {self.title}"


class TermsFAQItem(models.Model):
    page_config = models.ForeignKey(TermsPageConfig, related_name='faqs', on_delete=models.CASCADE, null=True, blank=True)
    question = models.CharField(max_length=350)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Terms FAQ'
        verbose_name_plural = 'Terms FAQs'

    def __str__(self):
        return self.question
