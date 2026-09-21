import React from 'react';
import {
  PenTool,
  Highlighter,
  Square,
  Type,
  Trash2,
  RotateCw,
  Download,
  Lock,
  Zap,
  Smartphone,
  FileText,
  Briefcase,
  GraduationCap,
  Globe2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'edit-pdf',
  metaTitle: 'Edit PDF Online Free — Annotate, Draw, Highlight & Edit PDF Pages | Axom AI',
  metaDescription:
    'Free online PDF editor. Annotate, draw, insert shapes, highlight text, add text boxes, and edit pages in a full interactive canvas. No signup, no watermark.',
  canonicalUrl: 'https://aiaxom.co.in/tools/edit-pdf',
  keywords: [
    'edit pdf',
    'edit pdf online',
    'edit pdf free',
    'pdf editor online',
    'free pdf editor',
    'pdf editor online free',
    'edit pdf online free',
    'annotate pdf online',
    'annotate pdf free',
    'pdf annotation tool',
    'draw on pdf online',
    'highlight pdf online',
    'add text to pdf',
    'insert shapes in pdf',
    'pdf markup tool',
    'edit pdf pages',
    'pdf editor no signup',
    'pdf editor no watermark',
    'free pdf editor online no watermark',
    'online pdf editor free',
    'pdf editor browser',
    'how to edit a PDF online',
    'how to annotate a PDF for free',
    'how to draw on a PDF',
    'how to highlight text in a PDF',
    'how to add text to a PDF online',
    'how to edit PDF pages without Acrobat',
    'can I edit a PDF without Adobe',
    'how to insert shapes in a PDF',
    'how to mark up a PDF online',
    'what is the best free PDF editor',
    'best free pdf editor online',
    'pdf editor alternative to Adobe',
    'lightweight pdf editor online',
    'pdf editor with drawing tools',
    'pdf editor with shapes',
    'pdf editor with highlighter',
    'pdf annotator online free',
    'pdf canvas editor',
    'pdf page editor online',
    'pdf editor for students',
    'pdf editor for teachers',
    'pdf editor for business',
    'pdf editor for legal documents',
    'pdf editor India',
    'free pdf tools India',
    'online pdf annotation India',
    'pdf editor without installation',
    'pdf editor no download',
    'edit pdf on mobile',
    'pdf editor Android iOS',
    'pdf editor with eraser tool',
    'add comments to pdf online',
  ],
  breadcrumbName: 'Edit PDF',
  heroBadgeText: 'Free PDF Editor -- No Signup Required',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'PDF Editor',
  heroHeadingSuffix: '& Annotation Tool',
  heroDescription:
    'Annotate, draw, insert shapes, highlight text, add text boxes, and edit pages in a full interactive canvas. No software to install, no account needed, no watermarks on export.',
  heroTags: [
    'Draw & Annotate',
    'Highlight & Shapes',
    'Add Text Boxes',
    'No Watermark',
  ],
  aeoTitle: 'What is Axom AI PDF Editor?',
  aeoDescription:
    '<strong>Axom AI PDF Editor</strong> is a free online tool for editing and annotating PDF documents directly in your browser. Use the interactive canvas to <strong>draw freehand</strong>, <strong>highlight text</strong>, <strong>insert shapes</strong> (rectangles, circles, arrows), <strong>add text boxes</strong>, and <strong>erase annotations</strong>. Edit page order, rotate pages, and delete pages. Export your annotated PDF without watermarks. No Adobe Acrobat required, no signup, completely free.',
  aeoHighlights: ['Full Drawing Canvas', 'Zero Watermarks', 'No Adobe Required'],

  steps: [
    {
      title: 'Upload Your PDF',
      description:
        'Drag and drop your PDF file into the editor or click to browse. Your document loads in the interactive canvas instantly.',
    },
    {
      title: 'Edit & Annotate',
      description:
        'Use drawing tools, highlighter, shapes, text boxes, and eraser to mark up your PDF. Navigate, rotate, and reorder pages.',
    },
    {
      title: 'Download Edited PDF',
      description:
        'Save your annotated PDF with all edits embedded. Clean output with no watermarks, ready to share or print.',
    },
  ],

  benefits: [
    {
      icon: <PenTool size={20} />,
      title: 'Freehand Drawing',
      description:
        'Draw directly on PDF pages with adjustable pen size and color. Perfect for handwritten notes, sketches, and markup.',
    },
    {
      icon: <Highlighter size={20} />,
      title: 'Text Highlighting',
      description:
        'Highlight important text passages with customizable highlight colors. Mark key sections for review or study.',
    },
    {
      icon: <Square size={20} />,
      title: 'Shapes & Arrows',
      description:
        'Insert rectangles, circles, lines, and arrows to call attention to specific areas. Customize color and thickness.',
    },
    {
      icon: <Type size={20} />,
      title: 'Text Box Insertion',
      description:
        'Add typed text annotations anywhere on the page. Choose font size, color, and position for comments and labels.',
    },
    {
      icon: <RotateCw size={20} />,
      title: 'Page Management',
      description:
        'Rotate pages, reorder pages, and delete unwanted pages. Full control over your PDF document structure.',
    },
    {
      icon: <Lock size={20} />,
      title: 'Privacy & No Watermark',
      description:
        'All processing happens client-side. Files are never uploaded to servers. Exported PDFs have zero watermarks.',
    },
  ],

  useCases: [
    {
      icon: <GraduationCap size={24} />,
      title: 'Students & Academic Review',
      description:
        'Annotate lecture notes, highlight textbook PDFs, draw diagrams, and add study notes directly on course materials.',
      accent: 'purple',
    },
    {
      icon: <Briefcase size={24} />,
      title: 'Business Document Markup',
      description:
        'Mark up contracts, proposals, and reports with comments, highlights, and approval stamps before sharing with clients.',
      accent: 'emerald',
    },
    {
      icon: <FileText size={24} />,
      title: 'Legal Document Annotation',
      description:
        'Highlight clauses, draw attention to key sections, and add margin notes on legal documents for review and negotiation.',
      accent: 'fuchsia',
    },
    {
      icon: <Globe2 size={24} />,
      title: 'Teacher & Grading Feedback',
      description:
        'Grade student assignments by drawing corrections, adding text feedback, and highlighting errors directly on submitted PDFs.',
      accent: 'blue',
    },
  ],

  comparisonRows: [
    {
      feature: 'Price',
      axom: 'Completely Free',
      other: 'Free with watermarks',
      paid: '$15-25/month (Adobe)',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Watermarks',
      axom: 'Never added',
      other: 'Added on export',
      paid: 'Clean (paid only)',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Drawing Tools',
      axom: 'Pen, highlighter, shapes, text',
      other: 'Basic pen only',
      paid: 'Full toolkit',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Page Management',
      axom: 'Rotate, reorder, delete',
      other: 'Limited or none',
      paid: 'Full page control',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Account Required',
      axom: 'No signup needed',
      other: 'Often required',
      paid: 'Required + subscription',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Privacy',
      axom: 'Client-side processing',
      other: 'Server upload required',
      paid: 'Cloud stored',
      axom_check: true,
      other_check: false,
    },
  ],

  techSpecs: [
    { label: 'Annotation Tools', value: 'Pen, Highlighter, Shapes, Text, Eraser' },
    { label: 'Page Operations', value: 'Rotate, Reorder, Delete' },
    { label: 'Max File Size', value: '50 MB' },
    { label: 'Processing', value: 'Client-side (browser), no upload' },
  ],

  regionalDescription:
    'Axom AI PDF Editor is built in <strong>India</strong> for fast, private document editing. Perfect for Indian students, teachers, lawyers, and professionals who need a free Adobe Acrobat alternative. Supports PDFs with <strong>Assamese</strong>, <strong>Hindi</strong>, and <strong>Bengali</strong> text with full Unicode rendering.',
  regionalTitle: 'Free PDF Editor for Indian Students & Professionals',

  faqs: [
    {
      q: 'Is Axom AI PDF Editor really free?',
      a: 'Yes, completely free with no limits on the number of PDFs you can edit. No signup, no subscription, and no watermarks on exported files.',
    },
    {
      q: 'Do my PDF files get uploaded to a server?',
      a: 'No. All editing and annotation happens locally in your browser. Your files never leave your device, ensuring complete privacy.',
    },
    {
      q: 'Can I highlight text in a PDF?',
      a: 'Yes. Use the highlighter tool to mark text passages with customizable colors including yellow, green, blue, and pink highlights.',
    },
    {
      q: 'Can I add text to a PDF?',
      a: 'Yes. Click the text tool and place a text box anywhere on the page. Type your annotation with customizable font size and color.',
    },
    {
      q: 'Can I draw on a PDF?',
      a: 'Yes. The freehand pen tool lets you draw directly on PDF pages. Adjust pen color and stroke width for handwritten notes and sketches.',
    },
    {
      q: 'Can I insert shapes like rectangles and arrows?',
      a: 'Yes. Insert rectangles, circles, lines, and arrows to annotate your PDF. Each shape has customizable color, fill, and stroke settings.',
    },
    {
      q: 'Can I rotate or delete PDF pages?',
      a: 'Yes. The page management tools let you rotate pages (90/180/270 degrees), reorder pages by dragging, and delete unwanted pages.',
    },
    {
      q: 'Does the exported PDF have watermarks?',
      a: 'No, never. Your edited PDF is exported clean without any Axom AI branding or watermarks. It is ready for professional use.',
    },
    {
      q: 'Is this a good alternative to Adobe Acrobat?',
      a: 'For annotation, markup, and basic page editing, yes. Axom AI PDF Editor provides the most-used features of Acrobat for free in the browser.',
    },
    {
      q: 'Does it work on mobile phones?',
      a: 'Yes. The editor is responsive and works on Android and iOS browsers. A tablet or desktop provides the best editing experience for detailed work.',
    },
  ],

  ctaTitle: 'Edit Your PDF Documents Now',
  ctaDescription:
    'Annotate, draw, highlight, and edit PDF pages in your browser. Free, private, no watermarks.',
  ctaPrimaryText: 'Open PDF Editor',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All PDF & AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI PDF Editor',
  appAlternateNames: ['Online PDF Editor Free', 'PDF Annotation Tool', 'Free PDF Annotator'],
  appCategory: 'BusinessApplication, UtilitiesApplication',
  appFeatureList: [
    'Freehand drawing on PDF pages',
    'Text highlighting with multiple colors',
    'Shape insertion: rectangles, circles, arrows, lines',
    'Text box annotation with custom fonts',
    'Page rotation, reorder, and deletion',
    'Client-side processing for privacy',
    'Zero watermark export',
  ],
  appRatingValue: '4.8',
  appReviewCount: '2650',
  howToSchemaName: 'How to Edit a PDF Online for Free',
  howToSchemaDescription:
    'Step-by-step guide to annotating, drawing, and editing PDF documents using Axom AI PDF Editor.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI PDF Editor',
};
