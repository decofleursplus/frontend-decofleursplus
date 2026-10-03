'use client';

import React, { createContext, useContext, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  provider: 'google' | 'email';
};

export const DEFAULT_USER: User = {
  id: 'user-fatou',
  name: 'Fatou Ba',
  email: 'fatou.ba@email.com',
  phone: '+221 77 123 45 67',
  provider: 'email',
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password?: string }) => Promise<boolean>;
  logout: () => void;
  resetToDefault: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'decofleur_auth_session';

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
    // Default initial user
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const isLoading = false;

  async function login(email: string): Promise<boolean> {
    const cleanEmail = email.trim();
    const displayName = cleanEmail.includes('@')
      ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : cleanEmail;

    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.toLowerCase() === DEFAULT_USER.email ? DEFAULT_USER.name : displayName,
      email: cleanEmail,
      phone: cleanEmail.toLowerCase() === DEFAULT_USER.email ? DEFAULT_USER.phone : '+221 77 800 12 34',
      provider: 'email',
    };

    setUser(loggedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    } catch {
      // ignore
    }
    return true;
  }

  async function loginWithGoogle(): Promise<boolean> {
    const googleUser: User = {
      id: `g_${Date.now()}`,
      name: 'Fatou Ba',
      email: 'fatou.ba@gmail.com',
      phone: '+221 77 123 45 67',
      provider: 'google',
    };

    setUser(googleUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
    } catch {
      // ignore
    }
    return true;
  }

  async function register(data: { name: string; email: string; phone: string }): Promise<boolean> {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      provider: 'email',
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return true;
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
        register,
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
