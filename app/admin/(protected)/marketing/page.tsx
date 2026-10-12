'use client';

import { useState, useMemo } from 'react';
import {
  adminCoupons,
  adminPromotions,
  adminCampaigns,
  adminAbandonedCarts,
  defaultCartRecoverySettings,
  type AdminCoupon,
  type AdminPromotion,
  type AdminCampaign,
  type AdminAbandonedCart,
  type CartRecoverySettings,
  type CouponStatus,
  type PromotionStatus,
  type CampaignChannel,
  type CartRecoveryStatus,
} from '@/lib/admin/mock-data';
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
  Sparkles,
  Percent,
  Banknote,
  Truck,
  MessageCircle,
  Smartphone,
  Mail,
  Copy,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Sliders,
  Send,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppColorIcon } from '@/components/icons';
import { CreateCouponDialog } from '@/components/admin/create-coupon-dialog';
import { CreatePromotionDialog } from '@/components/admin/create-promotion-dialog';
import { CreateCampaignDialog } from '@/components/admin/create-campaign-dialog';
import { CartRecoveryConfigDialog } from '@/components/admin/cart-recovery-config-dialog';

export default function AdminMarketingPage() {
  // Main Top-level tab: 'coupons' | 'promotions' | 'campagnes' | 'paniers'
  const [activeTab, setActiveTab] = useState<'coupons' | 'promotions' | 'campagnes' | 'paniers'>('coupons');

  // State data
  const [coupons, setCoupons] = useState<AdminCoupon[]>(adminCoupons);
  const [promotions, setPromotions] = useState<AdminPromotion[]>(adminPromotions);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>(adminCampaigns);
  const [abandonedCarts, setAbandonedCarts] = useState<AdminAbandonedCart[]>(adminAbandonedCarts);
  const [cartSettings, setCartSettings] = useState<CartRecoverySettings>(defaultCartRecoverySettings);

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

  // KPIs
  const kpiStats = useMemo(() => {
    const totalCouponRev = coupons.reduce((sum, c) => sum + c.revenueGenerated, 0);
    const totalPromoRev = promotions.reduce((sum, p) => sum + p.revenueGenerated, 0);
    const totalCampaignRev = campaigns.reduce((sum, cmp) => sum + cmp.revenueGenerated, 0);
    const totalMarketingRevenue = totalCouponRev + totalPromoRev + totalCampaignRev;

    const activeCouponsCount = coupons.filter((c) => c.status === 'actif').length;
    const activePromosCount = promotions.filter((p) => p.status === 'active').length;

    const recoveredCarts = abandonedCarts.filter((c) => c.status === 'recupere');
    const recoveredRevenue = recoveredCarts.reduce((sum, c) => sum + c.total, 0);
    const recoveryRate =
      abandonedCarts.length > 0
        ? Math.round((recoveredCarts.length / abandonedCarts.length) * 100)
        : 0;

    return {
      totalRevenue: totalMarketingRevenue,
      activeCouponsCount,
      activePromosCount,
      recoveredRevenue,
      recoveryRate,
    };
  }, [coupons, promotions, campaigns, abandonedCarts]);

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

  const handleToggleCouponStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const nextStatus: CouponStatus = c.status === 'actif' ? 'inactif' : 'actif';
          toast.info(`Code ${c.code} ${nextStatus === 'actif' ? 'activé' : 'désactivé'}`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    toast.info('Code promotionnel supprimé');
  };

  const handleTogglePromotionStatus = (promoId: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const nextStatus: PromotionStatus = p.status === 'active' ? 'inactive' : 'active';
          toast.info(`Promotion "${p.name}" passée en ${nextStatus}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleDeletePromotion = (promoId: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promoId));
    toast.info('Promotion supprimée du catalogue');
  };

  const handleSendCartReminder = (cart: AdminAbandonedCart, channel: 'whatsapp' | 'email') => {
    const nowTime = `Aujourd’hui à ${new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    setAbandonedCarts((prev) =>
      prev.map((c) => {
        if (c.id === cart.id) {
          return {
            ...c,
            status: 'relance_1_envoyee',
            lastReminderAt: nowTime,
            recoveryChannel: channel,
          };
        }
        return c;
      })
    );

    if (channel === 'whatsapp') {
      const cleanPhone = cart.customerPhone.replace(/[^0-9]/g, '');
      const defaultText = encodeURIComponent(
        `Bonjour ${cart.customerName} 🌸 Vous avez laissé des articles dans votre panier Décofleur Plus (total: ${cart.total.toLocaleString('fr-FR')} FCFA). Profitez de notre livraison rapide sur Saly & Mbour pour finaliser votre commande !`
      );
      toast.success(`Message de relance WhatsApp envoyé à ${cart.customerName}`);
      window.open(`https://wa.me/${cleanPhone}?text=${defaultText}`, '_blank');
    } else {
      toast.success(`Email de relance envoyé avec succès à ${cart.customerEmail}`);
    }
  };

  const handleMarkCartRecovered = (cartId: string) => {
    setAbandonedCarts((prev) =>
      prev.map((c) => {
        if (c.id === cartId) {
          return {
            ...c,
            status: 'recupere',
            recoveredAt: 'À l’instant',
          };
        }
        return c;
      })
    );
    toast.success('Panier marqué comme récupéré et converti !');
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
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Marketing & Promotions</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">
            Créez des offres attractives, fidélisez vos clients via WhatsApp & SMS et récupérez vos ventes perdues.
          </p>
        </div>

        <div>
          {activeTab === 'coupons' && (
            <Button
              onClick={() => setIsCouponDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Nouveau code promo
            </Button>
          )}

          {activeTab === 'promotions' && (
            <Button
              onClick={() => setIsPromotionDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Lancer une promotion
            </Button>
          )}

          {activeTab === 'campagnes' && (
            <Button
              onClick={() => setIsCampaignDialogOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-4 gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Nouvelle campagne
            </Button>
          )}

          {activeTab === 'paniers' && (
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(true)}
              className="border-[#e7e4dd] text-gray-800 hover:text-[#c1647a] text-xs font-semibold h-10 px-4 gap-1.5 bg-white shadow-xs"
            >
              <Sliders className="h-4 w-4 text-[#c1647a]" />
              Configuration automatique
            </Button>
          )}
        </div>
      </div>

      {/* Top Marketing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>CA Promotionnel généré</span>
            <div className="h-7 w-7 rounded-lg bg-[#fdf2f4] text-[#c1647a] flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">
            {kpiStats.totalRevenue.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +18.4% ce mois-ci
          </p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Offres actives en boutique</span>
            <div className="h-7 w-7 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {kpiStats.activeCouponsCount} codes • {kpiStats.activePromosCount} promos
          </p>
          <p className="text-[11px] text-gray-500 font-medium">
            Surveillance en temps réel
          </p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Taux de réactivité campagnes</span>
            <div className="h-7 w-7 rounded-lg bg-[#e5eaff] text-[#3d5a99] flex items-center justify-center">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">94.2% WhatsApp</p>
          <p className="text-[11px] text-[#3d5a99] font-medium">
            32.5% de taux de clics
          </p>
        </div>

        <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Paniers récupérés</span>
            <div className="h-7 w-7 rounded-lg bg-[#fff8cc] text-[#9a7b00] flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">
            {kpiStats.recoveredRevenue.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {kpiStats.recoveryRate}% des paniers convertis
          </p>
        </div>
      </div>

      {/* Main Top Navigation Tabs */}
      <div className="flex border-b border-[#e7e4dd] gap-2 overflow-x-auto overflow-y-hidden">
        <button
          onClick={() => {
            setActiveTab('coupons');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Codes promo & Coupons</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {coupons.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('promotions');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
            activeTab === 'promotions'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BadgePercent className="h-4 w-4" />
          <span>Promotions directes</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {promotions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('campagnes');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
            activeTab === 'campagnes'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Campagnes marketing</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('paniers');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
            activeTab === 'paniers'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Relance paniers</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {abandonedCarts.length}
          </span>
        </button>
      </div>

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

            <div className="flex flex-wrap items-center gap-1.5">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

          {/* DataTable */}
          <div className="bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
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

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'active', label: 'En cours' },
                { id: 'programmee', label: 'Programmées' },
                { id: 'terminee', label: 'Terminées' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPromotionStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

          {/* DataTable */}
          <div className="bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
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

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tous canaux' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'sms', label: 'SMS Direct' },
                { id: 'email', label: 'Email' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCampaignChannelFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

          {/* DataTable */}
          <div className="bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast.info(`Message : "${camp.messageContent}"`);
                          }}
                          className="h-7 text-xs border-[#e7e4dd]"
                        >
                          Aperçu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 4 : RELANCE PANIERS ABANDONNÉS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'paniers' && (
        <div className="space-y-4">
          {/* Recovery Automation Banner */}
          <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
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
              className="text-xs h-8 border-[#e7e4dd] bg-white text-gray-700 hover:text-[#c1647a] shrink-0 gap-1"
            >
              <Sliders className="h-3.5 w-3.5" />
              Modifier règles
            </Button>
          </div>

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

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'a_relancer', label: 'À relancer' },
                { id: 'relance_1_envoyee', label: 'Relancés' },
                { id: 'recupere', label: 'Récupérés' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCartStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

          {/* DataTable */}
          <div className="bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
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
                              className="h-7 px-2.5 text-[11px] font-semibold bg-[#25D366] hover:bg-[#1faa53] text-white gap-1.5 shadow-xs"
                              title="Relancer par WhatsApp"
                            >
                              <WhatsAppColorIcon size={14} className="shrink-0" />
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
        </div>
      )}

      {/* Dialogs */}
      <CreateCouponDialog
        isOpen={isCouponDialogOpen}
        onOpenChange={setIsCouponDialogOpen}
        onCreate={(newCoupon) => setCoupons((prev) => [newCoupon, ...prev])}
      />

      <CreatePromotionDialog
        isOpen={isPromotionDialogOpen}
        onOpenChange={setIsPromotionDialogOpen}
        onCreate={(newPromo) => setPromotions((prev) => [newPromo, ...prev])}
      />

      <CreateCampaignDialog
        isOpen={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        onCreate={(newCamp) => setCampaigns((prev) => [newCamp, ...prev])}
      />

      <CartRecoveryConfigDialog
        isOpen={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        settings={cartSettings}
        onSave={(newSettings) => setCartSettings(newSettings)}
      />
    </div>
  );
}
