'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminSessionUser, getAdminUser } from '@/lib/api/auth-token';
import { getMyAdminAccess } from '@/lib/api/admin/settings';
import { can, type AdminAccess } from '@/lib/admin/access';

/** Événement à émettre après une modification des droits (Paramètres › Rôles & permissions). */
export const ADMIN_ACCESS_CHANGED_EVENT = 'admin-access-changed';
const ACCESS_REFRESH_MS = 60_000;

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
  /** Droits du compte connecté (null tant qu'ils ne sont pas chargés) */
  access: AdminAccess | null;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({
  children,
  initialUser = null,
  initialAccess = null,
}: {
  children: React.ReactNode;
  initialUser?: AdminSessionUser | null;
  /** Droits lus côté serveur au chargement du back-office */
  initialAccess?: AdminAccess | null;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminSessionUser | null>(initialUser ?? null);
  const [access, setAccess] = useState<AdminAccess | null>(initialAccess);

  // Droits à jour : au montage s'ils manquent, après une modification de la matrice,
  // et au retour sur l'onglet (au plus une fois par minute)
  useEffect(() => {
    let active = true;
    let lastLoad = initialAccess ? Date.now() : 0;
    const load = () => {
      lastLoad = Date.now();
      getMyAdminAccess()
        .then((me) => {
          if (!active) return;
          setAccess({ role: me.role, permissions: me.permissions });
          // Rôle changé par un administrateur : le menu et l'en-tête suivent
          setCurrentUser((prev) => (prev && prev.role !== me.role ? { ...prev, role: me.role } : prev));
        })
        .catch(() => {
          // Droits indisponibles : on garde les derniers connus, l'API reste l'arbitre
        });
    };
    if (!initialAccess) load();
    const onFocus = () => {
      if (Date.now() - lastLoad > ACCESS_REFRESH_MS) load();
    };
    window.addEventListener(ADMIN_ACCESS_CHANGED_EVENT, load);
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.removeEventListener(ADMIN_ACCESS_CHANGED_EVENT, load);
      window.removeEventListener('focus', onFocus);
    };
  }, [initialAccess]);

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
        access,
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

/**
 * Le compte connecté peut-il faire cette action ? (droits de Paramètres › Rôles & permissions)
 * Tant que les droits ne sont pas chargés, on laisse faire : l'API reste l'arbitre.
 */
export function useAdminCan() {
  const { access } = useAdminSidebar();
  return (moduleKey: string, action: 'read' | 'write' | 'delete') => !access || can(access, moduleKey, action);
}
