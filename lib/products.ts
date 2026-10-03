export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: 'bouquet-elegance-rose', slug: 'bouquet-elegance-rose', name: 'Bouquet Élégance Rose',
    category: 'Bouquets', price: 25000, image: '/images/bouquet-detail.webp', rating: 4.9, reviews: 120,
    badge: 'Nouveau', inStock: true, description: 'Un bouquet raffiné composé de roses fraîches dans des tons roses et blancs, parfait pour exprimer vos sentiments avec élégance. Idéal pour un anniversaire, une déclaration ou tout simplement pour faire plaisir.',
  },
  {
    id: 'bouquet-blanc-elegance', slug: 'bouquet-blanc-elegance', name: 'Bouquet Blanc Élégance',
    category: 'Bouquets', price: 28000, image: '/images/bouquet-blanc.webp', rating: 4.8, reviews: 90, inStock: true,
    description: 'Un bouquet lumineux aux fleurs blanches et crème, assemblé à la main par nos fleuristes à Dakar.',
  },
  {
    id: 'bouquet-soleil', slug: 'bouquet-soleil', name: 'Bouquet Soleil',
    category: 'Bouquets', price: 22000, image: '/images/bouquet-soleil.webp', rating: 4.7, reviews: 76, inStock: true,
    description: 'Des tournesols éclatants pour apporter une touche de lumière et de bonne humeur à chaque occasion.',
  },
  {
    id: 'orchidee-phalaenopsis', slug: 'orchidee-phalaenopsis', name: 'Orchidée Phalaenopsis',
    category: 'Plantes', price: 30000, image: '/images/orchidee.webp', rating: 4.8, reviews: 64, inStock: true,
    description: 'Une orchidée Phalaenopsis élégante en pot, idéale pour décorer une maison ou un bureau.',
  },
  {
    id: 'panier-fruits-tropicaux', slug: 'panier-fruits-tropicaux', name: 'Panier de fruits tropicaux',
    category: 'Paniers de fruits', price: 18000, image: '/images/fruits.webp', rating: 4.6, reviews: 43,
    badge: 'Nouveau', inStock: true, description: 'Un panier gourmand de fruits de saison sélectionnés avec soin.',
  },
  {
    id: 'centre-table-mariage', slug: 'centre-table-mariage', name: 'Centre de table mariage',
    category: 'Mariages', price: 35000, image: '/images/mariage.webp', rating: 4.9, reviews: 52, inStock: true,
    description: 'Une composition florale pensée pour habiller vos tables et accompagner vos plus beaux moments.',
  },
  {
    id: 'coffret-cadeau-luxe', slug: 'coffret-cadeau-luxe', name: 'Coffret cadeau luxe',
    category: 'Cadeaux', price: 22000, image: '/images/cadeau.webp', rating: 4.8, reviews: 84,
    badge: '-15%', inStock: true, description: 'Un coffret élégant à offrir, accompagné d’une composition florale délicate.',
  },
  {
    id: 'plante-monstera', slug: 'plante-monstera', name: 'Plante Monstera',
    category: 'Plantes', price: 18000, image: '/images/plante.webp', rating: 4.7, reviews: 32,
    badge: 'Nouveau', inStock: true, description: 'Une plante Monstera au feuillage généreux, parfaite pour votre intérieur.',
  },
];

export const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
