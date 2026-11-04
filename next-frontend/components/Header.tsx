'use client';

import React from 'react';
import Navbar from './Navbar';
import { HeaderData } from '@/lib/api';

export interface HeaderProps {
  header?: HeaderData;
  onBackToChat?: () => void;
  className?: string;
}

/**
 * Reusable Header component for Axom AI.
 * Can be added to any page with zero configuration or with optional CMS header data.
 *
 * Usage:
 * ```tsx
 * import Header from '@/components/Header';
 *
 * export default function AnyPage() {
 *   return (
 *     <>
 *       <Header />
 *       <main>Your content</main>
 *     </>
 *   );
 * }
 * ```
 */
export default function Header({ header, onBackToChat }: HeaderProps) {
  return <Navbar header={header} onBackToChat={onBackToChat} />;
}

