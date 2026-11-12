'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, Edit2, Loader2, MapPin, Plus, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createAdminDeliveryZone,
  deleteAdminDeliveryZone,
  getAdminDeliveryZones,
  updateAdminDeliveryZone,
  type AdminDeliveryZone,
  type AdminDeliveryZonePayload,
} from '@/lib/api/admin/delivery-zones';
import {
  ConfirmDialog,
  describeError,
  ErrorBlock,
  FieldError,
  fieldErrorsOf,
  formatFcfa,
  isForbidden,
  LoadingBlock,
} from './shared';

interface ZoneForm {
  name: string;
  coverage: string;
  fee: string;
  expressFee: string;
  freeAbove: string;
  estimatedTimeHours: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: ZoneForm = {
  name: '',
  coverage: '',
  fee: '',
  expressFee: '',
  freeAbove: '',
  estimatedTimeHours: '2',
  sortOrder: '0',
  isActive: true,
};

function toForm(zone: AdminDeliveryZone): ZoneForm {
  return {
    name: zone.name,
    coverage: zone.coverage ?? '',
    fee: String(zone.fee),
    expressFee: String(zone.expressFee),
    freeAbove: zone.freeAbove != null ? String(zone.freeAbove) : '',
    estimatedTimeHours: String(zone.estimatedTimeHours),
    sortOrder: String(zone.sortOrder),
    isActive: zone.isActive,
  };
}

/** Valide la saisie et construit le payload exact attendu par le validator du serveur. */
function toPayload(form: ZoneForm): { payload?: AdminDeliveryZonePayload; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = form.name.trim();
  if (name.length < 2) errors.name = 'Le nom doit comporter au moins 2 caractères.';

  const fee = Number(form.fee);
  if (form.fee.trim() === '' || !Number.isFinite(fee) || fee < 0) errors.fee = 'Indiquez un montant positif ou nul.';
  const expressFee = Number(form.expressFee);
  if (form.expressFee.trim() === '' || !Number.isFinite(expressFee) || expressFee < 0) {
    errors.expressFee = 'Indiquez un montant positif ou nul.';
  }
  const freeAbove = form.freeAbove.trim() === '' ? null : Number(form.freeAbove);
  if (freeAbove !== null && (!Number.isFinite(freeAbove) || freeAbove <= 0)) {
    errors.freeAbove = 'Montant supérieur à 0, ou vide si la livraison n’est jamais offerte.';
  }
  const hours = Number(form.estimatedTimeHours);
  if (!Number.isInteger(hours) || hours < 0 || hours > 240) {
    errors.estimatedTimeHours = 'Nombre d’heures entier entre 0 et 240.';
  }
  const sortOrder = Number(form.sortOrder);
  if (!Number.isInteger(sortOrder)) errors.sortOrder = 'Nombre entier attendu.';

  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    payload: {
      name,
      coverage: form.coverage.trim() || null,
      fee,
      expressFee,
      freeAbove,
      estimatedTimeHours: hours,
      sortOrder,
      isActive: form.isActive,
    },
  };
}

function ZoneDialog({
  open,
  zone,
  onClose,
  onSaved,
}: {
  open: boolean;
  zone: AdminDeliveryZone | null;
  onClose: () => void;
  onSaved: (zone: AdminDeliveryZone, created: boolean) => void;
}) {
  const [form, setForm] = useState<ZoneForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(zone ? toForm(zone) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, zone]);

  const set = (patch: Partial<ZoneForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { payload, errors: localErrors } = toPayload(form);
    setErrors(localErrors);
    if (!payload) return;

    setSaving(true);
    try {
      const saved = zone
        ? await updateAdminDeliveryZone(zone.id, payload)
        : await createAdminDeliveryZone(payload);
      onSaved(saved, !zone);
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'La zone n’a pas pu être enregistrée.'));
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof Omit<ZoneForm, 'isActive'>,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`zone-${key}`} className="text-xs font-semibold text-gray-700">
        {label}
      </Label>
      <Input
        id={`zone-${key}`}
        value={form[key]}
        onChange={(e) => set({ [key]: e.target.value })}
        className="h-9 text-xs"
        {...props}
      />
      <FieldError message={errors[key]} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent className="w-[94vw] max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">
            {zone ? `Modifier la zone « ${zone.name} »` : 'Nouvelle zone de livraison'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Les tarifs sont appliqués par le serveur lors du calcul de chaque commande.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs" noValidate>
          {field('name', 'Nom de la zone *', { placeholder: 'Ex. Somone / Ngaparou' })}
          {field('coverage', 'Quartiers / localités desservis', { placeholder: 'Ex. Somone, Ngaparou, Guéréo' })}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field('fee', 'Frais standard (FCFA) *', { type: 'number', min: 0, inputMode: 'numeric' })}
            {field('expressFee', 'Frais express (FCFA) *', { type: 'number', min: 0, inputMode: 'numeric' })}
            {field('freeAbove', 'Livraison standard offerte dès (FCFA)', {
              type: 'number',
              min: 1,
              inputMode: 'numeric',
              placeholder: 'Jamais offerte',
            })}
            {field('estimatedTimeHours', 'Délai estimé (heures)', { type: 'number', min: 0, max: 240 })}
            {field('sortOrder', 'Ordre d’affichage', { type: 'number' })}
          </div>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <span className="font-medium text-gray-800">Zone proposée aux clients</span>
            <Switch
              aria-label="Zone proposée aux clients"
              checked={form.isActive}
              onCheckedChange={(checked) => set({ isActive: checked })}
            />
          </label>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white gap-1.5"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {zone ? 'Enregistrer' : 'Créer la zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ZonesTab({ canEdit }: { canEdit: boolean }) {
  const [zones, setZones] = useState<AdminDeliveryZone[] | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminDeliveryZone | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminDeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setZones(await getAdminDeliveryZones());
    } catch (err) {
      setZones(null);
      setLoadError(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const replaceZone = (zone: AdminDeliveryZone) =>
    setZones((prev) => (prev ?? []).map((z) => (z.id === zone.id ? zone : z)));

  const handleToggle = async (zone: AdminDeliveryZone, isActive: boolean) => {
    setToggling(zone.id);
    try {
      replaceZone(await updateAdminDeliveryZone(zone.id, { isActive }));
      toast.success(isActive ? `Zone « ${zone.name} » activée.` : `Zone « ${zone.name} » désactivée.`);
    } catch (err) {
      toast.error(describeError(err, 'Le statut de la zone n’a pas pu être modifié.'));
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const result = await deleteAdminDeliveryZone(toDelete.id);
      if (result.deleted) {
        setZones((prev) => (prev ?? []).filter((z) => z.id !== toDelete.id));
        toast.success(`Zone « ${toDelete.name} » supprimée.`);
      } else {
        replaceZone({ ...toDelete, isActive: false });
        toast.info(
          `La zone « ${toDelete.name} » est utilisée par des commandes : elle a été désactivée au lieu d’être supprimée.`,
        );
      }
      setToDelete(null);
    } catch (err) {
      toast.error(describeError(err, 'La zone n’a pas pu être supprimée.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loadError) {
    return (
      <ErrorBlock
        message={describeError(loadError, 'Impossible de charger les zones de livraison.')}
        forbidden={isForbidden(loadError)}
        onRetry={load}
      />
    );
  }
  if (!zones) return <LoadingBlock label="Chargement des zones de livraison…" />;

  const sorted = [...zones].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fr'));

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Zones de livraison & tarifs</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {zones.length} zone{zones.length > 1 ? 's' : ''} — {zones.filter((z) => z.isActive).length} proposée
              {zones.filter((z) => z.isActive).length > 1 ? 's' : ''} aux clients.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une zone
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2 text-xs">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-10 text-gray-500">
            <Truck className="h-5 w-5 text-gray-300" />
            Aucune zone de livraison n&apos;est encore définie.
          </div>
        ) : (
          sorted.map((zone) => (
            <div
              key={zone.id}
              data-testid="zone-card"
              className={`rounded-xl border p-4 shadow-2xs space-y-3 ${
                zone.isActive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">{zone.name}</h4>
                    {!zone.isActive && (
                      <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-[10px]">
                        Désactivée
                      </Badge>
                    )}
                  </div>
                  {zone.coverage && (
                    <p className="text-gray-500 text-[11px] flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {zone.coverage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit ? (
                    <>
                      {toggling === zone.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                      <Switch
                        aria-label={`Activer la zone ${zone.name}`}
                        checked={zone.isActive}
                        disabled={toggling === zone.id}
                        onCheckedChange={(checked) => handleToggle(zone, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Modifier"
                        aria-label={`Modifier la zone ${zone.name}`}
                        onClick={() => {
                          setEditing(zone);
                          setEditorOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Supprimer"
                        aria-label={`Supprimer la zone ${zone.name}`}
                        onClick={() => setToDelete(zone)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Badge className={zone.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>
                      {zone.isActive ? 'Active' : 'Désactivée'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Standard</div>
                  <div className="font-semibold text-gray-900">{formatFcfa(zone.fee)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Express</div>
                  <div className="font-semibold text-gray-900">{formatFcfa(zone.expressFee)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Offerte dès</div>
                  <div className="font-semibold text-gray-900">
                    {zone.freeAbove != null ? formatFcfa(zone.freeAbove) : 'Jamais'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Délai estimé</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    {zone.estimatedTimeHours} h
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <ZoneDialog
        open={editorOpen}
        zone={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={(saved, created) => {
          setZones((prev) => (created ? [...(prev ?? []), saved] : (prev ?? []).map((z) => (z.id === saved.id ? saved : z))));
          toast.success(created ? `Zone « ${saved.name} » créée.` : `Zone « ${saved.name} » enregistrée.`);
          setEditorOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette zone ?"
        description={
          <>
            La zone « {toDelete?.name} » ne sera plus proposée aux clients. Si des commandes y sont rattachées, elle sera
            désactivée au lieu d&apos;être supprimée afin de conserver l&apos;historique.
          </>
        }
        confirmLabel="Supprimer"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </Card>
  );
}
