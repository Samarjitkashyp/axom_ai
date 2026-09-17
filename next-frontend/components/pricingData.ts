export interface PricingFaqItem {
  q: string;
  a: string;
}

export interface DetailedPlan {
  id: string;
  name: string;
  badge: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number; // monthly price when billed yearly
  monthlyWords: string;
  popular: boolean;
  ctaText: string;
  ctaUrl: string;
  features: string[];
  notIncluded: string[];
}

export const DETAILED_PLANS: DetailedPlan[] = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Starter AI',
    desc: 'Ideal for students, casual queries & basic Assamese chat.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyWords: '5,000 words',
    popular: false,
    ctaText: 'Get Started Free',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    features: [
      '5,000 words per month',
      'Standard Assamese generation',
      'Llama 3 8B (Fast Basic AI)',
      'Basic document conversions (5 files/day)',
      'Chat history retention (30 days)',
      'Community & Help Center support',
    ],
    notIncluded: [
      'Advanced flagship models (Claude 3.5 Sonnet, Llama 70B)',
      'Scanned Document OCR (Assamese/English)',
      'Full PDF Editor & Compressor',
      'Speech-to-Text Voice Mode',
      'REST API access',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Individual',
    desc: 'Perfect for researchers, creators and daily regular users.',
    monthlyPrice: 199,
    yearlyPrice: 159, // billed ₹1,908/yr
    monthlyWords: '50,000 words',
    popular: false,
    ctaText: 'Upgrade to Starter',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '50,000 words per month',
      '2x Faster response speed',
      'Access to GPT-4o Mini & Gemma 2',
      '50 Document conversions per month',
      'Full PDF Editor (Signatures & Text)',
      'PDF Compressor (Extreme Mode)',
      'Export chat history to PDF & Word',
      'Priority email customer support',
    ],
    notIncluded: [
      'Claude 3.5 Sonnet & Llama 70B',
      'Scanned Document OCR',
      'Team collaboration & API keys',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: '⭐ Most Popular',
    desc: 'Unleash full power: advanced models, OCR & 20+ file tools.',
    monthlyPrice: 499,
    yearlyPrice: 399, // billed ₹4,788/yr
    monthlyWords: '250,000 words',
    popular: true,
    ctaText: 'Upgrade to Pro',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '250,000 words per month',
      'Ultra-fast GPU Compute (Zero Queue)',
      'Claude 3.5 Sonnet & Llama 3.3 70B',
      'Unlimited 20+ PDF & Office Tools',
      'Smart OCR (Extract scanned Assamese/English text)',
      'Interactive Ask-PDF AI Assistant',
      'Speech Voice Mode (Assamese Audio)',
      'Unlimited chat history & folders',
      '24/7 Priority WhatsApp & Ticket Support',
    ],
    notIncluded: [
      'Custom Team workspace & API keys',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Team & API',
    desc: 'For offices, institutions & teams needing high volume & API.',
    monthlyPrice: 1499,
    yearlyPrice: 1199, // billed ₹14,388/yr
    monthlyWords: '1,000,000 words',
    popular: false,
    ctaText: 'Upgrade to Business',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '1,000,000 words per month (1M words)',
      'Up to 5 Team member seats included',
      'Custom Knowledge Base (RAG) upload & indexing',
      'Dedicated REST API Access & API keys',
      'Highest Priority Compute & Enterprise SLAs',
      'All 20+ PDF, Word, & Smart OCR tools',
      'Custom GST invoice & Business billing',
      'Dedicated Account Manager in Guwahati/India',
    ],
    notIncluded: [],
  },
];

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    q: 'How much does Axom AI cost in Indian Rupees (INR)?',
    a: 'Axom AI offers four straightforward plans: Free (₹0/month), Starter (₹199/month, or ₹159/mo yearly), Pro (₹499/month, or ₹399/mo yearly), and Business (₹1,499/month, or ₹1,199/mo yearly). All prices are in Indian Rupees (INR) with no hidden conversion or overseas transaction charges.',
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
    a: 'Yes. On all paid plans (Starter, Pro, and Business), you can enter your company name and GSTIN at checkout or in your Billing Settings to receive automated, GST-compliant tax invoices for input tax credit claims.',
  },
  {
    q: 'What is the advantage of Axom AI Pro compared to OpenAI ChatGPT Plus?',
    a: 'ChatGPT Plus costs approximately ₹2,000/month ($20 USD) plus international transaction fees and lacks deep regional Assamese fine-tuning. Axom AI Pro costs just ₹499/month, supports native Assamese idioms, local payment via UPI, and includes 20+ integrated document conversion tools, Assamese OCR, and sub-second Indian edge cloud latency.',
  },
  {
    q: 'Are there discounts for students, educators, and schools in Assam?',
    a: 'Yes! We offer special educational programs and group subsidies for students and educational institutions across Assam and the Northeast. Reach out to support@aiaxom.co.in with your institutional email or student ID to unlock academic pricing.',
  },
  {
    q: 'What happens if I reach my monthly word limit?',
    a: 'If you exhaust your monthly quota before the 1st of the month, you can either upgrade to a higher tier with instant prorated activation or top up your quota without losing existing chats and settings.',
  },
  {
    q: 'Is API access included in the pricing plans?',
    a: 'Yes. The Business plan includes dedicated REST API keys with high rate limits, allowing developers, agencies, and enterprises to integrate Axom AI’s Assamese LLM and OCR capabilities directly into their web and mobile applications.',
  },
];

export const COMPARISON_CATEGORIES = [
  {
    category: 'Core AI Models & Intelligence',
    items: [
      { feature: 'Monthly Word Quota', free: '5,000 words', starter: '50,000 words', pro: '250,000 words', business: '1,000,000 words (1M)' },
      { feature: 'Basic AI Models (Llama 8B, Gemma 2)', free: true, starter: true, pro: true, business: true },
      { feature: 'Flagship Models (Claude 3.5 Sonnet, Llama 70B)', free: false, starter: false, pro: true, business: true },
      { feature: 'Native Assamese Fine-Tuning & Nuance', free: true, starter: true, pro: true, business: true },
      { feature: 'Real-Time Web Search & Citations', free: 'Standard', starter: 'Fast', pro: 'Ultra-Fast', business: 'Instant Priority' },
    ],
  },
  {
    category: 'Document & Tool Utilities',
    items: [
      { feature: 'Daily Document Conversions', free: '5 files / day', starter: '50 files / mo', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'PDF to Word & Word to PDF Tools', free: 'Standard', starter: 'Full Access', pro: 'Full Access', business: 'Full Access' },
      { feature: 'Image Format Converter (JPG, PNG, WebP)', free: '20 files / day', starter: 'Unlimited', pro: 'Batch Mode (20 files)', business: 'Batch Mode' },
      { feature: 'Smart OCR (Scanned Assamese/English Docs)', free: false, starter: false, pro: true, business: true },
      { feature: 'Interactive Ask-PDF Document Assistant', free: false, starter: 'Up to 10 MB', pro: 'Up to 25 MB', business: 'Up to 100 MB' },
    ],
  },
  {
    category: 'Creative & Multimodal Suites',
    items: [
      { feature: 'AI Image Generation (FLUX & Imagen)', free: '3 images / day', starter: '25 images / mo', pro: '100 images / mo', business: 'Unlimited' },
      { feature: 'Speech Voice Mode (Assamese Audio)', free: false, starter: false, pro: true, business: true },
      { feature: 'Chat History Export (PDF & DOCX)', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    category: 'Security, Team & Enterprise',
    items: [
      { feature: 'Data Residency in India (DPDP Act 2023)', free: true, starter: true, pro: true, business: true },
      { feature: 'Team Member Seats', free: '1 user', starter: '1 user', pro: '1 user', business: 'Up to 5 users' },
      { feature: 'Custom Knowledge Base (RAG) Indexing', free: false, starter: false, pro: false, business: true },
      { feature: 'Dedicated REST API Keys', free: false, starter: false, pro: false, business: true },
      { feature: 'GST Invoicing & Input Tax Credit', free: false, starter: true, pro: true, business: true },
      { feature: 'Customer Support SLA', free: 'Community', starter: 'Email Support', pro: '24/7 Priority WhatsApp', business: 'Dedicated Account Manager' },
    ],
  },
];
