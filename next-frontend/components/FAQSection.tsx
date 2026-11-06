'use client';

import React, { useState } from 'react';
import { Plus, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { HOME_FAQS } from './homeFaqsData';

export interface FAQItem {
  id?: number | string;
  question?: string;
  q?: string;
  answer?: string;
  a?: string;
  category?: string;
}

export interface FAQSectionProps {
  /** Array of FAQs. Supports both { question, answer } and { q, a } formats */
  faqs?: FAQItem[];
  /** Badge text above heading (default: "Questions & Answers") */
  badge?: string;
  /** Main heading prefix (default: "Frequently Asked") */
  title?: string;
  /** Highlighted part of heading with gradient (default: "Questions") */
  titleHighlight?: string;
  /** Optional heading suffix after highlight */
  titleSuffix?: string;
  /** Subtitle/description paragraph */
  description?: string;
  /** Section HTML id (default: "faq") */
  id?: string;
  /** Primary accent styling ('emerald' | 'fuchsia', default: 'emerald') */
  accentColor?: 'emerald' | 'fuchsia';
  /** Whether to show the right-side sticky support card (default: true) */
  showSupportCard?: boolean;
  /** Custom support card image path (default: "/faq-assistant.jpg") */
  supportImage?: string;
  /** Alt text for support card image */
  supportImageAlt?: string;
  /** Floating badge text at bottom-left of image */
  supportBadgeTop?: string;
  /** Floating location text at bottom-right of image */
  supportBadgeLocation?: string;
  /** Small category title above card heading */
  supportCategory?: string;
  /** Support card main heading */
  supportTitle?: string;
  /** Support card description text */
  supportDescription?: string;
  /** Primary action button label */
  chatButtonText?: string;
  /** Primary action button URL */
  chatButtonUrl?: string;
  /** Secondary action button label */
  emailButtonText?: string;
  /** Secondary action button URL */
  emailButtonUrl?: string;
  /** Custom outer container classes */
  className?: string;
}

export default function FAQSection({
  faqs,
  badge = 'Questions & Answers',
  title = 'Frequently Asked',
  titleHighlight = 'Questions',
  titleSuffix = '',
  description = 'Everything you need to know about Axom AI, our indigenous models, Assamese language capabilities, public utility tools, and sovereign data residency.',
  id = 'faq',
  accentColor = 'emerald',
  showSupportCard = true,
  supportImage = '/faq-assistant.jpg',
  supportImageAlt = 'Axom AI Knowledge & Support',
  supportBadgeTop = 'Indigenous AI Intelligence',
  supportBadgeLocation = 'Guwahati, Assam',
  supportCategory = 'Have Additional Questions?',
  supportTitle = "Direct Support from Assam's AI Research Team",
  supportDescription = "Can't find what you're looking for? Whether you are a student, developer, academic institution, or enterprise, our local team is ready to help.",
  chatButtonText = 'Ask Axom AI Assistant Free',
  chatButtonUrl = 'https://chat.aiaxom.co.in/',
  emailButtonText = 'Email Support (support@aiaxom.co.in)',
  emailButtonUrl = 'mailto:support@aiaxom.co.in',
  className = '',
}: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const rawItems = faqs && faqs.length > 0 ? faqs : HOME_FAQS;

  // Normalize FAQ items to support both { question, answer } and { q, a }
  const items = rawItems.map((item, idx) => ({
    id: item.id ?? idx,
    question: item.question || item.q || '',
    answer: item.answer || item.a || '',
    category: item.category || 'general',
  }));

  const isFuchsia = accentColor === 'fuchsia';

  // Accent styling mappings
  const badgeClasses = isFuchsia
    ? 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-800 dark:text-fuchsia-300'
    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300';

  const itemOpenClasses = isFuchsia
    ? 'border-fuchsia-500/50 bg-white/95 dark:bg-slate-900/90 shadow-lg'
    : 'border-emerald-500/50 bg-white/95 dark:bg-slate-900/90 shadow-lg';

  const iconOpenClasses = isFuchsia
    ? 'bg-fuchsia-600 text-white rotate-45 shadow-sm'
    : 'bg-emerald-600 text-white rotate-45 shadow-sm';

  const supportCategoryClasses = isFuchsia
    ? 'text-fuchsia-700 dark:text-fuchsia-400'
    : 'text-emerald-700 dark:text-emerald-400';

  const secondaryBtnHoverClasses = isFuchsia
    ? 'hover:border-fuchsia-500'
    : 'hover:border-emerald-500';

  return (
    <section
      id={id}
      className={`py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider mb-4 ${badgeClasses}`}
          >
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
            {title}{' '}
            {titleHighlight && <span className="gradient-text">{titleHighlight}</span>}
            {titleSuffix && ` ${titleSuffix}`}
          </h2>
          {description && (
            <p className="text-slate-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Dynamic Layout Grid (2 Columns if Support Card is enabled, 1 Column Centered if disabled) */}
        <div
          className={
            showSupportCard
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start'
              : 'max-w-4xl mx-auto space-y-3.5'
          }
        >
          {/* FAQ Accordion List */}
          <div className={showSupportCard ? 'lg:col-span-7 space-y-3.5' : 'space-y-3.5'}>
            {items.map((f, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={f.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? itemOpenClasses
                      : 'border-emerald-900/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:border-emerald-900/30 dark:hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-emerald-950 dark:text-white text-sm sm:text-base leading-snug">
                      {f.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? iconOpenClasses
                          : 'bg-emerald-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-emerald-900/10 dark:border-white/5 space-y-2">
                      <p>{f.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Image & Support Card (5 Cols, Sticky) */}
          {showSupportCard && (
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/85 dark:bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md flex flex-col">
                
                {/* 3D AI Assistant Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-black group">
                  <img
                    src={supportImage}
                    alt={supportImageAlt}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Floating Tags over Image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                      {supportBadgeTop}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      {supportBadgeLocation}
                    </span>
                  </div>
                </div>

                {/* Support Card Body */}
                <div className="p-6 sm:p-7 flex flex-col justify-between">
                  <div className="mb-6">
                    <div
                      className={`text-[11px] font-black uppercase tracking-wider mb-2 ${supportCategoryClasses}`}
                    >
                      {supportCategory}
                    </div>
                    <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
                      {supportTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed">
                      {supportDescription}
                    </p>
                  </div>

                  {/* Action CTAs */}
                  <div className="space-y-3 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                    <a
                      href={chatButtonUrl}
                      target={chatButtonUrl.startsWith('http') ? '_blank' : undefined}
                      rel={chatButtonUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="btn-primary w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
                    >
                      <MessageSquare size={16} />
                      <span>{chatButtonText}</span>
                    </a>
                    <a
                      href={emailButtonUrl}
                      className={`w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 ${secondaryBtnHoverClasses} text-slate-800 dark:text-slate-200 inline-flex items-center justify-center gap-2 transition bg-white/50 dark:bg-slate-800/50`}
                    >
                      <Mail size={15} />
                      <span>{emailButtonText}</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
