import { apiClient } from '../client';

export interface DashboardKpis {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  products: number;
  productsDelta: number;
}

export interface DashboardChartPoint {
  label: string;
  sales: number;
  orders: number;
  date?: string;
}

export interface DashboardOrderDistribution {
  name: string;
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

export interface DashboardTopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: string;
  image: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  salesChart: DashboardChartPoint[];
  orderDistribution: DashboardOrderDistribution[];
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
}

/**
 * Récupère les données agrégées pour le tableau de bord administrateur
 * Endpoint: GET /api/v1/admin/dashboard
 */
export async function getAdminDashboard(): Promise<DashboardData> {
  try {
    const data = await apiClient.get<DashboardData>('/admin/dashboard', {
      isAdmin: true,
    });

    if (data && data.kpis) {
      return data;
    }
    throw new Error('Données incomplètes');
  } catch (error) {
    console.warn('[Admin Dashboard] Erreur ou dashboard vide:', error);
    
    return {
      kpis: {
        revenue: 0,
        revenueDelta: 0,
        orders: 0,
        ordersDelta: 0,
        customers: 0,
        customersDelta: 0,
        products: 0,
        productsDelta: 0,
      },
      salesChart: [],
      orderDistribution: [],
      recentOrders: [],
      topProducts: [],
    };
  }
}
