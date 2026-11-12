import { apiClient } from '../client';

/** Les variations (%) valent null quand la période précédente est vide (comparaison impossible). */
export interface DashboardKpis {
  revenue: number;
  revenueDelta: number | null;
  orders: number;
  ordersDelta: number | null;
  customers: number;
  newCustomers: number;
  customersDelta: number | null;
  products: number;
  newProducts: number;
}

export interface DashboardChartPoint {
  label: string;
  sales: number;
  orders: number;
  date: string;
}

export interface DashboardOrderDistribution {
  name: string;
  /** Part en pourcentage */
  value: number;
  color: string;
  count: number;
}

export interface DashboardRecentOrder {
  id: string;
  ref: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

export type DashboardStockLevel = 'EN_STOCK' | 'STOCK_FAIBLE' | 'RUPTURE';

export interface DashboardTopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stockQuantity: number;
  stockStatus: DashboardStockLevel;
  image: string | null;
}

export interface DashboardData {
  kpis: DashboardKpis;
  salesChart: DashboardChartPoint[];
  orderDistribution: DashboardOrderDistribution[];
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
}

export const STOCK_LEVEL_LABELS: Record<DashboardStockLevel, string> = {
  EN_STOCK: 'En stock',
  STOCK_FAIBLE: 'Stock faible',
  RUPTURE: 'Rupture',
};

/**
 * Données agrégées du tableau de bord (mois en cours vs même période du mois précédent).
 * Endpoint: GET /api/v1/admin/dashboard — lève une ApiClientError en cas d'échec.
 */
export async function getAdminDashboard(): Promise<DashboardData> {
  const data = await apiClient.get<DashboardData>('/admin/dashboard', {
    useAdminToken: true,
    cache: 'no-store',
  });
  return {
    kpis: data.kpis,
    salesChart: Array.isArray(data.salesChart) ? data.salesChart : [],
    orderDistribution: Array.isArray(data.orderDistribution) ? data.orderDistribution : [],
    recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
    topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
  };
}
