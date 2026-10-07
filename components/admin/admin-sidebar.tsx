'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/app/admin/connexion/actions';
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
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    items: [
      { label: 'Tableau de bord', href: '/admin/tableau-de-bord', icon: LayoutDashboard },
      { label: 'Commandes', href: '/admin/commandes', icon: ClipboardList },
      { label: 'Produits', href: '/admin/produits', icon: ShoppingBag },
      { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
      { label: 'Clients', href: '/admin/clients', icon: Users },
      { label: 'Stock', href: '/admin/stock', icon: Package },
      { label: 'Livraisons', href: '/admin/livraisons', icon: Truck },
      { label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
      { label: 'Blog & Contenu', href: '/admin/blog', icon: FileText },
      { label: 'Rapports', href: '/admin/rapports', icon: BarChart3 },
      { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="admin-sidebar-brand">
        <Link href="/admin/tableau-de-bord" className="admin-sidebar-logo">
          <span className="admin-logo-deco">Décofleur</span>{' '}
          <span className="admin-logo-plus">Plus</span>
        </Link>
        <span className="admin-logo-tagline">Nature en Élégance</span>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {navGroups.map((group, gi) => (
          <ul key={gi} className="admin-nav-group">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/tableau-de-bord' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn('admin-nav-link', isActive && 'active')}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-user-avatar">
            <span>D</span>
          </div>
          <div className="admin-user-info">
            <strong>Décofleur Plus</strong>
            <small>Administrateur</small>
          </div>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="admin-logout-btn"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
