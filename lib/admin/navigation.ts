import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Users,
  Package,
  Truck,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
  Building2,
  Boxes,
  FileSpreadsheet,
  Armchair,
  Trees,
  Repeat,
  Mail,
  Route,
  Gift,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  /** Libellé plus explicite pour le menu mobile */
  mobileLabel?: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

/**
 * Navigation du back-office regroupée par pôles métier :
 * le quotidien (commandes, livraisons, demandes clients) en haut, la configuration et le pilotage en bas.
 * Chaque lien est ensuite filtré selon le rôle (lib/admin/access.ts).
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Au quotidien',
    items: [
      { label: 'Mes livraisons', href: '/admin/mes-livraisons', icon: Route },
      { label: 'Tableau de bord', href: '/admin/tableau-de-bord', icon: LayoutDashboard },
      { label: 'Commandes', href: '/admin/commandes', icon: ClipboardList },
      { label: 'Livraisons', href: '/admin/livraisons', icon: Truck },
      { label: 'Devis', mobileLabel: 'Demandes de devis', href: '/admin/devis', icon: FileSpreadsheet },
      { label: 'Messages', mobileLabel: 'Messages & newsletter', href: '/admin/messages', icon: Mail },
    ],
  },
  {
    title: 'Clients & services',
    items: [
      { label: 'Clients', mobileLabel: 'Clients & CRM', href: '/admin/clients', icon: Users },
      { label: 'Abonnements', href: '/admin/abonnements', icon: Repeat },
      { label: 'Location', mobileLabel: 'Location de matériel', href: '/admin/location', icon: Armchair },
      { label: 'Paysagisme', mobileLabel: 'Paysagisme & projets', href: '/admin/paysagisme', icon: Trees },
    ],
  },
  {
    title: 'Catalogue & stock',
    items: [
      { label: 'Produits', href: '/admin/produits', icon: ShoppingBag },
      { label: 'Stock', mobileLabel: 'Gestion du stock', href: '/admin/stock', icon: Package },
      { label: 'Approvisionnements', href: '/admin/approvisionnements', icon: Boxes },
      { label: 'Fournisseurs', href: '/admin/fournisseurs', icon: Building2 },
      { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Marketing', mobileLabel: 'Marketing & promos', href: '/admin/marketing', icon: Megaphone },
      { label: 'Cartes cadeaux', href: '/admin/cartes-cadeaux', icon: Gift },
      { label: 'Blog & Contenu', href: '/admin/blog', icon: FileText },
    ],
  },
  {
    title: 'Pilotage',
    items: [
      { label: 'Rapports', mobileLabel: 'Rapports & finances', href: '/admin/rapports', icon: BarChart3 },
      { label: 'Paramètres', mobileLabel: 'Paramètres & équipe', href: '/admin/parametres', icon: Settings },
    ],
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/admin/tableau-de-bord' && pathname.startsWith(href + '/'));
}
