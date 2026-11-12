'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminCategory } from '@/lib/admin/mock-data/types';
import { createAdminSubcategory, deleteAdminSubcategory, updateAdminSubcategory } from '@/lib/api/admin/categories';

/** Sous-catégories d'une catégorie : ajout, renommage, suppression (via l'API). */
export function SubcategoriesDialog({ category, onClose, onChanged }: { category: AdminCategory; onClose: () => void; onChanged: () => Promise<unknown> }) {
  const [newName, setNewName] = useState('');
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries((category.subCategories ?? []).map((s) => [s.id, s.name])),
  );
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<unknown>, success: string) => {
    setBusy(key);
    try {
      await action();
      toast.success(success);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusy(null);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 2) return toast.error('Nom trop court (2 caractères minimum).');
    await run('new', () => createAdminSubcategory({ categoryId: category.id, name: newName.trim() }), `Sous-catégorie « ${newName.trim()} » ajoutée.`);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Sous-catégories de ${category.name}`}>
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 text-sm shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Sous-catégories</h2>
            <p className="text-xs text-gray-500">{category.name} — utilisées comme filtres sur la page de la catégorie.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xs underline">
            Fermer
          </button>
        </div>
        <ul className="space-y-2">
          {(category.subCategories ?? []).length === 0 && <li className="text-xs text-gray-500">Aucune sous-catégorie.</li>}
          {(category.subCategories ?? []).map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <input
                value={names[s.id] ?? s.name}
                onChange={(e) => setNames((n) => ({ ...n, [s.id]: e.target.value }))}
                aria-label={`Nom de la sous-catégorie ${s.name}`}
                className="flex-1 h-9 rounded-lg border border-[#e7e4dd] px-3 text-sm"
              />
              <button
                type="button"
                disabled={busy !== null || (names[s.id] ?? s.name).trim() === s.name}
                onClick={() => void run(s.id, () => updateAdminSubcategory(s.id, { name: (names[s.id] ?? s.name).trim() }), 'Sous-catégorie renommée.')}
                className="p-2 rounded-lg border border-[#e7e4dd] disabled:opacity-40"
                aria-label={`Enregistrer ${s.name}`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => window.confirm(`Supprimer « ${s.name} » ?`) && void run(s.id, () => deleteAdminSubcategory(s.id), 'Sous-catégorie supprimée.')}
                className="p-2 rounded-lg border border-red-200 text-red-600 disabled:opacity-40"
                aria-label={`Supprimer ${s.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={add} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouvelle sous-catégorie (ex. Roses rouges)"
            aria-label="Nouvelle sous-catégorie"
            className="flex-1 h-10 rounded-lg border border-[#e7e4dd] px-3 text-sm"
          />
          <button type="submit" disabled={busy !== null} className="inline-flex items-center gap-1 px-3 rounded-lg bg-[#24582d] text-white text-xs font-semibold disabled:opacity-60">
            {busy === 'new' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
