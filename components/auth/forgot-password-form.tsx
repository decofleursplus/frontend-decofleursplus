'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Phone, MessageCircle } from 'lucide-react';
import { FloralMotifIcon, FloralHeartDivider, WhatsAppIcon } from '@/components/icons';

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

        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 text-left space-y-1.5 my-3">
          <p className="text-[11.5px] text-emerald-800 leading-relaxed">
            Vous ne recevez rien ? Contactez directement notre support par WhatsApp pour débloquer votre accès :
          </p>
          <a
            href="https://wa.me/221779417860?text=Bonjour%20D%C3%A9cofleur%20Plus%2C%20je%20n'ai%20pas%20re%C3%A7u%20le%20lien%20de%20r%C3%A9initialisation%20pour%20mon%20compte."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors w-full"
          >
            <WhatsAppIcon size={14} />
            <span>Assistance WhatsApp (+221 77 941 78 60)</span>
          </a>
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

        {/* Direct Customer Support Box */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/60 mt-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
            <MessageCircle size={15} className="text-emerald-700" />
            <span>Assistance directe &amp; Réinitialisation immédiate</span>
          </div>
          <p className="text-[11.5px] text-emerald-800 leading-relaxed">
            Pour une réactivation instantanée de votre compte ou en cas de difficulté, notre service client est disponible 7j/7 :
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href="https://wa.me/221779417860?text=Bonjour%20D%C3%A9cofleur%20Plus%2C%20je%20souhaite%20r%C3%A9initialiser%20le%20mot%20de%20passe%20de%20mon%20compte."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors"
            >
              <WhatsAppIcon size={14} />
              <span>Contacter sur WhatsApp</span>
            </a>
            <a
              href="tel:+221779417860"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 transition-colors"
            >
              <Phone size={13} className="text-emerald-700" />
              <span>+221 77 941 78 60</span>
            </a>
          </div>
        </div>

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
