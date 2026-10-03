'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackageCheck, MapPin, UserRound, Heart, Star, Bell, Gift, TicketPercent, UsersRound, LogOut } from 'lucide-react';

const entries = [
  ['Mon tableau de bord', '/compte', LayoutDashboard], ['Mes commandes', '/compte/commandes', PackageCheck], ['Mes adresses', '/compte/adresses', MapPin], ['Mes informations', '/compte/informations', UserRound], ['Mes favoris', '/favoris', Heart], ['Mes points fidélité', '/compte/fidelite', Star], ['Mes avis', '/compte/avis', Star], ['Mes notifications', '/compte/notifications', Bell], ['Mes cartes cadeaux', '/compte/cartes-cadeaux', Gift], ['Mes coupons', '/compte/coupons', TicketPercent], ['Parrainage', '/compte/parrainage', UsersRound],
] as const;

export function AccountSidebar() {
  const path = usePathname();
  return <aside className="account-sidebar"><nav aria-label="Navigation du compte">{entries.map(([label, href, Icon]) => <Link className={path === href || (href !== '/compte' && path.startsWith(`${href}/`)) ? 'selected' : ''} href={href} key={href}><Icon size={15} />{label}</Link>)}</nav><Link className="account-signout" href="/connexion"><LogOut size={15} /> Déconnexion</Link></aside>;
}
