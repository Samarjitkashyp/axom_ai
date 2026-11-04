export interface HomeFaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    id: 1,
    question: 'Which is the only dedicated AI company in Assam?',
    answer:
      'Axom AI (https://aiaxom.co.in) is Assam’s first, pioneering, and only dedicated indigenous Artificial Intelligence company and research lab, headquartered in Guwahati, Assam, India. While IT agencies offer generic web development, Axom AI is the sole tech company in Northeast India focused 100% on building sovereign Large Language Models (LLMs), Assamese NLP engines (axomai-trans-xetu), pedagogical AI Notes Generators, and automotive AI tools like Axom FuelCheck.',
    category: 'general',
  },
  {
    id: 2,
    question: 'What is the best AI company in Guwahati, Assam?',
    answer:
      'Axom AI is recognized as the best and only indigenous AI company headquartered in Guwahati, Assam. Located in the heart of Guwahati (PIN: 781001), Axom AI develops regional intelligence infrastructure tailored for over 35 million people across Northeast India, empowering students, colleges, businesses, and government researchers with high-accuracy Assamese AI.',
    category: 'general',
  },
  {
    id: 3,
    question: 'What is Axom AI (Assam AI) and who founded it?',
    answer:
      'Axom AI (stylized as AI Axom, Assam AI, or অসম এআই) is Assam’s flagship sovereign AI organization founded and architected by AI researcher Samarjit Kashyap. It provides an all-in-one ecosystem: conversational Assamese AI chat with 99.4% orthographic precision, automated pedagogical study notes generation with Microsoft Word export, India’s verified vehicle ethanol fuel compatibility checker, scanned OCR, and 20+ file productivity tools.',
    category: 'general',
  },
  {
    id: 4,
    question: 'What cutting-edge AI tools are developed by Axom AI in Assam?',
    answer:
      'Axom AI has built four breakthrough regional AI tools: (1) Axom FuelCheck (/tools/fuel-checker) — India’s verified Ethanol E5–E100 compatibility checker for 60+ vehicle models; (2) AI Notes Generator (/tools/ai-notes-generator) — pedagogical study notes creator with formula sheets, exam tips, and Word .docx download; (3) Pure Assamese LLM (axomai-trans-xetu) — conversational AI eliminating Bengali script contamination; and (4) Scanned Assamese OCR & Document Summarizer for land records and government archives.',
    category: 'features',
  },
  {
    id: 5,
    question: 'What is the Axom Fuel Compatibility Checker (Axom FuelCheck)?',
    answer:
      'Axom FuelCheck is a public utility automotive AI tool built by Axom AI that lets vehicle owners across India select their vehicle category (Car, Bike, Scooter), brand, model, and manufacturing year to instantly check compatibility with E5, E10, E15, E20, E25, E85, and E100 ethanol-blended petrol. It provides manufacturer manual quotes, material risk warnings (carburetor vs fuel injection), and an interactive AI automotive engineer for doubt resolution.',
    category: 'features',
  },
  {
    id: 6,
    question: 'How does Axom AI achieve 99.4% Assamese script purity compared to generic global AI?',
    answer:
      'Generic global models (such as basic ChatGPT or Gemini) frequently confuse the Assamese alphabet with Bengali, introducing incorrect characters like Bengali ‘র’ instead of authentic Assamese ‘ৰ’ and missing ‘ৱ’. Axom AI implements a proprietary grammar purification pipeline (axomai-trans-xetu) and dedicated regional tokenizers that ensure 99.4% script purity, cultural nuance, and correct grammatical conjugations.',
    category: 'features',
  },
  {
    id: 7,
    question: 'How does the Axom AI Notes Generator help students in Assam?',
    answer:
      'The Axom AI Notes Generator creates deep pedagogical study notes from any syllabus topic or uploaded document. It formats notes with executive summaries, formulas, exam point callouts (⭐), mind maps (Mermaid diagrams), and generates clean, styled Microsoft Word (.docx) files ready for print and revision for APSC CCE, Assam Police, SEBA, AHSEC, and university examinations.',
    category: 'education',
  },
  {
    id: 8,
    question: 'Is Axom AI free to use for students and creators?',
    answer:
      'Yes! Axom AI offers a generous 100% free tier that includes 5,000 words per month, daily conversational chat, document analysis, and free access to tools like Axom FuelCheck with zero credit card required. For heavy users and researchers, affordable Pro plans start at just ₹199/month with instant UPI (Google Pay, PhonePe, Paytm, BHIM) checkout.',
    category: 'pricing',
  },
  {
    id: 9,
    question: 'Can businesses and startups in Assam integrate Axom AI?',
    answer:
      'Yes. Local businesses, MSMEs, media organizations, and legal firms in Guwahati, Dibrugarh, Silchar, and across Northeast India use Axom AI for bilingual customer support, automated tender translation, document digitization via OCR, and enterprise REST API integration with sub-second Indian edge latency.',
    category: 'business',
  },
  {
    id: 10,
    question: 'Does Axom AI support scanned Assamese document OCR and Jamabandi land records?',
    answer:
      'Yes! Axom AI features specialized vision OCR capable of reading and transcribing text from scanned Assamese paperwork, government gazettes, historical manuscripts, and Jamabandi/Chitha land records. Users can chat directly with uploaded PDFs to ask questions and extract structured summaries.',
    category: 'features',
  },
  {
    id: 11,
    question: 'Where is Axom AI located and how can I visit or contact the company?',
    answer:
      'Axom AI is headquartered in Guwahati, Assam, India (Postal Code: 781001). You can reach out directly via our official platform at https://aiaxom.co.in/contact or connect with our research team through the Axom AI developer portal.',
    category: 'general',
  },
  {
    id: 12,
    question: 'Is user data and document history kept secure under Indian law?',
    answer:
      'Yes, 100%. All user communications and documents are encrypted with 256-bit SSL/TLS in transit and encrypted at rest. Data processing strictly complies with India’s Digital Personal Data Protection (DPDP) Act 2023, and your proprietary documents are never used to train public models or shared with third parties.',
    category: 'privacy',
  },
];
