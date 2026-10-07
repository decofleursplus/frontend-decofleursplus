'use client';

import { useState } from 'react';
import { adminCustomers } from '@/lib/admin/mock-data/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreHorizontal, Eye, Mail, Star } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Star className="w-3 h-3 mr-1 fill-current" /> VIP</Badge>;
      case 'regulier':
        return <Badge className="bg-blue-100 text-blue-800">Régulier</Badge>;
      case 'nouveau':
        return <Badge className="bg-green-100 text-green-800">Nouveau</Badge>;
      case 'inactif':
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
      default:
        return <Badge>{segment}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredCustomers = adminCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clients & CRM</h1>
          <p className="admin-page-subtitle">
            Gérez votre base de données clients et identifiez vos meilleurs acheteurs.
          </p>
        </div>
        <Button className="bg-[#c1647a] hover:bg-[#a9576a] text-white">
          Exporter (CSV)
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="border-[#e7e4dd] text-gray-600 w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Segment
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e4dd] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Commandes</TableHead>
              <TableHead className="text-right">Total dépensé</TableHead>
              <TableHead className="text-right">Dernière commande</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-[#e7e4dd]">
                      <AvatarFallback className="bg-[#edf8ef] text-[#24582d] font-medium">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-[#1e2a1f]">{customer.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-700">{customer.email}</div>
                  <div className="text-xs text-gray-500">{customer.phone}</div>
                </TableCell>
                <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                <TableCell className="text-right font-medium text-gray-700">
                  {customer.ordersCount}
                </TableCell>
                <TableCell className="text-right font-medium text-[#24582d]">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-[#24582d] hover:bg-gray-100 transition-colors">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" render={<Link href={`/admin/clients/${customer.id}`} />}>
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          Envoyer un e-mail
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
