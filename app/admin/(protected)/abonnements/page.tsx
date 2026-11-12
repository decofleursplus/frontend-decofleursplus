'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Repeat,
  Search,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  MoreHorizontal,
  Eye,
  AlertCircle,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Pencil,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getAdminSubscription,
  getAdminSubscriptions,
  updateAdminSubscriptionDelivery,
  updateAdminSubscriptionStatus,
  type AdminSubscriptionStats,
} from '@/lib/api/admin/subscriptions';
import type {
  CustomerSubscription,
  SubscriptionDelivery,
  SubscriptionDeliveryStatus,
  SubscriptionFrequency,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@/lib/api/subscriptions';
import { ApiClientError } from '@/lib/api/client';

const PAGE_SIZE = 20;

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  PARTICULIER: 'Particulier',
  PRESTIGE: 'Prestige',
  ENTREPRISE: 'Entreprise',
};

const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  HEBDOMADAIRE: 'Hebdomadaire',
  BIMENSUELLE: 'Bimensuelle',
};

const PAYMENT_LABELS: Record<string, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  FREE_MONEY: 'Free Money',
  CARD: 'Carte bancaire',
  CASH_ON_DELIVERY: 'Espèces à la livraison',
};

const DELIVERY_STATUS_LABELS: Record<SubscriptionDeliveryStatus, string> = {
  SCHEDULED: 'Programmé',
  PREPARING: 'En préparation',
  DELIVERED: 'Livré',
  SKIPPED: 'Non effectué',
};

const DELIVERY_STATUS_STYLES: Record<SubscriptionDeliveryStatus, string> = {
  SCHEDULED: 'bg-stone-100 text-stone-700',
  PREPARING: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  SKIPPED: 'bg-rose-100 text-rose-800',
};

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiClientError) {
    const details = err.details?.map((d) => d.message).join(' ; ');
    return details ? `${err.message} : ${details}` : err.message;
  }
  return fallback;
}

function formatPrice(val: number) {
  return `${val.toLocaleString('fr-FR')} FCFA`;
}

function formatDate(iso: string, withYear = true) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: withYear ? 'long' : 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

function dayLabel(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Actif
        </Badge>
      );
    case 'PAUSED':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none flex items-center gap-1 font-medium">
          <PauseCircle className="w-3 h-3 text-amber-600" />
          En pause
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none flex items-center gap-1 font-medium">
          <XCircle className="w-3 h-3 text-rose-600" />
          Résilié
        </Badge>
      );
    default:
      return (
        <Badge className="bg-stone-200 text-stone-700 hover:bg-stone-200 border-none flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3" />
          Expiré
        </Badge>
      );
  }
}

function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const styles: Record<SubscriptionPlan, string> = {
    PRESTIGE: 'bg-purple-100 text-purple-800',
    ENTREPRISE: 'bg-blue-100 text-blue-800',
    PARTICULIER: 'bg-stone-100 text-stone-800',
  };
  return <Badge className={`${styles[plan]} border-none`}>{PLAN_LABELS[plan] ?? plan}</Badge>;
}

export default function AdminAbonnementsPage() {
  // ── Liste paginée (filtres, recherche et statistiques côté serveur) ──
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [stats, setStats] = useState<AdminSubscriptionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubscriptionStatus>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | SubscriptionPlan>('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState<'ALL' | SubscriptionFrequency>('ALL');

  // ── Fiche détail (GET /admin/subscriptions/:id) ──
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerSubscription | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── Actions ──
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CustomerSubscription | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [editingDelivery, setEditingDelivery] = useState<SubscriptionDelivery | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<{
    status: SubscriptionDeliveryStatus;
    vaseReturned: boolean;
    notes: string;
  }>({ status: 'SCHEDULED', vaseReturned: false, notes: '' });
  const [savingDelivery, setSavingDelivery] = useState(false);

  const hasFilters =
    search !== '' || statusFilter !== 'ALL' || planFilter !== 'ALL' || frequencyFilter !== 'ALL';

  // Recherche : envoyée au serveur après une courte pause de saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchList = useCallback(
    () =>
      getAdminSubscriptions({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        plan: planFilter !== 'ALL' ? planFilter : undefined,
        frequency: frequencyFilter !== 'ALL' ? frequencyFilter : undefined,
      }),
    [page, search, statusFilter, planFilter, frequencyFilter]
  );

  const applyList = (res: Awaited<ReturnType<typeof getAdminSubscriptions>>) => {
    setSubscriptions(res.items);
    setStats(res.stats);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setListError(null);
  };

  // Chargement dérivé : tant que la requête courante (filtres + essai) n'est pas terminée, on affiche le chargement.
  const [retry, setRetry] = useState(0);
  const listKey = JSON.stringify([page, search, statusFilter, planFilter, frequencyFilter, retry]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== listKey;

  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((res) => {
        if (!cancelled) applyList(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setListError(errorMessage(err, 'Impossible de charger les abonnements.'));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(listKey);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchList, listKey]);

  /** 'initial' relance un chargement complet (bouton Réessayer) ; 'refresh' recharge en arrière-plan. */
  const loadData = async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setListError(null);
      setRetry((n) => n + 1);
      return;
    }
    setRefreshing(true);
    try {
      applyList(await fetchList());
    } catch (err) {
      setListError(errorMessage(err, 'Impossible de charger les abonnements.'));
    } finally {
      setRefreshing(false);
    }
  };

  const loadDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) {
      setDetailLoading(true);
      setDetail(null);
    }
    setDetailError(null);
    try {
      setDetail(await getAdminSubscription(id));
    } catch (err) {
      setDetailError(errorMessage(err, 'Impossible de charger la fiche de l’abonnement.'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openDetail = (id: string) => {
    setDetailId(id);
    setEditingDelivery(null);
    loadDetail(id);
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetail(null);
    setDetailError(null);
    setEditingDelivery(null);
  };

  /** Recharge la liste (et les statistiques) puis la fiche ouverte, après une modification. */
  const refreshAfterMutation = async (subscriptionId: string) => {
    await Promise.all([
      loadData('refresh'),
      detailId === subscriptionId ? loadDetail(subscriptionId, true) : Promise.resolve(),
    ]);
  };

  const handleUpdateStatus = async (
    sub: CustomerSubscription,
    newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED',
    reason?: string
  ): Promise<boolean> => {
    setStatusUpdatingId(sub.id);
    try {
      await updateAdminSubscriptionStatus(sub.id, { status: newStatus, reason });
      toast.success(
        newStatus === 'ACTIVE'
          ? `Abonnement ${sub.subscriptionNumber} repris : les passages sont reprogrammés.`
          : newStatus === 'PAUSED'
            ? `Abonnement ${sub.subscriptionNumber} mis en pause.`
            : `Abonnement ${sub.subscriptionNumber} résilié.`
      );
      await refreshAfterMutation(sub.id);
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'La mise à jour de l’abonnement a échoué.'));
      return false;
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openCancelDialog = (sub: CustomerSubscription) => {
    setCancelReason('');
    setCancelTarget(sub);
  };

  const confirmCancel = async () => {
    if (!cancelTarget || cancelReason.trim().length < 3) return;
    const ok = await handleUpdateStatus(cancelTarget, 'CANCELLED', cancelReason.trim());
    if (ok) setCancelTarget(null);
  };

  const startEditDelivery = (delivery: SubscriptionDelivery) => {
    setEditingDelivery(delivery);
    setDeliveryForm({
      status: delivery.status,
      vaseReturned: delivery.vaseReturned,
      notes: delivery.notes ?? '',
    });
  };

  const saveDelivery = async () => {
    if (!editingDelivery || !detail) return;
    setSavingDelivery(true);
    try {
      await updateAdminSubscriptionDelivery(editingDelivery.id, {
        status: deliveryForm.status !== editingDelivery.status ? deliveryForm.status : undefined,
        vaseReturned: deliveryForm.vaseReturned,
        notes: deliveryForm.notes.trim() || null,
      });
      toast.success(
        `Passage du ${formatDate(editingDelivery.scheduledDate)} mis à jour (${DELIVERY_STATUS_LABELS[deliveryForm.status].toLowerCase()}).`
      );
      setEditingDelivery(null);
      await refreshAfterMutation(detail.id);
    } catch (err) {
      toast.error(errorMessage(err, 'La mise à jour du passage a échoué.'));
    } finally {
      setSavingDelivery(false);
    }
  };

  const renderStatusActions = (sub: CustomerSubscription, variant: 'menu' | 'buttons') => {
    const busy = statusUpdatingId === sub.id;
    const canResume = sub.status === 'PAUSED';
    const canPause = sub.status === 'ACTIVE';
    const canCancel = sub.status === 'ACTIVE' || sub.status === 'PAUSED';

    if (variant === 'menu') {
      return (
        <>
          {canResume && (
            <DropdownMenuItem disabled={busy} onClick={() => handleUpdateStatus(sub, 'ACTIVE')}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
              Reprendre l’abonnement
            </DropdownMenuItem>
          )}
          {canPause && (
            <DropdownMenuItem disabled={busy} onClick={() => handleUpdateStatus(sub, 'PAUSED')}>
              <PauseCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
              Mettre en pause
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem disabled={busy} onClick={() => openCancelDialog(sub)} className="text-rose-600">
              <XCircle className="w-3.5 h-3.5 mr-2 text-rose-600" />
              Résilier l’abonnement
            </DropdownMenuItem>
          )}
        </>
      );
    }

    if (!canResume && !canPause && !canCancel) {
      return (
        <p className="text-xs text-stone-500">
          Cet abonnement est {sub.status === 'CANCELLED' ? 'résilié' : 'expiré'} : son statut ne peut plus
          être modifié.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {canResume && (
          <Button
            onClick={() => handleUpdateStatus(sub, 'ACTIVE')}
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Reprendre l’abonnement
          </Button>
        )}
        {canPause && (
          <Button
            variant="outline"
            onClick={() => handleUpdateStatus(sub, 'PAUSED')}
            disabled={busy}
            className="w-full text-amber-700 border-amber-300 hover:bg-amber-50 text-xs h-9 gap-1.5"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
            Suspendre temporairement (en pause)
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={() => openCancelDialog(sub)}
            disabled={busy}
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-9 gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Résilier définitivement
          </Button>
        )}
      </div>
    );
  };

  const kpi = (value: number | undefined) => (stats ? (value ?? 0).toLocaleString('fr-FR') : '—');

  return (
    <div className="space-y-6 pb-12">
      {/* ── En-tête ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#c1647a]" />
            Abonnements Floraux
          </h1>
          <p className="admin-page-subtitle">
            Gérez les livraisons récurrentes de fleurs fraîches pour particuliers et entreprises.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData('refresh')}
          disabled={refreshing || loading}
          className="h-9 gap-1.5 text-xs text-stone-600 border-stone-200 hover:bg-stone-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* ── Indicateurs (calculés par le serveur sur l'ensemble des abonnements) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="subscription-stats">
        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-medium">Total souscriptions</p>
              <p className="text-2xl font-bold text-stone-900 mt-1" data-testid="stat-total">
                {kpi(stats?.total)}
              </p>
              {stats && stats.cancelled + stats.expired > 0 && (
                <p className="text-[11px] text-stone-400 mt-0.5">
                  dont {stats.cancelled} résilié{stats.cancelled > 1 ? 's' : ''}
                  {stats.expired > 0 ? ` · ${stats.expired} expiré${stats.expired > 1 ? 's' : ''}` : ''}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              <Repeat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-medium">Abonnements actifs</p>
              <p className="text-2xl font-bold text-stone-900 mt-1" data-testid="stat-active">
                {kpi(stats?.active)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 font-medium">En pause</p>
              <p className="text-2xl font-bold text-stone-900 mt-1" data-testid="stat-paused">
                {kpi(stats?.paused)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <PauseCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Revenu mensuel récurrent</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1" data-testid="stat-mrr">
                {kpi(stats?.monthlyRecurringRevenue)} <span className="text-xs text-stone-500">FCFA</span>
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Abonnements actifs uniquement</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filtres et recherche (appliqués côté serveur) ─────── */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par N°, client, tél, email..."
              aria-label="Rechercher un abonnement"
              className="pl-9 text-xs h-9 bg-stone-50/50 border-stone-200"
            />
          </div>

          <select
            value={statusFilter}
            aria-label="Filtrer par statut"
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | SubscriptionStatus);
              setPage(1);
            }}
            className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="PAUSED">En pause</option>
            <option value="CANCELLED">Résilié</option>
            <option value="EXPIRED">Expiré</option>
          </select>

          <select
            value={planFilter}
            aria-label="Filtrer par formule"
            onChange={(e) => {
              setPlanFilter(e.target.value as 'ALL' | SubscriptionPlan);
              setPage(1);
            }}
            className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
          >
            <option value="ALL">Toutes les formules</option>
            <option value="PARTICULIER">Particulier</option>
            <option value="PRESTIGE">Prestige</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>

          <select
            value={frequencyFilter}
            aria-label="Filtrer par fréquence"
            onChange={(e) => {
              setFrequencyFilter(e.target.value as 'ALL' | SubscriptionFrequency);
              setPage(1);
            }}
            className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
          >
            <option value="ALL">Toutes les fréquences</option>
            <option value="HEBDOMADAIRE">Hebdomadaire</option>
            <option value="BIMENSUELLE">Bimensuelle</option>
          </select>
        </div>
      </div>

      {/* ── Table des abonnements ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/60 hover:bg-stone-50/60 text-stone-600">
              <TableHead className="text-xs font-semibold">N° Abonnement</TableHead>
              <TableHead className="text-xs font-semibold">Bénéficiaire</TableHead>
              <TableHead className="text-xs font-semibold">Formule</TableHead>
              <TableHead className="text-xs font-semibold">Fréquence & Jour</TableHead>
              <TableHead className="text-xs font-semibold">Prochain passage</TableHead>
              <TableHead className="text-xs font-semibold">Montant / mois</TableHead>
              <TableHead className="text-xs font-semibold">Statut</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-stone-500 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
                    <p>Chargement des abonnements...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : listError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2" role="alert">
                    <AlertCircle className="h-8 w-8 text-rose-400" />
                    <p className="font-semibold text-stone-800">Les abonnements n’ont pas pu être chargés.</p>
                    <p className="text-stone-500">{listError}</p>
                    <Button variant="outline" size="sm" className="mt-1 h-8 text-xs" onClick={() => loadData()}>
                      Réessayer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-stone-500 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Repeat className="h-8 w-8 text-stone-300" />
                    <p className="font-semibold text-stone-700">
                      {hasFilters ? 'Aucun abonnement ne correspond à ces critères.' : 'Aucun abonnement enregistré.'}
                    </p>
                    <p className="text-stone-400">
                      {hasFilters
                        ? 'Modifiez vos filtres de recherche.'
                        : 'Les souscriptions faites sur le site apparaîtront ici.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell className="font-semibold text-xs text-stone-900">
                    <button type="button" className="hover:underline" onClick={() => openDetail(sub.id)}>
                      {sub.subscriptionNumber}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-stone-900">{sub.recipientName}</p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {sub.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={sub.plan} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs text-stone-800">{FREQUENCY_LABELS[sub.frequency]}</p>
                      <p className="text-[11px] text-stone-500">Le {dayLabel(sub.deliveryDay).toLowerCase()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.nextDeliveryDate ? (
                      <div className="text-xs text-stone-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatDate(sub.nextDeliveryDate, false)}
                        {sub.status === 'ACTIVE' && new Date(sub.nextDeliveryDate) < new Date() && (
                          <span className="ml-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                            En retard
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">Aucun passage prévu</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-stone-900">
                    {formatPrice(sub.monthlyAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions pour ${sub.subscriptionNumber}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-500 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] transition-colors focus:outline-none"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openDetail(sub.id)}>
                          <Eye className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Consulter la fiche
                        </DropdownMenuItem>
                        {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && <DropdownMenuSeparator />}
                        {renderStatusActions(sub, 'menu')}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination serveur */}
        {!loading && !listError && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-stone-200 px-4 py-3 text-xs text-stone-600">
            <span data-testid="pagination-summary">
              {total} abonnement{total > 1 ? 's' : ''} · page {page} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={page <= 1 || refreshing}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={page >= totalPages || refreshing}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fiche détail de l'abonnement ───────────────────────── */}
      <Sheet open={!!detailId} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-xs text-stone-500">
              <SheetHeader className="sr-only">
                <SheetTitle>Fiche abonnement</SheetTitle>
                <SheetDescription>Chargement en cours</SheetDescription>
              </SheetHeader>
              <Loader2 className="h-6 w-6 animate-spin text-[#193e23]" />
              <p>Chargement de la fiche...</p>
            </div>
          )}

          {!detailLoading && detailError && !detail && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-xs text-center" role="alert">
              <SheetHeader className="sr-only">
                <SheetTitle>Fiche abonnement</SheetTitle>
                <SheetDescription>Erreur de chargement</SheetDescription>
              </SheetHeader>
              <AlertCircle className="h-8 w-8 text-rose-400" />
              <p className="font-semibold text-stone-800">La fiche n’a pas pu être chargée.</p>
              <p className="text-stone-500">{detailError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 h-8 text-xs"
                onClick={() => detailId && loadDetail(detailId)}
              >
                Réessayer
              </Button>
            </div>
          )}

          {detail && (
            <div className="space-y-6 pt-2 px-4 pb-6" data-testid="subscription-detail">
              <SheetHeader className="px-0">
                <div className="flex items-center justify-between pr-8">
                  <SheetTitle className="text-lg font-bold text-stone-900">
                    {detail.subscriptionNumber}
                  </SheetTitle>
                  <StatusBadge status={detail.status} />
                </div>
                <SheetDescription className="text-xs text-stone-500">
                  Souscrit le {formatDate(detail.createdAt)}
                  {detail.user
                    ? ` · compte client ${detail.user.firstName} ${detail.user.lastName}`
                    : ' · sans compte client'}
                </SheetDescription>
              </SheetHeader>

              {detail.status === 'PAUSED' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Abonnement en pause{detail.pausedAt ? ` depuis le ${formatDate(detail.pausedAt)}` : ''} : aucun
                  passage n’est effectué. À la reprise, les passages manqués sont marqués « non effectués » et de
                  nouveaux passages sont programmés.
                </div>
              )}
              {detail.status === 'CANCELLED' && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <p className="font-semibold">
                    Résilié{detail.cancelledAt ? ` le ${formatDate(detail.cancelledAt)}` : ''}
                  </p>
                  <p className="mt-1">Motif : {detail.cancellationReason || 'non renseigné'}</p>
                </div>
              )}

              {/* Formule */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-3 border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Formule souscrite :</span>
                  <PlanBadge plan={detail.plan} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Rythme :</span>
                  <span className="font-semibold text-stone-900">
                    {FREQUENCY_LABELS[detail.frequency]} (le {dayLabel(detail.deliveryDay).toLowerCase()}) ·{' '}
                    {detail.deliveriesPerMonth} passages / mois
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Montant par passage :</span>
                  <span className="font-semibold text-stone-900">{formatPrice(detail.perDeliveryPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Prochain passage :</span>
                  <span className="font-semibold text-stone-900">
                    {detail.nextDeliveryDate ? formatDate(detail.nextDeliveryDate) : 'Aucun passage prévu'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200">
                  <span className="font-medium text-stone-700">Montant mensuel :</span>
                  <span className="font-bold text-sm text-[#c1647a]">{formatPrice(detail.monthlyAmount)}</span>
                </div>
              </div>

              {/* Bénéficiaire */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                  Bénéficiaire & adresse
                </h4>
                <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-800">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-medium">{detail.recipientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <a href={`tel:${detail.phone}`} className="hover:underline">
                      {detail.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    {detail.email ? (
                      <a href={`mailto:${detail.email}`} className="hover:underline">
                        {detail.email}
                      </a>
                    ) : (
                      <span className="text-stone-400 italic">Email non renseigné</span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                    <span>
                      {detail.address}, {detail.location}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-800">
                    <Wallet className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                    <span>
                      Règlement souhaité : {PAYMENT_LABELS[detail.paymentMethod] ?? detail.paymentMethod}
                      {detail.paymentPhone ? ` (${detail.paymentPhone})` : ''}
                      <span className="block text-[11px] text-stone-400">
                        Aucun paiement en ligne n’est encaissé pour les abonnements : à convenir avec le client.
                      </span>
                    </span>
                  </div>
                  {detail.notes && (
                    <div className="pt-2 border-t border-stone-100 text-stone-500 italic">« {detail.notes} »</div>
                  )}
                </div>
              </div>

              {/* Passages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Passages ({detail.deliveries?.length ?? 0})
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    {detail.deliveries?.filter((d) => d.status === 'DELIVERED').length ?? 0} livré(s)
                  </span>
                </div>

                {!detail.deliveries || detail.deliveries.length === 0 ? (
                  <p className="text-xs text-stone-500">Aucun passage enregistré pour cet abonnement.</p>
                ) : (
                  <ul className="space-y-2" data-testid="delivery-list">
                    {detail.deliveries.map((delivery) => {
                      const isEditing = editingDelivery?.id === delivery.id;
                      const isPending = delivery.status === 'SCHEDULED' || delivery.status === 'PREPARING';
                      const isLate = isPending && detail.status === 'ACTIVE' && new Date(delivery.scheduledDate) < new Date();
                      return (
                        <li
                          key={delivery.id}
                          data-delivery-status={delivery.status}
                          className="rounded-lg border border-stone-200 bg-white p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-stone-800">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-medium">{formatDate(delivery.scheduledDate)}</span>
                              {isLate && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                                  En retard
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${DELIVERY_STATUS_STYLES[delivery.status]}`}
                              >
                                {DELIVERY_STATUS_LABELS[delivery.status]}
                              </span>
                              {!isEditing && (
                                <button
                                  type="button"
                                  aria-label={`Modifier le passage du ${formatDate(delivery.scheduledDate)}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                                  onClick={() => startEditDelivery(delivery)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {!isEditing && (delivery.deliveredAt || delivery.vaseReturned || delivery.notes) && (
                            <div className="mt-2 space-y-0.5 text-[11px] text-stone-500">
                              {delivery.deliveredAt && (
                                <p>
                                  Livré le{' '}
                                  {new Date(delivery.deliveredAt).toLocaleString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                              {delivery.vaseReturned && <p>Vase précédent récupéré</p>}
                              {delivery.notes && <p className="italic">« {delivery.notes} »</p>}
                            </div>
                          )}

                          {isEditing && (
                            <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
                              <div className="space-y-1">
                                <Label htmlFor={`delivery-status-${delivery.id}`} className="text-[11px] text-stone-600">
                                  Statut du passage
                                </Label>
                                <select
                                  id={`delivery-status-${delivery.id}`}
                                  value={deliveryForm.status}
                                  onChange={(e) =>
                                    setDeliveryForm((prev) => ({
                                      ...prev,
                                      status: e.target.value as SubscriptionDeliveryStatus,
                                    }))
                                  }
                                  className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
                                >
                                  {(Object.keys(DELIVERY_STATUS_LABELS) as SubscriptionDeliveryStatus[]).map((status) => (
                                    <option
                                      key={status}
                                      value={status}
                                      disabled={
                                        detail.status !== 'ACTIVE' && status !== 'SKIPPED' && status !== delivery.status
                                      }
                                    >
                                      {DELIVERY_STATUS_LABELS[status]}
                                    </option>
                                  ))}
                                </select>
                                {detail.status !== 'ACTIVE' && (
                                  <p className="text-[11px] text-stone-400">
                                    L’abonnement n’est pas actif : un passage peut seulement être marqué « non effectué ».
                                  </p>
                                )}
                              </div>

                              <label className="flex items-center gap-2 text-xs text-stone-700">
                                <input
                                  type="checkbox"
                                  checked={deliveryForm.vaseReturned}
                                  onChange={(e) =>
                                    setDeliveryForm((prev) => ({ ...prev, vaseReturned: e.target.checked }))
                                  }
                                  className="h-4 w-4 accent-[#24582d]"
                                />
                                Vase précédent récupéré
                              </label>

                              <div className="space-y-1">
                                <Label htmlFor={`delivery-notes-${delivery.id}`} className="text-[11px] text-stone-600">
                                  Note interne
                                </Label>
                                <Textarea
                                  id={`delivery-notes-${delivery.id}`}
                                  value={deliveryForm.notes}
                                  maxLength={1000}
                                  onChange={(e) => setDeliveryForm((prev) => ({ ...prev, notes: e.target.value }))}
                                  placeholder="Ex : remis au gardien, client absent..."
                                  className="min-h-[60px] text-xs"
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  disabled={savingDelivery}
                                  onClick={() => setEditingDelivery(null)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-[#24582d] hover:bg-[#193e23] text-white gap-1.5"
                                  disabled={savingDelivery}
                                  onClick={saveDelivery}
                                >
                                  {savingDelivery && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  Enregistrer le passage
                                </Button>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {detail.status === 'ACTIVE' && (
                  <p className="text-[11px] text-stone-400">
                    Dès qu’un passage est livré ou marqué « non effectué », le passage suivant est programmé
                    automatiquement.
                  </p>
                )}
              </div>

              {/* Statut */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Gestion du statut
                </h4>
                {renderStatusActions(detail, 'buttons')}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Résiliation : motif obligatoire ───────────────────── */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="w-[94vw] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Résilier l’abonnement {cancelTarget?.subscriptionNumber}</DialogTitle>
            <DialogDescription>
              La résiliation est définitive : les passages restants de {cancelTarget?.recipientName} seront
              annulés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs">
              Motif de résiliation <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              maxLength={500}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex : demande du client par téléphone, impayés, déménagement..."
              className="min-h-[80px] text-sm"
            />
            <p className="text-[11px] text-stone-400">3 caractères minimum. Le motif est conservé sur la fiche.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={!!statusUpdatingId}>
              Conserver l’abonnement
            </Button>
            <Button
              onClick={confirmCancel}
              disabled={cancelReason.trim().length < 3 || !!statusUpdatingId}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              {statusUpdatingId && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmer la résiliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
