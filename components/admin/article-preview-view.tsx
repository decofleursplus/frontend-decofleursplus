'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BlogArticle } from '@/lib/admin/mock-data/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  Heart,
  BookOpen,
  Copy,
  Sparkles,
  ShieldCheck,
  Tag,
  Edit3,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ArticlePreviewViewProps {
  article: BlogArticle;
}

export function ArticlePreviewView({ article }: ArticlePreviewViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const author = {
    name: article.authorName || 'Artisan Fleuriste',
    avatar: article.authorAvatar || 'FD',
    role: article.authorRole || 'Artisan Fleuriste',
    bio: article.authorBio || "Expert en compositions végétales et sélection florale d'exception chez Décofleur Plus Saly.",
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://decofleurplus.com/blog/${article.slug}`);
    setCopied(true);
    toast.success('Lien public copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format content paragraphs and H2 / H3 markdown headings (supports HTML and Markdown)
  const renderFormattedContent = (rawContent: string) => {
    if (!rawContent) return null;
    const isHtml = /<\/?(p|h2|h3|blockquote|ul|li|strong|em|a)[^>]*>/i.test(rawContent);
    if (isHtml) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: rawContent }}
          className="space-y-4 text-sm md:text-base text-[#3d423e] leading-relaxed md:leading-loose
            [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-[#1e2a1f] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[#f0eee8]
            [&_h3]:text-lg md:[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-[#1e2a1f] [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:mb-4 [&_p]:leading-relaxed md:[&_p]:leading-loose
            [&_ul]:my-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:text-[#444]
            [&_li]:leading-relaxed
            [&_blockquote]:my-6 [&_blockquote]:p-5 [&_blockquote]:rounded-2xl [&_blockquote]:bg-[#f8f5ee] [&_blockquote]:border-l-4 [&_blockquote]:border-[#24582d] [&_blockquote]:italic [&_blockquote]:text-base md:[&_blockquote]:text-lg [&_blockquote]:text-[#2c3e2e] [&_blockquote]:shadow-2xs
            [&_strong]:font-bold [&_strong]:text-[#111]
            [&_em]:italic
            [&_a]:text-[#24582d] [&_a]:underline [&_a]:font-medium hover:[&_a]:text-[#1a4021]"
        />
      );
    }

    const blocks = rawContent.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
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
            className="my-6 p-5 rounded-2xl bg-[#f8f5ee] border-l-4 border-[#24582d] italic text-base md:text-lg text-[#2c3e2e] leading-relaxed shadow-2xs"
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
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Sticky Header Actions Bar */}
      <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#ece8e1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="w-9 h-9 rounded-xl border border-[#e7e4dd] bg-white flex items-center justify-center text-gray-600 hover:text-[#24582d] hover:bg-[#faf8f4] transition-colors shrink-0 shadow-2xs"
            title="Retour au journal"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-serif font-bold text-[#1e2a1f] truncate max-w-md sm:max-w-xl">
                Aperçu Storefront
              </h1>
              <Badge
                className={
                  article.status === 'publie'
                    ? 'bg-[#edf8ef] text-[#24582d] border-[#b0c8a8] text-[10.5px] font-semibold'
                    : article.status === 'planifie'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 text-[10.5px] font-semibold'
                    : article.status === 'archive'
                    ? 'bg-gray-100 text-gray-700 border-gray-200 text-[10.5px] font-semibold'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-[10.5px] font-semibold'
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
            </div>
            <p className="text-[11px] text-[#777] font-mono truncate">
              /blog/{article.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs border-[#e7e4dd] text-gray-700 bg-white hover:bg-[#faf8f4]"
          >
            {copied ? <Check size={13} className="mr-1.5 text-[#24582d]" /> : <Copy size={13} className="mr-1.5" />}
            {copied ? 'Lien copié !' : 'Copier le lien'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => router.push(`/admin/blog/${article.id}`)}
            className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold shadow-xs"
          >
            <Edit3 size={13} className="mr-1.5" />
            Modifier cet article
          </Button>

          {article.status === 'publie' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
              className="text-xs border-[#e7e4dd] text-gray-700 bg-white hover:bg-[#faf8f4]"
            >
              <ExternalLink size={13} className="mr-1.5" />
              Voir en boutique
            </Button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-[#1e2a1f] text-white p-3.5 px-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#24582d] flex items-center justify-center text-[#a8e6b1] shrink-0">
            <BookOpen size={14} />
          </div>
          <div>
            <span className="text-xs font-semibold text-white">
              Visualisation en situation réelle : Expérience visiteur
            </span>
            <p className="text-[11px] text-[#a0a6a0]">
              Mise en page, typographies Georgia, signatures d’artisans et produits associés exactement comme sur le site public.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-[#c9d1c9] self-end sm:self-auto">
          URL publique : <code className="text-[#a8e6b1] font-mono">/blog/{article.slug}</code>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <article className="rounded-3xl border border-[#ece8e1] bg-white p-6 sm:p-10 md:p-14 shadow-xs space-y-10">
        {/* Header & Meta Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-2xs tracking-wide"
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
                : 'Brouillon non publié'}
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

          {/* Author Bar */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#ece8e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
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

            <div className="flex items-center gap-4 text-xs text-[#777] sm:border-l sm:border-[#ece8e1] sm:pl-5">
              <span className="flex items-center gap-1.5 font-semibold text-[#1e2a1f]">
                <Eye size={14} className="text-[#24582d]" /> {article.viewsCount.toLocaleString('fr-FR')} vues
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                <Heart size={14} className="fill-rose-500" /> {article.likesCount} coups de cœur
              </span>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="space-y-2">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#faf8f4] border border-[#e7e4dd] shadow-xs">
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
        <div className="p-6 md:p-8 rounded-2xl bg-[#f5f3ec] border-l-4 border-[#24582d] shadow-2xs">
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
                className="px-3 py-1 rounded-full bg-[#faf9f6] border border-[#e7e4dd] text-xs text-[#444] font-medium shadow-2xs hover:border-[#24582d] transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Signature Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#faf9f6] border border-[#ece8e1] flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            {article.authorAvatar || 'FD'}
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-base font-serif font-bold text-[#1e2a1f]">
                {article.authorName}
              </h4>
              <Badge variant="outline" className="text-[11px] border-[#24582d]/30 text-[#24582d] bg-[#edf8ef] self-center sm:self-auto font-medium">
                <ShieldCheck size={12} className="mr-1 text-[#24582d]" /> Artisan Fleuriste Vérifié
              </Badge>
            </div>
            <p className="text-xs text-[#24582d] font-semibold">{article.authorRole}</p>
            <p className="text-xs text-[#666] leading-relaxed italic">
              « {author?.bio || "Expert en compositions végétales et sélection florale d'exception chez Décofleur Plus Saly."} »
            </p>
          </div>
        </div>

      </article>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#ece8e1]">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#666] hover:text-[#24582d] transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à la liste des articles
        </Link>

        <Button
          type="button"
          onClick={() => router.push(`/admin/blog/${article.id}`)}
          className="bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold px-4"
        >
          <Edit3 size={13} className="mr-1.5" />
          Modifier cet article
        </Button>
      </div>
    </div>
  );
}
