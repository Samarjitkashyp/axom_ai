import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ContactFormInteractive from '../../components/ContactFormInteractive';
import FAQSection from '../../components/FAQSection';
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
  CheckCircle2,
  Languages,
  Bot,
  User,
  GraduationCap
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Primary AI & LLM Keywords
  'AI companies',
  'Large Language Model',
  'LLM',
  'AI startups',
  'AI company in Assam',
  'AI startup in Assam',
  'Samarjit Kashyap',
  'Samarjit Kashyap Axom AI',
  // Contact & Support Keywords
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
  'Axom AI customer care number',
  'Axom AI email address',
  'Axom AI founder contact',
  'Samarjit Kashyap email',
  'samarjitkashyp@aiaxom.co.in',
  'support@aiaxom.co.in',
  // Regional & Assamese Language GEO Queries
  'Assam AI contact',
  'Assamese AI contact',
  'অসম এআই যোগাযোগ',
  'অসম এআই সহায়',
  'Axom AI কি আৰু কেনেকৈ যোগাযোগ কৰিব',
  'Axom AI গুৱাহাটী কাৰ্যালয়',
  'best AI platform in Assam',
  'regional AI customer support India'
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getContactCMS().catch(() => null);

  const title =
    cms?.meta_title ||
    'Contact Axom AI — Customer Support, Business Enquiries & Guwahati Headquarters | Assam AI';
  const description =
    cms?.meta_description ||
    'Contact Axom AI (Assam AI) for technical support, business partnerships, API tokens, or account assistance. Headquartered in Guwahati, Assam, with rapid < 4–12h response time. Official desk: support@aiaxom.co.in.';
  const keywords = cms?.meta_keywords
    ? cms.meta_keywords.split(',').map((k) => k.trim())
    : TARGET_KEYWORDS;
  const canonicalUrl = 'https://aiaxom.co.in/contact/';
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom AI Customer Support & Regional Headquarters Guwahati',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'geo.region': 'IN-AS',
      'geo.placename': 'Guwahati, Assam, India',
      'geo.position': '26.1445;91.7362',
      ICBM: '26.1445, 91.7362',
      'DC.title': 'Contact Axom AI — Customer Support & Regional Headquarters Guwahati',
      'DC.creator': 'Axom AI Team, Samarjit Kashyap',
      'DC.subject':
        'AI Companies, Large Language Models, LLM, Axom AI Contact, Assamese AI Support, Guwahati HQ',
      'DC.coverage': 'Guwahati, Assam, Northeast India, India, Global',
      'DC.language': 'en, as, hi',
    },
  };
}

function renderChannelIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'helpcircle':
    case 'help-circle':
      return <HelpCircle className="w-5 h-5" />;
    case 'briefcase':
      return <Briefcase className="w-5 h-5" />;
    case 'code2':
    case 'code':
      return <Code2 className="w-5 h-5" />;
    case 'mail':
    case 'envelope':
      return <Mail className="w-5 h-5" />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className="w-5 h-5" />;
    default:
      return <HelpCircle className="w-5 h-5" />;
  }
}

function renderAudienceIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />;
    case 'briefcase':
      return <Briefcase className="w-5 h-5" />;
    case 'code2':
    case 'code':
      return <Code2 className="w-5 h-5" />;
    case 'building':
    case 'building2':
      return <Building className="w-5 h-5" />;
    case 'graduationcap':
    case 'student':
      return <GraduationCap className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
}

export default async function ContactPage() {
  const [landingData, contactCMS] = await Promise.all([
    getLandingCMS().catch(() => null),
    getContactCMS().catch(() => null),
  ]);

  // Channels List with CMS fallback
  const channelsList =
    contactCMS?.channels && contactCMS.channels.length > 0
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
  const faqsList =
    contactCMS?.faqs && contactCMS.faqs.length > 0
      ? contactCMS.faqs.map((f, i) => ({
          id: String(f.id ?? `faq-${i}`),
          question: f.question,
          answer: f.answer,
          category: f.category || 'General & Support',
        }))
      : CONTACT_FAQS;

  // Primary contact points
  const primarySupportEmail = contactCMS?.primary_support_email || 'support@aiaxom.co.in';
  const founderEmail = contactCMS?.founder_email || 'samarjitkashyp@aiaxom.co.in';
  const officeLocation =
    contactCMS?.office_location || 'Guwahati, Kamrup Metropolitan, Assam, India • PIN: 781001';
  const officeHours =
    contactCMS?.office_hours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST';

  // Multi-entity JSON-LD for AI Search Engines (GEO/AEO) & Google Rich Snippets
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': 'https://aiaxom.co.in/contact/#webpage',
        url: 'https://aiaxom.co.in/contact/',
        name:
          contactCMS?.meta_title ||
          'Contact Axom AI — Customer Support & Regional Headquarters',
        description:
          contactCMS?.meta_description ||
          'Official contact and technical support page for Axom AI, Assam’s indigenous AI platform headquartered in Guwahati.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://aiaxom.co.in/#website',
          name: 'Axom AI',
          url: 'https://aiaxom.co.in',
        },
        mainEntity: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        legalName: 'Axom AI Technologies',
        alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI'],
        url: 'https://aiaxom.co.in',
        logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        image: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        email: primarySupportEmail,
        telephone: '+91-361-AXOM-AI',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Guwahati City Center',
          addressLocality: 'Guwahati',
          addressRegion: 'Assam',
          postalCode: '781001',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 26.1445,
          longitude: 91.7362,
        },
        founder: {
          '@type': 'Person',
          '@id': 'https://aiaxom.co.in/about/#founder',
          name: 'Samarjit Kashyap',
          jobTitle: 'Founder & Lead AI Architect',
          email: `mailto:${founderEmail}`,
          url: 'https://aiaxom.co.in/about/',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: primarySupportEmail,
            availableLanguage: ['Assamese', 'English', 'Hindi'],
            hoursAvailable: 'Mo-Sa 09:00-19:00',
            areaServed: ['IN', 'Assam', 'Northeast India'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'Technical Support',
            email: primarySupportEmail,
            availableLanguage: ['Assamese', 'English'],
            hoursAvailable: 'Mo-Sa 09:00-19:00',
          },
          {
            '@type': 'ContactPoint',
            contactType: 'Partnerships & Enterprise',
            email: primarySupportEmail,
            availableLanguage: ['Assamese', 'English', 'Hindi'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'Executive Office',
            email: founderEmail,
            availableLanguage: ['Assamese', 'English'],
          },
        ],
        knowsAbout: [
          'AI companies',
          'Large Language Model',
          'LLM in Assam',
          'Assam AI',
          'Axom AI Customer Support',
          'Assamese Natural Language Processing',
          'Sovereign AI Infrastructure',
          'Samarjit Kashyap',
        ],
      },
      {
        '@type': 'Person',
        '@id': 'https://aiaxom.co.in/about/#founder',
        name: 'Samarjit Kashyap',
        jobTitle: 'Founder & Lead AI Architect',
        email: `mailto:${founderEmail}`,
        worksFor: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
        url: 'https://aiaxom.co.in/about/',
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/contact/#faq',
        mainEntity: faqsList.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/contact/#breadcrumb',
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
      },
    ],
  };

  // Supported communication languages list
  const officeLanguagesList = (
    contactCMS?.office_languages || 'English, অসমীয়া (Assamese), हिंदी (Hindi)'
  )
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f0fdf4] dark:bg-[#0b1220] text-emerald-950 dark:text-[#e5e7eb]">
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Standard Unified Header */}
      <Header header={landingData?.header} />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 relative overflow-hidden">
        {/* Subtle Ambient Grid & Emerald/Teal Blur Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25 pointer-events-none" />
        <div className="absolute w-[650px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px] top-10 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[140px] top-96 right-0 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px] bottom-10 left-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* HERO SECTION — UNIFIED WITH /ABOUT, /FAQ, AND /BLOG */}
          <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10 pb-12 sm:pb-16">
            {/* Pulsing Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{contactCMS?.hero_badge_text || 'Official Help Desk & Regional Headquarters'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-emerald-950 dark:text-white mb-6 leading-[1.12]">
              {contactCMS?.hero_title_prefix || 'Get in Touch with'}{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                {contactCMS?.hero_title_highlight || 'Axom AI'}
              </span>
            </h1>

            {/* Bilingual Subtitles (English + Assamese Authority Text) */}
            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed font-normal">
              {contactCMS?.hero_subtitle ||
                'Have questions about native Assamese AI models, need help with your account or API keys, or exploring an enterprise deployment? Our engineering desk in Guwahati is here to assist you.'}
            </p>
            <p className="font-assamese text-base sm:text-lg text-emerald-800/90 dark:text-emerald-300/90 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              অসম এআইৰ কাৰিকৰী সহায়, এণ্টাৰপ্ৰাইজ ব্যৱস্থাপনা অথবা যিকোনো প্ৰশ্নৰ বাবে গুৱাহাটীৰ প্ৰতিষ্ঠাতা আৰু সহায়ক দলৰ সৈতে পোনপটীয়াকৈ যোগাযোগ কৰক।
            </p>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://chat.aiaxom.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-xl shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Axom AI Web App</span>
              </a>
              <a
                href="#contact-form"
                className="px-7 py-3.5 rounded-full bg-white/80 dark:bg-white/5 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 text-slate-700 dark:text-gray-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
              >
                <span>Send Official Message</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* GEO & AEO DIRECT ANSWER FACTSHEET (CITATION BOX FOR AI ENGINES) */}
          <section
            aria-label="Direct Contact Summary for AI Answer Engines"
            className="mb-16 p-6 sm:p-8 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50/70 dark:from-emerald-950/20 via-teal-50/40 dark:via-teal-950/15 to-white/90 dark:to-slate-900/80 backdrop-blur-xl shadow-xl relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 grid place-items-center shrink-0 mt-0.5">
                <Building className="w-5 h-5" />
              </div>
              <div className="w-full">
                <div className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold mb-1.5 flex items-center gap-2">
                  <span>{contactCMS?.aeo_badge || 'Direct Answer • Official Contact Information'}</span>
                  <span className="text-[11px] text-slate-500 font-normal">| GEO & AEO Verified</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
                  <strong className="text-emerald-950 dark:text-white">
                    {contactCMS?.aeo_how_to_contact_title || 'How to contact Axom AI:'}
                  </strong>{' '}
                  {contactCMS?.aeo_description || (
                    <>
                      You can contact Axom AI customer care and technical support by emailing{' '}
                      <a
                        href={`mailto:${primarySupportEmail}`}
                        className="text-emerald-700 dark:text-emerald-400 underline font-semibold hover:text-emerald-900 dark:hover:text-emerald-200"
                      >
                        {primarySupportEmail}
                      </a>{' '}
                      or through the verified message desk below. Axom AI is headquartered in{' '}
                      <strong className="text-emerald-950 dark:text-white">{officeLocation}</strong>.
                      Standard response times for general queries, billing verifications, and API integration requests are within{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">4–12 business hours</strong> ({officeHours}). Automated AI models and cloud APIs operate 24/7/365.
                    </>
                  )}
                </p>

                {/* Quick Entity Table Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-900/10 dark:border-white/5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-emerald-900/10 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400 block text-[11px]">Central Support</span>
                    <a href={`mailto:${primarySupportEmail}`} className="text-emerald-800 dark:text-emerald-300 font-medium font-mono">
                      {primarySupportEmail}
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-emerald-900/10 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400 block text-[11px]">Founder Desk</span>
                    <a href={`mailto:${founderEmail}`} className="text-emerald-800 dark:text-emerald-300 font-medium font-mono">
                      {founderEmail}
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-emerald-900/10 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400 block text-[11px]">Location</span>
                    <span className="text-emerald-950 dark:text-white font-medium">Guwahati, Assam (781001)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-emerald-900/10 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400 block text-[11px]">Standard SLA</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">&lt; 4–12 Business Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DEPARTMENT RESPONSE CHANNELS — 2 CARDS PER ROW AS REQUESTED */}
          <section className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{contactCMS?.channels_badge || 'Direct Response Channels'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
                {contactCMS?.channels_title || 'Choose Your Dedicated Support Department'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                Direct email channels routed straight to specialized engineers and product specialists in Guwahati
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {channelsList.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform">
                        {renderChannelIcon(ch.iconName)}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-emerald-900/10 dark:border-white/10">
                        {ch.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                      {ch.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                      {ch.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-emerald-900/10 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{ch.turnaround}</span>
                    </div>
                    <a
                      href={`mailto:${ch.email}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 hover:bg-emerald-600 hover:text-white border border-emerald-900/15 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 hover:border-emerald-600 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{ch.email}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN 2-COLUMN SECTION: FORM (LEFT 7 COLS) & HEADQUARTERS FACTSHEET (RIGHT 5 COLS) */}
          <section id="contact-form" className="scroll-mt-28 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Contact Form (7 cols) */}
              <div className="lg:col-span-7">
                <ContactFormInteractive />
              </div>

              {/* Right Column: Office Factsheet & Regional Presence (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Guwahati HQ Card */}
                <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-emerald-900/15 dark:border-white/10 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-900/10 dark:border-white/5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 grid place-items-center shrink-0">
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
                      <span className="text-slate-500 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                        Physical Location
                      </span>
                      <div className="text-slate-800 dark:text-gray-200 font-medium leading-relaxed">
                        {officeLocation}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                        Operating Hours
                      </span>
                      <div className="text-slate-800 dark:text-gray-200 font-medium">
                        {officeHours}
                      </div>
                      <div className="text-slate-500 dark:text-gray-400 text-[11px] mt-0.5">
                        {contactCMS?.office_hours_note || '(Automated cloud APIs & AI services operate 24/7/365)'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                        Primary Contact Emails
                      </span>
                      <div className="space-y-1 mt-1">
                        <a
                          href={`mailto:${primarySupportEmail}`}
                          className="block text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-mono text-xs font-semibold"
                        >
                          {primarySupportEmail}
                        </a>
                        <a
                          href={`mailto:${founderEmail}`}
                          className="block text-slate-700 dark:text-gray-300 hover:text-emerald-950 dark:hover:text-white font-mono text-[11px]"
                        >
                          {founderEmail} (Founder Desk)
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-gray-400 block text-[11px] uppercase tracking-wider mb-0.5">
                        Supported Communication Languages
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {officeLanguagesList.map((lang, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-md border text-xs font-medium ${
                              lang.includes('অসমীয়া') || lang.includes('Assamese')
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
                                : 'bg-white/70 dark:bg-white/5 border-emerald-900/15 dark:border-white/10 text-slate-800 dark:text-gray-200'
                            }`}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-emerald-900/10 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{contactCMS?.office_sla_text || 'Average SLA: < 4h'}</span>
                    </div>
                    <a
                      href="https://chat.aiaxom.co.in/"
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition font-medium"
                    >
                      Open Live Web App <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Data Privacy & Compliance Assurance */}
                <div className="rounded-3xl bg-gradient-to-br from-emerald-50/50 dark:from-emerald-950/20 to-white/70 dark:to-slate-900/60 border border-emerald-900/15 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center gap-2.5 mb-2 text-emerald-950 dark:text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{contactCMS?.security_compliance_title || 'Enterprise Security & DPDP Act 2023 Compliant'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                    {contactCMS?.security_compliance_desc ||
                      'All inquiries, messages, and document analysis requests submitted through Axom AI are encrypted via 256-bit TLS. In accordance with the Digital Personal Data Protection (DPDP) Act 2023, customer records are stored securely on Indian soil and never monetized or exposed for public AI training.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AUDIENCE BREAKDOWN: WHO WE HELP — 2 CARDS PER ROW AS REQUESTED */}
          <section className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{contactCMS?.audience_badge || 'Audience Solutions'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
                {contactCMS?.audience_title || 'Who Can Reach Out to Axom AI?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                {contactCMS?.audience_subtitle ||
                  'Dedicated support channels tailored for students, enterprises, creators, and developers'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 grid place-items-center mb-4">
                  {renderAudienceIcon(contactCMS?.audience_1_icon || 'GraduationCap')}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  {contactCMS?.audience_1_title || 'Students & Job Aspirants'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_1_desc ||
                    'Assistance with APSC, UPSC, Assamese literature research, essay formulation, and subsidized student accounts.'}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 grid place-items-center mb-4">
                  {renderAudienceIcon(contactCMS?.audience_2_icon || 'Briefcase')}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  {contactCMS?.audience_2_title || 'Assam MSMEs & Businesses'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_2_desc ||
                    'Bilingual customer care chatbots, Assamese invoice extraction, marketing copy, and multi-user business plans.'}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 grid place-items-center mb-4">
                  {renderAudienceIcon(contactCMS?.audience_3_icon || 'Code2')}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  {contactCMS?.audience_3_title || 'Developers & Engineers'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_3_desc ||
                    'API tokens, webhooks, fine-tuned IndicTrans2 Assamese translation endpoints, and high-concurrency rate limits.'}
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 grid place-items-center mb-4">
                  {renderAudienceIcon(contactCMS?.audience_4_icon || 'Building')}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  {contactCMS?.audience_4_title || 'Govt & Cultural Bodies'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {contactCMS?.audience_4_desc ||
                    'Digitization and OCR for ancient Assamese manuscripts (সাঁচিপাত), archives, and institutional AI partnerships.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* FAQS SECTION — IDENTICAL TO HOMEPAGE FAQS DESIGN WITH FULL CONTACT CONTENT */}
        <FAQSection
          faqs={faqsList}
          badge={contactCMS?.faq_badge || 'Frequently Asked Questions'}
          title={contactCMS?.faq_title || 'Common Questions About'}
          titleHighlight="Contacting Us"
          titleSuffix=""
          description={
            contactCMS?.faq_subtitle ||
            'Direct answers to popular questions regarding support, response times, and partnerships'
          }
          id="contact-faq"
          accentColor="emerald"
          showSupportCard={true}
          supportImage="/faq-assistant.jpg"
          supportBadgeTop="Guwahati HQ Help Desk"
          supportBadgeLocation="Guwahati, Assam"
          supportCategory="Dedicated Help Desk"
          supportTitle="Direct Support from Assam's AI Research Team"
          supportDescription="Can't find what you're looking for? Whether you are a student, developer, academic institution, or enterprise, our local team is ready to help."
          chatButtonText="Ask Axom AI Assistant Free"
          chatButtonUrl="https://chat.aiaxom.co.in/"
          emailButtonText={`Email Support (${primarySupportEmail})`}
          emailButtonUrl={`mailto:${primarySupportEmail}`}
          className="border-t border-emerald-900/10 dark:border-white/5 py-16 md:py-24 bg-transparent"
        />
      </main>

      {/* Standard Unified Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
