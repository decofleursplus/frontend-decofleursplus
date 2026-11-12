import { SITE_CONFIG, SITE_URL } from './config';
import type { Product } from '@/lib/products';
import type { BlogArticle } from '@/lib/admin/mock-data/types';

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_CONFIG.legalName,
    alternateName: SITE_CONFIG.alternateNames,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo_decofleur.png`,
      caption: SITE_CONFIG.name,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.phoneDakar,
        contactType: 'customer service',
        areaServed: 'SN',
        availableLanguage: ['French', 'Wolof', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.phoneSaly,
        contactType: 'sales',
        areaServed: 'SN',
        availableLanguage: ['French', 'Wolof', 'English'],
      },
    ],
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.tiktok,
      SITE_CONFIG.social.whatsapp,
    ],
  };
}

export function getFloristSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Florist', 'HomeGoodsStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#florist`,
    name: `${SITE_CONFIG.name} | Fleuriste & Magasin de Décoration`,
    alternateName: SITE_CONFIG.alternateNames,
    description: SITE_CONFIG.description,
    url: SITE_URL,
    telephone: SITE_CONFIG.phoneSaly,
    email: SITE_CONFIG.email,
    priceRange: SITE_CONFIG.priceRange,
    image: `${SITE_URL}/images/hero.jpg`,
    logo: `${SITE_URL}/logo_decofleur.png`,
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    openingHoursSpecification: SITE_CONFIG.openingHoursSpecification.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    areaServed: SITE_CONFIG.serviceAreas.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area.name,
    })),
    paymentAccepted: 'Cash, Wave, Orange Money, Visa, Mastercard',
    currenciesAccepted: SITE_CONFIG.currency,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catalogue DécoFleur Plus',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Bouquets & Fleurs fraîches',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Magasin de décoration, vases d’art, bougies & art de la table',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Décoration événementielle & Mariages à Saly et Dakar',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Paysagisme & Espaces verts',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Location de matériel et mobilier événementiel',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Abonnements floraux pour villas et entreprises',
        },
      ],
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };
}

export function getProductSchema(product: Product) {
  const images = (product.images && product.images.length > 0 ? product.images : [product.image]).map(
    (img) => (img.startsWith('http') ? img : `${SITE_URL}${img.startsWith('/') ? '' : '/'}${img}`)
  );

  const productUrl = `${SITE_URL}/produits/${product.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: images,
    category: product.category,
    sku: product.reference || product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: SITE_CONFIG.currency,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
      seller: {
        '@id': `${SITE_URL}/#florist`,
      },
    },
  };

  if (product.reviews && product.reviews > 0 && product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function getArticleSchema(article: BlogArticle) {
  const articleUrl = `${SITE_URL}/blog/${article.slug}`;
  const coverImage = article.coverImage.startsWith('http')
    ? article.coverImage
    : `${SITE_URL}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${articleUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: [coverImage],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    articleSection: article.categoryName,
    keywords: (article.tags || []).join(', '),
    inLanguage: 'fr-SN',
  };
}

export function getServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  image?: string;
  areaServed?: string[];
}) {
  const serviceUrl = service.url.startsWith('http')
    ? service.url
    : `${SITE_URL}${service.url.startsWith('/') ? '' : '/'}${service.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${serviceUrl}#service`,
    name: service.name,
    description: service.description,
    url: serviceUrl,
    provider: {
      '@id': `${SITE_URL}/#florist`,
    },
    areaServed: (service.areaServed || ['Saly Portudal', 'Dakar', 'Somone', 'Mbour']).map(
      (area) => ({
        '@type': 'AdministrativeArea',
        name: area,
      })
    ),
    ...(service.image && {
      image: service.image.startsWith('http')
        ? service.image
        : `${SITE_URL}${service.image.startsWith('/') ? '' : '/'}${service.image}`,
    }),
  };
}

export function getLocalLandingSchema(options: {
  city: string;
  pageUrl: string;
  description: string;
  deliveryTime: string;
  isPhysicalStore?: boolean;
}) {
  const pageUrl = options.pageUrl.startsWith('http')
    ? options.pageUrl
    : `${SITE_URL}${options.pageUrl.startsWith('/') ? '' : '/'}${options.pageUrl}`;

  const isSaly = options.city.toLowerCase().includes('saly');

  return {
    '@context': 'https://schema.org',
    '@type': isSaly ? ['Florist', 'HomeGoodsStore', 'LocalBusiness'] : ['Florist', 'LocalBusiness'],
    '@id': `${pageUrl}#localbusiness`,
    name: isSaly
      ? `Décofleur Plus | Fleuriste & Magasin de Décoration à Saly Portudal`
      : `Décofleur Plus | Fleuriste ${options.city}`,
    alternateName: isSaly ? SITE_CONFIG.alternateNames : undefined,
    description: options.description,
    url: pageUrl,
    telephone: options.city === 'Dakar' ? SITE_CONFIG.phoneDakar : SITE_CONFIG.phoneSaly,
    priceRange: SITE_CONFIG.priceRange,
    address: options.isPhysicalStore
      ? {
          '@type': 'PostalAddress',
          streetAddress: SITE_CONFIG.address.streetAddress,
          addressLocality: SITE_CONFIG.address.addressLocality,
          addressRegion: SITE_CONFIG.address.addressRegion,
          postalCode: SITE_CONFIG.address.postalCode,
          addressCountry: SITE_CONFIG.address.addressCountry,
        }
      : {
          '@type': 'PostalAddress',
          addressLocality: options.city,
          addressCountry: 'SN',
        },
    ...(options.isPhysicalStore && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: SITE_CONFIG.geo.latitude,
        longitude: SITE_CONFIG.geo.longitude,
      },
      openingHoursSpecification: SITE_CONFIG.openingHoursSpecification.map((spec) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: spec.dayOfWeek,
        opens: spec.opens,
        closes: spec.closes,
      })),
    }),
    areaServed: {
      '@type': 'AdministrativeArea',
      name: options.city,
    },
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

