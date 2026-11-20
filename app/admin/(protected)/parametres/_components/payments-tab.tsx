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
  PaymentGatewayCode,
  PaymentGatewayMode,
  PaymentGatewayStatus,
  PaymentMethodKey,
  UpdateShopSettingsPayload,
} from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

const METHODS: { key: PaymentMethodKey; label: string; desc: string; online: boolean; icon: typeof Smartphone }[] = [
  { key: 'wave', label: 'Wave', desc: 'Paiement mobile en ligne', online: true, icon: Smartphone },
  { key: 'orangeMoney', label: 'Orange Money', desc: 'Paiement mobile en ligne', online: true, icon: Smartphone },
  { key: 'card', label: 'Carte bancaire', desc: 'Visa / Mastercard en ligne', online: true, icon: CreditCard },
  { key: 'cash', label: 'Paiement à la livraison', desc: 'Espèces remises au livreur', online: false, icon: Banknote },
];

/** Variables d'environnement (Render) qui portent les clés de chaque agrégateur. */
const GATEWAY_KEYS: Record<PaymentGatewayCode, string> = {
  NABOOPAY: 'NABOOPAY_API_KEY',
  PAYTECH: 'PAYTECH_API_KEY et PAYTECH_API_SECRET',
};

const MODE_BADGE: Record<PaymentGatewayMode, { label: string; className: string }> = {
  live: { label: 'Configuré', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  test: { label: 'Mode test', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  simulation: { label: 'Non configuré', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function gatewayHint(gateway: PaymentGatewayStatus): string {
  if (gateway.mode === 'live') return 'Clés configurées sur le serveur : paiements réels.';
  if (gateway.mode === 'test') {
    return 'Environnement de test (PAYTECH_ENV=test) : passez PAYTECH_ENV à prod avant d’ouvrir les ventes.';
  }
  return `Clés absentes du serveur : ajoutez ${GATEWAY_KEYS[gateway.code]} sur Render pour pouvoir l’activer.`;
}

interface PaymentDraft {
  /** Agrégateur choisi pour les paiements en ligne */
  gateway: PaymentGatewayCode | null;
  enabled: Record<PaymentMethodKey, boolean>;
  /** Saisie libre ; vide = pas de plafond */
  cashMaxAmount: string;
}

/** Même règle que le serveur : un moyen jamais configuré est considéré comme actif. */
function toDraft(settings: AdminShopSettings): PaymentDraft {
  const payments = settings.payments;
  return {
    gateway: settings.paymentGateway.code ?? null,
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
  const [draft, setDraft] = useState<PaymentDraft>(() => toDraft(settings));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(settings));
  const gateway = settings.paymentGateway;
  // Serveur antérieur à la prise en charge de plusieurs agrégateurs : liste absente
  const gateways = settings.paymentGateways ?? [];
  const activeMode: PaymentGatewayMode = gateway.mode ?? (gateway.configured ? 'live' : 'simulation');
  const gatewayChanged = draft.gateway !== null && draft.gateway !== gateway.code;

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
          ...(gatewayChanged && draft.gateway ? { gateway: draft.gateway } : {}),
          wave: { enabled: draft.enabled.wave },
          orangeMoney: { enabled: draft.enabled.orangeMoney },
          card: { enabled: draft.enabled.card },
          cash: { enabled: draft.enabled.cash, maxAmount },
        },
      });
      setDraft(toDraft(updated));
      setErrors({});
      toast.success(
        gatewayChanged
          ? `Paiements enregistrés : les nouveaux paiements en ligne passent par ${updated.paymentGateway.provider}.`
          : 'Moyens de paiement enregistrés.',
      );
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

        {gateways.length > 0 ? (
          <div className="space-y-2.5">
            <div>
              <div className="font-semibold text-gray-900">Agrégateur de paiement en ligne</div>
              <p className="text-[11px] text-gray-500">
                Wave, Orange Money, Free Money et la carte sont encaissés par l&apos;agrégateur choisi. Le changement
                s&apos;applique aux nouveaux paiements ; une transaction déjà commencée reste confirmée par son agrégateur.
              </p>
            </div>
            <div role="radiogroup" aria-label="Agrégateur de paiement en ligne" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gateways.map((g) => {
                const selected = draft.gateway === g.code;
                const badge = MODE_BADGE[g.mode];
                return (
                  <button
                    key={g.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!canEdit || (!g.configured && !selected)}
                    onClick={() => setDraft((prev) => ({ ...prev, gateway: g.code }))}
                    className={`text-left rounded-xl border p-3.5 transition-colors disabled:cursor-not-allowed ${
                      selected
                        ? 'border-[#c1647a] bg-pink-50/50 ring-2 ring-[#c1647a]/15'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${!g.configured && !selected ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-semibold text-gray-900">
                        <span
                          aria-hidden
                          className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                            selected ? 'border-[#c1647a] bg-[#c1647a] shadow-[inset_0_0_0_2px_#fff]' : 'border-gray-300'
                          }`}
                        />
                        {g.label}
                      </span>
                      <Badge className={`${badge.className} shrink-0`}>{badge.label}</Badge>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-600">{gatewayHint(g)}</p>
                    {g.active && (
                      <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Utilisé actuellement
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {activeMode !== 'live' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900">
                {activeMode === 'test'
                  ? `${gateway.provider} est en mode test : un paiement ne débite que 100 à 150 FCFA mais valide la commande. Ne laissez pas ce mode en production.`
                  : 'Aucune clé API sur le serveur : les paiements en ligne (Wave, Orange Money, carte) sont simulés et ne sont pas encaissés. Seul le paiement à la livraison fonctionne réellement.'}
              </div>
            )}
          </div>
        ) : (
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
        )}

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
                      {method.online && activeMode === 'simulation' && ' — simulé'}
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
