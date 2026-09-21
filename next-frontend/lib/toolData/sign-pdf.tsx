import React from 'react';
import {
  PenTool,
  FileSignature,
  Upload,
  Download,
  Lock,
  Zap,
  Smartphone,
  Shield,
  Briefcase,
  FileText,
  GraduationCap,
  Globe2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'sign-pdf',
  metaTitle: 'Sign PDF Online Free — Draw or Insert Electronic Signature | Axom AI',
  metaDescription:
    'Free online PDF signing tool. Draw or insert your electronic signature and place it anywhere on a PDF document. No signup, no watermark, privacy-first.',
  canonicalUrl: 'https://aiaxom.co.in/tools/sign-pdf',
  keywords: [
    'sign pdf',
    'sign pdf online',
    'sign pdf free',
    'sign pdf online free',
    'electronic signature pdf',
    'e-sign pdf',
    'e-sign pdf online',
    'pdf signature tool',
    'add signature to pdf',
    'insert signature pdf',
    'draw signature on pdf',
    'free pdf signing tool',
    'pdf signer online',
    'sign document online free',
    'digital signature pdf free',
    'online pdf signature',
    'sign pdf without printing',
    'sign pdf no download',
    'sign pdf no signup',
    'pdf e-signature tool',
    'how to sign a PDF online',
    'how to add electronic signature to PDF',
    'how to sign a PDF without printing',
    'how to draw signature on PDF',
    'how to e-sign a PDF for free',
    'how to insert signature in PDF document',
    'can I sign a PDF online for free',
    'how to sign PDF on phone',
    'how to sign PDF without Adobe',
    'what is an electronic signature on PDF',
    'best free pdf signing tool online',
    'sign pdf alternative to DocuSign',
    'sign pdf alternative to Adobe Sign',
    'pdf signature no watermark',
    'pdf signer browser-based',
    'sign pdf client-side',
    'sign pdf privacy',
    'sign pdf on mobile',
    'sign pdf Android iOS',
    'sign pdf for contracts',
    'sign pdf for legal documents',
    'sign pdf for HR forms',
    'sign pdf for invoices',
    'sign multiple pdfs free',
    'place signature anywhere on pdf',
    'resize signature on pdf',
    'type signature on pdf',
    'upload signature image pdf',
    'sign pdf India',
    'free e-signature India',
    'pdf signing tool India',
    'electronic signature India free',
  ],
  breadcrumbName: 'Sign PDF',
  heroBadgeText: 'Free PDF Signing -- No Account Required',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'Sign PDF',
  heroHeadingSuffix: 'Tool',
  heroDescription:
    'Draw your signature, type it, or upload a signature image and place it anywhere on your PDF. Resize, position, and export the signed document without watermarks. No signup, no printing required.',
  heroTags: [
    'Draw or Type Signature',
    'Upload Signature Image',
    'Place Anywhere on PDF',
    'No Watermark',
  ],
  aeoTitle: 'What is Axom AI Sign PDF Tool?',
  aeoDescription:
    '<strong>Axom AI Sign PDF</strong> is a free online tool for adding <strong>electronic signatures</strong> to PDF documents without printing or scanning. <strong>Draw your signature</strong> with a mouse or touch, <strong>type</strong> your name as a signature, or <strong>upload a signature image</strong>. Position and resize the signature on any page. The signed PDF exports without watermarks. All processing happens in your browser for complete privacy. No Adobe Sign or DocuSign subscription needed.',
  aeoHighlights: ['Draw / Type / Upload Signature', 'No Printing Required', 'Privacy-First'],

  steps: [
    {
      title: 'Upload Your PDF',
      description:
        'Drag and drop your PDF document into the tool or click to browse. Your file loads securely in the browser.',
    },
    {
      title: 'Create & Place Signature',
      description:
        'Draw your signature with mouse/touch, type it, or upload a signature image. Drag to position and resize on any page.',
    },
    {
      title: 'Download Signed PDF',
      description:
        'Export your signed PDF document with the signature embedded. No watermarks, ready to share, email, or print.',
    },
  ],

  benefits: [
    {
      icon: <PenTool size={20} />,
      title: 'Draw Your Signature',
      description:
        'Use your mouse, trackpad, or touch screen to draw a natural handwritten signature directly in the browser.',
    },
    {
      icon: <Upload size={20} />,
      title: 'Upload Signature Image',
      description:
        'Upload a PNG or JPG image of your signature. The tool handles transparent backgrounds for clean placement.',
    },
    {
      icon: <FileSignature size={20} />,
      title: 'Place Anywhere',
      description:
        'Drag your signature to any position on any page. Resize it to fit signature lines, footer areas, or margins.',
    },
    {
      icon: <Lock size={20} />,
      title: 'Complete Privacy',
      description:
        'All processing happens locally in your browser. Your PDF and signature never leave your device. Zero server uploads.',
    },
    {
      icon: <Shield size={20} />,
      title: 'No Watermark Ever',
      description:
        'The exported signed PDF is clean with no branding or watermarks. Professional-quality output for official documents.',
    },
    {
      icon: <Smartphone size={20} />,
      title: 'Mobile Signature',
      description:
        'Sign PDFs on your phone or tablet using touch drawing. Perfect for signing documents on the go without a printer.',
    },
  ],

  useCases: [
    {
      icon: <Briefcase size={24} />,
      title: 'Contracts & Agreements',
      description:
        'Sign business contracts, NDAs, freelance agreements, and vendor forms electronically without printing, signing, and scanning.',
      accent: 'purple',
    },
    {
      icon: <FileText size={24} />,
      title: 'HR & Employment Forms',
      description:
        'Sign offer letters, tax forms, employee onboarding documents, and policy acknowledgments from anywhere.',
      accent: 'emerald',
    },
    {
      icon: <GraduationCap size={24} />,
      title: 'Academic & Permission Forms',
      description:
        'Sign student permission slips, consent forms, enrollment documents, and scholarship applications digitally.',
      accent: 'fuchsia',
    },
    {
      icon: <Globe2 size={24} />,
      title: 'Invoices & Receipts',
      description:
        'Add your signature to invoices, purchase orders, and receipts for authenticated business transactions.',
      accent: 'blue',
    },
  ],

  comparisonRows: [
    {
      feature: 'Price',
      axom: 'Completely Free',
      other: 'Free with limits',
      paid: '$10-40/month (DocuSign)',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Watermarks',
      axom: 'Never added',
      other: 'Added on free tier',
      paid: 'Clean (paid only)',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Signature Methods',
      axom: 'Draw, type, upload image',
      other: 'Draw only',
      paid: 'Draw, type, upload, stamp',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Account Required',
      axom: 'No signup needed',
      other: 'Required for most',
      paid: 'Required + subscription',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Privacy',
      axom: 'Client-side (no upload)',
      other: 'Server upload required',
      paid: 'Cloud stored',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Mobile Support',
      axom: 'Full touch drawing',
      other: 'Limited mobile UX',
      paid: 'Dedicated mobile app',
      axom_check: true,
      other_check: false,
    },
  ],

  techSpecs: [
    { label: 'Signature Input', value: 'Draw (mouse/touch), Type, Image Upload' },
    { label: 'Supported Formats', value: 'PDF input, PDF output' },
    { label: 'Max File Size', value: '50 MB' },
    { label: 'Processing', value: 'Client-side (browser), no server upload' },
  ],

  regionalDescription:
    'Axom AI Sign PDF is built in <strong>India</strong> for privacy-first document signing. Ideal for Indian businesses, freelancers, and students who need a free alternative to DocuSign or Adobe Sign. Supports PDFs with <strong>Assamese</strong>, <strong>Hindi</strong>, and <strong>Bengali</strong> text content.',
  regionalTitle: 'Free PDF Signing Tool for Indian Businesses & Professionals',

  faqs: [
    {
      q: 'Is the Axom AI Sign PDF tool free?',
      a: 'Yes, completely free with no limits on the number of PDFs you can sign. No signup, no subscription, and no watermarks.',
    },
    {
      q: 'Is my PDF uploaded to any server?',
      a: 'No. All processing happens locally in your browser. Your PDF file and signature data never leave your device.',
    },
    {
      q: 'Can I draw my signature with a mouse?',
      a: 'Yes. Use your mouse, trackpad, or stylus to draw a natural handwritten signature. On mobile devices, use your finger on the touch screen.',
    },
    {
      q: 'Can I upload an image of my signature?',
      a: 'Yes. Upload a PNG or JPG image of your signature. The tool places it on your PDF with proper transparency handling.',
    },
    {
      q: 'Can I sign a PDF on my phone?',
      a: 'Yes. The tool is fully responsive. Draw your signature using touch on Android or iPhone and place it on the PDF directly from your mobile browser.',
    },
    {
      q: 'Is an electronic signature legally valid?',
      a: 'In most jurisdictions, including India (IT Act 2000), electronic signatures on PDF documents are legally recognized for many types of agreements and contracts.',
    },
    {
      q: 'Can I resize and reposition my signature?',
      a: 'Yes. After creating your signature, drag it to any position on any page. Use the resize handles to adjust its size to fit signature lines.',
    },
    {
      q: 'Does the signed PDF have watermarks?',
      a: 'No, never. The exported PDF is clean with your signature embedded and no Axom AI branding or watermarks.',
    },
    {
      q: 'Is this a good alternative to DocuSign or Adobe Sign?',
      a: 'For simple e-signing (placing your signature on a PDF), yes. For multi-party signing workflows with audit trails, dedicated platforms may be needed.',
    },
    {
      q: 'Can I sign multiple pages in one PDF?',
      a: 'Yes. Navigate to any page in the PDF and place your signature. You can add signatures to multiple pages in the same document before exporting.',
    },
  ],

  ctaTitle: 'Sign Your PDF Documents Now',
  ctaDescription:
    'Draw or insert your electronic signature on any PDF. Free, private, no printing required.',
  ctaPrimaryText: 'Open Sign PDF Tool',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All PDF & AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Sign PDF',
  appAlternateNames: ['PDF Signature Tool Online', 'Free E-Sign PDF', 'Electronic Signature PDF'],
  appCategory: 'BusinessApplication, UtilitiesApplication',
  appFeatureList: [
    'Draw signature with mouse, trackpad, or touch',
    'Type signature with font styling',
    'Upload signature image (PNG/JPG)',
    'Position and resize on any PDF page',
    'Client-side processing for privacy',
    'Zero watermark export',
    'Mobile-responsive touch support',
  ],
  appRatingValue: '4.9',
  appReviewCount: '3100',
  howToSchemaName: 'How to Sign a PDF Online for Free',
  howToSchemaDescription:
    'Step-by-step guide to adding electronic signatures to PDF documents using Axom AI Sign PDF.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI Sign PDF',
};
