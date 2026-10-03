'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { LockKeyhole, Phone, Mail, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { GoogleIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';

type AuthMode = 'connexion' | 'inscription' | 'reset';

const copy = {
  connexion: {
    title: 'Bon retour parmi nous',
    intro: 'Connectez-vous pour retrouver vos commandes et vos points fidélité.',
    submit: 'Se connecter à mon compte',
  },
  inscription: {
    title: 'Créer mon compte',
    intro: 'Rejoignez Décofleur Plus pour cumuler vos points et suivre vos commandes.',
    submit: 'Créer mon compte client',
  },
  reset: {
    title: 'Mot de passe oublié',
    intro: 'Renseignez votre e-mail pour recevoir le lien de réinitialisation sécurisé.',
    submit: 'Envoyer le lien de réinitialisation',
  },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, loginWithGoogle, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  async function handleGoogleAuth() {
    setIsSubmitting(true);
    setNotice('Connexion avec Google réussie. Redirection en cours...');
    await loginWithGoogle();
    setTimeout(() => {
      router.push('/compte');
    }, 600);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (mode === 'connexion') {
      await login(email, password);
      setNotice('Connexion réussie ! Redirection vers votre compte...');
      setTimeout(() => {
        router.push('/compte');
      }, 600);
    } else if (mode === 'inscription') {
      await register({ name, email, phone, password });
      setNotice('Votre compte a été créé avec succès ! Bienvenue chez Décofleur Plus.');
      setTimeout(() => {
        router.push('/compte');
      }, 700);
    } else {
      setNotice('Un e-mail de réinitialisation a été envoyé si l’adresse existe.');
      setIsSubmitting(false);
    }
  }

  const view = copy[mode];

  return (
    <div className="auth-screen-layout">
      {/* Top Navigation: Back Button */}
      <button
        type="button"
        className="auth-top-back-btn"
        onClick={handleBack}
        aria-label="Retour à la page précédente"
      >
        <ArrowLeft size={16} />
        <span>Retour</span>
      </button>

      {/* Centered Brand Logo */}
      <div className="auth-top-brand">
        <Link href="/" aria-label="Accueil Décofleur Plus">
          <Image
            src="/logo_decofleur.jpeg"
            alt="Décofleur Plus"
            width={160}
            height={46}
            priority
            className="auth-brand-image"
          />
        </Link>
      </div>

      <section className={`auth-card ${mode === 'inscription' ? 'auth-card-wide' : ''}`}>
        <div className="auth-card-header">
          <div className="auth-icon-badge">
            <LockKeyhole size={20} />
          </div>
          <h1>{view.title}</h1>
          <p className="auth-subtitle">{view.intro}</p>
        </div>

        {/* Social Google Sign-in Button */}
        {mode !== 'reset' && (
          <div className="auth-social-section">
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
            >
              <GoogleIcon size={18} />
              <span>
                {mode === 'connexion' ? 'Continuer avec Google' : "S'inscrire avec Google"}
              </span>
            </button>

            <div className="auth-divider">
              <span>ou avec votre e-mail</span>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === 'inscription' ? (
            <>
              {/* 2-Column Grid for Registration fields to fit cleanly on viewport height */}
              <div className="auth-form-row-2">
                <label>
                  <span className="auth-label-row">
                    <User size={13} /> Nom complet
                  </span>
                  <input
                    required
                    autoComplete="name"
                    placeholder="ex. Fatou Ba"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label>
                  <span className="auth-label-row">
                    <Phone size={13} /> Téléphone
                  </span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+221 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
              </div>

              <div className="auth-form-row-2">
                <label>
                  <span className="auth-label-row">
                    <Mail size={13} /> Adresse e-mail
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="ex. fatou.ba@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label>
                  <span className="auth-label-row">
                    <LockKeyhole size={13} /> Mot de passe
                  </span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </div>

              <label className="auth-terms">
                <input type="checkbox" required />
                <span>
                  J’accepte les <strong>CGV</strong> et la <strong>Politique de confidentialité</strong>.
                </span>
              </label>
            </>
          ) : (
            <>
              <label>
                <span className="auth-label-row">
                  <Mail size={13} /> Adresse e-mail
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="ex. fatou.ba@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {mode !== 'reset' && (
                <label>
                  <span className="auth-label-row">
                    <LockKeyhole size={13} /> Mot de passe
                  </span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              )}
            </>
          )}

          <button className="button button-primary auth-submit-btn" type="submit" disabled={isSubmitting}>
            <ShieldCheck size={16} />
            {view.submit}
          </button>
        </form>

        {notice && (
          <div className="auth-success-banner" role="status">
            {notice}
          </div>
        )}

        <div className={`auth-links ${mode === 'connexion' ? '' : 'auth-links-centered'}`}>
          {mode === 'connexion' ? (
            <>
              <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              <span>
                Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
              </span>
            </>
          ) : mode === 'inscription' ? (
            <span>
              Déjà client chez nous ? <Link href="/connexion">Se connecter</Link>
            </span>
          ) : (
            <Link href="/connexion">Retour à la connexion</Link>
          )}
        </div>
      </section>
    </div>
  );
}
