'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserEditorDialog } from '@/components/admin/user-editor-dialog';
import {
  deleteAdminStaffUser,
  getAdminStaffUsers,
  updateAdminStaffUser,
  type CreatedStaffUser,
  type RoleDefinition,
  type StaffRole,
  type StaffStatus,
  type StaffUser,
} from '@/lib/api/admin/settings';
import { describeError, ErrorBlock, formatDateTime, isForbidden, LoadingBlock, ReadOnlyNote } from './shared';

/** Les livreurs ont leur propre fiche (véhicule, disponibilité) dans le module Livraisons. */
const isTeamMember = (u: StaffUser) => u.role !== 'DELIVERY';

export function CollaborateursTab({
  roles,
  canEdit,
  currentUserId,
}: {
  roles: RoleDefinition[];
  canEdit: boolean;
  currentUserId: string | null;
}) {
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ user: CreatedStaffUser; password: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setUsers(await getAdminStaffUsers());
    } catch (err) {
      setLoadError(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const roleByKey = useMemo(() => new Map(roles.map((r) => [r.role, r])), [roles]);
  const team = useMemo(() => (users ?? []).filter(isTeamMember), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return team.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q);
      return (
        matchesSearch &&
        (roleFilter === 'all' || u.role === roleFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
      );
    });
  }, [team, search, roleFilter, statusFilter]);

  const activeCount = team.filter((u) => u.status === 'actif').length;
  const rolesInUse = new Set(team.map((u) => u.role)).size;
  const lastLogin = team
    .map((u) => u.lastLoginAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const replaceUser = (saved: StaffUser) =>
    setUsers((prev) => {
      const list = prev ?? [];
      return list.some((u) => u.id === saved.id) ? list.map((u) => (u.id === saved.id ? saved : u)) : [saved, ...list];
    });

  const handleSaved = (saved: StaffUser | CreatedStaffUser, initialPassword: string | null) => {
    const isCreation = !editing;
    replaceUser(saved);
    setEditorOpen(false);
    if (isCreation && initialPassword) {
      setCreatedCredentials({ user: saved as CreatedStaffUser, password: initialPassword });
    } else {
      toast.success(`Collaborateur ${saved.name} mis à jour.`);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    const next: StaffStatus = user.status === 'actif' ? 'inactif' : 'actif';
    setTogglingId(user.id);
    try {
      const updated = await updateAdminStaffUser(user.id, { status: next });
      replaceUser(updated);
      toast.success(
        next === 'actif' ? `Le compte de ${user.name} est réactivé.` : `Le compte de ${user.name} est désactivé.`,
      );
    } catch (err) {
      toast.error(describeError(err, 'Le statut n’a pas pu être modifié.'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAdminStaffUser(toDelete.id);
      setUsers((prev) => (prev ?? []).filter((u) => u.id !== toDelete.id));
      toast.success(`Le compte de ${toDelete.name} a été supprimé.`);
      setToDelete(null);
    } catch (err) {
      toast.error(describeError(err, 'Le compte n’a pas pu être supprimé.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loadError) {
    return (
      <ErrorBlock
        message={describeError(loadError, 'Impossible de charger les collaborateurs.')}
        onRetry={load}
        forbidden={isForbidden(loadError)}
      />
    );
  }
  if (!users) return <LoadingBlock label="Chargement des collaborateurs…" />;

  const roleBadge = (role: StaffRole) => {
    const def = roleByKey.get(role);
    return def ? <Badge className={def.badgeClass}>{def.label}</Badge> : <Badge variant="outline">{role}</Badge>;
  };

  const statusBadge = (user: StaffUser) => {
    const isSelf = user.id === currentUserId;
    const badge =
      user.status === 'actif' ? (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Actif</Badge>
      ) : (
        <Badge variant="secondary" className="text-gray-600 bg-gray-100">
          Inactif
        </Badge>
      );
    if (!canEdit || isSelf) return badge;
    return (
      <button
        type="button"
        onClick={() => handleToggleStatus(user)}
        disabled={togglingId === user.id}
        title={user.status === 'actif' ? 'Désactiver le compte' : 'Réactiver le compte'}
        className="inline-flex items-center gap-1 cursor-pointer disabled:cursor-wait"
      >
        {togglingId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : badge}
      </button>
    );
  };

  const avatar = (user: StaffUser, size: number) => (
    <div
      className="rounded-full overflow-hidden bg-pink-100 flex items-center justify-center font-bold text-[#c1647a] shrink-0 border border-pink-200"
      style={{ width: size, height: size }}
    >
      {user.avatar ? (
        <Image src={user.avatar} alt={user.name} width={size} height={size} unoptimized className="h-full w-full object-cover" />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  );

  const actions = (user: StaffUser) => {
    if (!canEdit) return null;
    const isSelf = user.id === currentUserId;
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(user);
            setEditorOpen(true);
          }}
          className="h-8 px-2 text-gray-600 hover:text-gray-900 text-xs gap-1"
          title="Modifier le collaborateur"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span className="lg:hidden">Modifier</span>
        </Button>
        {!isSelf && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(user)}
              disabled={togglingId === user.id}
              className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600"
              title={user.status === 'actif' ? 'Désactiver le compte' : 'Réactiver le compte'}
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToDelete(user)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
              title="Supprimer le compte"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Équipe" value={String(team.length)} hint="Comptes back-office" icon={Users} tone="pink" />
        <Kpi label="Comptes actifs" value={String(activeCount)} hint="Peuvent se connecter" icon={UserCheck} tone="emerald" />
        <Kpi label="Rôles utilisés" value={String(rolesInUse)} hint="Niveaux d’accès attribués" icon={ShieldCheck} tone="blue" />
        <Kpi
          label="Dernière connexion"
          value={lastLogin ? formatDateTime(lastLogin) ?? '—' : 'Aucune'}
          hint="Tous collaborateurs confondus"
          icon={Clock}
          tone="purple"
          small
        />
      </div>

      <Card className="border-gray-200 shadow-2xs">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-gray-900">Membres & collaborateurs</CardTitle>
                <Badge className="bg-[#c1647a]/10 text-[#c1647a] border-none font-mono">{team.length}</Badge>
              </div>
              <CardDescription className="text-xs text-gray-500">
                Comptes habilités à administrer la boutique. Les droits de chaque rôle sont décrits dans l’onglet « Rôles ».
              </CardDescription>
            </div>
            {canEdit && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setEditorOpen(true);
                }}
                size="sm"
                className="w-full sm:w-auto h-9 bg-[#c1647a] hover:bg-[#a84d63] text-white gap-1.5 shadow-2xs text-xs sm:text-sm font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                Ajouter un collaborateur
              </Button>
            )}
          </div>

          {!canEdit && (
            <div className="pt-3">
              <ReadOnlyNote />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
                aria-label="Rechercher un collaborateur"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | StaffRole)}
                aria-label="Filtrer par rôle"
                className="flex-1 sm:flex-initial h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs focus:border-[#c1647a] focus:outline-hidden"
              >
                <option value="all">Tous les rôles</option>
                {roles
                  .filter((r) => r.role !== 'DELIVERY')
                  .map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | StaffStatus)}
                aria-label="Filtrer par statut"
                className="flex-1 sm:flex-initial h-9 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs focus:border-[#c1647a] focus:outline-hidden"
              >
                <option value="all">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 text-xs text-emerald-900 mt-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Livreurs :</strong> leurs comptes (véhicule, disponibilité, accès) se gèrent dans le module Livraisons.
              </span>
            </div>
            <Link
              href="/admin/livraisons"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-100/60 transition-colors shadow-2xs text-[11px]"
            >
              Gérer les livreurs →
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile */}
          <div className="lg:hidden p-3 space-y-3">
            {filtered.length === 0 ? (
              <EmptyRow hasTeam={team.length > 0} />
            ) : (
              filtered.map((user) => (
                <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {avatar(user, 36)}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {user.name}
                          {user.id === currentUserId && <span className="ml-1 text-[10px] text-gray-400">(vous)</span>}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="shrink-0">{roleBadge(user.role)}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-1 border-t border-gray-100 pt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 hover:text-[#c1647a] font-mono text-[11px]">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {user.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {statusBadge(user)}
                      <span className="text-[10px] text-gray-400 truncate">
                        {user.lastLoginAt ? `Connexion : ${formatDateTime(user.lastLoginAt)}` : 'Jamais connecté'}
                      </span>
                    </div>
                    {actions(user)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70">
                  <TableHead className="text-xs font-semibold text-gray-600">Collaborateur</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Rôle</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Téléphone</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-gray-600">Statut</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Dernière connexion</TableHead>
                  {canEdit && <TableHead className="text-right text-xs font-semibold text-gray-600">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 6 : 5}>
                      <EmptyRow hasTeam={team.length > 0} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/60">
                      <TableCell className="text-xs py-3">
                        <div className="flex items-center gap-3">
                          {avatar(user, 32)}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.name}
                              {user.id === currentUserId && <span className="ml-1 text-[10px] text-gray-400">(vous)</span>}
                            </div>
                            <div className="text-[11px] text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-3 whitespace-nowrap">{roleBadge(user.role)}</TableCell>
                      <TableCell className="text-xs py-3 whitespace-nowrap text-gray-600 font-mono">
                        {user.phone || <span className="text-gray-300">—</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-3 whitespace-nowrap">{statusBadge(user)}</TableCell>
                      <TableCell className="text-xs py-3 text-gray-500 whitespace-nowrap">
                        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : <span className="italic text-gray-400">Jamais</span>}
                      </TableCell>
                      {canEdit && <TableCell className="text-right text-xs py-3 whitespace-nowrap">{actions(user)}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserEditorDialog
        isOpen={editorOpen}
        onOpenChange={setEditorOpen}
        user={editing}
        roles={roles}
        isSelf={Boolean(editing && editing.id === currentUserId)}
        onSaved={handleSaved}
      />

      {/* Confirmation de suppression */}
      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce compte ?</DialogTitle>
            <DialogDescription>
              {toDelete?.name} ({toDelete?.email}) ne pourra plus se connecter au back-office. Un compte lié à des données
              existantes (commandes, devis, livraisons…) ne peut pas être supprimé : désactivez-le plutôt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Identifiants du compte créé : affichés une seule fois */}
      <Dialog open={Boolean(createdCredentials)} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compte créé</DialogTitle>
            <DialogDescription>
              Communiquez ces identifiants à {createdCredentials?.user.name}. Le mot de passe ne sera plus affiché ensuite.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
              <div>
                <span className="text-gray-500">Identifiant : </span>
                <strong className="font-mono">{createdCredentials.user.email}</strong>
              </div>
              <div>
                <span className="text-gray-500">Mot de passe initial : </span>
                <strong className="font-mono select-all">{createdCredentials.password}</strong>
              </div>
              <div>
                <span className="text-gray-500">Connexion : </span>
                <span className="font-mono">/admin/connexion</span>
              </div>
              <p className={createdCredentials.user.invitationSent ? 'text-emerald-700' : 'text-amber-700'}>
                {createdCredentials.user.invitationSent
                  ? 'Un email d’invitation a été envoyé au collaborateur.'
                  : 'L’email d’invitation n’a pas pu être envoyé : transmettez ces identifiants vous-même.'}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!createdCredentials) return;
                void navigator.clipboard
                  ?.writeText(`Identifiant : ${createdCredentials.user.email}\nMot de passe : ${createdCredentials.password}`)
                  .then(() => toast.success('Identifiants copiés.'))
                  .catch(() => toast.error('Copie impossible : sélectionnez le texte manuellement.'));
              }}
            >
              Copier
            </Button>
            <Button onClick={() => setCreatedCredentials(null)} className="bg-[#c1647a] hover:bg-[#a84d63] text-white">
              Terminé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyRow({ hasTeam }: { hasTeam: boolean }) {
  return (
    <div className="py-10 text-center text-xs text-gray-500">
      {hasTeam ? 'Aucun collaborateur ne correspond à ces critères.' : 'Aucun collaborateur pour le moment.'}
    </div>
  );
}

const TONES = {
  pink: 'bg-pink-50 text-[#c1647a]',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
} as const;

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  small = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  tone: keyof typeof TONES;
  small?: boolean;
}) {
  return (
    <Card className="border-gray-200 shadow-2xs">
      <CardContent className="p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className={`${small ? 'text-xs mt-1.5' : 'text-xl mt-0.5'} font-bold text-gray-900 truncate`}>{value}</p>
          <p className="text-[10px] text-gray-400 truncate">{hint}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
