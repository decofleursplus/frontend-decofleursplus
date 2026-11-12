'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Sparkles, X } from 'lucide-react';
import { getMyQuotes, respondToQuote, type QuoteItem, type QuoteStatus } from '@/lib/api/quotes';
import { ErrorState, LoadingState, Notice, SectionHeader, errorText, fcfa, formatDate, useResource } from './shared';

const STATUS: Record<QuoteStatus, { label: string; color: string }> = {
  NEW: { label: 'Reçue', color: 'bg-amber-100 text-amber-800' },
  UNDER_REVIEW: { label: 'En cours d’étude', color: 'bg-blue-100 text-blue-800' },
  SENT: { label: 'Proposition à valider', color: 'bg-pink-100 text-pink-800' },
  ACCEPTED: { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-900' },
  REFUSED: { label: 'Refusée', color: 'bg-neutral-100 text-neutral-600' },
  CONVERTED_TO_ORDER: { label: 'Transformée en commande', color: 'bg-purple-100 text-purple-800' },
};

function QuoteCard({ quote, onUpdated }: { quote: QuoteItem; onUpdated: (q: QuoteItem) => void }) {
  const [open, setOpen] = useState(quote.status === 'SENT');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<'ACCEPTED' | 'REFUSED' | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const status = STATUS[quote.status];

  async function respond(decision: 'ACCEPTED' | 'REFUSED') {
    const confirmText =
      decision === 'ACCEPTED'
        ? `Accepter la proposition de ${fcfa(quote.quotedAmount ?? 0)} ? Notre équipe vous recontactera pour la suite.`
        : 'Refuser cette proposition ?';
    if (!window.confirm(confirmText)) return;
    setBusy(decision);
    setMessage(null);
    try {
      const updated = await respondToQuote(quote.id, decision, comment);
      onUpdated(updated);
      setMessage({
        kind: 'success',
        text: decision === 'ACCEPTED' ? 'Merci ! Votre accord a été transmis à notre équipe.' : 'Votre réponse a été transmise.',
      });
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Réponse impossible.') });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-neutral-900">{quote.quoteNumber}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          </div>
          <div className="text-sm text-neutral-600">
            <strong>{quote.eventType}</strong> · {quote.eventLocation}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Demandé le {formatDate(quote.createdAt)}
            {quote.eventDate ? ` · Événement le ${formatDate(quote.eventDate)}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quote.quotedAmount != null && (
            <div className="text-right">
              <span className="text-xs text-neutral-500 block">Montant proposé</span>
              <strong className="text-base text-[#173f22]">{fcfa(quote.quotedAmount)}</strong>
            </div>
          )}
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="mt-4 border-t border-neutral-100 pt-4 space-y-4 text-sm">
          {message && <Notice kind={message.kind}>{message.text}</Notice>}
          <dl className="grid sm:grid-cols-3 gap-3 text-xs">
            <div>
              <dt className="text-neutral-500">Invités</dt>
              <dd className="font-medium">{quote.estimatedGuests ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Budget indiqué</dt>
              <dd className="font-medium">{quote.budgetRange || '—'}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Réponse</dt>
              <dd className="font-medium">{quote.respondedAt ? formatDate(quote.respondedAt) : '—'}</dd>
            </div>
          </dl>
          {quote.details && <p className="text-xs text-neutral-700 whitespace-pre-line">{quote.details}</p>}
          {quote.inspirationImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {quote.inspirationImages.map((src) => (
                <Image key={src} src={src} alt="Inspiration" width={72} height={72} className="rounded-lg object-cover border" />
              ))}
            </div>
          )}

          {quote.items.length > 0 ? (
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="text-left p-2">Désignation</th>
                    <th className="text-right p-2">Qté</th>
                    <th className="text-right p-2">Prix unitaire</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((it, i) => (
                    <tr key={i} className="border-t border-neutral-100">
                      <td className="p-2">{it.description}</td>
                      <td className="p-2 text-right">{it.quantity}</td>
                      <td className="p-2 text-right">{fcfa(it.unitPrice)}</td>
                      <td className="p-2 text-right font-semibold">{fcfa(it.quantity * it.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-200 bg-neutral-50">
                    <td className="p-2 font-semibold" colSpan={3}>
                      Total proposé
                    </td>
                    <td className="p-2 text-right font-bold">{fcfa(quote.quotedAmount ?? 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            quote.status !== 'SENT' &&
            quote.quotedAmount == null && <p className="text-xs text-neutral-500">Notre équipe prépare votre proposition chiffrée.</p>
          )}

          {quote.status === 'SENT' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Un commentaire pour notre équipe (facultatif)
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs font-normal"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="button button-primary button-small" disabled={busy !== null} onClick={() => respond('ACCEPTED')}>
                  <Check size={14} /> {busy === 'ACCEPTED' ? 'Envoi…' : 'Accepter la proposition'}
                </button>
                <button type="button" className="button button-outline button-small" disabled={busy !== null} onClick={() => respond('REFUSED')}>
                  <X size={14} /> {busy === 'REFUSED' ? 'Envoi…' : 'Refuser'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DevisSection() {
  const { data: quotes, setData, error, loading, reload } = useResource(getMyQuotes);

  return (
    <section className="account-panel">
      <SectionHeader
        title="Mes devis"
        description="Suivez vos demandes et répondez aux propositions de notre équipe."
        action={
          <Link href="/devis" className="button button-primary button-small">
            <Plus size={15} /> Nouvelle demande
          </Link>
        }
      />
      {loading ? (
        <LoadingState label="Chargement de vos devis…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (quotes ?? []).length === 0 ? (
        <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100 mt-4">
          <div className="w-12 h-12 bg-pink-50 text-[#c8436e] rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="font-serif font-bold text-base text-neutral-800 mb-1">Aucune demande de devis</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">Mariage, anniversaire, décoration de villa : décrivez votre projet.</p>
          <Link href="/devis" className="button button-primary">
            Demander un devis
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 mt-4">
          {(quotes ?? []).map((q) => (
            <QuoteCard key={q.id} quote={q} onUpdated={(u) => setData((list) => (list ?? []).map((x) => (x.id === u.id ? u : x)))} />
          ))}
        </div>
      )}
    </section>
  );
}
