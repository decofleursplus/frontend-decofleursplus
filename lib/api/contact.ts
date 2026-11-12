import { apiClient } from './client';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Formulaire de contact : message enregistré et transmis à l'équipe (POST /contact). */
export async function sendContactMessage(payload: ContactMessagePayload): Promise<{ id: string; createdAt: string }> {
  return apiClient.post('/contact', payload);
}

/** Inscription à la lettre d'information (idempotente). */
export async function subscribeToNewsletter(email: string, source = 'footer'): Promise<{ email: string; alreadySubscribed: boolean }> {
  return apiClient.post('/newsletter/subscribe', { email, source });
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  await apiClient.post('/newsletter/unsubscribe', { email });
}

// ---------- Back-office ----------

export type ContactMessageStatus = 'NEW' | 'READ' | 'ARCHIVED';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  userId: string | null;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: string;
  unsubscribedAt: string | null;
}

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

export async function getContactMessages(params: { status?: ContactMessageStatus; search?: string; page?: number }) {
  return apiClient.get<{ items: ContactMessage[]; total: number; totalPages: number; counts: Record<'all' | ContactMessageStatus, number> }>(
    '/admin/contact-messages',
    { ...admin, params: { status: params.status, search: params.search || undefined, page: params.page ?? 1, limit: 30 } },
  );
}

export async function setContactMessageStatus(id: string, status: ContactMessageStatus): Promise<ContactMessage> {
  return apiClient.patch<ContactMessage>(`/admin/contact-messages/${id}`, { status }, admin);
}

export async function getNewsletterSubscribers(params: { search?: string; active?: boolean; page?: number; limit?: number }) {
  return apiClient.get<{ items: NewsletterSubscriber[]; total: number; totalPages: number; activeCount: number }>('/admin/newsletter/subscribers', {
    ...admin,
    params: {
      search: params.search || undefined,
      active: params.active === undefined ? undefined : String(params.active),
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    },
  });
}
