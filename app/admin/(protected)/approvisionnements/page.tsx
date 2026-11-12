'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Boxes, Plus, Search, Receipt, Trash2, Loader2, PackageCheck, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import type { Supplier, SupplierOrder, SupplierOrderStatus } from '@/lib/admin/mock-data/types';
import {
  ORDER_NEXT_STATUSES,
  RECEIVABLE_STATUSES,
  changeSupplierOrderStatus,
  createSupplierOrder,
  getCatalogVariantOptions,
  getSupplierOrders,
  getSuppliers,
  type CatalogVariantOption,
} from '@/lib/api/admin/procurement';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, formatDay, formatFcfa } from '@/lib/admin/procurement-labels';

const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors';
const ACTION_LABELS: Partial<Record<SupplierOrderStatus, string>> = {
  a_valider: 'Soumettre à validation',
  validee: 'Valider',
  envoyee: 'Marquer envoyée',
  brouillon: 'Repasser en brouillon',
  annulee: 'Annuler',
};
const FILTERS: ('all' | SupplierOrderStatus)[] = ['all', 'brouillon', 'a_valider', 'validee', 'envoyee', 'en_cours', 'receptionnee', 'annulee'];

interface Line {
  variantId: string;
  name: string;
  qty: string;
  unitPrice: string;
}
const EMPTY_LINE: Line = { variantId: '', name: '', qty: '1', unitPrice: '' };

export default function AdminApprovisionnementsPage() {
  return (
    <Suspense fallback={null}>
      <SupplierOrdersScreen />
    </Suspense>
  );
}

/** Commandes fournisseurs : bons de commande, validation, envoi et accès à la réception. */
function SupplierOrdersScreen() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<SupplierOrder[] | null>(null);
  const [counts, setCounts] = useState<Record<SupplierOrderStatus, number> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilterRaw] = useState<'all' | SupplierOrderStatus>('all');
  const [supplierFilter, setSupplierFilterRaw] = useState<string>(params.get('fournisseur') ?? 'all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Tout changement de filtre revient à la première page
  const setStatusFilter = (v: 'all' | SupplierOrderStatus) => {
    setStatusFilterRaw(v);
    setPage(1);
  };
  const setSupplierFilter = (v: string) => {
    setSupplierFilterRaw(v);
    setPage(1);
  };
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<CatalogVariantOption[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Création
  const [drawerOpen, setDrawerOpen] = useState(params.get('nouveau') === '1');
  const [newSupplierId, setNewSupplierId] = useState(params.get('fournisseur') ?? '');
  const [expectedDate, setExpectedDate] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      getSupplierOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        supplierId: supplierFilter === 'all' ? undefined : supplierFilter,
        search,
        page,
        limit: pageSize,
      })
        .then((res) => {
          setOrders(res.items);
          setCounts(res.counts);
          setTotalCount(res.total);
          setTotalPages(res.totalPages);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Impossible de charger les commandes fournisseurs.')),
    [statusFilter, supplierFilter, search, page, pageSize],
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

  useEffect(() => {
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Fournisseurs indisponibles.'));
    getCatalogVariantOptions()
      .then(setVariants)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Catalogue indisponible.'));
  }, []);

  const activeSuppliers = suppliers.filter((s) => s.status === 'actif');
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0) + (Number(deliveryFee) || 0),
    [lines, deliveryFee],
  );

  const setLine = (index: number, patch: Partial<Line>) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const pickVariant = (index: number, variantId: string) => {
    const v = variants.find((x) => x.variantId === variantId);
    setLine(index, { variantId, ...(v ? { name: v.label } : {}) });
  };

  const resetForm = () => {
    setLines([{ ...EMPTY_LINE }]);
    setExpectedDate('');
    setDeliveryFee('0');
    setNotes('');
  };

  const submit = async (status: 'brouillon' | 'validee') => {
    if (!newSupplierId) return toast.error('Choisissez un fournisseur.');
    const items = lines
      .filter((l) => l.name.trim())
      .map((l) => ({ variantId: l.variantId || null, name: l.name.trim(), orderedQty: Math.max(1, Math.round(Number(l.qty) || 0)), unitPrice: Number(l.unitPrice) || 0 }));
    if (items.length === 0) return toast.error('Ajoutez au moins une ligne (désignation, quantité, prix).');
    setSaving(true);
    try {
      const created = await createSupplierOrder({
        supplierId: newSupplierId,
        expectedDate: expectedDate || undefined,
        deliveryFee: Number(deliveryFee) || 0,
        notes: notes.trim() || undefined,
        status,
        items,
      });
      toast.success(`Bon de commande ${created.orderNumber} ${status === 'validee' ? 'créé et validé' : 'enregistré en brouillon'}.`);
      setDrawerOpen(false);
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (order: SupplierOrder, status: SupplierOrderStatus) => {
    if (status === 'annulee' && !window.confirm(`Annuler la commande ${order.orderNumber} ?`)) return;
    setBusyId(order.id);
    try {
      await changeSupplierOrderStatus(order.id, status);
      toast.success(`Commande ${order.orderNumber} : ${ORDER_STATUS_LABELS[status].toLowerCase()}.`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Changement de statut impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const allCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Commandes fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">Bons de commande, validation, envoi et réception de la marchandise (entrée en stock).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/approvisionnements/factures" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted">
            <Receipt size={15} /> Factures fournisseurs
          </Link>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted">
            <RefreshCw size={14} /> Actualiser
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white text-sm font-semibold shadow-sm"
          >
            <Plus size={18} /> Nouvelle commande
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border shrink-0 ${
              statusFilter === f ? 'bg-[#193e23] text-white border-[#193e23]' : 'bg-white border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' ? 'Toutes' : ORDER_STATUS_LABELS[f]} ({f === 'all' ? allCount : counts?.[f] ?? 0})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-border">
        <label className="flex items-center gap-3 flex-1 bg-muted/30 px-3 py-2 rounded-xl border border-border">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="N° de commande, fournisseur, produit…"
            aria-label="Rechercher une commande fournisseur"
            className="w-full text-xs bg-transparent outline-none"
          />
        </label>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          aria-label="Filtrer par fournisseur"
          className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs"
        >
          <option value="all">Tous les fournisseurs</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <span>{loadError}</span>
          <button type="button" onClick={() => void load()} className="underline font-semibold">
            Réessayer
          </button>
        </div>
      )}

      {orders === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des commandes…
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-xs text-muted-foreground">
          <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          Aucune commande fournisseur{statusFilter !== 'all' || search || supplierFilter !== 'all' ? ' pour ces critères' : ' pour le moment'}.
        </div>
      ) : (
        <div className="grid gap-3">
          {(orders ?? []).map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-border p-4 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#173f22]">{o.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ORDER_STATUS_STYLES[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                  </div>
                  <Link href={`/admin/fournisseurs/${o.supplierId}`} className="text-xs font-semibold hover:underline">
                    {o.supplierName}
                  </Link>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Passée le {formatDay(o.date)}
                    {o.expectedDate ? ` · livraison prévue le ${formatDay(o.expectedDate)}` : ''} · {o.items.length} ligne(s)
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-base text-[#173f22]">{formatFcfa(o.total)}</strong>
                  {o.deliveryFee > 0 && <span className="block text-[11px] text-muted-foreground">dont livraison {formatFcfa(o.deliveryFee)}</span>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                {ORDER_NEXT_STATUSES[o.status].map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => void changeStatus(o, next)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-50 ${
                      next === 'annulee' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {ACTION_LABELS[next]}
                  </button>
                ))}
                {RECEIVABLE_STATUSES.includes(o.status) ? (
                  <Link
                    href={`/admin/approvisionnements/reception/${o.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#193e23] text-white text-xs font-semibold"
                  >
                    <PackageCheck size={14} /> Réceptionner
                  </Link>
                ) : (
                  <Link href={`/admin/approvisionnements/reception/${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">
                    <Eye size={14} /> Détail
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(orders ?? []).length > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="commandes"
        />
      )}

      <AdminDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Nouveau bon de commande"
        subtitle="Les lignes liées au catalogue alimentent le stock à la réception."
        size="lg"
        footer={
          <div className="flex flex-wrap justify-between items-center gap-2.5 w-full">
            <strong className="text-sm text-[#173f22]">Total : {formatFcfa(total)}</strong>
            <div className="flex gap-2">
              <button type="button" disabled={saving} onClick={() => void submit('brouillon')} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs disabled:opacity-60">
                Enregistrer en brouillon
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void submit('validee')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white font-semibold text-xs disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Créer et valider
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Fournisseur *</span>
            <select value={newSupplierId} onChange={(e) => setNewSupplierId(e.target.value)} className={inputClass} aria-label="Fournisseur">
              <option value="">Choisir un fournisseur actif</option>
              {activeSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {activeSuppliers.length === 0 && (
              <span className="block mt-1 text-amber-700">
                Aucun fournisseur actif : <Link href="/admin/fournisseurs" className="underline">créez-en un</Link>.
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Livraison prévue le</span>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Frais de livraison (FCFA)</span>
              <input type="number" min={0} value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="space-y-2">
            <span className="block font-semibold text-muted-foreground">Lignes de commande *</span>
            {lines.map((line, index) => (
              <div key={index} className="rounded-xl border border-border p-3 space-y-2 bg-white">
                <div className="flex gap-2">
                  <select
                    value={line.variantId}
                    onChange={(e) => pickVariant(index, e.target.value)}
                    className={inputClass}
                    aria-label={`Produit du catalogue, ligne ${index + 1}`}
                  >
                    <option value="">Article hors catalogue (sans entrée en stock)</option>
                    {variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.label} — stock {v.stock}
                      </option>
                    ))}
                  </select>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                      className="p-2 rounded-lg border border-red-200 text-red-600"
                      aria-label={`Retirer la ligne ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={line.name}
                  onChange={(e) => setLine(index, { name: e.target.value })}
                  placeholder="Désignation (ex. Roses rouges, botte de 25)"
                  aria-label={`Désignation, ligne ${index + 1}`}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={1} value={line.qty} onChange={(e) => setLine(index, { qty: e.target.value })} aria-label={`Quantité, ligne ${index + 1}`} className={inputClass} />
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice}
                    onChange={(e) => setLine(index, { unitPrice: e.target.value })}
                    placeholder="Prix unitaire (FCFA)"
                    aria-label={`Prix unitaire, ligne ${index + 1}`}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setLines((prev) => [...prev, { ...EMPTY_LINE }])} className="inline-flex items-center gap-1 text-xs font-semibold text-[#193e23]">
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Notes</span>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </label>
        </div>
      </AdminDrawer>
    </div>
  );
}
