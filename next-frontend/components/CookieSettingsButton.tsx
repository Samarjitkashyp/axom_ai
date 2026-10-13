'use client';

import React from 'react';
import { openCookieSettings } from './CookieConsent';

/** A button that opens the cookie choices (used on the Cookie Policy page and in the footer). */
export default function CookieSettingsButton({ className, label = 'Cookie Settings' }: { className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className || 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition'}
    >
      {label}
    </button>
  );
}
