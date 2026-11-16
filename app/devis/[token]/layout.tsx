import type { Metadata } from 'next';

/** Lien personnel d'un devis : jamais indexé par les moteurs de recherche. */
export const metadata: Metadata = {
  title: 'Votre devis | Décofleur Plus',
  robots: { index: false, follow: false },
};

export default function SharedQuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
