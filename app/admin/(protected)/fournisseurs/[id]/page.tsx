'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, MapPin, Pencil, Boxes, Receipt, History, Info, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { getSupplier, updateSupplier, type SupplierDetail } from '@/lib/api/admin/procurement';
import { ORDER_STATUS_LABELS, INVOICE_STATUS_LABELS, formatFcfa, formatDay } from '@/lib/admin/procurement-labels';

type Tab = 'infos' | 'produits' | 'commandes' | 'factures' | 'historique';
const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors';

export default function AdminFournisseurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [supplier, setSupplier] = useState<SupplierDetail | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('infos');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      getSupplier(id)
        .then((s) => {
          setSupplier(s);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Fiche indisponible.')),
    [id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  /** Produits déjà commandés à ce fournisseur (dernier prix et quantité totale). */
  const products = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; lastPrice: number; lastDate: string }>();
    for (const order of [...(supplier?.orders ?? [])].reverse()) {
      if (order.status === 'annulee') continue;
      for (const it of order.items) {
        const prev = map.get(it.name);
        map.set(it.name, { name: it.name, qty: (prev?.qty ?? 0) + it.orderedQty, lastPrice: it.unitPrice, lastDate: order.date });
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty);
  }, [supplier]);

  const history = useMemo(() => {
    const events: { date: string; label: string }[] = [];
    for (const o of supplier?.orders ?? []) {
      events.push({ date: o.date, label: `Commande ${o.orderNumber} — ${formatFcfa(o.total)} (${ORDER_STATUS_LABELS[o.status]})` });
      if (o.receivedAt) events.push({ date: o.receivedAt.slice(0, 10), label: `Réception complète de ${o.orderNumber}` });
    }
    for (const i of supplier?.invoices ?? []) {
      events.push({ date: i.date, label: `Facture ${i.invoiceNumber} — ${formatFcfa(i.amount)}` });
      if (i.paidAt) events.push({ date: i.paidAt.slice(0, 10), label: `Facture ${i.invoiceNumber} payée${i.paymentMethod ? ` (${i.paymentMethod})` : ''}` });
    }
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [supplier]);

  if (loadError && supplier === undefined) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {loadError}{' '}
        <button type="button" onClick={() => void load()} className="underline font-semibold">
          Réessayer
        </button>
      </div>
    );
  }
  if (supplier === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la fiche…
      </div>
    );
  }
  if (supplier === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
        <Building2 className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-serif font-bold text-gray-800">Fournisseur introuvable</h2>
        <Link href="/admin/fournisseurs" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#193e23] text-white text-xs font-semibold">
          <ArrowLeft size={14} /> Retour aux fournisseurs
        </Link>
      </div>
    );
  }

  const openEdit = () => {
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      categories: supplier.categories.join(', '),
      paymentTerms: supplier.paymentTerms,
      leadTime: supplier.leadTime,
      minOrder: String(supplier.minOrder),
      notes: supplier.notes ?? '',
    });
    setEditing(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSupplier(supplier.id, {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
        paymentTerms: form.paymentTerms.trim(),
        leadTime: form.leadTime.trim(),
        minOrder: Number(form.minOrder) || 0,
        notes: form.notes.trim() || null,
      });
      toast.success('Fiche fournisseur enregistrée.');
      setEditing(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Info; count?: number }[] = [
    { key: 'infos', label: 'Informations', icon: Info },
    { key: 'produits', label: 'Produits', icon: Package, count: products.length },
    { key: 'commandes', label: 'Commandes', icon: Boxes, count: supplier.orders.length },
    { key: 'factures', label: 'Factures', icon: Receipt, count: supplier.invoices.length },
    { key: 'historique', label: 'Historique', icon: History },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/fournisseurs" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft size={14} /> Fournisseurs
        </Link>
        <span>›</span>
        <span className="font-semibold text-foreground">{supplier.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#edf8ef] text-[#193e23] flex items-center justify-center font-bold text-xl shrink-0">
            {supplier.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-[#173f22]">{supplier.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  supplier.status === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {supplier.status === 'actif' ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {supplier.totalOrders} commande(s) · {formatFcfa(supplier.totalSpent ?? 0)} payés
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={openEdit} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted">
            <Pencil size={14} /> Modifier
          </button>
          {supplier.status === 'actif' && (
            <Link
              href={`/admin/approvisionnements?fournisseur=${supplier.id}&nouveau=1`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white text-xs font-semibold shadow-xs"
            >
              <Boxes size={15} /> Passer une commande
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === key ? 'bg-[#193e23] text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon size={14} /> {label}
            {count !== undefined && <span className="ml-1 opacity-75">({count})</span>}
          </button>
        ))}
      </div>

      {activeTab === 'infos' && (
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <section className="bg-white p-5 rounded-2xl border border-border space-y-2">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider">Coordonnées</h3>
            <div className="font-semibold text-sm">{supplier.contactPerson || 'Contact non renseigné'}</div>
            {supplier.phone && (
              <a href={`tel:${supplier.phone}`} className="flex items-center gap-2">
                <Phone size={14} className="text-[#c8436e]" /> {supplier.phone}
              </a>
            )}
            {supplier.email && (
              <a href={`mailto:${supplier.email}`} className="flex items-center gap-2">
                <Mail size={14} className="text-[#c8436e]" /> {supplier.email}
              </a>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#c8436e]" /> {supplier.address}
              </div>
            )}
          </section>
          <section className="bg-white p-5 rounded-2xl border border-border space-y-2">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider">Conditions commerciales</h3>
            <div className="flex justify-between">
              <span>Paiement</span>
              <strong>{supplier.paymentTerms || '—'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Délai de livraison</span>
              <strong>{supplier.leadTime || '—'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Commande minimum</span>
              <strong className="text-[#c8436e]">{formatFcfa(supplier.minOrder)}</strong>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {supplier.categories.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-border text-[11px]">
                  {c}
                </span>
              ))}
            </div>
          </section>
          <section className="bg-white p-5 rounded-2xl border border-border md:col-span-2">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes internes</h3>
            <p className="whitespace-pre-wrap">{supplier.notes || 'Aucune note.'}</p>
          </section>
        </div>
      )}

      {activeTab === 'produits' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden text-xs">
          {products.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">Aucun produit commandé à ce fournisseur pour le moment.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#faf8f5] border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Quantité commandée (total)</th>
                  <th className="py-3 px-4">Dernier prix unitaire</th>
                  <th className="py-3 px-4">Dernière commande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.name}>
                    <td className="py-3 px-4 font-semibold">{p.name}</td>
                    <td className="py-3 px-4">{p.qty}</td>
                    <td className="py-3 px-4">{formatFcfa(p.lastPrice)}</td>
                    <td className="py-3 px-4">{formatDay(p.lastDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'commandes' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden text-xs">
          {supplier.orders.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">Aucune commande passée à ce fournisseur.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#faf8f5] border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">N°</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supplier.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-mono font-semibold">{o.orderNumber}</td>
                    <td className="py-3 px-4">{formatDay(o.date)}</td>
                    <td className="py-3 px-4 font-semibold">{formatFcfa(o.total)}</td>
                    <td className="py-3 px-4">{ORDER_STATUS_LABELS[o.status]}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/approvisionnements/reception/${o.id}`} className="underline">
                        Détail / réception
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'factures' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden text-xs">
          {supplier.invoices.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">Aucune facture enregistrée pour ce fournisseur.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#faf8f5] border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Facture</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supplier.invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3 px-4 font-semibold">{i.invoiceNumber}</td>
                    <td className="py-3 px-4">{formatDay(i.date)}</td>
                    <td className="py-3 px-4">{formatDay(i.dueDate)}</td>
                    <td className="py-3 px-4 font-semibold">{formatFcfa(i.amount)}</td>
                    <td className="py-3 px-4">{INVOICE_STATUS_LABELS[i.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="p-3 border-t border-border text-right">
            <Link href="/admin/approvisionnements/factures" className="underline">
              Gérer les factures fournisseurs
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'historique' && (
        <div className="bg-white rounded-2xl border border-border p-5 text-xs">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun événement pour le moment.</p>
          ) : (
            <ol className="space-y-2">
              {history.map((ev, idx) => (
                <li key={`${ev.date}-${idx}`} className="flex gap-3">
                  <span className="w-24 shrink-0 text-muted-foreground">{formatDay(ev.date)}</span>
                  <span>{ev.label}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <AdminDrawer
        isOpen={editing}
        onClose={() => setEditing(false)}
        title="Modifier le fournisseur"
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl border border-border font-semibold text-xs">
              Annuler
            </button>
            <button type="submit" form="edit-supplier-form" disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#193e23] text-white font-semibold text-xs disabled:opacity-60">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="edit-supplier-form" onSubmit={save} className="space-y-3 text-xs" noValidate>
          {(
            [
              ['name', 'Nom *'],
              ['contactPerson', 'Personne de contact'],
              ['phone', 'Téléphone'],
              ['email', 'Email'],
              ['address', 'Adresse'],
              ['categories', 'Catégories (séparées par des virgules)'],
              ['paymentTerms', 'Conditions de paiement'],
              ['leadTime', 'Délai de livraison'],
              ['minOrder', 'Commande minimum (FCFA)'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="block font-semibold text-muted-foreground mb-1">{label}</span>
              <input
                type={key === 'minOrder' ? 'number' : 'text'}
                value={form[key] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className={inputClass}
              />
            </label>
          ))}
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Notes internes</span>
            <textarea rows={3} value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} />
          </label>
        </form>
      </AdminDrawer>
    </div>
  );
}
