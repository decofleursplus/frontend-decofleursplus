import Image from 'next/image';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/products';
import type { PublicShopSettings } from '@/lib/api/settings';

/**
 * Modèle commun des documents commerciaux de la boutique (facture, devis, bon de réservation, reçu…) :
 * logo, coordonnées, parties, lignes chiffrées, totaux et pied de page. Prévu pour l'écran et l'impression A4
 * (bouton « Imprimer / enregistrer en PDF » du navigateur).
 */

export type DocumentTone = 'paid' | 'pending' | 'cancelled' | 'info';

export interface DocumentLine {
  label: string;
  /** Précisions sous la désignation (variante, options, période…) */
  details?: string[];
  reference?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DocumentTotal {
  label: string;
  amount: number;
  /** discount : affiché en négatif ; grand : montant final mis en avant */
  variant?: 'normal' | 'discount' | 'grand';
  /** Texte à la place du montant (ex. « Offerte ») */
  display?: string;
}

export interface DocumentParty {
  title: string;
  lines: (string | null | undefined | false)[];
}

export interface InvoiceDocumentProps {
  /** Type de document : Facture, Devis, Bon de réservation, Reçu… */
  title: string;
  number: string;
  dates: [string, string][];
  status?: { label: string; tone: DocumentTone };
  shop: PublicShopSettings['boutique'] | null;
  parties: DocumentParty[];
  /** Intitulé de la colonne quantité (ex. « Qté », « Jours × qté ») */
  quantityLabel?: string;
  lines: DocumentLine[];
  totals: DocumentTotal[];
  /** Encadré sous le tableau : règlement, conditions, message… */
  notes?: ReactNode;
  /** Message de remerciement en pied de page */
  thanks?: string;
}

const TONES: Record<DocumentTone, string> = {
  paid: 'bg-[#edf7ef] text-[#24582d] border-[#cfe6d3]',
  pending: 'bg-[#fff8ec] text-[#8a5a12] border-[#f6dfb4]',
  cancelled: 'bg-[#fdf1f1] text-[#9b2c2c] border-[#f3cccc]',
  info: 'bg-[#f3f2ef] text-[#4a4a44] border-[#e5e2dc]',
};

export const formatDocumentDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export function InvoiceDocument({
  title,
  number,
  dates,
  status,
  shop,
  parties,
  quantityLabel = 'Qté',
  lines,
  totals,
  notes,
  thanks = 'Merci pour votre confiance. Toute l’équipe Décofleur Plus vous souhaite de beaux moments fleuris.',
}: InvoiceDocumentProps) {
  const shopName = shop?.shopName || 'Décofleur Plus';
  const phones = [shop?.phoneSaly, shop?.phoneDakar].filter(Boolean).join(' · ');

  return (
    <article
      className="invoice-sheet invoice-document mx-auto w-full max-w-[880px] overflow-hidden rounded-2xl border border-[#ece5da] bg-white text-[#2d2a26] shadow-sm"
      aria-label={`${title} ${number}`}
    >
      <div className="flex h-2" aria-hidden="true">
        <div className="flex-1 bg-[#24582d]" />
        <div className="flex-1 bg-[#c1647a]" />
      </div>

      <div className="px-5 py-7 sm:px-10 sm:py-9">
        {/* En-tête : marque à gauche, document à droite */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Image
              src="/images/logo-exact-v2.png"
              alt={shopName}
              width={1196}
              height={360}
              priority
              className="h-14 w-auto sm:h-16"
            />
            <div className="text-[12px] leading-relaxed text-[#6b665f]">
              {shop?.address && <p>{shop.address}</p>}
              {phones && <p>{phones}</p>}
              {shop?.contactEmail && <p>{shop.contactEmail}</p>}
              <p>www.decofleursplus.com</p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c1647a]">{title}</p>
            <p className="mt-1 font-serif text-2xl leading-tight text-[#173f22] sm:text-[30px]">N° {number}</p>
            <dl className="mt-3 space-y-0.5 text-[12px] text-[#6b665f]">
              {dates.map(([label, value]) => (
                <div key={label} className="flex gap-1.5 sm:justify-end">
                  <dt>{label} :</dt>
                  <dd className="font-medium text-[#2d2a26]">{value}</dd>
                </div>
              ))}
            </dl>
            {status && (
              <span
                className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${TONES[status.tone]}`}
              >
                {status.label}
              </span>
            )}
          </div>
        </header>

        {/* Parties : client, livraison / destinataire… */}
        {parties.length > 0 && (
          <section className={`mt-8 grid gap-4 ${parties.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {parties.map((party) => (
              <div key={party.title} className="rounded-xl border border-[#ece5da] bg-[#faf7f2] px-4 py-3.5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#24582d]">{party.title}</p>
                <div className="space-y-0.5 text-[13px]">
                  {party.lines.filter(Boolean).map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-semibold text-[#173f22]' : 'text-[#4a4741]'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Lignes */}
        <section className="mt-8 overflow-x-auto rounded-xl border border-[#ece5da]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#173f22] text-left text-[11px] uppercase tracking-[0.12em] text-white">
                <th className="px-4 py-3 font-semibold">Désignation</th>
                <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">{quantityLabel}</th>
                <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">Prix unitaire</th>
                <th className="px-4 py-3 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={`${line.label}-${i}`} className={`align-top ${i % 2 === 1 ? 'bg-[#fcfaf7]' : 'bg-white'} border-t border-[#f0ebe3]`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#2d2a26]">{line.label}</p>
                    {line.details?.filter(Boolean).map((d) => (
                      <p key={d} className="text-[11.5px] text-[#7a746c]">
                        {d}
                      </p>
                    ))}
                    {line.reference && <p className="text-[11px] text-[#a39d94]">Réf. {line.reference}</p>}
                    <p className="mt-1 text-[12px] text-[#4a4741] sm:hidden">
                      {line.quantity} × {formatPrice(line.unitPrice)}
                    </p>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3 text-right sm:table-cell">{line.quantity}</td>
                  <td className="hidden whitespace-nowrap px-3 py-3 text-right sm:table-cell">{formatPrice(line.unitPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPrice(line.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Notes et totaux */}
        <section className="mt-6 grid gap-6 sm:grid-cols-[1fr_300px] sm:items-start">
          <div className="text-[12.5px] leading-relaxed text-[#4a4741]">{notes}</div>
          <div className="space-y-1.5 text-[13px]">
            {totals.map((t) =>
              t.variant === 'grand' ? (
                <div
                  key={t.label}
                  className="invoice-grand-total mt-2 flex items-center justify-between gap-3 rounded-xl bg-[#173f22] px-4 py-3 text-white"
                >
                  <span className="min-w-0 text-[12px] font-semibold uppercase leading-tight tracking-[0.12em]">{t.label}</span>
                  <span className="shrink-0 whitespace-nowrap font-serif text-xl">{t.display ?? formatPrice(t.amount)}</span>
                </div>
              ) : (
                <div key={t.label} className="flex justify-between gap-3 px-1">
                  <span className="min-w-0 text-[#6b665f]">{t.label}</span>
                  <span className={`shrink-0 whitespace-nowrap ${t.variant === 'discount' ? 'font-medium text-[#24582d]' : 'font-medium'}`}>
                    {t.display ?? `${t.variant === 'discount' ? '− ' : ''}${formatPrice(t.amount)}`}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Pied de page */}
        <div className="invoice-footer mt-10 border-t border-[#ece5da] pt-5 text-center">
          <p className="font-serif text-[15px] italic text-[#173f22]">{thanks}</p>
          <p className="mt-2 text-[11px] text-[#8a837c]">
            {[shopName, shop?.address, phones, shop?.contactEmail].filter(Boolean).join(' · ')}
          </p>
          {(shop?.ninea || shop?.rccm) && (
            <p className="mt-0.5 text-[11px] text-[#8a837c]">
              {[shop?.ninea && `NINEA ${shop.ninea}`, shop?.rccm && `RCCM ${shop.rccm}`].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
