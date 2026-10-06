'use client';

import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';

import { HOME_FAQS } from './homeFaqsData';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items = faqs && faqs.length > 0 ? faqs : HOME_FAQS;

  return (
    <section id="faq" className="py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
      <div className="max-w-3xl mx-auto px-5 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Questions &amp; Answers
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={f.id || i}
                className="border border-emerald-900/15 dark:border-white/10 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/60 transition hover:border-emerald-900/25 dark:hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-semibold text-emerald-950 dark:text-white text-sm sm:text-base">{f.question}</span>
                  <span
                    className={`text-fuchsia-700 dark:text-fuchsia-400 text-xl font-bold transition-transform shrink-0 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-700 dark:text-gray-300 leading-relaxed border-t border-emerald-900/10 dark:border-white/5">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
