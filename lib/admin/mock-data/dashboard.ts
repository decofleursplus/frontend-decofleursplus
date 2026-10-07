import type { AdminCategory, KpiData, ChartPoint, OrderDistribution } from './types';

export const adminCategories: AdminCategory[] = [
  { id: 'cat-1', name: 'Bouquets', description: 'Fleurs fraîches', productCount: 78, status: 'actif' },
  { id: 'cat-2', name: 'Plantes', description: "Plantes d'intérieur et extérieur", productCount: 62, status: 'actif' },
  { id: 'cat-3', name: 'Fruits & Légumes', description: 'Paniers de fruits', productCount: 20, status: 'actif' },
  { id: 'cat-4', name: 'Cadeaux', description: 'Coffrets et cadeaux', productCount: 45, status: 'actif' },
  { id: 'cat-5', name: 'Décorations', description: 'Décorations événementielles', productCount: 30, status: 'actif' },
  { id: 'cat-6', name: 'Mariages & Événements', description: 'Compositions pour événements', productCount: 25, status: 'actif' },
];

export const dashboardKpis: KpiData = {
  revenue: 1250000,
  revenueDelta: 12,
  orders: 128,
  ordersDelta: 6,
  customers: 245,
  customersDelta: 15,
  products: 320,
  productsDelta: 5,
};

export const salesChartData: ChartPoint[] = [
  { label: '1 mar', sales: 85000, orders: 8 },
  { label: '5 mar', sales: 120000, orders: 12 },
  { label: '8 mar', sales: 95000, orders: 9 },
  { label: '10 mar', sales: 180000, orders: 18 },
  { label: '12 mar', sales: 150000, orders: 14 },
  { label: '15 mar', sales: 210000, orders: 20 },
  { label: '18 mar', sales: 170000, orders: 16 },
  { label: '20 mar', sales: 250000, orders: 24 },
  { label: '22 mar', sales: 200000, orders: 19 },
  { label: '25 mar', sales: 290000, orders: 28 },
  { label: '28 mar', sales: 310000, orders: 30 },
  { label: '30 mar', sales: 350000, orders: 32 },
];

export const orderDistribution: OrderDistribution[] = [
  { status: 'en_preparation', count: 25, percentage: 19 },
  { status: 'en_livraison', count: 12, percentage: 9 },
  { status: 'livree', count: 75, percentage: 59 },
  { status: 'annulee', count: 10, percentage: 8 },
  { status: 'remboursee', count: 6, percentage: 5 },
];
