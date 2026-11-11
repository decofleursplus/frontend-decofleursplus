'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, CreditCard, Globe, RefreshCw, ShieldCheck, Store, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminUser } from '@/lib/api/auth-token';
import {
  getAdminRoles,
  getAdminShopSettings,
  updateAdminShopSettings,
  type AdminShopSettings,
  type RolesAndPermissions,
  type UpdateShopSettingsPayload,
} from '@/lib/api/admin/settings';
import { BoutiqueTab } from './_components/boutique-tab';
import { CollaborateursTab } from './_components/collaborateurs-tab';
import { NotificationsTab } from './_components/notifications-tab';
import { PaymentsTab } from './_components/payments-tab';
import { RolesTab } from './_components/roles-tab';
import { SeoTab } from './_components/seo-tab';
import { ZonesTab } from './_components/zones-tab';
import { describeError, ErrorBlock, formatDateTime, isForbidden, LoadingBlock } from './_components/shared';

type SettingsTab = 'boutique' | 'collaborateurs' | 'roles' | 'livraison' | 'paiement' | 'notifications' | 'seo';

const NAV_ITEMS: { key: SettingsTab; label: string; icon: typeof Store; desc: string }[] = [
  { key: 'boutique', label: 'Boutique', icon: Store, desc: 'Identité & coordonnées' },
  { key: 'collaborateurs', label: 'Collaborateurs', icon: Users, desc: 'Comptes de l’équipe' },
  { key: 'roles', label: 'Rôles & permissions', icon: ShieldCheck, desc: 'Droits par rôle' },
  { key: 'livraison', label: 'Zones de livraison', icon: Truck, desc: 'Tarifs & délais' },
  { key: 'paiement', label: 'Paiement', icon: CreditCard, desc: 'Moyens acceptés' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alertes & emails' },
  { key: 'seo', label: 'Réseaux & référencement', icon: Globe, desc: 'SEO & réseaux sociaux' },
];

/** Sections qui dépendent de GET /admin/settings (les autres chargent leurs propres données). */
const SETTINGS_TABS: SettingsTab[] = ['boutique', 'paiement', 'notifications', 'seo'];

export default function AdminParametresPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('boutique');
  // Lu après le montage : la session admin est stockée côté navigateur
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getAdminUser>>(null);

  const [settings, setSettings] = useState<AdminShopSettings | null>(null);
  const [settingsError, setSettingsError] = useState<unknown>(null);
  const [roles, setRoles] = useState<RolesAndPermissions | null>(null);
  const [rolesError, setRolesError] = useState<unknown>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const role = currentUser?.role?.toUpperCase() ?? '';
  const isAdmin = role === 'ADMIN';
  const canManageZones = role === 'ADMIN' || role === 'MANAGER';

  const load = useCallback(async () => {
    setRefreshing(true);
    setSettingsError(null);
    setRolesError(null);
    const [settingsRes, rolesRes] = await Promise.allSettled([getAdminShopSettings(), getAdminRoles()]);
    if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
    else setSettingsError(settingsRes.reason);
    if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value);
    else setRolesError(rolesRes.reason);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(getAdminUser());
    void load();
  }, [load]);

  const refresh = () => {
    setRefreshKey((k) => k + 1); // recharge aussi les onglets autonomes (collaborateurs, zones)
    void load();
  };

  const saveSettings = async (payload: UpdateShopSettingsPayload) => {
    const updated = await updateAdminShopSettings(payload);
    setSettings(updated);
    return updated;
  };

  const renderSettingsTab = () => {
    if (settingsError) {
      return (
        <ErrorBlock
          message={describeError(settingsError, 'Impossible de charger les paramètres de la boutique.')}
          onRetry={load}
          forbidden={isForbidden(settingsError)}
        />
      );
    }
    if (!settings) return <LoadingBlock label="Chargement des paramètres…" />;
    // La clé force la réinitialisation du formulaire après un rechargement depuis le serveur
    const key = `${activeTab}-${settings.updatedAt}-${refreshKey}`;
    switch (activeTab) {
      case 'boutique':
        return <BoutiqueTab key={key} settings={settings} canEdit={isAdmin} onSave={saveSettings} />;
      case 'paiement':
        return <PaymentsTab key={key} settings={settings} canEdit={isAdmin} onSave={saveSettings} />;
      case 'notifications':
        return <NotificationsTab key={key} settings={settings} canEdit={isAdmin} onSave={saveSettings} />;
      case 'seo':
        return <SeoTab key={key} settings={settings} canEdit={isAdmin} onSave={saveSettings} />;
      default:
        return null;
    }
  };

  const renderTab = () => {
    if (SETTINGS_TABS.includes(activeTab)) return renderSettingsTab();
    if (activeTab === 'collaborateurs' || activeTab === 'roles') {
      if (rolesError) {
        return (
          <ErrorBlock
            message={describeError(rolesError, 'Impossible de charger les rôles.')}
            onRetry={load}
            forbidden={isForbidden(rolesError)}
          />
        );
      }
      if (!roles) return <LoadingBlock label="Chargement des rôles…" />;
      return activeTab === 'roles' ? (
        <RolesTab data={roles} />
      ) : (
        <CollaborateursTab
          key={refreshKey}
          roles={roles.roles}
          canEdit={isAdmin}
          currentUserId={currentUser?.id ?? null}
        />
      );
    }
    return <ZonesTab key={refreshKey} canEdit={canManageZones} />;
  };

  const lastUpdate = settings ? formatDateTime(settings.updatedAt) : null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Paramètres & configuration</h1>
          <p className="admin-page-subtitle">
            Informations de la boutique, équipe, droits d’accès, livraison, paiement et notifications.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="h-9 gap-1.5 text-xs text-stone-600 border-stone-200 hover:bg-stone-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Onglets mobiles */}
      <div className="md:hidden overflow-x-auto no-scrollbar -mx-4 px-4 py-1 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive ? 'bg-[#c1647a] text-white shadow-2xs' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-6 self-start z-10 space-y-4">
          <nav className="rounded-xl border border-gray-200 bg-white p-2 shadow-2xs space-y-1" aria-label="Sections des paramètres">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-[#c1647a] text-white shadow-2xs font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <div className="truncate">
                    <div className="text-xs">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-pink-100' : 'text-gray-400'}`}>{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-[11px] text-gray-500 space-y-1 leading-relaxed">
            <p>
              {lastUpdate ? (
                <>
                  Dernière modification des paramètres : <strong className="text-gray-700">{lastUpdate}</strong>.
                </>
              ) : (
                'Les modifications prennent effet dès leur enregistrement.'
              )}
            </p>
            {!isAdmin && currentUser && <p>Seul un administrateur peut modifier ces réglages.</p>}
          </div>
        </aside>

        <section
          className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6"
          aria-label={NAV_ITEMS.find((item) => item.key === activeTab)?.label}
          data-settings-panel
        >
          {renderTab()}
        </section>
      </div>
    </div>
  );
}
