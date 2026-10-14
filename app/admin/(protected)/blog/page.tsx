'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminBlogArticles,
  adminBlogCategories,
  adminBlogAuthors,
  type BlogArticle,
  type BlogCategory,
  type BlogAuthor,
  type BlogArticleStatus,
} from '@/lib/admin/mock-data';
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
  FileText,
  FolderTree,
  Users,
  Plus,
  Search,
  Filter,
  RotateCcw,
  X,
  ArrowUpDown,
  Check,
  Eye,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  Clock,
  Calendar,
  Heart,
  TrendingUp,
  BookOpen,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Settings,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateBlogCategoryDialog } from '@/components/admin/create-blog-category-dialog';
import { AuthorProfileDialog } from '@/components/admin/author-profile-dialog';


export default function AdminBlogPage() {
  const router = useRouter();
  // Main Top-level navigation: 'articles' | 'categories' | 'authors'
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'authors'>('articles');

  // Datasets state
  const [articles, setArticles] = useState<BlogArticle[]>(adminBlogArticles);
  const [categories, setCategories] = useState<BlogCategory[]>(adminBlogCategories);
  const [authors, setAuthors] = useState<BlogAuthor[]>(adminBlogAuthors);

  // Filters state for articles tab
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state & draft filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string>('all');
  const [draftCategory, setDraftCategory] = useState<string>('all');
  const [draftAuthor, setDraftAuthor] = useState<string>('all');
  const [draftSort, setDraftSort] = useState<string>('recent');

  const handleOpenFilterDrawer = (open: boolean) => {
    if (open) {
      setDraftStatus(statusFilter);
      setDraftCategory(categoryFilter);
      setDraftAuthor(authorFilter);
      setDraftSort(sortFilter);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setCategoryFilter(draftCategory);
    setAuthorFilter(draftAuthor);
    setSortFilter(draftSort);
    setIsFilterOpen(false);
    toast.success('Filtres appliqués');
  };

  const handleResetFilters = () => {
    setDraftStatus('all');
    setDraftCategory('all');
    setDraftAuthor('all');
    setDraftSort('recent');
    setStatusFilter('all');
    setCategoryFilter('all');
    setAuthorFilter('all');
    setSortFilter('recent');
    setIsFilterOpen(false);
    toast.info('Filtres réinitialisés');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (authorFilter !== 'all') count++;
    if (sortFilter !== 'recent') count++;
    return count;
  }, [statusFilter, categoryFilter, authorFilter, sortFilter]);

  // Modals state

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<BlogCategory | null>(null);

  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [selectedAuthorForEdit, setSelectedAuthorForEdit] = useState<BlogAuthor | null>(null);



  // KPI calculations
  const totalPublished = useMemo(
    () => articles.filter((a) => a.status === 'publie').length,
    [articles]
  );
  const totalDraftsOrScheduled = useMemo(
    () => articles.filter((a) => a.status === 'brouillon' || a.status === 'planifie').length,
    [articles]
  );
  const totalViews = useMemo(
    () => articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0),
    [articles]
  );

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    const list = articles.filter((art) => {
      // Status filter
      if (statusFilter === 'publie' && art.status !== 'publie') return false;
      if (statusFilter === 'brouillon' && art.status !== 'brouillon') return false;
      if (statusFilter === 'planifie' && art.status !== 'planifie') return false;
      if (statusFilter === 'archive' && art.status !== 'archive') return false;
      if (statusFilter === 'featured' && !art.isFeatured) return false;

      // Category filter
      if (categoryFilter !== 'all' && art.categoryId !== categoryFilter) return false;

      // Author filter
      if (authorFilter !== 'all' && art.authorId !== authorFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(query);
        const matchesAuthor = art.authorName.toLowerCase().includes(query);
        const matchesExcerpt = art.excerpt.toLowerCase().includes(query);
        const matchesTags = art.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAuthor && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortFilter === 'views') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (sortFilter === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortFilter === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [articles, statusFilter, categoryFilter, authorFilter, sortFilter, searchQuery]);


  // Actions
  const handleOpenCreateArticle = () => {
    router.push('/admin/blog/nouveau');
  };

  const handleOpenEditArticle = (art: BlogArticle) => {
    router.push(`/admin/blog/${art.id}`);
  };

  const handleOpenPreviewArticle = (art: BlogArticle) => {
    router.push(`/admin/blog/${art.id}/apercu`);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`Confirmez-vous la suppression définitive de l'article « ${title} » ?`)) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Article « ${title} » supprimé.`);
    }
  };

  const handleToggleStatus = (art: BlogArticle) => {
    const nextStatus: BlogArticleStatus = art.status === 'publie' ? 'brouillon' : 'publie';
    setArticles((prev) =>
      prev.map((a) =>
        a.id === art.id
          ? {
              ...a,
              status: nextStatus,
              publishedAt: nextStatus === 'publie' ? (a.publishedAt || new Date().toISOString()) : a.publishedAt,
            }
          : a
      )
    );
    toast.info(
      nextStatus === 'publie'
        ? `L'article « ${art.title} » est maintenant publié en ligne.`
        : `L'article « ${art.title} » a été basculé en brouillon.`
    );
  };

  const handleDuplicateArticle = (art: BlogArticle) => {
    const dup: BlogArticle = {
      ...art,
      id: `art-${Date.now()}`,
      title: `${art.title} (Copie)`,
      slug: `${art.slug}-copie-${Math.floor(Math.random() * 1000)}`,
      status: 'brouillon',
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setArticles((prev) => [dup, ...prev]);
    toast.success(`Copie créée en brouillon : « ${dup.title} »`);
  };

  // Category Actions
  const handleOpenCreateCategory = () => {
    setSelectedCategoryForEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: BlogCategory) => {
    setSelectedCategoryForEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (cat: BlogCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      if (exists) {
        return prev.map((c) => (c.id === cat.id ? cat : c));
      }
      return [...prev, cat];
    });
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    const hasArticles = articles.some((a) => a.categoryId === catId);
    if (hasArticles) {
      toast.error(`Impossible de supprimer « ${catName} » car des articles y sont rattachés.`);
      return;
    }
    if (confirm(`Supprimer la catégorie « ${catName} » ?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success(`Catégorie « ${catName} » supprimée.`);
    }
  };

  // Author Actions
  const handleOpenCreateAuthor = () => {
    setSelectedAuthorForEdit(null);
    setIsAuthorModalOpen(true);
  };

  const handleOpenEditAuthor = (auth: BlogAuthor) => {
    setSelectedAuthorForEdit(auth);
    setIsAuthorModalOpen(true);
  };

  const handleSaveAuthor = (auth: BlogAuthor) => {
    setAuthors((prev) => {
      const exists = prev.some((a) => a.id === auth.id);
      if (exists) {
        return prev.map((a) => (a.id === auth.id ? auth : a));
      }
      return [...prev, auth];
    });
  };

  return (
    <div className="admin-content space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1e2a1f] flex items-center gap-2">
            <BookOpen className="text-[#24582d]" size={24} />
            Blog & Contenu Éditorial
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Rédigez des guides d’entretien, inspirations et conseils floraux pour inspirer vos clients et booster le SEO
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/blog', '_blank')}
            className="text-xs border-[#e7e4dd] bg-white hover:bg-[#faf8f4] h-10 sm:h-9 w-full sm:w-auto"
          >
            <ExternalLink size={14} className="mr-1.5 text-[#666]" />
            Voir le journal public
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreateArticle}
            className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold shadow-xs h-10 sm:h-9 w-full sm:w-auto"
          >
            <Plus size={15} className="mr-1.5" />
            Rédiger un article
          </Button>
        </div>
      </div>

      {/* Top Metric Cards (2x2 on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-[#ece8e1] bg-white/90 backdrop-blur-sm shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#777]">
            <span className="truncate">En ligne</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#edf8ef] text-[#24582d] flex items-center justify-center shrink-0">
              <CheckCircle size={15} />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-serif font-bold text-[#1e2a1f]">
            {totalPublished} <span className="text-[11px] font-sans font-normal text-[#666]">publiés</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#24582d] font-semibold block truncate">
            Visibles en boutique
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[#ece8e1] bg-white/90 backdrop-blur-sm shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#777]">
            <span className="truncate">Brouillons</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-serif font-bold text-[#1e2a1f]">
            {totalDraftsOrScheduled}{' '}
            <span className="text-[11px] font-sans font-normal text-[#666]">préparés</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold block truncate">
            Non visibles du public
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[#ece8e1] bg-white/90 backdrop-blur-sm shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#777]">
            <span className="truncate">Lectures</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Eye size={15} />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-serif font-bold text-[#1e2a1f] font-mono">
            {totalViews.toLocaleString('fr-FR')}{' '}
            <span className="text-[11px] font-sans font-normal text-[#666]">vues</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-blue-700 font-semibold block truncate">
            Fort engagement
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[#ece8e1] bg-white/90 backdrop-blur-sm shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#777]">
            <span className="truncate">Rubriques</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FolderTree size={15} />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-serif font-bold text-[#1e2a1f]">
            {categories.length}{' '}
            <span className="text-[11px] font-sans font-normal text-[#666]">catégories</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-purple-700 font-semibold block truncate">
            {authors.length} auteurs actifs
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 border-b border-[#e7e4dd] pb-px overflow-x-auto no-scrollbar flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === 'articles'
              ? 'border-[#24582d] text-[#24582d] font-bold bg-white/60 rounded-t-lg'
              : 'border-transparent text-[#666] hover:text-[#222]'
          }`}
        >
          <FileText size={15} />
          <span>Articles & Guides ({articles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === 'categories'
              ? 'border-[#24582d] text-[#24582d] font-bold bg-white/60 rounded-t-lg'
              : 'border-transparent text-[#666] hover:text-[#222]'
          }`}
        >
          <FolderTree size={15} />
          <span>Thématiques & Catégories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('authors')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === 'authors'
              ? 'border-[#24582d] text-[#24582d] font-bold bg-white/60 rounded-t-lg'
              : 'border-transparent text-[#666] hover:text-[#222]'
          }`}
        >
          <Users size={15} />
          <span>Auteurs & Contributeurs ({authors.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ARTICLES */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="space-y-2.5">
            <div className="p-2.5 sm:p-3.5 rounded-xl border border-[#ece8e1] bg-white/90 backdrop-blur-sm flex items-center justify-between gap-2 sm:gap-3 shadow-xs">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, tag ou auteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-10 sm:h-9 text-xs bg-[#faf8f4] border-[#e7e4dd] focus-visible:ring-[#24582d]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Side Drawer Trigger Button */}
              <div className="shrink-0">
                <Sheet open={isFilterOpen} onOpenChange={handleOpenFilterDrawer}>
                  <SheetTrigger
                    render={
                      <Button
                        variant="outline"
                        className={`h-10 sm:h-9 px-3 text-xs font-medium border-[#e7e4dd] bg-white gap-1.5 transition-colors shrink-0 ${
                          activeFiltersCount > 0
                            ? 'border-[#24582d] text-[#24582d] bg-[#edf8ef] hover:bg-[#e4f3e7]'
                            : 'text-gray-700 hover:bg-[#faf8f4]'
                        }`}
                      />
                    }
                  >
                    <Filter size={14} />
                    <span className="hidden xs:inline">Filtres</span>
                    {activeFiltersCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-[#24582d] text-white text-[11px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </SheetTrigger>

                  <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 bg-[#faf8f4]">
                    <SheetHeader className="p-6 pb-4 border-b border-[#f0eee8] bg-white">
                      <div className="flex items-center gap-2.5 text-[#24582d]">
                        <div className="w-8 h-8 rounded-lg bg-[#edf8ef] flex items-center justify-center text-[#24582d]">
                          <Filter size={16} />
                        </div>
                        <div>
                          <SheetTitle className="text-base font-serif font-bold text-[#1e2a1f]">
                            Filtrer les articles
                          </SheetTitle>
                          <SheetDescription className="text-xs text-[#777] mt-0.5">
                            Affinez la liste selon le statut, la thématique, l’auteur ou le tri
                          </SheetDescription>
                        </div>
                      </div>
                    </SheetHeader>

                    {/* Scrollable Drawer Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Section 1: Statut de publication */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-[#333] uppercase tracking-wider block">
                          Statut de parution
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'all', label: 'Tous les statuts', count: articles.length },
                            { id: 'publie', label: 'Publiés en ligne', count: articles.filter((a) => a.status === 'publie').length },
                            { id: 'brouillon', label: 'Brouillons', count: articles.filter((a) => a.status === 'brouillon').length },
                            { id: 'planifie', label: 'Planifiés', count: articles.filter((a) => a.status === 'planifie').length },
                            { id: 'featured', label: 'À la Une (Épinglés)', count: articles.filter((a) => a.isFeatured).length },
                            { id: 'archive', label: 'Archivés', count: articles.filter((a) => a.status === 'archive').length },
                          ].map((stat) => {
                            const isSelected = draftStatus === stat.id;
                            return (
                              <button
                                key={stat.id}
                                type="button"
                                onClick={() => setDraftStatus(stat.id)}
                                className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                                  isSelected
                                    ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                                    : 'border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
                                }`}
                              >
                                <span className="truncate">{stat.label}</span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                  <span className="text-[10.5px] opacity-70">({stat.count})</span>
                                  {isSelected && <Check size={13} className="text-[#24582d]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Thématique / Catégorie */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-[#333] uppercase tracking-wider block">
                          Thématique éditoriale
                        </label>
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setDraftCategory('all')}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                              draftCategory === 'all'
                                ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                                : 'border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
                            }`}
                          >
                            <span>Toutes les catégories</span>
                            {draftCategory === 'all' && <Check size={13} className="text-[#24582d]" />}
                          </button>

                          {categories.map((cat) => {
                            const isSelected = draftCategory === cat.id;
                            const count = articles.filter((a) => a.categoryId === cat.id).length;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setDraftCategory(cat.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                                  isSelected
                                    ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                                    : 'border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span className="truncate">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                  <span className="text-[10.5px] opacity-70">({count})</span>
                                  {isSelected && <Check size={13} className="text-[#24582d]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Auteur */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-[#333] uppercase tracking-wider block">
                          Auteur / Rédacteur
                        </label>
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setDraftAuthor('all')}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                              draftAuthor === 'all'
                                ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                                : 'border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
                            }`}
                          >
                            <span>Tous les auteurs</span>
                            {draftAuthor === 'all' && <Check size={13} className="text-[#24582d]" />}
                          </button>

                          {authors.map((auth) => {
                            const isSelected = draftAuthor === auth.id;
                            const count = articles.filter((a) => a.authorId === auth.id).length;
                            return (
                              <button
                                key={auth.id}
                                type="button"
                                onClick={() => setDraftAuthor(auth.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                                  isSelected
                                    ? 'border-[#24582d] bg-[#edf8ef] text-[#24582d] font-semibold ring-1 ring-[#24582d]'
                                    : 'border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-[#24582d] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                    {auth.avatar || 'FD'}
                                  </div>
                                  <span className="truncate">{auth.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                  <span className="text-[10.5px] opacity-70">({count})</span>
                                  {isSelected && <Check size={13} className="text-[#24582d]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 4: Tri des articles */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-[#333] uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowUpDown size={13} />
                          Ordre d'affichage
                        </label>
                        <select
                          value={draftSort}
                          onChange={(e) => setDraftSort(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#e7e4dd] bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#24582d]"
                        >
                          <option value="recent">Plus récents d’abord (par défaut)</option>
                          <option value="oldest">Plus anciens d’abord</option>
                          <option value="views">Plus vus (popularité / lectures)</option>
                          <option value="alphabetical">Titre alphabétique (A à Z)</option>
                        </select>
                      </div>
                    </div>

                    {/* Drawer Footer Buttons */}
                    <SheetFooter className="p-4 border-t border-[#f0eee8] bg-white flex flex-row items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="flex-1 text-xs border-[#e7e4dd] text-gray-600 hover:bg-gray-100"
                      >
                        <RotateCcw size={13} className="mr-1.5" />
                        Réinitialiser
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyFilters}
                        className="flex-1 text-xs bg-[#24582d] hover:bg-[#1a4021] text-white font-semibold"
                      >
                        Appliquer
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters Badges Row */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap px-1">
                <span className="text-xs text-gray-500 font-medium">Filtres actifs :</span>

                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#edf8ef] text-[#24582d] border border-[#b0c8a8]">
                    <span>
                      Statut :{' '}
                      {statusFilter === 'publie'
                        ? 'Publiés'
                        : statusFilter === 'brouillon'
                        ? 'Brouillons'
                        : statusFilter === 'planifie'
                        ? 'Planifiés'
                        : statusFilter === 'featured'
                        ? 'À la Une'
                        : 'Archivés'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="hover:text-black ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#edf8ef] text-[#24582d] border border-[#b0c8a8]">
                    <span>
                      Catégorie :{' '}
                      {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className="hover:text-black ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {authorFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#edf8ef] text-[#24582d] border border-[#b0c8a8]">
                    <span>
                      Auteur :{' '}
                      {authors.find((a) => a.id === authorFilter)?.name || authorFilter}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthorFilter('all')}
                      className="hover:text-black ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {sortFilter !== 'recent' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#edf8ef] text-[#24582d] border border-[#b0c8a8]">
                    <span>
                      Tri :{' '}
                      {sortFilter === 'views'
                        ? 'Plus vus'
                        : sortFilter === 'oldest'
                        ? 'Plus anciens'
                        : 'A à Z'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSortFilter('recent')}
                      className="hover:text-black ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-6 px-2 text-[11px] text-[#777] hover:text-black"
                >
                  Tout effacer
                </Button>
              </div>
            )}
          </div>


          {/* Articles Cards Grid */}
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#d8d3c9] bg-white/60 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f0eee8] text-[#777] flex items-center justify-center mx-auto">
                <FileText size={22} />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1e2a1f]">
                Aucun article trouvé
              </h3>
              <p className="text-xs text-[#777] max-w-sm mx-auto">
                Aucun article ne correspond à votre recherche ou aux filtres sélectionnés.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs border-[#e7e4dd]"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl border border-[#ece8e1] overflow-hidden shadow-xs hover:shadow-md hover:border-[#24582d]/30 transition-all flex flex-col justify-between group"
                >
                  {/* Card Cover Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#faf8f4]">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/bouquet-detail.jpg';
                      }}
                    />

                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating Top-Left: Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md tracking-wide backdrop-blur-xs"
                        style={{ backgroundColor: art.categoryColor || '#d65d7a' }}
                      >
                        {art.categoryName}
                      </span>
                      {art.isFeatured && (
                        <span
                          className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md"
                          title="Mis en avant à la Une"
                        >
                          <Star size={12} className="fill-white" />
                        </span>
                      )}
                    </div>

                    {/* Floating Top-Right: Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={
                          art.status === 'publie'
                            ? 'bg-[#24582d] text-white border-none shadow-md text-[10.5px] font-medium'
                            : art.status === 'planifie'
                            ? 'bg-purple-600 text-white border-none shadow-md text-[10.5px] font-medium'
                            : art.status === 'archive'
                            ? 'bg-gray-700 text-white border-none shadow-md text-[10.5px] font-medium'
                            : 'bg-amber-600 text-white border-none shadow-md text-[10.5px] font-medium'
                        }
                      >
                        {art.status === 'publie'
                          ? 'En ligne'
                          : art.status === 'planifie'
                          ? 'Planifié'
                          : art.status === 'archive'
                          ? 'Archivé'
                          : 'Brouillon'}
                      </Badge>
                    </div>

                    {/* Floating Bottom-Right: Reading Time */}
                    <div className="absolute bottom-2.5 right-3 text-[11px] font-medium text-white/95 flex items-center gap-1 drop-shadow-sm bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      <Clock size={11} /> {art.readTime}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3
                        onClick={() => handleOpenPreviewArticle(art)}
                        className="font-serif font-bold text-base text-[#1e2a1f] group-hover:text-[#24582d] transition-colors line-clamp-2 leading-snug cursor-pointer"
                        title={art.title}
                      >
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Author & Publication Date */}
                      <div className="flex items-center justify-between text-xs text-[#777] border-t border-[#f0eee8] pt-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-[#24582d] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {art.authorAvatar || 'FD'}
                          </div>
                          <span className="truncate font-medium text-[#333] text-xs">
                            {art.authorName}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#888] shrink-0 flex items-center gap-1">
                          <Calendar size={11} />
                          {art.publishedAt
                            ? new Date(art.publishedAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : 'Brouillon'}
                        </span>
                      </div>

                      {/* Performance & Cross-selling */}
                      <div className="flex items-center justify-between text-xs text-[#777] pt-0.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-[#1e2a1f]">
                            <Eye size={13} className="text-[#24582d]" /> {art.viewsCount.toLocaleString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1 text-rose-600 font-medium text-[11px]">
                            <Heart size={12} className="fill-rose-500" /> {art.likesCount}
                          </span>
                        </div>

                        {art.relatedProductIds && art.relatedProductIds.length > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-[#24582d]/30 text-[#24582d] bg-[#edf8ef]/40">
                            <ShoppingBag size={10} className="mr-1" />
                            {art.relatedProductIds.length} produit(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions Bar */}
                  <div className="px-4 py-2.5 border-t border-[#f0eee8] bg-[#faf8f4] flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(art)}
                      className={`h-7 px-2 text-[11px] font-semibold gap-1.5 ${
                        art.status === 'publie'
                          ? 'text-[#24582d] hover:bg-[#edf8ef]'
                          : 'text-amber-700 hover:bg-amber-50'
                      }`}
                      title={art.status === 'publie' ? 'Dépublier (mettre en brouillon)' : 'Publier en ligne'}
                    >
                      <CheckCircle size={13} className={art.status === 'publie' ? 'text-[#24582d]' : ''} />
                      {art.status === 'publie' ? 'En ligne' : 'Publier'}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPreviewArticle(art)}
                        className="h-7 w-7 p-0 text-[#666] hover:text-[#24582d] hover:bg-[#edf8ef]"
                        title="Aperçu avant publication"
                      >
                        <Eye size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditArticle(art)}
                        className="h-7 w-7 p-0 text-[#666] hover:text-[#24582d] hover:bg-[#edf8ef]"
                        title="Modifier l'article"
                      >
                        <Edit3 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateArticle(art)}
                        className="h-7 w-7 p-0 text-[#666] hover:text-[#24582d] hover:bg-[#edf8ef]"
                        title="Dupliquer"
                      >
                        <Copy size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="h-7 w-7 p-0 text-[#888] hover:text-red-600 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1e2a1f]">
                Thématiques Éditoriales & Rubriques
              </h2>
              <p className="text-xs text-[#777]">
                Regroupez vos articles par centres d’intérêt pour guider les visiteurs
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenCreateCategory}
              className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold w-full sm:w-auto h-10 sm:h-9"
            >
              <Plus size={14} className="mr-1.5" />
              Nouvelle catégorie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = articles.filter((a) => a.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-[#ece8e1] bg-white shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name}
                      </span>
                      <Badge variant="outline" className="text-[11px] text-[#666]">
                        {count} article(s)
                      </Badge>
                    </div>

                    <p className="text-xs text-[#666] leading-relaxed line-clamp-2">
                      {cat.description || 'Aucune description rédigée.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#f0eee8] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-[#888]">/blog/rubrique/{cat.slug}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="h-7 px-2 text-xs text-[#666] hover:text-[#24582d]"
                      >
                        <Edit3 size={12} className="mr-1" /> Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="h-7 px-2 text-xs text-[#888] hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUTHORS */}
      {/* ========================================================================= */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1e2a1f]">
                Équipe de Rédaction & Fleuristes Auteurs
              </h2>
              <p className="text-xs text-[#777]">
                Les visages et signatures qui incarnent l’expertise et l’artisanat Décofleur Plus
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenCreateAuthor}
              className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold w-full sm:w-auto h-10 sm:h-9"
            >
              <Plus size={14} className="mr-1.5" />
              Ajouter un rédacteur
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {authors.map((auth) => {
              const authorArticles = articles.filter((a) => a.authorId === auth.id);
              const authorViews = authorArticles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);

              return (
                <div
                  key={auth.id}
                  className="p-5 rounded-xl border border-[#ece8e1] bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        {auth.avatar || 'FD'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm font-semibold text-[#1e2a1f] truncate">
                          {auth.name}
                        </strong>
                        <span className="text-xs text-[#24582d] font-medium">{auth.role}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#555] leading-relaxed line-clamp-3 italic">
                      « {auth.bio} »
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f0eee8] flex items-center justify-between text-xs text-[#777]">
                    <div className="space-x-2">
                      <span><strong>{authorArticles.length}</strong> articles</span>
                      <span>•</span>
                      <span><strong>{authorViews.toLocaleString('fr-FR')}</strong> lectures</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditAuthor(auth)}
                      className="h-7 px-2 text-xs text-[#24582d] hover:bg-[#edf8ef]"
                    >
                      <Edit3 size={12} className="mr-1" /> Profil
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* MODALS */}

      <CreateBlogCategoryDialog
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        category={selectedCategoryForEdit}
        onSave={handleSaveCategory}
      />

      <AuthorProfileDialog
        isOpen={isAuthorModalOpen}
        onOpenChange={setIsAuthorModalOpen}
        author={selectedAuthorForEdit}
        onSave={handleSaveAuthor}
      />
    </div>
  );
}
