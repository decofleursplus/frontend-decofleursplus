/**
 * Accès aux écrans du back-office selon les droits du compte connecté.
 *
 * Les droits (module → voir / modifier / supprimer) sont configurés par l'administrateur dans
 * Paramètres › Rôles & permissions et renvoyés par GET /admin/roles/me. L'API les vérifie sur chaque
 * route ; ici on n'affiche que les écrans et boutons utilisables, pour ne jamais tomber sur un « accès refusé ».
 */
import { ADMIN_NAV_GROUPS } from '@/lib/admin/navigation';
import type { ModulePermission, PermissionAction } from '@/lib/api/admin/settings';

export type StaffRole = 'ADMIN' | 'MANAGER' | 'FLORIST' | 'DELIVERY' | 'SALES' | 'ACCOUNTANT';

export interface AdminAccess {
  role: string;
  permissions: Record<string, ModulePermission>;
}

/** Écran → modules qui y donnent accès (au moins une action sur l'un d'eux). Du plus spécifique au plus général. */
const PAGE_RULES: { prefix: string; modules?: string[]; role?: StaffRole }[] = [
  // Espace du livreur : ses propres livraisons, réservé au rôle Livreur
  { prefix: '/admin/mes-livraisons', role: 'DELIVERY' },
  { prefix: '/admin/approvisionnements/factures', modules: ['factures-fournisseurs'] },
  { prefix: '/admin/approvisionnements/reception', modules: ['receptions'] },
  { prefix: '/admin/approvisionnements', modules: ['approvisionnements'] },
  { prefix: '/admin/fournisseurs', modules: ['approvisionnements'] },
  { prefix: '/admin/tableau-de-bord', modules: ['dashboard'] },
  { prefix: '/admin/commandes', modules: ['commandes'] },
  { prefix: '/admin/abonnements', modules: ['abonnements', 'formules-abonnement'] },
  { prefix: '/admin/produits', modules: ['produits'] },
  { prefix: '/admin/stock', modules: ['stock'] },
  { prefix: '/admin/categories', modules: ['categories'] },
  { prefix: '/admin/avis', modules: ['avis'] },
  { prefix: '/admin/clients', modules: ['clients'] },
  { prefix: '/admin/devis', modules: ['devis'] },
  { prefix: '/admin/location', modules: ['location', 'materiel-location'] },
  { prefix: '/admin/paysagisme', modules: ['paysagisme'] },
  { prefix: '/admin/livraisons', modules: ['livraisons', 'livreurs'] },
  { prefix: '/admin/marketing', modules: ['marketing', 'evenements'] },
  { prefix: '/admin/annonces', modules: ['annonces'] },
  { prefix: '/admin/cartes-cadeaux', modules: ['cartes-cadeaux'] },
  { prefix: '/admin/messages', modules: ['messages'] },
  { prefix: '/admin/blog', modules: ['blog'] },
  { prefix: '/admin/rapports', modules: ['rapports'] },
  { prefix: '/admin/parametres', modules: ['parametres', 'collaborateurs', 'zones', 'fidelite'] },
];

const NONE: ModulePermission = { read: false, write: false, delete: false };

/** Droits du compte sur un module (l'administrateur a tout). */
export function modulePermission(access: AdminAccess | null | undefined, moduleKey: string): ModulePermission {
  if (!access) return NONE;
  if (access.role === 'ADMIN') return { read: true, write: true, delete: true };
  return access.permissions[moduleKey] ?? NONE;
}

export function can(access: AdminAccess | null | undefined, moduleKey: string, action: PermissionAction): boolean {
  return modulePermission(access, moduleKey)[action];
}

/** Au moins une action (voir, modifier ou supprimer) sur l'un des modules. */
function hasAny(access: AdminAccess, modules: string[]): boolean {
  return modules.some((m) => {
    const p = modulePermission(access, m);
    return p.read || p.write || p.delete;
  });
}

/**
 * L'écran est-il accessible ? Tant que les droits ne sont pas connus, on laisse passer : l'API reste
 * l'arbitre et le menu se met à jour dès le chargement des droits.
 */
export function canAccessAdminPath(access: AdminAccess | null | undefined, path: string): boolean {
  if (!access) return true;
  const rule = PAGE_RULES.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
  if (!rule) return true;
  if (rule.role) return access.role === rule.role;
  if (access.role === 'ADMIN') return true;
  return hasAny(access, rule.modules ?? []);
}

/** Premier écran du menu accessible au compte (page d'arrivée, bouton « Retour »). */
export function firstAccessiblePath(access: AdminAccess | null | undefined): string {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (canAccessAdminPath(access, item.href)) return item.href;
    }
  }
  return '/admin/parametres';
}

/** Page d'arrivée après connexion, avec les droits par défaut du rôle (corrigée ensuite par le garde des pages). */
export function adminHomeForRole(role: string | null | undefined): string {
  if (role === 'DELIVERY') return '/admin/mes-livraisons';
  if (role === 'FLORIST') return '/admin/commandes';
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

/** Libellé français d'un rôle du personnel ; le code brut seulement s'il est inconnu. */
export function roleLabel(role: string | null | undefined, fallback = 'Personnel'): string {
  if (!role) return fallback;
  return ROLE_LABELS[role as StaffRole] ?? role;
}
