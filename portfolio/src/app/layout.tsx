import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://rachelkeysphotography.com';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Rachel Keys Photography | Upstate New York',
    template: '%s | Rachel Keys Photography',
  },
  description:
    'Rachel Keys Photography — timeless wedding, couples, family, and motherhood photography based in Upstate New York.',
  keywords: [
    'photography',
    'wedding photography',
    'couples photography',
    'family photography',
    'Upstate New York photographer',
    'Rachel Keys',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Rachel Keys Photography',
    title: 'Rachel Keys Photography | Upstate New York',
    description:
      'Timeless wedding, couples, family, and motherhood photography based in Upstate New York.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Rachel Keys Photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rachel Keys Photography | Upstate New York',
    description:
      'Timeless wedding, couples, family, and motherhood photography based in Upstate New York.',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data — LocalBusiness + Person schema for Rachel's photography business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  name: 'Rachel Keys Photography',
  description:
    'Timeless wedding, couples, family, and motherhood photography based in Upstate New York.',
  url: SITE_URL,
  telephone: '',
  email: 'rachelkeysphotography@gmail.com',
  sameAs: ['https://instagram.com/rachelkeysphotography'],
  image: OG_IMAGE,
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 43.048,
      longitude: -76.147,
    },
    geoRadius: '200000',
  },
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
  founder: {
    '@type': 'Person',
    name: 'Rachel Keys',
    jobTitle: 'Photographer',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
