'use client';

import React, { useState } from 'react';
import { ArticleFAQItem } from '../lib/api';

interface Props {
  faqs: ArticleFAQItem[];
}

export default function ArticleFaqAccordion({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-200/80 dark:border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-700 to-fuchsia-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-purple-500/25">
          <i className="fa-solid fa-circle-question" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/40">
              Knowledge Base
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Clear, authoritative answers regarding key capabilities and facts
          </p>
        </div>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const qNum = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-slate-900/80 border-2 border-purple-500/70 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/10'
                  : 'bg-white/90 dark:bg-slate-900/40 border border-slate-200/90 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Question Header Button */}
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 sm:px-7 py-5 text-left flex items-center justify-between gap-4 group transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 transition-colors shadow-xs ${
                      isOpen
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                    }`}
                  >
                    Q{qNum}
                  </span>
                  <span
                    className={`font-bold text-base sm:text-lg leading-snug transition-colors ${
                      isOpen
                        ? 'text-purple-900 dark:text-purple-300'
                        : 'text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300'
                    }`}
                  >
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                    isOpen
                      ? 'bg-purple-600 text-white rotate-180 shadow-md shadow-purple-500/30'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                  }`}
                >
                  <i className="fa-solid fa-chevron-down" />
                </div>
              </button>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-5 sm:px-7 pb-6 pt-3 text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                  <div
                    className="text-sm sm:text-base leading-relaxed space-y-3 [&_a]:text-purple-700 dark:[&_a]:text-purple-400 [&_a]:underline [&_a]:font-bold [&_a:hover]:text-purple-600 dark:[&_a:hover]:text-purple-300 [&_strong]:text-slate-950 dark:[&_strong]:text-white [&_strong]:font-bold [&_b]:text-slate-950 dark:[&_b]:text-white [&_b]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 [&_li]:text-slate-800 dark:[&_li]:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
