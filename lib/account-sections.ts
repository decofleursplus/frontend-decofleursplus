/** Sections de l'espace client servies par /compte/[section] (module partagé serveur/client). */
export const ACCOUNT_SECTIONS = [
  'adresses',
  'informations',
  'fidelite',
  'coupons',
  'parrainage',
  'cartes-cadeaux',
  'avis',
  'notifications',
  'devis',
  'abonnements',
] as const;
export type AccountSectionKey = (typeof ACCOUNT_SECTIONS)[number];

export function isAccountSection(value: string): value is AccountSectionKey {
  return (ACCOUNT_SECTIONS as readonly string[]).includes(value);
}
