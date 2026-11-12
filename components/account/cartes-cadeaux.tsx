'use client';

import Link from 'next/link';
import { Gift, Send } from 'lucide-react';
import { GIFT_CARD_STATUS_LABELS, getMyGiftCards, type MyGiftCard } from '@/lib/api/rewards';
import { CopyButton } from './copy-button';
import { ErrorState, LoadingState, SectionHeader, fcfa, formatDate, useResource } from './shared';

const STATUS_CLASS: Record<MyGiftCard['status'], string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700',
  USED: 'bg-neutral-100 text-neutral-500',
  DISABLED: 'bg-neutral-100 text-neutral-500',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
};

function GiftCardItem({ card }: { card: MyGiftCard }) {
  const received = card.role === 'received';
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-br from-[#173f22] to-[#245e34] p-4 text-white">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/70">
            {received ? `Offerte par ${card.purchaserName}` : `Pour ${card.recipientName}`}
          </span>
          <strong className="block font-serif text-2xl">{fcfa(card.initialAmount)}</strong>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS[card.status]}`}>
          {GIFT_CARD_STATUS_LABELS[card.status]}
        </span>
      </div>
      <div className="space-y-2 p-4 text-sm">
        {card.code ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-base font-bold tracking-widest text-[#173f22]">{card.code}</span>
            {received && card.status === 'ACTIVE' && <CopyButton value={card.code} label="Copier le code" />}
          </div>
        ) : (
          <p className="text-neutral-600">
            Référence <strong className="font-mono">{card.reference}</strong> : notre équipe vous contacte pour le règlement, puis la carte est
            envoyée à {card.recipientEmail}.
          </p>
        )}
        {card.status !== 'PENDING_PAYMENT' && (
          <p className="text-neutral-700">
            Solde : <strong>{fcfa(card.balance)}</strong>
            {card.expiresAt ? <span className="text-neutral-500"> · valable jusqu’au {formatDate(card.expiresAt)}</span> : null}
          </p>
        )}
        {card.message && <p className="italic text-neutral-600">« {card.message} »</p>}
      </div>
    </li>
  );
}

export function CartesCadeauxSection() {
  const { data, error, loading, reload } = useResource(getMyGiftCards);
  const received = data?.filter((c) => c.role === 'received') ?? [];
  const purchased = data?.filter((c) => c.role === 'purchased') ?? [];

  return (
    <section className="account-panel">
      <SectionHeader
        title="Cartes cadeaux"
        description="Les cartes reçues s’utilisent au moment de payer, en une ou plusieurs fois."
        action={
          <Link href="/cartes-cadeaux" className="button button-primary button-small">
            <Gift size={15} /> Offrir une carte
          </Link>
        }
      />
      {loading ? (
        <LoadingState label="Chargement de vos cartes…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <p className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
          Aucune carte cadeau pour le moment. Faites plaisir à un proche :{' '}
          <Link href="/cartes-cadeaux" className="font-semibold text-[var(--pink)] underline">
            offrir une carte cadeau
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-6">
          {received.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2">
                <Gift size={18} className="text-[var(--pink)]" /> Reçues
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {received.map((c) => (
                  <GiftCardItem key={c.id} card={c} />
                ))}
              </ul>
            </div>
          )}
          {purchased.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2">
                <Send size={18} className="text-[var(--pink)]" /> Offertes
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {purchased.map((c) => (
                  <GiftCardItem key={c.id} card={c} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
