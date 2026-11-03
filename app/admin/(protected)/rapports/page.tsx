'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  reportsDatasets,
  financialTransactions,
  type ReportPeriodPreset,
  type FinancialTransaction,
  type PaymentMethodType,
  type SettlementStatus,
} from '@/lib/admin/mock-data';
import { getAdminReports, getAdminFinancialTransactions } from '@/lib/api/admin/reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Users,
  CreditCard,
  Download,
  RotateCw,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  Banknote,
  Smartphone,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  Percent,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ExportReportDialog } from '@/components/admin/export-report-dialog';
import { TransactionDetailDialog } from '@/components/admin/transaction-detail-dialog';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

export default function AdminRapportsPage() {
  // Main tabs: 'sales' | 'finance'
  const [activeTab, setActiveTab] = useState<'sales' | 'finance'>('sales');

  // Period Preset
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriodPreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState('2026-09-15');
  const [customEndDate, setCustomEndDate] = useState('2026-10-13');

  // Financial log expanded state
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Financial journal filters
  const [transactionSearch, setTransactionSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);

  // Dialogs
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Dataset based on period
  const [dataset, setDataset] = useState(reportsDatasets[selectedPeriod] || reportsDatasets['30days']);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(financialTransactions);

  // Charger le rapport de ventes selon la période
  useEffect(() => {
    let active = true;
    async function loadReports() {
      try {
        const res = await getAdminReports({
          preset: selectedPeriod,
          startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
          endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
        });
        if (active && res) {
          setDataset(res);
        }
      } catch (err) {
        console.error('Erreur chargement rapport:', err);
      }
    }
    loadReports();
    return () => {
      active = false;
    };
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Charger les transactions financières
  useEffect(() => {
    let active = true;
    async function loadTransactions() {
      try {
        const res = await getAdminFinancialTransactions({
          search: transactionSearch,
          paymentMethod: paymentMethodFilter,
          status: settlementStatusFilter,
        });
        if (active && res?.items) {
          setTransactions(res.items);
        }
      } catch (err) {
        console.error('Erreur chargement transactions:', err);
      }
    }
    loadTransactions();
    return () => {
      active = false;
    };
  }, [transactionSearch, paymentMethodFilter, settlementStatusFilter]);

  // Currency Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [rep, txs] = await Promise.all([
        getAdminReports({
          preset: selectedPeriod,
          startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
          endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
        }),
        getAdminFinancialTransactions({
          search: transactionSearch,
          paymentMethod: paymentMethodFilter,
          status: settlementStatusFilter,
        }),
      ]);
      if (rep) setDataset(rep);
      if (txs?.items) setTransactions(txs.items);
      toast.success('Données analytiques et financières actualisées');
    } catch {
      toast.error('Erreur lors de l’actualisation des données');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered transactions for financial log
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.ref.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        tx.orderRef.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        tx.customerPhone.includes(transactionSearch);

      const matchesMethod =
        paymentMethodFilter === 'all' || tx.paymentMethod === paymentMethodFilter;

      const matchesStatus =
        settlementStatusFilter === 'all' || tx.status === settlementStatusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [transactions, transactionSearch, paymentMethodFilter, settlementStatusFilter]);

  // Chart 1: Sales Evolution Line Chart
  const salesChartData = {
    labels: dataset.chartPoints.map((p) => p.label),
    datasets: [
      {
        fill: true,
        label: 'Période actuelle (FCFA)',
        data: dataset.chartPoints.map((p) => p.sales),
        borderColor: '#c1647a',
        backgroundColor: 'rgba(193, 100, 122, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#c1647a',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        fill: false,
        label: 'Période précédente (FCFA)',
        data: dataset.chartPoints.map((p) => p.previousSales),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ' : ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          callback: function (val: any) {
            return val >= 1000000
              ? (val / 1000000).toFixed(1) + 'M'
              : val / 1000 + 'k';
          },
        },
      },
    },
  };

  // Chart 2: Payments Distribution Doughnut
  const paymentDoughnutData = {
    labels: dataset.paymentBreakdown.map((p) => p.label),
    datasets: [
      {
        data: dataset.paymentBreakdown.map((p) => p.percentage),
        backgroundColor: dataset.paymentBreakdown.map((p) => p.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const paymentDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 11 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return ` ${context.label} : ${context.parsed}% du total`;
          },
        },
      },
    },
    cutout: '70%',
  };

  const getPaymentProviderLogo = (method: PaymentMethodType) => {
    switch (method) {
      case 'wave':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1dc4fe]/15 p-1">
            <Image
              src="/payment/wave.png"
              alt="Wave"
              width={18}
              height={18}
              className="object-contain"
            />
          </div>
        );
      case 'orange_money':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ff7900]/15 p-0.5">
            <Image
              src="/payment/orange-money-black.svg"
              alt="Orange Money"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        );
      case 'carte_bancaire':
        return (
          <div className="flex h-7 items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 border border-blue-100">
            <Image
              src="/payment/visa.svg"
              alt="Visa"
              width={16}
              height={12}
              className="object-contain"
            />
            <Image
              src="/payment/mastercard.svg"
              alt="Mastercard"
              width={15}
              height={12}
              className="object-contain"
            />
          </div>
        );
      case 'especes':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Banknote className="h-4 w-4" />
          </div>
        );
    }
  };

  const getMethodBadge = (method: PaymentMethodType) => {
    switch (method) {
      case 'wave':
        return (
          <span
            title="Wave Sénégal"
            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-cyan-50 border border-cyan-200/90 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
          >
            <Image
              src="/payment/wave.png"
              alt="Wave Sénégal"
              width={16}
              height={16}
              className="object-contain"
            />
          </span>
        );
      case 'orange_money':
        return (
          <span
            title="Orange Money"
            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-orange-50 border border-orange-200/90 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
          >
            <Image
              src="/payment/orange-money-black.svg"
              alt="Orange Money"
              width={18}
              height={18}
              className="object-contain"
            />
          </span>
        );
      case 'carte_bancaire':
        return (
          <span
            title="Carte Bancaire (Visa / Mastercard)"
            className="inline-flex items-center justify-center gap-1 h-7 px-1.5 rounded-full bg-blue-50 border border-blue-200/90 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
          >
            <Image
              src="/payment/visa.svg"
              alt="Visa"
              width={15}
              height={10}
              className="object-contain"
            />
            <Image
              src="/payment/mastercard.svg"
              alt="Mastercard"
              width={14}
              height={10}
              className="object-contain"
            />
          </span>
        );
      case 'especes':
        return (
          <span
            title="Espèces à la livraison"
            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 border border-emerald-200/90 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
          >
            <Banknote className="h-4 w-4 text-emerald-600" />
          </span>
        );
      default:
        return (
          <span
            title={method}
            className="inline-flex items-center justify-center h-7 px-2 rounded-full bg-gray-100 text-[11px] font-medium text-gray-700"
          >
            {method}
          </span>
        );
    }
  };

  const getSettlementBadge = (status: SettlementStatus) => {
    switch (status) {
      case 'encaisse':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Encaissé
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            En attente
          </span>
        );
      case 'rembourse':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            Remboursé
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. En-tête de la page ──────────────────────── */}
      {/* ── 1. En-tête de la page ──────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Rapports & Finances
          </h1>
          <p className="admin-page-subtitle">
            Performance commerciale, flux de trésorerie et ventilation des encaissements en Francs CFA (FCFA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial h-9 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
          >
            <RotateCw
              className={`h-3.5 w-3.5 mr-1.5 text-gray-500 ${
                isRefreshing ? 'animate-spin text-[#c1647a]' : ''
              }`}
            />
            Actualiser
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
            className="flex-1 sm:flex-initial h-9 bg-[#c1647a] hover:bg-[#a84d63] text-white shadow-2xs text-xs sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exporter le rapport
          </Button>
        </div>
      </div>

      {/* ── 2. Barre de Filtres Temporels Unifiée ───────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <span className="text-xs font-semibold uppercase text-gray-400 mr-1 shrink-0 hidden sm:inline">
            Période :
          </span>
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7days', label: '7 derniers jours' },
            { id: 'this_month', label: 'Ce mois-ci' },
            { id: 'this_year', label: 'Cette année' },
            { id: 'custom', label: 'Personnalisé' },
          ].map((preset) => {
            const isSelected = selectedPeriod === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPeriod(preset.id as ReportPeriodPreset)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-pink-50 text-[#c1647a] ring-1 ring-[#c1647a] font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom date range picker if 'custom' is active */}
        {selectedPeriod === 'custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="custom-start" className="text-xs text-gray-600 font-medium">Du :</label>
              <Input
                id="custom-start"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8 w-34 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="custom-end" className="text-xs text-gray-600 font-medium">Au :</label>
              <Input
                id="custom-end"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 w-34 text-xs"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Période personnalisée appliquée')}
              className="h-8 text-xs"
            >
              Appliquer
            </Button>
          </div>
        )}
      </div>

      {/* ── 3. Navigation par Onglets Métiers ───────────── */}
      <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-4 sm:space-x-6 min-w-max" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'sales'
                ? 'border-[#c1647a] text-[#c1647a]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>Analyse Commerciale & Ventes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-[#c1647a] text-[#c1647a]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Wallet className="h-4 w-4 shrink-0" />
            <span>Bilan Financier & Trésorerie</span>
          </button>
        </nav>
      </div>

      {/* ═════════════════════════════════════════════════ */}
      {/* ── VOLET 1 : ANALYSE COMMERCIALE & VENTES ─────── */}
      {/* ═════════════════════════════════════════════════ */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Chiffre d'Affaires Brut */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  CA Brut
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#c1647a]">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(dataset.current.grossRevenue)}
                </div>
                <div className="mt-1 flex items-center text-[10px] sm:text-xs">
                  <span
                    className={`flex items-center font-semibold shrink-0 ${
                      dataset.deltas.revenueDelta >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {dataset.deltas.revenueDelta >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    )}
                    {Math.abs(dataset.deltas.revenueDelta)}%
                  </span>
                  <span className="text-gray-400 ml-1 truncate hidden xs:inline">{dataset.comparisonLabel}</span>
                </div>
              </CardContent>
            </Card>

            {/* Volume de Commandes */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Commandes
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {dataset.current.ordersCount}
                </div>
                <div className="mt-1 flex items-center text-[10px] sm:text-xs">
                  <span
                    className={`flex items-center font-semibold shrink-0 ${
                      dataset.deltas.ordersDelta >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {dataset.deltas.ordersDelta >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    )}
                    {Math.abs(dataset.deltas.ordersDelta)}%
                  </span>
                  <span className="text-gray-400 ml-1 truncate hidden xs:inline">{dataset.comparisonLabel}</span>
                </div>
              </CardContent>
            </Card>

            {/* Panier Moyen */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Panier Moyen
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(dataset.current.averageOrderValue)}
                </div>
                <div className="mt-1 flex items-center text-[10px] sm:text-xs">
                  <span
                    className={`flex items-center font-semibold shrink-0 ${
                      dataset.deltas.aovDelta >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {dataset.deltas.aovDelta >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5" />
                    )}
                    {Math.abs(dataset.deltas.aovDelta)}%
                  </span>
                  <span className="text-gray-400 ml-1 truncate hidden xs:inline">{dataset.comparisonLabel}</span>
                </div>
              </CardContent>
            </Card>

            {/* Nouveaux vs Récurrents */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Clients Actifs
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {dataset.current.newCustomersCount +
                    dataset.current.returningCustomersCount}
                </div>
                <div className="mt-1 flex items-center text-[10px] sm:text-xs gap-1 text-gray-500 truncate">
                  <span className="font-semibold text-emerald-600">
                    +{dataset.current.newCustomersCount}
                  </span>
                  <span>nouveaux</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphique Principal d'Évolution Temporelle */}
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Évolution des Ventes & Comparaison
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Courbe de chiffre d'affaires sur {dataset.periodLabel} vs {dataset.comparisonLabel}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#c1647a]" />
                  <span className="font-medium text-gray-700">Période actuelle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-gray-400 border-dashed border-t" />
                  <span className="text-gray-500">Période précédente</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                <Line data={salesChartData} options={salesChartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* 2 Colonnes : Top Ventes Florales & Répartitions Géographiques/Catégories */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top 5 Produits Floraux */}
            <Card className="border-gray-200 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">
                      Top Ventes Florales
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      Articles les plus performants en volume et chiffre d'affaires
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-[#c1647a]" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataset.topProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-2 sm:p-2.5 transition-colors hover:bg-gray-50/60"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                        {idx + 1}
                      </span>
                      <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs sm:text-sm text-gray-900 leading-tight truncate">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                          <span>{product.sku}</span>
                          <span>•</span>
                          <span className="text-gray-600 truncate">{product.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-[11px] sm:text-xs">
                        <span className="font-medium text-gray-600">
                          {product.quantitySold} vendus
                        </span>
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {product.marginRate}% marge
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Répartition par Catégorie et par Zone */}
            <div className="space-y-6">
              {/* Catégories Florales */}
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900">
                    Ventes par Catégorie
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Contribution au chiffre d'affaires global
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataset.categoriesBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800">
                          {cat.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-mono">
                            {formatCurrency(cat.revenue)}
                          </span>
                          <span className="font-bold text-gray-900">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Zones de Livraison */}
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Zones de Livraison
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        Répartition des commandes sur la Petite Côte et Dakar
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataset.zonesBreakdown.map((zone) => (
                    <div key={zone.zone} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800">
                          {zone.zone}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">
                            {zone.ordersCount} cmd ({formatCurrency(zone.revenue)})
                          </span>
                          <span className="font-bold text-gray-900">
                            {zone.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${zone.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════ */}
      {/* ── VOLET 2 : BILAN FINANCIER & TRÉSORERIE ─────── */}
      {/* ═════════════════════════════════════════════════ */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* 4 Financial KPIs */}
          <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Total Encaissé */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Total Encaissé
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(dataset.current.collectedAmount)}
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  Confirmés comptes
                </p>
              </CardContent>
            </Card>

            {/* En attente / Espèces */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  En attente / Espèces
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-amber-700 truncate">
                  {formatCurrency(dataset.current.pendingAmount)}
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  En livraison
                </p>
              </CardContent>
            </Card>

            {/* Frais & Commissions Passerelles */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Frais Passerelles
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-rose-600 truncate">
                  - {formatCurrency(dataset.current.gatewayFees)}
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  Wave (1%), OM (1%), CB
                </p>
              </CardContent>
            </Card>

            {/* Trésorerie Nette */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-5">
                <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
                  Trésorerie Nette
                </CardTitle>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-2xl font-bold text-emerald-600 truncate">
                  {formatCurrency(dataset.current.netRevenue)}
                </div>
                <div className="mt-1 flex items-center text-[10px] sm:text-xs text-emerald-700 font-medium truncate">
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 shrink-0" />
                  +{dataset.deltas.netDelta}% net
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cartes Moyens de Paiement & Camembert */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Ventilation par moyen de paiement (2 colonnes) */}
            <div className="lg:col-span-2 grid gap-3 grid-cols-1 sm:grid-cols-2">
              {dataset.paymentBreakdown.map((pm) => (
                <div
                  key={pm.method}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      {getPaymentProviderLogo(pm.method)}
                      <span className="font-semibold text-gray-900 text-sm">
                        {pm.label}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {pm.percentage}% des flux
                    </Badge>
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Montant brut :</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(pm.grossRevenue)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Frais prélevés :</span>
                      <span className="font-medium text-rose-600">
                        - {formatCurrency(pm.fees)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-xs font-semibold text-emerald-800">
                        Net perçu :
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600">
                        {formatCurrency(pm.netRevenue)}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 text-right pt-1">
                      {pm.count} transactions enregistrées
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Répartition graphique Donut */}
            <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-900">
                  Répartition des Flux
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Part de chaque méthode sur {dataset.periodLabel}
                </p>
              </CardHeader>
              <CardContent className="h-[210px] flex items-center justify-center">
                <div className="h-full w-full">
                  <Doughnut
                    data={paymentDoughnutData}
                    options={paymentDoughnutOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journal des Encaissements & Transactions */}
          {/* Journal des Encaissements & Transactions */}
          <Card className="border-gray-200 shadow-2xs">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Grand Livre des Encaissements
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Journal d'audit détaillé de chaque transaction et déduction des commissions
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Recherche */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Réf, commande, client..."
                      value={transactionSearch}
                      onChange={(e) => setTransactionSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Filtre méthode */}
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="flex-1 sm:flex-initial h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs focus:border-[#c1647a] focus:outline-hidden"
                    >
                      <option value="all">Tous les modes</option>
                      <option value="wave">Wave</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="carte_bancaire">Carte Bancaire</option>
                      <option value="especes">Espèces</option>
                    </select>

                    {/* Filtre statut */}
                    <select
                      value={settlementStatusFilter}
                      onChange={(e) => setSettlementStatusFilter(e.target.value)}
                      className="flex-1 sm:flex-initial h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs focus:border-[#c1647a] focus:outline-hidden"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="encaisse">Encaissé</option>
                      <option value="en_attente">En attente</option>
                      <option value="rembourse">Remboursé</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* VUE MOBILE : Cartes Tactiles (< 1024px) */}
              <div className="lg:hidden p-3 space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500">
                    Aucune transaction ne correspond aux critères sélectionnés.
                  </div>
                ) : (
                  filteredTransactions
                    .slice(0, showAllTransactions ? undefined : 10)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMethodBadge(tx.paymentMethod)}
                            <div>
                              <span className="font-mono text-xs font-semibold text-gray-900 block leading-tight">
                                {tx.ref}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {new Date(tx.date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          {getSettlementBadge(tx.status)}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                          <div>
                            <span className="font-semibold text-[#c1647a] block">{tx.orderRef}</span>
                            <span className="text-gray-900 font-medium">{tx.customerName}</span>
                            <span className="text-gray-400 text-[11px] block">{tx.customerPhone}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[11px] block">Net perçu</span>
                            <span className="text-sm font-bold text-emerald-700 block">
                              {formatCurrency(tx.netAmount)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Brut: {formatCurrency(tx.grossAmount)}
                              {tx.gatewayFee > 0 && ` (-${formatCurrency(tx.gatewayFee)})`}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-2 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(tx);
                              setIsDetailDialogOpen(true);
                            }}
                            className="h-7 px-2.5 text-xs text-gray-700 hover:text-[#c1647a] hover:border-[#c1647a]/40"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            Détails transaction
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* VUE DESKTOP : Tableau Complet (>= 1024px) */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/70">
                      <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Date & Réf
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Commande & Client
                      </TableHead>
                      <TableHead className="text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Mode
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Montant Brut
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Frais
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Net Perçu
                      </TableHead>
                      <TableHead className="text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                        Statut & Détail
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                          Aucune transaction ne correspond aux critères sélectionnés.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions
                        .slice(0, showAllTransactions ? undefined : 10)
                        .map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-gray-50/50">
                          <TableCell className="text-xs text-gray-700 whitespace-nowrap py-3">
                            <div className="font-medium text-gray-900">
                              {new Date(tx.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="font-mono text-[11px] text-gray-400">{tx.ref}</div>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap py-3">
                            <div className="font-semibold text-[#c1647a]">{tx.orderRef}</div>
                            <div className="text-gray-900 font-medium leading-tight">{tx.customerName}</div>
                            <div className="text-[11px] text-gray-400">{tx.customerPhone}</div>
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap py-3">
                            {getMethodBadge(tx.paymentMethod)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-xs text-gray-900 whitespace-nowrap py-3">
                            {formatCurrency(tx.grossAmount)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium text-rose-600 whitespace-nowrap py-3">
                            {tx.gatewayFee > 0 ? `- ${formatCurrency(tx.gatewayFee)}` : '0 F'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs text-emerald-700 whitespace-nowrap py-3">
                            {formatCurrency(tx.netAmount)}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {getSettlementBadge(tx.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                  setIsDetailDialogOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-900"
                                title="Voir détail de la transaction"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pied de tableau avec compteur et option Voir Plus */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 p-3 gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                    Affichage de {showAllTransactions ? filteredTransactions.length : Math.min(10, filteredTransactions.length)} sur {filteredTransactions.length} transaction(s)
                  </span>
                  {!showAllTransactions && filteredTransactions.length > 10 && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                      (10 premières lignes)
                    </span>
                  )}
                </div>

                {filteredTransactions.length > 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="h-8 gap-1.5 border-[#c1647a]/30 text-[#c1647a] hover:bg-pink-50 hover:text-[#a84d63] font-semibold text-xs shadow-xs"
                  >
                    {showAllTransactions ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Réduire à 10 lignes
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Voir plus de lignes ({filteredTransactions.length} transactions)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Dialogue d'Exportation ─────────────────────── */}
      <ExportReportDialog
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        dataset={dataset}
        periodLabel={dataset.periodLabel}
        transactions={filteredTransactions}
      />

      {/* ── Dialogue de Détail de Transaction ─────────── */}
      <TransactionDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}

