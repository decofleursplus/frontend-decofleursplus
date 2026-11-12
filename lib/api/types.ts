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
  details?: ApiValidationErrorDetail[] | Record<string, unknown>;
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
  avatar?: string | null;
  provider?: 'email' | 'google' | 'facebook';
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: ApiUser;
  token: string;
}

/** Réponse d'une inscription ou d'un renvoi de code : le compte attend sa validation par code OTP */
export interface PendingVerificationData {
  requiresVerification: true;
  email: string;
  expiresInMinutes: number;
  resendAvailableInSeconds: number;
}

/**
 * Types Notifications In-App & Alertes
 */
export type NotificationType =
  | 'ORDER_STATUS'
  | 'DELIVERY_UPDATE'
  | 'QUOTE_UPDATE'
  | 'PAYMENT'
  | 'SUBSCRIPTION'
  | 'PROMOTION'
  | 'LOYALTY'
  | 'BLOG'
  | 'CUSTOM'
  | 'NEW_ORDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'NEW_QUOTE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'NEW_SUBSCRIPTION'
  | 'SUBSCRIPTION_CANCELLED'
  | 'DELIVERY_FAILED';

export type NotificationPriority = 'NORMAL' | 'HIGH' | 'URGENT';
export type BroadcastTarget = 'ALL' | 'SEGMENT' | 'INDIVIDUAL';
export type BroadcastStatus = 'SENT' | 'SCHEDULED' | 'FAILED';

