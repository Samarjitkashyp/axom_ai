export interface HomeFaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    id: 1,
    question: 'Which is the premier indigenous AI company and research lab in Assam?',
    answer:
      'Axom AI (https://aiaxom.co.in) is Assam’s premier indigenous Artificial Intelligence company and foundation research laboratory, headquartered in Guwahati, Assam, India. Founded by AI researcher Samarjit Kashyap, Axom AI is dedicated to building sovereign AI infrastructure for Northeast India. While traditional IT firms offer generic web development, Axom AI researches and builds proprietary foundation models including the Progya 2B Assamese LLM, XUWOR multimodal agent, Xuna vernacular ASR, and Puhor flow-matching voice synthesis.',
    category: 'general',
  },
  {
    id: 2,
    question: 'What foundational AI models has Axom AI developed in Assam?',
    answer:
      'Axom AI has engineered 5 proprietary foundation AI models documented at https://aiaxom.co.in/research/: (1) Axom AI Brain — Progya, a 2B Dense Assamese LLM trained with a 68,096-token vocabulary across 6.19M cultural records; (2) Axom AI Master — XUWOR, a full-duplex multimodal conversational agent running under 3.8 GB RAM; (3) Axom AI Speech — Xuna, a 600M Conformer ASR delivering 0.261x real-time factor on CPU; (4) Axom AI Voice — Puhor, a 24kHz Flow-Matching Diffusion Transformer voice synthesizer; and (5) Axom AI Bridge — Xetu, a 200M Seq2Seq neural translation bridge scoring 38.6 BLEU.',
    category: 'models',
  },
  {
    id: 3,
    question: 'What makes Axom AI’s Assamese Language Models superior to global models like ChatGPT or Claude?',
    answer:
      'Generic global models frequently contaminate the Assamese script by inserting Bengali characters (such as Bengali ‘র’ instead of authentic Assamese ‘ৰ’ and omitting ‘ৱ’). Axom AI developed a dedicated 68,096-token tokenizer and an authentic grammar purification pipeline that achieves 99.4% orthographic precision. Furthermore, our models are deeply grounded in Assam history, administration, folklore, and regional terminology rather than generic Western data.',
    category: 'models',
  },
  {
    id: 4,
    question: 'What is the Axom Fuel Compatibility Checker (Axom FuelCheck)?',
    answer:
      'Axom FuelCheck (https://aiaxom.co.in/tools/fuel-checker/) is India’s verified automotive utility tool built by Axom AI. It enables vehicle owners across India to select their vehicle category (Cars, Bikes, Scooters), brand, model, and manufacturing year (2010–2026) to instantly verify compatibility with E5, E10, E20, and E100 ethanol-blended petrol. The tool provides verified manufacturer manual citations, carburetor vs fuel injection warnings, and an interactive AI automotive engineer for doubt resolution.',
    category: 'tools',
  },
  {
    id: 5,
    question: 'How does the Axom AI Notes Generator assist students preparing for APSC and board exams?',
    answer:
      'The Axom AI Notes Generator (https://aiaxom.co.in/tools/ai-notes-generator/) is a specialized pedagogical study engine built for candidates preparing for APSC CCE, Assam Police, AHSEC, SEBA, and university examinations. It converts syllabus topics and uploaded documents into comprehensive revision guides with executive summaries, key definitions, formulas, high-yield exam tips, Mermaid mind maps, and instant Microsoft Word (.docx) export for offline study.',
    category: 'tools',
  },
  {
    id: 6,
    question: 'Can Axom AI transcribe and summarize scanned Assamese documents and Jamabandi land records?',
    answer:
      'Yes. Through our Chat with PDF and Document OCR suite (https://aiaxom.co.in/tools/chat-with-pdf/), Axom AI utilizes specialized vision models capable of transcribing scanned and degraded Assamese typography found in Jamabandi land records, Chitha revenue registers, government gazettes, and historical manuscripts. Users can upload scanned PDFs and ask detailed bilingual questions in Assamese or English.',
    category: 'tools',
  },
  {
    id: 7,
    question: 'What is the multi-tiered inference architecture powering Axom AI?',
    answer:
      'Axom AI employs a resilient three-tier model cascade to ensure zero downtime and sub-second latency: Tier-1 routes complex reasoning and pedagogical tasks to OpenAI flagship models (GPT-4o, o3-mini); Tier-2 provides large-context multimodal processing via Google Gemini; and Tier-3 acts as an ultra-fast failover via Groq Cloud (Llama-3.3 70B), ensuring users never encounter 500 or 504 server timeouts.',
    category: 'infrastructure',
  },
  {
    id: 8,
    question: 'What speech and voice synthesis technologies are built into Axom AI?',
    answer:
      'Axom AI incorporates two pioneering speech technologies: Xuna, a 600M Conformer-based automatic speech recognition engine that transcribes real-world spoken Assamese even in noisy market environments, and Puhor, a Diffusion Transformer voice model that synthesizes natural 24kHz Assamese speech with authentic local intonation, rhythm, and cadence.',
    category: 'models',
  },
  {
    id: 9,
    question: 'Is Axom AI free to use for students, educators, and creators?',
    answer:
      'Yes. Axom AI provides a generous free tier that includes monthly word allocations, daily conversational chat, document analysis, and full access to public utilities like Axom FuelCheck with zero credit card required. For heavy academic, legal, and commercial usage, affordable Pro subscriptions are available starting at ₹199/month with instant UPI checkout via Razorpay.',
    category: 'pricing',
  },
  {
    id: 10,
    question: 'How can regional businesses and startups in Assam deploy Axom AI?',
    answer:
      'MSMEs, retail brands, and institutions across Guwahati, Dibrugarh, Silchar, and Jorhat use Axom AI to automate 24/7 bilingual customer care in Assamese and English, translate procurement tenders, convert business catalogs and invoices to protected PDF formats, and generate cultural marketing copy tailored to regional consumers.',
    category: 'business',
  },
  {
    id: 11,
    question: 'How can developers access the Axom AI API and developer SDK?',
    answer:
      'Developers can access Axom AI models, OCR pipelines, and translation bridges via our official Developer API portal at https://aiaxom.co.in/docs/developer/. We provide standard REST endpoints, Python SDKs, and streaming completion APIs compatible with modern web, mobile, and enterprise backend architectures.',
    category: 'developers',
  },
  {
    id: 12,
    question: 'How does Axom AI guarantee enterprise data privacy and Indian regulatory compliance?',
    answer:
      'All data transmissions are protected by Cloudflare Full-strict SSL/TLS encryption in transit and AES-256 encryption at rest. Axom AI strictly complies with India’s Digital Personal Data Protection (DPDP) Act. User documents and uploaded files are processed statelessly and are never sold or used to train public third-party foundation models.',
    category: 'privacy',
  },
];
