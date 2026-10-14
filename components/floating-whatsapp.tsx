'use client';

import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons';

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Hide on back-office / admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage = encodeURIComponent(
    'Bonjour DécoFleur Plus, je souhaite un renseignement ou passer une commande.'
  );

  return (
    <aside aria-label="Assistance WhatsApp">
      <a
        href={`https://wa.me/221779417860?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter DécoFleur Plus sur WhatsApp (+221 77 941 78 60)"
        title="Discuter avec DécoFleur Plus sur WhatsApp"
        className="floating-whatsapp-btn"
      >
        <span className="sr-only">Contacter sur WhatsApp</span>
        <WhatsAppIcon size={28} className="text-white" />
        <span className="floating-whatsapp-ping" aria-hidden="true" />
      </a>
    </aside>
  );
}
