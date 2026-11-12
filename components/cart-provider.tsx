'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/products';
import { useAuth } from '@/components/auth-provider';
import { clearMyCart, saveMyCart } from '@/lib/api/orders';

/** Ligne de panier : une variante précise d'un produit, avec ses options cadeau. */
export type CartLine = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  variantId: string;
  variantName: string;
  /** Prix unitaire connu au moment de l'ajout (indicatif : le serveur recalcule tout au panier) */
  unitPrice: number;
  quantity: number;
  /** Stock connu au moment de l'ajout, pour plafonner la quantité */
  maxQuantity: number;
  giftWrap: boolean;
  cardMessage: string;
};

/** Produit enregistré en favori (instantané pour l'afficher sans recharger le catalogue). */
export type FavoriteItem = Pick<Product, 'id' | 'slug' | 'name' | 'image' | 'price' | 'oldPrice' | 'category'>;

export type CartOptions = { giftWrap?: boolean; cardMessage?: string };

type CartContextValue = {
  items: CartLine[];
  /** Nombre d'articles */
  count: number;
  /** Lignes d'un ancien panier retirées faute de variante identifiable */
  droppedLegacyLines: number;
  acknowledgeDroppedLines: () => void;
  add: (product: Product, variant: ProductVariant, quantity?: number, options?: CartOptions) => void;
  change: (lineId: string, quantity: number) => void;
  updateOptions: (lineId: string, options: CartOptions) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  /** Remplace le panier (ex. reprise d'une commande annulée) */
  replace: (lines: CartLine[]) => void;
  favorites: string[];
  favoriteItems: FavoriteItem[];
  toggleFavorite: (product: FavoriteItem) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'decofleur-cart-v2';
const LEGACY_CART_KEY = 'decofleur-cart-v1';
const FAVORITES_KEY = 'decofleur-favorites-v2';
const LEGACY_FAVORITES_KEY = 'decofleur-favorites-v1';

export const buildLineId = (variantId: string, options: CartOptions = {}) =>
  [variantId, options.giftWrap ? 'emballage' : 'sans-emballage', (options.cardMessage ?? '').trim()].join('|');

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function isValidLine(line: unknown): line is CartLine {
  const l = line as Partial<CartLine> | null;
  return Boolean(l && typeof l.variantId === 'string' && l.variantId && typeof l.quantity === 'number' && l.quantity > 0);
}

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [droppedLegacyLines, setDroppedLegacyLines] = useState(0);
  const [ready, setReady] = useState(false);

  // Réhydratation depuis le navigateur (+ migration de l'ancien format sans variante)
  useEffect(() => {
    const stored = readJson<unknown[]>(CART_KEY);
    const valid = Array.isArray(stored) ? stored.filter(isValidLine) : [];
    const legacy = readJson<unknown[]>(LEGACY_CART_KEY);
    try {
      window.localStorage.removeItem(LEGACY_CART_KEY);
      window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
    } catch {
      // stockage indisponible
    }
    const favs = readJson<FavoriteItem[]>(FAVORITES_KEY);
    /* eslint-disable react-hooks/set-state-in-effect -- lecture unique du stockage navigateur après le rendu serveur */
    setItems(valid);
    if (Array.isArray(legacy) && legacy.length > 0) setDroppedLegacyLines(legacy.length);
    if (Array.isArray(favs)) setFavoriteItems(favs.filter((f) => f && typeof f.id === 'string'));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteItems));
    } catch {
      // quota atteint ou navigation privée : le panier reste en mémoire
    }
  }, [items, favoriteItems, ready]);

  // Client connecté : le panier est enregistré côté serveur (relances des paniers abandonnés)
  const isClient = user?.role === 'CLIENT';
  const lastSynced = useRef<string>('');
  useEffect(() => {
    if (!ready || !isClient) return;
    const payload = items.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      giftWrap: l.giftWrap || undefined,
      cardMessage: l.cardMessage.trim() || undefined,
    }));
    const signature = JSON.stringify(payload);
    if (signature === lastSynced.current) return;
    const timer = window.setTimeout(() => {
      const request = payload.length > 0 ? saveMyCart(payload) : clearMyCart();
      request
        .then(() => {
          lastSynced.current = signature;
        })
        .catch((err) => console.warn('[Panier] Enregistrement du panier sur le serveur impossible :', err));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [items, ready, isClient]);

  const add = useCallback((product: Product, variant: ProductVariant, quantity = 1, options: CartOptions = {}) => {
    const lineId = buildLineId(variant.id, options);
    setItems((current) => {
      const found = current.find((l) => l.lineId === lineId);
      const max = Math.max(1, variant.stockQuantity);
      if (found) {
        return current.map((l) =>
          l.lineId === lineId ? { ...l, quantity: Math.min(max, l.quantity + quantity), maxQuantity: max } : l,
        );
      }
      return [
        ...current,
        {
          lineId,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          variantId: variant.id,
          variantName: variant.name,
          unitPrice: variant.price,
          quantity: Math.min(max, quantity),
          maxQuantity: max,
          giftWrap: Boolean(options.giftWrap),
          cardMessage: (options.cardMessage ?? '').trim(),
        },
      ];
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, l) => sum + l.quantity, 0),
      droppedLegacyLines,
      acknowledgeDroppedLines: () => setDroppedLegacyLines(0),
      add,
      change: (lineId, quantity) =>
        setItems((current) =>
          quantity < 1
            ? current.filter((l) => l.lineId !== lineId)
            : current.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(l.maxQuantity || quantity, quantity) } : l)),
        ),
      updateOptions: (lineId, options) =>
        setItems((current) => {
          const line = current.find((l) => l.lineId === lineId);
          if (!line) return current;
          const next = {
            ...line,
            giftWrap: options.giftWrap ?? line.giftWrap,
            cardMessage: (options.cardMessage ?? line.cardMessage).trim(),
          };
          next.lineId = buildLineId(next.variantId, next);
          const merged = current.filter((l) => l.lineId !== lineId);
          const twin = merged.find((l) => l.lineId === next.lineId);
          return twin
            ? merged.map((l) => (l.lineId === next.lineId ? { ...l, quantity: l.quantity + next.quantity } : l))
            : merged.map((l) => l).concat(next);
        }),
      remove: (lineId) => setItems((current) => current.filter((l) => l.lineId !== lineId)),
      clear: () => setItems([]),
      replace: (lines) => setItems(lines.filter(isValidLine)),
      favorites: favoriteItems.map((f) => f.id),
      favoriteItems,
      toggleFavorite: (product) =>
        setFavoriteItems((current) =>
          current.some((f) => f.id === product.id)
            ? current.filter((f) => f.id !== product.id)
            : [
                ...current,
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  oldPrice: product.oldPrice,
                  category: product.category,
                },
              ],
        ),
    }),
    [items, favoriteItems, droppedLegacyLines, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans CartProvider');
  return context;
}
