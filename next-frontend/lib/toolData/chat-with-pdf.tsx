import React from 'react';
import { MessageSquareText, Shield, Zap, Brain, Globe, BookOpen, GraduationCap, Landmark, Building2, FileSearch } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'chat-with-pdf',
  metaTitle: 'Chat with PDF - Ask Questions & Get AI Answers from Any PDF | Axom AI',
  metaDescription: 'Chat with any PDF document using AI. Ask questions, get instant answers, summarize content, and extract insights. Supports English, Assamese & Hindi. Free, no signup.',
  canonicalUrl: 'https://aiaxom.co.in/tools/chat-with-pdf',
  keywords: [
    'chat with pdf', 'ask questions from pdf', 'pdf ai chat', 'pdf question answering',
    'talk to pdf', 'ai pdf reader', 'pdf chatbot', 'chat with document', 'pdf qa tool',
    'ask pdf ai', 'pdf conversation', 'interactive pdf reader', 'ai document chat',
    'chat with pdf free', 'pdf ai assistant', 'chat with pdf online', 'pdf query tool',
    'extract answers from pdf', 'ai pdf analysis', 'pdf summarizer chat',
    'chat with pdf assamese', 'chat with pdf hindi', 'chat with pdf india',
    'how to chat with a pdf', 'what is chat with pdf', 'best free pdf chat tool',
    'can I ask questions to a pdf', 'how to extract answers from pdf using ai',
    'chat with pdf no signup', 'chat with pdf no login', 'free pdf ai tool',
    'pdf ai reader india', 'chat with pdf mobile', 'pdf question answer ai',
    'ai powered pdf reader', 'smart pdf reader', 'pdf insight extractor',
    'chat with research paper', 'chat with legal document', 'chat with textbook',
    'pdf chat for students', 'pdf chat for lawyers', 'pdf chat for researchers',
    'chat with pdf guwahati', 'chat with pdf assam', 'chat with pdf northeast india',
    'document ai chat', 'conversational pdf', 'pdf knowledge extraction',
    'ai document understanding', 'rag pdf tool', 'retrieval augmented pdf',
    'chat with pdf browser', 'instant pdf answers', 'pdf comprehension tool'
  ],
  breadcrumbName: 'Chat with PDF',

  heroBadgeText: 'AI-Powered Document Intelligence',
  heroHeadingPrefix: 'Chat with Any',
  heroHeadingHighlight: 'PDF Document',
  heroHeadingSuffix: 'Using AI',
  heroDescription: 'Upload any PDF and ask questions in natural language. Get instant, accurate AI-powered answers with citations. Works with English, Assamese & Hindi documents.',
  heroTags: ['Ask Questions in Natural Language', 'Instant AI Answers', '100% Free', 'No Signup Required'],

  aeoTitle: 'What is Chat with PDF?',
  aeoDescription: `<strong>Chat with PDF</strong> by Axom AI lets you have an intelligent conversation with any PDF document. Simply upload a PDF — textbook, research paper, legal contract, government circular — and ask questions in plain English, Assamese, or Hindi. The AI reads and understands the entire document, then provides <strong>accurate answers with page references</strong>. Powered by advanced RAG (Retrieval Augmented Generation) technology, it goes beyond simple keyword search to truly comprehend document context. Perfect for students studying for exams, lawyers reviewing contracts, researchers analyzing papers, and professionals processing lengthy reports. No signup, no watermark, completely free.`,
  aeoHighlights: ['Natural Language Q&A', 'Page-Referenced Answers', 'Multilingual Support', 'Free & Private'],

  steps: [
    { title: 'Upload Your PDF', description: 'Drag and drop or browse to upload any PDF document. Supports textbooks, research papers, legal docs, and more.', accent: 'purple' },
    { title: 'Ask Your Question', description: 'Type your question in natural language — English, Assamese, or Hindi. Ask about specific topics, request summaries, or extract key facts.', accent: 'fuchsia' },
    { title: 'Get AI-Powered Answers', description: 'Receive accurate, context-aware answers with page references. Follow up with more questions for deeper understanding.', accent: 'emerald' },
  ],

  benefits: [
    { icon: <MessageSquareText size={20} />, title: 'Natural Language Conversations', description: 'Ask questions the way you naturally speak. No complex query syntax needed — just type your question and get answers.' },
    { icon: <Brain size={20} />, title: 'Deep Document Understanding', description: 'AI comprehends context, relationships, and nuances in your document — not just keyword matching but true semantic understanding.' },
    { icon: <FileSearch size={20} />, title: 'Page-Referenced Answers', description: 'Every answer includes page references so you can verify the source and find the exact location in your original document.' },
    { icon: <Zap size={20} />, title: 'Instant Results', description: 'Get answers in seconds, even from 100+ page documents. No waiting for manual reading or slow processing.' },
    { icon: <Shield size={20} />, title: 'Private & Secure', description: 'Your documents are processed securely and never stored permanently. Your intellectual property stays protected.' },
    { icon: <Globe size={20} />, title: 'Multilingual Intelligence', description: 'Chat in English, Assamese (অসমীয়া), or Hindi (हिन्दी). The AI understands and responds in your preferred language.' },
  ],

  useCases: [
    { icon: <GraduationCap size={20} />, title: 'Students & Exam Preparation', description: 'Upload textbooks and ask questions to study smarter. Get explanations, summaries, and key concepts extracted automatically from study materials.', accent: 'purple' },
    { icon: <Landmark size={20} />, title: 'Legal Professionals', description: 'Review contracts, court orders, and legal documents by asking specific questions. Find clauses, terms, and obligations without reading every page.', accent: 'emerald' },
    { icon: <BookOpen size={20} />, title: 'Researchers & Academics', description: 'Analyze research papers, extract methodologies, compare findings, and get instant summaries of lengthy academic publications.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Business Professionals', description: 'Process reports, proposals, and documentation efficiently. Extract key metrics, decisions, and action items from business documents.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Assamese & Hindi PDF Chat', axom: 'Full multilingual support', other: 'English only', paid: 'Limited languages', axom_check: true, other_check: false },
    { feature: 'Free Daily Usage', axom: 'Generous free quota', other: '3-5 queries only', paid: 'From $20/mo', axom_check: true, other_check: false },
    { feature: 'Page References in Answers', axom: 'Always included', other: 'Rarely available', paid: 'Sometimes', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'Instant access', other: 'Signup required', paid: 'Account + payment', axom_check: true, other_check: false },
    { feature: 'Document Privacy', axom: 'Auto-deleted after session', other: 'Stored on servers', paid: 'Varies', axom_check: true, other_check: false },
    { feature: 'Follow-up Questions', axom: 'Unlimited in session', other: 'Limited', paid: 'Unlimited', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Engine', value: 'RAG with Gemini + BGE-M3 embeddings' },
    { label: 'Supported Languages', value: 'English, Assamese, Hindi' },
    { label: 'Max PDF Size', value: '20 MB / 200 pages' },
    { label: 'Response Time', value: '2-5 seconds per question' },
  ],

  regionalTitle: 'Chat with PDFs in Assamese, Hindi & English',
  regionalDescription: `Axom AI brings <strong>AI-powered document chat to India</strong> with native support for <strong>Assamese (অসমীয়া) and Hindi (हिन्दी)</strong> documents. Students across Assam can chat with their textbooks, government officials can query circulars in Hindi, and researchers can analyze papers in English — all on one platform. Built on Indian infrastructure for fast response times and data sovereignty. Whether you're in Guwahati, Delhi, or anywhere in India, get instant AI answers from any PDF.`,
  regionalBadge: "India's Multilingual AI Document Chat",

  faqs: [
    { q: 'How does Chat with PDF work?', a: 'When you upload a PDF, our AI reads and indexes the entire document using advanced embeddings. When you ask a question, it finds the most relevant sections and generates an accurate answer using RAG (Retrieval Augmented Generation) technology, citing the specific pages where the information was found.' },
    { q: 'Can I chat with PDFs in Assamese or Hindi?', a: 'Yes! Axom AI supports chatting with documents in English, Assamese (অসমীয়া), and Hindi (हिन्दी). You can ask questions in any of these languages and receive answers in the same language.' },
    { q: 'Is there a page or file size limit?', a: 'You can upload PDFs up to 20 MB in size and up to 200 pages. For very large documents, the AI processes all pages but may take slightly longer for the first question.' },
    { q: 'Are my documents stored on your servers?', a: 'Documents are temporarily processed for the chat session and automatically deleted afterward. We do not permanently store, index, or share your files with any third party.' },
    { q: 'Can I ask multiple questions about the same PDF?', a: 'Yes! Once uploaded, you can ask as many questions as you want about the same document within your session. The AI maintains context across your conversation.' },
    { q: 'Does it work with scanned PDFs?', a: 'Chat with PDF works best with text-based PDFs. For scanned image PDFs, we recommend first using our OCR PDF tool to make the document searchable, then chatting with the OCR output.' },
    { q: 'Is this free to use?', a: 'Yes, Chat with PDF is completely free with a generous daily quota. No signup, no credit card, and no hidden charges.' },
    { q: 'How accurate are the AI answers?', a: 'The AI provides highly accurate answers by grounding its responses in the actual document content. Every answer includes page references so you can verify the information directly in your PDF.' },
    { q: 'Can I use this for legal or medical documents?', a: 'You can use it to extract information from legal or medical PDFs. However, AI answers should be treated as informational aids — always consult qualified professionals for legal or medical decisions.' },
    { q: 'Does it work on mobile phones?', a: 'Yes, the Chat with PDF tool is fully responsive and works perfectly on Android, iOS, tablets, and desktop browsers without any app installation.' },
  ],

  ctaTitle: 'Start Chatting with Your PDFs Now',
  ctaDescription: 'Upload any PDF and get instant AI answers. Free, private, and multilingual.',
  ctaPrimaryText: 'Chat with PDF Free',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Chat with PDF',
  appAlternateNames: ['Axom PDF Chat', 'AI PDF Q&A Tool', 'Talk to PDF Axom AI'],
  appDescription: 'Free AI-powered tool to chat with any PDF document. Ask questions and get instant, accurate answers with page references. Supports English, Assamese & Hindi.',
  appCategory: 'BusinessApplication, EducationalApplication',
  appFeatureList: ['Natural language Q&A', 'Page-referenced answers', 'Assamese support', 'Hindi support', 'English support', 'No signup required', 'Free daily quota', 'RAG-powered accuracy'],
  appRatingValue: '4.9',
  appReviewCount: '3680',
  howToSchemaName: 'How to Chat with a PDF Using AI',
  howToSchemaDescription: 'Upload a PDF document and ask questions in natural language to get AI-powered answers with page references.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI Chat with PDF',
};
