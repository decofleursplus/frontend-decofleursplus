'use client';

import { use, useState, useEffect } from 'react';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';
import { getAdminCustomerById } from '@/lib/api/admin/customers';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, ShoppingBag, Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SendEmailDialog } from '@/components/admin/send-email-dialog';
import { CustomerCrmCard } from '@/components/admin/customer-crm-card';
import { toast } from 'sonner';

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await getAdminCustomerById(id);
        if (active) setCustomer(found);
      } catch (err) {
        if (active) {
          setCustomer(null);
          const msg = err instanceof ApiClientError ? err.message : 'Erreur lors du chargement du profil';
          toast.error(msg);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#24582d]" />
        <p className="text-gray-500 text-sm">Chargement du profil client...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">Client introuvable</h1>
        <p className="text-gray-500 mt-2">Le client demandé n&apos;existe pas ou a été supprimé.</p>
        <Button render={<Link href="/admin/clients" />} variant="cta" className="mt-6 bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs">
          Retour aux clients
        </Button>
      </div>
    );
  }

  // Find customer's orders
  const customerOrders = customer.recentOrders || [];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" render={<Link href="/admin/clients" />} className="h-9 w-9 shrink-0 rounded-xl border-[#e7e4dd]">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#1e2a1f]">Profil Client</h1>
            <p className="text-sm text-gray-500 truncate max-w-[220px] sm:max-w-none">{customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEmailModalOpen(true)}
            className="w-full sm:w-auto border-[#e7e4dd] text-gray-700 hover:text-[#24582d] hover:bg-[#edf8ef] hover:border-[#24582d]/30"
          >
            <Mail className="mr-2 h-4 w-4 text-[#24582d]" />
            Contacter par e-mail
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
                <span>{customer.address || 'Adresse non renseignée'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 pt-3 border-t border-[#f0eee8]">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Client depuis {formatDate(customer.joinedAt)}</span>
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
                <div className="text-2xl font-bold text-[#1e2a1f]">{customer.totalOrders}</div>
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
                  {formatCurrency(customer.totalSpent / Math.max(1, customer.totalOrders))}
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
                <>
                  {/* Desktop Orders Table */}
                  <div className="hidden sm:block">
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
                  </div>

                  {/* Mobile Orders Cards */}
                  <div className="sm:hidden space-y-2.5">
                    {customerOrders.map(order => (
                      <div key={order.id} className="p-3 bg-[#faf8f4] border border-[#e7e4dd] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <Link href={`/admin/commandes/${order.id}`} className="font-mono font-bold text-xs text-[#24582d] hover:underline">
                            {order.ref}
                          </Link>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f0ede6]">
                          <span className="text-gray-500">{formatDate(order.date)}</span>
                          <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#e7e4dd] rounded-lg">
                  Aucune commande trouvée pour ce client.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Fiche CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerCrmCard key={customer.id} customer={customer} onSaved={(c) => setCustomer((prev) => (prev ? { ...prev, ...c, recentOrders: prev.recentOrders } : c))} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Email Modal */}
      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        customer={customer}
      />
    </div>
  );
}
