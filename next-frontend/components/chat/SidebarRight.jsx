'use client';

import React from 'react';
import { Sparkles, Crown, Zap, X } from 'lucide-react';

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
          : 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(236,72,153,0.10))',
        border: hasActivePlan
          ? '1px solid rgba(34,197,94,0.35)'
          : '1px solid rgba(147,51,234,0.30)',
      }}>
        <div className="promo-header">
          <div className="promo-gem-icon">
            {hasActivePlan
              ? <Crown size={22} color="#22c55e" />
              : <Zap size={22} color="#a855f7" />
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
                  <stop offset="0%" stopColor={hasActivePlan ? '#22c55e' : '#a855f7'} />
                  <stop offset="100%" stopColor={hasActivePlan ? '#3b82f6' : '#ec4899'} />
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
    </aside>
  );
}
