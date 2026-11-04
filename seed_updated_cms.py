import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axom_ai.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')

from contentcms.models import LandingFeature, LandingUseCase, LandingFAQ

# 1. Update Landing Features
LandingFeature.objects.all().delete()

features_data = [
    {
        'title': 'Axom FuelCheck™ Engine',
        'badge': 'Automotive AI',
        'tagline': 'MoRTH & SIAM E20 Compatibility',
        'description': 'India’s verified automotive compliance engine. Evaluate 60+ Bikes, Scooters, and Cars across 15+ OEMs for E5, E10, E20, and E100 petrol with official manual citations and real-time AI doubt clearing.',
        'icon_class': 'fa-solid fa-gas-pump',
        'gradient_color': 'from-blue-500/20 to-cyan-500/10',
        'action_url': '/tools/fuel-checker',
        'order': 1,
    },
    {
        'title': 'Pedagogical AI Notes Generator',
        'badge': 'Study & Exams',
        'tagline': 'APSC, AHSEC & Word .docx Export',
        'description': 'Converts textbook chapters, syllabus PDFs, and lecture topics into structured study notes with executive summaries, formulas, high-yield exam tips, mind maps, and instant Microsoft Word (.docx) export.',
        'icon_class': 'fa-solid fa-book-open',
        'gradient_color': 'from-amber-500/20 to-orange-500/10',
        'action_url': '/tools/ai-notes-generator',
        'order': 2,
    },
    {
        'title': 'Sovereign Assamese Language LLM',
        'badge': 'Indigenous Model',
        'tagline': 'Progya 2B & 68K Vernacular Tokenizer',
        'description': 'Assam’s foundational intelligence eliminating Bengali script confusion with 99.4% orthographic precision. Grounded in Assam history, literature, administrative terminology, and regional culture.',
        'icon_class': 'fa-solid fa-robot',
        'gradient_color': 'from-emerald-500/20 to-teal-500/10',
        'action_url': 'https://chat.aiaxom.co.in/',
        'order': 3,
    },
    {
        'title': 'Scanned Assamese Document & Jamabandi OCR',
        'badge': 'Document Vision',
        'tagline': 'Historical Land Records & Gazettes',
        'description': 'Extracts and transcribes handwritten or degraded Assamese typography from Jamabandi land records, Chitha registers, court summons, and government gazettes with bilingual query answers.',
        'icon_class': 'fa-solid fa-file-lines',
        'gradient_color': 'from-teal-500/20 to-emerald-500/10',
        'action_url': '/tools/chat-with-pdf',
        'order': 4,
    },
    {
        'title': 'Vernacular Speech & Studio Voice AI',
        'badge': 'Audio AI',
        'tagline': 'Xuna Conformer ASR & Puhor TTS',
        'description': 'Studio-grade 24kHz Flow-Matching Diffusion voice synthesis and vernacular ASR operating at 0.261x RTF on CPU, capturing authentic Brahmaputra valley dialects, accents, and cadence.',
        'icon_class': 'fa-solid fa-microphone',
        'gradient_color': 'from-purple-500/20 to-indigo-500/10',
        'action_url': '/tools/voice-notes-generator',
        'order': 5,
    },
    {
        'title': 'Creative Visual Studio & FLUX Art',
        'badge': 'Generative Studio',
        'tagline': 'FLUX & Diffusion Art Synthesis',
        'description': 'High-definition visual generation powered by FLUX diffusion models. Translates Assamese cultural prompts and modern design briefs into 4K wallpapers, marketing creatives, and custom illustrations.',
        'icon_class': 'fa-solid fa-image',
        'gradient_color': 'from-fuchsia-500/20 to-pink-500/10',
        'action_url': '/tools/ai-image-generator',
        'order': 6,
    },
]

for fd in features_data:
    LandingFeature.objects.create(**fd, is_active=True)

print(f"Created {len(features_data)} LandingFeature records.")

# 2. Update Landing Use Cases (6 Personas)
LandingUseCase.objects.all().delete()

usecases_data = [
    {
        'tab_title': 'Students & Aspirants',
        'audience_key': 'students',
        'icon_class': 'fa-solid fa-graduation-cap',
        'headline': 'Empowering Academic Excellence & State Competitive Exams',
        'description': 'Engineered specifically for APSC CCE, Assam Police, AHSEC, SEBA, and university degree programs.',
        'card_1_title': 'AI Notes Generator',
        'card_1_desc': 'Transform textbooks, syllabi, and reference chapters into structured study notes with executive summaries, formulas, high-yield exam tips, and instant Microsoft Word (.docx) export.',
        'card_1_icon': 'fa-solid fa-book-open',
        'card_1_color': 'text-amber-500',
        'card_2_title': 'Chat with PDF & Study Books',
        'card_2_desc': 'Upload 100+ page syllabus PDFs, reference books, and past question papers for bilingual Assamese-English doubt clearing, citations, and instant flashcard extraction.',
        'card_2_icon': 'fa-solid fa-file-pdf',
        'card_2_color': 'text-blue-500',
        'card_3_title': 'Voice Notes & Lecture Transcriber',
        'card_3_desc': 'Record classroom lectures, seminars, or Assamese group discussions and convert spoken audio into organized revision bullet points with speaker clarity.',
        'card_3_icon': 'fa-solid fa-microphone',
        'card_3_color': 'text-emerald-500',
        'cta_text': 'Launch Notes Generator',
        'cta_url': '/tools/ai-notes-generator',
        'order': 1,
    },
    {
        'tab_title': 'Working Professionals',
        'audience_key': 'professionals',
        'icon_class': 'fa-solid fa-briefcase',
        'headline': 'Accelerating Document Productivity & Regional Compliance',
        'description': 'Tailored for advocates, corporate administrators, chartered accountants, and public sector consultants.',
        'card_1_title': 'Lossless Document Suite',
        'card_1_desc': 'Lossless PDF-to-Word, Word-to-PDF, Excel-to-PDF, and PPT conversion preserving fonts, margins, formulas, and complex data tables without document corruption.',
        'card_1_icon': 'fa-solid fa-file-word',
        'card_1_color': 'text-purple-500',
        'card_2_title': 'Scanned Jamabandi & Record OCR',
        'card_2_desc': 'Extract, transcribe, and summarize historical Assam land records, Jamabandi, Chitha registers, and court summons with bilingual English and Assamese query search.',
        'card_2_icon': 'fa-solid fa-file-lines',
        'card_2_color': 'text-teal-500',
        'card_3_title': 'Bilingual Executive Memos',
        'card_3_desc': 'Draft executive briefings, commercial tenders, and official administrative correspondence in authentic Assamese and English with zero script distortion.',
        'card_3_icon': 'fa-solid fa-robot',
        'card_3_color': 'text-fuchsia-500',
        'cta_text': 'Open Converter Suite',
        'cta_url': '/tools/pdf-to-word',
        'order': 2,
    },
    {
        'tab_title': 'Automotive & Drivers',
        'audience_key': 'automotive',
        'icon_class': 'fa-solid fa-car',
        'headline': 'Certified Ethanol Fuel Compatibility for Indian Vehicles',
        'description': 'Real-time MoRTH and SIAM compliance evaluation for Bikes, Scooters, and Cars nationwide.',
        'card_1_title': 'Axom FuelCheck™',
        'card_1_desc': 'Check if your vehicle (2010–2026) is officially certified for E10, E20, or high-octane XP95 petrol. Instant evaluation across 15+ OEMs with official owner manual citations.',
        'card_1_icon': 'fa-solid fa-gas-pump',
        'card_1_color': 'text-cyan-500',
        'card_2_title': 'Automotive Engineer AI',
        'card_2_desc': 'Get immediate clarity on ethanol phase separation, fuel injector corrosion risks, carburetor vs EFI safety, and mileage changes directly with an automotive AI.',
        'card_2_icon': 'fa-solid fa-wrench',
        'card_2_color': 'text-amber-500',
        'card_3_title': 'Vehicle Document OCR',
        'card_3_desc': 'Upload vehicle registration smart cards, insurance policy PDFs, and manufacturer manuals to extract key dates, warranty clauses, and engine displacement data.',
        'card_3_icon': 'fa-solid fa-file-lines',
        'card_3_color': 'text-emerald-500',
        'cta_text': 'Check Your Vehicle',
        'cta_url': '/tools/fuel-checker',
        'order': 3,
    },
    {
        'tab_title': 'Businesses & MSMEs',
        'audience_key': 'businesses',
        'icon_class': 'fa-solid fa-building',
        'headline': 'Scaling Regional Customer Engagement & Operations',
        'description': 'Connect naturally with over 35 million Assamese and English speaking consumers across Northeast India.',
        'card_1_title': '24/7 Regional Customer Care',
        'card_1_desc': 'Deploy conversational AI support bots that understand colloquial Assamese phrases and English inquiries 24/7 without embarrassing linguistic confusion.',
        'card_1_icon': 'fa-solid fa-comments',
        'card_1_color': 'text-blue-500',
        'card_2_title': 'Invoicing & Catalog Suite',
        'card_2_desc': 'Batch convert inventory spreadsheets, product price lists, and payment receipts to password-protected and watermarked PDF formats.',
        'card_2_icon': 'fa-solid fa-file-excel',
        'card_2_color': 'text-teal-500',
        'card_3_title': 'Vernacular Marketing Copy',
        'card_3_desc': 'Create high-converting Assamese social media advertisements, festival promotional banners, and WhatsApp marketing campaigns tailored to local sentiments.',
        'card_3_icon': 'fa-solid fa-wand-magic-sparkles',
        'card_3_color': 'text-fuchsia-500',
        'cta_text': 'Deploy Support Bot',
        'cta_url': 'https://chat.aiaxom.co.in/',
        'order': 4,
    },
    {
        'tab_title': 'Creators & Designers',
        'audience_key': 'creators',
        'icon_class': 'fa-solid fa-palette',
        'headline': 'Powering Digital Storytelling, Visuals & Regional Media',
        'description': 'Built for digital artists, YouTubers, journalists, and cultural content creators.',
        'card_1_title': 'AI Creative Studio & FLUX Art',
        'card_1_desc': 'Synthesize 4K digital artwork, festival creatives, and cultural illustrations from Assamese and English prompts with FLUX diffusion models.',
        'card_1_icon': 'fa-solid fa-image',
        'card_1_color': 'text-pink-500',
        'card_2_title': 'Creator Asset Suite',
        'card_2_desc': 'One-click Background Remover, Image Compressor, SVG Vector Editor, and Color Palette Generator for rapid YouTube thumbnail and poster production.',
        'card_2_icon': 'fa-solid fa-crop-simple',
        'card_2_color': 'text-purple-500',
        'card_3_title': 'YouTube & Media Tools',
        'card_3_desc': 'Download, compress, and reformat reference video clips, extract audio tracks, and optimize video dimensions for rapid cross-platform social publishing.',
        'card_3_icon': 'fa-solid fa-video',
        'card_3_color': 'text-rose-500',
        'cta_text': 'Launch Image Studio',
        'cta_url': '/tools/ai-image-generator',
        'order': 5,
    },
    {
        'tab_title': 'Developers & Engineers',
        'audience_key': 'developers',
        'icon_class': 'fa-solid fa-code',
        'headline': 'Production-Grade APIs, Vernacular Models & Dev Utilities',
        'description': 'Build regional intelligence into web, mobile, and enterprise architectures with modern REST SDKs.',
        'card_1_title': 'Model Router & Fallback API',
        'card_1_desc': 'Integrate Tier-1 OpenAI (GPT-4o), Tier-2 Gemini, and Tier-3 Groq failover cascades with high-throughput streaming and zero timeout errors.',
        'card_1_icon': 'fa-solid fa-server',
        'card_1_color': 'text-emerald-500',
        'card_2_title': 'Screenshot to Clean Code',
        'card_2_desc': 'Upload design screenshots or wireframes to instantly generate clean, responsive React and Tailwind CSS markup ready for production deployment.',
        'card_2_icon': 'fa-solid fa-laptop-code',
        'card_2_color': 'text-cyan-500',
        'card_3_title': 'Vernacular Tokenizer & SDK',
        'card_3_desc': 'Access the 68,096-token Assamese vocabulary and lightweight Progya / XUWOR endpoints directly via Python SDK and standard HTTP client libraries.',
        'card_3_icon': 'fa-solid fa-microchip',
        'card_3_color': 'text-indigo-500',
        'cta_text': 'Explore Developer Docs',
        'cta_url': '/docs/developer',
        'order': 6,
    },
]

for ud in usecases_data:
    LandingUseCase.objects.create(**ud, is_active=True)

print(f"Created {len(usecases_data)} LandingUseCase records.")

print("Seed completed successfully!")

