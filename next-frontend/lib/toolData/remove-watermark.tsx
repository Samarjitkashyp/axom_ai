import React from 'react';
import {
  Eraser, Zap, Shield, Globe, Eye, ScanSearch,
  GraduationCap, Briefcase, Scale, ImageDown,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'remove-watermark',
  metaTitle: 'Remove Watermark from PDF Online Free — Visual Editor | Axom AI',
  metaDescription:
    'Remove watermarks from PDF documents using a visual editor. Scan, detect, and erase text watermarks from PDFs online. Free, no sign-up, no software needed.',
  canonicalUrl: 'https://aiaxom.co.in/tools/remove-watermark',
  keywords: [
    'remove watermark from pdf', 'pdf watermark remover', 'erase watermark pdf',
    'delete watermark from pdf', 'remove watermark pdf online', 'remove watermark pdf free',
    'pdf watermark eraser', 'clean watermark from pdf', 'remove text watermark pdf',
    'remove stamp from pdf', 'remove draft watermark pdf', 'remove confidential watermark pdf',
    'remove sample watermark from pdf', 'pdf watermark remover online free',
    'best pdf watermark remover', 'remove watermark from pdf without adobe',
    'how to remove watermark from pdf', 'how to remove watermark from pdf online free',
    'how to erase watermark from pdf without software', 'how to delete watermark from pdf document',
    'can I remove watermark from pdf for free', 'how to remove draft watermark from pdf',
    'how to remove text watermark from scanned pdf', 'how to clean watermark from pdf pages',
    'how to remove watermark from pdf on mobile', 'how to remove watermark from pdf without losing content',
    'remove watermark pdf india', 'remove watermark pdf hindi', 'remove watermark pdf assamese',
    'pdf watermark remover for indian documents', 'remove watermark from government pdf',
    'remove watermark from legal pdf india', 'remove stamp from official document pdf',
    'remove watermark from downloaded pdf india',
    'visual watermark remover pdf', 'scan and remove watermark pdf', 'detect watermark pdf',
    'automatic watermark detection pdf', 'watermark scanner pdf', 'pdf watermark editor',
    'free watermark removal tool', 'online watermark eraser', 'pdf cleaner online',
    'remove overlay from pdf', 'remove background text from pdf', 'clean pdf document',
    'pdf watermark removal no signup', 'pdf watermark removal no registration',
    'private watermark removal', 'secure watermark remover', 'batch watermark removal pdf',
    'remove watermark all pages pdf', 'pdf watermark remover mobile',
  ],
  breadcrumbName: 'Remove Watermark',

  heroBadgeText: 'Visual Watermark Removal — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'Watermark Remover',
  heroHeadingSuffix: 'for PDF — Visual Editor',
  heroDescription:
    'Scan and erase watermarks from PDF documents using our intelligent visual editor. Detect text watermarks, preview the removal, and download a clean PDF. Works on draft stamps, confidential marks, and background text overlays. No sign-up needed.',
  heroTags: ['Visual Watermark Scanner', 'Smart Detection', 'Preview Before Saving', '100% Free', 'No Software Needed'],

  aeoTitle: 'What is Axom AI PDF Watermark Remover?',
  aeoDescription:
    '<strong>Axom AI PDF Watermark Remover</strong> is a free online visual editor that scans PDF documents to detect and erase embedded text watermarks. It identifies common watermarks like "DRAFT", "CONFIDENTIAL", "SAMPLE", and custom text overlays, then allows you to selectively remove them while preserving the underlying content. The tool uses intelligent detection algorithms to differentiate watermark text from document content. It supports PDFs with <strong>Assamese (অসমীয়া), Hindi (हिन्दी)</strong>, and multilingual content. Important: this tool works best with text-based PDF watermarks; image-based watermarks in rasterized/scanned PDFs may have limited removal capability.',
  aeoHighlights: ['Smart Watermark Detection', 'Visual Preview', 'Content Preservation', 'Multi-Language Support'],

  steps: [
    { title: 'Upload Your PDF', description: 'Drag and drop or browse to select the PDF with watermarks. Supports multi-page documents up to 50 MB. Works on any modern browser.' },
    { title: 'Scan & Select Watermarks', description: 'The visual editor scans your document and highlights detected watermarks. Review and confirm which watermarks to remove. Preview the cleaned result before saving.' },
    { title: 'Download Clean PDF', description: 'Click Remove & Download to get your clean PDF without the watermarks. The original layout and content are preserved. Files auto-deleted for privacy.' },
  ],

  benefits: [
    { icon: <ScanSearch size={20} />, title: 'Intelligent Detection', description: 'Advanced algorithms scan each page to identify and highlight watermark text, distinguishing it from actual document content.' },
    { icon: <Eye size={20} />, title: 'Visual Preview', description: 'See exactly what will be removed before downloading. Review the clean version to ensure no content is accidentally affected.' },
    { icon: <Eraser size={20} />, title: 'Selective Removal', description: 'Choose which detected watermarks to remove. Keep some stamps while erasing others for precise document control.' },
    { icon: <Zap size={20} />, title: 'Fast Processing', description: 'Detection and removal happen in seconds on our optimized servers. No waiting in queues or watching progress bars.' },
    { icon: <Shield size={20} />, title: 'Private & Secure', description: 'Documents are processed in isolated sessions and auto-deleted. Your sensitive files never leave your control.' },
    { icon: <Globe size={20} />, title: 'Multilingual Support', description: 'Works with PDFs containing Assamese, Hindi, Bengali, and all Unicode scripts. Watermark detection handles multilingual overlays.' },
  ],

  useCases: [
    { icon: <Briefcase size={20} />, title: 'Clean Document Drafts', description: 'Remove DRAFT watermarks from finalized documents before official distribution, printing, or archiving.', accent: 'purple' },
    { icon: <Scale size={20} />, title: 'Legal Document Cleanup', description: 'Erase sample or preview watermarks from purchased legal templates and downloaded court document formats.', accent: 'fuchsia' },
    { icon: <GraduationCap size={20} />, title: 'Academic Papers', description: 'Clean watermarks from reference papers, downloaded textbook previews, and study materials for better readability.', accent: 'emerald' },
    { icon: <ImageDown size={20} />, title: 'Archiving & Records', description: 'Remove outdated classification stamps from documents being re-archived or updated for current use.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Visual Editor', axom: 'Interactive scan & preview', other: 'Blind removal only', paid: 'Editor available', axom_check: true, other_check: false },
    { feature: 'Smart Detection', axom: 'AI-powered watermark scan', other: 'Manual text match only', paid: 'Smart detection', axom_check: true, other_check: false },
    { feature: 'Selective Removal', axom: 'Choose which to remove', other: 'All-or-nothing', paid: 'Selective', axom_check: true, other_check: false },
    { feature: 'Output Quality', axom: 'Content fully preserved', other: 'May lose formatting', paid: 'High quality', axom_check: true, other_check: false },
    { feature: 'No Account Required', axom: 'No sign-up needed', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
    { feature: 'Indian Language PDFs', axom: 'Full Unicode support', other: 'Latin only', paid: 'Limited Indic', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Max File Size', value: '50 MB per PDF' },
    { label: 'Detection Method', value: 'Text overlay analysis' },
    { label: 'Supported Watermarks', value: 'Text-based overlays' },
    { label: 'Processing Engine', value: 'PyPDF + custom scanner' },
  ],

  regionalTitle: 'Remove Watermarks from Indian Language PDFs',
  regionalDescription:
    'Built in <strong>Assam, India</strong>, Axom AI Watermark Remover handles PDFs with <strong>Assamese (অসমীয়া)</strong>, Hindi, Bengali, and all Indian language content. Remove watermarks from government document templates, legal form previews, and educational materials while preserving regional language text. Optimized for Indian network conditions and mobile browsers.',
  regionalBadge: "🇮🇳 India's Sovereign Document AI",

  faqs: [
    { q: 'What types of watermarks can be removed?', a: 'Axom AI can remove text-based watermarks embedded in the PDF layer — such as "DRAFT", "CONFIDENTIAL", "SAMPLE", and custom text overlays. Image-based watermarks in scanned/rasterized PDFs have limited support.' },
    { q: 'Will removing the watermark damage my document?', a: 'No. The tool carefully removes only the watermark layer while preserving all underlying text, images, and formatting. You can preview the result before downloading.' },
    { q: 'Can I choose which watermarks to remove?', a: 'Yes. The visual editor highlights all detected watermarks and lets you select which ones to remove and which to keep.' },
    { q: 'Does this work on scanned PDFs?', a: 'The tool works best with text-based PDF watermarks (added digitally). For scanned documents where the watermark is part of the image, removal capability is limited.' },
    { q: 'Is there a file size limit?', a: 'Yes, PDFs up to 50 MB are supported on the free tier. This covers most multi-page documents.' },
    { q: 'Is my document safe?', a: 'Absolutely. Files are processed in isolated sessions and auto-deleted within minutes. We never store, read, or share your documents.' },
    { q: 'Does Axom AI add its own watermark?', a: 'Never. The output PDF is completely clean with no Axom AI branding or watermark added.' },
    { q: 'Can I remove watermarks from PDFs in Hindi or Assamese?', a: 'Yes. The tool fully supports PDFs with Assamese, Hindi, Bengali, and all Unicode content. Watermark detection works regardless of the document language.' },
    { q: 'Does this work on mobile?', a: 'Yes. The visual editor and all features work in mobile browsers on Android and iOS without any app installation.' },
    { q: 'Is this legal to use?', a: 'The tool is designed for legitimate use — removing your own watermarks from your own documents. Always ensure you have the right to modify the documents you process.' },
  ],

  ctaTitle: 'Remove Watermarks from Your PDF — Free',
  ctaDescription: 'Scan, detect, and erase watermarks from PDF documents with our visual editor. Preview before saving. No sign-up needed.',
  ctaPrimaryText: 'Open Watermark Remover',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Watermark Remover',
  appAlternateNames: ['Axom Watermark Remover', 'PDF Watermark Eraser', 'Free PDF Watermark Removal'],
  appDescription: 'Remove watermarks from PDF documents using a visual editor. Smart detection, preview, and selective removal. Free, no sign-up.',
  appCategory: 'UtilitiesApplication, BusinessApplication',
  appFeatureList: ['Visual watermark scanner', 'Smart detection', 'Selective removal', 'Preview before saving', 'Indian language support', 'No sign-up required'],
  appRatingValue: '4.7',
  appReviewCount: '1870',
  howToSchemaName: 'How to Remove Watermark from a PDF Online',
  howToSchemaDescription: 'Scan and erase watermarks from PDF documents using Axom AI free visual watermark remover.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI PDF Watermark Remover',
};
