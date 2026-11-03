'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  Check,
  Tag,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppIcon, FacebookIcon } from '@/components/icons';
import { SiteFooter } from '@/components/site-footer';
import {
  getBlogArticleBySlug,
  likeBlogArticle,
  BlogArticle,
} from '@/lib/api/blog';

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<{
    article: BlogArticle;
    relatedArticles: BlogArticle[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getBlogArticleBySlug(slug)
      .then((res) => {
        if (res) {
          setData(res);
          setLikes(res.article.likesCount);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    await likeBlogArticle(slug);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <div className="content-width page-main py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 size={30} className="animate-spin text-[#173f22]" />
          <span>Chargement de l’article...</span>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (!data || !data.article) {
    notFound();
  }

  const { article, relatedArticles } = data;

  return (
    <>
      <main className="content-width page-main blog-detail-page pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href="/blog">Blog Floral</Link>
          <span>›</span>
          <span className="truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto text-center mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#173f22] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={13} /> Retour au blog
          </Link>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="px-3 py-1 bg-pink-50 border border-pink-100 text-[#c8436e] rounded-full text-xs font-bold">
              {article.categoryName}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-neutral-900 leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-base text-neutral-600 leading-relaxed mb-6">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 border-y border-neutral-100 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-[#173f22]">
                {article.authorName ? article.authorName.charAt(0) : 'D'}
              </div>
              <span className="font-semibold text-neutral-800">
                {article.authorName || 'Artisan DécoFleur'}
              </span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {article.readTime || '3 min'}
            </span>
          </div>
        </header>

        {/* Cover Image */}
        <div className="max-w-4xl mx-auto relative aspect-16/9 rounded-3xl overflow-hidden mb-10 shadow-sm bg-neutral-100">
          <Image
            src={article.coverImage || '/images/hero.jpg'}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <article className="max-w-2xl mx-auto font-sans text-neutral-800 text-base leading-relaxed space-y-6">
          {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="font-serif font-bold text-2xl text-[#173f22] pt-4">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="font-serif font-bold text-3xl text-[#173f22] pt-6">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            return (
              <p key={index} className="text-neutral-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-neutral-100">
              <Tag size={14} className="text-neutral-400" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Like & Share Bar */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-2xl my-8">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                liked
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:border-red-300 hover:text-red-600'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{liked ? 'Aimé !' : 'J’aime'}</span>
              <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">
                {likes}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="button button-outline text-xs flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copied ? 'Lien copié' : 'Partager'}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="max-w-4xl mx-auto mt-16 pt-12 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif font-bold text-2xl text-neutral-900">
                Dans la même thématique
              </h3>
              <Link href="/blog" className="text-xs font-semibold text-[#173f22] hover:underline">
                Voir tous les articles →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-16/10 bg-neutral-100">
                    <Image
                      src={rel.coverImage || '/images/hero.jpg'}
                      alt={rel.title}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-serif font-bold text-sm text-neutral-900 group-hover:text-[#c8436e] transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h4>
                    <span className="text-xs text-neutral-400 mt-auto flex items-center gap-1">
                      <Clock size={11} /> {rel.readTime || '3 min'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
