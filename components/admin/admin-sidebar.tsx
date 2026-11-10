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
  Building2,
  Boxes,
  FileSpreadsheet,
  Armchair,
  Trees,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    items: [
      { label: 'Tableau de bord', href: '/admin/tableau-de-bord', icon: LayoutDashboard },
      { label: 'Commandes', href: '/admin/commandes', icon: ClipboardList },
      { label: 'Abonnements', href: '/admin/abonnements', icon: Repeat },
      { label: 'Produits', href: '/admin/produits', icon: ShoppingBag },
      { label: 'Fournisseurs', href: '/admin/fournisseurs', icon: Building2, badge: 'À venir' },
      { label: 'Approvisionnements', href: '/admin/approvisionnements', icon: Boxes, badge: 'À venir' },
      { label: 'Stock', href: '/admin/stock', icon: Package },
      { label: 'Clients', href: '/admin/clients', icon: Users },
      { label: 'Devis', href: '/admin/devis', icon: FileSpreadsheet },
      { label: 'Location', href: '/admin/location', icon: Armchair },
      { label: 'Paysagisme', href: '/admin/paysagisme', icon: Trees, badge: 'À venir' },
      { label: 'Livraisons', href: '/admin/livraisons', icon: Truck },
      { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
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
        <div className="flex flex-col items-center gap-2 py-3 px-2 border-b border-white/10">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center py-1 hover:opacity-85 transition-opacity"
            title="Décofleur Plus - Tableau de bord"
          >
            <Image
              src="/logo_decofleur_darkbg.png"
              alt="Décofleur Plus"
              width={36}
              height={36}
              priority
              className="h-9 w-auto object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Agrandir le menu (déplier)"
            aria-label="Agrandir le menu"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-2">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center flex-1 py-1 hover:opacity-85 transition-opacity"
            title="Décofleur Plus"
          >
            <Image
              src="/logo_decofleur_darkbg.png"
              alt="Décofleur Plus"
              width={56}
              height={56}
              priority
              className="h-12 w-auto object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
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
                          ? 'bg-emerald-600/40 text-white border border-emerald-400/50 shadow-xs'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon
                        size={19}
                        className={isActive ? 'text-[#ff5c8a]' : 'text-white/80'}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </Link>
                    {/* Tooltip flottant au survol */}
                    <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 z-50 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1 text-xs font-medium text-white shadow-md border border-white/15">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
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
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
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
                className="flex items-center justify-center h-10 w-10 rounded-lg text-rose-200 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-700/60 transition-colors cursor-pointer"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut size={17} />
              </button>
              <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 whitespace-nowrap rounded-md bg-rose-900 px-2.5 py-1 text-xs font-medium text-white shadow-md border border-rose-700/40">
                Déconnexion
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-700/60 transition-colors cursor-pointer group shadow-2xs"
              title="Déconnexion"
            >
              <LogOut
                size={15}
                className="text-rose-300 group-hover:text-rose-100 transition-colors shrink-0"
              />
              <span>Déconnexion</span>
            </button>
          )}
        </form>
      </div>
    </aside>
  );
}
