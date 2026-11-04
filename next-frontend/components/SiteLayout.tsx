'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { HeaderData, FooterData } from '@/lib/api';

export interface SiteLayoutProps {
  children: React.ReactNode;
  header?: HeaderData;
  footer?: FooterData;
  onBackToChat?: () => void;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

/**
 * Reusable full page layout shell containing the standard Axom AI Header and Footer.
 *
 * Usage:
 * ```tsx
 * import SiteLayout from '@/components/SiteLayout';
 *
 * export default function AnyPage() {
 *   return (
 *     <SiteLayout>
 *       <h1>Your Page Title</h1>
 *     </SiteLayout>
 *   );
 * }
 * ```
 */
export default function SiteLayout({
  children,
  header,
  footer,
  onBackToChat,
  className = '',
  hideHeader = false,
  hideFooter = false,
}: SiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {!hideHeader && <Header header={header} onBackToChat={onBackToChat} />}
      <main className={`flex-grow ${className}`}>{children}</main>
      {!hideFooter && <Footer footer={footer} />}
    </div>
  );
}
