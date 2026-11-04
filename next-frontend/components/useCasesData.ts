export interface UseCaseFaqItem {
  q: string;
  a: string;
}

export const USE_CASES_FAQS: UseCaseFaqItem[] = [
  {
    q: 'How can students and academic researchers in Assam use Axom AI?',
    a: 'Students use Axom AI as an interactive bilingual study partner that explains complex STEM, social science, and literature topics in natural Assamese or English. Powered by the Axom AI Brain (Progya 2B), it assists with SEBA, AHSEC, and college curricula, breaks down difficult homework questions step-by-step, summarizes PDF research papers and textbooks, and generates complete study notes with Microsoft Word (.docx) export to boost conceptual clarity.',
  },
  {
    q: 'How does Axom AI assist APSC CCE, ADRE, and Assam civil service aspirants?',
    a: 'Axom AI is fine-tuned on 6.19 million regional cultural, historical, and governance records. Aspirants for the APSC Combined Competitive Examination (CCE), Assam Police, and ADRE use Axom AI for deep synthesis of Assam History (Ahom dynasty, Sukapha, Lachit Borphukan, Moamoria rebellion, Treaty of Yandabo), regional geography, state budget analysis, and evaluated bilingual Mains answer writing with instant factual feedback.',
  },
  {
    q: 'How does Axom FuelCheck help vehicle owners in India verify ethanol petrol compatibility?',
    a: 'Axom FuelCheck (E5–E100) is a verified automotive intelligence engine covering 16+ brands and all models from 2010 to 2026. It allows bike, scooter, and car owners to verify whether their vehicle complies with BS6 Phase-2 (OBD-2 / E20 Ready), BS6 Phase-1, or BS-IV norms. It evaluates component durability (Viton rubber seals, fuel pump, injectors), calculates expected mileage drop (~2-4%), and provides exact verbatim citations from official manufacturer owner manuals.',
  },
  {
    q: 'Can Axom AI accurately process and translate official government documents and land records?',
    a: 'Yes. Axom AI features specialized document intelligence capable of parsing scanned PDFs, official Assam Secretariat circulars, court summons, and historical land revenue records (such as Jamabandi, Chitha registers, and Dag numbers). Powered by the axomai-trans-xetu engine with 99.4% script purity, it extracts critical dates, clauses, and boundaries without confusing Bengali and Assamese characters.',
  },
  {
    q: 'What proprietary foundation models power Axom AI’s use cases?',
    a: 'Axom AI is powered by five proprietary research foundation models: Progya (2B native Assamese LLM with a 68,096-token vocabulary), XUWOR (sovereign multimodal conversational agent), Puhor (24,000 Hz Flow-Matching Diffusion Transformer voice synthesis), Xuna (vernacular Conformer ASR with 0.261x Real-Time Factor), and Xetu (38.6 BLEU neural translation engine preserving grammatical vibhakti).',
  },
  {
    q: 'How can small businesses, tea gardens, and MSMEs in Assam leverage Axom AI?',
    a: 'Local businesses, tea garden producers, and handloom artisans use Axom AI to deploy 24/7 bilingual customer support bots in Assamese and English, draft high-converting social media marketing campaigns for WhatsApp and Facebook, convert inventory spreadsheets into password-protected PDF invoices, and translate commercial contracts to connect with over 15 million regional consumers.',
  },
  {
    q: 'How do legal practitioners and administrative officers use Axom AI?',
    a: 'Advocates, legal researchers, and administrative officers rely on Axom AI to analyze dense legal agreements, extract contractual obligations, summarize judicial judgments, draft bilingual legal notices, and transcribe spoken Assamese audio statements. All document processing operates in ephemeral, secure memory with zero client data retention.',
  },
  {
    q: 'How does Axom AI eliminate Bengali script confusion in Assamese text processing?',
    a: 'Generic international models routinely confuse Assamese characters with Bengali counterparts (e.g. substituting র with ৰ, or mishandling ৱ). Axom AI engineered a dedicated 68,096-token native Assamese vocabulary and the axomai-trans-xetu engine, ensuring 99.4% script purity and preserving classical grammatical inflection (vibhakti).',
  },
  {
    q: 'Is personal, student, and corporate data protected under Indian privacy laws on Axom AI?',
    a: 'Yes, 100%. Axom AI maintains sovereign Indian data residency and complies with India’s Digital Personal Data Protection (DPDP) Act 2023. User interactions, document uploads, and API payloads are processed with 256-bit SSL/TLS encryption in isolated memory buffers and are never used to train public foundation models or shared with third-party advertisers.',
  },
  {
    q: 'Is Axom AI free to use, and what is included in the platform?',
    a: 'Yes! Axom AI provides generous free daily access to AI Chat, creative writing, document analysis, and 33+ production tools—including AI Notes Generator, Axom FuelCheck, Chat with PDF, PDF-to-Word converter, and Background Remover. Students and everyday users can start immediately without a credit card, while power users and teams can upgrade to Starter or Pro for expanded limits.',
  },
];
