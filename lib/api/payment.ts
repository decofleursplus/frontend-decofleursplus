import { apiClient } from './client';

export type PaymentProvider = 'NABOOPAY' | 'CASH';

export type PaymentMethod =
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'FREE_MONEY'
  | 'CARD'
  | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string | null;
  checkoutUrl: string | null;
  rawResponse?: Record<string, unknown> | null;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSessionResponse {
  checkoutUrl: string | null;
  transactionRef: string | null;
}

/**
 * Initialise ou relance le paiement en ligne d'une commande en attente.
 * Endpoint: POST /api/v1/orders/mine/:orderNumber/pay
 */
export async function payOrder(orderNumber: string): Promise<PaymentSessionResponse> {
  return apiClient.post<PaymentSessionResponse>(`/orders/mine/${encodeURIComponent(orderNumber)}/pay`);
}

/**
 * Historique des tentatives de paiement d'une commande.
 * Endpoint: GET /api/v1/orders/mine/:orderNumber/payments
 */
export async function getOrderPayments(orderNumber: string): Promise<Payment[]> {
  return apiClient.get<Payment[]>(`/orders/mine/${encodeURIComponent(orderNumber)}/payments`);
}
