import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';
import { products } from '@/lib/products';
import { adminBlogArticles } from '@/lib/admin/mock-data/blog';

const CATEGORY_SLUGS = [
  'bouquets',
  'roses',
  'plantes',
  'paniers-de-fruits',
  'cadeaux',
  'mariages',
  'decoration',
  'bougies',
  'vases',
  'deuil',
  'anniversaires',
  'occasions',
];

const LOCAL_LANDING_SLUGS = [
  'fleuriste-dakar',
  'fleuriste-saly',
  'fleuriste-somone',
  'fleuriste-mbour',
];

export default function sitemap(): MetadataRoute.Sitemap {
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
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
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
  const blogRoutes: MetadataRoute.Sitemap = adminBlogArticles
    .filter((article) => article.status === 'publie')
    .map((article) => ({
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

