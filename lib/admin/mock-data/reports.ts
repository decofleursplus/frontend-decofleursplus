import type {
  ReportPeriodPreset,
  ReportDataset,
  FinancialTransaction,
} from './types';

const emptyReportData = {
  grossRevenue: 0,
  ordersCount: 0,
  averageOrderValue: 0,
  newCustomersCount: 0,
  returningCustomersCount: 0,
  collectedAmount: 0,
  pendingAmount: 0,
  gatewayFees: 0,
  netRevenue: 0,
};

const emptyDataset: ReportDataset = {
  periodLabel: '',
  comparisonLabel: '',
  current: emptyReportData,
  previous: emptyReportData,
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

export const reportsDatasets: Record<ReportPeriodPreset, ReportDataset> = {
  today: { ...emptyDataset, periodLabel: "Aujourd'hui" },
  '7days': { ...emptyDataset, periodLabel: '7 derniers jours' },
  '30days': { ...emptyDataset, periodLabel: '30 derniers jours' },
  this_month: { ...emptyDataset, periodLabel: 'Ce mois-ci' },
  this_year: { ...emptyDataset, periodLabel: 'Cette année' },
  custom: { ...emptyDataset, periodLabel: 'Période personnalisée' },
};

export const financialTransactions: FinancialTransaction[] = [];
