import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';
import { PwaRegistration } from '@/components/pwa-registration';

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
    <html lang="fr">
      <body className="min-h-screen">
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <PwaRegistration />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
