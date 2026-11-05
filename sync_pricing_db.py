import os, sys, django

sys.path.insert(0, os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axom_ai.settings')
django.setup()

from contentcms.models import PricingComparisonCategory, PricingComparisonRow, PricingFAQ

# 1. Update PricingFAQ
for faq in PricingFAQ.objects.all():
    if 'chatgpt' in faq.question.lower() or 'openai' in faq.question.lower():
        faq.question = 'What makes Axom AI Pro unique for users across Assam?'
        faq.answer = 'Axom AI Pro gives you complete access to our sovereign foundation models — Progya (প্ৰজ্ঞা) 2B dense LLM, Puhor (পোহৰ) 24kHz studio voice engine, Xuna (শুনা) speech recognition, and Xetu (সেতু) translation bridge. It also unlocks 20+ document utilities, high-accuracy Assamese OCR, sub-second latency on Indian cloud infrastructure, and 250,000 monthly AI words with seamless UPI payment.'
        faq.save()
        print('Updated PricingFAQ:', faq.question)

# 2. Sync comparison categories & rows
categories_data = [
    {
        'name': 'Sovereign AI Foundation Models (Research)',
        'order': 1,
        'rows': [
            {'feature_name': 'Monthly AI Word Quota', 'free_val': '5,000 words', 'starter_val': '50,000 words', 'pro_val': '250,000 words', 'business_val': 'Unlimited'},
            {'feature_name': 'Axom AI Brain — Progya (প্ৰজ্ঞা 2B Dense LLM)', 'free_val': 'Standard Speed', 'starter_val': 'Accelerated Compute', 'pro_val': 'Priority GPU & Full Reasoning', 'business_val': 'Dedicated Private Instance'},
            {'feature_name': 'Regional Cultural Grounding (6.19M Records)', 'free_val': 'Core Knowledge', 'starter_val': 'Deep Regional Context', 'pro_val': 'Complete Sovereign Knowledge Base', 'business_val': 'Custom Domain RAG'},
            {'feature_name': 'Axom AI Voice — Puhor (পোহৰ 24kHz Studio Voice)', 'free_val': 'false', 'starter_val': 'Standard Playback', 'pro_val': 'Studio Flow-Matching Diffusion (Full Duplex)', 'business_val': 'Custom Voice Persona'},
            {'feature_name': 'Axom AI Speech — Xuna (শুনা 600M Conformer ASR)', 'free_val': 'Up to 1 min / clip', 'starter_val': 'Up to 15 mins / clip', 'pro_val': 'Unlimited Audio & Lecture ASR', 'business_val': 'Live Streaming ASR API'},
            {'feature_name': 'Axom AI Bridge — Xetu (সেতু Bidirectional Translation)', 'free_val': 'Basic Sentences', 'starter_val': 'Document & Paragraph Translation', 'pro_val': 'High-Precision Legal & Technical Translation', 'business_val': 'Custom Legal Corpus'},
            {'feature_name': 'Axom AI Master — XUWOR (সুঁৱৰ Full-Duplex Multimodal)', 'free_val': 'false', 'starter_val': 'Standard Multimodal', 'pro_val': 'Full Multimodal Ecosystem (<3.8 GB RAM)', 'business_val': 'Enterprise Multimodal'},
        ]
    },
    {
        'name': 'AI Pedagogical & Study Tools (Tools Suite)',
        'order': 2,
        'rows': [
            {'feature_name': 'AI Notes Generator (Exam Points, Formulas, Definitions)', 'free_val': 'Basic Notes (2 pages)', 'starter_val': 'Full Pedagogical Notes', 'pro_val': 'Unlimited Deep Notes + Study Packs', 'business_val': 'Institutional Licensing'},
            {'feature_name': 'Chat with PDF & Documents (RAG Knowledge Engine)', 'free_val': 'Limited (5 MB)', 'starter_val': 'Standard (15 MB)', 'pro_val': 'Deep Research (50 MB Multi-File)', 'business_val': 'Unlimited RAG Storage'},
            {'feature_name': 'Voice Notes Transcriber (Real-time Speech-to-Smart-Notes)', 'free_val': 'Basic Voice Typing', 'starter_val': 'Smart Notes & Summaries', 'pro_val': 'Full Structured Notes + Word Export', 'business_val': 'Bulk Audio Ingestion'},
            {'feature_name': 'Interactive Study Tools (Flashcards, Quizzes & Mindmaps)', 'free_val': 'false', 'starter_val': 'Standard Quizzes', 'pro_val': 'Full Flashcards, MCQ Sets & Mindmaps', 'business_val': 'LMS / Classroom Sync'},
            {'feature_name': 'AI Diagram Generator (Flowcharts, ER, Cloud Architectures)', 'free_val': 'false', 'starter_val': '20 Diagrams / mo', 'pro_val': 'Unlimited Mermaid & SVG Architectures', 'business_val': 'Team Architecture Hub'},
            {'feature_name': 'OCR Text Extraction (Assamese & English Printed/Manuscript)', 'free_val': 'false', 'starter_val': 'Standard Printed OCR', 'pro_val': 'High-Precision Historical & Scanned OCR', 'business_val': 'Archival Digitization API'},
        ]
    },
    {
        'name': '20+ Document & Media Production Utilities (Tools Suite)',
        'order': 3,
        'rows': [
            {'feature_name': 'Document Conversions (Word, PDF, Excel, PPT, Image)', 'free_val': '5 files / day', 'starter_val': '50 files / month', 'pro_val': 'Unlimited High-Speed Queue', 'business_val': 'High-Volume Batch API'},
            {'feature_name': 'Full PDF Suite (Merge, Split, Watermark, Sign & Protect)', 'free_val': 'Basic Operations', 'starter_val': 'Full PDF Suite', 'pro_val': 'Full PDF Suite + Priority Processing', 'business_val': 'Enterprise PDF Engine'},
            {'feature_name': 'Browser-Based PDF & Image Compression (0 Upload Risk)', 'free_val': 'Standard', 'starter_val': 'High Ratio Compression', 'pro_val': 'Lossless Target-Size Compression', 'business_val': 'Enterprise CDN Delivery'},
            {'feature_name': 'Media Utilities (Video Compressor, BG Remover, SVG Editor)', 'free_val': 'Basic Tools', 'starter_val': 'Standard Export', 'pro_val': 'Full Access (H.264 Presets, HD BG Remover)', 'business_val': 'Video Pipeline Automation'},
            {'feature_name': 'Screenshot to Code (UI Screenshot to HTML/CSS Code)', 'free_val': 'false', 'starter_val': '10 conversions / mo', 'pro_val': 'Unlimited Pixel-Perfect Code Generation', 'business_val': 'Enterprise Code Export'},
            {'feature_name': 'AI Image Studio (Text-to-Image Generation & 4K Stock)', 'free_val': 'Stock Finder Only', 'starter_val': 'Standard AI Generation', 'pro_val': 'High-Resolution Sovereign Image Studio', 'business_val': 'Dedicated Brand LoRAs'},
        ]
    },
    {
        'name': 'History, Sovereign Privacy & Enterprise SLAs',
        'order': 4,
        'rows': [
            {'feature_name': 'Chat History Retention & Workspace Organization', 'free_val': '30 Days', 'starter_val': '1-Year History & Export', 'pro_val': 'Lifetime Retention, Folders & Cloud Sync', 'business_val': 'Custom Retention Policies'},
            {'feature_name': 'Export Chat & Study Packs (Formatted Word .docx & PDF)', 'free_val': 'false', 'starter_val': 'Standard Export', 'pro_val': 'Official Axom AI Branded .docx & PDF', 'business_val': 'White-Label Branding'},
            {'feature_name': '100% Indian Data Sovereignty (DPDP Act 2023 Compliant)', 'free_val': 'true', 'starter_val': 'true', 'pro_val': 'true', 'business_val': 'On-Premise Air-Gapped Option'},
            {'feature_name': 'Automated GST Tax Invoices (B2B Input Tax Credit)', 'free_val': 'false', 'starter_val': 'true', 'pro_val': 'true', 'business_val': 'Custom Purchase Orders'},
            {'feature_name': 'Support Channel & Resolution SLA', 'free_val': 'Community & Docs', 'starter_val': 'Priority Email (< 24h SLA)', 'pro_val': 'Dedicated Priority Support & Developer SLA', 'business_val': 'Dedicated Account Manager & 1-Hour SLA'},
        ]
    }
]

PricingComparisonRow.objects.all().delete()
PricingComparisonCategory.objects.all().delete()

for cat_data in categories_data:
    cat = PricingComparisonCategory.objects.create(
        name=cat_data['name'],
        order=cat_data['order'],
        is_active=True
    )
    for r_idx, r_data in enumerate(cat_data['rows']):
        PricingComparisonRow.objects.create(
            category=cat,
            feature_name=r_data['feature_name'],
            free_val=r_data['free_val'],
            starter_val=r_data['starter_val'],
            pro_val=r_data['pro_val'],
            business_val=r_data.get('business_val', 'true'),
            order=r_idx + 1,
            is_active=True
        )

print('Database comparison categories and FAQs successfully updated!')
