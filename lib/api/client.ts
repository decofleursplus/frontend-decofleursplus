/**
 * Client HTTP universel pour l'API DécoFleur Plus
 */

import { API_BASE_URL } from './config';
import { getAuthToken, getAdminAuthToken } from './auth-token';
import { ApiError, ApiValidationErrorDetail } from './types';

export class ApiClientError extends Error {
  code: string;
  status: number;
  /** Erreurs de validation champ par champ (VALIDATION_ERROR) */
  details?: ApiValidationErrorDetail[];
  /** Contexte renvoyé par certains codes (ex. EMAIL_NOT_VERIFIED, TOO_MANY_REQUESTS) */
  context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    status: number = 500,
    details?: ApiValidationErrorDetail[] | Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    if (Array.isArray(details)) {
      this.details = details;
    } else if (details && typeof details === 'object') {
      this.context = details;
    }
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string;
  isAdmin?: boolean;
  useAdminToken?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

/**
 * Fonction d'exécution d'une requête HTTP vers l'API
 */
export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    params,
    body,
    token,
    isAdmin = false,
    useAdminToken = false,
    cache = 'no-store',
    next,
  } = options;

  const effectiveIsAdmin = isAdmin || useAdminToken;

  // 1. Construire l'URL avec les query params
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // 2. Préparer les en-têtes
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  // Injection automatique du token d'authentification
  const resolvedToken = token ?? (effectiveIsAdmin ? (getAdminAuthToken() || getAuthToken()) : (getAuthToken() || getAdminAuthToken()));
  if (resolvedToken) {
    finalHeaders['Authorization'] = `Bearer ${resolvedToken}`;
  }

  // 3. Préparer le corps de la requête
  let requestBody: BodyInit | undefined = undefined;
  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      requestBody = body;
      // Laisser le navigateur configurer le multipart/form-data boundary
      delete finalHeaders['Content-Type'];
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  // 4. Exécuter l'appel réseau
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: requestBody,
      cache,
      ...(next ? { next } : {}),
    });
  } catch (networkError: unknown) {
    console.error(`[API Network Error] ${method} ${url}:`, networkError);
    throw new ApiClientError(
      'Impossible de contacter le serveur DécoFleur Plus. Veuillez vérifier votre connexion.',
      'NETWORK_ERROR',
      0,
    );
  }

  // 5. Décoder la réponse JSON
  /** Enveloppe standard du backend : { success, data?, error?, message? } */
  let json: { success?: boolean; data?: unknown; error?: ApiError; message?: string };
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiClientError(
        `Erreur serveur (${response.status})`,
        'SERVER_ERROR',
        response.status,
      );
    }
    return {} as T;
  }

  // 6. Gérer l'enveloppe { success: boolean, data?: T, error?: ApiError }
  if (!response.ok || json.success === false) {
    const errorData: ApiError = json.error || {
      message: json.message || 'Une erreur inattendue est survenue.',
      code: 'API_ERROR',
    };

    throw new ApiClientError(
      errorData.message,
      errorData.code,
      response.status,
      errorData.details,
    );
  }

  return json.data as T;
}

/**
 * Interface d'aide pour les verbes HTTP usuels
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body: formData }),
};
