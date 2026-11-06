'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BlogArticle, BlogArticleStatus } from '@/lib/admin/mock-data/types';
import { getAdminCategories } from '@/lib/api/admin/categories';
import { createAdminBlogArticle, updateAdminBlogArticle } from '@/lib/api/admin/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ImageUploader } from '@/components/admin/image-uploader';
import {
  ArrowLeft,
  Save,
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Clock,
  Star,
  Tag,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Sliders,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ArticleFormProps {
  initialArticle?: BlogArticle | null;
  onSave?: (article: BlogArticle) => void;
}

const PRESET_IMAGES = [
  { url: '/images/bouquet-detail.jpg', label: 'Roses fraîches détail' },
  { url: '/images/mariage.jpg', label: 'Cérémonie & Arche' },
  { url: '/images/fruits.jpg', label: 'Panier gourmand & fruits' },
  { url: '/images/plante-monstera.jpg', label: 'Monstera en pot' },
  { url: '/images/bouquet-passion.jpg', label: 'Bouquet Romance' },
  { url: '/images/bouquet-soleil.jpg', label: 'Bouquet Festif' },
  { url: '/images/boutique-equipe.jpg', label: 'Atelier Décofleur' },
  { url: '/images/hero.jpg', label: 'Décor majestueux' },
];

function markdownToHtml(md: string): string {
  if (!md) return '<p><br></p>';
  if (/<\/?(p|h2|h3|blockquote|ul|li|strong|em|a)[^>]*>/i.test(md)) {
    return md;
  }
  return md
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.replace('### ', '')}</h3>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.replace('## ', '')}</h2>`;
      }
      if (trimmed.startsWith('> ')) {
        return `<blockquote>${trimmed.replace(/^>\s*/, '')}</blockquote>`;
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        return `<ul>${items.map((it) => `<li>${it.replace(/^- /, '')}</li>`).join('')}</ul>`;
      }
      const formatted = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return `<p>${formatted}</p>`;
    })
    .filter(Boolean)
    .join('');
}

export function ArticleForm({ initialArticle, onSave }: ArticleFormProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  // Form states
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId || '');
  const [authorId, setAuthorId] = useState(initialArticle?.authorId || 'admin-author');
  const [readTime, setReadTime] = useState(initialArticle?.readTime || '4 min de lecture');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(initialArticle?.content || '');

  useEffect(() => {
    let mounted = true;
    getAdminCategories()
      .then((cats) => {
        if (!mounted || !cats || cats.length === 0) return;
        setAvailableCategories(cats.map((c) => ({ id: c.id, name: c.name })));
        if (!categoryId) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  // Media
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '/images/bouquet-detail.jpg');
  const [coverImageCaption, setCoverImageCaption] = useState(initialArticle?.coverImageCaption || '');

  // Publication & Metadata
  const [status, setStatus] = useState<BlogArticleStatus>(initialArticle?.status || 'publie');
  const [scheduledAt, setScheduledAt] = useState(
    initialArticle?.scheduledAt ? initialArticle.scheduledAt.split('T')[0] : ''
  );
  const [isFeatured, setIsFeatured] = useState(initialArticle?.isFeatured || false);
  const [tagsInput, setTagsInput] = useState(initialArticle?.tags ? initialArticle.tags.join(', ') : 'Roses, Saly, Conseils');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPresetsBar, setShowPresetsBar] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Active formats in WYSIWYG
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h2: false,
    h3: false,
    list: false,
    quote: false,
  });

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

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialArticle) {
      setSlug(generateSlug(val));
    }
  };

  // Synchronize initial content to contentEditable
  useEffect(() => {
    if (editorRef.current) {
      const initialHtml = markdownToHtml(initialArticle?.content || '');
      editorRef.current.innerHTML = initialHtml;
      setContent(initialHtml);
      const text = editorRef.current.innerText || '';
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
  }, [initialArticle]);

  // Update active formatting states based on current selection
  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      const block = (document.queryCommandValue('formatBlock') || '').toLowerCase();
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        h2: block === 'h2',
        h3: block === 'h3',
        list: document.queryCommandState('insertUnorderedList'),
        quote: block === 'blockquote',
      });
      if (editorRef.current) {
        const text = editorRef.current.innerText || '';
        setWordCount(text.split(/\s+/).filter(Boolean).length);
      }
    } catch {
      // Ignore queryCommand errors if element not focused
    }
  }, []);

  // WYSIWYG command execution helper
  const execCmd = (cmd: string, val: string = '') => {
    if (typeof document !== 'undefined') {
      editorRef.current?.focus();
      document.execCommand(cmd, false, val);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setContent(html);
        const text = editorRef.current.innerText || '';
        setWordCount(text.split(/\s+/).filter(Boolean).length);
      }
      updateActiveFormats();
    }
  };

  const handleFormatH2 = () => {
    const isH2 = (document.queryCommandValue('formatBlock') || '').toLowerCase() === 'h2';
    execCmd('formatBlock', isH2 ? '<p>' : '<h2>');
  };

  const handleFormatH3 = () => {
    const isH3 = (document.queryCommandValue('formatBlock') || '').toLowerCase() === 'h3';
    execCmd('formatBlock', isH3 ? '<p>' : '<h3>');
  };

  const handleFormatQuote = () => {
    const isQuote = (document.queryCommandValue('formatBlock') || '').toLowerCase() === 'blockquote';
    execCmd('formatBlock', isQuote ? '<p>' : '<blockquote>');
  };

  const handleFormatLink = () => {
    const url = window.prompt('Entrez l’adresse web (URL) du lien :', 'https://');
    if (url && url.trim() && url !== 'https://') {
      execCmd('createLink', url.trim());
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      const text = editorRef.current.innerText || '';
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
    updateActiveFormats();
  };

  const handleSubmit = async (finalStatus?: BlogArticleStatus) => {
    if (!title.trim()) {
      toast.error('Veuillez renseigner un titre pour cet article.');
      return;
    }
    if (!excerpt.trim()) {
      toast.error('Veuillez renseigner un résumé / chapeau d’accroche.');
      return;
    }

    setIsSubmitting(true);
    const targetStatus = finalStatus || status;
    const selectedCat = availableCategories.find((c) => c.id === categoryId);
    const categoryName = selectedCat?.name || initialArticle?.categoryName || 'Conseils & Botanique';

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedArticle: BlogArticle = {
      id: initialArticle ? initialArticle.id : `art-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      categoryId: selectedCat?.id || categoryId || 'bcat-1',
      categoryName,
      categoryColor: '#24582d',
      authorId: authorId || 'admin-author',
      authorName: initialArticle?.authorName || 'Équipe Décofleur Plus',
      authorAvatar: initialArticle?.authorAvatar || 'DP',
      authorRole: initialArticle?.authorRole || 'Maître Fleuriste',
      coverImage: coverImage.trim() || '/images/bouquet-detail.jpg',
      coverImageCaption: coverImageCaption.trim(),
      excerpt: excerpt.trim(),
      content: content.trim() || `<p>${excerpt.trim()}</p>`,
      readTime: readTime.trim() || '4 min de lecture',
      status: targetStatus,
      publishedAt: targetStatus === 'publie' ? (initialArticle?.publishedAt || new Date().toISOString()) : undefined,
      scheduledAt: targetStatus === 'planifie' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      createdAt: initialArticle ? initialArticle.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: initialArticle ? initialArticle.viewsCount : 0,
      likesCount: initialArticle ? initialArticle.likesCount : 0,
      isFeatured,
      tags: tagsArray.length > 0 ? tagsArray : ['Fleurs', 'Décofleur Plus'],
      seoTitle: initialArticle?.seoTitle || `${title.trim()} | Blog Décofleur Plus`,
      seoDescription: initialArticle?.seoDescription || excerpt.trim().slice(0, 160),
      relatedProductIds: initialArticle?.relatedProductIds || [],
    };

    if (onSave) {
      onSave(savedArticle);
    }

    try {
      if (initialArticle) {
        await updateAdminBlogArticle(initialArticle.id, savedArticle);
      } else {
        await createAdminBlogArticle({
          title: savedArticle.title,
          slug: savedArticle.slug,
          content: savedArticle.content,
          excerpt: savedArticle.excerpt,
          coverImage: savedArticle.coverImage,
          categoryId: savedArticle.categoryId,
          authorId: savedArticle.authorId,
          isFeatured: savedArticle.isFeatured,
          status: savedArticle.status === 'publie' ? 'PUBLISHED' : 'DRAFT',
        });
      }
    } catch {
      // Keep optimistic
    }

    setIsSubmitting(false);
    toast.success(
      initialArticle
        ? `L'article « ${savedArticle.title} » a été mis à jour.`
        : `L'article « ${savedArticle.title} » a été créé avec succès.`
    );
    router.push('/admin/blog');
  };

  const selectedCategory = availableCategories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* Sticky Header Actions Bar */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#ece8e1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="w-9 h-9 rounded-xl border border-[#e7e4dd] bg-white flex items-center justify-center text-gray-600 hover:text-[#24582d] hover:bg-[#faf8f4] transition-colors shrink-0 shadow-2xs"
            title="Retour aux articles"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-serif font-bold text-[#1e2a1f] truncate">
                {initialArticle ? 'Modifier l’article' : 'Rédiger un nouvel article'}
              </h1>
              <Badge
                className={
                  status === 'publie'
                    ? 'bg-[#edf8ef] text-[#24582d] border-[#b0c8a8] text-[10.5px] font-semibold'
                    : status === 'planifie'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 text-[10.5px] font-semibold'
                    : status === 'archive'
                    ? 'bg-gray-100 text-gray-700 border-gray-200 text-[10.5px] font-semibold'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-[10.5px] font-semibold'
                }
              >
                {status === 'publie'
                  ? '● En ligne'
                  : status === 'planifie'
                  ? '● Planifié'
                  : status === 'archive'
                  ? '● Archivé'
                  : '● Brouillon'}
              </Badge>
            </div>
            <p className="text-[11px] text-[#777] truncate">
              {selectedCategory?.name || 'Catégorie générale'} • Par {initialArticle?.authorName || 'Équipe Décofleur Plus'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          {/* Side Drawer Trigger Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs border-[#e7e4dd] text-[#1e2a1f] bg-white hover:bg-[#faf8f4] font-medium shadow-2xs"
          >
            <Sliders size={13} className="mr-1.5 text-[#24582d]" />
            Paramètres de l’article
          </Button>

          {initialArticle && (
            <Link href={`/admin/blog/${initialArticle.id}/apercu`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-[#e7e4dd] text-gray-700 bg-white hover:bg-[#faf8f4]"
              >
                <Eye size={13} className="mr-1.5 text-[#24582d]" />
                Aperçu Storefront
              </Button>
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('brouillon')}
            disabled={isSubmitting}
            className="text-xs border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100/50"
          >
            Enregistrer brouillon
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold shadow-xs"
          >
            <Save size={14} className="mr-1.5" />
            {isSubmitting
              ? 'Enregistrement...'
              : initialArticle
              ? 'Mettre à jour l’article'
              : 'Publier l’article'}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT WRITING CANVAS (Pleine largeur aérée) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Notion / Medium style Cover Image Banner */}
        <div className="space-y-2">
          {coverImage ? (
            <div className="relative group rounded-3xl overflow-hidden border border-[#ece8e1] bg-[#faf8f4] shadow-xs aspect-[21/9] sm:aspect-[24/9]">
              <img
                src={coverImage}
                alt="Couverture"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                <span className="text-xs text-white/90 truncate max-w-sm">
                  {coverImageCaption ? `📸 ${coverImageCaption}` : 'Photo de couverture'}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPresetsBar(!showPresetsBar)}
                    className="h-8 text-xs bg-white/90 hover:bg-white text-gray-800 border-none shadow-xs"
                  >
                    <ImageIcon size={13} className="mr-1.5 text-[#24582d]" />
                    Changer l’image
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCoverImage('')}
                    className="h-8 text-xs bg-red-600/90 hover:bg-red-700 text-white border-none shadow-xs"
                  >
                    <X size={13} className="mr-1" />
                    Retirer
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowPresetsBar(true)}
              className="p-8 rounded-3xl border-2 border-dashed border-[#e7e4dd] bg-[#faf9f6] hover:bg-[#f5f3ec] hover:border-[#24582d]/40 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e7e4dd] flex items-center justify-center text-[#24582d] group-hover:scale-105 transition-transform shadow-2xs">
                <ImageIcon size={18} />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1e2a1f] block">
                  + Ajouter une photo de couverture
                </span>
                <span className="text-[11px] text-[#777]">
                  Sélectionnez parmi la galerie florale Décofleur ou renseignez une image
                </span>
              </div>
            </div>
          )}

          {/* Quick preset thumbnail picker strip */}
          {(showPresetsBar || !coverImage) && (
            <div className="p-4 rounded-2xl bg-white border border-[#ece8e1] shadow-xs space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1e2a1f] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#24582d]" />
                  Photo de couverture de l&apos;article :
                </span>
                <button
                  type="button"
                  onClick={() => setShowPresetsBar(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Uploader direct */}
              <ImageUploader
                folder="products"
                multiple={false}
                value={coverImage ? [coverImage] : []}
                onChange={(urls) => {
                  if (urls[0]) {
                    setCoverImage(urls[0]);
                    setShowPresetsBar(false);
                  }
                }}
                label="Téléverser votre propre photo"
                description="Glissez votre image ou cliquez pour parcourir. Format JPG, PNG, WebP. Max 5 Mo."
              />

              {/* Presets rapides */}
              <div className="pt-2 border-t border-[#ece8e1]">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Ou choisir parmi la galerie florale Décofleur :
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset.url);
                        setCoverImageCaption(preset.label);
                        setShowPresetsBar(false);
                        toast.success(`Couverture mise à jour : ${preset.label}`);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        coverImage === preset.url
                          ? 'border-[#24582d] ring-2 ring-[#24582d]/20 scale-95'
                          : 'border-[#ece8e1] hover:border-[#24582d]/60 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Caption input if image exists */}
          {coverImage && (
            <div className="flex items-center gap-2 px-2 text-xs">
              <span className="text-[#888] italic text-[11px]">Légende photo :</span>
              <input
                type="text"
                placeholder="ex: Atelier de création florale chez Décofleur Plus Saly..."
                value={coverImageCaption}
                onChange={(e) => setCoverImageCaption(e.target.value)}
                className="flex-1 text-xs text-[#555] bg-transparent border-b border-dashed border-[#e0ded8] focus:border-[#24582d] focus:outline-none py-0.5 italic"
              />
            </div>
          )}
        </div>

        {/* Card 1: Informations Générales (Titre, URL & Chapeau d'accroche) */}
        <Card className="border-[#ece8e1] shadow-xs">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <Label htmlFor="post-title" className="text-xs font-bold text-[#333] uppercase tracking-wider block mb-1.5">
                Titre principal de l’article <span className="text-red-500">*</span>
              </Label>
              <Input
                id="post-title"
                placeholder="ex: Comment entretenir vos roses et bouquets sous le climat de Saly..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-serif text-xl sm:text-2xl font-bold text-[#1e2a1f] h-12 border-[#e7e4dd] focus-visible:ring-[#24582d] placeholder:font-serif placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="post-slug" className="text-[11px] font-semibold text-[#666] block mb-1">
                Identifiant URL (Slug public) :
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 text-xs">
                <span className="text-[#888] font-mono bg-[#faf8f4] px-2.5 py-1.5 rounded-md border border-[#e7e4dd] shrink-0 text-[11px] truncate">
                  https://decofleurplus.com/blog/
                </span>
                <Input
                  id="post-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs text-[#24582d] h-9 border-[#e7e4dd] focus-visible:ring-[#24582d] flex-1"
                  placeholder="permalink-automatique"
                />
              </div>
            </div>

            {/* Extrait / Chapeau d'accroche intégré */}
            <div className="pt-2 border-t border-[#f0eee8] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="post-excerpt" className="text-xs font-bold text-[#333] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} className="text-[#24582d]" />
                  <span>Extrait / Résumé d’accroche (Chapeau)</span>
                  <span className="text-red-500">*</span>
                </Label>
                <span className="text-[10.5px] text-gray-400 hidden sm:inline">
                  Partages & cartes blog
                </span>
              </div>
              <textarea
                id="post-excerpt"
                rows={3}
                placeholder="Rédigez un court résumé percutant (qui apparaîtra en haut de l’article, sur les cartes de la page d'accueil du blog et lors des partages sur WhatsApp ou Facebook)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#e7e4dd] bg-white text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#24582d]/20 transition-all leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-0.5">
                <span className="text-[10px] text-gray-400">
                  Affiché sur la page d'accueil et les fiches articles
                </span>
                <span className={excerpt.length > 200 ? 'text-amber-600 font-semibold' : 'text-gray-400'}>
                  {excerpt.length} / 250 caractères recommandés
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Corps de l'article — ÉDITEUR WYSIWYG VISUEL DIRECT */}
        <Card className="border-[#ece8e1] shadow-xs">
          <CardHeader className="p-4 pb-3 border-b border-[#f0eee8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xs font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-[#24582d]" />
                Corps de l’article (Éditeur Visuel en Direct)
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#777]">
              <span>{wordCount} mots</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-700 font-medium">Éditeur visuel actif</span>
            </div>
          </CardHeader>

          {/* Visual WYSIWYG Formatting Toolbar */}
          <div className="px-4 py-2 border-b border-[#f0eee8] bg-[#faf8f4] flex items-center gap-1 flex-wrap text-xs text-[#555]">
            <span className="text-[11px] font-semibold text-[#888] mr-1.5">Mise en forme :</span>

            {/* Titre H2 */}
            <button
              type="button"
              onClick={handleFormatH2}
              className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeFormats.h2
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Titre de section H2"
            >
              <Heading2 size={14} /> Titre H2
            </button>

            {/* Titre H3 */}
            <button
              type="button"
              onClick={handleFormatH3}
              className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeFormats.h3
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Sous-titre H3"
            >
              <Heading3 size={14} /> Sous-titre H3
            </button>

            <span className="text-gray-300 mx-1">|</span>

            {/* Gras */}
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className={`p-1.5 rounded-lg border transition-all ${
                activeFormats.bold
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Gras (Ctrl+B)"
            >
              <Bold size={14} />
            </button>

            {/* Italique */}
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className={`p-1.5 rounded-lg border transition-all ${
                activeFormats.italic
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Italique (Ctrl+I)"
            >
              <Italic size={14} />
            </button>

            <span className="text-gray-300 mx-1">|</span>

            {/* Liste à puces */}
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                activeFormats.list
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Liste à puces"
            >
              <List size={14} /> Liste
            </button>

            {/* Citation */}
            <button
              type="button"
              onClick={handleFormatQuote}
              className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                activeFormats.quote
                  ? 'bg-[#24582d] text-white border-[#24582d] shadow-2xs'
                  : 'hover:bg-white hover:text-[#24582d] border-transparent hover:border-[#e7e4dd] text-[#444]'
              }`}
              title="Citation mise en avant"
            >
              <Quote size={14} /> Citation
            </button>

            <span className="text-gray-300 mx-1">|</span>

            {/* Lien Hypertexte */}
            <button
              type="button"
              onClick={handleFormatLink}
              className="px-2 py-1.5 rounded-lg hover:bg-white hover:text-[#24582d] border border-transparent hover:border-[#e7e4dd] transition-all flex items-center gap-1 text-xs text-[#555]"
              title="Insérer un lien URL"
            >
              <LinkIcon size={14} /> Lien
            </button>

            {/* Nettoyer le formatage */}
            <button
              type="button"
              onClick={() => execCmd('removeFormat')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-red-600 border border-transparent hover:border-[#e7e4dd] transition-all text-[#555]"
              title="Effacer la mise en forme sélectionnée"
            >
              <RemoveFormatting size={14} />
            </button>

            <span className="text-gray-300 mx-1">|</span>

            {/* Annuler / Rétablir */}
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-[#24582d] border border-transparent hover:border-[#e7e4dd] transition-all text-[#555]"
              title="Annuler (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-[#24582d] border border-transparent hover:border-[#e7e4dd] transition-all text-[#555]"
              title="Rétablir (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </button>
          </div>

          <CardContent className="p-6">
            <div className="space-y-2">
              {/* Direct WYSIWYG ContentEditable Surface */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onFocus={updateActiveFormats}
                data-placeholder="Commencez à rédiger votre article : astuces florales, conseils de saison, étapes de conservation..."
                className="w-full p-5 rounded-2xl border border-[#e7e4dd] bg-white text-sm text-[#333] font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#24582d]/20 transition-all min-h-[420px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:italic empty:before:pointer-events-none
                  [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-[#1e2a1f] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-[#ece8e1]
                  [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-[#1e2a1f] [&_h3]:mt-6 [&_h3]:mb-2
                  [&_p]:text-sm [&_p]:text-[#3d423e] [&_p]:leading-relaxed [&_p]:mb-3.5
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5 [&_ul]:text-sm [&_ul]:text-[#444]
                  [&_li]:leading-relaxed
                  [&_blockquote]:my-5 [&_blockquote]:p-4 [&_blockquote]:rounded-xl [&_blockquote]:bg-[#f8f5ee] [&_blockquote]:border-l-4 [&_blockquote]:border-[#24582d] [&_blockquote]:italic [&_blockquote]:text-sm [&_blockquote]:text-[#2c3e2e]
                  [&_strong]:font-bold [&_strong]:text-[#111]
                  [&_em]:italic
                  [&_a]:text-[#24582d] [&_a]:underline [&_a]:font-medium hover:[&_a]:text-[#1a4021]"
              />

              <div className="flex items-center justify-between text-[11px] text-[#888] pt-1">
                <span>Le texte s’affiche directement tel qu’il apparaîtra sur le site (sans balises de code).</span>
                <span>{wordCount} mots</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SIDE DRAWER (Sheet) : Paramètres de l'article */}
      {/* ========================================================================= */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg bg-white p-0 flex flex-col justify-between overflow-hidden shadow-2xl">
          <SheetHeader className="p-5 border-b border-[#ece8e1] bg-[#faf8f4] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#edf8ef] text-[#24582d] flex items-center justify-center shadow-2xs">
                  <Sliders size={16} />
                </div>
                <div>
                  <SheetTitle className="text-base font-serif font-bold text-[#1e2a1f]">
                    Paramètres de l’article
                  </SheetTitle>
                  <SheetDescription className="text-xs text-[#777]">
                    Publication, auteur, catégorie et mots-clés
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content inside Drawer */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Section 1: Publication & Visibilité */}
            <div className="p-4 rounded-2xl border border-[#ece8e1] bg-white shadow-2xs space-y-3.5">
              <h3 className="text-xs font-bold text-[#1e2a1f] uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} className="text-[#24582d]" />
                Publication & Parution
              </h3>

              <div className="space-y-2">
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    status === 'publie'
                      ? 'border-[#24582d] bg-[#edf8ef]/50 font-semibold shadow-2xs'
                      : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                  }`}
                >
                  <input
                    type="radio"
                    name="drawer-status"
                    checked={status === 'publie'}
                    onChange={() => setStatus('publie')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-xs text-[#24582d]">Publié en ligne</span>
                    <span className="text-[10.5px] text-[#777] font-normal">Visible dès maintenant sur le journal</span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    status === 'brouillon'
                      ? 'border-amber-400 bg-amber-50/50 font-semibold shadow-2xs'
                      : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                  }`}
                >
                  <input
                    type="radio"
                    name="drawer-status"
                    checked={status === 'brouillon'}
                    onChange={() => setStatus('brouillon')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-xs text-amber-800">Brouillon privé</span>
                    <span className="text-[10.5px] text-[#777] font-normal">Non visible du public</span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    status === 'planifie'
                      ? 'border-purple-400 bg-purple-50/50 font-semibold shadow-2xs'
                      : 'border-[#e7e4dd] hover:bg-[#faf8f4]'
                  }`}
                >
                  <input
                    type="radio"
                    name="drawer-status"
                    checked={status === 'planifie'}
                    onChange={() => setStatus('planifie')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-xs text-purple-800">Planifier la parution</span>
                    <span className="text-[10.5px] text-[#777] font-normal">Publication à une date ultérieure</span>
                  </div>
                </label>
              </div>

              {status === 'planifie' && (
                <div className="pt-2">
                  <Label htmlFor="drawer-sched-date" className="text-xs font-semibold text-[#444] block mb-1">
                    Date de parution prévue :
                  </Label>
                  <Input
                    id="drawer-sched-date"
                    type="date"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="text-xs h-9 border-[#e7e4dd]"
                  />
                </div>
              )}

              {/* Checkbox Featured */}
              <div className="pt-3 border-t border-[#f0eee8] flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="drawer-featured-check"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#24582d] focus:ring-[#24582d]"
                />
                <Label htmlFor="drawer-featured-check" className="text-xs text-[#333] cursor-pointer flex items-center gap-1.5 font-medium">
                  <Star size={13} className={isFeatured ? 'text-amber-500 fill-amber-500' : 'text-[#888]'} />
                  <span>Mettre à la Une (Bannière Hero du journal)</span>
                </Label>
              </div>
            </div>

            {/* Section 2: Organisation éditoriale */}
            <div className="p-4 rounded-2xl border border-[#ece8e1] bg-white shadow-2xs space-y-3.5">
              <h3 className="text-xs font-bold text-[#1e2a1f] uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-[#24582d]" />
                Organisation & Auteur
              </h3>

              {/* Catégorie */}
              <div>
                <Label htmlFor="drawer-category" className="text-xs font-semibold text-[#444] block mb-1">
                  Thématique / Catégorie :
                </Label>
                <select
                  id="drawer-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e7e4dd] bg-[#faf8f4] text-xs font-medium text-[#222] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
                >
                  {availableCategories.length === 0 ? (
                    <option value="">Sélectionner une catégorie</option>
                  ) : (
                    availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Auteur */}
              <div>
                <Label htmlFor="drawer-author" className="text-xs font-semibold text-[#444] block mb-1">
                  Auteur / Rédacteur :
                </Label>
                <Input
                  id="drawer-author"
                  value={authorId === 'admin-author' ? 'Équipe Décofleur Plus' : authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  placeholder="Nom de l'auteur..."
                  className="w-full text-xs bg-[#faf8f4] border-[#e7e4dd]"
                />
              </div>

              {/* Temps de lecture */}
              <div>
                <Label htmlFor="drawer-read-time" className="text-xs font-semibold text-[#444] block mb-1">
                  Temps de lecture estimé :
                </Label>
                <Input
                  id="drawer-read-time"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="ex: 4 min de lecture"
                  className="text-xs h-9 border-[#e7e4dd]"
                />
              </div>
            </div>

            {/* Section 3: Mots-clés & Tags */}
            <div className="p-4 rounded-2xl border border-[#ece8e1] bg-white shadow-2xs space-y-3.5">
              <h3 className="text-xs font-bold text-[#1e2a1f] uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-[#24582d]" />
                Mots-clés & Tags
              </h3>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Roses, Conseils, Saly, Décofleur..."
                className="text-xs h-9 border-[#e7e4dd]"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsInput
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-[11px] border-[#e7e4dd] bg-[#faf8f4] text-[#444]">
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-[#ece8e1] bg-[#faf8f4] flex flex-row items-center justify-end shrink-0">
            <Button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold px-4"
            >
              <Check size={14} className="mr-1.5" />
              Appliquer les paramètres
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
