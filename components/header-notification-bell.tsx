'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getMyUnreadNotificationCount } from '@/lib/api/notifications';

const REFRESH_MS = 60_000;

/** Cloche du client connecté : nombre de notifications non lues, actualisé chaque minute et après lecture. */
export function HeaderNotificationBell({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      getMyUnreadNotificationCount()
        .then((n) => active && setUnread(n))
        .catch(() => {
          /* compteur indicatif : on garde la dernière valeur connue */
        });
    void refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    window.addEventListener('client-notifications-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('client-notifications-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [pathname]);

  const label = unread > 0 ? `Mes notifications (${unread} non lue${unread > 1 ? 's' : ''})` : 'Mes notifications';
  const badge = unread > 0 ? <span className={variant === 'mobile' ? 'mobile-cart-badge' : 'action-badge pink-badge'}>{unread > 99 ? '99+' : unread}</span> : null;

  if (variant === 'mobile') {
    return (
      <Link href="/compte/notifications" className="mobile-header-btn mobile-cart-btn" aria-label={label}>
        <Bell size={22} />
        {badge}
      </Link>
    );
  }
  return (
    <Link href="/compte/notifications" className="action-icon-link" aria-label={label}>
      <div className="icon-with-badge">
        <Bell size={20} />
        {badge}
      </div>
      <span className="action-label-text">Alertes</span>
    </Link>
  );
}
