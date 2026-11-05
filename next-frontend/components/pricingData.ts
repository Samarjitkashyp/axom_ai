export interface DetailedPlan {
  id: string;
  name: string;
  badge: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyWords: string;
  popular: boolean;
  ctaText: string;
  ctaUrl: string;
  features: string[];
  notIncluded: string[];
}

export interface PricingFaqItem {
  q: string;
  a: string;
}

export const DETAILED_PLANS: DetailedPlan[] = [
  {
    id: 'free',
    name: 'Free',
    badge: 'For Everyone',
    desc: 'Explore Axom AI and get started with essential sovereign AI tools.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyWords: '5,000 AI words',
    popular: false,
    ctaText: 'Get Started Free',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    features: [
      '5,000 AI words per month',
      'Axom AI Brain — Progya (Standard)',
      'Basic Assamese, English & Hindi Chat',
      '5 Document Conversions per day',
      'Basic PDF, Image & Stock Tools',
      'AI Notes Generator (limited)',
      '30-day Chat History',
      '100% Indian Data Sovereignty',
    ],
    notIncluded: [
      'Axom AI Voice — Puhor Studio Voice',
      'Long-form Speech-to-Text — Xuna',
      'Advanced Historical Assamese OCR',
      'Interactive Study Flashcards & Mindmaps',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'For Regular Users',
    desc: 'More AI compute for students, researchers, and regional content creators.',
    monthlyPrice: 199,
    yearlyPrice: 159, // billed ₹1,908/yr
    monthlyWords: '50,000 AI words',
    popular: false,
    ctaText: 'Upgrade to Starter',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '50,000 AI words per month',
      'Axom AI Brain — Progya (Accelerated)',
      'Axom AI Speech — Xuna Audio Notes',
      'Axom AI Bridge — Xetu Translation',
      '50 Document Conversions per month',
      'Full PDF Editing, Merging & Compression',
      'Pedagogical AI Notes Generator',
      'Chat with PDF (up to 15 MB)',
      'AI Diagram Generator (Mermaid Flowcharts)',
      'Chat History Export (PDF & Word .docx)',
    ],
    notIncluded: [
      'Axom AI Voice — Puhor Full Duplex Studio',
      'Historical Assamese Manuscript OCR',
      'Priority Dedicated GPU Allocation',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    desc: 'The complete sovereign AI experience with full multimodal foundation models.',
    monthlyPrice: 499,
    yearlyPrice: 399, // billed ₹4,788/yr
    monthlyWords: '250,000 AI words',
    popular: true,
    ctaText: 'Upgrade to Pro',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '250,000 AI words per month',
      'Full Sovereign Model Suite: Progya, Puhor, Xuna, Xetu',
      'Priority GPU Processing with Deep Reasoning',
      'Axom AI Voice — Puhor (24kHz Studio Engine)',
      'Full Access to 20+ PDF & Office Tools',
      'High-Precision Historical & Scanned Assamese OCR',
      'Deep Chat with PDF & Documents (50 MB)',
      'AI Notes Studio: Flashcards, Quizzes & Mindmaps',
      'AI Screenshot-to-Code & Diagram Generator',
      'AI Image Studio & Multimodal Media Suite',
      'Lifetime Chat Retention & Cloud Folders',
      'Priority Support SLA & GST Invoicing',
    ],
    notIncluded: [
      'Custom Dedicated On-Premise Government LLM',
    ],
  },
];

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    q: 'How much does Axom AI cost in Indian Rupees (INR)?',
    a: 'Axom AI offers three straightforward plans: Free (₹0/month), Starter (₹199/month, or ₹159/mo yearly), and Pro (₹499/month, or ₹399/mo yearly). All prices are in Indian Rupees (INR) with no hidden conversion or overseas transaction charges.',
  },
  {
    q: 'Is Axom AI free to use?',
    a: 'Yes! Axom AI provides a permanently free tier that includes 5,000 words per month, basic Assamese chat, standard document conversions (up to 5 per day), and web chat history retention for 30 days. No credit card is required to sign up.',
  },
  {
    q: 'What payment methods are supported on Axom AI?',
    a: 'We accept all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit and Credit Cards (RuPay, Visa, MasterCard), Net Banking across 50+ Indian banks, and digital wallets. Transactions are protected by 256-bit SSL encryption.',
  },
  {
    q: 'How does the monthly word quota work in Axom AI?',
    a: 'Each prompt and AI response in Assamese, English, or Hindi counts toward your monthly quota. The counter resets automatically on the 1st of every calendar month. You can check your live remaining word balance anytime in your account dashboard.',
  },
  {
    q: 'Can I cancel or change my plan anytime?',
    a: 'Yes, absolutely! There are no long-term contracts or lock-ins. You can upgrade, downgrade, or cancel your subscription at any time with a single click from your Account Settings. If you cancel, your premium benefits remain active until the end of your paid billing period.',
  },
  {
    q: 'Do you offer GST invoices for businesses and companies in India?',
    a: 'Yes. On all paid plans (Starter and Pro), you can enter your company name and GSTIN at checkout or in your Billing Settings to receive automated, GST-compliant tax invoices for input tax credit claims.',
  },
  {
    q: 'What makes Axom AI Pro unique for users across Assam?',
    a: 'Axom AI Pro gives you complete access to our sovereign foundation models — Progya (প্ৰজ্ঞা) 2B dense LLM, Puhor (পোহৰ) 24kHz studio voice engine, Xuna (শুনা) speech recognition, and Xetu (সেতু) translation bridge. It also unlocks 20+ document utilities, high-accuracy Assamese OCR, sub-second latency on Indian cloud infrastructure, and 250,000 monthly AI words with seamless UPI payment.',
  },
  {
    q: 'Are there discounts for students, educators, and schools in Assam?',
    a: 'Yes! We offer special educational programs and group subsidies for students and educational institutions across Assam and the Northeast. Reach out to support@aiaxom.co.in with your institutional email or student ID to unlock academic pricing.',
  },
  {
    q: 'What happens if I reach my monthly word limit?',
    a: 'If you exhaust your monthly quota before the 1st of the month, you can either upgrade to Pro with instant prorated activation or top up your quota without losing existing chats and settings.',
  },
  {
    q: 'Do you offer custom enterprise solutions for organizations?',
    a: 'Yes. For government departments, academic institutions, and enterprises requiring dedicated on-premise LLMs, private RAG knowledge bases, or high-volume custom SLAs, please contact enterprise sales at support@aiaxom.co.in.',
  },
];

export const COMPARISON_CATEGORIES = [
  {
    category: 'Sovereign AI Foundation Models (Research)',
    items: [
      {
        feature: 'Monthly AI Word Quota',
        free: '5,000 words',
        starter: '50,000 words',
        pro: '250,000 words',
      },
      {
        feature: 'Axom AI Brain — Progya (প্ৰজ্ঞা 2B Dense LLM)',
        free: 'Standard Speed',
        starter: 'Accelerated Compute',
        pro: 'Priority GPU & Full Reasoning',
      },
      {
        feature: 'Regional Cultural Grounding (6.19M Records)',
        free: 'Core Knowledge',
        starter: 'Deep Regional Context',
        pro: 'Complete Sovereign Knowledge Base',
      },
      {
        feature: 'Axom AI Voice — Puhor (পোহৰ 24kHz Studio Voice)',
        free: false,
        starter: 'Standard Playback',
        pro: 'Studio Flow-Matching Diffusion (Full Duplex)',
      },
      {
        feature: 'Axom AI Speech — Xuna (শুনা 600M Conformer ASR)',
        free: 'Up to 1 min / clip',
        starter: 'Up to 15 mins / clip',
        pro: 'Unlimited Audio & Lecture ASR',
      },
      {
        feature: 'Axom AI Bridge — Xetu (সেতু Bidirectional Translation)',
        free: 'Basic Sentences',
        starter: 'Document & Paragraph Translation',
        pro: 'High-Precision Legal & Technical Translation',
      },
      {
        feature: 'Axom AI Master — XUWOR (সুঁৱৰ Full-Duplex Multimodal)',
        free: false,
        starter: 'Standard Multimodal',
        pro: 'Full Multimodal Ecosystem (<3.8 GB RAM)',
      },
    ],
  },
  {
    category: 'AI Pedagogical & Study Tools (Tools Suite)',
    items: [
      {
        feature: 'AI Notes Generator (Exam Points, Formulas, Definitions)',
        free: 'Basic Notes (2 pages)',
        starter: 'Full Pedagogical Notes',
        pro: 'Unlimited Deep Notes + Study Packs',
      },
      {
        feature: 'Chat with PDF & Documents (RAG Knowledge Engine)',
        free: 'Limited (5 MB)',
        starter: 'Standard (15 MB)',
        pro: 'Deep Research (50 MB Multi-File)',
      },
      {
        feature: 'Voice Notes Transcriber (Real-time Speech-to-Smart-Notes)',
        free: 'Basic Voice Typing',
        starter: 'Smart Notes & Summaries',
        pro: 'Full Structured Notes + Word Export',
      },
      {
        feature: 'Interactive Study Tools (Flashcards, Quizzes & Mindmaps)',
        free: false,
        starter: 'Standard Quizzes',
        pro: 'Full Flashcards, MCQ Sets & Mindmaps',
      },
      {
        feature: 'AI Diagram Generator (Flowcharts, ER, Cloud Architectures)',
        free: false,
        starter: '20 Diagrams / mo',
        pro: 'Unlimited Mermaid & SVG Architectures',
      },
      {
        feature: 'OCR Text Extraction (Assamese & English Printed/Manuscript)',
        free: false,
        starter: 'Standard Printed OCR',
        pro: 'High-Precision Historical & Scanned OCR',
      },
    ],
  },
  {
    category: '20+ Document & Media Production Utilities (Tools Suite)',
    items: [
      {
        feature: 'Document Conversions (Word, PDF, Excel, PPT, Image)',
        free: '5 files / day',
        starter: '50 files / month',
        pro: 'Unlimited High-Speed Queue',
      },
      {
        feature: 'Full PDF Suite (Merge, Split, Watermark, Sign & Protect)',
        free: 'Basic Operations',
        starter: 'Full PDF Suite',
        pro: 'Full PDF Suite + Priority Processing',
      },
      {
        feature: 'Browser-Based PDF & Image Compression (0 Upload Risk)',
        free: 'Standard',
        starter: 'High Ratio Compression',
        pro: 'Lossless Target-Size Compression',
      },
      {
        feature: 'Media Utilities (Video Compressor, BG Remover, SVG Editor)',
        free: 'Basic Tools',
        starter: 'Standard Export',
        pro: 'Full Access (H.264 Presets, HD BG Remover)',
      },
      {
        feature: 'Screenshot to Code (UI Screenshot to HTML/CSS Code)',
        free: false,
        starter: '10 conversions / mo',
        pro: 'Unlimited Pixel-Perfect Code Generation',
      },
      {
        feature: 'AI Image Studio (Text-to-Image Generation & 4K Stock)',
        free: 'Stock Finder Only',
        starter: 'Standard AI Generation',
        pro: 'High-Resolution Sovereign Image Studio',
      },
    ],
  },
  {
    category: 'History, Sovereign Privacy & Enterprise SLAs',
    items: [
      {
        feature: 'Chat History Retention & Workspace Organization',
        free: '30 Days',
        starter: '1-Year History & Export',
        pro: 'Lifetime Retention, Folders & Cloud Sync',
      },
      {
        feature: 'Export Chat & Study Packs (Formatted Word .docx & PDF)',
        free: false,
        starter: 'Standard Export',
        pro: 'Official Axom AI Branded .docx & PDF',
      },
      {
        feature: '100% Indian Data Sovereignty (DPDP Act 2023 Compliant)',
        free: true,
        starter: true,
        pro: true,
      },
      {
        feature: 'Automated GST Tax Invoices (B2B Input Tax Credit)',
        free: false,
        starter: true,
        pro: true,
      },
      {
        feature: 'Support Channel & Resolution SLA',
        free: 'Community & Docs',
        starter: 'Priority Email (< 24h SLA)',
        pro: 'Dedicated Priority Support & Developer SLA',
      },
    ],
  },
];