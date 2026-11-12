'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User as UserIcon, Mail, Phone, LockKeyhole, Eye, EyeOff, ArrowRight, Loader2, Gift } from 'lucide-react';
import { FloralMotifIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import { PASSWORD_MIN_LENGTH } from '@/lib/api/auth';
import type { PendingVerificationData } from '@/lib/api/types';
import { forgetReferralCode, readRememberedReferralCode } from '@/lib/api/rewards';
import { EmailVerificationStep } from './email-verification-step';
import { GoogleSignInButton } from './google-sign-in-button';
import { RegistrationSuccess } from './registration-success';

const noSubscription = () => () => {};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const hasValidRedirect = Boolean(rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'));
  const redirectTarget = hasValidRedirect && rawRedirect ? rawRedirect : '/compte';
  const loginUrl = hasValidRedirect && rawRedirect
    ? `/connexion?redirect=${encodeURIComponent(rawRedirect)}`
    : '/connexion';

  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  // Code de parrainage : lien /parrain/CODE (?parrain=) ou code mémorisé dans le navigateur ; modifiable
  const rememberedCode = useSyncExternalStore(noSubscription, readRememberedReferralCode, () => '');
  const [referralInput, setReferralInput] = useState<string | null>(null);
  const referralCode = referralInput ?? (searchParams.get('parrain') || rememberedCode);

  // Étapes : formulaire → code reçu par email → écran de succès
  const [pending, setPending] = useState<PendingVerificationData | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!termsAccepted) {
      setFeedback('Veuillez accepter les CGU et la Politique de confidentialité.');
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setFeedback(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      setPending(await register({ name, email, phone, password, referralCode }));
    } catch (err: unknown) {
      const fieldError = err instanceof ApiClientError ? err.details?.[0]?.message : undefined;
      setFeedback(
        fieldError || (err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du compte.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setSocialLoading(true);
    setFeedback(null);
    try {
      await loginWithGoogle(credential, referralCode);
      forgetReferralCode();
      router.push(redirectTarget);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'L’inscription avec Google a échoué.');
      setSocialLoading(false);
    }
  }

  if (isSuccess) {
    return <RegistrationSuccess redirectTarget={redirectTarget} />;
  }

  if (pending) {
    return (
      <EmailVerificationStep
        email={pending.email}
        initialCooldown={pending.resendAvailableInSeconds}
        expiresInMinutes={pending.expiresInMinutes}
        onVerified={() => {
          forgetReferralCode();
          setIsSuccess(true);
        }}
        onBack={() => setPending(null)}
      />
    );
  }

  return (
    <div className="auth-card-body">
      {/* Card Header with Floral Motif */}
      <div className="auth-card-top">
        <div className="auth-floral-badge" aria-hidden="true">
          <FloralMotifIcon size={42} />
        </div>
        <h2 className="auth-card-title">Créer un compte</h2>
        <p className="auth-card-subtitle">Rejoignez la communauté Décofleur Plus</p>
      </div>

      {feedback && (
        <div className="auth-feedback-banner auth-feedback-error" role="alert">
          <span>{feedback}</span>
        </div>
      )}

      {/* Interactive Registration Form */}
      <form onSubmit={handleSubmit} className="auth-interactive-form">
        {/* Full Name */}
        <div className="auth-field-group">
          <label htmlFor="reg-name" className="auth-label">
            Nom complet <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <UserIcon size={16} />
            </span>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="auth-field-group">
          <label htmlFor="reg-email" className="auth-label">
            Email <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <Mail size={16} />
            </span>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              placeholder="ex : sally.diop@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="auth-field-group">
          <label htmlFor="reg-phone" className="auth-label">
            Numéro de téléphone <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <Phone size={16} />
            </span>
            <input
              id="reg-phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="ex : +221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field-group">
          <label htmlFor="reg-password" className="auth-label">
            Mot de passe <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <LockKeyhole size={16} />
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              placeholder={`Au moins ${PASSWORD_MIN_LENGTH} caractères`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Referral code (optional) */}
        <div className="auth-field-group">
          <label htmlFor="reg-referral" className="auth-label">
            Code de parrainage <span className="text-[11px] font-normal text-gray-500">(facultatif)</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <Gift size={16} />
            </span>
            <input
              id="reg-referral"
              type="text"
              autoComplete="off"
              placeholder="ex : MARIAMA-7K2P"
              value={referralCode}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              maxLength={20}
              className="auth-input uppercase"
            />
          </div>
          {referralCode && (
            <p className="mt-1 text-[11px] text-[#24582d]">Votre bon de bienvenue sera envoyé par email dès la confirmation de votre compte.</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="auth-terms-row">
          <label className="auth-checkbox-label align-start">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="auth-checkbox"
            />
            <span className="auth-terms-text">
              J’accepte les{' '}
              <Link href="/conditions" className="auth-terms-link" target="_blank">
                Conditions Générales d’Utilisation
              </Link>{' '}
              et la{' '}
              <Link href="/confidentialite" className="auth-terms-link" target="_blank">
                Politique de confidentialité
              </Link>
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || socialLoading}
          className="auth-submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Envoi du code…</span>
            </>
          ) : (
            <>
              <span>Créer mon compte</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-or-divider">
          <span className="auth-or-line" />
          <span className="auth-or-text">ou</span>
          <span className="auth-or-line" />
        </div>

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={setFeedback}
          disabled={isSubmitting || socialLoading}
          text="signup_with"
        />

        {/* Card Footer Link */}
        <div className="auth-card-footer">
          <span>Vous avez déjà un compte ? </span>
          <Link href={loginUrl} className="auth-accent-link">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}
