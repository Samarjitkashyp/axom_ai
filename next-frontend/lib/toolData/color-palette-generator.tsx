import React from 'react';
import {
  Palette,
  Pipette,
  Shuffle,
  Download,
  Image,
  Lock,
  Zap,
  Smartphone,
  Eye,
  Brush,
  Globe2,
  Layers,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'color-palette-generator',
  metaTitle: 'Color Palette Generator Online Free — Create & Extract Color Palettes | Axom AI',
  metaDescription:
    'Free online color palette generator. Create random, analogous, complementary, triadic, and split-complementary color palettes or extract colors from images. Export HEX, RGB, HSL codes instantly.',
  canonicalUrl: 'https://aiaxom.co.in/tools/color-palette-generator',
  keywords: [
    'color palette generator',
    'colour palette generator',
    'color palette generator online',
    'free color palette generator',
    'random color palette generator',
    'color scheme generator',
    'color palette from image',
    'extract colors from image',
    'complementary color generator',
    'analogous color palette',
    'triadic color palette',
    'split complementary colors',
    'color palette maker',
    'color combination generator',
    'hex color palette',
    'RGB color palette generator',
    'HSL color picker',
    'online color scheme tool',
    'website color palette generator',
    'UI color palette generator',
    'design color palette tool',
    'brand color palette generator',
    'how to generate a color palette',
    'how to create a color scheme',
    'how to extract colors from an image',
    'what is a complementary color palette',
    'what is an analogous color scheme',
    'how to choose brand colors',
    'how to find matching colors',
    'how to create a triadic color scheme',
    'best free color palette generator online',
    'color palette generator without signup',
    'AI color palette generator',
    'color palette inspiration tool',
    'color harmony generator',
    'coolors alternative free',
    'adobe color alternative',
    'color palette generator for designers',
    'color palette generator for web design',
    'color palette generator for graphic design',
    'color palette generator for UI UX',
    'color palette generator for branding',
    'pastel color palette generator',
    'gradient color palette generator',
    'monochromatic color palette',
    'warm color palette generator',
    'cool color palette generator',
    'color palette generator India',
    'free color tools India',
    'online design tools India',
    'color picker tool online free',
    'color palette export HEX RGB',
    'image color extractor online',
    'photo color palette extractor',
  ],
  breadcrumbName: 'Color Palette Generator',
  heroBadgeText: 'Free Color Palette Generator -- No Signup Required',
  heroHeadingPrefix: 'Free',
  heroHeadingHighlight: 'Color Palette Generator',
  heroHeadingSuffix: 'Online',
  heroDescription:
    'Generate stunning color palettes instantly. Choose from random, analogous, complementary, triadic, and split-complementary harmonies or extract palettes from any image. Export HEX, RGB, HSL codes free.',
  heroTags: [
    'Random & Harmony Palettes',
    'Extract from Images',
    'HEX / RGB / HSL Export',
    '100% Free',
  ],
  aeoTitle: 'What is Axom AI Color Palette Generator?',
  aeoDescription:
    '<strong>Axom AI Color Palette Generator</strong> is a free online tool that creates professionally harmonized color palettes using <strong>color theory algorithms</strong>. Generate <strong>random</strong>, <strong>analogous</strong>, <strong>complementary</strong>, <strong>triadic</strong>, and <strong>split-complementary</strong> palettes with a single click. You can also <strong>upload any image</strong> to extract its dominant colors automatically. Every palette exports as <strong>HEX</strong>, <strong>RGB</strong>, and <strong>HSL</strong> codes ready for design tools, CSS, and branding guidelines. No signup, no watermark, completely free.',
  aeoHighlights: ['5 Harmony Modes', 'Image Color Extraction', 'Instant HEX/RGB/HSL Export'],

  steps: [
    {
      title: 'Choose a Mode',
      description:
        'Select a harmony type (random, analogous, complementary, triadic, split-complementary) or upload an image to extract colors.',
    },
    {
      title: 'Generate & Customize',
      description:
        'Click Generate to create your palette. Lock colors you like and regenerate the rest. Adjust hue, saturation, and lightness.',
    },
    {
      title: 'Export Your Palette',
      description:
        'Copy HEX, RGB, or HSL codes individually or export the full palette as a shareable link, CSS variables, or image swatch.',
    },
  ],

  benefits: [
    {
      icon: <Shuffle size={20} />,
      title: '5 Color Harmony Modes',
      description:
        'Generate palettes using proven color theory: random, analogous, complementary, triadic, and split-complementary harmonies.',
    },
    {
      icon: <Image size={20} />,
      title: 'Extract Colors from Images',
      description:
        'Upload any photo, logo, or artwork and automatically extract the dominant color palette with accurate HEX values.',
    },
    {
      icon: <Pipette size={20} />,
      title: 'HEX, RGB & HSL Export',
      description:
        'Copy color codes in any format. Paste directly into CSS, Figma, Sketch, Adobe XD, or any design tool.',
    },
    {
      icon: <Lock size={20} />,
      title: 'Lock & Regenerate',
      description:
        'Lock individual colors you love and regenerate the remaining slots. Build the perfect palette iteratively.',
    },
    {
      icon: <Zap size={20} />,
      title: 'Instant & Free',
      description:
        'No account required, no ads, no rate limits. Generate unlimited palettes in your browser instantly.',
    },
    {
      icon: <Smartphone size={20} />,
      title: 'Mobile Friendly',
      description:
        'Fully responsive design works perfectly on phones and tablets. Design on the go from any device.',
    },
  ],

  useCases: [
    {
      icon: <Brush size={24} />,
      title: 'Brand Identity & Logo Design',
      description:
        'Create cohesive brand color palettes for logos, marketing materials, and style guides. Export codes directly for design teams.',
      accent: 'purple',
    },
    {
      icon: <Globe2 size={24} />,
      title: 'Web & UI/UX Design',
      description:
        'Generate accessible color schemes for websites and apps. Test contrast ratios and ensure WCAG compliance with harmonized palettes.',
      accent: 'emerald',
    },
    {
      icon: <Eye size={24} />,
      title: 'Social Media & Content Creation',
      description:
        'Build consistent color themes for Instagram posts, YouTube thumbnails, and social media campaigns with matching palettes.',
      accent: 'fuchsia',
    },
    {
      icon: <Layers size={24} />,
      title: 'Interior Design & Art Projects',
      description:
        'Extract color palettes from inspiration photos for room decor, paintings, and mood boards. Share palettes with clients.',
      accent: 'blue',
    },
  ],

  comparisonRows: [
    {
      feature: 'Price',
      axom: 'Completely Free',
      other: 'Free with limits',
      paid: '$5-15/month',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Harmony Modes',
      axom: '5 modes + random',
      other: '1-2 modes',
      paid: '5+ modes',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Image Extraction',
      axom: 'Yes, unlimited',
      other: 'Limited or missing',
      paid: 'Yes',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Account Required',
      axom: 'No signup needed',
      other: 'Often required',
      paid: 'Required',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Export Formats',
      axom: 'HEX, RGB, HSL, CSS',
      other: 'HEX only',
      paid: 'Multiple formats',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Lock & Regenerate',
      axom: 'Yes',
      other: 'Rarely available',
      paid: 'Yes',
      axom_check: true,
      other_check: false,
    },
  ],

  techSpecs: [
    { label: 'Harmony Algorithms', value: 'Analogous, Complementary, Triadic, Split-Comp, Random' },
    { label: 'Color Formats', value: 'HEX, RGB, HSL, CSS Variables' },
    { label: 'Image Extraction', value: 'JPEG, PNG, WebP, AVIF up to 10 MB' },
    { label: 'Platform', value: 'Browser-based, all devices' },
  ],

  regionalDescription:
    'Axom AI Color Palette Generator is built in <strong>India</strong> with fast domestic CDN routing. Perfect for Indian designers, students, and startups creating brand identities. Supports design workflows in <strong>Assamese</strong>, <strong>Hindi</strong>, and <strong>English</strong> with zero data collection.',
  regionalTitle: 'Color Palette Generator for Indian Designers & Creators',

  faqs: [
    {
      q: 'Is the Axom AI Color Palette Generator really free?',
      a: 'Yes, completely free with no limits. Generate unlimited palettes, extract colors from images, and export codes without creating an account or paying anything.',
    },
    {
      q: 'What color harmony modes are available?',
      a: 'Five modes: Random (fully random colors), Analogous (adjacent hues), Complementary (opposite hues), Triadic (three evenly spaced hues), and Split-Complementary (a base hue plus two adjacent to its complement).',
    },
    {
      q: 'Can I extract a color palette from an image?',
      a: 'Yes. Upload any JPEG, PNG, or WebP image and the tool automatically identifies and extracts the dominant colors into a palette with HEX, RGB, and HSL codes.',
    },
    {
      q: 'What color code formats can I export?',
      a: 'You can copy individual colors as HEX (#FF5733), RGB (rgb(255,87,51)), or HSL (hsl(11,100%,60%)). You can also export the full palette as CSS custom properties.',
    },
    {
      q: 'Can I lock specific colors and regenerate the rest?',
      a: 'Yes. Click the lock icon on any color swatch to keep it fixed while regenerating the other colors. This helps you build palettes around a specific brand color.',
    },
    {
      q: 'Does this tool work on mobile phones?',
      a: 'Yes. The Color Palette Generator is fully responsive and works on Android, iPhone, iPad, and all modern mobile browsers without installing any app.',
    },
    {
      q: 'Is this a good alternative to Coolors or Adobe Color?',
      a: 'Yes. Axom AI Color Palette Generator offers similar harmony modes and image extraction without requiring any account signup or subscription, making it a great free alternative.',
    },
    {
      q: 'Can I use the generated palettes for commercial projects?',
      a: 'Absolutely. Colors and color codes are not copyrightable. You are free to use any generated palette in commercial designs, websites, apps, and branding materials.',
    },
    {
      q: 'How does the image color extraction work?',
      a: 'The tool uses a color quantization algorithm to analyze all pixels in the uploaded image and group them into dominant color clusters, returning the most prominent colors as a palette.',
    },
    {
      q: 'Do I need to install any software?',
      a: 'No. Everything runs in your web browser. No downloads, no plugins, no extensions needed. Just open the tool and start generating palettes.',
    },
  ],

  ctaTitle: 'Generate Beautiful Color Palettes Now',
  ctaDescription:
    'Create harmonized color schemes or extract palettes from images. Free, instant, no signup required.',
  ctaPrimaryText: 'Open Color Palette Generator',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI & Design Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Color Palette Generator',
  appAlternateNames: [
    'Color Scheme Generator Online',
    'Free Color Palette Maker',
    'Image Color Extractor',
  ],
  appCategory: 'DesignApplication, UtilitiesApplication',
  appFeatureList: [
    'Generate random color palettes',
    'Analogous, complementary, triadic, split-complementary harmony modes',
    'Extract dominant colors from uploaded images',
    'Export HEX, RGB, HSL color codes',
    'Lock individual colors and regenerate',
    'No signup or account required',
    'Mobile-responsive design',
  ],
  appRatingValue: '4.8',
  appReviewCount: '1840',
  howToSchemaName: 'How to Generate a Color Palette Online',
  howToSchemaDescription:
    'Step-by-step guide to create color palettes using harmony modes or extract colors from images with Axom AI.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI Color Palette Generator',
};
