'use client';

import { useState, useEffect } from 'react';
import type { BlogArticle, BlogCategory, BlogAuthor, BlogArticleStatus } from '@/lib/admin/mock-data/types';
import { adminProducts } from '@/lib/admin/mock-data/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image as ImageIcon,
  Send,
  Search,
  Sparkles,
  Tag,
  Calendar,
  Clock,
  User,
  Star,
  ShoppingBag,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Check,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

interface ArticleEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  article?: BlogArticle | null;
  categories: BlogCategory[];
  authors: BlogAuthor[];
  onSave: (article: BlogArticle) => void;
}

const PRESET_IMAGES = [
  { url: '/images/bouquet-detail.jpg', label: 'Bouquet de roses détail' },
  { url: '/images/mariage.jpg', label: 'Cérémonie de mariage' },
  { url: '/images/fruits.jpg', label: 'Panier de fruits & fleurs' },
  { url: '/images/plante-monstera.jpg', label: 'Monstera en pot céramique' },
  { url: '/images/bouquet-passion.jpg', label: 'Bouquet Passion & Romance' },
  { url: '/images/bouquet-soleil.jpg', label: 'Bouquet Soleil & Fêtes' },
  { url: '/images/boutique-equipe.jpg', label: 'Atelier floral Décofleur' },
  { url: '/images/hero.jpg', label: 'Arche & Décor d’exception' },
];

export function ArticleEditorDialog({
  isOpen,
  onOpenChange,
  article,
  categories,
  authors,
  onSave,
}: ArticleEditorDialogProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'settings' | 'seo'>('content');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [readTime, setReadTime] = useState('4 min de lecture');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [coverImage, setCoverImage] = useState('/images/bouquet-detail.jpg');
  const [coverImageCaption, setCoverImageCaption] = useState('');

  const [status, setStatus] = useState<BlogArticleStatus>('publie');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Auto-slug helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setCategoryId(article.categoryId);
      setAuthorId(article.authorId);
      setReadTime(article.readTime);
      setExcerpt(article.excerpt);
      setContent(article.content);
      setCoverImage(article.coverImage || '/images/bouquet-detail.jpg');
      setCoverImageCaption(article.coverImageCaption || '');
      setStatus(article.status);
      setScheduledAt(article.scheduledAt ? article.scheduledAt.split('T')[0] : '');
      setIsFeatured(article.isFeatured);
      setTagsInput(article.tags ? article.tags.join(', ') : '');
      setSelectedProductIds(article.relatedProductIds || []);
      setSeoTitle(article.seoTitle || '');
      setSeoDescription(article.seoDescription || '');
    } else {
      setTitle('');
      setSlug('');
      setCategoryId(categories[0]?.id || '');
      setAuthorId(authors[0]?.id || '');
      setReadTime('4 min de lecture');
      setExcerpt('');
      setContent('');
      setCoverImage('/images/bouquet-detail.jpg');
      setCoverImageCaption('');
      setStatus('publie');
      setScheduledAt('');
      setIsFeatured(false);
      setTagsInput('Conseils, Saly, Art floral');
      setSelectedProductIds(['prod-1']);
      setSeoTitle('');
      setSeoDescription('');
    }
    setActiveTab('content');
  }, [article, isOpen, categories, authors]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!article) {
      setSlug(generateSlug(val));
    }
  };

  const handleInsertToolbar = (type: string) => {
    switch (type) {
      case 'h2':
        setContent((prev) => `${prev}\n\n## Nouveau Sous-Titre H2\nTexte du paragraphe...`);
        break;
      case 'h3':
        setContent((prev) => `${prev}\n\n### Sous-section H3\nTexte détaillé...`);
        break;
      case 'bold':
        setContent((prev) => `${prev} **texte en gras** `);
        break;
      case 'italic':
        setContent((prev) => `${prev} *texte en italique* `);
        break;
      case 'list':
        setContent((prev) => `${prev}\n\n- Premier conseil\n- Deuxième conseil\n- Troisième conseil`);
        break;
      case 'quote':
        setContent((prev) => `${prev}\n\n> « La fleur est la poésie de la terre. » — Fatou Diop`);
        break;
    }
  };

  const toggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmit = (finalStatus?: BlogArticleStatus) => {
    if (!title.trim()) {
      toast.error("Veuillez saisir un titre pour l'article.");
      return;
    }
    if (!excerpt.trim()) {
      toast.error("Veuillez saisir un résumé / extrait d'accroche.");
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];
    const selectedAuthor = authors.find((a) => a.id === authorId) || authors[0];
    const currentStatus = finalStatus || status;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedArticle: BlogArticle = {
      id: article ? article.id : `art-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      categoryId: selectedCat?.id || 'bcat-1',
      categoryName: selectedCat?.name || 'Conseils Fleurs',
      categoryColor: selectedCat?.color || '#d65d7a',
      authorId: selectedAuthor?.id || 'author-1',
      authorName: selectedAuthor?.name || 'Fatou Diop',
      authorAvatar: selectedAuthor?.avatar || 'FD',
      authorRole: selectedAuthor?.role || 'Maître Fleuriste',
      coverImage: coverImage.trim() || '/images/bouquet-detail.jpg',
      coverImageCaption: coverImageCaption.trim(),
      excerpt: excerpt.trim(),
      content: content.trim() || excerpt.trim(),
      readTime: readTime.trim() || '4 min de lecture',
      status: currentStatus,
      publishedAt: currentStatus === 'publie' ? (article?.publishedAt || new Date().toISOString()) : undefined,
      scheduledAt: currentStatus === 'planifie' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      createdAt: article ? article.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: article ? article.viewsCount : 0,
      likesCount: article ? article.likesCount : 0,
      isFeatured,
      tags: tagsArray.length > 0 ? tagsArray : ['Fleurs', 'Décofleur Plus'],
      seoTitle: seoTitle.trim() || `${title.trim()} | Blog Décofleur Plus`,
      seoDescription: seoDescription.trim() || excerpt.trim().slice(0, 160),
      relatedProductIds: selectedProductIds,
    };

    onSave(updatedArticle);
    onOpenChange(false);
    toast.success(
      article
        ? `Article « ${updatedArticle.title} » mis à jour.`
        : `Nouvel article « ${updatedArticle.title} » créé avec succès.`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-md border-[#ece8e1]">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-[#f0eee8] bg-[#faf8f4]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#24582d]/10 flex items-center justify-center text-[#24582d]">
                <FileText size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif text-[#1e2a1f]">
                  {article ? "Modifier l'article de blog" : "Rédiger un nouvel article"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777] mt-0.5">
                  Publiez des conseils, inspirations et guides floraux pour le journal Décofleur Plus
                </DialogDescription>
              </div>
            </div>
            {article && (
              <Badge
                className={
                  status === 'publie'
                    ? 'bg-[#edf8ef] text-[#24582d] border-[#b0c8a8]'
                    : status === 'planifie'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : status === 'archive'
                    ? 'bg-gray-100 text-gray-700 border-gray-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }
              >
                {status === 'publie'
                  ? 'Publié en ligne'
                  : status === 'planifie'
                  ? 'Planifié'
                  : status === 'archive'
                  ? 'Archivé'
                  : 'Brouillon'}
              </Badge>
            )}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b border-[#e7e4dd] -mb-4 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-[#24582d] text-[#24582d]'
                  : 'border-transparent text-[#666] hover:text-[#222]'
              }`}
            >
              <FileText size={14} /> Contenu & Rédaction
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'media'
                  ? 'border-[#24582d] text-[#24582d]'
                  : 'border-transparent text-[#666] hover:text-[#222]'
              }`}
            >
              <ImageIcon size={14} /> Couverture & Médias
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-[#24582d] text-[#24582d]'
                  : 'border-transparent text-[#666] hover:text-[#222]'
              }`}
            >
              <ShoppingBag size={14} /> Publication & Vente croisée
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'seo'
                  ? 'border-[#24582d] text-[#24582d]'
                  : 'border-transparent text-[#666] hover:text-[#222]'
              }`}
            >
              <Globe size={14} /> Référencement (SEO)
            </button>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CONTENU */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="article-title" className="text-xs font-semibold text-[#444]">
                  Titre de l’article <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="article-title"
                  placeholder="ex: Comment entretenir vos roses et bouquets sous le climat de Saly..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="article-category" className="text-xs font-semibold text-[#444]">
                    Catégorie thématique <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="article-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full h-9 px-3 rounded-md border border-[#e7e4dd] bg-white text-xs text-[#333] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="article-author" className="text-xs font-semibold text-[#444]">
                    Auteur / Rédacteur <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="article-author"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="mt-1 w-full h-9 px-3 rounded-md border border-[#e7e4dd] bg-white text-xs text-[#333] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
                  >
                    {authors.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name} ({auth.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="article-readtime" className="text-xs font-semibold text-[#444]">
                    Temps de lecture estimé
                  </Label>
                  <Input
                    id="article-readtime"
                    placeholder="4 min de lecture"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="article-excerpt" className="text-xs font-semibold text-[#444]">
                    Extrait / Résumé d’accroche (Chapeau) <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[11px] text-[#888]">{excerpt.length} caractères</span>
                </div>
                <textarea
                  id="article-excerpt"
                  rows={2}
                  placeholder="Bref résumé accrocheur affiché sur la page d'accueil du blog et les réseaux sociaux..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-md border border-[#e7e4dd] bg-white text-xs text-[#333] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20 leading-relaxed"
                />
              </div>

              {/* Rich Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="article-content" className="text-xs font-semibold text-[#444]">
                    Corps de l’article (Texte enrichi & Conseils) <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[11px] text-[#888]">Prend en charge le formatage Titres et Listes</span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1.5 bg-[#f8f6f0] border border-[#e7e4dd] rounded-t-md border-b-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('h2')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Insérer un titre de section H2"
                  >
                    <Heading2 size={13} className="mr-1" /> H2
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('h3')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Insérer un sous-titre H3"
                  >
                    <Heading3 size={13} className="mr-1" /> H3
                  </Button>
                  <div className="h-4 w-px bg-[#ddd] mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('bold')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Texte en gras"
                  >
                    <Bold size={13} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('italic')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Texte en italique"
                  >
                    <Italic size={13} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('list')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Liste à puces"
                  >
                    <List size={13} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertToolbar('quote')}
                    className="h-7 px-2 text-xs font-bold text-[#444] hover:bg-white"
                    title="Citation de fleuriste"
                  >
                    <Quote size={13} />
                  </Button>
                </div>

                <textarea
                  id="article-content"
                  rows={9}
                  placeholder="Rédigez ici le contenu détaillé de votre article..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-b-md border border-[#e7e4dd] bg-white text-xs text-[#333] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIAS */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-semibold text-[#444]">
                  Image de couverture mise en avant <span className="text-red-500">*</span>
                </Label>
                <p className="text-[11px] text-[#777] mb-3">
                  Sélectionnez une photo haute résolution de votre boutique pour illustrer l'article.
                </p>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCoverImage(img.url)}
                      className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        coverImage === img.url
                          ? 'border-[#24582d] shadow-md ring-2 ring-[#24582d]/20'
                          : 'border-[#e7e4dd] hover:border-[#bbb]'
                      }`}
                    >
                      <div className="aspect-[4/3] relative bg-[#f5f5f5]">
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {coverImage === img.url && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#24582d] text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 bg-white text-[11px] font-medium text-[#444] truncate">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="custom-cover-url" className="text-xs font-semibold text-[#444]">
                    Chemin / URL de l’image personnalisée
                  </Label>
                  <Input
                    id="custom-cover-url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="/images/votre-photo.jpg"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="cover-caption" className="text-xs font-semibold text-[#444]">
                    Légende & Crédit photo
                  </Label>
                  <Input
                    id="cover-caption"
                    value={coverImageCaption}
                    onChange={(e) => setCoverImageCaption(e.target.value)}
                    placeholder="ex: Réalisé à Saly par l'atelier Décofleur Plus"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Large Preview */}
              <div className="p-4 rounded-xl border border-[#e7e4dd] bg-[#faf8f4] flex flex-col md:flex-row gap-4 items-center">
                <div className="w-40 h-28 rounded-lg overflow-hidden border border-[#ddd] bg-white flex-shrink-0">
                  <img
                    src={coverImage}
                    alt="Aperçu couverture"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/bouquet-detail.jpg';
                    }}
                  />
                </div>
                <div className="text-xs text-[#555] space-y-1">
                  <strong className="block text-[#1e2a1f] font-semibold text-sm">
                    Aperçu de la couverture sélectionnée
                  </strong>
                  <p>Ratio 16:9 recommandé pour un affichage optimal sur mobile et desktop.</p>
                  <span className="inline-block text-[11px] text-[#888] font-mono">
                    Fichier : {coverImage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLICATION & CROSS-SELLING */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Statut & Programmation */}
              <div className="p-4 rounded-xl border border-[#e7e4dd] bg-white space-y-4">
                <h4 className="text-xs font-bold text-[#1e2a1f] uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} className="text-[#24582d]" /> Paramètres de visibilité & Parution
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      status === 'publie'
                        ? 'border-[#24582d] bg-[#edf8ef]/40 shadow-sm'
                        : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="article-status"
                      value="publie"
                      checked={status === 'publie'}
                      onChange={() => setStatus('publie')}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block text-xs text-[#24582d] font-semibold">Publié en ligne</strong>
                      <span className="text-[11px] text-[#666]">Visible immédiatement par tous les visiteurs</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      status === 'brouillon'
                        ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                        : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="article-status"
                      value="brouillon"
                      checked={status === 'brouillon'}
                      onChange={() => setStatus('brouillon')}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block text-xs text-amber-800 font-semibold">Brouillon</strong>
                      <span className="text-[11px] text-[#666]">Invisible du public, réservé à la relecture</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      status === 'planifie'
                        ? 'border-purple-400 bg-purple-50/50 shadow-sm'
                        : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="article-status"
                      value="planifie"
                      checked={status === 'planifie'}
                      onChange={() => setStatus('planifie')}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block text-xs text-purple-800 font-semibold">Planifier la parution</strong>
                      <span className="text-[11px] text-[#666]">Publication automatique à une date ultérieure</span>
                    </div>
                  </label>
                </div>

                {status === 'planifie' && (
                  <div className="pt-2 flex items-center gap-3">
                    <Label htmlFor="scheduled-date" className="text-xs font-semibold text-[#444]">
                      Date de parution prévue :
                    </Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-48 text-xs"
                    />
                  </div>
                )}

                {/* Featured Checkbox */}
                <div className="pt-2 border-t border-[#f0eee8] flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#24582d] focus:ring-[#24582d]"
                  />
                  <Label htmlFor="is-featured" className="text-xs text-[#333] cursor-pointer flex items-center gap-1.5">
                    <Star size={13} className={isFeatured ? 'text-amber-500 fill-amber-500' : 'text-[#888]'} />
                    <span>Mettre cet article en avant à la Une du journal floral (Bannière Hero)</span>
                  </Label>
                </div>
              </div>

              {/* Cross-Selling: Produits Liés */}
              <div className="p-4 rounded-xl border border-[#e7e4dd] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1e2a1f] uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag size={14} className="text-[#24582d]" /> Produits recommandés dans l’article (Cross-Selling)
                    </h4>
                    <p className="text-[11px] text-[#777] mt-0.5">
                      Sélectionnez les bouquets et créations mis en valeur à la fin de la lecture pour générer des ventes.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedProductIds.length} sélectionné(s)
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {adminProducts.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleProduct(prod.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#24582d] bg-[#edf8ef]/50 font-medium'
                            : 'border-[#eee] hover:border-[#ccc] bg-[#fafafa]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded bg-white border border-[#ddd] overflow-hidden flex-shrink-0">
                          <img
                            src={prod.image || '/images/bouquet-detail.jpg'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11.5px] text-[#222] truncate">{prod.name}</div>
                          <div className="text-[10.5px] text-[#24582d] font-semibold">
                            {prod.price.toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-[#24582d] flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="article-slug" className="text-xs font-semibold text-[#444]">
                  Identifiant URL (Slug) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#888] bg-[#f5f5f5] px-2.5 py-2 rounded-md border border-[#e7e4dd]">
                    https://decofleurplus.com/blog/
                  </span>
                  <Input
                    id="article-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="comment-entretenir-vos-roses"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="article-seotitle" className="text-xs font-semibold text-[#444]">
                    Titre SEO (Balise Title)
                  </Label>
                  <span className="text-[11px] text-[#888]">
                    {seoTitle.length || title.length} / 65 caractères recommandés
                  </span>
                </div>
                <Input
                  id="article-seotitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title ? `${title} | Décofleur Plus` : 'Titre optimisé pour les moteurs de recherche...'}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="article-seodesc" className="text-xs font-semibold text-[#444]">
                    Meta Description
                  </Label>
                  <span className="text-[11px] text-[#888]">
                    {seoDescription.length || excerpt.length} / 160 caractères recommandés
                  </span>
                </div>
                <textarea
                  id="article-seodesc"
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || 'Description courte apparaissant dans les résultats Google...'}
                  className="mt-1 w-full p-2.5 rounded-md border border-[#e7e4dd] bg-white text-xs text-[#333] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
                />
              </div>

              <div>
                <Label htmlFor="article-tags" className="text-xs font-semibold text-[#444]">
                  Mots-clés & Tags (séparés par des virgules)
                </Label>
                <Input
                  id="article-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Roses, Saly, Conseils, Entretien, Petite Côte"
                  className="mt-1 text-xs"
                />
              </div>

              {/* Google SERP Live Preview */}
              <div className="p-4 rounded-xl border border-[#e7e4dd] bg-white space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777] block">
                  Aperçu dans les résultats de recherche Google
                </span>
                <div className="space-y-0.5">
                  <div className="text-[11px] text-[#202124] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#24582d] text-white text-[9px] flex items-center justify-center font-bold">
                      D
                    </span>
                    <span>https://decofleurplus.com › blog › {slug || 'mon-article'}</span>
                  </div>
                  <h5 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                    {seoTitle || (title ? `${title} | Blog Décofleur Plus` : 'Titre de votre article sur Google')}
                  </h5>
                  <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                    {seoDescription ||
                      (excerpt
                        ? excerpt
                        : 'Découvrez les conseils et astuces de nos experts fleuristes Décofleur Plus à Saly...')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-[#f0eee8] bg-[#faf8f4] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <span>Statut prévu :</span>
            <strong className="text-[#1e2a1f] capitalize">{status}</strong>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit('brouillon')}
              className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
            >
              Enregistrer brouillon
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSubmit()}
              className="text-xs bg-[#24582d] hover:bg-[#1a4021] text-white"
            >
              <Check size={14} className="mr-1.5" />
              {article ? 'Enregistrer les modifications' : 'Publier l’article'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
