'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Trash2,
  Phone,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import type { Supplier, SupplierStatus } from '@/lib/admin/mock-data/types';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '@/lib/api/admin/procurement';
import { AdminPagination, paginate } from '@/components/admin/admin-pagination';

const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors';
const formatFcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

const EMPTY_FORM = {
  name: '',
  contactPerson: '',
  phone: '+221 ',
  email: '',
  address: '',
  categories: '',
  paymentTerms: '30 jours',
  leadTime: '3 à 5 jours',
  minOrder: '0',
  notes: '',
};

function StatusBadge({ status }: { status: SupplierStatus }) {
  return status === 'actif' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
      <CheckCircle2 size={11} /> Actif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 shrink-0">
      <XCircle size={11} /> Inactif
    </span>
  );
}

/** Fournisseurs : liste, création, activation et suppression (fiches sans historique), via l'API. */
export default function AdminFournisseursPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilterRaw] = useState<'all' | SupplierStatus>('all');
  // Le backend renvoie tous les fournisseurs : pagination côté client
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const setStatusFilter = (v: 'all' | SupplierStatus) => {
    setStatusFilterRaw(v);
    setPage(1);
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getSuppliers({ search, active: statusFilter === 'all' ? undefined : statusFilter === 'actif' })
        .then((list) => {
          setSuppliers(list);
          setLoadError(null);
        })
        .catch((err) => setLoadError(errorText(err, 'Impossible de charger les fournisseurs.'))),
    [search, statusFilter],
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

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error('Veuillez renseigner le nom du fournisseur.');
      return;
    }
    setSaving(true);
    try {
      const created = await createSupplier({
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim() === '+221' ? '' : form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
        paymentTerms: form.paymentTerms.trim(),
        leadTime: form.leadTime.trim(),
        minOrder: Number(form.minOrder) || 0,
        notes: form.notes.trim() || null,
      });
      toast.success(`Fournisseur « ${created.name} » créé.`);
      setIsAddModalOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Création impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (sup: Supplier) => {
    setBusyId(sup.id);
    try {
      await updateSupplier(sup.id, { isActive: sup.status !== 'actif' });
      toast.success(`Fournisseur « ${sup.name} » ${sup.status === 'actif' ? 'désactivé' : 'activé'}.`);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Modification impossible.'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (sup: Supplier) => {
    if (!window.confirm(`Supprimer définitivement « ${sup.name} » ?`)) return;
    setBusyId(sup.id);
    try {
      await deleteSupplier(sup.id);
      toast.success(`Fournisseur « ${sup.name} » supprimé.`);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Suppression impossible.'));
    } finally {
      setBusyId(null);
    }
  };

  const list = suppliers ?? [];
  const { pageItems, totalPages, page: currentPage } = paginate(list, page, pageSize);
  const emptyText = search || statusFilter !== 'all' ? 'Aucun fournisseur ne correspond à ces critères.' : 'Aucun fournisseur enregistré pour le moment.';

  const actions = (sup: Supplier, compact = false) => (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/fournisseurs/${sup.id}`}
        className={compact ? 'p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground' : 'inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#193e23] hover:bg-[#14321c] text-white text-xs font-semibold'}
        title="Consulter la fiche"
      >
        <Eye size={compact ? 15 : 13} /> {!compact && 'Fiche'}
      </Link>
      <button
        type="button"
        disabled={busyId === sup.id}
        onClick={() => void toggleStatus(sup)}
        className={`p-1.5 rounded-lg border transition-all disabled:opacity-50 ${
          sup.status === 'actif' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-border bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
        title={sup.status === 'actif' ? 'Désactiver le fournisseur' : 'Activer le fournisseur'}
        aria-label={sup.status === 'actif' ? `Désactiver ${sup.name}` : `Activer ${sup.name}`}
      >
        {sup.status === 'actif' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      </button>
      {!sup.totalOrders && (
        <button
          type="button"
          disabled={busyId === sup.id}
          onClick={() => void remove(sup)}
          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Supprimer (fournisseur sans commande)"
          aria-label={`Supprimer ${sup.name}`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Gestion des fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">Vos grossistes et partenaires, leurs conditions et l’historique des achats.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw size={14} /> Actualiser
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white text-sm font-semibold shadow-sm"
          >
            <Plus size={18} /> Ajouter un fournisseur
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3 flex-1 bg-muted/30 px-3 py-2 rounded-xl border border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher (nom, contact, email, téléphone)…"
            aria-label="Rechercher un fournisseur"
            className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | SupplierStatus)}
          aria-label="Filtrer par statut"
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
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

      {suppliers === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des fournisseurs…
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="lg:hidden space-y-3">
            {list.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                {emptyText}
              </div>
            ) : (
              pageItems.map((sup) => (
                <div key={sup.id} className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/admin/fournisseurs/${sup.id}`} className="font-bold text-sm text-[#173f22] hover:text-[#c8436e]">
                      {sup.name}
                      <span className="block text-[11px] font-normal text-muted-foreground">{sup.contactPerson || 'Contact non renseigné'}</span>
                    </Link>
                    <StatusBadge status={sup.status} />
                  </div>
                  <div className="text-xs bg-[#faf8f5] p-3 rounded-xl border border-border/80 space-y-1">
                    {sup.phone && (
                      <a href={`tel:${sup.phone}`} className="flex items-center gap-1 text-[#193e23]">
                        <Phone size={11} /> {sup.phone}
                      </a>
                    )}
                    <div className="text-muted-foreground">
                      {sup.totalOrders} commande(s) · {formatFcfa(sup.totalSpent ?? 0)} payés
                    </div>
                  </div>
                  {actions(sup)}
                </div>
              ))
            )}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Nom</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Catégories</th>
                  <th className="py-3.5 px-5">Achats</th>
                  <th className="py-3.5 px-5">Statut</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs sm:text-sm">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((sup) => (
                    <tr key={sup.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-5">
                        <Link href={`/admin/fournisseurs/${sup.id}`} className="font-bold text-[#173f22] hover:text-[#c8436e] flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#edf8ef] text-[#193e23] flex items-center justify-center font-bold text-xs shrink-0">
                            {sup.name.slice(0, 2).toUpperCase()}
                          </span>
                          {sup.name}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold">{sup.contactPerson || '—'}</div>
                        {sup.phone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone size={12} /> {sup.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {sup.categories.map((cat) => (
                            <span key={cat} className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-border text-[11px] text-[#4b5e4f]">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs">
                        <div className="font-semibold">{sup.totalOrders} commande(s)</div>
                        <div className="text-muted-foreground">{formatFcfa(sup.totalSpent ?? 0)} payés</div>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={sup.status} />
                      </td>
                      <td className="py-4 px-5">{actions(sup, true)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {list.length > 0 && (
            <AdminPagination
              page={currentPage}
              totalPages={totalPages}
              total={list.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              itemLabel="fournisseurs"
              className="px-4"
            />
          )}
        </>
      )}

      <AdminDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un nouveau fournisseur"
        subtitle="Enregistrez un partenaire et ses conditions commerciales."
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted text-xs">
              Annuler
            </button>
            <button
              type="submit"
              form="add-supplier-form"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b5355e] text-white font-semibold shadow-xs text-xs disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Créer le fournisseur
            </button>
          </div>
        }
      >
        <form id="add-supplier-form" onSubmit={handleAddSupplier} className="space-y-4 text-xs" noValidate>
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Raison sociale / Nom *</span>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Ex : Flora Sénégal" className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Personne de contact</span>
              <input type="text" value={form.contactPerson} onChange={set('contactPerson')} placeholder="M. Diop" className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Téléphone</span>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+221 77 123 45 67" className={inputClass} />
            </label>
          </div>
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Email professionnel</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="contact@fournisseur.sn" className={inputClass} />
          </label>
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Adresse / Localité</span>
            <input type="text" value={form.address} onChange={set('address')} placeholder="Dakar, Sénégal" className={inputClass} />
          </label>
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Catégories de produits (séparées par des virgules)</span>
            <input type="text" value={form.categories} onChange={set('categories')} placeholder="Fleurs coupées, Roses, Terreaux…" className={inputClass} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Conditions</span>
              <input type="text" value={form.paymentTerms} onChange={set('paymentTerms')} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Délai habituel</span>
              <input type="text" value={form.leadTime} onChange={set('leadTime')} className={inputClass} />
            </label>
            <label className="block">
              <span className="block font-semibold text-muted-foreground mb-1">Minimum (FCFA)</span>
              <input type="number" min={0} value={form.minOrder} onChange={set('minOrder')} className={inputClass} />
            </label>
          </div>
          <label className="block">
            <span className="block font-semibold text-muted-foreground mb-1">Notes internes</span>
            <textarea rows={3} value={form.notes} onChange={set('notes')} className={inputClass} />
          </label>
        </form>
      </AdminDrawer>
    </div>
  );
}
