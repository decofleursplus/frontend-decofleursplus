'use client';

import { useState } from 'react';
import type { AdminCoupon, CartRecoverySettings } from '@/lib/admin/mock-data/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sliders, Clock, Gift, CheckCircle2, Loader2, Mail } from 'lucide-react';

interface CartRecoveryConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CartRecoverySettings;
  /** Codes promo existants (seuls les codes actifs sont proposés pour la 2e relance) */
  coupons: AdminCoupon[];
  /** Résout à true si l'API a enregistré les réglages (la fenêtre se ferme alors). */
  onSave: (settings: CartRecoverySettings) => Promise<boolean>;
}

/** Réglages de la relance automatique : le formulaire repart des réglages enregistrés à chaque ouverture. */
export function CartRecoveryConfigDialog(props: CartRecoveryConfigDialogProps) {
  return <CartRecoveryForm key={props.isOpen ? 'ouvert' : 'ferme'} {...props} />;
}

function CartRecoveryForm({ isOpen, onOpenChange, settings, coupons, onSave }: CartRecoveryConfigDialogProps) {
  const [autoEnabled, setAutoEnabled] = useState(settings.autoEnabled);
  const [delay1, setDelay1] = useState(settings.delayHours1.toString());
  const [delay2, setDelay2] = useState(settings.delayHours2.toString());
  const [includeDiscount, setIncludeDiscount] = useState(settings.includeDiscount);
  const activeCoupons = coupons.filter((c) => c.status === 'actif');
  const storedCodeExists = activeCoupons.some((c) => c.code === settings.discountCode);
  const [discountCode, setDiscountCode] = useState(storedCodeExists ? settings.discountCode : activeCoupons[0]?.code ?? '');
  const [discountValue, setDiscountValue] = useState(settings.discountValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const describeCoupon = (c: AdminCoupon) =>
    c.type === 'percentage' ? `-${c.value} %` : c.type === 'fixed_amount' ? `-${c.value.toLocaleString('fr-FR')} FCFA` : 'Livraison offerte';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d1 = parseInt(delay1, 10);
    const d2 = parseInt(delay2, 10);
    if (!(d1 >= 1) || !(d2 >= 1)) return setError('Indiquez des délais en heures (1 minimum).');
    if (d2 <= d1) return setError('La 2e relance doit partir plus tard que la 1re.');
    if (includeDiscount && !discountCode) return setError('Choisissez le code promo à insérer, ou décochez l’offre.');
    setError(null);
    setSaving(true);
    const coupon = activeCoupons.find((c) => c.code === discountCode);
    const ok = await onSave({
      autoEnabled,
      delayHours1: d1,
      delayHours2: d2,
      includeDiscount,
      discountCode: includeDiscount ? discountCode : settings.discountCode,
      discountValue: (discountValue.trim() || (coupon ? describeCoupon(coupon) : '')).slice(0, 80),
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <Sliders className="h-5 w-5 text-[#c1647a]" />
              Relance automatique des paniers
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Le serveur vérifie les paniers toutes les 10 minutes et envoie les rappels par e-mail aux clients qui n’ont pas commandé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                {error}
              </p>
            )}

            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#e7e4dd] bg-[#fcfaf7] cursor-pointer">
              <span>
                <span className="font-bold text-gray-900 block text-xs">Activer les relances automatiques</span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" /> Envoi par e-mail ; les relances WhatsApp restent manuelles depuis la liste.
                </span>
              </span>
              <input type="checkbox" checked={autoEnabled} onChange={(e) => setAutoEnabled(e.target.checked)} className="h-4 w-4 accent-[#c1647a]" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cart-delay-1" className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  1re relance (heures)
                </Label>
                <Input id="cart-delay-1" type="number" min={1} max={72} value={delay1} onChange={(e) => setDelay1(e.target.value)} className="text-xs h-10 bg-white" />
                <span className="text-[10px] text-gray-400 block">Rappel du panier, sans code</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cart-delay-2" className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  2e relance (heures)
                </Label>
                <Input id="cart-delay-2" type="number" min={2} max={168} value={delay2} onChange={(e) => setDelay2(e.target.value)} className="text-xs h-10 bg-white" />
                <span className="text-[10px] text-gray-400 block">Rappel avec l’offre ci-dessous</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 -mt-2">Délais comptés depuis la dernière modification du panier par le client.</p>

            <div className="space-y-3 pt-2 border-t border-[#f0ede6]">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-[#c1647a]" />
                  Inclure un code promo dans la 2e relance
                </span>
                <input type="checkbox" checked={includeDiscount} onChange={(e) => setIncludeDiscount(e.target.checked)} className="h-4 w-4 accent-[#c1647a]" />
              </label>
              {includeDiscount &&
                (activeCoupons.length === 0 ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                    Aucun code promo actif : créez-en un dans l’onglet « Codes promo & Coupons », ou décochez l’offre.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cart-coupon" className="text-gray-600 text-xs block">
                        Code promo inséré
                      </Label>
                      <select
                        id="cart-coupon"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="w-full h-10 rounded-md border border-[#e7e4dd] bg-white px-2 font-mono text-xs font-bold"
                      >
                        {activeCoupons.map((c) => (
                          <option key={c.id} value={c.code}>
                            {c.code} ({describeCoupon(c)})
                          </option>
                        ))}
                      </select>
                      {!storedCodeExists && settings.discountCode && (
                        <span className="text-[10px] text-amber-700 block">Le code {settings.discountCode} enregistré n’existe pas ou n’est plus actif.</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cart-offer" className="text-gray-600 text-xs block">
                        Libellé de l’offre (optionnel)
                      </Label>
                      <Input
                        id="cart-offer"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="Ex : -10 % sur votre commande"
                        className="text-xs h-10 bg-white"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#f0ede6] gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-10 px-4 border-[#e7e4dd]">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5 gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
