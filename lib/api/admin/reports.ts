import { apiClient } from '../client';
import type { ReportDataset, ReportPeriodPreset, FinancialTransaction } from '@/lib/admin/mock-data/types';
import { reportsDatasets, financialTransactions } from '@/lib/admin/mock-data/reports';

export interface FinancialTransactionsResult {
  items: FinancialTransaction[];
  total: number;
  summary?: {
    totalGross: number;
    totalFees: number;
    totalNet: number;
  };
}

/**
 * Récupère le rapport d'activité et d'analyse des ventes
 * Endpoint: GET /api/v1/admin/reports
 */
export async function getAdminReports(params?: {
  preset?: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
}): Promise<ReportDataset> {
  const preset = params?.preset || '30days';

  try {
    const data = await apiClient.get<ReportDataset>('/admin/reports', {
      params: {
        preset: params?.preset,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
      isAdmin: true,
    });

    if (data && data.current) {
      return data;
    }
    throw new Error('Données incomplètes');
  } catch (error) {
    console.warn(`[Admin Reports] Utilisation du dataset mock pour le preset "${preset}":`, error);
    return reportsDatasets[preset] || reportsDatasets['30days'];
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
    const res = await apiClient.get<{
      items: FinancialTransaction[];
      total: number;
      summary?: { totalGross: number; totalFees: number; totalNet: number };
    }>('/admin/reports/transactions', {
      params: {
        search: params?.search,
        paymentMethod: params?.paymentMethod,
        status: params?.status,
        page: params?.page,
        limit: params?.limit,
      },
      isAdmin: true,
    });

    if (res && Array.isArray(res.items)) {
      return res;
    }
    throw new Error('Données de transactions non reçues');
  } catch (error) {
    console.warn('[Admin Transactions] Utilisation du mock transactions:', error);

    let list = [...financialTransactions];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.ref.toLowerCase().includes(q) ||
          t.orderRef.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerPhone.includes(q)
      );
    }

    if (params?.paymentMethod && params.paymentMethod !== 'all') {
      list = list.filter((t) => t.paymentMethod === params.paymentMethod);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((t) => t.status === params.status);
    }

    const totalGross = list.reduce((acc, t) => acc + t.grossAmount, 0);
    const totalFees = list.reduce((acc, t) => acc + t.gatewayFee, 0);
    const totalNet = list.reduce((acc, t) => acc + t.netAmount, 0);

    return {
      items: list,
      total: list.length,
      summary: {
        totalGross,
        totalFees,
        totalNet,
      },
    };
  }
}
