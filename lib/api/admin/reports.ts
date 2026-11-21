import { apiClient } from '../client';
import type { ReportDataset, ReportPeriodPreset, FinancialTransaction } from '@/lib/admin/mock-data/types';

export interface FinancialTransactionsResult {
  items: FinancialTransaction[];
  total: number;
  summary?: {
    totalGross: number;
    totalFees: number;
    totalNet: number;
  };
}

export const emptyReportDataset: ReportDataset = {
  periodLabel: 'Période en cours',
  comparisonLabel: 'vs période précédente',
  current: {
    grossRevenue: 0,
    ordersCount: 0,
    averageOrderValue: 0,
    newCustomersCount: 0,
    returningCustomersCount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    gatewayFees: 0,
    netRevenue: 0,
  },
  previous: {
    grossRevenue: 0,
    ordersCount: 0,
    averageOrderValue: 0,
    newCustomersCount: 0,
    returningCustomersCount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    gatewayFees: 0,
    netRevenue: 0,
  },
  deltas: {
    revenueDelta: 0,
    ordersDelta: 0,
    aovDelta: 0,
    customersDelta: 0,
    netDelta: 0,
  },
  chartPoints: [],
  topProducts: [],
  categoriesBreakdown: [],
  zonesBreakdown: [],
  paymentBreakdown: [],
};

/**
 * Récupère le rapport d'activité et d'analyse des ventes
 * Endpoint: GET /api/v1/admin/reports
 */
export async function getAdminReports(params?: {
  preset?: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
}): Promise<ReportDataset> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/reports', {
      params: {
        preset: params?.preset,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
      useAdminToken: true,
      cache: 'no-store',
    });

    const dataObj = res?.data ?? res;

    if (dataObj && dataObj.current) {
      return {
        periodLabel: dataObj.periodLabel || 'Ce mois-ci',
        comparisonLabel: dataObj.comparisonLabel || 'vs mois dernier',
        current: dataObj.current,
        previous: dataObj.previous || emptyReportDataset.previous,
        deltas: dataObj.deltas || emptyReportDataset.deltas,
        chartPoints: Array.isArray(dataObj.chartPoints) ? dataObj.chartPoints : [],
        topProducts: Array.isArray(dataObj.topProducts) ? dataObj.topProducts : [],
        categoriesBreakdown: Array.isArray(dataObj.categoriesBreakdown) ? dataObj.categoriesBreakdown : [],
        zonesBreakdown: Array.isArray(dataObj.zonesBreakdown) ? dataObj.zonesBreakdown : [],
        paymentBreakdown: Array.isArray(dataObj.paymentBreakdown) ? dataObj.paymentBreakdown : [],
      };
    }
    throw new Error('Données incomplètes');
  } catch (error) {
    console.warn('[Admin Reports] Erreur de récupération des rapports:', error);
    return emptyReportDataset;
  }
}

/**
 * Récupère le journal des transactions financières
 * Endpoint: GET /api/v1/admin/reports/transactions
 */
export async function getAdminFinancialTransactions(params?: {
  search?: string;
  paymentMethod?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<FinancialTransactionsResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/admin/reports/transactions', {
      params: {
        search: params?.search,
        paymentMethod: params?.paymentMethod,
        status: params?.status,
        page: params?.page,
        limit: params?.limit,
      },
      useAdminToken: true,
      cache: 'no-store',
    });

    const dataObj = res?.data ?? res;

    if (dataObj && Array.isArray(dataObj.items)) {
      return {
        items: dataObj.items,
        total: dataObj.total ?? dataObj.items.length,
        summary: dataObj.summary,
      };
    }

    if (Array.isArray(dataObj)) {
      return {
        items: dataObj,
        total: dataObj.length,
      };
    }

    throw new Error('Données de transactions non reçues');
  } catch (error) {
    console.warn('[Admin Transactions] Erreur de récupération des transactions:', error);

    return {
      items: [],
      total: 0,
      summary: {
        totalGross: 0,
        totalFees: 0,
        totalNet: 0,
      },
    };
  }
}

// ── Visiteurs & Audience ─────────────────────────────────────────────────

export interface VisitorTotals {
  /** Navigateurs distincts sur la période */
  visitors: number;
  /** Visites : un visiteur compte une visite par jour */
  visits: number;
  pageViews: number;
  /** Navigateurs vus pour la première fois pendant la période */
  newVisitors: number;
}

export interface VisitorReport {
  periodLabel: string;
  comparisonLabel: string;
  from: string;
  to: string;
  /** Premier jour de mesure ; null tant qu'aucune visite n'a été enregistrée */
  trackingSince: string | null;
  current: VisitorTotals & { returningVisitors: number; pagesPerVisit: number };
  previous: VisitorTotals;
  /** Variations en % ; null quand la période précédente est à zéro */
  deltas: { visitorsDelta: number | null; pageViewsDelta: number | null; newVisitorsDelta: number | null };
  daily: { date: string; visitors: number; pageViews: number }[];
  topPages: { path: string; views: number }[];
  sources: { label: string; visits: number }[];
  devices: { label: string; visits: number }[];
}

/**
 * Visiteurs de la boutique sur la période des rapports (même sélecteur que les ventes).
 * Endpoint: GET /api/v1/admin/reports/visitors
 */
export async function getAdminVisitorReport(params: {
  preset: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
}): Promise<VisitorReport> {
  return apiClient.get<VisitorReport>('/admin/reports/visitors', {
    params: { preset: params.preset, startDate: params.startDate, endDate: params.endDate },
    useAdminToken: true,
    cache: 'no-store',
  });
}
