'use client';

import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { DETAILED_PLANS, DetailedPlan } from './pricingData';

const ICON_MAP: Record<string, string> = {
  free: 'fa-solid fa-sparkles text-slate-400',
  starter: 'fa-solid fa-bolt text-sky-500',
  pro: 'fa-solid fa-crown text-amber-500',
  business: 'fa-solid fa-building text-amber-600',
};

export default function PricingPlansInteractive({
  plans = DETAILED_PLANS,
  discountBadge = 'Save 20%',
}: {
  plans?: DetailedPlan[];
  discountBadge?: string;
}) {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-14">
        <span className={`text-xs sm:text-sm font-semibold transition-colors ${!yearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          role="switch"
          aria-checked={yearly}
          className="w-14 h-7 rounded-full bg-[#cfe9dc] dark:bg-slate-800 border border-[#a7f3d0] dark:border-slate-700 relative p-1 transition-colors focus:outline-none"
        >
          <div
            className={`w-5 h-5 rounded-full bg-[#10b981] transition-transform ${
              yearly ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${yearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
          Yearly Billing
          <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] dark:bg-amber-950/60 border border-[#fde68a] dark:border-amber-700/50 text-[10px] font-bold text-[#92400e] dark:text-amber-300">
            {discountBadge || 'Save 20%'}
          </span>
        </span>
      </div>

      {/* 4 Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-stretch">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isPro = plan.popular;
          const planKey = (plan.id || plan.name).toLowerCase();
          const defaultIcon = ICON_MAP[planKey] || 'fa-solid fa-sparkles text-slate-400';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 transition-all flex flex-col justify-between ${
                isPro
                  ? 'border-2 border-[#fcd34d] dark:border-[#10b981] shadow-xl bg-gradient-to-b from-[#fefce8]/60 via-white to-[#fefce8]/30 dark:from-[#064e3b]/30 dark:via-[#0b1220] dark:to-[#0b1220] scale-[1.02] z-10'
                  : 'bg-white dark:bg-[#0b1220] border border-[#e2e8f0] dark:border-[#1f2f46] shadow-sm hover:shadow-md'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#10b981] text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  ★ MOST POPULAR
                </div>
              )}

              <div>
                {/* Header Tag / Badge */}
                <div className="flex items-center gap-1.5 text-xs mb-2">
                  <i className={defaultIcon} />
                  <span className={`font-semibold ${isPro ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.badge || (isPro ? '★ Most Popular' : plan.name)}
                  </span>
                </div>

                <div className="text-2xl font-black text-[#0f172a] dark:text-white mb-2 tracking-tight">
                  {plan.name}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 min-h-[36px] leading-relaxed">
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#0f172a] dark:text-white tracking-tight">
                      ₹{price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
                  </div>
                  {plan.monthlyWords && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                      {plan.monthlyWords} / month
                    </div>
                  )}
                  {yearly && plan.monthlyPrice > 0 && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                      Billed ₹{plan.yearlyPrice * 12} yearly
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <a
                  href={plan.ctaUrl}
                  className={`block text-center py-2.5 px-4 rounded-full text-xs font-bold mb-8 transition ${
                    isPro
                      ? 'bg-gradient-to-r from-[#fbbf24] via-[#34d399] to-[#10b981] hover:brightness-105 text-[#064e3b] font-black shadow-lg shadow-emerald-500/25'
                      : 'border border-[#cbd5e1] hover:border-[#10b981] bg-[#f8fafc] hover:bg-[#ecfdf5] text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10'
                  }`}
                >
                  {plan.ctaText}
                </a>

                {/* Features List */}
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  INCLUDED FEATURES:
                </div>
                <ul className="space-y-3 text-xs">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-amber-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
