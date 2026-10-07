'use client';

import { useState } from 'react';
import { adminProducts } from '@/lib/admin/mock-data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Actif</Badge>;
      case 'brouillon':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Brouillon</Badge>;
      case 'rupture':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rupture</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredProducts = adminProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des produits</h1>
          <p className="admin-page-subtitle">
            Gérez votre catalogue de fleurs, plantes et cadeaux.
          </p>
        </div>
        <Button className="bg-[#c1647a] hover:bg-[#a9576a] text-white" render={<Link href="/admin/produits/nouveau" />}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e7e4dd]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e7e4dd] focus-visible:ring-[#24582d]/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="border-[#e7e4dd] text-gray-600 w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e4dd] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#faf8f4]">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-[#e7e4dd]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 absolute inset-0 flex items-center justify-center">Aucune</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[#1e2a1f]">{product.name}</div>
                  <div className="text-xs text-gray-500">Réf: {product.sku}</div>
                </TableCell>
                <TableCell className="text-gray-600">{product.category}</TableCell>
                <TableCell className="text-right font-medium text-[#24582d]">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-gray-500" />
                          Voir sur le site
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" render={<Link href={`/admin/produits/${product.id}`} />}>
                            <Edit className="mr-2 h-4 w-4 text-blue-500" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Aucun produit trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
