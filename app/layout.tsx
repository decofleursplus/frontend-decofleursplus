import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RootShell } from '@/components/root-shell';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Décofleur Plus — Nature en élégance',
  description: 'Fleuriste à Saly — Bouquets, plantes, décoration événementielle, paniers de fruits et cadeaux.',
  applicationName: 'Décofleur Plus',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Décofleur Plus' },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
      <body className="min-h-screen">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}

