'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { FloralMotifIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import { EmailVerificationStep } from './email-verification-step';
import { GoogleSignInButton } from './google-sign-in-button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const hasValidRedirect = Boolean(rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'));
  const redirectTarget = hasValidRedirect && rawRedirect ? rawRedirect : '/compte';
  const { login, loginWithGoogle } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Compte dont l'email n'a pas encore été confirmé : on bascule sur la saisie du code
  const [pendingVerification, setPendingVerification] = useState<{ email: string; cooldown: number } | null>(null);

  function goToTarget(message: string) {
    setFeedback({ type: 'success', text: message });
    router.push(redirectTarget);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await login(identifier, password, rememberMe);
      goToTarget('Connexion réussie ! Redirection en cours…');
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerification({
          email: String(err.context?.email || identifier.trim()),
          cooldown: Number(err.context?.resendAvailableInSeconds) || 60,
        });
      } else {
        setFeedback({
          type: 'error',
          text: err instanceof Error ? err.message : 'Identifiant ou mot de passe incorrect.',
        });
      }
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setSocialLoading(true);
    setFeedback(null);
    try {
      await loginWithGoogle(credential);
      goToTarget('Connecté avec Google ! Redirection…');
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'La connexion avec Google a échoué.',
      });
      setSocialLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <EmailVerificationStep
        email={pendingVerification.email}
        initialCooldown={pendingVerification.cooldown}
        onVerified={() => router.push(redirectTarget)}
        onBack={() => setPendingVerification(null)}
        backLabel="Retour à la connexion"
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
        <h2 className="auth-card-title">Connexion</h2>
        <p className="auth-card-subtitle">Accédez à votre compte Décofleur Plus</p>
      </div>

      {feedback && (
        <div
          className={`auth-feedback-banner${feedback.type === 'error' ? ' auth-feedback-error' : ''}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="auth-interactive-form">
        {/* Email or Phone field */}
        <div className="auth-field-group">
          <label htmlFor="auth-identifier" className="auth-label">
            Email ou numéro de téléphone <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <Mail size={16} />
            </span>
            <input
              id="auth-identifier"
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

        {/* Password field */}
        <div className="auth-field-group">
          <label htmlFor="auth-password" className="auth-label">
            Mot de passe <span className="auth-required-star">*</span>
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <LockKeyhole size={16} />
            </span>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Votre mot de passe"
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

        {/* Remember me & Forgot Password Row */}
        <div className="auth-options-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="auth-checkbox"
            />
            <span className="auth-checkbox-text">Se souvenir de moi</span>
          </label>

          <Link href="/mot-de-passe-oublie" className="auth-forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting || !!socialLoading}
          className="auth-submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Connexion en cours…</span>
            </>
          ) : (
            <>
              <span>Se connecter</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Social divider */}
        <div className="auth-or-divider">
          <span className="auth-or-line" />
          <span className="auth-or-text">ou continuer avec</span>
          <span className="auth-or-line" />
        </div>

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={(text) => setFeedback({ type: 'error', text })}
          disabled={isSubmitting || socialLoading}
        />

        {/* Card Footer Link */}
        <div className="auth-card-footer">
          <span>Vous n’avez pas encore de compte ? </span>
          <Link
            href={
              hasValidRedirect && rawRedirect
                ? `/inscription?redirect=${encodeURIComponent(rawRedirect)}`
                : '/inscription'
            }
            className="auth-accent-link"
          >
            Créer un compte
          </Link>
        </div>
      </form>
    </div>
  );
}
