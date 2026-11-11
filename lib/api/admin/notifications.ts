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
): Promise<PaginatedResponse<AdminNotification>> {
  return apiClient.get<PaginatedResponse<AdminNotification>>('/admin/notifications', {
    useAdminToken: true,
    params: {
      page: params?.page,
      limit: params?.limit,
      unreadOnly: params?.unreadOnly,
      type: params?.type,
    },
  });
}

/**
 * Récupère le nombre d'alertes non lues pour l'équipe admin
 */
export async function getAdminUnreadNotificationCount(): Promise<number> {
  const data = await apiClient.get<{ count: number }>('/admin/notifications/unread-count', {
    useAdminToken: true,
  });
  return data?.count ?? 0;
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
