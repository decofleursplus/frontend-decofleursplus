import { apiClient } from '../client';
import type {
  Supplier,
  SupplierInvoice,
  SupplierInvoiceStatus,
  SupplierOrder,
  SupplierOrderStatus,
} from '@/lib/admin/mock-data/types';

const admin = { useAdminToken: true as const, cache: 'no-store' as const };

// ---------- Correspondances de statuts ----------

const ORDER_STATUS_FROM_API: Record<string, SupplierOrderStatus> = {
  DRAFT: 'brouillon',
  TO_VALIDATE: 'a_valider',
  VALIDATED: 'validee',
  SENT: 'envoyee',
  PARTIALLY_RECEIVED: 'en_cours',
  RECEIVED: 'receptionnee',
  CANCELLED: 'annulee',
};
export const ORDER_STATUS_TO_API: Record<SupplierOrderStatus, string> = {
  brouillon: 'DRAFT',
  a_valider: 'TO_VALIDATE',
  validee: 'VALIDATED',
  envoyee: 'SENT',
  en_cours: 'PARTIALLY_RECEIVED',
  receptionnee: 'RECEIVED',
  annulee: 'CANCELLED',
};
const INVOICE_STATUS_TO_API: Record<SupplierInvoiceStatus, string> = {
  a_verifier: 'TO_VERIFY',
  a_payer: 'TO_PAY',
  payee: 'PAID',
  en_retard: 'OVERDUE',
  contestee: 'DISPUTED',
  annulee: 'CANCELLED',
};
const INVOICE_STATUS_FROM_API: Record<string, SupplierInvoiceStatus> = {
  TO_VERIFY: 'a_verifier',
  TO_PAY: 'a_payer',
  PAID: 'payee',
  DISPUTED: 'contestee',
  CANCELLED: 'annulee',
};

/** Transitions manuelles autorisées par le backend (la réception passe par l'écran dédié). */
export const ORDER_NEXT_STATUSES: Record<SupplierOrderStatus, SupplierOrderStatus[]> = {
  brouillon: ['a_valider', 'validee', 'annulee'],
  a_valider: ['brouillon', 'validee', 'annulee'],
  validee: ['envoyee', 'annulee'],
  envoyee: ['annulee'],
  en_cours: [],
  receptionnee: [],
  annulee: [],
};
export const RECEIVABLE_STATUSES: SupplierOrderStatus[] = ['validee', 'envoyee', 'en_cours'];

// ---------- Types API ----------

interface ApiSupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  paymentTerms: string;
  leadTime: string;
  minOrder: number;
  isActive: boolean;
  notes: string | null;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
}
interface ApiOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string | null;
  deliveryFee: number;
  status: string;
  notes: string | null;
  receivedAt: string | null;
  subtotal: number;
  total: number;
  items: { id: string; variantId: string | null; name: string; orderedQty: number; receivedQty: number; unitPrice: number; total: number; status: string }[];
}
interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  orderId: string | null;
  orderNumber: string | null;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: string;
  isOverdue: boolean;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export const toSupplier = (s: ApiSupplier): Supplier => ({
  id: s.id,
  name: s.name,
  contactPerson: s.contactPerson,
  phone: s.phone,
  email: s.email,
  address: s.address,
  categories: s.categories,
  paymentTerms: s.paymentTerms,
  leadTime: s.leadTime,
  minOrder: s.minOrder,
  status: s.isActive ? 'actif' : 'inactif',
  notes: s.notes ?? undefined,
  totalOrders: s.totalOrders ?? 0,
  totalSpent: s.totalSpent ?? 0,
  createdAt: s.createdAt,
});

export const toSupplierOrder = (o: ApiOrder): SupplierOrder => ({
  id: o.id,
  orderNumber: o.orderNumber,
  supplierId: o.supplierId,
  supplierName: o.supplierName,
  date: day(o.orderDate),
  expectedDate: day(o.expectedDate),
  items: o.items.map((it) => ({
    id: it.id,
    variantId: it.variantId,
    name: it.name,
    orderedQty: it.orderedQty,
    receivedQty: it.receivedQty,
    unitPrice: it.unitPrice,
    total: it.total,
    status: it.status === 'COMPLETE' ? 'complete' : it.status === 'PARTIAL' ? 'partielle' : 'en_attente',
  })),
  subtotal: o.subtotal,
  deliveryFee: o.deliveryFee,
  total: o.total,
  status: ORDER_STATUS_FROM_API[o.status] ?? 'brouillon',
  notes: o.notes ?? undefined,
  receivedAt: o.receivedAt,
});

export const toSupplierInvoice = (i: ApiInvoice): SupplierInvoice => ({
  id: i.id,
  invoiceNumber: i.invoiceNumber,
  supplierId: i.supplierId,
  supplierName: i.supplierName,
  orderId: i.orderId ?? undefined,
  orderNumber: i.orderNumber ?? undefined,
  date: day(i.invoiceDate),
  dueDate: day(i.dueDate),
  amount: i.amount,
  status: i.isOverdue ? 'en_retard' : INVOICE_STATUS_FROM_API[i.status] ?? 'a_payer',
  notes: i.notes ?? undefined,
  paidAt: i.paidAt,
  paymentMethod: i.paymentMethod,
});

// ---------- Fournisseurs ----------

export interface SupplierPayload {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  categories?: string[];
  paymentTerms?: string;
  leadTime?: string;
  minOrder?: number;
  isActive?: boolean;
  notes?: string | null;
}

export async function getSuppliers(params: { search?: string; active?: boolean } = {}): Promise<Supplier[]> {
  const res = await apiClient.get<ApiSupplier[]>('/admin/suppliers', {
    ...admin,
    params: { search: params.search || undefined, active: params.active === undefined ? undefined : String(params.active) },
  });
  return res.map(toSupplier);
}

export interface SupplierDetail extends Supplier {
  orders: SupplierOrder[];
  invoices: SupplierInvoice[];
}

/** Fiche fournisseur ; null si elle n'existe pas (404). */
export async function getSupplier(id: string): Promise<SupplierDetail | null> {
  try {
    const res = await apiClient.get<ApiSupplier & { orders: ApiOrder[]; invoices: ApiInvoice[] }>(`/admin/suppliers/${id}`, admin);
    return { ...toSupplier(res), orders: res.orders.map(toSupplierOrder), invoices: res.invoices.map(toSupplierInvoice) };
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  return toSupplier(await apiClient.post<ApiSupplier>('/admin/suppliers', payload, admin));
}

export async function updateSupplier(id: string, payload: Partial<SupplierPayload>): Promise<Supplier> {
  return toSupplier(await apiClient.patch<ApiSupplier>(`/admin/suppliers/${id}`, payload, admin));
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/admin/suppliers/${id}`, admin);
}

// ---------- Commandes fournisseurs ----------

export interface SupplierOrderLinePayload {
  variantId?: string | null;
  name: string;
  orderedQty: number;
  unitPrice: number;
}

export async function getSupplierOrders(
  params: { status?: SupplierOrderStatus; supplierId?: string; search?: string; page?: number; limit?: number } = {},
): Promise<{ items: SupplierOrder[]; total: number; totalPages: number; counts: Record<SupplierOrderStatus, number> }> {
  const res = await apiClient.get<{ items: ApiOrder[]; total: number; totalPages: number; counts: Record<string, number> }>('/admin/supplier-orders', {
    ...admin,
    params: {
      status: params.status ? ORDER_STATUS_TO_API[params.status] : undefined,
      supplierId: params.supplierId,
      search: params.search || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    },
  });
  const counts = Object.fromEntries(Object.entries(ORDER_STATUS_FROM_API).map(([api, front]) => [front, res.counts[api] ?? 0])) as Record<
    SupplierOrderStatus,
    number
  >;
  return { items: res.items.map(toSupplierOrder), total: res.total, totalPages: res.totalPages, counts };
}

export async function getSupplierOrder(id: string): Promise<SupplierOrder | null> {
  try {
    return toSupplierOrder(await apiClient.get<ApiOrder>(`/admin/supplier-orders/${id}`, admin));
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function createSupplierOrder(payload: {
  supplierId: string;
  expectedDate?: string;
  deliveryFee?: number;
  notes?: string;
  status?: 'brouillon' | 'a_valider' | 'validee';
  items: SupplierOrderLinePayload[];
}): Promise<SupplierOrder> {
  const { status, ...rest } = payload;
  return toSupplierOrder(
    await apiClient.post<ApiOrder>('/admin/supplier-orders', { ...rest, ...(status ? { status: ORDER_STATUS_TO_API[status] } : {}) }, admin),
  );
}

export async function changeSupplierOrderStatus(id: string, status: SupplierOrderStatus): Promise<SupplierOrder> {
  return toSupplierOrder(await apiClient.patch<ApiOrder>(`/admin/supplier-orders/${id}/status`, { status: ORDER_STATUS_TO_API[status] }, admin));
}

export async function receiveSupplierOrder(id: string, lines: { itemId: string; quantity: number }[]): Promise<SupplierOrder> {
  return toSupplierOrder(await apiClient.post<ApiOrder>(`/admin/supplier-orders/${id}/receive`, { lines }, admin));
}

// ---------- Factures fournisseurs ----------

export interface SupplierInvoicePayload {
  invoiceNumber: string;
  supplierId: string;
  orderId?: string | null;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status?: Exclude<SupplierInvoiceStatus, 'en_retard'>;
  notes?: string | null;
}

export async function getSupplierInvoices(
  params: { status?: SupplierInvoiceStatus; supplierId?: string; search?: string; page?: number; limit?: number } = {},
): Promise<{
  items: SupplierInvoice[];
  total: number;
  totalPages: number;
  counts: Record<SupplierInvoiceStatus, number>;
  totals: { toPay: number; paid: number };
}> {
  const res = await apiClient.get<{ items: ApiInvoice[]; total: number; totalPages: number; counts: Record<string, number>; totals: { toPay: number; paid: number } }>(
    '/admin/supplier-invoices',
    {
      ...admin,
      params: {
        status: params.status ? INVOICE_STATUS_TO_API[params.status] : undefined,
        supplierId: params.supplierId,
        search: params.search || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 50,
      },
    },
  );
  const c = res.counts;
  return {
    items: res.items.map(toSupplierInvoice),
    total: res.total,
    totalPages: res.totalPages,
    counts: {
      a_verifier: c.TO_VERIFY ?? 0,
      a_payer: c.TO_PAY ?? 0,
      payee: c.PAID ?? 0,
      en_retard: c.OVERDUE ?? 0,
      contestee: c.DISPUTED ?? 0,
      annulee: c.CANCELLED ?? 0,
    },
    totals: res.totals,
  };
}

export async function createSupplierInvoice(payload: SupplierInvoicePayload): Promise<SupplierInvoice> {
  const { status, ...rest } = payload;
  return toSupplierInvoice(
    await apiClient.post<ApiInvoice>('/admin/supplier-invoices', { ...rest, ...(status ? { status: INVOICE_STATUS_TO_API[status] } : {}) }, admin),
  );
}

export async function updateSupplierInvoice(id: string, payload: Partial<SupplierInvoicePayload>): Promise<SupplierInvoice> {
  const { status, ...rest } = payload;
  return toSupplierInvoice(
    await apiClient.patch<ApiInvoice>(`/admin/supplier-invoices/${id}`, { ...rest, ...(status ? { status: INVOICE_STATUS_TO_API[status] } : {}) }, admin),
  );
}

export async function paySupplierInvoice(id: string, paymentMethod?: string): Promise<SupplierInvoice> {
  return toSupplierInvoice(await apiClient.post<ApiInvoice>(`/admin/supplier-invoices/${id}/pay`, { paymentMethod: paymentMethod || undefined }, admin));
}

/** Variantes du catalogue proposées dans les bons de commande (reçues = entrées en stock). */
export interface CatalogVariantOption {
  variantId: string;
  label: string;
  sku: string;
  stock: number;
}

export async function getCatalogVariantOptions(): Promise<CatalogVariantOption[]> {
  const res = await apiClient.get<{
    items: { variant: { id: string; name: string; sku: string; stockQuantity: number }; product: { name: string } }[];
  }>('/admin/inventory', { ...admin, params: { limit: 100 } });
  return res.items
    .map((row) => ({
      variantId: row.variant.id,
      label: row.variant.name && row.variant.name !== 'Standard' ? `${row.product.name} — ${row.variant.name}` : row.product.name,
      sku: row.variant.sku,
      stock: row.variant.stockQuantity,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}
