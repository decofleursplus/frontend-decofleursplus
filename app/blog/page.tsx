import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo/config';
import { getBlogArticles, getBlogCategories } from '@/lib/api/blog';
import { BlogExplorer } from '@/components/blog/blog-explorer';
import type { BlogArticle, BlogCategory } from '@/lib/admin/mock-data/types';

export const metadata: Metadata = constructMetadata({
  title: 'Blog Floral & Art de Vivre à Saly · Conseils, Mariages & Plantes | Décofleur Plus',
  description:
    'Inspirations florales et astuces d’experts pour préserver vos roses sous le climat de Saly et Dakar, idées de scénographies de mariages et entretien des plantes tropicales.',
  canonical: '/blog',
  keywords: [
    'blog fleuriste dakar',
    'conseils fleurs saly',
    'entretien roses senegal',
    'decoration mariage saly',
    'plantes tropicales interieur senegal',
    'art floral dakar',
  ],
});

export default async function BlogIndexPage() {
  let articles: BlogArticle[] = [];
  let categories: BlogCategory[] = [];

  try {
    const [catsRes, artsRes] = await Promise.all([
      getBlogCategories().catch(() => []),
      getBlogArticles({ limit: 50 }).catch(() => ({ items: [] })),
    ]);

    if (catsRes && catsRes.length > 0) {
      categories = catsRes.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        color: c.color,
        coverImage: c.coverImage || undefined,
        articlesCount: c.articlesCount,
      }));
    }

    if (artsRes?.items && artsRes.items.length > 0) {
      articles = artsRes.items.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        categoryId: a.categoryId,
        categoryName: a.categoryName,
        categoryColor: a.categoryColor,
        authorId: a.authorId,
        authorName: a.authorName,
        authorAvatar: a.authorAvatar,
        authorRole: a.authorRole,
        coverImage: a.coverImage,
        coverImageCaption: a.coverImageCaption || undefined,
        excerpt: a.excerpt,
        content: a.content,
        readTime: a.readTime,
        status: a.status,
        publishedAt: a.publishedAt || undefined,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        viewsCount: a.viewsCount,
        likesCount: a.likesCount,
        isFeatured: a.isFeatured,
        tags: a.tags,
        relatedProductIds: a.relatedProductIds,
      }));
    }
  } catch {
    categories = [];
    articles = [];
  }

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Blog Floral' },
  ];

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    name: `Le Carnet Floral DécoFleur Plus | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: `${SITE_URL}/blog`,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    blogPost: articles.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/blog/${article.slug}`,
      datePublished: article.publishedAt || article.createdAt,
      image: article.coverImage.startsWith('http')
        ? article.coverImage
        : `${SITE_URL}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`,
    })),
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <main className="content-width page-main blog-page pb-16">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Hero Header */}
        <section className="bg-gradient-to-br from-[#173f22]/5 via-[#c8436e]/5 to-transparent rounded-3xl p-8 md:p-12 border border-neutral-100 mb-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#173f22]/10 rounded-full text-xs font-semibold text-[#173f22] mb-3 shadow-xs">
            <Sparkles size={13} className="text-[#c8436e]" />
            <span>Le Carnet Floral DécoFleur Plus</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#173f22] max-w-2xl mx-auto leading-tight mb-4">
            Inspirations, astuces florales &amp; art de vivre à Saly
          </h1>

          <p className="text-neutral-600 max-w-xl mx-auto text-sm md:text-base mb-6">
            Découvrez nos secrets pour faire durer vos bouquets sous le climat sénégalais, des idées scénographiques pour vos événements et les tendances végétales.
          </p>
        </section>

        {/* Interactive Explorer (Search + Category Filter + Article Grid) */}
        <BlogExplorer initialArticles={articles} categories={categories} />
      </main>
      <SiteFooter />
    </>
  );
}
