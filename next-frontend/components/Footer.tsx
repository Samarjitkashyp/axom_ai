import React from 'react';
import Link from 'next/link';
import { FooterData } from '@/lib/api';

const DEFAULT_COLS = [
  {
    title: 'Product',
    links: [
      { id: 1, title: 'AI Tools', url: 'https://chat.aiaxom.co.in/tools', is_external: true },
      { id: 2, title: 'Pricing', url: '/#pricing', is_external: false },
      { id: 3, title: "What's New", url: '/blog', is_external: false },
      { id: 4, title: 'Use Cases', url: '/#usecases', is_external: false },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { id: 5, title: 'For Students', url: '/#usecases', is_external: false },
      { id: 6, title: 'For Businesses', url: '/#usecases', is_external: false },
      { id: 7, title: 'For Educators', url: '/#usecases', is_external: false },
      { id: 8, title: 'For Developers', url: '/#usecases', is_external: false },
    ],
  },
  {
    title: 'Resources',
    links: [
      { id: 9, title: 'Blog & Insights', url: '/blog', is_external: false },
      { id: 10, title: 'Frequently Asked Questions', url: '/faq', is_external: false },
      { id: 11, title: 'Help & Support', url: 'https://user.aiaxom.co.in/support/', is_external: true },
      { id: 12, title: 'AI Tools Directory', url: 'https://chat.aiaxom.co.in/tools', is_external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { id: 13, title: 'About Axom AI', url: '/about', is_external: false },
      { id: 14, title: 'Privacy Policy', url: '/faq', is_external: false },
      { id: 15, title: 'Terms of Service', url: '/faq', is_external: false },
      { id: 16, title: 'Contact Support', url: 'mailto:samarjitkashyp@gmail.com', is_external: true },
    ],
  },
];

const DEFAULT_SOCIALS = [
  { id: 1, platform: 'X (Twitter)', icon_class: 'fa-brands fa-x-twitter', url: 'https://x.com' },
  { id: 2, platform: 'LinkedIn', icon_class: 'fa-brands fa-linkedin-in', url: 'https://linkedin.com' },
  { id: 3, platform: 'YouTube', icon_class: 'fa-brands fa-youtube', url: 'https://youtube.com' },
  { id: 4, platform: 'Instagram', icon_class: 'fa-brands fa-instagram', url: 'https://instagram.com' },
];

interface FooterProps {
  footer?: FooterData;
  seo?: {
    footer_tagline?: string;
    meta_title?: string;
  };
}

function toCssDimension(val?: string, defaultVal?: string): string | undefined {
  if (!val) return defaultVal;
  const trimmed = val.trim();
  if (!trimmed) return defaultVal;
  if (trimmed.toLowerCase() === 'auto') return 'auto';
  const pxMatch = trimmed.match(/^([0-9.]+)(?:px)?$/i);
  if (pxMatch) {
    const px = parseFloat(pxMatch[1]);
    if (!isNaN(px)) {
      return `${(px / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
    }
  }
  return trimmed;
}

export default function Footer({ footer, seo }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const logoUrl = (footer?.logo_image_url && footer.logo_image_url !== '/axom-logo.png')
    ? footer.logo_image_url
    : '/axom-logo.svg';
  const logoWidth = toCssDimension(footer?.logo_width, '11.25rem');
  const logoHeight = toCssDimension(footer?.logo_height, 'auto');
  const logoFit = (footer?.logo_fit as React.CSSProperties['objectFit']) || 'contain';
  const description = footer?.description || 'AI for a more inclusive future.\nBuilt in Assam, for the world.';
  const footerTagline = footer?.tagline || seo?.footer_tagline || 'অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Smart. Assamese. AI for All.';
  const copyrightText = footer?.copyright_text || 'Axom AI. All rights reserved.';

  const columns = footer?.columns && footer.columns.length > 0 ? footer.columns : DEFAULT_COLS;
  const socials = footer?.social_links && footer.social_links.length > 0 ? footer.social_links : DEFAULT_SOCIALS;

  return (
    <footer className="border-t border-white/5 pt-14 md:pt-16 pb-8 bg-black/80 mt-20 relative">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 group">
              <img
                src={logoUrl}
                alt="Axom AI — Smart. Assamese. AI For All."
                style={{
                  width: logoWidth,
                  height: logoHeight,
                  objectFit: logoFit,
                  maxWidth: '100%',
                  maxHeight: '3.75rem',
                }}
                className="w-auto h-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed mb-5 whitespace-pre-line">
              {description}
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.id || s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-fuchsia-500/20 hover:text-fuchsia-400 grid place-items-center text-gray-400 text-xs transition"
                >
                  <i className={s.icon_class} />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Navigation Columns */}
          {columns.map((col, i) => (
            <div key={col.id || i}>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3.5">
                {col.title}
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {(col.links || []).map((link, j) => {
                  const isExt = link.is_external || link.url.startsWith('http') || link.url.startsWith('mailto');
                  return (
                    <li key={link.id || j}>
                      {isExt ? (
                        <a
                          href={link.url}
                          className="hover:text-fuchsia-400 transition-colors text-xs sm:text-sm"
                          {...(link.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.url}
                          className="hover:text-fuchsia-400 transition-colors text-xs sm:text-sm"
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>&copy; {currentYear} {copyrightText}</span>
            <Link href="/faq" className="hover:text-fuchsia-400 transition">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-fuchsia-400 transition">Terms of Use</Link>
            <a href="mailto:samarjitkashyp@gmail.com" className="hover:text-fuchsia-400 transition">Support</a>
          </div>
          <div>
            Made with <span className="text-red-500">&hearts;</span> in Assam, India &#127470;&#127475;
          </div>
        </div>

        {/* Regional Tagline */}
        <div className="mt-6 text-center font-assamese text-fuchsia-300/60 text-xs sm:text-sm">
          {footerTagline}
        </div>
      </div>
    </footer>
  );
}
