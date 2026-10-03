'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { FloralMotifIcon, FloralHeartDivider } from '@/components/icons';

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    // Simulate link dispatch
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  // In-card confirmation state as requested during the grill-me interview
  if (isSubmitted) {
    return (
      <div className="auth-card-body auth-reset-success-body">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>

        <div className="auth-reset-success-icon" aria-hidden="true">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>

        <h2 className="auth-card-title">Lien envoyé avec succès !</h2>

        <p className="auth-card-subtitle">
          Si un compte est associé à <strong>{identifier}</strong>, vous recevrez un lien pour réinitialiser
          votre mot de passe dans les prochaines minutes.
        </p>

        <div className="auth-reset-actions">
          <Link href="/connexion" className="auth-submit-button">
            <span>Retour à la connexion</span>
            <ArrowRight size={18} />
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setIdentifier('');
            }}
            className="auth-link-secondary"
          >
            Renvoyer vers une autre adresse ou numéro
          </button>
        </div>

        <div className="auth-reset-bottom-divider">
          <FloralHeartDivider />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-body">
      {/* Header with Floral Motif */}
      <div className="auth-card-top">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>
        <h2 className="auth-card-title">Mot de passe oublié ?</h2>
        <p className="auth-card-subtitle">
          Pas de souci ! Entrez votre email ou numéro de téléphone et nous vous enverrons un lien
          pour réinitialiser votre mot de passe.
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="auth-interactive-form">
        <div className="auth-field-group">
          <label htmlFor="reset-identifier" className="auth-label">
            Email ou numéro de téléphone <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <Mail size={16} />
            </span>
            <input
              id="reset-identifier"
              type="text"
              required
              placeholder="ex : sally.diop@email.com ou +221 77 123 45 67"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Envoi du lien…</span>
            </>
          ) : (
            <>
              <span>Envoyer le lien</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Return to login link */}
        <div className="auth-card-footer text-center">
          <Link href="/connexion" className="auth-back-link">
            <ArrowLeft size={16} />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
