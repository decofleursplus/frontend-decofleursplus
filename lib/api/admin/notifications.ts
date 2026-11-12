/**
 * Service API Notifications & Diffusions Broadcast Admin DécoFleur Plus
 */

import { apiClient } from '../client';
import {
  PaginatedResponse,
  NotificationType,
  NotificationPriority,
  BroadcastTarget,
  BroadcastStatus,
} from '../types';

export interface AdminNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetType: BroadcastTarget;
  targetSegment?: string | null;
  targetCustomers: string[];
  channels: string[];
  status: BroadcastStatus;
  totalSent: number;
  createdAt: string;
  scheduledAt?: string | null;
}

export interface SendBroadcastPayload {
  title: string;
  message: string;
  target: {
    type: BroadcastTarget;
    segment?: string;
    customerIds?: string[];
  };
  channels?: string[];
  scheduledAt?: string | null;
}

export interface ListAdminNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

/**
 * Récupère les notifications et alertes internes pour le staff/admin
 */
export async function getAdminNotifications(
  params?: ListAdminNotificationsParams,
): Promise<{ notifications: AdminNotification[]; unreadCount: number; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  return apiClient.get('/admin/notifications', {
    useAdminToken: true,
    cache: 'no-store',
    params: {
      page: params?.page,
      limit: params?.limit,
      unreadOnly: params?.unreadOnly,
      type: params?.type,
    },
  });
}

/**
 * Nombre d'alertes non lues du membre de l'équipe connecté
 */
export async function getAdminUnreadNotificationCount(): Promise<number> {
  const data = await apiClient.get<{ unreadCount: number }>('/admin/notifications/unread-count', {
    useAdminToken: true,
    cache: 'no-store',
  });
  return data.unreadCount;
}

/** Page du back-office liée à une alerte (lien explicite, sinon déduit du type). */
export function adminNotificationLink(n: Pick<AdminNotification, 'type' | 'metadata'>): string {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  if (typeof meta.link === 'string' && meta.link.startsWith('/admin')) return meta.link;
  if (typeof meta.orderId === 'string') return `/admin/commandes/${meta.orderId}`;
  switch (n.type) {
    case 'NEW_ORDER':
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_FAILED':
    case 'ORDER_STATUS':
    case 'PAYMENT':
      return '/admin/commandes';
    case 'NEW_QUOTE':
    case 'QUOTE_UPDATE':
      return '/admin/devis';
    case 'LOW_STOCK':
    case 'OUT_OF_STOCK':
      return '/admin/stock';
    case 'DELIVERY_UPDATE':
    case 'DELIVERY_FAILED':
      return '/admin/livraisons';
    case 'NEW_SUBSCRIPTION':
    case 'SUBSCRIPTION_CANCELLED':
    case 'SUBSCRIPTION':
      return '/admin/abonnements';
    default:
      return '/admin/tableau-de-bord';
  }
}

/**
 * Marque une notification admin spécifique comme lue
 */
export async function markAdminNotificationAsRead(id: string): Promise<AdminNotification> {
  return apiClient.patch<AdminNotification>(`/admin/notifications/${id}/read`, undefined, {
    useAdminToken: true,
  });
}

/**
 * Marque toutes les notifications admin comme lues
 */
export async function markAllAdminNotificationsAsRead(): Promise<{ message: string; count?: number }> {
  return apiClient.post<{ message: string; count?: number }>(
    '/admin/notifications/read-all',
    undefined,
    { useAdminToken: true },
  );
}

/**
 * Diffuse une notification broadcast manuelle (tous les utilisateurs, un segment ou une liste d'utilisateurs)
 */
export async function sendBroadcastNotification(
  payload: SendBroadcastPayload,
): Promise<NotificationBroadcast> {
  return apiClient.post<NotificationBroadcast>('/admin/notifications/send', payload, {
    useAdminToken: true,
  });
}

/**
 * Consulte l'historique des diffusions broadcasts
 */
export async function getNotificationBroadcasts(options?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<NotificationBroadcast>> {
  return apiClient.get<PaginatedResponse<NotificationBroadcast>>('/admin/notifications/broadcasts', {
    useAdminToken: true,
    params: options,
  });
}
