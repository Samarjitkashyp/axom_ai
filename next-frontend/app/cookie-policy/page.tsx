import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CookieSettingsButton from '../../components/CookieSettingsButton';
import { getLandingCMS } from '../../lib/api';
import { Cookie, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UPDATED = 'October 13, 2026';
const VERSION = '1.0';

export const metadata: Metadata = {
  title: 'Cookie Policy — Cookies and Local Storage on Axom AI (DPDP Act 2023)',
  description:
    'Which cookies Axom AI uses, why, how long they last, and how to accept, refuse or withdraw your choice. Written for India: DPDP Act 2023 and the Information Technology Act 2000.',
  alternates: { canonical: 'https://aiaxom.co.in/cookie-policy/' },
  robots: { index: true, follow: true },
};

type Row = { name: string; who: string; purpose: string; lasts: string; kind: 'Strictly necessary' | 'Functional' | 'Analytics' };

const COOKIES: Row[] = [
  { name: 'csrftoken', who: 'Axom AI', purpose: 'Protects forms and requests from forgery (CSRF).', lasts: '1 year', kind: 'Strictly necessary' },
  { name: 'sessionid', who: 'Axom AI', purpose: 'Keeps you signed in. HttpOnly: not readable by scripts.', lasts: 'Up to 2 weeks, or until you sign out', kind: 'Strictly necessary' },
  { name: 'axom_user_auth', who: 'Axom AI', purpose: 'Tells the pages of the site that you are signed in, so that the right buttons are shown.', lasts: 'Up to 2 weeks, or until you sign out', kind: 'Strictly necessary' },
  { name: 'axom_device_uid', who: 'Axom AI', purpose: 'A random device code (not your name or e-mail). Used to stop abuse and to apply the daily limits of signed-out visitors. Also kept in your browser storage.', lasts: 'Up to 10 years (delete it any time in your browser)', kind: 'Strictly necessary' },
  { name: 'axom_cookie_consent', who: 'Axom AI', purpose: 'Remembers your choice on this page, so that we do not ask again on every visit.', lasts: '12 months', kind: 'Strictly necessary' },
  { name: '__cf_bm, cf_clearance (if present)', who: 'Cloudflare', purpose: 'Bot and attack protection when you open the site or the contact form (Turnstile check).', lasts: 'Minutes to a day', kind: 'Strictly necessary' },
  { name: 'Browser storage keys (not cookies): axom_chat_language, axom_tts_voice, axom_custom_persona_*, theme', who: 'Axom AI', purpose: 'Your language, the voice you chose for read-aloud, your custom instructions and your light / dark theme. They stay on your device.', lasts: 'Until you clear your browser data', kind: 'Functional' },
  { name: '_ga, _ga_<container id>', who: 'Google Analytics (through Google Tag Manager)', purpose: 'Tells visits apart and counts which pages are used, so that we can improve the site. Set only if you accept analytics.', lasts: '2 years', kind: 'Analytics' },
];

const TH = 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-3 py-2';
const TD = 'align-top px-3 py-3 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10';
const H2 = 'text-xl sm:text-2xl font-bold text-emerald-950 dark:text-white mt-10 mb-3';
const P = 'text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-3';

export default async function CookiePolicyPage() {
  const landing = await getLandingCMS().catch(() => null);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Axom AI Cookie Policy',
    url: 'https://aiaxom.co.in/cookie-policy/',
    dateModified: '2026-10-13',
    inLanguage: ['en-IN', 'as-IN'],
    publisher: { '@type': 'Organization', name: 'Axom AI', url: 'https://aiaxom.co.in' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar header={landing?.header} />

      <main className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-5">
              <Cookie className="w-3.5 h-3.5" /> DPDP Act 2023 &amp; Information Technology Act 2000
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight">Cookie Policy</h1>
            <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300">
              What small files and browser storage Axom AI uses, why, for how long, and how you stay in control.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Last updated: <strong>{UPDATED}</strong></span>
              <span>&bull;</span>
              <span>Version <strong className="font-mono">{VERSION}</strong></span>
            </div>
            <div className="mt-6"><CookieSettingsButton /></div>
          </div>

          <section aria-label="Summary in Assamese" lang="as" className="rounded-2xl border border-emerald-900/15 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 mb-8 font-assamese">
            <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">অসমীয়াত চমু (Summary in Assamese)</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
              <li>সাইটখন চলাবলৈ আৰু আপোনাক নিৰাপদে ৰাখিবলৈ কিছুমান <strong>প্ৰয়োজনীয় কুকী</strong> সদায় ব্যৱহাৰ কৰা হয় (যেনে—লগইন, নিৰাপত্তা)।</li>
              <li><strong>Google Analytics</strong> কুকী কেৱল আপুনি “Accept all” বা অনুমতি দিলেহে চলে। আপুনি অস্বীকাৰ কৰিলেও আপোনাৰ কোনো সুবিধা কমি নাযায়।</li>
              <li>আমি বিজ্ঞাপনৰ কুকী ব্যৱহাৰ নকৰোঁ আৰু আপোনাৰ তথ্য বিক্ৰী নকৰোঁ।</li>
              <li>যিকোনো সময়ত পৃষ্ঠাৰ তলৰ “Cookie Settings” টিপি আপোনাৰ পছন্দ সলনি কৰিব বা প্ৰত্যাহাৰ কৰিব পাৰে।</li>
              <li>প্ৰশ্ন বা অভিযোগৰ বাবে: support@aiaxom.co.in</li>
            </ul>
          </section>

          <h2 className={H2}>1. What are cookies?</h2>
          <p className={P}>
            A cookie is a small text file that a website stores in your browser. Browsers also offer “local storage”, which works in a similar way. In this policy
            both are called cookies unless we say otherwise. They are used to remember you between pages, to keep the site safe and, only if you allow it, to
            measure how the site is used.
          </p>

          <h2 className={H2}>2. Your consent and your choices (India)</h2>
          <p className={P}>
            Under the Digital Personal Data Protection Act, 2023, we ask for your consent before we use anything that is not strictly necessary. Your consent is
            voluntary, specific to analytics cookies, and given by a clear action (pressing <em>Accept all</em>, or switching analytics on in <em>Customize</em>).
            <strong> Refusing is as easy as accepting</strong> (<em>Reject non-essential</em>) and you lose no feature of Axom AI if you refuse.
          </p>
          <p className={P}>
            You can change your mind at any time: use <strong>Cookie Settings</strong> in the footer of every page (or the button above). If you withdraw analytics,
            we remove the Google Analytics cookies we can reach and stop loading it. Strictly necessary cookies need no consent because the site cannot work without
            them; you can still block them in your browser, but then you cannot sign in or use the chat.
          </p>

          <h2 className={H2}>3. The cookies we use</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={TH}>Name</th><th className={TH}>Set by</th><th className={TH}>Purpose</th><th className={TH}>Lasts</th><th className={TH}>Type</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((c) => (
                  <tr key={c.name}>
                    <td className={`${TD} font-mono text-xs break-words`}>{c.name}</td>
                    <td className={TD}>{c.who}</td>
                    <td className={TD}>{c.purpose}</td>
                    <td className={TD}>{c.lasts}</td>
                    <td className={`${TD} whitespace-nowrap`}>
                      <span className={c.kind === 'Analytics' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-emerald-700 dark:text-emerald-400 font-semibold'}>{c.kind}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${P} mt-3`}>
            <strong>We do not use advertising, remarketing or cross-site tracking cookies, and we do not sell your data.</strong>
          </p>

          <h2 className={H2}>4. Other companies whose services may set cookies</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
            <li><strong>Google (Analytics, Tag Manager)</strong>: only after you accept analytics. Google processes the data under its own terms. You can also install Google’s opt-out add-on for your browser.</li>
            <li><strong>Google Sign-In</strong>: when you choose “Sign in with Google”, Google’s sign-in script runs and Google may set its own cookies on its pages.</li>
            <li><strong>Razorpay</strong>: when you pay for a plan, Razorpay’s checkout (payments and fraud prevention) may set its own cookies. We never see your card or UPI details.</li>
            <li><strong>Cloudflare</strong>: protects the site against attacks and bots, and may measure traffic without cookies (Web Analytics, no personal identifiers).</li>
            <li><strong>Google Fonts, Font Awesome (CDN)</strong>: load fonts and icons. They may see your IP address when they deliver the files, but set no cookie for us.</li>
          </ul>

          <h2 className={H2}>5. Managing cookies in your browser</h2>
          <p className={P}>
            All browsers (Chrome, Edge, Firefox, Safari) let you see, block and delete cookies in their settings. Blocking strictly necessary cookies will stop sign-in
            and chat history. Deleting the <span className="font-mono text-xs">axom_cookie_consent</span> cookie makes this site ask you again.
          </p>

          <h2 className={H2}>6. Changes to this policy</h2>
          <p className={P}>
            When the cookies we use change in a way that needs your consent (for example a new analytics tool), we change the version of the banner and ask everybody
            again. The date at the top shows when this page was last changed.
          </p>

          <h2 className={H2}>7. Contact and grievances</h2>
          <p className={P}>
            Questions, requests to withdraw consent or complaints: <a className="underline text-emerald-700 dark:text-emerald-400" href="mailto:support@aiaxom.co.in">support@aiaxom.co.in</a>.
            Grievance Redressal Officer: Samarjit Kashyap, Axom AI, Guwahati, Assam, India (PIN 781001). We acknowledge within 48 hours. More about your rights:
            see our <a className="underline text-emerald-700 dark:text-emerald-400" href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </main>

      <Footer footer={landing?.footer} />
    </>
  );
}
