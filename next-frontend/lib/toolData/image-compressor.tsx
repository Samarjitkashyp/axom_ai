import React from 'react';
import { ImageDown, Shield, Zap, Layers, Smartphone, GraduationCap, Briefcase, Globe, FileImage, Archive } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'image-compressor',
  metaTitle: 'Image Compressor Online Free — Reduce JPG, PNG, WebP Size to 20KB, 50KB, 100KB | Axom AI',
  metaDescription:
    'Compress JPG, PNG and WebP images online for free. Reduce a photo to 20 KB, 50 KB or 100 KB for forms and portals, compress many pictures at once and download a ZIP. Pictures never leave your device. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/image-compressor',
  keywords: [
    'image compressor', 'compress image online', 'reduce image size', 'compress jpg', 'compress png', 'compress webp',
    'image compressor free', 'photo compressor', 'reduce photo size in kb', 'compress image to 20kb', 'compress image to 50kb',
    'compress image to 100kb', 'compress image to 200kb', 'compress photo for form', 'resize image to kb',
    'reduce jpg size', 'bulk image compressor', 'compress multiple images', 'image size reducer',
    'compress image without losing quality', 'image compressor no upload', 'compress image india',
    'photo size reducer for exam form', 'signature size reducer', 'axom ai image compressor',
  ],
  breadcrumbName: 'Image Compressor',

  heroBadgeText: 'Free Image Compressor — Private & Instant',
  heroHeadingPrefix: 'Compress',
  heroHeadingHighlight: 'Images to Any Size',
  heroHeadingSuffix: 'in Your Browser',
  heroDescription:
    'Make JPG, PNG and WebP pictures smaller without a visible drop in quality. Pick a quality level, or give a target like 50 KB for exam forms and online portals. Compress many pictures at once and download them as a ZIP. Your pictures never leave your device.',
  heroTags: ['Target size in KB', 'JPG, PNG, WebP', 'Many pictures at once', 'No upload, no signup'],

  aeoTitle: 'What is Axom AI Image Compressor?',
  aeoDescription:
    '<strong>Axom AI Image Compressor</strong> is a free tool that makes pictures smaller. It works <strong>inside your browser</strong>, so the pictures are not uploaded anywhere. You can choose a <strong>quality level</strong> or a <strong>target size in KB</strong> (for example 20 KB, 50 KB or 100 KB), limit the longest side of the picture, and save as JPG, WebP or PNG. Up to 30 pictures can be compressed in one go and downloaded together as a ZIP file.',
  aeoHighlights: ['Target size in KB', 'Pictures stay on your device', 'JPG, PNG & WebP', 'Batch + ZIP download'],

  steps: [
    {
      title: 'Add Your Pictures',
      description: 'Drag and drop up to 30 pictures (JPG, PNG, WebP, GIF, BMP or AVIF), or click to choose them from your phone or computer.',
    },
    {
      title: 'Choose Quality or a Target Size',
      description: 'Move the quality slider, or type a size such as 50 KB. You can also limit the longest side (for example 1920 px) and pick the output format.',
    },
    {
      title: 'Compress and Download',
      description: 'See the size before and after for every picture, then download one picture or all of them as a ZIP.',
    },
  ],

  benefits: [
    { icon: <ImageDown size={20} />, title: 'Target Size in KB', description: 'Type the size a form or portal asks for (20 KB, 50 KB, 100 KB, 200 KB...). The tool finds the best quality that fits, and makes the picture a little smaller only if needed.' },
    { icon: <Shield size={20} />, title: 'Private by Design', description: 'Compression happens in your browser. Your pictures are not uploaded to our servers. Location and camera details (EXIF) are removed from the compressed copy.' },
    { icon: <Layers size={20} />, title: 'Many Pictures at Once', description: 'Add up to 30 pictures, compress them with the same settings and download everything in one ZIP file.' },
    { icon: <FileImage size={20} />, title: 'JPG, PNG and WebP', description: 'Auto mode keeps JPG as JPG, uses WebP for pictures with transparency and JPG for the rest. You can also force JPG, WebP or PNG.' },
    { icon: <Zap size={20} />, title: 'Fast, No Queue', description: 'There is no upload and no waiting in a queue, so even large pictures are done in a few seconds on a normal phone or laptop.' },
    { icon: <Archive size={20} />, title: 'Never Bigger', description: 'If a picture is already well optimised, the tool tells you and gives back the original instead of a larger file.' },
  ],

  useCases: [
    { icon: <GraduationCap size={20} />, title: 'Exam & Job Forms', description: 'Reduce photos and scanned documents to the KB limit asked by exam, job and government portals.', accent: 'purple' },
    { icon: <Briefcase size={20} />, title: 'Websites & Online Shops', description: 'Make product photos and banners lighter so pages load faster on mobile data.', accent: 'emerald' },
    { icon: <Smartphone size={20} />, title: 'Email & WhatsApp', description: 'Shrink big phone photos before sending, so they fit email limits and use less data.', accent: 'fuchsia' },
    { icon: <Globe size={20} />, title: 'Blogs & Social Media', description: 'Prepare lighter images for blogs, uploads and posts without opening a heavy editor.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Where pictures are processed', axom: 'In your browser', other: 'Often uploaded to a server', paid: 'Uploaded to a server', axom_check: true, other_check: false },
    { feature: 'Target size in KB', axom: 'Yes, with presets', other: 'Not always available', paid: 'Usually included', axom_check: true, other_check: false },
    { feature: 'Many pictures + ZIP', axom: 'Up to 30 pictures', other: 'Often a small limit', paid: 'Included', axom_check: true, other_check: true },
    { feature: 'Account or signup', axom: 'Not needed', other: 'Sometimes needed', paid: 'Needed', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Input Formats', value: 'JPG, PNG, WebP, GIF (first frame), BMP, AVIF' },
    { label: 'Output Formats', value: 'JPG, WebP, PNG (WebP needs a browser that can save it)' },
    { label: 'Limits', value: 'Up to 30 pictures at a time, 60 MB each' },
    { label: 'Processing', value: 'In your browser; nothing is uploaded' },
  ],

  regionalTitle: 'Image Compressor for Indian Forms and Portals',
  regionalDescription:
    'Many <strong>exam, job and government portals in India</strong> ask for a photo or signature under a size such as 20 KB, 50 KB or 200 KB. Axom AI Image Compressor lets you type that size and get a picture that fits, on your phone, without installing an app. It works on pictures of any language and is built for users across <strong>Assam and Northeast India</strong>, where mobile data is precious.',
  regionalBadge: '🇮🇳 Made for Indian Users',

  faqs: [
    { q: 'Is this image compressor free?', a: 'Yes. It is free, needs no signup and adds no watermark.' },
    { q: 'Are my pictures uploaded?', a: 'No. The compression runs inside your browser, so your pictures stay on your device.' },
    { q: 'How do I reduce a photo to 50 KB?', a: 'Choose “To a target size”, type 50 (or tap the 50 KB button), add your photo and press Compress. The tool finds the best quality that fits 50 KB and makes the picture slightly smaller only if it must.' },
    { q: 'Will the picture look worse?', a: 'A lower quality or a smaller target means more compression. At around 70–80% quality most photos look almost the same. You can compare the sizes and try again with another setting.' },
    { q: 'Why did PNG not get smaller?', a: 'PNG is a lossless format, so quality has no effect on it. Choose JPG or WebP for stronger compression, or leave Save as on Auto.' },
    { q: 'What happens to transparent pictures?', a: 'In Auto mode they are saved as WebP so the transparency is kept. If you force JPG, transparent areas become white.' },
    { q: 'Can I compress many pictures at once?', a: 'Yes, up to 30 pictures at a time with the same settings. Download them one by one or all together as a ZIP.' },
    { q: 'Does it remove location data from my photos?', a: 'Yes. The compressed copy does not keep EXIF data such as GPS location or camera details.' },
    { q: 'Why is there sometimes no saving?', a: 'If a picture is already well optimised, a new copy would be the same size or bigger. In that case the tool returns your original file.' },
  ],

  ctaTitle: 'Compress Your Images Now',
  ctaDescription: 'Reduce JPG, PNG and WebP pictures to the size you need. Free, private and instant.',
  ctaPrimaryText: 'Compress Images',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Image Compressor',
  appAlternateNames: ['Free Image Compressor', 'Photo Size Reducer', 'Image Size Reducer in KB'],
  appDescription: 'Free online image compressor. Reduce JPG, PNG and WebP size by quality or to a target size in KB, compress many pictures and download a ZIP. Works in your browser.',
  appCategory: 'MultimediaApplication, UtilitiesApplication',
  appFeatureList: ['Compress by quality or to a target size in KB', 'JPG, PNG and WebP', 'Up to 30 pictures and ZIP download', 'Runs in the browser, nothing uploaded', 'No signup, no watermark'],
  howToSchemaName: 'How to Compress an Image Online',
  howToSchemaDescription: 'Reduce the size of JPG, PNG and WebP pictures with Axom AI Image Compressor.',
  howToTotalTime: 'PT20S',
  howToToolName: 'Axom AI Image Compressor',
};
