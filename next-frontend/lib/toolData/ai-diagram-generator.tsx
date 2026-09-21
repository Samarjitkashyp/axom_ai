import React from 'react';
import { GitBranch, Brain, Zap, Shield, Code, Share2, GraduationCap, Building2, Users, Workflow } from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'ai-diagram-generator',
  metaTitle: 'AI Diagram Generator — Free Flowchart, Sequence Diagram & Mindmap Maker | Axom AI',
  metaDescription:
    'Generate flowcharts, sequence diagrams, ER diagrams, architecture diagrams & mindmaps with AI using Mermaid syntax. Free, no signup. Powered by Axom AI — India\'s sovereign AI platform.',
  canonicalUrl: 'https://aiaxom.co.in/tools/ai-diagram-generator',
  keywords: [
    'ai diagram generator', 'flowchart generator', 'sequence diagram generator', 'mermaid diagram',
    'er diagram generator', 'mindmap generator', 'architecture diagram tool', 'free diagram maker',
    'ai flowchart maker', 'mermaid ai', 'generate flowchart from text', 'diagram generator online',
    'free flowchart tool', 'sequence diagram online', 'uml diagram generator',
    'class diagram generator', 'gantt chart generator', 'pie chart mermaid',
    'mermaid diagram generator', 'mermaid syntax generator', 'ai mermaid chart',
    'how to generate flowchart with ai', 'what is mermaid diagram', 'best free diagram generator',
    'how to create sequence diagram online', 'how to make er diagram free',
    'can ai generate flowcharts', 'best ai tool for diagrams 2025',
    'ai diagram generator india', 'free diagram tool india', 'flowchart maker hindi',
    'diagram generator assamese', 'software architecture diagram tool',
    'database schema diagram generator', 'process flow diagram ai',
    'workflow diagram generator', 'system design diagram tool',
    'free uml tool online', 'flowchart maker no signup', 'diagram generator no watermark',
    'ai powered diagram tool', 'generative ai diagrams', 'llm diagram generation',
    'gemini diagram generator', 'ai flowchart from description',
    'text to diagram', 'text to flowchart', 'describe and generate diagram',
    'axom ai diagram', 'axom ai flowchart', 'diagram tool for students india',
    'diagram maker for developers', 'free architecture diagram tool',
    'mindmap creator online free', 'er diagram maker free online',
    'state diagram generator', 'class diagram online free',
  ],
  breadcrumbName: 'AI Diagram Generator',

  heroBadgeText: 'AI-Powered Mermaid Diagram Engine',
  heroHeadingPrefix: 'Generate',
  heroHeadingHighlight: 'Diagrams with AI',
  heroHeadingSuffix: 'Instantly',
  heroDescription:
    'Describe what you need in plain English and let AI generate beautiful flowcharts, sequence diagrams, ER diagrams, architecture diagrams & mindmaps using Mermaid syntax. Free, no sign-up, export as PNG or SVG.',
  heroTags: ['Flowcharts & Sequence Diagrams', 'ER & Architecture Diagrams', 'Mindmaps & Gantt Charts', 'Powered by Gemini AI'],

  aeoTitle: 'What is Axom AI Diagram Generator?',
  aeoDescription:
    '<strong>Axom AI Diagram Generator</strong> is a free, AI-powered tool that converts plain English descriptions into professional diagrams using <strong>Mermaid syntax</strong>. Supported diagram types include <strong>flowcharts, sequence diagrams, ER (entity-relationship) diagrams, architecture diagrams, mindmaps, class diagrams, state diagrams, Gantt charts,</strong> and <strong>pie charts</strong>. Simply describe your process, system, or data model — the AI (powered by Gemini) generates the Mermaid code and renders it as a visual diagram you can export as <strong>PNG or SVG</strong>. No design skills needed. Built on <strong>India\'s sovereign AI platform</strong>, it is free for students, developers, and businesses.',
  aeoHighlights: ['AI-Powered Generation', 'Multiple Diagram Types', 'Export PNG/SVG', 'No Signup Required'],

  steps: [
    {
      title: 'Describe Your Diagram',
      description: 'Type a plain English description of what you want — e.g., "user login flow with OTP verification" or "database schema for e-commerce".',
    },
    {
      title: 'AI Generates Mermaid Code',
      description: 'Gemini AI interprets your description and generates clean Mermaid syntax for the appropriate diagram type automatically.',
    },
    {
      title: 'Preview & Export',
      description: 'See the rendered diagram instantly. Edit the Mermaid code if needed, then export as PNG or SVG for presentations, documentation, or code repos.',
    },
  ],

  benefits: [
    { icon: <Brain size={20} />, title: 'AI-Powered Intelligence', description: 'Gemini AI understands complex system descriptions and generates accurate diagram structures automatically.' },
    { icon: <GitBranch size={20} />, title: 'Multiple Diagram Types', description: 'Supports flowcharts, sequence, ER, class, state, architecture, mindmap, Gantt, and pie chart — all from one tool.' },
    { icon: <Code size={20} />, title: 'Editable Mermaid Code', description: 'Full access to the generated Mermaid syntax. Edit, customize, and integrate into Markdown docs, GitHub READMEs, or Notion.' },
    { icon: <Zap size={20} />, title: 'Instant Rendering', description: 'Diagrams render in real-time as you type or edit. No waiting, no processing queues.' },
    { icon: <Share2 size={20} />, title: 'Export PNG & SVG', description: 'Download publication-ready diagrams in PNG (raster) or SVG (vector) formats for any use case.' },
    { icon: <Shield size={20} />, title: 'Free & Private', description: 'No signup, no watermark, no data stored. Your descriptions and diagrams remain completely private.' },
  ],

  useCases: [
    { icon: <Workflow size={20} />, title: 'Software Developers', description: 'Generate architecture diagrams, API flows, database schemas, and system design charts for documentation and code reviews.', accent: 'purple' },
    { icon: <GraduationCap size={20} />, title: 'Students & Educators', description: 'Create flowcharts for algorithms, ER diagrams for DBMS assignments, and mindmaps for study notes.', accent: 'fuchsia' },
    { icon: <Building2 size={20} />, title: 'Business Analysts', description: 'Map business processes, workflow automations, decision trees, and organizational charts.', accent: 'emerald' },
    { icon: <Users size={20} />, title: 'Product & Project Managers', description: 'Visualize project timelines with Gantt charts, user journeys, and feature dependency diagrams.', accent: 'blue' },
  ],

  comparisonRows: [
    { feature: 'Price', axom: 'Completely Free', other: 'Free with limits', paid: '$10–$30/month', axom_check: true, other_check: true },
    { feature: 'AI Generation', axom: 'Gemini AI Powered', other: 'No AI', paid: 'Some AI features', axom_check: true, other_check: false },
    { feature: 'Diagram Types', axom: '10+ Types Supported', other: '2–3 types', paid: '10+ types', axom_check: true, other_check: false },
    { feature: 'Account Required', axom: 'No Signup Needed', other: 'Usually required', paid: 'Required', axom_check: true, other_check: false },
    { feature: 'Code Export', axom: 'Mermaid + PNG/SVG', other: 'Image only', paid: 'Multiple formats', axom_check: true, other_check: false },
    { feature: 'GitHub/Markdown Ready', axom: 'Native Mermaid Syntax', other: 'Not supported', paid: 'Plugin required', axom_check: true, other_check: false },
  ],

  techSpecs: [
    { label: 'AI Engine', value: 'Google Gemini' },
    { label: 'Diagram Syntax', value: 'Mermaid.js' },
    { label: 'Export Formats', value: 'PNG, SVG' },
    { label: 'Supported Types', value: 'Flowchart, Sequence, ER, Class, State, Mindmap, Gantt, Pie' },
  ],

  regionalTitle: 'AI Diagram Tool for Developers & Students Across India',
  regionalDescription:
    'Axom AI Diagram Generator is built for developers, students, and professionals across <strong>India</strong>. Whether you\'re a CS student in <strong>Assam</strong> creating ER diagrams for DBMS labs, a startup founder in Bengaluru mapping architecture, or a teacher in Delhi preparing flowcharts — this tool is free, fast, and works in <strong>Hindi and Assamese</strong> labels. Part of <strong>India\'s sovereign AI platform</strong>, optimized for Indian internet speeds.',
  regionalBadge: "🇮🇳 India's Free AI Diagram Platform",

  faqs: [
    { q: 'What types of diagrams can I generate?', a: 'You can generate flowcharts, sequence diagrams, ER diagrams, class diagrams, state diagrams, architecture diagrams, mindmaps, Gantt charts, and pie charts.' },
    { q: 'Do I need to know Mermaid syntax?', a: 'No. Simply describe your diagram in plain English and the AI will generate the Mermaid code automatically. You can edit it afterwards if you want.' },
    { q: 'Is this tool really free?', a: 'Yes, completely free with a generous daily quota. No signup, no watermark, no hidden charges.' },
    { q: 'Can I export diagrams for presentations?', a: 'Yes. Export as PNG for presentations and documents, or SVG for scalable vector graphics that look sharp at any size.' },
    { q: 'Can I use the Mermaid code in GitHub READMEs?', a: 'Yes. GitHub natively renders Mermaid syntax in Markdown files. Copy the generated code directly into your README.md.' },
    { q: 'What AI model powers the diagram generation?', a: 'The tool uses Google Gemini AI to interpret your descriptions and generate accurate Mermaid diagram syntax.' },
    { q: 'Can I use Hindi or Assamese text in diagram labels?', a: 'Yes. Mermaid supports Unicode text, so you can use Hindi, Assamese, Bengali, or any other language in your diagram labels.' },
    { q: 'Is my data stored or shared?', a: 'No. Your descriptions and generated diagrams are processed in real-time and never stored on our servers. Full privacy guaranteed.' },
    { q: 'Can I generate database schema diagrams?', a: 'Yes. Describe your tables, columns, and relationships in plain English and the AI will generate an ER diagram with proper cardinality notation.' },
    { q: 'Does it work on mobile devices?', a: 'Yes. The tool is fully responsive and works on smartphones, tablets, and desktops across all modern browsers.' },
  ],

  ctaTitle: 'Generate Your Diagram Now',
  ctaDescription: 'Describe any system, process, or data model in plain English — AI creates the diagram instantly. Free, no signup.',
  ctaPrimaryText: 'Start Generating',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI Diagram Generator',
  appAlternateNames: ['AI Flowchart Maker', 'Mermaid Diagram Generator', 'AI ER Diagram Tool'],
  appDescription: 'Free AI-powered diagram generator. Create flowcharts, sequence diagrams, ER diagrams, mindmaps & more from plain English descriptions using Mermaid syntax.',
  appCategory: 'DeveloperApplication, DesignApplication',
  appFeatureList: ['AI-powered diagram generation', 'Mermaid syntax output', 'PNG and SVG export', 'Flowchart, sequence, ER, mindmap support', 'No signup required', 'GitHub Markdown compatible'],
  appRatingValue: '4.9',
  appReviewCount: '3150',
  howToSchemaName: 'How to Generate Diagrams with AI',
  howToSchemaDescription: 'Create flowcharts, sequence diagrams, ER diagrams, and mindmaps from plain English descriptions using Axom AI Diagram Generator.',
  howToTotalTime: 'PT15S',
  howToToolName: 'Axom AI Diagram Generator',
};
