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

export interface GoogleAuthPayload {
  credential?: string;
  idToken?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
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
 * Connexion / Inscription client via Google OAuth
 */
export async function loginWithGoogle(payload: GoogleAuthPayload): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/google', payload);

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Demande de réinitialisation de mot de passe par email
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/forgot-password', {
    email: payload.email.trim().toLowerCase(),
  });
}

/**
 * Réinitialisation effective du mot de passe avec le token reçu
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/reset-password', {
    token: payload.token.trim(),
    newPassword: payload.newPassword,
  });
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
