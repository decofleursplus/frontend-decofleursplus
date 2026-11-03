'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';

type CartOptions = { size?: string; cardMessage?: string; giftWrap?: boolean };
type CartLine = { product: Product; quantity: number; lineId: string; options?: CartOptions };
type CartContextValue = {
  items: CartLine[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number, options?: CartOptions) => void;
  change: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'decofleur-cart-v1';
const FAVORITES_KEY = 'decofleur-favorites-v1';

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      // Rehydrate the cart from browser storage after the server-rendered initial state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setItems(JSON.parse(stored) as CartLine[]);
      const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
      // Rehydrate favorites from browser storage after the server-rendered initial state.
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites) as string[]);
    } catch {
      window.localStorage.removeItem(CART_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [items, favorites, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    favorites,
    toggleFavorite: (productId) => setFavorites((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    add: (product, quantity = 1, options) => setItems((current) => {
      const lineId = [product.id, product.price, options?.size ?? '', options?.cardMessage ?? '', options?.giftWrap ? 'wrapped' : 'plain'].join(':');
      const found = current.find((item) => item.lineId === lineId);
      return found
        ? current.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { product, quantity, lineId, options }];
    }),
    change: (lineId, quantity) => setItems((current) => quantity < 1
      ? current.filter((item) => item.lineId !== lineId)
      : current.map((item) => item.lineId === lineId ? { ...item, quantity } : item)),
    remove: (lineId) => setItems((current) => current.filter((item) => item.lineId !== lineId)),
    clear: () => setItems([]),
  }), [favorites, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans CartProvider');
  return context;
}
