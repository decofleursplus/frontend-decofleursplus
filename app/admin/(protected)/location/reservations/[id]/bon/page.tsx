'use client';

import { use, useEffect, useState } from 'react';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getAdminRentalReservation } from '@/lib/api/admin/rentals';
import type { RentalReservation } from '@/lib/api/rentals';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildRentalDocument } from '@/lib/documents/other-documents';

/** Bon de location d'une réservation de matériel (à imprimer ou envoyer en PDF). */
export default function RentalDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<RentalReservation | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminRentalReservation(id), getPublicSettings().catch(() => null)])
      .then(([r, s]) => {
        setReservation(r);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Réservation indisponible.'));
  }, [id]);

  return (
    <DocumentPage
      backHref="/admin/location"
      backLabel="Retour à la location"
      loading={!reservation}
      error={error}
      unavailable={reservation?.status === 'CANCELLED' ? 'Réservation annulée : aucun bon de location n’est émis.' : null}
    >
      {reservation && <InvoiceDocument shop={shop?.boutique ?? null} {...buildRentalDocument(reservation)} />}
    </DocumentPage>
  );
}
