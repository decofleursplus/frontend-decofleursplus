/**
 * Notifications in-app du client connecté (/notifications/mine*).
 */
import { apiClient } from './client';
import { NotificationType, NotificationPriority } from './types';

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

export interface CustomerNotificationsPage {
  notifications: CustomerNotification[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  unreadCount: number;
}

export interface NotificationPreferences {
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  loyaltyAlerts: boolean;
  blogNewArticles: boolean;
  subscriptionReminders: boolean;
}

export async function getMyNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
  return apiClient.get<CustomerNotificationsPage>('/notifications/mine', {
    params: { page: params.page ?? 1, limit: params.limit ?? 20, unreadOnly: params.unreadOnly ? 'true' : undefined },
  });
}

export async function getMyUnreadNotificationCount(): Promise<number> {
  return (await apiClient.get<{ unreadCount: number }>('/notifications/mine/unread-count')).unreadCount;
}

export async function markMyNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/mine/${id}/read`);
}

export async function markAllMyNotificationsAsRead(): Promise<number> {
  return (await apiClient.post<{ updatedCount: number }>('/notifications/mine/read-all')).updatedCount;
}

export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>('/notifications/mine/preferences');
}

export async function updateMyNotificationPreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiClient.put<NotificationPreferences>('/notifications/mine/preferences', payload);
}

/** Lien vers l'élément concerné par une notification (commande, devis, abonnement…). */
export function notificationLink(n: Pick<CustomerNotification, 'metadata' | 'type'>): string | null {
  const meta = n.metadata ?? {};
  if (typeof meta.orderNumber === 'string') return `/compte/commandes/${encodeURIComponent(meta.orderNumber)}`;
  if (typeof meta.quoteNumber === 'string') return '/compte/devis';
  if (typeof meta.subscriptionNumber === 'string' || n.type === 'SUBSCRIPTION') return '/compte/abonnements';
  if (n.type === 'LOYALTY') return '/compte/fidelite';
  return null;
}
