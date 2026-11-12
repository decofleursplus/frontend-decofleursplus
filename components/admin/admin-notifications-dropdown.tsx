'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  adminNotificationLink,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  type AdminNotification,
} from '@/lib/api/admin/notifications';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const REFRESH_MS = 60_000;

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

/** Cloche du back-office : alertes réelles du membre connecté (actualisées chaque minute). */
export function AdminNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(
    () =>
      getAdminNotifications({ limit: 10 })
        .then((res) => {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
          setLoadError(false);
        })
        .catch(() => setLoadError(true)),
    [],
  );

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();
      await refresh();
    } catch {
      setLoadError(true);
    }
  };

  const markOneAsRead = (notif: AdminNotification) => {
    setIsOpen(false);
    if (notif.isRead) return;
    markAdminNotificationAsRead(notif.id)
      .then(() => refresh())
      .catch(() => setLoadError(true));
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingBag size={15} className="text-emerald-700" />;
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
      case 'DELIVERY_FAILED':
      case 'PAYMENT_FAILED':
        return <AlertTriangle size={15} className="text-amber-700" />;
      case 'NEW_QUOTE':
        return <FileText size={15} className="text-purple-700" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard size={15} className="text-blue-700" />;
      case 'DELIVERY_UPDATE':
        return <Truck size={15} className="text-indigo-700" />;
      case 'QUOTE_UPDATE':
        return <FileText size={15} className="text-purple-700" />;
      default:
        return <Sparkles size={15} className="text-neutral-700" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="admin-topbar-icon-btn relative hover:bg-neutral-100 transition-colors"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9.5px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="admin-notif-dot opacity-30" />
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-neutral-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-stone-50 to-white border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900">Notifications de l’Atelier</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                  {unreadCount} non-lues
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <CheckCheck size={13} />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100/80">
            {loadError && (
              <div role="alert" className="p-3 text-center text-[11px] text-red-700">
                Notifications momentanément indisponibles.
              </div>
            )}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={adminNotificationLink(notif)}
                  onClick={() => markOneAsRead(notif)}
                  className={`block p-3.5 px-4 hover:bg-neutral-50/90 transition-colors text-left ${
                    !notif.isRead ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-bold text-neutral-900 truncate">
                          {notif.title}
                        </strong>
                        <span className="text-[10px] text-neutral-400 shrink-0">{timeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-[11.5px] text-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 pt-1">
                        <span className="text-[10px] text-emerald-800 font-semibold inline-flex items-center gap-1">
                          <span>Voir la fiche</span>
                          <ExternalLink size={10} />
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-neutral-50/70 border-t border-neutral-100 text-center">
            <span className="text-[11px] text-neutral-500">Les 10 alertes les plus récentes</span>
          </div>
        </div>
      )}
    </div>
  );
}

