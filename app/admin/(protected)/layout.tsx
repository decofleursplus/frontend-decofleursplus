import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_KEY } from '@/lib/api/config';
import { parseAdminUserCookie } from '@/lib/api/auth-token';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AdminSidebarProvider } from '@/components/admin/admin-sidebar-context';
import { AdminMobileTabBar } from '@/components/admin/admin-mobile-tab-bar';
import { AdminMobileDrawer } from '@/components/admin/admin-mobile-drawer';

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

  return (
    <AdminSidebarProvider initialUser={initialUser}>
      <AdminSidebar initialUser={initialUser} />
      <div className="admin-main-area">
        <AdminTopbar initialUser={initialUser} />
        <main className="admin-content">{children}</main>
        <AdminMobileTabBar />
      </div>
      <AdminMobileDrawer initialUser={initialUser} />
    </AdminSidebarProvider>
  );
}
