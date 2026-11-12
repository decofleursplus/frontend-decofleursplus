'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Edit, Eye, EyeOff, Loader2, Plus, Repeat, Trash2, Users, X } from 'lucide-react';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApiClientError } from '@/lib/api/client';
import type { SubscriptionFrequency } from '@/lib/api/subscriptions';
import {
  createAdminSubscriptionPlan,
  deleteAdminSubscriptionPlan,
  updateAdminSubscriptionPlan,
  type AdminSubscriptionPlan,
  type SubscriptionPlanPayload,
} from '@/lib/api/admin/subscriptions';

const FREQUENCY_OPTIONS: { value: SubscriptionFrequency; label: string; hint: string }[] = [
  { value: 'HEBDOMADAIRE', label: 'Hebdomadaire', hint: '4 passages par mois' },
  { value: 'BIMENSUELLE', label: 'Bimensuelle', hint: '2 passages par mois' },
];

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

function apiError(err: unknown, fallback: string) {
  if (err instanceof ApiClientError) {
    const details = err.details?.map((d) => d.message).join(' ; ');
    return details ? `${err.message} : ${details}` : err.message;
  }
  return fallback;
}

interface Props {
  plans: AdminSubscriptionPlan[] | null;
  loadError: string | null;
  canEdit: boolean;
  onChanged: () => Promise<void> | void;
  onRetry: () => void;
}

/** Catalogue des formules d'abonnement : création, modification, activation, ordre d'affichage. */
export function SubscriptionPlansManager({ plans, loadError, canEdit, onChanged, onRetry }: Props) {
  const [editing, setEditing] = useState<AdminSubscriptionPlan | 'new' | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminSubscriptionPlan | null>(null);

  const run = async (code: string, action: () => Promise<unknown>, success: string) => {
    setBusyCode(code);
    try {
      await action();
      toast.success(success);
      await onChanged();
    } catch (err) {
      toast.error(apiError(err, 'L’opération a échoué.'));
    } finally {
      setBusyCode(null);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!plans) return;
    const a = plans[index];
    const b = plans[index + direction];
    if (!a || !b) return;
    void run(
      a.id,
      () =>
        Promise.all([
          updateAdminSubscriptionPlan(a.id, { sortOrder: b.sortOrder }),
          updateAdminSubscriptionPlan(b.id, { sortOrder: a.sortOrder === b.sortOrder ? a.sortOrder + direction : a.sortOrder }),
        ]),
      'Ordre d’affichage mis à jour'
    );
  };

  return (
    <section className="space-y-4" aria-labelledby="plans-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 id="plans-title" className="text-base font-bold text-gray-900">
            Formules proposées
          </h2>
          <p className="text-xs text-gray-500">
            Nom, description, rythmes, prix et avantages affichés sur la page Abonnements. Les abonnés existants gardent leur tarif.
          </p>
        </div>
        {canEdit && (
          <Button type="button" onClick={() => setEditing('new')} className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs gap-1.5 h-9">
            <Plus className="h-4 w-4" /> Nouvelle formule
          </Button>
        )}
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onRetry}>
            Réessayer
          </Button>
        </div>
      )}

      {plans === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des formules…
        </div>
      ) : plans && plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-gray-500">Aucune formule. Créez la première.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(plans ?? []).map((plan, index) => (
            <article
              key={plan.id}
              className={`rounded-2xl border bg-white p-4 shadow-2xs flex flex-col gap-3 ${plan.isActive ? 'border-stone-200' : 'border-dashed border-stone-300 opacity-80'}`}
            >
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold text-sm text-gray-900">{plan.name}</h3>
                    {plan.badge && <span className="rounded-full bg-[#fdf2f4] px-2 py-0.5 text-[10px] font-semibold text-[#c1647a]">{plan.badge}</span>}
                  </div>
                  <p className="text-[11px] font-mono text-gray-400">{plan.id}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    plan.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {plan.isActive ? 'Proposée' : 'Désactivée'}
                </span>
              </header>

              <p className="text-xs text-gray-600">{plan.tagline}</p>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-stone-50 p-2">
                  <dt className="text-[10px] uppercase text-gray-400">Par passage</dt>
                  <dd className="font-semibold text-gray-900">{fcfa(plan.perDeliveryPrice)}</dd>
                </div>
                {plan.frequencies.includes('HEBDOMADAIRE') && (
                  <div className="rounded-lg bg-stone-50 p-2">
                    <dt className="text-[10px] uppercase text-gray-400">Hebdo / mois</dt>
                    <dd className="font-semibold text-[#c1647a]">{fcfa(plan.monthlyPriceHebdo)}</dd>
                  </div>
                )}
                {plan.frequencies.includes('BIMENSUELLE') && (
                  <div className="rounded-lg bg-stone-50 p-2">
                    <dt className="text-[10px] uppercase text-gray-400">Bimensuel / mois</dt>
                    <dd className="font-semibold text-[#c1647a]">{fcfa(plan.monthlyPriceBimensuel)}</dd>
                  </div>
                )}
                <div className="rounded-lg bg-stone-50 p-2">
                  <dt className="text-[10px] uppercase text-gray-400">Abonnés</dt>
                  <dd className="font-semibold text-gray-900 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {plan.subscriptionsCount}
                  </dd>
                </div>
              </dl>

              {plan.serviceCommitments.length > 0 && (
                <ul className="space-y-1 text-[11px] text-gray-600 list-disc pl-4">
                  {plan.serviceCommitments.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}

              {canEdit && (
                <footer className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3">
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setEditing(plan)}>
                    <Edit className="h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    disabled={busyCode !== null}
                    onClick={() =>
                      run(
                        plan.id,
                        () => updateAdminSubscriptionPlan(plan.id, { isActive: !plan.isActive }),
                        plan.isActive ? `« ${plan.name} » n’est plus proposée` : `« ${plan.name} » est de nouveau proposée`
                      )
                    }
                  >
                    {busyCode === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : plan.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {plan.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 rounded-md border border-stone-200 disabled:opacity-30"
                      disabled={index === 0 || busyCode !== null}
                      onClick={() => move(index, -1)}
                      aria-label={`Monter ${plan.name}`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-md border border-stone-200 disabled:opacity-30"
                      disabled={index === (plans?.length ?? 0) - 1 || busyCode !== null}
                      onClick={() => move(index, 1)}
                      aria-label={`Descendre ${plan.name}`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-30"
                      disabled={busyCode !== null || plan.subscriptionsCount > 0}
                      title={plan.subscriptionsCount > 0 ? 'Des abonnements utilisent cette formule : désactivez-la plutôt' : 'Supprimer la formule'}
                      onClick={() => setToDelete(plan)}
                      aria-label={`Supprimer ${plan.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      <PlanFormDrawer
        key={editing === null ? 'ferme' : editing === 'new' ? 'nouvelle' : editing.id}
        plan={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await onChanged();
        }}
      />

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Supprimer la formule « {toDelete?.name} » ?</DialogTitle>
            <DialogDescription>Aucun abonnement ne l’utilise. Elle disparaîtra de la page Abonnements.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setToDelete(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={busyCode !== null}
              onClick={async () => {
                const plan = toDelete;
                if (!plan) return;
                await run(plan.id, () => deleteAdminSubscriptionPlan(plan.id), `Formule « ${plan.name} » supprimée`);
                setToDelete(null);
              }}
            >
              {busyCode !== null && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ---------- Formulaire (panneau latéral) ----------

interface FormState {
  name: string;
  code: string;
  tagline: string;
  badge: string;
  perDeliveryPrice: string;
  monthlyPriceHebdo: string;
  monthlyPriceBimensuel: string;
  bouquetSpecs: string;
  vaseSpecs: string;
  recommendedFor: string;
  serviceCommitments: string[];
  frequencies: SubscriptionFrequency[];
  isActive: boolean;
}

const initialForm = (plan: AdminSubscriptionPlan | null): FormState => ({
  name: plan?.name ?? '',
  code: '',
  tagline: plan?.tagline ?? '',
  badge: plan?.badge ?? '',
  perDeliveryPrice: plan ? String(plan.perDeliveryPrice) : '',
  monthlyPriceHebdo: plan ? String(plan.monthlyPriceHebdo) : '',
  monthlyPriceBimensuel: plan ? String(plan.monthlyPriceBimensuel) : '',
  bouquetSpecs: plan?.bouquetSpecs ?? '',
  vaseSpecs: plan?.vaseSpecs ?? '',
  recommendedFor: plan?.recommendedFor ?? '',
  serviceCommitments: plan ? [...plan.serviceCommitments] : [''],
  frequencies: plan ? [...plan.frequencies] : ['HEBDOMADAIRE', 'BIMENSUELLE'],
  isActive: plan?.isActive ?? true,
});

function PlanFormDrawer({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminSubscriptionPlan | 'new' | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const existing = plan && plan !== 'new' ? plan : null;
  const [form, setForm] = useState<FormState>(() => initialForm(existing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    const text = (key: keyof FormState, label: string) => {
      if (String(form[key]).trim().length < 2) e[key] = `${label} : 2 caractères minimum.`;
    };
    text('name', 'Nom');
    text('tagline', 'Description courte');
    text('bouquetSpecs', 'Composition');
    text('vaseSpecs', 'Contenant');
    text('recommendedFor', 'Pour qui');
    if (form.code && !/^[A-Za-z0-9_ -]{2,40}$/.test(form.code)) e.code = 'Code : 2 à 40 lettres, chiffres ou « _ ».';
    if (form.frequencies.length === 0) e.frequencies = 'Proposez au moins un rythme.';
    for (const key of ['perDeliveryPrice', 'monthlyPriceHebdo', 'monthlyPriceBimensuel'] as const) {
      const n = Number(form[key]);
      if (form[key] === '' || !Number.isInteger(n) || n < 0) e[key] = 'Montant entier en FCFA requis.';
    }
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const payload: SubscriptionPlanPayload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      badge: form.badge.trim() || null,
      perDeliveryPrice: Number(form.perDeliveryPrice),
      monthlyPriceHebdo: Number(form.monthlyPriceHebdo),
      monthlyPriceBimensuel: Number(form.monthlyPriceBimensuel),
      bouquetSpecs: form.bouquetSpecs.trim(),
      vaseSpecs: form.vaseSpecs.trim(),
      recommendedFor: form.recommendedFor.trim(),
      serviceCommitments: form.serviceCommitments.map((c) => c.trim()).filter((c) => c.length >= 2),
      frequencies: form.frequencies,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (existing) {
        await updateAdminSubscriptionPlan(existing.id, payload);
        toast.success(`Formule « ${payload.name} » mise à jour`);
      } else {
        const created = await createAdminSubscriptionPlan({ ...payload, ...(form.code.trim() ? { code: form.code.trim() } : {}) });
        toast.success(`Formule « ${created.name} » créée (code ${created.id})`);
      }
      await onSaved();
    } catch (err) {
      toast.error(apiError(err, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const err = (key: string) => (errors[key] ? <p className="text-[11px] text-red-600">{errors[key]}</p> : null);

  return (
    <AdminDrawer
      isOpen={plan !== null}
      onClose={onClose}
      size="lg"
      icon={<Repeat size={20} />}
      title={existing ? `Modifier « ${existing.name} »` : 'Nouvelle formule'}
      subtitle={existing ? `Code ${existing.id} · ${existing.subscriptionsCount} abonnement(s)` : 'Elle apparaîtra sur la page Abonnements si elle est active.'}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="plan-form" disabled={saving} className="bg-[#c1647a] hover:bg-[#a85266] text-white gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {existing ? 'Enregistrer' : 'Créer la formule'}
          </Button>
        </>
      }
    >
      <form id="plan-form" onSubmit={submit} noValidate className="space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-xs font-semibold">
              Nom de la formule *
            </Label>
            <Input id="plan-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex : Bureau Zen" />
            {err('name')}
          </div>
          {existing ? (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold">Code</span>
              <p className="h-9 flex items-center rounded-md border border-stone-200 bg-stone-50 px-3 font-mono text-gray-500">{existing.id}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="plan-code" className="text-xs font-semibold">
                Code (optionnel)
              </Label>
              <Input id="plan-code" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="Dérivé du nom" className="font-mono" />
              {err('code')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="plan-tagline" className="text-xs font-semibold">
              Description courte *
            </Label>
            <Input id="plan-tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Fraîcheur & poésie au quotidien" />
            {err('tagline')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-badge" className="text-xs font-semibold">
              Badge
            </Label>
            <Input id="plan-badge" value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Ex : Recommandé" maxLength={40} />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold mb-1">Rythmes proposés *</legend>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((f) => {
              const checked = form.frequencies.includes(f.value);
              return (
                <label
                  key={f.value}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer ${checked ? 'border-[#c1647a] bg-[#fdf2f4]' : 'border-stone-200'}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[#c1647a]"
                    checked={checked}
                    onChange={() =>
                      set('frequencies', checked ? form.frequencies.filter((x) => x !== f.value) : [...form.frequencies, f.value])
                    }
                  />
                  <span>
                    <span className="block font-semibold">{f.label}</span>
                    <span className="text-[11px] text-gray-500">{f.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {err('frequencies')}
        </fieldset>

        <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <legend className="text-xs font-semibold mb-1 sm:col-span-3">Prix (FCFA) *</legend>
          {(
            [
              ['perDeliveryPrice', 'Par passage'],
              ['monthlyPriceHebdo', 'Mensuel — hebdomadaire'],
              ['monthlyPriceBimensuel', 'Mensuel — bimensuel'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`plan-${key}`} className="text-[11px] text-gray-600">
                {label}
              </Label>
              <Input id={`plan-${key}`} type="number" min={0} step={500} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              {err(key)}
            </div>
          ))}
        </fieldset>

        {(
          [
            ['bouquetSpecs', 'Composition florale *', 'Bouquet artisanal (Ø 35-40 cm) en fleurs fraîches'],
            ['vaseSpecs', 'Contenant / vase *', 'Vase prêté et renouvelé à chaque passage'],
            ['recommendedFor', 'Pour qui *', 'Salons et vérandas de villas'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`plan-${key}`} className="text-xs font-semibold">
              {label}
            </Label>
            <Textarea id={`plan-${key}`} rows={2} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} />
            {err(key)}
          </div>
        ))}

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold">Avantages inclus</legend>
          {form.serviceCommitments.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={c}
                onChange={(e) => set('serviceCommitments', form.serviceCommitments.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="Ex : Fleurs coupées le matin même"
                aria-label={`Avantage ${i + 1}`}
              />
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => set('serviceCommitments', form.serviceCommitments.filter((_, j) => j !== i))}
                aria-label={`Retirer l’avantage ${i + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.serviceCommitments.length < 10 && (
            <button type="button" className="text-xs font-semibold text-[#c1647a] hover:underline" onClick={() => set('serviceCommitments', [...form.serviceCommitments, ''])}>
              + Ajouter un avantage
            </button>
          )}
        </fieldset>

        <label className="flex items-center gap-2 rounded-lg border border-stone-200 p-3">
          <input type="checkbox" className="accent-[#c1647a]" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          <span>
            <span className="block font-semibold">Proposée à la souscription</span>
            <span className="text-[11px] text-gray-500">Désactivée, la formule est masquée de la boutique ; les abonnés actuels la conservent.</span>
          </span>
        </label>
      </form>
    </AdminDrawer>
  );
}
