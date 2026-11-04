'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export type AdminNotification = {
  id: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'NEW_QUOTE' | 'PAYMENT_RECEIVED' | 'DELIVERY_UPDATE';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  link: string;
  time: string;
};

const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    type: 'NEW_ORDER',
    title: 'Nouvelle commande CMD-2026-0048',
    message: 'Bouquet 50 Roses Rouges (45 000 FCFA) — Client: Aïda Fall (Dakar Almadies)',
    isRead: false,
    priority: 'HIGH',
    link: '/admin/commandes',
    time: 'Il y a 8 min',
  },
  {
    id: 'notif-2',
    type: 'LOW_STOCK',
    title: 'Alerte Stock Bas : Roses d’Équateur',
    message: 'Seuil critique atteint : reste 14 tiges en chambre froide à Saly.',
    isRead: false,
    priority: 'URGENT',
    link: '/admin/stock',
    time: 'Il y a 25 min',
  },
  {
    id: 'notif-3',
    type: 'NEW_QUOTE',
    title: 'Nouveau Devis Mariage reçu',
    message: 'Scénographie florale et arche sur plage à Somone — Budget 850 000 FCFA',
    isRead: false,
    priority: 'NORMAL',
    link: '/admin/devis',
    time: 'Il y a 1h',
  },
  {
    id: 'notif-4',
    type: 'PAYMENT_RECEIVED',
    title: 'Paiement Wave validé (35 000 FCFA)',
    message: 'Commande CMD-2026-0047 réglée avec succès via NabooPay.',
    isRead: true,
    priority: 'NORMAL',
    link: '/admin/commandes',
    time: 'Il y a 2h',
  },
  {
    id: 'notif-5',
    type: 'DELIVERY_UPDATE',
    title: 'Navette Dakar en cours de distribution',
    message: 'Chauffeur Moussa : 4 livraisons restantes sur le Plateau et Ngor.',
    isRead: true,
    priority: 'NORMAL',
    link: '/admin/livraisons',
    time: 'Il y a 3h',
  },
];

export function AdminNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_ADMIN_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setIsOpen(false);
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingBag size={15} className="text-emerald-700" />;
      case 'LOW_STOCK':
        return <AlertTriangle size={15} className="text-amber-700" />;
      case 'NEW_QUOTE':
        return <FileText size={15} className="text-purple-700" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard size={15} className="text-blue-700" />;
      case 'DELIVERY_UPDATE':
        return <Truck size={15} className="text-indigo-700" />;
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
            {unreadCount}
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
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <CheckCheck size={13} />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => markOneAsRead(notif.id)}
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
                        <span className="text-[10px] text-neutral-400 shrink-0">{notif.time}</span>
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
            <Link
              href="/admin/commandes"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-neutral-600 hover:text-[#173f22] transition-colors"
            >
              Accéder à toutes les commandes et alertes →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

