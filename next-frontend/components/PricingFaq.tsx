'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { PRICING_FAQS, PricingFaqItem } from './pricingData';

interface PricingFaqProps {
  faqs?: PricingFaqItem[];
}

export default function PricingFaq({ faqs = PRICING_FAQS }: PricingFaqProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items = faqs && faqs.length > 0 ? faqs : PRICING_FAQS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* Left Column: FAQ Accordion List (7 Cols) */}
      <div className="lg:col-span-7 space-y-3.5">
        {items.map((f: any, i: number) => {
          const isOpen = openIdx === i;
          const q = f.q || f.question;
          const a = f.a || f.answer;
          return (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                isOpen
                  ? 'border-fuchsia-500/50 bg-white/95 dark:bg-slate-900/90 shadow-lg'
                  : 'border-emerald-900/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:border-emerald-900/30 dark:hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-emerald-950 dark:text-white text-sm sm:text-base leading-snug">
                  {q}
                </span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-fuchsia-600 text-white rotate-45 shadow-sm'
                      : 'bg-emerald-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-emerald-900/10 dark:border-white/5 space-y-2">
                  <p>{a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Column: Visual Image & Support Card (5 Cols, Sticky) */}
      <div className="lg:col-span-5 lg:sticky lg:top-28">
        <div className="rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/85 dark:bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md flex flex-col">
          
          {/* Premium 3D AI Assistant Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-black group">
            <img
              src="/faq-assistant.jpg"
              alt="Axom AI Pricing & Plan Support"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            
            {/* Floating Tag over Image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                Transparent INR Billing
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Guwahati, Assam
              </span>
            </div>
          </div>

          {/* Support Card Body */}
          <div className="p-6 sm:p-7 flex flex-col justify-between">
            <div className="mb-6">
              <div className="text-[11px] font-black uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-400 mb-2">
                Have Billing or Plan Questions?
              </div>
              <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
                Direct Support from Assam&apos;s AI Billing Team
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed">
                Need help choosing the right plan, setting up GST invoicing, or custom quotas for educational institutions or organizations? We&apos;re here for you.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-emerald-900/10 dark:border-white/5">
              <a
                href="https://chat.aiaxom.co.in/"
                className="btn-primary w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Ask Axom AI Assistant Free</span>
              </a>
              <a
                href="mailto:support@aiaxom.co.in?subject=Pricing%20and%20Billing%20Inquiry%20-%20Axom%20AI"
                className="w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:border-fuchsia-500 text-slate-800 dark:text-slate-200 inline-flex items-center justify-center gap-2 transition bg-white/50 dark:bg-slate-800/50"
              >
                <Mail size={15} />
                <span>Email Support (support@aiaxom.co.in)</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
