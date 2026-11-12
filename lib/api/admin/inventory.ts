import { apiClient } from '../client';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

export interface InventoryRow {
  variant: { id: string; productId: string; name: string; sku: string; price: number; stockQuantity: number; minStockAlert: number };
  product: { id: string; name: string; slug: string; featuredImage: string | null; status: string; category: { id: string; name: string; slug: string } | null };
  isOutOfStock: boolean;
  isLowStock: boolean;
}

export interface InventoryPage {
  items: InventoryRow[];
  total: number;
  page: number;
  totalPages: number;
  counts: { all: number; low: number; out: number };
}

export async function getInventory(params: {
  page?: number;
  status?: 'low' | 'out';
  search?: string;
  category?: string;
  sort?: 'priority' | 'stock_asc' | 'stock_desc' | 'name';
}): Promise<InventoryPage> {
  return apiClient.get<InventoryPage>('/admin/inventory', {
    ...admin,
    params: { page: params.page ?? 1, limit: 25, status: params.status, search: params.search || undefined, category: params.category, sort: params.sort },
  });
}

export async function adjustVariantStock(variantId: string, body: { type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'; quantity: number; reason: string }) {
  return apiClient.post(`/admin/inventory/${variantId}/movements`, body, admin);
}

export async function setVariantAlertThreshold(variantId: string, minStockAlert: number) {
  return apiClient.patch(`/admin/inventory/${variantId}`, { minStockAlert }, admin);
}

export interface StockMovementRow {
  id: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  variant: { id: string; name: string; sku: string };
  product: { id: string; name: string; slug: string };
}

export async function getMovements(params: { page?: number; type?: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'; search?: string }) {
  return apiClient.get<{ items: StockMovementRow[]; total: number; page: number; totalPages: number }>('/admin/stock-movements', {
    ...admin,
    params: { page: params.page ?? 1, limit: 30, type: params.type, search: params.search || undefined },
  });
}
