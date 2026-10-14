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
    // Google Analytics cookies left by visits from before this banner existed (they last 2 years) are removed unless analytics was accepted
    if (!c || !c.analytics) removeAnalyticsCookies();
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

  // a low bar across the whole width: the words on the left, the three buttons on the right (they go under the words on a phone)
  const btn = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';
  const neutral = `${btn} bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white`;
  const main = `${btn} bg-emerald-600 hover:bg-emerald-500 text-white`;
  const outline = `${btn} border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5`;
  const link = 'underline font-medium text-emerald-700 dark:text-emerald-400';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-emerald-900/15 dark:border-white/10 bg-white/95 dark:bg-[#0f1a2e]/95 backdrop-blur text-slate-800 dark:text-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.18)] max-h-[70vh] overflow-y-auto"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie choices"
      data-cookie-banner
    >
      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
          <p className="flex-1 text-[11.5px] sm:text-xs leading-snug text-slate-600 dark:text-slate-300">
            <strong className="text-emerald-900 dark:text-white">Cookies:</strong> we use necessary cookies to keep the site working, and Google Analytics only if you allow it.
            Refusing is fine, every feature keeps working. Change it any time from <em>Cookie Settings</em> in the footer.{' '}
            <Link href="/cookie-policy" className={link}>Cookie Policy</Link> &middot; <Link href="/privacy" className={link}>Privacy Policy</Link>
            <span lang="as" className="font-assamese"> &nbsp;|&nbsp; প্ৰয়োজনীয় কুকী সদায় চলে; Analytics কুকী কেৱল আপোনাৰ অনুমতিৰ পিছতহে। অস্বীকাৰ কৰিলেও সকলো সুবিধা পাব।</span>
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {customize ? (
              <>
                <button ref={firstButton} type="button" className={main} onClick={() => save(analytics)}>Save my choices</button>
                <button
                  type="button"
                  className={neutral}
                  onClick={() => { const c = readConsent(document.cookie, stored()); if (c) { setShow(false); setCustomize(false); } else { setCustomize(false); } }}
                >
                  Back
                </button>
              </>
            ) : (
              <>
                <button type="button" className={neutral} onClick={() => save(false)}>Reject non-essential</button>
                <button type="button" className={main} onClick={() => save(true)}>Accept all</button>
                <button type="button" className={outline} onClick={() => setCustomize(true)}>Customize</button>
              </>
            )}
          </div>
        </div>

        {customize && (
          <div className="mt-2 grid gap-2 md:grid-cols-2" aria-label="Cookie categories">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2">
              <div>
                <div className="text-xs font-semibold">Strictly necessary</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Sign-in, security, your device’s usage limits, language, theme and this choice. The site cannot work without them.</div>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Always on</span>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Analytics (Google Analytics)</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Counts visits and shows which pages are useful (cookies _ga, _ga_*). Off unless you switch it on.</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-emerald-600"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label="Allow analytics cookies"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

/** For the footer: opens the cookie choices again. */
export function openCookieSettings() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}
