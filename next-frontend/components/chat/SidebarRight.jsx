'use client';

import React from 'react';
import { Sparkles, Crown, Zap, X, Smartphone, Download, Mic, CheckCircle2 } from 'lucide-react';

export default function SidebarRight({
  user,
  activePlan,
  remainingWords,
  maxWords,
  onUpgrade,
  isCollapsed,
  onClose,
}) {
  const hasActivePlan = !!(activePlan && activePlan.active);
  const planLabel = hasActivePlan
    ? (activePlan.plan_label || 'Pro')
    : 'Free';
  const expiryDate = hasActivePlan && activePlan.expires_at
    ? new Date(activePlan.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  const isUnlimited = user.isAuthenticated && hasActivePlan;
  const pct = isUnlimited ? 100 : (remainingWords / maxWords) * 100;
  const remainingInt = Math.floor(remainingWords);
  const offset = 238.76 * (1 - pct / 100);

  return (
    <aside className={`sidebar-right ${isCollapsed ? 'collapsed' : ''}`} id="sidebarRight">
      {/* Mobile Close Bar */}
      <div className="sidebar-right-mobile-header">
        <span className="sidebar-mobile-title">Plan & Usage</span>
        <button
          className="sidebar-mobile-close-btn"
          onClick={onClose}
          title="Close Panel"
          aria-label="Close Panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Subscription Badge Card */}
      <div className="promo-card" style={{
        background: hasActivePlan
          ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.10))'
          : 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(245,158,11,0.10))',
        border: hasActivePlan
          ? '1px solid rgba(34,197,94,0.35)'
          : '1px solid rgba(5,150,105,0.30)',
      }}>
        <div className="promo-header">
          <div className="promo-gem-icon">
            {hasActivePlan
              ? <Crown size={22} color="#22c55e" />
              : <Zap size={22} color="#10b981" />
            }
          </div>
          <div className="promo-title-area">
            <h4 className="promo-title">Axom AI {planLabel}</h4>
            <p className="promo-subtitle">
              {hasActivePlan ? (
                <>
                  Valid till <strong>{expiryDate}</strong>
                  {activePlan.days_left != null && <> · {activePlan.days_left} day{activePlan.days_left === 1 ? '' : 's'} left</>}
                </>
              ) : (
                'Upgrade for unlimited access and advanced features.'
              )}
            </p>
          </div>
        </div>
        <button className="btn-upgrade" onClick={onUpgrade}>
          {hasActivePlan ? 'Manage Plan' : 'Upgrade Now'}
        </button>
      </div>

      {/* Usage Widget Panel */}
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-title">Usage</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {planLabel} Plan
          </span>
        </div>

        <div className="usage-stats-box">
          <div className="gauge-chart-wrapper">
            <svg className="gauge-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gauge_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={hasActivePlan ? '#22c55e' : '#10b981'} />
                  <stop offset="100%" stopColor={hasActivePlan ? '#3b82f6' : '#f59e0b'} />
                </linearGradient>
              </defs>
              <circle className="gauge-bg" cx="50" cy="50" r="38" strokeWidth="8"></circle>
              <circle
                className="gauge-fill"
                cx="50"
                cy="50"
                r="38"
                strokeWidth="8"
                strokeDasharray="238.76"
                strokeDashoffset={isUnlimited ? 0 : offset}
              ></circle>
            </svg>
            <div className="gauge-text">
              <span className="gauge-percent">
                {isUnlimited ? '∞' : `${Math.round(pct)}%`}
              </span>
            </div>
          </div>

          <div className="usage-info">
            <span className="usage-label">Words Remaining</span>
            <span className="usage-count">
              {isUnlimited ? 'Unlimited' : `${remainingInt.toLocaleString()} / ${maxWords.toLocaleString()}`}
            </span>
            <div className="usage-bar-track">
              <div className="usage-bar-fill" style={{ width: `${pct}%` }}></div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500', lineHeight: '1.3' }}>
              {isUnlimited ? (
                <>
                  Unlimited Access<br />
                  <span style={{ opacity: 0.75, fontSize: '0.66rem', display: 'block', marginTop: '3px', fontWeight: 400 }}>
                    {planLabel} subscription active
                  </span>
                </>
              ) : (
                <>
                  <span style={{ opacity: 0.75, fontSize: '0.66rem', display: 'block', marginTop: '3px', fontWeight: 400 }}>
                    Resets in 24 hours · Upgrade for unlimited
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Android App Download Card (Directly Below Usage Card) */}
      <div className="widget-card android-download-widget">
        <div className="android-widget-badge">
          <span className="badge-live-dot"></span>
          <span>Android App</span>
        </div>

        <div className="android-widget-header">
          <div className="android-widget-icon-box">
            <Smartphone size={22} className="android-phone-icon" />
          </div>
          <div className="android-widget-titles">
            <h4 className="android-widget-title">Axom AI on Android</h4>
            <p className="android-widget-desc">Native speed, voice input & 15+ built-in PDF/AI tools on your mobile.</p>
          </div>
        </div>

        <div className="android-features-pill-row">
          <span className="feat-pill"><Zap size={11} /> Fast AI</span>
          <span className="feat-pill"><Mic size={11} /> Voice</span>
          <span className="feat-pill"><CheckCircle2 size={11} /> 15+ Tools</span>
        </div>

        <a
          href="/download/app/"
          className="btn-download-android"
          download="AxomAI.apk"
          title="Download Axom AI Android APK"
        >
          <Download size={16} className="dl-icon" />
          <span className="dl-btn-text">Download APK</span>
          <span className="dl-btn-tag">v1.0</span>
        </a>
      </div>
    </aside>
  );
}

