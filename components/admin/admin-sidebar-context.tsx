'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // LocalStorage non disponible ou bloqué
    }
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

  return (
    <AdminSidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
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
