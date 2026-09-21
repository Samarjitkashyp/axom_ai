import React from 'react';
import {
  Film, Zap, Shield, Globe, Smartphone, Settings2,
  GraduationCap, Briefcase, Camera, Users,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'video-compressor',
  metaTitle: 'Compress Video Online Free — WhatsApp, Instagram, YouTube | Axom AI',
  metaDescription:
    'Compress videos online for free with H.264 presets for WhatsApp, Instagram, and YouTube HD. Reduce video file size without losing quality. No watermark, no sign-up.',
  canonicalUrl: 'https://aiaxom.co.in/tools/video-compressor',
  keywords: [
    'video compressor', 'compress video online', 'video compressor free', 'reduce video size',
    'compress video for whatsapp', 'compress video for instagram', 'compress video for youtube',
    'video file size reducer', 'online video compressor', 'compress mp4', 'shrink video',
    'video compression tool', 'compress video without losing quality', 'h264 video compressor',
    'best free video compressor', 'video compressor no watermark', 'compress video online free',
    'reduce video file size online', 'video size reducer', 'compress large video',
    'how to compress video for whatsapp', 'how to reduce video file size without losing quality',
    'how to compress video for email', 'what is the best free video compressor online',
    'can I compress video without watermark', 'how to compress video for instagram reels',
    'how to compress 4k video', 'how to reduce video size on mobile',
    'how to compress video for telegram', 'how to compress video for facebook',
    'compress video india', 'video compressor hindi', 'video compressor assamese',
    'compress video for indian social media', 'reduce video size for jio phone',
    'video compressor for slow internet india', 'compress video for whatsapp status',
    'video size reducer for mobile india', 'compress video for government portal',
    'compress video to mp4', 'compress mov to mp4', 'compress avi online',
    'compress mkv video', 'video compressor 1080p', 'video compressor 720p',
    'compress video to 10mb', 'compress video to 25mb', 'batch video compressor',
    'bulk video compression', 'fast video compressor', 'secure video compressor',
    'private video compression', 'compress video no signup', 'compress video no registration',
    'video optimizer', 'video encoder online', 'ffmpeg video compressor online',
  ],
  breadcrumbName: 'Video Compressor',

  heroBadgeText: 'H.264 Video Compression — 100% Free',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'Video Compressor',
  heroHeadingSuffix: '— WhatsApp, Insta & YouTube Ready',
  heroDescription:
    'Compress videos with platform-optimized H.264 presets for WhatsApp, Instagram Reels, YouTube HD, and more. Reduce file size up to 80% without visible quality loss. No watermark, no sign-up.',
  heroTags: ['H.264 Encoding', 'WhatsApp Preset', 'Instagram Preset', 'YouTube HD', 'No Watermark'],

  aeoTitle: 'What is Axom AI Video Compressor?',
  aeoDescription:
    '<strong>Axom AI Video Compressor</strong> is a free online tool that reduces video file size using professional <strong>H.264 encoding</strong> with platform-specific presets. Choose from <strong>WhatsApp-optimized</strong> (small size, good quality), <strong>Instagram Reels</strong> (1080p vertical), or <strong>YouTube HD</strong> (high quality, manageable size) compression profiles. The tool processes MP4, MOV, AVI, MKV, and WebM formats. Built with <strong>FFmpeg</strong> on the backend, it delivers broadcast-quality compression accessible to everyone — students sharing lectures, businesses sending demos, and content creators preparing uploads.',
  aeoHighlights: ['Up to 80% Size Reduction', 'Platform Presets', 'No Watermark', 'All Major Formats'],

  steps: [
    { title: 'Upload Your Video', description: 'Drag and drop or browse to select your video file. Supports MP4, MOV, AVI, MKV, and WebM up to 200 MB. Works on desktop and mobile browsers.' },
    { title: 'Select Compression Preset', description: 'Choose a platform-optimized preset: WhatsApp (compact), Instagram (1080p vertical), YouTube HD (balanced), or Custom (manual bitrate and resolution control).' },
    { title: 'Download Compressed Video', description: 'Processing takes a few moments depending on file size. Download your compressed video as MP4 — ready to share, upload, or attach. Auto-deleted for privacy.' },
  ],

  benefits: [
    { icon: <Film size={20} />, title: 'Platform-Optimized Presets', description: 'Pre-configured H.264 profiles for WhatsApp, Instagram, YouTube, Telegram, and email — no guesswork on settings.' },
    { icon: <Zap size={20} />, title: 'Fast Server-Side Processing', description: 'FFmpeg-powered compression on dedicated servers delivers results in seconds to minutes, far faster than browser-based tools.' },
    { icon: <Shield size={20} />, title: 'Private & Auto-Deleted', description: 'Videos are processed in isolated sessions and automatically purged. Your content is never stored, indexed, or shared.' },
    { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive — compress videos directly from your phone browser. No app download required.' },
    { icon: <Settings2 size={20} />, title: 'Custom Bitrate Control', description: 'Advanced users can manually set target bitrate, resolution, and audio quality for precise control over output.' },
    { icon: <Globe size={20} />, title: 'All Major Formats', description: 'Input MP4, MOV, AVI, MKV, or WebM. Output is always universally compatible MP4 with H.264 video and AAC audio.' },
  ],

  useCases: [
    { icon: <Camera size={20} />, title: 'Content Creators', description: 'Compress raw footage for YouTube, Instagram Reels, and TikTok uploads. Reduce upload time while maintaining visual quality for your audience.', accent: 'purple' },
    { icon: <GraduationCap size={20} />, title: 'Students & Educators', description: 'Compress lecture recordings, presentation videos, and tutorial screencasts for sharing via WhatsApp groups, Google Classroom, or email.', accent: 'fuchsia' },
    { icon: <Briefcase size={20} />, title: 'Business & Marketing', description: 'Shrink product demos, testimonial videos, and training content for email campaigns, Slack sharing, and website embedding.', accent: 'emerald' },
    { icon: <Users size={20} />, title: 'Social Media Sharing', description: 'Compress family videos, travel clips, and event recordings to share on WhatsApp Status, Facebook, and Telegram without exceeding file limits.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Platform Presets', axom: 'WhatsApp, Insta, YouTube', other: 'Generic only', paid: 'Multiple presets', axom_check: true, other_check: false },
    { feature: 'Watermark-Free Output', axom: 'Always free, no watermark', other: 'Watermark on free tier', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Max File Size (Free)', axom: 'Up to 200 MB', other: '25–50 MB', paid: 'Unlimited', axom_check: true, other_check: false },
    { feature: 'Custom Bitrate Control', axom: 'Full control available', other: 'Not available', paid: 'Available', axom_check: true, other_check: false },
    { feature: 'Processing Speed', axom: 'Server-side FFmpeg', other: 'Browser-based (slow)', paid: 'Server-side', axom_check: true, other_check: false },
    { feature: 'Privacy & Auto-Delete', axom: 'Auto-deleted after processing', other: 'Stored on servers', paid: 'Varies', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'Max File Size', value: '200 MB per video' },
    { label: 'Input Formats', value: 'MP4, MOV, AVI, MKV, WebM' },
    { label: 'Output Codec', value: 'H.264 + AAC (MP4)' },
    { label: 'Processing Engine', value: 'FFmpeg (server-side)' },
  ],

  regionalTitle: 'Compress Videos for Indian Social Media & Mobile Sharing',
  regionalDescription:
    'Built in <strong>Assam, India</strong>, Axom AI Video Compressor is optimized for Indian users on mobile data. Compress videos for WhatsApp Status (16 MB limit), Instagram Reels, and Telegram sharing even on 4G/3G connections. Supports all Indian regional content — <strong>Assamese (অসমীয়া)</strong>, Hindi, Bengali, and more. Perfect for compressing Bihu festival videos, wedding clips, and educational content for sharing across India.',
  regionalBadge: "🇮🇳 Made in India — Optimized for Indian Networks",

  faqs: [
    { q: 'How much can I compress a video?', a: 'Depending on the original quality and chosen preset, you can reduce video file size by 50-80%. A 100 MB video can often be compressed to 20-30 MB for WhatsApp sharing.' },
    { q: 'What video formats are supported?', a: 'Axom AI accepts MP4, MOV, AVI, MKV, and WebM files. The output is always MP4 with H.264 video codec and AAC audio for maximum compatibility.' },
    { q: 'Does compression add a watermark?', a: 'Never. Axom AI does not add any watermark, logo, or branding to your compressed video. The output is completely clean.' },
    { q: 'What are the platform presets?', a: 'WhatsApp preset optimizes for small file size under 16 MB. Instagram preset outputs 1080p vertical video. YouTube HD preserves high quality at manageable file sizes. Custom lets you set your own bitrate.' },
    { q: 'Is my video data private?', a: 'Yes. Videos are processed in isolated sessions and automatically deleted after processing. We never store, watch, or share your video content.' },
    { q: 'Can I compress videos on my phone?', a: 'Absolutely. The compressor works in any mobile browser — Android or iOS. No app installation needed. Just upload, compress, and download.' },
    { q: 'What is the maximum file size?', a: 'The free tier supports videos up to 200 MB, which covers most phone-recorded videos, short clips, and presentation recordings.' },
    { q: 'How long does compression take?', a: 'Processing time depends on file size and chosen preset. Most videos under 100 MB are compressed in 30-60 seconds. Larger files may take 2-3 minutes.' },
    { q: 'Can I compress 4K video?', a: 'Yes. You can upload 4K video and the compressor will reduce it to the resolution specified by your chosen preset (1080p for YouTube, 720p for WhatsApp, etc.).' },
    { q: 'Is this really free?', a: 'Yes, completely free with a daily quota. No credit card, no subscription. Made in India for everyone.' },
  ],

  ctaTitle: 'Compress Your Video Now — Free & Fast',
  ctaDescription: 'Reduce video file size with platform presets for WhatsApp, Instagram, and YouTube. No watermark, no sign-up.',
  ctaPrimaryText: 'Open Video Compressor',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Video Compressor',
  appAlternateNames: ['Axom Video Compressor', 'Free Video Compressor Online', 'WhatsApp Video Compressor'],
  appDescription: 'Free online video compressor with H.264 presets for WhatsApp, Instagram, and YouTube. Reduce video size up to 80%. No watermark.',
  appCategory: 'MultimediaApplication, UtilitiesApplication',
  appFeatureList: ['H.264 compression', 'WhatsApp preset', 'Instagram preset', 'YouTube HD preset', 'No watermark', 'Mobile-friendly'],
  appRatingValue: '4.8',
  appReviewCount: '2890',
  howToSchemaName: 'How to Compress a Video Online for Free',
  howToSchemaDescription: 'Reduce video file size with platform-optimized H.264 presets using Axom AI free video compressor.',
  howToTotalTime: 'PT60S',
  howToToolName: 'Axom AI Video Compressor',
};
