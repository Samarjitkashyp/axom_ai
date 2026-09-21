import React from 'react';
import { Eraser, Image, Zap, Shield, Download, Palette, ShoppingBag, Camera, GraduationCap, Building2 } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'background-remover',
  metaTitle: 'AI Background Remover — Remove Image Backgrounds Free | Transparent PNG | Axom AI',
  metaDescription:
    'Remove image backgrounds instantly with AI. Get transparent PNG or replace with solid colors. Free, no signup, no watermark. Perfect for product photos, portraits & design. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/background-remover',
  keywords: [
    'background remover', 'remove background', 'background remover free', 'ai background remover',
    'remove image background', 'transparent background', 'png background remover',
    'background eraser', 'remove bg', 'background remover online', 'free background remover',
    'background remover no signup', 'background remover no watermark', 'remove background from photo',
    'remove background from image free', 'background removal tool', 'ai background removal',
    'automatic background remover', 'instant background remover', 'background cutout tool',
    'how to remove background from image', 'how to make transparent background',
    'what is the best free background remover', 'how to remove background without photoshop',
    'can ai remove image background', 'best background remover 2025',
    'background remover india', 'remove background hindi', 'background remover assamese',
    'product photo background remover', 'passport photo background remover',
    'ecommerce product photo background', 'portrait background remover',
    'selfie background remover', 'profile picture background remover',
    'background remover for instagram', 'background remover for whatsapp dp',
    'replace background color', 'white background maker', 'solid color background',
    'transparent png maker', 'remove bg free online', 'background remover api',
    'bulk background remover', 'background remover mobile', 'background remover android',
    'remove background from product photos india', 'passport size photo background',
    'axom ai background remover', 'free bg removal tool india',
    'image cutout tool', 'photo background changer', 'background remover for designers',
    'background remover for social media', 'transparent image maker',
  ],
  breadcrumbName: 'AI Background Remover',

  heroBadgeText: 'AI-Powered Instant Background Removal',
  heroHeadingPrefix: 'Remove',
  heroHeadingHighlight: 'Image Backgrounds',
  heroHeadingSuffix: 'with AI',
  heroDescription:
    'Upload any image and remove the background instantly with AI. Get a transparent PNG or replace with a solid color. Perfect for product photos, portraits, and design — free, no watermark, no signup.',
  heroTags: ['Instant AI Processing', 'Transparent PNG Output', 'Color Replacement', 'No Signup Required'],

  aeoTitle: 'What is Axom AI Background Remover?',
  aeoDescription:
    '<strong>Axom AI Background Remover</strong> is a free, AI-powered tool that automatically detects and removes backgrounds from images in seconds. Upload a <strong>photo, product image, portrait, or selfie</strong> — the AI precisely separates the subject from the background and delivers a <strong>transparent PNG</strong> or an image with a <strong>solid color replacement</strong> (white, black, or any custom color). Powered by advanced deep learning models, it handles complex edges like <strong>hair, fur, transparent objects,</strong> and <strong>intricate details</strong> with professional accuracy. No Photoshop skills needed. No signup, no watermark, completely free. Built on <strong>India\'s sovereign AI platform</strong>.',
  aeoHighlights: ['AI-Powered Precision', 'Transparent PNG or Color Replace', 'No Watermark or Signup', 'Handles Hair & Complex Edges'],

  steps: [
    {
      title: 'Upload Your Image',
      description: 'Upload any image — product photo, portrait, selfie, or graphic — in PNG, JPG, or WebP format. Files up to 10 MB supported.',
    },
    {
      title: 'AI Removes Background',
      description: 'Advanced AI instantly detects the subject and removes the background with pixel-perfect precision, handling hair, edges, and complex details.',
    },
    {
      title: 'Download or Replace',
      description: 'Download the result as a transparent PNG, or choose a solid color (white, black, custom) to replace the background. No watermark.',
    },
  ],

  benefits: [
    { icon: <Eraser size={20} />, title: 'AI-Powered Precision', description: 'Deep learning models detect edges, hair, fur, and transparent objects with professional-grade accuracy.' },
    { icon: <Image size={20} />, title: 'Transparent PNG Output', description: 'Get clean transparent PNG files ready for compositing, design, e-commerce listings, and social media.' },
    { icon: <Palette size={20} />, title: 'Color Replacement', description: 'Replace the removed background with white, black, or any custom solid color for product photography and ID photos.' },
    { icon: <Zap size={20} />, title: 'Instant Processing', description: 'Background removal completes in seconds. No waiting in queues — upload and get results immediately.' },
    { icon: <Download size={20} />, title: 'High-Resolution Output', description: 'Download full-resolution images without quality loss. No compression, no watermark, no size limits on output.' },
    { icon: <Shield size={20} />, title: 'Free & Private', description: 'No signup, no watermark, no ads. Your images are processed securely and never stored after processing.' },
  ],

  useCases: [
    { icon: <ShoppingBag size={20} />, title: 'E-Commerce & Product Photos', description: 'Remove backgrounds from product images for Amazon, Flipkart, Shopify, and other marketplaces. Create professional white-background product shots.', accent: 'purple' },
    { icon: <Camera size={20} />, title: 'Portrait & Profile Photos', description: 'Remove or replace backgrounds in portraits, selfies, passport photos, and professional headshots for LinkedIn and resumes.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Design & Marketing', description: 'Create composite images, marketing materials, social media graphics, and presentations with transparent subject cutouts.', accent: 'emerald' },
    { icon: <GraduationCap size={20} />, title: 'Students & Personal Use', description: 'Remove backgrounds for school projects, presentations, WhatsApp stickers, Instagram stories, and creative photo edits.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Price', axom: 'Completely Free', other: 'Free with limits', paid: '$5–$20/month', axom_check: true, other_check: true },
    { feature: 'Watermark', axom: 'No Watermark', other: 'Low-res preview only', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Full Resolution', axom: 'Free Full-Res Download', other: 'Low-res free, HD paid', paid: 'Full-res included', axom_check: true, other_check: false },
    { feature: 'Color Replacement', axom: 'Free Custom Colors', other: 'Transparent only', paid: 'Included', axom_check: true, other_check: false },
    { feature: 'Account Required', axom: 'No Signup Needed', other: 'Required for HD', paid: 'Required', axom_check: true, other_check: false },
    { feature: 'Edge Quality', axom: 'AI Hair/Fur Detection', other: 'Basic edges', paid: 'Advanced AI', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Engine', value: 'Deep learning segmentation model' },
    { label: 'Input Formats', value: 'PNG, JPG, WebP, AVIF' },
    { label: 'Output Formats', value: 'Transparent PNG, solid color PNG' },
    { label: 'Max Image Size', value: '10 MB per upload' },
  ],

  regionalTitle: 'AI Background Remover for India — E-Commerce & Personal Use',
  regionalDescription:
    'Axom AI Background Remover is designed for users across <strong>India</strong>. Remove backgrounds from product photos for <strong>Amazon India, Flipkart, Meesho,</strong> and other Indian e-commerce platforms. Create passport-size photos with white backgrounds for government applications. Perfect for small businesses, freelancers, and students in <strong>Assam, Delhi, Mumbai, Bengaluru</strong> and across India. Part of <strong>India\'s sovereign AI platform</strong> — fast processing optimized for Indian network speeds.',
  regionalBadge: "🇮🇳 India's Free AI Background Removal Tool",

  faqs: [
    { q: 'Is this background remover really free?', a: 'Yes, completely free. No signup, no watermark, no hidden charges. Download full-resolution images with transparent backgrounds at no cost.' },
    { q: 'What image formats are supported?', a: 'You can upload images in PNG, JPG, WebP, and AVIF formats. The output is always a high-quality PNG with transparency or your chosen background color.' },
    { q: 'Can it handle complex edges like hair?', a: 'Yes. The AI uses advanced deep learning models specifically trained to handle complex edges including hair, fur, transparent objects, and intricate details.' },
    { q: 'Can I replace the background with a specific color?', a: 'Yes. After removing the background, you can choose transparent, white, black, or any custom color as the new background.' },
    { q: 'Is the output full resolution?', a: 'Yes. The output image maintains the original resolution and quality. No compression or downscaling is applied.' },
    { q: 'Do I need Photoshop skills?', a: 'No. The AI handles everything automatically. Just upload your image and the background is removed in seconds — no manual editing needed.' },
    { q: 'Can I use it for product photos on Amazon/Flipkart?', a: 'Yes. The tool is perfect for creating white-background product photos that meet e-commerce marketplace requirements for Amazon, Flipkart, Shopify, and others.' },
    { q: 'Is my uploaded image stored?', a: 'No. Images are processed in real-time and immediately discarded. Your photos are never stored on our servers.' },
    { q: 'Does it work on mobile phones?', a: 'Yes. The tool is fully responsive and works on smartphones, tablets, and desktops. Upload photos directly from your phone camera or gallery.' },
    { q: 'Can I process multiple images?', a: 'You can process images one at a time. Each upload is processed instantly, so you can quickly work through multiple images in sequence.' },
  ],

  ctaTitle: 'Remove Backgrounds Now',
  ctaDescription: 'Upload any image and get a transparent PNG in seconds. Free, no signup, no watermark — AI-powered precision.',
  ctaPrimaryText: 'Remove Background',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Background Remover',
  appAlternateNames: ['AI Background Eraser', 'Free Background Removal Tool', 'Transparent PNG Maker'],
  appDescription: 'Free AI background remover. Remove image backgrounds instantly, get transparent PNG or solid color replacement. No signup, no watermark.',
  appCategory: 'MultimediaApplication, DesignApplication',
  appFeatureList: ['AI-powered background removal', 'Transparent PNG output', 'Custom color replacement', 'Hair and edge detection', 'No signup required', 'No watermark'],
  appRatingValue: '4.9',
  appReviewCount: '4850',
  howToSchemaName: 'How to Remove Image Background with AI',
  howToSchemaDescription: 'Remove backgrounds from images instantly using Axom AI Background Remover — get transparent PNG or color replacement.',
  howToTotalTime: 'PT10S',
  howToToolName: 'Axom AI Background Remover',
};
