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
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
  FileCheck,
  Lock,
  RefreshCw,
  ExternalLink,
  BookOpen,
  FileText,
  Palette,
  Mic,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeText(str?: string): string {
  if (!str) return '';
  return str
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ''
    )
    .trim();
}

const TARGET_KEYWORDS = [
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
    'Simple, transparent pricing for Assam, India and beyond. Start with Axom AI for free. Upgrade to Starter (₹199/mo) or Pro (₹499/mo) for higher limits and advanced AI tools.';
  const canonicalUrl = 'https://aiaxom.co.in/pricing/';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title,
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
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
          alt: 'Axom AI Pricing Plans & Transparent Subscriptions',
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
      'Axom AI is India’s premier indigenous Assamese & multilingual AI platform offering conversational intelligence, 33 document conversion tools, OCR, and AI suites.',
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
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
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
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <span>Simple, Transparent Pricing</span>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Free Tier
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
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Starter (₹199/mo)
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
              <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-white/90 dark:from-emerald-950/40 dark:to-slate-900/80 border-2 border-emerald-500/40 shadow-md flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider mb-3">
                    Pro (₹499/mo) &bull; Most Popular
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Clean Table Wrapper */}
            <div className="overflow-x-auto rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold">
                    <th className="p-3.5 sm:p-4 w-1/2 sm:w-5/12">Key Capability</th>
                    <th className="p-3.5 sm:p-4 text-center w-1/6">Free (₹0)</th>
                    <th className="p-3.5 sm:p-4 text-center w-1/5">Starter (₹199)</th>
                    <th className="p-3.5 sm:p-4 text-center w-1/4 text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-500/5">
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
                      <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                        {row.feature}
                      </td>

                      {/* Free */}
                      <td className="p-3.5 sm:p-4 text-center">
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
                      <td className="p-3.5 sm:p-4 text-center">
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
                      <td className="p-3.5 sm:p-4 text-center bg-emerald-500/5 font-semibold">
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

        {/* ==================== 4. ONE PLATFORM. MANY WAYS TO CREATE ==================== */}
        <section className="py-14 sm:py-20 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/50 dark:bg-[#0b1220]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Unified AI Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                One Platform. Many Ways to Create.
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Axom AI is more than a chatbot. Use one sovereign workspace for everyday conversations, document productivity, and creative workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
              {/* Pillar 1 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <BookOpen size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  AI &amp; Research
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Ask questions, explore ideas, and reason with models built for regional and general context.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                  <FileText size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  Documents &amp; PDFs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Convert, merge, compress, protect, and chat with documents without visiting multiple websites.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <Zap size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  Productivity
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Create exam notes, generate Mermaid diagrams, extract OCR text, and streamline study packs.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Palette size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  Creative Studio
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Generate images, remove backgrounds, create QR codes, edit SVGs, and compress videos.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center mb-3">
                  <Mic size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  Voice &amp; Speech
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Natural Assamese voice synthesis, high-accuracy speech-to-text, and neural translation.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md no-underline"
              >
                <span>Explore All 33 Axom AI Tools</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== 5. YOUR DATA. YOUR CONTROL. (COMPACT TRUST BAR) ==================== */}
        <section className="py-12 sm:py-16 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Trust 1 */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    Indian Billing (INR)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pay with UPI (GPay, PhonePe, Paytm), RuPay, Cards &amp; Netbanking. Zero forex charges.
                  </p>
                </div>
              </div>

              {/* Trust 2 */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                <Lock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    Privacy-First
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Responsible data handling. We never sell your data or train public models on your private documents.
                  </p>
                </div>
              </div>

              {/* Trust 3 */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                <FileCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    GST Compliant
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Add your GSTIN at checkout to receive automated tax invoices for full Input Tax Credit (ITC).
                  </p>
                </div>
              </div>

              {/* Trust 4 */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                <RefreshCw size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    Cancel Anytime
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Manage, upgrade, or cancel your subscription anytime with 1-click from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6. FREQUENTLY ASKED QUESTIONS ==================== */}
        <section id="faq" className="py-16 sm:py-24 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/60 dark:bg-[#0b1220]/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Billing &amp; Subscriptions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                Everything you need to know about Axom AI plans, word allowances, payment methods, and cancellation.
              </p>
            </div>

            <PricingFaq faqs={faqList} />
          </div>
        </section>

        {/* ==================== 7. FINAL CTA ==================== */}
        <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-b from-[#f0fdf4] to-emerald-50/70 dark:from-[#0b1220] dark:to-emerald-950/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="p-8 sm:p-12 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-emerald-500/30 shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Start Your Journey</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Not sure which plan to choose?
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
                Start with Free. You don&apos;t need to decide everything today &mdash; try Axom AI, explore the tools, and upgrade whenever your usage grows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <a
                  href="https://chat.aiaxom.co.in/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg no-underline"
                >
                  <span>Start Free with Axom AI</span>
                  <ArrowRight size={14} />
                </a>

                <Link
                  href="/tools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-emerald-500 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all no-underline"
                >
                  <span>Explore All 33 Tools</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-6">
                All prices in Indian Rupees (INR). Applicable GST calculated at checkout. Subscription terms subject to change.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
