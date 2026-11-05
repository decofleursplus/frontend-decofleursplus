'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createAdminProduct } from '@/lib/api/admin/products';
import { getAdminCategories } from '@/lib/api/admin/categories';
import type { AdminCategory } from '@/lib/admin/mock-data/types';
import { ImageUploader } from '@/components/admin/image-uploader';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAdminCategories();
        if (active) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Erreur chargement des catégories:', err);
      } finally {
        if (active) setLoadingCategories(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || '';
    const price = Number(formData.get('price')) || 0;
    const promoPrice = formData.get('promo') ? Number(formData.get('promo')) : undefined;
    const sku = (formData.get('sku') as string)?.trim() || '';
    const stock = Number(formData.get('stock')) || 0;
    const statusVal = (formData.get('status') as string) === 'actif' ? 'ACTIVE' : 'HIDDEN';
    const category = (formData.get('category') as string) || (categories[0]?.id || 'bouquets');

    try {
      await createAdminProduct({
        name,
        description,
        categoryId: category,
        basePrice: price,
        promoPrice,
        status: statusVal,
        featuredImage: primaryImage || images[0] || null,
        images,
        variants: [
          {
            name: 'Standard',
            sku: sku || `PRD-${Date.now().toString().slice(-6)}`,
            price,
            stockQuantity: stock,
          },
        ],
      });
      toast.success('Produit créé avec succès !');
      router.push('/admin/produits');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du produit');
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
                <Label htmlFor="name">Nom du produit <span className="text-[#c1647a]">*</span></Label>
                <Input id="name" name="name" placeholder="Ex: Bouquet Élégance Rose" required className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-[#c1647a]">*</span></Label>
                <textarea 
                  id="description" 
                  name="description"
                  rows={5}
                  required
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
                  <Label htmlFor="price">Prix (FCFA) <span className="text-[#c1647a]">*</span></Label>
                  <Input id="price" name="price" type="number" min="0" placeholder="0" required className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo">Prix promotionnel (optionnel)</Label>
                  <Input id="promo" name="promo" type="number" min="0" placeholder="0" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Référence (SKU)</Label>
                  <Input id="sku" name="sku" placeholder="Ex: BOU-001" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Quantité en stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="0" className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20" />
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
                  disabled={loadingCategories}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-[#e7e4dd] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#24582d]/20"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="bouquets">Bouquets</option>
                      <option value="plantes">Plantes</option>
                      <option value="fruits">Fruits & Légumes</option>
                      <option value="cadeaux">Cadeaux</option>
                      <option value="mariages">Mariages & Événements</option>
                    </>
                  )}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Galerie Photos</CardTitle>
              <CardDescription>Format JPG, PNG, WebP. Max 5 Mo par image.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                multiple
                folder="products"
                maxFiles={10}
                value={images}
                onChange={setImages}
                primaryImage={primaryImage}
                onPrimaryChange={setPrimaryImage}
                description="Glissez vos photos ou cliquez pour parcourir. Vous pouvez définir la photo principale d'un clic."
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
