import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PdfToPngConverter from '../../../components/tools/PdfToPngConverter';
import PdfToPngFaq from '../../../components/tools/PdfToPngFaq';
import { PDF_TO_PNG_FAQS } from '../../../components/tools/pdfToPngData';
import { getPdfToPngCMS } from '../../../lib/api';
import {
  FileText,
  Shield,
  Zap,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  Smartphone,
  Award,
  Check,
  X as XIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPdfToPngCMS();

  const title = cms?.meta_title || 'Free PDF to PNG Converter Online — Extract PDF Pages as PNG | Axom AI';
  const description =
    cms?.meta_description ||
    'Convert PDF files to lossless PNG images online for free in seconds. Extract every page as a transparent, high-resolution PNG. 100% secure with automatic file deletion.';
  const canonicalUrl = cms?.canonical_url || 'https://aiaxom.co.in/tools/pdf-to-png/';
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';
  const keywords = cms?.meta_keywords
    ? cms.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [
        'pdf to png', 'convert pdf to png', 'pdf pages to png', 'extract pdf as png',
        'lossless pdf conversion', 'pdf to image converter', 'pdf to png online free',
        'pdf to transparent png', 'axom ai tools', 'best free pdf to png converter',
      ];

  return {
    title, description, keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title, description, url: canonicalUrl, siteName: 'Axom AI', type: 'website', locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function PdfToPngPage() {
  const cms = await getPdfToPngCMS();
  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : PDF_TO_PNG_FAQS;

  const webAppSchema = {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Axom AI PDF to PNG Converter',
    url: cms?.canonical_url || 'https://aiaxom.co.in/tools/pdf-to-png/',
    description: cms?.meta_description || 'Free online utility by Axom AI to convert PDF pages into lossless, transparent PNG images.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All (Web Browser, Windows, macOS, Linux, Android, iOS)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      '100% Free PDF to PNG conversion', 'Lossless image quality with transparency support',
      'No watermark added to output files', 'Zero user registration or login required',
      '256-bit SSL encrypted transfer with automatic file purging',
      `Supports PDF files up to ${cms?.max_file_size_mb || 25} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '2.0',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '890' },
  };

  const howToSchema = {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: cms?.how_it_works_title || 'How to Convert PDF to PNG in 3 Easy Steps',
    description: cms?.how_it_works_subheading || 'Step-by-step guide to extract PDF pages as lossless PNG images online in seconds.',
    totalTime: 'PT30S',
    step: [
      { '@type': 'HowToStep', position: 1, name: cms?.step_1_title || 'Upload Your PDF', text: cms?.step_1_desc || 'Drag and drop your PDF file into the converter or click to browse files.', url: 'https://aiaxom.co.in/tools/pdf-to-png/#converter' },
      { '@type': 'HowToStep', position: 2, name: cms?.step_2_title || 'Instant Processing', text: cms?.step_2_desc || 'Click Convert. Our engine renders each page as a high-resolution PNG image in seconds.', url: 'https://aiaxom.co.in/tools/pdf-to-png/#converter' },
      { '@type': 'HowToStep', position: 3, name: cms?.step_3_title || 'Download PNG Images', text: cms?.step_3_desc || 'Download your lossless PNG images. Multi-page PDFs are delivered as a ZIP archive.', url: 'https://aiaxom.co.in/tools/pdf-to-png/#converter' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: activeFaqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aiaxom.co.in/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://chat.aiaxom.co.in/tools' },
      { '@type': 'ListItem', position: 3, name: 'PDF to PNG Converter', item: cms?.canonical_url || 'https://aiaxom.co.in/tools/pdf-to-png/' },
    ],
  };

  const comparisonRows = cms?.comparison_matrix && cms.comparison_matrix.length > 0 ? cms.comparison_matrix : [
    { feature: 'Daily Limit & Cost', axom: 'Free 20 files/day (Unlimited on Pro)', other: '1-2 files per day limit', paid: '$10 - $20 / month', axom_check: true, other_check: false },
    { feature: 'Batch Conversion', axom: 'Up to 20 files at once (Pro)', other: 'Single file only', paid: 'Supported (Paid only)', axom_check: true, other_check: false },
    { feature: 'Watermarks', axom: 'Never (100% Clean)', other: 'Added to images', paid: 'Clean (Paid only)', axom_check: true, other_check: false },
    { feature: 'Account / Registration', axom: 'No signup needed', other: 'Often forced signup', paid: 'Required signup + Card', axom_check: true, other_check: false },
    { feature: 'Document Privacy', axom: 'Auto-purged immediately', other: 'Stored up to 24 hours', paid: 'Cloud stored', axom_check: true, other_check: false },
    { feature: 'Image Quality', axom: 'Lossless PNG with transparency', other: 'Low-res, no transparency', paid: 'High quality', axom_check: true, other_check: false },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Navbar />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Files / Day • 👑 Pro: Batch Convert 20 Files at Once'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="gradient-text">{cms?.hero_heading_highlight || 'PDF to PNG'}</span>{' '}
              {cms?.hero_heading_suffix || 'Converter Online'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {cms?.hero_description || 'Extract every page of your PDF as a lossless, transparent PNG image instantly. Free accounts can convert up to 20 files per day. Upgrade to Premium for unlimited daily conversions and Pro Batch Mode!'}
            </p>
          </section>

          <section id="converter" className="mb-20">
            <PdfToPngConverter freeDailyLimit={cms?.free_daily_limit} proBatchLimit={cms?.pro_batch_limit} maxFileSizeMb={cms?.max_file_size_mb} />
          </section>

          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.how_it_works_title || 'How to Convert PDF to PNG in 3 Easy Steps'}</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">{cms?.how_it_works_subheading || 'No complex software installation or account creation required. Fast and frictionless.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">1</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload PDF'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_1_desc || 'Drag and drop your PDF file into the converter box above or choose it from your device.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">2</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Instant Processing'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_2_desc || 'Click Convert. Our engine renders each PDF page as a high-resolution, lossless PNG image.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">3</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download PNG Images'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_3_desc || 'Download your lossless PNG images directly. Multi-page PDFs are packaged into a ZIP archive.'}</p>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.why_title || 'Why Axom AI PDF to PNG is the Superior Choice'}</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">{cms?.why_subheading || 'Engineered for designers, developers, students, and professionals who demand lossless quality.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4"><Award size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Lossless PNG Quality'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_1_desc || 'Every page is rendered as a pixel-perfect PNG with full transparency support and no compression artifacts.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4"><Shield size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Free'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_2_desc || 'No hidden subscription traps or promotional watermarks. Clean images ready for presentations and designs.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4"><Lock size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Automatic File Purging'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_3_desc || 'Documents are processed securely via SSL encryption and purged automatically from our server memory right after conversion.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4"><Smartphone size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Universal Device Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_4_desc || 'Works seamlessly on iOS, Android, macOS, Windows, and Linux. No apps or browser extensions needed.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4"><Zap size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-3-Second Speed'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_5_desc || 'High-speed optimized micro-services render PDF pages in less than 3 seconds.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4"><Layers size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Transparency Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_6_desc || 'PNG output supports alpha transparency — perfect for overlays, design mockups, and web graphics.'}</p>
              </div>
            </div>
          </section>

          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2"><span>{cms?.comparison_badge || 'Direct Feature Comparison'}</span></div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{cms?.comparison_title || 'Axom AI vs. Traditional PDF to PNG Converters'}</h2>
              <p className="text-slate-400 text-xs sm:text-sm">{cms?.comparison_subheading || 'See why users choose Axom AI over paywalled and ad-heavy alternatives.'}</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Feature / Capability</th>
                    <th className="p-4 sm:p-5 font-bold text-purple-300 bg-purple-500/10 border-x border-purple-500/20">Axom AI Converter</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Other Free Converters</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Paid Commercial Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5"><Check size={16} className="text-emerald-400 shrink-0" /><span>{row.axom}</span></td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.other_check === false ? (<span className="text-rose-400 flex items-center gap-1.5"><XIcon size={16} className="text-rose-400 shrink-0" /><span>{row.other}</span></span>) : row.other}</td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.paid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={22} className="text-purple-400" />
              <span>{cms?.tech_spec_title || 'Technical Specifications & Supported Standards'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Supported Input</div><div className="text-white font-medium">{cms?.tech_spec_inputs || '.pdf (PDF 1.0 – 2.0)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Output Format</div><div className="text-white font-medium">{cms?.tech_spec_output || 'PNG (Lossless, Transparent)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Maximum File Size</div><div className="text-white font-medium">{cms?.tech_spec_max_size || '25 Megabytes (MB)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Security Protocol</div><div className="text-white font-medium">{cms?.tech_spec_security || 'TLS 1.3 / SSL 256-bit'}</div></div>
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.faq_section_title || 'Frequently Asked Questions'}</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">{cms?.faq_section_subheading || 'Got questions about PDF to PNG conversion? Find verified answers below.'}</p>
            </div>
            <PdfToPngFaq faqs={activeFaqs} />
          </section>

          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{cms?.cta_title || 'Convert Your PDF Pages to PNG in Seconds'}</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">{cms?.cta_desc || 'Experience fast, private, and watermark-free conversions trusted by users across Assam and India.'}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={cms?.cta_btn_primary_url || '#converter'} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition">{cms?.cta_btn_primary_text || 'Upload PDF File Now'}</a>
              <a href={cms?.cta_btn_secondary_url || 'https://chat.aiaxom.co.in/tools'} className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition flex items-center justify-center gap-2"><span>{cms?.cta_btn_secondary_text || 'Explore All AI & Document Tools'}</span><ArrowRight size={15} /></a>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
