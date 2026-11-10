'use client';

import { useState } from 'react';
import { Menu, LogOut, ExternalLink, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { AdminNotificationsDropdown } from '@/components/admin/admin-notifications-dropdown';
import { getAdminUser, AdminSessionUser } from '@/lib/api/auth-token';
import { logoutAdmin } from '@/app/admin/connexion/actions';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

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
      <div className="admin-topbar-actions flex items-center gap-2">
        <AdminNotificationsDropdown />

        {/* User Dropdown Menu (Accessible on both Mobile & Desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="admin-topbar-user flex items-center gap-2.5 py-1 px-1.5 sm:px-2 rounded-full bg-white/70 border border-[#e7e4dd] hover:bg-white transition-all shadow-2xs cursor-pointer focus:outline-none"
            aria-label="Menu du profil administrateur"
          >
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
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-60 p-2 rounded-xl border border-[#e7e4dd] bg-white shadow-xl text-left"
          >
            {/* User details header */}
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-bold text-[#1e2a1f] leading-tight truncate">
                {currentUser?.name || 'Administrateur'}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight truncate mt-0.5">
                {currentUser?.email || 'admin@decofleursplus.com'}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentUser?.role || 'ADMIN'}
              </span>
            </div>

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink size={14} className="mr-2 text-gray-400" />
                <span>Voir la boutique publique</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                render={<Link href="/admin/parametres" />}
              >
                <Settings size={14} className="mr-2 text-gray-400" />
                <span>Paramètres & Équipe</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1.5 bg-gray-100" />

            {/* Logout Action */}
            <form action={logoutAdmin} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut size={14} className="text-rose-600" />
                <span>Se déconnecter</span>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dedicated Quick Mobile Logout Button */}
        <form action={logoutAdmin} className="lg:hidden flex items-center">
          <button
            type="submit"
            className="flex items-center justify-center h-8 w-8 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        </form>
      </div>
    </header>
  );
}
