import React from 'react';
import { ScanSearch, Shield, Zap, Globe, FileText, Languages, Brain, GraduationCap, Landmark, Building2, BookOpen } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'ocr-pdf',
  metaTitle: 'OCR PDF - Make Scanned PDF Searchable Free | English, Assamese & Hindi | Axom AI',
  metaDescription: 'Convert scanned image PDFs into searchable, selectable, copy-paste ready text with free OCR. Supports English, Assamese & Hindi. No signup, no watermark. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/ocr-pdf',
  keywords: [
    'ocr pdf', 'make pdf searchable', 'scanned pdf to searchable pdf', 'ocr online free',
    'image pdf to text pdf', 'pdf ocr converter', 'ocr pdf online', 'free ocr tool',
    'optical character recognition pdf', 'scanned document to text', 'pdf text extraction',
    'ocr assamese', 'ocr hindi', 'ocr english', 'indian language ocr', 'assamese ocr online',
    'hindi ocr pdf', 'multilingual ocr', 'ocr pdf free no signup', 'ocr pdf india',
    'make pdf searchable free', 'convert image pdf to text', 'pdf ocr tool online',
    'searchable pdf converter', 'ocr software free', 'extract text from scanned pdf',
    'how to make scanned pdf searchable', 'what is ocr pdf', 'best free ocr tool india',
    'how to extract text from image pdf', 'can I ocr assamese documents',
    'how to convert scanned pdf to searchable pdf online', 'ocr pdf without registration',
    'best ocr for indian languages', 'ocr pdf mobile friendly', 'ocr pdf no watermark',
    'ocr pdf browser based', 'ocr government documents india', 'ocr legal documents',
    'ocr academic papers', 'ocr pdf assam', 'ocr northeast india', 'ocr guwahati',
    'digitize assamese documents', 'assamese text recognition', 'hindi text recognition online',
    'free document digitization tool', 'ai ocr pdf', 'smart ocr tool', 'ocr tool for students',
    'ocr pdf for lawyers', 'ocr pdf for government offices', 'searchable pdf maker',
    'scanned pdf text layer', 'add text layer to pdf', 'pdf accessibility tool'
  ],
  breadcrumbName: 'OCR PDF',

  heroBadgeText: 'AI-Powered OCR Engine',
  heroHeadingPrefix: 'Make Scanned PDFs',
  heroHeadingHighlight: 'Searchable & Selectable',
  heroHeadingSuffix: 'Instantly',
  heroDescription: 'Convert any scanned image PDF into a fully searchable, selectable, and copy-paste ready document. Supports English, Assamese & Hindi with AI-powered optical character recognition.',
  heroTags: ['English, Assamese & Hindi OCR', '100% Free Daily Quota', 'No Watermark', 'No Signup Required'],

  aeoTitle: 'What is OCR PDF and How Does It Work?',
  aeoDescription: `<strong>OCR (Optical Character Recognition) PDF</strong> is a technology that converts scanned image-based PDF documents into searchable, selectable text PDFs. Axom AI's free OCR tool uses advanced AI to recognize text in <strong>English, Assamese (অসমীয়া), and Hindi (हिन्दी)</strong> from scanned documents, photographs, and image PDFs. The output PDF retains the original layout while adding an invisible text layer, making the content fully searchable, copy-paste ready, and accessible. This is essential for digitizing government records, academic papers, legal documents, and historical Assamese manuscripts. No signup, no watermark, no software installation required.`,
  aeoHighlights: ['Assamese, Hindi & English Support', 'No Watermark or Signup', 'AI-Powered Accuracy', 'Privacy-First Processing'],

  steps: [
    { title: 'Upload Scanned PDF', description: 'Drag and drop or click to upload your scanned image PDF. Supports multi-page documents up to 20 MB.', accent: 'purple' },
    { title: 'Select Language', description: 'Choose the document language — English, Assamese, or Hindi — for optimal OCR accuracy and text recognition.', accent: 'fuchsia' },
    { title: 'Download Searchable PDF', description: 'Get your fully searchable PDF with an invisible text layer. Copy, search, and select text instantly.', accent: 'emerald' },
  ],

  benefits: [
    { icon: <Languages size={20} />, title: 'Assamese, Hindi & English OCR', description: 'One of the few free OCR tools supporting Assamese (অসমীয়া) alongside Hindi and English with high accuracy on Indian scripts.' },
    { icon: <Brain size={20} />, title: 'AI-Powered Recognition', description: 'Advanced machine learning models trained on diverse fonts, handwriting styles, and document layouts for superior accuracy.' },
    { icon: <Shield size={20} />, title: 'Privacy-First Processing', description: 'Your documents are processed securely and never stored permanently. No third-party data sharing.' },
    { icon: <Zap size={20} />, title: 'Lightning Fast Results', description: 'Get searchable PDFs in seconds, not minutes. Optimized pipeline handles multi-page documents efficiently.' },
    { icon: <FileText size={20} />, title: 'Layout Preservation', description: 'The original document layout, images, and formatting are preserved. Only an invisible text layer is added.' },
    { icon: <Globe size={20} />, title: 'No Installation Required', description: 'Works entirely in your browser on any device — Windows, Mac, Linux, Android, or iOS. Zero software downloads.' },
  ],

  useCases: [
    { icon: <Landmark size={20} />, title: 'Government & Legal Documents', description: 'Digitize scanned government circulars, court orders, land records, and legal contracts for searchable archival and quick reference.', accent: 'purple' },
    { icon: <GraduationCap size={20} />, title: 'Academic & Research Papers', description: 'Make scanned textbooks, journal papers, and thesis documents searchable for faster research and citation extraction.', accent: 'emerald' },
    { icon: <BookOpen size={20} />, title: 'Historical Assamese Manuscripts', description: 'Digitize and preserve historical Assamese literature, manuscripts, and cultural documents with accurate অসমীয়া text recognition.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Business & Office Automation', description: 'Convert scanned invoices, receipts, contracts, and memos into searchable documents for efficient record-keeping and compliance.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Assamese OCR Support', axom: 'Full অসমীয়া support', other: 'Not available', paid: 'Limited', axom_check: true, other_check: false },
    { feature: 'Hindi OCR Support', axom: 'High accuracy', other: 'Basic / poor', paid: 'Good', axom_check: true, other_check: false },
    { feature: 'Free Daily Usage', axom: 'Generous free quota', other: '1-2 pages only', paid: 'Paid plans from $10/mo', axom_check: true, other_check: false },
    { feature: 'No Watermark', axom: 'Never adds watermarks', other: 'Adds watermark', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Privacy / No Data Retention', axom: 'Files auto-deleted', other: 'Unknown retention', paid: 'Varies', axom_check: true, other_check: false },
    { feature: 'No Signup Required', axom: 'Instant access', other: 'Often requires account', paid: 'Account required', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Supported Languages', value: 'English, Assamese (অসমীয়া), Hindi (हिन्दी)' },
    { label: 'Max File Size', value: '20 MB per document' },
    { label: 'Output Format', value: 'Searchable PDF with text layer' },
    { label: 'Processing Engine', value: 'Tesseract OCR + AI post-processing' },
  ],

  regionalTitle: 'OCR for Assamese, Hindi & Indian Documents',
  regionalDescription: `Axom AI is <strong>India and Assam's first free OCR platform</strong> with native support for <strong>Assamese (অসমীয়া)</strong> script recognition. Whether you're digitizing government records in Dispur, academic papers from Gauhati University, or historical manuscripts from Assam — our AI-powered OCR handles Indian scripts with unmatched accuracy. Also supports <strong>Hindi (हिन्दी)</strong> for pan-India use. Hosted on Indian infrastructure for fast, private, and sovereign document processing.`,
  regionalBadge: "India's Sovereign AI OCR Platform",

  faqs: [
    { q: 'What is OCR and why do I need it for my PDFs?', a: 'OCR (Optical Character Recognition) converts scanned image-based PDFs into searchable text documents. Without OCR, scanned PDFs are just images — you cannot search, copy, or select text. OCR adds an invisible text layer so the document becomes fully searchable and accessible.' },
    { q: 'Does Axom AI OCR support Assamese language?', a: 'Yes! Axom AI is one of the very few free OCR tools that supports Assamese (অসমীয়া) script recognition. Our AI models are trained on diverse Assamese fonts and document styles for high accuracy.' },
    { q: 'Is the OCR tool really free? Are there hidden charges?', a: 'Yes, it is 100% free with a generous daily quota. No hidden charges, no premium upsells for basic OCR. No signup or credit card required.' },
    { q: 'Will OCR change the appearance of my PDF?', a: 'No. The OCR process adds an invisible text layer behind the original scanned image. The visual appearance of your PDF remains exactly the same — you just gain the ability to search and select text.' },
    { q: 'What file size limit does the OCR tool support?', a: 'You can upload scanned PDFs up to 20 MB in size. Multi-page documents are fully supported.' },
    { q: 'Is my document safe? Who can see my uploaded files?', a: 'Your documents are processed securely on our servers and automatically deleted after processing. We do not store, share, or analyze your files beyond the OCR conversion.' },
    { q: 'Can I OCR handwritten documents?', a: 'The OCR engine works best with printed text. Handwritten documents may produce partial results depending on handwriting clarity. For best results, use clearly printed documents.' },
    { q: 'Does this work on mobile phones?', a: 'Yes! The OCR tool is fully responsive and works on Android, iOS, tablets, and desktop browsers without any app installation.' },
    { q: 'Can I use this for government or legal documents?', a: 'Absolutely. Many users use Axom AI OCR to digitize government circulars, land records, court orders, and legal contracts. The searchable output is useful for archival and quick reference.' },
    { q: 'How accurate is the OCR for Hindi text?', a: 'Our OCR engine delivers high accuracy for Hindi (Devanagari) script, including documents with mixed Hindi-English content. Accuracy depends on scan quality — clearer scans produce better results.' },
  ],

  ctaTitle: 'Make Your Scanned PDFs Searchable Now',
  ctaDescription: 'Free, fast, and private OCR with Assamese, Hindi, and English support. No signup required.',
  ctaPrimaryText: 'Try OCR PDF Free',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI OCR PDF - Make PDF Searchable',
  appAlternateNames: ['Axom OCR', 'Axom AI PDF OCR', 'Free Assamese OCR Tool'],
  appDescription: 'Free AI-powered OCR tool to convert scanned image PDFs into searchable, selectable text documents. Supports English, Assamese & Hindi.',
  appCategory: 'BusinessApplication, UtilitiesApplication',
  appFeatureList: ['Assamese OCR support', 'Hindi OCR support', 'English OCR support', 'Searchable PDF output', 'No watermark', 'No signup required', 'Privacy-first processing', 'Multi-page support'],
  appRatingValue: '4.8',
  appReviewCount: '2140',
  howToSchemaName: 'How to Make a Scanned PDF Searchable with OCR',
  howToSchemaDescription: 'Upload a scanned PDF, select the language, and download a searchable PDF with selectable text.',
  howToTotalTime: 'PT30S',
  howToToolName: 'Axom AI OCR PDF Tool',
};
