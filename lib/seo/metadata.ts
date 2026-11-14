import type { Metadata } from 'next';
import { SITE_CONFIG, SITE_URL } from './config';

export interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  canonical?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.defaultOgImage,
  images,
  canonical,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  keywords = [],
}: MetadataOptions = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} · ${SITE_CONFIG.tagline} | Fleuriste & Décoration à Saly & Dakar`;

  const imageList = images && images.length > 0 ? images : [image];
  const ogImages = imageList.map((img) => {
    const absUrl = img.startsWith('http')
      ? img
      : `${SITE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
    return {
      url: absUrl,
      width: 1200,
      height: 630,
      alt: title || SITE_CONFIG.name,
    };
  });

  const absoluteImageUrl = ogImages[0].url;

  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`
    : undefined;

  const defaultKeywords = [
    // Marque & Variantes
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'Decofleurs Plus',
    'Deco Fleurs Saly',
    // Fleuriste local
    'fleuriste à Saly',
    'fleuriste saly',
    'fleuriste saly portudal',
    'fleuriste dakar',
    'fleuriste somone',
    'fleuriste mbour',
    'fleuriste petite cote',
    'livraison fleurs dakar',
    'livraison fleurs saly',
    'livraison fleurs senegal',
    // Décoration & Magasin
    'decoration',
    'decoration mariage',
    'decoration mariage senegal',
    'decoration mariage saly',
    'decoration florale',
    'decoration florale dakar',
    'decoration florale saly',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
    'decorateur floral',
    'scenographie florale',
    'arche florale mariage',
    'centre de table floral',
    'vases design',
    'decoration interieur villa saly',
    'bougies et senteurs',
    // Wedding Planner & Événements
    'wedding planner',
    'wedding planner senegal',
    'wedding planner dakar',
    'wedding planner saly',
    'organisateur de mariage senegal',
    'fleuriste evenementiel senegal',
    'location materiel evenementiel',
    'location mobilier mariage',
    'location chaises chiavari saly',
    'reception mariage saly',
    // Bouquets & Fleurs
    'bouquets',
    'bouquet de fleurs',
    'bouquet de fleurs dakar',
    'bouquet de fleurs saly',
    'bouquets de roses senegal',
    'bouquet de mariee dakar',
    'roses rouges saint valentin',
    'fleurs fraîches senegal',
    'composition florale deuil',
    'paniers de fruits saly',
    'coffrets cadeaux senegal',
    'paysagiste dakar',
    'paysagiste saly',
    'plantes interieur dakar',
  ];

  const mergedKeywords = Array.from(new Set([...defaultKeywords, ...keywords]));

  return {
    title: fullTitle,
    description,
    keywords: mergedKeywords,
    authors: authors ? authors.map((name) => ({ name })) : [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.legalName,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      locale: 'fr_SN',
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: ogImages,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
      creator: '@decofleurplus',
    },
  };
}

