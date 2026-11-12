'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { quoteOrder, type CartQuote, type DeliveryMode } from '@/lib/api/orders';
import type { CartLine } from '@/components/cart-provider';

export interface LineProblem {
  message: string;
  /** Stock restant quand le problème est une quantité trop élevée */
  available?: number;
}

export interface CartQuoteState {
  quote: CartQuote | null;
  loading: boolean;
  /** Erreur bloquante (réseau, zone manquante…) */
  error: string | null;
  /** Problèmes par variante (stock insuffisant, produit plus vendu…) */
  lineProblems: Record<string, LineProblem>;
  /** Le code promo saisi a été refusé ; le chiffrage affiché est fait sans lui */
  couponError: string | null;
  /** Champs refusés (ex. deliveryZoneId) */
  fieldErrors: Record<string, string>;
}

interface Input {
  lines: CartLine[];
  deliveryMode: DeliveryMode;
  deliveryZoneId?: string;
  couponCode?: string;
  /** false : ne rien chiffrer (ex. en attendant une sélection) */
  enabled?: boolean;
}

function toPayload(lines: CartLine[]) {
  return lines.map((l) => ({
    variantId: l.variantId,
    quantity: l.quantity,
    giftWrap: l.giftWrap || undefined,
    cardMessage: l.cardMessage.trim() || undefined,
  }));
}

/** Chiffre le panier côté serveur à chaque changement (prix, options, promotions, coupon, livraison). */
export function useCartQuote({ lines, deliveryMode, deliveryZoneId, couponCode, enabled = true }: Input): CartQuoteState {
  const [state, setState] = useState<CartQuoteState>({
    quote: null,
    loading: false,
    error: null,
    lineProblems: {},
    couponError: null,
    fieldErrors: {},
  });
  const requestId = useRef(0);
  const items = useMemo(() => toPayload(lines), [lines]);
  const signature = JSON.stringify([items, deliveryMode, deliveryZoneId, couponCode, enabled]);

  useEffect(() => {
    if (!enabled || items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- rien à chiffrer
      setState((s) => ({ ...s, quote: null, loading: false, error: null, lineProblems: {} }));
      return;
    }
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true }));

    const run = async () => {
      const base = { items, deliveryMode, deliveryZoneId: deliveryMode === 'PICKUP' ? undefined : deliveryZoneId };
      const code = couponCode?.trim() || undefined;
      let couponError: string | null = null;
      try {
        let quote: CartQuote;
        try {
          quote = await quoteOrder({ ...base, couponCode: code });
        } catch (err) {
          const couponDetail =
            code && err instanceof ApiClientError ? err.details?.find((d) => d.path === 'couponCode') : undefined;
          if (!couponDetail) throw err;
          // Code refusé : on chiffre sans lui et on affiche le motif
          couponError = couponDetail.message;
          quote = await quoteOrder(base);
        }
        if (id === requestId.current) {
          setState({ quote, loading: false, error: null, lineProblems: {}, couponError, fieldErrors: {} });
        }
      } catch (err) {
        if (id !== requestId.current) return;
        const lineProblems: Record<string, LineProblem> = {};
        const fieldErrors: Record<string, string> = {};
        if (err instanceof ApiClientError) {
          for (const d of err.details ?? []) {
            const detail = d as typeof d & { variantId?: string; available?: number };
            if (detail.variantId) lineProblems[detail.variantId] = { message: detail.message, available: detail.available };
            else if (detail.path) fieldErrors[detail.path] = detail.message;
          }
        }
        setState({
          quote: null,
          loading: false,
          error: Object.keys(lineProblems).length > 0 ? null : err instanceof Error ? err.message : 'Chiffrage impossible.',
          lineProblems,
          couponError,
          fieldErrors,
        });
      }
    };

    const timer = window.setTimeout(() => void run(), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la signature résume toutes les entrées
  }, [signature]);

  return state;
}

// ── Choix de livraison et code promo conservés entre le panier et la commande ──

const CHECKOUT_KEY = 'decofleur-checkout-v1';

export interface CheckoutPrefs {
  deliveryMode: DeliveryMode;
  deliveryZoneId: string;
  couponCode: string;
}

const DEFAULT_PREFS: CheckoutPrefs = { deliveryMode: 'STANDARD', deliveryZoneId: '', couponCode: '' };

export function useCheckoutPrefs() {
  const [prefs, setPrefs] = useState<CheckoutPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du stockage de session après le rendu
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<CheckoutPrefs>) });
    } catch {
      // stockage indisponible
    }
    setReady(true);
  }, []);

  const update = (patch: Partial<CheckoutPrefs>) =>
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(next));
      } catch {
        // stockage indisponible
      }
      return next;
    });

  return { prefs, ready, update };
}
