'use client';

import { use, useEffect, useState } from 'react';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getAdminQuoteRecord, type AdminQuoteRecord } from '@/lib/api/admin/quotes';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildQuoteDocument, quoteIsIssued } from '@/lib/documents/other-documents';

/** Devis chiffré depuis le back-office (à imprimer ou envoyer en PDF). */
export default function AdminQuoteDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<AdminQuoteRecord | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminQuoteRecord(id), getPublicSettings().catch(() => null)])
      .then(([q, s]) => {
        setQuote(q);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Devis indisponible.'));
  }, [id]);

  return (
    <DocumentPage
      backHref="/admin/devis"
      backLabel="Retour aux devis"
      loading={!quote}
      error={error}
      unavailable={quote && !quoteIsIssued(quote) ? 'Ce devis n’a pas encore de proposition chiffrée : ajoutez les lignes puis envoyez-le.' : null}
    >
      {quote && (
        <InvoiceDocument
          shop={shop?.boutique ?? null}
          {...buildQuoteDocument(quote, {
            name: [quote.customerName, quote.company].filter(Boolean).join(' — '),
            email: quote.customerEmail,
            phone: quote.customerPhone,
          })}
        />
      )}
    </DocumentPage>
  );
}
