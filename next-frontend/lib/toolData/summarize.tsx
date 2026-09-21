import React from 'react';
import { FileText, Shield, Zap, Brain, Globe, Layers, GraduationCap, Landmark, Building2, Newspaper } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'summarize',
  metaTitle: 'AI Summarize - Summarize Documents & Text in Assamese, English, Hindi | Axom AI',
  metaDescription: 'Summarize any document or text with AI. Choose short, medium, or detailed summaries in Assamese, English, or Hindi. Free, fast, no signup. Powered by Axom AI.',
  canonicalUrl: 'https://aiaxom.co.in/tools/summarize',
  keywords: [
    'ai summarize', 'text summarizer', 'document summarizer', 'ai summary tool',
    'summarize text online', 'summarize pdf', 'summarize article', 'ai summarizer free',
    'text summary generator', 'automatic summarization', 'document summary ai',
    'summarize in assamese', 'summarize in hindi', 'assamese summary tool',
    'hindi summarizer online', 'multilingual summarizer', 'indian language summarizer',
    'summarize document free', 'ai text summarizer online', 'free summarizer no signup',
    'how to summarize a document with ai', 'what is ai summarization',
    'best free summarizer tool', 'summarize long text', 'summarize research paper',
    'summarize legal document', 'summarize news article', 'ai summary generator',
    'short summary ai', 'detailed summary ai', 'medium summary ai',
    'summarize in assamese language', 'summarize in hindi language',
    'summarizer for students', 'summarizer for researchers', 'summarizer india',
    'summarize text assam', 'summarize text guwahati', 'ai summarizer northeast india',
    'abstract generator', 'key points extractor', 'main ideas summarizer',
    'condensed summary tool', 'executive summary generator', 'tldr generator',
    'summarize meeting notes', 'summarize report', 'summarize book chapter',
    'ai content summarizer', 'smart summarizer', 'nlp summarizer',
    'extractive summarizer', 'abstractive summarizer', 'ai powered summary',
    'summarize text mobile', 'browser based summarizer', 'instant text summary'
  ],
  breadcrumbName: 'AI Summarize',

  heroBadgeText: 'AI-Powered Summarization',
  heroHeadingPrefix: 'Summarize Any',
  heroHeadingHighlight: 'Document or Text',
  heroHeadingSuffix: 'with AI',
  heroDescription: 'Generate short, medium, or detailed AI summaries of any document or text. Supports Assamese, English & Hindi output. Perfect for students, researchers, and professionals.',
  heroTags: ['Short / Medium / Detailed Modes', 'Assamese, English & Hindi', '100% Free', 'No Signup Required'],

  aeoTitle: 'What is AI Summarize?',
  aeoDescription: `<strong>AI Summarize</strong> by Axom AI uses advanced natural language processing to condense lengthy documents, articles, and text into clear, concise summaries. Choose from <strong>three summary modes — short (key points), medium (balanced), or detailed (comprehensive)</strong> — and get output in <strong>Assamese (অসমীয়া), English, or Hindi (हिन्दी)</strong>. The AI understands context, identifies key themes, and produces coherent summaries that capture the essence of the original content. Ideal for summarizing research papers, news articles, legal documents, government circulars, meeting notes, and study materials. Free to use, no registration required.`,
  aeoHighlights: ['3 Summary Lengths', 'Assamese & Hindi Output', 'AI-Powered Accuracy', 'Free & Instant'],

  steps: [
    { title: 'Paste Text or Upload Document', description: 'Paste your text directly or upload a document (PDF, DOCX). Supports lengthy content up to thousands of words.', accent: 'purple' },
    { title: 'Choose Summary Mode & Language', description: 'Select short, medium, or detailed summary length. Pick your output language — Assamese, English, or Hindi.', accent: 'fuchsia' },
    { title: 'Get Your AI Summary', description: 'Receive a well-structured, accurate summary in seconds. Copy, download, or share the summarized content instantly.', accent: 'emerald' },
  ],

  benefits: [
    { icon: <Layers size={20} />, title: 'Three Summary Modes', description: 'Choose short (bullet points), medium (balanced paragraphs), or detailed (comprehensive overview) based on your needs.' },
    { icon: <Globe size={20} />, title: 'Multilingual Output', description: 'Get summaries in Assamese (অসমীয়া), English, or Hindi (हिन्दी). Summarize English content and get output in Assamese or Hindi.' },
    { icon: <Brain size={20} />, title: 'Contextual Understanding', description: 'AI goes beyond extracting sentences — it understands context, themes, and relationships to produce coherent, meaningful summaries.' },
    { icon: <Zap size={20} />, title: 'Instant Processing', description: 'Get summaries in seconds, even for lengthy documents. No waiting, no queue — just paste and summarize.' },
    { icon: <Shield size={20} />, title: 'Privacy Protected', description: 'Your text and documents are processed securely and never stored. Your content stays confidential.' },
    { icon: <FileText size={20} />, title: 'Multiple Input Formats', description: 'Paste plain text, upload PDFs, or provide documents. The AI handles various input formats seamlessly.' },
  ],

  useCases: [
    { icon: <GraduationCap size={20} />, title: 'Students & Study Notes', description: 'Summarize lengthy textbook chapters, lecture notes, and study materials into concise revision notes for exam preparation.', accent: 'purple' },
    { icon: <Newspaper size={20} />, title: 'News & Article Digests', description: 'Quickly summarize news articles, blog posts, and online content. Stay informed without reading every word.', accent: 'emerald' },
    { icon: <Landmark size={20} />, title: 'Legal & Government Documents', description: 'Condense lengthy legal briefs, government policies, and regulatory documents into actionable summaries.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Business Reports & Meetings', description: 'Summarize meeting transcripts, quarterly reports, and business proposals for quick decision-making.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Assamese Summary Output', axom: 'Full অসমীয়া support', other: 'Not available', paid: 'Rarely supported', axom_check: true, other_check: false },
    { feature: 'Hindi Summary Output', axom: 'High quality', other: 'Poor quality', paid: 'Available', axom_check: true, other_check: false },
    { feature: 'Summary Length Options', axom: 'Short / Medium / Detailed', other: 'One size only', paid: 'Usually 2 modes', axom_check: true, other_check: false },
    { feature: 'Free Daily Usage', axom: 'Generous free quota', other: '1-2 summaries', paid: 'From $15/mo', axom_check: true, other_check: false },
    { feature: 'No Signup Required', axom: 'Instant access', other: 'Often requires account', paid: 'Account required', axom_check: true, other_check: false },
    { feature: 'Document Upload Support', axom: 'PDF & text', other: 'Text only', paid: 'Multiple formats', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Engine', value: 'Google Gemini + IndicTrans2' },
    { label: 'Output Languages', value: 'Assamese, English, Hindi' },
    { label: 'Summary Modes', value: 'Short, Medium, Detailed' },
    { label: 'Max Input Length', value: '50,000+ words' },
  ],

  regionalTitle: 'AI Summarization in Assamese, Hindi & English',
  regionalDescription: `Axom AI brings <strong>AI-powered summarization to India</strong> with native <strong>Assamese (অসমীয়া) and Hindi (हिन्दी)</strong> output support. Students in Assam can summarize English textbooks and get summaries in Assamese. Government officials can condense lengthy Hindi circulars. Researchers can create quick abstracts in English. Built on Indian infrastructure with <strong>IndicTrans2 translation</strong> for accurate multilingual output. Serving users across Guwahati, Assam, and all of India.`,
  regionalBadge: "India's Multilingual AI Summarizer",

  faqs: [
    { q: 'What types of content can I summarize?', a: 'You can summarize virtually any text content — research papers, news articles, legal documents, textbook chapters, meeting notes, blog posts, government circulars, and more. Paste text directly or upload a PDF document.' },
    { q: 'Can I get summaries in Assamese?', a: 'Yes! Axom AI supports Assamese (অসমীয়া) summary output. You can summarize English or Hindi content and receive the summary in Assamese, making it one of the few AI tools with Assamese language support.' },
    { q: 'What is the difference between short, medium, and detailed summaries?', a: 'Short summaries give you bullet-point key takeaways (ideal for quick scanning). Medium summaries provide balanced paragraphs covering main ideas. Detailed summaries offer comprehensive overviews that preserve important nuances and supporting details.' },
    { q: 'How accurate are the AI summaries?', a: 'The AI uses advanced language models to understand context and meaning, producing highly accurate summaries. It identifies key themes, main arguments, and critical details while maintaining the original content\'s intent.' },
    { q: 'Is there a word or page limit?', a: 'You can summarize content up to 50,000+ words. For very long documents, the AI processes the content efficiently and delivers summaries within seconds.' },
    { q: 'Is my content kept private?', a: 'Yes. Your text and documents are processed securely and never stored permanently on our servers. We do not use your content for training or share it with third parties.' },
    { q: 'Can I summarize content in one language and get output in another?', a: 'Yes! Cross-language summarization is supported. For example, you can input an English research paper and get the summary in Hindi or Assamese.' },
    { q: 'Is this tool free?', a: 'Yes, AI Summarize is completely free with a generous daily quota. No signup, no credit card, and no premium paywall for basic summarization features.' },
    { q: 'Can I use this for academic or professional work?', a: 'Absolutely. Many students, researchers, lawyers, and business professionals use Axom AI Summarize daily for academic papers, legal briefs, business reports, and more.' },
    { q: 'Does it work on mobile devices?', a: 'Yes, the summarizer is fully responsive and works on all devices — smartphones, tablets, laptops, and desktops — without any app installation.' },
  ],

  ctaTitle: 'Summarize Any Document with AI Now',
  ctaDescription: 'Get instant AI summaries in Assamese, English, or Hindi. Free, fast, and private.',
  ctaPrimaryText: 'Try AI Summarize Free',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Summarize',
  appAlternateNames: ['Axom AI Summary Tool', 'Assamese Summarizer', 'AI Text Summarizer India'],
  appDescription: 'Free AI-powered summarization tool. Summarize documents and text in short, medium, or detailed mode. Output in Assamese, English, or Hindi.',
  appCategory: 'BusinessApplication, EducationalApplication',
  appFeatureList: ['Short/Medium/Detailed modes', 'Assamese output', 'Hindi output', 'English output', 'Cross-language summarization', 'PDF upload support', 'Free daily quota', 'No signup required'],
  appRatingValue: '4.9',
  appReviewCount: '4210',
  howToSchemaName: 'How to Summarize Documents with AI',
  howToSchemaDescription: 'Paste text or upload a document, choose summary length and language, and get an AI-generated summary instantly.',
  howToTotalTime: 'PT10S',
  howToToolName: 'Axom AI Summarize Tool',
};
