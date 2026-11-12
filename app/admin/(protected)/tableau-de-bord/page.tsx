'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus, Users, CreditCard, ShoppingBag, TrendingUp, Package, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getAdminDashboard, STOCK_LEVEL_LABELS, type DashboardData } from '@/lib/api/admin/dashboard';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, type BackendOrderStatus } from '@/lib/api/admin/orders';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

/** Variation vs même période du mois précédent : null quand la comparaison est impossible. */
function DeltaLine({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <p className="text-[11px] sm:text-xs text-gray-400 flex items-center mt-1 truncate">
        <Minus className="mr-0.5 h-3 w-3 shrink-0" />
        <span>Pas de comparaison (mois précédent vide)</span>
      </p>
    );
  }
  const positive = delta >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`text-[11px] sm:text-xs flex items-center mt-1 truncate ${positive ? 'text-green-600' : 'text-red-600'}`}>
      <Icon className="mr-0.5 h-3 w-3 shrink-0" />
      <span>
        {positive ? '+' : ''}
        {delta.toLocaleString('fr-FR')}%
      </span>
      <span className="text-gray-400 ml-1 hidden sm:inline">vs même période le mois dernier</span>
      <span className="text-gray-400 ml-1 sm:hidden">vs m-1</span>
    </p>
  );
}

function KpiCard({ title, icon, value, footer }: { title: string; icon: ReactNode; value: ReactNode; footer: ReactNode }) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-5 pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-3 sm:p-5 pt-0">
        <div className="text-base sm:text-2xl font-bold text-[#1e2a1f] truncate">{value}</div>
        {footer}
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-[160px] items-center justify-center text-center text-sm text-gray-400 px-4">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const key = status as BackendOrderStatus;
  const label = ORDER_STATUS_LABELS[key] ?? status;
  const style = ORDER_STATUS_STYLES[key] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${style}`}>{label}</span>;
}

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (context: TooltipItem<'line'>) => {
          const label = context.dataset.label ? `${context.dataset.label} : ` : '';
          return context.parsed.y !== null ? `${label}${formatCurrency(context.parsed.y)}` : label;
        },
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#888888', font: { size: 12 } } },
    y: {
      grid: { color: '#f3f4f6' },
      ticks: {
        color: '#888888',
        font: { size: 12 },
        callback: (value: string | number) => `${Number(value) / 1000}k`,
      },
    },
  },
};

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'doughnut'>) => ` ${context.label} : ${context.parsed}%`,
      },
    },
  },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Chaîne de promesses : les setState n'ont lieu que dans les callbacks, jamais pendant l'effet.
  const fetchDashboard = useCallback(
    () =>
      getAdminDashboard()
        .then((res) => {
          setData(res);
          setLoadError(null);
        })
        .catch((err: unknown) => {
          setLoadError(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord.');
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    []
  );

  const loadDashboard = () => {
    setRefreshing(true);
    return fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const salesPoints = data?.salesChart ?? [];
  const hasSales = salesPoints.some((p) => p.sales > 0);
  const lineChartData = {
    labels: salesPoints.map((d) => d.label),
    datasets: [
      {
        fill: true,
        label: 'Ventes',
        data: salesPoints.map((d) => d.sales),
        borderColor: '#c1647a',
        backgroundColor: 'rgba(193, 100, 122, 0.2)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const distribution = data?.orderDistribution ?? [];
  const doughnutData = {
    labels: distribution.map((d) => d.name),
    datasets: [
      {
        data: distribution.map((d) => d.value),
        backgroundColor: distribution.map((d) => d.color),
        borderWidth: 0,
      },
    ],
  };

  const recentOrders = data?.recentOrders ?? [];
  const topProducts = data?.topProducts ?? [];
  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header flex items-center justify-between">
        <div>
          <h1 className="admin-page-title">Tableau de bord</h1>
          <p className="admin-page-subtitle">Aperçu des performances de votre boutique Décofleur Plus (mois en cours).</p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboard()}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Le tableau de bord n’a pas pu être chargé.</p>
            <p className="text-xs mt-0.5">{loadError}</p>
          </div>
          <button type="button" onClick={() => loadDashboard()} className="text-xs font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#c1647a]" />
          <span className="text-sm">Chargement du tableau de bord…</span>
        </div>
      ) : data && kpis ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              title="Chiffre d’affaires"
              icon={<CreditCard className="h-4 w-4 text-[#c1647a] shrink-0" />}
              value={formatCurrency(kpis.revenue)}
              footer={<DeltaLine delta={kpis.revenueDelta} />}
            />
            <KpiCard
              title="Commandes"
              icon={<ShoppingBag className="h-4 w-4 text-[#c1647a] shrink-0" />}
              value={kpis.orders}
              footer={<DeltaLine delta={kpis.ordersDelta} />}
            />
            <KpiCard
              title="Clients"
              icon={<Users className="h-4 w-4 text-[#c1647a] shrink-0" />}
              value={kpis.customers}
              footer={
                <>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">
                    {kpis.newCustomers} nouveau{kpis.newCustomers > 1 ? 'x' : ''} ce mois-ci
                  </p>
                  <DeltaLine delta={kpis.customersDelta} />
                </>
              }
            />
            <KpiCard
              title="Produits actifs"
              icon={<Package className="h-4 w-4 text-[#c1647a] shrink-0" />}
              value={kpis.products}
              footer={
                <p className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">
                  {kpis.newProducts} ajouté{kpis.newProducts > 1 ? 's' : ''} ce mois-ci
                </p>
              }
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            {/* Chart */}
            <Card className="col-span-1 lg:col-span-4 shadow-2xs">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center text-sm sm:text-base text-[#1e2a1f]">
                  <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#c1647a] shrink-0" />
                  <span>Évolution des ventes (30 derniers jours)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-[220px] sm:h-[300px] w-full px-1 sm:px-4">
                  {hasSales ? <Line data={lineChartData} options={lineChartOptions} /> : <EmptyState>Aucune vente sur les 30 derniers jours.</EmptyState>}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders Table */}
            <Card className="col-span-1 lg:col-span-3 shadow-2xs">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Dernières commandes</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {recentOrders.length === 0 ? (
                  <EmptyState>Aucune commande pour le moment.</EmptyState>
                ) : (
                  <div className="overflow-x-auto max-h-[300px]">
                    <Table>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id} className="text-xs sm:text-sm">
                            <TableCell className="py-2.5 px-2">
                              <Link href={`/admin/commandes/${order.id}`} className="font-semibold text-[#1e2a1f] hover:text-[#c1647a] truncate block max-w-[110px] sm:max-w-none">
                                {order.customerName}
                              </Link>
                              <div className="text-[10.5px] text-gray-500">{order.ref}</div>
                            </TableCell>
                            <TableCell className="py-2.5 px-1.5">
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="py-2.5 px-2 text-right font-semibold text-[#24582d] whitespace-nowrap">
                              {formatCurrency(order.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="mt-3 sm:mt-4 flex justify-center border-t border-gray-100 pt-3">
                  <Link href="/admin/commandes" className="text-xs sm:text-sm font-semibold text-[#c1647a] hover:text-[#a95568] transition-colors">
                    Voir toutes les commandes →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            {/* Order Distribution Chart */}
            <Card className="col-span-1 lg:col-span-3 shadow-2xs">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Répartition des commandes</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {distribution.length === 0 ? (
                  <EmptyState>Aucune commande à répartir.</EmptyState>
                ) : (
                  <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-1/2 h-[180px] sm:h-[220px]">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="w-full sm:w-1/2 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-3 sm:pl-3">
                      {distribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 truncate">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-600 truncate">{item.name}</span>
                          </div>
                          <span className="font-semibold text-[#1e2a1f] shrink-0 ml-1" title={`${item.count} commande(s)`}>
                            {item.value.toLocaleString('fr-FR')}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="col-span-1 lg:col-span-4 shadow-2xs">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Produits les plus vendus</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {topProducts.length === 0 ? (
                  <EmptyState>Aucune vente enregistrée ce mois-ci.</EmptyState>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {topProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 border border-gray-100">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill unoptimized className="object-cover" />
                            ) : (
                              <Package className="absolute inset-0 m-auto h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-[#1e2a1f] truncate">{product.name}</div>
                            <div className="text-[10.5px] sm:text-xs text-gray-500 truncate">
                              {product.sales} vente{product.sales > 1 ? 's' : ''} •{' '}
                              <span
                                className={
                                  product.stockStatus === 'RUPTURE'
                                    ? 'text-red-600 font-medium'
                                    : product.stockStatus === 'STOCK_FAIBLE'
                                      ? 'text-amber-600 font-medium'
                                      : 'text-emerald-700'
                                }
                              >
                                {STOCK_LEVEL_LABELS[product.stockStatus] ?? product.stockStatus} ({product.stockQuantity})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold text-xs sm:text-sm text-[#24582d] shrink-0 text-right">{formatCurrency(product.revenue)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
