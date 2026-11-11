import type { Metadata, Viewport } from 'next';
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
    default: `${SITE_CONFIG.name} — Fleuriste & Magasin de Décoration à Saly, Dakar & Petite-Côte`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'fleuriste à Saly',
    'fleuriste saly',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
    'fleuriste dakar',
    'livraison fleurs dakar',
    'livraison fleurs saly',
    'decoration mariage senegal',
    'paysagiste saly',
  ],
  applicationName: SITE_CONFIG.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE_CONFIG.name },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
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
    title: `${SITE_CONFIG.name} — Fleuriste & Magasin de Décoration à Saly, Dakar & Petite-Côte`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_URL}/images/og-decofleur.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — Fleuriste d'artisanat et magasin de décoration au Sénégal`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — Fleuriste & Magasin de Décoration`,
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
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getFloristSchema()} />
      </head>
      <body className="min-h-screen">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
