import { apiClient } from '../client';
import { dashboardKpis, salesChartData, orderDistribution } from '@/lib/admin/mock-data';
import { adminOrders } from '@/lib/admin/mock-data/orders';

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
    console.warn('[Admin Dashboard] Échec appel direct /admin/dashboard, utilisation des métriques synthétiques:', error);
    
    // Fallback avec les mocks enrichis en cas de mode hors ligne / démonstration
    return {
      kpis: dashboardKpis,
      salesChart: salesChartData,
      orderDistribution: orderDistribution.map((d) => ({
        name: d.status,
        value: d.percentage,
        color: d.status === 'livree' ? '#24582d' : d.status === 'en_livraison' ? '#3b82f6' : d.status === 'en_preparation' ? '#f59e0b' : '#ef4444',
        count: d.count,
      })),
      recentOrders: adminOrders.slice(0, 5).map((o) => ({
        id: o.id,
        ref: o.ref,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        date: o.date,
      })),
      topProducts: [
        {
          id: '1',
          name: 'Bouquet Romance Pastel',
          sales: 42,
          revenue: 1470000,
          stock: '15 en stock',
          image: '/images/products/p1.webp',
        },
        {
          id: '2',
          name: 'Composition Royale Saly',
          sales: 38,
          revenue: 1710000,
          stock: '8 en stock',
          image: '/images/products/p2.webp',
        },
        {
          id: '3',
          name: 'Orchidée Phalaenopsis Blanche',
          sales: 29,
          revenue: 725000,
          stock: '12 en stock',
          image: '/images/products/p3.webp',
        },
      ],
    };
  }
}
