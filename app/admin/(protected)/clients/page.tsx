'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';
import { getAdminCustomers, updateAdminCustomer } from '@/lib/api/admin/customers';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  Star,
  Building2,
  User,
  UserX,
  X,
  RotateCcw,
  Check,
  TrendingDown,
  ArrowUpDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SendEmailDialog } from '@/components/admin/send-email-dialog';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminCustomers();
      if (res?.customers) setCustomers(res.customers);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Erreur lors du chargement des clients';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Segment Pill Filter: 'all' | 'vip' | 'entreprise' | 'particulier' | 'inactif'
  const [segmentFilter, setSegmentFilter] = useState<
    'all' | 'vip' | 'entreprise' | 'particulier' | 'inactif'
  >('all');

  // Advanced Filters (Drawer)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  const [minSpentFilter, setMinSpentFilter] = useState<number>(0);
  const [sortOption, setSortOption] = useState<
    'spent_desc' | 'orders_desc' | 'recent_order' | 'name_asc'
  >('spent_desc');

  // Draft filters for drawer
  const [draftStatus, setDraftStatus] = useState<'all' | 'actif' | 'inactif'>('all');
  const [draftMinSpent, setDraftMinSpent] = useState<number>(0);
  const [draftSort, setDraftSort] = useState<
    'spent_desc' | 'orders_desc' | 'recent_order' | 'name_asc'
  >('spent_desc');

  // Email Dialog State
  const [selectedCustomerForEmail, setSelectedCustomerForEmail] =
    useState<AdminCustomer | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Sync draft filters when opening drawer
  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftStatus(statusFilter);
      setDraftMinSpent(minSpentFilter);
      setDraftSort(sortOption);
    }
    setIsFilterDrawerOpen(open);
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setMinSpentFilter(draftMinSpent);
    setSortOption(draftSort);
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setDraftStatus('all');
    setDraftMinSpent(0);
    setDraftSort('spent_desc');
    setStatusFilter('all');
    setMinSpentFilter(0);
    setSortOption('spent_desc');
    setSegmentFilter('all');
    setSearchQuery('');
    setIsFilterDrawerOpen(false);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (minSpentFilter > 0) count++;
    if (sortOption !== 'spent_desc') count++;
    return count;
  }, [statusFilter, minSpentFilter, sortOption]);

  // Counts for Segment Sub-Pills
  const counts = useMemo(() => {
    return {
      all: customers.length,
      vip: customers.filter((c) => c.segment === 'vip').length,
      entreprise: customers.filter((c) => c.segment === 'entreprise').length,
      particulier: customers.filter((c) => c.segment === 'particulier' && c.status === 'actif')
        .length,
      inactif: customers.filter((c) => c.status === 'inactif').length,
    };
  }, [customers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getSegmentBadge = (segment: string, status: string) => {
    if (status === 'inactif') {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 gap-1 font-medium">
          <UserX className="w-3 h-3 text-gray-500" /> Inactif
        </Badge>
      );
    }
    switch (segment) {
      case 'vip':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 font-medium">
            <Star className="w-3 h-3 fill-current text-purple-700" /> VIP
          </Badge>
        );
      case 'entreprise':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 font-medium">
            <Building2 className="w-3 h-3 text-amber-700" /> Entreprise
          </Badge>
        );
      case 'particulier':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 font-medium">
            <User className="w-3 h-3 text-blue-700" /> Particulier
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800 font-medium">{segment}</Badge>;
    }
  };

  // Filter & sort logic
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        // Search query
        const matchesSearch =
          searchQuery.trim() === '' ||
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery);

        // Segment sub-pills
        let matchesSegmentPill = true;
        if (segmentFilter === 'vip') {
          matchesSegmentPill = customer.segment === 'vip';
        } else if (segmentFilter === 'entreprise') {
          matchesSegmentPill = customer.segment === 'entreprise';
        } else if (segmentFilter === 'particulier') {
          matchesSegmentPill = customer.segment === 'particulier' && customer.status === 'actif';
        } else if (segmentFilter === 'inactif') {
          matchesSegmentPill = customer.status === 'inactif';
        }

        // Advanced filter: Status
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

        // Advanced filter: Min spent
        const matchesMinSpent = minSpentFilter === 0 || customer.totalSpent >= minSpentFilter;

        return matchesSearch && matchesSegmentPill && matchesStatus && matchesMinSpent;
      })
      .sort((a, b) => {
        if (sortOption === 'spent_desc') {
          return b.totalSpent - a.totalSpent;
        }
        if (sortOption === 'orders_desc') {
          return b.totalOrders - a.totalOrders;
        }
        if (sortOption === 'recent_order') {
          const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          return dateB - dateA;
        }
        if (sortOption === 'name_asc') {
          return a.name.localeCompare(b.name, 'fr');
        }
        return 0;
      });
  }, [customers, searchQuery, segmentFilter, statusFilter, minSpentFilter, sortOption]);

  const handleOpenEmailDialog = (customer: AdminCustomer) => {
    setSelectedCustomerForEmail(customer);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header — Clean without Exporter CSV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title text-2xl font-bold text-[#1e2a1f]">Clients & CRM</h1>
          <p className="admin-page-subtitle text-sm text-gray-500">
            Gérez votre base de clients, suivez leur valeur et communiquez directement avec eux.
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadCustomers(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Segment Sub-Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
        <button
          type="button"
          onClick={() => setSegmentFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            segmentFilter === 'all'
              ? 'bg-[#c1647a] text-white! shadow-xs'
              : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
          }`}
          style={segmentFilter === 'all' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
        >
          <span style={segmentFilter === 'all' ? { color: '#ffffff' } : undefined}>Tous</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              segmentFilter === 'all' ? 'bg-white/25 text-white!' : 'bg-gray-100 text-gray-600'
            }`}
            style={
              segmentFilter === 'all'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : undefined
            }
          >
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSegmentFilter('vip')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            segmentFilter === 'vip'
              ? 'bg-[#c1647a] text-white! shadow-xs'
              : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
          }`}
          style={segmentFilter === 'vip' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
        >
          <span
            className="flex items-center gap-1.5"
            style={segmentFilter === 'vip' ? { color: '#ffffff' } : undefined}
          >
            <Star
              className="h-3.5 w-3.5"
              color={segmentFilter === 'vip' ? '#ffffff' : '#8b5cf6'}
            />
            VIP
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              segmentFilter === 'vip' ? 'bg-white/25 text-white!' : 'bg-purple-100 text-purple-800'
            }`}
            style={
              segmentFilter === 'vip'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : undefined
            }
          >
            {counts.vip}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSegmentFilter('entreprise')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            segmentFilter === 'entreprise'
              ? 'bg-[#c1647a] text-white! shadow-xs'
              : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
          }`}
          style={
            segmentFilter === 'entreprise'
              ? { backgroundColor: '#c1647a', color: '#ffffff' }
              : undefined
          }
        >
          <span
            className="flex items-center gap-1.5"
            style={segmentFilter === 'entreprise' ? { color: '#ffffff' } : undefined}
          >
            <Building2
              className="h-3.5 w-3.5"
              color={segmentFilter === 'entreprise' ? '#ffffff' : '#d97706'}
            />
            Entreprise
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              segmentFilter === 'entreprise'
                ? 'bg-white/25 text-white!'
                : 'bg-amber-100 text-amber-800'
            }`}
            style={
              segmentFilter === 'entreprise'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : undefined
            }
          >
            {counts.entreprise}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSegmentFilter('particulier')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            segmentFilter === 'particulier'
              ? 'bg-[#c1647a] text-white! shadow-xs'
              : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
          }`}
          style={
            segmentFilter === 'particulier'
              ? { backgroundColor: '#c1647a', color: '#ffffff' }
              : undefined
          }
        >
          <span
            className="flex items-center gap-1.5"
            style={segmentFilter === 'particulier' ? { color: '#ffffff' } : undefined}
          >
            <User
              className="h-3.5 w-3.5"
              color={segmentFilter === 'particulier' ? '#ffffff' : '#3b82f6'}
            />
            Particulier
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              segmentFilter === 'particulier'
                ? 'bg-white/25 text-white!'
                : 'bg-blue-100 text-blue-800'
            }`}
            style={
              segmentFilter === 'particulier'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : undefined
            }
          >
            {counts.particulier}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSegmentFilter('inactif')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            segmentFilter === 'inactif'
              ? 'bg-[#c1647a] text-white! shadow-xs'
              : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
          }`}
          style={segmentFilter === 'inactif' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
        >
          <span
            className="flex items-center gap-1.5"
            style={segmentFilter === 'inactif' ? { color: '#ffffff' } : undefined}
          >
            <UserX
              className="h-3.5 w-3.5"
              color={segmentFilter === 'inactif' ? '#ffffff' : '#6b7280'}
            />
            Inactif
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              segmentFilter === 'inactif' ? 'bg-white/25 text-white!' : 'bg-gray-100 text-gray-600'
            }`}
            style={
              segmentFilter === 'inactif'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : undefined
            }
          >
            {counts.inactif}
          </span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher nom, email, tél..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-xs sm:text-sm h-10 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced Filter Drawer */}
          <Sheet open={isFilterDrawerOpen} onOpenChange={handleOpenFilterDrawer}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className={`h-10 border-[#e7e4dd] bg-white gap-1.5 sm:gap-2 relative shrink-0 text-xs ${
                    activeFiltersCount > 0
                      ? 'border-[#c1647a] text-[#c1647a] bg-[#fdf5f7]'
                      : 'text-gray-700 hover:bg-[#faf8f4]'
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

            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-white">
              <SheetHeader>
                <div className="flex items-center gap-2 text-[#24582d]">
                  <Filter className="h-5 w-5" />
                  <SheetTitle>Filtrer les clients</SheetTitle>
                </div>
                <SheetDescription>
                  Affinez votre liste selon le statut, les dépenses ou le tri souhaité.
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut du compte
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Tous', value: 'all' },
                      { label: 'Actif', value: 'actif' },
                      { label: 'Inactif', value: 'inactif' },
                    ].map((item) => {
                      const isSelected = draftStatus === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setDraftStatus(item.value as any)}
                          className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold'
                              : 'border-[#e7e4dd] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Min Spent Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Volume d&apos;achats (Total dépensé)
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: 'Tous les montants', value: 0 },
                      { label: '> 100 000 FCFA', value: 100000 },
                      { label: '> 500 000 FCFA', value: 500000 },
                      { label: '> 1 000 000 FCFA', value: 1000000 },
                    ].map((item) => {
                      const isSelected = draftMinSpent === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setDraftMinSpent(item.value)}
                          className={`w-full py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold'
                              : 'border-[#e7e4dd] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trier par
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: 'Dépenses décroissantes (LTV)', value: 'spent_desc' },
                      { label: 'Nombre de commandes décroissant', value: 'orders_desc' },
                      { label: 'Dernière commande récente', value: 'recent_order' },
                      { label: 'Nom alphabétique (A-Z)', value: 'name_asc' },
                    ].map((item) => {
                      const isSelected = draftSort === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setDraftSort(item.value as any)}
                          className={`w-full py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold'
                              : 'border-[#e7e4dd] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <SheetFooter className="p-4 border-t border-[#e7e4dd] flex flex-row items-center justify-between gap-3 bg-[#faf8f4]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                  className="border-[#e7e4dd] text-gray-600 text-xs gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Réinitialiser
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyFilters}
                  className="bg-[#24582d] hover:bg-[#1b4322] text-white! text-xs font-semibold"
                  style={{ backgroundColor: '#24582d', color: '#ffffff' }}
                >
                  Appliquer les filtres
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filter Chips (if any) */}
      {(statusFilter !== 'all' || minSpentFilter > 0 || sortOption !== 'spent_desc' || segmentFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-600">
          <span className="font-medium text-gray-500">Filtres actifs :</span>
          {segmentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fdf5f7] border border-[#f9e1e6] text-[#c1647a] font-medium">
              Segment : {segmentFilter.toUpperCase()}
              <button onClick={() => setSegmentFilter('all')} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 font-medium">
              Statut : {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {minSpentFilter > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 font-medium">
              Min. dépensé : {formatCurrency(minSpentFilter)}
              <button onClick={() => setMinSpentFilter(0)} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sortOption !== 'spent_desc' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 font-medium">
              Tri personnalisé
              <button onClick={() => setSortOption('spent_desc')} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#c1647a] hover:underline font-medium ml-1"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Client</TableHead>
              <TableHead className="font-semibold text-gray-700">Contact</TableHead>
              <TableHead className="font-semibold text-gray-700">Segment</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Commandes</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Total dépensé</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Dernière commande</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#24582d]" />
                    <p className="text-xs text-gray-500">Chargement des clients...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="h-8 w-8 text-gray-400" />
                    <p className="font-semibold text-gray-700">Aucun client trouvé</p>
                    <p className="text-xs text-gray-500 max-w-sm">
                      {customers.length === 0 ? "Aucun client n'est encore enregistré." : "Aucun profil ne correspond à vos filtres actuels. Modifiez vos critères de recherche."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-2 text-xs border-[#e7e4dd]"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-[#e7e4dd]">
                        <AvatarFallback className="bg-[#edf8ef] text-[#24582d] font-bold text-xs">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-[#1e2a1f] text-sm flex items-center gap-2">
                          <span>{customer.name}</span>
                          {customer.status === 'inactif' && (
                            <span className="h-2 w-2 rounded-full bg-gray-400" title="Inactif" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{customer.address || 'Sénégal'}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium text-gray-800">{customer.email}</div>
                    <div className="text-xs text-gray-500">{customer.phone}</div>
                  </TableCell>

                  <TableCell>{getSegmentBadge(customer.segment, customer.status)}</TableCell>

                  <TableCell className="text-right font-semibold text-gray-800">
                    {customer.totalOrders}
                  </TableCell>

                  <TableCell className="text-right font-bold text-[#24582d]">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>

                  <TableCell className="text-right text-sm text-gray-600">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-[#24582d] hover:bg-gray-100 transition-colors">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-[#e7e4dd] min-w-44">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-gray-400 uppercase">
                            Actions client
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            render={<Link href={`/admin/clients/${customer.id}`} />}
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            Voir le profil
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-[#24582d] font-medium"
                            onClick={() => handleOpenEmailDialog(customer)}
                          >
                            <Mail className="mr-2 h-4 w-4 text-[#24582d]" />
                            Envoyer un e-mail
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Customers Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#24582d]" />
            <p className="text-xs text-gray-500">Chargement des clients...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 space-y-2">
            <UserX className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-700 text-sm">Aucun client trouvé</p>
            <p className="text-xs text-gray-500">
              {customers.length === 0 ? "Aucun client n'est encore enregistré." : "Essayez de modifier vos critères de recherche."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs border-[#e7e4dd]"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white border border-[#e7e4dd] rounded-xl p-3.5 space-y-3 shadow-xs"
            >
              {/* Top Row: Avatar + Name + Segment Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 border border-[#e7e4dd] shrink-0">
                    <AvatarFallback className="bg-[#edf8ef] text-[#24582d] font-bold text-xs">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-[#1e2a1f] truncate">
                      {customer.name}
                    </h4>
                    <span className="text-xs text-gray-500 block truncate">
                      {customer.address || 'Sénégal'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">{getSegmentBadge(customer.segment, customer.status)}</div>
              </div>

              {/* Contact info links */}
              <div className="bg-[#faf8f4] rounded-lg p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-gray-400 text-[11px]">Téléphone :</span>
                  <a href={`tel:${customer.phone}`} className="font-mono font-medium hover:text-[#c1647a]">
                    {customer.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-gray-400 text-[11px]">Email :</span>
                  <a href={`mailto:${customer.email}`} className="truncate max-w-[200px] hover:text-[#c1647a]">
                    {customer.email}
                  </a>
                </div>
              </div>

              {/* Stats Row: Orders + Total Spent + Last Order */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#f0ede6]">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Commandes</span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block">
                    {customer.totalOrders}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Total dépensé</span>
                  <span className="text-xs font-bold text-[#24582d] mt-0.5 block">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Dernier achat</span>
                  <span className="text-[11px] text-gray-600 mt-0.5 block truncate">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#f0ede6]">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/admin/clients/${customer.id}`} />}
                  className="flex-1 h-8 text-xs border-[#e7e4dd] text-gray-700 hover:bg-[#faf8f4] font-medium gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Voir profil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEmailDialog(customer)}
                  className="flex-1 h-8 text-xs border-[#24582d]/30 text-[#24582d] hover:bg-[#edf8ef] font-medium gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Send Email Modal */}
      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        customer={selectedCustomerForEmail}
      />
    </div>
  );
}
