'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { sendContactMessage } from '@/lib/api/contact';
import { ApiClientError } from '@/lib/api/client';

const SUBJECTS = ['Question sur un produit', 'Livraison', 'Commande en cours', 'Événement / mariage', 'Autre'];

type Field = 'name' | 'email' | 'phone' | 'subject' | 'message';

/** Formulaire de contact : le message est enregistré et transmis à l'équipe (POST /contact). */
export function ContactForm() {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  function validate(): Partial<Record<Field, string>> {
    const next: Partial<Record<Field, string>> = {};
    if (values.name.trim().length < 2) next.name = 'Indiquez votre nom.';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'Adresse email invalide.';
    if (values.phone.trim() && !/^\+?[0-9\s().-]{7,20}$/.test(values.phone.trim())) next.phone = 'Numéro de téléphone invalide.';
    if (values.message.trim().length < 10) next.message = 'Votre message doit contenir au moins 10 caractères.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        subject: values.subject || undefined,
        message: values.message.trim(),
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiClientError && err.details?.length) {
        const fromApi: Partial<Record<Field, string>> = {};
        for (const d of err.details) fromApi[d.path as Field] = d.message;
        setErrors(fromApi);
      }
      setFormError(err instanceof Error ? err.message : 'Envoi impossible pour le moment. Réessayez dans un instant.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ width: '52px', height: '52px', margin: '0 auto 14px', display: 'grid', placeItems: 'center', borderRadius: '50%', color: 'var(--forest)', background: 'var(--leaf)' }}>
          <Send size={22} />
        </div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 500, margin: '0 0 8px' }}>Message envoyé !</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Merci {values.name.split(' ')[0]}. Notre équipe a bien reçu votre message et vous répondra à {values.email}.
        </p>
      </div>
    );
  }

  const fieldError = (field: Field) =>
    errors[field] ? (
      <span role="alert" className="block mt-1 text-xs font-normal text-red-700">
        {errors[field]}
      </span>
    ) : null;

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {formError}
        </p>
      )}
      <label>
        Nom complet
        <input type="text" autoComplete="name" placeholder="Votre nom" value={values.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />
        {fieldError('name')}
      </label>
      <label>
        Email
        <input type="email" autoComplete="email" placeholder="votre@email.com" value={values.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />
        {fieldError('email')}
      </label>
      <label>
        Téléphone (facultatif)
        <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+221 77 123 45 67" value={values.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
        {fieldError('phone')}
      </label>
      <label>
        Sujet
        <select value={values.subject} onChange={set('subject')}>
          <option value="">Choisir un sujet</option>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Message
        <textarea placeholder="Décrivez votre demande..." rows={5} maxLength={5000} value={values.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} />
        {fieldError('message')}
      </label>
      <button className="button button-primary" type="submit" disabled={sending}>
        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {sending ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  );
}
