'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GoogleIcon } from '@/components/icons';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = { credential?: string };

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

let gsiLoader: Promise<void> | null = null;

/** Charge une seule fois le script Google Identity Services. */
function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Indisponible côté serveur'));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiLoader) {
    gsiLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiLoader = null;
        reject(new Error('Chargement de Google impossible'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiLoader;
}

interface GoogleSignInButtonProps {
  /** Reçoit le jeton d'identité Google à transmettre au backend */
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  /** Libellé du bouton officiel Google */
  text?: 'continue_with' | 'signin_with' | 'signup_with';
}

/**
 * Bouton « Continuer avec Google » (Google Identity Services).
 * Le bouton est rendu par Google lui-même : c'est la seule manière d'obtenir un jeton d'identité.
 */
export function GoogleSignInButton({ onCredential, onError, disabled = false, text = 'continue_with' }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        const googleId = window.google?.accounts?.id;
        const container = containerRef.current;
        if (cancelled || !googleId || !container) return;

        googleId.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'popup',
          callback: (response) => {
            if (response.credential) onCredentialRef.current(response.credential);
            else onErrorRef.current?.('Google n’a pas renvoyé d’identité. Veuillez réessayer.');
          },
        });
        container.innerHTML = '';
        googleId.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          logo_alignment: 'center',
          locale: 'fr',
          width: Math.min(400, Math.max(240, Math.floor(container.offsetWidth))),
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" disabled className="auth-social-btn" style={{ width: '100%' }} title="NEXT_PUBLIC_GOOGLE_CLIENT_ID n’est pas défini">
        <GoogleIcon size={18} />
        <span>Connexion Google non configurée</span>
      </button>
    );
  }

  return (
    <div className="auth-google-wrap" aria-busy={status === 'loading'}>
      <div
        ref={containerRef}
        className="auth-google-button"
        style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
      />
      {status === 'failed' && (
        <p className="auth-google-error" role="alert">
          Google est injoignable pour le moment. Vérifiez votre connexion ou connectez-vous par email.
        </p>
      )}
    </div>
  );
}
