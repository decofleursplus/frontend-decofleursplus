'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Truck,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { canAccessAdminPath } from '@/lib/admin/access';

const directTabs = [
  {
    label: 'Dashboard',
    href: '/admin/tableau-de-bord',
    icon: LayoutDashboard,
  },
  {
    label: 'Commandes',
    href: '/admin/commandes',
    icon: ClipboardList,
  },
  {
    label: 'Produits',
    href: '/admin/produits',
    icon: ShoppingBag,
  },
  {
    label: 'Livraisons',
    href: '/admin/livraisons',
    icon: Truck,
  },
];

export function AdminMobileTabBar() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, toggleMobileDrawer, currentUser } = useAdminSidebar();

  return (
    <nav
      className="admin-mobile-tabbar lg:hidden"
      aria-label="Navigation principale mobile du back-office"
    >
      <div className="admin-mobile-tabbar-grid">
        {directTabs.filter((tab) => canAccessAdminPath(currentUser?.role ?? 'ADMIN', tab.href)).map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/admin/tableau-de-bord' && pathname.startsWith(tab.href + '/'));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'admin-mobile-tab-item',
                isActive && 'active'
              )}
            >
              <span className="admin-mobile-tab-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
              </span>
              <span className="admin-mobile-tab-label">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5ème Onglet : Menu Complet du Back-office */}
        <button
          type="button"
          id="admin-bottom-menu-trigger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileDrawer();
          }}
          aria-expanded={isMobileDrawerOpen}
          aria-label="Ouvrir le menu complet du back-office"
          className={cn(
            'admin-mobile-tab-item touch-manipulation cursor-pointer',
            isMobileDrawerOpen && 'active'
          )}
        >
          <span className="admin-mobile-tab-icon-wrap">
            <Menu size={20} strokeWidth={isMobileDrawerOpen ? 2.4 : 1.9} className="pointer-events-none" />
          </span>
          <span className="admin-mobile-tab-label">Menu</span>
        </button>
      </div>
    </nav>
  );
}

