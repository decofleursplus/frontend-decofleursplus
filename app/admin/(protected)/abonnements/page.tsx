'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Repeat,
  Search,
  Filter,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Calendar,
  Truck,
  User,
  Phone,
  MapPin,
  RefreshCw,
  MoreHorizontal,
  Eye,
  AlertCircle,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  getAdminSubscriptions,
  updateAdminSubscriptionStatus,
} from '@/lib/api/admin/subscriptions';
import type { CustomerSubscription, SubscriptionStatus } from '@/lib/api/subscriptions';

// Données de secours réalistes pour le Sénégal (Saly, Dakar)
const initialMockSubscriptions: CustomerSubscription[] = [
  {
    id: 'sub-001',
    subscriptionNumber: 'ABN-2026-001',
    plan: 'PRESTIGE',
    frequency: 'HEBDOMADAIRE',
    deliveryDay: 'MARDI',
    status: 'ACTIVE',
    recipientName: 'Aïssatou Diop',
    phone: '+221 77 123 45 67',
    email: 'aissatou.diop@example.sn',
    location: 'Dakar (Almadies)',
    address: 'Route des Almadies, Villa 42',
    notes: 'Déposer à l’accueil auprès du gardien',
    paymentMethod: 'WAVE',
    perDeliveryPrice: 35000,
    monthlyAmount: 140000,
    deliveriesPerMonth: 4,
    startDate: '2026-01-10T10:00:00Z',
    nextDeliveryDate: '2026-11-04T09:00:00Z',
    createdAt: '2026-01-08T15:20:00Z',
  },
  {
    id: 'sub-002',
    subscriptionNumber: 'ABN-2026-002',
    plan: 'ENTREPRISE',
    frequency: 'HEBDOMADAIRE',
    deliveryDay: 'VENDREDI',
    status: 'ACTIVE',
    recipientName: 'Hôtel Le Lamantin Beach',
    phone: '+221 78 987 65 43',
    email: 'direction@lelamantin.sn',
    location: 'Saly Portudal',
    address: 'Zone Hôtelière, Saly',
    notes: 'Composition florale pour le comptoir d’accueil du lobby',
    paymentMethod: 'ORANGE_MONEY',
    perDeliveryPrice: 50000,
    monthlyAmount: 200000,
    deliveriesPerMonth: 4,
    startDate: '2025-11-01T08:00:00Z',
    nextDeliveryDate: '2026-11-07T10:30:00Z',
    createdAt: '2025-10-25T11:45:00Z',
  },
  {
    id: 'sub-003',
    subscriptionNumber: 'ABN-2026-003',
    plan: 'PARTICULIER',
    frequency: 'BIMENSUELLE',
    deliveryDay: 'SAMEDI',
    status: 'PAUSED',
    recipientName: 'Fatou Ndiaye',
    phone: '+221 76 543 21 09',
    email: 'fatou.ndiaye@gmail.com',
    location: 'Mbour',
    address: 'Quartier Grand Mbour, Rue 12',
    notes: 'En voyage jusqu’à la fin du mois',
    paymentMethod: 'WAVE',
    perDeliveryPrice: 20000,
    monthlyAmount: 40000,
    deliveriesPerMonth: 2,
    startDate: '2026-03-05T09:00:00Z',
    nextDeliveryDate: null,
    pausedAt: '2026-10-15T14:00:00Z',
    createdAt: '2026-03-01T16:10:00Z',
  },
];

export default function AdminAbonnementsPage() {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>(initialMockSubscriptions);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSub, setSelectedSub] = useState<CustomerSubscription | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubscriptionStatus>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminSubscriptions({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        plan: planFilter !== 'ALL' ? planFilter : undefined,
        frequency: frequencyFilter !== 'ALL' ? frequencyFilter : undefined,
      });

      if (res && res.subscriptions && res.subscriptions.length > 0) {
        setSubscriptions(res.subscriptions);
      }
    } catch {
      toast.warning('Chargement des abonnements locaux (mode hors-ligne)');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, planFilter, frequencyFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrage local en complément
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        search === '' ||
        sub.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
        sub.recipientName.toLowerCase().includes(search.toLowerCase()) ||
        sub.phone.includes(search) ||
        (sub.location && sub.location.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
      const matchesPlan = planFilter === 'ALL' || sub.plan === planFilter;
      const matchesFreq = frequencyFilter === 'ALL' || sub.frequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesFreq;
    });
  }, [subscriptions, search, statusFilter, planFilter, frequencyFilter]);

  // Statistiques
  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const paused = subscriptions.filter((s) => s.status === 'PAUSED').length;
    const mrr = subscriptions
      .filter((s) => s.status === 'ACTIVE')
      .reduce((acc, s) => acc + (s.monthlyAmount || 0), 0);

    return { total, active, paused, mrr };
  }, [subscriptions]);

  // Actions de statut
  const handleUpdateStatus = async (
    subId: string,
    newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  ) => {
    try {
      await updateAdminSubscriptionStatus(subId, { status: newStatus });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
      );
      if (selectedSub?.id === subId) {
        setSelectedSub((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(
        `Abonnement ${newStatus === 'ACTIVE' ? 'réactivé' : newStatus === 'PAUSED' ? 'mis en pause' : 'annulé'}`
      );
    } catch {
      toast.error('Erreur lors de la mise à jour de l’abonnement');
    }
  };

  const formatPrice = (val: number) => {
    return `${val.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
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
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'PRESTIGE':
        return <Badge className="bg-purple-100 text-purple-800 border-none">Prestige</Badge>;
      case 'ENTREPRISE':
        return <Badge className="bg-blue-100 text-blue-800 border-none">Entreprise</Badge>;
      default:
        return <Badge className="bg-stone-100 text-stone-800 border-none">Particulier</Badge>;
    }
  };

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
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="h-9 gap-1.5 text-xs text-stone-600 border-stone-200 hover:bg-stone-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* ── Cartes KPIs ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-medium">Total Souscriptions</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              <Repeat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-medium">Abonnements Actifs</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 font-medium">En Pause</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.paused}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <PauseCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Revenu Mensuel (MRR)</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                {stats.mrr.toLocaleString('fr-FR')} <span className="text-xs text-stone-500">FCFA</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filtres et Recherche ──────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par N°, client, tél..."
              className="pl-9 text-xs h-9 bg-stone-50/50 border-stone-200"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actif uniquement</option>
              <option value="PAUSED">En pause</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
            >
              <option value="ALL">Toutes les formules</option>
              <option value="PARTICULIER">Particulier</option>
              <option value="PRESTIGE">Prestige</option>
              <option value="ENTREPRISE">Entreprise</option>
            </select>
          </div>

          <div>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded-md bg-stone-50/50 border border-stone-200 text-stone-700"
            >
              <option value="ALL">Toutes les fréquences</option>
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="BIMENSUELLE">Bimensuelle</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table des Abonnements ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/60 hover:bg-stone-50/60 text-stone-600">
              <TableHead className="text-xs font-semibold">N° Abonnement</TableHead>
              <TableHead className="text-xs font-semibold">Bénéficiaire</TableHead>
              <TableHead className="text-xs font-semibold">Formule</TableHead>
              <TableHead className="text-xs font-semibold">Fréquence & Jour</TableHead>
              <TableHead className="text-xs font-semibold">Prochain Passage</TableHead>
              <TableHead className="text-xs font-semibold">Montant / Mois</TableHead>
              <TableHead className="text-xs font-semibold">Statut</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-stone-500 text-xs">
                  Aucun abonnement correspondant trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell className="font-semibold text-xs text-stone-900">
                    {sub.subscriptionNumber}
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
                  <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs text-stone-800 capitalize">
                        {sub.frequency.toLowerCase()}
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize">
                        Le {sub.deliveryDay.toLowerCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.nextDeliveryDate ? (
                      <div className="text-xs text-stone-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(sub.nextDeliveryDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">Non planifié</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-stone-900">
                    {formatPrice(sub.monthlyAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-500 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] transition-colors focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedSub(sub)}>
                          <Eye className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Consulter la fiche
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {sub.status !== 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, 'ACTIVE')}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                            Activer / Reprendre
                          </DropdownMenuItem>
                        )}
                        {sub.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, 'PAUSED')}>
                            <PauseCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
                            Mettre en pause
                          </DropdownMenuItem>
                        )}
                        {sub.status !== 'CANCELLED' && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(sub.id, 'CANCELLED')}
                            className="text-rose-600"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-2 text-rose-600" />
                            Résilier l’abonnement
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Fiche Détail de l'Abonnement ───────────────────────── */}
      <Sheet open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSub && (
            <div className="space-y-6 pt-2">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-bold text-stone-900">
                    {selectedSub.subscriptionNumber}
                  </SheetTitle>
                  {getStatusBadge(selectedSub.status)}
                </div>
                <SheetDescription className="text-xs text-stone-500">
                  Souscrit le{' '}
                  {new Date(selectedSub.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </SheetDescription>
              </SheetHeader>

              {/* Détails du plan */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-3 border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Formule souscrite :</span>
                  {getPlanBadge(selectedSub.plan)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Rythme :</span>
                  <span className="font-semibold text-stone-900 capitalize">
                    {selectedSub.frequency.toLowerCase()} (Le {selectedSub.deliveryDay.toLowerCase()})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Montant par passage :</span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(selectedSub.perDeliveryPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200">
                  <span className="font-medium text-stone-700">Total Mensuel Estimé :</span>
                  <span className="font-bold text-sm text-[#c1647a]">
                    {formatPrice(selectedSub.monthlyAmount)}
                  </span>
                </div>
              </div>

              {/* Coordonnées & Livraison */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                  Bénéficiaire & Adresse
                </h4>
                <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-800">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-medium">{selectedSub.recipientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedSub.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                    <span>
                      {selectedSub.address}, {selectedSub.location}
                    </span>
                  </div>
                  {selectedSub.notes && (
                    <div className="pt-2 border-t border-stone-100 text-stone-500 italic">
                      « {selectedSub.notes} »
                    </div>
                  )}
                </div>
              </div>

              {/* Actions de gestion */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Gestion du statut
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedSub.status !== 'ACTIVE' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedSub.id, 'ACTIVE')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Activer / Reprendre l’abonnement
                    </Button>
                  )}
                  {selectedSub.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedSub.id, 'PAUSED')}
                      className="w-full text-amber-700 border-amber-300 hover:bg-amber-50 text-xs h-9 gap-1.5"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Suspendre temporairement (En pause)
                    </Button>
                  )}
                  {selectedSub.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedSub.id, 'CANCELLED')}
                      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-9 gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Résilier définitivement
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
