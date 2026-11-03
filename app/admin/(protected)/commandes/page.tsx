'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { adminOrders } from '@/lib/admin/mock-data/orders';
import type { OrderStatus, AdminOrder } from '@/lib/admin/mock-data/types';
import { getAdminOrders, updateAdminOrderStatus } from '@/lib/api/admin/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
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
  MoreHorizontal,
  Eye,
  CheckCircle,
  Truck,
  XCircle,
  Printer,
  X,
  RotateCcw,
  Check,
  ArrowUpDown,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>(adminOrders);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Applied filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('date_desc');

  // Draft filters in drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string>('all');
  const [draftDelivery, setDraftDelivery] = useState<string>('all');
  const [draftSort, setDraftSort] = useState<string>('date_desc');

  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftStatus(statusFilter);
      setDraftDelivery(deliveryFilter);
      setDraftSort(sortFilter);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setDeliveryFilter(draftDelivery);
    setSortFilter(draftSort);
    setIsFilterOpen(false);
    toast.success('Filtres appliqués');
  };

  const handleResetFilters = () => {
    setDraftStatus('all');
    setDraftDelivery('all');
    setDraftSort('date_desc');
    setStatusFilter('all');
    setDeliveryFilter('all');
    setSortFilter('date_desc');
    setIsFilterOpen(false);
    toast.info('Filtres réinitialisés');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (deliveryFilter !== 'all') count++;
    if (sortFilter !== 'date_desc') count++;
    return count;
  }, [statusFilter, deliveryFilter, sortFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminOrders();
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    const statusLabels: Record<string, string> = {
      nouvelle: 'Nouvelle',
      en_preparation: 'En préparation',
      en_livraison: 'En livraison',
      livree: 'Livrée',
      annulee: 'Annulée',
      remboursee: 'Remboursée',
    };

    try {
      await updateAdminOrderStatus(orderId, { status: newStatus });
      toast.success('Statut mis à jour', {
        description: `La commande est maintenant "${statusLabels[newStatus] || newStatus}".`,
      });
    } catch {
      setOrders(previousOrders);
      toast.error('Échec de la mise à jour du statut sur le serveur.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_preparation':
        return <Badge className="bg-[#fff8cc] text-[#9a7b00] hover:bg-[#fff8cc]/80 shadow-none border-none font-medium">En préparation</Badge>;
      case 'en_livraison':
        return <Badge className="bg-[#e5eaff] text-[#3d5a99] hover:bg-[#e5eaff]/80 shadow-none border-none font-medium">En livraison</Badge>;
      case 'livree':
        return <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7]/80 shadow-none border-none font-medium">Livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-[#ffe5e5] text-[#cc0000] hover:bg-[#ffe5e5]/80 shadow-none border-none font-medium">Annulée</Badge>;
      case 'remboursee':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-none border-none font-medium">Remboursée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          order.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesDelivery =
          deliveryFilter === 'all' ||
          (deliveryFilter === 'domicile' && order.deliveryMode.toLowerCase().includes('domicile')) ||
          (deliveryFilter === 'boutique' && order.deliveryMode.toLowerCase().includes('boutique'));

        return matchesSearch && matchesStatus && matchesDelivery;
      })
      .sort((a, b) => {
        if (sortFilter === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortFilter === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortFilter === 'amount_desc') return b.total - a.total;
        if (sortFilter === 'amount_asc') return a.total - b.total;
        return 0;
      });
  }, [orders, searchQuery, statusFilter, deliveryFilter, sortFilter]);

  const orderStatuses = [
    { label: 'Tous les statuts', value: 'all' },
    { label: 'En préparation', value: 'en_preparation' },
    { label: 'En livraison', value: 'en_livraison' },
    { label: 'Livrée', value: 'livree' },
    { label: 'Annulée', value: 'annulee' },
    { label: 'Remboursée', value: 'remboursee' },
  ];

  const deliveryModes = [
    { label: 'Tous les modes', value: 'all' },
    { label: 'Livraison à domicile', value: 'domicile' },
    { label: 'Retrait en boutique', value: 'boutique' },
  ];

  const sortOptions = [
    { label: 'Date la plus récente', value: 'date_desc' },
    { label: 'Date la plus ancienne', value: 'date_asc' },
    { label: 'Montant décroissant', value: 'amount_desc' },
    { label: 'Montant croissant', value: 'amount_asc' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion des commandes</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">
            Suivez et traitez les commandes de vos clients.
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadOrders(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Drawer Filter */}
          <Sheet open={isFilterOpen} onOpenChange={handleOpenFilterDrawer}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className={`border-[#e7e4dd] flex-1 sm:w-auto transition-colors ${
                    activeFiltersCount > 0
                      ? 'border-[#c1647a] text-[#c1647a] bg-[#fdf5f7]'
                      : 'text-gray-700 hover:bg-[#faf8f4]'
                  }`}
                />
              }
            >
              <Filter className="mr-2 h-4 w-4 shrink-0" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c1647a] text-[11px] font-bold text-white shrink-0">
                  {activeFiltersCount}
                </span>
              )}
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <div className="flex items-center gap-2 text-[#24582d]">
                  <Filter className="h-5 w-5" />
                  <SheetTitle>Filtrer les commandes</SheetTitle>
                </div>
                <SheetDescription>
                  Sélectionnez vos critères de statut, livraison ou tri puis appliquez.
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Order Status */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut de la commande
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {orderStatuses.map((stat) => {
                      const isSelected = draftStatus === stat.value;
                      return (
                        <button
                          key={stat.value}
                          type="button"
                          onClick={() => setDraftStatus(stat.value)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                              : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                          }`}
                        >
                          <span className="truncate">{stat.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Mode */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mode de livraison
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {deliveryModes.map((dm) => {
                      const isSelected = draftDelivery === dm.value;
                      return (
                        <button
                          key={dm.value}
                          type="button"
                          onClick={() => setDraftDelivery(dm.value)}
                          className={`flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                              : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                          }`}
                        >
                          <span>{dm.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Tri des commandes
                  </label>
                  <select
                    value={draftSort}
                    onChange={(e) => setDraftSort(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-[#e7e4dd] bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drawer Footer Buttons */}
              <SheetFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1 border-[#e7e4dd] text-gray-600 hover:bg-gray-100"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Réinitialiser
                </Button>
                <Button
                  type="button"
                  variant="cta"
                  onClick={handleApplyFilters}
                  className="flex-1 bg-[#c1647a] hover:bg-[#a9576a] !text-white"
                >
                  Appliquer les filtres
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-[#c1647a] shrink-0"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-gray-500">Filtres actifs :</span>
          {statusFilter !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Statut : {orderStatuses.find((s) => s.value === statusFilter)?.label}
              <button onClick={() => setStatusFilter('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {deliveryFilter !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Livraison : {deliveryModes.find((m) => m.value === deliveryFilter)?.label}
              <button onClick={() => setDeliveryFilter('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {sortFilter !== 'date_desc' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Tri : {sortOptions.find((o) => o.value === sortFilter)?.label}
              <button onClick={() => setSortFilter('date_desc')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Status Quick Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {[
          { label: 'Toutes', value: 'all', count: orders.length },
          { label: 'En préparation', value: 'en_preparation', count: orders.filter((o) => o.status === 'en_preparation').length },
          { label: 'En livraison', value: 'en_livraison', count: orders.filter((o) => o.status === 'en_livraison').length },
          { label: 'Livrées', value: 'livree', count: orders.filter((o) => o.status === 'livree').length },
          { label: 'Annulées', value: 'annulee', count: orders.filter((o) => o.status === 'annulee').length },
        ].map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#193e23] text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#e7e4dd]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Orders Card View (visible on < lg) */}
      <div className="space-y-3 lg:hidden">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/admin/commandes/${order.id}`}
                className="font-mono font-bold text-sm text-[#1e2a1f] hover:text-[#24582d]"
              >
                {order.ref}
              </Link>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(order.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl border border-[#e7e4dd] bg-white shadow-xl">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-2.5 py-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                        render={<Link href={`/admin/commandes/${order.id}`} />}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5 text-[#24582d]" />
                        Détails de la commande
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                        onClick={() => toast.info('Impression facture lancée')}
                      >
                        <Printer className="mr-2 h-3.5 w-3.5 text-gray-500" />
                        Imprimer facture
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-2.5 py-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                        Changer statut
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:text-[#3d5a99]"
                        onClick={() => handleUpdateStatus(order.id, 'en_livraison')}
                      >
                        <Truck className="mr-2 h-3.5 w-3.5 text-[#3d5a99]" />
                        En livraison
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#166534]"
                        onClick={() => handleUpdateStatus(order.id, 'livree')}
                      >
                        <CheckCircle className="mr-2 h-3.5 w-3.5 text-[#166534]" />
                        Marquer livrée
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(order.id, 'annulee')}
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5 text-red-600" />
                        Annuler commande
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900 truncate max-w-[190px]">
                {order.customerName}
              </span>
              <span className="text-gray-400 text-[11px] shrink-0">
                {formatDate(order.date)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="bg-[#faf8f4] px-2 py-0.5 rounded-md border border-[#e7e4dd] truncate">
                {order.deliveryMode}
              </span>
              <span>•</span>
              <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Montant</span>
                <span className="font-bold text-sm text-[#24582d]">{formatCurrency(order.total)}</span>
              </div>
              <Link
                href={`/admin/commandes/${order.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#24582d]/20 bg-[#edf8ef] text-xs font-semibold text-[#24582d] hover:bg-[#e2f3e5] transition-colors"
              >
                <span>Détails</span>
                <Eye size={13} />
              </Link>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 space-y-2">
            <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-medium text-gray-700 text-sm">Aucune commande trouvée</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs border-[#e7e4dd]"
            >
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Orders Desktop Table (visible on lg+) */}
      <div className="hidden lg:block bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="font-semibold text-gray-600 py-3.5">Commande</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Date</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Client</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Articles</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5 text-right">Total</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Statut</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Livraison</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5 text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-[#faf8f4]/60 transition-colors">
                <TableCell className="font-mono font-medium text-[#1e2a1f]">
                  <Link href={`/admin/commandes/${order.id}`} className="hover:underline hover:text-[#24582d]">
                    {order.ref}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {formatDate(order.date)}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[#1e2a1f]">{order.customerName}</div>
                  <div className="text-xs text-gray-500 font-mono">ID: {order.customerId}</div>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </TableCell>
                <TableCell className="text-right font-semibold text-[#24582d]">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                    {order.deliveryMode}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-500 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] transition-colors focus:outline-none">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4} className="w-56 p-1.5 rounded-xl border border-[#e7e4dd] bg-white shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          render={<Link href={`/admin/commandes/${order.id}`} />}
                        >
                          <Eye className="mr-2.5 h-4 w-4 text-[#24582d]" />
                          Détails de la commande
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          onClick={() => toast.info('Impression facture lancée')}
                        >
                          <Printer className="mr-2.5 h-4 w-4 text-gray-500" />
                          Imprimer facture
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Mettre à jour
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-[#3d5a99] transition-colors whitespace-nowrap"
                          onClick={() => handleUpdateStatus(order.id, 'en_livraison')}
                        >
                          <Truck className="mr-2.5 h-4 w-4 text-[#3d5a99]" />
                          En livraison
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-[#166534] transition-colors whitespace-nowrap"
                          onClick={() => handleUpdateStatus(order.id, 'livree')}
                        >
                          <CheckCircle className="mr-2.5 h-4 w-4 text-[#166534]" />
                          Marquer livrée
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap focus:text-red-700 focus:bg-red-50"
                          onClick={() => handleUpdateStatus(order.id, 'annulee')}
                        >
                          <XCircle className="mr-2.5 h-4 w-4 text-red-600" />
                          Annuler commande
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                    <p className="font-medium text-gray-700">Aucune commande ne correspond aux critères.</p>
                    <p className="text-xs text-gray-400">Essayez de modifier votre recherche ou de réinitialiser vos filtres.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-2 text-xs border-[#e7e4dd]"
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
