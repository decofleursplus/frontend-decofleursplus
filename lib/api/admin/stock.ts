import { apiClient } from '../client';
import type { StockMovement } from '@/lib/admin/mock-data/types';

export interface RecordMovementPayload {
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
}

export interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: 'normal' | 'faible' | 'rupture';
  lastMovementDate?: string;
  image?: string;
}

interface BackendInventoryEntry {
  variant?: {
    id: string;
    productId: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    minStockAlert?: number;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    featuredImage?: string | null;
    category?: { id?: string; name?: string; slug?: string };
  };
  isOutOfStock?: boolean;
  isLowStock?: boolean;
  // Legacy / fallback flat keys
  id?: string;
  variantId?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  category?: string;
  stock?: number;
  quantity?: number;
  minStock?: number;
  updatedAt?: string;
  image?: string;
}

interface BackendStockMovement {
  id: string;
  variantId: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | string;
  quantity: number;
  previousStock?: number;
  newStock?: number;
  reason?: string;
  authorId?: string | null;
  createdAt?: string;
  variant?: {
    name?: string;
    sku?: string;
    product?: {
      name?: string;
    };
  };
  productName?: string;
  sku?: string;
  authorName?: string;
  user?: { name?: string };
}

/**
 * Récupérer l'état du stock et de l'inventaire
 * Endpoint: GET /api/v1/admin/inventory
 */
export async function getAdminInventory(lowStock?: boolean): Promise<InventoryItem[]> {
  try {
    const data = await apiClient.get<BackendInventoryEntry[]>('/admin/inventory', {
      params: { lowStock: lowStock ? 'true' : undefined },
      isAdmin: true,
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => {
        const variant = item.variant;
        const product = item.product;

        const stock = variant?.stockQuantity ?? item.stock ?? item.quantity ?? 0;
        const min = variant?.minStockAlert ?? item.minStock ?? 5;

        let status: 'normal' | 'faible' | 'rupture' = 'normal';
        if (stock <= 0 || item.isOutOfStock) status = 'rupture';
        else if (stock <= min || item.isLowStock) status = 'faible';

        const image =
          product?.featuredImage ||
          item.image ||
          '/images/bouquet-passion.jpg';

        return {
          id: variant?.id || item.id || item.variantId || 'inv-unknown',
          variantId: variant?.id || item.variantId || item.id || '',
          productId: product?.id || item.productId || '',
          productName: product?.name || item.productName || 'Produit',
          productSku: variant?.sku || item.sku || 'SKU-000',
          category: product?.category?.name || item.category || 'Bouquets',
          currentStock: stock,
          minStock: min,
          status,
          lastMovementDate: item.updatedAt,
          image,
        };
      });
    }
    return [];
  } catch (error) {
    console.warn('[Admin Inventory] Échec appel direct /admin/inventory:', error);
    return [];
  }
}

/**
 * Enregistrer un mouvement de stock
 * Endpoint: POST /api/v1/admin/inventory/:variantId/movements
 */
export async function recordStockMovement(
  variantId: string,
  payload: RecordMovementPayload
): Promise<unknown> {
  return apiClient.post(`/admin/inventory/${variantId}/movements`, payload, {
    isAdmin: true,
  });
}

/**
 * Historique des mouvements de stock
 * Endpoint: GET /api/v1/admin/stock-movements
 */
export async function getStockMovements(params?: {
  variantId?: string;
  limit?: number;
}): Promise<StockMovement[]> {
  try {
    const data = await apiClient.get<BackendStockMovement[]>('/admin/stock-movements', {
      params: {
        variantId: params?.variantId,
        limit: params?.limit,
      },
      isAdmin: true,
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((m) => {
        const typeMap: Record<string, 'entree' | 'sortie' | 'ajustement'> = {
          ENTRY: 'entree',
          EXIT: 'sortie',
          ADJUSTMENT: 'ajustement',
        };

        const prodName =
          m.variant?.product?.name ||
          m.productName ||
          m.variant?.name ||
          'Produit';

        const sku = m.variant?.sku || m.sku || 'SKU';

        return {
          id: m.id,
          productId: m.variantId,
          productName: prodName,
          productSku: sku,
          type: typeMap[m.type] || 'ajustement',
          quantity: m.quantity,
          previousStock: m.previousStock ?? 0,
          newStock: m.newStock ?? 0,
          reason: m.reason || '',
          date: m.createdAt || new Date().toISOString(),
          author: m.authorName || m.user?.name || 'Administrateur',
        };
      });
    }

    return [];
  } catch (error) {
    console.warn('[Admin Stock Movements] Erreur de récupération des mouvements de stock:', error);
    return [];
  }
}
