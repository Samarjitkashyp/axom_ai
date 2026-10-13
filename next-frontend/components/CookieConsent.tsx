'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CONSENT_COOKIE,
  GTM_ID,
  analyticsCookieNames,
  consentCookieString,
  expireCookieStrings,
  readConsent,
  serializeConsent,
} from '../lib/cookieConsent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    __axomGtmLoaded?: boolean;
  }
}

const OPEN_EVENT = 'axom:cookie-settings';

function stored(): string | null {
  try { return localStorage.getItem(CONSENT_COOKIE); } catch { return null; }
}

function loadAnalytics() {
  if (typeof window === 'undefined' || window.__axomGtmLoaded) return;
  window.__axomGtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

function removeAnalyticsCookies() {
  const names = analyticsCookieNames(document.cookie);
  expireCookieStrings(names, window.location.hostname).forEach((c) => { document.cookie = c; });
}

/** Cookie banner for aiaxom.co.in: strictly necessary cookies always, Google Analytics only after the visitor accepts. */
export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const c = readConsent(document.cookie, stored());
    if (c) {
      setAnalytics(c.analytics);
      if (c.analytics) loadAnalytics();
    } else {
      setShow(true);
    }
    const open = () => {
      const now = readConsent(document.cookie, stored());
      setAnalytics(!!now?.analytics);
      setCustomize(true);
      setShow(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (show && customize && firstButton.current) firstButton.current.focus();
  }, [show, customize]);

  const save = useCallback((allowAnalytics: boolean) => {
    const before = readConsent(document.cookie, stored());
    const value = serializeConsent(allowAnalytics);
    document.cookie = consentCookieString(value, window.location.hostname, window.location.protocol === 'https:');
    try { localStorage.setItem(CONSENT_COOKIE, value); } catch { /* private mode: the cookie is enough */ }
    setAnalytics(allowAnalytics);
    setShow(false);
    setCustomize(false);
    if (allowAnalytics) {
      loadAnalytics();
    } else if (before?.analytics || window.__axomGtmLoaded) {
      removeAnalyticsCookies();
      window.location.reload();                       // the tag manager that is already running is stopped by a fresh page
    }
  }, []);

  if (!show) return null;

  const btn = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4" role="dialog" aria-modal="false" aria-labelledby="axom-cookie-title" data-cookie-banner>
      <div className="mx-auto max-w-4xl rounded-2xl border border-emerald-900/15 dark:border-white/10 bg-white dark:bg-[#0f1a2e] text-slate-800 dark:text-slate-200 shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
        <h2 id="axom-cookie-title" className="text-base font-bold text-emerald-950 dark:text-white">
          Cookies on Axom AI
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          We use strictly necessary cookies to sign you in and keep the site safe. With your permission we also use analytics cookies (Google Analytics) to
          see how the site is used. Refusing is fine: every feature keeps working. You can change your choice any time from <em>Cookie Settings</em> in the
          footer. <Link href="/cookie-policy" className="underline font-medium text-emerald-700 dark:text-emerald-400">Cookie Policy</Link> &middot;{' '}
          <Link href="/privacy" className="underline font-medium text-emerald-700 dark:text-emerald-400">Privacy Policy</Link>
        </p>
        <p lang="as" className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-assamese">
          প্ৰয়োজনীয় কুকী সদায় চলে। বিশ্লেষণী (Analytics) কুকী কেৱল আপোনাৰ অনুমতি পোৱাৰ পিছতহে চলিব। আপুনি অস্বীকাৰ কৰিলেও সকলো সুবিধা ব্যৱহাৰ কৰিব পাৰিব।
        </p>

        {customize && (
          <div className="mt-3 space-y-2" aria-label="Cookie categories">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 p-3">
              <div>
                <div className="text-sm font-semibold">Strictly necessary</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Sign-in, security (CSRF), your device’s usage limits, your language and theme, and this cookie choice. The site cannot work without them.</div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Always on</span>
            </div>
            <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 p-3 cursor-pointer">
              <div>
                <div className="text-sm font-semibold">Analytics (Google Analytics)</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Counts visits and shows which pages are useful (cookies _ga and _ga_*). Off unless you switch it on.</div>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label="Allow analytics cookies"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          {customize ? (
            <>
              <button ref={firstButton} type="button" className={`${btn} bg-emerald-600 hover:bg-emerald-500 text-white`} onClick={() => save(analytics)}>
                Save my choices
              </button>
              <button type="button" className={`${btn} bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white`} onClick={() => { const c = readConsent(document.cookie, stored()); if (c) { setShow(false); setCustomize(false); } else { setCustomize(false); } }}>
                Back
              </button>
            </>
          ) : (
            <>
              <button type="button" className={`${btn} bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white`} onClick={() => save(false)}>
                Reject non-essential
              </button>
              <button type="button" className={`${btn} bg-emerald-600 hover:bg-emerald-500 text-white`} onClick={() => save(true)}>
                Accept all
              </button>
              <button type="button" className={`${btn} border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5`} onClick={() => setCustomize(true)}>
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** For the footer: opens the cookie choices again. */
export function openCookieSettings() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}
