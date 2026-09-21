import React from 'react';
import { Smile, Type, Palette, Download, Zap, Shield, Share2, Megaphone, GraduationCap, Users } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'meme-generator',
  metaTitle: 'Meme Generator Free — Create Custom Memes Online | Templates & Upload | Axom AI',
  metaDescription:
    'Create memes free — pick popular templates or upload your own images. Add custom text, change fonts, colors & sizes. Download memes instantly. No signup, no watermark. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/meme-generator',
  keywords: [
    'meme generator', 'meme maker', 'create meme online', 'free meme generator',
    'meme creator', 'custom meme maker', 'meme template', 'meme generator free',
    'online meme maker', 'meme generator no watermark', 'meme maker free online',
    'meme generator with custom image', 'upload image meme', 'meme text editor',
    'meme font generator', 'impact font meme', 'meme maker no signup',
    'download meme png', 'meme generator india', 'hindi meme generator',
    'assamese meme maker', 'indian meme templates', 'dank meme generator',
    'how to create a meme', 'how to make a meme online free', 'what is the best free meme generator',
    'how to add text to meme', 'best meme maker 2025', 'meme generator no ads',
    'funny meme maker', 'meme editor online', 'photo meme generator',
    'meme generator with templates', 'popular meme templates', 'trending meme templates',
    'drake meme generator', 'distracted boyfriend meme', 'expanding brain meme',
    'two buttons meme', 'change my mind meme', 'meme for social media',
    'meme for instagram', 'meme for whatsapp', 'meme for twitter',
    'meme generator for marketing', 'brand meme creator', 'corporate meme maker',
    'meme generator mobile', 'meme maker android', 'meme maker ios',
    'custom font meme', 'meme color picker', 'axom ai meme generator',
    'meme generator for students', 'funny image creator', 'caption generator for images',
    'meme builder free', 'meme designer online',
  ],
  breadcrumbName: 'Meme Generator',

  heroBadgeText: 'Free Meme Generator — Templates & Custom Upload',
  heroHeadingPrefix: 'Create',
  heroHeadingHighlight: 'Custom Memes',
  heroHeadingSuffix: 'in Seconds',
  heroDescription:
    'Pick from popular meme templates or upload your own images. Add custom text with multiple fonts, colors, and sizes. Download your memes instantly — free, no watermark, no signup required.',
  heroTags: ['Popular Templates', 'Custom Image Upload', 'Multiple Fonts & Colors', 'No Watermark'],

  aeoTitle: 'What is Axom AI Meme Generator?',
  aeoDescription:
    '<strong>Axom AI Meme Generator</strong> is a free, browser-based meme creation tool that lets you make custom memes in seconds. Choose from a library of <strong>popular meme templates</strong> (Drake, Distracted Boyfriend, Expanding Brain, Change My Mind, etc.) or <strong>upload your own image</strong>. Add <strong>top and bottom text</strong> with customizable fonts (Impact, Arial, Comic Sans, etc.), colors, sizes, outlines, and positioning. Download your finished meme as a <strong>high-resolution PNG</strong> — no watermark, no signup, no ads. Perfect for social media posts, WhatsApp groups, Instagram stories, marketing campaigns, and just having fun. Built on <strong>India\'s sovereign AI platform</strong>.',
  aeoHighlights: ['Popular Templates Library', 'Custom Upload Support', 'Multiple Fonts & Colors', 'No Watermark or Signup'],

  steps: [
    {
      title: 'Choose Template or Upload',
      description: 'Browse popular meme templates like Drake, Distracted Boyfriend, and more — or upload your own image to create an original meme.',
    },
    {
      title: 'Add & Customize Text',
      description: 'Type your top and bottom text. Choose fonts, colors, sizes, stroke/outline, and drag to position the text exactly where you want it.',
    },
    {
      title: 'Download Your Meme',
      description: 'Preview your meme, then download it as a high-resolution PNG. Share instantly on WhatsApp, Instagram, Twitter, or anywhere.',
    },
  ],

  benefits: [
    { icon: <Smile size={20} />, title: 'Popular Templates', description: 'Access a curated library of trending and classic meme templates — Drake, Distracted Boyfriend, Expanding Brain, and many more.' },
    { icon: <Type size={20} />, title: 'Custom Fonts & Colors', description: 'Choose from multiple fonts including Impact, Arial, and Comic Sans. Set text color, outline, size, and position freely.' },
    { icon: <Palette size={20} />, title: 'Upload Your Own Image', description: 'Create original memes by uploading any image — photos, screenshots, or artwork — as your meme background.' },
    { icon: <Download size={20} />, title: 'High-Res Download', description: 'Download memes in high-resolution PNG format. No watermark, no branding — clean images ready to share.' },
    { icon: <Zap size={20} />, title: 'Instant Creation', description: 'Real-time preview as you type and customize. No processing delays — see your meme update live.' },
    { icon: <Shield size={20} />, title: 'Free & Private', description: 'No signup, no ads, no tracking. Your images and text are processed locally in the browser and never stored.' },
  ],

  useCases: [
    { icon: <Share2 size={20} />, title: 'Social Media Content', description: 'Create memes for Instagram, Twitter/X, Reddit, and Facebook. Stand out in feeds with custom, relevant meme content.', accent: 'purple' },
    { icon: <Megaphone size={20} />, title: 'Marketing & Branding', description: 'Use meme marketing to engage audiences. Create branded memes for product launches, campaigns, and community building.', accent: 'fuchsia' },
    { icon: <Users size={20} />, title: 'WhatsApp & Group Chats', description: 'Make memes for WhatsApp groups, Telegram channels, and Discord servers. React to conversations with custom memes in seconds.', accent: 'emerald' },
    { icon: <GraduationCap size={20} />, title: 'Education & Presentations', description: 'Create educational memes to make learning fun. Use humor in presentations, classroom activities, and study materials.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Price', axom: 'Completely Free', other: 'Free with ads', paid: '$5–$15/month', axom_check: true, other_check: true },
    { feature: 'Watermark', axom: 'No Watermark', other: 'Often watermarked', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Custom Upload', axom: 'Free Upload', other: 'Templates only', paid: 'Full upload', axom_check: true, other_check: false },
    { feature: 'Font Options', axom: 'Multiple Fonts & Colors', other: 'Limited fonts', paid: 'Full customization', axom_check: true, other_check: false },
    { feature: 'Ads', axom: 'No Ads', other: 'Heavy ads', paid: 'No ads', axom_check: true, other_check: false },
    { feature: 'Account Required', axom: 'No Signup Needed', other: 'Often required', paid: 'Required', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Output Format', value: 'PNG (high-resolution)' },
    { label: 'Template Library', value: '50+ popular meme templates' },
    { label: 'Font Support', value: 'Impact, Arial, Comic Sans, custom' },
    { label: 'Processing', value: 'Client-side (browser-based, no upload)' },
  ],

  regionalTitle: 'Meme Generator for India — Hindi, Assamese & English',
  regionalDescription:
    'Axom AI Meme Generator is built for <strong>Indian meme culture</strong>. Create memes in <strong>Hindi, Assamese, Bengali, Tamil</strong>, and all Indian languages with full Unicode support. Whether you\'re creating memes for <strong>WhatsApp groups</strong>, Instagram pages, or college festivals in <strong>Assam</strong>, this tool is free, fast, and works on any device. Part of <strong>India\'s sovereign AI platform</strong> — memes made locally, shared globally.',
  regionalBadge: "🇮🇳 India's Free Meme Platform",

  faqs: [
    { q: 'Is this meme generator completely free?', a: 'Yes, 100% free. No signup, no watermark, no ads, no hidden charges. Create unlimited memes.' },
    { q: 'Can I upload my own image?', a: 'Yes. You can upload any image (JPG, PNG, WebP) as a custom meme background, or choose from the built-in template library.' },
    { q: 'What fonts are available?', a: 'Multiple fonts are available including Impact (classic meme font), Arial, Comic Sans, and more. You can customize size, color, and outline.' },
    { q: 'Can I make memes in Hindi or Assamese?', a: 'Yes. The text editor supports full Unicode, so you can type in Hindi, Assamese, Bengali, Tamil, or any other language.' },
    { q: 'Is there a watermark on downloaded memes?', a: 'No. Downloaded memes are completely clean with no watermark, branding, or attribution marks.' },
    { q: 'Do I need to create an account?', a: 'No. The meme generator works instantly without any signup, login, or account creation.' },
    { q: 'What meme templates are available?', a: 'Popular templates include Drake Hotline Bling, Distracted Boyfriend, Expanding Brain, Two Buttons, Change My Mind, and 50+ more trending formats.' },
    { q: 'Can I use memes for commercial purposes?', a: 'Memes created from your own uploaded images can be used commercially. Template-based memes should be used in accordance with fair use for commentary, criticism, or parody.' },
    { q: 'Does it work on mobile phones?', a: 'Yes. The meme generator is fully responsive and works on smartphones, tablets, and desktops across all modern browsers.' },
    { q: 'Is my uploaded image stored?', a: 'No. All processing happens locally in your browser. Your images are never uploaded to or stored on our servers.' },
  ],

  ctaTitle: 'Make Your Meme Now',
  ctaDescription: 'Pick a template or upload an image. Add text, customize, and download — free, no watermark, in seconds.',
  ctaPrimaryText: 'Create a Meme',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Meme Generator',
  appAlternateNames: ['Free Meme Maker', 'Online Meme Creator', 'Custom Meme Generator'],
  appDescription: 'Free meme generator with popular templates and custom image upload. Add text with multiple fonts and colors, download without watermark.',
  appCategory: 'MultimediaApplication, EntertainmentApplication',
  appFeatureList: ['Popular meme templates', 'Custom image upload', 'Multiple fonts and colors', 'High-res PNG download', 'No signup required', 'No watermark'],
  appRatingValue: '4.8',
  appReviewCount: '5230',
  howToSchemaName: 'How to Create a Meme',
  howToSchemaDescription: 'Create custom memes using Axom AI Meme Generator with templates or custom images, text customization, and free download.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI Meme Generator',
};
