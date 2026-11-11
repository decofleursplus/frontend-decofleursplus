'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Phone,
  MessageCircle,
  LockKeyhole,
  Eye,
  EyeOff,
  MailCheck,
} from 'lucide-react';
import { FloralMotifIcon, FloralHeartDivider, WhatsAppIcon } from '@/components/icons';
import { forgotPassword, resetPassword, PASSWORD_MIN_LENGTH } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { OtpInput, OTP_LENGTH } from './otp-input';
import { useResendCooldown } from './use-resend-cooldown';

type Step = 'request' | 'reset' | 'done';

/**
 * Mot de passe oublié en deux étapes :
 * 1. l'utilisateur indique son email ou son téléphone → un code est envoyé sur l'email du compte ;
 * 2. il saisit ce code et choisit son nouveau mot de passe.
 */
export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { secondsLeft, canResend, restart } = useResendCooldown(0);

  const isEmail = identifier.includes('@');

  async function requestCode() {
    const res = await forgotPassword(identifier);
    setExpiresInMinutes(res.expiresInMinutes || 10);
    restart(res.resendAvailableInSeconds || 60);
  }

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      await requestCode();
      setCode('');
      setStep('reset');
    } catch (err) {
      const fieldError = err instanceof ApiClientError ? err.details?.[0]?.message : undefined;
      setError(fieldError || (err instanceof Error ? err.message : 'Impossible d’envoyer le code pour le moment.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError(null);
    setInfo(null);
    try {
      await requestCode();
      setCode('');
      setInfo('Un nouveau code vient de vous être envoyé.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de renvoyer le code pour le moment.');
    } finally {
      setIsResending(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setInfo(null);

    if (code.length !== OTP_LENGTH) {
      setError('Saisissez le code à 6 chiffres reçu par email.');
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword({ identifier, code, newPassword });
      setStep('done');
    } catch (err) {
      const fieldError = err instanceof ApiClientError ? err.details?.[0]?.message : undefined;
      setError(fieldError || (err instanceof Error ? err.message : 'Code incorrect. Veuillez réessayer.'));
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 'done') {
    return (
      <div className="auth-card-body auth-reset-success-body">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>

        <div className="auth-reset-success-icon" aria-hidden="true">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>

        <h2 className="auth-card-title">Mot de passe modifié !</h2>

        <p className="auth-card-subtitle">
          Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.
        </p>

        <div className="auth-reset-actions">
          <Link href="/connexion" className="auth-submit-button">
            <span>Se connecter</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="auth-reset-bottom-divider">
          <FloralHeartDivider />
        </div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="auth-card-body">
        <div className="auth-card-top">
          <div className="auth-floral-badge" aria-hidden="true">
            <FloralMotifIcon size={42} />
          </div>
          <h2 className="auth-card-title">Choisissez un nouveau mot de passe</h2>
          <p className="auth-card-subtitle">
            {isEmail ? (
              <>
                Si un compte est associé à <strong>{identifier}</strong>, un code à 6 chiffres vient d’y être envoyé.
              </>
            ) : (
              <>
                Si un compte est associé au <strong>{identifier}</strong>, un code à 6 chiffres vient d’être envoyé à
                l’adresse email de ce compte.
              </>
            )}
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

        <form onSubmit={handleReset} className="auth-interactive-form">
          <div className="auth-field-group">
            <label htmlFor="reset-otp-0" className="auth-label">
              Code reçu par email <span className="auth-required-star">*</span>
            </label>
            <OtpInput value={code} onChange={setCode} disabled={isSubmitting} autoFocus idPrefix="reset-otp" />
            <p className="auth-otp-hint">
              <MailCheck size={13} aria-hidden="true" />
              <span>Le code est valable {expiresInMinutes} minutes. Pensez à vérifier vos courriers indésirables.</span>
            </p>
          </div>

          <div className="auth-field-group">
            <label htmlFor="reset-new-password" className="auth-label">
              Nouveau mot de passe <span className="auth-required-star">*</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" aria-hidden="true">
                <LockKeyhole size={16} />
              </span>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                placeholder={`Au moins ${PASSWORD_MIN_LENGTH} caractères`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-field-group">
            <label htmlFor="reset-confirm-password" className="auth-label">
              Confirmer le mot de passe <span className="auth-required-star">*</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" aria-hidden="true">
                <LockKeyhole size={16} />
              </span>
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                placeholder="Saisissez-le à nouveau"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-button">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <>
                <span>Enregistrer le mot de passe</span>
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
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError(null);
                setInfo(null);
              }}
              className="auth-back-link auth-back-button"
            >
              <ArrowLeft size={16} />
              <span>Utiliser une autre adresse ou un autre numéro</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-card-body">
      <div className="auth-card-top">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>
        <h2 className="auth-card-title">Mot de passe oublié ?</h2>
        <p className="auth-card-subtitle">
          Pas de souci ! Entrez votre email ou votre numéro de téléphone : nous envoyons un code de vérification à
          l’adresse email de votre compte.
        </p>
      </div>

      {error && (
        <div className="auth-feedback-banner auth-feedback-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRequest} className="auth-interactive-form">
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
              autoComplete="username"
              placeholder="ex : sally.diop@email.com ou +221 77 123 45 67"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-submit-button">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Envoi du code…</span>
            </>
          ) : (
            <>
              <span>Recevoir le code</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/60 mt-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
            <MessageCircle size={15} className="text-emerald-700" />
            <span>Besoin d’aide ?</span>
          </div>
          <p className="text-[11.5px] text-emerald-800 leading-relaxed">
            Si vous n’avez plus accès à votre adresse email, notre service client peut vous aider 7j/7 :
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
