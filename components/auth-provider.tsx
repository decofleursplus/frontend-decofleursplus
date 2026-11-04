'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCurrentUser,
  logoutUser as apiLogoutUser,
} from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/auth-token';
import { ApiUser } from '@/lib/api/types';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  createdAt?: string;
  role?: string;
};

export const DEFAULT_USER: User = {
  id: 'user-fatou',
  name: 'Fatou Ba',
  email: 'fatou.ba@email.com',
  phone: '+221 77 123 45 67',
  provider: 'email',
};

export const DEMO_USERS: User[] = [
  DEFAULT_USER,
  {
    id: 'user-sally',
    name: 'Sally Diop',
    email: 'sally.diop@email.com',
    phone: '+221 77 941 78 60',
    provider: 'email',
  },
];

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (
    data: { name: string; email: string; phone: string; password?: string },
    autoLogin?: boolean,
  ) => Promise<User>;
  loginUser: (userToLogin: User) => void;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
  resetToDefault: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'decofleur_user_session';

function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || 'Client',
    email: apiUser.email,
    phone: apiUser.phone,
    avatar: apiUser.avatar,
    provider: apiUser.provider || 'email',
    createdAt: apiUser.createdAt,
    role: apiUser.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronisation initiale : vérifier le token JWT existant
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Tenter de charger le profil en cache pour un rendu rapide
      try {
        const cached = localStorage.getItem(USER_SESSION_KEY);
        if (cached && isMounted) {
          setUser(JSON.parse(cached));
        }
      } catch {
        // Ignorer l'erreur de cache
      }

      // Valider le token auprès du serveur backend
      try {
        const apiUser = await getCurrentUser();
        if (isMounted && apiUser) {
          const freshUser = mapApiUserToUser(apiUser);
          setUser(freshUser);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(freshUser));
        }
      } catch (error) {
        console.warn('[Auth] Token invalide ou expiré, réinitialisation de la session');
        if (isMounted) {
          apiLogoutUser();
          localStorage.removeItem(USER_SESSION_KEY);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password = ''): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await apiLoginUser({
        identifier,
        password,
      });

      const loggedUser = mapApiUserToUser(authData.user);
      setUser(loggedUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      data: { name: string; email: string; phone: string; password?: string },
      autoLogin = true,
    ): Promise<User> => {
      setIsLoading(true);
      try {
        const authData = await apiRegisterUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password || 'Pass1234!',
        });

        const newUser = mapApiUserToUser(authData.user);
        if (autoLogin) {
          setUser(newUser);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
        }
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    // V1 : Non supporté côté serveur, message informatif
    throw new Error('La connexion avec Google sera bientôt disponible.');
  }, []);

  const loginUser = useCallback((userToLogin: User) => {
    setUser(userToLogin);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userToLogin));
    } catch {
      // Ignorer
    }
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedData };
      try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextUser));
      } catch {
        // Ignorer
      }
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    apiLogoutUser();
    setUser(null);
    try {
      localStorage.removeItem(USER_SESSION_KEY);
    } catch {
      // Ignorer
    }
  }, []);

  const resetToDefault = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        loginUser,
        updateUser,
        logout,
        resetToDefault,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
