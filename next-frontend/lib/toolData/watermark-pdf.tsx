import React from 'react';
import {
  Stamp, Zap, Shield, Globe, Type, Palette,
  GraduationCap, Briefcase, Scale, Building2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'watermark-pdf',
  metaTitle: 'Add Watermark to PDF Online Free — Custom Text Watermarks | Axom AI',
  metaDescription:
    'Add custom text watermarks to PDF documents online for free. Set font, color, opacity, position, and rotation. No watermark on output, no sign-up. Made in India.',
  canonicalUrl: 'https://aiaxom.co.in/tools/watermark-pdf',
  keywords: [
    'watermark pdf', 'add watermark to pdf', 'pdf watermark', 'watermark pdf online',
    'watermark pdf free', 'text watermark pdf', 'custom watermark pdf', 'add text watermark to pdf',
    'pdf watermark tool', 'stamp pdf', 'pdf watermark maker', 'add watermark to pdf online free',
    'watermark pdf without losing quality', 'pdf watermark generator', 'diagonal watermark pdf',
    'draft watermark pdf', 'confidential watermark pdf', 'sample watermark pdf',
    'best free pdf watermark tool', 'watermark pdf no sign up',
    'how to add watermark to pdf', 'how to add text watermark to pdf online',
    'how to watermark pdf for free', 'how to add confidential stamp to pdf',
    'how to add draft watermark to pdf', 'can I add watermark to pdf without adobe',
    'how to add diagonal text watermark to pdf', 'how to stamp pdf with custom text',
    'how to add watermark to all pages of pdf', 'how to watermark pdf on mobile',
    'watermark pdf india', 'watermark pdf hindi', 'watermark pdf assamese',
    'add watermark to pdf for government documents india',
    'watermark pdf for legal documents india', 'watermark pdf for sarkari naukri',
    'pdf stamping tool india', 'watermark pdf for court documents',
    'bulk watermark pdf', 'batch watermark pdf', 'watermark multiple pdfs',
    'transparent watermark pdf', 'semi-transparent watermark pdf', 'opacity watermark pdf',
    'rotate watermark pdf', 'watermark pdf font size', 'watermark pdf color',
    'watermark pdf position', 'center watermark pdf', 'watermark pdf all pages',
    'watermark pdf no software', 'watermark pdf browser', 'free pdf stamping tool',
    'secure watermark pdf', 'private watermark pdf', 'watermark pdf no registration',
    'professional pdf watermark', 'corporate pdf watermark',
  ],
  breadcrumbName: 'Watermark PDF',

  heroBadgeText: 'Custom PDF Watermarking — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'PDF Watermark',
  heroHeadingSuffix: 'Tool — Add Custom Text Stamps',
  heroDescription:
    'Add professional text watermarks to your PDF documents instantly. Customize font, color, opacity, size, position, and rotation. Perfect for marking documents as Draft, Confidential, or with your organization name. No sign-up required.',
  heroTags: ['Custom Text Watermarks', 'Adjustable Opacity', 'All Pages at Once', '100% Free', 'No Sign-Up'],

  aeoTitle: 'What is Axom AI PDF Watermark Tool?',
  aeoDescription:
    '<strong>Axom AI PDF Watermark Tool</strong> lets you add custom text watermarks to any PDF document for free. You can set the watermark text (e.g., "DRAFT", "CONFIDENTIAL", "SAMPLE", or your company name), choose <strong>font size, color, opacity, rotation angle, and position</strong> on the page. The watermark is applied to all pages simultaneously. It supports <strong>Assamese (অসমীয়া), Hindi (हिन्दी)</strong>, and all Unicode text for watermarks. Ideal for legal professionals, businesses, government offices, and anyone who needs to mark documents before distribution.',
  aeoHighlights: ['Fully Customizable', 'All Pages at Once', 'Unicode Text Support', 'No Software Needed'],

  steps: [
    { title: 'Upload Your PDF', description: 'Drag and drop or browse to select your PDF. Supports multi-page documents up to 50 MB. Works on desktop and mobile browsers.' },
    { title: 'Customize Watermark', description: 'Enter your watermark text, then adjust font size, color, opacity (transparency), rotation angle, and position. Preview the result before applying.' },
    { title: 'Download Watermarked PDF', description: 'Click Apply Watermark and download your stamped PDF instantly. The watermark appears on every page. Auto-deleted for privacy.' },
  ],

  benefits: [
    { icon: <Type size={20} />, title: 'Fully Customizable Text', description: 'Set any text as your watermark — DRAFT, CONFIDENTIAL, SAMPLE, your name, or organization. Supports Unicode including Indian languages.' },
    { icon: <Palette size={20} />, title: 'Color & Opacity Control', description: 'Choose any color and set opacity from fully transparent to solid. Create subtle background marks or prominent stamps.' },
    { icon: <Stamp size={20} />, title: 'Professional Appearance', description: 'Diagonal, horizontal, or custom-angle watermarks with precise positioning give your documents a polished, professional look.' },
    { icon: <Zap size={20} />, title: 'Instant Processing', description: 'Watermarks are applied to all pages in seconds, even for large multi-page documents. No waiting, no queues.' },
    { icon: <Shield size={20} />, title: 'Secure & Private', description: 'Files are processed in isolated sessions and auto-deleted. Your documents never leave your control.' },
    { icon: <Globe size={20} />, title: 'Indian Language Watermarks', description: 'Add watermarks in Assamese, Hindi, Bengali, Tamil, or any Indic script — perfect for government and regional documents.' },
  ],

  useCases: [
    { icon: <Scale size={20} />, title: 'Legal Document Protection', description: 'Mark legal drafts, contracts, and affidavits with "DRAFT" or "CONFIDENTIAL" before circulation to prevent unauthorized use.', accent: 'purple' },
    { icon: <Briefcase size={20} />, title: 'Corporate Document Control', description: 'Stamp company documents with organization name or "INTERNAL USE ONLY" for document classification and access control.', accent: 'fuchsia' },
    { icon: <GraduationCap size={20} />, title: 'Academic Integrity', description: 'Watermark examination papers, answer keys, and evaluation sheets to prevent unauthorized distribution and copying.', accent: 'emerald' },
    { icon: <Building2 size={20} />, title: 'Government & Public Offices', description: 'Add official stamps and classification markings to government circulars, notifications, and public documents in regional languages.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Custom Text Watermark', axom: 'Any text, any language', other: 'Limited templates', paid: 'Full customization', axom_check: true, other_check: false },
    { feature: 'Opacity Control', axom: 'Full transparency slider', other: 'Fixed opacity', paid: 'Full control', axom_check: true, other_check: false },
    { feature: 'Indian Language Support', axom: 'Assamese, Hindi, Bengali+', other: 'Latin only', paid: 'Limited Indic', axom_check: true, other_check: false },
    { feature: 'Batch Watermarking', axom: 'All pages at once', other: 'Page-by-page', paid: 'Batch supported', axom_check: true, other_check: false },
    { feature: 'Output Watermark-Free', axom: 'No tool branding added', other: 'Tool watermark added', paid: 'Clean output', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'No sign-up needed', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Max File Size', value: '50 MB per PDF' },
    { label: 'Watermark Type', value: 'Text (custom Unicode)' },
    { label: 'Controls', value: 'Font, color, opacity, angle, position' },
    { label: 'Processing Engine', value: 'PyPDF / ReportLab' },
  ],

  regionalTitle: 'Watermark PDFs in Assamese, Hindi & Indian Languages',
  regionalDescription:
    'Axom AI is built in <strong>Assam, India</strong> and fully supports watermarks in <strong>Assamese (অসমীয়া)</strong>, Hindi (हिन्दी), Bengali, Tamil, Telugu, and all 22 scheduled languages of India. Government offices can add official classification stamps in regional languages. Legal professionals can mark documents for Indian courts. Educators can watermark question papers and answer keys in their medium of instruction.',
  regionalBadge: "🇮🇳 India's Sovereign AI Document Platform",

  faqs: [
    { q: 'What text can I use as a watermark?', a: 'Any text you want — DRAFT, CONFIDENTIAL, SAMPLE, your company name, a date, or any custom text. You can even type in Assamese, Hindi, or any Indian language.' },
    { q: 'Can I control the watermark transparency?', a: 'Yes. You can adjust opacity from nearly invisible (10%) to fully opaque (100%). Most users prefer 20-40% opacity for a professional, non-intrusive look.' },
    { q: 'Is the watermark added to all pages?', a: 'Yes. The watermark is applied uniformly to every page of your PDF document in a single operation.' },
    { q: 'Can I rotate the watermark text?', a: 'Yes. You can set any rotation angle. The most popular choices are diagonal (45°) and horizontal (0°), but any angle between 0° and 360° is supported.' },
    { q: 'Does Axom AI add its own watermark?', a: 'Never. The only watermark on your PDF is the one you create. Axom AI does not add any branding or tool watermark to the output.' },
    { q: 'Can I watermark PDFs in Hindi or Assamese?', a: 'Absolutely. Axom AI supports all Unicode scripts. You can type watermark text in Assamese (অসমীয়া), Hindi (हिन्दी), Bengali, Tamil, or any language.' },
    { q: 'What is the file size limit?', a: 'PDFs up to 50 MB are supported on the free tier. This covers most multi-page documents, reports, and presentations.' },
    { q: 'Is my document kept on the server?', a: 'No. Files are auto-deleted within minutes of processing. We never store, analyze, or share your documents.' },
    { q: 'Can I choose the watermark color?', a: 'Yes. You can select any color for your watermark text using a color picker. Popular choices include gray, red, and blue.' },
    { q: 'Does this work on mobile?', a: 'Yes. The watermark tool works fully in mobile browsers on Android and iOS. No app installation needed.' },
  ],

  ctaTitle: 'Add Watermark to Your PDF Now — Free',
  ctaDescription: 'Stamp your PDFs with custom text watermarks. Full control over font, color, opacity, and rotation. No sign-up, no branding.',
  ctaPrimaryText: 'Open Watermark Tool',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Watermark Tool',
  appAlternateNames: ['Axom PDF Watermark', 'Free PDF Watermark Online', 'PDF Stamp Tool'],
  appDescription: 'Add custom text watermarks to PDF documents online for free. Adjustable font, color, opacity, rotation, and position. No branding on output.',
  appCategory: 'UtilitiesApplication, BusinessApplication',
  appFeatureList: ['Custom text watermark', 'Opacity control', 'Color picker', 'Rotation angle', 'All pages at once', 'Indian language support'],
  appRatingValue: '4.8',
  appReviewCount: '2150',
  howToSchemaName: 'How to Add a Watermark to a PDF Online',
  howToSchemaDescription: 'Add custom text watermarks to PDF documents using Axom AI free watermark tool.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI PDF Watermark Tool',
};
