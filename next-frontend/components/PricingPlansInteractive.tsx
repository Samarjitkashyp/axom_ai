'use client';

import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { DETAILED_PLANS, DetailedPlan } from './pricingData';
import LoginModal from './chat/LoginModal';
import { getCsrfToken } from './chat/utils/security';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const ICON_MAP: Record<string, string> = {
  free: 'fa-solid fa-sparkles text-slate-400',
  starter: 'fa-solid fa-bolt text-sky-500',
  pro: 'fa-solid fa-crown text-amber-500',
  business: 'fa-solid fa-building text-amber-600',
};

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

export default function PricingPlansInteractive({
  plans = DETAILED_PLANS,
  discountBadge = 'Save 20%',
}: {
  plans?: DetailedPlan[];
  discountBadge?: string;
}) {
  const [yearly, setYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<DetailedPlan | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  // Check auth user status
  const checkUserAuth = async () => {
    try {
      const res = await fetch('/api/user-status/', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        return d.is_authenticated ? d : null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const handlePlanAction = async (plan: DetailedPlan) => {
    setErrorMsg(null);
    const planKey = (plan.id || plan.name).toLowerCase();

    // Free tier: direct to chat workspace
    if (planKey === 'free' || plan.monthlyPrice === 0) {
      window.location.href = 'https://chat.aiaxom.co.in/';
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const user = await checkUserAuth();
      if (!user) {
        // Not logged in -> open login modal and save pending plan
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

  return (
    <div>
      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10 sm:mb-14">
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${
            !yearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
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
        <span
          className={`text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
            yearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Yearly Billing
          <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] dark:bg-amber-950/60 border border-[#fde68a] dark:border-amber-700/50 text-[10px] font-bold text-[#92400e] dark:text-amber-300">
            {discountBadge || 'Save 20%'}
          </span>
        </span>
      </div>

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* 4 Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-stretch">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isPro = plan.popular;
          const planKey = (plan.id || plan.name).toLowerCase();
          const defaultIcon = ICON_MAP[planKey] || 'fa-solid fa-sparkles text-slate-400';
          const isLoadingThis = loadingPlanId === plan.id;

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
                  <span
                    className={`font-semibold ${
                      isPro ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
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

                {/* In-Place Upgrade Button */}
                <button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  disabled={Boolean(loadingPlanId)}
                  className={`w-full text-center py-2.5 px-4 rounded-full text-xs font-bold mb-8 transition flex items-center justify-center gap-2 ${
                    isPro
                      ? 'bg-gradient-to-r from-[#fbbf24] via-[#34d399] to-[#10b981] hover:brightness-105 text-[#064e3b] font-black shadow-lg shadow-emerald-500/25'
                      : 'border border-[#cbd5e1] hover:border-[#10b981] bg-[#f8fafc] hover:bg-[#ecfdf5] text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10'
                  } ${loadingPlanId && !isLoadingThis ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{plan.ctaText}</span>
                  )}
                </button>

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

      {/* Login / Auth Modal when user clicks Upgrade without login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setPendingPlan(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        title={pendingPlan ? `Sign in to Upgrade to ${pendingPlan.name}` : 'Sign In to Axom AI'}
        subtitle="Log in or create your account to proceed with instant Razorpay activation."
      />

      {/* Success Celebration Modal */}
      {successPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-emerald-500/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3">
              <Sparkles size={12} /> Instant Activation
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Subscription Activated!
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Your <strong>{successPlan}</strong> plan has been successfully activated. Enjoy enhanced limits, premium AI models, and unlimited tools!
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://chat.aiaxom.co.in/"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>Launch AI Workspace</span>
                <ArrowRight size={14} />
              </a>
              <button
                type="button"
                onClick={() => setSuccessPlan(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
