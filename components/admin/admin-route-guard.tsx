'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { canAccessAdminPath, firstAccessiblePath } from '@/lib/admin/access';

/** Pages d'arrivée par défaut : si le compte n'y a pas droit, on l'envoie directement sur son premier écran. */
const LANDING_PAGES = ['/admin', '/admin/tableau-de-bord'];

/**
 * Affiche un message clair (au lieu d'écrans vides en 403) quand les droits du compte
 * (Paramètres › Rôles & permissions) ne donnent pas accès à la page.
 */
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { access } = useAdminSidebar();
  const allowed = canAccessAdminPath(access, pathname);
  const home = firstAccessiblePath(access);
  const redirectToHome = !allowed && LANDING_PAGES.includes(pathname) && home !== pathname;

  useEffect(() => {
    if (redirectToHome) router.replace(home);
  }, [redirectToHome, home, router]);

  if (allowed) return <>{children}</>;
  if (redirectToHome) return null;
  return (
    <div className="max-w-lg mx-auto mt-16 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-3">
      <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
      <h1 className="text-lg font-bold text-amber-950">Accès réservé</h1>
      <p className="text-sm text-amber-900">
        Vos droits ne donnent pas accès à cette partie du back-office. Un administrateur peut les modifier dans
        Paramètres › Rôles &amp; permissions.
      </p>
      <Link href={home} className="inline-block rounded-lg bg-[#24582d] px-4 py-2 text-xs font-semibold text-white">
        Retour à mon espace
      </Link>
    </div>
  );
}
