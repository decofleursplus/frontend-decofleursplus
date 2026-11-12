'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  verifyEmail as apiVerifyEmail,
  loginWithGoogle as apiLoginWithGoogle,
  verifyLoginCode as apiVerifyLoginCode,
  getCurrentUser,
  logoutUser as apiLogoutUser,
} from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/auth-token';
import { ApiUser, PendingVerificationData } from '@/lib/api/types';

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

type RegisterData = { name: string; email: string; phone: string; password: string; referralCode?: string };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Lève une ApiClientError `EMAIL_NOT_VERIFIED` si le compte attend encore son code */
  login: (identifier: string, password: string, remember?: boolean) => Promise<User>;
  /** `credential` = jeton d'identité renvoyé par Google Identity Services */
  loginWithGoogle: (credential: string, referralCode?: string) => Promise<User>;
  /** Connexion sans mot de passe : valide le code reçu par email et ouvre la session */
  loginWithCode: (identifier: string, code: string, remember?: boolean) => Promise<User>;
  /** Étape 1 : crée le compte et envoie le code par email (aucune session ouverte) */
  register: (data: RegisterData) => Promise<PendingVerificationData>;
  /** Étape 2 : valide le code et ouvre la session */
  verifyEmail: (email: string, code: string) => Promise<User>;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'decofleur_user_session';

function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || 'Client',
    email: apiUser.email,
    phone: apiUser.phone,
    avatar: apiUser.avatar || undefined,
    provider: apiUser.provider || 'email',
    createdAt: apiUser.createdAt,
    role: apiUser.role,
  };
}

function persistSession(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : la session reste en mémoire
  }
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

      // Profil en cache pour un premier rendu immédiat
      try {
        const cached = localStorage.getItem(USER_SESSION_KEY);
        if (cached && isMounted) {
          setUser(JSON.parse(cached));
        }
      } catch {
        // Cache illisible : on attend la réponse du serveur
      }

      // Valider le token auprès du serveur
      try {
        const freshUser = mapApiUserToUser(await getCurrentUser());
        if (isMounted) {
          setUser(freshUser);
          persistSession(freshUser);
        }
      } catch {
        // Token invalide ou expiré : la session est fermée
        if (isMounted) {
          apiLogoutUser();
          persistSession(null);
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

  const openSession = useCallback((apiUser: ApiUser): User => {
    const sessionUser = mapApiUserToUser(apiUser);
    setUser(sessionUser);
    persistSession(sessionUser);
    return sessionUser;
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, remember = true): Promise<User> => {
      const authData = await apiLoginUser({ identifier, password, remember });
      return openSession(authData.user);
    },
    [openSession],
  );

  const register = useCallback((data: RegisterData) => apiRegisterUser(data), []);

  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<User> => {
      const authData = await apiVerifyEmail(email, code);
      return openSession(authData.user);
    },
    [openSession],
  );

  const loginWithCode = useCallback(
    async (identifier: string, code: string, remember = true): Promise<User> => {
      const authData = await apiVerifyLoginCode(identifier, code, remember);
      return openSession(authData.user);
    },
    [openSession]
  );

  const loginWithGoogle = useCallback(
    async (credential: string, referralCode?: string): Promise<User> => {
      const authData = await apiLoginWithGoogle(credential, referralCode);
      return openSession(authData.user);
    },
    [openSession],
  );

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedData };
      persistSession(nextUser);
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    apiLogoutUser();
    setUser(null);
    persistSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithCode,
        register,
        verifyEmail,
        updateUser,
        logout,
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
