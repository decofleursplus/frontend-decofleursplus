'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/lib/api/contact';
import { ApiClientError } from '@/lib/api/client';

export function UnsubscribeForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Indiquez une adresse email valide.');
      return;
    }
    setError(null);
    setStatus('loading');
    try {
      await unsubscribeFromNewsletter(email.trim());
      setStatus('done');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'La désinscription a échoué. Réessayez dans un instant.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-[#cfe6d3] bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#24582d]" aria-hidden="true" />
        <h1 className="mt-4 font-serif text-2xl text-[#173f22]">C’est fait</h1>
        <p className="mt-2 text-sm text-gray-600">
          <strong>{email.trim()}</strong> ne recevra plus notre newsletter ni nos offres par email. Les emails liés à vos commandes
          (confirmation, livraison) continuent de vous parvenir.
        </p>
        <Link href="/boutique" className="button-pill-pink mt-6 inline-flex">
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#ece5da] bg-white p-8 shadow-sm" noValidate>
      <MailX className="h-10 w-10 text-[#c1647a]" aria-hidden="true" />
      <h1 className="mt-4 font-serif text-2xl text-[#173f22]">Se désinscrire</h1>
      <p className="mt-2 text-sm text-gray-600">
        Vous ne recevrez plus la newsletter ni les offres promotionnelles de Décofleur Plus. Vous pourrez vous réinscrire à tout moment.
      </p>
      <label htmlFor="unsubscribe-email" className="mt-6 block text-sm font-semibold text-gray-800">
        Adresse email
      </label>
      <input
        id="unsubscribe-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-[#e7e4dd] px-3 text-sm outline-none focus:border-[#24582d] focus:ring-2 focus:ring-[#24582d]/20"
        autoComplete="email"
        required
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173f22] text-sm font-semibold text-white hover:bg-[#12301a] disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmer la désinscription
      </button>
    </form>
  );
}
