'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, ShoppingBag, TrendingUp, Package, RefreshCw, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getAdminDashboard, DashboardData } from '@/lib/api/admin/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Erreur chargement dashboard admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_preparation':
      case 'PREPARATION':
      case 'PROCESSING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En préparation</Badge>;
      case 'en_livraison':
      case 'SHIPPED':
      case 'IN_DELIVERY':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">En livraison</Badge>;
      case 'livree':
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Livrée</Badge>;
      case 'annulee':
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const salesPoints = data?.salesChart || [];
  const lineChartData = {
    labels: salesPoints.map(d => d.label),
    datasets: [
      {
        fill: true,
        label: 'Ventes',
        data: salesPoints.map(d => d.sales),
        borderColor: '#c1647a',
        backgroundColor: 'rgba(193, 100, 122, 0.2)', // Pink with opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#888888',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#888888',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return value / 1000 + 'k';
          }
        }
      }
    }
  };

  const orderDistributionList = data?.orderDistribution || [
    { name: 'Livrées', value: 59, color: '#22c55e', count: 75 },
    { name: 'En préparation', value: 19, color: '#eab308', count: 25 },
    { name: 'En livraison', value: 9, color: '#3b82f6', count: 12 },
    { name: 'Annulées', value: 8, color: '#ef4444', count: 10 },
    { name: 'Remboursées', value: 5, color: '#6b7280', count: 6 },
  ];

  const doughnutData = {
    labels: orderDistributionList.map(d => d.name),
    datasets: [
      {
        data: orderDistributionList.map(d => d.value),
        backgroundColor: orderDistributionList.map(d => d.color),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return ' ' + context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header flex items-center justify-between">
        <div>
          <h1 className="admin-page-title">Tableau de bord</h1>
          <p className="admin-page-subtitle">
            Aperçu des performances de votre boutique Décofleur Plus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#c1647a]' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Revenue */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-5 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Chiffre d&apos;affaires</CardTitle>
            <CreditCard className="h-4 w-4 text-[#c1647a] shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0">
            <div className="text-base sm:text-2xl font-bold text-[#1e2a1f] truncate">
              {formatCurrency(data?.kpis?.revenue ?? 0)}
            </div>
            <p className="text-[11px] sm:text-xs text-green-600 flex items-center mt-1 truncate">
              <ArrowUpRight className="mr-0.5 h-3 w-3 shrink-0" />
              <span>+{(data?.kpis?.revenueDelta ?? 0)}%</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">par rapport au mois dernier</span>
              <span className="text-gray-400 ml-1 sm:hidden">vs m-1</span>
            </p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-5 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#c1647a] shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0">
            <div className="text-base sm:text-2xl font-bold text-[#1e2a1f]">
              {data?.kpis?.orders ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-green-600 flex items-center mt-1 truncate">
              <ArrowUpRight className="mr-0.5 h-3 w-3 shrink-0" />
              <span>+{(data?.kpis?.ordersDelta ?? 0)}%</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">par rapport au mois dernier</span>
              <span className="text-gray-400 ml-1 sm:hidden">vs m-1</span>
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-5 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Clients</CardTitle>
            <Users className="h-4 w-4 text-[#c1647a] shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0">
            <div className="text-base sm:text-2xl font-bold text-[#1e2a1f]">
              {data?.kpis?.customers ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-green-600 flex items-center mt-1 truncate">
              <ArrowUpRight className="mr-0.5 h-3 w-3 shrink-0" />
              <span>+{(data?.kpis?.customersDelta ?? 0)}%</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">par rapport au mois dernier</span>
              <span className="text-gray-400 ml-1 sm:hidden">vs m-1</span>
            </p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-5 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Produits Actifs</CardTitle>
            <Package className="h-4 w-4 text-[#c1647a] shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0">
            <div className="text-base sm:text-2xl font-bold text-[#1e2a1f]">
              {data?.kpis?.products ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-green-600 flex items-center mt-1 truncate">
              <ArrowUpRight className="mr-0.5 h-3 w-3 shrink-0" />
              <span>+{(data?.kpis?.productsDelta ?? 0)}%</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">par rapport au mois dernier</span>
              <span className="text-gray-400 ml-1 sm:hidden">vs m-1</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-1 lg:col-span-4 shadow-2xs">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center text-sm sm:text-base text-[#1e2a1f]">
              <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#c1647a] shrink-0" />
              <span>Évolution des ventes (30 jours)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[220px] sm:h-[300px] w-full px-1 sm:px-4">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="col-span-1 lg:col-span-3 shadow-2xs">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Dernières commandes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="overflow-x-auto max-h-[300px]">
              <Table>
                <TableBody>
                  {(data?.recentOrders && data.recentOrders.length > 0 ? data.recentOrders : []).map((order) => (
                    <TableRow key={order.id} className="text-xs sm:text-sm">
                      <TableCell className="py-2.5 px-2">
                        <div className="font-semibold text-[#1e2a1f] truncate max-w-[110px] sm:max-w-none">
                          {order.customerName}
                        </div>
                        <div className="text-[10.5px] text-gray-500">{order.ref}</div>
                      </TableCell>
                      <TableCell className="py-2.5 px-1.5">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="py-2.5 px-2 text-right font-semibold text-[#24582d] whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 sm:mt-4 flex justify-center border-t border-gray-100 pt-3">
              <Link 
                href="/admin/commandes" 
                className="text-xs sm:text-sm font-semibold text-[#c1647a] hover:text-[#a95568] transition-colors"
              >
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
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-1/2 h-[180px] sm:h-[220px]">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="w-full sm:w-1/2 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-3 sm:pl-3">
                {orderDistributionList.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-[#1e2a1f] shrink-0 ml-1">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-1 lg:col-span-4 shadow-2xs">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-4 sm:space-y-6">
              {(data?.topProducts && data.topProducts.length > 0 ? data.topProducts : [
                { id: '1', name: 'Bouquet Élégance Rose', sales: 124, revenue: 3100000, stock: 'En stock', image: '/images/bouquet-passion.jpg' },
                { id: '2', name: 'Panier de Fruits', sales: 85, revenue: 1530000, stock: 'Faible', image: '/images/fruits.jpg' },
                { id: '3', name: 'Orchidée Phalaenopsis', sales: 62, revenue: 1860000, stock: 'En stock', image: '/images/orchidee.jpg' },
                { id: '4', name: 'Plante Monstera', sales: 45, revenue: 540000, stock: 'En stock', image: '/images/plante-monstera.jpg' },
              ]).map((product, i) => (
                <div key={product.id || i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 border border-gray-100">
                      <Image 
                        src={product.image || '/images/bouquet-passion.jpg'} 
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-[#1e2a1f] truncate">
                        {product.name}
                      </div>
                      <div className="text-[10.5px] sm:text-xs text-gray-500 truncate">
                        {product.sales} ventes • <span className={product.stock === 'Faible' ? 'text-amber-600 font-medium' : 'text-emerald-700'}>{product.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-[#24582d] shrink-0 text-right">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
