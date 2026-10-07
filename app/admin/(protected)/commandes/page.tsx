'use client';

import { useState } from 'react';
import { adminOrders } from '@/lib/admin/mock-data/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, Truck, XCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState(adminOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    const statusLabels: Record<string, string> = {
      'en_preparation': 'En préparation',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };

    toast.success('Statut mis à jour', {
      description: `La commande est maintenant "${statusLabels[newStatus] || newStatus}".`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_preparation':
        return <Badge className="bg-[#fff8cc] text-[#9a7b00] hover:bg-[#fff8cc]/80 shadow-none border-none font-medium">En préparation</Badge>;
      case 'en_livraison':
        return <Badge className="bg-[#e5eaff] text-[#3d5a99] hover:bg-[#e5eaff]/80 shadow-none border-none font-medium">En livraison</Badge>;
      case 'livree':
        return <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7]/80 shadow-none border-none font-medium">Livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-[#ffe5e5] text-[#cc0000] hover:bg-[#ffe5e5]/80 shadow-none border-none font-medium">Annulée</Badge>;
      case 'remboursee':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-none border-none font-medium">Remboursée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDelivery = deliveryFilter === 'all' || 
                            (deliveryFilter === 'domicile' && order.deliveryMode.toLowerCase().includes('domicile')) ||
                            (deliveryFilter === 'boutique' && order.deliveryMode.toLowerCase().includes('boutique'));
    
    return matchesSearch && matchesStatus && matchesDelivery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion des commandes</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">
            Suivez et traitez les commandes de vos clients.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-[#e7e4dd] bg-transparent hover:bg-gray-50 text-gray-700 h-9 px-4 py-2 w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>
                  Tous les statuts
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'en_preparation'} onCheckedChange={() => setStatusFilter('en_preparation')}>
                  En préparation
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'en_livraison'} onCheckedChange={() => setStatusFilter('en_livraison')}>
                  En livraison
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'livree'} onCheckedChange={() => setStatusFilter('livree')}>
                  Livrée
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'annulee'} onCheckedChange={() => setStatusFilter('annulee')}>
                  Annulée
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filtrer par livraison</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={deliveryFilter === 'all'} onCheckedChange={() => setDeliveryFilter('all')}>
                  Toutes les livraisons
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={deliveryFilter === 'domicile'} onCheckedChange={() => setDeliveryFilter('domicile')}>
                  À domicile
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={deliveryFilter === 'boutique'} onCheckedChange={() => setDeliveryFilter('boutique')}>
                  Retrait en boutique
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e4dd] overflow-hidden">
        <Table>
          <TableHeader className="bg-transparent border-b border-[#e7e4dd]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-gray-500 py-4">Commande</TableHead>
              <TableHead className="font-medium text-gray-500 py-4">Date</TableHead>
              <TableHead className="font-medium text-gray-500 py-4">Client</TableHead>
              <TableHead className="font-medium text-gray-500 py-4">Livraison</TableHead>
              <TableHead className="font-medium text-gray-500 py-4">Total</TableHead>
              <TableHead className="font-medium text-gray-500 py-4">Statut</TableHead>
              <TableHead className="font-medium text-gray-500 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <TableCell className="py-4">
                  <div className="font-medium text-[#1e2a1f]">{order.ref}</div>
                  <div className="text-sm text-gray-500">{order.items.length} article(s)</div>
                </TableCell>
                <TableCell className="py-4 text-[#4a5568]">{formatDate(order.date)}</TableCell>
                <TableCell className="py-4">
                  <div className="font-medium text-[#1e2a1f]">{order.customerName}</div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="font-medium text-[#4a5568]">{order.deliveryMode}</div>
                  <div className="text-sm text-gray-400 max-w-[200px] truncate" title={order.deliveryAddress}>
                    {order.deliveryAddress}
                  </div>
                </TableCell>
                <TableCell className="py-4 font-semibold text-[#1e8b4d]">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="py-4">{getStatusBadge(order.status)}</TableCell>
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-[#1e2a1f] hover:bg-gray-100 transition-colors">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer font-medium p-0">
                          <Link href={`/admin/commandes/${order.id}`} className="flex items-center w-full px-2 py-1.5">
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            Détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium">
                          <Printer className="mr-2 h-4 w-4 text-gray-500" />
                          Imprimer facture
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider">Mettre à jour</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleUpdateStatus(order.id, 'en_livraison')}>
                          <Truck className="mr-2 h-4 w-4 text-[#3d5a99]" />
                          En livraison
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleUpdateStatus(order.id, 'livree')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-[#166534]" />
                          Marquer livrée
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 font-medium" onClick={() => handleUpdateStatus(order.id, 'annulee')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Annuler commande
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  Aucune commande ne correspond à vos critères.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
