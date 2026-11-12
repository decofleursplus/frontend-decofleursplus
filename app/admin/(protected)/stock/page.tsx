'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight, History, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  adjustVariantStock,
  getInventory,
  getMovements,
  setVariantAlertThreshold,
  type InventoryPage,
  type InventoryRow,
  type StockMovementRow,
} from '@/lib/api/admin/inventory';

const MOVEMENT_LABELS: Record<StockMovementRow['type'], { label: string; style: string }> = {
  ENTRY: { label: 'Entrée', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  EXIT: { label: 'Sortie', style: 'bg-red-50 text-red-700 border-red-200' },
  ADJUSTMENT: { label: 'Inventaire', style: 'bg-sky-50 text-sky-800 border-sky-200' },
};
const REASONS: Record<StockMovementRow['type'], string[]> = {
  ENTRY: ['Réassort fournisseur', 'Retour client', 'Production atelier'],
  EXIT: ['Fleurs fanées / perte', 'Casse', 'Usage atelier / événement'],
  ADJUSTMENT: ['Inventaire physique', 'Correction de saisie'],
};
const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-gray-600">
      <span>
        Page {page} / {totalPages}
      </span>
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="p-1.5 rounded-md border border-[#e7e4dd] bg-white disabled:opacity-40" aria-label="Page précédente">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="p-1.5 rounded-md border border-[#e7e4dd] bg-white disabled:opacity-40" aria-label="Page suivante">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Stock par variante : niveaux, seuils d'alerte, ajustements tracés et historique des mouvements. */
export default function AdminStockPage() {
  const [tab, setTab] = useState<'etat' | 'historique'>('etat');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion du stock</h1>
        <p className="admin-page-subtitle text-gray-500 mt-1">Niveaux par variante, seuils d’alerte, ajustements et historique des mouvements.</p>
      </div>
      <div className="flex gap-2">
        {(['etat', 'historique'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ${tab === t ? 'bg-[#24582d] text-white border-[#24582d]' : 'bg-white border-[#e7e4dd]'}`}
          >
            {t === 'etat' ? <Package className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
            {t === 'etat' ? 'État du stock' : 'Historique des mouvements'}
          </button>
        ))}
      </div>
      {tab === 'etat' ? <InventoryTab /> : <MovementsTab />}
    </div>
  );
}

function InventoryTab() {
  const [data, setData] = useState<InventoryPage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | 'low' | 'out'>('all');
  const [sort, setSort] = useState<'priority' | 'stock_asc' | 'stock_desc' | 'name'>('priority');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);

  const load = useCallback(
    () =>
      getInventory({ page, status: status === 'all' ? undefined : status, search, sort })
        .then((res) => {
          setData(res);
          setLoadError(null);
        })
        .catch((err) => setLoadError(errorText(err, 'Stock indisponible.'))),
    [page, status, search, sort],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const saveThreshold = async (row: InventoryRow, value: string) => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n < 0 || n === row.variant.minStockAlert) return;
    try {
      await setVariantAlertThreshold(row.variant.id, n);
      toast.success(`Seuil d’alerte de « ${row.product.name} — ${row.variant.name} » : ${n}.`);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Seuil non enregistré.'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2">
          {(
            [
              ['all', 'Toutes'],
              ['low', 'Stock faible'],
              ['out', 'Ruptures'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${status === value ? 'bg-[#c1647a] text-white border-[#c1647a]' : 'bg-white border-[#e7e4dd]'}`}
            >
              {label} ({data ? data.counts[value] : 0})
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 flex-1 px-3 rounded-xl border border-[#e7e4dd] bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Produit, variante ou SKU…" aria-label="Rechercher dans le stock" className="w-full h-10 text-xs outline-none" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Trier" className="h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs">
          <option value="priority">Priorité (ruptures d’abord)</option>
          <option value="stock_asc">Stock croissant</option>
          <option value="stock_desc">Stock décroissant</option>
          <option value="name">Nom</option>
        </select>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs font-semibold">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </button>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}
      {data === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement du stock…
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">Aucune variante pour ces critères.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#faf8f4] border-b border-[#e7e4dd] font-bold">
              <tr>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Variante / SKU</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Seuil d’alerte</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {(data?.items ?? []).map((row) => (
                <tr key={row.variant.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/produits/${row.product.id}`} className="flex items-center gap-2 font-semibold hover:text-[#c1647a]">
                      <span className="relative h-9 w-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {row.product.featuredImage && <Image src={row.product.featuredImage} alt="" fill sizes="36px" className="object-cover" />}
                      </span>
                      <span>
                        {row.product.name}
                        <span className="block font-normal text-gray-400">{row.product.category?.name}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.variant.name}
                    <span className="block text-gray-400 font-mono">{row.variant.sku}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold">{row.variant.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={row.variant.minStockAlert}
                      key={`${row.variant.id}-${row.variant.minStockAlert}`}
                      onBlur={(e) => void saveThreshold(row, e.target.value)}
                      aria-label={`Seuil d’alerte de ${row.product.name} ${row.variant.name}`}
                      className="w-20 h-8 rounded-md border border-[#e7e4dd] px-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {row.isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 font-semibold">
                        <AlertTriangle className="h-3 w-3" /> Rupture
                      </span>
                    ) : row.isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 font-semibold">Stock faible</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setAdjusting(row)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#24582d] text-white font-semibold"
                      aria-label={`Ajuster le stock de ${row.product.name} ${row.variant.name}`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Ajuster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#e7e4dd] bg-[#faf8f4]">
            <Pager page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          </div>
        </div>
      )}
      {adjusting && <AdjustDialog row={adjusting} onClose={() => setAdjusting(null)} onDone={() => void load()} />}
    </div>
  );
}

function AdjustDialog({ row, onClose, onDone }: { row: InventoryRow; onClose: () => void; onDone: () => void }) {
  const [type, setType] = useState<StockMovementRow['type']>('ENTRY');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState(REASONS.ENTRY[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const current = row.variant.stockQuantity;
  const qty = Math.max(0, Math.round(Number(quantity) || 0));
  const next = type === 'ENTRY' ? current + qty : type === 'EXIT' ? current - qty : qty;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== 'ADJUSTMENT' && qty <= 0) return toast.error('Indiquez une quantité supérieure à 0.');
    if (next < 0) return toast.error('Le stock ne peut pas devenir négatif.');
    setSaving(true);
    try {
      await adjustVariantStock(row.variant.id, { type, quantity: qty, reason: note.trim() ? `${reason} — ${note.trim()}` : reason });
      toast.success(`Stock de « ${row.product.name} — ${row.variant.name} » : ${current} → ${next}.`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(errorText(err, 'Mouvement non enregistré.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Ajuster le stock">
      <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 text-xs shadow-2xl">
        <div>
          <h2 className="text-base font-bold">Ajuster le stock</h2>
          <p className="text-gray-500">
            {row.product.name} — {row.variant.name} · stock actuel : <strong>{current}</strong>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(MOVEMENT_LABELS) as StockMovementRow['type'][]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setReason(REASONS[t][0]);
                if (t === 'ADJUSTMENT') setQuantity(String(current));
              }}
              aria-pressed={type === t}
              className={`py-2 rounded-lg border font-semibold ${type === t ? 'border-[#24582d] bg-[#edf8ef]' : 'border-[#e7e4dd]'}`}
            >
              {MOVEMENT_LABELS[t].label}
            </button>
          ))}
        </div>
        <label className="block font-semibold">
          {type === 'ADJUSTMENT' ? 'Quantité comptée' : 'Quantité'}
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-[#e7e4dd] px-3" />
        </label>
        <label className="block font-semibold">
          Motif
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-[#e7e4dd] px-3 bg-white">
            {REASONS[type].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block font-semibold">
          Précision (facultatif)
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-[#e7e4dd] px-3" />
        </label>
        <p className={`rounded-lg p-2 ${next < 0 ? 'bg-red-50 text-red-700' : 'bg-[#faf8f4]'}`}>
          Nouveau stock : <strong>{next}</strong>
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#e7e4dd] font-semibold">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#24582d] text-white font-semibold disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Enregistrer le mouvement
          </button>
        </div>
      </form>
    </div>
  );
}

function MovementsTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMovements>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [type, setType] = useState<'all' | StockMovementRow['type']>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(
    () =>
      getMovements({ page, type: type === 'all' ? undefined : type, search })
        .then((res) => {
          setData(res);
          setLoadError(null);
        })
        .catch((err) => setLoadError(errorText(err, 'Historique indisponible.'))),
    [page, type, search],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as typeof type);
            setPage(1);
          }}
          aria-label="Type de mouvement"
          className="h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs"
        >
          <option value="all">Tous les mouvements</option>
          <option value="ENTRY">Entrées</option>
          <option value="EXIT">Sorties</option>
          <option value="ADJUSTMENT">Inventaires</option>
        </select>
        <label className="flex items-center gap-2 flex-1 px-3 rounded-xl border border-[#e7e4dd] bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Produit, SKU ou motif…" aria-label="Rechercher un mouvement" className="w-full h-10 text-xs outline-none" />
        </label>
      </div>
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}
      {data === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">Aucun mouvement.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#faf8f4] border-b border-[#e7e4dd] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Produit / variante</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Quantité</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {(data?.items ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(m.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{m.product.name}</span>
                    <span className="block text-gray-400">
                      {m.variant.name} · {m.variant.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border font-semibold ${MOVEMENT_LABELS[m.type].style}`}>{MOVEMENT_LABELS[m.type].label}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {m.type === 'ENTRY' ? '+' : m.type === 'EXIT' ? '−' : '='}
                    {m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.previousStock} → <strong>{m.newStock}</strong>
                  </td>
                  <td className="px-4 py-3">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#e7e4dd] bg-[#faf8f4]">
            <Pager page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
