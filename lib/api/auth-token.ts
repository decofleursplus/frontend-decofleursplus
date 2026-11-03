/**
 * Gestion centralisée du stockage et du cycle de vie des jetons JWT
 */

import { AUTH_TOKEN_KEY, ADMIN_TOKEN_KEY } from './config';

/**
 * Récupère le jeton JWT du client connecté
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem(AUTH_TOKEN_KEY);
    if (local) return local;
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${AUTH_TOKEN_KEY}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
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
    // Poser également un cookie pour les Server Components / Middleware Next.js si besoin
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
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
    const local = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (local) return local;
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${ADMIN_TOKEN_KEY}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
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
    document.cookie = `${ADMIN_TOKEN_KEY}=${token}; path=/admin; max-age=${7 * 24 * 3600}; SameSite=Lax`;
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
    document.cookie = `${ADMIN_TOKEN_KEY}=; path=/admin; max-age=0; SameSite=Lax`;
  } catch (error) {
    console.error('Erreur lors de la suppression du token admin:', error);
  }
}
