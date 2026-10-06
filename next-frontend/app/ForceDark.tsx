'use client';

import { useEffect } from 'react';

// The tools and the chat have their own dark look: keep the `dark` class on <html> while they are on screen.
export default function ForceDark() {
  useEffect(() => {
    const el = document.documentElement;
    const had = el.classList.contains('dark');
    el.classList.add('dark');
    return () => {
      if (!had && !window.matchMedia('(prefers-color-scheme: dark)').matches) el.classList.remove('dark');
    };
  }, []);
  return null;
}
