'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  CalendarClock,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Armchair,
} from 'lucide-react';
import {
  initialRentalEquipment,
  initialRentalReservations,
  initialGanttBookings,
  GanttBooking,
} from '@/lib/admin/mock-data/rentals';
import { RentalEquipment, RentalReservation, RentalReservationStatus } from '@/lib/admin/mock-data/types';

export default function AdminLocationPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendrier' | 'equipements'>('calendrier');
  const [reservations, setReservations] = useState<RentalReservation[]>(initialRentalReservations);
  const [equipmentList, setEquipmentList] = useState<RentalEquipment[]>(initialRentalEquipment);
  const [ganttBookings, setGanttBookings] = useState<GanttBooking[]>(initialGanttBookings);
  const [statusFilter, setStatusFilter] = useState<'all' | RentalReservationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'mois' | 'semaine'>('mois');

  // Days shown in Mockup Screen 13: Mars 2024 (10 to 22)
  const ganttDays = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const getStatusBadge = (status: RentalReservationStatus) => {
    switch (status) {
      case 'confirmee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmée</span>;
      case 'en_attente':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">En attente</span>;
      case 'en_cours':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">En cours</span>;
      case 'terminee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Terminée</span>;
      case 'annulee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Annulée</span>;
      default:
        return null;
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">
            Équipements &amp; Réservations de Location
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez votre catalogue de location événementielle, les disponibilités et le planning des réservations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Modale d’ajout d’un nouvel équipement de location ouverte.')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-fit"
        >
          <Plus size={18} /> Ajouter un équipement
        </button>
      </div>

      {/* ── Onglets Principaux du Module ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('calendrier')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'calendrier'
              ? 'bg-[#193e23] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Calendrier &amp; Planning (Gantt)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'reservations'
              ? 'bg-[#193e23] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Réservations en cours ({reservations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('equipements')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'equipements'
              ? 'bg-[#193e23] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Catalogue des équipements ({equipmentList.length})
        </button>
      </div>

      {/* ── VUE 1 : Calendrier des locations (Maquette Écran 13) ── */}
      {activeTab === 'calendrier' && (
        <div className="space-y-6">
          {/* Barre de contrôles du calendrier */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-xs">
            {/* Recherche & Catégorie */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs w-64">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  className="bg-transparent outline-none w-full placeholder:text-muted-foreground"
                />
              </div>

              <select className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none">
                <option value="all">Toutes les catégories</option>
                <option value="mobilier">Mobilier événementiel</option>
                <option value="vaisselle">Vaisselle &amp; arts de la table</option>
                <option value="decoration">Décoration florale</option>
              </select>
            </div>

            {/* Navigateur de Mois & Commutateur de Vue */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-serif font-bold text-base text-[#173f22]">
                  Mars 2024
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                  aria-label="Mois suivant"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('mois')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'mois' ? 'bg-white shadow-xs text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Mois
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('semaine')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'semaine' ? 'bg-white shadow-xs text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Semaine
                </button>
              </div>
            </div>
          </div>

          {/* Grille Gantt / Planning Temporel */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
                {/* En-tête des jours */}
                <div className="grid grid-cols-16 border-b border-border bg-[#faf8f5] text-xs font-semibold text-muted-foreground">
                  <div className="col-span-3 p-3.5 border-r border-border text-[#173f22]">
                    Équipements
                  </div>
                  {ganttDays.map((day) => (
                    <div key={day} className="p-3 text-center border-r border-border last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Lignes du Gantt */}
                {[
                  { name: 'Table ronde (20)', id: 'table-ronde' },
                  { name: 'Chaise Chiavari (150)', id: 'chaise-chiavari' },
                  { name: 'Arche florale (5)', id: 'arche-florale' },
                  { name: 'Centre de table (30)', id: 'centre-de-table' },
                  { name: 'Nappe blanche (200)', id: 'nappe-blanche' },
                ].map((row, idx) => {
                  const rowBookings = ganttBookings.filter((b) => b.equipmentName.startsWith(row.name.split(' ')[0]));
                  return (
                    <div key={idx} className="grid grid-cols-16 border-b border-border last:border-b-0 items-center min-h-[64px] hover:bg-muted/10 transition-colors">
                      {/* Nom de l'équipement */}
                      <div className="col-span-3 p-3.5 border-r border-border font-medium text-xs text-foreground flex items-center gap-2">
                        <Armchair size={14} className="text-[#c8436e] shrink-0" />
                        <span>{row.name}</span>
                      </div>

                      {/* Timeline des 13 jours */}
                      <div className="col-span-13 relative h-12 flex items-center">
                        {/* Lignes verticales de repère */}
                        <div className="absolute inset-0 grid grid-cols-13 pointer-events-none">
                          {ganttDays.map((d, di) => (
                            <div key={di} className="border-r border-border/40 last:border-r-0 h-full" />
                          ))}
                        </div>

                        {/* Barres de réservation colorées */}
                        {rowBookings.map((b) => {
                          const leftOffsetPercent = ((b.startDay - 10) / 13) * 100;
                          const widthPercent = ((b.endDay - b.startDay + 1) / 13) * 100;

                          let bgClass = 'bg-emerald-500 text-white';
                          if (b.status === 'en_cours') bgClass = 'bg-blue-500 text-white';
                          if (b.status === 'en_attente') bgClass = 'bg-amber-400 text-black';
                          if (b.status === 'non_disponible') bgClass = 'bg-rose-400 text-white';

                          return (
                            <div
                              key={b.id}
                              style={{
                                left: `${Math.max(0, leftOffsetPercent)}%`,
                                width: `${Math.min(100, widthPercent)}%`,
                              }}
                              className={`absolute h-7 rounded-md px-2 flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity ${bgClass}`}
                              title={`${b.id} (${b.equipmentName}) du ${b.startDay} au ${b.endDay} Mars - Statut: ${b.status}`}
                            >
                              {b.id}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Légende du Planning */}
            <div className="p-4 border-t border-border bg-[#faf8f5] flex flex-wrap items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Confirmée</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">En cours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground">En attente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="text-muted-foreground">Non disponible</span>
                </div>
              </div>

              <span className="text-xs text-muted-foreground italic">
                Cliquez sur une barre de réservation pour modifier ses dates ou libérer le matériel.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── VUE 2 : Réservations de Location (Maquette Écran 12) ── */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          {/* Filtres par statuts avec compteurs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === 'all' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Toutes (32)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('en_attente')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === 'en_attente' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              En attente (6)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmee')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === 'confirmee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Confirmées (15)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('en_cours')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === 'en_cours' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              En cours (5)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('terminee')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === 'terminee' ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Terminées (4)
            </button>
          </div>

          {/* Recherche */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par référence, nom client, équipement..."
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Tableau des réservations */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">N° réservation</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Équipement</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Montant &amp; Caution</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#173f22]">
                        {res.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{res.clientName}</div>
                        <div className="text-xs text-muted-foreground">{res.clientPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {res.equipmentName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {res.startDate} au {res.endDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#c8436e]">{res.totalRental.toLocaleString('fr-FR')} FCFA</div>
                        <div className="text-[11px] text-muted-foreground">Caution : {res.deposit.toLocaleString('fr-FR')} FCFA</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Détails de la réservation ${res.id}`)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── VUE 3 : Catalogue des Équipements ── */}
      {activeTab === 'equipements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full">
                  <Image src={eq.image} alt={eq.name} fill className="object-cover" />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-[#193e23]">
                    Dispo : {eq.availableStock} / {eq.totalStock}
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-semibold text-[#c8436e] uppercase tracking-wider">{eq.categoryLabel}</span>
                  <h3 className="font-serif font-bold text-lg text-[#173f22] mt-0.5">{eq.name}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-extrabold text-[#c8436e]">
                      {eq.pricePerDay.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-xs text-muted-foreground">/ jour</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Caution : <strong>{eq.deposit.toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-border mt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} /> En catalogue
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => alert('Édition de l’équipement')}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Supprimer cet équipement ?')) {
                        setEquipmentList((prev) => prev.filter((e) => e.id !== eq.id));
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
