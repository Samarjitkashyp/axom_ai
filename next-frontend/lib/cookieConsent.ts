// The visitor's cookie choice (India: the DPDP Act 2023 asks for consent that is free, specific, informed and given by a clear action,
// that can be withdrawn as easily as it was given). Pure functions, no React: they are tested with node (tests/cookie-consent.check.mjs).

export const CONSENT_COOKIE = 'axom_cookie_consent';
export const CONSENT_VERSION = 1;          // raise it when the categories change: everybody is asked again
export const CONSENT_DAYS = 365;           // the choice is asked again after a year
export const GTM_ID = 'GTM-K4N88ZBR';      // Google Tag Manager (Google Analytics): loaded only after "analytics" is accepted

export type Consent = { v: number; analytics: boolean; ts: number };

/** "1:0:1760000000" = version 1, analytics refused, decided at that Unix second. Anything else (or too old, or from the future) means "not decided". */
export function parseConsent(raw: string | null | undefined, now: number = Date.now()): Consent | null {
  if (!raw) return null;
  const m = /^(\d+):([01]):(\d{9,11})$/.exec(raw.trim());
  if (!m) return null;
  const v = Number(m[1]);
  const ts = Number(m[3]);
  const nowSec = Math.floor(now / 1000);
  if (v !== CONSENT_VERSION) return null;
  if (ts > nowSec + 300) return null;
  if (nowSec - ts > CONSENT_DAYS * 86400) return null;
  return { v, analytics: m[2] === '1', ts };
}

export function serializeConsent(analytics: boolean, now: number = Date.now()): string {
  return `${CONSENT_VERSION}:${analytics ? 1 : 0}:${Math.floor(now / 1000)}`;
}

function cookieValue(cookieString: string, name: string): string | null {
  for (const part of (cookieString || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/** The newest valid choice of the cookie (shared by all aiaxom.co.in sites) and of this browser's storage. */
export function readConsent(cookieString: string, storedValue: string | null, now: number = Date.now()): Consent | null {
  const a = parseConsent(cookieValue(cookieString, CONSENT_COOKIE), now);
  const b = parseConsent(storedValue, now);
  if (a && b) return a.ts >= b.ts ? a : b;
  return a || b;
}

/** ".aiaxom.co.in" for every aiaxom.co.in site (so the chat and the main site share one choice), else no Domain attribute. */
export function cookieDomain(hostname: string): string {
  return /(^|\.)aiaxom\.co\.in$/.test(hostname || '') ? '.aiaxom.co.in' : '';
}

export function consentCookieString(value: string, hostname: string, secure: boolean): string {
  const domain = cookieDomain(hostname);
  return `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Max-Age=${CONSENT_DAYS * 86400}; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}${secure ? '; Secure' : ''}`;
}

/** Google Analytics cookies (set by the tag manager once analytics was accepted): they are removed when the choice is withdrawn. */
export function analyticsCookieNames(cookieString: string): string[] {
  const names: string[] = [];
  for (const part of (cookieString || '').split(';')) {
    const name = part.split('=')[0].trim();
    if (/^(_ga|_ga_[A-Za-z0-9]+|_gid|_gat(_.*)?|_gcl_[a-z]+|_dc_gtm_.*)$/.test(name)) names.push(name);
  }
  return names;
}

/** One expiring Set-Cookie string per name, for the host and for the parent domain (the tag manager sets them on the parent domain). */
export function expireCookieStrings(names: string[], hostname: string): string[] {
  const out: string[] = [];
  // our own sites: the host, and .aiaxom.co.in (never ".co.in": that is a public suffix a site cannot set cookies on)
  const domains = cookieDomain(hostname) ? ['', hostname, '.' + hostname, '.aiaxom.co.in'] : ['', hostname, '.' + (hostname || '')];
  for (const name of names) {
    for (const d of domains) out.push(`${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${d ? `; Domain=${d}` : ''}`);
  }
  return out;
}
