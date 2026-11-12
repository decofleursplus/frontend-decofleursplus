'use client';

import { useState } from 'react';
import type { CartRecoverySettings } from '@/lib/admin/mock-data/types';
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
import { Sliders, Clock, Gift, CheckCircle2 } from 'lucide-react';

interface CartRecoveryConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CartRecoverySettings;
  /** Résout à true si l'API a enregistré les réglages (la fenêtre se ferme alors). */
  onSave: (settings: CartRecoverySettings) => Promise<boolean>;
}

export function CartRecoveryConfigDialog({
  isOpen,
  onOpenChange,
  settings,
  onSave,
}: CartRecoveryConfigDialogProps) {
  const [autoEnabled, setAutoEnabled] = useState(settings.autoEnabled);
  const [delay1, setDelay1] = useState(settings.delayHours1.toString());
  const [delay2, setDelay2] = useState(settings.delayHours2.toString());
  const [includeDiscount, setIncludeDiscount] = useState(settings.includeDiscount);
  const [discountCode, setDiscountCode] = useState(settings.discountCode);
  const [discountValue, setDiscountValue] = useState(settings.discountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({
      autoEnabled,
      delayHours1: parseInt(delay1, 10) || 2,
      delayHours2: parseInt(delay2, 10) || 24,
      includeDiscount,
      discountCode: discountCode.trim().toUpperCase(),
      discountValue: discountValue.trim(),
    });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <Sliders className="h-5 w-5 text-[#c1647a]" />
              Configuration des relances automatiques
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Paramétrez les délais et l&apos;offre incitative pour récupérer les paniers abandonnés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {/* Toggle activation automatique */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e7e4dd] bg-[#fcfaf7]">
              <div>
                <span className="font-bold text-gray-900 block text-xs">
                  Activer la séquence automatique
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Envoie automatiquement les rappels WhatsApp / Email
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-[#c1647a] focus:ring-[#c1647a] cursor-pointer"
              />
            </div>

            {/* Délais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  1ère Relance (heures)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={delay1}
                  onChange={(e) => setDelay1(e.target.value)}
                  className="text-xs h-10 bg-white"
                />
                <span className="text-[10px] text-gray-400 block whitespace-nowrap">Rappel doux du panier</span>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  2ème Relance (heures)
                </Label>
                <Input
                  type="number"
                  min="12"
                  max="72"
                  value={delay2}
                  onChange={(e) => setDelay2(e.target.value)}
                  className="text-xs h-10 bg-white"
                />
                <span className="text-[10px] text-gray-400 block whitespace-nowrap">Rappel avec offre promo</span>
              </div>
            </div>

            {/* Offre incitative */}
            <div className="space-y-3 pt-2 border-t border-[#f0ede6]">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Gift className="h-3.5 w-3.5 text-[#c1647a]" />
                  Inclure un code promo incitatif (Relance 2)
                </Label>
                <input
                  type="checkbox"
                  checked={includeDiscount}
                  onChange={(e) => setIncludeDiscount(e.target.checked)}
                  className="h-4 w-4 rounded text-[#c1647a] focus:ring-[#c1647a] cursor-pointer"
                />
              </div>

              {includeDiscount && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 text-xs whitespace-nowrap block">Code promo inséré</Label>
                    <Input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="REVIENS10"
                      className="text-xs h-10 font-mono font-bold bg-white uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 text-xs whitespace-nowrap block">Libellé de l&apos;offre</Label>
                    <Input
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="-10% immédiat"
                      className="text-xs h-10 bg-white"
                    />
                  </div>
                </div>
              )}
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
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5 gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
