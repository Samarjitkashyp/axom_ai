import React from 'react';
import {
  Unlock, Zap, Shield, Globe, KeyRound, FileOutput,
  GraduationCap, Briefcase, Scale, Printer,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'unlock-pdf',
  metaTitle: 'Unlock PDF Online Free — Remove Password & Restrictions | Axom AI',
  metaDescription:
    'Remove passwords and restrictions from PDF files online for free. Unlock editing, printing, and copying. Enter the password to decrypt. No watermark, no sign-up.',
  canonicalUrl: 'https://aiaxom.co.in/tools/unlock-pdf',
  keywords: [
    'unlock pdf', 'remove pdf password', 'pdf unlocker', 'unlock pdf online',
    'unlock pdf free', 'remove password from pdf', 'pdf password remover',
    'unlock pdf online free', 'decrypt pdf', 'remove pdf restrictions',
    'remove pdf editing restriction', 'remove pdf printing restriction',
    'unlock pdf for editing', 'unlock pdf for printing', 'unlock pdf for copying',
    'pdf unlocker online free', 'best pdf unlocker', 'free pdf password remover',
    'remove pdf security', 'pdf decryptor online', 'unlock protected pdf',
    'how to unlock a pdf', 'how to remove password from pdf', 'how to unlock pdf for editing',
    'how to remove pdf restrictions', 'how to unlock pdf for printing',
    'how to decrypt pdf online', 'how to remove pdf security settings',
    'how to unlock pdf without password', 'how to remove owner password from pdf',
    'how to unlock pdf on mobile',
    'unlock pdf india', 'remove pdf password india', 'unlock pdf hindi',
    'unlock pdf assamese', 'pdf unlocker for indian documents',
    'remove password from government pdf india', 'unlock pdf for sarkari form',
    'unlock pdf for bank statement india', 'decrypt pdf for ca filing india',
    'remove pdf restriction for printing india',
    'unlock pdf permissions', 'remove pdf copy restriction', 'remove pdf form restriction',
    'pdf restriction remover', 'pdf security remover', 'pdf permission remover',
    'unlock pdf no signup', 'unlock pdf no registration', 'fast pdf unlocker',
    'secure pdf unlocker', 'private pdf decryptor', 'batch unlock pdf',
    'unlock pdf browser', 'unlock pdf mobile', 'unlock pdf online no software',
    'remove pdf password protection', 'disable pdf security',
  ],
  breadcrumbName: 'Unlock PDF',

  heroBadgeText: 'PDF Decryption & Unlock — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'PDF Unlocker',
  heroHeadingSuffix: '— Remove Passwords & Restrictions',
  heroDescription:
    'Remove passwords and permission restrictions from PDF files instantly. Enter the known password to decrypt and unlock editing, printing, and copying. Remove owner-password restrictions from PDFs you are authorized to modify. No watermark, no sign-up.',
  heroTags: ['Remove Open Password', 'Unlock Editing', 'Unlock Printing', '100% Free', 'No Software Needed'],

  aeoTitle: 'What is Axom AI PDF Unlocker?',
  aeoDescription:
    '<strong>Axom AI PDF Unlocker</strong> is a free online tool that removes password protection and permission restrictions from PDF files. If your PDF has an <strong>open password</strong>, you enter the known password and the tool produces a decrypted, unlocked copy. If the PDF has <strong>permission restrictions</strong> (editing, printing, copying disabled), the tool can remove those restrictions. This is designed for users who own the PDF or have authorization to modify it — such as unlocking your own bank statement for editing, removing restrictions from a purchased document, or decrypting a file whose password you know but want to remove for convenience. Supports PDFs with <strong>Assamese, Hindi</strong>, and all Indian languages.',
  aeoHighlights: ['Remove Open Passwords', 'Remove Permission Restrictions', 'Unlock Edit/Print/Copy', 'All Languages Preserved'],

  steps: [
    { title: 'Upload Locked PDF', description: 'Drag and drop or browse to select the password-protected or restricted PDF. Files up to 50 MB are supported.' },
    { title: 'Enter Password (if required)', description: 'If the PDF has an open password, enter it. For PDFs with only permission restrictions (no open password), just click Unlock directly.' },
    { title: 'Download Unlocked PDF', description: 'The tool decrypts and removes all restrictions. Download your fully unlocked PDF — ready for editing, printing, and copying. Auto-deleted for privacy.' },
  ],

  benefits: [
    { icon: <Unlock size={20} />, title: 'Complete Restriction Removal', description: 'Removes both open passwords and permission restrictions — unlock editing, printing, copying, and form-filling in one step.' },
    { icon: <KeyRound size={20} />, title: 'Password-Based Decryption', description: 'Enter your known password to decrypt open-password-protected PDFs. Produces a clean, unencrypted copy you can use freely.' },
    { icon: <FileOutput size={20} />, title: 'Original Quality Preserved', description: 'The unlocked PDF retains all original content — text, images, fonts, formatting, and Indian language characters — with zero quality loss.' },
    { icon: <Zap size={20} />, title: 'Instant Processing', description: 'Decryption and restriction removal happen in seconds on our optimized servers, regardless of page count.' },
    { icon: <Shield size={20} />, title: 'Private & Secure', description: 'Your PDF and password are processed in isolated sessions and immediately deleted. We never store passwords or document content.' },
    { icon: <Globe size={20} />, title: 'Indian Language Support', description: 'Works with PDFs containing Assamese, Hindi, Bengali, Tamil, and all Unicode scripts. Decryption preserves every character perfectly.' },
  ],

  useCases: [
    { icon: <Briefcase size={20} />, title: 'Unlock Bank Statements', description: 'Remove passwords from bank statement PDFs (using the password your bank provided) for editing, annotation, and CA filing.', accent: 'purple' },
    { icon: <Printer size={20} />, title: 'Enable Printing', description: 'Remove print restrictions from PDFs you own — print contracts, reports, and downloaded documents that have printing disabled.', accent: 'fuchsia' },
    { icon: <Scale size={20} />, title: 'Legal Document Access', description: 'Unlock permission-restricted legal documents for annotation, commenting, and cross-referencing during case preparation.', accent: 'emerald' },
    { icon: <GraduationCap size={20} />, title: 'Academic Materials', description: 'Remove copy restrictions from study materials and reference PDFs to enable note-taking, highlighting, and excerpt copying for research.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Open Password Removal', axom: 'Enter password → unlock', other: 'Limited or unavailable', paid: 'Full support', axom_check: true, other_check: false },
    { feature: 'Permission Restriction Removal', axom: 'Edit, print, copy unlocked', other: 'Partial only', paid: 'Full support', axom_check: true, other_check: false },
    { feature: 'Content Preservation', axom: '100% original quality', other: 'May lose formatting', paid: 'Full preservation', axom_check: true, other_check: false },
    { feature: 'Watermark-Free Output', axom: 'No tool branding', other: 'Watermark added', paid: 'Clean output', axom_check: true, other_check: false },
    { feature: 'File Size Limit', axom: 'Up to 50 MB free', other: '5–10 MB', paid: 'Unlimited', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'No sign-up needed', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Decryption Support', value: 'AES-128, AES-256, RC4' },
    { label: 'Restriction Removal', value: 'Edit, print, copy, form-fill' },
    { label: 'Max File Size', value: '50 MB per PDF' },
    { label: 'Processing Engine', value: 'qpdf / PyPDF' },
  ],

  regionalTitle: 'Unlock PDFs for Indian Banking, Legal & Academic Use',
  regionalDescription:
    'Built in <strong>Assam, India</strong>, Axom AI PDF Unlocker is designed for Indian users who need to unlock bank statements (SBI, HDFC, ICICI password-protected PDFs), remove restrictions from legal documents for court filing, and enable printing of downloaded government forms. Full support for <strong>Assamese (অসমীয়া)</strong>, Hindi, Bengali, and all Indian languages. Optimized for Indian network conditions and mobile browsers.',
  regionalBadge: "🇮🇳 India's Own Document Security Platform",

  faqs: [
    { q: 'Can I unlock a PDF without knowing the password?', a: 'For PDFs with an open password, you must provide the correct password. For PDFs with only permission restrictions (no open password required to view), the tool can remove those restrictions directly.' },
    { q: 'Is it legal to unlock a PDF?', a: 'Yes, as long as you own the document or are authorized to modify it. Common legitimate uses include unlocking your own bank statements, removing restrictions from purchased documents, and decrypting files whose password you know.' },
    { q: 'Will unlocking damage my PDF?', a: 'No. The unlocking process removes only the encryption/restriction layer. All content — text, images, fonts, and formatting including Indian language characters — is preserved exactly as in the original.' },
    { q: 'Can I unlock bank statement PDFs?', a: 'Yes. Indian bank statement PDFs (from SBI, HDFC, ICICI, etc.) are typically protected with passwords like your date of birth or account number. Enter that password and the tool produces an unlocked copy.' },
    { q: 'Does Axom AI store my password?', a: 'Never. Your password is used only during the decryption process and immediately discarded. We have zero access to your passwords.' },
    { q: 'Can I unlock PDFs with Assamese or Hindi content?', a: 'Absolutely. Decryption preserves all Unicode content perfectly, including Assamese (অসমীয়া), Hindi (हिन्दी), Bengali, Tamil, Telugu, and every other script.' },
    { q: 'What restrictions can be removed?', a: 'The tool can remove restrictions on editing, printing, copying text, and filling forms. After unlocking, you have full access to all PDF functions.' },
    { q: 'Does the unlocked PDF have a watermark?', a: 'No. Axom AI does not add any watermark, branding, or footer to the unlocked PDF. The output is your original document without encryption.' },
    { q: 'Can I use this on mobile?', a: 'Yes. The PDF unlocker works fully in mobile browsers on Android and iOS. No app installation needed.' },
    { q: 'Is Axom AI PDF Unlocker really free?', a: 'Yes, completely free with a generous daily quota. No credit card, no subscription, no hidden fees. Made in India for everyone.' },
  ],

  ctaTitle: 'Unlock Your PDF Now — Free & Instant',
  ctaDescription: 'Remove passwords and restrictions from PDF files. Unlock editing, printing, and copying. No watermark, no sign-up.',
  ctaPrimaryText: 'Open PDF Unlocker',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Unlocker',
  appAlternateNames: ['Axom PDF Unlocker', 'Free PDF Password Remover', 'PDF Restriction Remover'],
  appDescription: 'Remove passwords and restrictions from PDF files online for free. Unlock editing, printing, and copying. No watermark, no sign-up.',
  appCategory: 'UtilitiesApplication, SecurityApplication',
  appFeatureList: ['Remove open passwords', 'Remove permission restrictions', 'Unlock editing', 'Unlock printing', 'No watermark', 'Indian language support'],
  appRatingValue: '4.8',
  appReviewCount: '3680',
  howToSchemaName: 'How to Unlock a PDF Online for Free',
  howToSchemaDescription: 'Remove passwords and restrictions from PDF files using Axom AI free PDF unlocker.',
  howToTotalTime: 'PT10S',
  howToToolName: 'Axom AI PDF Unlocker',
};
