'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Store,
  Users,
  ShieldCheck,
  CreditCard,
  Truck,
  Bell,
  Globe,
  Save,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Upload,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

import type {
  AdminUser,
  AdminRoleKey,
  AdminUserStatus,
  BoutiqueSettings,
  PaymentGatewaySettings,
  DeliveryZoneSettings,
  NotificationSettings,
  SeoSettings,
} from '@/lib/admin/mock-data/types';
import {
  adminRolesList,
  initialAdminUsers,
  adminPermissionsMatrix,
  initialBoutiqueSettings,
  initialPaymentSettings,
  initialDeliveryZones,
  initialNotificationSettings,
  initialSeoSettings,
} from '@/lib/admin/mock-data';
import { UserEditorDialog } from '@/components/admin/user-editor-dialog';

type SettingsTab =
  | 'boutique'
  | 'utilisateurs'
  | 'roles'
  | 'paiement'
  | 'livraison'
  | 'notifications'
  | 'seo';

export default function AdminParametresPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('boutique');
  const [isSaving, setIsSaving] = useState(false);

  // ── Boutique State ────────────────────────────────────────────────
  const [boutique, setBoutique] = useState<BoutiqueSettings>(initialBoutiqueSettings);

  // ── Users State ───────────────────────────────────────────────────
  const [users, setUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // ── Permissions State ─────────────────────────────────────────────
  const [permissionsMatrix, setPermissionsMatrix] = useState(adminPermissionsMatrix);
  const [activeRoleForMatrix, setActiveRoleForMatrix] = useState<AdminRoleKey>('gestionnaire');

  // ── Payment Gateways State ────────────────────────────────────────
  const [payment, setPayment] = useState<PaymentGatewaySettings>(initialPaymentSettings);

  // ── Delivery Zones State ──────────────────────────────────────────
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneSettings[]>(initialDeliveryZones);

  // ── Notifications State ───────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotificationSettings);

  // ── SEO State ─────────────────────────────────────────────────────
  const [seo, setSeo] = useState<SeoSettings>(initialSeoSettings);

  // ── Save Handler ──────────────────────────────────────────────────
  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres enregistrés avec succès !');
    }, 600);
  };

  // ── Users Handlers ────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSaveUser = (savedUser: AdminUser) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === savedUser.id);
      if (exists) {
        return prev.map((u) => (u.id === savedUser.id ? savedUser : u));
      }
      return [savedUser, ...prev];
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'accès de ${userName} ?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(`Le collaborateur ${userName} a été supprimé.`);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus: AdminUserStatus = u.status === 'actif' ? 'inactif' : 'actif';
          toast.success(`Statut de ${u.name} mis à jour : ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // ── Permission Toggle Handler ─────────────────────────────────────
  const handleTogglePermission = (
    moduleKey: string,
    roleKey: AdminRoleKey,
    action: 'read' | 'write' | 'delete' | 'export'
  ) => {
    setPermissionsMatrix((prev) =>
      prev.map((mod) => {
        if (mod.key === moduleKey) {
          const current = mod.permissions[roleKey][action];
          return {
            ...mod,
            permissions: {
              ...mod.permissions,
              [roleKey]: {
                ...mod.permissions[roleKey],
                [action]: !current,
              },
            },
          };
        }
        return mod;
      })
    );
  };

  const navItems = [
    { key: 'boutique', label: 'Boutique & Général', icon: Store, desc: 'Coordonnées & identité' },
    { key: 'utilisateurs', label: 'Collaborateurs', icon: Users, desc: 'Comptes & accès équipe' },
    { key: 'roles', label: 'Rôles & Permissions', icon: ShieldCheck, desc: 'Matrice des droits' },
    { key: 'paiement', label: 'Paiements & Passerelles', icon: CreditCard, desc: 'Wave, OM, CB & Espèces' },
    { key: 'livraison', label: 'Zones & Livraison', icon: Truck, desc: 'Tarifs & délais Saly/Dakar' },
    { key: 'notifications', label: 'Notifications & Alertes', icon: Bell, desc: 'WhatsApp, SMS & Email' },
    { key: 'seo', label: 'SEO & Référencement', icon: Globe, desc: 'Google SERP & Réseaux' },
  ];

  const getRoleBadge = (roleKey: AdminRoleKey) => {
    const roleDef = adminRolesList.find((r) => r.key === roleKey);
    if (!roleDef) return <Badge variant="outline">{roleKey}</Badge>;
    return <Badge className={roleDef.badgeClass}>{roleDef.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── En-tête de la page ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Paramètres & Configuration
          </h1>
          <p className="admin-page-subtitle">
            Gérez les informations de la boutique, votre équipe, vos accès et les paramètres opérationnels.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="gap-2 bg-[#c1647a] hover:bg-[#a84d63] text-white shadow-xs font-semibold"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>

      {/* ── Layout en grille : Sidebar verticale + Contenu ───── */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Navigation latérale interne (Maquette 15) */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-[#c1647a] text-white shadow-xs font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-pink-100' : 'text-gray-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Badge récapitulatif système */}
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Sparkles className="h-3.5 w-3.5 text-[#c1647a]" />
              <span>Système Décofleur</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Dernière mise à jour : 13 oct. 2026. Toutes les modifications prennent effet immédiatement.
            </p>
          </div>
        </aside>

        {/* ── Contenu principal ──────────────────────────────── */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
          {/* ───────────────────────────────────────────────────────────
              1. TAB : BOUTIQUE & GÉNÉRAL (Maquette 15)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'boutique' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Informations de la boutique
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Identité visuelle, coordonnées publiques et adresse de l'atelier floral.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-5 text-xs">
                  {/* Logo de la boutique */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                    <div className="relative h-20 w-20 rounded-xl border border-gray-200 bg-white p-2 shadow-2xs flex items-center justify-center shrink-0">
                      <Image
                        src="/icons/icon-192.png"
                        alt="Logo Décofleur Plus"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Logo officiel de l'enseigne
                      </h4>
                      <p className="text-gray-500 text-[11px]">
                        Affiché sur la facture PDF, les notifications et l'en-tête de votre vitrine. Format recommandé : PNG transparent ou SVG (min. 256x256 px).
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Sélecteur d’image ouvert. Format PNG/SVG supporté.')}
                        className="gap-1.5 text-xs h-8 text-[#c1647a] border-[#c1647a]/30 hover:bg-pink-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Changer le logo
                      </Button>
                    </div>
                  </div>

                  {/* Formulaire principal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shopName" className="font-semibold text-gray-700">
                        Nom de la boutique <span className="text-[#c1647a]">*</span>
                      </Label>
                      <Input
                        id="shopName"
                        value={boutique.shopName}
                        onChange={(e) => setBoutique({ ...boutique, shopName: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tagline" className="font-semibold text-gray-700">
                        Slogan de marque
                      </Label>
                      <Input
                        id="tagline"
                        value={boutique.tagline}
                        onChange={(e) => setBoutique({ ...boutique, tagline: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contactEmail" className="font-semibold text-gray-700">
                        Email de contact principal <span className="text-[#c1647a]">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="contactEmail"
                          type="email"
                          value={boutique.contactEmail}
                          onChange={(e) => setBoutique({ ...boutique, contactEmail: e.target.value })}
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phoneDakar" className="font-semibold text-gray-700">
                        Téléphone Dakar (Service client & WhatsApp)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneDakar"
                          value={boutique.phoneDakar}
                          onChange={(e) => setBoutique({ ...boutique, phoneDakar: e.target.value })}
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phoneSaly" className="font-semibold text-gray-700">
                        Téléphone Saly Portudal (Boutique & Atelier)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneSaly"
                          value={boutique.phoneSaly}
                          onChange={(e) => setBoutique({ ...boutique, phoneSaly: e.target.value })}
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="orderPrefix" className="font-semibold text-gray-700">
                        Préfixe de numérotation des commandes
                      </Label>
                      <Input
                        id="orderPrefix"
                        value={boutique.orderPrefix}
                        onChange={(e) => setBoutique({ ...boutique, orderPrefix: e.target.value })}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Adresse complète */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="font-semibold text-gray-700">
                      Adresse physique de l'atelier floral
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={boutique.address}
                        onChange={(e) => setBoutique({ ...boutique, address: e.target.value })}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Horaires d'ouverture */}
                  <div className="space-y-1.5">
                    <Label htmlFor="openingHours" className="font-semibold text-gray-700">
                      Horaires d'ouverture de l'atelier
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="openingHours"
                        value={boutique.openingHours}
                        onChange={(e) => setBoutique({ ...boutique, openingHours: e.target.value })}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Paramètres régionaux */}
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Paramètres régionaux & monétaires</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-1">
                        <span className="text-gray-500 font-medium">Devise légale :</span>
                        <div className="font-bold text-gray-900">{boutique.currency}</div>
                        <p className="text-[10px] text-gray-400">Paiements traités sans frais de change</p>
                      </div>

                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-1">
                        <span className="text-gray-500 font-medium">Fuseau horaire :</span>
                        <div className="font-bold text-gray-900">{boutique.timezone}</div>
                        <p className="text-[10px] text-gray-400">Synchronisé avec l'heure universelle de Dakar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              2. TAB : COLLABORATEURS & UTILISATEURS (Maquette 16)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'utilisateurs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-gray-900">
                          Utilisateurs & Collaborateurs
                        </CardTitle>
                        <Badge className="bg-[#c1647a]/10 text-[#c1647a] hover:bg-[#c1647a]/15 border-none font-mono">
                          {users.length} membres
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-gray-500">
                        Comptes habilités à administrer la boutique, gérer les commandes et livraisons.
                      </CardDescription>
                    </div>

                    <Button
                      onClick={() => {
                        setEditingUser(null);
                        setIsUserEditorOpen(true);
                      }}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white gap-1.5 shadow-xs"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                  </div>

                  {/* Toolbar de filtres */}
                  <div className="flex flex-wrap items-center gap-2 pt-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher par nom, email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-xs focus:border-[#c1647a] focus:outline-none"
                    >
                      <option value="all">Tous les rôles</option>
                      {adminRolesList.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-xs focus:border-[#c1647a] focus:outline-none"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="en_attente">En attente</option>
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/70">
                          <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Collaborateur
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Rôle
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Contact
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Statut
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Dernière connexion
                          </TableHead>
                          <TableHead className="text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-gray-500 text-xs">
                              Aucun collaborateur ne correspond à ces critères.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50/60">
                              <TableCell className="text-xs py-3 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center font-bold text-[#c1647a] shrink-0 border border-pink-200">
                                    {user.avatar ? (
                                      <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        width={32}
                                        height={32}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      user.name.charAt(0)
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-[11px] text-gray-400 font-mono">{user.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs py-3 whitespace-nowrap">
                                {getRoleBadge(user.role)}
                              </TableCell>
                              <TableCell className="text-xs py-3 whitespace-nowrap">
                                <div className="text-gray-800">{user.email}</div>
                                <div className="text-[11px] text-gray-400">{user.phone}</div>
                              </TableCell>
                              <TableCell className="text-center text-xs py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  title="Cliquer pour changer le statut"
                                  className="cursor-pointer"
                                >
                                  {user.status === 'actif' && (
                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                                      Actif
                                    </Badge>
                                  )}
                                  {user.status === 'inactif' && (
                                    <Badge variant="secondary" className="text-gray-600 bg-gray-100">
                                      Inactif
                                    </Badge>
                                  )}
                                  {user.status === 'en_attente' && (
                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                      En attente
                                    </Badge>
                                  )}
                                </button>
                              </TableCell>
                              <TableCell className="text-xs py-3 text-gray-500 whitespace-nowrap">
                                {user.lastLogin ? (
                                  new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                ) : (
                                  <span className="text-gray-400 italic">Jamais</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-xs py-3 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingUser(user);
                                      setIsUserEditorOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
                                    title="Modifier le collaborateur"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                                    title="Supprimer l'accès"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              3. TAB : RÔLES & PERMISSIONS (Matrice interactive)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Matrice des Rôles & Permissions
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Configurez avec précision les privilèges de chaque rôle (Lecture, Écriture, Suppression, Export).
                      </CardDescription>
                    </div>

                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer la matrice
                    </Button>
                  </div>

                  {/* Sélecteur de rôle pour filtrer la vue détaillée */}
                  <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1">
                    <span className="text-xs font-semibold text-gray-600 shrink-0">
                      Rôle actif :
                    </span>
                    {adminRolesList.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setActiveRoleForMatrix(r.key)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                          activeRoleForMatrix === r.key
                            ? 'bg-[#c1647a] text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="p-4 bg-pink-50/40 border-b border-pink-100 text-xs flex items-center gap-2 text-pink-900">
                    <Info className="h-4 w-4 shrink-0 text-[#c1647a]" />
                    <span>
                      Modifications appliquées pour le rôle <strong>{adminRolesList.find((r) => r.key === activeRoleForMatrix)?.label}</strong>. Cliquez sur les badges pour activer ou désactiver un droit.
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/70">
                          <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Module Fonctionnel
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Lecture (Voir)
                            </span>
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Edit2 className="h-3 w-3" /> Modification
                            </span>
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Trash2 className="h-3 w-3" /> Suppression
                            </span>
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <FileSpreadsheet className="h-3 w-3" /> Export Données
                            </span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissionsMatrix.map((mod) => {
                          const perms = mod.permissions[activeRoleForMatrix];
                          const isAdminRole = activeRoleForMatrix === 'admin';

                          return (
                            <TableRow key={mod.key} className="hover:bg-gray-50/50">
                              <TableCell className="text-xs py-3 whitespace-nowrap">
                                <div className="font-semibold text-gray-900">{mod.label}</div>
                                <div className="text-[11px] text-gray-400">{mod.category}</div>
                              </TableCell>

                              {/* Lecture */}
                              <TableCell className="text-center py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={isAdminRole}
                                  onClick={() => handleTogglePermission(mod.key, activeRoleForMatrix, 'read')}
                                  className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors ${
                                    perms.read
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                  } ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                  title={perms.read ? 'Activé' : 'Désactivé'}
                                >
                                  {perms.read ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                </button>
                              </TableCell>

                              {/* Modification */}
                              <TableCell className="text-center py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={isAdminRole}
                                  onClick={() => handleTogglePermission(mod.key, activeRoleForMatrix, 'write')}
                                  className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors ${
                                    perms.write
                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                  } ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                  title={perms.write ? 'Activé' : 'Désactivé'}
                                >
                                  {perms.write ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                </button>
                              </TableCell>

                              {/* Suppression */}
                              <TableCell className="text-center py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={isAdminRole}
                                  onClick={() => handleTogglePermission(mod.key, activeRoleForMatrix, 'delete')}
                                  className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors ${
                                    perms.delete
                                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                  } ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                  title={perms.delete ? 'Activé' : 'Désactivé'}
                                >
                                  {perms.delete ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                </button>
                              </TableCell>

                              {/* Export */}
                              <TableCell className="text-center py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={isAdminRole}
                                  onClick={() => handleTogglePermission(mod.key, activeRoleForMatrix, 'export')}
                                  className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors ${
                                    perms.export
                                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                  } ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                  title={perms.export ? 'Activé' : 'Désactivé'}
                                >
                                  {perms.export ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              4. TAB : PAIEMENTS & PASSERELLES
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'paiement' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Passerelles de Paiement au Sénégal
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Activez et configurez Wave, Orange Money, Carte Bancaire et Espèces à la livraison.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 text-xs">
                  {/* Wave Sénégal */}
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-cyan-200 shadow-2xs">
                          <Image src="/payment/wave.png" alt="Wave" width={24} height={24} className="object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Wave Sénégal (Paiement Instantané QR / Mobile)</h4>
                          <p className="text-gray-500 text-[11px]">Frais passerelle standard : 1.0%</p>
                        </div>
                      </div>
                      <Switch
                        checked={payment.wave.enabled}
                        onCheckedChange={(checked) =>
                          setPayment({ ...payment, wave: { ...payment.wave, enabled: checked } })
                        }
                      />
                    </div>

                    {payment.wave.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-cyan-100">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-gray-700">Identifiant Marchand Wave</Label>
                          <Input
                            value={payment.wave.merchantId}
                            onChange={(e) =>
                              setPayment({ ...payment, wave: { ...payment.wave, merchantId: e.target.value } })
                            }
                            className="h-8 text-xs font-mono bg-white"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <span className="text-[11px] text-gray-600">Absorber les frais pour le client (0 FCFA facturé)</span>
                          <Switch
                            checked={payment.wave.absorbFees}
                            onCheckedChange={(checked) =>
                              setPayment({ ...payment, wave: { ...payment.wave, absorbFees: checked } })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orange Money */}
                  <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-orange-200 shadow-2xs">
                          <Image src="/payment/orange-money-black.svg" alt="Orange Money" width={24} height={24} className="object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Orange Money Sénégal (Orange Pay Pro)</h4>
                          <p className="text-gray-500 text-[11px]">Frais passerelle standard : 1.0%</p>
                        </div>
                      </div>
                      <Switch
                        checked={payment.orangeMoney.enabled}
                        onCheckedChange={(checked) =>
                          setPayment({ ...payment, orangeMoney: { ...payment.orangeMoney, enabled: checked } })
                        }
                      />
                    </div>

                    {payment.orangeMoney.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-100">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-gray-700">Numéro Marchand Orange Money Pro</Label>
                          <Input
                            value={payment.orangeMoney.merchantNumber}
                            onChange={(e) =>
                              setPayment({ ...payment, orangeMoney: { ...payment.orangeMoney, merchantNumber: e.target.value } })
                            }
                            className="h-8 text-xs font-mono bg-white"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <span className="text-[11px] text-gray-600">Absorber les frais de commission</span>
                          <Switch
                            checked={payment.orangeMoney.absorbFees}
                            onCheckedChange={(checked) =>
                              setPayment({ ...payment, orangeMoney: { ...payment.orangeMoney, absorbFees: checked } })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Carte Bancaire */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-blue-200 shadow-2xs gap-1">
                          <Image src="/payment/visa.svg" alt="Visa" width={18} height={12} className="object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Carte Bancaire Visa & Mastercard</h4>
                          <p className="text-gray-500 text-[11px]">Passerelle sécurisée Stripe / Paydunya (2.5%)</p>
                        </div>
                      </div>
                      <Switch
                        checked={payment.card.enabled}
                        onCheckedChange={(checked) =>
                          setPayment({ ...payment, card: { ...payment.card, enabled: checked } })
                        }
                      />
                    </div>

                    {payment.card.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-gray-700">Fournisseur passerelle</Label>
                          <Input
                            value={payment.card.provider}
                            onChange={(e) =>
                              setPayment({ ...payment, card: { ...payment.card, provider: e.target.value } })
                            }
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <span className="text-[11px] text-gray-600">Absorber les frais de passerelle</span>
                          <Switch
                            checked={payment.card.absorbFees}
                            onCheckedChange={(checked) =>
                              setPayment({ ...payment, card: { ...payment.card, absorbFees: checked } })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Espèces à la livraison */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-emerald-200 shadow-2xs text-emerald-600 font-bold">
                          F CFA
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Paiement en espèces à la livraison</h4>
                          <p className="text-gray-500 text-[11px]">Règlement direct auprès du livreur lors de la remise du bouquet.</p>
                        </div>
                      </div>
                      <Switch
                        checked={payment.cash.enabled}
                        onCheckedChange={(checked) =>
                          setPayment({ ...payment, cash: { ...payment.cash, enabled: checked } })
                        }
                      />
                    </div>

                    {payment.cash.enabled && (
                      <div className="pt-2 border-t border-emerald-100">
                        <div className="max-w-xs space-y-1">
                          <Label className="text-[11px] font-semibold text-gray-700">Plafond maximum autorisé (FCFA)</Label>
                          <Input
                            type="number"
                            value={payment.cash.maxAmount}
                            onChange={(e) =>
                              setPayment({ ...payment, cash: { ...payment.cash, maxAmount: Number(e.target.value) } })
                            }
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              5. TAB : ZONES & LIVRAISON
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'livraison' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Zones de Livraison & Tarification
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Définissez les frais de transport et les délais pour Dakar, Saly et la Petite Côte.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 text-xs">
                  <div className="space-y-3">
                    {deliveryZones.map((zone) => (
                      <div
                        key={zone.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-sm">{zone.name}</h4>
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-mono text-[10px]">
                                {zone.price.toLocaleString('fr-FR')} F CFA
                              </Badge>
                            </div>
                            <p className="text-gray-500 text-[11px]">{zone.coverage}</p>
                          </div>
                          <Switch
                            checked={zone.enabled}
                            onCheckedChange={(checked) =>
                              setDeliveryZones((prev) =>
                                prev.map((z) => (z.id === zone.id ? { ...z, enabled: checked } : z))
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-gray-600">Frais de livraison (FCFA)</Label>
                            <Input
                              type="number"
                              value={zone.price}
                              onChange={(e) =>
                                setDeliveryZones((prev) =>
                                  prev.map((z) => (z.id === zone.id ? { ...z, price: Number(e.target.value) } : z))
                                )
                              }
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-gray-600">Délai estimé</Label>
                            <Input
                              value={zone.delayHours}
                              onChange={(e) =>
                                setDeliveryZones((prev) =>
                                  prev.map((z) => (z.id === zone.id ? { ...z, delayHours: e.target.value } : z))
                                )
                              }
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-gray-600">Gratuit à partir de (FCFA)</Label>
                            <Input
                              type="number"
                              value={zone.freeAbove || 0}
                              onChange={(e) =>
                                setDeliveryZones((prev) =>
                                  prev.map((z) => (z.id === zone.id ? { ...z, freeAbove: Number(e.target.value) } : z))
                                )
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              6. TAB : NOTIFICATIONS & ALERTES
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Canaux de Notification & Déclencheurs
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Alertes automatiques WhatsApp, SMS et emails transactionnels pour l'équipe et les clients.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-2 text-xs">
                  {/* Canaux disponibles */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Canaux actifs d'expédition</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                        <span className="font-medium text-gray-800">WhatsApp Business API</span>
                        <Switch
                          checked={notifications.whatsappEnabled}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, whatsappEnabled: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                        <span className="font-medium text-gray-800">SMS (Passerelle Orange/Wave)</span>
                        <Switch
                          checked={notifications.smsEnabled}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, smsEnabled: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                        <span className="font-medium text-gray-800">Email Transactionnel</span>
                        <Switch
                          checked={notifications.emailEnabled}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, emailEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Événements déclencheurs */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900">Événements déclencheurs automatiques</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'onNewOrder', label: 'Nouvelle commande confirmée et payée', desc: 'Alerte instantanée transmise à l’atelier de composition florale.' },
                        { key: 'onDriverAssigned', label: 'Assignation du livreur', desc: 'Notification SMS/WhatsApp envoyée au client avec le prénom du livreur.' },
                        { key: 'onDelivered', label: 'Commande livrée avec succès', desc: 'Confirmation de réception avec invitation à laisser une note de satisfaction.' },
                        { key: 'onLowStock', label: 'Alerte stock critique (< 5 tiges)', desc: 'Notification immédiate au fleuriste en charge des approvisionnements.' },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                        >
                          <div className="space-y-0.5">
                            <span className="font-medium text-gray-900 block">{item.label}</span>
                            <span className="text-[11px] text-gray-400">{item.desc}</span>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof NotificationSettings] as boolean}
                            onCheckedChange={(checked) =>
                              setNotifications({ ...notifications, [item.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coordonnées alertes admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-gray-700">Numéro WhatsApp d'alerte gérance</Label>
                      <Input
                        value={notifications.adminAlertPhone}
                        onChange={(e) =>
                          setNotifications({ ...notifications, adminAlertPhone: e.target.value })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-gray-700">Email d'alerte commandes urgentes</Label>
                      <Input
                        value={notifications.adminAlertEmail}
                        onChange={(e) =>
                          setNotifications({ ...notifications, adminAlertEmail: e.target.value })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              7. TAB : SEO & RÉFÉRENCEMENT
             ─────────────────────────────────────────────────────────── */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        SEO & Référencement Google Dakar & Sénégal
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Optimisez la visibilité de votre boutique dans les résultats de recherche locaux.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveAll}
                      size="sm"
                      className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 text-xs">
                  {/* Prévisualisation SERP Google */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                      Aperçu dans les résultats Google
                    </span>
                    <div className="font-medium text-blue-900 text-sm leading-snug hover:underline cursor-pointer">
                      {seo.metaTitle || 'Décofleur Plus'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      https://decofleurplus.sn
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {seo.metaDescription || 'Fleuriste d’exception à Saly et Dakar...'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="metaTitle" className="font-semibold text-gray-700">
                      Méta-titre par défaut (Balise Title)
                    </Label>
                    <Input
                      id="metaTitle"
                      value={seo.metaTitle}
                      onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                      className="h-9 text-xs"
                    />
                    <div className="text-[10px] text-gray-400">
                      Recommandé : entre 50 et 60 caractères ({seo.metaTitle.length} actuels).
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="metaDescription" className="font-semibold text-gray-700">
                      Méta-description Google
                    </Label>
                    <Textarea
                      id="metaDescription"
                      rows={3}
                      value={seo.metaDescription}
                      onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                      className="text-xs resize-none"
                    />
                    <div className="text-[10px] text-gray-400">
                      Recommandé : entre 140 et 160 caractères ({seo.metaDescription.length} actuels).
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="keywords" className="font-semibold text-gray-700">
                      Mots-clés cibles séparés par des virgules
                    </Label>
                    <Input
                      id="keywords"
                      value={seo.keywords}
                      onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Réseaux sociaux */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900">Comptes sur les réseaux sociaux</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">Instagram</Label>
                        <Input
                          value={seo.instagramUrl}
                          onChange={(e) => setSeo({ ...seo, instagramUrl: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">Facebook</Label>
                        <Input
                          value={seo.facebookUrl}
                          onChange={(e) => setSeo({ ...seo, facebookUrl: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">TikTok</Label>
                        <Input
                          value={seo.tiktokUrl}
                          onChange={(e) => setSeo({ ...seo, tiktokUrl: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ── Modale d'ajout / modification de collaborateur ───── */}
      <UserEditorDialog
        isOpen={isUserEditorOpen}
        onOpenChange={setIsUserEditorOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
