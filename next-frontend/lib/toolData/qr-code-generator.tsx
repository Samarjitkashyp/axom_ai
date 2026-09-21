import React from 'react';
import { QrCode, Palette, Download, Shield, Zap, Smartphone, Store, CreditCard, GraduationCap, Building2 } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'qr-code-generator',
  metaTitle: 'QR Code Generator Free — URL, WiFi, UPI, vCard, WhatsApp QR Maker | Axom AI',
  metaDescription:
    'Generate QR codes from URLs, text, WiFi, UPI, vCard, WhatsApp — customize colors, add logos, download PNG/SVG. Free, no signup. Powered by Axom AI — India\'s sovereign AI platform.',
  canonicalUrl: 'https://aiaxom.co.in/tools/qr-code-generator',
  keywords: [
    'qr code generator', 'free qr code maker', 'qr code creator', 'create qr code online',
    'qr code generator free', 'custom qr code', 'qr code with logo', 'qr code with color',
    'url qr code', 'wifi qr code generator', 'upi qr code generator', 'vcard qr code',
    'whatsapp qr code generator', 'text qr code', 'email qr code', 'phone qr code',
    'qr code download png', 'qr code download svg', 'qr code maker online free',
    'how to generate qr code', 'how to create qr code for website', 'how to make wifi qr code',
    'how to generate upi qr code free', 'what is qr code generator',
    'best free qr code generator 2025', 'qr code generator no signup',
    'qr code generator india', 'upi qr code india', 'qr code hindi',
    'qr code assamese', 'qr code for business india', 'qr code for shop india',
    'gpay qr code generator', 'paytm qr code generator', 'phonepe qr code',
    'custom color qr code', 'branded qr code', 'qr code with company logo',
    'dynamic qr code free', 'static qr code generator', 'bulk qr code generator',
    'qr code for menu', 'restaurant qr code', 'qr code for event',
    'qr code for visiting card', 'qr code for social media',
    'qr code scanner and generator', 'high resolution qr code',
    'qr code api free', 'qr code generator no watermark', 'qr code maker no ads',
    'axom ai qr code', 'free qr code tool india', 'qr code for students',
    'qr code for teachers', 'qr code for small business',
  ],
  breadcrumbName: 'QR Code Generator',

  heroBadgeText: 'Free QR Code Generator — Customizable & Downloadable',
  heroHeadingPrefix: 'Generate',
  heroHeadingHighlight: 'Custom QR Codes',
  heroHeadingSuffix: 'Instantly Free',
  heroDescription:
    'Create QR codes for URLs, text, WiFi, UPI payments, vCard contacts, WhatsApp links & more. Customize colors, add your logo, and download in PNG or SVG — completely free, no signup required.',
  heroTags: ['URL, WiFi, UPI & vCard QR', 'Custom Colors & Logo', 'Download PNG/SVG', 'No Signup Required'],

  aeoTitle: 'What is Axom AI QR Code Generator?',
  aeoDescription:
    '<strong>Axom AI QR Code Generator</strong> is a free, browser-based tool that creates <strong>customizable QR codes</strong> for a wide range of data types: <strong>URLs, plain text, WiFi credentials, UPI payment addresses (GPay/PhonePe/Paytm), vCard contacts, WhatsApp messages, email addresses,</strong> and <strong>phone numbers</strong>. Customize your QR code with <strong>brand colors, logos, rounded corners,</strong> and different error correction levels. Download in <strong>high-resolution PNG</strong> (raster) or <strong>SVG</strong> (vector) formats. No watermark, no account required, no ads. Built on <strong>India\'s sovereign AI platform</strong> — perfect for businesses, shops, restaurants, events, and personal use.',
  aeoHighlights: ['UPI/GPay/PhonePe Ready', 'Custom Colors & Logo', 'PNG & SVG Export', 'No Signup or Watermark'],

  steps: [
    {
      title: 'Choose QR Type & Enter Data',
      description: 'Select the QR code type — URL, WiFi, UPI, vCard, WhatsApp, text, email, or phone — and enter the relevant information.',
    },
    {
      title: 'Customize Design',
      description: 'Pick foreground and background colors, add your logo or icon, adjust error correction level and corner radius for a branded look.',
    },
    {
      title: 'Download QR Code',
      description: 'Preview the QR code, verify it scans correctly, then download in high-resolution PNG or scalable SVG format.',
    },
  ],

  benefits: [
    { icon: <QrCode size={20} />, title: 'Multiple QR Types', description: 'Generate QR codes for URLs, WiFi, UPI payments, vCard contacts, WhatsApp, email, phone, and plain text — all in one tool.' },
    { icon: <Palette size={20} />, title: 'Full Customization', description: 'Customize colors, add logos, adjust corner radius, and set error correction levels for on-brand, scannable QR codes.' },
    { icon: <Download size={20} />, title: 'PNG & SVG Export', description: 'Download in high-resolution PNG for digital use or SVG for print materials that scale perfectly at any size.' },
    { icon: <CreditCard size={20} />, title: 'UPI Payment QR', description: 'Generate UPI payment QR codes for GPay, PhonePe, Paytm, and other UPI apps — perfect for Indian businesses and shops.' },
    { icon: <Zap size={20} />, title: 'Instant Generation', description: 'QR codes are generated in real-time as you type. No processing delays, no queues, no waiting.' },
    { icon: <Shield size={20} />, title: 'Free & Private', description: 'No signup, no watermark, no data storage. Your QR code data is processed locally and never sent to external servers.' },
  ],

  useCases: [
    { icon: <Store size={20} />, title: 'Shops & Restaurants', description: 'Create UPI payment QR codes for counters, WiFi QR for customers, and menu URL QR codes for contactless dining.', accent: 'purple' },
    { icon: <Building2 size={20} />, title: 'Business & Marketing', description: 'Generate branded QR codes with company logos for business cards, flyers, posters, product packaging, and event passes.', accent: 'fuchsia' },
    { icon: <GraduationCap size={20} />, title: 'Education & Events', description: 'Create QR codes for class resources, event registrations, feedback forms, attendance tracking, and digital portfolios.', accent: 'emerald' },
    { icon: <Smartphone size={20} />, title: 'Personal Use', description: 'Share WiFi passwords, contact details (vCard), WhatsApp links, and social media profiles effortlessly via QR codes.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Price', axom: 'Completely Free', other: 'Free with limits', paid: '$5–$25/month', axom_check: true, other_check: true },
    { feature: 'UPI Payment QR', axom: 'Full Support', other: 'Rarely supported', paid: 'Some support', axom_check: true, other_check: false },
    { feature: 'Custom Logo', axom: 'Free Logo Upload', other: 'Premium only', paid: 'Included', axom_check: true, other_check: false },
    { feature: 'SVG Export', axom: 'Free SVG Download', other: 'PNG only', paid: 'Included', axom_check: true, other_check: false },
    { feature: 'Watermark', axom: 'No Watermark', other: 'Often watermarked', paid: 'No watermark', axom_check: true, other_check: false },
    { feature: 'Account Required', axom: 'No Signup Needed', other: 'Usually required', paid: 'Required', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'QR Types', value: 'URL, Text, WiFi, UPI, vCard, WhatsApp, Email, Phone' },
    { label: 'Export Formats', value: 'PNG (high-res), SVG (vector)' },
    { label: 'Error Correction', value: 'L, M, Q, H (7%–30% recovery)' },
    { label: 'Customization', value: 'Colors, logo, corner radius, size' },
  ],

  regionalTitle: 'QR Code Generator Made for India',
  regionalDescription:
    'Axom AI QR Code Generator is designed for <strong>Indian businesses and users</strong>. Generate <strong>UPI payment QR codes</strong> for GPay, PhonePe, Paytm, and BHIM — essential for shops, restaurants, and street vendors across <strong>India</strong>. Create WiFi sharing QR codes, vCards in <strong>Hindi and Assamese</strong>, and branded marketing QR codes. Optimized for Indian mobile devices and network speeds. Part of <strong>India\'s sovereign AI platform</strong>.',
  regionalBadge: "🇮🇳 India's Free QR Code Platform",

  faqs: [
    { q: 'Is this QR code generator really free?', a: 'Yes, 100% free with no limits on the number of QR codes you can create. No signup, no watermark, no hidden charges.' },
    { q: 'Can I generate UPI payment QR codes?', a: 'Yes. Enter your UPI ID (e.g., name@upi) and optionally set an amount. The generated QR code works with GPay, PhonePe, Paytm, BHIM, and all UPI-compatible apps.' },
    { q: 'Can I add my company logo to the QR code?', a: 'Yes. Upload any logo or icon and it will be embedded in the center of the QR code. The error correction ensures the QR remains scannable.' },
    { q: 'What is QR code error correction?', a: 'Error correction allows a QR code to remain scannable even if partially damaged or obscured. Higher levels (Q, H) allow more of the code to be covered by a logo while staying readable.' },
    { q: 'Can I download the QR code as SVG?', a: 'Yes. SVG format gives you a scalable vector graphic that prints perfectly at any size — ideal for banners, business cards, and large posters.' },
    { q: 'How do I create a WiFi QR code?', a: 'Select the WiFi QR type, enter your network name (SSID), password, and encryption type (WPA/WPA2). Guests can scan the QR code to connect automatically.' },
    { q: 'Can I create a WhatsApp QR code?', a: 'Yes. Enter a phone number and optional pre-filled message. When scanned, it opens a WhatsApp chat with that number and message ready to send.' },
    { q: 'Do the QR codes expire?', a: 'No. Static QR codes generated by this tool never expire. They encode the data directly and work indefinitely as long as the destination (URL, UPI ID, etc.) remains valid.' },
    { q: 'Can I use Hindi or Assamese text in QR codes?', a: 'Yes. QR codes support full Unicode, so you can encode text in Hindi, Assamese, Bengali, or any other language.' },
    { q: 'Is my data stored when I generate a QR code?', a: 'No. QR codes are generated locally in your browser. No data is sent to or stored on our servers.' },
  ],

  ctaTitle: 'Create Your QR Code Now',
  ctaDescription: 'Generate free, customizable QR codes for URLs, WiFi, UPI, vCard & more. No signup, no watermark — download PNG or SVG instantly.',
  ctaPrimaryText: 'Generate QR Code',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI QR Code Generator',
  appAlternateNames: ['Free QR Code Maker', 'UPI QR Generator', 'WiFi QR Code Creator'],
  appDescription: 'Free QR code generator for URLs, WiFi, UPI payments, vCard, WhatsApp & more. Customize colors, add logos, download PNG/SVG.',
  appCategory: 'BusinessApplication, UtilitiesApplication',
  appFeatureList: ['URL, WiFi, UPI, vCard, WhatsApp QR codes', 'Custom colors and logo support', 'PNG and SVG export', 'Multiple error correction levels', 'No signup required', 'No watermark'],
  appRatingValue: '4.9',
  appReviewCount: '4120',
  howToSchemaName: 'How to Generate a QR Code',
  howToSchemaDescription: 'Create customizable QR codes for URLs, WiFi, UPI, vCard, and WhatsApp using Axom AI QR Code Generator.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI QR Code Generator',
};
