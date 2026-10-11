'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminProducts } from '@/lib/admin/mock-data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const product = adminProducts.find(p => p.id === id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">Produit introuvable</h1>
        <p className="text-gray-500 mt-2">Le produit demandé n&apos;existe pas.</p>
        <Button render={<Link href="/admin/produits" />} variant="cta" className="mt-6 bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs">
          Retour aux produits
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate save
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/admin/produits');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/admin/produits" />} className="h-9 w-9 rounded-xl border-[#e7e4dd]">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#1e2a1f]">Modifier le produit</h1>
            <p className="text-sm text-gray-500">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button 
            variant="cta"
            className="bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4 text-white" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input 
                  id="name" 
                  defaultValue={product.name} 
                  required 
                  className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  rows={5}
                  defaultValue={product.description}
                  className="flex w-full rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#24582d]/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Prix et Inventaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    defaultValue={product.price} 
                    required 
                    className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo">Prix promotionnel</Label>
                  <Input 
                    id="promo" 
                    type="number" 
                    defaultValue={product.promoPrice || ''}
                    className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Référence (SKU)</Label>
                  <Input 
                    id="sku" 
                    defaultValue={product.sku}
                    className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Quantité en stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    defaultValue={product.stock}
                    className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status & Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Organisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select 
                  id="status" 
                  defaultValue={product.status}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#24582d]/20"
                >
                  <option value="actif">Actif</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="rupture">Rupture</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select 
                  id="category" 
                  defaultValue={product.category.toLowerCase()}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#24582d]/20"
                >
                  <option value="bouquets">Bouquets</option>
                  <option value="plantes">Plantes</option>
                  <option value="fruits">Fruits & Légumes</option>
                  <option value="cadeaux">Cadeaux</option>
                  <option value="mariages">Mariages & Événements</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.image && (
                <div className="relative aspect-square w-full rounded-md overflow-hidden border border-[#e7e4dd]">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                </div>
              )}
              <div className="border-2 border-dashed border-[#e7e4dd] rounded-xl p-4 text-center hover:bg-[#faf8f4] transition-colors cursor-pointer flex flex-col items-center gap-1">
                <ImageIcon size={16} className="text-gray-400" />
                <div className="text-xs font-medium text-gray-700">Ajouter une image</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
