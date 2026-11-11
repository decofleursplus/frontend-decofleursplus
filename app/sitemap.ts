import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';
import { apiClient } from '@/lib/api/client';
import { getCategories, getProducts } from '@/lib/api/catalog';

// Régénéré toutes les heures à partir du catalogue et du blog réels
export const revalidate = 3600;


const LOCAL_LANDING_SLUGS = [
  'fleuriste-dakar',
  'fleuriste-saly',
  'fleuriste-somone',
  'fleuriste-mbour',
];

/** Toutes les pages d'une liste paginée (100 par page). */
async function collectAll<T>(fetchPage: (page: number) => Promise<{ items: T[]; totalPages: number }>): Promise<T[]> {
  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) => fetchPage(i + 2)),
  );
  return [first, ...rest].flatMap((p) => p.items);
}

/** Une source indisponible ne doit pas empêcher de servir le reste du plan du site. */
async function safely<T>(label: string, task: () => Promise<T[]>): Promise<T[]> {
  try {
    return await task();
  } catch (error) {
    console.error(`[Sitemap] ${label} indisponibles :`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, articles] = await Promise.all([
    safely('Catégories', () => getCategories()),
    safely('Produits', () => collectAll((page) => getProducts({ page, limit: 100 }))),
    safely('Articles', () =>
      collectAll((page) =>
        apiClient.get<{ items: { slug: string; updatedAt?: string; publishedAt?: string }[]; totalPages: number }>(
          '/blog/articles',
          { params: { page, limit: 100 } },
        ),
      ),
    ),
  ]);

  const now = new Date();

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/boutique`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/evenements`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/paysagisme`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/paysagisme/prestations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/paysagisme/realisations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/location`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/abonnements`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/devis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/a-propos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/livraison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/conditions`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Local Landing Pages (Priority SEO Local)
  const localRoutes: MetadataRoute.Sitemap = LOCAL_LANDING_SLUGS.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  // 3. Category Pages
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(({ slug }) => ({
    url: `${SITE_URL}/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 4. Products Pages (Only in-stock or active products)
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/produits/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. Published Blog Articles
  const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.publishedAt || now),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

  return [
    ...staticRoutes,
    ...localRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogRoutes,
  ];
}

