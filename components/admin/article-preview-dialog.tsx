'use client';

import type { BlogArticle } from '@/lib/admin/mock-data/types';
import { adminProducts } from '@/lib/admin/mock-data/products';
import { adminBlogAuthors } from '@/lib/admin/mock-data/blog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  Eye,
  Heart,
  ShoppingBag,
  X,
  BookOpen,
  Share2,
  Copy,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

interface ArticlePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  article: BlogArticle | null;
  onEdit?: (article: BlogArticle) => void;
}

export function ArticlePreviewDialog({
  isOpen,
  onOpenChange,
  article,
  onEdit,
}: ArticlePreviewDialogProps) {
  if (!article) return null;

  const author = adminBlogAuthors.find((a) => a.id === article.authorId);
  const relatedProducts = (article.relatedProductIds || [])
    .map((id) => adminProducts.find((p) => p.id === id))
    .filter(Boolean);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://decofleurplus.com/blog/${article.slug}`);
    toast.success('Lien public copié dans le presse-papier');
  };

  // Helper to format content paragraphs and H2 / H3 markdown headings
  const renderFormattedContent = (rawContent: string) => {
    const blocks = rawContent.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg md:text-xl font-serif font-bold text-[#1e2a1f] mt-8 mb-3"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl md:text-2xl font-serif font-bold text-[#1e2a1f] mt-10 mb-4 pb-2 border-b border-[#f0eee8]"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-6 p-5 rounded-2xl bg-[#f8f5ee] border-l-4 border-[#24582d] italic text-base md:text-lg text-[#2c3e2e] leading-relaxed shadow-xs"
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        return (
          <ul key={idx} className="my-4 space-y-2 pl-5 list-disc text-sm md:text-base text-[#444] leading-relaxed">
            {items.map((it, itemIdx) => (
              <li key={itemIdx}>{it.replace(/^- /, '')}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-sm md:text-base text-[#3d423e] leading-relaxed md:leading-loose">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-[#ece8e1] shadow-2xl rounded-2xl">
        {/* Top Floating Control Bar */}
        <div className="bg-[#1e2a1f] text-white px-6 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#24582d] flex items-center justify-center text-[#a8e6b1]">
              <BookOpen size={15} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white tracking-wide">
                Aperçu Storefront — Journal Floral Décofleur Plus
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#a0a6a0] ml-2">
                • /blog/{article.slug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge
              className={
                article.status === 'publie'
                  ? 'bg-[#24582d] text-white border-none text-[11px] font-medium'
                  : article.status === 'planifie'
                  ? 'bg-purple-600 text-white border-none text-[11px] font-medium'
                  : article.status === 'archive'
                  ? 'bg-gray-600 text-white border-none text-[11px] font-medium'
                  : 'bg-amber-600 text-white border-none text-[11px] font-medium'
              }
            >
              {article.status === 'publie'
                ? '● En ligne'
                : article.status === 'planifie'
                ? '● Planifié'
                : article.status === 'archive'
                ? '● Archivé'
                : '● Brouillon privé'}
            </Badge>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-1"
              title="Fermer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Article Canvas */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-14 md:py-12 bg-[#faf9f6]">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Header & Meta Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs tracking-wide"
                  style={{ backgroundColor: article.categoryColor || '#d65d7a' }}
                >
                  {article.categoryName}
                </span>

                <span className="text-xs text-[#666] flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[#888]" /> {article.readTime}
                </span>

                <span className="text-xs text-[#666] flex items-center gap-1.5 font-medium">
                  <Calendar size={13} className="text-[#888]" />{' '}
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Brouillon privé'}
                </span>

                {article.isFeatured && (
                  <Badge variant="outline" className="text-xs border-amber-400 bg-amber-50 text-amber-800 gap-1 font-semibold">
                    <Sparkles size={11} className="text-amber-600" /> À la Une
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1e2a1f] leading-snug md:leading-tight">
                {article.title}
              </h1>

              {/* Author Info Bar */}
              <div className="p-4 rounded-xl bg-white border border-[#ece8e1] flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {article.authorAvatar || 'FD'}
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold text-[#1e2a1f]">
                      {article.authorName}
                    </strong>
                    <span className="text-xs text-[#24582d] font-medium">
                      {article.authorRole || 'Artisan Fleuriste Décofleur'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#777] border-l border-[#f0eee8] pl-5">
                  <span className="flex items-center gap-1.5 font-semibold text-[#1e2a1f]">
                    <Eye size={14} className="text-[#24582d]" /> {article.viewsCount.toLocaleString('fr-FR')} vues
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                    <Heart size={14} className="fill-rose-500" /> {article.likesCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Cover Image */}
            <div className="space-y-2">
              <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-white border border-[#e7e4dd] shadow-sm">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bouquet-detail.jpg';
                  }}
                />
              </div>
              {article.coverImageCaption && (
                <p className="text-center text-xs text-[#777] italic pt-1">
                  📸 {article.coverImageCaption}
                </p>
              )}
            </div>

            {/* Lead / Excerpt */}
            <div className="p-6 md:p-7 rounded-2xl bg-[#f5f3ec] border-l-4 border-[#24582d] shadow-2xs">
              <p className="text-base md:text-lg font-serif italic text-[#243325] leading-relaxed">
                « {article.excerpt} »
              </p>
            </div>

            {/* Structured Content Body */}
            <div className="space-y-6 pt-2">
              {renderFormattedContent(article.content)}
            </div>

            {/* Tags Pills */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-[#ece8e1] flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#555] uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Tag size={13} className="text-[#24582d]" /> Mots-clés :
                </span>
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white border border-[#e7e4dd] text-xs text-[#444] font-medium shadow-2xs hover:border-[#24582d] transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Signature Box */}
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#ece8e1] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                {article.authorAvatar || 'FD'}
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-base font-serif font-bold text-[#1e2a1f]">
                    {article.authorName}
                  </h4>
                  <Badge variant="outline" className="text-[11px] border-[#24582d]/30 text-[#24582d] bg-[#edf8ef]/50 self-center sm:self-auto">
                    <ShieldCheck size={12} className="mr-1 text-[#24582d]" /> Artisan Fleuriste Vérifié
                  </Badge>
                </div>
                <p className="text-xs text-[#24582d] font-semibold">{article.authorRole}</p>
                <p className="text-xs text-[#666] leading-relaxed italic">
                  « {author?.bio || "Expert en compositions végétales et sélection florale d'exception chez Décofleur Plus Saly."} »
                </p>
              </div>
            </div>

            {/* Cross-Selling: Related Floral Creations */}
            {relatedProducts.length > 0 && (
              <div className="pt-8 border-t-2 border-[#f0eee8] space-y-6">
                <div>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-[#1e2a1f] flex items-center gap-2.5">
                    <ShoppingBag size={20} className="text-[#24582d]" />
                    Créations florales associées à cet article
                  </h3>
                  <p className="text-xs text-[#777] mt-1">
                    Compositions artisanales disponibles en livraison express sur Saly, Somone, Ngaparou et Dakar
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProducts.map((prod) => (
                    <div
                      key={prod!.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[#ece8e1] bg-white hover:border-[#24582d] hover:shadow-md transition-all group"
                    >
                      <div className="w-18 h-18 rounded-xl bg-[#f9f8f4] border border-[#e7e4dd] overflow-hidden shrink-0">
                        <img
                          src={prod!.image || '/images/bouquet-detail.jpg'}
                          alt={prod!.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="block text-sm font-semibold text-[#1e2a1f] truncate group-hover:text-[#24582d] transition-colors">
                          {prod!.name}
                        </span>
                        <span className="block text-sm text-[#24582d] font-bold">
                          {prod!.price.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#24582d] font-semibold pt-1">
                          Commander <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#ece8e1] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <span>URL publique :</span>
            <code className="text-[#24582d] bg-[#faf8f4] px-2 py-1 rounded border border-[#ece8e1] font-mono text-[11px]">
              /blog/{article.slug}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 px-2 text-xs text-[#666] hover:text-black"
              title="Copier le lien"
            >
              <Copy size={13} />
            </Button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs border-[#e7e4dd]"
            >
              Fermer l'aperçu
            </Button>
            {onEdit && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(article);
                }}
                className="text-xs bg-[#24582d] hover:bg-[#1a4021] text-white font-semibold"
              >
                <Edit3 size={13} className="mr-1.5" />
                Modifier cet article
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
