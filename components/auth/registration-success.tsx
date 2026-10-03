'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import { FloralHeartDivider } from '@/components/icons';
import { useAuth, User } from '@/components/auth-provider';

interface RegistrationSuccessProps {
  createdUser: User | null;
}

export function RegistrationSuccess({ createdUser }: RegistrationSuccessProps) {
  const router = useRouter();
  const { loginUser } = useAuth();

  function handleGoToAccount() {
    if (createdUser) {
      loginUser(createdUser);
    }
    router.push('/compte');
  }

  function handleContinueShopping() {
    if (createdUser) {
      loginUser(createdUser);
    }
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
        Votre compte a bien été créé. Vous pouvez maintenant vous connecter et profiter de tous
        nos services.
      </p>

      <div className="auth-success-actions">
        {/* Primary button: Se connecter */}
        <button
          type="button"
          onClick={handleGoToAccount}
          className="auth-submit-button"
        >
          <span>Se connecter</span>
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
