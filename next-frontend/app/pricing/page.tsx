import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PricingSection from '../../components/PricingSection';
import PricingFaq from '../../components/PricingFaq';
import { DETAILED_PLANS, PRICING_FAQS, COMPARISON_CATEGORIES, DetailedPlan } from '../../components/pricingData';
import { getLandingCMS } from '../../lib/api';
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  CreditCard,
  Building,
  GraduationCap,
  FileCheck,
  Lock,
  Headphones,
  Cpu,
  Layers,
  ChevronRight,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeText(str?: string): string {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '').trim();
}

const TARGET_KEYWORDS = [
  // Primary SEO Keywords
  'Axom AI pricing',
  'Axom AI plans',
  'Axom AI cost in India',
  'Axom AI subscription',
  'Assamese AI pricing',
  'Axom AI price in INR',
  // Secondary SEO Keywords
  'Axom AI free plan',
  'Axom AI pro plan',
  'Axom AI starter plan',
  'Axom AI business plan',
  'Axom AI yearly discount',
  'affordable AI India',
  'indigenous AI tool subscription',
  'indigenous Assamese AI pricing India',
  'Assamese LLM subscription cost',
  'Axom AI GST invoice',
  'Axom AI UPI payment',
  // AEO Keywords (Direct Questions)
  'how much does Axom AI cost',
  'is Axom AI free to use',
  'what is the price of Axom AI Pro',
  'how can I pay for Axom AI with UPI',
  'what are the benefits of Axom AI Pro',
  'does Axom AI provide student discount in Assam',
  'can I get a GST tax invoice for Axom AI',
  'how to cancel Axom AI subscription',
  'what is included in Axom AI free tier',
  'how does Axom AI monthly word quota work',
  // GEO Keywords (AI Engine Citations)
  'best affordable generative AI pricing in India',
  'transparent Indian Rupee pricing for regional AI',
  'Axom AI Progya and foundation models plan comparison',
  'sovereign Assamese AI platform subscription options',
  'Axom AI enterprise and API pricing in Assam',
  'DPDP compliant AI tools subscription India',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Pricing — Simple, Transparent Plans in INR (₹) | Free, Starter & Pro';
  const description =
    'Explore Axom AI pricing plans starting at ₹0/month. Transparent Indian Rupee (INR) pricing with UPI, GST invoice, native Assamese LLM, OCR, and 20+ file tools.';
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

  // Dynamically map plans from Django CMS (content.aiaxom.co.in/axomai-content/pricing/) with fallback to DETAILED_PLANS
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
            popular: Boolean(p.featured),
            ctaText: p.cta || fallback?.ctaText || 'Get Started',
            ctaUrl: p.href || fallback?.ctaUrl || 'https://chat.aiaxom.co.in',
            features: p.features && p.features.length > 0 ? p.features : fallback?.features || [],
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
      'Axom AI is India’s premier indigenous Assamese & multilingual AI platform offering conversational intelligence, 20+ PDF/document conversion tools, OCR, and REST APIs.',
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

  const faqList =
    cms?.pricing_faqs?.items && cms.pricing_faqs.items.length > 0
      ? cms.pricing_faqs.items
      : PRICING_FAQS;

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
        {/* Hero Section */}
        <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden border-b border-emerald-900/10 dark:border-white/5">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-5 relative z-10">
            {/* Headline */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#fef9c3] dark:bg-amber-950/40 border border-[#fde047] dark:border-amber-700/50 text-[#854d0e] dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>{sanitizeText(cms?.pricing_header?.badge) || 'Pricing'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
                {cms?.pricing_header?.title_prefix || 'Simple,'}{' '}
                <span className="bg-gradient-to-r from-[#d97706] via-[#b45309] to-[#92400e] dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  {cms?.pricing_header?.title_highlight || 'Transparent Pricing'}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
                {cms?.pricing_header?.subheading || 'Choose a plan that fits your needs. Upgrade or cancel anytime.'}
              </p>
            </div>

            {/* AEO Direct Answer Summary Box */}
            {(cms?.pricing_header?.glance_active !== false) && (
              <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 backdrop-blur-md mb-12">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <IndianRupee size={18} />
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="font-bold text-emerald-950 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <span>{cms?.pricing_header?.glance_title || 'Axom AI Pricing at a Glance'}</span>
                      {cms?.pricing_header?.glance_badge && (
                        <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                          {cms.pricing_header.glance_badge}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">
                      {cms?.pricing_header?.glance_text ? (
                        cms.pricing_header.glance_text
                      ) : (
                        plans.map((p, idx) => (
                          <span key={p.id || idx}>
                            <strong className="text-emerald-950 dark:text-white">
                              {p.name} (₹{p.monthlyPrice}{p.yearlyPrice > 0 ? `/mo or ₹${p.yearlyPrice} billed yearly` : '/mo'})
                            </strong>{' '}
                            {p.desc || (p.monthlyWords ? `${p.monthlyWords} per month.` : '')}{' '}
                          </span>
                        ))
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Shared Reusable Pricing Component (Same as Homepage) */}
            <PricingSection
              header={cms?.pricing_header}
              plans={plans}
              showSectionHeader={false}
              interactiveCheckout={true}
            />
          </div>
        </section>

        {/* Full Plan Comparison: Clean Responsive Bento / Card Grid (1 Category Card per Row) */}
        {(cms?.pricing_comparison?.active !== false) && (
          <section id="comparison" className="py-16 sm:py-24 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/80 dark:bg-[#0b1220]/80">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                  <span>{sanitizeText(cms?.pricing_comparison?.badge) || 'Full Plan Comparison'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                  {cms?.pricing_comparison?.title || 'Compare Every Feature Side-by-Side'}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  {cms?.pricing_comparison?.subheading || 'Detailed breakdown of models, tools, limits, and enterprise capabilities across all Axom AI tiers.'}
                </p>
              </div>

              {/* Comparison Categories: 1 Row per Category Card (Full Width) */}
              <div className="space-y-6 sm:space-y-8">
                {COMPARISON_CATEGORIES.map((cat: any, cIdx: number) => {
                  const icons = [Cpu, FileCheck, Sparkles, ShieldCheck];
                  const CatIcon = icons[cIdx % icons.length] || Layers;

                  return (
                    <div
                      key={cat.id || cIdx}
                      className="w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md hover:border-emerald-500/30 transition-all duration-200"
                    >
                      {/* Category Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 mb-5 border-b border-emerald-900/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                            <CatIcon size={20} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                              Domain {cIdx + 1}
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white">
                              {cat.category}
                            </h3>
                          </div>
                        </div>

                        {/* Plan Header Badges for Reference */}
                        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold">
                          <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 w-28 text-center">
                            Free (₹0)
                          </span>
                          <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 w-32 text-center">
                            Starter (₹199)
                          </span>
                          <span className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 w-36 text-center shadow-sm">
                            Pro (₹499)
                          </span>
                        </div>
                      </div>

                      {/* Items Grid */}
                      <div className="space-y-3 sm:space-y-3.5">
                        {cat.items.map((item: any, iIdx: number) => (
                          <div
                            key={item.id || iIdx}
                            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/50 dark:bg-white/[0.02] border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                          >
                            <div className="md:w-1/2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {item.feature}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:w-1/2 items-center text-center">
                              {/* Free */}
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 min-h-[40px]">
                                <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 md:hidden mb-0.5">Free</span>
                                {typeof item.free === 'boolean' ? (
                                  item.free ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                      <Check size={14} className="stroke-[2.5]" />
                                      <span className="hidden sm:inline">Included</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium text-xs">
                                      <X size={14} />
                                      <span className="hidden sm:inline">None</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {item.free}
                                  </span>
                                )}
                              </div>

                              {/* Starter */}
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 min-h-[40px]">
                                <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 md:hidden mb-0.5">Starter</span>
                                {typeof item.starter === 'boolean' ? (
                                  item.starter ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                      <Check size={14} className="stroke-[2.5]" />
                                      <span className="hidden sm:inline">Included</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium text-xs">
                                      <X size={14} />
                                      <span className="hidden sm:inline">None</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    {item.starter}
                                  </span>
                                )}
                              </div>

                              {/* Pro (Highlighted) */}
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-sm min-h-[40px]">
                                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 md:hidden mb-0.5">Pro</span>
                                {typeof item.pro === 'boolean' ? (
                                  item.pro ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                                      <Check size={15} className="stroke-[3]" />
                                      <span className="hidden sm:inline">Full</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium text-xs">
                                      <X size={14} />
                                      <span className="hidden sm:inline">None</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs font-extrabold text-emerald-950 dark:text-white">
                                    {item.pro}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Note */}
              <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-500 dark:text-slate-400 px-2 text-center">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{cms?.pricing_header?.footer_note || 'All prices in INR. Taxes calculated at checkout according to Indian GST regulations.'}</span>
              </div>
            </div>
          </section>
        )}

        {/* Payment Methods & Indian Trust Section */}
        {(cms?.pricing_trust_cards?.active !== false) && (
          <section className="py-16 sm:py-24 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
            <div className="max-w-6xl mx-auto px-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Box 1: Razorpay & UPI */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-5">
                    {cms?.pricing_trust_cards?.card1?.icon ? (
                      <i className={`${cms.pricing_trust_cards.card1.icon} text-lg`}></i>
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                    {cms?.pricing_trust_cards?.card1?.title || '100% Indian Payment Methods'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {cms?.pricing_trust_cards?.card1?.desc || 'Pay seamlessly with Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, MasterCard, and Netbanking from 50+ Indian banks.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {(cms?.pricing_trust_cards?.card1?.tags && cms.pricing_trust_cards.card1.tags.length > 0
                      ? cms.pricing_trust_cards.card1.tags
                      : ['UPI Autopay', 'RuPay', 'Razorpay Secured']
                    ).map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 rounded bg-white/70 dark:bg-white/5 border border-emerald-900/10 dark:border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Box 2: GST Invoices */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-teal-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-5">
                    {cms?.pricing_trust_cards?.card2?.icon ? (
                      <i className={`${cms.pricing_trust_cards.card2.icon} text-lg`}></i>
                    ) : (
                      <FileCheck size={20} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                    {cms?.pricing_trust_cards?.card2?.title || 'GST Compliant Invoicing'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {cms?.pricing_trust_cards?.card2?.desc || 'Add your company GSTIN during checkout to receive automated tax invoices for full Input Tax Credit (ITC) claiming.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {(cms?.pricing_trust_cards?.card2?.tags && cms.pricing_trust_cards.card2.tags.length > 0
                      ? cms.pricing_trust_cards.card2.tags
                      : ['Instant PDF Invoices', 'B2B Friendly']
                    ).map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 rounded bg-white/70 dark:bg-white/5 border border-emerald-900/10 dark:border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Box 3: Cancel Anytime */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-cyan-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-5">
                    {cms?.pricing_trust_cards?.card3?.icon ? (
                      <i className={`${cms.pricing_trust_cards.card3.icon} text-lg`}></i>
                    ) : (
                      <RefreshCw size={20} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                    {cms?.pricing_trust_cards?.card3?.title || 'Cancel Anytime with 1 Click'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {cms?.pricing_trust_cards?.card3?.desc || 'No hidden phone calls or dark patterns. Upgrade, downgrade, or cancel your subscription instantly from your settings dashboard.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {(cms?.pricing_trust_cards?.card3?.tags && cms.pricing_trust_cards.card3.tags.length > 0
                      ? cms.pricing_trust_cards.card3.tags
                      : ['Zero Lock-in', 'Immediate Downgrade']
                    ).map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 rounded bg-white/70 dark:bg-white/5 border border-emerald-900/10 dark:border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}



        {/* Pricing FAQs: Homepage 2-Column Style with Right-Side Sticky Image */}
        {(cms?.pricing_faqs?.active !== false) && (
          <section id="faq" className="py-20 md:py-28 relative border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] font-black uppercase tracking-wider mb-4">
                  <span>{sanitizeText(cms?.pricing_faqs?.badge) || 'Questions & Answers'}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                  Frequently Asked <span className="gradient-text">Questions</span>
                </h2>
                <p className="text-slate-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                  {cms?.pricing_faqs?.subheading || 'Clear answers regarding our billing cycles, word quotas, payment methods, and cancellation policy.'}
                </p>
              </div>

              <PricingFaq faqs={faqList} />
            </div>
          </section>
        )}

        
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
