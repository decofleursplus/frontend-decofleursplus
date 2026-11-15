import type { DocumentLine, DocumentTotal, InvoiceDocumentProps } from '@/components/documents/invoice-document';
import { formatDocumentDate } from '@/components/documents/invoice-document';
import { DELIVERY_MODE_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/api/orders';

/** Champs communs aux commandes vues par le client et par le back-office. */
export interface OrderInvoiceSource {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryMode: 'STANDARD' | 'EXPRESS' | 'PICKUP';
  deliveryAddress: string | null;
  deliveryZone: { name: string } | null;
  deliveryDate: string | null;
  timeSlot: string | null;
  subtotal: number;
  extrasAmount: number;
  discountAmount: number;
  couponCode: string | null;
  deliveryFee: number;
  giftCardAmount?: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
  items: {
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    giftWrap: boolean;
    cardMessage: string | null;
    extrasPrice?: number;
  }[];
}

/** Facture d'une commande : mêmes données pour l'espace client et le back-office. */
export function buildOrderInvoice(order: OrderInvoiceSource): Omit<InvoiceDocumentProps, 'shop'> {
  const giftCard = order.giftCardAmount ?? 0;
  const paid = order.paymentStatus === 'PAID';
  const refunded = order.paymentStatus === 'REFUNDED';

  const lines: DocumentLine[] = order.items.map((it) => ({
    label: it.productName,
    details: [
      it.variantName && it.variantName !== 'Standard' ? `Taille : ${it.variantName}` : '',
      it.giftWrap ? 'Emballage cadeau' : '',
      it.cardMessage ? `Carte message : « ${it.cardMessage} »` : '',
    ].filter(Boolean),
    reference: it.sku,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.totalPrice,
  }));

  const totals: DocumentTotal[] = [{ label: 'Sous-total articles', amount: order.subtotal }];
  if (order.extrasAmount > 0) totals.push({ label: 'Options cadeau', amount: order.extrasAmount });
  if (order.discountAmount > 0)
    totals.push({ label: `Remise${order.couponCode ? ` (${order.couponCode})` : ''}`, amount: order.discountAmount, variant: 'discount' });
  totals.push({
    label: order.deliveryMode === 'PICKUP' ? 'Retrait à l’atelier' : DELIVERY_MODE_LABELS[order.deliveryMode],
    amount: order.deliveryFee,
    display: order.deliveryFee === 0 ? 'Offerte' : undefined,
  });
  if (giftCard > 0) {
    totals.push({ label: 'Total TTC', amount: order.totalAmount + giftCard });
    totals.push({ label: 'Réglé par carte cadeau', amount: giftCard, variant: 'discount' });
  }
  totals.push({ label: giftCard > 0 ? (paid ? 'Montant réglé' : 'Reste à payer') : paid ? 'Total réglé' : 'Total à payer', amount: order.totalAmount, variant: 'grand' });

  const method = PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? order.paymentMethod;
  const schedule =
    order.deliveryDate &&
    `${order.deliveryMode === 'PICKUP' ? 'Retrait' : 'Livraison'} le ${formatDocumentDate(order.deliveryDate)}${order.timeSlot ? `, ${order.timeSlot}` : ''}`;

  return {
    title: 'Facture',
    number: order.orderNumber,
    dates: [
      ['Date', formatDocumentDate(order.createdAt)],
      ...(order.paidAt ? ([['Payée le', formatDocumentDate(order.paidAt)]] as [string, string][]) : []),
    ],
    status: {
      label: PAYMENT_STATUS_LABELS[order.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? order.paymentStatus,
      tone: paid ? 'paid' : refunded || order.paymentStatus === 'FAILED' ? 'cancelled' : 'pending',
    },
    parties: [
      { title: 'Facturé à', lines: [order.customerName, order.customerEmail, order.customerPhone] },
      {
        title: order.deliveryMode === 'PICKUP' ? 'Retrait' : 'Livré à',
        lines:
          order.deliveryMode === 'PICKUP'
            ? ['Retrait à l’atelier', schedule]
            : [
                order.recipientName || order.customerName,
                order.deliveryAddress,
                order.deliveryZone ? `Zone : ${order.deliveryZone.name}` : null,
                order.recipientPhone,
                schedule,
              ],
      },
    ],
    lines,
    totals,
    notes: (
      <div className="space-y-1.5">
        <p>
          <span className="font-semibold text-[#173f22]">Règlement :</span> {method}
          {paid ? ' — reçu, merci !' : order.paymentMethod === 'CASH_ON_DELIVERY' ? ' — à régler à la remise de la commande.' : '.'}
        </p>
        <p className="text-[11.5px] text-[#8a837c]">Prix en francs CFA. Facture établie à partir de la commande {order.orderNumber}.</p>
      </div>
    ),
  };
}
