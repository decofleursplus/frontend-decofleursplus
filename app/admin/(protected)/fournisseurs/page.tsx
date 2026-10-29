'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { initialSuppliers } from '@/lib/admin/mock-data/suppliers';
import { Supplier, SupplierStatus } from '@/lib/admin/mock-data/types';

export default function AdminFournisseursPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Supplier form state
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('+221 ');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('Dakar, Sénégal');
  const [newCategories, setNewCategories] = useState('Fleurs coupées, Plantes');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 jours');
  const [newLeadTime, setNewLeadTime] = useState('3 à 5 jours');
  const [newMinOrder, setNewMinOrder] = useState('50000');

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesStatus = statusFilter === 'all' || sup.status === statusFilter;
    const matchesSearch =
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContact) {
      toast.error('Veuillez renseigner le nom et le contact du fournisseur.');
      return;
    }

    const created: Supplier = {
      id: `sup-${Date.now()}`,
      name: newName,
      contactPerson: newContact,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      categories: newCategories.split(',').map((c) => c.trim()),
      paymentTerms: newPaymentTerms,
      leadTime: newLeadTime,
      minOrder: Number(newMinOrder) || 0,
      status: 'actif',
      notes: 'Nouveau fournisseur créé depuis le back-office.',
      totalOrders: 0,
      totalSpent: 0,
    };

    setSuppliers([created, ...suppliers]);
    setIsAddModalOpen(false);
    toast.success(`Fournisseur « ${created.name} » créé avec succès !`);
    setNewName('');
    setNewContact('');
  };

  return (
    <div className="space-y-6">
      {/* ── En-tête (Maquette Écran 6) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Gestion des fournisseurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos fournisseurs et leurs informations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-fit cursor-pointer"
        >
          <Plus size={18} /> Ajouter un fournisseur
        </button>
      </div>

      {/* ── Recherche & Filtres (Maquette Écran 6) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3 flex-1 bg-muted/30 px-3 py-2 rounded-xl border border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un fournisseur..."
            className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | SupplierStatus)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* ── Liste Mobile (visible sur < lg) ── */}
      <div className="lg:hidden space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-xs">
            Aucun fournisseur ne correspond à vos filtres.
          </div>
        ) : (
          filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/admin/fournisseurs/${sup.id}`}
                  className="flex items-center gap-2.5 font-bold text-sm text-[#173f22] hover:text-[#c8436e] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#edf8ef] text-[#193e23] flex items-center justify-center font-bold text-xs shrink-0">
                    {sup.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block leading-snug">{sup.name}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">Réf : {sup.id}</span>
                  </div>
                </Link>

                {sup.status === 'actif' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 size={11} /> Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 shrink-0">
                    <XCircle size={11} /> Inactif
                  </span>
                )}
              </div>

              <div className="text-xs bg-[#faf8f5] p-3 rounded-xl border border-border/80 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Contact :</span>
                  <span className="font-semibold text-foreground">{sup.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Téléphone :</span>
                  <a href={`tel:${sup.phone}`} className="font-medium text-[#193e23] hover:underline flex items-center gap-1">
                    <Phone size={11} /> {sup.phone}
                  </a>
                </div>
                {sup.email && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Email :</span>
                    <span className="font-medium text-foreground truncate max-w-[200px]">{sup.email}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {sup.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-muted/40 border border-border text-[10.5px] text-[#4b5e4f]"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextStatus: SupplierStatus = sup.status === 'actif' ? 'inactif' : 'actif';
                    const updated = suppliers.map((s) =>
                      s.id === sup.id ? { ...s, status: nextStatus } : s
                    );
                    setSuppliers(updated);
                    if (nextStatus === 'actif') {
                      toast.success(`Fournisseur « ${sup.name} » activé.`);
                    } else {
                      toast.info(`Fournisseur « ${sup.name} » désactivé.`);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    sup.status === 'actif'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-border bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {sup.status === 'actif' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  <span>{sup.status === 'actif' ? 'Désactiver' : 'Activer'}</span>
                </button>

                <Link
                  href={`/admin/fournisseurs/${sup.id}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#193e23] hover:bg-[#14321c] text-white text-xs font-semibold transition-colors"
                >
                  <Eye size={13} /> Fiche
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Tableau des Fournisseurs Desktop (visible sur >= lg) ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3.5 px-5">Nom</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Catégories</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5">
                    <Link
                      href={`/admin/fournisseurs/${sup.id}`}
                      className="font-bold text-[#173f22] hover:text-[#c8436e] transition-colors flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#edf8ef] text-[#193e23] flex items-center justify-center font-bold text-xs shrink-0">
                        {sup.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{sup.name}</span>
                    </Link>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-semibold text-foreground">{sup.contactPerson}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {sup.phone}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {sup.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-border text-[11px] text-[#4b5e4f]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {sup.status === 'actif' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                        <XCircle size={12} /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/fournisseurs/${sup.id}`}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        title="Consulter la fiche détaillée"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: SupplierStatus = sup.status === 'actif' ? 'inactif' : 'actif';
                          const updated = suppliers.map((s) =>
                            s.id === sup.id ? { ...s, status: nextStatus } : s
                          );
                          setSuppliers(updated);
                          if (nextStatus === 'actif') {
                            toast.success(`Fournisseur « ${sup.name} » activé.`);
                          } else {
                            toast.info(`Fournisseur « ${sup.name} » désactivé.`);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          sup.status === 'actif'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                            : 'border-border bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        title={sup.status === 'actif' ? 'Désactiver le fournisseur' : 'Activer le fournisseur'}
                        aria-label={sup.status === 'actif' ? 'Désactiver le fournisseur' : 'Activer le fournisseur'}
                      >
                        {sup.status === 'actif' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination (Maquette Écran 6) ── */}
        <div className="p-4 border-t border-border bg-[#faf8f5] flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-md border border-border bg-white hover:bg-muted"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-[#193e23] text-white font-bold">1</span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-border hover:bg-muted cursor-pointer">2</span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-border hover:bg-muted cursor-pointer">3</span>
            <span>...</span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-border hover:bg-muted cursor-pointer">10</span>
            <button
              type="button"
              className="p-1.5 rounded-md border border-border bg-white hover:bg-muted"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Afficher</span>
            <select className="px-2.5 py-1 rounded-md border border-border bg-white text-xs outline-none">
              <option value="5">5 par page</option>
              <option value="10">10 par page</option>
              <option value="25">25 par page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Side Drawer "+ Ajouter un fournisseur" ── */}
      <AdminDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un nouveau fournisseur"
        subtitle="Enregistrez un partenaire et ses conditions commerciales."
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted text-xs cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="add-supplier-form"
              className="px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs text-xs cursor-pointer transition-colors"
            >
              Créer le fournisseur
            </button>
          </div>
        }
      >
        <form id="add-supplier-form" onSubmit={handleAddSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Raison sociale / Nom *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex : Flora Sénégal"
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Personne de contact *</label>
              <input
                type="text"
                required
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="M. Diop"
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Téléphone *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Email professionnel</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="contact@fournisseur.sn"
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Adresse / Localité</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Dakar, Sénégal"
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Catégories de produits (séparées par des virgules)</label>
            <input
              type="text"
              value={newCategories}
              onChange={(e) => setNewCategories(e.target.value)}
              placeholder="Fleurs coupées, Roses, Terreaux..."
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Conditions</label>
              <input
                type="text"
                value={newPaymentTerms}
                onChange={(e) => setNewPaymentTerms(e.target.value)}
                placeholder="30 jours"
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Délai habituel</label>
              <input
                type="text"
                value={newLeadTime}
                onChange={(e) => setNewLeadTime(e.target.value)}
                placeholder="3 à 5 jours"
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Minimum (FCFA)</label>
              <input
                type="number"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(e.target.value)}
                placeholder="50000"
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs transition-colors"
              />
            </div>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
