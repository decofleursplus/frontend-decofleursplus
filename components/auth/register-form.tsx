'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User as UserIcon, Mail, Phone, LockKeyhole, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { FloralMotifIcon } from '@/components/icons';
import { useAuth, User } from '@/components/auth-provider';
import { RegistrationSuccess } from './registration-success';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const hasValidRedirect = Boolean(rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'));
  const redirectTarget = hasValidRedirect && rawRedirect ? rawRedirect : '/compte';
  const loginUrl = hasValidRedirect && rawRedirect
    ? `/connexion?redirect=${encodeURIComponent(rawRedirect)}`
    : '/connexion';

  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Success state container
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!termsAccepted) {
      setFeedback('Veuillez accepter les CGU et la Politique de confidentialité.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const user = await register({
        name,
        email,
        phone,
        password,
      });

      setCreatedUser(user);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du compte.';
      setFeedback(message);
      setIsSubmitting(false);
    }
  }

  // If successfully registered, show the exact success screen from mockup panel 6
  if (isSuccess) {
    return <RegistrationSuccess createdUser={createdUser} redirectTarget={redirectTarget} />;
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
        <div className="auth-feedback-banner auth-feedback-error" role="status">
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
              minLength={6}
              autoComplete="new-password"
              placeholder="Créez un mot de passe"
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
              <Link href="/cgu" className="auth-terms-link" target="_blank">
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
          disabled={isSubmitting}
          className="auth-submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Création en cours…</span>
            </>
          ) : (
            <>
              <span>Créer mon compte</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

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
