'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/app/admin/connexion/actions';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
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
  ChevronLeft,
  ChevronRight,
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
  const { isCollapsed, toggleSidebar } = useAdminSidebar();

  return (
    <aside
      className={cn('admin-sidebar hidden lg:flex', isCollapsed && 'collapsed')}
      style={{
        width: isCollapsed ? 70 : 240,
        minWidth: isCollapsed ? 70 : 240,
        maxWidth: isCollapsed ? 70 : 240,
      }}
    >
      {/* ── En-tête avec Vrai Logo du Projet & Toggle Collapsible ── */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 py-3 px-2 border-b border-gray-100">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center p-1 rounded-lg hover:bg-gray-100/60 transition-colors"
            title="Décofleur Plus - Tableau de bord"
          >
            <Image
              src="/logo_decofleur.jpeg"
              alt="Décofleur Plus"
              width={40}
              height={40}
              priority
              className="h-9 w-9 object-contain rounded-md"
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Agrandir le menu (déplier)"
            aria-label="Agrandir le menu"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 border-b border-gray-100 gap-2">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center flex-1 hover:opacity-90 transition-opacity"
            title="Décofleur Plus"
          >
            <Image
              src="/logo_decofleur.jpeg"
              alt="Décofleur Plus"
              width={140}
              height={56}
              priority
              className="h-20 w-auto object-contain rounded-md"
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            title="Réduire le menu"
            aria-label="Réduire le menu"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* ── Navigation Principale ── */}
      <nav className="admin-sidebar-nav">
        {navGroups.map((group, gi) => (
          <ul key={gi} className="admin-nav-group">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/tableau-de-bord' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <li key={item.href} className="relative group flex justify-center py-0.5">
                    <Link
                      href={item.href}
                      title={item.label}
                      className={cn(
                        'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                      )}
                    >
                      <Icon
                        size={19}
                        className={isActive ? 'text-[#c1647a]' : 'text-gray-500'}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </Link>
                    {/* Tooltip flottant au survol */}
                    <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-md">
                      {item.label}
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'admin-nav-link',
                      isActive && 'active'
                    )}
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

      {/* ── Pied de Sidebar : Bouton Déconnexion Simplifié ── */}
      <div className={cn('admin-sidebar-footer', isCollapsed && 'p-2 flex justify-center')}>
        <form action={logoutAdmin} className="w-full">
          {isCollapsed ? (
            <div className="relative group flex justify-center">
              <button
                type="submit"
                className="flex items-center justify-center h-10 w-10 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut size={17} />
              </button>
              <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 whitespace-nowrap rounded-md bg-rose-800 px-2.5 py-1 text-xs font-medium text-white shadow-md">
                Déconnexion
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer group shadow-2xs"
              title="Déconnexion"
            >
              <LogOut
                size={15}
                className="text-gray-400 group-hover:text-rose-600 transition-colors shrink-0"
              />
              <span>Déconnexion</span>
            </button>
          )}
        </form>
      </div>
    </aside>
  );
}
