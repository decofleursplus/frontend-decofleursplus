'use client';

import { use, useEffect, useState } from 'react';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getMySubscription, type CustomerSubscription } from '@/lib/api/subscriptions';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildSubscriptionDocument } from '@/lib/documents/other-documents';

/** Récapitulatif d'abonnement du client, imprimable ou enregistrable en PDF. */
export default function MySubscriptionDocumentPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const [sub, setSub] = useState<CustomerSubscription | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMySubscription(number), getPublicSettings().catch(() => null)])
      .then(([s, settings]) => {
        setSub(s);
        setShop(settings);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Abonnement indisponible.'));
  }, [number]);

  return (
    <DocumentPage backHref="/compte/abonnements" backLabel="Retour à mes abonnements" loading={!sub} error={error}>
      {sub && <InvoiceDocument shop={shop?.boutique ?? null} {...buildSubscriptionDocument(sub)} />}
    </DocumentPage>
  );
}
