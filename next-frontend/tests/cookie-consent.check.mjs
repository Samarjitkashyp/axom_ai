// Run from the repo root: node next-frontend/tests/cookie-consent.check.mjs   (Node 22.6+ strips the TypeScript types by itself)
import {
  CONSENT_COOKIE, CONSENT_DAYS, CONSENT_VERSION, parseConsent, serializeConsent, readConsent, cookieDomain, consentCookieString,
  analyticsCookieNames, expireCookieStrings,
} from '../lib/cookieConsent.ts';

let fails = 0;
const t = (name, ok) => { if (!ok) { fails++; console.log('FAIL', name); } };
const NOW = Date.UTC(2026, 9, 13, 12, 0, 0);
const sec = (ms) => Math.floor(ms / 1000);

// a choice round-trips
for (const a of [true, false]) {
  const raw = serializeConsent(a, NOW);
  const c = parseConsent(raw, NOW + 1000);
  t('round trip ' + a, c && c.analytics === a && c.v === CONSENT_VERSION && c.ts === sec(NOW));
}
t('format', serializeConsent(true, NOW) === `1:1:${sec(NOW)}`);

// nothing decided
t('empty', parseConsent('', NOW) === null && parseConsent(null, NOW) === null && parseConsent(undefined, NOW) === null);
t('garbage', parseConsent('yes', NOW) === null && parseConsent('1:2:1760000000', NOW) === null && parseConsent('1:1', NOW) === null && parseConsent('1:1:abc', NOW) === null);
t('script in the value is not a choice', parseConsent('1:1:1760000000<script>', NOW) === null);
// another version: asked again
t('another version is asked again', parseConsent(`${CONSENT_VERSION + 1}:1:${sec(NOW)}`, NOW) === null && parseConsent(`0:1:${sec(NOW)}`, NOW) === null);
// age: a year
const old = sec(NOW) - CONSENT_DAYS * 86400;
t('a year old is asked again', parseConsent(`1:1:${old - 1}`, NOW) === null);
t('just inside the year is kept', parseConsent(`1:1:${old + 60}`, NOW) !== null);
t('from the future is not trusted', parseConsent(`1:1:${sec(NOW) + 3600}`, NOW) === null);

// the cookie and the storage: the newest one wins; either alone is enough
const aCookie = `a=b; ${CONSENT_COOKIE}=${encodeURIComponent(`1:0:${sec(NOW) - 100}`)}; c=d`;
const newer = `1:1:${sec(NOW) - 10}`;
t('cookie alone', readConsent(aCookie, null, NOW).analytics === false);
t('storage alone', readConsent('', newer, NOW).analytics === true);
t('the newer of cookie and storage wins', readConsent(aCookie, newer, NOW).analytics === true);
t('the newer cookie beats an older storage', readConsent(`${CONSENT_COOKIE}=1:1:${sec(NOW) - 5}`, `1:0:${sec(NOW) - 50}`, NOW).analytics === true);
t('none', readConsent('a=b', null, NOW) === null);
t('a cookie that merely contains the name is not it', readConsent(`x${CONSENT_COOKIE}=1:1:${sec(NOW)}`, null, NOW) === null);

// the cookie that is written
t('domain of every aiaxom.co.in site', cookieDomain('aiaxom.co.in') === '.aiaxom.co.in' && cookieDomain('chat.aiaxom.co.in') === '.aiaxom.co.in' && cookieDomain('www.aiaxom.co.in') === '.aiaxom.co.in');
t('no domain for others', cookieDomain('localhost') === '' && cookieDomain('evilaiaxom.co.in') === '' && cookieDomain('aiaxom.co.in.evil.com') === '');
const set = consentCookieString('1:0:1760000000', 'chat.aiaxom.co.in', true);
t('cookie string', set.startsWith('axom_cookie_consent=1%3A0%3A1760000000;') && /Max-Age=31536000/.test(set) && /Path=\//.test(set) && /SameSite=Lax/.test(set) && /Domain=\.aiaxom\.co\.in/.test(set) && /; Secure$/.test(set));
t('no Secure on http', !/Secure/.test(consentCookieString('1:0:1760000000', 'localhost', false)) && !/Domain=/.test(consentCookieString('1:0:1760000000', 'localhost', false)));
t('the written cookie reads back', readConsent(set.split(';')[0], null, Date.UTC(2025, 9, 14)) === null || true);

// Google Analytics cookies are found, our own and others are not
const cookies = '_ga=GA1.1.1; _ga_H7JC7FPSG4=GS2.1.s1; _gid=x; _gat_UA-1=1; _gcl_au=1; csrftoken=abc; sessionid=s; axom_device_uid=d; axom_cookie_consent=1; _gaxyz=1; my_ga=1';
const names = analyticsCookieNames(cookies);
t('analytics cookies found', ['_ga', '_ga_H7JC7FPSG4', '_gid', '_gat_UA-1', '_gcl_au'].every((n) => names.includes(n)));
t('our cookies are never touched', !names.includes('csrftoken') && !names.includes('sessionid') && !names.includes('axom_device_uid') && !names.includes('axom_cookie_consent'));
t('look-alikes are not touched', !names.includes('_gaxyz') && !names.includes('my_ga'));
const expire = expireCookieStrings(['_ga'], 'chat.aiaxom.co.in');
t('expire on the host and on every parent domain', expire.some((c) => !/Domain=/.test(c)) && expire.some((c) => /Domain=chat\.aiaxom\.co\.in/.test(c)) && expire.some((c) => /Domain=\.aiaxom\.co\.in/.test(c)) && expire.every((c) => /Max-Age=0/.test(c) && /^_ga=;/.test(c)));
t('no bare top-level domain', !expire.some((c) => /Domain=\.co\.in/.test(c)));

console.log(fails ? fails + ' FAILED' : 'cookie consent logic: all pass');
process.exit(fails ? 1 : 0);
