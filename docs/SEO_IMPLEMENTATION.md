# Guide Technique d'Implémentation SEO — Next.js 16

## 1. Vue d'Ensemble de l'Infrastructure Technique

L'infrastructure SEO de Décofleur Plus est bâtie nativement sur **Next.js 16.3.8 (App Router)** et **React 19.3.0**, en exploitant les capacités du moteur Turbopack, le typage strict TypeScript et les standards du Web moderne.

### 1.1 Fichiers et Modules Déployés

```
├── lib/
│   └── seo/
│       ├── config.ts         # Configuration maîtresse, coordonnées GPS, constantes globales
│       ├── metadata.ts       # Constructeur universel de Metadata Next.js 16
│       └── schema.ts         # Générateurs de données structurées Schema.org (JSON-LD)
├── components/
│   ├── seo/
│   │   ├── json-ld.tsx       # Injecteur sécurisé de balises <script type="application/ld+json">
│   │   └── breadcrumbs.tsx   # Composant UI Fil d'Ariane sémantique avec balisage BreadcrumbList
│   └── blog/
│       ├── blog-explorer.tsx # Îlot client pour la recherche et le filtrage des articles
│       └── article-interactions.tsx # Îlot client pour les likes et le partage social
├── app/
│   ├── layout.tsx            # MetadataBase, title template, balises globales et schémas maîtres
│   ├── robots.ts             # Générateur dynamique de robots.txt
│   ├── sitemap.ts            # Générateur dynamique du sitemap.xml complet (107+ routes)
│   ├── [slug]/page.tsx       # Router catch-up gérant les 301 des catégories et les pages institutionnelles
│   ├── produits/[slug]/      # Page produit dynamique SSR avec Product Schema et AggregateRating
│   ├── categories/[slug]/    # Page catégorie canonique avec CollectionPage Schema
│   ├── blog/                 # Hub Blog Server Component (SSR)
│   ├── blog/[slug]/          # Page article Server Component (SSR) avec BlogPosting Schema
│   ├── fleuriste-dakar/      # Landing page locale Dakar
│   ├── fleuriste-saly/       # Landing page locale Saly Portudal
│   ├── fleuriste-somone/     # Landing page locale Somone
│   ├── fleuriste-mbour/      # Landing page locale Mbour
│   ├── paysagisme/           # Section paysagisme avec Service Schema
│   ├── location/             # Section location de matériel avec OfferCatalog Schema
│   ├── abonnements/          # Service d'abonnements floraux
│   └── devis/                # Formulaire de demande de devis sur-mesure
```

---

## 2. Configuration Maîtresse et Utilitaires (`lib/seo/`)

### 2.1 `lib/seo/config.ts`
Ce fichier centralise la source de vérité pour toutes les données d'identification de l'entreprise :
- **Domaine officiel** : `https://decofleurplus.com` (avec fallback sur `NEXT_PUBLIC_SITE_URL` ou `http://localhost:3000`).
- **Coordonnées GPS réelles** : Latitude `14.4431`, Longitude `-17.0272` (Saly Portudal).
- **Téléphones officiels** : `+221 33 957 88 99` (fixe boutique) et `+221 77 941 78 60` (service client / WhatsApp).
- **Adresses et zones desservies** :
  ```typescript
  export const SEO_CONFIG = {
    siteName: 'Décofleur Plus',
    defaultTitle: 'Décofleur Plus | Fleuriste d'Exception, Événements & Paysagisme au Sénégal',
    defaultDescription: 'Fleuriste d'exception à Saly Portudal, Somone, Mbour et livraison de fleurs fraîches à Dakar. Décoration florale de mariage, paysagisme de villas et location de matériel événementiel au Sénégal.',
    canonicalDomain: 'https://decofleurplus.com',
    locale: 'fr_SN',
    address: {
      streetAddress: 'Rue des Palmiers',
      addressLocality: 'Saly Portudal',
      addressRegion: 'Thiès / Petite-Côte',
      postalCode: '23000',
      addressCountry: 'SN',
    },
    geo: {
      latitude: 14.4431,
      longitude: -17.0272,
    },
    // ...
  };
  ```

### 2.2 `lib/seo/metadata.ts`
Fournit la fonction utilitaire universelle `constructMetadata()` qui standardise les balises `<head>` pour l'ensemble des pages :
- Résolution stricte de l'URL canonique (sans paramètres de pagination ou de tri).
- Balises Open Graph complètes (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale = 'fr_SN'`, `og:type`, `og:image`).
- Balises Twitter Card complètes (`twitter:card = 'summary_large_image'`).
- Directives d'indexation robots (`index: true, follow: true` par défaut, ou `noindex, nofollow` pour les zones sécurisées).

### 2.3 `lib/seo/schema.ts`
Génère les objets Schema.org conformes aux spécifications JSON-LD du W3C et aux préconisations Google Search Central :
- `generateOrganizationSchema()` : Identité légale, logo, numéros de téléphone et réseaux sociaux.
- `generateFloristSchema()` : Établissement local physique à Saly avec horaires d'ouverture (08:30 - 19:30), devise acceptée (XOF) et zones desservies.
- `generateLocalBusinessSchema(options)` : Permet de qualifier les services dédiés sur les zones satellites (Dakar, Somone, Mbour).
- `generateBreadcrumbSchema(items)` : Liste ordonnée d'étapes hiérarchiques avec URLs absolues.
- `generateProductSchema(options)` : Données produit avec offre de prix en FCFA (`currency: "XOF"`), disponibilité (`InStock` ou `OutOfStock`), et intégration de `AggregateRating` conditionnée strictement à l'existence d'avis réels vérifiés.
- `generateArticleSchema(options)` : Balisage d'article de blog (`BlogPosting`) avec auteur, date de publication, date de modification et image principale.
- `generateServiceSchema(options)` : Balisage pour les prestations paysagères et la décoration événementielle.
- `generateOfferCatalogSchema(options)` : Balisage de catalogue d'articles pour la location de matériel.

---

## 3. Configuration Racine et Balises Globales (`app/layout.tsx`)

Dans `app/layout.tsx`, l'exportation des métadonnées de base configure le socle de l'ensemble de l'application :

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.canonicalDomain),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: '%s | Décofleur Plus',
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: [...SEO_CONFIG.keywords],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.canonicalDomain,
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

Dans le corps du document (`<body>`), les données structurées globales de l'organisation et de la boutique physique sont injectées de manière permanente via `<JsonLd>` :
```tsx
<JsonLd data={generateOrganizationSchema()} />
<JsonLd data={generateFloristSchema()} />
```

---

## 4. Exploration & Indexation Dynamiques (`robots.ts` & `sitemap.ts`)

### 4.1 Fichier `app/robots.ts`
Généré dynamiquement par Next.js à l'adresse `/robots.txt` :
```typescript
import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/compte/',
          '/commande/',
          '/panier/',
          '/api/',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/products/', '/blog/', '/*.png', '/*.jpg', '/*.webp'],
        disallow: ['/admin/'],
      },
    ],
    sitemap: `${SEO_CONFIG.canonicalDomain}/sitemap.xml`,
    host: SEO_CONFIG.canonicalDomain,
  };
}
```

### 4.2 Fichier `app/sitemap.ts`
Généré dynamiquement par Next.js à l'adresse `/sitemap.xml`. Il indexe l'ensemble des 107+ URLs actives du site :
1. **Pages Racine & Pôles Principaux** : `/`, `/boutique`, `/blog`, `/paysagisme`, `/location`, `/abonnements`, `/devis`.
2. **Pages Locales Stratégiques** : `/fleuriste-dakar`, `/fleuriste-saly`, `/fleuriste-somone`, `/fleuriste-mbour`.
3. **Rayons & Catégories E-Commerce** (12 catégories actives) : `/categories/bouquets`, `/categories/roses`, etc.
4. **Fiches Produits Actives** : L'intégralité du catalogue disponible en ligne.
5. **Articles de Blog Publiés** : Tous les guides et tutoriels éditoriaux.
6. **Pages Institutionnelles & Services** : `/a-propos`, `/contact`, `/livraison`, `/conditions`, etc.

Chaque entrée précise sa `lastModified`, sa `changeFrequency` (`daily`, `weekly`, `monthly`) et sa `priority` (de `1.0` pour l'accueil à `0.3` pour les mentions légales).

---

## 5. SEO E-Commerce & Fiches Produits (`app/produits/[slug]/`)

### 5.1 Génération Dynamique des Métadonnées
Dans `app/produits/[slug]/page.tsx` :
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return constructMetadata({
      title: 'Produit non trouvé',
      noIndex: true,
    });
  }

  const priceFormatted = product.price ? `${product.price.toLocaleString('fr-FR')} FCFA` : '';
  const title = `${product.name} ${priceFormatted ? `- ${priceFormatted} ` : ''}| Fleuriste Sénégal`;
  const description = product.description || `Commandez votre ${product.name} en ligne chez Décofleur Plus. Fleurs fraîches et livraison à Saly, Dakar et Petite-Côte.`;

  return constructMetadata({
    title,
    description,
    path: `/produits/${slug}`,
    image: product.image,
  });
}
```

### 5.2 Données Structurées Produit & Avis
Le composant injecte le schéma complet avec vérification stricte de la conformité :
- Le prix affiché correspond au centime près au prix du schéma JSON-LD.
- La disponibilité reflète l'état réel de l'inventaire (`InStock` ou `OutOfStock`).
- Le bloc `AggregateRating` n'est généré **que si le produit compte au moins 1 avis réel** (`reviewsCount > 0`), éliminant tout risque de pénalité manuelle Google pour données structurées trompeuses.
- Les données structurées `BreadcrumbList` reflètent la position exacte dans le catalogue : `Accueil > Boutique > [Catégorie] > [Produit]`.

---

## 6. Architecture Canonique des Catégories & Redirections 301

### 6.1 Standardisation sur `/categories/[slug]`
Toutes les pages de rayon du catalogue sont désormais normalisées sous l'URL `/categories/[slug]`.

### 6.2 Redirection Permanente des Anciennes URLs Courtes (`app/[slug]/page.tsx`)
Pour préserver le jus de lien et ne casser aucun marque-page ou lien externe, le routeur racine intercepte les anciens slugs de catégories (`/bouquets`, `/roses`, `/plantes`, etc.) et exécute une redirection permanente HTTP 301 native :

```typescript
import { permanentRedirect } from 'next/navigation';

const CATEGORY_SLUGS = [
  'bouquets', 'roses', 'plantes', 'paniers-fruits',
  'cadeaux', 'mariage', 'anniversaire', 'deuil',
  'orchidées', 'fleurs-sechees', 'bougies', 'vases'
];

export default async function DynamicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (CATEGORY_SLUGS.includes(slug)) {
    permanentRedirect(`/categories/${slug}`);
  }
  
  // Rendu des pages statiques institutionnelles (a-propos, contact, etc.)
  // ...
}
```

---

## 7. Refonte Éditoriale en Server Components (`app/blog/`)

Pour maximiser l'exploration des articles par Googlebot, le blog a été entièrement découplé entre le rendu serveur des contenus et des îlots d'interactivité client légers.

### 7.1 Page d'Index du Blog (`app/blog/page.tsx`)
- Composant Server Component natif (aucun `'use client'`).
- Pré-génération complète du HTML pour tous les articles récents.
- Intégration du schéma Schema.org `Blog`.
- Délégation de la recherche en direct et du filtrage par catégorie au composant client `<BlogExplorer />`.

### 7.2 Page d'Article Individuel (`app/blog/[slug]/page.tsx`)
- Server Component générant le texte intégral de l'article dans le DOM initial.
- Exportation de `generateStaticParams()` pour la précompilation SSG de tous les articles au build.
- Exportation de `generateMetadata()` avec `publishedTime`, `modifiedTime`, auteurs et image OpenGraph haute résolution.
- Injection du schéma `BlogPosting` avec `author`, `publisher`, `datePublished` et `dateModified`.
- Délégation des boutons de like et de partage WhatsApp/Facebook au composant client interactif `<ArticleInteractions />`.

---

## 8. Pages Locales Dédiées (`app/fleuriste-[ville]/`)

Quatre pages autonomes apportent une valeur contextuelle authentique et évitent le duplicate content :

1. **`/fleuriste-dakar`** :
   - Mise en avant de la navette frigorifique quotidienne.
   - Détail des quartiers livrés à Dakar (Almadies, Plateau, Fann, Yoff, etc.).
   - FAQ locale répondant aux questions de délais et de fraîcheur.
   - Données structurées `LocalBusiness` avec zone de desserte Dakar.

2. **`/fleuriste-saly`** :
   - Présentation de la boutique physique, de l'atelier floral et des horaires 7j/7.
   - Livraison express 2h chrono sur Saly et Ngaparou.
   - Formules d'abonnements pour villas et résidences de vacances.
   - Données structurées `Florist` complètes avec adresse exacte et coordonnées GPS.

3. **`/fleuriste-somone`** :
   - Focus sur les réceptions de bord de mer et les mariages sur la plage.
   - Livraison rapide pour les villas bordant la lagune de la Somone.
   - Sélection florale adaptée aux embruns marins.

4. **`/fleuriste-mbour`** :
   - Mise en avant des paniers de fruits frais et compositions pour fêtes familiales.
   - Service de livraison pour le cœur économique et administratif de la Petite-Côte.

---

## 9. Automatisation SEO Côté Serveur (Sans Surcharge Back-Office)

Afin de préserver la simplicité d'utilisation du back-office pour les équipes opérationnelles, l'ensemble du référencement est **automatisé nativement côté serveur** via Next.js 16 et les variables d'environnement (`.env.local`) :
- **Génération dynamique des métadonnées** : Les balises title, meta description et images OpenGraph sont calculées en temps réel à partir des fiches produits, catégories et articles de blog.
- **Sitemap XML automatique** : Toute nouvelle entité publiée apparaît automatiquement dans `/sitemap.xml`.
- **Intégrations Google légères** : Les identifiants de suivi (Search Console, GA4) sont injectés directement via les variables d'environnement (`NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`), sans encombrer les formulaires de gestion boutique.

