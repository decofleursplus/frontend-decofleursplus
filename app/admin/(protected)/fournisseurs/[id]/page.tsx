'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Pencil,
  FileText,
  Boxes,
  Receipt,
  History,
  Info,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { initialSuppliers, initialSupplierOrders, initialSupplierInvoices } from '@/lib/admin/mock-data/suppliers';

export default function AdminFournisseurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<'infos' | 'produits' | 'commandes' | 'factures' | 'historique'>('infos');

  const supplier = initialSuppliers.find((s) => s.id === resolvedParams.id) || initialSuppliers[0];
  const orders = initialSupplierOrders.filter((o) => o.supplierId === supplier.id);
  const invoices = initialSupplierInvoices.filter((i) => i.supplierId === supplier.id);

  return (
    <div className="space-y-6">
      {/* ── Fil d'Ariane & Retour (Maquette Écran 7) ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/fournisseurs" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft size={14} /> Fournisseurs
        </Link>
        <span>›</span>
        <span className="font-semibold text-foreground">{supplier.name}</span>
      </div>

      {/* ── En-tête Fournisseur (Maquette Écran 7) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#edf8ef] text-[#193e23] flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
            {supplier.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-[#173f22]">
                {supplier.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {supplier.status === 'actif' ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Fournisseur de {supplier.categories.join(' et de ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/approvisionnements"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Boxes size={15} /> Passer une commande
          </Link>
        </div>
      </div>

      {/* ── 5 Onglets de Détail (Maquette Écran 7) ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('infos')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'infos'
              ? 'bg-[#193e23] text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Informations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('produits')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'produits'
              ? 'bg-[#193e23] text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Produits référencés
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('commandes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'commandes'
              ? 'bg-[#193e23] text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Commandes ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('factures')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'factures'
              ? 'bg-[#193e23] text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Factures ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('historique')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'historique'
              ? 'bg-[#193e23] text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Historique
        </button>
      </div>

      {/* ── VUE 1 : Informations & Conditions (Maquette Écran 7) ── */}
      {activeTab === 'infos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Carte 1 : Contact */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Contact direct
            </h3>
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-foreground text-sm">{supplier.contactPerson}</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="text-[#c8436e]" /> {supplier.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="text-[#c8436e]" /> {supplier.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} className="text-[#c8436e]" /> {supplier.address}
              </div>
            </div>
          </div>

          {/* Carte 2 : Catégories */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Catégories fournies
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {supplier.categories.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[#edf8ef] text-[#193e23] font-semibold text-xs">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground pt-2">
              Fournisseur prioritaire pour les approvisionnements floraux de saison.
            </p>
          </div>

          {/* Carte 3 : Conditions Commerciales (Maquette Écran 7) */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Conditions commerciales
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Paiement :</span>
                <span className="font-bold text-foreground">{supplier.paymentTerms}</span>
              </div>
              <div className="flex justify-between">
                <span>Délai habituel :</span>
                <span className="font-bold text-foreground">{supplier.leadTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum commande :</span>
                <span className="font-bold text-[#c8436e]">{supplier.minOrder.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Carte 4 : Notes internes */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Notes internes
            </h3>
            <p className="text-xs text-foreground bg-[#faf8f5] p-3 rounded-xl border border-border leading-relaxed">
              {supplier.notes || 'Aucune note particulière enregistrée pour ce fournisseur.'}
            </p>
          </div>
        </div>
      )}

      {/* ── VUE 2 : Produits référencés ── */}
      {activeTab === 'produits' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3 px-4">Produit interne</th>
                <th className="py-3 px-4">Référence fournisseur</th>
                <th className="py-3 px-4 text-right">Prix d&apos;achat</th>
                <th className="py-3 px-4">Unité / Qté min</th>
                <th className="py-3 px-4 text-right">Dernière mise à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Roses rouges (Tige longue)</td>
                <td className="py-3 px-4 font-mono text-muted-foreground">FLORA-ROS-01</td>
                <td className="py-3 px-4 text-right font-bold text-[#173f22]">500 FCFA</td>
                <td className="py-3 px-4 text-muted-foreground">Botte de 20 / min 50 tiges</td>
                <td className="py-3 px-4 text-right text-muted-foreground">12 mars 2024</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Lys blanc royal</td>
                <td className="py-3 px-4 font-mono text-muted-foreground">FLORA-LYS-04</td>
                <td className="py-3 px-4 text-right font-bold text-[#173f22]">1 200 FCFA</td>
                <td className="py-3 px-4 text-muted-foreground">Tige / min 20 tiges</td>
                <td className="py-3 px-4 text-right text-muted-foreground">10 mars 2024</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Feuillage eucalyptus frais</td>
                <td className="py-3 px-4 font-mono text-muted-foreground">FLORA-EUC-02</td>
                <td className="py-3 px-4 text-right font-bold text-[#173f22]">600 FCFA</td>
                <td className="py-3 px-4 text-muted-foreground">Botte / min 10 bottes</td>
                <td className="py-3 px-4 text-right text-muted-foreground">01 mars 2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── VUE 3 : Commandes ── */}
      {activeTab === 'commandes' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="py-3 px-4 font-mono font-bold text-[#173f22]">{o.id}</td>
                  <td className="py-3 px-4 text-muted-foreground">{o.date}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#c8436e]">{o.total.toLocaleString('fr-FR')} FCFA</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/approvisionnements/reception/${o.id}`}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                    >
                      Voir réception
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── VUE 4 : Factures ── */}
      {activeTab === 'factures' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Date d&apos;émission</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40">
                  <td className="py-3 px-4 font-mono font-bold text-[#173f22]">{inv.id}</td>
                  <td className="py-3 px-4 text-muted-foreground">{inv.date}</td>
                  <td className="py-3 px-4 text-muted-foreground">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#c8436e]">{inv.amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── VUE 5 : Historique ── */}
      {activeTab === 'historique' && (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-start gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
            <div>
              <span className="font-semibold text-foreground">Création de la commande CF-2024-0012</span>
              <p className="text-muted-foreground text-[11px]">12 mars 2024 à 10:14 · Transmis par Email &amp; WhatsApp</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <span className="font-semibold text-foreground">Mise à jour tarifaire : Roses rouges (500 FCFA/tige)</span>
              <p className="text-muted-foreground text-[11px]">01 mars 2024 à 14:30 par l’administrateur</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
            <div>
              <span className="font-semibold text-foreground">Enregistrement facture FAC-2024-0045</span>
              <p className="text-muted-foreground text-[11px]">10 mars 2024 · Montant : 250 000 FCFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
