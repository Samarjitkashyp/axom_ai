'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { CONTACT_FAQS } from './contactData';

export default function ContactFaqInteractive() {
  const [openId, setOpenId] = useState<string | null>(CONTACT_FAQS[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {CONTACT_FAQS.map((faq, index) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl transition-all duration-200 border ${
              isOpen
                ? 'bg-white/[0.06] border-fuchsia-500/40 shadow-xl shadow-fuchsia-500/5'
                : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                    isOpen
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/5'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <span className="text-sm sm:text-base font-semibold text-white group-hover:text-fuchsia-200 transition">
                    {faq.question}
                  </span>
                  <div className="text-[11px] text-fuchsia-400/80 mt-0.5 font-medium">
                    {faq.category}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-fuchsia-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
