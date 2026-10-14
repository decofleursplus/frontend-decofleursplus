'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/auth-provider';
import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';
import { PwaRegistration } from '@/components/pwa-registration';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    /* Admin pages have their own layout — skip public shell entirely */
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <SiteHeader />
        <PwaRegistration />
        {children}
        <FloatingWhatsApp />
      </CartProvider>
    </AuthProvider>
  );
}
