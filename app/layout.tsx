import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { RootShell } from '@/components/root-shell';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SITE_CONFIG, SITE_URL } from '@/lib/seo/config';
import { getFloristSchema, getOrganizationSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_CONFIG.name} | Fleuriste & Magasin de Décoration à Saly, Dakar & Petite-Côte`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'Decofleurs Plus',
    'fleuriste à Saly',
    'fleuriste saly',
    'fleuriste dakar',
    'decoration',
    'decoration mariage senegal',
    'decoration mariage saly',
    'decoration florale dakar',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
    'wedding planner',
    'wedding planner senegal',
    'wedding planner dakar',
    'wedding planner saly',
    'bouquets',
    'bouquet de fleurs',
    'bouquet de roses',
    'roses fraîches',
    'arche florale mariage',
    'location materiel evenementiel',
    'livraison fleurs dakar',
    'livraison fleurs saly',
    'paysagiste saly',
  ],
  applicationName: SITE_CONFIG.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE_CONFIG.name },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  alternates: {
    canonical: SITE_URL,
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
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | Fleuriste & Magasin de Décoration à Saly, Dakar & Petite-Côte`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_URL}/images/og-decofleur.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} · Fleuriste d'artisanat et magasin de décoration au Sénégal`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | Fleuriste & Magasin de Décoration`,
    description: SITE_CONFIG.description,
    images: [`${SITE_URL}/images/og-decofleur.jpg`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#193e23',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)} data-scroll-behavior="smooth">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-PNZS4HBX"
          strategy="afterInteractive"
        />
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getFloristSchema()} />
      </head>
      <body className="min-h-screen">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PNZS4HBX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
