'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import { FloralHeartDivider } from '@/components/icons';

interface RegistrationSuccessProps {
  redirectTarget?: string;
}

/** Affiché une fois le code validé : la session est déjà ouverte. */
export function RegistrationSuccess({ redirectTarget: propRedirect }: RegistrationSuccessProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = propRedirect || searchParams.get('redirect');
  const redirectTarget =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/compte';
  function handleGoToAccount() {
    router.push(redirectTarget);
  }

  function handleContinueShopping() {
    router.push('/boutique');
  }

  return (
    <div className="auth-card-body auth-success-card-body">
      {/* Big Green Circle Checkmark */}
      <div className="auth-success-circle-wrap">
        <div className="auth-success-green-circle" aria-hidden="true">
          <Check size={38} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <h2 className="auth-success-title">Compte créé avec succès !</h2>

      <p className="auth-success-description">
        Votre adresse email est vérifiée et vous êtes connecté. Profitez dès maintenant de tous
        nos services.
      </p>

      <div className="auth-success-actions">
        {/* Primary button: Se connecter */}
        <button
          type="button"
          onClick={handleGoToAccount}
          className="auth-submit-button"
        >
          <span>{redirectTarget === '/compte' ? 'Accéder à mon compte' : 'Continuer'}</span>
          <ArrowRight size={18} />
        </button>

        {/* Secondary button: Continuer mes achats */}
        <button
          type="button"
          onClick={handleContinueShopping}
          className="auth-outline-button"
        >
          Continuer mes achats
        </button>
      </div>

      {/* Bottom Flourish */}
      <div className="auth-success-bottom-divider">
        <FloralHeartDivider />
      </div>
    </div>
  );
}
