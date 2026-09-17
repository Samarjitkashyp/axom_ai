export interface FullFaqItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'assamese' | 'features' | 'pricing' | 'privacy' | 'assamese_native';
  tags: string[];
}

export const FULL_FAQS_LIST: FullFaqItem[] = [
  // 1. General & Brand
  {
    id: 1,
    question: 'What is Axom AI?',
    answer:
      'Axom AI (stylized as AI Axom, Assam AI, or অসম এআই) is Assam’s premier indigenous Artificial Intelligence platform headquartered in Guwahati, Assam, India. Developed with native Assamese language models, it delivers conversational AI chat, scanned document OCR, 20+ file utilities, generative image synthesis, and real-time regional search to empower over 15 million Assamese speakers across Northeast India.',
    category: 'general',
    tags: ['overview', 'about', 'what is axom ai', 'assam ai', 'guwahati'],
  },
  {
    id: 2,
    question: 'How does Axom AI work?',
    answer:
      'Axom AI uses a hybrid architecture combining fine-tuned regional language models, Retrieval-Augmented Generation (RAG) indexed over 25,000+ Assamese historical and educational articles, ultra-fast Groq LPU compute, and leading foundation models (Gemini 2.5, Claude 3.5 Sonnet, and FLUX). When you ask a query, it routes to the optimal model to deliver authentic, sub-second responses.',
    category: 'general',
    tags: ['how it works', 'architecture', 'technology', 'rag'],
  },
  {
    id: 3,
    question: 'How do I start using Axom AI?',
    answer:
      'You can start completely free in less than 30 seconds! Simply visit https://chat.aiaxom.co.in/, click "Sign in" or "Get Started", sign up with your Google account or email, and immediately begin chatting in Assamese or using our document tools with zero setup.',
    category: 'general',
    tags: ['start', 'signup', 'free account', 'login'],
  },
  {
    id: 4,
    question: 'Who created Axom AI and where is it based?',
    answer:
      'Axom AI was founded and architected by AI researcher Samarjit Kashyap. The platform is based and headquartered in Guwahati, Assam, India (PIN: 781001), built specifically to give Northeast India sovereign, world-class artificial intelligence infrastructure.',
    category: 'general',
    tags: ['founder', 'samarjit kashyap', 'guwahati', 'headquarters'],
  },
  {
    id: 5,
    question: 'Who can use Axom AI?',
    answer:
      'Axom AI is built for everyone in Assam and beyond: students preparing for APSC/UPSC exams, teachers and professors, writers and journalists, lawyers analyzing bilingual contracts, local shop owners and MSMEs, and software developers needing coding assistance and API access.',
    category: 'general',
    tags: ['audience', 'students', 'businesses', 'lawyers', 'creators'],
  },

  // 2. Assamese Language Support
  {
    id: 6,
    question: 'Does Axom AI support the Assamese language?',
    answer:
      'Yes, exceptionally well! Axom AI is Assamese-first by design. It supports native Assamese script (অসমীয়া), Romanized/Phonetic Assamese (e.g., "Moi etiya ki korim?"), English, and Hindi. It naturally replies in fluent, grammatically authentic Assamese.',
    category: 'assamese',
    tags: ['assamese', 'language support', 'phonetic', 'assamese chat'],
  },
  {
    id: 7,
    question: 'How does Axom AI understand Assamese without script errors?',
    answer:
      'Generic global models (like standard ChatGPT) frequently confuse Assamese with Bengali, erroneously replacing authentic Assamese letters like ‘ৰ’ and ‘ৱ’ with Bengali characters. Axom AI was custom fine-tuned on authentic Assamese grammar, literature, and regional dictionaries, guaranteeing 99.4% script accuracy.',
    category: 'assamese',
    tags: ['accuracy', 'script', 'nlp', 'bengali vs assamese'],
  },
  {
    id: 8,
    question: 'Can Axom AI translate between English and Assamese?',
    answer:
      'Yes. Axom AI features high-precision bidirectional translation powered by IndicTrans2. You can paste English paragraphs, legal notices, or essays and receive natural Assamese translations, or vice versa, preserving cultural nuances and technical context.',
    category: 'assamese',
    tags: ['translation', 'english to assamese', 'assamese to english', 'indictrans2'],
  },
  {
    id: 9,
    question: 'Does Axom AI support Assamese voice speech-to-text?',
    answer:
      'Yes! Axom AI Pro includes Voice Mode supporting Assamese audio recognition and transcription, allowing you to speak directly in your regional dialect and receive intelligent spoken or text responses.',
    category: 'assamese',
    tags: ['voice mode', 'speech to text', 'audio', 'assamese voice'],
  },

  // 3. AI Models & Tools
  {
    id: 10,
    question: 'What AI models power Axom AI?',
    answer:
      'Axom AI employs an intelligent multi-model ensemble: Google Gemini 2.5 Pro / Flash for fast reasoning, Claude 3.5 Sonnet and Llama 3.3 70B for deep research and programming, FLUX.1 and Imagen for photorealistic visuals, and fine-tuned IndicTrans2 for Indic NLP.',
    category: 'features',
    tags: ['models', 'gemini', 'claude', 'flux', 'llama'],
  },
  {
    id: 11,
    question: 'What AI tools are included in Axom AI?',
    answer:
      'Axom AI includes a full multimodal suite: (1) AI Chat Assistant, (2) AI Writer, (3) FLUX Image Generator, (4) Document & PDF Analyzer, (5) Code Assistant, (6) Real-time Web Search with citations, (7) Scanned Document OCR, and (8) 20+ PDF converters (Word to PDF, PDF to Word, Image to PDF, JPG, PNG).',
    category: 'features',
    tags: ['tools', 'pdf tools', 'image generator', 'code assistant'],
  },
  {
    id: 12,
    question: 'Can Axom AI analyze PDFs and summarize long documents?',
    answer:
      'Yes. You can upload PDFs, Word documents (.docx), and Excel spreadsheets (.xlsx, .csv). Axom AI indexes the content instantly, generates executive summaries, highlights key takeaways, and lets you ask questions directly to your documents.',
    category: 'features',
    tags: ['pdf analyzer', 'summarize', 'ask pdf', 'documents'],
  },
  {
    id: 13,
    question: 'Does Axom AI support scanned Assamese document OCR?',
    answer:
      'Yes! Axom AI features built-in OCR capable of reading scanned Assamese and English text from mobile photos, scanned land deeds (Jamabandi/Chitha), old gazettes, court orders, and book pages, converting them into editable text.',
    category: 'features',
    tags: ['ocr', 'scanned documents', 'land records', 'assamese ocr'],
  },
  {
    id: 14,
    question: 'Can Axom AI search the live web for current events?',
    answer:
      'Yes. When you ask about recent news, Assam government recruitment notices, exam results, sports, or market prices, Axom AI performs real-time web retrieval via Tavily Search and synthesizes updated answers with verifiable source links.',
    category: 'features',
    tags: ['web search', 'live search', 'tavily', 'current news'],
  },
  {
    id: 15,
    question: 'Can Axom AI generate AI images and artwork?',
    answer:
      'Yes. You can generate stunning photorealistic artwork, cinematic landscapes, logos, and Assamese cultural imagery (like Bihu dance, Kaziranga rhinos, and tea gardens) using state-of-the-art text-to-image models including FLUX.1 and Gemini Imagen.',
    category: 'features',
    tags: ['image generation', 'flux', 'art', 'graphics'],
  },
  {
    id: 16,
    question: 'Can Axom AI write, debug, and explain code?',
    answer:
      'Yes. The Code Assistant helps developers and students write, debug, and explain code in Python, JavaScript, TypeScript, C++, Java, SQL, and HTML/CSS with step-by-step documentation and optimization tips.',
    category: 'features',
    tags: ['code assistant', 'python', 'javascript', 'developer tools'],
  },

  // 4. Pricing & Plans
  {
    id: 17,
    question: 'Is Axom AI free to use?',
    answer:
      'Yes, 100%! Axom AI provides a permanent free tier with 5,000 words per month, conversational chat, and daily document conversions with zero credit card required.',
    category: 'pricing',
    tags: ['free tier', 'pricing', 'no card needed'],
  },
  {
    id: 18,
    question: 'What are the paid pricing plans for Axom AI in Indian Rupees (INR)?',
    answer:
      'Axom AI offers 4 clear tiers: Free (₹0/mo), Starter (₹199/mo or ₹159/mo yearly with 50,000 words & PDF editor), Pro (₹499/mo or ₹399/mo yearly with 250,000 words, Claude 3.5 Sonnet, OCR, and voice mode), and Business (₹1,499/mo with 1M words, 5 team seats, and REST APIs).',
    category: 'pricing',
    tags: ['pricing plans', 'starter', 'pro', 'business', 'inr'],
  },
  {
    id: 19,
    question: 'What payment methods do you accept in India?',
    answer:
      'We accept all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, MasterCard, and NetBanking across 50+ Indian banks. All prices are in Indian Rupees (INR) with zero international forex markups.',
    category: 'pricing',
    tags: ['payment methods', 'upi', 'gpay', 'phonepe', 'paytm', 'rupay'],
  },
  {
    id: 20,
    question: 'Can I cancel or upgrade my subscription anytime?',
    answer:
      'Yes, absolutely. There are no contracts or cancellation penalties. You can upgrade, downgrade, or cancel your subscription at any time with a single click from your Account Settings. If cancelled, your paid benefits stay active until the end of your billing cycle.',
    category: 'pricing',
    tags: ['cancel subscription', 'upgrade', 'refund policy', 'no lockin'],
  },
  {
    id: 21,
    question: 'Do you offer GST invoices for businesses and companies?',
    answer:
      'Yes. On all paid plans, you can provide your registered company name and GSTIN during checkout or in your Billing Settings to receive automated, compliant tax invoices for Input Tax Credit (ITC).',
    category: 'pricing',
    tags: ['gst invoice', 'business billing', 'tax credit'],
  },

  // 5. Privacy & Security
  {
    id: 22,
    question: 'Is my data and document content secure with Axom AI?',
    answer:
      'Yes, security is our top priority. All communications are protected with 256-bit SSL/TLS encryption in transit and encrypted at rest. Data is stored on secure Indian cloud servers complying fully with India’s Digital Personal Data Protection (DPDP) Act 2023.',
    category: 'privacy',
    tags: ['security', 'privacy', 'dpdp act', 'encryption', 'data safety'],
  },
  {
    id: 23,
    question: 'Does Axom AI use my private documents to train public AI models?',
    answer:
      'No, never. Your uploaded files, personal notes, and chat conversations remain strictly private to your account and are never sold, exposed, or used to train public commercial AI models.',
    category: 'privacy',
    tags: ['model training', 'private documents', 'confidentiality'],
  },
  {
    id: 24,
    question: 'Can I delete my chat history and uploaded files?',
    answer:
      'Yes. You have complete control over your data. You can delete individual chats, clear your entire conversation history, or purge uploaded files at any time with immediate effect.',
    category: 'privacy',
    tags: ['delete data', 'clear history', 'user control'],
  },
  {
    id: 25,
    question: 'How can I contact customer support if I need assistance?',
    answer:
      'You can reach our dedicated support desk at support@aiaxom.co.in or samarjitkashyp@gmail.com. Pro and Business plan users also receive priority WhatsApp assistance and direct account management.',
    category: 'general',
    tags: ['support', 'customer care', 'email', 'contact'],
  },

  // 6. Assamese Native Questions (অসমীয়া প্ৰশ্নোত্তৰ)
  {
    id: 26,
    question: 'Axom AI কি আৰু ইয়াৰ মূল সুবিধা কি? (What is Axom AI in Assamese)',
    answer:
      'Axom AI (অসম এআই) হৈছে অসমৰ প্ৰথমটো থলুৱা আৰু সম্পূৰ্ণ স্বতন্ত্ৰ কৃত্ৰিম বুদ্ধিমত্তা প্লেটফৰ্ম। ইয়াৰ দ্বাৰা আপুনি বিশুদ্ধ অসমীয়া ভাষাত কথা পাতিব পাৰে, তথ্য বিচাৰিব পাৰে, প্ৰবন্ধ লিখাব পাৰে, আৰু ২০+ ফাইল কনভাৰ্ট সঁজুলি ব্যৱহাৰ কৰিব পাৰে।',
    category: 'assamese_native',
    tags: ['অসম এআই', 'থলুৱা এআই', 'অসমীয়া চ্যাটবট'],
  },
  {
    id: 27,
    question: 'Axom AI-য়ে অসমীয়া ভাষা কিদৰে নিৰ্ভুলকৈ বুজি পায়? (How it understands Assamese)',
    answer:
      'গোলকীয় এআইসমূহে সাধাৰণতে অসমীয়া আৰু বাংলা আখৰৰ মাজত খেলিমেলি কৰে। কিন্তু Axom AI-ক অসমৰ ইতিহাস, সংস্কৃতি আৰু ব্যাকৰণৰ ২৫,০০০+ সমলেৰে প্ৰশিক্ষণ দিয়া হৈছে, যিয়ে ১০০% নিৰ্ভুল অসমীয়া উত্তৰ দিয়ে।',
    category: 'assamese_native',
    tags: ['নিৰ্ভুল অসমীয়া', 'অসমীয়া লিপি', 'ব্যাকৰণ'],
  },
  {
    id: 28,
    question: 'Axom AI কি বিনামূলীয়াকৈ ব্যৱহাৰ কৰিব পাৰি? (Is it free in Assamese)',
    answer:
      'হয়, Axom AI সকলোৰে বাবে সম্পূৰ্ণ বিনামূলীয়াকৈ আৰম্ভ কৰিব পাৰি। প্ৰতি মাহে ৫,০০০ শব্দৰ বিনামূলীয়া কোটা আৰু দৈনন্দিন ফাইল সঁজুলি কোনো ক্ৰেডিট কাৰ্ড নোহোৱাকৈয়ে উপলব্ধ।',
    category: 'assamese_native',
    tags: ['বিনামূলীয়া', 'ফ্ৰী এআই', 'কোটা'],
  },
  {
    id: 29,
    question: 'Axom AI-ত মোৰ নথি-পত্ৰ আৰু তথ্য সুৰক্ষিত নেকি? (Is my data secure)',
    answer:
      'হয়, আপোনাৰ সকলো তথ্য ২৫৬-বিট এনক্ৰিপচনৰ দ্বাৰা সম্পূৰ্ণ সুৰক্ষিত থাকে। ভাৰতৰ DPDP Act 2023 নীতি অনুসৰি আপোনাৰ ব্যক্তিগত নথিপত্ৰ কোনো তৃতীয় পক্ষৰ সৈতে ভগাই লোৱা নহয়।',
    category: 'assamese_native',
    tags: ['তথ্য সুৰক্ষা', 'এনক্ৰিপচন', 'গোপনীয়তা'],
  },
  {
    id: 30,
    question: 'Axom AI-ত PDF আৰু স্কেন কৰা নথি পঢ়িব পাৰিনে? (Can it read scanned PDFs)',
    answer:
      'হয়, Axom AI-ত স্মাৰ্ট OCR প্ৰযুক্তি আছে, যাৰ দ্বাৰা পুৰণি অসমীয়া বাতৰিকাকত, মাটিৰ জমাবন্দী/চিঠা, আৰু স্কেন কৰা চৰকাৰী নথিৰ পৰা পাঠ চিনাক্ত কৰি অনুবাদ বা সংক্ষিপ্তকৰণ কৰিব পাৰি।',
    category: 'assamese_native',
    tags: ['অসমীয়া OCR', 'জমাবন্দী', 'নথি সংক্ষিপ্তকৰণ'],
  },
];
