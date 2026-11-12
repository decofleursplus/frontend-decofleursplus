/**
 * Service d'authentification client DécoFleur Plus
 *
 * Inscription en deux temps : `registerUser` envoie un code à 6 chiffres par email,
 * puis `verifyEmail` active le compte et ouvre la session.
 */

import { apiClient } from './client';
import { AuthResponseData, ApiUser, PendingVerificationData } from './types';
import { setAuthToken, removeAuthToken } from './auth-token';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Code de parrainage (lien /parrain/CODE) : bon de bienvenue à l'activation du compte */
  referralCode?: string;
}

export interface LoginPayload {
  identifier: string; // Email ou numéro de téléphone
  password: string;
  /** false : la session se termine à la fermeture du navigateur */
  remember?: boolean;
}

export interface ResetPasswordPayload {
  /** Email ou numéro de téléphone saisi lors de la demande */
  identifier: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordResult {
  message: string;
  expiresInMinutes: number;
  resendAvailableInSeconds: number;
}

/** Longueur minimale imposée par le backend */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Étape 1 de l'inscription : crée le compte (non vérifié) et envoie le code par email.
 * Aucune session n'est ouverte à ce stade.
 */
export async function registerUser(payload: RegisterPayload): Promise<PendingVerificationData> {
  return apiClient.post<PendingVerificationData>('/auth/register', {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    password: payload.password,
    ...(payload.referralCode?.trim() ? { referralCode: payload.referralCode.trim().toUpperCase() } : {}),
  });
}

/**
 * Étape 2 de l'inscription : valide le code reçu par email et ouvre la session.
 */
export async function verifyEmail(email: string, code: string): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/verify-email', {
    email: email.trim().toLowerCase(),
    code: code.trim(),
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Renvoie un nouveau code de vérification (limité à une demande par minute).
 */
export async function resendVerificationCode(email: string): Promise<PendingVerificationData> {
  return apiClient.post<PendingVerificationData>('/auth/resend-verification', {
    email: email.trim().toLowerCase(),
  });
}

/**
 * Connexion client avec email ou numéro de téléphone.
 * Lève une ApiClientError de code `EMAIL_NOT_VERIFIED` si le compte attend encore son code.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/login', {
    identifier: payload.identifier.trim(),
    password: payload.password,
  });

  if (data?.token) {
    setAuthToken(data.token, { persistent: payload.remember !== false });
  }

  return data;
}

/**
 * Connexion / inscription via Google : `credential` est le jeton d'identité
 * renvoyé par Google Identity Services, vérifié côté serveur.
 */
export async function loginWithGoogle(credential: string, referralCode?: string): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/google', {
    credential,
    // Pris en compte uniquement à la création du compte
    ...(referralCode?.trim() ? { referralCode: referralCode.trim().toUpperCase() } : {}),
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Connexion sans mot de passe — étape 1 : envoie un code à 6 chiffres sur l'email du compte
 * (identifié par email ou téléphone). Réponse identique que le compte existe ou non.
 */
export async function requestLoginCode(identifier: string): Promise<ForgotPasswordResult> {
  return apiClient.post<ForgotPasswordResult>('/auth/login-code/request', {
    identifier: identifier.trim(),
  });
}

/**
 * Connexion sans mot de passe — étape 2 : échange le code contre une session.
 */
export async function verifyLoginCode(identifier: string, code: string, remember = true): Promise<AuthResponseData> {
  const data = await apiClient.post<AuthResponseData>('/auth/login-code/verify', {
    identifier: identifier.trim(),
    code: code.trim(),
  });
  if (data?.token) {
    setAuthToken(data.token, { persistent: remember });
  }
  return data;
}

/**
 * Mot de passe oublié : envoie un code à 6 chiffres sur l'email du compte
 * (identifié par email ou numéro de téléphone).
 */
export async function forgotPassword(identifier: string): Promise<ForgotPasswordResult> {
  return apiClient.post<ForgotPasswordResult>('/auth/forgot-password', {
    identifier: identifier.trim(),
  });
}

/**
 * Définit un nouveau mot de passe à l'aide du code reçu par email.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/reset-password', {
    identifier: payload.identifier.trim(),
    code: payload.code.trim(),
    newPassword: payload.newPassword,
  });
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté via son token
 */
export async function getCurrentUser(): Promise<ApiUser> {
  return apiClient.get<ApiUser>('/auth/me');
}

/**
 * Déconnexion de la session client
 */
export function logoutUser(): void {
  removeAuthToken();
}
