'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminProducts } from '@/lib/admin/mock-data/products';
import { initialStockMovements } from '@/lib/admin/mock-data/stock';
import type { AdminProduct, StockMovement, StockMovementType } from '@/lib/admin/mock-data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  History,
  Layers,
  CheckCircle2,
  Maximize2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStockPage() {
  const [products, setProducts] = useState<AdminProduct[]>(adminProducts);
  const [movements, setMovements] = useState<StockMovement[]>(initialStockMovements);

  // State for viewing full movement reason modal
  const [selectedMovementForReason, setSelectedMovementForReason] = useState<StockMovement | null>(null);


  // Main page tab: 'etat-stock' | 'historique'
  const [mainTab, setMainTab] = useState<'etat-stock' | 'historique'>('etat-stock');

  // Filters for 'etat-stock'
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'priority' | 'stock_asc' | 'stock_desc' | 'name_asc'>('priority');

  // Filters for 'historique'
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | StockMovementType>('all');

  // Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [adjustType, setAdjustType] = useState<StockMovementType>('entree');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Réassort arrivage fleurs fraîches');
  const [customNote, setCustomNote] = useState<string>('');
  const [newMinStock, setNewMinStock] = useState<number>(5);

  // Derived counts for tabs
  const { totalCount, lowStockCount, outOfStockCount } = useMemo(() => {
    let low = 0;
    let out = 0;
    products.forEach((p) => {
      const min = p.minStock ?? 5;
      if (p.stock === 0) {
        out++;
      } else if (p.stock <= min) {
        low++;
      }
    });
    return {
      totalCount: products.length,
      lowStockCount: low,
      outOfStockCount: out,
    };
  }, [products]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Filtered & sorted products for 'etat-stock'
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const min = p.minStock ?? 5;
        // Search query
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

        // Status tab filter
        let matchesStatus = true;
        if (stockStatusFilter === 'low') {
          matchesStatus = p.stock > 0 && p.stock <= min;
        } else if (stockStatusFilter === 'out') {
          matchesStatus = p.stock === 0;
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const minA = a.minStock ?? 5;
        const minB = b.minStock ?? 5;

        if (sortOption === 'priority') {
          // Priority: Out of stock (0) first, then Low stock (<= min), then normal
          const getPriorityScore = (stock: number, min: number) => {
            if (stock === 0) return 0;
            if (stock <= min) return 1;
            return 2;
          };
          const scoreA = getPriorityScore(a.stock, minA);
          const scoreB = getPriorityScore(b.stock, minB);
          if (scoreA !== scoreB) return scoreA - scoreB;
          return a.stock - b.stock;
        }

        if (sortOption === 'stock_asc') return a.stock - b.stock;
        if (sortOption === 'stock_desc') return b.stock - a.stock;
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchQuery, categoryFilter, stockStatusFilter, sortOption]);

  // Filtered movements for 'historique'
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        historySearchQuery.trim() === '' ||
        m.productName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        m.productSku.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        m.reason.toLowerCase().includes(historySearchQuery.toLowerCase());

      const matchesType = historyTypeFilter === 'all' || m.type === historyTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, historySearchQuery, historyTypeFilter]);

  // Open adjustment modal
  const handleOpenAdjustModal = (product: AdminProduct) => {
    setSelectedProduct(product);
    setAdjustType('entree');
    setAdjustQuantity(5);
    setAdjustReason('Réassort arrivage fleurs fraîches');
    setCustomNote('');
    setNewMinStock(product.minStock ?? 5);
    setIsAdjustModalOpen(true);
  };

  // Preview new stock calculation
  const calculatedNewStock = useMemo(() => {
    if (!selectedProduct) return 0;
    const current = selectedProduct.stock;
    const qty = Math.max(0, adjustQuantity);

    if (adjustType === 'entree') {
      return current + qty;
    }
    if (adjustType === 'sortie') {
      return Math.max(0, current - qty);
    }
    if (adjustType === 'ajustement') {
      return qty;
    }
    return current;
  }, [selectedProduct, adjustType, adjustQuantity]);

  // Save stock adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const previousStock = selectedProduct.stock;
    const finalStock = calculatedNewStock;
    const finalReason = customNote.trim() ? `${adjustReason} (${customNote.trim()})` : adjustReason;

    // Determine new status for the product
    const finalMinStock = Math.max(0, newMinStock);
    let finalStatus: AdminProduct['status'] = 'actif';
    if (finalStock === 0) {
      finalStatus = 'rupture';
    }

    // 1. Update product
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              stock: finalStock,
              minStock: finalMinStock,
              status: finalStatus,
            }
          : p
      )
    );

    // 2. Add movement record
    const newMovement: StockMovement = {
      id: `mvt-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      type: adjustType,
      quantity: adjustType === 'ajustement' ? Math.abs(finalStock - previousStock) : adjustQuantity,
      previousStock,
      newStock: finalStock,
      reason: finalReason,
      date: new Date().toISOString(),
      author: 'Admin Décofleur',
    };

    setMovements((prev) => [newMovement, ...prev]);

    toast.success(`Stock mis à jour pour « ${selectedProduct.name} »`, {
      description: `Stock passé de ${previousStock} à ${finalStock} unités.`,
    });

    setIsAdjustModalOpen(false);
  };

  // Status badge helper
  const getStockStatusBadge = (stock: number, minStock: number = 5) => {
    if (stock === 0) {
      return (
        <Badge className="bg-[#ffe5e5] text-[#cc0000] hover:bg-[#ffe5e5]/80 shadow-none border-none font-medium">
          Rupture
        </Badge>
      );
    }
    if (stock <= minStock) {
      return (
        <Badge className="bg-[#fff8cc] text-[#9a7b00] hover:bg-[#fff8cc]/80 shadow-none border-none font-medium">
          Stock faible
        </Badge>
      );
    }
    return (
      <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7]/80 shadow-none border-none font-medium">
        En stock
      </Badge>
    );
  };

  // Movement type badge helper
  const getMovementTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'entree':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium gap-1">
            <TrendingUp className="h-3 w-3" />
            Entrée
          </Badge>
        );
      case 'sortie':
        return (
          <Badge className="bg-[#ffe5e5] text-[#cc0000] border-none font-medium gap-1">
            <TrendingDown className="h-3 w-3" />
            Sortie
          </Badge>
        );
      case 'ajustement':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium gap-1">
            <RefreshCw className="h-3 w-3" />
            Ajustement
          </Badge>
        );
    }
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion du stock</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">
            Suivez vos niveaux d&apos;inventaire, anticipez les réapprovisionnements et suivez les mouvements.
          </p>
        </div>
      </div>

      {/* Main Top Navigation Tabs */}
      <div className="flex border-b border-[#e7e4dd] gap-2">
        <button
          onClick={() => setMainTab('etat-stock')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
            mainTab === 'etat-stock'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>État du stock</span>
        </button>
        <button
          onClick={() => setMainTab('historique')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
            mainTab === 'historique'
              ? 'border-[#24582d] text-[#24582d]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Historique des mouvements</span>
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {movements.length}
          </span>
        </button>
      </div>

      {mainTab === 'etat-stock' ? (
        <div className="space-y-5">
          {/* Status Sub-Pills (Mockup 10 style: Tous, Stock faible, Rupture) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStockStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                stockStatusFilter === 'all'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={stockStatusFilter === 'all' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span style={stockStatusFilter === 'all' ? { color: '#ffffff' } : undefined}>
                Tous
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  stockStatusFilter === 'all'
                    ? 'bg-white/25 text-white!'
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={
                  stockStatusFilter === 'all'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter('low')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                stockStatusFilter === 'low'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={stockStatusFilter === 'low' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={stockStatusFilter === 'low' ? { color: '#ffffff' } : undefined}
              >
                <AlertCircle
                  className="h-3.5 w-3.5"
                  color={stockStatusFilter === 'low' ? '#ffffff' : '#f59e0b'}
                />
                Stock faible
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  stockStatusFilter === 'low'
                    ? 'bg-white/25 text-white!'
                    : 'bg-[#fff8cc] text-[#9a7b00]'
                }`}
                style={
                  stockStatusFilter === 'low'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {lowStockCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter('out')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                stockStatusFilter === 'out'
                  ? 'bg-[#c1647a] text-white! shadow-xs'
                  : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-[#faf8f4]'
              }`}
              style={stockStatusFilter === 'out' ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={stockStatusFilter === 'out' ? { color: '#ffffff' } : undefined}
              >
                <AlertCircle
                  className="h-3.5 w-3.5"
                  color={stockStatusFilter === 'out' ? '#ffffff' : '#ef4444'}
                />
                Rupture
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                  stockStatusFilter === 'out'
                    ? 'bg-white/25 text-white!'
                    : 'bg-[#ffe5e5] text-[#cc0000]'
                }`}
                style={
                  stockStatusFilter === 'out'
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                    : undefined
                }
              >
                {outOfStockCount}
              </span>
            </button>
          </div>


          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-sm"
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

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
              {/* Category selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">Catégorie :</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                >
                  <option value="all">Toutes les catégories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">Trier par :</span>
                <select
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(
                      e.target.value as 'priority' | 'stock_asc' | 'stock_desc' | 'name_asc'
                    )
                  }
                  className="h-9 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                >
                  <option value="priority">Priorité alertes (ruptures d&apos;abord)</option>
                  <option value="stock_asc">Stock croissant</option>
                  <option value="stock_desc">Stock décroissant</option>
                  <option value="name_asc">Nom du produit (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600 py-3.5">Produit</TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 text-center w-[140px]">
                    Stock actuel
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 text-center w-[140px]">
                    Stock minimum
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 w-[140px]">Statut</TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 text-right w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const min = product.minStock ?? 5;
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= min;

                  return (
                    <TableRow key={product.id} className="hover:bg-[#faf8f4]/60 transition-colors">
                      {/* Product cell with image and ref */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-[#e7e4dd]">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#1e2a1f] block leading-snug">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{product.category}</span>
                              <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Current Stock */}
                      <TableCell className="text-center">
                        <span
                          className={`font-bold text-sm px-2.5 py-1 rounded-lg ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-600 font-mono'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700 font-mono'
                              : 'text-gray-900 font-mono'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>

                      {/* Minimum Stock threshold */}
                      <TableCell className="text-center font-mono text-xs text-gray-500">
                        {min}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStockStatusBadge(product.stock, min)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAdjustModal(product)}
                            className="h-8 px-2.5 text-xs border-[#e7e4dd] text-[#24582d] hover:bg-[#edf8ef] hover:border-[#b0c8a8] font-medium"
                            title="Ajuster le stock"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                            Ajuster
                          </Button>
                          <Link
                            href={`/admin/produits/${product.id}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[#e7e4dd] text-gray-500 hover:text-[#24582d] hover:bg-[#faf8f4] transition-colors"
                            title="Voir la fiche produit"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-44 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-gray-300" />
                        <p className="font-medium text-gray-700">Aucun produit ne correspond à ces critères.</p>
                        <p className="text-xs text-gray-400">
                          Modifiez votre recherche ou réinitialisez les filtres.
                        </p>
                        {(searchQuery || categoryFilter !== 'all' || stockStatusFilter !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setCategoryFilter('all');
                              setStockStatusFilter('all');
                            }}
                            className="mt-2 text-xs border-[#e7e4dd]"
                          >
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* Tab: Historique des mouvements */
        <div className="space-y-5">
          {/* Movement search & filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par produit, motif..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-sm"
              />
              {historySearchQuery && (
                <button
                  onClick={() => setHistorySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-medium">Type :</span>
              <select
                value={historyTypeFilter}
                onChange={(e) =>
                  setHistoryTypeFilter(e.target.value as 'all' | StockMovementType)
                }
                className="h-9 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
              >
                <option value="all">Tous les types</option>
                <option value="entree">Entrées (+)</option>
                <option value="sortie">Sorties (-)</option>
                <option value="ajustement">Ajustements</option>
              </select>
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-[#faf8f4]">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600 py-3.5">Date</TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5">Produit</TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5">Type</TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 text-center">
                    Quantité
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 w-[220px]">
                    Motif
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-3.5 text-right">
                    Auteur
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((m) => (
                  <TableRow key={m.id} className="hover:bg-[#faf8f4]/60 transition-colors">
                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      {formatDate(m.date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-[#1e2a1f] block text-sm">
                        {m.productName}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">{m.productSku}</span>
                    </TableCell>
                    <TableCell>{getMovementTypeBadge(m.type)}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-sm">
                      {m.type === 'entree' ? (
                        <span className="text-[#166534]">+{m.quantity}</span>
                      ) : m.type === 'sortie' ? (
                        <span className="text-[#cc0000]">-{m.quantity}</span>
                      ) : (
                        <span className="text-[#3d5a99]">{m.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs text-gray-700 truncate block" title={m.reason}>
                          {m.reason}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMovementForReason(m)}
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors"
                          title="Afficher le motif complet"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-500">{m.author}</TableCell>
                  </TableRow>
                ))}

                {filteredMovements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="h-8 w-8 text-gray-300" />
                        <p className="font-medium text-gray-700">Aucun mouvement enregistré.</p>
                        <p className="text-xs text-gray-400">
                          Les ajustements de stock apparaîtront automatiquement dans ce journal.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </div>
        </div>
      )}

      {/* Drawer (Sheet): Ajuster le stock */}
      <Sheet open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader>
            <div className="flex items-center gap-2 text-[#24582d]">
              <SlidersHorizontal className="h-5 w-5" />
              <SheetTitle className="text-lg font-bold text-[#1e2a1f]">
                Ajuster le stock
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-gray-500">
              Modifiez le stock et enregistrez le motif pour conserver une traçabilité précise.
            </SheetDescription>
          </SheetHeader>

          {selectedProduct && (
            <form onSubmit={handleSaveAdjustment} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Product recap box */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8f4] border border-[#e7e4dd]">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-[#e7e4dd]">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-[#1e2a1f] truncate">
                      {selectedProduct.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{selectedProduct.sku}</span>
                      <span>•</span>
                      <span>
                        Stock actuel :{' '}
                        <strong className="text-gray-900 font-mono">{selectedProduct.stock}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Type of operation selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Type d&apos;opération <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustType('entree');
                        setAdjustReason('Réassort arrivage fleurs fraîches');
                      }}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                        adjustType === 'entree'
                          ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] ring-1 ring-[#24582d]'
                          : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                      }`}
                    >
                      + Entrée
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustType('sortie');
                        setAdjustReason('Perte / Fleur abîmée ou fanée');
                      }}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                        adjustType === 'sortie'
                          ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600'
                          : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                      }`}
                    >
                      - Sortie
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustType('ajustement');
                        setAdjustReason('Correction après inventaire physique');
                      }}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                        adjustType === 'ajustement'
                          ? 'border-[#3d5a99] bg-blue-50 text-[#3d5a99] ring-1 ring-[#3d5a99]'
                          : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                      }`}
                    >
                      = Inventaire
                    </button>
                  </div>
                </div>

                {/* Quantity input & Real-time preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      {adjustType === 'ajustement' ? 'Nouveau stock total' : 'Quantité à modifier'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={adjustType === 'ajustement' ? 0 : 1}
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                      required
                      className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Seuil stock minimum
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(parseInt(e.target.value) || 0)}
                      required
                      className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Calculation Preview Banner */}
                <div className="p-3 rounded-xl bg-[#edf8ef] border border-[#b0c8a8] flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-medium">Évolution estimée du stock :</span>
                  <div className="flex items-center gap-1.5 font-mono text-sm">
                    <span className="text-gray-500">{selectedProduct.stock}</span>
                    <span className="text-gray-400">→</span>
                    <strong className="text-[#24582d] font-bold">{calculatedNewStock} unités</strong>
                  </div>
                </div>

                {/* Reason selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Motif du mouvement</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full rounded-lg border border-[#e7e4dd] bg-white p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                  >
                    {adjustType === 'entree' && (
                      <>
                        <option value="Réassort arrivage fleurs fraîches">
                          Réassort arrivage fleurs fraîches
                        </option>
                        <option value="Réassort plantes & accessoires">
                          Réassort plantes & accessoires
                        </option>
                        <option value="Retour client non livré / annulé">
                          Retour client non livré / annulé
                        </option>
                      </>
                    )}
                    {adjustType === 'sortie' && (
                      <>
                        <option value="Perte / Fleur abîmée ou fanée">
                          Perte / Fleur abîmée ou fanée
                        </option>
                        <option value="Vente directe en boutique physique (Saly)">
                          Vente directe en boutique physique (Saly)
                        </option>
                        <option value="Casse vase ou article décoratif">
                          Casse vase ou article décoratif
                        </option>
                        <option value="Utilisation pour atelier / événement">
                          Utilisation pour atelier / événement
                        </option>
                      </>
                    )}
                    {adjustType === 'ajustement' && (
                      <>
                        <option value="Correction après inventaire physique">
                          Correction après inventaire physique
                        </option>
                        <option value="Régularisation administrative">
                          Régularisation administrative
                        </option>
                      </>
                    )}
                    <option value="Autre motif">Autre motif</option>
                  </select>
                </div>

                {/* Note additionnelle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Note complémentaire (optionnel)
                  </label>
                  <Input
                    placeholder="Ex : Arrivage fournisseur Dakar, fleurs flétries..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-xs"
                  />
                </div>
              </div>

              {/* Drawer Footer */}
              <SheetFooter className="gap-2 p-6 border-t border-[#f0eee8] bg-[#faf8f4] mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 border-[#e7e4dd] text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="cta"
                  className="flex-1 bg-[#c1647a] hover:bg-[#a9576a] !text-white font-medium gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Enregistrer l&apos;ajustement
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal Dialog: Détail complet du motif */}
      <Dialog
        open={!!selectedMovementForReason}
        onOpenChange={(open) => !open && setSelectedMovementForReason(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-[#e7e4dd] p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#24582d]">
              <FileText className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold text-[#1e2a1f]">
                Motif du mouvement
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              Détail et justification du mouvement de stock enregistré.
            </DialogDescription>
          </DialogHeader>

          {selectedMovementForReason && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#e7e4dd] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Produit :</span>
                  <strong className="text-gray-900 font-semibold">
                    {selectedMovementForReason.productName} ({selectedMovementForReason.productSku})
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date :</span>
                  <span className="text-gray-700 font-mono">
                    {formatDate(selectedMovementForReason.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Type & Quantité :</span>
                  <span className="font-mono font-bold">
                    {selectedMovementForReason.type === 'entree' ? (
                      <span className="text-[#166534]">+{selectedMovementForReason.quantity} (Entrée)</span>
                    ) : selectedMovementForReason.type === 'sortie' ? (
                      <span className="text-[#cc0000]">-{selectedMovementForReason.quantity} (Sortie)</span>
                    ) : (
                      <span className="text-[#3d5a99]">{selectedMovementForReason.quantity} (Ajustement)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Auteur :</span>
                  <span className="text-gray-700 font-medium">
                    {selectedMovementForReason.author}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  Texte intégral du motif
                </label>
                <div className="p-3.5 rounded-xl bg-white border border-[#e7e4dd] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedMovementForReason.reason}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedMovementForReason(null)}
              className="w-full border-[#e7e4dd] text-gray-700 hover:bg-gray-100"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
