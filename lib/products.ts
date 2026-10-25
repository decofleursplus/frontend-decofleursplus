export type ProductSize = {
  name: string;
  label: string;
  priceDelta: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  badgeType?: 'discount' | 'new';
  description: string;
  inStock: boolean;
  dimensions?: string;
  reference?: string;
  sizes?: ProductSize[];
};

export const products: Product[] = [
  {
    id: 'bouquet-elegance-rose',
    slug: 'bouquet-elegance-rose',
    name: 'Bouquet Élégance Rose',
    category: 'Bouquets',
    price: 25000,
    oldPrice: 27500,
    image: '/images/product-rose-elegance.jpg',
    images: ['/images/product-rose-elegance.jpg', '/images/bouquet-detail.jpg', '/images/bouquet-blanc.jpg'],
    rating: 4.9,
    reviews: 124,
    badge: '-10%',
    badgeType: 'discount',
    inStock: true,
    dimensions: 'Hauteur 45 cm · Diamètre 35 cm',
    reference: 'DEC-BOUQ-001',
    description: 'Un bouquet raffiné composé de roses fraîches sélectionnées dans des tons doux roses et crème, délicatement assemblé avec du feuillage d’eucalyptus par nos maîtres fleuristes à Saly Portudal. Idéal pour une déclaration, un anniversaire ou un geste attentionné.',
    sizes: [
      { name: 'Petit', label: 'Petit (25 tiges)', priceDelta: -5000 },
      { name: 'Moyen', label: 'Moyen (35 tiges) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Grand (50 tiges)', priceDelta: 10000 },
    ],
  },
  {
    id: 'panier-fruits-tropicaux',
    slug: 'panier-fruits-tropicaux',
    name: 'Panier de fruits tropicaux',
    category: 'Paniers de fruits',
    price: 18000,
    image: '/images/product-fruit-tropical.jpg',
    images: ['/images/product-fruit-tropical.jpg', '/images/cadeau.jpg'],
    rating: 4.8,
    reviews: 98,
    badge: 'Nouveau',
    badgeType: 'new',
    inStock: true,
    dimensions: 'Panier artisanal en osier 40 cm',
    reference: 'DEC-FRU-002',
    description: 'Une corbeille généreuse et gorgée de soleil garnie de fruits frais locaux et de saison : mangues du Sénégal, papayes parfumées, ananas Victoria, fruits de la passion et agrumes. Présentation soignée avec ruban satiné.',
    sizes: [
      { name: 'Petit', label: 'Duo Gourmand (~3 kg)', priceDelta: -4000 },
      { name: 'Moyen', label: 'Familial (~5 kg) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Prestige Réception (~8 kg)', priceDelta: 8000 },
    ],
  },
  {
    id: 'centre-table-mariage',
    slug: 'centre-table-mariage',
    name: 'Centre de table mariage',
    category: 'Mariages',
    price: 35000,
    oldPrice: 41000,
    image: '/images/product-table-wedding.jpg',
    images: ['/images/product-table-wedding.jpg', '/images/bouquet-blanc.jpg', '/images/bouquet-detail.jpg'],
    rating: 4.7,
    reviews: 86,
    badge: '-15%',
    badgeType: 'discount',
    inStock: true,
    dimensions: 'Longueur 60 cm · Hauteur 25 cm',
    reference: 'DEC-MAR-003',
    description: 'Création florale haut de gamme pour tables de banquet, mariages et réceptions prestigieuses. Mariage délicat de roses pâles, lys royaux, orchidées et feuillages d’ornement. Conçu pour résister à la fraîcheur tout au long de votre soirée.',
    sizes: [
      { name: 'Moyen', label: 'Table ronde (6-8 pers) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Table d’honneur (10-12 pers)', priceDelta: 15000 },
    ],
  },
  {
    id: 'coffret-cadeau-luxe',
    slug: 'coffret-cadeau-luxe',
    name: 'Coffret cadeau luxe',
    category: 'Cadeaux',
    price: 22000,
    image: '/images/product-gift-luxe.jpg',
    images: ['/images/product-gift-luxe.jpg', '/images/bouquet-passion.jpg'],
    rating: 4.8,
    reviews: 63,
    badge: 'Nouveau',
    badgeType: 'new',
    inStock: true,
    dimensions: 'Coffret rigide luxe 28 x 20 x 12 cm',
    reference: 'DEC-CAD-004',
    description: 'Un ensemble prestigieux associant une composition florale raffinée sous cloche ou dans un écrin velours, accompagné d’une bougie artisanale parfumée et d’une carte personnalisée calligraphiée.',
    sizes: [
      { name: 'Standard', label: 'Coffret Écrin Découverte', priceDelta: 0 },
      { name: 'Prestige', label: 'Coffret Impérial avec Bougies & Douceurs', priceDelta: 12000 },
    ],
  },
  {
    id: 'bouquet-blanc-elegance',
    slug: 'bouquet-blanc-elegance',
    name: 'Bouquet Blanc Élégance',
    category: 'Bouquets',
    price: 28000,
    image: '/images/bouquet-blanc.jpg',
    images: ['/images/bouquet-blanc.jpg', '/images/bouquet-detail.jpg'],
    rating: 4.8,
    reviews: 90,
    inStock: true,
    dimensions: 'Hauteur 50 cm · Diamètre 38 cm',
    reference: 'DEC-BOUQ-005',
    description: 'Une harmonie parfaite de fleurs blanches immaculées : lys orientaux, roses avalanche et gypsophile vaporeux. Une pureté intemporelle pour féliciter, remercier ou apporter la paix.',
    sizes: [
      { name: 'Petit', label: 'Épure (20 tiges)', priceDelta: -5000 },
      { name: 'Moyen', label: 'Majestueux (30 tiges) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Somptueux (45 tiges)', priceDelta: 12000 },
    ],
  },
  {
    id: 'bouquet-soleil',
    slug: 'bouquet-soleil',
    name: 'Bouquet Soleil',
    category: 'Bouquets',
    price: 22000,
    image: '/images/bouquet-soleil.jpg',
    images: ['/images/bouquet-soleil.jpg', '/images/bouquet-passion.jpg'],
    rating: 4.7,
    reviews: 76,
    inStock: true,
    dimensions: 'Hauteur 42 cm · Diamètre 32 cm',
    reference: 'DEC-BOUQ-006',
    description: 'Un concentré d’énergie et de lumière avec ses tournesols éclatants, ses germinis dorés et ses touches de verdure fraîche. Le cadeau idéal pour illuminer la journée d’un proche.',
    sizes: [
      { name: 'Petit', label: 'Rayon de soleil (15 tiges)', priceDelta: -4000 },
      { name: 'Moyen', label: 'Plein soleil (25 tiges) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Grand éclat (35 tiges)', priceDelta: 8000 },
    ],
  },
  {
    id: 'orchidee-phalaenopsis',
    slug: 'orchidee-phalaenopsis',
    name: 'Orchidée Phalaenopsis',
    category: 'Plantes',
    price: 30000,
    image: '/images/orchidee.jpg',
    images: ['/images/orchidee.jpg', '/images/plante-monstera.jpg'],
    rating: 4.8,
    reviews: 64,
    inStock: true,
    dimensions: 'Hauteur 65 cm · Pot céramique Ø 15 cm',
    reference: 'DEC-PLT-007',
    description: 'Une somptueuse orchidée Phalaenopsis double hampe florale dans son cache-pot en céramique artisanale. Plante durable, facile d’entretien, qui embellira tout intérieur ou bureau avec distinction.',
    sizes: [
      { name: 'Moyen', label: 'Double hampe florale - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Triple hampe florale Prestige', priceDelta: 10000 },
    ],
  },
  {
    id: 'plante-monstera',
    slug: 'plante-monstera',
    name: 'Plante Monstera Deliciosa',
    category: 'Plantes',
    price: 18000,
    image: '/images/plante-monstera.jpg',
    images: ['/images/plante-monstera.jpg', '/images/plante.jpg'],
    rating: 4.7,
    reviews: 32,
    badge: 'Nouveau',
    badgeType: 'new',
    inStock: true,
    dimensions: 'Hauteur 55 cm · Pot Ø 18 cm',
    reference: 'DEC-PLT-008',
    description: 'Monstera Deliciosa au feuillage graphique et généreux. Plante dépolluante et tropicale, parfaite pour créer une atmosphère luxuriante et apaisante à la maison ou au travail.',
    sizes: [
      { name: 'Moyen', label: 'Taille Salon (55 cm) - Standard', priceDelta: 0 },
      { name: 'Grand', label: 'Grand format (85 cm)', priceDelta: 8000 },
    ],
  },
];

export const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
