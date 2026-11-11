import type { Metadata } from 'next';
import { SITE_CONFIG, SITE_URL } from './config';

export interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
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
    : `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline} | Fleuriste à Saly & Dakar`;

  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`
    : undefined;

  const defaultKeywords = [
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'fleuriste à Saly',
    'fleuriste saly',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
    'fleuriste dakar',
    'livraison fleurs dakar',
    'livraison fleurs saly',
    'bouquet de roses senegal',
    'decoration mariage senegal',
    'decoration florale dakar',
    'paysagiste dakar',
    'fleurs fraîches senegal',
    'paniers de fruits saly',
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
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
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

