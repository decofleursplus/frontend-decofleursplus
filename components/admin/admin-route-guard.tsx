'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { adminHomeForRole, canAccessAdminPath } from '@/lib/admin/access';
import type { AdminSessionUser } from '@/lib/api/auth-token';

/** Affiche un message clair (au lieu d'écrans vides en 403) quand le rôle n'a pas accès à la page. */
export function AdminRouteGuard({ initialUser, children }: { initialUser: AdminSessionUser | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useAdminSidebar();
  const role = (currentUser ?? initialUser)?.role;
  if (!role || canAccessAdminPath(role, pathname)) return <>{children}</>;
  return (
    <div className="max-w-lg mx-auto mt-16 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-3">
      <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
      <h1 className="text-lg font-bold text-amber-950">Accès réservé</h1>
      <p className="text-sm text-amber-900">Votre rôle ne donne pas accès à cette partie du back-office.</p>
      <Link href={adminHomeForRole(role)} className="inline-block rounded-lg bg-[#24582d] px-4 py-2 text-xs font-semibold text-white">
        Retour à mon espace
      </Link>
    </div>
  );
}
