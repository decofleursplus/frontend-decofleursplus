'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, PartyPopper, Plus, Save, Sprout, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AdminShopSettings,
  QuoteFormSettings,
  QuoteProjectOptions,
  QuoteProjectType,
  UpdateShopSettingsPayload,
} from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

const MAX_LENGTH = 80;
const MAX_COUNT = 30;

const PROJECTS: { key: QuoteProjectType; label: string; icon: typeof Sprout }[] = [
  { key: 'paysagisme', label: 'Paysagisme & espaces verts', icon: Sprout },
  { key: 'evenements', label: 'Événements & scénographie', icon: PartyPopper },
];

const LISTS: { key: keyof QuoteProjectOptions; title: string; hint: string; placeholder: string }[] = [
  {
    key: 'prestations',
    title: 'Prestation souhaitée',
    hint: 'Ce que le client demande (ex. création de jardin, mariage).',
    placeholder: 'Nouvelle prestation…',
  },
  {
    key: 'lieux',
    title: 'Type de lieu',
    hint: 'Où se déroule le projet (ex. villa, salle de réception).',
    placeholder: 'Nouveau type de lieu…',
  },
];

const clean = (label: string) => label.trim().replace(/\s+/g, ' ');
const sameLabel = (a: string, b: string) => clean(a).toLocaleLowerCase('fr') === clean(b).toLocaleLowerCase('fr');

/** Problème d'une liste avant enregistrement (mêmes règles que l'API), sinon null. */
function listProblem(items: string[]): string | null {
  if (items.length === 0) return 'Ajoutez au moins un choix.';
  if (items.length > MAX_COUNT) return `${MAX_COUNT} choix maximum.`;
  if (items.some((i) => clean(i).length < 2)) return 'Chaque choix doit contenir au moins 2 caractères.';
  if (items.some((i) => clean(i).length > MAX_LENGTH)) return `${MAX_LENGTH} caractères maximum par choix.`;
  if (items.some((item, idx) => items.findIndex((other) => sameLabel(other, item)) !== idx)) {
    return 'Chaque choix ne doit apparaître qu’une fois.';
  }
  return null;
}

const copyForm = (form: QuoteFormSettings): QuoteFormSettings => ({
  paysagisme: { prestations: [...form.paysagisme.prestations], lieux: [...form.paysagisme.lieux] },
  evenements: { prestations: [...form.evenements.prestations], lieux: [...form.evenements.lieux] },
});

function OptionListEditor({
  id,
  title,
  hint,
  placeholder,
  items,
  canEdit,
  error,
  onChange,
}: {
  id: string;
  title: string;
  hint: string;
  placeholder: string;
  items: string[];
  canEdit: boolean;
  error?: string;
  onChange: (items: string[]) => void;
}) {
  const [newLabel, setNewLabel] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const add = () => {
    const label = clean(newLabel);
    if (label.length < 2) return setAddError('Au moins 2 caractères.');
    if (label.length > MAX_LENGTH) return setAddError(`${MAX_LENGTH} caractères maximum.`);
    if (items.some((i) => sameLabel(i, label))) return setAddError('Ce choix existe déjà dans la liste.');
    if (items.length >= MAX_COUNT) return setAddError(`${MAX_COUNT} choix maximum.`);
    onChange([...items, label]);
    setNewLabel('');
    setAddError(null);
  };

  const move = (index: number, delta: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  };

  return (
    <section className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-3.5" aria-labelledby={`${id}-title`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 id={`${id}-title`} className="text-sm font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-[11px] text-gray-500">{hint}</p>
        </div>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
          {items.length} choix
        </span>
      </div>

      <ol className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-right text-[10px] font-semibold text-gray-400">{index + 1}.</span>
            <Input
              aria-label={`${title} n° ${index + 1}`}
              value={item}
              disabled={!canEdit}
              maxLength={MAX_LENGTH + 20}
              onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
              className={`h-8 min-w-0 flex-1 text-xs ${clean(item).length < 2 ? 'border-rose-300' : ''}`}
            />
            {canEdit && (
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  title="Monter"
                  aria-label={`Monter « ${item} »`}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  title="Descendre"
                  aria-label={`Descendre « ${item} »`}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  disabled={items.length <= 1}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  title={items.length <= 1 ? 'La liste doit garder au moins un choix' : 'Supprimer'}
                  aria-label={`Supprimer « ${item} »`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>

      {canEdit && (
        <form
          className="flex items-center gap-1.5 pl-[26px]"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input
            id={`${id}-new`}
            aria-label={`Ajouter : ${title}`}
            value={newLabel}
            placeholder={placeholder}
            maxLength={MAX_LENGTH}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setAddError(null);
            }}
            className="h-8 min-w-0 flex-1 text-xs"
          />
          <Button type="submit" size="sm" variant="outline" className="h-8 shrink-0 gap-1 text-xs" disabled={!newLabel.trim()}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        </form>
      )}
      <div className="pl-[26px]">
        <FieldError message={addError ?? error} />
      </div>
    </section>
  );
}

export function QuoteFormTab({
  settings,
  canEdit,
  onSave,
}: {
  settings: AdminShopSettings;
  canEdit: boolean;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<AdminShopSettings>;
}) {
  const [draft, setDraft] = useState<QuoteFormSettings>(() => copyForm(settings.quoteForm));
  const [project, setProject] = useState<QuoteProjectType>('paysagisme');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.quoteForm);

  const setList = (type: QuoteProjectType, list: keyof QuoteProjectOptions, items: string[]) => {
    setDraft((prev) => ({ ...prev, [type]: { ...prev[type], [list]: items } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`quoteForm.${type}.${list}`];
      return next;
    });
  };

  /** Erreur de l'API pour une liste (le chemin peut viser un élément : quoteForm.paysagisme.lieux.2). */
  const listError = (type: QuoteProjectType, list: keyof QuoteProjectOptions) => {
    const prefix = `quoteForm.${type}.${list}`;
    const key = Object.keys(errors).find((k) => k === prefix || k.startsWith(`${prefix}.`));
    return key ? errors[key] : undefined;
  };

  const handleSave = async () => {
    const localErrors: Record<string, string> = {};
    for (const { key: type } of PROJECTS) {
      for (const { key: list } of LISTS) {
        const problem = listProblem(draft[type][list]);
        if (problem) localErrors[`quoteForm.${type}.${list}`] = problem;
      }
    }
    setErrors(localErrors);
    const firstInvalid = PROJECTS.find(({ key }) => Object.keys(localErrors).some((k) => k.startsWith(`quoteForm.${key}.`)));
    if (firstInvalid) {
      setProject(firstInvalid.key);
      toast.error('Corrigez les listes signalées avant d’enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const cleaned: QuoteFormSettings = {
        paysagisme: { prestations: draft.paysagisme.prestations.map(clean), lieux: draft.paysagisme.lieux.map(clean) },
        evenements: { prestations: draft.evenements.prestations.map(clean), lieux: draft.evenements.lieux.map(clean) },
      };
      const updated = await onSave({ quoteForm: cleaned });
      setDraft(copyForm(updated.quoteForm));
      setErrors({});
      toast.success('Formulaire de devis enregistré : les nouveaux choix sont proposés aux clients.');
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'Le formulaire de devis n’a pas pu être enregistré.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Formulaire de devis</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Choix proposés aux clients dans la demande de devis, selon le type de projet.
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

      <CardContent className="space-y-4 pt-2 text-xs">
        {!canEdit && <ReadOnlyNote />}
        <InfoNote>
          Le premier choix de chaque liste est proposé par défaut. Les demandes déjà reçues conservent les choix
          d&apos;origine : renommer ou supprimer un choix ne concerne que les nouvelles demandes.
        </InfoNote>

        <div role="tablist" aria-label="Type de projet" className="flex flex-wrap gap-2">
          {PROJECTS.map(({ key, label, icon: Icon }) => {
            const active = project === key;
            const invalid = Object.keys(errors).some((k) => k.startsWith(`quoteForm.${key}.`));
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setProject(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[#173f22] bg-[#173f22] text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {invalid && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-label="à corriger" />}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2" role="tabpanel">
          {LISTS.map(({ key, title, hint, placeholder }) => (
            <OptionListEditor
              key={`${project}-${key}`}
              id={`quote-${project}-${key}`}
              title={title}
              hint={hint}
              placeholder={placeholder}
              items={draft[project][key]}
              canEdit={canEdit}
              error={listError(project, key)}
              onChange={(items) => setList(project, key, items)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
