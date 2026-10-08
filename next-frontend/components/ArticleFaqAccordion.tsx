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
    <section className="mt-14 pt-10 border-t border-emerald-900/15 dark:border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white grid place-items-center text-base font-bold shadow-md shadow-purple-500/20">
          <i className="fa-solid fa-circle-question" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            Essential takeaways and answers regarding this topic
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-emerald-900/15 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-purple-500/40"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-emerald-950 dark:text-white hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex-1 leading-snug">{faq.question}</span>
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-purple-600 text-white rotate-180'
                      : 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  <i className="fa-solid fa-chevron-down" />
                </span>
              </button>

              {isOpen && (
                <div
                  className="px-5 sm:px-6 pb-5 pt-1 text-sm text-slate-800 dark:text-gray-300 leading-relaxed border-t border-emerald-900/10 dark:border-white/5 bg-purple-50/20 dark:bg-black/20 [&_a]:text-purple-700 dark:[&_a]:text-fuchsia-400 [&_a]:underline [&_a:hover]:text-purple-600 dark:[&_a:hover]:text-fuchsia-300 [&_strong]:text-emerald-950 dark:[&_strong]:text-white [&_b]:text-emerald-950 dark:[&_b]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
