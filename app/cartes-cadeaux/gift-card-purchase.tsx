'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import {
  GIFT_CARD_MAX_AMOUNT,
  GIFT_CARD_MIN_AMOUNT,
  GIFT_CARD_PRESETS,
  purchaseGiftCard,
} from '@/lib/api/rewards';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  'w-full rounded-xl border border-[#e7e4dd] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#c1647a] focus:ring-2 focus:ring-[#c1647a]/15';

type Done = { reference: string; amount: number; recipientName: string; recipientEmail: string; purchaserEmail: string };

export function GiftCardPurchase() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState('');
  // null = non modifié : on reprend les informations du compte connecté
  const [purchaserNameInput, setPurchaserName] = useState<string | null>(null);
  const [purchaserEmailInput, setPurchaserEmail] = useState<string | null>(null);
  const [purchaserPhoneInput, setPurchaserPhone] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const purchaserName = purchaserNameInput ?? user?.name ?? '';
  const purchaserEmail = purchaserEmailInput ?? user?.email ?? '';
  const purchaserPhone = purchaserPhoneInput ?? user?.phone ?? '';
  const finalAmount = customAmount ? Number(customAmount.replace(/\s/g, '')) : amount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(finalAmount) || finalAmount < GIFT_CARD_MIN_AMOUNT || finalAmount > GIFT_CARD_MAX_AMOUNT) {
      return setError(`Choisissez un montant entre ${fcfa(GIFT_CARD_MIN_AMOUNT)} et ${fcfa(GIFT_CARD_MAX_AMOUNT)}.`);
    }
    if (purchaserName.trim().length < 2 || recipientName.trim().length < 2) return setError('Indiquez votre nom et celui du destinataire.');
    if (!EMAIL.test(purchaserEmail.trim()) || !EMAIL.test(recipientEmail.trim())) return setError('Vérifiez les adresses email.');
    setError(null);
    setSending(true);
    purchaseGiftCard({
      amount: finalAmount,
      purchaserName: purchaserName.trim(),
      purchaserEmail: purchaserEmail.trim(),
      purchaserPhone: purchaserPhone.trim() || undefined,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      message: message.trim() || undefined,
    })
      .then((res) =>
        setDone({
          reference: res.reference,
          amount: res.amount,
          recipientName: res.recipientName,
          recipientEmail: res.recipientEmail,
          purchaserEmail: purchaserEmail.trim(),
        }),
      )
      .catch((err) => {
        const detail = err instanceof ApiClientError ? err.details?.[0]?.message : undefined;
        setError(detail || (err instanceof Error ? err.message : 'La demande n’a pas pu être envoyée.'));
      })
      .finally(() => setSending(false));
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[#cfe6d3] bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#24582d]" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-2xl text-[#173f22]">Merci, votre demande est enregistrée</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600">
          Carte de <strong>{fcfa(done.amount)}</strong> pour <strong>{done.recipientName}</strong> — référence{' '}
          <strong className="font-mono">{done.reference}</strong>. Notre équipe vous contacte pour le règlement (Wave, Orange Money ou en
          boutique). Dès réception, la carte est envoyée à {done.recipientEmail} et vous recevez une confirmation à {done.purchaserEmail}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/boutique" className="button-pill-pink inline-flex">
            Continuer mes achats
          </Link>
          {user && (
            <Link href="/compte/cartes-cadeaux" className="inline-flex items-center rounded-full border border-[#e7e4dd] px-5 py-2.5 text-sm font-semibold text-[#173f22]">
              Mes cartes cadeaux
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6 rounded-2xl border border-[#ece5da] bg-white p-5 shadow-sm sm:p-7">
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <fieldset>
          <legend className="text-sm font-bold text-[#173f22]">1. Le montant</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GIFT_CARD_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value);
                  setCustomAmount('');
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                  !customAmount && amount === value ? 'border-[#c1647a] bg-[#fdf0f3] text-[#c1647a]' : 'border-[#e7e4dd] text-gray-700 hover:border-[#c1647a]'
                }`}
              >
                {fcfa(value)}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-xs text-gray-600" htmlFor="gc-custom">
            Ou un autre montant ({fcfa(GIFT_CARD_MIN_AMOUNT)} à {fcfa(GIFT_CARD_MAX_AMOUNT)})
          </label>
          <input
            id="gc-custom"
            inputMode="numeric"
            placeholder="ex : 35000"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/[^\d\s]/g, ''))}
            className={`${inputClass} mt-1 max-w-[220px]`}
          />
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-bold text-[#173f22]">2. Le destinataire</legend>
          <div>
            <label htmlFor="gc-recipient-name" className="text-xs font-semibold text-gray-700">Son nom *</label>
            <input id="gc-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="gc-recipient-email" className="text-xs font-semibold text-gray-700">Son email *</label>
            <input id="gc-recipient-email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={inputClass} required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="gc-message" className="text-xs font-semibold text-gray-700">Votre message (facultatif)</label>
            <textarea
              id="gc-message"
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Joyeux anniversaire ! Choisis le bouquet qui te ressemble."
              className={inputClass}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-bold text-[#173f22]">3. Vos coordonnées</legend>
          <div>
            <label htmlFor="gc-name" className="text-xs font-semibold text-gray-700">Votre nom *</label>
            <input id="gc-name" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="gc-email" className="text-xs font-semibold text-gray-700">Votre email *</label>
            <input id="gc-email" type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} className={inputClass} required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="gc-phone" className="text-xs font-semibold text-gray-700">Votre téléphone (pour le règlement)</label>
            <input id="gc-phone" type="tel" value={purchaserPhone} onChange={(e) => setPurchaserPhone(e.target.value)} placeholder="+221 77 123 45 67" className={inputClass} />
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#173f22] to-[#245e34] p-6 text-white shadow-sm">
          <Gift className="h-8 w-8 text-[#f4b7c8]" aria-hidden="true" />
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70">Carte cadeau Décofleur Plus</p>
          <p className="mt-1 font-serif text-3xl">{Number.isFinite(finalAmount) && finalAmount > 0 ? fcfa(finalAmount) : '—'}</p>
          <p className="mt-4 text-sm text-white/85">Pour {recipientName.trim() || 'votre proche'}</p>
          {message.trim() && <p className="mt-2 text-sm italic text-white/80">« {message.trim()} »</p>}
          <p className="mt-4 text-[11px] text-white/60">Valable 12 mois · utilisable en plusieurs fois</p>
        </div>
        <div className="rounded-2xl border border-[#ece5da] bg-[#fcfaf7] p-4 text-xs leading-relaxed text-gray-600">
          <strong className="block text-gray-800">Comment ça marche ?</strong>
          Nous vous contactons pour le règlement (Wave, Orange Money, ou en boutique). Dès le paiement reçu, la carte part par email au
          destinataire, qui la saisit au moment de payer sa commande.
        </div>
        <button
          type="submit"
          disabled={sending}
          className="button-pill-pink inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
        >
          {sending && <Loader2 size={16} className="animate-spin" />}
          Commander la carte cadeau
        </button>
      </aside>
    </form>
  );
}
