'use client';

import { use } from 'react';
import { adminCustomers } from '@/lib/admin/mock-data/customers';
import { adminOrders } from '@/lib/admin/mock-data/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, ShoppingBag, Gift } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customer = adminCustomers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">Client introuvable</h1>
        <p className="text-gray-500 mt-2">Le client demandé n&apos;existe pas.</p>
        <Button render={<Link href="/admin/clients" />} className="mt-6 bg-[#c1647a] hover:bg-[#a9576a] text-white">
          Retour aux clients
        </Button>
      </div>
    );
  }

  // Find customer's orders
  const customerOrders = adminOrders.filter(o => o.customerId === customer.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_preparation':
        return <Badge className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
      case 'en_livraison':
        return <Badge className="bg-blue-100 text-blue-800">En livraison</Badge>;
      case 'livree':
        return <Badge className="bg-green-100 text-green-800">Livrée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/admin/clients" />} className="h-9 w-9 rounded-xl border-[#e7e4dd]">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#1e2a1f]">Profil Client</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#e7e4dd] text-gray-600">
            <Mail className="mr-2 h-4 w-4" />
            Contacter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Column (CRM Profile) */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-[#edf8ef]">
                <AvatarFallback className="bg-[#edf8ef] text-[#24582d] text-2xl font-medium">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-[#1e2a1f]">{customer.name}</h2>
              <div className="mt-2 flex justify-center">
                {customer.segment === 'vip' ? (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Client VIP
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">
                    Client {customer.segment}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f] text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="hover:text-blue-600">{customer.email}</a>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${customer.phone}`} className="hover:text-blue-600">{customer.phone}</a>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 pt-3 border-t border-[#f0eee8]">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Client depuis {formatDate(customer.joinDate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Column (Order History & CRM Notes) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-6 w-6 text-gray-400 mb-2" />
                <div className="text-2xl font-bold text-[#1e2a1f]">{customer.ordersCount}</div>
                <div className="text-sm text-gray-500">Commandes au total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Gift className="h-6 w-6 text-[#c1647a] mb-2" />
                <div className="text-2xl font-bold text-[#1e2a1f]">{formatCurrency(customer.totalSpent)}</div>
                <div className="text-sm text-gray-500">Valeur à vie (LTV)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Star className="h-6 w-6 text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-[#1e2a1f]">
                  {formatCurrency(customer.totalSpent / Math.max(1, customer.ordersCount))}
                </div>
                <div className="text-sm text-gray-500">Panier moyen</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Historique des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link href={`/admin/commandes/${order.id}`} className="font-medium text-[#24582d] hover:underline">
                            {order.ref}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(order.date)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#e7e4dd] rounded-lg">
                  Aucune commande trouvée pour ce client.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Notes internes CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#faf8f4] p-4 rounded-md border border-[#e7e4dd] text-sm text-gray-600">
                {customer.segment === 'vip' 
                  ? "Client très fidèle. Offrir une carte de remerciement personnalisée avec chaque commande."
                  : "Pas de notes spécifiques pour ce client."}
              </div>
              <Button variant="outline" className="mt-4 text-xs h-8">Ajouter une note</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
