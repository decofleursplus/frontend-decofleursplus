'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardKpis, salesChartData } from '@/lib/admin/mock-data';
import { adminOrders } from '@/lib/admin/mock-data/orders';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, ShoppingBag, TrendingUp, Package } from 'lucide-react';
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
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En préparation</Badge>;
      case 'en_livraison':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">En livraison</Badge>;
      case 'livree':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const lineChartData = {
    labels: salesChartData.map(d => d.label),
    datasets: [
      {
        fill: true,
        label: 'Ventes',
        data: salesChartData.map(d => d.sales),
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

  const orderDistributionDataArray = [
    { name: 'Livrées', value: 59, color: '#22c55e' },
    { name: 'En préparation', value: 19, color: '#eab308' },
    { name: 'En livraison', value: 9, color: '#3b82f6' },
    { name: 'Annulées', value: 8, color: '#ef4444' },
    { name: 'Remboursées', value: 5, color: '#6b7280' },
  ];

  const doughnutData = {
    labels: orderDistributionDataArray.map(d => d.name),
    datasets: [
      {
        data: orderDistributionDataArray.map(d => d.value),
        backgroundColor: orderDistributionDataArray.map(d => d.color),
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tableau de bord</h1>
          <p className="admin-page-subtitle">
            Aperçu des performances de votre boutique Décofleur Plus.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chiffre d&apos;affaires</CardTitle>
            <CreditCard className="h-4 w-4 text-[#c1647a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e2a1f]">{formatCurrency(dashboardKpis.revenue)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{dashboardKpis.revenueDelta}% <span className="text-gray-400 ml-1">par rapport au mois dernier</span>
            </p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#c1647a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e2a1f]">{dashboardKpis.orders}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{dashboardKpis.ordersDelta}% <span className="text-gray-400 ml-1">par rapport au mois dernier</span>
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clients</CardTitle>
            <Users className="h-4 w-4 text-[#c1647a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e2a1f]">{dashboardKpis.customers}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{dashboardKpis.customersDelta}% <span className="text-gray-400 ml-1">par rapport au mois dernier</span>
            </p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produits Actifs</CardTitle>
            <Package className="h-4 w-4 text-[#c1647a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e2a1f]">{dashboardKpis.products}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{dashboardKpis.productsDelta}% <span className="text-gray-400 ml-1">par rapport au mois dernier</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center text-[#1e2a1f]">
              <TrendingUp className="mr-2 h-5 w-5 text-[#c1647a]" />
              Évolution des ventes (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full px-4">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-[#1e2a1f]">Dernières commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableBody>
                  {adminOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium text-[#1e2a1f]">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.ref}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-medium text-[#24582d]">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
              <Link 
                href="/admin/commandes" 
                className="text-sm font-medium text-[#c1647a] hover:text-[#a95568] transition-colors"
              >
                Voir toutes les commandes
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Order Distribution Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-[#1e2a1f]">Répartition des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] mt-4 flex items-center justify-between">
              <div className="w-1/2 h-full">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="w-1/2 space-y-4 pl-4">
                {orderDistributionDataArray.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-[#1e2a1f]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-[#1e2a1f]">Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Bouquet Élégance Rose', sales: 124, revenue: 3100000, stock: 'En stock', image: '/images/bouquet-passion.jpg' },
                { name: 'Panier de Fruits', sales: 85, revenue: 1530000, stock: 'Faible', image: '/images/fruits.jpg' },
                { name: 'Orchidée Phalaenopsis', sales: 62, revenue: 1860000, stock: 'En stock', image: '/images/orchidee.jpg' },
                { name: 'Plante Monstera', sales: 45, revenue: 540000, stock: 'En stock', image: '/images/plante-monstera.jpg' },
              ].map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden relative shrink-0">
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2a1f]">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.sales} ventes — {product.stock}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-[#24582d]">
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
