import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { getBlogArticleBySlug } from '@/lib/api/blog';
import { adminBlogArticles } from '@/lib/admin/mock-data/blog';
import { constructMetadata } from '@/lib/seo/metadata';
import { getArticleSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ArticleInteractions } from '@/components/blog/article-interactions';
import type { BlogArticle } from '@/lib/admin/mock-data/types';

export const dynamicParams = true;

export function generateStaticParams() {
  return adminBlogArticles
    .filter((a) => a.status === 'publie')
    .map((a) => ({ slug: a.slug }));
}

async function fetchArticleData(slug: string): Promise<{
  article: BlogArticle;
  relatedArticles: BlogArticle[];
} | null> {
  try {
    const apiRes = await getBlogArticleBySlug(slug);
    if (apiRes && apiRes.article) {
      return {
        article: {
          id: apiRes.article.id,
          title: apiRes.article.title,
          slug: apiRes.article.slug,
          categoryId: apiRes.article.categoryId,
          categoryName: apiRes.article.categoryName,
          categoryColor: apiRes.article.categoryColor,
          authorId: apiRes.article.authorId,
          authorName: apiRes.article.authorName,
          authorRole: apiRes.article.authorRole,
          authorAvatar: apiRes.article.authorAvatar,
          coverImage: apiRes.article.coverImage,
          coverImageCaption: apiRes.article.coverImageCaption || undefined,
          excerpt: apiRes.article.excerpt,
          content: apiRes.article.content,
          readTime: apiRes.article.readTime,
          status: apiRes.article.status,
          publishedAt: apiRes.article.publishedAt || undefined,
          createdAt: apiRes.article.createdAt,
          updatedAt: apiRes.article.updatedAt,
          viewsCount: apiRes.article.viewsCount,
          likesCount: apiRes.article.likesCount,
          isFeatured: apiRes.article.isFeatured,
          tags: apiRes.article.tags,
          relatedProductIds: apiRes.article.relatedProductIds,
        },
        relatedArticles: (apiRes.relatedArticles || []).map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          categoryId: a.categoryId,
          categoryName: a.categoryName,
          categoryColor: a.categoryColor,
          authorId: a.authorId,
          authorName: a.authorName,
          coverImage: a.coverImage,
          excerpt: a.excerpt,
          content: a.content,
          readTime: a.readTime,
          status: a.status,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          viewsCount: a.viewsCount,
          likesCount: a.likesCount,
          isFeatured: a.isFeatured,
          tags: a.tags,
        })),
      };
    }
  } catch {
    // Fallback to local data
  }

  const local = adminBlogArticles.find((a) => a.slug === slug);
  if (!local) return null;

  const related = adminBlogArticles
    .filter((a) => a.id !== local.id && a.categoryId === local.categoryId)
    .slice(0, 3);

  return {
    article: local,
    relatedArticles: related,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchArticleData(slug);

  if (!data || !data.article) {
    return constructMetadata({
      title: 'Article introuvable',
      description: 'L’article que vous recherchez n’existe pas ou a été déplacé.',
      noIndex: true,
    });
  }

  const { article } = data;

  return constructMetadata({
    title: article.seoTitle || `${article.title} | Blog Décofleur Plus`,
    description: article.seoDescription || article.excerpt,
    image: article.coverImage,
    canonical: `/blog/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt || article.createdAt,
    modifiedTime: article.updatedAt || article.publishedAt,
    authors: [article.authorName],
    keywords: [
      ...(article.tags || []),
      'blog fleuriste saly',
      'fleurs senegal',
      'conseils floraux dakar',
    ],
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchArticleData(slug);

  if (!data || !data.article) {
    notFound();
  }

  const { article, relatedArticles } = data;

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Blog Floral', href: '/blog' },
    { label: article.categoryName, href: '/blog' },
    { label: article.title },
  ];

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Récemment';

  return (
    <>
      <JsonLd data={getArticleSchema(article)} />
      <main className="content-width page-main blog-detail-page pb-16">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Article Header */}
        <header className="max-w-3xl mx-auto text-center mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#173f22] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={13} /> Retour au blog
          </Link>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: article.categoryColor || '#173f22' }}
            >
              {article.categoryName}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#173f22] leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-base text-neutral-600 leading-relaxed mb-6 max-w-2xl mx-auto">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 border-y border-neutral-100 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center text-xs font-bold">
                {article.authorAvatar || 'FD'}
              </div>
              <span className="font-semibold text-neutral-800">{article.authorName}</span>
              {article.authorRole && (
                <span className="text-neutral-400 hidden sm:inline">({article.authorRole})</span>
              )}
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              <time dateTime={article.publishedAt || article.createdAt}>{formattedDate}</time>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{article.readTime || '4 min de lecture'}</span>
            </span>
          </div>
        </header>

        {/* Cover Image with SEO Alt */}
        <div className="max-w-4xl mx-auto relative aspect-16/9 rounded-3xl overflow-hidden mb-10 shadow-sm bg-neutral-100">
          <Image
            src={article.coverImage || '/images/hero.jpg'}
            alt={article.coverImageCaption || article.title}
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
                <h3 key={index} className="font-serif font-bold text-xl sm:text-2xl text-[#173f22] pt-4">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="font-serif font-bold text-2xl sm:text-3xl text-[#173f22] pt-6">
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

          {/* Client Interactive Island for Likes, Sharing & Link Copy */}
          <ArticleInteractions
            slug={article.slug}
            initialLikes={article.likesCount || 0}
            title={article.title}
          />
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
