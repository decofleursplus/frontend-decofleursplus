'use client';

import { AbonnementsSection } from '@/components/account/abonnements';
import { AdressesSection } from '@/components/account/adresses';
import { AvisSection } from '@/components/account/avis';
import { DevisSection } from '@/components/account/devis';
import { FideliteSection } from '@/components/account/fidelite';
import { InformationsSection } from '@/components/account/informations';
import { NotificationsSection } from '@/components/account/notifications';
import type { AccountSectionKey } from '@/lib/account-sections';

/** Rubriques de « Mon compte » ; chacune lit et écrit ses données via l'API. */
export function AccountSection({ section }: { section: AccountSectionKey }) {
  switch (section) {
    case 'adresses':
      return <AdressesSection />;
    case 'informations':
      return <InformationsSection />;
    case 'fidelite':
      return <FideliteSection />;
    case 'avis':
      return <AvisSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'devis':
      return <DevisSection />;
    case 'abonnements':
      return <AbonnementsSection />;
  }
}
