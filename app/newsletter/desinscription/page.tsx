import type { Metadata } from 'next';
import { UnsubscribeForm } from './unsubscribe-form';

export const metadata: Metadata = {
  title: 'Désinscription | Décofleur Plus',
  description: 'Ne plus recevoir la newsletter et les offres Décofleur Plus par email.',
  robots: { index: false, follow: false },
};

/** Lien « Se désinscrire » des emails de newsletter et de campagne (?email=…). */
export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).email;
  const email = typeof raw === 'string' ? raw.trim() : '';
  return (
    <main className="content-width page-main">
      <div className="mx-auto max-w-lg py-10">
        <UnsubscribeForm initialEmail={email} />
      </div>
    </main>
  );
}
