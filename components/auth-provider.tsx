'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  createdAt?: string;
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
  loginWithFacebook: () => Promise<User>;
  register: (
    data: { name: string; email: string; phone: string; password?: string },
    autoLogin?: boolean,
  ) => Promise<User>;
  loginUser: (userToLogin: User) => void;
  logout: () => void;
  resetToDefault: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'decofleur_auth_session';
const REGISTERED_USERS_KEY = 'decofleur_registered_users';

function normalizePhone(val: string): string {
  return val.replace(/[\s\-\.\(\)]/g, '').toLowerCase();
}

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEMO_USERS;
}

function getInitialUser(): User | null {
  if (typeof window === 'undefined') {
    return DEFAULT_USER;
  }
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === 'guest') {
      return null;
    }
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const isLoading = false;

  useEffect(() => {
    // ensure registered users initialized in storage
    try {
      if (!localStorage.getItem(REGISTERED_USERS_KEY)) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEMO_USERS));
      }
    } catch {
      // ignore
    }
  }, []);

  async function login(identifier: string): Promise<User> {
    const cleanId = identifier.trim();
    const storedUsers = getStoredUsers();

    // Check if match by email or phone
    const normalizedInput = normalizePhone(cleanId);
    const existing = storedUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanId.toLowerCase() ||
        normalizePhone(u.phone) === normalizedInput,
    );

    let loggedUser: User;
    if (existing) {
      loggedUser = existing;
    } else {
      const isEmail = cleanId.includes('@');
      const displayName = isEmail
        ? cleanId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : `Client ${cleanId.slice(-4) || 'Décofleur'}`;

      loggedUser = {
        id: `usr_${Date.now()}`,
        name: displayName,
        email: isEmail ? cleanId : `${cleanId.replace(/[^0-9]/g, '')}@client-decofleur.sn`,
        phone: isEmail ? '+221 77 800 12 34' : cleanId,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };

      // save to registered list
      try {
        const nextUsers = [...storedUsers, loggedUser];
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
      } catch {
        // ignore
      }
    }

    setUser(loggedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    } catch {
      // ignore
    }
    return loggedUser;
  }

  async function loginWithGoogle(): Promise<User> {
    const googleUser: User = {
      id: `g_${Date.now()}`,
      name: 'Fatou Ba',
      email: 'fatou.ba@gmail.com',
      phone: '+221 77 123 45 67',
      provider: 'google',
      avatar: '/images/hero.webp',
      createdAt: new Date().toISOString(),
    };

    setUser(googleUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
    } catch {
      // ignore
    }
    return googleUser;
  }

  async function loginWithFacebook(): Promise<User> {
    const fbUser: User = {
      id: `fb_${Date.now()}`,
      name: 'Sally Diop',
      email: 'sally.diop@facebook.com',
      phone: '+221 77 941 78 60',
      provider: 'facebook',
      createdAt: new Date().toISOString(),
    };

    setUser(fbUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fbUser));
    } catch {
      // ignore
    }
    return fbUser;
  }

  async function register(
    data: { name: string; email: string; phone: string },
    autoLogin = false,
  ): Promise<User> {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    // Save to users list
    try {
      const current = getStoredUsers();
      const updated = [newUser, ...current.filter((u) => u.email !== newUser.email)];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (autoLogin) {
      setUser(newUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } catch {
        // ignore
      }
    }

    return newUser;
  }

  function loginUser(userToLogin: User) {
    setUser(userToLogin);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToLogin));
    } catch {
      // ignore
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'guest');
    } catch {
      // ignore
    }
  }

  function resetToDefault() {
    setUser(DEFAULT_USER);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        loginUser,
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
