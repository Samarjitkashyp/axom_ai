export interface TermsSection {
  id: string;
  title: string;
  shortTitle: string;
  content: string[];
  subsections?: {
    subtitle: string;
    paragraphs: string[];
    bulletPoints?: string[];
  }[];
}

export interface TermsFaq {
  id: string;
  question: string;
  answer: string;
}

export const TERMS_METADATA = {
  lastUpdated: 'September 17, 2026',
  effectiveDate: 'September 17, 2026',
  version: '2.4',
  organization: 'Axom AI (AI Axom)',
  entityType: 'Indian Artificial Intelligence & Document Processing Platform',
  headquarters: 'Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)',
  legalEmail: 'support@aiaxom.co.in',
  grievanceOfficer: 'Samarjit Kashyap',
  grievanceEmail: 'samarjitkashyp@gmail.com',
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms & Legal Binding',
    shortTitle: 'Acceptance of Terms',
    content: [
      'Welcome to Axom AI ("Axom AI", "Platform", "we", "us", or "our"), Assam’s premier sovereign Artificial Intelligence and intelligent document processing platform, accessible via https://aiaxom.co.in and https://chat.aiaxom.co.in.',
      'These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you ("User", "you", or "your") and Axom AI regarding your access to and use of our web applications, generative AI chat assistants, neural translation systems, OCR pipelines, REST APIs, and document conversion utilities.',
      'By creating an account, browsing our website, uploading files, or submitting prompts to our AI models, you unequivocally agree to be bound by these Terms, our Privacy Policy, and all applicable statutory regulations under the laws of India. If you do not agree to these Terms, you must immediately discontinue using all Axom AI services.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Account Registration',
    shortTitle: 'Eligibility & Accounts',
    content: [
      'Axom AI is engineered for students, educators, civil service aspirants, professionals, and enterprises. To maintain platform integrity and legal compliance, the following eligibility criteria apply:',
    ],
    subsections: [
      {
        subtitle: 'A. Age & Capacity to Contract',
        paragraphs: [
          'You must be at least 18 years of age or possess legal capacity under the Indian Contract Act 1872 to enter into this Agreement. If you are under 18 years of age (a minor), you may only access Axom AI under the direct supervision and with affirmative consent of a parent or legal guardian who agrees to be bound by these Terms.',
        ],
      },
      {
        subtitle: 'B. Authentic Account Information',
        paragraphs: [
          'When registering via Google OAuth or email, you agree to provide true, accurate, and complete registration information. Creating fraudulent accounts, impersonating other individuals or entities, or misrepresenting your identity is strictly prohibited and warrants immediate account termination.',
          'Fair Use Policy: To prevent resource exhaustion, each individual user is limited to one personal free account. Automated creation of multiple accounts or bot registration is strictly forbidden.',
        ],
      },
    ],
  },
  {
    id: 'account-security',
    title: '3. Account Security & User Responsibilities',
    shortTitle: 'Account Security',
    content: [
      'You are solely responsible for maintaining the confidentiality and security of your account credentials, including passwords, session tokens, and authorized third-party OAuth permissions.',
      'You accept full accountability for all activities, prompts submitted, file uploads, and commercial actions that take place under your account credentials.',
      'If you suspect any unauthorized access, security breach, or compromised credentials, you must notify Axom AI immediately at support@aiaxom.co.in. Axom AI is not liable for losses or damages arising from your failure to safeguard your account credentials.',
    ],
  },
  {
    id: 'commercial-rights',
    title: '4. Permitted Use & Commercial Rights',
    shortTitle: 'Permitted Use & Commercial Rights',
    content: [
      'Axom AI empowers individuals and commercial enterprises to accelerate productivity, creative drafting, and technical analysis.',
    ],
    subsections: [
      {
        subtitle: 'A. Personal, Educational & Academic Usage',
        paragraphs: [
          'Users on Free, Student, and Starter tiers may use Axom AI for personal research, homework tutoring, APSC and UPSC exam preparation, linguistic studies, and non-commercial creative writing without additional licensing fees.',
        ],
      },
      {
        subtitle: 'B. Full Commercial Exploitation Rights',
        paragraphs: [
          'Users subscribed to paid tiers (Starter, Pro, and Business) or authorized commercial plans are granted a worldwide, royalty-free, perpetual right to commercially exploit the text, code, translations, and media generated through Axom AI.',
          'Permitted commercial applications include: marketing campaigns, website and social media copy, client proposals, software source code, published books and articles, client translations, and enterprise workflow automation.',
          'Attribution to Axom AI is appreciated but not mandatory for commercial deliverables generated on paid tiers.',
        ],
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property & Content Ownership',
    shortTitle: 'IP & Content Ownership',
    content: [
      'Clear, transparent ownership of data and intellectual property is foundational to Axom AI:',
    ],
    subsections: [
      {
        subtitle: 'A. You Own Your Inputs & Generated Outputs',
        paragraphs: [
          'Input Ownership: You retain complete ownership, copyright, and title to all prompts, text queries, and documents uploaded to Axom AI.',
          'Output Ownership: As between you and Axom AI, to the fullest extent permitted by applicable law, you own all rights, title, and interest in the outputs and responses generated by Axom AI in direct response to your valid inputs.',
          'Zero Model Training: Axom AI does NOT claim copyright ownership over your AI outputs and does NOT train public foundation models on your private conversation logs or confidential customer documents without explicit consent.',
        ],
      },
      {
        subtitle: 'B. Axom AI Proprietary Platform Rights',
        paragraphs: [
          'Axom AI and its licensors retain exclusive ownership of the platform itself, including source code, UI/UX designs, neural translation pipelines (IndicTrans2 fine-tunes), OCR models, RAG retrieval algorithms, logos, trademarks, and documentation.',
          'You may not duplicate, reverse engineer, decompile, copy, or create derivative works of the Axom AI platform, API endpoints, or underlying model architectures.',
        ],
      },
    ],
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable Use Policy & Strictly Prohibited Conduct',
    shortTitle: 'Acceptable Use Policy',
    content: [
      'To ensure safety, legal compliance, and reliable service availability for all users across Northeast India and globally, you agree NOT to engage in any of the following prohibited activities:',
    ],
    subsections: [
      {
        subtitle: 'A. Prohibited Content Generation',
        paragraphs: [
          'Illegal or Harmful Material: Generating content that promotes violence, terrorism, illegal weapon manufacture, illicit drugs, or violations of Indian laws.',
          'Child Sexual Abuse Material (CSAM): Absolute zero tolerance. Any attempt to generate, upload, or process CSAM results in immediate permanent termination and reporting to law enforcement authorities (NCMR, Assam Police, CBI).',
          'Defamation & Hate Speech: Generating abusive, harassing, defamatory, or hateful content targeting religious, ethnic, linguistic, caste, or gender groups in Assam or elsewhere.',
          'Misinformation & Malicious Impersonation: Generating deceptive deepfakes, fraudulent financial schemes, or misleading political propaganda.',
        ],
      },
      {
        subtitle: 'B. System Abuse & Infrastructure Exploitation',
        paragraphs: [
          'Unauthorized Scraping & Crawling: Scraping, crawling, or automated bulk extraction of responses or website assets without explicit written API licensing.',
          'Reverse Engineering: Attempting to circumvent safety filters, prompt inject, extract model weights, or probe for vulnerabilities without written authorization.',
          'Denial of Service (DoS): Transmitting volumetric attacks, DDOS attacks, or automated requests designed to impair service latency or cloud server availability.',
        ],
      },
    ],
  },
  {
    id: 'ai-limitations',
    title: '7. AI Limitations, Hallucinations & Professional Disclaimers',
    shortTitle: 'AI Accuracy Disclaimers',
    content: [
      'Generative Artificial Intelligence is an advanced probabilistic technology that synthesizes patterns from training data. While Axom AI utilizes state-of-the-art regional LLMs, Groq LPUs, and curated Assam knowledge bases, you must be cognizant of the following inherent limitations:',
    ],
    subsections: [
      {
        subtitle: 'A. Hallucinations & Factual Verification',
        paragraphs: [
          'Outputs may occasionally contain factual errors, inaccurate dates, outdated legal references, or "hallucinated" claims. You must critically review and independently verify all critical outputs before relying on them for examinations, business decisions, or public distribution.',
        ],
      },
      {
        subtitle: 'B. Not Professional Legal, Medical, or Financial Advice',
        paragraphs: [
          'Axom AI is an intelligent assistive tool, NOT a licensed advocate, medical doctor, or certified chartered accountant. Outputs concerning Assam land records, court cases, medical symptoms, or tax calculations are informational only and do NOT constitute licensed professional counsel.',
        ],
      },
    ],
  },
  {
    id: 'subscriptions',
    title: '8. Subscriptions, Payments, Taxes & GST Invoicing',
    shortTitle: 'Subscriptions & Billing',
    content: [
      'Axom AI offers free tier access alongside premium subscription plans (Starter, Pro, Business, and custom Enterprise tiers).',
    ],
    subsections: [
      {
        subtitle: 'A. Transparent Pricing & Indian Rupee (INR ₹) Billing',
        paragraphs: [
          'All published prices are denominated in Indian Rupees (INR ₹) and clearly displayed on our dedicated Pricing Page (https://aiaxom.co.in/pricing).',
          'Payments are securely processed via Razorpay (PCI-DSS Level 1 compliant). We support UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, MasterCard, and NetBanking across 50+ Indian banks.',
        ],
      },
      {
        subtitle: 'B. GST Compliance & Business Invoicing',
        paragraphs: [
          'Applicable Goods & Services Tax (GST) is computed during checkout in compliance with Indian tax law. Registered businesses may input their GSTIN during checkout to receive automated GST-compliant tax invoices for Input Tax Credit (ITC) reconciliation.',
        ],
      },
    ],
  },
  {
    id: 'cancellation-refunds',
    title: '9. Cancellation, Refunds & Plan Downgrades',
    shortTitle: 'Cancellation & Refund Policy',
    content: [
      'We believe in fair, friction-free subscription management:',
    ],
    subsections: [
      {
        subtitle: 'A. Self-Serve Subscription Cancellation',
        paragraphs: [
          'You may cancel recurring subscriptions at any time directly through your account dashboard or by emailing support@aiaxom.co.in. Upon cancellation, your account retains premium privileges until the conclusion of the active prepaid billing cycle, after which it smoothly reverts to the Free tier.',
        ],
      },
      {
        subtitle: 'B. Refund Policy',
        paragraphs: [
          'Because Axom AI incurs real-time compute GPU and LLM token processing costs upon usage, payments are generally non-refundable once model tokens or conversion tools have been substantially consumed.',
          'However, if you experience billing errors, double-charges, or catastrophic platform outages preventing usage within 48 hours of subscription renewal, contact support@aiaxom.co.in for an expedited review and refund resolution.',
        ],
      },
    ],
  },
  {
    id: 'document-sandboxes',
    title: '10. Document Processing & Ephemeral Sandboxes',
    shortTitle: 'Document Processing Sandboxes',
    content: [
      'Axom AI provides high-performance document tools (PDF to Word, Word to PDF, Image Converter, OCR):',
      'Ephemeral Memory Processing: Files uploaded to document conversion utilities are processed in temporary, isolated RAM sandboxes solely for the duration required to execute the conversion or OCR pipeline.',
      'Automated Sandbox Purging: Once the transformed file is delivered to your browser session or after 15 minutes of idle time, temporary file artifacts are permanently and irreversibly purged from our servers.',
      'User Warranty: You warrant that you hold the lawful right and authority to upload and transform all documents, images, and text submitted to Axom AI without violating third-party copyrights or non-disclosure agreements.',
    ],
  },
  {
    id: 'service-availability',
    title: '11. Service Availability, Uptime & Maintenance',
    shortTitle: 'Service Availability & SLA',
    content: [
      'Axom AI deploys distributed cloud infrastructure hosted within secure Indian datacenters (AWS Mumbai / GCP Delhi) to guarantee sub-second latency for regional users.',
      'While we strive for 99.9% platform availability, we do not guarantee that the service will be uninterrupted, error-free, or resilient against national internet routing disruptions, third-party upstream API outages (e.g. Groq, Google Cloud, Razorpay), or acts of God.',
      'We reserve the right to perform scheduled maintenance, software updates, and model parameter refreshes with advance notice where feasible.',
    ],
  },
  {
    id: 'liability-disclaimer',
    title: '12. Warranty Disclaimers & Statutory Limitation of Liability',
    shortTitle: 'Limitation of Liability',
    content: [
      'To the maximum extent permitted by applicable Indian law (including the Information Technology Act 2000):',
      '1. "As Is" Warranty Disclaimer: Axom AI is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, or statutory, including merchantability, fitness for a particular purpose, or non-infringement.',
      '2. Consequential Damages Exclusion: In no event shall Axom AI, its founder, employees, or cloud infrastructure partners be liable for indirect, incidental, punitive, special, or consequential damages, including loss of profits, data loss, business interruption, or academic outcome penalties.',
      '3. Aggregate Liability Cap: The total cumulative liability of Axom AI arising out of or related to these Terms or your use of the platform shall not exceed the amount actually paid by you to Axom AI in the twelve (12) months preceding the incident, or INR ₹1,000, whichever is greater.',
    ],
  },
  {
    id: 'termination',
    title: '13. Account Suspension & Termination',
    shortTitle: 'Suspension & Termination',
    content: [
      'Axom AI reserves the right to suspend, restrict, or permanently terminate your access to the platform immediately, without prior notice or liability, if:',
      '1. You materially breach any provision of these Terms or our Acceptable Use Policy.',
      '2. We receive valid legal directives or court orders from authorized law enforcement agencies in Assam or India.',
      '3. Your account demonstrates anomalous automated scraping, security exploitation, or volumetric denial-of-service activity.',
      'You may terminate this Agreement at any time by deleting your account via our Privacy Request desk or ceasing all use of the platform.',
    ],
  },
  {
    id: 'governing-law',
    title: '14. Governing Law, Dispute Resolution & Guwahati Jurisdiction',
    shortTitle: 'Governing Law & Jurisdiction',
    content: [
      'These Terms of Service and any contractual or non-contractual disputes arising out of or related to your use of Axom AI shall be governed by and construed in accordance with the laws of India, including the Information Technology Act 2000 and the Digital Personal Data Protection (DPDP) Act 2023.',
      'Exclusive Legal Jurisdiction: You agree that any legal suit, claim, or proceeding arising out of or relating to this Agreement shall be instituted exclusively in the competent courts located in Guwahati, Kamrup Metropolitan, Assam, India. Both parties irrevocably submit to the exclusive personal jurisdiction of such courts.',
      'Informal Dispute Resolution: Before initiating formal legal arbitration or court proceedings, you agree to engage in good-faith informal negotiations by delivering written notice to our Grievance Desk at support@aiaxom.co.in.',
    ],
  },
];

export const TERMS_FAQS: TermsFaq[] = [
  {
    id: 'what-are-terms',
    question: 'What are the Terms of Service for Axom AI?',
    answer:
      'The Terms of Service is a binding legal contract between you and Axom AI outlining the permitted uses, commercial rights, content ownership rules, acceptable use guidelines, payment terms, and liability limitations that govern your access to Axom AI and its web/chat applications.',
  },
  {
    id: 'who-can-use',
    question: 'Who is eligible to use Axom AI?',
    answer:
      'Anyone who is at least 18 years old or has supervised parental/guardian consent and the legal capacity to contract under Indian law can use Axom AI. It is designed for students, civil service aspirants, local businesses, creators, and developers across Assam and India.',
  },
  {
    id: 'who-owns-output',
    question: 'Who owns the content and code generated by Axom AI?',
    answer:
      'You own the content and code generated by Axom AI in response to your valid inputs. Axom AI does not claim copyright or proprietary ownership over your generated outputs, and we do not use your private conversations to train public foundation models without affirmative consent.',
  },
  {
    id: 'commercial-use',
    question: 'Can I use Axom AI and its generated outputs for commercial purposes?',
    answer:
      'Yes. Users on paid plans (Starter, Pro, Business) and authorized enterprise accounts have full commercial exploitation rights. You can use generated text, code, translations, and marketing copy in commercial products, client deliverables, websites, and business applications without paying royalty fees.',
  },
  {
    id: 'model-training',
    question: 'Does Axom AI use my prompts or uploaded files to train AI models?',
    answer:
      'No. We adhere to a strict Zero Model Training commitment for user data. Your private conversations, business queries, and uploaded documents are processed in stateless, isolated inference sandboxes and are never used to train public AI foundation models.',
  },
  {
    id: 'prohibited-activities',
    question: 'What activities are strictly prohibited on Axom AI?',
    answer:
      'Strictly prohibited activities include: generating CSAM, hate speech, violent or illegal content; reverse engineering or prompt-injecting model weights; scraping or bulk automated extraction; conducting denial-of-service attacks; and impersonating others.',
  },
  {
    id: 'hallucinations',
    question: 'What happens if an AI response contains inaccuracies or hallucinations?',
    answer:
      'Generative AI is a probabilistic technology, and outputs may occasionally contain factual errors or hallucinations. Axom AI provides its services on an "as is" basis and disclaims liability for inaccuracies. Users must verify critical factual information before relying on it for academic, medical, legal, or financial decisions.',
  },
  {
    id: 'billing-gst',
    question: 'How do subscription billing, GST invoices, and cancellations work?',
    answer:
      'Subscriptions are billed in INR (₹) via Razorpay. Indian businesses can enter their GSTIN to receive automatic GST tax invoices for Input Tax Credit. Subscriptions can be cancelled anytime with a single click in your billing dashboard, retaining access through the end of the paid period.',
  },
  {
    id: 'account-suspension',
    question: 'Under what circumstances can Axom AI suspend or terminate an account?',
    answer:
      'Axom AI may immediately suspend or terminate accounts that materially violate our Acceptable Use Policy, engage in automated scraping, threaten platform security, or upon valid legal directives from Indian law enforcement authorities.',
  },
  {
    id: 'jurisdiction',
    question: 'Which legal jurisdiction and governing laws apply to Axom AI?',
    answer:
      'Axom AI is governed by the laws of India, including the Information Technology Act 2000 and the DPDP Act 2023. Any legal disputes are subject to the exclusive jurisdiction of the competent courts of Guwahati, Kamrup Metropolitan, Assam, India.',
  },
];
