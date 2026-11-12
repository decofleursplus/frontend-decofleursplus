'use client';

import { useEffect, useState } from 'react';
import { Award, Gift, Loader2, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getLoyaltySettings,
  listAdminReferrals,
  updateLoyaltySettings,
  type AdminReferral,
  type LoyaltySettings,
  type LoyaltySettingsInput,
} from '@/lib/api/admin/rewards';
import { describeError, ErrorBlock, formatDateTime, formatFcfa, InfoNote, isForbidden, LoadingBlock, ReadOnlyNote } from './shared';

type NumberField = Exclude<keyof LoyaltySettingsInput, 'referralEnabled'>;

const REFERRAL_STATUS: Record<AdminReferral['status'], { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-amber-50 text-amber-800' },
  REWARDED: { label: 'Récompensé', className: 'bg-emerald-50 text-emerald-800' },
  CANCELLED: { label: 'Annulé', className: 'bg-gray-100 text-gray-600' },
};

/** Paramètres › Fidélité : barème des points, paliers, bon fidélité et parrainage. */
export function LoyaltyTab({ canEdit }: { canEdit: boolean }) {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [referrals, setReferrals] = useState<AdminReferral[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLoyaltySettings(), listAdminReferrals()])
      .then(([s, r]) => {
        if (cancelled) return;
        setSettings(s);
        setReferrals(r);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  if (error) {
    return (
      <ErrorBlock
        message={describeError(error, 'Impossible de charger le programme de fidélité.')}
        onRetry={() => {
          setError(null);
          setRetry((r) => r + 1);
        }}
        forbidden={isForbidden(error)}
      />
    );
  }
  if (!settings || !referrals) return <LoadingBlock label="Chargement du programme de fidélité…" />;

  return (
    <div className="space-y-6">
      <LoyaltyForm key={settings.updatedAt} settings={settings} canEdit={canEdit} onSaved={setSettings} />
      <ReferralsCard referrals={referrals} />
    </div>
  );
}

function LoyaltyForm({
  settings,
  canEdit,
  onSaved,
}: {
  settings: LoyaltySettings;
  canEdit: boolean;
  onSaved: (s: LoyaltySettings) => void;
}) {
  const initial = Object.fromEntries(
    (Object.keys(settings) as (keyof LoyaltySettings)[])
      .filter((k) => typeof settings[k] === 'number')
      .map((k) => [k, String(settings[k])]),
  ) as Record<NumberField, string>;
  const [values, setValues] = useState<Record<NumberField, string>>(initial);
  const [referralEnabled, setReferralEnabled] = useState(settings.referralEnabled);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const num = (k: NumberField) => Number(values[k]);
  const set = (k: NumberField) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value.replace(/[^\d]/g, '') }));

  // Remise effective : il faut dépenser rewardPointsCost × fcfaPerPoint FCFA pour obtenir un bon de rewardValue
  const spendForReward = num('rewardPointsCost') * num('fcfaPerPoint');
  const effectiveRate = spendForReward > 0 ? (num('rewardValue') / spendForReward) * 100 : 0;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...Object.fromEntries((Object.keys(values) as NumberField[]).map((k) => [k, num(k)])), referralEnabled } as LoyaltySettingsInput;
    if (Object.values(values).some((v) => v === '' || !Number.isFinite(Number(v)))) return setFormError('Tous les champs sont obligatoires.');
    if (!(num('silverMinPoints') < num('goldMinPoints') && num('goldMinPoints') < num('platinumMinPoints'))) {
      return setFormError('Les seuils doivent être croissants : Argent < Or < Platine.');
    }
    if (num('fcfaPerPoint') < 1 || num('rewardPointsCost') < 1 || num('rewardValue') < 100 || num('rewardValidityDays') < 1) {
      return setFormError('Barème invalide : vérifiez le gain de points et le bon fidélité.');
    }
    setFormError(null);
    setSaving(true);
    updateLoyaltySettings(payload)
      .then((saved) => {
        toast.success('Programme de fidélité enregistré');
        onSaved(saved);
      })
      .catch((err) => setFormError(describeError(err, 'Enregistrement impossible.')))
      .finally(() => setSaving(false));
  };

  const field = (k: NumberField, label: string, suffix: string, hint?: string) => (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <Input inputMode="numeric" value={values[k]} onChange={set(k)} disabled={!canEdit} className="h-9 bg-white text-xs" />
        <span className="shrink-0 text-[11px] text-gray-500">{suffix}</span>
      </div>
      {hint && <span className="block text-[11px] text-gray-400">{hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      {!canEdit && <ReadOnlyNote />}
      {formError && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {formError}
        </p>
      )}

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-[#c1647a]" /> Points et niveaux
          </CardTitle>
          <CardDescription className="text-xs">
            Les points sont crédités quand une commande est livrée ou retirée (carte cadeau comprise).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">{field('fcfaPerPoint', 'Gain de points', 'FCFA = 1 point')}</div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field('silverMinPoints', 'Niveau Argent dès', 'points')}
            {field('goldMinPoints', 'Niveau Or dès', 'points')}
            {field('platinumMinPoints', 'Niveau Platine dès', 'points')}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4 text-[#c1647a]" /> Bon fidélité
          </CardTitle>
          <CardDescription className="text-xs">
            Depuis « Ma fidélité », le client échange ses points contre un bon personnel à usage unique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {field('rewardPointsCost', 'Points échangés', 'points')}
            {field('rewardValue', 'Valeur du bon', 'FCFA')}
            {field('rewardValidityDays', 'Validité du bon', 'jours')}
          </div>
          {spendForReward > 0 && (
            <InfoNote>
              Un client obtient un bon de {formatFcfa(num('rewardValue'))} après {formatFcfa(spendForReward)} d’achats livrés, soit une remise
              effective de <strong>{effectiveRate.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %</strong>.
            </InfoNote>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3 text-base">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#c1647a]" /> Parrainage
            </span>
            <label className="flex items-center gap-2 text-xs font-normal text-gray-600">
              {referralEnabled ? 'Activé' : 'Désactivé'}
              <Switch checked={referralEnabled} onCheckedChange={setReferralEnabled} disabled={!canEdit} />
            </label>
          </CardTitle>
          <CardDescription className="text-xs">
            Chaque client partage son lien /parrain/CODE. Le filleul reçoit un bon de bienvenue à l’activation de son compte ; le parrain gagne des
            points quand la première commande du filleul est livrée.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {field('refereeDiscountValue', 'Bon de bienvenue du filleul', 'FCFA', '0 : pas de bon')}
          {field('refereeMinOrderAmount', 'Commande minimum du filleul', 'FCFA')}
          {field('referrerRewardPoints', 'Récompense du parrain', 'points')}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-gray-400">Dernière modification : {formatDateTime(settings.updatedAt) ?? '—'}</span>
        {canEdit && (
          <Button type="submit" disabled={saving} className="h-10 bg-[#c1647a] text-xs font-semibold text-white hover:bg-[#a85266]">
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Enregistrer
          </Button>
        )}
      </div>
    </form>
  );
}

function ReferralsCard({ referrals }: { referrals: AdminReferral[] }) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base">Parrainages ({referrals.length})</CardTitle>
        <CardDescription className="text-xs">Les plus récents d’abord.</CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <p className="text-xs text-gray-500">Aucun parrainage pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Parrain</th>
                  <th className="py-2 pr-3 font-semibold">Filleul</th>
                  <th className="py-2 pr-3 font-semibold">Inscription</th>
                  <th className="py-2 pr-3 font-semibold">Bon de bienvenue</th>
                  <th className="py-2 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold text-gray-800">{r.referrerName}</span>
                      <span className="block text-[11px] text-gray-500">{r.referrerEmail}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold text-gray-800">{r.refereeName}</span>
                      <span className="block text-[11px] text-gray-500">{r.refereeEmail}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">{formatDateTime(r.createdAt)}</td>
                    <td className="py-2.5 pr-3 text-gray-600">{r.welcomeCouponIssued ? 'Envoyé' : 'Compte non confirmé'}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${REFERRAL_STATUS[r.status].className}`}>
                        {REFERRAL_STATUS[r.status].label}
                        {r.status === 'REWARDED' ? ` (+${r.rewardPoints.toLocaleString('fr-FR')} pts)` : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
