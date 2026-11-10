'use client';

import { useState, useMemo, useEffect } from 'react';
import type { AdminProduct, AdminCategory } from '@/lib/admin/mock-data/types';
import { getAdminProducts, deleteAdminProduct } from '@/lib/api/admin/products';
import { getAdminCategories } from '@/lib/api/admin/categories';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [apiCategories, setApiCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Applied filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('default');

  useEffect(() => {
    let active = true;
    getAdminCategories()
      .then((cats) => {
        if (active && cats) setApiCategories(cats);
      })
      .catch((err) => console.warn('Erreur chargement catégories filter:', err));
    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await getAdminProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setProducts(res.items);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await getAdminProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });
        if (active) {
          setProducts(res.items);
        }
      } catch {
        toast.error('Erreur lors du chargement des produits');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Draft filters inside drawer (applied only when clicking "Appliquer")
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<string>('all');
  const [draftStatus, setDraftStatus] = useState<string>('all');
  const [draftStock, setDraftStock] = useState<string>('all');
  const [draftSort, setDraftSort] = useState<string>('default');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  // Sync draft filters when opening drawer
  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftCategory(selectedCategory);
      setDraftStatus(selectedStatus);
      setDraftStock(selectedStock);
      setDraftSort(selectedSort);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedStatus(draftStatus);
    setSelectedStock(draftStock);
    setSelectedSort(draftSort);
    setIsFilterOpen(false);
    toast.success('Filtres appliqués');
  };

  const handleResetFilters = () => {
    setDraftCategory('all');
    setDraftStatus('all');
    setDraftStock('all');
    setDraftSort('default');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedStock('all');
    setSelectedSort('default');
    setIsFilterOpen(false);
    toast.info('Filtres réinitialisés');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (selectedStock !== 'all') count++;
    if (selectedSort !== 'default') count++;
    return count;
  }, [selectedCategory, selectedStatus, selectedStock, selectedSort]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-[#e8f4ea] text-[#166534] hover:bg-[#d5ebd8] border-none font-medium">Actif</Badge>;
      case 'brouillon':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-medium">Brouillon</Badge>;
      case 'rupture':
        return <Badge className="bg-[#fef2f2] text-[#991b1b] hover:bg-[#fee2e2] border-none font-medium">Rupture</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const categories = useMemo(() => {
    const list = apiCategories.map((c) => ({
      label: c.name,
      value: c.slug || c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
    }));
    return [{ label: 'Tous', value: 'all' }, ...list];
  }, [apiCategories]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search
        const matchesSearch =
          searchQuery.trim() === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase());

        // Category
        const selectedCatObj = categories.find((c) => c.value === selectedCategory);
        const matchesCategory =
          selectedCategory === 'all' ||
          product.category.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCatObj && product.category.toLowerCase() === selectedCatObj.label.toLowerCase()) ||
          product.categoryId === selectedCategory;

        // Status
        const matchesStatus =
          selectedStatus === 'all' || product.status === selectedStatus;

        // Stock
        let matchesStock = true;
        if (selectedStock === 'in_stock') {
          matchesStock = product.stock > 5;
        } else if (selectedStock === 'low_stock') {
          matchesStock = product.stock > 0 && product.stock <= 5;
        } else if (selectedStock === 'out_of_stock') {
          matchesStock = product.stock === 0;
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        if (selectedSort === 'price_asc') return a.price - b.price;
        if (selectedSort === 'price_desc') return b.price - a.price;
        if (selectedSort === 'stock_asc') return a.stock - b.stock;
        if (selectedSort === 'stock_desc') return b.stock - a.stock;
        if (selectedSort === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedStock, selectedSort, categories]);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteAdminProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`Le produit "${productToDelete.name}" a été supprimé`);
    } catch {
      toast.error('Impossible de supprimer le produit');
    } finally {
      setProductToDelete(null);
    }
  };

  const statuses = [
    { label: 'Tous les statuts', value: 'all' },
    { label: 'Actif', value: 'actif' },
    { label: 'Brouillon', value: 'brouillon' },
    { label: 'Rupture', value: 'rupture' },
  ];

  const stockLevels = [
    { label: 'Tous les niveaux', value: 'all' },
    { label: 'En stock (> 5)', value: 'in_stock' },
    { label: 'Stock faible (1 à 5)', value: 'low_stock' },
    { label: 'En rupture (0)', value: 'out_of_stock' },
  ];

  const sortOptions = [
    { label: 'Par défaut', value: 'default' },
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Stock croissant', value: 'stock_asc' },
    { label: 'Stock décroissant', value: 'stock_desc' },
    { label: 'Nom alphabétique (A-Z)', value: 'name_asc' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des produits</h1>
          <p className="admin-page-subtitle">
            Gérez votre catalogue de fleurs, plantes et cadeaux.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
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

      {/* Categories Quick Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.value;
          const count = cat.value === 'all'
            ? products.length
            : products.filter((p) => p.category.toLowerCase() === cat.value.toLowerCase()).length;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#193e23] text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#e7e4dd]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
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
            placeholder="Rechercher par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-xs sm:text-sm"
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
          {/* Filter Drawer */}
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
                  <SheetTitle>Filtrer les produits</SheetTitle>
                </div>
                <SheetDescription>
                  Affinez votre inventaire selon vos critères et validez.
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Category Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Catégorie
                  </label>
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

                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut du produit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {statuses.map((stat) => {
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
                          <span>{stat.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#24582d]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stock Level Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Niveau de stock
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {stockLevels.map((lvl) => {
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

                {/* Sort Option */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Tri des résultats
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

      {/* Active Filter Pills (if any) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-gray-500">Filtres actifs :</span>
          {selectedCategory !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Catégorie : {categories.find((c) => c.value === selectedCategory)?.label}
              <button onClick={() => setSelectedCategory('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Statut : {statuses.find((s) => s.value === selectedStatus)?.label}
              <button onClick={() => setSelectedStatus('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {selectedStock !== 'all' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Stock : {stockLevels.find((s) => s.value === selectedStock)?.label}
              <button onClick={() => setSelectedStock('all')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
          {selectedSort !== 'default' && (
            <Badge className="bg-[#f0eee8] text-gray-700 hover:bg-[#e7e4dd] border-none text-xs gap-1 py-1">
              Tri : {sortOptions.find((o) => o.value === selectedSort)?.label}
              <button onClick={() => setSelectedSort('default')}>
                <X className="h-3 w-3 hover:text-red-600" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Mobile Products Card View (visible on < lg) */}
      <div className="space-y-3 lg:hidden">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-[#e7e4dd] p-3.5 shadow-2xs space-y-3"
          >
            <div className="flex items-start gap-3">
              {/* Product Thumbnail */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-[#e7e4dd] shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="font-bold text-sm text-[#1e2a1f] hover:text-[#24582d] truncate"
                  >
                    {product.name}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0">
                      <MoreHorizontal size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={4}
                      className="w-52 p-1.5 rounded-xl border border-[#e7e4dd] bg-white shadow-xl"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2.5 py-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                          render={<Link href={`/admin/produits/${product.id}`} />}
                        >
                          <Edit className="mr-2 h-3.5 w-3.5 text-[#24582d]" />
                          Modifier la fiche
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef]"
                          render={<Link href={`/boutique/${product.id}`} target="_blank" />}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5 text-gray-500" />
                          Voir sur la boutique
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-1.5 px-2.5 rounded-lg text-xs text-red-600 hover:bg-red-50 focus:bg-red-50"
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5 text-red-600" />
                          Supprimer le produit
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600 font-medium">
                    {product.category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {product.sku}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  {getStatusBadge(product.status)}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      product.stock === 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : product.stock <= 5
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Price + Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Prix</span>
                <span className="font-bold text-base text-[#24582d]">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-gray-700 border-[#e7e4dd]"
                  render={<Link href={`/admin/produits/${product.id}`} />}
                >
                  <Edit size={13} className="mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 border-red-100 hover:bg-red-50"
                  onClick={() => setProductToDelete(product)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {loading ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 space-y-2">
            <Loader2 className="h-7 w-7 text-[#c1647a] animate-spin mx-auto" />
            <p className="text-sm font-medium">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center text-gray-500 space-y-2">
            <Package className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-medium text-gray-700 text-sm">Aucun produit ne correspond à ces critères</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs border-[#e7e4dd]"
            >
              Effacer les filtres
            </Button>
          </div>
        ) : null}
      </div>

      {/* Products Desktop Table (visible on lg+) */}
      <div className="hidden lg:block bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-[#faf8f4]/60 transition-colors">
                {/* Image Cell with Fallback */}
                <TableCell>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-[#e7e4dd] shrink-0">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Product Name & SKU */}
                <TableCell>
                  <div className="font-semibold text-[#1e2a1f]">{product.name}</div>
                  <div className="text-xs text-gray-500 font-mono">Réf: {product.sku}</div>
                </TableCell>

                <TableCell className="text-gray-600 font-medium">{product.category}</TableCell>

                <TableCell className="text-right font-semibold text-[#24582d]">
                  {formatCurrency(product.price)}
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      product.stock === 0
                        ? 'text-red-600'
                        : product.stock <= 5
                        ? 'text-amber-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {product.stock}
                  </span>
                </TableCell>

                <TableCell>{getStatusBadge(product.status)}</TableCell>

                {/* Actions Cell with Redesigned Dropdown Menu */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-500 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] transition-colors focus:outline-none">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={4}
                      className="w-52 p-1.5 rounded-xl border border-[#e7e4dd] bg-white shadow-xl"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>

                        {/* View on Store (Open in new tab, no wrapping!) */}
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          render={
                            <Link
                              href={`/produits/${product.slug || product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <Eye className="mr-2.5 h-4 w-4 text-[#24582d]" />
                          Voir sur le site
                        </DropdownMenuItem>

                        {/* Edit Product */}
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          render={<Link href={`/admin/produits/${product.id}`} />}
                        >
                          <Edit className="mr-2.5 h-4 w-4 text-blue-600" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />

                        {/* Delete Product */}
                        <DropdownMenuItem
                          onClick={() => setProductToDelete(product)}
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2.5 h-4 w-4 text-red-600" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 text-[#c1647a] animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Chargement des produits...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-gray-300" />
                    <p className="font-medium text-gray-700">Aucun produit ne correspond aux critères.</p>
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
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog for Deletion */}
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
            <DialogTitle className="text-lg font-bold text-gray-900 font-serif">
              Supprimer le produit ?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
              Êtes-vous certain de vouloir supprimer{' '}
              <strong className="text-gray-900 font-semibold">{productToDelete?.name}</strong>{' '}
              (Réf: {productToDelete?.sku}) ? Cette action est irréversible et retirera le produit du catalogue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductToDelete(null)}
              className="border-[#e7e4dd] text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700 !text-white rounded-xl shadow-xs"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
