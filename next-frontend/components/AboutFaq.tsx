'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Languages } from 'lucide-react';
import { ABOUT_FAQS, AboutFaqItem } from './aboutFaqsData';

export default function AboutFaq({ faqs = ABOUT_FAQS }: { faqs?: AboutFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [filterLang, setFilterLang] = useState<'all' | 'en' | 'as'>('all');

  const filteredFaqs = faqs.filter((f) => {
    if (filterLang === 'all') return true;
    return f.lang === filterLang;
  });

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Language filter pills */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setFilterLang('all');
            setOpenIndex(0);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filterLang === 'all'
              ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          All Questions ({faqs.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterLang('en');
            setOpenIndex(0);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filterLang === 'en'
              ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          English Questions
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterLang('as');
            setOpenIndex(0);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition font-assamese ${
            filterLang === 'as'
              ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          অসমীয়া প্ৰশ্নোত্তৰ
        </button>
      </div>

      {filteredFaqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const isAssamese = faq.lang === 'as';

        return (
          <div
            key={idx}
            className={`rounded-2xl border transition duration-200 overflow-hidden ${
              isOpen
                ? 'bg-slate-900/80 border-fuchsia-500/40 shadow-lg shadow-fuchsia-950/20'
                : 'bg-slate-900/40 border-white/5 hover:border-white/15'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition"
              aria-expanded={isOpen}
            >
              <span
                className={`text-sm sm:text-base font-semibold text-white flex items-center gap-2.5 ${
                  isAssamese ? 'font-assamese' : ''
                }`}
              >
                <HelpCircle size={18} className="text-fuchsia-400 shrink-0" />
                <span>{faq.q}</span>
              </span>
              <div
                className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-fuchsia-300 bg-fuchsia-500/15' : ''
                }`}
              >
                <ChevronDown size={16} />
              </div>
            </button>

            {isOpen && (
              <div
                className={`px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150 ${
                  isAssamese ? 'font-assamese leading-relaxed text-sm' : ''
                }`}
              >
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
