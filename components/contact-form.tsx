'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }
  return <form className="contact-form" onSubmit={submit}><div className="checkout-fields"><label>Votre nom<input required autoComplete="name" /></label><label>Adresse e-mail<input type="email" required autoComplete="email" /></label><label className="field-full">Sujet<input required /></label><label className="field-full">Votre message<textarea required rows={5} /></label></div><button className="button button-primary" type="submit">Envoyer mon message</button>{sent && <p className="success-note" role="status">Votre message est prêt. Le formulaire doit être relié à la messagerie de la boutique pour l’envoi.</p>}</form>;
}
