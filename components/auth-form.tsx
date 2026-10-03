'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { LockKeyhole } from 'lucide-react';

type AuthMode = 'connexion' | 'inscription' | 'reset';
const copy = {
  connexion: { title: 'Bon retour', intro: 'Connectez-vous pour retrouver vos commandes et favoris.', submit: 'Se connecter' },
  inscription: { title: 'Créer mon compte', intro: 'Retrouvez vos commandes et facilitez vos prochains achats.', submit: 'Créer mon compte' },
  reset: { title: 'Mot de passe oublié', intro: 'Indiquez votre adresse e-mail pour demander un lien de réinitialisation.', submit: 'Demander un lien' },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [notice, setNotice] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(mode === 'reset' ? 'La demande est prête. La réinitialisation doit être reliée au service de compte.' : 'Le formulaire est prêt. La connexion doit être reliée au service de compte.');
  }
  const view = copy[mode];
  return <section className="auth-card"><div className="auth-icon"><LockKeyhole /></div><h1>{view.title}</h1><p>{view.intro}</p><form onSubmit={submit} className="auth-form">{mode === 'inscription' && <label>Nom complet<input required autoComplete="name" /></label>}<label>Adresse e-mail<input type="email" required autoComplete="email" /></label>{mode !== 'reset' && <label>Mot de passe<input type="password" required minLength={8} autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'} /></label>}{mode === 'inscription' && <label className="auth-terms"><input type="checkbox" required /> J’accepte les conditions de vente et la politique de confidentialité.</label>}<button className="button button-primary" type="submit">{view.submit}</button></form>{notice && <p className="success-note" role="status">{notice}</p>}<div className="auth-links">{mode === 'connexion' ? <><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link><span>Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></span></> : <span>Déjà client ? <Link href="/connexion">Se connecter</Link></span>}</div></section>;
}
