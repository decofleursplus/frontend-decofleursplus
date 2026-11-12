'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Loader2, MailCheck } from 'lucide-react';
import { FloralMotifIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { requestLoginCode } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { OtpInput, OTP_LENGTH } from './otp-input';
import { useResendCooldown } from './use-resend-cooldown';

interface LoginCodeStepProps {
  identifier: string;
  remember: boolean;
  /** Secondes avant de pouvoir redemander un code */
  initialCooldown: number;
  /** Durée de validité du code envoyé */
  expiresInMinutes: number;
  onSignedIn: () => void;
  onBack: () => void;
}

const formatClock = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** Compte à rebours de validité du code (repart à chaque nouvel envoi). */
function useValidityCountdown(minutes: number) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);
  return { secondsLeft, expired: secondsLeft <= 0, restart: (m: number) => setSecondsLeft(Math.max(0, m * 60)) };
}

/** Connexion sans mot de passe : saisie du code à 6 chiffres reçu par email. */
export function LoginCodeStep({ identifier, remember, initialCooldown, expiresInMinutes, onSignedIn, onBack }: LoginCodeStepProps) {
  const { loginWithCode } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const cooldown = useResendCooldown(initialCooldown);
  const validity = useValidityCountdown(expiresInMinutes);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== OTP_LENGTH || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      await loginWithCode(identifier, code, remember);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code incorrect. Veuillez réessayer.');
      setCode('');
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!cooldown.canResend || isResending) return;
    setIsResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await requestLoginCode(identifier);
      cooldown.restart(res.resendAvailableInSeconds || 60);
      validity.restart(res.expiresInMinutes || expiresInMinutes);
      setCode('');
      setInfo('Un nouveau code vient d’être envoyé. Seul le dernier code reçu est valable.');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'TOO_MANY_REQUESTS') {
        cooldown.restart(Number(err.context?.retryAfterSeconds) || 60);
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
        <h2 className="auth-card-title">Entrez votre code</h2>
        <p className="auth-card-subtitle">
          Si un compte correspond à <strong>{identifier}</strong>, un code à 6 chiffres vient d’être envoyé à son adresse email.
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
          <label htmlFor="login-otp-0" className="auth-label">
            Code de connexion <span className="auth-required-star">*</span>
          </label>
          <OtpInput value={code} onChange={setCode} disabled={isSubmitting || validity.expired} autoFocus idPrefix="login-otp" />
          <p className="auth-otp-hint" aria-live="polite">
            {validity.expired ? (
              <>
                <Clock size={13} aria-hidden="true" />
                <span>Ce code a expiré : demandez-en un nouveau.</span>
              </>
            ) : (
              <>
                <MailCheck size={13} aria-hidden="true" />
                <span>
                  Code valable encore <strong data-testid="login-code-validity">{formatClock(validity.secondsLeft)}</strong>. Pensez à vérifier vos
                  courriers indésirables.
                </span>
              </>
            )}
          </p>
        </div>

        <button type="submit" disabled={isSubmitting || code.length !== OTP_LENGTH || validity.expired} className="auth-submit-button">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Connexion…</span>
            </>
          ) : (
            <>
              <span>Me connecter</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-otp-resend">
          <span>Vous n’avez rien reçu ?</span>
          <button type="button" onClick={handleResend} disabled={!cooldown.canResend || isResending} className="auth-otp-resend-button">
            {isResending ? 'Envoi…' : cooldown.canResend ? 'Renvoyer le code' : `Renvoyer le code (${cooldown.secondsLeft}s)`}
          </button>
        </div>

        <div className="auth-card-footer text-center">
          <button type="button" onClick={onBack} className="auth-back-link auth-back-button">
            <ArrowLeft size={16} />
            <span>Changer d’identifiant ou utiliser mon mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  );
}
