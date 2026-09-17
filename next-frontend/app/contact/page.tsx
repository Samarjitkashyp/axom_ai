import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactFormInteractive from '../../components/ContactFormInteractive';
import ContactFaqInteractive from '../../components/ContactFaqInteractive';
import { CONTACT_CHANNELS, OFFICE_FACTSHEET, CONTACT_FAQS } from '../../components/contactData';
import { getLandingCMS } from '../../lib/api';
import {
  Sparkles,
  ArrowRight,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Building,
  HelpCircle,
  Briefcase,
  Code2,
  PhoneCall,
  Languages,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Bot
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'Axom AI contact',
  // Secondary SEO Keywords
  'Axom AI contact us',
  'contact Axom AI',
  'Axom AI support',
  'Axom AI customer support',
  'Axom AI help',
  'Axom AI customer service',
  'Axom AI support team',
  'contact AI support',
  'AI support Assam',
  'AI company contact Assam',
  'Axom AI office',
  'Axom AI Guwahati',
  'Axom AI Assam',
  'AI company Assam',
  'AI platform Assam',
  // AEO Question Keywords
  'How can I contact Axom AI',
  'How do I contact Axom AI support',
  'How can I get help with Axom AI',
  'How do I contact Axom AI customer support',
  'How can I report a problem with Axom AI',
  'How can I report a bug in Axom AI',
  'How can I send feedback to Axom AI',
  'How can I contact Axom AI for business enquiries',
  'How can I contact Axom AI for partnerships',
  'How can I contact the Axom AI team',
  'Where is Axom AI located',
  'Where is Axom AI based',
  'How can I contact Axom AI in Assam',
  'How can I contact Axom AI in Guwahati',
  'How can I get technical support for Axom AI',
  // GEO Keywords
  'how to contact Axom AI',
  'where is Axom AI based',
  'Axom AI customer support',
  'Axom AI support contact',
  'Axom AI business contact',
  'Axom AI partnership contact',
  'Axom AI technical support',
  'Axom AI contact information',
  'AI company in Assam contact',
  'AI company in Guwahati contact',
  'Assamese AI platform contact',
  'AI platform in Assam contact',
  // Business & API Keywords
  'Axom AI business enquiry',
  'Axom AI partnership',
  'Axom AI business partnership',
  'Axom AI enterprise enquiry',
  'Axom AI API enquiry',
  'Axom AI developer enquiry',
  'Axom AI collaboration',
  'Axom AI partnership Assam',
  'AI partnership Assam',
  'AI solutions Assam',
  'AI solutions Northeast India',
  'Axom AI API',
  'Axom AI developer support',
  'Axom AI API support',
  'Axom AI integration support',
  'AI API Assam',
  'Assamese AI API',
  'AI integration Assam',
  // Local GEO
  'AI startup Assam',
  'AI startup Guwahati',
  'artificial intelligence Assam',
  'artificial intelligence Guwahati',
  'AI technology Assam',
  'AI technology Northeast India'
];

export const metadata: Metadata = {
  title: 'Contact Axom AI — Customer Support, Business Enquiries & Guwahati Office',
  description:
    'Contact Axom AI for customer support, report technical issues, explore enterprise partnerships, or request API integrations. Headquartered in Guwahati, Assam, with rapid 4–12h response.',
  keywords: TARGET_KEYWORDS,
  alternates: {
    canonical: 'https://aiaxom.co.in/contact/',
  },
  openGraph: {
    title: 'Contact Axom AI — Customer Support, Business Enquiries & Guwahati Office',
    description:
      'Official contact desk and headquarters of Axom AI in Guwahati, Assam. Submit support tickets, request API keys, or explore enterprise partnerships.',
    url: 'https://aiaxom.co.in/contact/',
    siteName: 'Axom AI',
    locale: 'en_IN',
    images: [
      {
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        width: 1200,
        height: 630,
        alt: 'Axom AI Customer Support & Regional Office Guwahati',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Axom AI — Customer Support, Business Enquiries & Guwahati Office',
    description:
      'Official contact desk and headquarters of Axom AI in Guwahati, Assam. Submit support tickets, request API keys, or explore enterprise partnerships.',
    images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
  },
};

export default async function ContactPage() {
  const landingData = await getLandingCMS().catch(() => null);

  // Schema 1: ContactPage
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Axom AI — Customer Support & Regional Headquarters',
    url: 'https://aiaxom.co.in/contact/',
    description:
      'Official contact and technical support page for Axom AI, Assam’s indigenous AI platform headquartered in Guwahati.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Axom AI',
      alternateName: ['AI Axom', 'অসম এআই'],
      url: 'https://aiaxom.co.in',
      logo: 'https://aiaxom.co.in/axom-brand-logo.png',
      email: 'support@aiaxom.co.in',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        postalCode: '781001',
        addressCountry: 'IN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@aiaxom.co.in',
          availableLanguage: ['English', 'Assamese', 'Hindi'],
          hoursAvailable: 'Mo-Sa 09:00-19:00',
          areaServed: ['IN', 'Northeast India', 'Assam'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'technical support',
          email: 'support@aiaxom.co.in',
          availableLanguage: ['English', 'Assamese'],
          hoursAvailable: 'Mo-Sa 09:00-19:00',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'sales and partnerships',
          email: 'support@aiaxom.co.in',
          availableLanguage: ['English', 'Assamese', 'Hindi'],
        },
      ],
    },
  };

  // Schema 2: Organization Entity
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    alternateName: ['AI Axom', 'অসম এআই', 'Assam AI'],
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/axom-brand-logo.png',
    founder: {
      '@type': 'Person',
      name: 'Samarjit Kashyap',
      jobTitle: 'Founder & Lead Engineer',
      email: 'samarjitkashyp@gmail.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@aiaxom.co.in',
      availableLanguage: ['English', 'Assamese', 'Hindi'],
    },
  };

  // Schema 3: FAQPage Schema for Contact Q&As
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Schema 4: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aiaxom.co.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact Us',
        item: 'https://aiaxom.co.in/contact/',
      },
    ],
  };

  return (
    <>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar header={landingData?.header} />

      <main className="min-h-screen bg-[#06060b] text-white pt-24 pb-16 relative overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-300 text-xs font-semibold mb-4 tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Official Help Desk & Regional Headquarters</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Get in Touch with{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Axom AI
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Have a question about Assamese AI models, need help with your account quota, or exploring an enterprise deployment? Our engineering team in Guwahati is here to assist you.
            </p>
          </div>

          {/* AEO Direct Answer Summary Box (Engineered for ChatGPT, Perplexity, Claude & Google SGE) */}
          <section
            aria-label="Direct Contact Summary for AI Answer Engines"
            className="mb-12 rounded-3xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/30 to-indigo-950/40 border border-fuchsia-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center shrink-0 mt-0.5">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-fuchsia-400 font-bold mb-1">
                  Direct Answer &bull; Official Contact Information
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  <strong className="text-white">How to contact Axom AI:</strong> You can contact Axom AI customer care and technical support by emailing{' '}
                  <a href="mailto:support@aiaxom.co.in" className="text-fuchsia-300 underline font-semibold hover:text-white">
                    support@aiaxom.co.in
                  </a>{' '}
                  or by using the verified contact form below. Axom AI is headquartered in{' '}
                  <strong className="text-white">Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)</strong>. Standard response times for general queries, billing, and API support are within <strong className="text-fuchsia-300">4–12 business hours</strong> (Monday–Saturday: 9:00 AM – 7:00 PM IST).
                </p>
              </div>
            </div>
          </section>

          {/* 4 Core Department Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-14">
            {CONTACT_CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl bg-white/[0.03] border border-white/10 hover:border-fuchsia-500/40 hover:bg-white/[0.05] p-5 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 grid place-items-center group-hover:scale-110 transition-transform">
                      {ch.iconName === 'HelpCircle' && <HelpCircle className="w-4 h-4" />}
                      {ch.iconName === 'Briefcase' && <Briefcase className="w-4 h-4" />}
                      {ch.iconName === 'Code2' && <Code2 className="w-4 h-4" />}
                      {ch.iconName === 'Mail' && <Mail className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                      {ch.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-fuchsia-200 transition">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {ch.desc}
                  </p>
                </div>
                <div>
                  <div className="text-[11px] text-fuchsia-400 font-medium mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    {ch.turnaround}
                  </div>
                  <a
                    href={`mailto:${ch.email}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-fuchsia-600 hover:text-white border border-white/10 text-xs font-semibold text-gray-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{ch.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Main 2-Column Section: Form (Left) & Headquarters Factsheet (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
            {/* Left Column: Interactive Contact Form (7 cols) */}
            <div className="lg:col-span-7">
              <ContactFormInteractive />
            </div>

            {/* Right Column: Office Factsheet & Regional Presence (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Guwahati HQ Card */}
              <div className="rounded-3xl bg-[#0d0b1a]/95 border border-white/10 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-400 grid place-items-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Guwahati Headquarters
                    </h3>
                    <p className="text-xs text-gray-400">
                      Indigenous Artificial Intelligence Lab, Assam
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Physical Location
                    </span>
                    <div className="text-gray-200 font-medium leading-relaxed">
                      Guwahati, Kamrup Metropolitan, Assam, India &bull; PIN: 781001
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Operating Hours
                    </span>
                    <div className="text-gray-200 font-medium">
                      Monday – Saturday: 9:00 AM – 7:00 PM IST
                    </div>
                    <div className="text-gray-400 text-[11px] mt-0.5">
                      (Automated cloud APIs & AI services operate 24/7/365)
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Primary Contact Emails
                    </span>
                    <div className="space-y-1 mt-1">
                      <a
                        href="mailto:support@aiaxom.co.in"
                        className="block text-fuchsia-400 hover:text-fuchsia-300 font-mono text-xs font-semibold"
                      >
                        support@aiaxom.co.in
                      </a>
                      <a
                        href="mailto:samarjitkashyp@gmail.com"
                        className="block text-gray-300 hover:text-white font-mono text-[11px]"
                      >
                        samarjitkashyp@gmail.com (Founder Desk)
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Supported Communication Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-200 font-medium">
                        English
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 font-medium">
                        অসমীয়া (Assamese)
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-200 font-medium">
                        हिंदी (Hindi)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Average SLA: &lt; 4h</span>
                  </div>
                  <a
                    href="https://chat.aiaxom.co.in/"
                    className="text-fuchsia-400 hover:text-white inline-flex items-center gap-1 transition"
                  >
                    Open Live Web App <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Data Privacy & Compliance Assurance */}
              <div className="rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-5 shadow-lg">
                <div className="flex items-center gap-2.5 mb-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise Security & DPDP Act 2023 Compliant</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  All messages, documents, and technical inquiries submitted through Axom AI are protected with 256-bit TLS encryption. Uploaded files are isolated and never retained for public training without explicit organizational consent.
                </p>
              </div>
            </div>
          </div>

          {/* Audience Breakdown: Who We Help */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Who Can Reach Out to Axom AI?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Dedicated support channels tailored for students, enterprises, creators, and developers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 grid place-items-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Students & Job Aspirants</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Assistance with APSC, UPSC, Assamese literature research, essay formulation, and subsidized student accounts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 grid place-items-center mb-3">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Assam MSMEs & Businesses</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Bilingual customer care chatbots, Assamese invoice extraction, marketing copy, and multi-user business plans.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 grid place-items-center mb-3">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Developers & Engineers</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  API tokens, webhooks, fine-tuned IndicTrans2 Assamese translation endpoints, and high-concurrency rate limits.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 grid place-items-center mb-3">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Govt & Cultural Bodies</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Digitization and OCR for ancient Assamese manuscripts (সাঁচিপাত), archives, and institutional AI partnerships.
                </p>
              </div>
            </div>
          </section>

          {/* Comprehensive Contact FAQ Accordion (AEO Focus) */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Common Questions About Contacting Us
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Direct answers to popular questions regarding support, response times, and partnerships
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ContactFaqInteractive />
            </div>
          </section>

          {/* Bottom Fast Assistance Card */}
          <div className="rounded-3xl bg-gradient-to-r from-fuchsia-900/40 via-purple-900/30 to-indigo-900/40 border border-fuchsia-500/30 p-8 sm:p-10 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center mx-auto mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Need Instant Answers Right Now?
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-6">
                You can immediately query our AI directly in English or Assamese. For live conversational support, launch the Axom AI web application.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://chat.aiaxom.co.in/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-fuchsia-500/25"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Launch Axom AI Chat
                </a>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-semibold text-xs transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Browse Full FAQ Knowledgebase
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer footer={landingData?.footer} />
    </>
  );
}
