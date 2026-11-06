import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PricingSection from '../../components/PricingSection';
import PricingFaq from '../../components/PricingFaq';
import {
  DETAILED_PLANS,
  PRICING_FAQS,
  PLAN_COMPARISON_ROWS,
  DetailedPlan,
} from '../../components/pricingData';
import { getLandingCMS } from '../../lib/api';
import { pageTitle } from '../../lib/seoTitle';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  RefreshCw,
  HelpCircle,
  Building2,
  Cpu,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  'ai companies',
  'ai companies in assam',
  'top ai companies in assam',
  'best ai companies in assam',
  'ai company in assam',
  'top ai company in assam',
  'best ai company in assam',
  'first ai company in assam',
  'ai startups in assam',
  'ai company guwahati',
  'artificial intelligence guwahati',
  'artificial intelligence companies assam',
  'northeast india ai company',
  'large language model',
  'large language models in assam',
  'large language model assam',
  'assam large language model',
  'assamese large language model',
  'sovereign large language model india',
  'indic large language model',
  'indigenous large language model',
  'Axom AI pricing',
  'Axom AI plans',
  'Axom AI cost in India',
  'Axom AI subscription',
  'Assamese AI pricing',
  'Axom AI price in INR',
  'Axom AI free plan',
  'Axom AI pro plan',
  'Axom AI starter plan',
  'Axom AI yearly discount',
  'affordable AI India',
  'indigenous AI tool subscription',
  'indigenous Assamese AI pricing India',
  'Assamese LLM subscription cost',
  'Axom AI GST invoice',
  'Axom AI UPI payment',
  'how much does Axom AI cost',
  'is Axom AI free to use',
  'what is the price of Axom AI Pro',
  'how can I pay for Axom AI with UPI',
  'what are the benefits of Axom AI Pro',
  'can I get a GST tax invoice for Axom AI',
  'how to cancel Axom AI subscription',
  'what is included in Axom AI free tier',
  'how does Axom AI monthly word quota work',
  'best affordable generative AI pricing in India',
  'transparent Indian Rupee pricing for regional AI',
  'sovereign Assamese AI platform subscription options',
  'DPDP compliant AI tools subscription India',
];

export async function generateMetadata(): Promise<Metadata> {
  const title =
    'Axom AI Pricing — Simple, Transparent Plans in INR (₹) | Free, Starter & Pro';
  const description =
    "Axom AI is Assam's leading artificial intelligence company offering transparent Indian Rupee (INR) pricing. Start Free (₹0) with 5,000 words/month or upgrade to Starter (₹199/mo) and Pro (₹499/mo) for sovereign large language models, Assamese voice AI, and 33 productivity tools.";
  const canonicalUrl = 'https://aiaxom.co.in/pricing/';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title: pageTitle(title),
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        as: canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom AI Pricing Plans & Transparent Subscriptions in INR',
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
      'DC.title': 'Axom AI Pricing & Sovereign AI Plans in Assam, India',
      'DC.creator': 'Axom AI Team, Samarjit Kashyap',
      'DC.subject':
        'AI Companies, Large Language Models, AI Companies in Assam, Assamese AI, Generative AI Pricing India, Transparent INR Billing',
      'DC.coverage': 'Assam, Northeast India, India, Global',
      'DC.language': 'en, as, hi',
    },
  };
}

export default async function PricingPage() {
  const cms = await getLandingCMS().catch(() => ({} as any));

  // Map plans from CMS if available or fallback to clean DETAILED_PLANS
  const plans: DetailedPlan[] =
    cms?.pricing_header?.plans && cms.pricing_header.plans.length > 0
      ? cms.pricing_header.plans.map((p: any) => {
          const fallback = DETAILED_PLANS.find(
            (d) =>
              d.id.toLowerCase() === (p.id || '').toLowerCase() ||
              d.name.toLowerCase() === (p.name || '').toLowerCase()
          );
          return {
            id: p.id || fallback?.id || 'plan',
            name: p.name || fallback?.name || 'Plan',
            badge: p.badge || fallback?.badge || (p.featured ? 'Most Popular' : ''),
            desc: p.desc || fallback?.desc || '',
            monthlyPrice: Number(p.monthlyPrice) || 0,
            yearlyPrice: Number(p.yearlyPrice) || 0,
            monthlyWords: p.monthlyWords || fallback?.monthlyWords || '',
            popular: Boolean(p.featured ?? fallback?.popular),
            ctaText: p.cta || fallback?.ctaText || 'Get Started',
            ctaUrl: p.href || fallback?.ctaUrl || 'https://chat.aiaxom.co.in',
            features:
              p.features && p.features.length > 0
                ? p.features
                : fallback?.features || [],
            notIncluded: fallback?.notIncluded || [],
          };
        })
      : DETAILED_PLANS;

  // SoftwareApplication with AggregateOffer Schema
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Axom AI',
    operatingSystem: 'Web, Android, iOS, Windows, macOS, Linux',
    applicationCategory: 'BusinessApplication, Productivity, AI',
    description:
      "Axom AI is India's premier indigenous Assamese & multilingual AI platform offering conversational intelligence, sovereign large language models, 33 document conversion tools, OCR, and AI suites.",
    url: 'https://aiaxom.co.in/pricing/',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: String(Math.min(...plans.map((p) => p.monthlyPrice))),
      highPrice: String(Math.max(...plans.map((p) => p.monthlyPrice))),
      offerCount: String(plans.length),
      offers: plans.map((p) => ({
        '@type': 'Offer',
        name: `Axom AI ${p.name} Plan`,
        price: String(p.monthlyPrice),
        priceCurrency: 'INR',
        billingDuration: 'P1M',
        description: p.desc || `${p.monthlyWords} per month`,
        url: p.ctaUrl,
      })),
    },
  };

  const rawFaqList =
    cms?.pricing_faqs?.items && cms.pricing_faqs.items.length > 0
      ? cms.pricing_faqs.items
      : PRICING_FAQS;

  const faqList = rawFaqList.map((faq: any) => ({
    q: faq.q || faq.question || '',
    a: faq.a || faq.answer || '',
    question: faq.q || faq.question || '',
    answer: faq.a || faq.answer || '',
  }));

  // FAQ Schema for Search Engines & AEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((faq: any) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  // Breadcrumb Schema
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
        name: 'Pricing',
        item: 'https://aiaxom.co.in/pricing/',
      },
    ],
  };

  // Organization Schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description:
      "Assam's leading indigenous Artificial Intelligence company and foundation research laboratory developing sovereign Large Language Models and speech intelligence.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@aiaxom.co.in',
      availableLanguage: ['Assamese', 'English', 'Hindi'],
    },
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Global Navbar */}
      <Header header={cms?.header} />

      <main className="flex-1">
        {/* ==================== 1. HERO SECTION ==================== */}
        <section className="relative pt-24 sm:pt-32 md:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-emerald-900/10 dark:border-white/5">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Content */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <span>Simple, Transparent Pricing &bull; Sovereign Indian AI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
                AI that works for{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  Assam, India &amp; beyond.
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal mb-5">
                Start with Axom AI for free. Upgrade when you need more AI power, higher usage limits, advanced models, and productivity features.
              </p>

              {/* Trust micro-line */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>No complicated plans</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>No hidden pricing</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Cancel anytime</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>100% INR (₹) via UPI &amp; Cards</span>
                </span>
              </div>
            </div>

            {/* AEO / GEO Direct Answer Knowledge Brief Card */}
            <div className="max-w-4xl mx-auto mb-10 p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/25 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Direct Answer &bull; Axom AI Pricing &amp; Model Ecosystem</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong>Axom AI</strong> (Guwahati, Assam) is Assam&apos;s premier indigenous Artificial Intelligence enterprise developing foundation large language models and speech intelligence. Our subscription architecture is straightforward: <strong>Free Plan (₹0)</strong> provides 5,000 words/month with trilingual Assamese-English-Hindi chat and standard document tools; <strong>Starter Plan (₹199/month)</strong> provides 50,000 words/month with advanced models and PDF reasoning; and <strong>Pro Plan (₹499/month)</strong> provides 250,000 words/month with deep reasoning, 24kHz Studio Voice AI (Puhor), Image Studio, and priority queue.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Check size={13} className="stroke-[3]" /> Zero forex markup (Billed in INR)
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Check size={13} className="stroke-[3]" /> Instant UPI (GPay, PhonePe, Paytm)
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Check size={13} className="stroke-[3]" /> India DPDP Act 2023 Compliant
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Check size={13} className="stroke-[3]" /> Automated GST Invoicing
                </span>
              </div>
            </div>

            {/* Interactive Pricing Cards (Free, Starter, Pro) */}
            <PricingSection
              header={cms?.pricing_header}
              plans={plans}
              showSectionHeader={false}
              interactiveCheckout={true}
            />
          </div>
        </section>

        {/* ==================== 2. WHAT CHANGES WHEN YOU UPGRADE? ==================== */}
        <section className="py-14 sm:py-20 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/50 dark:bg-[#0b1220]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Which Plan Fits You?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                What Changes When You Upgrade?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                You don&apos;t just get more words. You get access to more powerful AI reasoning, higher document limits, and specialized productivity tools as your needs grow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Persona 1: Free */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Free Tier &bull; ₹0
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    Explore Axom AI
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Perfect for trying the platform, asking everyday questions in Assamese, English &amp; Hindi, and handling occasional document conversion tasks.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Ideal for: Students &amp; first-time explorers
                </div>
              </div>

              {/* Persona 2: Starter */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Starter &bull; ₹199/mo
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    Get More Done Everyday
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Designed for students, content creators, and educators who use AI regularly for studying, writing, document analysis, and pedagogical notes generation.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Ideal for: Regular learners, writers &amp; creators
                </div>
              </div>

              {/* Persona 3: Pro */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-white/90 dark:from-emerald-950/40 dark:to-slate-900/80 border-2 border-emerald-500/40 shadow-md flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider mb-3">
                    Pro &bull; ₹499/mo &bull; Most Popular
                  </div>
                  <h3 className="text-lg font-black text-emerald-950 dark:text-white mb-2">
                    Work Without Bottlenecks
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Built for professionals, researchers, legal analysts, and institutions who need heavy word limits, natural Voice AI, high-resolution image studio, and priority processing.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Ideal for: Professionals, researchers &amp; power users
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. COMPARE PLANS TABLE ==================== */}
        <section id="compare" className="py-16 sm:py-20 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Side-by-Side</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
                Compare Plan Features
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                A clear, focused overview of the key differences across Free, Starter, and Pro plans.
              </p>
            </div>

            {/* Clean Table Wrapper with Mobile Touch Scroll */}
            <div className="overflow-x-auto rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-lg -webkit-overflow-scrolling-touch">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold">
                    <th className="p-4 sm:p-5 w-1/2 sm:w-5/12">Key Capability</th>
                    <th className="p-4 sm:p-5 text-center w-1/6">Free (₹0)</th>
                    <th className="p-4 sm:p-5 text-center w-1/5">Starter (₹199)</th>
                    <th className="p-4 sm:p-5 text-center w-1/4 text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-500/5">
                      Pro (₹499)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {PLAN_COMPARISON_ROWS.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 sm:p-5 font-semibold text-slate-900 dark:text-white">
                        {row.feature}
                      </td>

                      {/* Free */}
                      <td className="p-4 sm:p-5 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <Check size={16} className="text-emerald-600 dark:text-emerald-400 mx-auto stroke-[2.5]" />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">&mdash;</span>
                          )
                        ) : (
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {row.free}
                          </span>
                        )}
                      </td>

                      {/* Starter */}
                      <td className="p-4 sm:p-5 text-center">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? (
                            <Check size={16} className="text-emerald-600 dark:text-emerald-400 mx-auto stroke-[2.5]" />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">&mdash;</span>
                          )
                        ) : (
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {row.starter}
                          </span>
                        )}
                      </td>

                      {/* Pro (Highlighted) */}
                      <td className="p-4 sm:p-5 text-center bg-emerald-500/5 font-semibold">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <Check size={18} className="text-emerald-600 dark:text-emerald-400 mx-auto stroke-[3]" />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">&mdash;</span>
                          )
                        ) : (
                          <span className="text-xs font-bold text-emerald-950 dark:text-white">
                            {row.pro}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note & Explore CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500 dark:text-slate-400 px-2">
              <p>
                * Note: Feature availability and word quotas reset monthly based on your billing cycle.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                <span>View All 33 Tools on Axom AI Tools Page</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== 4. FREQUENTLY ASKED QUESTIONS ==================== */}
        <section id="faq" className="py-16 sm:py-24 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/60 dark:bg-[#0b1220]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Billing &amp; Subscriptions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                Frequently Asked <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                Everything you need to know about Axom AI plans, word allowances, payment methods, and cancellation.
              </p>
            </div>

            <PricingFaq faqs={faqList} />
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
