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
  question?: string;
  answer?: string;
}

export interface PlanComparisonRow {
  feature: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  note?: string;
}

export const DETAILED_PLANS: DetailedPlan[] = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Try Axom AI',
    desc: 'For trying Axom AI and everyday light usage.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyWords: '5,000 AI words / month',
    popular: false,
    ctaText: 'Start Free',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    features: [
      '5,000 AI words per month',
      'AI chat for everyday questions',
      'Assamese, English & Hindi support',
      'Standard AI models',
      'Access to selected AI tools',
      'Limited document & PDF tools (5 conversions/day)',
      '30-day chat history',
      'Standard processing speed',
    ],
    notIncluded: [
      'Voice AI & speech-to-text',
      'AI image generation',
      'Historical Assamese OCR',
      'Interactive study tools & flashcards',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Regular Users',
    desc: 'For students, creators, and regular learners.',
    monthlyPrice: 199,
    yearlyPrice: 159, // billed ₹1,908/yr
    monthlyWords: '50,000 AI words / month',
    popular: false,
    ctaText: 'Upgrade to Starter',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      'Everything in Free, plus:',
      '50,000 AI words per month',
      'Access to advanced AI models',
      'Faster response processing',
      'PDF & document chat (up to 15 MB)',
      'AI Notes & document generation',
      'Extended document conversion tools',
      'More AI tool usage allowance',
      'Chat history and document exports',
      'Priority email support',
    ],
    notIncluded: [
      'Studio Voice AI engine',
      'High-resolution AI image generation',
      'Priority dedicated queue',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    desc: 'For professionals, researchers, and power users.',
    monthlyPrice: 499,
    yearlyPrice: 399, // billed ₹4,788/yr
    monthlyWords: '250,000 AI words / month',
    popular: true,
    ctaText: 'Upgrade to Pro',
    ctaUrl: 'https://chat.aiaxom.co.in/upgrade',
    features: [
      'Everything in Starter, plus:',
      '250,000 AI words per month',
      'Premium AI models with deep reasoning',
      'Priority AI processing queue',
      'Natural Assamese Voice AI',
      'Advanced speech & translation capabilities',
      'AI image generation studio',
      'Advanced OCR & scanned document analysis',
      'Full access to Axom AI productivity tools',
      'Extended chat history & cloud folders',
      'Priority support & GST tax invoices',
    ],
    notIncluded: [],
  },
];

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    feature: 'Monthly AI word quota',
    free: '5,000 words',
    starter: '50,000 words',
    pro: '250,000 words',
  },
  {
    feature: 'Conversational AI Chat',
    free: true,
    starter: true,
    pro: true,
  },
  {
    feature: 'Assamese, English & Hindi Support',
    free: true,
    starter: true,
    pro: true,
  },
  {
    feature: 'AI Model Tier',
    free: 'Basic Models',
    starter: 'Advanced Models',
    pro: 'Premium Deep-Reasoning',
  },
  {
    feature: 'PDF & Document Chat',
    free: 'Limited (5 MB)',
    starter: 'Included (15 MB)',
    pro: 'Deep Analysis (50 MB)',
  },
  {
    feature: 'AI Notes & Study Generator',
    free: 'Limited',
    starter: 'Full Pedagogical Notes',
    pro: 'Full Studio + Flashcards & Mindmaps',
  },
  {
    feature: 'Document Conversions (PDF, Office, Images)',
    free: '5 files / day',
    starter: '50 files / month',
    pro: 'Unlimited High-Speed Queue',
  },
  {
    feature: 'AI Productivity Tools (Diagrams, Code, OCR)',
    free: 'Selected tools',
    starter: 'More access',
    pro: 'Full access to all 33 tools',
  },
  {
    feature: 'Natural Assamese Voice AI',
    free: false,
    starter: 'Limited Audio Notes',
    pro: 'Full 24kHz Studio Engine',
  },
  {
    feature: 'High-Accuracy Translation',
    free: 'Standard',
    starter: 'Advanced Paragraphs',
    pro: 'Deep Technical & Legal',
  },
  {
    feature: 'AI Image Generation',
    free: false,
    starter: false,
    pro: 'Full Image Studio',
  },
  {
    feature: 'Chat History Retention',
    free: '30 days',
    starter: 'Extended (1 Year)',
    pro: 'Lifetime & Cloud Folders',
  },
  {
    feature: 'Processing Speed',
    free: 'Standard',
    starter: 'Faster',
    pro: 'Priority Dedicated Queue',
  },
  {
    feature: 'Support & Invoicing',
    free: 'Community',
    starter: 'Email Support',
    pro: 'Priority Support + GST Invoices',
  },
];

// Backwards compatibility for any components referencing COMPARISON_CATEGORIES
export const COMPARISON_CATEGORIES = [
  {
    category: 'Core Capabilities & Differentiators',
    items: PLAN_COMPARISON_ROWS,
  },
];

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    q: 'Is Axom AI free to use?',
    a: 'Yes. Axom AI has a permanently free plan that you can use without entering a credit card or payment details. The Free plan includes 5,000 AI words per month, conversational AI in Assamese, English, and Hindi, standard document tools (up to 5 conversions per day), and 30-day chat history retention.',
  },
  {
    q: 'What is the main difference between Free, Starter, and Pro?',
    a: 'The main differences are monthly AI word allowances (5K vs 50K vs 250K words), access to advanced and deep-reasoning models, document chat file size limits, access to Assamese Voice AI and Image Generation, and processing queue priority.',
  },
  {
    q: 'Can I upgrade, downgrade, or change my plan anytime?',
    a: 'Yes. You can upgrade or switch between monthly and yearly billing anytime directly from your account settings. Upgrades take effect immediately with instant prorated quota allocation.',
  },
  {
    q: 'Can I cancel my subscription easily?',
    a: 'Yes. You can cancel your subscription at any time with a single click from your billing settings. There are no lock-in contracts, cancellation fees, or awkward phone calls.',
  },
  {
    q: 'What happens when I reach my monthly AI word limit?',
    a: 'Your monthly usage quota resets automatically on your billing date. If you need more capacity before the cycle renews, you can easily upgrade to Pro or top up without losing your chat history or custom notes.',
  },
  {
    q: 'How does payment work in India (UPI, RuPay, Cards)?',
    a: 'All transactions are billed in Indian Rupees (INR) through RBI-compliant, Razorpay-secured checkout. You can pay using Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, MasterCard, and Netbanking from 50+ Indian banks.',
  },
  {
    q: 'Do you provide GST-compliant invoices for business input tax credit?',
    a: 'Yes. During checkout or in your Billing Settings, you can enter your business name and GSTIN to receive automated, GST-compliant tax invoices for 100% Input Tax Credit (ITC) claiming.',
  },
  {
    q: 'Do you offer plans for schools, universities, or government institutions?',
    a: 'Yes. We offer tailored institutional programs and on-premise deployments for schools, universities, colleges, and public administrative bodies across Assam and Northeast India. Contact our team at support@aiaxom.co.in to discuss institutional options.',
  },
];
