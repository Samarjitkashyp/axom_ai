export interface HomeFaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    id: 1,
    question: 'What is Axom AI (Assam AI)?',
    answer:
      'Axom AI (stylized as AI Axom, Assam AI, or অসম এআই) is Assam’s premier indigenous Artificial Intelligence platform headquartered in Guwahati, Assam, India. Developed with native Assamese language models, it delivers conversational AI, scanned document OCR, 20+ document utilities, image synthesis, and real-time regional search to empower over 15 million Assamese speakers across Northeast India.',
    category: 'general',
  },
  {
    id: 2,
    question: 'What makes Axom AI the premier AI platform for Assam?',
    answer:
      'Unlike generic global AI tools that frequently confuse Assamese and Bengali alphabets (such as replacing authentic ‘ৰ’ and ‘ৱ’ with Bengali characters), Axom AI guarantees 99.4% script accuracy. It is specifically fine-tuned on authentic Assamese grammar, literature, regional idioms, and local Assam context (history, governance, education, and geography).',
    category: 'features',
  },
  {
    id: 3,
    question: 'Is Axom AI free to use?',
    answer:
      'Yes! Axom AI offers a permanently free tier that includes 5,000 words per month, conversational chat, and daily document conversions with zero credit card required. For power users, students, and businesses, premium plans start at just ₹199/month with instant UPI (Google Pay, PhonePe, Paytm) checkout.',
    category: 'pricing',
  },
  {
    id: 4,
    question: 'Does Axom AI support the Assamese language accurately?',
    answer:
      'Yes. Axom AI supports native Assamese (অসমীয়া), Romanized Assamese (transliteration), English, and Hindi. You can type in natural Assamese script or phonetic English (e.g., "Mur eta essay likhi diya") and receive authentic, culturally coherent responses.',
    category: 'features',
  },
  {
    id: 5,
    question: 'How is Axom AI different from ChatGPT and Axiom AI?',
    answer:
      'ChatGPT is a global model that treats Assamese as a low-resource language and bills in US Dollars (~₹2,000/mo) via international credit cards. Axiom AI (axiom.ai) is an unrelated foreign browser automation tool. Axom AI (aiaxom.co.in) is Assam’s own sovereign platform featuring deep native Assamese fine-tuning, built-in Assamese OCR, 20+ file tools, Indian UPI payments, and sub-second local edge latency.',
    category: 'general',
  },
  {
    id: 6,
    question: 'What AI tools and features are available on Axom AI?',
    answer:
      'Axom AI offers an end-to-end multimodal suite: (1) AI Chat Assistant; (2) AI Writer for essays, emails, and articles; (3) Image Generator powered by FLUX & Imagen; (4) Document & PDF Analyzer; (5) Code Assistant; (6) Real-time Web Search with citations; (7) Scanned Assamese & English OCR; (8) 20+ PDF converters (Word to PDF, PDF to Word, Image to PDF, JPG, PNG); and (9) Speech-to-Text Voice Mode.',
    category: 'features',
  },
  {
    id: 7,
    question: 'How can students in Assam use Axom AI for APSC & competitive exams?',
    answer:
      'Students across Assam use Axom AI for APSC CCE, Assam Police, TET, and UPSC preparation. It explains complex historical and political topics in bilingual Assamese and English, drafts model essays, checks Assamese grammar, and rapidly summarizes bulky government reports, budget documents, and textbook PDFs.',
    category: 'education',
  },
  {
    id: 8,
    question: 'Can businesses and startups in Assam use Axom AI?',
    answer:
      'Yes. Local businesses, MSMEs, media houses, and legal professionals use Axom AI for bilingual customer communication, translating official tenders and notices, extracting text from scanned land records via OCR, and integrating custom REST API keys for enterprise automation.',
    category: 'business',
  },
  {
    id: 9,
    question: 'Does Axom AI support scanned document OCR and PDF analysis?',
    answer:
      'Yes! Axom AI features smart OCR capable of extracting and translating text from scanned Assamese and English documents, land records (Jamabandi/Chitha), old newspapers, and PDF archives. You can also chat directly with uploaded PDFs to ask questions and extract data.',
    category: 'features',
  },
  {
    id: 10,
    question: 'Where is Axom AI based and who is the founder?',
    answer:
      'Axom AI is headquartered in Guwahati, Assam, India (PIN: 781001). The platform was founded and architected by AI researcher Samarjit Kashyap to provide sovereign AI infrastructure for Northeast India.',
    category: 'general',
  },
  {
    id: 11,
    question: 'Is user data and document history kept private and secure?',
    answer:
      'Yes, 100%. All communications are encrypted with 256-bit SSL/TLS in transit and encrypted at rest. User data is processed under India’s Digital Personal Data Protection (DPDP) Act 2023, and your confidential documents are never sold or used to train public models.',
    category: 'privacy',
  },
  {
    id: 12,
    question: 'What payment methods are supported in India?',
    answer:
      'We support all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, MasterCard, and NetBanking across 50+ Indian banks. All prices are in Indian Rupees (INR) with no hidden international conversion charges, and GST invoices are provided automatically.',
    category: 'pricing',
  },
];
