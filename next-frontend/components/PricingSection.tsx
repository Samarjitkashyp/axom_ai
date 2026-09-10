'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { PricingPlan } from '@/lib/api';

const CHAT_URL = 'https://chat.aiaxom.co.in/';
const UPGRADE_URL = 'https://chat.aiaxom.co.in/upgrade';

interface PricingSectionProps {
  header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    yearly_discount_badge: string;
    footer_note: string;
    active: boolean;
    plans: PricingPlan[];
  };
}

export default function PricingSection({ header }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);

  if (!header.active || !header.plans || header.plans.length === 0) return null;

  return (
    <section id="pricing" className="py-20 md:py-28 relative border-t border-white/5 bg-[#05070e]">
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> {header.badge || 'Pricing'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {header.title_prefix || 'Simple,'}{' '}
            <span className="gradient-text">{header.title_highlight || 'Transparent Pricing'}</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {header.subheading || 'Choose a plan that fits your needs. Upgrade or cancel anytime.'}
          </p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className={`text-xs sm:text-sm font-semibold ${!yearly ? 'text-white' : 'text-gray-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            role="switch"
            aria-checked={yearly}
            className="w-14 h-7 rounded-full bg-white/10 border border-white/20 relative p-1 transition-colors focus:outline-none"
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-transform ${
                yearly ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${yearly ? 'text-white' : 'text-gray-400'}`}>
            Yearly Billing
            <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/25 border border-fuchsia-500/40 text-[10px] font-bold text-fuchsia-300">
              {header.yearly_discount_badge || 'Save 20%'}
            </span>
          </span>
        </div>

        {/* Plan Cards */}
        <div
          className={`grid grid-cols-1 gap-8 ${
            header.plans.length === 1
              ? 'max-w-md mx-auto'
              : header.plans.length === 2
              ? 'max-w-3xl mx-auto md:grid-cols-2'
              : header.plans.length === 4
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : 'md:grid-cols-3'
          }`}
        >
          {header.plans.map((p, i) => {
            const mPrice = Number(p.monthlyPrice) || 0;
            const yPrice = Number(p.yearlyPrice) || 0;
            const currentPrice = yearly ? yPrice : mPrice;

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border transition flex flex-col justify-between ${
                  p.featured
                    ? 'bg-gradient-to-b from-fuchsia-500/15 via-slate-900 to-slate-950 border-fuchsia-500/50 shadow-2xl shadow-fuchsia-500/20 scale-105'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {p.badge || '⭐ Most Popular'}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <i className={(p.icon_class || 'fa-solid fa-sparkles') + ' text-base ' + (p.color_class || 'text-fuchsia-400')}></i>
                    <div className="text-xs font-semibold text-gray-400">{p.badge}</div>
                  </div>
                  <div className="text-2xl font-black text-white mb-2">{p.name}</div>
                  <p className="text-xs text-gray-400 mb-6 min-h-[36px]">{p.desc}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">₹{currentPrice}</span>
                      <span className="text-xs text-gray-400 font-medium">/ month</span>
                    </div>
                    {p.monthlyWords && (
                      <div className="text-xs text-fuchsia-400 mt-1 font-semibold">{p.monthlyWords} / month</div>
                    )}
                    {yearly && mPrice > 0 && (
                      <div className="text-[11px] text-gray-500 mt-0.5">Billed ₹{yPrice * 12} yearly</div>
                    )}
                  </div>

                  <a
                    href={p.href || (mPrice === 0 ? CHAT_URL : UPGRADE_URL)}
                    className={`block text-center px-5 py-3 rounded-full text-xs sm:text-sm font-bold mb-8 transition ${
                      p.featured ? 'btn-primary' : 'btn-ghost'
                    }`}
                  >
                    {p.cta || (mPrice === 0 ? 'Get Started Free' : 'Upgrade')}
                  </a>

                  <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">Included features:</div>
                  <ul className="space-y-3 text-xs">
                    {(p.features || []).map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-gray-300">
                        <Check className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {header.footer_note && (
          <p className="text-center text-xs text-gray-500 mt-10">{header.footer_note}</p>
        )}

      </div>
    </section>
  );
}
