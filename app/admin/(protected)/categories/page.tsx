'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { AdminCategory } from '@/lib/admin/mock-data/types';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '@/lib/api/admin/categories';
import { ApiClientError } from '@/lib/api/client';
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
import { ImageUploader } from '@/components/admin/image-uploader';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  Power,
  FolderTree,
  AlertTriangle,
  X,
  PackageCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SubcategoriesDialog } from '@/components/admin/subcategories-dialog';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');

  // Load categories from API
  async function loadCategories(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories'))
      .finally(() => setLoading(false));
  }, []);

  /** Recharge après une modification (compteurs et sous-catégories à jour). */
  const reloadCategories = () => getAdminCategories().then(setCategories);
  const [subcategoriesFor, setSubcategoriesFor] = useState<AdminCategory | null>(null);

  // Create / Edit modal state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'actif' | 'inactif'>('actif');
  const [formImage, setFormImage] = useState<string>('');

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cat.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  // Open Form Dialog for Create
  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormStatus('actif');
    setFormImage('');
    setIsFormDialogOpen(true);
  };

  // Open Form Dialog for Edit
  const handleOpenEditDialog = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description);
    setFormStatus(category.status);
    setFormImage(category.imageUrl || '');
    setIsFormDialogOpen(true);
  };

  // Save (Create or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Update API
        await updateAdminCategory(editingCategory.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          imageUrl: formImage.trim() || null,
          isActive: formStatus === 'actif',
        });
        await reloadCategories();
        toast.success('Catégorie mise à jour avec succès');
      } else {
        // Create API
        await createAdminCategory({
          name: formName.trim(),
          description: formDescription.trim(),
          imageUrl: formImage.trim() || null,
          isActive: formStatus === 'actif',
        });
        await reloadCategories();
        toast.success('Catégorie créée avec succès');
      }
      setIsFormDialogOpen(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.details && err.details.length > 0) {
        const detailsStr = err.details
          .map((d) => (d.path ? `${d.path}: ${d.message}` : d.message))
          .join(', ');
        toast.error(`Erreur de validation : ${detailsStr}`);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erreur lors de l’enregistrement de la catégorie');
      }
    } finally {
      setSaving(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (category: AdminCategory) => {
    const activate = category.status !== 'actif';
    try {
      await updateAdminCategory(category.id, { isActive: activate });
      await reloadCategories();
      toast.success(
        activate ? `« ${category.name} » est de nouveau visible en boutique.` : `« ${category.name} » et ses produits sont masqués de la boutique.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Changement de statut impossible.');
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteAdminCategory(categoryToDelete.id);
      await reloadCategories();
      toast.success(`La catégorie "${categoryToDelete.name}" a été supprimée.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer la catégorie.');
    } finally {
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e2a1f]">Gestion des catégories</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Gérez les catégories de votre catalogue pour organiser vos produits.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadCategories(true)}
            disabled={loading || refreshing}
            className="h-10 text-xs text-gray-700 bg-white border-[#e7e4dd] hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
            Actualiser
          </Button>
          <Button
            onClick={handleOpenCreateDialog}
            variant="cta"
            className="bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs font-medium w-full sm:w-auto h-10 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#e7e4dd]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-sm"
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

          <span className="hidden sm:inline-flex text-xs text-gray-500 font-medium whitespace-nowrap bg-[#faf8f4] px-2.5 py-1.5 rounded-lg border border-[#e7e4dd]">
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Status Filter Pills (Horizontal scrollable on mobile) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f0eee8]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#24582d] text-white shadow-xs'
                  : 'bg-[#faf8f4] text-gray-600 border border-[#e7e4dd] hover:bg-gray-100'
              }`}
            >
              Toutes ({categories.length})
            </button>
            <button
              onClick={() => setStatusFilter('actif')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'actif'
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-[#faf8f4] text-gray-600 border border-[#e7e4dd] hover:bg-gray-100'
              }`}
            >
              Actives ({categories.filter((c) => c.status === 'actif').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactif')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'inactif'
                  ? 'bg-gray-700 text-white shadow-xs'
                  : 'bg-[#faf8f4] text-gray-600 border border-[#e7e4dd] hover:bg-gray-100'
              }`}
            >
              Inactives ({categories.filter((c) => c.status === 'inactif').length})
            </button>
          </div>

          <span className="sm:hidden text-xs text-gray-500 font-medium whitespace-nowrap bg-[#faf8f4] px-2 py-1 rounded-md border border-[#e7e4dd] shrink-0">
            {filteredCategories.length}
          </span>
        </div>
      </div>

      {/* Desktop Table View (>= 1024px) */}
      <div className="hidden lg:block bg-white rounded-xl border border-[#e7e4dd] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="font-semibold text-gray-600 py-3.5 w-[240px]">Nom</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5">Description</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5 text-center w-[140px]">
                Produits
              </TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5 w-[120px]">Statut</TableHead>
              <TableHead className="font-semibold text-gray-600 py-3.5 text-right w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id} className="hover:bg-[#faf8f4]/60 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {category.imageUrl ? (
                      <div className="h-8 w-8 rounded-lg overflow-hidden border border-[#e7e4dd] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/bouquet-detail.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-[#edf8ef] text-[#24582d] flex items-center justify-center shrink-0">
                        <FolderTree className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-semibold text-[#1e2a1f]">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {category.description || <span className="text-gray-400 italic">Aucune description</span>}
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    href={`/admin/produits?categorie=${encodeURIComponent(category.slug ?? '')}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#faf8f4] text-[#1e2a1f] border border-[#e7e4dd] hover:bg-[#edf8ef] hover:text-[#24582d] hover:border-[#b0c8a8] transition-colors"
                    title={`Voir les produits de la catégorie ${category.name}`}
                  >
                    <PackageCheck className="h-3.5 w-3.5 text-[#24582d]" />
                    <span>{category.productCount}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  {category.status === 'actif' ? (
                    <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7]/80 shadow-none border-none font-medium">
                      Actif
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none border-none font-medium">
                      Inactif
                    </Badge>
                  )}
                </TableCell>
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
                          Gestion
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          onClick={() => handleOpenEditDialog(category)}
                        >
                          <Edit2 className="mr-2.5 h-4 w-4 text-[#24582d]" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          render={
                            <Link
                              href={`/admin/produits?categorie=${encodeURIComponent(category.slug ?? '')}`}
                            />
                          }
                        >
                          <ExternalLink className="mr-2.5 h-4 w-4 text-gray-500" />
                          Voir les produits
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          onClick={() => setSubcategoriesFor(category)}
                        >
                          <FolderTree className="mr-2.5 h-4 w-4 text-gray-500" />
                          Sous-catégories ({category.subCategories?.length ?? 0})
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors whitespace-nowrap"
                          onClick={() => handleToggleStatus(category)}
                        >
                          <Power className="mr-2.5 h-4 w-4 text-gray-500" />
                          {category.status === 'actif' ? 'Désactiver' : 'Activer'}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="my-1 border-t border-[#f0eee8]" />

                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium py-2 px-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap focus:text-red-700 focus:bg-red-50"
                          onClick={() => setCategoryToDelete(category)}
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
                <TableCell colSpan={5} className="h-44 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-[#c1647a] animate-spin" />
                    <p className="font-medium text-gray-700">Chargement des catégories...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderTree className="h-8 w-8 text-gray-300" />
                    <p className="font-medium text-gray-700">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Aucune catégorie ne correspond aux critères.'
                        : 'Aucune catégorie enregistrée pour le moment.'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Modifiez votre recherche ou réinitialisez les filtres.'
                        : 'Créez votre première catégorie pour organiser vos produits.'}
                    </p>
                    {searchQuery || statusFilter !== 'all' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="mt-2 text-xs border-[#e7e4dd]"
                      >
                        Réinitialiser la recherche
                      </Button>
                    ) : (
                      <Button
                        variant="cta"
                        size="sm"
                        onClick={handleOpenCreateDialog}
                        className="mt-2 text-xs bg-[#c1647a] hover:bg-[#a9576a] !text-white"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Créer une catégorie
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (< 1024px) */}
      <div className="lg:hidden space-y-3">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl border border-[#e7e4dd] p-4 shadow-xs space-y-3"
          >
            {/* Header: Icon, Name & Status Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {category.imageUrl ? (
                  <div className="h-9 w-9 rounded-lg overflow-hidden border border-[#e7e4dd] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/bouquet-detail.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-[#edf8ef] text-[#24582d] flex items-center justify-center shrink-0">
                    <FolderTree className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#1e2a1f] truncate">{category.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID: <span className="font-mono">{category.id}</span>
                  </p>
                </div>
              </div>

              {category.status === 'actif' ? (
                <Badge className="bg-[#dcfce7] text-[#166534] shadow-none border-none text-[11px] font-semibold shrink-0">
                  Actif
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 shadow-none border-none text-[11px] font-semibold shrink-0">
                  Inactif
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed bg-[#faf8f4] p-2.5 rounded-lg border border-[#f0eee8]">
              {category.description || (
                <span className="text-gray-400 italic">Aucune description renseignée</span>
              )}
            </p>

            {/* Metrics & Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f0eee8]">
              <Link
                href={`/admin/produits?categorie=${encodeURIComponent(category.slug ?? '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#edf8ef] text-[#24582d] border border-[#b0c8a8]/40 hover:bg-[#d8eedb] transition-colors"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                <span>{category.productCount} produit{category.productCount > 1 ? 's' : ''}</span>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleStatus(category)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${
                    category.status === 'actif'
                      ? 'border-[#e7e4dd] text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                      : 'border-[#24582d]/30 text-[#24582d] bg-[#edf8ef]'
                  }`}
                  title={category.status === 'actif' ? 'Désactiver' : 'Activer'}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEditDialog(category)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#e7e4dd] text-gray-600 hover:text-[#24582d] hover:bg-[#edf8ef] transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setCategoryToDelete(category)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#e7e4dd] text-red-600 hover:bg-red-50 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {loading ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center space-y-2">
            <Loader2 className="h-8 w-8 text-[#c1647a] animate-spin mx-auto" />
            <p className="font-semibold text-sm text-gray-700">Chargement des catégories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7e4dd] p-8 text-center space-y-2">
            <FolderTree className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-sm text-gray-700">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucune catégorie trouvée'
                : 'Aucune catégorie enregistrée'}
            </p>
            <p className="text-xs text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Modifiez votre recherche ou réinitialisez les filtres.'
                : 'Créez votre première catégorie pour organiser vos produits.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs border-[#e7e4dd]"
              >
                Réinitialiser
              </Button>
            ) : (
              <Button
                variant="cta"
                size="sm"
                onClick={handleOpenCreateDialog}
                className="mt-2 text-xs bg-[#c1647a] hover:bg-[#a9576a] !text-white"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Créer une catégorie
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal Dialog: Add / Edit Category */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="w-[94vw] max-w-md bg-white border border-[#e7e4dd] p-5 sm:p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#24582d]">
              <FolderTree className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold text-[#1e2a1f]">
                {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              {editingCategory
                ? 'Modifiez les informations de cette catégorie de produits.'
                : 'Créez une nouvelle catégorie pour organiser les produits de la boutique.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Nom de la catégorie <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex : Bouquets de mariage, Plantes d'intérieur..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Brève description de la catégorie et des articles associés..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#e7e4dd] p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#24582d] focus:border-[#24582d]"
              />
            </div>

            {/* Photo d'illustration */}
            <div className="space-y-1.5">
              <ImageUploader
                folder="categories"
                multiple={false}
                value={formImage ? [formImage] : []}
                onChange={(urls) => setFormImage(urls[0] || '')}
                label="Photo d'illustration"
                description="Format JPG, PNG, WebP. Max 5 Mo."
              />
            </div>

            {/* Statut */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Statut</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'actif' | 'inactif')}
                className="w-full rounded-lg border border-[#e7e4dd] bg-white p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
              >
                <option value="actif">Actif (visible dans la boutique)</option>
                <option value="inactif">Inactif (masqué)</option>
              </select>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormDialogOpen(false)}
                className="w-full sm:w-auto border-[#e7e4dd] text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={saving}
                className="w-full sm:w-auto bg-[#c1647a] hover:bg-[#a9576a] !text-white font-medium gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Enregistrement…' : editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Delete Confirmation */}
      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <DialogContent className="w-[94vw] max-w-md bg-white border border-[#e7e4dd] p-5 sm:p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold text-gray-900">
                Supprimer la catégorie
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 pt-2 space-y-3">
              <span className="block">
                Êtes-vous certain de vouloir supprimer la catégorie{' '}
                <strong className="text-gray-900">« {categoryToDelete?.name} »</strong> ? Cette action est irréversible.
              </span>
              {categoryToDelete && (categoryToDelete.totalProductCount ?? categoryToDelete.productCount) > 0 && (
                <span className="block p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <span className="font-semibold block mb-0.5">Catégorie non vide</span>
                  Elle contient <strong>{categoryToDelete.totalProductCount ?? categoryToDelete.productCount} produit(s)</strong> (masqués compris) : la
                  suppression sera refusée tant qu’ils n’auront pas été déplacés vers une autre catégorie. Vous pouvez plutôt la désactiver.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              className="border-[#e7e4dd] text-gray-600 hover:bg-gray-100 py-4 px-6"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-300 hover:bg-red-700 text-white py-4 px-6 font-medium"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {subcategoriesFor && (
        <SubcategoriesDialog
          category={categories.find((c) => c.id === subcategoriesFor.id) ?? subcategoriesFor}
          onClose={() => setSubcategoriesFor(null)}
          onChanged={reloadCategories}
        />
      )}
    </div>
  );
}
