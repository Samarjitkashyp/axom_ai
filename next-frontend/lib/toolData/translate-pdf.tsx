import React from 'react';
import { Languages, Shield, Zap, Brain, Globe, FileText, GraduationCap, Landmark, Building2, BookOpen } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'translate-pdf',
  metaTitle: 'Translate PDF - Translate PDF to Assamese, Hindi, English & More | Axom AI',
  metaDescription: 'Translate PDF documents into Assamese, Hindi, English and more using AI. Preserves formatting. Free, fast, no signup. Powered by Axom AI and IndicTrans2.',
  canonicalUrl: 'https://aiaxom.co.in/tools/translate-pdf',
  keywords: [
    'translate pdf', 'pdf translator', 'translate pdf online', 'translate pdf free',
    'translate pdf to assamese', 'translate pdf to hindi', 'translate pdf to english',
    'pdf translation tool', 'ai pdf translator', 'document translator',
    'translate document online', 'multilingual pdf translation', 'translate pdf india',
    'assamese translation tool', 'hindi translation pdf', 'english to assamese pdf',
    'english to hindi pdf', 'hindi to english pdf', 'assamese to english pdf',
    'translate pdf no signup', 'free pdf translator online', 'ai document translator',
    'how to translate a pdf', 'what is pdf translation', 'best free pdf translator',
    'how to translate pdf to assamese', 'how to translate pdf to hindi',
    'can I translate a pdf online', 'translate pdf preserving format',
    'translate scanned pdf', 'translate pdf mobile', 'translate pdf browser',
    'pdf translator india', 'translate pdf assam', 'translate pdf guwahati',
    'translate pdf northeast india', 'indictrans2 pdf translator',
    'translate government document', 'translate legal document pdf',
    'translate academic paper', 'translate textbook pdf', 'translate pdf with ai',
    'machine translation pdf', 'neural machine translation pdf',
    'translate pdf layout preserved', 'translate pdf no watermark',
    'translate pdf for free', 'indian language pdf translator',
    'bengali to english pdf', 'translate pdf content', 'translate whole pdf',
    'batch pdf translation', 'translate pdf instantly', 'pdf language converter'
  ],
  breadcrumbName: 'Translate PDF',

  heroBadgeText: 'AI-Powered PDF Translation',
  heroHeadingPrefix: 'Translate PDF to',
  heroHeadingHighlight: 'Assamese, Hindi & More',
  heroHeadingSuffix: 'Instantly',
  heroDescription: 'Translate entire PDF documents into Assamese, Hindi, English, and more using AI-powered neural machine translation. Preserves formatting, free to use, no signup required.',
  heroTags: ['Assamese & Hindi Translation', 'Layout Preserved', '100% Free', 'Powered by IndicTrans2'],

  aeoTitle: 'What is Translate PDF?',
  aeoDescription: `<strong>Translate PDF</strong> by Axom AI enables you to translate entire PDF documents into <strong>Assamese (অসমীয়া), Hindi (हिन्दी), English, and more Indian languages</strong> using advanced AI neural machine translation powered by <strong>IndicTrans2</strong>. Unlike basic translation tools, Axom AI preserves the original document formatting while replacing text with accurate translations. This is invaluable for translating government circulars, academic papers, legal documents, and business reports across India's linguistic diversity. The tool handles text extraction, translation, and output generation in one seamless step. No signup, no watermark, completely free.`,
  aeoHighlights: ['IndicTrans2 Neural Translation', 'Format Preserved', 'Assamese & Hindi Support', 'Free & Private'],

  steps: [
    { title: 'Upload Your PDF', description: 'Upload any text-based PDF document. Supports multi-page documents with complex layouts and mixed content.', accent: 'purple' },
    { title: 'Select Target Language', description: 'Choose your target language — Assamese, Hindi, English, or other supported Indian languages. AI handles translation automatically.', accent: 'fuchsia' },
    { title: 'Download Translated PDF', description: 'Get your translated document with formatting preserved. Download, share, or print the translated PDF instantly.', accent: 'emerald' },
  ],

  benefits: [
    { icon: <Languages size={20} />, title: 'Assamese & Hindi Translation', description: 'One of the very few free tools offering PDF translation to Assamese (অসমীয়া). Also supports Hindi, English, and other Indian languages.' },
    { icon: <Brain size={20} />, title: 'IndicTrans2 Neural Translation', description: 'Powered by India\'s state-of-the-art IndicTrans2 model for superior Indian language translation quality compared to generic MT engines.' },
    { icon: <FileText size={20} />, title: 'Format Preservation', description: 'The translated PDF preserves the original layout, images, and formatting as much as possible for a professional result.' },
    { icon: <Zap size={20} />, title: 'Fast Processing', description: 'Translate multi-page PDFs in seconds. Optimized pipeline handles extraction, translation, and generation efficiently.' },
    { icon: <Shield size={20} />, title: 'Secure & Private', description: 'Your documents are processed securely and deleted after translation. No permanent storage or third-party sharing.' },
    { icon: <Globe size={20} />, title: 'No Software Installation', description: 'Works entirely in your browser on any device. No downloads, no desktop apps, no plugins needed.' },
  ],

  useCases: [
    { icon: <Landmark size={20} />, title: 'Government Circulars & Policies', description: 'Translate Hindi government circulars into Assamese or English for wider accessibility. Bridge the language gap in public administration across India.', accent: 'purple' },
    { icon: <GraduationCap size={20} />, title: 'Academic & Educational Materials', description: 'Translate English textbooks and research papers into Assamese or Hindi for students and educators in regional medium schools and colleges.', accent: 'emerald' },
    { icon: <BookOpen size={20} />, title: 'Cultural & Literary Works', description: 'Translate Assamese literature, historical documents, and cultural texts into English or Hindi for wider readership and preservation.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Business & Legal Documents', description: 'Translate contracts, proposals, and legal notices across languages for pan-India business operations and compliance.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Assamese PDF Translation', axom: 'Full অসমীয়া support', other: 'Not available', paid: 'Rarely supported', axom_check: true, other_check: false },
    { feature: 'Indian Language Quality', axom: 'IndicTrans2 (state-of-art)', other: 'Generic MT', paid: 'Google/DeepL', axom_check: true, other_check: false },
    { feature: 'Format Preservation', axom: 'Layout preserved', other: 'Text only', paid: 'Usually preserved', axom_check: true, other_check: false },
    { feature: 'Free Daily Usage', axom: 'Generous free quota', other: 'Very limited', paid: 'From $15/mo', axom_check: true, other_check: false },
    { feature: 'No Watermark', axom: 'Never adds watermarks', other: 'Often watermarked', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'No Signup Required', axom: 'Instant access', other: 'Account needed', paid: 'Account + payment', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Translation Engine', value: 'IndicTrans2 + Gemini AI' },
    { label: 'Supported Languages', value: 'Assamese, Hindi, English + more' },
    { label: 'Max File Size', value: '20 MB per document' },
    { label: 'Output Format', value: 'Translated PDF with formatting' },
  ],

  regionalTitle: 'Translate PDFs into Assamese, Hindi & Indian Languages',
  regionalDescription: `Axom AI is <strong>India's first free PDF translation platform</strong> with dedicated <strong>Assamese (অসমীয়া)</strong> support powered by <strong>IndicTrans2</strong> — India's own state-of-the-art neural translation model. Translate government documents from Hindi to Assamese, academic papers from English to Hindi, or Assamese literature to English. Built for India's linguistic diversity, serving users from Guwahati to Delhi with fast, accurate, sovereign AI translation on Indian infrastructure.`,
  regionalBadge: "India's Sovereign AI PDF Translator",

  faqs: [
    { q: 'Can I translate PDFs to Assamese?', a: 'Yes! Axom AI is one of the very few tools that supports PDF translation to Assamese (অসমীয়া). Powered by IndicTrans2, India\'s leading neural translation model, for high-quality Assamese translations.' },
    { q: 'What languages are supported for PDF translation?', a: 'Currently supported languages include Assamese, Hindi, English, and other major Indian languages. The translation engine uses IndicTrans2 for Indian languages, ensuring superior quality for regional scripts.' },
    { q: 'Does the translation preserve the original PDF layout?', a: 'Yes, Axom AI preserves the original document formatting as much as possible, including layout structure, images, and text positioning. The result is a professional-looking translated document.' },
    { q: 'How accurate is the AI translation?', a: 'Translations are powered by IndicTrans2, India\'s state-of-the-art neural machine translation model, which delivers significantly higher accuracy for Indian languages compared to generic translation engines. Quality may vary based on document complexity and domain.' },
    { q: 'Is the PDF translator free?', a: 'Yes, completely free with a generous daily quota. No signup, no credit card required. No watermarks or hidden fees.' },
    { q: 'Can I translate scanned PDFs?', a: 'For scanned image PDFs, we recommend first using our OCR PDF tool to extract text, and then translating the resulting searchable PDF. Direct translation of image-only PDFs is not supported.' },
    { q: 'What is the maximum file size?', a: 'You can upload PDFs up to 20 MB in size. Multi-page documents are fully supported.' },
    { q: 'Is my document safe during translation?', a: 'Your documents are processed securely on our servers and automatically deleted after translation. We never store, share, or analyze your files beyond the translation process.' },
    { q: 'Can I translate documents from Hindi to Assamese?', a: 'Yes! You can translate between any supported language pair, including Hindi to Assamese, Assamese to English, English to Hindi, and more.' },
    { q: 'Does it work on mobile phones?', a: 'Yes, the PDF translator is fully responsive and works perfectly on Android, iOS, tablets, and desktop browsers without any app installation.' },
  ],

  ctaTitle: 'Translate Your PDFs Now',
  ctaDescription: 'Free AI-powered PDF translation with Assamese, Hindi & English support. No signup required.',
  ctaPrimaryText: 'Translate PDF Free',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Translate PDF',
  appAlternateNames: ['Axom PDF Translator', 'Assamese PDF Translator', 'Indian Language PDF Translator'],
  appDescription: 'Free AI-powered PDF translation tool. Translate documents into Assamese, Hindi, English and more using IndicTrans2 neural translation.',
  appCategory: 'BusinessApplication, UtilitiesApplication',
  appFeatureList: ['Assamese translation', 'Hindi translation', 'English translation', 'IndicTrans2 engine', 'Format preservation', 'No watermark', 'No signup', 'Free daily quota'],
  appRatingValue: '4.8',
  appReviewCount: '2870',
  howToSchemaName: 'How to Translate a PDF Document',
  howToSchemaDescription: 'Upload a PDF, select the target language, and download the translated document with formatting preserved.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI Translate PDF Tool',
};
