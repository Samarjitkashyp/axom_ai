import React from 'react';
import { Camera, Code, Zap, Shield, Layers, Monitor, GraduationCap, Building2, Briefcase, Palette } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'screenshot-to-code',
  metaTitle: 'Screenshot to Code — Convert UI Screenshots to HTML/CSS Free | Gemini AI | Axom AI',
  metaDescription:
    'Upload a screenshot or UI design and get pixel-perfect HTML/CSS code instantly using Gemini AI. Free, no signup. Convert mockups, wireframes & designs to responsive code. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/screenshot-to-code',
  keywords: [
    'screenshot to code', 'image to html', 'ui to code', 'design to code',
    'screenshot to html css', 'convert screenshot to code', 'ai code generator from image',
    'image to html converter', 'ui screenshot to code', 'mockup to code',
    'wireframe to html', 'design to html css', 'figma to html',
    'screenshot to react', 'screenshot to tailwind', 'ai html generator',
    'visual to code converter', 'picture to code', 'photo to html',
    'how to convert screenshot to html code', 'what is screenshot to code ai',
    'best free screenshot to code tool', 'how to generate code from ui design',
    'can ai convert image to html', 'how to turn mockup into code free',
    'screenshot to code india', 'ui to code tool india', 'free code generator hindi',
    'screenshot to code assamese', 'ai web development tool india',
    'gemini ai code generator', 'ai frontend code generator', 'ai ui to code',
    'generative ai code from image', 'llm screenshot to code',
    'free screenshot to code online', 'screenshot to code no signup',
    'convert design to responsive code', 'image to responsive html',
    'screenshot to bootstrap', 'screenshot to css', 'pixel perfect code from image',
    'ai web design tool', 'automated frontend development',
    'convert ui mockup to code', 'axom ai screenshot to code',
    'free frontend code generator', 'design implementation tool',
    'rapid prototyping tool', 'screenshot to code for beginners',
    'no code to code converter', 'visual coding tool',
    'screenshot to html india free', 'ai code generator for students',
  ],
  breadcrumbName: 'Screenshot to Code',

  heroBadgeText: 'AI-Powered UI to Code Converter — Gemini AI',
  heroHeadingPrefix: 'Convert',
  heroHeadingHighlight: 'Screenshots to Code',
  heroHeadingSuffix: 'with AI',
  heroDescription:
    'Upload any UI screenshot, mockup, or wireframe and get clean, responsive HTML/CSS code instantly. Powered by Gemini AI vision — pixel-perfect conversion, no design skills needed, completely free.',
  heroTags: ['Upload Any Screenshot', 'Get HTML/CSS/Tailwind Code', 'Gemini AI Vision', 'No Signup Required'],

  aeoTitle: 'What is Screenshot to Code?',
  aeoDescription:
    '<strong>Screenshot to Code</strong> by Axom AI is a free AI tool that converts <strong>UI screenshots, mockups, and wireframes</strong> into clean, responsive <strong>HTML and CSS code</strong>. Powered by <strong>Google Gemini AI\'s vision capabilities</strong>, it analyzes the visual layout, colors, typography, spacing, and component structure of any uploaded image and generates production-ready frontend code. Supports output in <strong>plain HTML/CSS, Tailwind CSS,</strong> and <strong>Bootstrap</strong> formats. Perfect for developers who want to rapidly prototype, students learning web development, and designers who need to hand off code. No signup, no watermark, completely free on <strong>India\'s sovereign AI platform</strong>.',
  aeoHighlights: ['Gemini AI Vision Powered', 'HTML/CSS/Tailwind Output', 'Pixel-Perfect Results', 'No Signup Required'],

  steps: [
    {
      title: 'Upload Your Screenshot',
      description: 'Take a screenshot of any UI — a website, app screen, mockup, or wireframe — and upload it as PNG, JPG, or WebP.',
    },
    {
      title: 'AI Analyzes the Design',
      description: 'Gemini AI vision analyzes the layout, colors, fonts, spacing, and component hierarchy to understand the design structure.',
    },
    {
      title: 'Get Clean Code',
      description: 'Receive responsive HTML/CSS code that matches the screenshot. Copy, edit, or download the code for your project.',
    },
  ],

  benefits: [
    { icon: <Camera size={20} />, title: 'Any Screenshot Works', description: 'Upload screenshots from websites, mobile apps, Figma mockups, hand-drawn wireframes, or even photos of whiteboard sketches.' },
    { icon: <Code size={20} />, title: 'Clean, Semantic Code', description: 'Generated code uses semantic HTML5 elements, clean CSS, and follows modern web standards for accessibility and SEO.' },
    { icon: <Layers size={20} />, title: 'Multiple Output Formats', description: 'Get code in plain HTML/CSS, Tailwind CSS, or Bootstrap — choose the framework that matches your workflow.' },
    { icon: <Zap size={20} />, title: 'Instant Generation', description: 'AI generates the complete code in seconds. No waiting in queues or processing delays.' },
    { icon: <Monitor size={20} />, title: 'Responsive by Default', description: 'Generated code is responsive and mobile-friendly, adapting to different screen sizes automatically.' },
    { icon: <Shield size={20} />, title: 'Privacy First', description: 'Uploaded images are processed in real-time and never stored. Your designs remain confidential and private.' },
  ],

  useCases: [
    { icon: <Palette size={20} />, title: 'Rapid Prototyping', description: 'Turn mockups and wireframes into working HTML prototypes in seconds instead of hours of manual coding.', accent: 'purple' },
    { icon: <GraduationCap size={20} />, title: 'Learning Web Development', description: 'Students can upload any website screenshot and study the generated HTML/CSS to learn layout, styling, and structure.', accent: 'fuchsia' },
    { icon: <Briefcase size={20} />, title: 'Freelance Development', description: 'Freelancers can quickly convert client mockups into initial code, dramatically speeding up project delivery.', accent: 'emerald' },
    { icon: <Building2 size={20} />, title: 'Design-to-Development Handoff', description: 'Bridge the gap between design and development teams by generating starter code from approved design mockups.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Price', axom: 'Completely Free', other: 'Free trials only', paid: '$20–$50/month', axom_check: true, other_check: false },
    { feature: 'AI Model', axom: 'Gemini AI Vision', other: 'Basic OCR', paid: 'GPT-4 Vision', axom_check: true, other_check: false },
    { feature: 'Output Formats', axom: 'HTML/CSS/Tailwind/Bootstrap', other: 'HTML only', paid: 'Multiple frameworks', axom_check: true, other_check: false },
    { feature: 'Account Required', axom: 'No Signup Needed', other: 'Required', paid: 'Required', axom_check: true, other_check: false },
    { feature: 'Responsive Output', axom: 'Yes, by Default', other: 'Rarely', paid: 'Yes', axom_check: true, other_check: false },
    { feature: 'Privacy', axom: 'No Image Storage', other: 'Images may be stored', paid: 'Stored for processing', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Engine', value: 'Google Gemini AI (Vision)' },
    { label: 'Input Formats', value: 'PNG, JPG, WebP, AVIF' },
    { label: 'Output Formats', value: 'HTML/CSS, Tailwind CSS, Bootstrap' },
    { label: 'Max Image Size', value: '10 MB per upload' },
  ],

  regionalTitle: 'AI Code Generator for Developers Across India',
  regionalDescription:
    'Axom AI Screenshot to Code empowers developers, students, and freelancers across <strong>India</strong>. From IIT and NIT students in <strong>Assam</strong> learning frontend development to startup teams in Bengaluru rapidly prototyping — this tool eliminates hours of manual coding. Supports UI text in <strong>Hindi, Assamese, Bengali</strong> and all Indic scripts. Built on <strong>India\'s sovereign AI platform</strong> with servers optimized for Indian network conditions.',
  regionalBadge: "🇮🇳 India's Free AI Code Generator",

  faqs: [
    { q: 'What types of screenshots can I upload?', a: 'You can upload screenshots of websites, mobile apps, Figma/Sketch mockups, wireframes, or even photos of whiteboard sketches. The AI handles all visual formats.' },
    { q: 'What code output formats are supported?', a: 'The tool generates clean HTML with CSS. You can request Tailwind CSS or Bootstrap classes in your prompt for framework-specific output.' },
    { q: 'How accurate is the generated code?', a: 'Gemini AI produces highly accurate code that closely matches the visual layout, colors, and spacing of the original screenshot. Complex interactive elements may need manual refinement.' },
    { q: 'Is the generated code responsive?', a: 'Yes. The AI generates responsive code by default using flexbox, grid, and media queries that adapt to mobile, tablet, and desktop screens.' },
    { q: 'Can I upload a hand-drawn wireframe?', a: 'Yes. The AI can interpret hand-drawn wireframes and sketches, converting rough layouts into structured HTML/CSS code.' },
    { q: 'Do I need to create an account?', a: 'No. Screenshot to Code is completely free to use without any signup, login, or account creation.' },
    { q: 'Is my uploaded screenshot stored?', a: 'No. Images are processed in real-time by the AI and immediately discarded. Your designs are never stored on our servers.' },
    { q: 'Can it generate React or Vue code?', a: 'The primary output is HTML/CSS. For React or Vue components, you can use the generated HTML as a starting point and convert it to your framework of choice.' },
    { q: 'What is the maximum file size for uploads?', a: 'You can upload images up to 10 MB in PNG, JPG, WebP, or AVIF format.' },
    { q: 'Is this tool suitable for learning HTML/CSS?', a: 'Absolutely. Students can upload any website screenshot and study the generated code to understand HTML structure, CSS styling, layout techniques, and responsive design patterns.' },
  ],

  ctaTitle: 'Convert Your Screenshot to Code Now',
  ctaDescription: 'Upload any UI screenshot and get clean, responsive HTML/CSS code in seconds. Free, no signup, powered by Gemini AI.',
  ctaPrimaryText: 'Upload Screenshot',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Screenshot to Code',
  appAlternateNames: ['Screenshot to HTML', 'UI to Code Converter', 'Image to Code AI'],
  appDescription: 'Free AI tool to convert UI screenshots, mockups, and wireframes into clean, responsive HTML/CSS code using Gemini AI vision.',
  appCategory: 'DeveloperApplication, DesignApplication',
  appFeatureList: ['AI screenshot-to-code conversion', 'HTML/CSS/Tailwind output', 'Gemini AI vision analysis', 'Responsive code generation', 'No signup required', 'Privacy-first processing'],
  appRatingValue: '4.8',
  appReviewCount: '2690',
  howToSchemaName: 'How to Convert Screenshots to Code with AI',
  howToSchemaDescription: 'Upload a UI screenshot and get pixel-perfect HTML/CSS code using Axom AI Screenshot to Code powered by Gemini AI.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI Screenshot to Code',
};
