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

export const products: Product[] = [];

export const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
