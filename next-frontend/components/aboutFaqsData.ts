export interface AboutFaqItem {
  q: string;
  a: string;
  lang?: 'en' | 'as';
}

export const ABOUT_FAQS: AboutFaqItem[] = [
  {
    q: 'What is Axom AI?',
    a: 'Axom AI (stylized as AI Axom, Assam AI, or অসম এআই) is Assam’s flagship indigenous Artificial Intelligence platform headquartered in Guwahati, Assam, India. It combines native Assamese Large Language Models (LLMs), document intelligence, optical character recognition (OCR), image synthesis, and 20+ file utilities to empower students, businesses, and creators across Northeast India.',
    lang: 'en',
  },
  {
    q: 'Who is the founder of Axom AI?',
    a: 'Axom AI was founded and architected by Samarjit Kashyap, an AI researcher and software architect based in Guwahati, Assam. He built the platform to bridge the linguistic digital divide and ensure the Assamese language has sovereign, world-class AI infrastructure.',
    lang: 'en',
  },
  {
    q: 'Where is Axom AI based and headquartered?',
    a: 'Axom AI is based in Guwahati, Assam, India (PIN: 781001, Geo Coordinates: 26.1445° N, 91.7362° E). The platform complies fully with India’s Digital Personal Data Protection (DPDP) Act 2023, ensuring secure domestic data residency.',
    lang: 'en',
  },
  {
    q: 'Does Axom AI support the Assamese language accurately?',
    a: 'Yes. While generic global AI models frequently confuse Assamese and Bengali scripts (such as substituting ‘ৰ’ and ‘ৱ’ with Bengali characters), Axom AI guarantees 99.4% script accuracy. It is trained and fine-tuned on authentic Assamese grammar, literature, regional idioms, and historical context.',
    lang: 'en',
  },
  {
    q: 'What AI tools and features does Axom AI provide?',
    a: 'Axom AI provides an extensive multimodal ecosystem: (1) Conversational AI Chat in Assamese, English, and Hindi; (2) Scanned Assamese & English Document OCR; (3) 20+ PDF & document utilities including PDF to Word, Word to PDF, and Image Converters; (4) Generative AI Image Synthesis (FLUX & Imagen); (5) Real-time Web Search & Synthesis; and (6) Speech-to-Text Voice Mode.',
    lang: 'en',
  },
  {
    q: 'Is Axom AI free to use?',
    a: 'Yes! Axom AI offers a permanent free tier with 5,000 words per month, standard conversational chat, and daily document conversions with zero credit card required. For professionals and institutions, premium plans start at just ₹199/month with direct UPI (Google Pay, PhonePe, Paytm) checkout.',
    lang: 'en',
  },
  {
    q: 'How does Axom AI support students and APSC/UPSC aspirants in Assam?',
    a: 'Students across Assam use Axom AI for exam preparation (APSC, Assam Police, TET, UPSC), conceptual clarification in Assamese, essay generation, grammar checking, and instant summarization of study materials, government notifications, and textbook PDFs.',
    lang: 'en',
  },
  {
    q: 'How can businesses in Assam leverage Axom AI?',
    a: 'Local enterprises, legal firms, educational institutions, and media houses use Axom AI for bilingual customer support, translating agreements and tender notices, extracting text from scanned land and legal records via OCR, and deploying private REST API integrations.',
    lang: 'en',
  },
  {
    q: 'Axom AI কি আৰু ইয়াৰ মূল উদ্দেশ্য কি? (What is Axom AI?)',
    a: 'অসম এআই (Axom AI) হৈছে অসমৰ প্ৰথমটো থলুৱা আৰু স্বতন্ত্ৰ কৃত্ৰিম বুদ্ধিমত্তা প্লেটফৰ্ম। ইয়াৰ মূল লক্ষ্য হৈছে বিশ্বমানৰ কৃত্ৰিম বুদ্ধিমত্তাৰ সুবিধা প্ৰতিগৰাকী অসমীয়া লোকৰ হাতৰ মুঠিত তুলি দিয়া, যাতে ভাষাৰ কোনো বাধা নোহোৱাকৈ আধুনিক প্ৰযুক্তি ব্যৱহাৰ কৰিব পাৰি।',
    lang: 'as',
  },
  {
    q: 'Axom AI কোনে নিৰ্মাণ কৰিছে? (Who built Axom AI?)',
    a: 'Axom AI গুৱাহাটীৰ প্ৰযুক্তিবিদ আৰু এআই আৰ্কিটেক্ট সমৰজিৎ কাশ্যপৰ (Samarjit Kashyap) দ্বাৰা পৰিকল্পিত আৰু বিকশিত কৰা হৈছে। অসমৰ বৌদ্ধিক ঐতিহ্য আৰু ভাষা সংৰক্ষণৰ স্বাৰ্থত এই মঞ্চ প্ৰতিষ্ঠা কৰা হৈছে।',
    lang: 'as',
  },
  {
    q: 'Axom AI-য়ে অসমীয়া ভাষা কিদৰে শুদ্ধকৈ বুজি পায়? (Why is Assamese accuracy high?)',
    a: 'আন্তঃৰাষ্ট্ৰীয় এআইসমূহে সাধাৰণতে অসমীয়া আৰু বাংলা লিপিৰ মাজত খেলিমেলি কৰে। কিন্তু Axom AI-ক অসমৰ ইতিহাস, সাহিত্য আৰু ব্যাকৰণৰ ২৫,০০০+ সমলেৰে প্ৰশিক্ষণ দিয়া হৈছে, যাৰ ফলত ই নিৰ্ভুলভাৱে ‘ৰ’ আৰু ‘ৱ’ ব্যৱহাৰ কৰি শুদ্ধ অসমীয়াত উত্তৰ দিয়ে।',
    lang: 'as',
  },
  {
    q: 'Axom AI কি বিনামূলীয়াকৈ ব্যৱহাৰ কৰিব পাৰি? (Can I use it for free?)',
    a: 'হয়, Axom AI সম্পূৰ্ণ বিনামূলীয়াকৈ আৰম্ভ কৰিব পাৰি। প্ৰতি মাহে ৫,০০০ শব্দৰ বিনামূলীয়া কোটা আৰু দৈনন্দিন ফাইল কনভাৰ্ট সুবিধা সকলোৰে বাবে উপলব্ধ।',
    lang: 'as',
  },
];
