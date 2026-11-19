'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

/**
 * Accès ouvert par l'équipe DécoFleur Plus : tant que le client n'a pas remplacé le mot de passe
 * temporaire reçu par e-mail, chaque page de l'espace client l'invite à choisir le sien.
 */
export function TemporaryPasswordBanner() {
  const { user } = useAuth();
  if (!user?.mustChangePassword) return null;
  return (
    <div role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Votre mot de passe est temporaire.</strong> Choisissez-en un nouveau, connu de vous seul : saisissez
      comme mot de passe actuel celui reçu par e-mail.{' '}
      <Link href="/compte/informations#mot-de-passe" className="font-semibold underline">
        Choisir mon mot de passe
      </Link>
    </div>
  );
}
