/**
 * Types produit de la vitrine (issus de l'API publique /products).
 * Aucun catalogue n'est défini en dur : les produits viennent toujours du backend.
 */

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'ON_QUOTE' | 'PROMO';

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  /** Prix de vente effectif (promotion en cours incluse) */
  price: number;
  /** Prix barré, s'il y en a un */
  oldPrice: number | null;
  stockQuantity: number;
};

export type ProductPromotion = {
  id: string;
  name: string;
  badgeText: string | null;
  discountPercentage: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Nom de la catégorie */
  category: string;
  categorySlug: string | null;
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
  reference?: string;
  status: ProductStatus;
  isNew: boolean;
  promotion: ProductPromotion | null;
  variants: ProductVariant[];
};

export const PRODUCT_PLACEHOLDER_IMAGE = '/images/hero.jpg';

export const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;

/** Produit vendu uniquement sur devis : il ne peut pas être ajouté au panier. */
export const isQuoteOnly = (product: Pick<Product, 'status'>) => product.status === 'ON_QUOTE';

/** Première variante disponible (ou la première tout court si tout est épuisé). */
export function defaultVariant(product: Pick<Product, 'variants'>): ProductVariant | null {
  return product.variants.find((v) => v.stockQuantity > 0) ?? product.variants[0] ?? null;
}
