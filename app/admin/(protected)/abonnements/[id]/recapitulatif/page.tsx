'use client';

import { use, useEffect, useState } from 'react';
import { DocumentPage } from '@/components/documents/document-page';
import { InvoiceDocument } from '@/components/documents/invoice-document';
import { getAdminSubscription } from '@/lib/api/admin/subscriptions';
import type { CustomerSubscription } from '@/lib/api/subscriptions';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { buildSubscriptionDocument } from '@/lib/documents/other-documents';

/** Récapitulatif d'un abonnement floral depuis le back-office. */
export default function AdminSubscriptionDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sub, setSub] = useState<CustomerSubscription | null>(null);
  const [shop, setShop] = useState<PublicShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminSubscription(id), getPublicSettings().catch(() => null)])
      .then(([s, settings]) => {
        setSub(s);
        setShop(settings);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Abonnement indisponible.'));
  }, [id]);

  return (
    <DocumentPage backHref="/admin/abonnements" backLabel="Retour aux abonnements" loading={!sub} error={error}>
      {sub && <InvoiceDocument shop={shop?.boutique ?? null} {...buildSubscriptionDocument(sub)} />}
    </DocumentPage>
  );
}
