import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  Sparkles,
  Zap,
  Shield,
  Crown,
  Building2,
  Users,
  HelpCircle,
  CreditCard,
  ArrowRight,
  Sun,
  Moon,
  Star,
  CheckCircle2,
  X,
  Lock,
  Layers,
  FileText,
  Clock,
  Award
} from 'lucide-react';

export default function SubscriptionPage({
  onBackToChat,
  theme,
  onToggleTheme,
  user,
  onOpenLogin
}) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [checkoutPlan, setCheckoutPlan] = useState(null); // plan object when modal opens
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  const PLANS = [
    {
      id: 'free',
      name: 'Free',
      badge: 'Starter AI',
      desc: 'Ideal for casual queries, students & basic Assamese chat.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyWords: '5,000 words',
      popular: false,
      color: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1), rgba(100, 116, 139, 0.05))',
      icon: Sparkles,
      buttonText: user?.isAuthenticated ? 'Current Plan' : 'Get Started Free',
      features: [
        '5,000 words per month',
        'Standard Assamese generation',
        'Llama 3 8B (Fast Basic AI)',
        'Basic document conversions (5/day)',
        'Web chat history (30 days)',
        'Community support',
      ],
      notIncluded: [
        'Advanced models (GPT-4o, Claude 3.5)',
        'Full PDF Editor & Compressor',
        'Scanned Document OCR',
        'Voice Mode (Speech-to-Text)',
        'API access',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      badge: 'Individual',
      desc: 'Perfect for researchers, creators and daily regular users.',
      monthlyPrice: 199,
      yearlyPrice: 159, // billed ₹1,908/yr
      monthlyWords: '50,000 words',
      popular: false,
      color: '#38bdf8',
      bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.08))',
      icon: Zap,
      buttonText: 'Upgrade to Starter',
      features: [
        '50,000 words per month',
        '2x Faster response speed',
        'Access to GPT-4o Mini & Gemma 2',
        '50 Document conversions/mo',
        'Full PDF Editor (Signatures & Text)',
        'PDF Compressor (Extreme Mode)',
        'Export chat history to PDF & Word',
        'Priority email support',
      ],
      notIncluded: [
        'Claude 3.5 Sonnet & Llama 70B',
        'Scanned Document OCR',
        'Team collaboration & API',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: '⭐ Most Popular',
      desc: 'Unleash full power: advanced models, OCR & 20+ file tools.',
      monthlyPrice: 499,
      yearlyPrice: 399, // billed ₹4,788/yr
      monthlyWords: '250,000 words',
      popular: true,
      color: '#c084fc',
      bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.15))',
      icon: Crown,
      buttonText: 'Upgrade to Pro',
      features: [
        '250,000 words per month',
        'Ultra-fast GPU Compute (Zero Queue)',
        'Claude 3.5 Sonnet & Llama 3.3 70B',
        'Unlimited 20+ PDF & Office Tools',
        'Smart OCR (Extract scanned Assamese/English text)',
        'Interactive Ask-PDF AI Assistant',
        'Speech Voice Mode (Assamese Audio)',
        'Unlimited chat history & folders',
        '24/7 Priority Support',
      ],
      notIncluded: [
        'Custom Team workspace & API keys',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      badge: 'Team & API',
      desc: 'For offices, institutions & teams needing high volume & API.',
      monthlyPrice: 1499,
      yearlyPrice: 1199, // billed ₹14,388/yr
      monthlyWords: '1,000,000 words',
      popular: false,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.1))',
      icon: Building2,
      buttonText: 'Upgrade to Business',
      features: [
        '1,000,000 words per month (1M)',
        'Up to 5 Team member seats',
        'Custom Knowledge Base (RAG) upload & indexing',
        'Dedicated REST API Access & API keys',
        'Highest Priority Compute & SLAs',
        'All 20+ PDF & OCR tools included',
        'Custom invoice & GST billing',
        'Dedicated account manager',
      ],
      notIncluded: [],
    },
  ];

  const FAQS = [
    {
      q: 'How does the monthly word limit work?',
      a: 'Each prompt and AI response in Assamese, English, or Hindi counts towards your monthly quota. The counter resets on the 1st of every calendar month. You can track your remaining words in real-time on your dashboard.',
    },
    {
      q: 'Can I switch or cancel my plan anytime?',
      a: 'Yes, absolutely! You can upgrade, downgrade, or cancel your subscription at any time with a single click. If you cancel, your current paid benefits will remain active until the end of the billing period.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support all major Indian payment methods via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking, and Wallets. GST invoices are provided automatically.',
    },
    {
      q: 'What happens if I exhaust my words limit?',
      a: 'If you run out of words, you can either upgrade to a higher tier plan or add a top-up pack. Your chats, saved documents, and converted files will remain completely intact and accessible.',
    },
    {
      q: 'Are the PDF & Document tools completely offline & safe?',
      a: 'Yes! All file conversions, watermarking, merges, and signature stamping are processed with enterprise-grade encryption. Files are never shared or used to train public models, and are purged automatically.',
    },
  ];

  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') {
      if (!user?.isAuthenticated && onOpenLogin) {
        onOpenLogin('Create Free Account', 'Sign up to keep your chat history and start with 5,000 free words.');
      } else {
        onBackToChat();
      }
      return;
    }
    setCheckoutPlan(plan);
    setCheckoutStatus('idle');
  };

  const handleConfirmCheckout = () => {
    setCheckoutStatus('processing');
    setTimeout(() => {
      setCheckoutStatus('success');
    }, 1200);
  };

  return (
    <div className="subscription-page">
      {/* TOPBAR */}
      <header className="tools-topbar">
        <div className="tools-topbar-left">
          <button className="tools-back-btn" onClick={onBackToChat} id="btnBackToChat" title="Return to Chat">
            <ChevronLeft size={19} />
            <span className="tools-back-text">Chat</span>
          </button>
        </div>

        <div className="tools-topbar-center">
          <div className="tools-brand-badge">
            <svg className="tools-sparkle-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#sub_sparkle_grad)" />
              <defs>
                <linearGradient id="sub_sparkle_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C084FC" />
                  <stop offset="1" stopColor="#E879F9" />
                </linearGradient>
              </defs>
            </svg>
            <span className="tools-topbar-brand">Subscription Plans</span>
          </div>
        </div>

        <div className="tools-topbar-right">
          <button className="tools-icon-btn" onClick={onToggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="sub-main-container">
        {/* HERO SECTION */}
        <section className="sub-hero">
          <div className="tools-hero-badge">
            <Sparkles size={14} />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="sub-hero-title">
            Supercharge Your <span className="gradient-text">Assam AI Experience</span>
          </h1>
          <p className="sub-hero-subtitle">
            Choose a plan tailored to your needs. Upgrade anytime to unlock advanced AI models,
            higher word limits, and all 20+ document tools.
          </p>

          {/* BILLING TOGGLE */}
          <div className="billing-toggle-container">
            <button
              className={`billing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              className={`billing-toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Annual Billing
              <span className="discount-pill">Save 20%</span>
            </button>
          </div>
        </section>

        {/* PRICING CARDS GRID */}
        <section className="pricing-grid">
          {PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const PlanIcon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''} plan-${plan.id}`}
                style={{ '--plan-color': plan.color }}
              >
                {plan.popular && (
                  <div className="popular-ribbon">
                    <Star size={13} fill="#fff" /> Most Popular
                  </div>
                )}

                <div className="plan-card-header">
                  <div className="plan-icon-wrapper" style={{ background: plan.bgGradient, color: plan.color }}>
                    <PlanIcon size={24} />
                  </div>
                  <div className="plan-title-box">
                    <h3 className="plan-name">{plan.name}</h3>
                    <span className="plan-badge-tag" style={{ color: plan.color }}>
                      {plan.badge}
                    </span>
                  </div>
                </div>

                <p className="plan-desc">{plan.desc}</p>

                {/* Price Display */}
                <div className="plan-price-area">
                  <div className="price-number-row">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">{price}</span>
                    <span className="price-period">/ month</span>
                  </div>
                  <div className="billing-sub-label">
                    {billingCycle === 'yearly' && price > 0 ? (
                      <span>Billed annually (₹{price * 12}/yr)</span>
                    ) : price === 0 ? (
                      <span>Free forever</span>
                    ) : (
                      <span>Billed monthly</span>
                    )}
                  </div>
                </div>

                {/* Word Quota Highlight Banner */}
                <div className="plan-quota-banner">
                  <div className="quota-pill">
                    <Layers size={14} style={{ color: plan.color }} />
                    <strong>{plan.monthlyWords}</strong>
                    <span className="quota-label">quota / mo</span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  className={`btn-plan-action ${plan.popular ? 'btn-popular-action' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.buttonText}
                  <ArrowRight size={15} />
                </button>

                {/* Feature List */}
                <div className="plan-features-list">
                  <div className="features-label">What's included:</div>
                  <ul className="features-ul">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="feature-item included">
                        <Check size={16} className="feature-check-icon" style={{ color: plan.color }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feat, i) => (
                      <li key={i} className="feature-item excluded">
                        <X size={15} className="feature-x-icon" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>

        {/* TRUST BADGES BAR */}
        <section className="trust-badges-bar">
          <div className="trust-badge-item">
            <Shield size={20} className="trust-icon" />
            <div>
              <strong>Secure Payments</strong>
              <p>UPI, Cards & NetBanking encrypted via 256-bit SSL</p>
            </div>
          </div>
          <div className="trust-badge-item">
            <Clock size={20} className="trust-icon" />
            <div>
              <strong>Instant Activation</strong>
              <p>Word quota & tools upgrade instantly upon confirmation</p>
            </div>
          </div>
          <div className="trust-badge-item">
            <Award size={20} className="trust-icon" />
            <div>
              <strong>Cancel Anytime</strong>
              <p>Zero lock-in period. Switch or pause your plan easily</p>
            </div>
          </div>
        </section>

        {/* FEATURE COMPARISON TABLE */}
        <section className="comparison-section">
          <div className="section-header-box">
            <h2 className="section-title">Detailed Plan Comparison</h2>
            <p className="section-sub">Compare all specifications and tools included in each tier</p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features & Capabilities</th>
                  <th>Free (₹0)</th>
                  <th>Starter (₹199)</th>
                  <th className="highlight-col">Pro (₹499)</th>
                  <th>Business (₹1,499)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly Word Limit</td>
                  <td><strong>5,000 words</strong></td>
                  <td><strong>50,000 words</strong></td>
                  <td className="highlight-col"><strong>250,000 words</strong></td>
                  <td><strong>1,000,000 words</strong></td>
                </tr>
                <tr>
                  <td>AI Model Tier</td>
                  <td>Llama 3 8B (Fast)</td>
                  <td>GPT-4o Mini & Gemma 2</td>
                  <td className="highlight-col">Claude 3.5 Sonnet & Llama 70B</td>
                  <td>All Models + Custom API</td>
                </tr>
                <tr>
                  <td>Generation Speed</td>
                  <td>Standard</td>
                  <td>2x Fast</td>
                  <td className="highlight-col">Ultra-Fast Priority GPU</td>
                  <td>Dedicated Queue & SLA</td>
                </tr>
                <tr>
                  <td>Document & PDF Tools</td>
                  <td>5 / day (Basic)</td>
                  <td>50 / month</td>
                  <td className="highlight-col">Unlimited 20+ Tools</td>
                  <td>Unlimited 20+ Tools</td>
                </tr>
                <tr>
                  <td>PDF Editor & Compressor</td>
                  <td><X size={16} className="table-x" /></td>
                  <td><Check size={16} className="table-check" /></td>
                  <td className="highlight-col"><Check size={16} className="table-check" /></td>
                  <td><Check size={16} className="table-check" /></td>
                </tr>
                <tr>
                  <td>Scanned OCR Extraction</td>
                  <td><X size={16} className="table-x" /></td>
                  <td><X size={16} className="table-x" /></td>
                  <td className="highlight-col"><Check size={16} className="table-check" /></td>
                  <td><Check size={16} className="table-check" /></td>
                </tr>
                <tr>
                  <td>Speech Voice Mode (Audio)</td>
                  <td><X size={16} className="table-x" /></td>
                  <td><X size={16} className="table-x" /></td>
                  <td className="highlight-col"><Check size={16} className="table-check" /></td>
                  <td><Check size={16} className="table-check" /></td>
                </tr>
                <tr>
                  <td>Custom Knowledge Base (RAG)</td>
                  <td><X size={16} className="table-x" /></td>
                  <td><X size={16} className="table-x" /></td>
                  <td className="highlight-col"><X size={16} className="table-x" /></td>
                  <td><Check size={16} className="table-check" /></td>
                </tr>
                <tr>
                  <td>Team Seats / Members</td>
                  <td>1 User</td>
                  <td>1 User</td>
                  <td className="highlight-col">1 User</td>
                  <td>Up to 5 Users</td>
                </tr>
                <tr>
                  <td>Developer REST API</td>
                  <td><X size={16} className="table-x" /></td>
                  <td><X size={16} className="table-x" /></td>
                  <td className="highlight-col"><X size={16} className="table-x" /></td>
                  <td><Check size={16} className="table-check" /></td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Community</td>
                  <td>Priority Email</td>
                  <td className="highlight-col">24/7 Priority Support</td>
                  <td>Dedicated Account Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="sub-faq-section">
          <div className="section-header-box">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-sub">Have questions? We're here to help.</p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div key={index} className={`faq-item-card ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-arrow">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* CHECKOUT MODAL PREVIEW */}
      {checkoutPlan && (() => {
        const CheckoutIcon = checkoutPlan.icon;
        return (
          <div className="checkout-overlay" onClick={() => setCheckoutPlan(null)}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
              <div className="checkout-header">
                <div className="checkout-title-box">
                  <div
                    className="checkout-icon"
                    style={{ background: checkoutPlan.bgGradient, color: checkoutPlan.color }}
                  >
                    <CheckoutIcon size={22} />
                  </div>
                  <div>
                    <h3 className="checkout-name">Upgrade to {checkoutPlan.name}</h3>
                    <p className="checkout-sub">Billing period: {billingCycle === 'yearly' ? 'Annual (20% Off)' : 'Monthly'}</p>
                  </div>
                </div>
                <button className="checkout-close-btn" onClick={() => setCheckoutPlan(null)} title="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="checkout-body">
                {checkoutStatus === 'success' ? (
                  <div className="checkout-success-view">
                    <div className="checkout-success-icon">
                      <CheckCircle2 size={54} />
                    </div>
                    <h4>Subscription Confirmed!</h4>
                    <p>
                      Your account has been upgraded to <strong>{checkoutPlan.name}</strong>.
                      Your new limit of <strong>{checkoutPlan.monthlyWords}</strong> and tools are now active.
                    </p>
                    <button className="btn-done-checkout" onClick={() => { setCheckoutPlan(null); onBackToChat(); }}>
                      Return to Chat
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="checkout-summary-box">
                      <div className="summary-row">
                        <span>Plan:</span>
                        <strong>{checkoutPlan.name} Plan</strong>
                      </div>
                      <div className="summary-row">
                        <span>Monthly Word Limit:</span>
                        <strong style={{ color: checkoutPlan.color }}>{checkoutPlan.monthlyWords}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Billing:</span>
                        <span>{billingCycle === 'yearly' ? 'Yearly billing' : 'Monthly renewal'}</span>
                      </div>
                      <div className="summary-divider"></div>
                      <div className="summary-row total-row">
                        <span>Total Amount:</span>
                        <span className="total-price">
                          ₹{billingCycle === 'yearly' ? checkoutPlan.yearlyPrice * 12 : checkoutPlan.monthlyPrice}
                          <small>{billingCycle === 'yearly' ? '/yr' : '/mo'}</small>
                        </span>
                      </div>
                    </div>

                    <div className="checkout-perks">
                      <div className="perk-item">
                        <Check size={15} style={{ color: '#22c55e' }} />
                        <span>Instant word limit upgrade</span>
                      </div>
                      <div className="perk-item">
                        <Check size={15} style={{ color: '#22c55e' }} />
                        <span>All 20+ PDF & file tools unlocked</span>
                      </div>
                      <div className="perk-item">
                        <Check size={15} style={{ color: '#22c55e' }} />
                        <span>Cancel anytime with 1 click</span>
                      </div>
                    </div>

                    <div className="checkout-actions">
                      <button
                        className="btn-pay-now"
                        onClick={handleConfirmCheckout}
                        disabled={checkoutStatus === 'processing'}
                      >
                        {checkoutStatus === 'processing' ? (
                          <>Processing Secure Payment…</>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Pay with UPI / Card (₹{billingCycle === 'yearly' ? checkoutPlan.yearlyPrice * 12 : checkoutPlan.monthlyPrice})
                          </>
                        )}
                      </button>
                      <p className="checkout-security-note">
                        <Lock size={12} /> 256-bit encrypted checkout · No hidden charges
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
