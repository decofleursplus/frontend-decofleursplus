'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Printer, XCircle } from 'lucide-react';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { ApiClientError } from '@/lib/api/client';
import { getSharedQuote, respondToSharedQuote, type SharedQuote } from '@/lib/api/quotes';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildQuoteDocument, quoteIsIssued } from '@/lib/documents/other-documents';
import { ConfirmModal } from '@/components/ui/confirm-modal';

const dateFr = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiClientError ? err.details?.[0]?.message || err.message : err instanceof Error ? err.message : fallback;

/**
 * Devis reçu par email : le client le consulte, l'imprime et l'accepte ou le refuse en ligne,
 * avec ou sans compte (lien personnel).
 */
export default function SharedQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [quote, setQuote] = useState<SharedQuote | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<'ACCEPTED' | 'REFUSED' | null>(null);
  const [pendingDecision, setPendingDecision] = useState<'ACCEPTED' | 'REFUSED' | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSharedQuote(token), getPublicSettings().catch(() => null)])
      .then(([q, s]) => {
        if (cancelled) return;
        setQuote(q);
        setShop(s);
      })
      .catch((err) => !cancelled && setError(errorText(err, 'Ce lien de devis n’est pas valide.')));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const respond = async (decision: 'ACCEPTED' | 'REFUSED') => {
    setBusy(decision);
    setAnswerError(null);
    try {
      setQuote(await respondToSharedQuote(token, decision, comment));
    } catch (err) {
      setAnswerError(errorText(err, 'Votre réponse n’a pas pu être enregistrée.'));
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return (
      <main className="content-width py-16">
        <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-[#f0d6dd] bg-[#fdf6f8] p-8 text-center">
          <h1 className="font-serif text-2xl text-[#173f22]">Devis introuvable</h1>
          <p className="mt-2 text-sm text-[#4a4741]">{error} Contactez-nous si besoin, nous vous le renverrons.</p>
          <Link href="/contact" className="mt-4 inline-block rounded-full bg-[#c8436e] px-5 py-2 text-sm font-semibold text-white">
            Nous contacter
          </Link>
        </div>
      </main>
    );
  }
  if (!quote) {
    return (
      <main className="content-width flex items-center justify-center gap-2 py-24 text-sm text-[#4a4741]">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de votre devis…
      </main>
    );
  }

  return (
    <main className="content-width space-y-5 py-8 sm:py-12">
      <div className="invoice-actions mx-auto flex max-w-[880px] flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#173f22]">Votre devis {quote.quoteNumber}</h1>
          <p className="text-sm text-[#4a4741]">Bonjour {quote.customerName}, voici notre proposition.</p>
        </div>
        {quoteIsIssued(quote) && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c8436e]/40 bg-white px-4 py-2 text-sm font-semibold text-[#a8455c] hover:bg-[#fdf3f5]"
          >
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </button>
        )}
      </div>

      {quote.status === 'SENT' && (
        <section className="invoice-actions mx-auto max-w-[880px] space-y-3 rounded-2xl border border-[#f0d6dd] bg-[#fdf6f8] p-5">
          <h2 className="font-serif text-lg text-[#173f22]">Ce devis vous convient-il ?</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="Un commentaire pour notre équipe (facultatif) : date, couleurs, questions…"
            className="w-full rounded-xl border border-[#ead9dd] bg-white px-3 py-2 text-sm"
          />
          {answerError && <p role="alert" className="text-sm text-red-700">{answerError}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => setPendingDecision('ACCEPTED')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#24582d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c4423] disabled:opacity-60"
            >
              {busy === 'ACCEPTED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              J’accepte ce devis
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => setPendingDecision('REFUSED')}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c4c9] bg-white px-5 py-2.5 text-sm font-semibold text-[#6b4c55] hover:bg-[#fbf3f5] disabled:opacity-60"
            >
              {busy === 'REFUSED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Je refuse
            </button>
          </div>
        </section>
      )}
      {(quote.status === 'ACCEPTED' || quote.status === 'CONVERTED_TO_ORDER') && (
        <p className="invoice-actions mx-auto max-w-[880px] rounded-2xl border border-[#cfe3d2] bg-[#f1f8f2] p-4 text-sm text-[#1f4d28]">
          Merci ! Vous avez accepté ce devis{quote.respondedAt ? ` le ${dateFr(quote.respondedAt)}` : ''}. Notre équipe vous recontacte pour organiser la suite.
        </p>
      )}
      {quote.status === 'REFUSED' && (
        <p className="invoice-actions mx-auto max-w-[880px] rounded-2xl border border-[#ead9dd] bg-white p-4 text-sm text-[#4a4741]">
          Vous avez refusé ce devis{quote.respondedAt ? ` le ${dateFr(quote.respondedAt)}` : ''}. Une autre idée ? Écrivez-nous, nous adapterons la proposition.
        </p>
      )}

      {quoteIsIssued(quote) ? (
        <InvoiceDocument shop={shop?.boutique ?? null} {...buildQuoteDocument(quote, { name: quote.customerName })} />
      ) : (
        <p className="mx-auto max-w-[880px] rounded-2xl border border-[#ead9dd] bg-white p-4 text-sm text-[#4a4741]">
          Votre proposition est en cours de préparation : vous la recevrez par email.
        </p>
      )}

      <ConfirmModal
        isOpen={pendingDecision !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDecision(null);
        }}
        title={pendingDecision === 'ACCEPTED' ? 'Accepter le devis' : 'Refuser le devis'}
        description={
          pendingDecision === 'ACCEPTED'
            ? 'Confirmez-vous l’acceptation de ce devis ? Notre équipe vous recontactera pour la suite.'
            : 'Confirmez-vous le refus de ce devis ?'
        }
        variant={pendingDecision === 'REFUSED' ? 'danger' : 'default'}
        confirmLabel={pendingDecision === 'ACCEPTED' ? 'Accepter' : 'Refuser'}
        onConfirm={async () => {
          if (!pendingDecision) return;
          const d = pendingDecision;
          setPendingDecision(null);
          await respond(d);
        }}
      />
    </main>
  );
}
