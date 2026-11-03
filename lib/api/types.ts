/**
 * Types TypeScript standards pour les réponses et erreurs API DécoFleur Plus
 */

export interface ApiValidationErrorDetail {
  path: string;
  message: string;
}

export interface ApiError {
  message: string;
  code:
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT_ERROR'
    | 'INTERNAL_SERVER_ERROR'
    | string;
  details?: ApiValidationErrorDetail[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Utilisateur authentifié (contrat V1 backend)
 */
export type UserRole =
  | 'CLIENT'
  | 'ADMIN'
  | 'MANAGER'
  | 'FLORIST'
  | 'DELIVERY'
  | 'SALES'
  | 'ACCOUNTANT';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: ApiUser;
  token: string;
}
