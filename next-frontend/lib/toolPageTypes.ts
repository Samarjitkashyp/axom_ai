import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

export interface HowToStep {
  title: string;
  description: string;
  /** Color accent: 'purple' | 'fuchsia' | 'emerald' (defaults cycle through these) */
  accent?: 'purple' | 'fuchsia' | 'emerald';
}

export interface BenefitItem {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface UseCaseItem {
  icon: ReactNode;
  title: string;
  description: string;
  /** Border hover color, e.g. 'purple', 'emerald', 'fuchsia', 'blue' */
  accent?: string;
}

export interface ComparisonRow {
  feature: string;
  axom: string;
  other: string;
  paid: string;
  axom_check: boolean;
  other_check: boolean;
}

export interface TechSpec {
  label: string;
  value: string;
}

export interface ToolPageData {
  // --- SEO / Metadata ---
  slug: string; // e.g. 'word-to-pdf'
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl?: string;
  keywords: string[];

  // --- Breadcrumb ---
  breadcrumbName: string; // e.g. 'Word to PDF Converter'

  // --- Hero Section ---
  heroBadgeText: string;
  heroHeadingPrefix: string;
  heroHeadingHighlight: string;
  heroHeadingSuffix: string;
  heroDescription: string;
  heroTags: string[]; // e.g. ['Convert DOCX & DOC', '100% Free Daily Quota', ...]

  // --- AEO / Generative Engine Summary Box ---
  aeoTitle: string;
  aeoDescription: string; // supports HTML via dangerouslySetInnerHTML
  aeoHighlights: string[]; // e.g. ['100% Free Daily Conversions', 'No Watermark Added']

  // --- How It Works ---
  howItWorksTitle?: string;
  howItWorksSubheading?: string;
  steps: HowToStep[];

  // --- Benefits ---
  benefitsTitle?: string;
  benefitsSubheading?: string;
  benefits: BenefitItem[];

  // --- Use Cases ---
  useCasesTitle?: string;
  useCasesSubheading?: string;
  useCases: UseCaseItem[];

  // --- Comparison Table ---
  comparisonBadge?: string;
  comparisonTitle?: string;
  comparisonSubheading?: string;
  comparisonRows: ComparisonRow[];

  // --- Tech Specs ---
  techSpecTitle?: string;
  techSpecs: TechSpec[];

  // --- India / Regional Section ---
  regionalTitle?: string;
  regionalDescription: string; // supports HTML
  regionalBadge?: string;

  // --- FAQ ---
  faqTitle?: string;
  faqSubheading?: string;
  faqs: FaqItem[];

  // --- CTA ---
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;

  // --- JSON-LD Schema overrides ---
  appName: string; // e.g. 'Axom AI Word to PDF Converter'
  appAlternateNames?: string[];
  appDescription?: string;
  appCategory?: string;
  appOperatingSystem?: string;
  appFeatureList?: string[];
  appVersion?: string;
  appRatingValue?: string;
  appReviewCount?: string;
  howToSchemaName?: string;
  howToSchemaDescription?: string;
  howToTotalTime?: string;
  howToToolName?: string;
}

/** Helper to build Next.js Metadata from ToolPageData */
export function buildToolMetadata(data: ToolPageData): Metadata {
  const ogImage = data.ogImageUrl || 'https://aiaxom.co.in/static/dist/hero/assam.avif';
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: data.canonicalUrl },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: data.canonicalUrl,
      siteName: 'Axom AI',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
