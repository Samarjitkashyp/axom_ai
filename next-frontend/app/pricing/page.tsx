import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PricingPlansInteractive from '../../components/PricingPlansInteractive';
import PricingFaq from '../../components/PricingFaq';
import { DETAILED_PLANS, PRICING_FAQS, COMPARISON_CATEGORIES } from '../../components/pricingData';
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
  ChevronRight,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  'ChatGPT alternative pricing India',
  'Assamese LLM subscription cost',
  'Axom AI GST invoice',
  'Axom AI UPI payment',
  // AEO Keywords (Direct Questions)
  'how much does Axom AI cost',
  'is Axom AI free to use',
  'what is the price of Axom AI Pro',
  'how can I pay for Axom AI with UPI',
  'is Axom AI cheaper than ChatGPT Plus',
  'does Axom AI provide student discount in Assam',
  'can I get a GST tax invoice for Axom AI',
  'how to cancel Axom AI subscription',
  'what is included in Axom AI free tier',
  'how does Axom AI monthly word quota work',
  // GEO Keywords (AI Engine Citations)
  'best affordable generative AI pricing in India',
  'transparent Indian Rupee pricing for regional AI',
  'Axom AI plan comparison vs OpenAI and Anthropic',
  'sovereign Assamese AI platform subscription options',
  'Axom AI enterprise and API pricing in Assam',
  'DPDP compliant AI tools subscription India',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Pricing — Simple, Transparent Plans in INR (₹) | Free, Pro & Business';
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
  const cms = await getLandingCMS().catch(() => ({}));

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
      lowPrice: '0',
      highPrice: '1499',
      offerCount: '4',
      offers: [
        {
          '@type': 'Offer',
          name: 'Axom AI Free Plan',
          price: '0',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
          description: '5,000 words per month, standard Assamese AI chat, 5 document conversions per day.',
          url: 'https://chat.aiaxom.co.in/',
        },
        {
          '@type': 'Offer',
          name: 'Axom AI Starter Plan',
          price: '199',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
          description: '50,000 words per month, fast GPT-4o Mini & Gemma 2, PDF editor, priority support.',
          url: 'https://chat.aiaxom.co.in/upgrade',
        },
        {
          '@type': 'Offer',
          name: 'Axom AI Pro Plan',
          price: '499',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
          description:
            '250,000 words per month, Claude 3.5 Sonnet, Llama 3.3 70B, Smart OCR, 20+ PDF tools, Voice mode.',
          url: 'https://chat.aiaxom.co.in/upgrade',
        },
        {
          '@type': 'Offer',
          name: 'Axom AI Business Plan',
          price: '1499',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
          description:
            '1,000,000 words per month, 5 team seats, dedicated REST API keys, custom RAG knowledge base, GST invoice.',
          url: 'https://chat.aiaxom.co.in/upgrade',
        },
      ],
    },
  };

  // FAQ Schema for Search Engines & AEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRICING_FAQS.map((faq) => ({
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
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
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
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden border-b border-white/5">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-5 relative z-10">
            {/* Breadcrumb Bar */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-slate-400 mb-8 max-w-max mx-auto px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur"
            >
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <ChevronRight size={12} className="text-slate-500" />
              <span className="text-emerald-400 font-medium">Pricing</span>
            </nav>

            {/* Headline */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles size={14} /> Simple, Transparent Pricing in INR (₹)
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
                Affordable AI for Everyone in{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Assam &amp; India
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                Choose a plan tailored to your workflow. Start completely free with zero credit card,
                or unlock flagship AI intelligence, scanned Assamese OCR, and 20+ document utilities.
              </p>
            </div>

            {/* AEO Direct Answer Summary Box */}
            <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 backdrop-blur-md mb-12">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <IndianRupee size={18} />
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>Axom AI Pricing at a Glance</span>
                    <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Zero Foreign Markups
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    <strong className="text-white">Free (₹0/mo)</strong> gives you 5,000 words/mo with Llama 3 8B.
                    {' '}<strong className="text-white">Starter (₹199/mo or ₹159 billed yearly)</strong> provides 50,000 words with GPT-4o Mini &amp; PDF editing.
                    {' '}<strong className="text-white">Pro (₹499/mo or ₹399 billed yearly)</strong> unlocks 250,000 words, Claude 3.5 Sonnet, Llama 70B, Assamese OCR &amp; Voice mode.
                    {' '}<strong className="text-white">Business (₹1,499/mo or ₹1,199 billed yearly)</strong> includes 1,000,000 words, 5 team seats, custom knowledge bases &amp; REST APIs.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Pricing Cards */}
            <PricingPlansInteractive />
          </div>
        </section>

        {/* Feature Comparison Table Section */}
        <section className="py-20 sm:py-28 relative border-b border-white/5 bg-[#040914]/80">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap size={14} /> Full Plan Comparison
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Compare Every Feature Side-by-Side
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Detailed breakdown of models, tools, limits, and enterprise capabilities across all Axom AI tiers.
              </p>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80">
                    <th className="p-4 sm:p-5 text-sm font-bold text-slate-300 w-2/5">
                      Features &amp; Capabilities
                    </th>
                    <th className="p-4 sm:p-5 text-center text-sm font-extrabold text-slate-300 w-[15%]">
                      Free (₹0)
                    </th>
                    <th className="p-4 sm:p-5 text-center text-sm font-extrabold text-slate-300 w-[15%]">
                      Starter (₹199)
                    </th>
                    <th className="p-4 sm:p-5 text-center text-sm font-extrabold text-emerald-400 w-[15%] bg-emerald-500/10 border-x border-emerald-500/20">
                      Pro (₹499) ★
                    </th>
                    <th className="p-4 sm:p-5 text-center text-sm font-extrabold text-slate-300 w-[15%]">
                      Business (₹1,499)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_CATEGORIES.map((cat, cIdx) => (
                    <React.Fragment key={cIdx}>
                      {/* Category Row */}
                      <tr className="bg-white/[0.02] border-y border-white/10">
                        <td
                          colSpan={5}
                          className="p-3.5 px-5 text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/5"
                        >
                          {cat.category}
                        </td>
                      </tr>

                      {/* Items */}
                      {cat.items.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition"
                        >
                          <td className="p-4 px-5 text-xs sm:text-sm font-medium text-slate-200">
                            {item.feature}
                          </td>

                          {/* Free */}
                          <td className="p-4 text-center text-xs sm:text-sm text-slate-400">
                            {typeof item.free === 'boolean' ? (
                              item.free ? (
                                <Check size={16} className="text-emerald-400 mx-auto" />
                              ) : (
                                <X size={15} className="text-slate-600 mx-auto opacity-50" />
                              )
                            ) : (
                              <span>{item.free}</span>
                            )}
                          </td>

                          {/* Starter */}
                          <td className="p-4 text-center text-xs sm:text-sm text-slate-300">
                            {typeof item.starter === 'boolean' ? (
                              item.starter ? (
                                <Check size={16} className="text-emerald-400 mx-auto" />
                              ) : (
                                <X size={15} className="text-slate-600 mx-auto opacity-50" />
                              )
                            ) : (
                              <span>{item.starter}</span>
                            )}
                          </td>

                          {/* Pro (Highlighted) */}
                          <td className="p-4 text-center text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-500/5 border-x border-emerald-500/20">
                            {typeof item.pro === 'boolean' ? (
                              item.pro ? (
                                <Check size={18} className="text-emerald-400 mx-auto stroke-[2.5]" />
                              ) : (
                                <X size={15} className="text-slate-600 mx-auto opacity-50" />
                              )
                            ) : (
                              <span className="font-bold text-white">{item.pro}</span>
                            )}
                          </td>

                          {/* Business */}
                          <td className="p-4 text-center text-xs sm:text-sm text-slate-300">
                            {typeof item.business === 'boolean' ? (
                              item.business ? (
                                <Check size={16} className="text-teal-400 mx-auto" />
                              ) : (
                                <X size={15} className="text-slate-600 mx-auto opacity-50" />
                              )
                            ) : (
                              <span>{item.business}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Note */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 text-xs text-slate-400 px-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>All prices in INR. Taxes calculated at checkout according to Indian GST regulations.</span>
              </div>
              <a
                href="https://chat.aiaxom.co.in/upgrade"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Upgrade in 30 Seconds</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Payment Methods & Indian Trust Section */}
        <section className="py-16 sm:py-24 relative border-b border-white/5 bg-[#030712]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Box 1: Razorpay & UPI */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-5">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">100% Indian Payment Methods</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Pay seamlessly with Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, MasterCard, and Netbanking from 50+ Indian banks.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">UPI Autopay</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">RuPay</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Razorpay Secured</span>
                </div>
              </div>

              {/* Box 2: GST Invoices */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-teal-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-5">
                  <FileCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">GST Compliant Invoicing</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Add your company GSTIN during checkout to receive automated tax invoices for full Input Tax Credit (ITC) claiming.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Instant PDF Invoices</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">B2B Friendly</span>
                </div>
              </div>

              {/* Box 3: Cancel Anytime */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-5">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cancel Anytime with 1 Click</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  No hidden phone calls or dark patterns. Upgrade, downgrade, or cancel your subscription instantly from your settings dashboard.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Zero Lock-in</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Immediate Downgrade</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student & Academic Discount + Enterprise Custom LLMs */}
        <section className="py-16 sm:py-20 relative border-b border-white/5 bg-gradient-to-b from-[#040914] to-[#030712]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Student Card */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-emerald-950/30 border border-emerald-500/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-6">
                    <GraduationCap size={24} />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Education &amp; Research
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                    Student &amp; Academic Rebates
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Are you a student preparing for APSC, UPSC, Assam Police, or studying at Gauhati University, Cotton University, Tezpur University, or IIT Guwahati? We provide special educational subsidies and group lab licensing across Assam.
                  </p>
                </div>
                <div>
                  <a
                    href="mailto:support@aiaxom.co.in?subject=Student%20Discount%20Inquiry%20-%20Axom%20AI"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300 hover:text-emerald-200 transition"
                  >
                    <span>Request Student Discount</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              {/* Enterprise Card */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-teal-950/30 border border-teal-500/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-6">
                    <Building size={24} />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                    Enterprises &amp; Government
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                    Custom LLM &amp; Sovereign AI
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Need on-premise private deployment, customized RAG knowledge bases for regional government departments, news agencies, or bank compliant Assamese document pipelines? Our Guwahati engineering team builds turnkey solutions.
                  </p>
                </div>
                <div>
                  <a
                    href="mailto:support@aiaxom.co.in?subject=Enterprise%20and%20Government%20Inquiry%20-%20Axom%20AI"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 transition"
                  >
                    <span>Talk to Enterprise Sales</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing FAQs */}
        <section className="py-20 sm:py-28 relative border-b border-white/5 bg-[#030712]">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <HelpCircle size={14} /> Pricing FAQ
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Clear answers regarding our billing cycles, word quotas, payment methods, and cancellation policy.
              </p>
            </div>

            <PricingFaq />
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-[#040914] to-[#02050b]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0,transparent_70%)] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              Experience the Future of{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Assamese AI
              </span>{' '}
              Today
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto mb-8">
              Join thousands of students, researchers, lawyers, and businesses across Assam.
              Get started with 5,000 free words—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chat.aiaxom.co.in/"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Free (₹0)</span>
                <ArrowRight size={16} />
              </a>
              <a
                href="https://chat.aiaxom.co.in/upgrade"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <span>Upgrade to Pro (₹399/mo)</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                UPI &amp; RuPay Accepted
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                Cancel Anytime
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
