'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <nav
      className="admin-mobile-tabbar lg:hidden"
      aria-label="Navigation principale mobile du back-office"
    >
      <div className="admin-mobile-tabbar-grid">
        {directTabs.map((tab) => {
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
      </div>
    </nav>
  );
}

