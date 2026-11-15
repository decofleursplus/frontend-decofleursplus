'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getMyQuotes, type QuoteItem } from '@/lib/api/quotes';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildQuoteDocument, quoteIsIssued } from '@/lib/documents/other-documents';

/** Devis chiffré du client, imprimable ou enregistrable en PDF. */
export default function MyQuoteDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyQuotes(), getPublicSettings().catch(() => null)])
      .then(([quotes, s]) => {
        const found = quotes.find((q) => q.id === id || q.quoteNumber === id);
        if (!found) setError('Devis introuvable.');
        else setQuote(found);
        setShop(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Devis indisponible.'));
  }, [id]);

  return (
    <DocumentPage
      backHref="/compte/devis"
      backLabel="Retour à mes devis"
      loading={!quote}
      error={error}
      unavailable={quote && !quoteIsIssued(quote) ? 'Ce devis n’est pas encore chiffré : vous recevrez la proposition par email.' : null}
    >
      {quote && (
        <InvoiceDocument
          shop={shop?.boutique ?? null}
          {...buildQuoteDocument(quote, { name: user?.name ?? '', email: user?.email, phone: user?.phone })}
        />
      )}
    </DocumentPage>
  );
}
