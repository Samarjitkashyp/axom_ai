'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { PRICING_FAQS, PricingFaqItem } from './pricingData';

export default function PricingFaq({ faqs = PRICING_FAQS }: { faqs?: PricingFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition duration-200 overflow-hidden ${
              isOpen
                ? 'bg-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-900/40 border-white/5 hover:border-white/15'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-white flex items-center gap-2.5">
                <HelpCircle size={18} className="text-emerald-400 shrink-0" />
                <span>{faq.q}</span>
              </span>
              <div
                className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-emerald-300 bg-emerald-500/15' : ''
                }`}
              >
                <ChevronDown size={16} />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
