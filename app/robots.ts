import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/compte',
          '/compte/*',
          '/commande',
          '/commande/*',
          '/panier',
          '/connexion',
          '/inscription',
          '/mot-de-passe-oublie',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

