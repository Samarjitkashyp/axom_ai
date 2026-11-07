'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { CONTACT_FAQS, ContactFaq } from './contactData';

interface ContactFaqInteractiveProps {
  faqs?: Array<{
    id?: string | number;
    question: string;
    answer: string;
    category?: string;
  }>;
}

export default function ContactFaqInteractive({ faqs }: ContactFaqInteractiveProps) {
  const faqList = (faqs && faqs.length > 0)
    ? faqs.map((f, i) => ({
        id: String(f.id ?? `faq-${i}`),
        question: f.question,
        answer: f.answer,
        category: f.category || 'General & Support',
      }))
    : CONTACT_FAQS;

  const [openId, setOpenId] = useState<string | null>(faqList[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {faqList.map((faq, index) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl transition-all duration-200 border ${
              isOpen
                ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                : 'bg-white/80 dark:bg-slate-900/50 border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/30 dark:hover:bg-slate-800/60'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none group"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                    isOpen
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/70 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-emerald-900/10 dark:border-white/5'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <span className="text-sm sm:text-base font-semibold text-emerald-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                    {faq.question}
                  </span>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                    {faq.category}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-600 dark:text-gray-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed border-t border-emerald-900/10 dark:border-white/5 animate-in fade-in duration-150">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

