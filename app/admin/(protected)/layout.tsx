import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_KEY, API_BASE_URL } from '@/lib/api/config';
import type { AdminAccess } from '@/lib/admin/access';
import { parseAdminUserCookie } from '@/lib/api/auth-token';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AdminSidebarProvider } from '@/components/admin/admin-sidebar-context';
import { AdminMobileTabBar } from '@/components/admin/admin-mobile-tab-bar';
import { AdminMobileDrawer } from '@/components/admin/admin-mobile-drawer';
import { AdminRouteGuard } from '@/components/admin/admin-route-guard';

/**
 * Droits du compte connecté, lus côté serveur pour afficher d'emblée le bon menu.
 * En cas de lenteur ou d'erreur, le navigateur les recharge (AdminSidebarProvider).
 */
async function loadAccess(token: string): Promise<AdminAccess | 'unauthorized' | 'password' | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/roles/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    // Compte désactivé ou supprimé, ou jeton expiré
    if (res.status === 401) return 'unauthorized';
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { role?: string; permissions?: AdminAccess['permissions']; mustChangePassword?: boolean };
    };
    // Mot de passe temporaire pas encore changé
    if (json.data?.mustChangePassword) return 'password';
    return json.data?.role && json.data.permissions ? { role: json.data.role, permissions: json.data.permissions } : null;
  } catch {
    return null;
  }
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  const tokenCookie = cookieStore.get(ADMIN_TOKEN_KEY) || cookieStore.get('df_admin_token');
  const userCookie = cookieStore.get('admin_user');

  if (!authCookie || authCookie.value !== 'true' || !tokenCookie?.value) {
    redirect('/admin/connexion');
  }

  const initialUser = parseAdminUserCookie(userCookie?.value);
  const loaded = await loadAccess(tokenCookie.value);
  if (loaded === 'unauthorized') redirect('/admin/connexion?session=expiree');
  if (loaded === 'password') redirect('/admin/mot-de-passe');
  const initialAccess = loaded;
  // Le rôle relu par l'API prime sur celui du cookie (changé par un administrateur entre-temps)
  const user = initialUser && initialAccess ? { ...initialUser, role: initialAccess.role } : initialUser;

  return (
    <AdminSidebarProvider initialUser={user} initialAccess={initialAccess}>
      <AdminSidebar initialUser={user} />
      <div className="admin-main-area">
        <AdminTopbar initialUser={user} />
        <main className="admin-content">
          <AdminRouteGuard>{children}</AdminRouteGuard>
        </main>
        <AdminMobileTabBar />
      </div>
      <AdminMobileDrawer initialUser={user} />
    </AdminSidebarProvider>
  );
}
