from .models import UseCasesPageConfig, UseCaseSector, UseCaseFAQ

DEFAULT_SECTORS = [
    {
        'sector_id': 'students',
        'badge': 'Academic Excellence',
        'icon_name': 'GraduationCap',
        'color_gradient': 'from-fuchsia-500 to-purple-600',
        'text_color': 'text-fuchsia-700 dark:text-fuchsia-400',
        'border_color': 'border-fuchsia-500/30',
        'title': 'Students, Schools & Higher Education',
        'tagline': 'Personalized 24/7 bilingual tutoring in Assamese and English',
        'description': 'Overcoming textbook and language barriers for school and university students across Assam. Axom AI transforms education by explaining complex STEM and humanities concepts in natural Assamese or English, breaking down step-by-step problem solutions, and generating practice quizzes aligned with SEBA, AHSEC, and CBSE curricula.',
        'capabilities_raw': (
            "Bilingual STEM concept explainer (Physics, Chemistry, Math, Biology)\n"
            "Instant textbook and PDF research paper summarization\n"
            "Grammar-checked Assamese and English essay and application drafting\n"
            "Interactive mock quiz generator with detailed explanations\n"
            "Translation of English lecture notes into natural Assamese"
        ),
        'impact_metric': '40% Time Saved in Study Preparation',
        'cta_text': 'Start Studying with AI Tutor',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 1,
    },
    {
        'sector_id': 'aspirants',
        'badge': 'Competitive Exams',
        'icon_name': 'BookOpen',
        'color_gradient': 'from-amber-500 to-orange-600',
        'text_color': 'text-amber-700 dark:text-amber-400',
        'border_color': 'border-amber-500/30',
        'title': 'APSC, UPSC & Assam Govt Job Aspirants',
        'tagline': 'Deep Assam General Knowledge, History, and Mains answer writing',
        'description': 'Engineered for aspirants preparing for APSC Combined Competitive Examination (CCE), Assam Police, ADRE, and national civil services. Axom AI delivers authoritative historical context (Ahom kingdom, Sukapha, Lachit Borphukan, modern Assam), regional geography, Assam budget analysis, and real-time current affairs synthesis from local publications.',
        'capabilities_raw': (
            "Assam History, Culture & Heritage deep-dive synthesis\n"
            "Mains Answer Writing practice with instant grammatical & factual feedback\n"
            "Daily Assam Current Affairs summaries from trusted regional news sources\n"
            "Assam land laws, tribal policies, and state governance analysis\n"
            "Bilingual drafting practice in Assamese and English"
        ),
        'impact_metric': '3x Faster General Studies Revision',
        'cta_text': 'Practice APSC Prep on Axom AI',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 2,
    },
    {
        'sector_id': 'businesses',
        'badge': 'Enterprise & Commerce',
        'icon_name': 'Briefcase',
        'color_gradient': 'from-emerald-500 to-teal-600',
        'text_color': 'text-emerald-700 dark:text-emerald-400',
        'border_color': 'border-emerald-500/30',
        'title': 'Local Businesses, MSMEs & Startups',
        'tagline': 'Automate regional customer support, marketing, and operations',
        'description': 'Empowering tea garden producers, handloom artisans, local retail chains, and Guwahati startups to scale. Axom AI enables businesses to communicate fluently with 15M+ Assamese speakers, create bilingual digital marketing campaigns, draft customer proposals, and process documents effortlessly.',
        'capabilities_raw': (
            "Automated 24/7 customer query responses in native Assamese & English\n"
            "Bilingual social media marketing copy for WhatsApp, Facebook & Instagram\n"
            "Automated invoice data extraction and spreadsheet insight generation\n"
            "E-commerce product descriptions tailored for regional and national buyers\n"
            "Professional formal correspondence, email, and contract drafting"
        ),
        'impact_metric': '65% Reduction in Customer Support Response Latency',
        'cta_text': 'Empower Your Business with AI',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 3,
    },
    {
        'sector_id': 'legal',
        'badge': 'Law & Governance',
        'icon_name': 'Scale',
        'color_gradient': 'from-blue-500 to-indigo-600',
        'text_color': 'text-blue-700 dark:text-blue-400',
        'border_color': 'border-blue-500/30',
        'title': 'Legal Practitioners, Land Records & Administration',
        'tagline': 'Complex revenue document parsing and bilingual legal drafting',
        'description': 'Assam’s legal and administrative framework involves unique terminology and bilingual records. Axom AI assists advocates, legal clerks, revenue officials, and citizens in understanding complex land records (Chitha, Jamabandi, Pattas), analyzing government circulars, and drafting legal notices with precision.',
        'capabilities_raw': (
            "Deciphering Assamese land revenue terminology and deed clauses\n"
            "Executive summaries of lengthy judicial orders and case laws\n"
            "Bilingual legal notice and affidavit draft generation\n"
            "Parsing Assam Secretariat notifications, gazettes, and public tenders\n"
            "Strict ephemeral memory processing with zero client data retention"
        ),
        'impact_metric': '100% Confidentiality & Data Sovereignty',
        'cta_text': 'Analyze Legal Documents',
        'cta_url': 'https://aiaxom.co.in/tools',
        'order': 4,
    },
    {
        'sector_id': 'healthcare',
        'badge': 'Public Health & Medicine',
        'icon_name': 'Stethoscope',
        'color_gradient': 'from-rose-500 to-pink-600',
        'text_color': 'text-rose-700 dark:text-rose-400',
        'border_color': 'border-rose-500/30',
        'title': 'Healthcare Professionals & Medical Outreach',
        'tagline': 'Democratizing vital health information across linguistic lines',
        'description': 'Bridging communication barriers between doctors, healthcare staff, and rural patients. Axom AI translates technical clinical instructions, prescriptions, and public health guidelines into simple, empathetic colloquial Assamese that patients and families can easily follow.',
        'capabilities_raw': (
            "Translating complex medical diagnoses into clear Assamese patient guides\n"
            "Generating regional health awareness material for community camps\n"
            "Summarizing international medical research into quick clinical briefs\n"
            "Bilingual health intake forms and consultation note structuring\n"
            "Voice transcription assistance for clinical consultations"
        ),
        'impact_metric': 'Zero Translation Misunderstandings',
        'cta_text': 'Explore Healthcare AI Tools',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 5,
    },
    {
        'sector_id': 'creators',
        'badge': 'Media & Creative Arts',
        'icon_name': 'Palette',
        'color_gradient': 'from-violet-500 to-fuchsia-600',
        'text_color': 'text-violet-700 dark:text-violet-400',
        'border_color': 'border-violet-500/30',
        'title': 'Journalists, Writers & Content Creators',
        'tagline': 'High-speed Assamese journalism, scriptwriting, and cultural art',
        'description': 'Empowering the creative voice of Northeast India. Journalists, digital media channels, YouTubers, authors, and poets utilize Axom AI to write breaking news copy, brainstorm narrative arcs, refine Assamese poetic meter, and generate culturally authentic AI imagery featuring Assamese motifs, traditional attire, and landscapes.',
        'capabilities_raw': (
            "Fast breaking news article drafting and editorial headline ideation\n"
            "Engaging scriptwriting for YouTube videos, podcasts, and social media reels\n"
            "Bilingual book, story, and article translation preserving literary tone\n"
            "Photorealistic cultural AI image generation with FLUX & Gemini Imagen\n"
            "Festive and cultural marketing copy for Bihu, Ambubachi, and local events"
        ),
        'impact_metric': '5x Increase in Publishing Cadence',
        'cta_text': 'Generate Assamese Content',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 6,
    },
    {
        'sector_id': 'developers',
        'badge': 'Engineering & Technology',
        'icon_name': 'Code2',
        'color_gradient': 'from-cyan-500 to-blue-600',
        'text_color': 'text-cyan-700 dark:text-cyan-400',
        'border_color': 'border-cyan-500/30',
        'title': 'Software Developers, Engineers & Tech Startups',
        'tagline': 'Full-stack code generation, Indic NLP, and edge computing',
        'description': 'Accelerating software innovation in Guwahati and across Northeast India. Software engineers and startups leverage Axom AI’s coding suite for generating Python, JavaScript, TypeScript, Go, and SQL code, debugging complex stack traces, building regional NLP pipelines, and integrating document automation APIs.',
        'capabilities_raw': (
            "Full-stack code generation, unit testing, and automated bug fixing\n"
            "Fine-tuned Assamese tokenization and Indic text processing scripts\n"
            "OCR text extraction pipelines from scanned Assamese and bilingual PDFs\n"
            "Architecture reviews and system design guidance for cloud applications\n"
            "Sub-second Indian edge API latency for production integrations"
        ),
        'impact_metric': '<0.8s Cloud Execution Latency',
        'cta_text': 'Launch Code Assistant',
        'cta_url': 'https://aiaxom.co.in/tools',
        'order': 7,
    },
]

DEFAULT_USECASES_FAQS = [
    {
        'question': 'How can students and academic researchers in Assam use Axom AI?',
        'answer': 'Students use Axom AI as an interactive bilingual study partner that explains complex STEM, social science, and literature topics in natural Assamese or English. It assists with SEBA, AHSEC, and college curricula, breaks down difficult homework questions step-by-step, summarizes PDF research papers and textbooks, and generates practice quizzes to boost conceptual clarity.',
        'order': 1,
    },
    {
        'question': 'How does Axom AI assist APSC, UPSC, and Assam Government exam aspirants?',
        'answer': 'Axom AI is fine-tuned with comprehensive Assam General Knowledge, history (Ahom dynasty, Moamoria rebellion, Treaty of Yandabo, freedom movement), geography, art, and administrative governance. Aspirants can generate mock exam questions, evaluate subjective answer writing in Assamese and English, and synthesize current affairs from regional newspapers like The Assam Tribune and Asomiya Pratidin.',
        'order': 2,
    },
    {
        'question': 'How can small businesses, MSMEs, and startups in Assam leverage Axom AI?',
        'answer': 'Local businesses use Axom AI to automate Assamese and English customer support, draft professional bilingual invoices, create high-converting marketing campaigns for WhatsApp and Facebook, write e-commerce product descriptions, and translate business communications to reach over 15 million regional consumers across Assam and Northeast India.',
        'order': 3,
    },
    {
        'question': 'Can Axom AI accurately process and translate official government documents and land records?',
        'answer': 'Yes. Axom AI features specialized document intelligence capable of parsing scanned PDFs, official Assam Secretariat circulars, tender notices, and land revenue terminology (such as Chitha, Jamabandi, and Dag numbers). It extracts critical dates, clauses, and summaries, and translates seamlessly between Assamese and English.',
        'order': 4,
    },
    {
        'question': 'How do legal practitioners and administrative officers use Axom AI?',
        'answer': 'Advocates and administrators rely on Axom AI to analyze dense legal agreements, extract contractual obligations, summarize judicial judgments, draft bilingual legal notices, and transcribe spoken Assamese audio statements. All document processing operates in ephemeral, secure memory with zero data leakage.',
        'order': 5,
    },
    {
        'question': 'How can healthcare professionals and public health workers utilize Axom AI?',
        'answer': 'Doctors, nurses, and rural health workers use Axom AI to translate medical diagnosis instructions into simple, colloquial Assamese that patients easily comprehend. It helps generate healthcare awareness pamphlets for community health camps, draft patient history notes, and digest medical literature.',
        'order': 6,
    },
    {
        'question': 'How does Axom AI empower Assamese journalists, writers, and digital content creators?',
        'answer': 'Writers, poets, and digital creators use Axom AI to draft Assamese news stories, script YouTube videos and social media reels, brainstorm cultural campaign concepts for Bihu and festive seasons, check grammar and vocabulary, and generate photorealistic cultural AI imagery using FLUX.',
        'order': 7,
    },
    {
        'question': 'Why should developers and tech companies choose Axom AI over generic overseas models?',
        'answer': 'Generic international models struggle with Assamese syntax, regional idioms, and cultural context. Axom AI provides low-latency Indian edge cloud routing (<0.8s TTFB), fine-tuned Assamese tokenizers, REST API integrations, and sovereign data residency compliant with India’s Digital Personal Data Protection (DPDP) Act 2023.',
        'order': 8,
    },
    {
        'question': 'Is my personal, student, or corporate data safe on Axom AI?',
        'answer': 'Yes, 100%. Data privacy is our cornerstone. All user interactions and document uploads are protected with enterprise-grade 256-bit SSL/TLS encryption. Files are processed in isolated transient buffers and are never used to train public foundation models or shared with advertisers.',
        'order': 9,
    },
    {
        'question': 'Is Axom AI free to use for students and everyday users?',
        'answer': 'Yes! Axom AI provides generous free daily quotas for AI Chat, creative writing, document analysis, and file conversion without requiring credit card details. Students and casual users can get started immediately, while professionals and businesses can upgrade to Pro for unlimited usage.',
        'order': 10,
    },
]


def ensure_usecases_defaults():
    """Ensure UseCasesPageConfig, 7 default sectors, and 10 default FAQs exist in the database."""
    config = UseCasesPageConfig.objects.first()
    if not config:
        config = UseCasesPageConfig.objects.create()

    # Seed sectors if none exist
    if UseCaseSector.objects.count() == 0:
        for s in DEFAULT_SECTORS:
            UseCaseSector.objects.create(
                page_config=config,
                sector_id=s['sector_id'],
                badge=s['badge'],
                icon_name=s['icon_name'],
                color_gradient=s['color_gradient'],
                text_color=s['text_color'],
                border_color=s['border_color'],
                title=s['title'],
                tagline=s['tagline'],
                description=s['description'],
                capabilities_raw=s['capabilities_raw'],
                impact_metric=s['impact_metric'],
                cta_text=s['cta_text'],
                cta_url=s['cta_url'],
                order=s['order'],
                is_active=True,
            )

    # Seed FAQs if none exist
    if UseCaseFAQ.objects.count() == 0:
        for f in DEFAULT_USECASES_FAQS:
            UseCaseFAQ.objects.create(
                page_config=config,
                question=f['question'],
                answer=f['answer'],
                order=f['order'],
                is_active=True,
            )

    return config
