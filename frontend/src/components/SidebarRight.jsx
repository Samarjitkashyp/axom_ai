import React from 'react';
import { Sparkles, HelpCircle, X, Smartphone, Download, Zap, Crown } from 'lucide-react';

export default function SidebarRight({
  user = {},
  activePlan = null,
  remainingWords = 5000,
  maxWords = 5000,
  onUpgrade,
  isCollapsed = false,
  onClose,
}) {
  const isStaff = !!user?.isStaff;
  const isPaidUser = !!(activePlan && activePlan.active);
  const hasActivePlan = isPaidUser || isStaff;

  const planLabel = isStaff
    ? 'Admin Pro'
    : isPaidUser
    ? (activePlan?.plan_label || 'Pro')
    : 'Free';

  const expiryDate = activePlan?.expires_at
    ? new Date(activePlan.expires_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : isStaff
    ? 'Lifetime Access'
    : '';

  const isUnlimited = (!!user?.isAuthenticated && hasActivePlan) || isStaff;
  const safeMaxWords = maxWords || 5000;
  const safeRemainingWords = typeof remainingWords === 'number' ? remainingWords : 5000;
  const pct = isUnlimited ? 100 : (safeRemainingWords / safeMaxWords) * 100;
  const remainingInt = Math.floor(safeRemainingWords);
  const offset = 238.76 * (1 - pct / 100);

  return (
    <aside className={`sidebar-right ${isCollapsed ? 'collapsed' : ''}`} id="sidebarRight">
      {/* Mobile Close Bar */}
      <div className="sidebar-right-mobile-header">
        <span className="sidebar-mobile-title">Control Panel & Usage</span>
        <button
          className="sidebar-mobile-close-btn"
          onClick={onClose}
          title="Close Panel"
          aria-label="Close Panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Active Plan Card (paid or staff) */}
      {hasActivePlan && (
        <div
          className="promo-card"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.10))',
            border: '1px solid rgba(34,197,94,0.35)',
          }}
        >
          <div className="promo-header">
            <div className="promo-gem-icon">
              <Sparkles size={22} color="#22c55e" />
            </div>
            <div className="promo-title-area">
              <h4 className="promo-title">{planLabel}</h4>
              <p className="promo-subtitle">
                {expiryDate ? (
                  <>Valid: <strong>{expiryDate}</strong></>
                ) : (
                  <strong>Unlimited Access</strong>
                )}
                {activePlan?.days_left != null && (
                  <> · {activePlan.days_left} day{activePlan.days_left === 1 ? '' : 's'} left</>
                )}
              </p>
            </div>
          </div>
          <button className="btn-upgrade" onClick={onUpgrade} title="Manage plan">
            Manage Plan
          </button>
        </div>
      )}

      {/* Pro Upgrade Promo Card — shown for anon users and for logged-in users without an active plan */}
      {!hasActivePlan && (
        <div className="promo-card">
          <div className="promo-header">
            <div className="promo-gem-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="url(#gem_grad)" stroke="#C084FC" strokeWidth="1.5" />
                <path d="M2 9H22M12 2V22" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" />
                <defs>
                  <linearGradient id="gem_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9333EA" />
                    <stop offset="1" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="promo-title-area">
              <h4 className="promo-title">Axom AI Pro</h4>
              <p className="promo-subtitle">
                {activePlan && activePlan.plan
                  ? `Your ${activePlan.plan_label || 'Pro'} expired. Renew to restore access.`
                  : 'Unlock advanced models, plugins, and more.'}
              </p>
            </div>
          </div>
          <button className="btn-upgrade" onClick={onUpgrade} id="btnUpgrade">
            {activePlan && activePlan.plan ? 'Renew Plan' : 'Upgrade Now'}
          </button>
        </div>
      )}

      {/* Usage Widget Panel */}
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-title">Usage</span>
        </div>

        <div className="usage-stats-box">
          <div className="gauge-chart-wrapper">
            <svg className="gauge-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gauge_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
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
            <span className="usage-label" id="usageLabel">Words Remaining</span>
            <span className="usage-count" id="usageCount">
              {isUnlimited
                ? 'Unlimited'
                : `${remainingInt.toLocaleString()} / ${safeMaxWords.toLocaleString()}`}
            </span>
            <div className="usage-bar-track">
              <div className="usage-bar-fill" style={{ width: isUnlimited ? '100%' : `${pct}%` }}></div>
            </div>

            <div
              id="usageResetTimer"
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
                fontWeight: '500',
                lineHeight: '1.3',
              }}
            >
              {isUnlimited ? (
                <>
                  Unlimited Access<br />
                  <span
                    style={{
                      opacity: 0.75,
                      fontSize: '0.66rem',
                      display: 'block',
                      marginTop: '3px',
                      fontWeight: 400,
                    }}
                  >
                    {planLabel} subscription active
                  </span>
                </>
              ) : (
                <>
                  <span
                    style={{
                      opacity: 0.75,
                      fontSize: '0.66rem',
                      display: 'block',
                      marginTop: '3px',
                      fontWeight: 400,
                    }}
                  >
                    Restore in 24 hours · 5,000 words daily limit
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Axom AI Mobile App */}
      <a
        href="/download/app/"
        className="btn-download-mobile-app"
        download="AxomAI.apk"
        title="Download Axom AI Mobile App"
      >
        <Smartphone size={17} className="app-icon" />
        <span>Download Axom AI Mobile App</span>
        <Download size={15} className="dl-icon" />
      </a>

      {/* Quick Tips Panel */}
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-title">Quick Tips</span>
        </div>
        <ul className="quick-tips-list">
          <li><span className="tip-dot">•</span> Use <kbd>Ctrl+K</kbd> to focus chat input</li>
          <li><span className="tip-dot">•</span> Ask in English, Hindi or Hinglish — replies come in Assamese</li>
          <li><span className="tip-dot">•</span> Pin or delete chats from the ⋮ menu</li>
          <li><span className="tip-dot">•</span> Manage archived chats in Settings</li>
        </ul>
      </div>
    </aside>
  );
}
