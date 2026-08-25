import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function SidebarRight({
  user,
  remainingWords,
  maxWords,
  onUpgrade,
  isCollapsed
}) {
  const pct = (remainingWords / maxWords) * 100;
  const remainingInt = Math.floor(remainingWords);
  const offset = 238.76 * (1 - pct / 100);

  return (
    <aside className={`sidebar-right ${isCollapsed ? 'collapsed' : ''}`} id="sidebarRight">
      {/* Pro Upgrade Promo Card */}
      {!user.isAuthenticated && (
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
              <p className="promo-subtitle">Unlock advanced models, plugins, and more.</p>
            </div>
          </div>
          <button className="btn-upgrade" onClick={onUpgrade} id="btnUpgrade">Upgrade Now</button>
        </div>
      )}

      {/* Usage Widget Panel */}
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-title">Usage</span>
          <button className="dropdown-filter-btn">
            <span>This Month</span>
            <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
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
                strokeDashoffset={user.isAuthenticated ? 0 : offset}
              ></circle>
            </svg>
            <div className="gauge-text">
              <span className="gauge-percent">
                {user.isAuthenticated ? '∞' : `${Math.round(pct)}%`}
              </span>
            </div>
          </div>

          <div className="usage-info">
            <span className="usage-label" id="usageLabel">Words Remaining</span>
            <span className="usage-count" id="usageCount">
              {user.isAuthenticated ? 'Unlimited' : `${remainingInt.toLocaleString()} / 5,000`}
            </span>
            <div className="usage-bar-track">
              <div className="usage-bar-fill" style={{ width: user.isAuthenticated ? '100%' : `${pct}%` }}></div>
            </div>

            <div id="usageResetTimer" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500', lineHeight: '1.3' }}>
              {user.isAuthenticated ? (
                <>
                  Unlimited Access<br />
                  <span style={{ opacity: 0.75, fontSize: '0.66rem', display: 'block', marginTop: '3px', fontWeight: 400 }}>
                    Logged in as Pro user
                  </span>
                </>
              ) : (
                <>
                  {remainingWords >= maxWords ? (
                    <>
                      Fully Charged<br />
                      <span style={{ opacity: 0.75, fontSize: '0.66rem', display: 'block', marginTop: '3px', fontWeight: 400 }}>
                        Restore in 24 hours. Once 24 hours are completed, you will get 5000 words again.
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Restoring...</span><br />
                      <span style={{ opacity: 0.75, fontSize: '0.66rem', display: 'block', marginTop: '3px', fontWeight: 400 }}>
                        Restore in 24 hours. Once 24 hours are completed, you will get 5000 words again.
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips Panel */}
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-title">Quick Tips</span>
        </div>
        <ul className="quick-tips-list">
          <li><span className="tip-dot">•</span> Use <kbd>Ctrl+K</kbd> to focus chat input</li>
          <li><span className="tip-dot">•</span> Web Search requires a login</li>
          <li><span className="tip-dot">•</span> Axom AI answers history incidents 1900+</li>
          <li><span className="tip-dot">•</span> Upload documents in Admin Panel to build KB</li>
        </ul>
      </div>
    </aside>
  );
}
