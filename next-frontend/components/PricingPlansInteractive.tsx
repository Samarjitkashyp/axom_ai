'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { DETAILED_PLANS, DetailedPlan } from './pricingData';

export default function PricingPlansInteractive({ plans = DETAILED_PLANS }: { plans?: DetailedPlan[] }) {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16">
        <div className="inline-flex items-center p-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
              !yearly
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              yearly
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-[10px] font-extrabold text-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          Cancel or switch anytime. No long-term lock-in.
        </span>
      </div>

      {/* 4 Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-stretch">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isPro = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                isPro
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-950 border-2 border-emerald-500/60 shadow-2xl shadow-emerald-900/30 ring-1 ring-emerald-500/30 lg:-translate-y-2'
                  : 'bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-white/20'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Zap size={12} className="fill-slate-950" />
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Header & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md ${
                      isPro
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {plan.monthlyWords && (
                    <span className="text-[11px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">
                      {plan.monthlyWords}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 min-h-[40px]">{plan.desc}</p>

                {/* Price Display */}
                <div className="mb-6 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">₹{price}</span>
                    <span className="text-xs text-slate-400 font-medium">/ month</span>
                  </div>
                  {yearly && plan.monthlyPrice > 0 ? (
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      Billed ₹{(plan.yearlyPrice * 12).toLocaleString('en-IN')} / year (Saved 20%)
                    </div>
                  ) : plan.monthlyPrice > 0 ? (
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Billed monthly • GST input credit eligible
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400/90 font-medium mt-1">
                      100% Free Forever • No Card Needed
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <a
                  href={plan.ctaUrl}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all duration-200 flex items-center justify-center gap-2 mb-8 ${
                    isPro
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : plan.monthlyPrice === 0
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={14} />
                </a>

                {/* Features list */}
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Included in {plan.name}:
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Not included:
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-500">
                        {plan.notIncluded.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 opacity-70">
                            <X size={13} className="text-slate-600 shrink-0 mt-0.5" />
                            <span className="line-through">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
