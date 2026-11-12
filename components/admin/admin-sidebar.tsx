'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/app/admin/connexion/actions';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import type { AdminSessionUser } from '@/lib/api/auth-token';
import { AdminProfileDialog } from '@/components/admin/admin-profile-dialog';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canAccessAdminPath } from '@/lib/admin/access';
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '@/lib/admin/navigation';

export function AdminSidebar({ initialUser }: { initialUser?: AdminSessionUser | null } = {}) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, currentUser: contextUser, setCurrentUser } = useAdminSidebar();
  const currentUser = contextUser ?? initialUser ?? null;
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  return (
    <aside
      className={cn('admin-sidebar hidden lg:flex', isCollapsed && 'collapsed')}
      style={{
        width: isCollapsed ? 70 : 240,
        minWidth: isCollapsed ? 70 : 240,
        maxWidth: isCollapsed ? 70 : 240,
      }}
    >
      {/* ── En-tête avec Vrai Logo du Projet & Toggle Collapsible ── */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 py-3 px-2 border-b border-white/10">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center py-1 hover:opacity-85 transition-opacity"
            title="Décofleur Plus - Tableau de bord"
          >
            <Image
              src="/logo_decofleur_darkbg.png"
              alt="Décofleur Plus"
              width={36}
              height={36}
              priority
              className="h-9 w-auto object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Agrandir le menu (déplier)"
            aria-label="Agrandir le menu"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-2">
          <Link
            href="/admin/tableau-de-bord"
            className="flex items-center justify-center flex-1 py-1 hover:opacity-85 transition-opacity"
            title="Décofleur Plus"
          >
            <Image
              src="/logo_decofleur_darkbg.png"
              alt="Décofleur Plus"
              width={56}
              height={56}
              priority
              className="h-12 w-auto object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Réduire le menu"
            aria-label="Réduire le menu"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* ── Navigation Principale ── */}
      <nav className="admin-sidebar-nav">
        {ADMIN_NAV_GROUPS.map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccessAdminPath(currentUser?.role ?? 'ADMIN', item.href)),
        }))
          .filter((group) => group.items.length > 0)
          .map((group, gi) => (
          <div key={group.title} className={cn(gi > 0 && 'mt-3')}>
            {isCollapsed ? (
              gi > 0 && <div className="mx-3 mb-2 border-t border-white/10" aria-hidden="true" />
            ) : (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">{group.title}</p>
            )}
          <ul className="admin-nav-group" aria-label={group.title}>
            {group.items.map((item) => {
              const isActive = isAdminNavActive(pathname, item.href);
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <li key={item.href} className="relative group flex justify-center py-0.5">
                    <Link
                      href={item.href}
                      title={item.label}
                      className={cn(
                        'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                        isActive
                          ? 'bg-emerald-600/40 text-white border border-emerald-400/50 shadow-xs'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon
                        size={19}
                        className={isActive ? 'text-[#ff5c8a]' : 'text-white/80'}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </Link>
                    {/* Tooltip flottant au survol */}
                    <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 z-50 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1 text-xs font-medium text-white shadow-md border border-white/15">
                      <span>{item.label}</span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'admin-nav-link',
                      isActive && 'active'
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          </div>
        ))}
      </nav>

      {/* ── Pied de Sidebar : Profil & Déconnexion ── */}
      <div className={cn('admin-sidebar-footer', isCollapsed && 'p-2 flex flex-col items-center gap-2')}>
        {isCollapsed ? (
            <form action={logoutAdmin} className="w-full flex justify-center">
              <div className="relative group flex justify-center">
                <button
                  type="submit"
                  className="flex items-center justify-center h-10 w-10 rounded-lg text-rose-200 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-700/60 transition-colors cursor-pointer"
                  title="Déconnexion"
                  aria-label="Déconnexion"
                >
                  <LogOut size={17} />
                </button>
                <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 whitespace-nowrap rounded-md bg-rose-900 px-2.5 py-1 text-xs font-medium text-white shadow-md border border-rose-700/40">
                  Déconnexion
                </div>
              </div>
            </form>
        ) : (
          <>
            {/* Profil Administrateur Desktop */}
            <form action={logoutAdmin} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-700/60 transition-colors cursor-pointer group shadow-2xs"
                title="Déconnexion"
              >
                <LogOut
                  size={15}
                  className="text-rose-300 group-hover:text-rose-100 transition-colors shrink-0"
                />
                <span>Déconnexion</span>
              </button>
            </form>
          </>
        )}
      </div>

      {/* Profile Dialog */}
      <AdminProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        currentUser={currentUser}
        onUserUpdated={setCurrentUser}
      />
    </aside>
  );
}
