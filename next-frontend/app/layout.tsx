import type { Metadata, Viewport } from 'next';
import './globals.css';

const GTM_ID = 'GTM-K4N88ZBR';

export const viewport: Viewport = {
  themeColor: '#06060b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aiaxom.co.in'),
  title: {
    default: "Axom AI — The Power of AI for Everyone | Assam's Native AI Platform",
    template: '%s | Axom AI',
  },
  description: "Axom AI is Assam's first indigenous AI platform. Chat in native Assamese, generate AI images, summarize PDFs, and search live web with world-class AI.",
  keywords: [
    'Axom AI',
    'Assamese AI',
    'Assam AI Assistant',
    'Assamese ChatGPT',
    'AI in Assam',
    'Assam AI startup',
    'Northeast India AI'
  ],
  authors: [{ name: 'Axom AI', url: 'https://aiaxom.co.in' }],
  creator: 'Axom AI',
  publisher: 'Axom AI',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://aiaxom.co.in',
    siteName: 'Axom AI',
    title: "Axom AI — Assam's Own AI Platform",
    description: 'Native Assamese intelligence, ChatGPT-grade reasoning, image generation, and document tools built for Assam.',
    images: [
      {
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        width: 1200,
        height: 630,
        alt: 'Axom AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Axom AI — Assam's Own AI Platform",
    description: 'Native Assamese intelligence, ChatGPT-grade reasoning, image generation, and document tools built for Assam.',
    images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Noto+Serif+Bengali:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />

        {/* Google Tag Manager — head snippet (synchronous for Tag Assistant handshake) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        {/* Google Identity Services (OAuth 2.0 / Sign In) */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between">
        {/* Google Tag Manager — noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Schema.org Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Axom AI',
              url: 'https://aiaxom.co.in',
              logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
              sameAs: [
                'https://twitter.com/aiaxom',
                'https://linkedin.com/company/axom-ai',
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
