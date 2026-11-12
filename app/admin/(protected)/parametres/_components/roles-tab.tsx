'use client';

import { useState } from 'react';
import { Check, Edit2, Eye, Minus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RoleModulePermission, RolesAndPermissions } from '@/lib/api/admin/settings';
import { InfoNote } from './shared';

const ACTIONS: { key: keyof Omit<RoleModulePermission, 'limited'>; label: string; icon: typeof Eye; on: string }[] = [
  { key: 'read', label: 'Consulter', icon: Eye, on: 'bg-emerald-100 text-emerald-800' },
  { key: 'write', label: 'Créer / modifier', icon: Edit2, on: 'bg-blue-100 text-blue-800' },
  { key: 'delete', label: 'Supprimer', icon: Trash2, on: 'bg-rose-100 text-rose-800' },
];

function Cell({ allowed, onClass }: { allowed: boolean; onClass: string }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${allowed ? onClass : 'bg-gray-100 text-gray-300'}`}
      aria-label={allowed ? 'Autorisé' : 'Non autorisé'}
    >
      {allowed ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
    </span>
  );
}

/**
 * Matrice des droits en lecture seule : les autorisations sont appliquées par le serveur
 * (contrôle du rôle sur chaque route) et ne sont pas modifiables depuis l'interface.
 */
export function RolesTab({ data }: { data: RolesAndPermissions }) {
  const [activeRole, setActiveRole] = useState(data.roles[0]?.key ?? '');
  const role = data.roles.find((r) => r.key === activeRole);

  return (
    <Card className="border-gray-200 shadow-2xs">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6 border-b border-gray-100 space-y-3">
        <div>
          <CardTitle className="text-base font-bold text-gray-900">Rôles & permissions</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Ce que chaque rôle peut faire dans le back-office. Pour changer les droits d’une personne, modifiez son rôle
            dans l’onglet « Collaborateurs ».
          </CardDescription>
        </div>
        <InfoNote>
          Ces droits sont appliqués par le serveur sur chaque action ; ils ne se modifient pas depuis cet écran.
        </InfoNote>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Rôles">
          {data.roles.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={activeRole === r.key}
              onClick={() => setActiveRole(r.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeRole === r.key ? 'bg-[#c1647a] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {role && (
          <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs text-gray-700">
            <Badge className={role.badgeClass}>{role.label}</Badge>
            <span>{role.description}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Mobile */}
        <div className="lg:hidden p-3 space-y-2.5">
          {data.permissions.map((mod) => {
            const perms = mod.permissions[activeRole];
            return (
              <div key={mod.key} className="rounded-xl border border-gray-200 bg-white p-3 shadow-2xs space-y-2">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{mod.label}</div>
                  <div className="text-[11px] text-gray-400">{mod.category}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                  {ACTIONS.map((a) => (
                    <div key={a.key} className="flex items-center justify-between gap-1">
                      <span className="text-gray-600">{a.label}</span>
                      <Cell allowed={Boolean(perms?.[a.key])} onClass={a.on} />
                    </div>
                  ))}
                </div>
                {perms?.limited && <p className="text-[11px] text-amber-700">Accès limité à une partie du module.</p>}
              </div>
            );
          })}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70">
                <TableHead className="text-xs font-semibold text-gray-700">Module</TableHead>
                {ACTIONS.map((a) => (
                  <TableHead key={a.key} className="text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <a.icon className="h-3 w-3" /> {a.label}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="text-xs font-semibold text-gray-700">Remarque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.permissions.map((mod) => {
                const perms = mod.permissions[activeRole];
                return (
                  <TableRow key={mod.key} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs py-3">
                      <div className="font-semibold text-gray-900">{mod.label}</div>
                      <div className="text-[11px] text-gray-400">{mod.category}</div>
                    </TableCell>
                    {ACTIONS.map((a) => (
                      <TableCell key={a.key} className="text-center py-3">
                        <Cell allowed={Boolean(perms?.[a.key])} onClass={a.on} />
                      </TableCell>
                    ))}
                    <TableCell className="text-[11px] text-amber-700 py-3">
                      {perms?.limited ? 'Accès partiel au module' : ''}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
