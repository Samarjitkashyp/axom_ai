import type { Metadata } from 'next';

/**
 * The root layout adds " | Axom AI" to every page title (title.template). A title that already ends with the brand
 * ("... | Axom AI", "... — Axom AI") must not get it a second time, so it is passed as an absolute title.
 */
export function pageTitle(title: string): Metadata['title'] {
  return /axom\s?ai\s*$/i.test(title.trim()) ? { absolute: title.trim() } : title;
}
