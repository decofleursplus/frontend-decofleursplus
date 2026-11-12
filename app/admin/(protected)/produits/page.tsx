'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense, useState, useMemo, useEffect } from 'react';
import type { AdminProduct, AdminCategory } from '@/lib/admin/mock-data/types';
import {
  getAdminProducts,
  deleteAdminProduct,
  bulkUpdateAdminProducts,
  bulkDeleteAdminProducts,
  type AdminProductState,
  type AdminProductsResult,
} from '@/lib/api/admin/products';
import { getAdminCategories } from '@/lib/api/admin/categories';
import { ApiClientError } from '@/lib/api/client';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { AdminPagination } from '@/components/admin/admin-pagination';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  RotateCcw,
  Package,
  Check,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

type StateTab = 'all' | AdminProductState;
type StockFilter = 'all' | 'ok' | 'low' | 'out';
type SortOption = 'default' | 'popular' | 'price_asc' | 'price_desc' | 'name';
type BulkStatus = 'ACTIVE' | 'PROMO' | 'ON_QUOTE' | 'HIDDEN';

const STATE_TABS: { value: StateTab; label: string; hint: string }[] = [
  { value: 'all', label: 'Tous', hint: 'Tous les produits' },
  { value: 'active', label: 'Actifs', hint: 'Publiés et disponibles' },
  { value: 'out', label: 'En rupture', hint: 'Publiés mais stock épuisé' },
  { value: 'draft', label: 'Brouillons / Inactifs', hint: 'Non publiés sur la boutique' },
];

const STOCK_LEVELS: { label: string; value: StockFilter }[] = [
  { label: 'Tous les niveaux', value: 'all' },
  { label: 'Stock correct (aucune alerte)', value: 'ok' },
  { label: 'Stock faible (sous le seuil d’alerte)', value: 'low' },
  { label: 'Épuisé (stock total à 0)', value: 'out' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Plus récents', value: 'default' },
  { label: 'Plus vendus', value: 'popular' },
  { label: 'Prix croissant', value: 'price_asc' },
  { label: 'Prix décroissant', value: 'price_desc' },
  { label: 'Nom alphabétique (A-Z)', value: 'name' },
];

const BULK_STATUSES: { value: BulkStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Publier (en vente)' },
  { value: 'PROMO', label: 'Publier en promotion' },
  { value: 'ON_QUOTE', label: 'Publier sur devis' },
  { value: 'HIDDEN', label: 'Passer en brouillon (masquer)' },
];

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiClientError || err instanceof Error ? err.message : fallback);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

/** Statut harmonisé : Actif / En rupture / Brouillon, avec une précision commerciale (promo, sur devis). */
function ProductStateBadge({ product }: { product: AdminProduct }) {
  if (product.status === 'HIDDEN') {
    return <Badge className="bg-gray-100 text-gray-700 border-none font-medium">Brouillon / Inactif</Badge>;
  }
  const outOfStock = product.stock <= 0 && product.status !== 'ON_QUOTE';
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {outOfStock ? (
        <Badge className="bg-[#fef2f2] text-[#991b1b] border-none font-medium">En rupture</Badge>
      ) : (
        <Badge className="bg-[#e8f4ea] text-[#166534] border-none font-medium">Actif</Badge>
      )}
      {product.status === 'PROMO' && <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none font-medium">Promo</Badge>}
      {product.status === 'ON_QUOTE' && <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium">Sur devis</Badge>}
    </span>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsScreen />
    </Suspense>
  );
}

function ProductsScreen() {
  const searchParams = useSearchParams();
  const { currentUser } = useAdminSidebar();
  const canDelete = ['ADMIN', 'MANAGER'].includes(currentUser?.role ?? '');

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<AdminProductsResult['counts']>({ all: 0, active: 0, out: 0, draft: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiCategories, setApiCategories] = useState<AdminCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // ?categorie=<slug> (lien « Voir les produits » depuis Catégories)
  const [selectedCategory, setSelectedCategoryState] = useState<string>(searchParams.get('categorie') || 'all');
  const [stateTab, setStateTabState] = useState<StateTab>('all');
  const [selectedStock, setSelectedStockState] = useState<StockFilter>('all');
  const [selectedSort, setSelectedSortState] = useState<SortOption>('default');
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sélection multiple (page courante)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Tout changement de filtre ou de page revient à une sélection vide
  const resetSelection = () => setSelectedIds(new Set());
  const setPage = (p: number) => {
    setPageState(p);
    resetSelection();
  };
  const setSelectedCategory = (v: string) => {
    setSelectedCategoryState(v);
    setPage(1);
  };
  const setStateTab = (v: StateTab) => {
    setStateTabState(v);
    setPage(1);
  };
  const setSelectedStock = (v: StockFilter) => {
    setSelectedStockState(v);
    setPage(1);
  };
  const setSelectedSort = (v: SortOption) => {
    setSelectedSortState(v);
    setPage(1);
  };

  useEffect(() => {
    let active = true;
    getAdminCategories()
      .then((cats) => {
        if (active && cats) setApiCategories(cats);
      })
      .catch((err) => toast.error(errorMessage(err, 'Catégories indisponibles')));
    return () => {
      active = false;
    };
  }, []);

  // Recherche envoyée au serveur après une courte pause de saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPageState(1);
      setSelectedIds(new Set());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      state: stateTab !== 'all' ? stateTab : undefined,
      stock: selectedStock !== 'all' ? selectedStock : undefined,
      sort: selectedSort !== 'default' ? selectedSort : undefined,
      page,
      limit: pageSize,
    }),
    [searchQuery, selectedCategory, stateTab, selectedStock, selectedSort, page, pageSize]
  );
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([query, retry]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey && !refreshing;

  const applyResult = (res: AdminProductsResult) => {
    setProducts(res.items);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setCounts(res.counts);
    setLoadError(null);
  };

  useEffect(() => {
    let cancelled = false;
    getAdminProducts(query)
      .then((res) => {
        if (!cancelled) applyResult(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Erreur lors du chargement des produits'));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestKey]);

  async function reload() {
    setRefreshing(true);
    try {
      applyResult(await getAdminProducts(query));
    } catch (err) {
      toast.error(errorMessage(err, 'Erreur lors du chargement des produits'));
    } finally {
      setRefreshing(false);
    }
  }

  // Draft filters inside drawer (applied only when clicking "Appliquer")
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<string>('all');
  const [draftStock, setDraftStock] = useState<StockFilter>('all');
  const [draftSort, setDraftSort] = useState<SortOption>('default');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftCategory(selectedCategory);
      setDraftStock(selectedStock);
      setDraftSort(selectedSort);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedStock(draftStock);
    setSelectedSort(draftSort);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDraftCategory('all');
    setDraftStock('all');
    setDraftSort('default');
    setSelectedCategory('all');
    setStateTab('all');
    setSelectedStock('all');
    setSelectedSort('default');
    setSearchInput('');
    setIsFilterOpen(false);
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) + (selectedStock !== 'all' ? 1 : 0) + (selectedSort !== 'default' ? 1 : 0);

  const categories = useMemo(() => {
    const list = apiCategories.map((c) => ({
      label: c.name,
      id: c.id,
      count: c.totalProductCount ?? c.productCount,
      value: c.slug || c.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'),
    }));
    return [{ label: 'Toutes', id: '', count: null as number | null, value: 'all' }, ...list];
  }, [apiCategories]);

  // ---------- Sélection ----------
  const pageIds = products.map((p) => p.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllOnPage = () => setSelectedIds(allOnPageSelected ? new Set() : new Set(pageIds));

  const summarizeFailures = (failed: { id: string; message: string }[]) => {
    if (failed.length === 0) return undefined;
    const names = failed.map((f) => products.find((p) => p.id === f.id)?.name ?? f.id);
    return `${failed.length} échec(s) : ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''} — ${failed[0].message}`;
  };

  const runBulkUpdate = async (patch: { status?: BulkStatus; categoryId?: string }, label: string) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await bulkUpdateAdminProducts({ ids, ...patch });
      const failure = summarizeFailures(res.failed);
      if (res.updated > 0) {
        toast.success(`${res.updated} produit(s) mis à jour : ${label}`, failure ? { description: failure } : undefined);
      } else {
        toast.error('Aucun produit n’a été modifié', { description: failure });
      }
      resetSelection();
      await reload();
    } catch (err) {
      toast.error(errorMessage(err, 'L’action groupée a échoué.'));
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkBusy(true);
    try {
      const res = await bulkDeleteAdminProducts(ids);
      const parts = [
        res.deleted > 0 ? `${res.deleted} supprimé(s) définitivement` : null,
        res.hidden > 0 ? `${res.hidden} masqué(s) car présents dans des commandes` : null,
      ].filter(Boolean);
      toast.success(parts.join(' · ') || 'Aucun produit supprimé', {
        description: summarizeFailures(res.failed),
      });
      setBulkDeleteOpen(false);
      resetSelection();
      await reload();
    } catch (err) {
      toast.error(errorMessage(err, 'La suppression groupée a échoué.'));
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(productToDelete.id);
      toast.success(`« ${productToDelete.name} » est passé en brouillon : il n’est plus visible sur la boutique.`);
      setProductToDelete(null);
      await reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Impossible de masquer le produit'));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(searchQuery) || activeFiltersCount > 0 || stateTab !== 'all';
  const selectionCount = selectedIds.size;

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Package className="h-8 w-8 text-gray-300" />
      <p className="font-medium text-gray-700 text-sm">
        {hasFilters ? 'Aucun produit ne correspond à ces critères.' : 'Aucun produit dans le catalogue.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 text-xs border-[#e7e4dd]">
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  const rowActions = (product: AdminProduct) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-500 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] transition-colors focus:outline-none shrink-0">
        <span className="sr-only">Actions pour {product.name}</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-52 p-1.5 rounded-xl border border-[#e7e4dd] bg-white shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</DropdownMenuLabel>
          {product.status !== 'HIDDEN' && (
            <DropdownMenuItem
              className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] whitespace-nowrap"
              render={<Link href={`/produits/${product.slug || product.id}`} target="_blank" rel="noopener noreferrer" />}
            >
              <Eye className="mr-2.5 h-4 w-4 text-[#24582d]" />
              Voir sur le site
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] whitespace-nowrap"
            render={<Link href={`/admin/produits/${product.id}`} />}
          >
            <Edit className="mr-2.5 h-4 w-4 text-blue-600" />
            Modifier
          </DropdownMenuItem>
          {product.status !== 'HIDDEN' && canDelete && (
            <>
              <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />
              <DropdownMenuItem
                onClick={() => setProductToDelete(product)}
                className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-red-600 hover:bg-red-50 whitespace-nowrap focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="mr-2.5 h-4 w-4 text-red-600" />
                Masquer (brouillon)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const thumb = (product: AdminProduct, size: number) => (
    <div
      className="relative rounded-lg overflow-hidden bg-gray-100 border border-[#e7e4dd] shrink-0"
      style={{ width: size, height: size }}
    >
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <Package className="h-5 w-5" />
        </div>
      )}
    </div>
  );

  const stockClass = (stock: number) =>
    stock === 0 ? 'text-red-600' : stock <= 5 ? 'text-amber-600' : 'text-gray-700';

  return (
    <div className={`space-y-6 ${selectionCount > 0 ? 'pb-24 lg:pb-0' : ''}`}>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des produits</h1>
          <p className="admin-page-subtitle">Gérez votre catalogue de fleurs, plantes et cadeaux.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={reload}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="cta"
            className="bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs w-full sm:w-auto"
            render={<Link href="/admin/produits/nouveau" />}
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Onglets d'état (compteurs serveur) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar" role="tablist" aria-label="État des produits">
        {STATE_TABS.map((tab) => {
          const isActive = stateTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={tab.hint}
              onClick={() => setStateTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive ? 'bg-[#193e23] text-white shadow-2xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#e7e4dd]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#e7e4dd]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, description ou référence..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-xs sm:text-sm"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 flex-1 sm:flex-none sm:w-48 rounded-lg border border-[#e7e4dd] bg-white px-2 text-xs text-gray-700"
            aria-label="Catégorie"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.value === 'all' ? 'Toutes les catégories' : `${cat.label}${cat.count !== null ? ` (${cat.count})` : ''}`}
              </option>
            ))}
          </select>

          <Sheet open={isFilterOpen} onOpenChange={handleOpenFilterDrawer}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className={`border-[#e7e4dd] shrink-0 transition-colors ${
                    activeFiltersCount > 0 ? 'border-[#c1647a] text-[#c1647a] bg-[#fdf5f7]' : 'text-gray-700 hover:bg-[#faf8f4]'
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
                  <SheetTitle>Filtrer les produits</SheetTitle>
                </div>
                <SheetDescription>Affinez votre catalogue selon vos critères et validez.</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Catégorie</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const isSelected = draftCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setDraftCategory(cat.value)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                              : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Niveau de stock</label>
                  <div className="grid grid-cols-1 gap-2">
                    {STOCK_LEVELS.map((lvl) => {
                      const isSelected = draftStock === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setDraftStock(lvl.value)}
                          className={`flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                              : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                          }`}
                        >
                          <span>{lvl.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Tri des résultats
                  </label>
                  <select
                    value={draftSort}
                    onChange={(e) => setDraftSort(e.target.value as SortOption)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-[#e7e4dd] bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <SheetFooter className="gap-3">
                <Button type="button" variant="outline" onClick={handleResetFilters} className="flex-1 border-[#e7e4dd] text-gray-600 hover:bg-gray-100">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Réinitialiser
                </Button>
                <Button type="button" variant="cta" onClick={handleApplyFilters} className="flex-1 bg-[#c1647a] hover:bg-[#a9576a] !text-white">
                  Appliquer les filtres
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-gray-500">Filtres actifs :</span>
          {selectedCategory !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 border-none text-xs gap-1 py-1">
              Catégorie : {categories.find((c) => c.value === selectedCategory)?.label ?? selectedCategory}
              <button type="button" aria-label="Retirer le filtre catégorie" onClick={() => setSelectedCategory('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {selectedStock !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 border-none text-xs gap-1 py-1">
              Stock : {STOCK_LEVELS.find((s) => s.value === selectedStock)?.label}
              <button type="button" aria-label="Retirer le filtre stock" onClick={() => setSelectedStock('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {selectedSort !== 'default' && (
            <Badge className="bg-[#f0eee8] text-gray-700 border-none text-xs gap-1 py-1">
              Tri : {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label}
              <button type="button" aria-label="Retirer le tri" onClick={() => setSelectedSort('default')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          <button type="button" onClick={handleResetFilters} className="text-xs text-[#c1647a] hover:underline font-medium ml-1">
            Tout effacer
          </button>
        </div>
      )}

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setRetry((n) => n + 1)}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Barre d'actions groupées : discrète (desktop au-dessus du tableau, mobile fixée en bas) */}
      {selectionCount > 0 && (
        <div
          role="region"
          aria-label="Actions groupées"
          className="fixed inset-x-3 bottom-3 z-40 lg:static lg:inset-auto flex flex-wrap items-center gap-2 rounded-xl border border-[#193e23]/20 bg-[#f3f8f3] px-3 py-2.5 shadow-lg lg:shadow-none"
        >
          <span className="text-xs font-semibold text-[#193e23] mr-1">
            {selectionCount} sélectionné{selectionCount > 1 ? 's' : ''}
          </span>
          <select
            value=""
            disabled={bulkBusy}
            onChange={(e) => {
              const status = e.target.value as BulkStatus;
              if (status) runBulkUpdate({ status }, BULK_STATUSES.find((s) => s.value === status)?.label ?? status);
            }}
            className="h-8 rounded-md border border-[#e7e4dd] bg-white px-2 text-xs"
            aria-label="Changer le statut de la sélection"
          >
            <option value="">Modifier le statut…</option>
            {BULK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value=""
            disabled={bulkBusy}
            onChange={(e) => {
              const cat = categories.find((c) => c.id === e.target.value);
              if (cat) runBulkUpdate({ categoryId: cat.id }, `catégorie « ${cat.label} »`);
            }}
            className="h-8 rounded-md border border-[#e7e4dd] bg-white px-2 text-xs max-w-44"
            aria-label="Changer la catégorie de la sélection"
          >
            <option value="">Changer de catégorie…</option>
            {categories
              .filter((c) => c.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
          {canDelete && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => setBulkDeleteOpen(true)}
              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Supprimer
            </Button>
          )}
          {bulkBusy && <Loader2 className="h-4 w-4 animate-spin text-[#193e23]" aria-label="Traitement en cours" />}
          <button type="button" onClick={resetSelection} className="ml-auto text-xs text-gray-500 hover:text-gray-800 underline">
            Annuler la sélection
          </button>
        </div>
      )}

      {/* Mobile Products Card View (visible on < lg) */}
      <div className="space-y-3 lg:hidden">
        {products.length > 0 && (
          <label className="flex items-center gap-2 px-1 text-xs text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#193e23]"
              checked={allOnPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = someOnPageSelected;
              }}
              onChange={toggleAllOnPage}
            />
            Tout sélectionner ({products.length})
          </label>
        )}
        {loading && products.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 space-y-2">
            <Loader2 className="h-7 w-7 text-[#c1647a] animate-spin mx-auto" />
            <p className="text-sm font-medium">Chargement des produits...</p>
          </div>
        ) : products.length === 0 && !loadError ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8">{emptyState}</div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border p-3.5 shadow-2xs space-y-3 transition-opacity ${loading ? 'opacity-60' : ''} ${
                selectedIds.has(product.id) ? 'border-[#193e23]/40 ring-1 ring-[#193e23]/20' : 'border-[#e7e4dd]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#193e23] shrink-0"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggleOne(product.id)}
                  aria-label={`Sélectionner ${product.name}`}
                />
                {thumb(product, 64)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <Link href={`/admin/produits/${product.id}`} className="font-bold text-sm text-[#1e2a1f] hover:text-[#24582d] truncate">
                      {product.name}
                    </Link>
                    {rowActions(product)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 font-medium">{product.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-gray-400 font-mono">{product.sku}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <ProductStateBadge product={product} />
                    <span className={`text-[11px] font-semibold ${stockClass(product.stock)}`}>Stock : {product.stock}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-base text-[#24582d]">{formatCurrency(product.promoPrice ?? product.price)}</span>
                <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-gray-700 border-[#e7e4dd]" render={<Link href={`/admin/produits/${product.id}`} />}>
                  <Edit size={13} className="mr-1" />
                  Modifier
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Products Desktop Table (visible on lg+) */}
      <div className="hidden lg:block bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#193e23] align-middle"
                  checked={allOnPageSelected}
                  disabled={products.length === 0}
                  ref={(el) => {
                    if (el) el.indeterminate = someOnPageSelected;
                  }}
                  onChange={toggleAllOnPage}
                  aria-label="Tout sélectionner sur cette page"
                />
              </TableHead>
              <TableHead className="w-[72px]">Image</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={`transition-opacity ${loading && products.length > 0 ? 'opacity-60' : ''}`}>
            {loading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 text-[#c1647a] animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Chargement des produits...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 && !loadError ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const selected = selectedIds.has(product.id);
                return (
                  <TableRow key={product.id} className={`transition-colors ${selected ? 'bg-[#f3f8f3]' : 'hover:bg-[#faf8f4]/60'}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#193e23] align-middle"
                        checked={selected}
                        onChange={() => toggleOne(product.id)}
                        aria-label={`Sélectionner ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>{thumb(product, 48)}</TableCell>
                    <TableCell>
                      <Link href={`/admin/produits/${product.id}`} className="font-semibold text-[#1e2a1f] hover:text-[#24582d]">
                        {product.name}
                      </Link>
                      <div className="text-xs text-gray-500 font-mono">Réf : {product.sku}</div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-[#24582d]">{formatCurrency(product.promoPrice ?? product.price)}</span>
                      {product.promoPrice !== undefined && (
                        <span className="block text-[11px] text-gray-400 line-through">{formatCurrency(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${stockClass(product.stock)}`}>{product.stock}</span>
                    </TableCell>
                    <TableCell>
                      <ProductStateBadge product={product} />
                    </TableCell>
                    <TableCell className="text-right">{rowActions(product)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        itemLabel="produits"
        disabled={loading || refreshing}
      />

      {/* Masquage d'un produit */}
      <Dialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border border-[#e7e4dd] rounded-2xl shadow-2xl p-6">
          <DialogHeader className="gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 font-serif">Masquer le produit ?</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-gray-900 font-semibold">{productToDelete?.name}</strong> (Réf : {productToDelete?.sku}) passera en
              brouillon : il ne sera plus visible ni trouvable sur la boutique. L’historique des commandes est conservé et vous pourrez le
              republier à tout moment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button type="button" variant="outline" onClick={() => setProductToDelete(null)} className="border-[#e7e4dd] text-gray-700 hover:bg-gray-100 rounded-xl">
              Annuler
            </Button>
            <Button type="button" onClick={confirmDeleteProduct} disabled={deleting} className="bg-red-600 hover:bg-red-700 !text-white rounded-xl shadow-xs">
              {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Masquer le produit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression groupée */}
      <Dialog open={bulkDeleteOpen} onOpenChange={(open) => !bulkBusy && setBulkDeleteOpen(open)}>
        <DialogContent className="sm:max-w-md bg-white border border-[#e7e4dd] rounded-2xl shadow-2xl p-6">
          <DialogHeader className="gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 font-serif">
              Supprimer {selectionCount} produit{selectionCount > 1 ? 's' : ''} ?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
              Les produits jamais commandés seront <strong>supprimés définitivement</strong>. Ceux qui figurent dans des commandes seront
              seulement masqués (brouillon) pour conserver l’historique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button type="button" variant="outline" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(false)} className="border-[#e7e4dd] rounded-xl">
              Annuler
            </Button>
            <Button type="button" onClick={runBulkDelete} disabled={bulkBusy} className="bg-red-600 hover:bg-red-700 !text-white rounded-xl">
              {bulkBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
