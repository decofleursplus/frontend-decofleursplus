'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Upload, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createAdminProduct } from '@/lib/api/admin/products';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || '';
    const price = Number(formData.get('price')) || 0;
    const promoPrice = formData.get('promo') ? Number(formData.get('promo')) : undefined;
    const sku = (formData.get('sku') as string) || '';
    const stock = Number(formData.get('stock')) || 0;
    const statusVal = (formData.get('status') as string) === 'actif' ? 'ACTIVE' : 'HIDDEN';
    const category = (formData.get('category') as string) || 'bouquets';

    try {
      await createAdminProduct({
        name,
        description,
        categoryId: category,
        basePrice: price,
        promoPrice,
        status: statusVal,
        variants: [
          {
            name: 'Standard',
            sku: sku || `PRD-${Date.now().toString().slice(-6)}`,
            price,
            stock,
          },
        ],
      });
      toast.success('Produit créé avec succès !');
      router.push('/admin/produits');
    } catch {
      toast.error('Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" render={<Link href="/admin/produits" />} className="h-9 w-9 shrink-0 rounded-xl border-[#e7e4dd]">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#1e2a1f]">Ajouter un produit</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" render={<Link href="/admin/produits" />} className="border-[#e7e4dd] text-gray-600 flex-1 sm:flex-initial">
            Annuler
          </Button>
          <Button 
            type="submit"
            form="new-product-form"
            variant="cta"
            className="bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs flex-1 sm:flex-initial" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-white" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="new-product-form" onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
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
                <Input id="name" name="name" placeholder="Ex: Bouquet Élégance Rose" required className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  name="description"
                  rows={5}
                  className="flex w-full rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#24582d]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Décrivez votre produit en détail..."
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
                  <Input id="price" name="price" type="number" placeholder="0" required className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo">Prix promotionnel (optionnel)</Label>
                  <Input id="promo" name="promo" type="number" placeholder="0" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Référence (SKU)</Label>
                  <Input id="sku" name="sku" placeholder="Ex: BOU-001" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Quantité en stock</Label>
                  <Input id="stock" name="stock" type="number" placeholder="0" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
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
                  name="status"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#24582d]/20"
                >
                  <option value="actif">Actif</option>
                  <option value="brouillon">Brouillon</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select 
                  id="category" 
                  name="category"
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
              <CardDescription>Format JPG, PNG. Max 5Mo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-[#e7e4dd] rounded-xl p-6 text-center hover:bg-[#faf8f4] transition-colors cursor-pointer flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center text-gray-500">
                  <ImageIcon size={20} />
                </div>
                <div className="text-sm font-medium text-gray-700">Cliquez pour ajouter des images</div>
                <div className="text-xs text-gray-400">ou glissez-déposez ici</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
