import { apiClient } from '../client';
import type { StockMovement } from '@/lib/admin/mock-data/types';

export interface RecordMovementPayload {
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'LOSS';
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

/**
 * Récupérer l'état du stock et de l'inventaire
 * Endpoint: GET /api/v1/admin/inventory
 */
export async function getAdminInventory(lowStock?: boolean): Promise<InventoryItem[]> {
  try {
    const data = await apiClient.get<any[]>('/admin/inventory', {
      params: { lowStock: lowStock ? 'true' : undefined },
      isAdmin: true,
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => {
        const stock = item.stock ?? item.quantity ?? 0;
        const min = item.minStock ?? 5;
        let status: 'normal' | 'faible' | 'rupture' = 'normal';
        if (stock <= 0) status = 'rupture';
        else if (stock <= min) status = 'faible';

        return {
          id: item.id || item.variantId,
          variantId: item.variantId || item.id,
          productId: item.productId || item.product?.id || item.id,
          productName: item.productName || item.product?.name || item.name || 'Produit',
          productSku: item.sku || item.product?.sku || 'SKU-000',
          category: item.category || item.product?.category?.name || 'Général',
          currentStock: stock,
          minStock: min,
          status,
          lastMovementDate: item.updatedAt || item.lastMovementDate,
          image: item.product?.images?.[0]?.url || item.image || '/images/bouquet-passion.jpg',
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
): Promise<any> {
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
    const data = await apiClient.get<any[]>('/admin/stock-movements', {
      params: {
        variantId: params?.variantId,
        limit: params?.limit,
      },
      isAdmin: true,
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((m) => {
        const typeMap: Record<string, 'entree' | 'sortie' | 'ajustement'> = {
          IN: 'entree',
          OUT: 'sortie',
          ADJUSTMENT: 'ajustement',
          LOSS: 'sortie',
        };

        return {
          id: m.id,
          productId: m.variantId || m.productId,
          productName: m.productName || m.variant?.name || 'Produit',
          productSku: m.sku || m.variant?.sku || 'SKU',
          type: typeMap[m.type] || 'ajustement',
          quantity: m.quantity,
          previousStock: m.previousStock ?? 0,
          newStock: m.newStock ?? 0,
          reason: m.reason || '',
          date: m.createdAt || new Date().toISOString(),
          author: m.authorName || m.user?.name || 'Admin',
        };
      });
    }

    return [];
  } catch (error) {
    console.warn('[Admin Stock Movements] Erreur de récupération des mouvements de stock:', error);
    return [];
  }
}
