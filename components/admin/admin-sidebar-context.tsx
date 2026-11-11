'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminSessionUser, getAdminUser } from '@/lib/api/auth-token';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
  currentUser: AdminSessionUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AdminSessionUser | null>>;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AdminSessionUser | null;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminSessionUser | null>(initialUser ?? null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // LocalStorage non disponible ou bloqué
    }

    // Synchronisation sécurisée post-hydratation depuis le stockage local
    const clientUser = getAdminUser();
    if (clientUser) {
      setCurrentUser((prev) => {
        if (!prev) return clientUser;
        if (clientUser.avatar && clientUser.avatar !== prev.avatar) {
          return { ...prev, avatar: clientUser.avatar };
        }
        return prev;
      });
    }

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AdminSessionUser | null>;
      if (customEvent.detail !== undefined) {
        setCurrentUser(customEvent.detail);
      } else {
        setCurrentUser(getAdminUser());
      }
    };

    window.addEventListener('admin-user-updated', handleUserUpdate);
    return () => window.removeEventListener('admin-user-updated', handleUserUpdate);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  };

  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);
  const toggleMobileDrawer = () => setIsMobileDrawerOpen((prev) => !prev);

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setCollapsed,
        isMobileDrawerOpen,
        openMobileDrawer,
        closeMobileDrawer,
        toggleMobileDrawer,
        currentUser,
        setCurrentUser,
      }}
    >
      <div
        className={`admin-shell ${
          isCollapsed ? 'admin-shell-collapsed' : ''
        }`}
      >
        {children}
      </div>
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar doit être utilisé dans un AdminSidebarProvider');
  }
  return context;
}
