'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Bell, CheckCheck, Inbox, Loader2 } from 'lucide-react';
import {
  getMyNotificationPreferences,
  getMyNotifications,
  markAllMyNotificationsAsRead,
  markMyNotificationAsRead,
  notificationLink,
  updateMyNotificationPreferences,
  type CustomerNotification,
  type NotificationPreferences,
} from '@/lib/api/notifications';
import { ErrorState, LoadingState, Notice, SectionHeader, errorText, formatDate, useResource } from './shared';

const PAGE_SIZE = 20;

/** Préférences réellement prises en compte par le serveur (email + catégories). */
const PREFERENCE_ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'emailEnabled', label: 'Recevoir aussi par email', desc: 'Suivi de livraison (en route, livrée) envoyé à votre adresse email.' },
  { key: 'orderUpdates', label: 'Suivi de mes commandes', desc: 'Confirmation, préparation, paiement, annulation.' },
  { key: 'deliveryUpdates', label: 'Suivi de mes livraisons', desc: 'Livreur en route, livraison effectuée ou échouée.' },
];

export function NotificationsSection() {
  const [page, setPage] = useState(1);
  const load = useCallback(() => getMyNotifications({ page: 1, limit: PAGE_SIZE }), []);
  const { data, setData, error, loading, reload } = useResource(load);
  const prefsResource = useResource(getMyNotificationPreferences);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [savingPref, setSavingPref] = useState<string | null>(null);

  const notifications = data?.notifications ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  async function loadMore() {
    setBusy(true);
    try {
      const next = await getMyNotifications({ page: page + 1, limit: PAGE_SIZE });
      setData((prev) => (prev ? { ...next, notifications: [...prev.notifications, ...next.notifications] } : next));
      setPage(page + 1);
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Chargement impossible.') });
    } finally {
      setBusy(false);
    }
  }

  async function markRead(n: CustomerNotification) {
    if (n.isRead) return;
    try {
      await markMyNotificationAsRead(n.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              unreadCount: Math.max(0, prev.unreadCount - 1),
              notifications: prev.notifications.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
            }
          : prev,
      );
      window.dispatchEvent(new Event('client-notifications-updated'));
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Action impossible.') });
    }
  }

  async function markAll() {
    setBusy(true);
    setMessage(null);
    try {
      await markAllMyNotificationsAsRead();
      setData((prev) => (prev ? { ...prev, unreadCount: 0, notifications: prev.notifications.map((x) => ({ ...x, isRead: true })) } : prev));
      window.dispatchEvent(new Event('client-notifications-updated'));
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Action impossible.') });
    } finally {
      setBusy(false);
    }
  }

  async function togglePref(key: keyof NotificationPreferences, value: boolean) {
    setSavingPref(key);
    setMessage(null);
    try {
      const updated = await updateMyNotificationPreferences({ [key]: value });
      prefsResource.setData(updated);
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Préférence non enregistrée.') });
    } finally {
      setSavingPref(null);
    }
  }

  return (
    <>
      <section className="account-panel">
        <SectionHeader
          title="Mes notifications"
          description="Le suivi de vos commandes, livraisons, devis et abonnements."
          action={
            (data?.unreadCount ?? 0) > 0 ? (
              <button type="button" className="button button-outline button-small" onClick={markAll} disabled={busy}>
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>
            ) : undefined
          }
        />
        {message && <Notice kind={message.kind}>{message.text}</Notice>}
        {loading ? (
          <LoadingState label="Chargement de vos notifications…" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">
            <Inbox className="mx-auto mb-2 text-neutral-300" size={36} />
            Aucune notification pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {notifications.map((n) => {
              const href = notificationLink(n);
              const body = (
                <>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-[var(--pink)]'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.isRead ? 'text-neutral-700' : 'font-semibold text-neutral-900'}`}>{n.title}</span>
                    <span className="block text-xs text-neutral-600 mt-0.5">{n.message}</span>
                    <span className="block text-[11px] text-neutral-400 mt-1">{formatDate(n.createdAt, true)}</span>
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {href ? (
                    <Link href={href} onClick={() => markRead(n)} className="flex items-start gap-3 py-3 hover:bg-neutral-50 rounded-lg px-2">
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => markRead(n)} className="flex w-full items-start gap-3 py-3 text-left hover:bg-neutral-50 rounded-lg px-2">
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {page < totalPages && (
          <button type="button" onClick={loadMore} disabled={busy} className="button button-outline button-small mt-3">
            {busy && <Loader2 size={14} className="animate-spin" />} Voir plus
          </button>
        )}
      </section>

      <section className="account-panel">
        <h2 className="flex items-center gap-2">
          <Bell size={16} /> Mes préférences
        </h2>
        {prefsResource.loading ? (
          <LoadingState label="Chargement…" />
        ) : prefsResource.error ? (
          <ErrorState message={prefsResource.error} onRetry={prefsResource.reload} />
        ) : (
          <div className="grid gap-2">
            {PREFERENCE_ITEMS.map((item) => (
              <label key={item.key} className="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 p-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-neutral-500">{item.desc}</span>
                </span>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={Boolean(prefsResource.data?.[item.key])}
                  disabled={savingPref === item.key}
                  onChange={(e) => togglePref(item.key, e.target.checked)}
                />
              </label>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
