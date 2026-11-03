/**
 * Service d'authentification client DécoFleur Plus
 */

import { apiClient } from './client';
import { AuthResponseData, ApiUser } from './types';
import { setAuthToken, removeAuthToken } from './auth-token';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  identifier: string; // Email ou numéro de téléphone
  password: string;
}

/**
 * Inscription d'un nouveau compte client
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/register', {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    password: payload.password,
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Connexion client avec email ou numéro de téléphone
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/login', {
    identifier: payload.identifier.trim(),
    password: payload.password,
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté via son token
 */
export async function getCurrentUser(): Promise<ApiUser> {
  const data = await apiClient.get<{ user: ApiUser }>('/auth/me');
  return data.user;
}

/**
 * Déconnexion de la session client
 */
export function logoutUser(): void {
  removeAuthToken();
}
