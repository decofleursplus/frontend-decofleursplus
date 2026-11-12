import type { Metadata } from 'next';
import { ReferralLanding } from './referral-landing';

export const metadata: Metadata = {
  title: 'Un cadeau vous attend | Décofleur Plus',
  description: 'Un proche vous offre une réduction sur votre première commande chez Décofleur Plus, fleuriste à Saly.',
  robots: { index: false, follow: false },
};

/** Lien de parrainage partagé par un client : /parrain/CODE */
export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <main className="content-width page-main">
      <div className="mx-auto max-w-xl py-10">
        <ReferralLanding code={decodeURIComponent(code).trim().toUpperCase()} />
      </div>
    </main>
  );
}
