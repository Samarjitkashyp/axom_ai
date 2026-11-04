import React from 'react';
import type { Metadata } from 'next';
import { pageTitle } from '../../../lib/seoTitle';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import FuelChecker from '../../../components/tools/FuelChecker';

export const dynamic = 'force-dynamic';

const TARGET_KEYWORDS = [
  'fuel compatibility checker',
  'e20 petrol compatibility check',
  'can my bike run on e20 petrol',
  'e20 compatible bikes india',
  'e20 compatible cars list',
  'activa 6g e20 compatible or not',
  'splendor plus e20 petrol',
  'swift e20 petrol compatibility',
  'e10 vs e20 petrol impact on engine',
  'ethanol blended petrol compatibility checker india',
  'axom fuelcheck',
  'e85 flex fuel compatibility',
  'e100 petrol india',
  'bs6 phase 2 e20 fuel rules'
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Fuel Compatibility Checker — Check E5, E10, E20, E85 & E100 Support for Bikes & Cars | Axom AI';
  const description =
    'Find out if your Bike, Scooter, or Car supports E10, E20, E85, or E100 Ethanol-blended petrol. Get verified manufacturer owner manual citations, engine material safety reports, and mileage impact.';
  const canonicalUrl = 'https://aiaxom.co.in/tools/fuel-checker';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title: pageTitle(title),
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom FuelCheck - Vehicle Ethanol Compatibility Checker',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function FuelCheckerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Axom FuelCheck - Vehicle Ethanol Fuel Compatibility Checker',
    url: 'https://aiaxom.co.in/tools/fuel-checker',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description:
      'Authoritative vehicle fuel compatibility checker for Indian motorcycles, scooters, and cars evaluating E5 to E100 ethanol petrol.',
    featureList: [
      'E5, E10, E15, E20, E25, E85, E100 Compatibility Matrix',
      'Material & Engine Calibration Verification',
      'Official Manufacturer Owner Manual Quotes',
      'Mileage & Fuel Economy Loss Calculations',
      'AI Grounded Automotive Doubt Solver',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <FuelChecker />
      </main>
      <Footer />
    </>
  );
}
