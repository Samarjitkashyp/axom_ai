'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
  IndianRupee,
  X
} from 'lucide-react';
import { DETAILED_PLANS, DetailedPlan } from './pricingData';
import LoginModal from './chat/LoginModal';
import { getCsrfToken } from './chat/utils/security';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PricingPlanItem {
  id?: string;
  name: string;
  badge?: string;
  desc?: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  monthlyWords?: string;
  featured?: boolean;
  popular?: boolean;
  cta?: string;
  ctaText?: string;
  href?: string;
  ctaUrl?: string;
  features?: string[];
  notIncluded?: string[];
}

export interface PricingSectionProps {
  header?: {
    badge?: string;
    title_prefix?: string;
    title_highlight?: string;
    subheading?: string;
    yearly_discount_badge?: string;
    footer_note?: string;
    active?: boolean;
    plans?: PricingPlanItem[];
  };
  plans?: PricingPlanItem[];
  showSectionHeader?: boolean;
  interactiveCheckout?: boolean;
  className?: string;
  id?: string;
}

export default function PricingSection({
  header,
  plans: customPlans,
  showSectionHeader = true,
  interactiveCheckout = true,
  className = '',
  id = 'pricing',
}: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<DetailedPlan | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  // If header specifies active === false explicitly and no custom plans are passed, return null
  if (header?.active === false && !customPlans) {
    return null;
  }

  // Determine plan list
  const rawPlans: any[] = (customPlans && customPlans.length > 0)
    ? customPlans
    : (header?.plans && header.plans.length > 0 ? header.plans : DETAILED_PLANS);

  // Normalize each plan against DETAILED_PLANS fallback for maximum richness
  const resolvedPlans: DetailedPlan[] = rawPlans.map((p: any) => {
    const pId = (p.id || p.name || 'plan').toLowerCase();
    const fallback = DETAILED_PLANS.find(
      (d) => d.id.toLowerCase() === pId || d.name.toLowerCase() === (p.name || '').toLowerCase()
    );

    const isFeatured = Boolean(p.featured || p.popular || fallback?.popular);
    return {
      id: p.id || fallback?.id || pId,
      name: p.name || fallback?.name || 'Plan',
      badge: p.badge || fallback?.badge || (isFeatured ? 'Most Popular' : ''),
      desc: p.desc || fallback?.desc || '',
      monthlyPrice: Number(p.monthlyPrice ?? fallback?.monthlyPrice ?? 0),
      yearlyPrice: Number(p.yearlyPrice ?? fallback?.yearlyPrice ?? 0),
      monthlyWords: p.monthlyWords || fallback?.monthlyWords || '',
      popular: isFeatured,
      ctaText: p.cta || p.ctaText || fallback?.ctaText || (Number(p.monthlyPrice) === 0 ? 'Get Started Free' : 'Upgrade to ' + (p.name || 'Pro')),
      ctaUrl: p.href || p.ctaUrl || fallback?.ctaUrl || 'https://chat.aiaxom.co.in/',
      features: p.features && p.features.length > 0 ? p.features : (fallback?.features || []),
      notIncluded: p.notIncluded || fallback?.notIncluded || [],
    };
  });

  // User auth check
  const checkUserAuth = async () => {
    try {
      const res = await fetch('/api/user-status/', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        return d.is_authenticated ? d : null;
      }
    } catch {
      // silent fallback
    }
    return null;
  };

  const handlePlanAction = async (plan: DetailedPlan) => {
    setErrorMsg(null);
    const planKey = (plan.id || plan.name).toLowerCase();

    // Free tier: direct to chat application
    if (planKey === 'free' || plan.monthlyPrice === 0) {
      window.location.href = plan.ctaUrl || 'https://chat.aiaxom.co.in/';
      return;
    }

    if (!interactiveCheckout) {
      window.location.href = plan.ctaUrl || 'https://chat.aiaxom.co.in/upgrade';
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const user = await checkUserAuth();
      if (!user) {
        setPendingPlan(plan);
        setIsLoginOpen(true);
        setLoadingPlanId(null);
        return;
      }

      await executeCheckout(plan, user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initialization failed. Please try again.');
      setLoadingPlanId(null);
    }
  };

  const executeCheckout = async (plan: DetailedPlan, user: any) => {
    setLoadingPlanId(plan.id);
    setErrorMsg(null);

    const planBase = (plan.id || plan.name).toLowerCase();
    const billingSuffix = yearly ? 'yearly' : 'monthly';
    const backendKey = `${planBase}_${billingSuffix}`;

    const rzpLoaded = await loadRazorpayScript();
    if (!rzpLoaded || !window.Razorpay) {
      setErrorMsg('Could not load Razorpay payment gateway. Please check your internet connection.');
      setLoadingPlanId(null);
      return;
    }

    try {
      const resp = await fetch('/api/payment/create-order/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify({ plan: backendKey }),
      });

      const order = await resp.json();
      if (!resp.ok) {
        throw new Error(order.error || 'Failed to create order');
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.order_id,
        name: 'Axom AI',
        description: `${order.plan_label} · ${order.days} days access`,
        prefill: {
          name: order.user_name || user?.name || user?.username || '',
          email: order.user_email || user?.email || '',
        },
        theme: {
          color: plan.popular ? '#10b981' : '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          },
        },
        handler: async (response: any) => {
          try {
            const vr = await fetch('/api/payment/verify/', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken() || '',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const vdata = await vr.json();
            if (vr.ok && vdata.status === 'ok') {
              setSuccessPlan(order.plan_label || plan.name);
            } else {
              throw new Error(vdata.error || 'Payment verification failed');
            }
          } catch (verr: any) {
            setErrorMsg(verr.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoadingPlanId(null);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (e: any) {
      setErrorMsg(e.message || 'Payment initiation error.');
      setLoadingPlanId(null);
    }
  };

  const handleLoginSuccess = async () => {
    setIsLoginOpen(false);
    if (pendingPlan) {
      const planToExecute = pendingPlan;
      setPendingPlan(null);
      const user = await checkUserAuth();
      if (user) {
        executeCheckout(planToExecute, user);
      }
    }
  };

  const content = (
    <div className="w-full">
      {/* Section Header (when enabled) */}
      {showSectionHeader && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span>{(header?.badge || 'Pricing').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim() || 'Pricing'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
            {header?.title_prefix || 'Simple,'}{' '}
            <span className="gradient-text">{header?.title_highlight || 'Transparent Pricing'}</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            {header?.subheading || 'Choose a plan that fits your needs. Upgrade or cancel anytime.'}
          </p>
        </div>
      )}

      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center gap-3.5 mb-10 sm:mb-14">
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${
            !yearly ? 'text-emerald-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Monthly Billing
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          type="button"
          role="switch"
          aria-checked={yearly}
          className="w-14 h-7 rounded-full bg-emerald-900/10 dark:bg-white/10 border border-emerald-900/20 dark:border-white/20 relative p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div
            className={`w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm transition-transform duration-200 ${
              yearly ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
            yearly ? 'text-emerald-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Yearly Billing
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
            {header?.yearly_discount_badge || 'Save 20%'}
          </span>
        </span>
      </div>

      {/* Payment Success Alert */}
      {successPlan && (
        <div className="max-w-xl mx-auto mb-10 p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-sm text-center shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center mb-2 shadow-md">
            <CheckCircle2 size={22} />
          </div>
          <div className="font-black text-base mb-1">Subscription Activated Successfully!</div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-4">
            You are now upgraded to the <strong>{successPlan}</strong>. Your account quota is refreshed instantly.
          </p>
          <a
            href="https://chat.aiaxom.co.in/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            <span>Go to AI Chat Workspace</span>
            <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* Payment Error Alert */}
      {errorMsg && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs text-center font-semibold flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-300 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div
        className={`grid grid-cols-1 gap-6 sm:gap-8 items-stretch ${
          resolvedPlans.length === 1
            ? 'max-w-md mx-auto'
            : resolvedPlans.length === 2
            ? 'max-w-3xl mx-auto md:grid-cols-2'
            : resolvedPlans.length === 4
            ? 'max-w-7xl mx-auto md:grid-cols-2 lg:grid-cols-4'
            : 'max-w-6xl mx-auto md:grid-cols-3'
        }`}
      >
        {resolvedPlans.map((plan, idx) => {
          const mPrice = plan.monthlyPrice;
          const yPrice = plan.yearlyPrice;
          const currentPrice = yearly ? yPrice : mPrice;
          const isFeatured = plan.popular;
          const isLoadingThis = loadingPlanId === plan.id;

          return (
            <div
              key={plan.id || idx}
              className={`relative rounded-2xl p-7 sm:p-8 border transition-all flex flex-col justify-between ${
                isFeatured
                  ? 'bg-gradient-to-b from-emerald-500/15 via-white dark:via-slate-900 to-emerald-500/5 dark:to-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 scale-[1.02] sm:scale-105 z-10'
                  : 'bg-white/80 dark:bg-slate-900/80 border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles size={12} />
                  <span>{plan.badge || 'Most Popular'}</span>
                </div>
              )}

              <div>
                {/* Regular Badge for non-featured */}
                {!isFeatured && plan.badge && (
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {plan.badge}
                  </div>
                )}

                <div className="text-2xl font-black text-emerald-950 dark:text-white mb-2">
                  {plan.name}
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 mb-6 min-h-[34px] leading-relaxed">
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-emerald-900/10 dark:border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white">
                      ₹{currentPrice}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">/ month</span>
                  </div>
                  {plan.monthlyWords && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold mt-2.5">
                      <Zap size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{plan.monthlyWords} / month</span>
                    </div>
                  )}
                  {yearly && mPrice > 0 && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                      Billed ₹{yPrice * 12} yearly (Save 20%)
                    </div>
                  )}
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  disabled={isLoadingThis}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm mb-7 transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isFeatured
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 shadow-lg'
                      : 'bg-emerald-50 dark:bg-white/5 hover:bg-emerald-100 dark:hover:bg-white/10 text-emerald-950 dark:text-white border border-emerald-900/15 dark:border-white/10'
                  }`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Preparing Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaText}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Features List */}
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400 mb-3.5">
                  Included capabilities:
                </div>
                <ul className="space-y-2.5 text-xs">
                  {(plan.features || []).map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 leading-snug">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 stroke-[2.5]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      {header?.footer_note && (
        <div className="flex items-center justify-center gap-2 mt-10 text-xs text-slate-500 dark:text-slate-400 px-4 text-center">
          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{header.footer_note}</span>
        </div>
      )}

      {/* Login Modal for Guests during Checkout */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => {
            setIsLoginOpen(false);
            setLoadingPlanId(null);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );

  if (showSectionHeader) {
    return (
      <section
        id={id}
        className={`py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#05070e] ${className}`}
      >
        <div className="max-w-7xl mx-auto px-5 relative z-10">{content}</div>
      </section>
    );
  }

  return <div className={className}>{content}</div>;
}
