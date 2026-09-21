import React, { type ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';
import Footer from '../Footer';
import ToolPageFaq from './ToolPageFaq';
import type { ToolPageData } from '../../lib/toolPageTypes';
import {
  FileText,
  Sparkles,
  CheckCircle,
  Check,
  X as XIcon,
  ArrowRight,
  Globe2,
} from 'lucide-react';

interface ToolPageTemplateProps {
  data: ToolPageData;
  children?: ReactNode;
}

const STEP_ACCENTS = [
  { bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400' },
  { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/25', text: 'text-fuchsia-400' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400' },
];

export default function ToolPageTemplate({ data, children }: ToolPageTemplateProps) {
  // --- JSON-LD Schemas ---
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: data.appName,
    alternateName: data.appAlternateNames || [],
    url: data.canonicalUrl,
    description: data.appDescription || data.metaDescription,
    applicationCategory: data.appCategory || 'BusinessApplication, UtilitiesApplication',
    operatingSystem: data.appOperatingSystem || 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: data.appFeatureList || [],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: data.appVersion || '2.5',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.appRatingValue || '4.9',
      reviewCount: data.appReviewCount || '3420',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.howToSchemaName || data.howItWorksTitle || `How to Use ${data.heroHeadingHighlight}`,
    description: data.howToSchemaDescription || data.howItWorksSubheading || '',
    totalTime: data.howToTotalTime || 'PT10S',
    tool: { '@type': 'HowToTool', name: data.howToToolName || data.appName },
    step: data.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.description,
      url: `${data.canonicalUrl}#converter`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aiaxom.co.in/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aiaxom.co.in/tools' },
      { '@type': 'ListItem', position: 3, name: data.breadcrumbName, item: data.canonicalUrl },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description: "Axom AI is India and Assam's leading sovereign artificial intelligence and intelligent document processing platform.",
    sameAs: [
      'https://twitter.com/axom_ai',
      'https://github.com/Samarjitkashyp/axom_ai',
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <Navbar />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* HERO SECTION */}
          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span>{data.heroBadgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {data.heroHeadingPrefix}{' '}
              <span className="gradient-text">{data.heroHeadingHighlight}</span>{' '}
              {data.heroHeadingSuffix}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {data.heroDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              {data.heroTags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                  <Check size={14} className="text-emerald-400" /> {tag}
                </span>
              ))}
            </div>
          </section>

          {/* CONVERTER WIDGET (children slot) */}
          {children && (
            <section id="converter" className="mb-14">
              {children}
            </section>
          )}

          {/* AEO DIRECT ANSWER & GENERATIVE ENGINE SUMMARY BOX */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1 shadow-inner">
                  <Sparkles size={22} className="text-fuchsia-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <span>Quick Answer &bull; Generative Engine Summary</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {data.aeoTitle}
                  </h2>
                  <p
                    className="text-slate-300 text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.aeoDescription }}
                  />
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    {data.aeoHighlights.map((h, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle size={16} /> {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {data.howItWorksTitle || `How to Use ${data.heroHeadingHighlight} in ${data.steps.length} Easy Steps`}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {data.howItWorksSubheading || 'No complex software installation or account creation required. Fast, reliable, and frictionless.'}
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.steps.length, 4)} gap-6`}>
              {data.steps.map((step, idx) => {
                const accent = STEP_ACCENTS[idx % STEP_ACCENTS.length];
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                    <div className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center ${accent.text} font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition`}>
                      {idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BENEFITS */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {data.benefitsTitle || `Why Axom AI ${data.heroHeadingHighlight} is the Superior Choice`}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {data.benefitsSubheading || 'Engineered for students, educators, legal professionals, and businesses who demand accuracy and privacy.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.benefits.map((b, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                    {b.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* USE CASES */}
          {data.useCases.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                  <span>Versatile Applications</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {data.useCasesTitle || 'Tailored for Every Workflow & Industry'}
                </h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                  {data.useCasesSubheading || 'Discover why users across industries choose Axom AI for mission-critical conversions.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {data.useCases.map((uc, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                      {uc.icon}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white">{uc.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{uc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COMPARISON TABLE */}
          {data.comparisonRows.length > 0 && (
            <section className="mb-20 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                  <span>{data.comparisonBadge || 'Direct Feature Comparison'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {data.comparisonTitle || `Axom AI vs. Traditional ${data.heroHeadingHighlight}s`}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {data.comparisonSubheading || 'See why users choose Axom AI over paywalled and ad-heavy alternatives.'}
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                      <th className="p-4 sm:p-5 font-semibold">Feature / Capability</th>
                      <th className="p-4 sm:p-5 font-bold text-purple-300 bg-purple-500/10 border-x border-purple-500/20">Axom AI</th>
                      <th className="p-4 sm:p-5 font-medium text-slate-400">Other Free Tools</th>
                      <th className="p-4 sm:p-5 font-medium text-slate-400">Paid Commercial Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {data.comparisonRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                        <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                          <Check size={16} className="text-emerald-400 shrink-0" />
                          <span>{row.axom}</span>
                        </td>
                        <td className="p-4 sm:p-5 text-slate-400">
                          {row.other_check === false ? (
                            <span className="text-rose-400 flex items-center gap-1.5">
                              <XIcon size={16} className="text-rose-400 shrink-0" />
                              <span>{row.other}</span>
                            </span>
                          ) : (
                            row.other
                          )}
                        </td>
                        <td className="p-4 sm:p-5 text-slate-400">{row.paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TECHNICAL SPECIFICATIONS */}
          {data.techSpecs.length > 0 && (
            <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText size={22} className="text-purple-400" />
                <span>{data.techSpecTitle || 'Technical Specifications & Supported Standards'}</span>
              </h2>

              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(data.techSpecs.length, 4)} gap-6 text-xs sm:text-sm`}>
                {data.techSpecs.map((spec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{spec.label}</div>
                    <div className="text-white font-medium">{spec.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INDIA & REGIONAL SECTION */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-purple-950/20 border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Globe2 size={28} />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <span>{data.regionalBadge || "🇮🇳 India's Sovereign AI & Document Platform"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {data.regionalTitle || 'Fast, Secure & Regional Unicode Ready Document Conversion in India'}
                </h2>
                <p
                  className="text-slate-300 text-xs sm:text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: data.regionalDescription }}
                />
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {data.faqTitle || 'Frequently Asked Questions (FAQ)'}
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                {data.faqSubheading || 'Got questions? Find verified answers below.'}
              </p>
            </div>

            <ToolPageFaq faqs={data.faqs} />
          </section>

          {/* BOTTOM CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {data.ctaTitle || `Start Using ${data.heroHeadingHighlight} Now`}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              {data.ctaDescription || 'Experience fast, private, and watermark-free conversions trusted by users across Assam and India.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={data.ctaPrimaryUrl || '#converter'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
              >
                {data.ctaPrimaryText || 'Get Started Now'}
              </a>
              <Link
                href={data.ctaSecondaryUrl || '/tools'}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <span>{data.ctaSecondaryText || 'Explore All AI & Document Tools'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
