'use client';

import { useState } from 'react';
import { Banknote, CreditCard, Loader2, Save, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AdminShopSettings,
  PaymentMethodKey,
  PaymentSettings,
  UpdateShopSettingsPayload,
} from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

const METHODS: { key: PaymentMethodKey; label: string; desc: string; online: boolean; icon: typeof Smartphone }[] = [
  { key: 'wave', label: 'Wave', desc: 'Paiement mobile en ligne', online: true, icon: Smartphone },
  { key: 'orangeMoney', label: 'Orange Money', desc: 'Paiement mobile en ligne', online: true, icon: Smartphone },
  { key: 'card', label: 'Carte bancaire', desc: 'Visa / Mastercard en ligne', online: true, icon: CreditCard },
  { key: 'cash', label: 'Paiement à la livraison', desc: 'Espèces remises au livreur', online: false, icon: Banknote },
];

interface PaymentDraft {
  enabled: Record<PaymentMethodKey, boolean>;
  /** Saisie libre ; vide = pas de plafond */
  cashMaxAmount: string;
}

/** Même règle que le serveur : un moyen jamais configuré est considéré comme actif. */
function toDraft(payments: PaymentSettings): PaymentDraft {
  return {
    enabled: {
      wave: payments.wave?.enabled !== false,
      orangeMoney: payments.orangeMoney?.enabled !== false,
      card: payments.card?.enabled !== false,
      cash: payments.cash?.enabled !== false,
    },
    cashMaxAmount: payments.cash?.maxAmount != null ? String(payments.cash.maxAmount) : '',
  };
}

export function PaymentsTab({
  settings,
  canEdit,
  onSave,
}: {
  settings: AdminShopSettings;
  canEdit: boolean;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<AdminShopSettings>;
}) {
  const [draft, setDraft] = useState<PaymentDraft>(() => toDraft(settings.payments));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(settings.payments));
  const gateway = settings.paymentGateway;

  const handleSave = async () => {
    const localErrors: Record<string, string> = {};
    if (!Object.values(draft.enabled).some(Boolean)) {
      localErrors.global = 'Au moins un moyen de paiement doit rester actif.';
    }
    const rawMax = draft.cashMaxAmount.trim();
    const maxAmount = rawMax === '' ? null : Number(rawMax);
    if (maxAmount !== null && (!Number.isFinite(maxAmount) || maxAmount <= 0)) {
      localErrors['payments.cash.maxAmount'] = 'Indiquez un montant supérieur à 0, ou laissez vide pour aucun plafond.';
    }
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      toast.error(localErrors.global ?? 'Corrigez les champs signalés avant d’enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const updated = await onSave({
        payments: {
          wave: { enabled: draft.enabled.wave },
          orangeMoney: { enabled: draft.enabled.orangeMoney },
          card: { enabled: draft.enabled.card },
          cash: { enabled: draft.enabled.cash, maxAmount },
        },
      });
      setDraft(toDraft(updated.payments));
      setErrors({});
      toast.success('Moyens de paiement enregistrés.');
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'Les moyens de paiement n’ont pas pu être enregistrés.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Moyens de paiement</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Moyens proposés aux clients et plafond du paiement à la livraison.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving || !dirty}
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2 text-xs">
        {!canEdit && <ReadOnlyNote />}

        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3.5 ${
            gateway.configured ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/70'
          }`}
        >
          <div className="space-y-0.5">
            <div className="font-semibold text-gray-900">Agrégateur de paiement en ligne : {gateway.provider}</div>
            <p className="text-[11px] text-gray-600">
              {gateway.configured
                ? 'Clé API configurée sur le serveur : Wave, Orange Money et la carte sont encaissés via l’agrégateur.'
                : 'Aucune clé API sur le serveur : les paiements en ligne (Wave, Orange Money, carte) sont simulés et ne sont pas encaissés. Seul le paiement à la livraison fonctionne réellement.'}
            </p>
          </div>
          <Badge
            className={
              gateway.configured
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0'
                : 'bg-amber-100 text-amber-800 border-amber-200 shrink-0'
            }
          >
            {gateway.configured ? 'Actif' : 'Non configuré'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.key}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#c1647a]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">{method.label}</div>
                    <div className="text-[11px] text-gray-500">
                      {method.desc}
                      {method.online && !gateway.configured && ' — simulé'}
                    </div>
                  </div>
                </div>
                <Switch
                  aria-label={method.label}
                  checked={draft.enabled[method.key]}
                  disabled={!canEdit}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({ ...prev, enabled: { ...prev.enabled, [method.key]: checked } }))
                  }
                />
              </div>
            );
          })}
        </div>
        <FieldError message={errors.global} />

        <div className="space-y-1.5 pt-2 border-t border-gray-100 max-w-sm">
          <Label htmlFor="cashMaxAmount" className="font-semibold text-gray-700">
            Plafond du paiement à la livraison (FCFA)
          </Label>
          <Input
            id="cashMaxAmount"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Aucun plafond"
            value={draft.cashMaxAmount}
            disabled={!canEdit || !draft.enabled.cash}
            onChange={(e) => setDraft((prev) => ({ ...prev, cashMaxAmount: e.target.value }))}
            className="h-9 text-xs"
          />
          <FieldError message={errors['payments.cash.maxAmount']} />
        </div>

        <InfoNote>
          Ces choix s&apos;appliquent immédiatement : la vitrine ne propose que les moyens activés, et le serveur refuse
          une commande avec un moyen désactivé ou un paiement à la livraison au-delà du plafond.
        </InfoNote>
      </CardContent>
    </Card>
  );
}
