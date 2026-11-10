'use client';

import { useState, useEffect } from 'react';
import type { AdminPromotion, PromotionTargetType } from '@/lib/admin/mock-data/types';
import { getAdminCategories } from '@/lib/api/admin/categories';
import { getAdminProducts } from '@/lib/api/admin/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgePercent, FolderTree, Package, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePromotionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (promotion: AdminPromotion) => void;
}

export function CreatePromotionDialog({
  isOpen,
  onOpenChange,
  onCreate,
}: CreatePromotionDialogProps) {
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<PromotionTargetType>('categories');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<string[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [discount, setDiscount] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function fetchTargets() {
      setIsLoadingTargets(true);
      try {
        const [cats, prods] = await Promise.all([
          getAdminCategories(),
          getAdminProducts({ limit: 50 }),
        ]);
        if (isMounted) {
          if (cats && cats.length > 0) {
            setCategoriesList(cats.map((c) => c.name));
          }
          if (prods && prods.items && prods.items.length > 0) {
            setProductsList(prods.items.map((p) => p.name));
          }
        }
      } catch (err) {
        console.warn('Erreur chargement cibles promotion:', err);
      } finally {
        if (isMounted) setIsLoadingTargets(false);
      }
    }
    fetchTargets();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const toggleTarget = (item: string) => {
    setSelectedTargets((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDiscountChange = (val: string) => {
    setDiscount(val);
    if (val) {
      setBadgeText(`Offre Spéciale -${val}%`);
    } else {
      setBadgeText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez renseigner un nom pour cette promotion');
      return;
    }

    if (selectedTargets.length === 0) {
      toast.error('Veuillez sélectionner au moins une cible');
      return;
    }

    const numDiscount = parseInt(discount, 10);
    if (!numDiscount || numDiscount <= 0 || numDiscount > 90) {
      toast.error('Veuillez spécifier une réduction entre 1% et 90%');
      return;
    }

    const newPromo: AdminPromotion = {
      id: `PRM-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      targetType,
      targetNames: selectedTargets,
      discountPercentage: numDiscount,
      startDate,
      endDate,
      badgeText: badgeText.trim() || `-${numDiscount}%`,
      status: 'active',
      salesCount: 0,
      revenueGenerated: 0,
    };

    onCreate(newPromo);
    toast.success(`Promotion "${newPromo.name}" activée sur le catalogue !`);
    onOpenChange(false);

    // Reset
    setName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <BadgePercent className="h-5 w-5 text-[#c1647a]" />
              Lancer une promotion directe (Catalogue)
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Appliquez une remise automatique sans code sur des catégories ou produits précis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {/* Nom de l'opération */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Nom de la promotion *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Semaine de la Rose, Vente Flash Week-end"
                className="text-xs h-10 bg-white"
                required
              />
            </div>

            {/* Type de ciblage */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Cible de la réduction *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('categories');
                    setSelectedTargets([]);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    targetType === 'categories'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  <span className="text-xs font-semibold whitespace-nowrap">Par Catégories</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('products');
                    setSelectedTargets([]);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    targetType === 'products'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-semibold whitespace-nowrap">Par Produits</span>
                </button>
              </div>
            </div>

            {/* Sélection des cibles */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Sélectionnez les {targetType === 'categories' ? 'catégories' : 'produits'} concernés *
                </Label>
                {selectedTargets.length > 0 && (
                  <span className="text-[11px] text-[#c1647a] font-medium">
                    {selectedTargets.length} sélectionné(s)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl custom-modal-scroll min-h-[50px] items-center">
                {isLoadingTargets ? (
                  <div className="flex items-center justify-center w-full py-2 gap-2 text-xs text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#c1647a]" />
                    <span>Chargement des options...</span>
                  </div>
                ) : (targetType === 'categories' ? categoriesList : productsList).length === 0 ? (
                  <p className="text-xs text-gray-400 py-1 italic w-full text-center">
                    Aucun(e) {targetType === 'categories' ? 'catégorie' : 'produit'} disponible.
                  </p>
                ) : (
                  (targetType === 'categories' ? categoriesList : productsList).map((item) => {
                    const isSelected = selectedTargets.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleTarget(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#c1647a] text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-[#e7e4dd] hover:bg-gray-100'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        <span className="whitespace-nowrap">{item}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pourcentage et Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Pourcentage de réduction (%) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="15"
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Badge affiché en boutique</Label>
                <Input
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Ex: -20% Vente Flash"
                  className="text-xs h-10 bg-white"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Date de début *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Date de fin *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#f0ede6] gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-10 px-4 border-[#e7e4dd]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5"
            >
              Appliquer la promotion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
