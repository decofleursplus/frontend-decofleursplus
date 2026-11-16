'use client';

import Image from 'next/image';
import { Dancing_Script, Playfair_Display } from 'next/font/google';
import { useEffect, type ReactNode } from 'react';
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
  paid: 'bg-[#eef6e2] text-[#3f6b1f] border-[#cfe3ad]',
  pending: 'bg-[#fff6e8] text-[#8a5a12] border-[#f3dcb0]',
  cancelled: 'bg-[#fdeeee] text-[#9b2c2c] border-[#f3cccc]',
  info: 'bg-white/70 text-[#7a4a5c] border-[#efc7d6]',
};

/** Phrase manuscrite d'en-tête, selon le document */
function taglineFor(title: string): [string, string] {
  const t = title.toLowerCase();
  if (t.startsWith('devis')) return ['Des projets', 'qui prennent vie'];
  if (t.startsWith('facture')) return ['Des fleurs', 'qui racontent vos moments'];
  if (t.includes('location')) return ['Un décor', 'pour votre fête'];
  if (t.includes('carte') || t.includes('reçu')) return ['Un cadeau', 'qui fait fleurir'];
  return ['Nature', 'en élégance'];
}

const scriptFont = Dancing_Script({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });
const titleFont = Playfair_Display({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });

// Palette du logo : vert feuille, rose fleur ; rose profond et vert forêt de la marque
const ROSE = '#b23a68';
const LEAF = '#b4d878';
const STEM = '#6f9a3a';

/** Fleur au trait, pétales roses et tige verte (en-tête) */
function FlowerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 170" className={className} aria-hidden="true" fill="none">
      <path d="M78 74 C 70 108, 52 132, 30 160" stroke={STEM} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M58 116 C 34 104, 22 112, 14 124 C 34 132, 48 128, 58 116 Z" fill={LEAF} fillOpacity="0.55" stroke={STEM} strokeWidth="1.6" />
      <path d="M63 108 C 76 92, 98 92, 108 98 C 96 112, 78 116, 63 108 Z" fill="none" stroke={STEM} strokeWidth="1.6" />
      <path d="M70 102 L 100 99" stroke={STEM} strokeWidth="1" strokeLinecap="round" />
      <g stroke={ROSE} strokeWidth="1.6" strokeLinejoin="round">
        <path d="M80 70 C 64 64, 50 46, 56 26 C 70 30, 80 46, 80 70 Z" fill="#f4b6ca" />
        <path d="M80 70 C 82 50, 92 30, 112 26 C 116 46, 100 64, 80 70 Z" fill="#f7c7d6" />
        <path d="M80 70 C 64 70, 42 74, 30 60 C 44 48, 66 52, 80 70 Z" fill="#f9d3df" />
        <path d="M80 70 C 98 56, 120 54, 130 68 C 116 80, 96 78, 80 70 Z" fill="#f4b6ca" />
        <path d="M80 70 C 74 52, 74 30, 84 12 C 96 28, 92 52, 80 70 Z" fill="#fbdce6" />
      </g>
      <circle cx="80" cy="69" r="6" fill={ROSE} />
      <circle cx="80" cy="69" r="2.4" fill="#fbdce6" />
    </svg>
  );
}

/** Branche de feuilles (décor des bords, filigrane du tableau, pied de page) */
function LeafBranch({ className, color = '#e7a3bb', fill = '#f3c6d5' }: { className?: string; color?: string; fill?: string }) {
  const leaves = [
    { y: 26, side: -1 },
    { y: 50, side: 1 },
    { y: 74, side: -1 },
    { y: 98, side: 1 },
    { y: 122, side: -1 },
    { y: 146, side: 1 },
  ];
  return (
    <svg viewBox="0 0 80 190" className={className} aria-hidden="true" fill="none">
      <path d="M40 186 C 44 140, 36 90, 42 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {leaves.map(({ y, side }) => (
        <path
          key={y}
          d={`M41 ${y + 8} C ${41 + side * 10} ${y - 6}, ${41 + side * 30} ${y - 8}, ${41 + side * 34} ${y - 14} C ${41 + side * 30} ${y + 4}, ${41 + side * 14} ${y + 12}, 41 ${y + 8} Z`}
          fill={fill}
          stroke={color}
          strokeWidth="1.3"
        />
      ))}
      <path d="M42 8 C 34 0, 30 -2, 26 -2 C 30 6, 36 10, 42 8 Z" fill={fill} stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} aria-hidden="true" fill="none">
      <path d="M12 20 C 4 14, 1 10, 2.5 6 C 4 2, 9 1.5, 12 6 C 15 1.5, 20 2, 21.5 6 C 23 10, 20 14, 12 20 Z" stroke={ROSE} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

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
  thanks = 'Toute l’équipe Décofleur Plus vous souhaite de beaux moments fleuris.',
}: InvoiceDocumentProps) {
  // Titre de l'onglet = nom du fichier PDF proposé à l'impression (« Facture CMD-… »), jamais celui du back-office
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} ${number} · Décofleur Plus`;
    return () => {
      document.title = previous;
    };
  }, [title, number]);

  const shopName = shop?.shopName || 'Décofleur Plus';
  const phones = [shop?.phoneSaly, shop?.phoneDakar].filter(Boolean).join(' · ');
  const [taglineTop, taglineBottom] = taglineFor(title);
  const longTitle = title.length > 10;
  // Filets du tableau et des totaux (classe écrite en entier pour Tailwind)
  const cell = 'border-[#dc93ae]';

  return (
    <article
      className="invoice-sheet invoice-document relative mx-auto w-full max-w-[880px] overflow-hidden rounded-[28px] border border-[#f1d3de] bg-[#fdf3f7] text-[#4b2f3a] shadow-sm"
      aria-label={`${title} ${number}`}
    >
      {/* Décor : taches douces et branches sur les bords */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#fbe1ea]" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[#fbe6ee]" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-80 rounded-full bg-[#fbe4ec]" />
        <span className="absolute right-10 top-8 h-2 w-2 rounded-full bg-[#f1b9cb]" />
        <span className="absolute right-16 top-14 h-1.5 w-1.5 rounded-full bg-[#f1b9cb]" />
        <span className="absolute left-8 bottom-40 h-1.5 w-1.5 rounded-full bg-[#f1b9cb]" />
        <LeafBranch className="absolute -left-6 top-56 h-48 w-20 -rotate-12 opacity-70" />
        <LeafBranch className="absolute -right-7 bottom-6 h-44 w-20 rotate-[200deg] opacity-60" color="#cfe3ad" fill="#e7f2d4" />
      </div>

      <div className="relative px-6 py-8 sm:px-12 sm:py-10 print:py-8">
        {/* Marque et coordonnées */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Image src="/images/logo-exact-v2.png" alt={shopName} width={1196} height={360} priority className="h-12 w-auto sm:h-14" />
          <div className="text-[11.5px] leading-relaxed text-[#7d6670] sm:text-right">
            {shop?.address && <p>{shop.address}</p>}
            {phones && <p>{phones}</p>}
            {shop?.contactEmail && <p>{shop.contactEmail}</p>}
            <p>www.decofleursplus.com</p>
          </div>
        </div>

        {/* Titre du document, fleur et phrase manuscrite */}
        <header className="mt-6 flex flex-col gap-4 print:mt-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="flex flex-wrap gap-x-5 gap-y-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c4497a]">
              {dates.map(([label, value]) => (
                <span key={label} className="whitespace-nowrap">
                  {label} : {value}
                </span>
              ))}
            </p>
            <h2
              className={`${titleFont.className} relative mt-2 inline-block font-extrabold leading-[0.95] text-[#b23a68] ${
                longTitle ? 'text-[38px] sm:text-[48px]' : 'text-[56px] sm:text-[76px]'
              }`}
            >
              <span aria-hidden="true" className="absolute -bottom-1 left-1 h-3 w-[88%] rounded-full bg-[#b4d878]/60" />
              <span className="relative">{title}</span>
            </h2>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7a4a5c]">N° {number}</p>
            {status && (
              <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${TONES[status.tone]}`}>
                {status.label}
              </span>
            )}
          </div>
          <div className="hidden shrink-0 items-start gap-1 sm:flex">
            <FlowerArt className="h-40 w-36" />
            <div className="pt-8 text-right">
              <p className={`${scriptFont.className} -rotate-6 text-[24px] leading-tight text-[#b23a68]`}>
                {taglineTop}
                <br />
                {taglineBottom}
              </p>
              <Heart className="ml-auto mt-2 h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Parties : client, livraison / destinataire… */}
        {parties.length > 0 && (
          <section className={`mt-7 grid gap-4 print:mt-5 ${parties.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {parties.map((party) => (
              <div key={party.title} className="rounded-2xl border border-[#efc7d6] bg-white/70 px-4 py-3.5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4497a]">{party.title}</p>
                <div className="space-y-0.5 text-[13px]">
                  {party.lines.filter(Boolean).map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-semibold text-[#4b2f3a]' : 'text-[#6d5560]'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Lignes : tableau à filets roses, feuillage en filigrane */}
        <section className={`relative mt-8 overflow-hidden rounded-lg border ${cell} bg-white/45 print:mt-5`}>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-around opacity-[0.16]" aria-hidden="true">
            <LeafBranch className="h-44 w-20 -rotate-12" />
            <LeafBranch className="hidden h-44 w-20 rotate-12 sm:block" />
          </div>
          <table className="relative w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f8d8e3] text-[10.5px] uppercase tracking-[0.18em] text-[#a8365f]">
                <th className={`border-b ${cell} px-4 py-3 text-left font-semibold`}>Désignation</th>
                <th className={`hidden border-b border-l ${cell} px-3 py-3 text-center font-semibold sm:table-cell`}>{quantityLabel}</th>
                <th className={`hidden border-b border-l ${cell} px-3 py-3 text-right font-semibold sm:table-cell`}>Prix unitaire</th>
                <th className={`border-b border-l ${cell} px-4 py-3 text-right font-semibold`}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={`${line.label}-${i}`} className="align-top">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-[#4b2f3a]">{line.label}</p>
                    {line.details?.filter(Boolean).map((d) => (
                      <p key={d} className="text-[11.5px] text-[#8a7179]">
                        {d}
                      </p>
                    ))}
                    {line.reference && <p className="text-[11px] text-[#a8939a]">Réf. {line.reference}</p>}
                    <p className="mt-1 text-[12px] text-[#6d5560] sm:hidden">
                      {line.quantity} × {formatPrice(line.unitPrice)}
                    </p>
                  </td>
                  <td className={`hidden whitespace-nowrap border-l ${cell} px-3 py-2.5 text-center sm:table-cell`}>{line.quantity}</td>
                  <td className={`hidden whitespace-nowrap border-l ${cell} px-3 py-2.5 text-right sm:table-cell`}>{formatPrice(line.unitPrice)}</td>
                  <td className={`whitespace-nowrap border-l ${cell} px-4 py-2.5 text-right font-medium`}>{formatPrice(line.total)}</td>
                </tr>
              ))}
              {/* Espace aéré sous les lignes, comme sur un devis papier */}
              <tr aria-hidden="true">
                <td className={lines.length < 4 ? 'h-20 print:h-12' : 'h-4'} />
                <td className={`hidden border-l ${cell} sm:table-cell`} />
                <td className={`hidden border-l ${cell} sm:table-cell`} />
                <td className={`border-l ${cell}`} />
              </tr>
            </tbody>
          </table>
        </section>

        {/* Notes et totaux encadrés */}
        <section className="mt-5 grid gap-5 sm:grid-cols-[1fr_340px] sm:items-start">
          <div className="text-[12.5px] leading-relaxed text-[#6d5560]">{notes}</div>
          <div className="space-y-2 text-[13px]">
            {totals.map((t) =>
              t.variant === 'grand' ? (
                <div
                  key={t.label}
                  className={`invoice-grand-total grid grid-cols-[1fr_auto] items-center rounded-md border ${cell} bg-[#f6cfdc] text-[#a8365f]`}
                >
                  <span className="px-3 py-2.5 text-right text-[12px] font-bold uppercase tracking-[0.16em]">{t.label}</span>
                  <span className={`${titleFont.className} whitespace-nowrap border-l ${cell} px-4 py-2.5 text-right text-xl font-bold`}>
                    {t.display ?? formatPrice(t.amount)}
                  </span>
                </div>
              ) : (
                <div key={t.label} className={`grid grid-cols-[1fr_auto] rounded-md border ${cell} bg-white/55`}>
                  <span className="px-3 py-2 text-right text-[#7a4a5c]">{t.label}</span>
                  <span
                    className={`min-w-[120px] whitespace-nowrap border-l ${cell} px-4 py-2 text-right ${
                      t.variant === 'discount' ? 'font-medium text-[#3f6b1f]' : 'font-medium'
                    }`}
                  >
                    {t.display ?? `${t.variant === 'discount' ? '− ' : ''}${formatPrice(t.amount)}`}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Pied de page : merci manuscrit, brin de feuillage, devise */}
        <div className="invoice-footer mt-10 print:mt-6">
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className={`${scriptFont.className} -rotate-6 text-[32px] leading-tight text-[#b23a68]`}>
                Merci pour
                <br />
                votre confiance !
              </p>
              <Heart className="ml-24 mt-1 h-6 w-6" />
            </div>
            <LeafBranch className="mx-auto hidden h-24 w-12 sm:block" color="#d26f95" fill="#f1b9cb" />
            <div className="sm:justify-self-end">
              <p className="text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.24em] text-[#7a4a5c]">
                À vos côtés
                <br />
                pour de beaux
                <br />
                moments fleuris
              </p>
              <div className="mt-2 h-px w-20 bg-[#dc93ae]" />
            </div>
          </div>
          <div className="mt-7 border-t border-[#efc7d6] pt-4 text-center">
            <p className="font-serif text-[13.5px] italic text-[#7a4a5c]">{thanks}</p>
            <p className="mt-1.5 text-[10.5px] text-[#9a8089]">{[shopName, shop?.address, phones, shop?.contactEmail].filter(Boolean).join(' · ')}</p>
            {(shop?.ninea || shop?.rccm) && (
              <p className="mt-0.5 text-[10.5px] text-[#9a8089]">
                {[shop?.ninea && `NINEA ${shop.ninea}`, shop?.rccm && `RCCM ${shop.rccm}`].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
