import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Bot,
  PenTool,
  Image as ImageIcon,
  FileText,
  Code,
  Globe,
  FileCode,
  BarChart3,
  Languages,
  Star,
  Layers,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UseCasesSection from '@/components/UseCasesSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import { getLandingCMS } from '@/lib/api';

const CHAT_URL = 'https://chat.aiaxom.co.in/';

const TOOL_ICONS: Record<string, React.ElementType> = {
  'fa-solid fa-brain': Bot,
  'fa-solid fa-pen-nib': PenTool,
  'fa-solid fa-wand-magic-sparkles': ImageIcon,
  'fa-solid fa-file-pdf': FileText,
  'fa-solid fa-code': Code,
  'fa-solid fa-globe': Globe,
  'fa-solid fa-file-contract': FileCode,
  'fa-solid fa-chart-pie': BarChart3,
  'fa-solid fa-language': Languages,
};

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getLandingCMS();
  const seo = cms?.seo;

  return {
    title: seo?.meta_title || "Axom AI — The Power of AI for Everyone | Assam's Native AI Platform",
    description: seo?.meta_description || "Axom AI is Assam's first indigenous AI platform. Chat in native Assamese, generate AI visuals, and analyze documents.",
    keywords: seo?.meta_keywords?.split(',') || ['Axom AI', 'Assam AI', 'Assamese AI'],
    openGraph: {
      title: seo?.og_title || "Axom AI — Assam's Own AI Platform",
      description: seo?.og_description || "Native Assamese intelligence, ChatGPT-grade reasoning, and document tools.",
      url: 'https://aiaxom.co.in',
      images: [{ url: seo?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif' }],
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const cms = await getLandingCMS();

  const hero = cms?.hero;
  const logos = cms?.logos || [];
  const explore = cms?.explore;
  const testimonialsHeader = cms?.testimonials_header;
  const testimonials = testimonialsHeader?.items || [];
  const insightsHeader = cms?.insights_header;
  const articles = insightsHeader?.articles || [];

  return (
    <>
      <Navbar header={cms?.header} />

      <main className="flex-1 pt-20">
        
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://aiaxom.co.in/static/dist/hero/assam.avif')` }}
          />
          <div className="hero-overlay absolute inset-0" />

          <div className="relative max-w-5xl mx-auto px-5 text-center z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              {hero?.badge_text || 'অসমৰ নিজা AI প্লেটফৰ্ম • Axom AI 2.0'}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
              {hero?.main_heading_prefix || 'The Power of AI,'} <br />
              <span className="gradient-text">{hero?.main_heading_highlight || 'Rooted in Assam.'}</span>
            </h1>

            {/* Subheadings */}
            <p className="font-assamese text-base sm:text-xl text-fuchsia-200/90 font-medium mb-3 max-w-3xl mx-auto leading-relaxed">
              {hero?.subheading_assamese || 'অসমৰ প্ৰথমটো থলুৱা কৃত্ৰিম বুদ্ধিমত্তা সহায়ক — যিয়ে অসমীয়া ভাষা আৰু সংস্কৃতি সঠিকভাৱে বুজি পায়।'}
            </p>
            <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              {hero?.subheading_english || 'From fluent Assamese chat to instant image generation, document intelligence and automated workflows — built for the next generation of Assam.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a
                href={hero?.cta_primary_url || CHAT_URL}
                className="btn-primary text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-2xl"
              >
                <span>{hero?.cta_primary_text || 'Start Chatting Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={hero?.cta_secondary_url || '#tools'}
                className="btn-ghost text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2"
              >
                <span>{hero?.cta_secondary_text || 'Explore AI Tools'}</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                <span>{hero?.trust_badge_1 || 'No credit card required'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-fuchsia-400" />
                <span>{hero?.trust_badge_2 || 'Fast & secure'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-fuchsia-400" />
                <span>Encrypted &amp; Private</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== LOGO STRIP ==================== */}
        {logos.length > 0 && (
          <section className="border-y border-white/5 py-8 bg-black/40 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 mb-4 text-center">
              <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                {hero?.logo_strip_headline || 'Built with world-class AI models & infrastructure'}
              </span>
            </div>
            <div className="marquee">
              <div className="marquee-inner">
                {logos.concat(logos).map((logo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 font-semibold text-xs sm:text-sm whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== EXPLORE AI TOOLS ==================== */}
        {explore?.active && (
          <section id="tools" className="py-20 md:py-28 relative bg-[#06060b]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> {explore.badge || 'Explore'}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                  {explore.title_prefix || 'A Complete AI Toolkit'}{' '}
                  <span className="gradient-text">{explore.title_highlight || 'for Modern Needs'}</span>
                </h2>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {explore.subheading || 'Everything you need to be more productive, creative and informed — in one powerful platform.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(explore.features || []).map((f, i) => {
                  const Icon = TOOL_ICONS[f.icon_class] || Bot;
                  return (
                    <div
                      key={f.id || i}
                      className="glass-card rounded-2xl p-7 flex flex-col justify-between group hover:border-fuchsia-500/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/10 border border-fuchsia-500/30 grid place-items-center">
                            <Icon className="w-6 h-6 text-fuchsia-400" />
                          </div>
                          {f.badge && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-wider text-fuchsia-300">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                          {f.title}
                        </h3>
                        <div className="text-xs text-fuchsia-400/90 font-medium mb-3">{f.tagline}</div>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">{f.description}</p>
                      </div>

                      <a
                        href={f.action_url || CHAT_URL}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-400 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Try tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== USE CASES ==================== */}
        {cms?.usecases_header && <UseCasesSection header={cms.usecases_header} />}

        {/* ==================== TESTIMONIALS ==================== */}
        {testimonialsHeader?.active && testimonials.length > 0 && (
          <section className="py-20 md:py-28 relative border-t border-white/5 bg-[#05070e]">
            <div className="max-w-7xl mx-auto px-5 mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> {testimonialsHeader.badge || 'Testimonials'}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {testimonialsHeader.title_prefix || 'Loved by Users'}{' '}
                <span className="gradient-text">{testimonialsHeader.title_highlight || 'Across Assam'}</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                {testimonialsHeader.subheading || 'Real stories from students, creators and founders using Axom AI daily.'}
              </p>
            </div>

            <div className="testimonials-marquee">
              <div className="testimonials-inner">
                {testimonials.concat(testimonials).map((t, i) => (
                  <div
                    key={i}
                    className="w-[320px] sm:w-[380px] glass-card rounded-2xl p-6 flex flex-col justify-between shrink-0"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-4">
                        {[...Array(t.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="font-assamese text-sm text-gray-200 leading-relaxed mb-4 italic">
                        &ldquo;{t.quote_assamese}&rdquo;
                      </p>
                      {t.quote_english && (
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">&ldquo;{t.quote_english}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 grid place-items-center text-white font-bold text-xs shadow-md">
                        {t.avatar_initials || 'AK'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-gray-400">{t.role_designation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== PRICING PLANS ==================== */}
        {cms?.pricing_header && <PricingSection header={cms.pricing_header} />}

        {/* ==================== INSIGHTS / BLOG PREVIEW ==================== */}
        {insightsHeader?.active && articles.length > 0 && (
          <section id="insights" className="py-20 md:py-28 relative border-t border-white/5 bg-[#06060b]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> {insightsHeader.badge || 'Insights'}
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                    {insightsHeader.title_prefix || 'Learn, Explore &'}{' '}
                    <span className="gradient-text">{insightsHeader.title_highlight || 'Stay Updated'}</span>
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
                    {insightsHeader.subheading || 'Guides, tips and stories from the Axom AI team and community.'}
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="text-fuchsia-400 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  <span>{insightsHeader.view_all_text || 'View all articles'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((art, i) => {
                  const fallbackGradients = [
                    'from-fuchsia-600 via-purple-600 to-indigo-800',
                    'from-pink-600 via-rose-600 to-purple-800',
                    'from-amber-500 via-orange-600 to-red-700',
                    'from-cyan-500 via-blue-600 to-indigo-800',
                  ];
                  const grad = fallbackGradients[i % fallbackGradients.length];

                  return (
                    <Link
                      key={art.id}
                      href={art.link || `/blog/${art.slug}/`}
                      className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg shadow-black/40 hover:shadow-fuchsia-500/10"
                    >
                      {/* Top Image Banner */}
                      <div className={`h-40 relative overflow-hidden shrink-0 bg-gradient-to-br ${grad}`}>
                        {art.cover_image_url ? (
                          <img
                            src={art.cover_image_url}
                            alt={art.title}
                            className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 grid-bg opacity-30" />
                            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Category Badge on Image */}
                        <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-white font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 z-10 shadow-md">
                          {art.category_label || art.category}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="text-[11px] text-gray-400 font-medium mb-2 flex items-center justify-between">
                            <span>{art.published_at || 'Recent'}</span>
                            <span className="flex items-center gap-1 text-fuchsia-300">
                              <Clock className="w-3 h-3" /> {art.read_time}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors leading-snug line-clamp-2">
                            {art.title}
                          </h3>

                          <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                            {art.excerpt}
                          </p>
                        </div>

                        {/* Bottom Read Button */}
                        <div className="text-xs font-semibold text-fuchsia-400 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-3 border-t border-white/5 mt-auto">
                          <span>Read article</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== FAQ ==================== */}
        {cms?.faqs && <FAQSection faqs={cms.faqs} />}

        {/* ==================== FINAL CTA ==================== */}
        <section className="assam-bg py-24 md:py-32 relative border-t border-white/10">
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Start Today
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Ready to Experience the Future of AI in Assam?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Join students, creators, developers, and businesses unlocking new possibilities every day with Axom AI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={CHAT_URL}
                className="btn-primary text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-2xl"
              >
                <span>Start Chatting Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/blog"
                className="btn-ghost text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2"
              >
                <span>Read Blog &amp; Insights</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer footer={cms?.footer} seo={cms?.seo} />
    </>
  );
}
