import type { DocumentLine, DocumentTone, InvoiceDocumentProps } from '@/components/documents/invoice-document';
import { formatDocumentDate } from '@/components/documents/invoice-document';
import { PAYMENT_METHOD_LABELS } from '@/lib/api/orders';
import type { QuoteStatus } from '@/lib/api/quotes';
import type { RentalDepositStatus, RentalReservationStatus } from '@/lib/api/rentals';
import type { CustomerSubscription } from '@/lib/api/subscriptions';
import { RESERVATION_STATUS_LABELS } from '@/lib/rental-utils';

type DocumentData = Omit<InvoiceDocumentProps, 'shop'>;

const paymentLabel = (method: string | null | undefined) =>
  method ? (PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ?? method) : null;

// ---------------------------------------------------------------------------
// Devis chiffré
// ---------------------------------------------------------------------------

export interface QuoteDocumentSource {
  quoteNumber: string;
  status: QuoteStatus;
  eventType: string;
  eventDate: string | null;
  eventLocation: string;
  estimatedGuests: number | null;
  /** Absents des devis antérieurs au formulaire structuré */
  spaceType?: string | null;
  surfaceArea?: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
  quotedAmount: number | null;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

const QUOTE_STATUS: Record<QuoteStatus, { label: string; tone: DocumentTone }> = {
  NEW: { label: 'Demande reçue', tone: 'info' },
  UNDER_REVIEW: { label: 'En préparation', tone: 'info' },
  SENT: { label: 'En attente de votre réponse', tone: 'pending' },
  ACCEPTED: { label: 'Accepté', tone: 'paid' },
  REFUSED: { label: 'Refusé', tone: 'cancelled' },
  CONVERTED_TO_ORDER: { label: 'Accepté — commande créée', tone: 'paid' },
};

/** Un devis n'est émis qu'une fois la proposition chiffrée envoyée. */
export const quoteIsIssued = (q: Pick<QuoteDocumentSource, 'items' | 'quotedAmount'>) => q.items.length > 0 || (q.quotedAmount ?? 0) > 0;

export function buildQuoteDocument(
  quote: QuoteDocumentSource,
  client: { name: string; email?: string | null; phone?: string | null },
): DocumentData {
  const lines: DocumentLine[] =
    quote.items.length > 0
      ? quote.items.map((it) => ({
          label: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
        }))
      : [{ label: `Prestation florale — ${quote.eventType}`, quantity: 1, unitPrice: quote.quotedAmount ?? 0, total: quote.quotedAmount ?? 0 }];
  const total = quote.items.length > 0 ? lines.reduce((sum, l) => sum + l.total, 0) : (quote.quotedAmount ?? 0);
  return {
    title: 'Devis',
    number: quote.quoteNumber,
    dates: [
      ['Date de la demande', formatDocumentDate(quote.createdAt)],
      ...(quote.sentAt ? ([['Proposition du', formatDocumentDate(quote.sentAt)]] as [string, string][]) : []),
      ...(quote.respondedAt ? ([['Réponse du', formatDocumentDate(quote.respondedAt)]] as [string, string][]) : []),
    ],
    status: QUOTE_STATUS[quote.status],
    parties: [
      { title: 'Client', lines: [client.name, client.email, client.phone] },
      {
        title: 'Votre projet',
        lines: [
          quote.eventType,
          quote.eventDate ? `Le ${formatDocumentDate(quote.eventDate)}` : null,
          [quote.spaceType, quote.eventLocation].filter(Boolean).join(' — '),
          quote.surfaceArea ? `Surface : ${quote.surfaceArea}` : null,
          quote.estimatedGuests ? `${quote.estimatedGuests} invités` : null,
        ],
      },
    ],
    lines,
    totals: [{ label: 'Total du devis', amount: total, variant: 'grand' }],
    notes: (
      <div className="space-y-1.5">
        <p>
          <span className="font-semibold text-[#173f22]">Pour accepter ce devis :</span> répondez depuis votre espace client (Mes devis) ou
          contactez-nous par téléphone ou WhatsApp.
        </p>
        <p className="text-[11.5px] text-[#8a837c]">Prix en francs CFA. Les fleurs fraîches sont choisies selon la saison et les arrivages.</p>
      </div>
    ),
    thanks: 'Merci de votre confiance : nous serons heureux de fleurir votre événement.',
  };
}

// ---------------------------------------------------------------------------
// Bon de location
// ---------------------------------------------------------------------------

export interface RentalDocumentSource {
  reservationNumber: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  eventLocation: string | null;
  equipmentName: string | null;
  quantity: number;
  startDate: string;
  endDate: string;
  days: number;
  unitPricePerDay: number;
  totalRental: number;
  deposit: number;
  status: RentalReservationStatus;
  statusLabel: string;
  depositStatus: RentalDepositStatus;
  notes: string | null;
  createdAt: string;
}

const RENTAL_TONE: Record<RentalReservationStatus, DocumentTone> = {
  PENDING: 'pending',
  CONFIRMED: 'info',
  RESERVED: 'info',
  DISPATCHED: 'info',
  RETURNED: 'paid',
  CANCELLED: 'cancelled',
};

const DEPOSIT_LABELS: Record<RentalDepositStatus, string> = {
  PENDING: 'à verser à la remise du matériel',
  COLLECTED: 'encaissée',
  REFUNDED: 'restituée',
  RETAINED: 'retenue',
};

export function buildRentalDocument(r: RentalDocumentSource): DocumentData {
  return {
    title: 'Bon de location',
    number: r.reservationNumber,
    dates: [
      ['Date', formatDocumentDate(r.createdAt)],
      ['Période', `du ${formatDocumentDate(r.startDate)} au ${formatDocumentDate(r.endDate)}`],
    ],
    status: { label: RESERVATION_STATUS_LABELS[r.status] ?? r.statusLabel, tone: RENTAL_TONE[r.status] },
    parties: [
      { title: 'Client', lines: [r.clientName, r.clientEmail, r.clientPhone] },
      { title: 'Lieu de l’événement', lines: [r.eventLocation || 'À préciser', r.notes] },
    ],
    quantityLabel: 'Qté × jours',
    lines: [
      {
        label: r.equipmentName ?? 'Matériel de location',
        details: [`${r.days} jour${r.days > 1 ? 's' : ''} de location`],
        quantity: r.quantity * r.days,
        unitPrice: r.unitPricePerDay,
        total: r.totalRental,
      },
    ],
    totals: [
      { label: 'Location', amount: r.totalRental, variant: 'grand' },
      { label: 'Caution', amount: r.deposit },
    ],
    notes: (
      <div className="space-y-1.5">
        <p>
          <span className="font-semibold text-[#173f22]">Caution :</span> {r.deposit > 0 ? `${DEPOSIT_LABELS[r.depositStatus]}, restituée au retour du matériel en bon état.` : 'aucune.'}
        </p>
        <p className="text-[11.5px] text-[#8a837c]">Matériel à restituer propre et complet à la date de fin. Prix en francs CFA.</p>
      </div>
    ),
    thanks: 'Merci pour votre confiance. Belle fête !',
  };
}

// ---------------------------------------------------------------------------
// Reçu de carte cadeau
// ---------------------------------------------------------------------------

export interface GiftCardDocumentSource {
  code: string;
  initialAmount: number;
  balance: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'USED' | 'DISABLED' | 'EXPIRED';
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string | null;
  recipientName: string;
  recipientEmail: string;
  message: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

/** Un reçu n'est émis que pour une carte payée (ou offerte et activée). */
export const giftCardIsIssued = (c: Pick<GiftCardDocumentSource, 'status' | 'activatedAt'>) =>
  c.status !== 'PENDING_PAYMENT' && Boolean(c.activatedAt);

export function buildGiftCardReceipt(card: GiftCardDocumentSource): DocumentData {
  const offered = !card.paymentMethod;
  return {
    title: 'Reçu de carte cadeau',
    number: card.code,
    dates: [
      ['Date', formatDocumentDate(card.paidAt ?? card.activatedAt ?? card.createdAt)],
      ['Valable jusqu’au', formatDocumentDate(card.expiresAt)],
    ],
    status: offered ? { label: 'Carte offerte', tone: 'info' } : { label: 'Payée', tone: 'paid' },
    parties: [
      { title: offered ? 'Émise par' : 'Acheteur', lines: [card.purchaserName, card.purchaserEmail, card.purchaserPhone] },
      { title: 'Destinataire', lines: [card.recipientName, card.recipientEmail, card.message ? `« ${card.message} »` : null] },
    ],
    lines: [
      {
        label: 'Carte cadeau Décofleur Plus',
        details: [`Code ${card.code}`, 'Utilisable en une ou plusieurs fois sur la boutique en ligne'],
        quantity: 1,
        unitPrice: card.initialAmount,
        total: card.initialAmount,
      },
    ],
    totals: [
      { label: offered ? 'Valeur de la carte' : 'Montant réglé', amount: card.initialAmount, variant: 'grand' },
      { label: 'Solde disponible', amount: card.balance },
    ],
    notes: (
      <p>
        <span className="font-semibold text-[#173f22]">Règlement :</span>{' '}
        {offered ? 'carte offerte par Décofleur Plus.' : `${paymentLabel(card.paymentMethod)} — reçu le ${formatDocumentDate(card.paidAt)}.`}
      </p>
    ),
    thanks: 'Merci d’avoir offert des fleurs : un joli cadeau qui fera plaisir.',
  };
}

// ---------------------------------------------------------------------------
// Récapitulatif d'abonnement
// ---------------------------------------------------------------------------

const FREQUENCY: Record<string, string> = { HEBDOMADAIRE: 'Chaque semaine', BIMENSUELLE: 'Toutes les deux semaines' };
const DAY: Record<string, string> = { MARDI: 'le mardi', VENDREDI: 'le vendredi', SAMEDI: 'le samedi' };
const SUB_STATUS: Record<string, { label: string; tone: DocumentTone }> = {
  ACTIVE: { label: 'Abonnement actif', tone: 'paid' },
  PAUSED: { label: 'En pause', tone: 'pending' },
  CANCELLED: { label: 'Résilié', tone: 'cancelled' },
  EXPIRED: { label: 'Terminé', tone: 'cancelled' },
};
const DELIVERY_STATUS: Record<string, string> = {
  SCHEDULED: 'prévue',
  PREPARING: 'en préparation',
  IN_DELIVERY: 'en route',
  DELIVERED: 'livrée',
  SKIPPED: 'sautée',
  CANCELLED: 'annulée',
  FAILED: 'non livrée',
};

export function buildSubscriptionDocument(sub: CustomerSubscription): DocumentData {
  const upcoming = (sub.deliveries ?? [])
    .filter((d) => new Date(d.scheduledDate).getTime() >= Date.now() - 86400000)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 4);
  const holder = sub.user ? `${sub.user.firstName} ${sub.user.lastName}`.trim() : sub.recipientName;
  return {
    title: 'Récapitulatif d’abonnement',
    number: sub.subscriptionNumber,
    dates: [
      ['Début', formatDocumentDate(sub.startDate)],
      ...(sub.nextDeliveryDate ? ([['Prochaine livraison', formatDocumentDate(sub.nextDeliveryDate)]] as [string, string][]) : []),
    ],
    status: SUB_STATUS[sub.status] ?? { label: sub.status, tone: 'info' },
    parties: [
      { title: 'Abonné', lines: [holder, sub.user?.email ?? sub.email, sub.user?.phone ?? sub.phone] },
      { title: 'Livraison', lines: [sub.recipientName, sub.address, sub.location, `${FREQUENCY[sub.frequency] ?? sub.frequency}, ${DAY[sub.deliveryDay] ?? sub.deliveryDay}`] },
    ],
    quantityLabel: 'Livraisons / mois',
    lines: [
      {
        label: `Abonnement floral — ${sub.planName ?? sub.plan}`,
        details: [FREQUENCY[sub.frequency] ?? sub.frequency, 'Bouquet frais livré à domicile'],
        quantity: sub.deliveriesPerMonth,
        unitPrice: sub.perDeliveryPrice,
        total: sub.monthlyAmount,
      },
    ],
    totals: [{ label: 'Par mois', amount: sub.monthlyAmount, variant: 'grand' }],
    notes: (
      <div className="space-y-2">
        <p>
          <span className="font-semibold text-[#173f22]">Règlement :</span> {paymentLabel(sub.paymentMethod)}
          {sub.paymentPhone ? ` (${sub.paymentPhone})` : ''}, chaque mois.
        </p>
        {upcoming.length > 0 && (
          <div>
            <p className="font-semibold text-[#173f22]">Prochaines livraisons</p>
            <ul className="mt-0.5 space-y-0.5">
              {upcoming.map((d) => (
                <li key={d.id}>
                  {formatDocumentDate(d.scheduledDate)} — {DELIVERY_STATUS[d.status] ?? d.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
    thanks: 'Merci de faire fleurir votre quotidien avec Décofleur Plus.',
  };
}
