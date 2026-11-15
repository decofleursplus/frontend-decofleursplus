'use client';

import { use, useEffect, useState } from 'react';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getAdminGiftCard, type AdminGiftCardDetail } from '@/lib/api/admin/rewards';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildGiftCardReceipt, giftCardIsIssued } from '@/lib/documents/other-documents';

/** Reçu d'une carte cadeau payée (ou offerte), à remettre à l'acheteur. */
export default function GiftCardReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [card, setCard] = useState<AdminGiftCardDetail | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminGiftCard(id), getPublicSettings().catch(() => null)])
      .then(([c, s]) => {
        setCard(c);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Carte cadeau indisponible.'));
  }, [id]);

  return (
    <DocumentPage
      backHref={`/admin/cartes-cadeaux?carte=${encodeURIComponent(id)}`}
      backLabel="Retour à la carte cadeau"
      loading={!card}
      error={error}
      unavailable={card && !giftCardIsIssued(card) ? 'Carte en attente de paiement : le reçu sera disponible après « Paiement reçu ».' : null}
    >
      {card && <InvoiceDocument shop={shop?.boutique ?? null} {...buildGiftCardReceipt(card)} />}
    </DocumentPage>
  );
}
