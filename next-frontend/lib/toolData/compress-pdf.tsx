import React from 'react';
import {
  FileDown, Zap, Shield, Globe, Eye, Gauge,
  GraduationCap, Briefcase, Scale, Building2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'compress-pdf',
  metaTitle: 'Compress PDF Online Free — Reduce PDF File Size | Axom AI',
  metaDescription:
    'Compress PDF files online for free without losing quality. Reduce PDF size for email, WhatsApp, and uploads. No watermark, no sign-up. Works on mobile and desktop. Made in India.',
  canonicalUrl: 'https://aiaxom.co.in/tools/compress-pdf',
  keywords: [
    'compress pdf', 'pdf compressor', 'reduce pdf size', 'compress pdf online', 'compress pdf free',
    'pdf file size reducer', 'shrink pdf', 'pdf compression tool', 'compress pdf without losing quality',
    'reduce pdf file size online', 'pdf optimizer', 'compress pdf for email', 'compress pdf for whatsapp',
    'pdf size reducer online free', 'compress large pdf', 'best pdf compressor', 'free pdf compressor',
    'online pdf compressor no watermark', 'compress pdf india', 'pdf compress tool india',
    'how to compress pdf', 'how to reduce pdf file size', 'how to shrink pdf without quality loss',
    'what is the best free pdf compressor', 'can I compress pdf without losing quality',
    'how to compress pdf for email attachment', 'how to reduce pdf size below 1mb',
    'how to compress pdf on mobile', 'is there a free pdf compressor without watermark',
    'how to compress scanned pdf', 'compress pdf assamese', 'compress pdf hindi',
    'pdf compressor for indian government forms', 'reduce pdf size for sarkari exam',
    'compress pdf for upsc', 'compress pdf for ssc', 'pdf size reducer for competitive exams',
    'compress pdf for bank exam form', 'pdf compressor for college admission',
    'small pdf compressor', 'compress pdf to 100kb', 'compress pdf to 200kb', 'compress pdf to 500kb',
    'compress pdf to 1mb', 'compress pdf below 2mb', 'batch compress pdf', 'bulk pdf compressor',
    'lossless pdf compression', 'compress pdf documents', 'pdf file optimizer',
    'reduce pdf size without software', 'compress pdf no signup', 'compress pdf no registration',
    'fast pdf compressor', 'secure pdf compression', 'private pdf compressor',
    'compress pdf for upload', 'compress pdf for portal submission',
  ],
  breadcrumbName: 'Compress PDF',

  heroBadgeText: 'AI-Powered PDF Compression — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'PDF Compressor',
  heroHeadingSuffix: '— Reduce Size Instantly',
  heroDescription:
    'Compress PDF files up to 90% smaller without visible quality loss. Perfect for email attachments, WhatsApp sharing, government portal uploads, and exam form submissions. No watermark, no sign-up required.',
  heroTags: ['Reduce Up to 90%', '100% Free Daily Quota', 'No Watermark', 'Works on Mobile', 'Private & Secure'],

  aeoTitle: 'What is Axom AI PDF Compressor?',
  aeoDescription:
    '<strong>Axom AI PDF Compressor</strong> is a free online tool that reduces PDF file size without compromising visual quality. It uses intelligent compression algorithms that analyze each page — optimizing embedded images, removing redundant metadata, and streamlining font subsets. The tool works entirely in your browser for small files and leverages server-side processing for larger documents. It supports <strong>Assamese (অসমীয়া), Hindi (हिन्दी), Bengali</strong>, and all Unicode scripts. Ideal for compressing scanned documents, government forms, exam admit cards, and academic papers for portal uploads across India.',
  aeoHighlights: ['Up to 90% Size Reduction', 'No Quality Loss', 'No Watermark', 'Indian Language Support'],

  steps: [
    { title: 'Upload Your PDF', description: 'Drag and drop or browse to select your PDF file. Files up to 50 MB are supported. Works on any device — desktop, tablet, or mobile.' },
    { title: 'Choose Compression Level', description: 'Select from Low (minimal reduction, highest quality), Medium (balanced), or High (maximum reduction). Preview the estimated output size before compressing.' },
    { title: 'Download Compressed PDF', description: 'Click Compress and download your optimized PDF instantly. The file is auto-deleted from our servers within minutes for your privacy.' },
  ],

  benefits: [
    { icon: <FileDown size={20} />, title: 'Up to 90% Smaller Files', description: 'Advanced compression algorithms dramatically reduce file size while preserving text clarity, images, and layout fidelity.' },
    { icon: <Zap size={20} />, title: 'Instant Processing', description: 'Server-side compression powered by optimized pipelines delivers results in seconds, even for large multi-page PDFs.' },
    { icon: <Shield size={20} />, title: 'Private & Secure', description: 'Files are processed in isolated sessions and automatically deleted. No data is stored, logged, or shared with third parties.' },
    { icon: <Globe size={20} />, title: 'Unicode & Indian Language Ready', description: 'Full support for Assamese, Hindi, Bengali, Tamil, Telugu, Kannada, and all Indic scripts — no character corruption.' },
    { icon: <Eye size={20} />, title: 'No Watermark Ever', description: 'Your compressed PDF is clean — no Axom AI branding, watermarks, or footer text added to your document.' },
    { icon: <Gauge size={20} />, title: 'Multiple Compression Levels', description: 'Choose between low, medium, and high compression to balance file size against visual quality for your specific needs.' },
  ],

  useCases: [
    { icon: <GraduationCap size={20} />, title: 'Students & Exam Applicants', description: 'Compress admit cards, mark sheets, and certificates to meet strict file size limits on UPSC, SSC, bank exam, and university admission portals.', accent: 'purple' },
    { icon: <Briefcase size={20} />, title: 'Business Professionals', description: 'Shrink reports, proposals, and presentations for email attachments without exceeding inbox size limits or losing formatting.', accent: 'fuchsia' },
    { icon: <Scale size={20} />, title: 'Legal & Government', description: 'Compress legal filings, court documents, and RTI applications to meet e-filing portal size restrictions across Indian courts and tribunals.', accent: 'emerald' },
    { icon: <Building2 size={20} />, title: 'Educational Institutions', description: 'Reduce the size of syllabi, question papers, and circulars for distribution via WhatsApp groups and email without quality degradation.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Compression Quality', axom: 'Lossless & lossy options', other: 'Basic lossy only', paid: 'Multiple presets', axom_check: true, other_check: false },
    { feature: 'Watermark-Free Output', axom: 'Always free, no watermark', other: 'Watermark on free tier', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Indian Language Support', axom: 'Assamese, Hindi, Bengali+', other: 'Latin scripts only', paid: 'Limited Indic', axom_check: true, other_check: false },
    { feature: 'File Size Limit', axom: 'Up to 50 MB free', other: '5–15 MB cap', paid: 'Unlimited', axom_check: true, other_check: false },
    { feature: 'Privacy & Auto-Delete', axom: 'Auto-deleted in minutes', other: 'Stored on servers', paid: 'Varies', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'No sign-up needed', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Max File Size', value: '50 MB per file' },
    { label: 'Compression Modes', value: 'Low / Medium / High' },
    { label: 'Supported PDF Versions', value: 'PDF 1.0 – 2.0' },
    { label: 'Processing Engine', value: 'Ghostscript + qpdf' },
  ],

  regionalTitle: 'Compress PDF for Indian Government Portals & Exams',
  regionalDescription:
    'Axom AI is built in <strong>Assam, India</strong> and optimized for Indian users. Compress PDFs to meet strict file size limits on portals like DigiLocker, UMANG, NIC e-filing, and exam boards (SEBA, AHSEC, CBSE). Full support for <strong>Assamese (অসমীয়া)</strong>, Hindi, Bengali, and all 22 scheduled languages. Our servers are optimized for Indian network conditions, ensuring fast uploads even on 4G connections.',
  regionalBadge: "🇮🇳 India's Own AI Document Platform",

  faqs: [
    { q: 'How much can Axom AI compress a PDF?', a: 'Depending on the content, Axom AI can reduce PDF file size by up to 90%. Image-heavy PDFs see the most dramatic reduction. Text-only PDFs typically shrink by 20-40%.' },
    { q: 'Does compression reduce PDF quality?', a: 'With Low compression, quality is virtually identical to the original. Medium offers a great balance. High compression may slightly reduce image sharpness but text remains perfectly crisp.' },
    { q: 'Is there a file size limit?', a: 'Yes, the free tier supports PDFs up to 50 MB. This covers the vast majority of documents including scanned papers, reports, and presentations.' },
    { q: 'Can I compress PDFs with Assamese or Hindi text?', a: 'Absolutely. Axom AI fully supports all Unicode scripts including Assamese (অসমীয়া), Hindi (हिन्दी), Bengali, Tamil, Telugu, and more. No characters are corrupted during compression.' },
    { q: 'Is my PDF data safe?', a: 'Yes. Files are processed in isolated sessions and automatically deleted from our servers within minutes. We do not store, analyze, or share your documents.' },
    { q: 'Can I compress scanned PDFs?', a: 'Yes. Scanned PDFs (which are essentially images) benefit the most from compression. Axom AI can dramatically reduce their size while maintaining readability.' },
    { q: 'Does the compressed PDF have a watermark?', a: 'Never. Axom AI does not add any watermark, branding, or footer to your compressed PDF. The output is clean and professional.' },
    { q: 'Can I use this on my phone?', a: 'Yes. The compressor works fully on mobile browsers — Android, iOS, and any modern browser. No app installation needed.' },
    { q: 'How do I compress a PDF for email?', a: 'Upload your PDF, select Medium or High compression, and download the result. Most email services allow attachments up to 25 MB, and our compressor can easily bring large PDFs under that limit.' },
    { q: 'Is Axom AI PDF Compressor really free?', a: 'Yes, it is completely free with a generous daily quota. No credit card, no subscription, no hidden fees. Made in India for everyone.' },
  ],

  ctaTitle: 'Compress Your PDF Now — Free & Instant',
  ctaDescription: 'Reduce PDF file size without quality loss. No watermark, no sign-up. Trusted by students, professionals, and government offices across India.',
  ctaPrimaryText: 'Open PDF Compressor',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Compressor',
  appAlternateNames: ['Axom PDF Compressor', 'AI PDF Size Reducer', 'Free PDF Compressor India'],
  appDescription: 'Free online PDF compressor that reduces file size up to 90% without quality loss. Supports Assamese, Hindi, and all Indian languages. No watermark.',
  appCategory: 'UtilitiesApplication, BusinessApplication',
  appFeatureList: ['Compress PDF up to 90%', 'No watermark', 'Indian language support', 'Auto-delete for privacy', 'Mobile-friendly', 'No sign-up required'],
  appRatingValue: '4.9',
  appReviewCount: '4120',
  howToSchemaName: 'How to Compress a PDF Online for Free',
  howToSchemaDescription: 'Reduce PDF file size without losing quality using Axom AI free PDF compressor.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI PDF Compressor',
};
