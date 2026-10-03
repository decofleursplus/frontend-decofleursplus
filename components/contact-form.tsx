'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ width: '52px', height: '52px', margin: '0 auto 14px', display: 'grid', placeItems: 'center', borderRadius: '50%', color: 'var(--forest)', background: 'var(--leaf)' }}>
          <Send size={22} />
        </div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 500, margin: '0 0 8px' }}>Message envoyé !</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Nom complet
        <input type="text" placeholder="Votre nom" required />
      </label>
      <label>
        Email
        <input type="email" placeholder="votre@email.com" required />
      </label>
      <label>
        Sujet
        <select defaultValue="">
          <option value="" disabled>Choisir un sujet</option>
          <option>Question sur un produit</option>
          <option>Livraison</option>
          <option>Commande en cours</option>
          <option>Événement / mariage</option>
          <option>Autre</option>
        </select>
      </label>
      <label>
        Message
        <textarea placeholder="Décrivez votre demande..." rows={5} required />
      </label>
      <button className="button button-primary" type="submit"><Send size={15} /> Envoyer le message</button>
    </form>
  );
}
