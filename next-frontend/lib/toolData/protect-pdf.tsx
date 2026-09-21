import React from 'react';
import {
  Lock, Zap, Shield, Globe, KeyRound, FileCheck,
  GraduationCap, Briefcase, Scale, Building2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'protect-pdf',
  metaTitle: 'Protect PDF with Password Online Free — Encrypt PDF | Axom AI',
  metaDescription:
    'Password-protect and encrypt PDF files online for free. Add open password and permission restrictions. AES-256 encryption. No watermark, no sign-up. Made in India.',
  canonicalUrl: 'https://aiaxom.co.in/tools/protect-pdf',
  keywords: [
    'protect pdf', 'password protect pdf', 'encrypt pdf', 'lock pdf', 'pdf password protection',
    'protect pdf online', 'protect pdf free', 'encrypt pdf online', 'lock pdf with password',
    'pdf encryption tool', 'add password to pdf', 'secure pdf', 'pdf security tool',
    'password protect pdf online free', 'encrypt pdf free', 'lock pdf online',
    'aes 256 pdf encryption', 'pdf password protection tool', 'protect pdf no watermark',
    'best free pdf encryption tool', 'protect pdf without adobe',
    'how to password protect a pdf', 'how to encrypt a pdf file', 'how to lock a pdf with password',
    'how to add password to pdf online free', 'how to secure pdf before sending',
    'how to encrypt pdf for email', 'how to protect pdf from editing',
    'how to add open password to pdf', 'how to restrict pdf printing',
    'how to password protect pdf on mobile',
    'protect pdf india', 'encrypt pdf india', 'password protect pdf hindi',
    'protect pdf assamese', 'pdf encryption for indian documents',
    'secure pdf for government submission india', 'protect pdf for legal filing india',
    'encrypt pdf for bank documents india', 'password protect pdf for sarkari documents',
    'pdf security tool for competitive exams',
    'pdf permission restrictions', 'restrict pdf editing', 'restrict pdf printing',
    'restrict pdf copying', 'pdf owner password', 'pdf user password', 'pdf open password',
    'batch protect pdf', 'bulk encrypt pdf', 'secure pdf online', 'private pdf encryption',
    'protect pdf no signup', 'protect pdf no registration', 'fast pdf encryption',
    'pdf security online free', 'pdf locker online', 'pdf protector free',
    'protect pdf before sharing', 'encrypt pdf for cloud storage',
  ],
  breadcrumbName: 'Protect PDF',

  heroBadgeText: 'AES-256 PDF Encryption — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'PDF Protector',
  heroHeadingSuffix: '— Password Encrypt Instantly',
  heroDescription:
    'Encrypt your PDF files with strong AES-256 password protection. Set an open password to restrict access and permission passwords to control editing, printing, and copying. No watermark, no sign-up required.',
  heroTags: ['AES-256 Encryption', 'Open Password', 'Permission Control', '100% Free', 'No Sign-Up'],

  aeoTitle: 'What is Axom AI PDF Protector?',
  aeoDescription:
    '<strong>Axom AI PDF Protector</strong> is a free online tool that encrypts PDF documents with <strong>AES-256 bit encryption</strong> — the same standard used by banks and government agencies. You can set an <strong>open password</strong> (required to view the document) and a <strong>permissions password</strong> (to control editing, printing, copying, and form-filling). The encryption is applied server-side and your password is never stored. Supports PDFs with <strong>Assamese (অসমীয়া), Hindi (हिन्दी)</strong>, and all Unicode content. Perfect for securing legal contracts, financial statements, medical records, and confidential business documents before sharing via email or cloud storage.',
  aeoHighlights: ['AES-256 Encryption', 'Open & Permission Passwords', 'Zero Password Storage', 'Indian Language PDFs'],

  steps: [
    { title: 'Upload Your PDF', description: 'Drag and drop or browse to select the PDF you want to protect. Supports files up to 50 MB. Works on desktop and mobile browsers.' },
    { title: 'Set Password & Permissions', description: 'Enter an open password (to restrict viewing) and optionally set permission restrictions — disable editing, printing, copying, or form-filling as needed.' },
    { title: 'Download Protected PDF', description: 'Click Encrypt and download your password-protected PDF. The encryption is applied instantly. Your password is never stored on our servers.' },
  ],

  benefits: [
    { icon: <Lock size={20} />, title: 'AES-256 Encryption', description: 'Industry-standard AES-256 bit encryption — the same level used by military, banking, and government agencies worldwide.' },
    { icon: <KeyRound size={20} />, title: 'Dual Password Support', description: 'Set an open password to restrict document access and a separate permissions password to control editing, printing, and copying rights.' },
    { icon: <Shield size={20} />, title: 'Zero Password Storage', description: 'Your passwords are used only during encryption and immediately discarded. We never store, log, or have access to your passwords.' },
    { icon: <Zap size={20} />, title: 'Instant Encryption', description: 'Server-side encryption processes your PDF in seconds, regardless of page count or complexity.' },
    { icon: <FileCheck size={20} />, title: 'Permission Controls', description: 'Fine-grained control to disable editing, printing, copying text, and form-filling — customize exactly what recipients can do.' },
    { icon: <Globe size={20} />, title: 'All Languages Preserved', description: 'Encryption preserves all content including Assamese, Hindi, Bengali, Tamil, and other Indian language text without corruption.' },
  ],

  useCases: [
    { icon: <Scale size={20} />, title: 'Legal Contracts & NDAs', description: 'Encrypt confidential legal agreements, NDAs, and court filings with password protection before sharing with parties.', accent: 'purple' },
    { icon: <Briefcase size={20} />, title: 'Financial Documents', description: 'Protect tax returns, bank statements, invoices, and financial reports with AES-256 encryption before email transmission.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'HR & Employee Records', description: 'Secure salary slips, offer letters, appraisal documents, and employee records with password protection for compliance.', accent: 'emerald' },
    { icon: <GraduationCap size={20} />, title: 'Academic & Research', description: 'Protect thesis drafts, research papers, and examination documents from unauthorized access and distribution.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Encryption Standard', axom: 'AES-256 bit', other: 'RC4 or 128-bit', paid: 'AES-256', axom_check: true, other_check: false },
    { feature: 'Permission Controls', axom: 'Edit, print, copy controls', other: 'Open password only', paid: 'Full controls', axom_check: true, other_check: false },
    { feature: 'Password Storage', axom: 'Never stored', other: 'May be logged', paid: 'Varies', axom_check: true, other_check: false },
    { feature: 'Watermark-Free Output', axom: 'No tool branding', other: 'Watermark added', paid: 'Clean output', axom_check: true, other_check: false },
    { feature: 'File Size Limit', axom: 'Up to 50 MB free', other: '5–10 MB', paid: 'Unlimited', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'No sign-up needed', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Encryption', value: 'AES-256 bit' },
    { label: 'Password Types', value: 'Open + Permissions' },
    { label: 'Max File Size', value: '50 MB per PDF' },
    { label: 'Processing Engine', value: 'qpdf / PyPDF' },
  ],

  regionalTitle: 'Encrypt PDFs for Indian Legal, Banking & Government Use',
  regionalDescription:
    'Built in <strong>Assam, India</strong>, Axom AI PDF Protector meets the security needs of Indian professionals. Encrypt documents for e-filing in Indian courts, protect financial statements for CA submissions, and secure HR records for compliance with Indian labor laws. Full support for <strong>Assamese (অসমীয়া)</strong>, Hindi, Bengali, and all scheduled languages. Optimized for Indian networks and mobile browsers.',
  regionalBadge: "🇮🇳 India's Secure Document AI Platform",

  faqs: [
    { q: 'How strong is the encryption?', a: 'Axom AI uses AES-256 bit encryption, which is the highest standard available for PDF security. It is the same encryption used by banks, military, and government agencies worldwide.' },
    { q: 'What is the difference between open and permissions passwords?', a: 'The open password is required to view the PDF at all. The permissions password controls what the viewer can do — disable editing, printing, copying, or form-filling. You can set one or both.' },
    { q: 'Does Axom AI store my password?', a: 'Never. Your password is used only during the encryption process and immediately discarded. We have zero access to your passwords or encrypted content.' },
    { q: 'Can I restrict printing but allow viewing?', a: 'Yes. You can set permission controls independently. Allow viewing with an open password while restricting printing, editing, copying, and form-filling via the permissions password.' },
    { q: 'Will encryption damage my PDF content?', a: 'No. Encryption wraps the existing PDF in a security layer. All text, images, fonts, and formatting — including Assamese and Hindi content — are preserved perfectly.' },
    { q: 'Can I protect PDFs with Indian language content?', a: 'Absolutely. Encryption preserves all Unicode content including Assamese (অসমীয়া), Hindi (हिन्दी), Bengali, Tamil, Telugu, and every other script without any corruption.' },
    { q: 'What is the file size limit?', a: 'PDFs up to 50 MB are supported on the free tier. This covers virtually all business, legal, and academic documents.' },
    { q: 'Does the protected PDF have a watermark?', a: 'No. Axom AI does not add any watermark, branding, or footer to your encrypted PDF. The output is your original document with encryption applied.' },
    { q: 'Can I use this on my phone?', a: 'Yes. The PDF protector works fully in mobile browsers on Android and iOS. No app installation needed.' },
    { q: 'Is this really free?', a: 'Yes, completely free with a daily quota. AES-256 encryption at zero cost, no credit card or subscription required. Made in India.' },
  ],

  ctaTitle: 'Protect Your PDF Now — Free AES-256 Encryption',
  ctaDescription: 'Password-protect and encrypt your PDF with military-grade AES-256 encryption. Set open and permission passwords. No watermark, no sign-up.',
  ctaPrimaryText: 'Open PDF Protector',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Protector',
  appAlternateNames: ['Axom PDF Protector', 'Free PDF Encryptor', 'PDF Password Protection Tool'],
  appDescription: 'Encrypt PDF files with AES-256 password protection online for free. Set open and permission passwords. No watermark, no sign-up.',
  appCategory: 'SecurityApplication, UtilitiesApplication',
  appFeatureList: ['AES-256 encryption', 'Open password', 'Permissions password', 'Edit/print/copy restrictions', 'No watermark', 'Zero password storage'],
  appRatingValue: '4.9',
  appReviewCount: '3250',
  howToSchemaName: 'How to Password Protect a PDF Online',
  howToSchemaDescription: 'Encrypt a PDF file with AES-256 password protection using Axom AI free PDF protector.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI PDF Protector',
};
