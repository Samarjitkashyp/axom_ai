import json
from .models import PrivacyPageConfig, PrivacySectionModel, PrivacyFAQItem

DEFAULT_PRIVACY_SECTIONS = [
    {
        'section_id': 'introduction',
        'title': '1. Introduction & Scope',
        'short_title': 'Introduction',
        'content_raw': (
            'Welcome to Axom AI ("Axom AI", "we", "us", or "our"), Assam’s premier indigenous Artificial Intelligence platform, accessible via https://aiaxom.co.in and https://chat.aiaxom.co.in. We are deeply committed to safeguarding the privacy, confidentiality, and fundamental data rights of every user who accesses our web applications, AI chat assistants, neural translation systems, and document processing utilities.\n\n'
            'This Privacy Policy transparently sets forth the categories of personal and non-personal data we collect, how that data is processed, the technical measures we employ to secure it, and how you may exercise your statutory rights under the Digital Personal Data Protection (DPDP) Act 2023 of India, the Information Technology Act 2000, and applicable global privacy frameworks.\n\n'
            'By creating an account, browsing our website, uploading files, or engaging in conversations with our AI models, you acknowledge having read and understood the practices described herein.'
        ),
        'subsections_json': json.dumps([]),
        'order': 1,
    },
    {
        'section_id': 'data-fiduciary',
        'title': '2. Data Fiduciary & Grievance Officer',
        'short_title': 'Data Fiduciary',
        'content_raw': (
            'Under India’s Digital Personal Data Protection (DPDP) Act 2023, Axom AI acts as the primary "Data Fiduciary" responsible for determining the purpose and means of processing personal data collected through our services.\n\n'
            'We have designated a dedicated Grievance Officer and Data Protection Officer (DPO) based at our headquarters in Guwahati, Assam to address all privacy concerns, data erasure requests, and statutory inquiries within statutory timelines.'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Official Contact Details',
                'paragraphs': [
                    'Organization: Axom AI (AI Axom)',
                    'Physical Address: Guwahati, Kamrup Metropolitan, Assam, India — PIN 781001',
                    'Data Protection Officer Email: support@aiaxom.co.in',
                    'Grievance Redressal Officer: Samarjit Kashyap (samarjitkashyp@gmail.com)',
                    'Statutory Response SLA: Within 48 hours acknowledging receipt; full resolution within 15 business days.',
                ],
            }
        ]),
        'order': 2,
    },
    {
        'section_id': 'data-collection',
        'title': '3. Information We Collect',
        'short_title': 'Data Collection',
        'content_raw': (
            'We adhere strictly to the principle of Data Minimization. We only collect information that is strictly necessary to authenticate your identity, deliver high-quality generative AI responses, and fulfill our contractual obligations.'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'A. Personal Information You Provide Directly',
                'paragraphs': [
                    'Account Registration Data: When you register or sign in using Google OAuth or email, we collect your full name, email address, profile photo URL (if authorized), and unique account identifier.',
                    'Billing & Payment Records: If you subscribe to our Pro or Business plans, our payment gateway partner (Razorpay) securely processes your transaction. We only receive confirmation metadata such as transaction status, subscription tier, and masked payment tokens. We NEVER store full credit/debit card numbers, CVVs, or UPI PINs on our servers.',
                    'Customer Inquiries: Information submitted through our contact forms, feedback forms, or support emails, including your name, message text, and optional phone number.',
                ],
            },
            {
                'subtitle': 'B. User Prompts & AI Conversations',
                'paragraphs': [
                    'Chat Queries: Text inputs, queries, and conversational prompts you submit in English, Assamese (অসমীয়া), or other languages to interact with our AI models.',
                    'Conversation Histories: If you are signed in, chat histories are organized into sessions to allow you to resume previous conversations across your devices.',
                ],
            },
            {
                'subtitle': 'C. Uploaded Files & Documents',
                'paragraphs': [
                    'Document Processing: Files uploaded to our Document Analyzer, PDF Converters, Word-to-PDF tools, or OCR engines (e.g. PDF, DOCX, PNG, JPG).',
                    'Ephemeral Sandbox Handling: Uploaded files are routed to isolated memory sandboxes solely for the duration of the requested transformation or RAG analysis, and are subjected to automated purging as detailed in Section 7.',
                ],
            },
            {
                'subtitle': 'D. Technical & Log Data',
                'paragraphs': [
                    'Device & Connection Information: IP address, device type, browser user-agent, operating system, preferred UI language, and referrers.',
                    'Diagnostic Logs: Timestamped error logs, API latency metrics, and crash telemetry utilized exclusively to identify server faults and maintain platform reliability.',
                ],
            },
        ]),
        'order': 3,
    },
    {
        'section_id': 'ai-training-policy',
        'title': '4. Strict AI Model Training Commitment',
        'short_title': 'AI Training Policy',
        'content_raw': (
            'A fundamental principle of Axom AI is that your private intellectual property, correspondence, and proprietary documents belong to you.\n\n'
            'We categorically affirm the following commitments regarding AI model training:'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Our Non-Negotiable Training Protections',
                'paragraphs': [
                    '1. No Unauthorized Public Training: Axom AI does NOT sell your personal conversations, customer data, or uploaded documents to third-party data brokers, nor do we use your private data to train public foundation models without explicit affirmative opt-in consent.',
                    '2. Isolated Inference: Prompt execution through our model pipelines (including IndicTrans2, Gemini, Claude, and Llama 3 via Groq) operates in secure stateless API containers where inputs are discarded after generating the response.',
                    '3. Opt-In Annotation Only: Only prompts that you explicitly choose to flag via the "Submit Feedback" or "Share Output" buttons may be reviewed by human annotators to correct Assamese linguistic errors (e.g., orthographic errors in যুক্তাক্ষৰ or spellings).',
                ],
            }
        ]),
        'order': 4,
    },
    {
        'section_id': 'how-we-use-data',
        'title': '5. How We Use Collected Information',
        'short_title': 'Data Usage',
        'content_raw': (
            'We process your data strictly on legitimate legal bases, including contractual necessity, user consent, and statutory compliance under the DPDP Act 2023:'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Processing Purposes',
                'paragraphs': [
                    'Service Delivery: Generating conversational answers, translating Assamese text, converting documents, and producing generated images.',
                    'Account Administration: Managing monthly word quotas, active subscriptions, authentication tokens, and profile settings.',
                    'Security & Fraud Prevention: Detecting automated scraping, API abuse, brute-force login attempts, and malicious payloads.',
                    'System Diagnostics & Performance: Optimizing server response times and reducing LLM inference latency across Northeast Indian internet routes.',
                    'Customer Communication: Sending critical transactional updates, password resets, payment invoices, and service announcements.',
                ],
            }
        ]),
        'order': 5,
    },
    {
        'section_id': 'cookies-policy',
        'title': '6. Cookies & Local Storage Technologies',
        'short_title': 'Cookies Policy',
        'content_raw': (
            'Axom AI uses standard web cookies and browser LocalStorage to provide a smooth, secure user experience.'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Categories of Cookies We Use',
                'paragraphs': [
                    '1. Strictly Necessary Cookies: Essential for user authentication, CSRF security tokens, and maintaining your active login session across page transitions.',
                    '2. Functional LocalStorage: Stores your chosen UI preferences, such as Dark Mode settings, sidebar collapse state, and cached device identifiers (axom_device_uid) for guest quota tracking.',
                    '3. Analytical Telemetry: Aggregated, anonymized traffic statistics (via Google Tag Manager and privacy-preserving metrics) to measure page load speeds and identify broken links.',
                ],
            },
            {
                'subtitle': 'Managing Your Cookie Preferences',
                'paragraphs': [
                    'You may configure your web browser (Chrome, Firefox, Safari, Edge) to reject all cookies or notify you when a cookie is placed. However, disabling essential cookies will prevent you from signing in or maintaining active chat sessions.',
                ],
            }
        ]),
        'order': 6,
    },
    {
        'section_id': 'data-storage-retention',
        'title': '7. Data Storage, Architecture & Retention Schedule',
        'short_title': 'Storage & Retention',
        'content_raw': (
            'We store data in secure tier-3/tier-4 cloud facilities with robust physical and digital access controls.'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Specific Retention Schedules',
                'paragraphs': [
                    'Account Profile Information: Retained for the duration of your active account lifecycle. If you delete your account, personal identifiers are purged within 30 days.',
                    'Chat Histories: Stored persistently within your account until you choose to delete individual chats or clear all conversation history via dashboard settings.',
                    'Uploaded Converter Files (PDF, Word, Images): Files uploaded to standalone file conversion tools are kept in temporary storage only as long as necessary to complete the conversion, after which they are automatically purged.',
                    'Financial Transaction Logs: Basic invoice and billing records are retained for the statutory period mandated under Indian tax and corporate laws (typically 7 years for GST audit compliance).',
                ],
            }
        ]),
        'order': 7,
    },
    {
        'section_id': 'third-party-processors',
        'title': '8. Third-Party Service Providers & Sub-processors',
        'short_title': 'Sub-processors',
        'content_raw': (
            'We partner with reputable infrastructure and technology providers to deliver our AI services. All sub-processors are bound by strict Data Processing Agreements (DPAs) ensuring confidentiality and security standards consistent with this policy:'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'List of Authorized Sub-processors',
                'paragraphs': [
                    'Cloud Infrastructure: Amazon Web Services (AWS Lightsail) and Google Cloud Platform (GCP) for secure server hosting, database storage, and edge caching.',
                    'Payment Processing: Razorpay Software Pvt. Ltd. (PCI-DSS Level 1 compliant) for secure Indian UPI, RuPay, debit/credit cards, and NetBanking checkout.',
                    'AI Inference Acceleration: Groq Inc. and Cerebras Systems for high-speed open-source Llama 3 LLM inference.',
                    'Live Web Search: Tavily AI API for real-time web retrieval and citation extraction when Web Search mode is enabled.',
                    'CDN & DDoS Protection: Cloudflare Inc. for global SSL/TLS termination, edge caching, and firewall filtering.',
                ],
            }
        ]),
        'order': 8,
    },
    {
        'section_id': 'user-rights',
        'title': '9. Your Statutory Rights (DPDP Act 2023 & GDPR)',
        'short_title': 'Your Rights',
        'content_raw': (
            'Under India’s Digital Personal Data Protection Act 2023, you hold enforceable rights over your personal data:'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Enforceable Data Principal Rights',
                'paragraphs': [
                    'Right to Access: You have the right to obtain a summary of personal data being processed and the processing activities undertaken.',
                    'Right to Correction & Updating: You can rectify inaccurate, misleading, or incomplete personal data via your account settings.',
                    'Right to Erasure / Deletion: You can request the complete deletion of your account, chat logs, and personal profile data.',
                    'Right of Grievance Redressal: You have the right to register a grievance with our Data Protection Officer regarding the processing of your data.',
                    'Right to Nominate: In the event of death or incapacity, you may nominate an individual to exercise your data rights.',
                    'How to Exercise: Submit your request directly to support@aiaxom.co.in or use the Data Deletion form on this page. We process verified requests within statutory time limits without fee.',
                ],
            }
        ]),
        'order': 9,
    },
    {
        'section_id': 'technical-security',
        'title': '10. Technical & Organizational Security Measures',
        'short_title': 'Security Measures',
        'content_raw': (
            'We treat user data security as an existential priority, implementing multi-layered defense-in-depth protocols:'
        ),
        'subsections_json': json.dumps([
            {
                'subtitle': 'Our Security Protocols',
                'paragraphs': [
                    'Encryption in Transit: All incoming and outgoing network traffic between your device and Axom AI is secured using 256-bit TLS 1.3 encryption with strict HTTPS enforcement.',
                    'Encryption at Rest: Sensitive database records and authentication credentials are encrypted using industry-standard AES-256 protocols.',
                    'Strict Access Controls: Internal access to production database clusters is governed by least-privilege principles, multi-factor authentication (MFA), and automated audit trails.',
                    'Vulnerability Management: Continuous dependency patching, automated vulnerability scans, and code audits prior to CI/CD production releases.',
                ],
            }
        ]),
        'order': 10,
    },
    {
        'section_id': 'children-privacy',
        'title': '11. Children’s Privacy Protection',
        'short_title': "Children's Privacy",
        'content_raw': (
            'Axom AI is designed for students, professionals, writers, and businesses. We do not knowingly collect personal data from children under the age of 18 without verifiable parental or institutional consent, in strict compliance with Section 9 of India’s DPDP Act 2023.\n\n'
            'If you believe that a minor has provided us with personal data without proper consent, please notify support@aiaxom.co.in immediately and we will promptly take steps to delete such records.'
        ),
        'subsections_json': json.dumps([]),
        'order': 11,
    },
    {
        'section_id': 'international-transfers',
        'title': '12. Cross-Border Data Transfers',
        'short_title': 'Data Transfers',
        'content_raw': (
            'Axom AI prioritizes storing primary databases and user account records in Indian data centers. Where certain AI inference operations (such as multi-lingual LLM processing via Groq or Cloudflare CDN edge routing) necessitate transient processing across international borders, such transfers are conducted strictly under lawful transfer mechanisms and government notifications pursuant to the DPDP Act 2023.'
        ),
        'subsections_json': json.dumps([]),
        'order': 12,
    },
    {
        'section_id': 'updates-to-policy',
        'title': '13. Amendments to this Privacy Policy',
        'short_title': 'Policy Updates',
        'content_raw': (
            'We periodically update this Privacy Policy to reflect advancements in our AI capabilities, new product features, or evolving statutory requirements.\n\n'
            'When material revisions occur, we will notify users through prominent website banners or email alerts prior to the changes taking effect, and update the "Last Updated" date at the top of this document. Continued use of Axom AI following notifications indicates acceptance of the updated terms.'
        ),
        'subsections_json': json.dumps([]),
        'order': 13,
    },
    {
        'section_id': 'contact-privacy',
        'title': '14. Contacting Us Regarding Privacy Concerns',
        'short_title': 'Contact Privacy',
        'content_raw': (
            'If you have any questions, clarifications, or complaints regarding this Privacy Policy or wish to lodge a formal grievance under the DPDP Act 2023, please reach out to:\n\n'
            'Data Protection & Grievance Desk, Axom AI\n'
            'Address: Guwahati, Kamrup Metropolitan, Assam, India — PIN 781001\n'
            'Email: support@aiaxom.co.in\n'
            'Escalations: samarjitkashyp@gmail.com (Founder & Lead Engineer)\n\n'
            'We pledge to respond to all inquiries within 48 hours and work with you to resolve any privacy concerns promptly.'
        ),
        'subsections_json': json.dumps([]),
        'order': 14,
    },
]

DEFAULT_PRIVACY_FAQS = [
    {
        'question': 'Is Axom AI safe and secure to use?',
        'answer': 'Yes, Axom AI is designed with comprehensive enterprise-grade security. All communications are encrypted with 256-bit TLS 1.3 in transit, and stored databases are secured with AES-256 encryption. We comply with India’s Digital Personal Data Protection (DPDP) Act 2023 and never sell or rent your data.',
        'order': 1,
    },
    {
        'question': 'Does Axom AI use my conversations or documents to train AI models?',
        'answer': 'No. Axom AI does NOT use your private chats, business prompts, or uploaded documents to train public foundation AI models without your explicit affirmative consent. Inference occurs in stateless API pipelines that immediately discard prompt inputs after delivering your response.',
        'order': 2,
    },
    {
        'question': 'What personal information does Axom AI collect?',
        'answer': 'We only collect minimal data required to provide our services: your name and email address for account authentication, billing metadata through our PCI-DSS compliant partner Razorpay, and prompt inputs submitted during your active sessions. We never store credit card numbers, CVVs, or UPI PINs.',
        'order': 3,
    },
    {
        'question': 'Does Axom AI store my uploaded files and documents?',
        'answer': 'Uploaded files (PDFs, DOCX, images) sent to our standalone conversion and OCR tools are processed in isolated sandbox memory and automatically purged after conversion. Files uploaded to the Document Analyzer are retained only for your authenticated session analysis and can be deleted anytime with one click.',
        'order': 4,
    },
    {
        'question': 'How long does Axom AI retain my data?',
        'answer': 'Account data and conversation logs remain stored as long as your account is active to provide cross-device history. When you choose to delete a chat session or delete your account, your data is permanently erased from active production databases within 30 days.',
        'order': 5,
    },
    {
        'question': 'Can I delete my Axom AI data or request account erasure?',
        'answer': 'Yes. You have full control over your data. You can delete individual chat conversations directly from the chat sidebar, or submit an account deletion request by emailing support@aiaxom.co.in or using the Data Deletion request form on this page. All personal identifiers will be permanently removed.',
        'order': 6,
    },
    {
        'question': 'Does Axom AI share my data with third parties?',
        'answer': 'We never sell your personal data. We only share necessary technical information with vetted sub-processors essential to operating the platform (such as Razorpay for payment processing, AWS/GCP for hosting, and Cloudflare for DDoS protection), all bound by strict Data Processing Agreements.',
        'order': 7,
    },
    {
        'question': 'Does Axom AI use cookies and tracking technologies?',
        'answer': 'Axom AI uses essential session cookies required for login authentication, CSRF security, and UI preferences (such as dark mode and selected language). We do not use third-party behavioral advertising cookies that track you across other websites.',
        'order': 8,
    },
    {
        'question': 'What are my rights under India’s DPDP Act 2023?',
        'answer': 'Under the DPDP Act 2023, you have the right to access a summary of your personal data, rectify inaccuracies, request complete erasure of your data, withdraw previous consent, and register grievances with our Data Protection Officer based in Guwahati, Assam.',
        'order': 9,
    },
    {
        'question': 'How can I contact Axom AI regarding privacy concerns or grievances?',
        'answer': 'You can reach our Data Protection & Grievance Desk by emailing support@aiaxom.co.in or contacting Grievance Officer Samarjit Kashyap at samarjitkashyp@gmail.com. We acknowledge grievances within 48 hours and provide resolution within statutory timelines.',
        'order': 10,
    },
]


def ensure_privacy_defaults():
    """Ensure PrivacyPageConfig exists and is populated with default sections & FAQs."""
    config = PrivacyPageConfig.objects.first()
    if not config:
        config = PrivacyPageConfig.objects.create()

    # Populate default sections if none exist
    if not config.sections.exists():
        for s in DEFAULT_PRIVACY_SECTIONS:
            PrivacySectionModel.objects.create(
                page_config=config,
                section_id=s['section_id'],
                title=s['title'],
                short_title=s['short_title'],
                content_raw=s['content_raw'],
                subsections_json=s.get('subsections_json', '[]'),
                order=s['order'],
                is_active=True,
            )

    # Populate default FAQs if none exist
    if not config.faqs.exists():
        for f in DEFAULT_PRIVACY_FAQS:
            PrivacyFAQItem.objects.create(
                page_config=config,
                question=f['question'],
                answer=f['answer'],
                order=f['order'],
                is_active=True,
            )

    return config
