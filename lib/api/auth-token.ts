/**
 * Gestion centralisée du stockage et du cycle de vie des jetons JWT
 */

import { AUTH_TOKEN_KEY, ADMIN_TOKEN_KEY } from './config';

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

/**
 * Récupère le jeton JWT du client connecté
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${AUTH_TOKEN_KEY}=([^;]+)`));
    if (match) {
      const cookieToken = decodeURIComponent(match[2]);
      if (cookieToken) return cookieToken;
    }
    const local = localStorage.getItem(AUTH_TOKEN_KEY);
    if (local) return local;
    return null;
  } catch {
    return null;
  }
}

/**
 * Enregistre le jeton JWT client
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
  } catch (error) {
    console.error('Erreur lors du stockage du token client:', error);
  }
}

/**
 * Supprime le jeton JWT client (déconnexion)
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch (error) {
    console.error('Erreur lors de la suppression du token client:', error);
  }
}

/**
 * Récupère le jeton JWT administrateur / staff
 */
export function getAdminAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${ADMIN_TOKEN_KEY}=([^;]+)`));
    if (match) {
      const cookieToken = decodeURIComponent(match[2]);
      if (cookieToken) return cookieToken;
    }
    const local = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (local) return local;
    return null;
  } catch {
    return null;
  }
}

/**
 * Enregistre le jeton JWT administrateur / staff
 */
export function setAdminAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    document.cookie = `${ADMIN_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
  } catch (error) {
    console.error('Erreur lors du stockage du token admin:', error);
  }
}

/**
 * Supprime le jeton JWT administrateur / staff
 */
export function removeAdminAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin_user');
    document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `admin_auth=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `admin_user=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('admin-user-updated', { detail: null }));
  } catch (error) {
    console.error('Erreur lors de la suppression du token admin:', error);
  }
}

/**
 * Enregistre ou met à jour le profil de l'administrateur connecté dans localStorage et cookie
 * et notifie l'application via l'événement 'admin-user-updated'
 */
export function setAdminUser(user: AdminSessionUser): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: AdminSessionUser = {
      ...user,
      avatar: user.avatar || null,
    };
    const serialized = JSON.stringify(payload);
    localStorage.setItem('admin_user', serialized);
    document.cookie = `admin_user=${encodeURIComponent(serialized)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('admin-user-updated', { detail: payload }));
  } catch (error) {
    console.error('Erreur lors du stockage des informations utilisateur admin:', error);
  }
}

/**
 * Récupère le profil de l'administrateur connecté depuis les cookies / session
 */
export function getAdminUser(): AdminSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie.match(/(^|;\s*)admin_user=([^;]+)/);
    if (match) {
      const parsed = JSON.parse(decodeURIComponent(match[2]));
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
        avatar: parsed.avatar || null,
      };
    }
    const local = localStorage.getItem('admin_user');
    if (local) {
      const parsed = JSON.parse(local);
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
        avatar: parsed.avatar || null,
      };
    }
    return null;
  } catch {
    return null;
  }
}
