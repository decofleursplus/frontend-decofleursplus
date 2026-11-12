'use client';

import { useState } from 'react';
import { Loader2, Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';
import { updateAdminCustomer } from '@/lib/api/admin/customers';

const SEGMENTS = [
  { value: 'PARTICULIER', label: 'Particulier' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'VIP', label: 'VIP' },
] as const;

/** Fiche CRM éditable : segment, compte actif, points de fidélité (ajustement tracé), note interne et appréciation. */
export function CustomerCrmCard({ customer, onSaved }: { customer: AdminCustomer & { internalRating?: number }; onSaved: (c: AdminCustomer) => void }) {
  const [segment, setSegment] = useState(customer.segment.toUpperCase() as (typeof SEGMENTS)[number]['value']);
  const [active, setActive] = useState(customer.status !== 'inactif');
  const [points, setPoints] = useState(String(customer.loyaltyPoints ?? 0));
  const [rating, setRating] = useState(customer.internalRating ?? 0);
  const [notes, setNotes] = useState(customer.notes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const pts = Math.round(Number(points));
    if (!Number.isFinite(pts) || pts < 0) return toast.error('Les points de fidélité doivent être un nombre positif.');
    setSaving(true);
    try {
      const updated = await updateAdminCustomer(customer.id, {
        segment,
        isActive: active,
        loyaltyPoints: pts,
        notes: notes.trim() || null,
        ...(rating ? { internalRating: rating } : {}),
      });
      onSaved(updated);
      toast.success('Fiche client enregistrée.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block text-xs font-semibold">
          Segment
          <select value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)} className="mt-1 w-full h-9 rounded-md border border-[#e7e4dd] px-2 bg-white">
            {SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold">
          Points de fidélité
          <input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} className="mt-1 w-full h-9 rounded-md border border-[#e7e4dd] px-2" />
        </label>
        <div className="text-xs font-semibold">
          Appréciation interne
          <div className="mt-2 flex gap-0.5" role="radiogroup" aria-label="Appréciation interne">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} sur 5`} onClick={() => setRating(n)}>
                <Star size={18} fill={n <= rating ? '#F59E0B' : 'none'} color={n <= rating ? '#F59E0B' : '#CBD5E1'} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Compte client actif
      </label>
      <label className="block text-xs font-semibold">
        Notes internes (non visibles du client)
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Préférences, allergies, occasions à retenir…" className="mt-1 w-full rounded-md border border-[#e7e4dd] p-2 font-normal" />
      </label>
      <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#24582d] text-white text-xs font-semibold disabled:opacity-60">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Enregistrer la fiche
      </button>
      <p className="text-[11px] text-gray-500">Une modification des points est enregistrée dans l’historique de fidélité du client.</p>
    </div>
  );
}
