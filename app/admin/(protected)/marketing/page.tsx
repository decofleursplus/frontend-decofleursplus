'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  type AdminCoupon,
  type AdminPromotion,
  type AdminCampaign,
  type AdminAbandonedCart,
  type CartRecoverySettings,
  type CouponStatus,
  type PromotionStatus,
  type CampaignChannel,
  type CartRecoveryStatus,
} from '@/lib/admin/mock-data/types';
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
  getAdminCampaigns,
  createAdminCampaign,
  sendAdminCampaign,
  deleteAdminCampaign,
  getAdminAbandonedCarts,
  remindAdminAbandonedCart,
  getCartRecoverySettings,
  updateCartRecoverySettings,
  getMarketingSummary,
  setAdminAbandonedCartStatus,
  type MarketingSummary,
} from '@/lib/api/admin/marketing';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  BadgePercent,
  Megaphone,
  ShoppingCart,
  Plus,
  Search,
  Truck,
  Smartphone,
  Mail,
  Copy,
  DollarSign,
  Clock,
  CheckCircle,
  Sliders,
  Trash2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppColorIcon, WhatsAppButtonIcon } from '@/components/icons';
import { CreateCouponDialog } from '@/components/admin/create-coupon-dialog';
import { CreatePromotionDialog } from '@/components/admin/create-promotion-dialog';
import { CreateCampaignDialog } from '@/components/admin/create-campaign-dialog';
import { CartRecoveryConfigDialog } from '@/components/admin/cart-recovery-config-dialog';
import { EventManagementView } from '@/components/admin/event-management-view';

export default function AdminMarketingPage() {
  // Main Top-level tab: 'evenements' | 'coupons' | 'promotions' | 'campagnes' | 'paniers'
  const [activeTab, setActiveTab] = useState<'evenements' | 'coupons' | 'promotions' | 'campagnes' | 'paniers'>('evenements');

  // State data
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AdminAbandonedCart[]>([]);
  const [cartSettings, setCartSettings] = useState<CartRecoverySettings | null>(null);
  const [summary, setSummary] = useState<MarketingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Chaîne de promesses : les setState n'ont lieu que dans les callbacks, jamais pendant l'effet.
  const fetchMarketing = useCallback(
    () =>
      Promise.all([
        getAdminCoupons(),
        getAdminPromotions(),
        getAdminCampaigns(),
        getAdminAbandonedCarts(),
        getCartRecoverySettings(),
        getMarketingSummary(),
      ])
        .then(([cpRes, prRes, cmpRes, crtRes, setRes, sumRes]) => {
          setCoupons(cpRes);
          setPromotions(prRes);
          setCampaigns(cmpRes);
          setAbandonedCarts(crtRes);
          setCartSettings(setRes);
          setSummary(sumRes);
        })
        .catch((err: unknown) => {
          toast.error(err instanceof ApiClientError ? err.message : 'Erreur lors du chargement des données marketing');
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    []
  );

  const loadData = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      return fetchMarketing();
    },
    [fetchMarketing]
  );

  useEffect(() => {
    fetchMarketing();
  }, [fetchMarketing]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>('all');
  const [promotionStatusFilter, setPromotionStatusFilter] = useState<string>('all');
  const [campaignChannelFilter, setCampaignChannelFilter] = useState<string>('all');
  const [cartStatusFilter, setCartStatusFilter] = useState<string>('all');

  // Dialog States
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // KPIs calculés par le serveur (GET /admin/marketing/summary)
  const kpiStats = summary ?? { totalRevenue: 0, activeCouponsCount: 0, activePromosCount: 0, recoveredRevenue: 0, recoveryRate: 0 };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (couponStatusFilter !== 'all' && c.status !== couponStatusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [coupons, couponStatusFilter, searchQuery]);

  // Filtered Promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      if (promotionStatusFilter !== 'all' && p.status !== promotionStatusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.badgeText.toLowerCase().includes(q) ||
          p.targetNames.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [promotions, promotionStatusFilter, searchQuery]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((cmp) => {
      if (campaignChannelFilter !== 'all' && cmp.channel !== campaignChannelFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          cmp.name.toLowerCase().includes(q) ||
          cmp.messageContent.toLowerCase().includes(q) ||
          cmp.audience.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [campaigns, campaignChannelFilter, searchQuery]);

  // Filtered Abandoned Carts
  const filteredCarts = useMemo(() => {
    return abandonedCarts.filter((cart) => {
      if (cartStatusFilter !== 'all' && cart.status !== cartStatusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          cart.customerName.toLowerCase().includes(q) ||
          cart.customerEmail.toLowerCase().includes(q) ||
          cart.customerPhone.toLowerCase().includes(q) ||
          cart.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [abandonedCarts, cartStatusFilter, searchQuery]);

  // Action handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code promo "${code}" copié dans le presse-papier !`);
  };

  /** Exécute une action serveur puis recharge les données ; aucune mise à jour locale en cas d'échec. */
  const runAction = async (action: () => Promise<unknown>, success: string): Promise<boolean> => {
    try {
      await action();
      toast.success(success);
      await loadData(true);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
      return false;
    }
  };

  const handleToggleCouponStatus = async (couponId: string) => {
    const cp = coupons.find((c) => c.id === couponId);
    if (!cp) return;
    const activate = cp.status !== 'actif';
    await runAction(() => updateAdminCoupon(couponId, { isActive: activate } as Partial<AdminCoupon>), `Code ${cp.code} ${activate ? 'activé' : 'désactivé'}.`);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const cp = coupons.find((c) => c.id === couponId);
    if (!window.confirm(`Supprimer le code ${cp?.code ?? ''} ?`)) return;
    await runAction(() => deleteAdminCoupon(couponId), 'Code promotionnel supprimé.');
  };

  const handleTogglePromotionStatus = async (promoId: string) => {
    const pr = promotions.find((p) => p.id === promoId);
    if (!pr) return;
    const activate = pr.status !== 'active';
    await runAction(
      () => updateAdminPromotion(promoId, { isActive: activate } as Partial<AdminPromotion>),
      `Promotion « ${pr.name} » ${activate ? 'activée' : 'désactivée'}.`,
    );
  };

  const handleDeletePromotion = async (promoId: string) => {
    const pr = promotions.find((p) => p.id === promoId);
    if (!window.confirm(`Supprimer la promotion « ${pr?.name ?? ''} » ?`)) return;
    await runAction(() => deleteAdminPromotion(promoId), 'Promotion supprimée du catalogue.');
  };

  const handleSendCampaign = async (camp: AdminCampaign) => {
    if (!window.confirm(`Envoyer la campagne « ${camp.name} » maintenant ?`)) return;
    await runAction(() => sendAdminCampaign(camp.id), `Campagne « ${camp.name} » envoyée.`);
  };

  const handleDeleteCampaign = async (camp: AdminCampaign) => {
    if (!window.confirm(`Supprimer la campagne « ${camp.name} » ?`)) return;
    await runAction(() => deleteAdminCampaign(camp.id), 'Campagne supprimée.');
  };

  /**
   * Relance : par email, le serveur envoie réellement le message ; par WhatsApp, le message pré-rempli
   * s'ouvre dans WhatsApp pour être envoyé depuis le téléphone de la boutique, et la relance est tracée.
   */
  const handleSendCartReminder = async (cart: AdminAbandonedCart, channel: 'whatsapp' | 'email') => {
    if (channel === 'whatsapp') {
      const cleanPhone = cart.customerPhone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(
        `Bonjour ${cart.customerName}, vous avez laissé des articles dans votre panier Décofleur Plus (total : ${cart.total.toLocaleString('fr-FR')} FCFA).${
          cart.recoveryCouponCode ? ` Profitez du code ${cart.recoveryCouponCode} pour finaliser votre commande.` : ''
        } ${window.location.origin}/panier`,
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    }
    await runAction(
      () => remindAdminAbandonedCart(cart.id, channel),
      channel === 'email' ? `Email de relance envoyé à ${cart.customerEmail}.` : `Relance WhatsApp enregistrée pour ${cart.customerName}.`,
    );
  };

  const handleMarkCartRecovered = async (cartId: string) => {
    await runAction(() => setAdminAbandonedCartStatus(cartId, 'recupere'), 'Panier marqué comme récupéré.');
  };

  // Helper Badges
  const getCouponStatusBadge = (status: CouponStatus) => {
    switch (status) {
      case 'actif':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs">
            Actif
          </Badge>
        );
      case 'programme':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs">
            Programmé
          </Badge>
        );
      case 'expire':
        return (
          <Badge className="bg-gray-100 text-gray-600 border-none font-medium text-xs">
            Expiré
          </Badge>
        );
      case 'epuise':
        return (
          <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none font-medium text-xs">
            Épuisé
          </Badge>
        );
      case 'inactif':
        return (
          <Badge className="bg-[#ffe5e5] text-[#cc0000] border-none font-medium text-xs">
            Désactivé
          </Badge>
        );
    }
  };

  const getPromotionStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs">
            En cours
          </Badge>
        );
      case 'programmee':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs">
            Programmée
          </Badge>
        );
      case 'terminee':
        return (
          <Badge className="bg-gray-100 text-gray-600 border-none font-medium text-xs">
            Terminée
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-[#ffe5e5] text-[#cc0000] border-none font-medium text-xs">
            Désactivée
          </Badge>
        );
    }
  };

  const getCampaignChannelBadge = (channel: CampaignChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs gap-1.5">
            <WhatsAppColorIcon size={14} className="shrink-0" />
            WhatsApp
          </Badge>
        );
      case 'sms':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs gap-1">
            <Smartphone className="h-3 w-3 text-[#3d5a99]" />
            SMS Direct
          </Badge>
        );
      case 'email':
        return (
          <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none font-medium text-xs gap-1">
            <Mail className="h-3 w-3 text-[#c1647a]" />
            Email
          </Badge>
        );
    }
  };

  const getCartStatusBadge = (status: CartRecoveryStatus) => {
    switch (status) {
      case 'a_relancer':
        return (
          <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none font-medium text-xs">
            À relancer
          </Badge>
        );
      case 'relance_1_envoyee':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs">
            Relance 1 envoyée
          </Badge>
        );
      case 'relance_2_envoyee':
        return (
          <Badge className="bg-[#f3e8ff] text-[#7e22ce] border-none font-medium text-xs">
            Relance 2 envoyée
          </Badge>
        );
      case 'recupere':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs">
            ✓ Récupéré
          </Badge>
        );
      case 'expire':
        return (
          <Badge className="bg-gray-100 text-gray-500 border-none font-medium text-xs">
            Expiré
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with contextual Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e2a1f]">Marketing & Promotions</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Créez des offres attractives, fidélisez vos clients via WhatsApp & SMS et récupérez vos ventes perdues.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50 flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>

          {activeTab === 'coupons' && (
            <Button
              onClick={() => setIsCouponDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4" />
              Nouveau code promo
            </Button>
          )}

          {activeTab === 'promotions' && (
            <Button
              onClick={() => setIsPromotionDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4" />
              Lancer une promotion
            </Button>
          )}

          {activeTab === 'campagnes' && (
            <Button
              onClick={() => setIsCampaignDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4" />
              Nouvelle campagne
            </Button>
          )}

          {activeTab === 'paniers' && (
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(true)}
              className="border-[#e7e4dd] text-gray-800 hover:text-[#c1647a] text-xs font-semibold h-10 px-4 gap-1.5 bg-white shadow-xs flex-1 sm:flex-initial"
            >
              <Sliders className="h-4 w-4 text-[#c1647a]" />
              Configuration automatique
            </Button>
          )}
        </div>
      </div>

      {/* Top Marketing KPI Cards (2x2 on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e7e4dd] rounded-xl p-3 sm:p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-[11px] sm:text-xs">
            <span className="truncate">CA Promo</span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#fdf2f4] text-[#c1647a] flex items-center justify-center shrink-0">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-bold text-gray-900 font-mono truncate">
            {kpiStats.totalRevenue.toLocaleString('fr-FR')} F
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Codes, promotions et campagnes</p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-3 sm:p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-[11px] sm:text-xs">
            <span className="truncate">Offres actives</span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p className="text-xs sm:text-lg lg:text-xl font-bold text-gray-900 leading-snug whitespace-nowrap">
            {`${kpiStats.activeCouponsCount} codes • ${kpiStats.activePromosCount} promos`}
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
            En temps réel
          </p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-3 sm:p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-[11px] sm:text-xs">
            <span className="truncate">Campagnes envoyées</span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#e5eaff] text-[#3d5a99] flex items-center justify-center shrink-0">
              <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-bold text-gray-900 truncate">{campaigns.filter((c) => c.status === 'envoyee').length}</p>
          <p className="text-[10px] sm:text-[11px] text-[#3d5a99] font-medium">
            {campaigns.filter((c) => c.status === 'envoyee').reduce((sum, c) => sum + c.recipientCount, 0).toLocaleString('fr-FR')} emails envoyés
          </p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-3 sm:p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-[11px] sm:text-xs">
            <span className="truncate">Paniers sauvés</span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#fff8cc] text-[#9a7b00] flex items-center justify-center shrink-0">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-bold text-gray-900 font-mono truncate">
            {kpiStats.recoveredRevenue.toLocaleString('fr-FR')} F
          </p>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3 shrink-0" />
            <span>{kpiStats.recoveryRate}% convertis</span>
          </p>
        </div>
      </div>

      {/* Main Top Navigation Tabs (Horizontally scrollable on mobile) */}
      <div className="flex border-b border-[#e7e4dd] gap-2 overflow-x-auto no-scrollbar flex-nowrap pb-1">
        <button
          onClick={() => {
            setActiveTab('evenements');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap shrink-0 ${
            activeTab === 'evenements'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 text-[#193e23]" />
          <span>Événements & Célébrations</span>
          <span className="ml-1 text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-medium">
            9
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('coupons');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap shrink-0 ${
            activeTab === 'coupons'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Codes promo & Coupons</span>
          <span className="ml-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {coupons.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('promotions');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap shrink-0 ${
            activeTab === 'promotions'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BadgePercent className="h-4 w-4" />
          <span>Promotions directes</span>
          <span className="ml-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {promotions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('campagnes');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap shrink-0 ${
            activeTab === 'campagnes'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Campagnes marketing</span>
          <span className="ml-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('paniers');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap shrink-0 ${
            activeTab === 'paniers'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Relance paniers</span>
          <span className="ml-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {abandonedCarts.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 0 : ÉVÉNEMENTS & CÉLÉBRATIONS DU SÉNÉGAL ET DU MONDE
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'evenements' && (
        <EventManagementView />
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 1 : CODES PROMO & COUPONS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par code promo ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-[#e7e4dd]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'actif', label: 'Actifs' },
                { id: 'programme', label: 'Programmés' },
                { id: 'expire', label: 'Expirés' },
                { id: 'epuise', label: 'Épuisés' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCouponStatusFilter(pill.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    couponStatusFilter === pill.id
                      ? 'bg-[#c1647a] text-white shadow-xs'
                      : 'bg-white border border-[#e7e4dd] text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop DataTable (>= 1024px) */}
          <div className="hidden lg:block bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]/60">
                <TableRow className="border-[#e7e4dd]">
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[150px]">
                    Code & Copie
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">
                    Réduction
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 max-w-[200px]">
                    Conditions
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">
                    Période
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[130px]">
                    Utilisations
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[110px]">
                    CA Généré
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[90px]">
                    Statut
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs text-right pr-4 px-3 py-3 w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-gray-500">
                      Aucun code promotionnel trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-[#fcfaf7] border-[#f0ede6]">
                      {/* Code */}
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 hover:text-[#c1647a] text-gray-400 transition-colors"
                            title="Copier le code"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Type & Valeur */}
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {coupon.type === 'percentage' && (
                            <span className="font-bold text-xs text-[#c1647a]">
                              -{coupon.value}%
                            </span>
                          )}
                          {coupon.type === 'fixed_amount' && (
                            <span className="font-bold text-xs text-[#166534]">
                              -{coupon.value.toLocaleString('fr-FR')} F
                            </span>
                          )}
                          {coupon.type === 'free_shipping' && (
                            <span className="text-xs font-semibold text-[#3d5a99] flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              Livraison offerte
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Conditions */}
                      <TableCell className="max-w-[200px] px-3 py-2.5">
                        <div className="space-y-0.5 text-[11px] text-gray-600 truncate">
                          {coupon.minOrderAmount ? (
                            <p>Min : {coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA</p>
                          ) : (
                            <p>Sans minimum</p>
                          )}
                          {coupon.description && (
                            <p className="text-[10px] text-gray-400 truncate" title={coupon.description}>
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Période */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap text-[11px] text-gray-600">
                        <p>{coupon.startDate}</p>
                        <p className="text-[10px] text-gray-400">au {coupon.endDate}</p>
                      </TableCell>

                      {/* Utilisations */}
                      <TableCell className="px-3 py-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-medium text-gray-700">
                            <span>{coupon.currentUsageCount}</span>
                            <span className="text-gray-400">/ {coupon.maxUsageTotal || '∞'}</span>
                          </div>
                          {coupon.maxUsageTotal && (
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#c1647a] h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (coupon.currentUsageCount / coupon.maxUsageTotal) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* CA Généré */}
                      <TableCell className="px-3 py-2.5 font-mono text-xs font-bold text-gray-900 whitespace-nowrap">
                        {coupon.revenueGenerated.toLocaleString('fr-FR')} F
                      </TableCell>

                      {/* Statut */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        {getCouponStatusBadge(coupon.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-3 py-2.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCouponStatus(coupon.id)}
                            className="text-[11px] font-medium text-gray-600 hover:text-gray-900 p-1"
                            title={coupon.status === 'actif' ? 'Désactiver' : 'Activer'}
                          >
                            {coupon.status === 'actif' ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (< 1024px) for Coupons */}
          <div className="lg:hidden space-y-3">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-xs space-y-3"
              >
                {/* Header: Code + Copy + Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1 hover:text-[#c1647a] text-gray-400 transition-colors"
                      title="Copier le code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {getCouponStatusBadge(coupon.status)}
                </div>

                {/* Reduction & Conditions */}
                <div className="bg-[#faf8f4] p-2.5 rounded-lg border border-[#f0eee8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Avantage :</span>
                    <div>
                      {coupon.type === 'percentage' && (
                        <span className="font-bold text-sm text-[#c1647a]">
                          -{coupon.value}% de remise
                        </span>
                      )}
                      {coupon.type === 'fixed_amount' && (
                        <span className="font-bold text-sm text-[#166534]">
                          -{coupon.value.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                      {coupon.type === 'free_shipping' && (
                        <span className="text-xs font-bold text-[#3d5a99] flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          Livraison offerte
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="text-gray-400">Condition :</span>
                    <span>
                      {coupon.minOrderAmount
                        ? `Min : ${coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA`
                        : 'Sans minimum d’achat'}
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-[11px] text-gray-500 italic pt-0.5">
                      {coupon.description}
                    </p>
                  )}
                </div>

                {/* Usage progress & CA */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Utilisations :{' '}
                      <strong className="text-gray-800">{coupon.currentUsageCount}</strong> /{' '}
                      {coupon.maxUsageTotal || '∞'}
                    </span>
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {coupon.revenueGenerated.toLocaleString('fr-FR')} FCFA générés
                    </span>
                  </div>
                  {coupon.maxUsageTotal && (
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#c1647a] h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (coupon.currentUsageCount / coupon.maxUsageTotal) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Period & Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0eee8] text-xs">
                  <span className="text-[11px] text-gray-400">
                    Du {coupon.startDate} au {coupon.endDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleCouponStatus(coupon.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        coupon.status === 'actif'
                          ? 'border-[#e7e4dd] text-gray-600 hover:text-amber-600'
                          : 'border-[#24582d]/30 text-[#24582d] bg-[#edf8ef]'
                      }`}
                    >
                      {coupon.status === 'actif' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-1.5 rounded-md border border-[#e7e4dd] text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCoupons.length === 0 && (
              <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-xs text-gray-500">
                Aucun code promotionnel trouvé.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 2 : PROMOTIONS DIRECTES (CATALOGUE)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'promotions' && (
        <div className="space-y-4">
          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom d'offre, badge ou catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-[#e7e4dd]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'active', label: 'En cours' },
                { id: 'programmee', label: 'Programmées' },
                { id: 'terminee', label: 'Terminées' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPromotionStatusFilter(pill.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    promotionStatusFilter === pill.id
                      ? 'bg-[#c1647a] text-white shadow-xs'
                      : 'bg-white border border-[#e7e4dd] text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop DataTable (>= 1024px) */}
          <div className="hidden lg:block bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]/60">
                <TableRow className="border-[#e7e4dd]">
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[200px]">
                    Nom de la promotion
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 max-w-[220px]">
                    Cible (Catégories / Produits)
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[120px]">
                    Remise
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">
                    Badge Boutique
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">
                    Période
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[110px]">
                    Ventes
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[90px]">
                    Statut
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs text-right pr-4 px-3 py-3 w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-gray-500">
                      Aucune promotion directe trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promo) => (
                    <TableRow key={promo.id} className="hover:bg-[#fcfaf7] border-[#f0ede6]">
                      {/* Nom */}
                      <TableCell className="px-3 py-2.5 font-semibold text-xs text-gray-900">
                        {promo.name}
                      </TableCell>

                      {/* Cible */}
                      <TableCell className="max-w-[220px] px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {promo.targetNames.map((target, idx) => (
                            <Badge
                              key={idx}
                              className="bg-gray-100 text-gray-700 border-none text-[10px] py-0 px-1.5"
                            >
                              {target}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      {/* Remise */}
                      <TableCell className="px-3 py-2.5 font-bold text-xs text-[#c1647a]">
                        -{promo.discountPercentage}%
                      </TableCell>

                      {/* Badge Boutique */}
                      <TableCell className="px-3 py-2.5">
                        <span className="inline-block bg-[#fdf2f4] text-[#c1647a] font-semibold text-[10px] px-2 py-0.5 rounded-full border border-[#f0dde2]">
                          {promo.badgeText}
                        </span>
                      </TableCell>

                      {/* Période */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap text-[11px] text-gray-600">
                        <p>{promo.startDate}</p>
                        <p className="text-[10px] text-gray-400">au {promo.endDate}</p>
                      </TableCell>

                      {/* Ventes & CA */}
                      <TableCell className="px-3 py-2.5 text-xs text-gray-800 font-mono">
                        <span className="font-bold">{promo.salesCount}</span> commandes
                      </TableCell>

                      {/* Statut */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        {getPromotionStatusBadge(promo.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-3 py-2.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePromotionStatus(promo.id)}
                            className="text-[11px] font-medium text-gray-600 hover:text-gray-900 p-1"
                          >
                            {promo.status === 'active' ? 'Arrêter' : 'Activer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePromotion(promo.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (< 1024px) for Promotions */}
          <div className="lg:hidden space-y-3">
            {filteredPromotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-xs space-y-3"
              >
                {/* Header: Name, Badge text, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1e2a1f] truncate">{promo.name}</h3>
                    <span className="inline-block bg-[#fdf2f4] text-[#c1647a] font-semibold text-[10px] px-2 py-0.5 rounded-full border border-[#f0dde2] mt-1">
                      {promo.badgeText}
                    </span>
                  </div>
                  {getPromotionStatusBadge(promo.status)}
                </div>

                {/* Discount & Targets */}
                <div className="bg-[#faf8f4] p-2.5 rounded-lg border border-[#f0eee8] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Remise automatique :</span>
                    <span className="font-bold text-sm text-[#c1647a]">
                      -{promo.discountPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1">Cible :</span>
                    <div className="flex flex-wrap gap-1">
                      {promo.targetNames.map((target, idx) => (
                        <Badge
                          key={idx}
                          className="bg-white text-gray-700 border border-[#e7e4dd] text-[10px] py-0 px-2"
                        >
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sales & Period */}
                <div className="flex items-center justify-between text-xs text-gray-600 pt-0.5">
                  <span>
                    Ventes générées : <strong className="text-gray-900 font-mono">{promo.salesCount}</strong>
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Du {promo.startDate} au {promo.endDate}
                  </span>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#f0eee8]">
                  <button
                    type="button"
                    onClick={() => handleTogglePromotionStatus(promo.id)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                      promo.status === 'active'
                        ? 'border-[#e7e4dd] text-gray-600 hover:text-amber-600'
                        : 'border-[#24582d]/30 text-[#24582d] bg-[#edf8ef]'
                    }`}
                  >
                    {promo.status === 'active' ? 'Arrêter' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromotion(promo.id)}
                    className="p-1.5 rounded-md border border-[#e7e4dd] text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredPromotions.length === 0 && (
              <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-xs text-gray-500">
                Aucune promotion directe trouvée.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 3 : CAMPAGNES MARKETING
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'campagnes' && (
        <div className="space-y-4">
          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une campagne ou un contenu de message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-[#e7e4dd]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
              {[
                { id: 'all', label: 'Tous canaux' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'sms', label: 'SMS Direct' },
                { id: 'email', label: 'Email' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCampaignChannelFilter(pill.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    campaignChannelFilter === pill.id
                      ? 'bg-[#c1647a] text-white shadow-xs'
                      : 'bg-white border border-[#e7e4dd] text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop DataTable (>= 1024px) */}
          <div className="hidden lg:block bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]/60">
                <TableRow className="border-[#e7e4dd]">
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[200px] max-w-[200px]">
                    Campagne & Message
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[110px]">
                    Canal
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[160px] max-w-[180px]">
                    Audience
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">
                    Performance
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[130px]">
                    Date / Statut
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs text-right pr-4 px-3 py-3 w-[90px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      Aucune campagne marketing trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <TableRow key={camp.id} className="hover:bg-[#fcfaf7] border-[#f0ede6]">
                      {/* Nom & Message */}
                      <TableCell className="w-[200px] max-w-[200px] px-3 py-2.5">
                        <div className="space-y-0.5 max-w-[200px]">
                          <p className="font-bold text-xs text-gray-900 truncate" title={camp.name}>
                            {camp.name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate italic" title={camp.messageContent}>
                            &ldquo;{camp.messageContent}&rdquo;
                          </p>
                        </div>
                      </TableCell>

                      {/* Canal */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        {getCampaignChannelBadge(camp.channel)}
                      </TableCell>

                      {/* Audience */}
                      <TableCell className="w-[160px] max-w-[180px] px-3 py-2.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-gray-900 truncate" title={camp.audience}>
                            {camp.audience}
                          </p>
                          <p className="text-[10px] text-gray-400 whitespace-nowrap">
                            {camp.recipientCount.toLocaleString('fr-FR')} contacts ciblés
                          </p>
                        </div>
                      </TableCell>

                      {/* Performance */}
                      <TableCell className="px-3 py-2.5">
                        {camp.status === 'envoyee' ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Ouv. :</span>
                              <span className="font-bold text-emerald-700">{camp.openRate}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Clics :</span>
                              <span className="font-medium text-gray-800">{camp.clickRate}%</span>
                              <span className="text-gray-400">({camp.conversionCount} ventes)</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">En attente d&apos;envoi</span>
                        )}
                      </TableCell>

                      {/* Date & Statut */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="text-[11px] text-gray-600 block">
                            {camp.sentAt || camp.scheduledAt || 'Brouillon'}
                          </span>
                          {camp.status === 'envoyee' && (
                            <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[10px] py-0">
                              Envoyée
                            </Badge>
                          )}
                          {camp.status === 'programmee' && (
                            <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none text-[10px] py-0">
                              Programmée
                            </Badge>
                          )}
                          {camp.status === 'brouillon' && (
                            <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] py-0">
                              Brouillon
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-3 py-2.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {camp.status !== 'envoyee' && camp.channel === 'email' && (
                            <Button size="sm" onClick={() => void handleSendCampaign(camp)} className="h-7 text-xs bg-[#c1647a] hover:bg-[#a85266] text-white">
                              Envoyer
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.alert(`${camp.name}\n\n${camp.messageContent}`)}
                            className="h-7 text-xs border-[#e7e4dd]"
                          >
                            Aperçu
                          </Button>
                          {camp.status !== 'envoyee' && (
                            <Button size="sm" variant="outline" onClick={() => void handleDeleteCampaign(camp)} className="h-7 text-xs border-red-200 text-red-600">
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (< 1024px) for Campaigns */}
          <div className="lg:hidden space-y-3">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-xs space-y-3"
              >
                {/* Header: Name, Channel Badge, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1e2a1f] truncate">{camp.name}</h3>
                    <div className="mt-1">{getCampaignChannelBadge(camp.channel)}</div>
                  </div>
                  <div>
                    {camp.status === 'envoyee' && (
                      <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[10px] py-0.5">
                        Envoyée
                      </Badge>
                    )}
                    {camp.status === 'programmee' && (
                      <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none text-[10px] py-0.5">
                        Programmée
                      </Badge>
                    )}
                    {camp.status === 'brouillon' && (
                      <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] py-0.5">
                        Brouillon
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Message preview */}
                <p className="text-xs text-gray-600 italic bg-[#faf8f4] p-2.5 rounded-lg border border-[#f0eee8] leading-relaxed">
                  &ldquo;{camp.messageContent}&rdquo;
                </p>

                {/* Audience & Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Audience</span>
                    <strong className="text-gray-900 text-xs truncate block">{camp.audience}</strong>
                    <span className="text-[10px] text-gray-500">
                      {camp.recipientCount.toLocaleString('fr-FR')} contacts
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Performance</span>
                    {camp.status === 'envoyee' ? (
                      <span className="text-xs text-emerald-700 font-bold block">
                        {camp.openRate}% ouv. • {camp.clickRate}% clics
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic block">En attente</span>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono">
                      {camp.conversionCount} ventes générées
                    </span>
                  </div>
                </div>

                {/* Footer: Date & Preview button */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0eee8] text-xs">
                  <span className="text-[11px] text-gray-400">
                    {camp.sentAt || camp.scheduledAt || 'Brouillon'}
                  </span>
                  <div className="flex gap-1.5">
                    {camp.status !== 'envoyee' && camp.channel === 'email' && (
                      <Button size="sm" onClick={() => void handleSendCampaign(camp)} className="h-8 text-xs bg-[#c1647a] text-white">
                        Envoyer
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.alert(`${camp.name}\n\n${camp.messageContent}`)} className="h-8 text-xs border-[#e7e4dd]">
                      Aperçu
                    </Button>
                    {camp.status !== 'envoyee' && (
                      <Button size="sm" variant="outline" onClick={() => void handleDeleteCampaign(camp)} className="h-8 text-xs border-red-200 text-red-600">
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-xs text-gray-500">
                Aucune campagne marketing trouvée.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 4 : RELANCE PANIERS ABANDONNÉS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'paniers' && (
        <div className="space-y-4">
          {/* Recovery Automation Banner */}
          {cartSettings && (
          <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-gray-900">
                  Automatisation active :
                </span>
                <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[10px]">
                  {cartSettings.autoEnabled ? 'WhatsApp & Email activés' : 'Désactivé'}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-500">
                1ère relance à H+{cartSettings.delayHours1} • 2ème relance à H+{cartSettings.delayHours2}{' '}
                avec code {cartSettings.discountCode} ({cartSettings.discountValue})
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsConfigDialogOpen(true)}
              className="text-xs h-9 sm:h-8 border-[#e7e4dd] bg-white text-gray-700 hover:text-[#c1647a] shrink-0 gap-1 w-full sm:w-auto"
            >
              <Sliders className="h-3.5 w-3.5" />
              Modifier règles
            </Button>
          </div>
          )}

          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom de client, email, téléphone ou article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-[#e7e4dd]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'a_relancer', label: 'À relancer' },
                { id: 'relance_1_envoyee', label: 'Relancés' },
                { id: 'recupere', label: 'Récupérés' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCartStatusFilter(pill.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    cartStatusFilter === pill.id
                      ? 'bg-[#c1647a] text-white shadow-xs'
                      : 'bg-white border border-[#e7e4dd] text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop DataTable (>= 1024px) */}
          <div className="hidden lg:block bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]/60">
                <TableRow className="border-[#e7e4dd]">
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[180px]">
                    Client
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 max-w-[220px]">
                    Articles dans le panier
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[110px]">
                    Total Panier
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[110px]">
                    Abandonné
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[130px]">
                    Statut relance
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs text-right pr-4 px-3 py-3 w-[170px]">
                    Action de relance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      Aucun panier abandonné trouvé pour ces critères.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCarts.map((cart) => (
                    <TableRow key={cart.id} className="hover:bg-[#fcfaf7] border-[#f0ede6]">
                      {/* Client */}
                      <TableCell className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-gray-900">{cart.customerName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{cart.customerPhone}</p>
                          <p className="text-[10px] text-gray-400">{cart.customerEmail}</p>
                        </div>
                      </TableCell>

                      {/* Articles */}
                      <TableCell className="max-w-[220px] px-3 py-2.5">
                        <div className="space-y-1">
                          {cart.items.map((it, idx) => (
                            <p key={idx} className="text-xs text-gray-800 truncate">
                              <span className="font-bold">{it.quantity}x</span> {it.productName}
                            </p>
                          ))}
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="px-3 py-2.5 font-mono text-xs font-bold text-gray-900 whitespace-nowrap">
                        {cart.total.toLocaleString('fr-FR')} FCFA
                      </TableCell>

                      {/* Abandonné */}
                      <TableCell className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {cart.abandonedAt}
                        </span>
                      </TableCell>

                      {/* Statut relance */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {getCartStatusBadge(cart.status)}
                          {cart.lastReminderAt && (
                            <p className="text-[10px] text-gray-400">
                              Dernier envoi : {cart.lastReminderAt} ({cart.recoveryChannel})
                            </p>
                          )}
                          {cart.recoveredAt && (
                            <p className="text-[10px] text-emerald-600 font-medium">
                              Converti : {cart.recoveredAt}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-3 py-2.5 text-right pr-4 whitespace-nowrap">
                        {cart.status !== 'recupere' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleSendCartReminder(cart, 'whatsapp')}
                              className="h-7 px-2.5 text-[11px] font-semibold bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#128C7E] text-white gap-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Relancer par WhatsApp"
                            >
                              <WhatsAppButtonIcon size={14} className="shrink-0" />
                              WhatsApp
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendCartReminder(cart, 'email')}
                              className="h-7 px-2 text-[11px] font-semibold border-[#e7e4dd] text-gray-700 hover:text-[#c1647a] gap-1"
                              title="Relancer par Email"
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkCartRecovered(cart.id)}
                              className="h-7 w-7 p-0 text-emerald-700 hover:bg-emerald-50"
                              title="Marquer comme converti"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Commande passée
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (< 1024px) for Abandoned Carts */}
          <div className="lg:hidden space-y-3">
            {filteredCarts.map((cart) => (
              <div
                key={cart.id}
                className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-xs space-y-3"
              >
                {/* Header: Customer Name, Abandoned time, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1e2a1f] truncate">{cart.customerName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-mono">{cart.customerPhone}</span>
                      <span>•</span>
                      <span className="truncate">{cart.customerEmail}</span>
                    </div>
                  </div>
                  {getCartStatusBadge(cart.status)}
                </div>

                {/* Items in cart */}
                <div className="bg-[#faf8f4] p-2.5 rounded-lg border border-[#f0eee8] space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
                    Articles abandonnés :
                  </span>
                  <div className="space-y-1">
                    {cart.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                        <span className="truncate">
                          <strong className="text-gray-900">{it.quantity}x</strong> {it.productName}
                        </span>
                        <span className="font-mono text-gray-500 shrink-0 ml-2">
                          {it.unitPrice.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#e7e4dd] text-xs">
                    <span className="font-semibold text-gray-600">Total Panier :</span>
                    <span className="font-bold font-mono text-sm text-[#1e2a1f]">
                      {cart.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Status info & Abandoned time */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3 text-gray-400" />
                    Abandonné {cart.abandonedAt}
                  </span>
                  {cart.lastReminderAt && (
                    <span className="text-[10px] text-gray-400">
                      Relancé : {cart.lastReminderAt}
                    </span>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-2 border-t border-[#f0eee8]">
                  {cart.status !== 'recupere' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendCartReminder(cart, 'whatsapp')}
                        className="flex-1 h-9 px-3 text-xs font-semibold bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#128C7E] text-white gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <WhatsAppButtonIcon size={16} className="shrink-0" />
                        <span>WhatsApp</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendCartReminder(cart, 'email')}
                        className="h-9 px-3 text-xs font-semibold border-[#e7e4dd] text-gray-700 hover:text-[#c1647a] gap-1"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkCartRecovered(cart.id)}
                        className="h-9 w-9 p-0 text-emerald-700 hover:bg-emerald-50 shrink-0 border border-emerald-200"
                        title="Marquer comme converti"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold bg-[#edf8ef] py-1.5 rounded-lg border border-[#b0c8a8]/40">
                      <CheckCircle className="h-4 w-4" />
                      <span>Panier converti en commande passée</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredCarts.length === 0 && (
              <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-xs text-gray-500">
                Aucun panier abandonné trouvé pour ces critères.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateCouponDialog
        isOpen={isCouponDialogOpen}
        onOpenChange={setIsCouponDialogOpen}
        onCreate={async (newCoupon) => {
          try {
            await createAdminCoupon({
              code: newCoupon.code,
              type: newCoupon.type,
              value: newCoupon.value,
              minOrderAmount: newCoupon.minOrderAmount,
              maxUsageTotal: newCoupon.maxUsageTotal,
              startDate: newCoupon.startDate,
              endDate: newCoupon.endDate,
              description: newCoupon.description,
              maxUsagePerCustomer: newCoupon.maxUsagePerCustomer,
            });
            toast.success(`Code promo ${newCoupon.code} créé.`);
            await loadData(true);
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Création du code impossible.');
            return false;
          }
        }}
      />

      <CreatePromotionDialog
        isOpen={isPromotionDialogOpen}
        onOpenChange={setIsPromotionDialogOpen}
        onCreate={async (newPromo) => {
          try {
            await createAdminPromotion({
              name: newPromo.name,
              discountPercentage: newPromo.discountPercentage,
              startDate: newPromo.startDate,
              endDate: newPromo.endDate,
              badgeText: newPromo.badgeText,
              targetType: newPromo.targetType,
              targetNames: newPromo.targetNames,
              targetIds: newPromo.targetIds,
            });
            toast.success(`Promotion « ${newPromo.name} » créée.`);
            await loadData(true);
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Création de la promotion impossible.');
            return false;
          }
        }}
      />

      <CreateCampaignDialog
        isOpen={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        onCreate={async (newCamp) => {
          try {
            await createAdminCampaign({
              name: newCamp.name,
              channel: newCamp.channel,
              audience: newCamp.audience,
              messageContent: newCamp.messageContent,
            });
            toast.success(`Campagne « ${newCamp.name} » enregistrée en brouillon.`);
            await loadData(true);
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Création de la campagne impossible.');
            return false;
          }
        }}
      />

      {cartSettings && (
      <CartRecoveryConfigDialog
        isOpen={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        settings={cartSettings}
        onSave={async (newSettings) => {
          try {
            setCartSettings(await updateCartRecoverySettings(newSettings));
            toast.success('Paramètres de relance enregistrés.');
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
            return false;
          }
        }}
      />
      )}
    </div>
  );
}
