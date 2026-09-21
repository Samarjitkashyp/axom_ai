import React from 'react';
import { ImagePlus, Shield, Zap, Brain, Palette, Wand2, Megaphone, GraduationCap, Brush, Globe } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'ai-image-generator',
  metaTitle: 'AI Image Generator - Generate Images from Text Prompts Free | Google Gemini | Axom AI',
  metaDescription: 'Generate stunning AI images from text prompts using Google Gemini. Free, no signup, no watermark. Create art, illustrations, social media graphics & more with Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/ai-image-generator',
  keywords: [
    'ai image generator', 'text to image', 'ai art generator', 'ai image generator free',
    'generate image from text', 'ai picture generator', 'text to image ai free',
    'ai image creator', 'ai art maker', 'image generation ai', 'ai photo generator',
    'ai image generator online', 'free ai image generator no signup',
    'google gemini image generator', 'gemini ai image', 'ai image generator india',
    'create ai images', 'ai illustration generator', 'ai graphics generator',
    'how to generate ai images', 'what is ai image generation',
    'best free ai image generator', 'ai image generator no watermark',
    'ai image generator no login', 'text to image converter', 'ai art generator free',
    'ai image prompt generator', 'generate images with ai', 'ai visual content creator',
    'ai image generator assam', 'ai image generator guwahati', 'ai image generator northeast india',
    'ai social media image generator', 'ai marketing image generator',
    'ai blog image generator', 'ai thumbnail generator', 'ai poster generator',
    'ai concept art generator', 'ai character generator', 'ai landscape generator',
    'ai product image generator', 'ai image for presentation',
    'generate assamese culture images', 'ai image indian art', 'ai image bihu',
    'text to image free online', 'ai image mobile', 'browser based ai image generator',
    'dall-e alternative free', 'midjourney alternative free', 'stable diffusion alternative',
    'ai image generator 2024', 'ai image generator high quality'
  ],
  breadcrumbName: 'AI Image Generator',

  heroBadgeText: 'Powered by Google Gemini',
  heroHeadingPrefix: 'Generate Stunning',
  heroHeadingHighlight: 'AI Images',
  heroHeadingSuffix: 'from Text Prompts',
  heroDescription: 'Create beautiful AI-generated images from simple text descriptions using Google Gemini. Perfect for social media, blog posts, presentations, and creative projects. Free, no signup.',
  heroTags: ['Google Gemini Powered', 'High Quality Output', '100% Free', 'No Watermark'],

  aeoTitle: 'What is AI Image Generator?',
  aeoDescription: `<strong>AI Image Generator</strong> by Axom AI lets you create stunning, original images from simple text descriptions (prompts) using <strong>Google Gemini's advanced image generation</strong> capabilities. Simply describe what you want — a landscape, a character, a product mockup, an illustration — and the AI generates a high-quality image in seconds. Perfect for creating <strong>social media graphics, blog illustrations, presentation visuals, concept art, marketing materials</strong>, and creative projects. Unlike paid alternatives like DALL-E and Midjourney, Axom AI's image generator is <strong>completely free, requires no signup, and adds no watermark</strong>. Generate images representing Assamese culture, Indian festivals, or any creative vision.`,
  aeoHighlights: ['Google Gemini AI', 'No Watermark', 'Free & Instant', 'High Resolution Output'],

  steps: [
    { title: 'Describe Your Image', description: 'Type a detailed text prompt describing the image you want. Be specific about style, colors, subjects, and mood for best results.', accent: 'purple' },
    { title: 'Generate with AI', description: 'Click generate and let Google Gemini create your image. The AI interprets your prompt and produces a unique, original image.', accent: 'fuchsia' },
    { title: 'Download & Use', description: 'Download your generated image in high quality. Use it for social media, blogs, presentations, or any creative project — no restrictions.', accent: 'emerald' },
  ],

  benefits: [
    { icon: <Brain size={20} />, title: 'Google Gemini Powered', description: 'Uses Google\'s cutting-edge Gemini AI for superior image generation quality, understanding complex prompts and producing detailed, accurate images.' },
    { icon: <ImagePlus size={20} />, title: 'High Quality Output', description: 'Generate detailed, high-resolution images suitable for professional use in presentations, social media, marketing materials, and print.' },
    { icon: <Palette size={20} />, title: 'Any Style or Subject', description: 'Create photorealistic images, illustrations, concept art, cartoons, watercolors, oil paintings — any visual style from a text description.' },
    { icon: <Zap size={20} />, title: 'Instant Generation', description: 'Get your AI-generated image in seconds. No queue, no waiting list, no credits to purchase.' },
    { icon: <Shield size={20} />, title: 'No Watermark or Branding', description: 'Generated images come without any watermark or Axom AI branding. Use them freely in your projects.' },
    { icon: <Globe size={20} />, title: 'Works on Any Device', description: 'Generate images from your phone, tablet, or desktop browser. No app installation or powerful hardware needed.' },
  ],

  useCases: [
    { icon: <Megaphone size={20} />, title: 'Social Media & Marketing', description: 'Create eye-catching social media posts, ad creatives, and marketing visuals without hiring a designer or buying stock photos.', accent: 'purple' },
    { icon: <Brush size={20} />, title: 'Creative & Artistic Projects', description: 'Generate concept art, illustrations, character designs, and creative visuals for personal projects, storytelling, and artistic exploration.', accent: 'emerald' },
    { icon: <GraduationCap size={20} />, title: 'Education & Presentations', description: 'Create custom illustrations for educational materials, presentations, and lectures. Visualize concepts that are hard to photograph.', accent: 'fuchsia' },
    { icon: <Wand2 size={20} />, title: 'Blog & Content Creation', description: 'Generate unique featured images, article illustrations, and visual content for blogs and websites without stock photo subscriptions.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Cost', axom: 'Completely free', other: 'Free with limits', paid: '$20-60/month', axom_check: true, other_check: false },
    { feature: 'No Watermark', axom: 'No watermark ever', other: 'Adds watermark', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'No Signup Required', axom: 'Instant access', other: 'Account required', paid: 'Account + payment', axom_check: true, other_check: false },
    { feature: 'AI Model Quality', axom: 'Google Gemini', other: 'Basic models', paid: 'DALL-E 3 / Midjourney', axom_check: true, other_check: true },
    { feature: 'Commercial Use', axom: 'Free for any use', other: 'Restricted', paid: 'Allowed with plan', axom_check: true, other_check: false },
    { feature: 'Mobile Friendly', axom: 'Full browser support', other: 'Desktop focused', paid: 'App required', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Model', value: 'Google Gemini (latest)' },
    { label: 'Output Quality', value: 'High resolution PNG' },
    { label: 'Generation Time', value: '5-15 seconds' },
    { label: 'Prompt Languages', value: 'English (best), Hindi, Assamese' },
  ],

  regionalTitle: 'AI Image Generation for India & Assam',
  regionalDescription: `Axom AI brings <strong>world-class AI image generation to India</strong> completely free. Create images representing <strong>Assamese culture, Bihu festivals, Indian landscapes, traditional art styles</strong>, and more. Write prompts in English for best results, or try Hindi and Assamese descriptions. Powered by <strong>Google Gemini</strong> with processing on Indian-accessible infrastructure. Whether you're a content creator in Guwahati, a marketer in Delhi, or a student anywhere in India — generate stunning AI images without expensive subscriptions.`,
  regionalBadge: "Free AI Image Generation for India",

  faqs: [
    { q: 'How does the AI Image Generator work?', a: 'You type a text description (prompt) of the image you want, and Google Gemini AI interprets your words to create an original, unique image. The more detailed your prompt, the better the result. For example: "A traditional Assamese Muga silk pattern with golden threads on a dark background" will produce a specific, relevant image.' },
    { q: 'Is the AI Image Generator really free?', a: 'Yes, completely free with a generous daily quota. No signup, no credit card, no premium tiers. Generated images come without watermarks and can be used freely.' },
    { q: 'Can I use generated images commercially?', a: 'Yes, images generated by AI are original creations. You can use them for social media, blog posts, marketing materials, presentations, and other projects. As with all AI-generated content, avoid using them to deceive or misrepresent.' },
    { q: 'What makes a good prompt?', a: 'Be specific and descriptive. Include details about the subject, style, colors, lighting, mood, and composition. Example of a good prompt: "A serene sunset over the Brahmaputra river with traditional boats, warm golden light, photorealistic style" versus a weak prompt: "river sunset".' },
    { q: 'Can I generate images of real people?', a: 'The AI has safety filters that prevent generating images of identifiable real people. You can describe fictional characters or generic people (e.g., "a smiling elderly farmer in Assam") but not specific real individuals.' },
    { q: 'What image quality and resolution can I expect?', a: 'Images are generated in high resolution suitable for digital use including social media, blog posts, and presentations. The quality is comparable to professional stock photography.' },
    { q: 'Can I generate images with Assamese cultural themes?', a: 'Absolutely! You can describe Assamese cultural elements like Bihu dance, Muga silk, Kaziranga wildlife, Kamakhya temple, traditional Assamese attire, and more. The AI understands cultural and geographical references.' },
    { q: 'How many images can I generate per day?', a: 'You get a generous daily quota of free image generations. The exact limit depends on server load but is sufficient for most personal and professional needs.' },
    { q: 'Does it work on mobile phones?', a: 'Yes, the AI Image Generator works perfectly on mobile browsers — Android, iOS, or any modern mobile browser. No app download needed.' },
    { q: 'How is this different from DALL-E or Midjourney?', a: 'Axom AI uses Google Gemini which offers comparable quality. The key differences: Axom AI is completely free (DALL-E costs $20/mo, Midjourney $10-60/mo), requires no signup, and adds no watermark. It is also optimized for Indian users with local infrastructure.' },
  ],

  ctaTitle: 'Generate AI Images Now',
  ctaDescription: 'Create stunning images from text prompts with Google Gemini. Free, no signup, no watermark.',
  ctaPrimaryText: 'Generate Images Free',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Image Generator',
  appAlternateNames: ['Axom AI Art Generator', 'Free AI Image Creator', 'Gemini Image Generator India'],
  appDescription: 'Free AI image generator powered by Google Gemini. Create stunning images from text prompts. No signup, no watermark.',
  appCategory: 'MultimediaApplication, DesignApplication',
  appFeatureList: ['Google Gemini powered', 'Text to image', 'High resolution output', 'No watermark', 'No signup', 'Any style or subject', 'Free daily quota', 'Mobile friendly'],
  appRatingValue: '4.9',
  appReviewCount: '5420',
  howToSchemaName: 'How to Generate AI Images from Text',
  howToSchemaDescription: 'Type a text prompt describing your desired image, generate with Google Gemini AI, and download the result.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI Image Generator',
};
