'use client';

import { useState } from 'react';
import type { AdminCoupon, CouponType } from '@/lib/admin/mock-data/types';
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
import { Tag, Sparkles, Percent, Banknote, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCouponDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (coupon: AdminCoupon) => void;
}

export function CreateCouponDialog({
  isOpen,
  onOpenChange,
  onCreate,
}: CreateCouponDialogProps) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponType>('percentage');
  const [value, setValue] = useState('10');
  const [minOrder, setMinOrder] = useState('15000');
  const [maxUsageTotal, setMaxUsageTotal] = useState('200');
  const [maxUsagePerCustomer, setMaxUsagePerCustomer] = useState('1');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');

  const generateRandomCode = () => {
    const prefixes = ['PROMO', 'DECO', 'FLORAL', 'SALY', 'VIP', 'FESTIF'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCode(`${randomPrefix}${randomNum}`);
    toast.info('Code promotionnel généré automatiquement');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Veuillez renseigner un code promotionnel');
      return;
    }

    const numValue = type === 'free_shipping' ? 0 : parseFloat(value) || 0;
    if (type !== 'free_shipping' && numValue <= 0) {
      toast.error('Veuillez saisir une valeur de réduction valide');
      return;
    }

    const newCoupon: AdminCoupon = {
      id: `CPN-${Date.now().toString().slice(-4)}`,
      code: code.trim().toUpperCase(),
      type,
      value: numValue,
      minOrderAmount: minOrder ? parseFloat(minOrder) : undefined,
      maxUsageTotal: maxUsageTotal ? parseInt(maxUsageTotal, 10) : undefined,
      currentUsageCount: 0,
      maxUsagePerCustomer: maxUsagePerCustomer ? parseInt(maxUsagePerCustomer, 10) : 1,
      startDate,
      endDate,
      status: 'actif',
      revenueGenerated: 0,
      description: description.trim() || undefined,
    };

    onCreate(newCoupon);
    toast.success(`Code promo ${newCoupon.code} créé avec succès !`);
    onOpenChange(false);

    // Reset
    setCode('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-6 [&_[data-slot=dialog-close]]:right-6 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <Tag className="h-5 w-5 text-[#c1647a]" />
              Créer un code promo / coupon
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Définissez les règles et les conditions d&apos;application du coupon de réduction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {/* Code avec bouton générateur */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs">Code promotionnel *</Label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: BIENVENUE15, SAINTVALENTIN"
                  className="font-mono uppercase font-bold text-xs h-10 bg-white"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                  className="text-xs h-10 px-4 border-[#e7e4dd] shrink-0 gap-1.5 text-gray-700 hover:text-[#c1647a]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#c1647a]" />
                  Générer
                </Button>
              </div>
            </div>

            {/* Type de réduction */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs">Type d&apos;avantage *</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setType('percentage')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    type === 'percentage'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Percent className="h-4 w-4" />
                  <span className="text-xs font-semibold whitespace-nowrap">Pourcentage (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed_amount')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    type === 'fixed_amount'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  <span className="text-xs font-semibold whitespace-nowrap">Montant fixe (FCFA)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('free_shipping')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    type === 'free_shipping'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span className="text-xs font-semibold whitespace-nowrap">Livraison offerte</span>
                </button>
              </div>
            </div>

            {/* Valeur de réduction */}
            {type !== 'free_shipping' && (
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">
                  Valeur de la réduction {type === 'percentage' ? '(%)' : '(FCFA)'} *
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percentage' ? 'Ex: 15' : 'Ex: 5000'}
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>
            )}

            {/* Panier minimum et Limites */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Panier minimum (FCFA)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                  className="text-xs h-10 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Utilisations max totales
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={maxUsageTotal}
                  onChange={(e) => setMaxUsageTotal(e.target.value)}
                  placeholder="Illimité"
                  className="text-xs h-10 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Limite par client
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={maxUsagePerCustomer}
                  onChange={(e) => setMaxUsagePerCustomer(e.target.value)}
                  className="text-xs h-10 bg-white"
                />
              </div>
            </div>

            {/* Dates de validité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Date de début *
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                  Date d&apos;expiration *
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-10 bg-white"
                  required
                />
              </div>
            </div>

            {/* Description / Note interne */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">
                Description / Note interne
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Campagne partenaires presse ou remise abonnés"
                className="text-xs h-10 bg-white"
              />
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
              Créer le code promo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
