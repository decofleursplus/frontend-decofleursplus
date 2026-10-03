import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Décofleur Plus — Nature en élégance',
  description: 'Fleuriste à Saly — Bouquets, plantes, décoration événementielle, paniers de fruits et cadeaux.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <CartProvider>
          <SiteHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
