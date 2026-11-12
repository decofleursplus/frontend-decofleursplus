/**
 * Accès aux écrans du back-office par rôle — aligné sur les `requireRole` du backend,
 * pour ne jamais proposer un écran qui répondrait « accès refusé ».
 */
export type StaffRole = 'ADMIN' | 'MANAGER' | 'FLORIST' | 'DELIVERY' | 'SALES' | 'ACCOUNTANT';

const ALL_STAFF: StaffRole[] = ['ADMIN', 'MANAGER', 'FLORIST', 'DELIVERY', 'SALES', 'ACCOUNTANT'];

/** Du plus spécifique au plus général (premier préfixe correspondant). */
const RULES: { prefix: string; roles: StaffRole[] }[] = [
  { prefix: '/admin/mes-livraisons', roles: ['DELIVERY'] },
  { prefix: '/admin/approvisionnements/factures', roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { prefix: '/admin/approvisionnements', roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'FLORIST'] },
  { prefix: '/admin/fournisseurs', roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'FLORIST'] },
  { prefix: '/admin/tableau-de-bord', roles: ['ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT'] },
  { prefix: '/admin/commandes', roles: ['ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT'] },
  { prefix: '/admin/abonnements', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/produits', roles: ['ADMIN', 'MANAGER', 'FLORIST'] },
  { prefix: '/admin/stock', roles: ['ADMIN', 'MANAGER', 'FLORIST'] },
  { prefix: '/admin/categories', roles: ['ADMIN', 'MANAGER', 'FLORIST', 'SALES'] },
  { prefix: '/admin/clients', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/devis', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/location', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/paysagisme', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/livraisons', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/marketing', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/messages', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/blog', roles: ['ADMIN', 'MANAGER', 'FLORIST', 'SALES'] },
  { prefix: '/admin/rapports', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { prefix: '/admin/parametres', roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
];

export function canAccessAdminPath(role: string | null | undefined, path: string): boolean {
  if (!role) return false;
  const rule = RULES.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
  return (rule?.roles ?? ALL_STAFF).includes(role as StaffRole);
}

/** Premier écran accessible après connexion. */
export function adminHomeForRole(role: string | null | undefined): string {
  if (role === 'DELIVERY') return '/admin/mes-livraisons';
  if (role === 'FLORIST') return '/admin/produits';
  return '/admin/tableau-de-bord';
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gérant',
  FLORIST: 'Fleuriste',
  DELIVERY: 'Livreur',
  SALES: 'Commercial',
  ACCOUNTANT: 'Comptable',
};
