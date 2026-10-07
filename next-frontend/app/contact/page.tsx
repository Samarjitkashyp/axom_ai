import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactFormInteractive from '../../components/ContactFormInteractive';
import ContactFaqInteractive from '../../components/ContactFaqInteractive';
import { CONTACT_CHANNELS, OFFICE_FACTSHEET, CONTACT_FAQS } from '../../components/contactData';
import { getLandingCMS, getContactCMS } from '../../lib/api';
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

const DEFAULT_KEYWORDS = [
  'Axom AI contact',
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
  'How can I contact Axom AI',
  'Where is Axom AI located',
  'How can I contact Axom AI in Assam',
  'How can I contact Axom AI in Guwahati',
  'how to contact Axom AI',
  'where is Axom AI based',
  'Axom AI technical support',
  'Axom AI contact information',
  'AI startup Assam',
  'AI startup Guwahati'
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getContactCMS().catch(() => null);

  const title = cms?.meta_title || 'Contact Axom AI — Customer Support, Business Enquiries & Guwahati Office';
  const description = cms?.meta_description || 'Contact Axom AI for customer support, report technical issues, explore enterprise partnerships, or request API integrations. Headquartered in Guwahati, Assam, with rapid 4–12h response.';
  const keywords = cms?.meta_keywords ? cms.meta_keywords.split(',').map((k) => k.trim()) : DEFAULT_KEYWORDS;
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: 'https://aiaxom.co.in/contact/',
    },
    openGraph: {
      title,
      description,
      url: 'https://aiaxom.co.in/contact/',
      siteName: 'Axom AI',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom AI Customer Support & Regional Office Guwahati',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

function renderChannelIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'helpcircle':
    case 'help-circle':
      return <HelpCircle className="w-4 h-4" />;
    case 'briefcase':
      return <Briefcase className="w-4 h-4" />;
    case 'code2':
    case 'code':
      return <Code2 className="w-4 h-4" />;
    case 'mail':
    case 'envelope':
      return <Mail className="w-4 h-4" />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
}

function renderAudienceIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'briefcase':
      return <Briefcase className="w-4 h-4" />;
    case 'code2':
    case 'code':
      return <Code2 className="w-4 h-4" />;
    case 'building':
    case 'building2':
      return <Building className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

export default async function ContactPage() {
  const [landingData, contactCMS] = await Promise.all([
    getLandingCMS().catch(() => null),
    getContactCMS().catch(() => null)
  ]);

  // Channels List with CMS fallback
  const channelsList = contactCMS?.channels && contactCMS.channels.length > 0
    ? contactCMS.channels.map((ch) => ({
        id: ch.channelId || `channel-${ch.id}`,
        title: ch.title,
        badge: ch.badge,
        email: ch.email,
        desc: ch.desc,
        turnaround: ch.turnaround,
        iconName: ch.iconName,
      }))
    : CONTACT_CHANNELS;

  // FAQs with CMS fallback
  const faqsList = contactCMS?.faqs && contactCMS.faqs.length > 0
    ? contactCMS.faqs.map((f, i) => ({
        id: String(f.id ?? `faq-${i}`),
        question: f.question,
        answer: f.answer,
        category: f.category || 'General & Support',
      }))
    : CONTACT_FAQS;

  // Schema 1: ContactPage
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: contactCMS?.meta_title || 'Contact Axom AI — Customer Support & Regional Headquarters',
    url: 'https://aiaxom.co.in/contact/',
    description:
      contactCMS?.meta_description || 'Official contact and technical support page for Axom AI, Assam’s indigenous AI platform headquartered in Guwahati.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Axom AI',
      alternateName: ['AI Axom', 'অসম এআই'],
      url: 'https://aiaxom.co.in',
      logo: 'https://aiaxom.co.in/axom-brand-logo.png',
      email: contactCMS?.primary_support_email || 'support@aiaxom.co.in',
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
          email: contactCMS?.primary_support_email || 'support@aiaxom.co.in',
          availableLanguage: ['English', 'Assamese', 'Hindi'],
          hoursAvailable: 'Mo-Sa 09:00-19:00',
          areaServed: ['IN', 'Northeast India', 'Assam'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'technical support',
          email: contactCMS?.primary_support_email || 'support@aiaxom.co.in',
          availableLanguage: ['English', 'Assamese'],
          hoursAvailable: 'Mo-Sa 09:00-19:00',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'sales and partnerships',
          email: contactCMS?.primary_support_email || 'support@aiaxom.co.in',
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
      email: contactCMS?.founder_email || 'samarjitkashyp@gmail.com',
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
      email: contactCMS?.primary_support_email || 'support@aiaxom.co.in',
      availableLanguage: ['English', 'Assamese', 'Hindi'],
    },
  };

  // Schema 3: FAQPage Schema for Contact Q&As
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsList.map((faq) => ({
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

  // Office languages array
  const officeLanguagesList = (contactCMS?.office_languages || 'English, অসমীয়া (Assamese), हिंदी (Hindi)')
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);

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

      <main className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-emerald-950 dark:text-white pt-24 pb-16 relative overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold mb-4 tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-700 dark:text-fuchsia-400" />
              <span>{contactCMS?.hero_badge_text || 'Official Help Desk & Regional Headquarters'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-950 dark:text-white mb-4">
              {contactCMS?.hero_title_prefix || 'Get in Touch with'}{' '}
              <span className="bg-gradient-to-r from-fuchsia-600 dark:from-fuchsia-400 via-purple-600 dark:via-purple-300 to-indigo-600 dark:to-indigo-300 bg-clip-text text-transparent">
                {contactCMS?.hero_title_highlight || 'Axom AI'}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed">
              {contactCMS?.hero_subtitle || 'Have a question about Assamese AI models, need help with your account quota, or exploring an enterprise deployment? Our engineering team in Guwahati is here to assist you.'}
            </p>
          </div>

          {/* AEO Direct Answer Summary Box */}
          <section
            aria-label="Direct Contact Summary for AI Answer Engines"
            className="mb-12 rounded-3xl bg-gradient-to-r from-fuchsia-100/40 dark:from-fuchsia-950/40 via-purple-100/30 dark:via-purple-950/30 to-indigo-100/40 dark:to-indigo-950/40 border border-fuchsia-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 grid place-items-center shrink-0 mt-0.5">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-400 font-bold mb-1">
                  {contactCMS?.aeo_badge || 'Direct Answer • Official Contact Information'}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 leading-relaxed">
                  <strong className="text-emerald-950 dark:text-white">{contactCMS?.aeo_how_to_contact_title || 'How to contact Axom AI:'}</strong>{' '}
                  {contactCMS?.aeo_description || (
                    <>
                      You can contact Axom AI customer care and technical support by emailing{' '}
                      <a href={`mailto:${contactCMS?.primary_support_email || 'support@aiaxom.co.in'}`} className="text-fuchsia-700 dark:text-fuchsia-300 underline font-semibold hover:text-emerald-950 dark:hover:text-white">
                        {contactCMS?.primary_support_email || 'support@aiaxom.co.in'}
                      </a>{' '}
                      or by using the verified contact form below. Axom AI is headquartered in{' '}
                      <strong className="text-emerald-950 dark:text-white">{contactCMS?.office_location || 'Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)'}</strong>. Standard response times for general queries, billing, and API support are within <strong className="text-fuchsia-700 dark:text-fuchsia-300">4–12 business hours</strong> ({contactCMS?.office_hours || 'Monday–Saturday: 9:00 AM – 7:00 PM IST'}).
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Department Channels Grid Header */}
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{contactCMS?.channels_badge || 'Direct Response Channels'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-white tracking-tight">
              {contactCMS?.channels_title || 'Choose Your Dedicated Support Department'}
            </h2>
          </div>

          {/* Department Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-14">
            {channelsList.map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl bg-white/[0.03] border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 hover:bg-white/[0.05] p-5 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400 grid place-items-center group-hover:scale-110 transition-transform">
                      {renderChannelIcon(ch.iconName)}
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-emerald-900/15 dark:border-white/10">
                      {ch.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-1.5 group-hover:text-fuchsia-800 dark:group-hover:text-fuchsia-200 transition">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    {ch.desc}
                  </p>
                </div>
                <div>
                  <div className="text-[11px] text-fuchsia-700 dark:text-fuchsia-400 font-medium mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    {ch.turnaround}
                  </div>
                  <a
                    href={`mailto:${ch.email}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-fuchsia-600 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 transition"
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
            <div className="lg:col-span-7 space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-emerald-950 dark:text-white">
                  {contactCMS?.form_title || 'Send an Official Message'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  {contactCMS?.form_subtitle || 'Directly logged with our Guwahati headquarters & customer care desk'}
                </p>
              </div>
              <ContactFormInteractive />
            </div>

            {/* Right Column: Office Factsheet & Regional Presence (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Guwahati HQ Card */}
              <div className="rounded-3xl bg-[#f0fdf4]/95 dark:bg-[#0b1220]/95 border border-emerald-900/15 dark:border-white/10 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-900/15 dark:border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-700 dark:text-fuchsia-400 grid place-items-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-white">
                      {contactCMS?.office_title || 'Guwahati Headquarters'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400">
                      {contactCMS?.office_subtitle || 'Indigenous Artificial Intelligence Lab, Assam'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Physical Location
                    </span>
                    <div className="text-slate-800 dark:text-gray-200 font-medium leading-relaxed">
                      {contactCMS?.office_location || 'Guwahati, Kamrup Metropolitan, Assam, India • PIN: 781001'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Operating Hours
                    </span>
                    <div className="text-slate-800 dark:text-gray-200 font-medium">
                      {contactCMS?.office_hours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST'}
                    </div>
                    <div className="text-slate-600 dark:text-gray-400 text-[11px] mt-0.5">
                      {contactCMS?.office_hours_note || '(Automated cloud APIs & AI services operate 24/7/365)'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Primary Contact Emails
                    </span>
                    <div className="space-y-1 mt-1">
                      <a
                        href={`mailto:${contactCMS?.primary_support_email || 'support@aiaxom.co.in'}`}
                        className="block text-fuchsia-700 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 font-mono text-xs font-semibold"
                      >
                        {contactCMS?.primary_support_email || 'support@aiaxom.co.in'}
                      </a>
                      <a
                        href={`mailto:${contactCMS?.founder_email || 'samarjitkashyp@gmail.com'}`}
                        className="block text-slate-700 dark:text-gray-300 hover:text-emerald-950 dark:hover:text-white font-mono text-[11px]"
                      >
                        {contactCMS?.founder_email || 'samarjitkashyp@gmail.com'} (Founder Desk)
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                      Supported Communication Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {officeLanguagesList.map((lang, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-md border text-xs font-medium ${
                            lang.includes('অসমীয়া') || lang.includes('Assamese')
                              ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300'
                              : 'bg-white/70 dark:bg-white/5 border-emerald-900/15 dark:border-white/10 text-slate-800 dark:text-gray-200'
                          }`}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-emerald-900/15 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{contactCMS?.office_sla_text || 'Average SLA: < 4h'}</span>
                  </div>
                  <a
                    href="https://chat.aiaxom.co.in/"
                    className="text-fuchsia-700 dark:text-fuchsia-400 hover:text-emerald-950 dark:hover:text-white inline-flex items-center gap-1 transition"
                  >
                    Open Live Web App <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Data Privacy & Compliance Assurance */}
              <div className="rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-emerald-900/15 dark:border-white/10 p-5 shadow-lg">
                <div className="flex items-center gap-2.5 mb-2 text-emerald-950 dark:text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{contactCMS?.security_compliance_title || 'Enterprise Security & DPDP Act 2023 Compliant'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.security_compliance_desc || 'All messages, documents, and technical inquiries submitted through Axom AI are protected with 256-bit TLS encryption. Uploaded files are isolated and never retained for public training without explicit organizational consent.'}
                </p>
              </div>
            </div>
          </div>

          {/* Audience Breakdown: Who We Help (4 Pillars) */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{contactCMS?.audience_badge || 'Audience Solutions'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-white tracking-tight mb-2">
                {contactCMS?.audience_title || 'Who Can Reach Out to Axom AI?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                {contactCMS?.audience_subtitle || 'Dedicated support channels tailored for students, enterprises, creators, and developers'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1 */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-900/15 dark:border-white/10 hover:border-emerald-900/25 dark:hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 grid place-items-center mb-3">
                  {renderAudienceIcon(contactCMS?.audience_1_icon || 'Sparkles')}
                </div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-1">
                  {contactCMS?.audience_1_title || 'Students & Job Aspirants'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_1_desc || 'Assistance with APSC, UPSC, Assamese literature research, essay formulation, and subsidized student accounts.'}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-900/15 dark:border-white/10 hover:border-emerald-900/25 dark:hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400 grid place-items-center mb-3">
                  {renderAudienceIcon(contactCMS?.audience_2_icon || 'Briefcase')}
                </div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-1">
                  {contactCMS?.audience_2_title || 'Assam MSMEs & Businesses'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_2_desc || 'Bilingual customer care chatbots, Assamese invoice extraction, marketing copy, and multi-user business plans.'}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-900/15 dark:border-white/10 hover:border-emerald-900/25 dark:hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 grid place-items-center mb-3">
                  {renderAudienceIcon(contactCMS?.audience_3_icon || 'Code2')}
                </div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-1">
                  {contactCMS?.audience_3_title || 'Developers & Engineers'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_3_desc || 'API tokens, webhooks, fine-tuned IndicTrans2 Assamese translation endpoints, and high-concurrency rate limits.'}
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-900/15 dark:border-white/10 hover:border-emerald-900/25 dark:hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-700 dark:text-pink-400 grid place-items-center mb-3">
                  {renderAudienceIcon(contactCMS?.audience_4_icon || 'Building')}
                </div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-1">
                  {contactCMS?.audience_4_title || 'Govt & Cultural Bodies'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_4_desc || 'Digitization and OCR for ancient Assamese manuscripts (সাঁচিপাত), archives, and institutional AI partnerships.'}
                </p>
              </div>
            </div>
          </section>

          {/* Comprehensive Contact FAQ Accordion */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{contactCMS?.faq_badge || 'Frequently Asked Questions'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-white tracking-tight mb-2">
                {contactCMS?.faq_title || 'Common Questions About Contacting Us'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                {contactCMS?.faq_subtitle || 'Direct answers to popular questions regarding support, response times, and partnerships'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ContactFaqInteractive faqs={contactCMS?.faqs} />
            </div>
          </section>

          {/* Bottom Fast Assistance Card */}
          <div className="rounded-3xl bg-gradient-to-r from-fuchsia-100/40 dark:from-fuchsia-900/40 via-purple-100/30 dark:via-purple-900/30 to-indigo-100/40 dark:to-indigo-900/40 border border-fuchsia-500/30 p-8 sm:p-10 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 grid place-items-center mx-auto mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-white mb-2">
                {contactCMS?.bottom_cta_heading || 'Need Instant Answers Right Now?'}
              </h3>
              <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-6">
                {contactCMS?.bottom_cta_subheading || 'You can immediately query our AI directly in English or Assamese. For live conversational support, launch the Axom AI web application.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={contactCMS?.bottom_cta_primary_btn_url || 'https://chat.aiaxom.co.in/'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-fuchsia-500/25"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {contactCMS?.bottom_cta_primary_btn_text || 'Launch Axom AI Chat'}
                </a>
                <Link
                  href={contactCMS?.bottom_cta_secondary_btn_url || '/faq'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 border border-emerald-900/15 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:text-emerald-950 dark:hover:text-white font-semibold text-xs transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> {contactCMS?.bottom_cta_secondary_btn_text || 'Browse Full FAQ Knowledgebase'}
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
