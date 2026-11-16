'use client';

import { useMemo, useState } from 'react';
import { Edit2, Eye, Loader2, Lock, RotateCcw, Save, Trash2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ADMIN_ACCESS_CHANGED_EVENT } from '@/components/admin/admin-sidebar-context';
import {
  resetRolePermissions,
  updateRolePermissions,
  type ModulePermission,
  type PermissionAction,
  type PermissionModule,
  type RolesAndPermissions,
} from '@/lib/api/admin/settings';
import { ConfirmDialog, describeError, InfoNote } from './shared';

type Matrix = Record<string, Record<string, ModulePermission>>;

const ACTIONS: { key: PermissionAction; label: string; icon: typeof Eye; on: string }[] = [
  { key: 'read', label: 'Voir', icon: Eye, on: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { key: 'write', label: 'Modifier', icon: Edit2, on: 'border-blue-200 bg-blue-50 text-blue-800' },
  { key: 'delete', label: 'Supprimer', icon: Trash2, on: 'border-rose-200 bg-rose-50 text-rose-800' },
];

const ADMIN_KEY = 'admin';

const copyMatrix = (m: Matrix): Matrix =>
  Object.fromEntries(Object.entries(m).map(([role, mods]) => [role, Object.fromEntries(Object.entries(mods).map(([k, p]) => [k, { ...p }]))]));

const samePermission = (a?: ModulePermission, b?: ModulePermission) =>
  Boolean(a && b && a.read === b.read && a.write === b.write && a.delete === b.delete);

/** Changement d'une action avec les règles du serveur : « Modifier » / « Supprimer » donnent « Voir », retirer « Voir » retire tout. */
function toggle(mod: PermissionModule, current: ModulePermission, action: PermissionAction): ModulePermission {
  const next = { ...current, [action]: !current[action] };
  const hasRead = mod.actions.includes('read');
  if (hasRead && action !== 'read' && next[action]) next.read = true;
  if (hasRead && action === 'read' && !next.read) {
    next.write = false;
    next.delete = false;
  }
  return next;
}

/**
 * Rôles & permissions : ce que chaque rôle peut faire, module par module. L'administrateur modifie
 * les droits des autres rôles ; ils sont appliqués par l'API sur chaque action et par les menus du back-office.
 */
export function RolesTab({
  data,
  canEdit,
  onSaved,
}: {
  data: RolesAndPermissions;
  canEdit: boolean;
  onSaved: (data: RolesAndPermissions) => void;
}) {
  const [activeRole, setActiveRole] = useState(data.roles.find((r) => r.key !== ADMIN_KEY)?.key ?? data.roles[0]?.key ?? '');
  const [draft, setDraft] = useState<Matrix>(() => copyMatrix(data.permissions));
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const role = data.roles.find((r) => r.key === activeRole);
  const isAdminRole = activeRole === ADMIN_KEY;
  const editable = canEdit && !isAdminRole;

  const categories = useMemo(() => {
    const groups: { name: string; modules: PermissionModule[] }[] = [];
    for (const mod of data.modules) {
      const group = groups.find((g) => g.name === mod.category);
      if (group) group.modules.push(mod);
      else groups.push({ name: mod.category, modules: [mod] });
    }
    return groups;
  }, [data.modules]);

  /** Modules modifiés par rapport à la version enregistrée (pour l'envoi et le compteur). */
  const changes = useMemo(() => {
    const patch: Record<string, Record<string, ModulePermission>> = {};
    let count = 0;
    for (const [roleKey, modules] of Object.entries(draft)) {
      if (roleKey === ADMIN_KEY) continue;
      for (const [moduleKey, permission] of Object.entries(modules)) {
        if (!samePermission(permission, data.permissions[roleKey]?.[moduleKey])) {
          (patch[roleKey] ??= {})[moduleKey] = permission;
          count += 1;
        }
      }
    }
    return { patch, count };
  }, [draft, data.permissions]);

  const changedRoles = new Set(Object.keys(changes.patch));

  const apply = (updated: RolesAndPermissions, message: string) => {
    setDraft(copyMatrix(updated.permissions));
    onSaved(updated);
    // Les menus du back-office relisent les droits du compte connecté
    window.dispatchEvent(new Event(ADMIN_ACCESS_CHANGED_EVENT));
    toast.success(message);
  };

  const save = async () => {
    setSaving(true);
    try {
      apply(await updateRolePermissions(changes.patch), 'Droits enregistrés : ils s’appliquent dès maintenant.');
    } catch (err) {
      toast.error(describeError(err, 'Les droits n’ont pas pu être enregistrés.'));
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      apply(await resetRolePermissions(), 'Droits par défaut rétablis pour tous les rôles.');
      setConfirmReset(false);
    } catch (err) {
      toast.error(describeError(err, 'Les droits par défaut n’ont pas pu être rétablis.'));
    } finally {
      setSaving(false);
    }
  };

  const setPermission = (mod: PermissionModule, action: PermissionAction) => {
    setDraft((prev) => {
      const current = prev[activeRole]?.[mod.key] ?? { read: false, write: false, delete: false };
      return { ...prev, [activeRole]: { ...prev[activeRole], [mod.key]: toggle(mod, current, action) } };
    });
  };

  return (
    <Card className="border-gray-200 shadow-2xs">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6 border-b border-gray-100 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base font-bold text-gray-900">Rôles & permissions</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Ce que chaque rôle peut voir, modifier et supprimer dans le back-office. Pour changer le rôle d’une personne,
              utilisez l’onglet « Collaborateurs ».
            </CardDescription>
          </div>
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              {changes.count > 0 && (
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" disabled={saving} onClick={() => setDraft(copyMatrix(data.permissions))}>
                  <Undo2 className="h-3.5 w-3.5" /> Annuler
                </Button>
              )}
              <Button
                size="sm"
                onClick={save}
                disabled={saving || changes.count === 0}
                className="h-8 bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {changes.count > 0 ? `Enregistrer (${changes.count})` : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>

        <InfoNote>
          {canEdit ? (
            <>
              Les droits sont vérifiés par le serveur sur chaque action et s’appliquent dès l’enregistrement (les menus
              des collaborateurs connectés se mettent à jour à leur prochaine page). L’administrateur garde toujours tous les
              droits. « Modifier » ou « Supprimer » donnent aussi « Voir ».
            </>
          ) : (
            <>Consultation seule : seul un administrateur peut modifier les droits.</>
          )}
        </InfoNote>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Rôles">
          {data.roles.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={activeRole === r.key}
              onClick={() => setActiveRole(r.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeRole === r.key ? 'bg-[#c1647a] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.label}
              {changedRoles.has(r.key) && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="modifications non enregistrées" />}
            </button>
          ))}
        </div>
        {role && (
          <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs text-gray-700">
            <Badge className={`${role.badgeClass} shrink-0`}>{role.label}</Badge>
            <span>{isAdminRole ? 'Accès complet à tout le back-office : ces droits ne se modifient pas.' : role.description}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-5">
        {categories.map((group) => (
          <section key={group.name} className="space-y-2" aria-label={group.name}>
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">{group.name}</h3>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {group.modules.map((mod) => {
                const permission = draft[activeRole]?.[mod.key] ?? { read: false, write: false, delete: false };
                const isDefault = samePermission(permission, data.defaults[activeRole]?.[mod.key]);
                const changed = !samePermission(permission, data.permissions[activeRole]?.[mod.key]);
                return (
                  <div key={mod.key} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{mod.label}</span>
                        {changed && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">non enregistré</span>}
                        {!changed && !isDefault && !isAdminRole && (
                          <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">personnalisé</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">{mod.description}</p>
                    </div>
                    <div className="grid shrink-0 grid-cols-3 gap-1.5 sm:w-[300px]">
                      {ACTIONS.map((a) => {
                        const label = mod.actionLabels?.[a.key] ?? a.label;
                        if (!mod.actions.includes(a.key)) {
                          return <span key={a.key} className="hidden sm:block" aria-hidden="true" />;
                        }
                        const adminOnly = !isAdminRole && mod.adminOnly?.includes(a.key);
                        // Module à action unique (ex. « Réceptionner ») : le bouton prend la place libre pour rester lisible
                        const wide = mod.actions.length === 1 && a.key === 'write' && !mod.actions.includes('delete');
                        const on = permission[a.key];
                        const Icon = adminOnly ? Lock : a.icon;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            aria-pressed={on}
                            disabled={!editable || adminOnly || saving}
                            onClick={() => setPermission(mod, a.key)}
                            title={adminOnly ? 'Réservé à l’administrateur' : `${label} : ${on ? 'autorisé' : 'non autorisé'}`}
                            className={`${wide ? 'col-span-3 sm:col-span-2' : ''} inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed ${
                              on ? a.on : 'border-gray-200 bg-white text-gray-400'
                            } ${editable && !adminOnly ? 'hover:border-gray-300' : ''} ${adminOnly ? 'opacity-60' : ''}`}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {canEdit && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-[11px] text-gray-500">
              {data.customized ? 'Des droits ont été personnalisés.' : 'Tous les rôles ont leurs droits par défaut.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={saving || !data.customized}
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Revenir aux droits par défaut
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmReset}
        title="Revenir aux droits par défaut ?"
        description="Tous les rôles retrouvent leurs droits d’origine. Les personnalisations enregistrées seront perdues."
        confirmLabel="Rétablir"
        busy={saving}
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />
    </Card>
  );
}
