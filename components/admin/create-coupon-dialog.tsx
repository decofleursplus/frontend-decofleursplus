'use client';

import { useState } from 'react';
import type { CouponType } from '@/lib/admin/mock-data/types';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Sparkles, Percent, Banknote, Truck, Loader2 } from 'lucide-react';

/** Champs exacts attendus par POST /admin/marketing/coupons. */
export interface NewCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUsageTotal?: number;
  maxUsagePerCustomer?: number;
  startDate: string;
  endDate: string;
  description?: string;
  /** Affiché dans « Mes coupons » de tous les clients */
  isPublic?: boolean;
}

interface CreateCouponDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Résout à true si l'API a créé le code (le panneau se ferme alors). */
  onCreate: (coupon: NewCouponInput) => Promise<boolean>;
}

const TYPES: { value: CouponType; label: string; icon: React.ReactNode }[] = [
  { value: 'percentage', label: 'Pourcentage (%)', icon: <Percent className="h-4 w-4" /> },
  { value: 'fixed_amount', label: 'Montant fixe (FCFA)', icon: <Banknote className="h-4 w-4" /> },
  { value: 'free_shipping', label: 'Livraison offerte', icon: <Truck className="h-4 w-4" /> },
];

const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().split('T')[0];

/** Panneau latéral de création d'un code promo (le formulaire repart de zéro à chaque ouverture). */
export function CreateCouponDialog(props: CreateCouponDialogProps) {
  return <CouponDrawer key={props.isOpen ? 'ouvert' : 'ferme'} {...props} />;
}

function CouponDrawer({ isOpen, onOpenChange, onCreate }: CreateCouponDialogProps) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponType>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUsageTotal, setMaxUsageTotal] = useState('');
  const [maxUsagePerCustomer, setMaxUsagePerCustomer] = useState('1');
  const [startDate, setStartDate] = useState(() => isoDay(0));
  const [endDate, setEndDate] = useState(() => isoDay(30));
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const generateRandomCode = () => {
    const prefixes = ['PROMO', 'DECO', 'FLORAL', 'SALY', 'VIP', 'FESTIF'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    setCode(`${randomPrefix}${Math.floor(10 + Math.random() * 90)}`);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (code.trim().length < 2) next.code = 'Le code doit contenir au moins 2 caractères.';
    const num = Number(value);
    if (type !== 'free_shipping') {
      if (!value || !(num > 0)) next.value = 'Indiquez une valeur de réduction positive.';
      else if (type === 'percentage' && num > 100) next.value = 'Un pourcentage ne peut pas dépasser 100 %.';
    }
    if (!startDate) next.startDate = 'Date de début requise.';
    if (!endDate) next.endDate = 'Date de fin requise.';
    else if (startDate && endDate < startDate) next.endDate = 'La date de fin doit suivre la date de début.';
    if (maxUsagePerCustomer && !(Number(maxUsagePerCustomer) >= 1)) next.maxUsagePerCustomer = 'Minimum 1.';
    if (maxUsageTotal && !(Number(maxUsageTotal) >= 1)) next.maxUsageTotal = 'Minimum 1.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    const ok = await onCreate({
      code: code.trim().toUpperCase(),
      type,
      value: type === 'free_shipping' ? 0 : Number(value),
      minOrderAmount: minOrder ? Number(minOrder) : undefined,
      maxUsageTotal: maxUsageTotal ? Math.round(Number(maxUsageTotal)) : undefined,
      maxUsagePerCustomer: maxUsagePerCustomer ? Math.round(Number(maxUsagePerCustomer)) : undefined,
      startDate,
      endDate,
      description: description.trim() || undefined,
      isPublic,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  const fieldError = (key: string) => (errors[key] ? <p className="text-[11px] text-red-600">{errors[key]}</p> : null);

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      size="md"
      icon={<Tag size={20} />}
      title="Nouveau code promo"
      subtitle="Règles et conditions d’application du coupon."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-10 px-4 border-[#e7e4dd]">
            Annuler
          </Button>
          <Button type="submit" form="coupon-form" disabled={saving} className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5 gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer le code promo
          </Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={handleSubmit} noValidate className="space-y-5 text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="coupon-code" className="font-semibold text-gray-700 text-xs">
            Code promotionnel *
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="EX : BIENVENUE15"
              className="font-mono uppercase font-bold text-xs h-10 bg-white"
              maxLength={50}
            />
            <Button type="button" variant="outline" onClick={generateRandomCode} className="text-xs h-10 px-3 border-[#e7e4dd] shrink-0 gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#c1647a]" />
              Générer
            </Button>
          </div>
          {fieldError('code')}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="font-semibold text-gray-700 text-xs mb-1.5">Type d’avantage *</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={type === t.value}
                onClick={() => setType(t.value)}
                className={`p-3 rounded-xl border flex sm:flex-col items-center gap-2 transition-all ${
                  type === t.value ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold' : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                }`}
              >
                {t.icon}
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {type !== 'free_shipping' && (
          <div className="space-y-1.5">
            <Label htmlFor="coupon-value" className="font-semibold text-gray-700 text-xs">
              Valeur de la réduction {type === 'percentage' ? '(%)' : '(FCFA)'} *
            </Label>
            <Input
              id="coupon-value"
              type="number"
              min={1}
              max={type === 'percentage' ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'percentage' ? 'Ex : 15' : 'Ex : 5000'}
              className="text-xs h-10 bg-white"
            />
            {fieldError('value')}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-min" className="font-semibold text-gray-700 text-xs">
              Panier minimum (FCFA)
            </Label>
            <Input id="coupon-min" type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="Aucun" className="text-xs h-10 bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coupon-max" className="font-semibold text-gray-700 text-xs">
              Utilisations max.
            </Label>
            <Input id="coupon-max" type="number" min={1} value={maxUsageTotal} onChange={(e) => setMaxUsageTotal(e.target.value)} placeholder="Illimité" className="text-xs h-10 bg-white" />
            {fieldError('maxUsageTotal')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coupon-per-customer" className="font-semibold text-gray-700 text-xs">
              Limite par client
            </Label>
            <Input
              id="coupon-per-customer"
              type="number"
              min={1}
              value={maxUsagePerCustomer}
              onChange={(e) => setMaxUsagePerCustomer(e.target.value)}
              placeholder="Illimité"
              className="text-xs h-10 bg-white"
            />
            {fieldError('maxUsagePerCustomer')}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-start" className="font-semibold text-gray-700 text-xs">
              Date de début *
            </Label>
            <Input id="coupon-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs h-10 bg-white" />
            {fieldError('startDate')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coupon-end" className="font-semibold text-gray-700 text-xs">
              Date d’expiration *
            </Label>
            <Input id="coupon-end" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs h-10 bg-white" />
            {fieldError('endDate')}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coupon-description" className="font-semibold text-gray-700 text-xs">
            Description
          </Label>
          <Input
            id="coupon-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : -10 % sur toute la boutique pour la fête des mères"
            className="text-xs h-10 bg-white"
          />
        </div>

        <label className="flex items-start gap-2.5 rounded-xl border border-[#e7e4dd] bg-[#fcfaf7] p-3 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c1647a]" />
          <span>
            <span className="block font-semibold text-gray-800">Afficher dans « Mes coupons » des clients</span>
            <span className="text-[11px] text-gray-500">
              Les clients connectés voient ce code (et sa description) dans leur espace tant qu’il est actif.
            </span>
          </span>
        </label>
      </form>
    </AdminDrawer>
  );
}
