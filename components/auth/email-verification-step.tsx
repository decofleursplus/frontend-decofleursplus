'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from 'lucide-react';
import { FloralMotifIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { resendVerificationCode } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { OtpInput, OTP_LENGTH } from './otp-input';
import { useResendCooldown } from './use-resend-cooldown';

interface EmailVerificationStepProps {
  email: string;
  /** Secondes à attendre avant de pouvoir redemander un code */
  initialCooldown?: number;
  expiresInMinutes?: number;
  /** Appelé une fois le compte activé et la session ouverte */
  onVerified: () => void;
  /** Revenir au formulaire précédent (corriger l'adresse, etc.) */
  onBack: () => void;
  backLabel?: string;
}

/** Étape de saisie du code envoyé par email pour activer le compte. */
export function EmailVerificationStep({
  email,
  initialCooldown = 60,
  expiresInMinutes = 10,
  onVerified,
  onBack,
  backLabel = 'Modifier mes informations',
}: EmailVerificationStepProps) {
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { secondsLeft, canResend, restart } = useResendCooldown(initialCooldown);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== OTP_LENGTH || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      await verifyEmail(email, code);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code incorrect. Veuillez réessayer.');
      setCode('');
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await resendVerificationCode(email);
      restart(res.resendAvailableInSeconds || 60);
      setCode('');
      setInfo('Un nouveau code vient de vous être envoyé.');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'TOO_MANY_REQUESTS') {
        restart(Number(err.context?.retryAfterSeconds) || 60);
      }
      setError(err instanceof Error ? err.message : 'Impossible de renvoyer le code pour le moment.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="auth-card-body">
      <div className="auth-card-top">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>
        <h2 className="auth-card-title">Vérifiez votre adresse email</h2>
        <p className="auth-card-subtitle">
          Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>. Saisissez-le pour activer votre compte.
        </p>
      </div>

      {error && (
        <div className="auth-feedback-banner auth-feedback-error" role="alert">
          <span>{error}</span>
        </div>
      )}
      {info && !error && (
        <div className="auth-feedback-banner" role="status">
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-interactive-form">
        <div className="auth-field-group">
          <label htmlFor="verify-otp-0" className="auth-label">
            Code de vérification <span className="auth-required-star">*</span>
          </label>
          <OtpInput value={code} onChange={setCode} disabled={isSubmitting} autoFocus idPrefix="verify-otp" />
          <p className="auth-otp-hint">
            <MailCheck size={13} aria-hidden="true" />
            <span>Le code est valable {expiresInMinutes} minutes. Pensez à vérifier vos courriers indésirables.</span>
          </p>
        </div>

        <button type="submit" disabled={isSubmitting || code.length !== OTP_LENGTH} className="auth-submit-button">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Vérification…</span>
            </>
          ) : (
            <>
              <span>Activer mon compte</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-otp-resend">
          <span>Vous n’avez rien reçu ?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isResending}
            className="auth-otp-resend-button"
          >
            {isResending ? 'Envoi…' : canResend ? 'Renvoyer le code' : `Renvoyer le code (${secondsLeft}s)`}
          </button>
        </div>

        <div className="auth-card-footer text-center">
          <button type="button" onClick={onBack} className="auth-back-link auth-back-button">
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
