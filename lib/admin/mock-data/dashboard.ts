import type { KpiData, ChartPoint, OrderDistribution } from './types';
export { adminCategories } from './categories';

export const dashboardKpis: KpiData = {
  revenue: 0,
  revenueDelta: 0,
  orders: 0,
  ordersDelta: 0,
  customers: 0,
  customersDelta: 0,
  products: 0,
  productsDelta: 0,
};

export const salesChartData: ChartPoint[] = [];
export const orderDistribution: OrderDistribution[] = [];
