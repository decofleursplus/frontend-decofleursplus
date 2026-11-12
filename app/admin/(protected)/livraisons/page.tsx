'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  type AdminDelivery,
  type DeliveryDriver,
  type DeliveryStatus,
} from '@/lib/admin/mock-data/types';
import {
  getAdminDeliveries,
  getAdminDrivers,
  assignDeliveryDriver,
  startAdminDelivery,
  completeAdminDelivery,
  failAdminDelivery,
  createAdminDriver,
  updateAdminDriver,
  type AdminDeliveriesResponse,
} from '@/lib/api/admin/deliveries';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Search,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  UserCheck,
  Bike,
  Clock,
  AlertTriangle,
  UserPlus,
  Users,
  Phone,
  Power,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AssignDriverDialog } from '@/components/admin/assign-driver-dialog';
import { DeliveryDetailSheet } from '@/components/admin/delivery-detail-sheet';
import { AddDriverDialog } from '@/components/admin/add-driver-dialog';
import { CompleteDeliveryDialog } from '@/components/admin/complete-delivery-dialog';

export default function AdminDeliveriesPage() {
  // Main Top-level tab: 'courses' | 'livreurs'
  const [mainTab, setMainTab] = useState<'courses' | 'livreurs'>('courses');

  // Deliveries and Drivers State
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [serverCounts, setServerCounts] = useState<AdminDeliveriesResponse['counts'] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(
    () =>
      Promise.all([getAdminDeliveries(), getAdminDrivers(true)])
        .then(([delRes, drvRes]) => {
          setDeliveries(delRes.deliveries);
          setServerCounts(delRes.counts);
          setDrivers(drvRes);
          setLoadError(null);
        })
        .catch((err) => {
          const msg = err instanceof ApiClientError ? err.message : 'Erreur lors du chargement des livraisons et livreurs';
          setLoadError(msg);
          toast.error(msg);
        }),
    [],
  );

  const loadData = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      return fetchAll().finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
    },
    [fetchAll],
  );

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  // Status Sub-Pill Filter on courses tab
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Draft filters inside drawer
  const [draftZone, setDraftZone] = useState<string>('all');
  const [draftDriver, setDraftDriver] = useState<string>('all');
  const [draftMode, setDraftMode] = useState<string>('all');

  // Dialog & Sheet States
  const [selectedDelivery, setSelectedDelivery] = useState<AdminDelivery | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [assignDeliveryTarget, setAssignDeliveryTarget] = useState<AdminDelivery | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [completeDeliveryTarget, setCompleteDeliveryTarget] = useState<AdminDelivery | null>(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Counts for pills
  const counts = useMemo(() => {
    const c = serverCounts ?? { a_livrer: 0, en_cours: 0, livree: 0, echec: 0 };
    return { all: c.a_livrer + c.en_cours + c.livree + c.echec, ...c };
  }, [serverCounts]);

  // Drawer filter handler
  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftZone(zoneFilter);
      setDraftDriver(driverFilter);
      setDraftMode(modeFilter);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setZoneFilter(draftZone);
    setDriverFilter(draftDriver);
    setModeFilter(draftMode);
    setIsFilterOpen(false);
    toast.success('Filtres appliqués');
  };

  const handleResetFilters = () => {
    setDraftZone('all');
    setDraftDriver('all');
    setDraftMode('all');
    setZoneFilter('all');
    setDriverFilter('all');
    setModeFilter('all');
    setIsFilterOpen(false);
    toast.info('Filtres réinitialisés');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (zoneFilter !== 'all') count++;
    if (driverFilter !== 'all') count++;
    if (modeFilter !== 'all') count++;
    return count;
  }, [zoneFilter, driverFilter, modeFilter]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      // Status pill filter
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;

      // Zone filter
      if (zoneFilter !== 'all' && d.deliveryZone !== zoneFilter) return false;

      // Driver filter
      if (driverFilter !== 'all') {
        if (driverFilter === 'unassigned' && d.driverId) return false;
        if (driverFilter !== 'unassigned' && d.driverId !== driverFilter) return false;
      }

      // Mode filter
      if (modeFilter !== 'all' && d.deliveryMode !== modeFilter) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = d.deliveryNumber.toLowerCase().includes(query);
        const matchesRef = d.orderRef.toLowerCase().includes(query);
        const matchesCustomer = d.customerName.toLowerCase().includes(query);
        const matchesAddress = d.deliveryAddress.toLowerCase().includes(query);
        const matchesDriver = d.driverName ? d.driverName.toLowerCase().includes(query) : false;

        return matchesId || matchesRef || matchesCustomer || matchesAddress || matchesDriver;
      }

      return true;
    });
  }, [deliveries, statusFilter, zoneFilter, driverFilter, modeFilter, searchQuery]);

  // Status badge helper
  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'a_livrer':
        return (
          <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none font-medium text-xs">
            À livrer
          </Badge>
        );
      case 'en_cours':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs">
            En cours
          </Badge>
        );
      case 'livree':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs">
            Livrée
          </Badge>
        );
      case 'echec':
        return (
          <Badge className="bg-[#ffe5e5] text-[#cc0000] border-none font-medium text-xs">
            Échec
          </Badge>
        );
    }
  };

  /** Exécute une action serveur puis recharge la liste ; aucune mise à jour locale en cas d'échec. */
  const runAction = async (action: () => Promise<unknown>, success: string): Promise<boolean> => {
    try {
      await action();
      toast.success(success);
      await fetchAll();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible');
      return false;
    }
  };

  const syncSelected = (deliveryId: string) => {
    if (selectedDelivery?.id === deliveryId) setIsDetailOpen(false);
  };

  // Transitions : démarrer (en_cours), clôturer (livree, via la fenêtre), échec (motif), replanifier (réassignation)
  const handleStatusChange = async (deliveryId: string, newStatus: DeliveryStatus) => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return;
    if (newStatus === 'en_cours') {
      await runAction(() => startAdminDelivery(deliveryId), `Course ${delivery.deliveryNumber} démarrée`);
    } else if (newStatus === 'livree') {
      syncSelected(deliveryId);
      handleOpenCompleteModal(delivery);
    } else if (newStatus === 'echec') {
      const reason = window.prompt('Motif de l’échec de livraison (3 caractères minimum) :', '');
      if (reason === null) return;
      if (reason.trim().length < 3) {
        toast.error('Indiquez un motif d’au moins 3 caractères.');
        return;
      }
      if (await runAction(() => failAdminDelivery(deliveryId, { reason: reason.trim() }), 'Échec de livraison enregistré')) syncSelected(deliveryId);
    } else if (newStatus === 'a_livrer') {
      syncSelected(deliveryId);
      handleOpenAssignModal(delivery);
    }
  };

  const handleAssignDriver = (deliveryId: string, driverId: string, timeSlot: string, notes?: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    return runAction(
      () => assignDeliveryDriver(deliveryId, { driverId, timeSlot: timeSlot || undefined, note: notes || undefined }),
      `Livreur ${drv?.name ?? ''} assigné`,
    );
  };

  const handleCompleteDelivery = (deliveryId: string, recipientName: string, notes?: string) =>
    runAction(() => completeAdminDelivery(deliveryId, { recipientName, notes }), 'Livraison marquée comme effectuée');

  const handleAddDriver = (input: { name: string; phone: string; vehicle: DeliveryDriver['vehicle']; vehiclePlate?: string; available: boolean }) =>
    runAction(() => createAdminDriver(input), `Livreur ${input.name} ajouté à la flotte`);

  const handleToggleDriverStatus = async (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    if (!drv) return;
    const makeAvailable = drv.status === 'indisponible';
    await runAction(
      () => updateAdminDriver(driverId, { available: makeAvailable }),
      `${drv.name} est maintenant ${makeAvailable ? 'disponible' : 'indisponible'}`,
    );
  };

  // Modals opening helpers
  const handleOpenDetail = (delivery: AdminDelivery) => {
    setSelectedDelivery(delivery);
    setIsDetailOpen(true);
  };

  const handleOpenAssignModal = (delivery: AdminDelivery) => {
    setAssignDeliveryTarget(delivery);
    setIsAssignOpen(true);
  };

  const handleOpenCompleteModal = (delivery: AdminDelivery) => {
    setCompleteDeliveryTarget(delivery);
    setIsCompleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion des livraisons</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">
            Supervisez les expéditions en temps réel, assignez vos livreurs et assurez le suivi des colis.
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          <span>{loadError}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => loadData(true)} className="h-8 text-xs">
            Réessayer
          </Button>
        </div>
      )}

      {/* Main Top Navigation Tabs */}
      <div className="flex border-b border-[#e7e4dd] gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMainTab('courses')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] shrink-0 ${
            mainTab === 'courses'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Suivi des livraisons</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {deliveries.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('livreurs')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] shrink-0 ${
            mainTab === 'livreurs'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Flotte & Livreurs</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {drivers.length}
          </span>
        </button>
      </div>

      {/* TAB 1 : SUIVI DES LIVRAISONS */}
      {mainTab === 'courses' && (
        <div className="space-y-5">
          {/* Status Sub-Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
            {/* TOUTES */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={statusFilter === 'all' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={statusFilter === 'all' ? { color: '#ffffff' } : undefined}
              >
                <Truck
                  className="h-3.5 w-3.5"
                  color={statusFilter === 'all' ? '#ffffff' : '#6b7280'}
                />
                Toutes
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  statusFilter === 'all'
                    ? 'bg-white/25 text-white!'
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={
                  statusFilter === 'all'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {counts.all}
              </span>
            </button>

            {/* À LIVRER */}
            <button
              type="button"
              onClick={() => setStatusFilter('a_livrer')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                statusFilter === 'a_livrer'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={statusFilter === 'a_livrer' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={statusFilter === 'a_livrer' ? { color: '#ffffff' } : undefined}
              >
                <Clock
                  className="h-3.5 w-3.5"
                  color={statusFilter === 'a_livrer' ? '#ffffff' : '#d97706'}
                />
                À livrer
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  statusFilter === 'a_livrer'
                    ? 'bg-white/25 text-white!'
                    : 'bg-[#fff8cc] text-[#9a7b00]'
                }`}
                style={
                  statusFilter === 'a_livrer'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {counts.a_livrer}
              </span>
            </button>

            {/* EN COURS */}
            <button
              type="button"
              onClick={() => setStatusFilter('en_cours')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                statusFilter === 'en_cours'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={statusFilter === 'en_cours' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={statusFilter === 'en_cours' ? { color: '#ffffff' } : undefined}
              >
                <Bike
                  className="h-3.5 w-3.5"
                  color={statusFilter === 'en_cours' ? '#ffffff' : '#2563eb'}
                />
                En cours
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  statusFilter === 'en_cours'
                    ? 'bg-white/25 text-white!'
                    : 'bg-[#e5eaff] text-[#3d5a99]'
                }`}
                style={
                  statusFilter === 'en_cours'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {counts.en_cours}
              </span>
            </button>

            {/* LIVRÉES */}
            <button
              type="button"
              onClick={() => setStatusFilter('livree')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                statusFilter === 'livree'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={statusFilter === 'livree' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={statusFilter === 'livree' ? { color: '#ffffff' } : undefined}
              >
                <CheckCircle
                  className="h-3.5 w-3.5"
                  color={statusFilter === 'livree' ? '#ffffff' : '#16a34a'}
                />
                Livrées
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  statusFilter === 'livree'
                    ? 'bg-white/25 text-white!'
                    : 'bg-[#dcfce7] text-[#166534]'
                }`}
                style={
                  statusFilter === 'livree'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {counts.livree}
              </span>
            </button>

            {/* ÉCHECS */}
            {counts.echec > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('echec')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  statusFilter === 'echec'
                    ? 'bg-[#c1647a] text-white! shadow-xs'
                    : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
                }`}
                style={statusFilter === 'echec' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={statusFilter === 'echec' ? { color: '#ffffff' } : undefined}
                >
                  <AlertTriangle
                    className="h-3.5 w-3.5"
                    color={statusFilter === 'echec' ? '#ffffff' : '#dc2626'}
                  />
                  Échecs
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    statusFilter === 'echec'
                      ? 'bg-white/25 text-white!'
                      : 'bg-[#ffe5e5] text-[#cc0000]'
                  }`}
                  style={
                    statusFilter === 'echec'
                      ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                      : undefined
                  }
                >
                  {counts.echec}
                </span>
              </button>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher #livraison, commande, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-[#e7e4dd] focus-visible:ring-[#c1647a]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Drawer Filter */}
              <Sheet open={isFilterOpen} onOpenChange={handleOpenFilterDrawer}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      className={`text-xs h-10 border-[#e7e4dd] bg-white gap-1.5 sm:gap-2 relative shrink-0 ${
                        activeFiltersCount > 0 ? 'border-[#c1647a] text-[#c1647a]' : 'text-gray-700'
                      }`}
                    />
                  }
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Filtres avancés</span>
                  <span className="sm:hidden">Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="h-4.5 w-4.5 rounded-full bg-[#c1647a] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <SheetHeader>
                      <SheetTitle className="text-lg font-bold text-[#1e2a1f]">
                        Filtrer les livraisons
                      </SheetTitle>
                      <SheetDescription className="text-xs text-gray-500">
                        Sélectionnez vos critères de recherche à l&apos;aide des menus déroulants.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-5 pt-2">
                      {/* Dropdown 1: Zone géographique */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 block">
                          Zone géographique
                        </label>
                        <select
                          value={draftZone}
                          onChange={(e) => setDraftZone(e.target.value)}
                          className="w-full h-10 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
                        >
                          <option value="all">Toutes les zones</option>
                          <option value="Saly">Saly</option>
                          <option value="Mbour">Mbour</option>
                          <option value="Somone">Somone</option>
                          <option value="Ngaparou">Ngaparou</option>
                          <option value="Dakar">Dakar</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                      {/* Dropdown 2: Livreur assigné */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 block">
                          Livreur assigné
                        </label>
                        <select
                          value={draftDriver}
                          onChange={(e) => setDraftDriver(e.target.value)}
                          className="w-full h-10 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
                        >
                          <option value="all">Tous les livreurs</option>
                          <option value="unassigned">Non assignés uniquement</option>
                          {drivers.map((drv) => (
                            <option key={drv.id} value={drv.id}>
                              {drv.name} ({drv.vehicle})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dropdown 3: Mode de livraison */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 block">
                          Mode de livraison
                        </label>
                        <select
                          value={draftMode}
                          onChange={(e) => setDraftMode(e.target.value)}
                          className="w-full h-10 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
                        >
                          <option value="all">Tous les modes</option>
                          <option value="Livraison express">Livraison express</option>
                          <option value="Livraison standard">Livraison standard</option>
                          <option value="Retrait boutique">Retrait en boutique</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="pt-6 border-t border-[#f0ede6] flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="w-full sm:w-auto text-xs border-[#e7e4dd] text-gray-700 gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Réinitialiser
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApplyFilters}
                      className="w-full sm:w-auto bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold"
                    >
                      Appliquer les filtres
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Deliveries DataTable (Desktop) */}
          <div className="hidden lg:block bg-white border border-[#e7e4dd] rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]/60">
                <TableRow className="border-[#e7e4dd]">
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[105px]">#Livraison</TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 max-w-[170px]">
                    Destinataire & Secteur
                  </TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[125px]">Créneau prévu</TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[140px]">Livreur assigné</TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs px-3 py-3 w-[90px]">Statut</TableHead>
                  <TableHead className="font-bold text-[#1e2a1f] text-xs text-right pr-4 px-3 py-3 w-[130px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#c1647a]" />
                        <p className="text-xs text-gray-500">Chargement des livraisons...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                        <Truck className="h-8 w-8 text-gray-300" />
                        <p className="text-xs font-medium">
                          {deliveries.length === 0 ? "Aucune livraison n'a encore été planifiée." : "Aucune livraison trouvée pour ces critères."}
                        </p>
                        {deliveries.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStatusFilter('all');
                              setZoneFilter('all');
                              setDriverFilter('all');
                              setModeFilter('all');
                              setSearchQuery('');
                            }}
                            className="text-xs border-[#e7e4dd] mt-1"
                          >
                            Réinitialiser la recherche
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow
                      key={delivery.id}
                      className="hover:bg-[#fcfaf7] border-[#f0ede6] transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetail(delivery)}
                    >
                      {/* #Livraison + Command Ref */}
                      <TableCell className="font-mono text-xs px-3 py-2.5">
                        <span className="font-bold text-gray-900 group-hover:text-[#c1647a] transition-colors block">
                          {delivery.deliveryNumber}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {delivery.orderRef}
                        </span>
                      </TableCell>

                      {/* Destinataire & Secteur (Compact) */}
                      <TableCell className="max-w-[170px] px-3 py-2.5">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-xs text-gray-900 truncate">
                              {delivery.customerName}
                            </span>
                            <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none text-[10px] font-medium py-0 px-1.5 shrink-0">
                              {delivery.deliveryZone}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[160px]" title={delivery.deliveryAddress}>
                            {delivery.deliveryAddress}
                          </p>
                        </div>
                      </TableCell>

                      {/* Créneau prévu */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-gray-800 font-medium">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            <span>{delivery.timeSlot}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block pl-4">
                            {delivery.scheduledDate}
                          </span>
                        </div>
                      </TableCell>

                      {/* Livreur assigné */}
                      <TableCell className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        {delivery.driverId ? (
                          <div className="flex items-center gap-1.5 min-w-0 max-w-[135px]">
                            <div className="h-6 w-6 rounded-full bg-[#f0ede6] text-gray-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {delivery.driverName ? delivery.driverName.slice(0, 2).toUpperCase() : 'LV'}
                            </div>
                            <div className="min-w-0 truncate">
                              <p className="font-medium text-xs text-gray-900 truncate leading-tight">
                                {delivery.driverName}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate leading-tight">
                                {delivery.driverVehicle || 'Moto'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(delivery)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
                            title="Cliquer pour assigner un livreur"
                          >
                            <UserCheck className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>Non assigné</span>
                          </button>
                        )}
                      </TableCell>

                      {/* Statut */}
                      <TableCell className="px-3 py-2.5 whitespace-nowrap">{getStatusBadge(delivery.status)}</TableCell>

                      {/* Action column with primary step + quick direct complete button */}
                      <TableCell className="text-right pr-4 px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {delivery.status === 'a_livrer' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!delivery.driverId) {
                                    handleOpenAssignModal(delivery);
                                  } else {
                                    void handleStatusChange(delivery.id, 'en_cours');
                                  }
                                }}
                                className={`h-7 px-2.5 text-xs font-semibold ${
                                  delivery.driverId
                                    ? 'bg-[#3d5a99] hover:bg-[#2f4677] text-white'
                                    : 'bg-[#c1647a] hover:bg-[#a85266] text-white'
                                }`}
                              >
                                {delivery.driverId ? 'Démarrer' : 'Assigner'}
                              </Button>
                            </>
                          )}

                          {delivery.status === 'en_cours' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCompleteModal(delivery)}
                              className="h-7 px-2.5 text-xs font-semibold bg-[#166534] hover:bg-[#14532d] text-white gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Clôturer
                            </Button>
                          )}

                          {delivery.status === 'livree' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDetail(delivery)}
                              className="h-7 px-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-[#faf8f4] gap-1"
                            >
                              Fiche
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}

                          {delivery.status === 'echec' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleStatusChange(delivery.id, 'a_livrer')}
                                className="h-7 px-2 text-xs font-medium text-[#c1647a] border-[#c1647a] hover:bg-[#fdf2f4]"
                              >
                                Replanifier
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Deliveries Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {loading ? (
              <div className="bg-white border border-[#e7e4dd] rounded-xl p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#c1647a]" />
                <p className="text-xs text-gray-500">Chargement des livraisons...</p>
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="bg-white border border-[#e7e4dd] rounded-xl p-8 text-center text-gray-500 space-y-2">
                <Truck className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="text-xs font-medium">
                  {deliveries.length === 0 ? "Aucune livraison n'a encore été planifiée." : "Aucune livraison trouvée pour ces critères."}
                </p>
                {deliveries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setZoneFilter('all');
                      setDriverFilter('all');
                      setModeFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs border-[#e7e4dd] mt-1"
                  >
                    Réinitialiser la recherche
                  </Button>
                )}
              </div>
            ) : (
              filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  onClick={() => handleOpenDetail(delivery)}
                  className="bg-white border border-[#e7e4dd] rounded-xl p-4 space-y-3 shadow-xs hover:border-gray-300 transition-all cursor-pointer"
                >
                  {/* Top: #Livraison + orderRef + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {delivery.deliveryNumber}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {delivery.orderRef}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {delivery.deliveryMode}
                      </div>
                    </div>
                    <div>{getStatusBadge(delivery.status)}</div>
                  </div>

                  {/* Customer & Address */}
                  <div className="bg-[#faf8f4] rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-gray-900 truncate">
                        {delivery.customerName}
                      </span>
                      <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none text-[10px] font-medium py-0 px-1.5 shrink-0">
                        {delivery.deliveryZone}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      {delivery.deliveryAddress}
                    </p>
                  </div>

                  {/* Info Row: Time slot & Driver */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f0ede6]">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Créneau prévu</span>
                      <div className="flex items-center gap-1 text-gray-800 font-medium text-[11px] mt-0.5">
                        <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                        <span className="truncate">{delivery.timeSlot}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{delivery.scheduledDate}</span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-gray-400 block font-medium">Livreur</span>
                      {delivery.driverId ? (
                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                          <div className="h-5 w-5 rounded-full bg-[#f0ede6] text-gray-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {delivery.driverName ? delivery.driverName.slice(0, 2).toUpperCase() : 'LV'}
                          </div>
                          <div className="min-w-0 truncate">
                            <span className="font-medium text-[11px] text-gray-900 truncate block">
                              {delivery.driverName}
                            </span>
                            <span className="text-[9px] text-gray-400 truncate block">
                              {delivery.driverVehicle || 'Moto'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(delivery)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-md px-2 py-0.5 transition-colors cursor-pointer mt-0.5"
                        >
                          <UserCheck className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>Assigner</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-[#f0ede6] flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {delivery.status === 'a_livrer' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!delivery.driverId) {
                              handleOpenAssignModal(delivery);
                            } else {
                              void handleStatusChange(delivery.id, 'en_cours');
                            }
                          }}
                          className={`flex-1 h-8 text-xs font-semibold ${
                            delivery.driverId
                              ? 'bg-[#3d5a99] hover:bg-[#2f4677] text-white'
                              : 'bg-[#c1647a] hover:bg-[#a85266] text-white'
                          }`}
                        >
                          {delivery.driverId ? 'Démarrer course' : 'Assigner livreur'}
                        </Button>
                      </>
                    )}

                    {delivery.status === 'en_cours' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleOpenCompleteModal(delivery)}
                          className="flex-1 h-8 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold gap-1.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Terminer la livraison
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleStatusChange(delivery.id, 'echec')}
                          className="h-8 px-2.5 border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium shrink-0"
                        >
                          Échec
                        </Button>
                      </>
                    )}

                    {delivery.status === 'livree' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(delivery)}
                        className="w-full h-8 text-xs text-gray-700 border-[#e7e4dd] hover:bg-[#faf8f4] justify-between"
                      >
                        <span>Livrée le {delivery.deliveredAt || delivery.scheduledDate}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    )}

                    {delivery.status === 'echec' && (
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          size="sm"
                          onClick={() => void handleStatusChange(delivery.id, 'a_livrer')}
                          className="flex-1 h-8 bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold"
                        >
                          Replanifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetail(delivery)}
                          className="h-8 text-xs border-[#e7e4dd] shrink-0"
                        >
                          Détails
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2 : FLOTTE & LIVREURS */}
      {mainTab === 'livreurs' && (
        <div className="space-y-5">
          {/* Top Bar with Stats & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e7e4dd]">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Flotte de livraison Décofleur Plus ({drivers.length} coursiers)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Gérez vos livreurs, suivez leur disponibilité et affectez les véhicules.
              </p>
            </div>
            <Button
              onClick={() => setIsAddDriverOpen(true)}
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold gap-1.5 h-9"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Nouveau livreur
            </Button>
          </div>

          {/* Driver Cards Grid */}
          {loading ? (
            <div className="bg-white border border-[#e7e4dd] rounded-xl p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#c1647a]" />
              <p className="text-xs text-gray-500">Chargement de la flotte de livreurs...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="bg-white border border-[#e7e4dd] rounded-xl p-12 text-center text-gray-500 space-y-3">
              <Users className="h-10 w-10 text-gray-300 mx-auto" />
              <div>
                <p className="font-semibold text-gray-700 text-sm">Aucun livreur enregistré</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier coursier pour lui affecter des livraisons.</p>
              </div>
              <Button
                onClick={() => setIsAddDriverOpen(true)}
                className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold gap-1.5 h-8 mt-2"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Ajouter un livreur
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="bg-white border border-[#e7e4dd] rounded-xl p-4 space-y-3 shadow-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#f0ede6] text-gray-800 font-bold text-sm flex items-center justify-center">
                        {drv.avatar || drv.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{drv.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                          <Bike className="h-3 w-3 text-gray-400" />
                          <span>
                            {drv.vehicle} {drv.vehiclePlate ? `(${drv.vehiclePlate})` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f0ede6] text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <a href={`tel:${drv.phone}`} className="hover:text-[#c1647a] font-medium font-mono">
                        {drv.phone}
                      </a>
                    </div>
                    <div>
                      {drv.status === 'disponible' ? (
                        <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[11px] font-medium">
                          Disponible
                        </Badge>
                      ) : drv.status === 'en_course' ? (
                        <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none text-[11px] font-medium">
                          {drv.activeDeliveriesCount} en cours
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border-none text-[11px] font-medium">
                          Indisponible
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f0ede6] flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {drv.activeDeliveriesCount > 0
                        ? `${drv.activeDeliveriesCount} course(s) en cours`
                        : 'Aucune course en cours'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDriverStatus(drv.id)}
                      className="text-[11px] text-gray-600 hover:text-gray-900 h-7 px-2 gap-1"
                    >
                      <Power className="h-3 w-3" />
                      {drv.status === 'disponible' ? 'Mettre en pause' : 'Rendre disponible'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Driver Assignment Dialog */}
      <AssignDriverDialog
        key={`assign-${assignDeliveryTarget?.id ?? 'none'}`}
        delivery={assignDeliveryTarget}
        isOpen={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        drivers={drivers}
        onAssign={handleAssignDriver}
      />

      {/* Complete Delivery Dialog */}
      <CompleteDeliveryDialog
        key={`complete-${completeDeliveryTarget?.id ?? 'none'}`}
        delivery={completeDeliveryTarget}
        isOpen={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        onComplete={handleCompleteDelivery}
      />

      {/* Add Driver Dialog */}
      <AddDriverDialog
        isOpen={isAddDriverOpen}
        onOpenChange={setIsAddDriverOpen}
        onAddDriver={handleAddDriver}
      />

      {/* Delivery Detail Sheet */}
      <DeliveryDetailSheet
        delivery={selectedDelivery}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onStatusChange={handleStatusChange}
        onOpenAssignDriver={(d) => {
          setIsDetailOpen(false);
          handleOpenAssignModal(d);
        }}
        onOpenComplete={(d) => {
          setIsDetailOpen(false);
          handleOpenCompleteModal(d);
        }}
      />
    </div>
  );
}
