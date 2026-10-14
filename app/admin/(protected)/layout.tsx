import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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

  if (!authCookie || authCookie.value !== 'true') {
    redirect('/admin/connexion');
  }

  return (
    <AdminSidebarProvider>
      <AdminSidebar />
      <div className="admin-main-area">
        <AdminTopbar />
        <main className="admin-content">{children}</main>
        <AdminMobileTabBar />
      </div>
      <AdminMobileDrawer />
    </AdminSidebarProvider>
  );
}
