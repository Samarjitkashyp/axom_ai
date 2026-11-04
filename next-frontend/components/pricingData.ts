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
    desc: 'Explore Axom AI and get started with essential AI tools.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyWords: '5,000 AI words',
    popular: false,
    ctaText: 'Get Started Free',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    features: [
      '5,000 AI words per month',
      'Standard AI Chat (Assamese, English & Hindi)',
      'Basic AI model access',
      '5 document conversions per day',
      'Basic PDF & Image Tools',
      'AI Notes Generator (limited)',
      '30-day Chat History',
      'Standard Processing Speed',
    ],
    notIncluded: [
      'Advanced OCR (Assamese & English text)',
      'Premium AI Models & GPU Priority',
      'Interactive Ask-PDF AI Assistant',
      'Assamese AI Voice Mode – Puhor',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'For Regular Users',
    desc: 'More AI power for researchers, students and content creators.',
    monthlyPrice: 199,
    yearlyPrice: 159, // billed ₹1,908/yr
    monthlyWords: '50,000 AI words',
    popular: false,
    ctaText: 'Upgrade to Starter',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '50,000 AI words per month',
      'Access to Advanced AI Models',
      'Faster AI Response Processing',
      '50 Document Conversions per month',
      'Full PDF Editing & Compression',
      'AI Notes & Document Generator',
      'Chat with PDF (limited)',
      'AI Diagram Generator',
      'Chat History Export (PDF & Word)',
      'Priority Email Support',
    ],
    notIncluded: [
      'Advanced OCR for scanned historical Assamese text',
      'Premium AI Models with ultra-fast GPU compute',
      'Assamese AI Voice Mode – Puhor',
      'AI Screenshot-to-Code',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    desc: 'Unlock the complete Axom AI experience with advanced AI capabilities.',
    monthlyPrice: 499,
    yearlyPrice: 399, // billed ₹4,788/yr
    monthlyWords: '250,000 AI words',
    popular: true,
    ctaText: 'Upgrade to Pro',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      '250,000 AI words per month',
      'Access to Premium AI Models',
      'Priority AI Processing',
      'Full Access to 20+ PDF & Office Tools',
      'Advanced OCR (Assamese & English)',
      'AI Chat with PDF & Documents',
      'Assamese AI Voice Mode – Puhor',
      'AI Image Generation',
      'AI Diagram & Screenshot-to-Code',
      'Advanced Image & Video Tools',
      'Extended Chat History & Folders',
      'Priority Support',
    ],
    notIncluded: [
      'Custom Enterprise Knowledge Base & Dedicated SLAs',
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
    q: 'What is the advantage of Axom AI Pro compared to OpenAI ChatGPT Plus?',
    a: 'ChatGPT Plus costs approximately ₹2,000/month ($20 USD) plus international transaction fees and lacks deep regional Assamese fine-tuning. Axom AI Pro costs just ₹499/month, supports native Assamese idioms, local payment via UPI, and includes 20+ integrated document conversion tools, Assamese OCR, and sub-second Indian edge cloud latency.',
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
    category: 'Core AI Models & Intelligence',
    items: [
      { feature: 'Monthly Word Quota', free: '5,000 words', starter: '50,000 words', pro: '250,000 words' },
      { feature: 'AI Chat Intelligence', free: 'Basic', starter: 'Advanced', pro: 'Premium' },
      { feature: 'AI Model Access', free: 'Basic AI Models', starter: 'Advanced AI Models', pro: 'Premium AI Models' },
      { feature: 'Response Processing Speed', free: 'Standard', starter: 'Faster', pro: 'Priority GPU' },
      { feature: 'Native Assamese Fine-Tuning & Nuance', free: true, starter: true, pro: true },
    ],
  },
  {
    category: 'Document & Tool Utilities',
    items: [
      { feature: 'Document Conversions', free: '5 files / day', starter: '50 files / month', pro: 'Higher Quota' },
      { feature: 'PDF & Office Tools', free: 'Basic Tools', starter: 'Full PDF Editing', pro: 'Full Access (20+ Tools)' },
      { feature: 'AI Notes & Study Generator', free: 'Limited', starter: 'Full Access', pro: 'Full Access' },
      { feature: 'Chat with PDF & Documents', free: 'No / Limited', starter: 'Limited (10 MB)', pro: 'Full (25 MB)' },
      { feature: 'OCR (Assamese & English)', free: false, starter: 'Basic OCR', pro: 'Advanced OCR' },
    ],
  },
  {
    category: 'Creative & Multimodal Suites',
    items: [
      { feature: 'AI Diagram Generator', free: false, starter: true, pro: true },
      { feature: 'Screenshot to Code', free: false, starter: 'Limited', pro: true },
      { feature: 'Assamese AI Voice Mode – Puhor', free: false, starter: false, pro: true },
      { feature: 'AI Image Generation', free: false, starter: false, pro: true },
      { feature: 'Advanced Image & Video Tools', free: 'Basic', starter: 'Standard', pro: 'Advanced' },
      { feature: 'Chat History Export (PDF & Word)', free: false, starter: true, pro: true },
    ],
  },
  {
    category: 'History, Privacy & Support',
    items: [
      { feature: 'Chat History Retention', free: '30 days', starter: 'Extended', pro: 'Extended & Folders' },
      { feature: 'Data Residency in India (DPDP Act 2023)', free: true, starter: true, pro: true },
      { feature: 'GST Invoicing & Input Tax Credit', free: false, starter: true, pro: true },
      { feature: 'Customer Support SLA', free: 'Community', starter: 'Priority Email', pro: 'Priority Support' },
    ],
  },
];