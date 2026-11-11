/**
 * Service API Notifications Espace Client DécoFleur Plus
 */

import { apiClient } from './client';
import { PaginatedResponse, NotificationType, NotificationPriority } from './types';

export interface CustomerNotification {
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

export interface NotificationPreferences {
  id?: string;
  userId?: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  loyaltyAlerts: boolean;
  blogNewArticles: boolean;
  subscriptionReminders: boolean;
  updatedAt?: string;
}

export interface UpdateNotificationPreferencesPayload {
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  emailEnabled?: boolean;
  orderUpdates?: boolean;
  deliveryUpdates?: boolean;
  promotions?: boolean;
  loyaltyAlerts?: boolean;
  blogNewArticles?: boolean;
  subscriptionReminders?: boolean;
}

export interface ListCustomerNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

/**
 * Récupère les notifications du client connecté (avec pagination et filtres)
 */
export async function getMyNotifications(
  params?: ListCustomerNotificationsParams,
): Promise<PaginatedResponse<CustomerNotification>> {
  return apiClient.get<PaginatedResponse<CustomerNotification>>('/notifications/mine', {
    params: {
      page: params?.page,
      limit: params?.limit,
      unreadOnly: params?.unreadOnly,
      type: params?.type,
    },
  });
}

/**
 * Récupère le nombre de notifications non lues du client
 */
export async function getMyUnreadNotificationCount(): Promise<number> {
  const data = await apiClient.get<{ count: number }>('/notifications/mine/unread-count');
  return data?.count ?? 0;
}

/**
 * Marque une notification client spécifique comme lue
 */
export async function markMyNotificationAsRead(id: string): Promise<CustomerNotification> {
  return apiClient.patch<CustomerNotification>(`/notifications/mine/${id}/read`);
}

/**
 * Marque toutes les notifications du client comme lues
 */
export async function markAllMyNotificationsAsRead(): Promise<{ message: string; count?: number }> {
  return apiClient.post<{ message: string; count?: number }>('/notifications/mine/read-all');
}

/**
 * Récupère les préférences de notification du client
 */
export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>('/notifications/mine/preferences');
}

/**
 * Met à jour les préférences de notification du client
 */
export async function updateMyNotificationPreferences(
  payload: UpdateNotificationPreferencesPayload,
): Promise<NotificationPreferences> {
  return apiClient.put<NotificationPreferences>('/notifications/mine/preferences', payload);
}
