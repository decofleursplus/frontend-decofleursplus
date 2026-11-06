'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { AdminNotificationsDropdown } from '@/components/admin/admin-notifications-dropdown';
import { getAdminUser, AdminSessionUser } from '@/lib/api/auth-token';

export function AdminTopbar() {
  const { toggleMobileDrawer } = useAdminSidebar();
  const [currentUser] = useState<AdminSessionUser | null>(() => getAdminUser());

  return (
    <header className="admin-topbar">
      {/* Left: Hamburger mobile + Titre calligraphique */}
      <div className="admin-topbar-brand">
        <button
          type="button"
          id="admin-topbar-menu-trigger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileDrawer();
          }}
          className="admin-topbar-mobile-menu-btn lg:hidden touch-manipulation cursor-pointer"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={22} className="pointer-events-none" />
        </button>

        <Link href="/admin/tableau-de-bord" className="flex items-center gap-2">
          <Image
            src="/logo_decofleur.jpeg"
            alt="Décofleur Plus"
            width={28}
            height={28}
            className="h-7 w-auto object-contain rounded-md lg:hidden"
            style={{ width: 'auto' }}
          />
          <span className="admin-topbar-title">
            Back-office
          </span>
        </Link>
      </div>

      {/* Right actions */}
      <div className="admin-topbar-actions">
        <AdminNotificationsDropdown />
        <div className="admin-topbar-user flex items-center gap-2.5 py-1 px-1.5 sm:px-2 rounded-full bg-white/70 border border-[#e7e4dd] hover:bg-white transition-all shadow-2xs">
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-emerald-600/20">
              <AvatarImage
                src="/images/admin-avatar.jpg"
                alt={currentUser?.name || 'Admin DécoFleur Plus'}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#102617] text-white text-xs font-bold">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DF'}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
              title="En ligne"
            />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="admin-topbar-username text-xs font-bold text-gray-800 leading-tight">
              {currentUser?.name || 'Admin'}
            </span>
            <span className="text-[10px] font-medium text-emerald-800 leading-none">
              {currentUser?.role || 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
