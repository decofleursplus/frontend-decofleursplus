'use client';

import { Bell, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';

export function AdminTopbar() {
  const { toggleMobileDrawer } = useAdminSidebar();

  return (
    <header className="admin-topbar">
      {/* Left: Hamburger mobile + Titre calligraphique */}
      <div className="admin-topbar-brand">
        <button
          type="button"
          onClick={toggleMobileDrawer}
          className="admin-topbar-mobile-menu-btn lg:hidden"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={20} />
        </button>

        <Link href="/admin/tableau-de-bord" className="flex items-center gap-2">
          <Image
            src="/logo_decofleur.jpeg"
            alt="Décofleur Plus"
            width={32}
            height={32}
            className="h-7 w-7 object-contain rounded-md lg:hidden"
          />
          <span className="admin-topbar-title">
            Back-office
          </span>
        </Link>
      </div>

      {/* Right actions */}
      <div className="admin-topbar-actions">
        <button
          type="button"
          className="admin-topbar-icon-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="admin-notif-dot" />
        </button>
        <div className="admin-topbar-user">
          <Avatar className="admin-topbar-avatar">
            <AvatarFallback className="admin-topbar-avatar-fb">A</AvatarFallback>
          </Avatar>
          <span className="admin-topbar-username hidden sm:inline">Admin</span>
        </div>
      </div>
    </header>
  );
}
