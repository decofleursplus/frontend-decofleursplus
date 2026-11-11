'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PackageCheck, FileText, Calendar, MapPin, UserRound, Heart, Star, Bell, Gift, TicketPercent, UsersRound, LogOut } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';

const entries = [
  ['Mon tableau de bord', '/compte', LayoutDashboard],
  ['Mes commandes', '/compte/commandes', PackageCheck],
  ['Mes devis', '/compte/devis', FileText],
  ['Mes abonnements floraux', '/compte/abonnements', Calendar],
  ['Mes adresses', '/compte/adresses', MapPin],
  ['Mes informations', '/compte/informations', UserRound],
  ['Mes favoris', '/compte/favoris', Heart],
  ['Mes points fidélité', '/compte/fidelite', Star],
  ['Mes avis', '/compte/avis', Star],
  ['Mes notifications', '/compte/notifications', Bell],
  ['Mes cartes cadeaux', '/compte/cartes-cadeaux', Gift],
  ['Mes coupons', '/compte/coupons', TicketPercent],
  ['Parrainage', '/compte/parrainage', UsersRound],
] as const;

export function AccountSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="account-sidebar">
      <nav aria-label="Navigation du compte">
        {entries.map(([label, href, Icon]) => (
          <Link
            className={path === href || (href !== '/compte' && path.startsWith(`${href}/`)) ? 'selected' : ''}
            href={href}
            key={href}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="account-signout"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        title="Se déconnecter"
      >
        <LogOut size={15} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
