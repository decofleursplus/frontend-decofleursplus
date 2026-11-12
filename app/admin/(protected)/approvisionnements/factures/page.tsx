'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Receipt, Loader2, CheckCircle2, RefreshCw, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { AdminPagination } from '@/components/admin/admin-pagination';
import type { Supplier, SupplierInvoice, SupplierInvoiceStatus, SupplierOrder } from '@/lib/admin/mock-data/types';
import {
  createSupplierInvoice,
  getSupplierInvoices,
  getSupplierOrders,
  getSuppliers,
  paySupplierInvoice,
  updateSupplierInvoice,
} from '@/lib/api/admin/procurement';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_STYLES, formatDay, formatFcfa } from '@/lib/admin/procurement-labels';

const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors';
const FILTERS: ('all' | SupplierInvoiceStatus)[] = ['all', 'a_verifier', 'a_payer', 'en_retard', 'payee', 'contestee', 'annulee'];
const EDITABLE_STATUSES: Exclude<SupplierInvoiceStatus, 'en_retard'>[] = ['a_verifier', 'a_payer', 'payee', 'contestee', 'annulee'];
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Factures fournisseurs : saisie, contrôle, échéances et règlements. */
export default function AdminFacturesFournisseursPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[] | null>(null);
  const [counts, setCounts] = useState<Record<SupplierInvoiceStatus, number> | null>(null);
  const [totals, setTotals] = useState<{ toPay: number; paid: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilterRaw] = useState<'all' | SupplierInvoiceStatus>('all');
  const [supplierFilter, setSupplierFilterRaw] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Tout changement de filtre revient à la première page
  const setStatusFilter = (v: 'all' | SupplierInvoiceStatus) => {
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

  // Ajout
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ invoiceNumber: '', supplierId: '', orderId: '', invoiceDate: today(), dueDate: plusDays(today(), 30), amount: '', status: 'a_payer' as Exclude<SupplierInvoiceStatus, 'en_retard'>, notes: '' });
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [saving, setSaving] = useState(false);

  // Détail
  const [selected, setSelected] = useState<SupplierInvoice | null>(null);
  const [detailStatus, setDetailStatus] = useState<Exclude<SupplierInvoiceStatus, 'en_retard'>>('a_payer');
  const [detailNotes, setDetailNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Virement');

  const load = useCallback(
    () =>
      getSupplierInvoices({
        status: statusFilter === 'all' ? undefined : statusFilter,
        supplierId: supplierFilter === 'all' ? undefined : supplierFilter,
        search,
        page,
        limit: pageSize,
      })
        .then((res) => {
          setInvoices(res.items);
          setCounts(res.counts);
          setTotals(res.totals);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Impossible de charger les factures.')),
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
  }, []);

  const pickSupplier = (supplierId: string) => {
    setForm((f) => ({ ...f, supplierId, orderId: '' }));
    setSupplierOrders([]);
    if (!supplierId) return;
    getSupplierOrders({ supplierId, limit: 100 })
      .then((res) => setSupplierOrders(res.items.filter((o) => o.status !== 'annulee')))
      .catch(() => setSupplierOrders([]));
  };

  const pickOrder = (orderId: string) => {
    const order = supplierOrders.find((o) => o.id === orderId);
    setForm((f) => ({ ...f, orderId, ...(order && !f.amount ? { amount: String(order.total) } : {}) }));
  };

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceNumber.trim()) return toast.error('Renseignez le numéro de la facture.');
    if (!form.supplierId) return toast.error('Choisissez le fournisseur.');
    if (!(Number(form.amount) > 0)) return toast.error('Renseignez un montant valide.');
    setSaving(true);
    try {
      const created = await createSupplierInvoice({
        invoiceNumber: form.invoiceNumber.trim(),
        supplierId: form.supplierId,
        orderId: form.orderId || null,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        amount: Number(form.amount),
        status: form.status,
        notes: form.notes.trim() || null,
      });
      toast.success(`Facture ${created.invoiceNumber} enregistrée pour ${created.supplierName}.`);
      setAddOpen(false);
      setForm((f) => ({ ...f, invoiceNumber: '', orderId: '', amount: '', notes: '' }));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (inv: SupplierInvoice) => {
    setSelected(inv);
    setDetailStatus(inv.status === 'en_retard' ? 'a_payer' : inv.status);
    setDetailNotes(inv.notes ?? '');
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateSupplierInvoice(selected.id, { status: detailStatus, notes: detailNotes.trim() || null });
      toast.success(`Facture ${selected.invoiceNumber} mise à jour.`);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await paySupplierInvoice(selected.id, paymentMethod);
      toast.success(`Facture ${selected.invoiceNumber} marquée comme payée.`);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Paiement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const allCount = counts ? counts.a_verifier + counts.a_payer + counts.payee + counts.contestee + counts.annulee : 0;
  const list = invoices ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/approvisionnements" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft size={14} /> Commandes fournisseurs
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Factures fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">Suivez vos factures, échéances et règlements fournisseurs.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted">
            <RefreshCw size={14} /> Actualiser
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white text-sm font-semibold shadow-sm">
            <Plus size={18} /> Ajouter une facture
          </button>
        </div>
      </div>

      {totals && counts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-border p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet size={14} /> Reste à payer</span>
            <strong className="text-xl text-[#c8436e]">{formatFcfa(totals.toPay)}</strong>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><AlertTriangle size={14} /> Factures en retard</span>
            <strong className="text-xl text-red-600">{counts.en_retard}</strong>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 size={14} /> Déjà réglé</span>
            <strong className="text-xl text-emerald-700">{formatFcfa(totals.paid)}</strong>
          </div>
        </div>
      )}

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
            {f === 'all' ? 'Toutes' : INVOICE_STATUS_LABELS[f]} ({f === 'all' ? allCount : counts?.[f] ?? 0})
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
            placeholder="N° de facture ou fournisseur…"
            aria-label="Rechercher une facture"
            className="w-full text-xs bg-transparent outline-none"
          />
        </label>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} aria-label="Filtrer par fournisseur" className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs">
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

      {invoices === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des factures…
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-xs text-muted-foreground">
          <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          Aucune facture{statusFilter !== 'all' || search || supplierFilter !== 'all' ? ' pour ces critères' : ' enregistrée'}.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">Facture</th>
                <th className="py-3.5 px-5">Fournisseur</th>
                <th className="py-3.5 px-5">Émise le</th>
                <th className="py-3.5 px-5">Échéance</th>
                <th className="py-3.5 px-5 text-right">Montant</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {list.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="py-3.5 px-5 font-mono font-semibold">
                    {inv.invoiceNumber}
                    {inv.orderNumber && <span className="block font-sans font-normal text-[11px] text-muted-foreground">Commande {inv.orderNumber}</span>}
                  </td>
                  <td className="py-3.5 px-5">{inv.supplierName}</td>
                  <td className="py-3.5 px-5">{formatDay(inv.date)}</td>
                  <td className={`py-3.5 px-5 ${inv.status === 'en_retard' ? 'text-red-600 font-semibold' : ''}`}>{formatDay(inv.dueDate)}</td>
                  <td className="py-3.5 px-5 text-right font-semibold">{formatFcfa(inv.amount)}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${INVOICE_STATUS_STYLES[inv.status]}`}>{INVOICE_STATUS_LABELS[inv.status]}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button type="button" onClick={() => openDetail(inv)} className="px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="factures"
        />
      )}

      <AdminDrawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter une facture fournisseur"
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs">
              Annuler
            </button>
            <button
              type="submit"
              form="add-invoice-form"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#c8436e] text-white font-semibold text-xs disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Enregistrer la facture
            </button>
          </div>
        }
      >
        <form id="add-invoice-form" onSubmit={addInvoice} className="space-y-4 text-xs" noValidate>
          <label className="block">
            <span className="block font-semibold mb-1">Numéro de la facture *</span>
            <input value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} placeholder="Ex : F-2026-118" className={inputClass} />
          </label>
          <label className="block">
            <span className="block font-semibold mb-1">Fournisseur *</span>
            <select value={form.supplierId} onChange={(e) => pickSupplier(e.target.value)} className={inputClass}>
              <option value="">Choisir…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block font-semibold mb-1">Commande liée (facultatif)</span>
            <select value={form.orderId} onChange={(e) => pickOrder(e.target.value)} disabled={!form.supplierId} className={inputClass}>
              <option value="">Aucune</option>
              {supplierOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {formatFcfa(o.total)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-semibold mb-1">Date de facture *</span>
              <input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Échéance *</span>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-semibold mb-1">Montant TTC (FCFA) *</span>
              <input type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold mb-1">Statut</span>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))} className={inputClass}>
                {EDITABLE_STATUSES.filter((s) => s !== 'annulee').map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="block font-semibold mb-1">Notes</span>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} />
          </label>
        </form>
      </AdminDrawer>

      {selected && (
        <AdminDrawer
          isOpen
          onClose={() => setSelected(null)}
          title={`Facture ${selected.invoiceNumber}`}
          subtitle={`${selected.supplierName} · émise le ${formatDay(selected.date)} · échéance ${formatDay(selected.dueDate)}`}
          size="md"
          footer={
            <div className="flex flex-wrap justify-end gap-2.5 w-full">
              <button type="button" onClick={() => void saveDetail()} disabled={saving} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs disabled:opacity-60">
                Enregistrer
              </button>
              {selected.status !== 'payee' && selected.status !== 'annulee' && (
                <button
                  type="button"
                  onClick={() => void markPaid()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#193e23] text-white font-semibold text-xs disabled:opacity-60"
                >
                  <CheckCircle2 size={14} /> Marquer comme payée
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-[#faf8f5] border border-border p-4">
              <span className="text-muted-foreground">Montant</span>
              <strong className="block text-xl text-[#173f22]">{formatFcfa(selected.amount)}</strong>
              {selected.paidAt && (
                <span className="block mt-1 text-emerald-700">
                  Payée le {formatDay(selected.paidAt)}
                  {selected.paymentMethod ? ` (${selected.paymentMethod})` : ''}
                </span>
              )}
            </div>
            <label className="block">
              <span className="block font-semibold mb-1">Statut</span>
              <select value={detailStatus} onChange={(e) => setDetailStatus(e.target.value as typeof detailStatus)} className={inputClass}>
                {EDITABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            {selected.status !== 'payee' && (
              <label className="block">
                <span className="block font-semibold mb-1">Moyen de règlement (pour « Marquer comme payée »)</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                  {['Virement', 'Wave', 'Orange Money', 'Chèque', 'Espèces'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="block font-semibold mb-1">Notes</span>
              <textarea rows={3} value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} className={inputClass} />
            </label>
          </div>
        </AdminDrawer>
      )}
    </div>
  );
}
