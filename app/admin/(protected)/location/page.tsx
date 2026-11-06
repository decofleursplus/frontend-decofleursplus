'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  X,
  Save,
  FileText,
  User,
  Phone,
  Calendar,
  CalendarDays,
  BarChart3,
  ArrowRightLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import type { GanttBooking } from '@/lib/admin/mock-data/rentals';
import { RentalEquipment, RentalReservation, RentalReservationStatus } from '@/lib/admin/mock-data/types';
import {
  getAdminRentalEquipment,
  createAdminRentalEquipment,
  updateAdminRentalEquipment,
  deleteAdminRentalEquipment,
} from '@/lib/api/admin/rentals';
import { ApiClientError } from '@/lib/api/client';

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const WEEKDAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function AdminLocationPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendrier' | 'equipements'>('calendrier');
  const [reservations, setReservations] = useState<RentalReservation[]>([]);
  const [equipmentList, setEquipmentList] = useState<RentalEquipment[]>([]);
  const [ganttBookings, setGanttBookings] = useState<GanttBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | RentalReservationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRentalData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const items = await getAdminRentalEquipment();
      setEquipmentList(items);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Erreur lors du chargement des équipements de location';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRentalData();
  }, [loadRentalData]);

  // Dynamic Gantt Controls
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2); // 2 = Mars (0-indexed)
  const [viewMode, setViewMode] = useState<'mois' | 'semaine'>('mois');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1); // Semaine 2
  const [ganttSearch, setGanttSearch] = useState('');
  const [ganttCategory, setGanttCategory] = useState('all');
  const [mobileGanttView, setMobileGanttView] = useState<'agenda' | 'gantt'>('agenda');

  // Reservation Drawer state
  const [selectedReservation, setSelectedReservation] = useState<RentalReservation | null>(null);
  const [isReservationDrawerOpen, setIsReservationDrawerOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<RentalReservationStatus>('confirmee');
  const [editNotes, setEditNotes] = useState('');

  // Equipment Drawer state (Add / Edit)
  const [isEquipmentDrawerOpen, setIsEquipmentDrawerOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState<'mobilier' | 'vaisselle' | 'decoration' | 'accessoires'>('mobilier');
  const [eqPricePerDay, setEqPricePerDay] = useState(25000);
  const [eqDeposit, setEqDeposit] = useState(50000);
  const [eqTotalStock, setEqTotalStock] = useState(20);
  const [eqAvailableStock, setEqAvailableStock] = useState(20);
  const [eqDimensions, setEqDimensions] = useState('');
  const [eqDescription, setEqDescription] = useState('');
  const [eqImage, setEqImage] = useState('/images/location/table-ronde.jpg');

  const openReservationDetails = (idOrRef: string) => {
    const existing = reservations.find(
      (r) =>
        r.id === idOrRef ||
        r.id.includes(idOrRef) ||
        idOrRef.includes(r.id.replace('RL-2026-', 'RL-'))
    );
    if (existing) {
      setSelectedReservation(existing);
      setEditStatus(existing.status);
      setEditNotes(existing.notes || '');
    } else {
      // Find matching Gantt booking
      const g = ganttBookings.find((b) => b.id === idOrRef);
      const bMonth = g?.month ?? currentMonth;
      const bYear = g?.year ?? currentYear;
      const monthName = MONTH_NAMES[bMonth].toLowerCase();

      const fallback: RentalReservation = {
        id: idOrRef.startsWith('RL-2026-') ? idOrRef : `RL-2026-${idOrRef.replace('RL-', '00')}`,
        clientName: g?.clientName || 'Client Événementiel',
        clientEmail: g?.clientEmail || 'contact@evenement.sn',
        clientPhone: g?.clientPhone || '+221 77 000 00 00',
        equipmentId: g ? g.equipmentName.toLowerCase().split(' ')[0] : 'equipement',
        equipmentName: g ? g.equipmentName : 'Équipement de réception',
        quantity: g ? g.totalQuantity : 1,
        startDate: g ? `${g.startDay} ${monthName} ${bYear}` : `15 ${monthName} ${bYear}`,
        endDate: g ? `${g.endDay} ${monthName} ${bYear}` : `18 ${monthName} ${bYear}`,
        totalRental: g?.totalRental || 150000,
        deposit: g?.deposit || 50000,
        status:
          g &&
          (g.status === 'confirmee' ||
            g.status === 'en_cours' ||
            g.status === 'en_attente')
            ? g.status
            : 'confirmee',
        notes: 'Réservation inspectée depuis le planning dynamique Gantt.',
      };
      setSelectedReservation(fallback);
      setEditStatus(fallback.status);
      setEditNotes(fallback.notes || '');
    }
    setIsReservationDrawerOpen(true);
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;

    const updatedRes: RentalReservation = {
      ...selectedReservation,
      status: editStatus,
      notes: editNotes,
    };

    setReservations((prev) =>
      prev.map((r) => (r.id === selectedReservation.id ? updatedRes : r))
    );

    // Also update matching Gantt booking if applicable
    setGanttBookings((prev) =>
      prev.map((b) => {
        if (
          selectedReservation.id.includes(b.id) ||
          b.id.includes(selectedReservation.id.replace('RL-2026-', 'RL-'))
        ) {
          const mappedStatus: 'confirmee' | 'en_cours' | 'en_attente' | 'non_disponible' =
            editStatus === 'annulee'
              ? 'non_disponible'
              : editStatus === 'terminee'
              ? 'confirmee'
              : (editStatus as any);
          return { ...b, status: mappedStatus };
        }
        return b;
      })
    );

    setSelectedReservation(updatedRes);
    setIsReservationDrawerOpen(false);
    toast.success(`Réservation ${selectedReservation.id} mise à jour avec succès !`);
  };

  const handleReturnEquipment = () => {
    if (!selectedReservation) return;
    setEditStatus('terminee');
    const updatedRes = { ...selectedReservation, status: 'terminee' as RentalReservationStatus };
    setReservations((prev) =>
      prev.map((r) => (r.id === selectedReservation.id ? updatedRes : r))
    );
    setSelectedReservation(updatedRes);
    toast.success(`Matériel restitué avec succès pour ${selectedReservation.id}.`);
  };

  const handleReleaseDeposit = () => {
    if (!selectedReservation) return;
    toast.success(`Caution de ${selectedReservation.deposit.toLocaleString('fr-FR')} FCFA débloquée et restituée.`);
  };

  const handleOpenEquipmentDrawer = (eq?: RentalEquipment) => {
    if (eq) {
      setEditingEquipmentId(eq.id);
      setEqName(eq.name);
      setEqCategory(eq.category);
      setEqPricePerDay(eq.pricePerDay);
      setEqDeposit(eq.deposit);
      setEqTotalStock(eq.totalStock);
      setEqAvailableStock(eq.availableStock);
      setEqDimensions(eq.dimensions || '');
      setEqDescription(eq.description || '');
      setEqImage(eq.image || '/images/location/table-ronde.jpg');
    } else {
      setEditingEquipmentId(null);
      setEqName('');
      setEqCategory('mobilier');
      setEqPricePerDay(15000);
      setEqDeposit(30000);
      setEqTotalStock(10);
      setEqAvailableStock(10);
      setEqDimensions('Dimensions standard · Finition soignée');
      setEqDescription('Équipement haut de gamme pour cérémonies et réceptions.');
      setEqImage('/images/location/table-ronde.jpg');
    }
    setIsEquipmentDrawerOpen(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) {
      toast.error('Veuillez saisir le nom de l’équipement.');
      return;
    }

    try {
      if (editingEquipmentId) {
        const updated = await updateAdminRentalEquipment(editingEquipmentId, {
          name: eqName,
          category: eqCategory,
          pricePerDay: Number(eqPricePerDay),
          depositAmount: Number(eqDeposit),
          totalQuantity: Number(eqTotalStock),
          dimensions: eqDimensions,
          description: eqDescription,
          imageUrl: eqImage,
        });
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === editingEquipmentId ? updated : eq))
        );
        toast.success(`Équipement « ${eqName} » modifié avec succès !`);
      } else {
        const created = await createAdminRentalEquipment({
          name: eqName,
          category: eqCategory,
          pricePerDay: Number(eqPricePerDay),
          depositAmount: Number(eqDeposit),
          totalQuantity: Number(eqTotalStock),
          description: eqDescription || 'Matériel de réception professionnel',
          dimensions: eqDimensions,
          imageUrl: eqImage,
        });
        setEquipmentList((prev) => [created, ...prev]);
        toast.success(`Équipement « ${eqName} » ajouté au catalogue de location !`);
      }
      setIsEquipmentDrawerOpen(false);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Erreur lors de l'enregistrement";
      toast.error(msg);
    }
  };

  const handleDeleteEquipment = async (id: string, name: string) => {
    try {
      await deleteAdminRentalEquipment(id);
      setEquipmentList((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Équipement « ${name} » retiré du catalogue.`);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Erreur lors de la suppression';
      toast.error(msg);
    }
  };

  // Computed dynamic dates for Gantt Planning in 2026
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const weeksOfMonth = useMemo(() => {
    const weeks = [];
    let start = 1;
    while (start <= daysInMonth) {
      const end = Math.min(start + 6, daysInMonth);
      weeks.push({
        index: weeks.length,
        startDay: start,
        endDay: end,
        days: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        label: `Semaine ${weeks.length + 1} : du ${start} au ${end} ${MONTH_NAMES[currentMonth]} ${currentYear}`,
        shortLabel: `S${weeks.length + 1} (${start}-${end})`,
      });
      start = end + 1;
    }
    return weeks;
  }, [currentYear, currentMonth, daysInMonth]);

  const currentWeek = useMemo(() => {
    return weeksOfMonth[Math.min(selectedWeekIndex, weeksOfMonth.length - 1)] || weeksOfMonth[0];
  }, [weeksOfMonth, selectedWeekIndex]);

  const timelineDays = useMemo(() => {
    if (viewMode === 'semaine') {
      return currentWeek.days;
    }
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [viewMode, currentWeek, daysInMonth]);

  const getDayName = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return WEEKDAY_NAMES[d.getDay()];
  };

  const isWeekendDay = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedWeekIndex(0);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedWeekIndex(0);
  };

  // Filter equipment rows in Gantt
  const ganttEquipmentRows = useMemo(() => {
    return equipmentList.filter((eq) => {
      const matchesCat = ganttCategory === 'all' || eq.category === ganttCategory;
      const matchesSearch =
        ganttSearch.trim() === '' ||
        eq.name.toLowerCase().includes(ganttSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [equipmentList, ganttCategory, ganttSearch]);

  // Active bookings for the selected month
  const currentMonthBookings = useMemo(() => {
    return ganttBookings.filter(
      (b) => (b.year ?? 2026) === currentYear && (b.month ?? 2) === currentMonth
    );
  }, [ganttBookings, currentYear, currentMonth]);

  // Bookings for active period (month or week)
  const activePeriodBookings = useMemo(() => {
    if (viewMode === 'semaine') {
      return currentMonthBookings.filter(
        (b) => b.startDay <= currentWeek.endDay && b.endDay >= currentWeek.startDay
      );
    }
    return currentMonthBookings;
  }, [viewMode, currentMonthBookings, currentWeek]);

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
          onClick={() => handleOpenEquipmentDrawer()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto cursor-pointer"
        >
          <Plus size={18} /> Ajouter un équipement
        </button>
      </div>

      {/* ── Onglets Principaux du Module ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('calendrier')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Barre de contrôles principale du calendrier */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-xs">
            {/* Recherche & Catégorie */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs w-full sm:w-60">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  value={ganttSearch}
                  onChange={(e) => setGanttSearch(e.target.value)}
                  placeholder="Filtrer équipement..."
                  className="bg-transparent outline-none w-full placeholder:text-muted-foreground"
                />
                {ganttSearch && (
                  <button
                    type="button"
                    onClick={() => setGanttSearch('')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                value={ganttCategory}
                onChange={(e) => setGanttCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                <option value="mobilier">Mobilier événementiel</option>
                <option value="vaisselle">Vaisselle &amp; arts de la table</option>
                <option value="decoration">Décoration florale</option>
              </select>
            </div>

            {/* Navigateur de Mois & Commutateur de Vue (Mois / Semaine) */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              {/* Stepper de mois */}
              <div className="flex items-center gap-2 bg-[#faf8f5] px-2 py-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                  aria-label="Mois précédent"
                  title="Mois précédent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-serif font-bold text-base text-[#173f22] capitalize min-w-[130px] text-center select-none">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                  aria-label="Mois suivant"
                  title="Mois suivant"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Commutateur de vue : Mois vs Semaine */}
              <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('mois')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'mois'
                      ? 'bg-white shadow-xs text-[#173f22] font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Mois
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('semaine')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'semaine'
                      ? 'bg-white shadow-xs text-[#173f22] font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Semaine
                </button>
              </div>
            </div>
          </div>

          {/* Bandeau contextuel en Mode Semaine */}
          {viewMode === 'semaine' && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-2xs animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWeekIndex((i) => Math.max(0, i - 1))}
                  disabled={selectedWeekIndex === 0}
                  className="p-1.5 rounded-lg border border-border bg-[#faf8f5] hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Semaine précédente"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-xs text-[#173f22]">
                  {currentWeek.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedWeekIndex((i) =>
                      Math.min(weeksOfMonth.length - 1, i + 1)
                    )
                  }
                  disabled={selectedWeekIndex === weeksOfMonth.length - 1}
                  className="p-1.5 rounded-lg border border-border bg-[#faf8f5] hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Semaine suivante"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Raccourcis semaines */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {weeksOfMonth.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWeekIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-center flex flex-col items-center justify-center min-w-[58px] shrink-0 transition-all cursor-pointer ${
                      selectedWeekIndex === idx
                        ? 'bg-[#173f22] text-white shadow-xs'
                        : 'bg-[#faf8f5] border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">S{idx + 1}</span>
                    <span
                      className={`text-[10px] leading-tight whitespace-nowrap mt-0.5 ${
                        selectedWeekIndex === idx ? 'text-white/85 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      ({w.startDay}-{w.endDay})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bandeau KPI / Taux d'occupation en direct */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8f5] p-3 rounded-2xl border border-border text-xs">
            <div className="p-2">
              <span className="text-muted-foreground block text-[11px]">Période sélectionnée</span>
              <span className="font-bold text-[#173f22] text-sm">
                {viewMode === 'semaine'
                  ? `Semaine ${currentWeek.index + 1} (${currentWeek.startDay}-${currentWeek.endDay} ${MONTH_NAMES[currentMonth].slice(0, 4)}.)`
                  : `${MONTH_NAMES[currentMonth]} ${currentYear}`}
              </span>
            </div>
            <div className="p-2 border-l border-border/60">
              <span className="text-muted-foreground block text-[11px]">Réservations actives</span>
              <span className="font-bold text-[#173f22] text-sm">
                {activePeriodBookings.length} dossier{activePeriodBookings.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-2 border-l border-border/60">
              <span className="text-muted-foreground block text-[11px]">Équipements affichés</span>
              <span className="font-bold text-[#173f22] text-sm">
                {ganttEquipmentRows.length} référence{ganttEquipmentRows.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-2 border-l border-border/60">
              <span className="text-muted-foreground block text-[11px]">Taux d'occupation</span>
              <span className="font-bold text-[#c8436e] text-sm">
                {activePeriodBookings.length > 0
                  ? `${Math.min(96, Math.max(35, activePeriodBookings.length * 18))}%`
                  : '0% (Libre)'}
              </span>
            </div>
          </div>

          {/* Commutateur de vue mobile : Agenda Chronologique vs Grille Gantt */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl border border-border shadow-2xs">
            <span className="text-xs font-semibold text-[#173f22]">Affichage :</span>
            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-border/70">
              <button
                type="button"
                onClick={() => setMobileGanttView('agenda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  mobileGanttView === 'agenda'
                    ? 'bg-[#193e23] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays size={14} className="shrink-0" />
                <span>Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileGanttView('gantt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  mobileGanttView === 'gantt'
                    ? 'bg-[#193e23] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 size={14} className="shrink-0" />
                <span>Planning Gantt</span>
              </button>
            </div>
          </div>

          {/* ── Mode 1 : Agenda Chronologique Mobile (lg:hidden) ── */}
          {mobileGanttView === 'agenda' && (
            <div className="lg:hidden space-y-3">
              {activePeriodBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">
                  Aucune réservation active sur cette période ({MONTH_NAMES[currentMonth]} {currentYear}).
                </div>
              ) : (
                activePeriodBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => openReservationDetails(b.id)}
                    className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-2.5 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#173f22] block">
                          {b.id}
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {b.equipmentName}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'confirmee'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'en_cours'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'en_attente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status === 'confirmee'
                          ? 'Confirmée'
                          : b.status === 'en_cours'
                          ? 'En cours'
                          : b.status === 'en_attente'
                          ? 'En attente'
                          : 'Non dispo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#faf8f5] p-2.5 rounded-xl border border-border/60 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Client</span>
                        <span className="font-semibold text-foreground truncate block">{b.clientName || 'Réservé'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Période</span>
                        <span className="font-semibold text-foreground">
                          du {b.startDay} au {b.endDay} {MONTH_NAMES[currentMonth].slice(0, 4)}.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 text-muted-foreground">
                      <span>Quantité : <strong className="text-foreground">{b.totalQuantity} unités</strong></span>
                      <span className="text-[#173f22] font-semibold">
                        Gérer la réservation →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Grille Gantt / Planning Temporel Dynamique */}
          <div className={`${mobileGanttView === 'gantt' ? 'block' : 'hidden lg:block'} space-y-2`}>
            {/* Indication tactile de défilement sur mobile */}
            <div className="lg:hidden flex items-center gap-2 p-2.5 bg-blue-50/70 text-blue-800 rounded-xl text-xs border border-blue-200">
              <ArrowRightLeft size={14} className="shrink-0 text-blue-600" />
              <span>Glissez horizontalement pour parcourir les {timelineDays.length} jours du calendrier.</span>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto no-scrollbar">
                <div
                  className="min-w-full"
                  style={{
                    minWidth: viewMode === 'semaine' ? '820px' : '1100px',
                  }}
                >
                  {/* En-tête des colonnes temporelles */}
                  <div className="flex border-b border-border bg-[#faf8f5] text-xs font-semibold text-muted-foreground">
                    {/* Colonne titre Équipements */}
                    <div className="w-56 shrink-0 p-3.5 border-r border-border text-[#173f22] flex items-center justify-between">
                      <span>Équipements ({ganttEquipmentRows.length})</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Disponibilité</span>
                    </div>

                    {/* Timeline Days Header */}
                    <div
                      className="flex-1 grid"
                      style={{
                        gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {timelineDays.map((day) => {
                        const weekend = isWeekendDay(day);
                        return (
                          <div
                            key={day}
                            className={`p-2.5 text-center border-r border-border last:border-r-0 flex flex-col items-center justify-center transition-colors ${
                              weekend ? 'bg-amber-50/40 text-[#173f22]' : ''
                            }`}
                          >
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider ${
                                weekend ? 'text-[#c8436e]' : 'text-muted-foreground'
                              }`}
                            >
                              {getDayName(day)}
                            </span>
                            <span className="text-xs font-extrabold text-foreground mt-0.5">
                              {day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lignes du Gantt pour chaque équipement */}
                  {ganttEquipmentRows.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Aucun équipement ne correspond aux filtres appliqués.
                    </div>
                  ) : (
                    ganttEquipmentRows.map((eq, rowIdx) => {
                      // Find matching bookings for this equipment
                      const normE = eq.name.toLowerCase();
                      const eqBookings = activePeriodBookings.filter((b) => {
                        const normB = b.equipmentName.toLowerCase();
                        return normB.includes(normE) || normE.includes(normB.split(' ')[0]);
                      });

                      return (
                        <div
                          key={eq.id}
                          className="flex border-b border-border last:border-b-0 items-center min-h-[64px] hover:bg-muted/10 transition-colors"
                        >
                          {/* Cellule Nom Équipement & Stock */}
                          <div className="w-56 shrink-0 p-3.5 border-r border-border font-medium text-xs text-foreground flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <Armchair size={15} className="text-[#c8436e] shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold block truncate">
                                  {eq.name} ({eq.totalStock})
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  {eq.availableStock} dispo · {eq.pricePerDay.toLocaleString('fr-FR')} F/j
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Timeline Track */}
                          <div className="flex-1 relative h-12 flex items-center">
                            {/* Lignes verticales de repère */}
                            <div
                              className="absolute inset-0 grid pointer-events-none"
                              style={{
                                gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))`,
                              }}
                            >
                              {timelineDays.map((d, di) => {
                                const weekend = isWeekendDay(d);
                                return (
                                  <div
                                    key={di}
                                    className={`border-r border-border/40 last:border-r-0 h-full ${
                                      weekend ? 'bg-amber-50/20' : ''
                                    }`}
                                  />
                                );
                              })}
                            </div>

                            {/* Barres de réservation colorées */}
                            {eqBookings.map((b) => {
                              let leftOffsetPercent = 0;
                              let widthPercent = 0;
                              let isCutLeft = false;
                              let isCutRight = false;

                              if (viewMode === 'semaine') {
                                const vStart = Math.max(b.startDay, currentWeek.startDay);
                                const vEnd = Math.min(b.endDay, currentWeek.endDay);
                                const totalWeekDays = timelineDays.length;

                                leftOffsetPercent =
                                  ((vStart - currentWeek.startDay) / totalWeekDays) * 100;
                                widthPercent =
                                  ((vEnd - vStart + 1) / totalWeekDays) * 100;

                                isCutLeft = b.startDay < currentWeek.startDay;
                                isCutRight = b.endDay > currentWeek.endDay;
                              } else {
                                leftOffsetPercent =
                                  ((b.startDay - 1) / daysInMonth) * 100;
                                widthPercent =
                                  ((b.endDay - b.startDay + 1) / daysInMonth) * 100;
                              }

                              let bgClass =
                                'bg-emerald-500 hover:bg-emerald-600 text-white';
                              if (b.status === 'en_cours')
                                bgClass = 'bg-blue-500 hover:bg-blue-600 text-white';
                              if (b.status === 'en_attente')
                                bgClass =
                                  'bg-amber-400 hover:bg-amber-500 text-slate-900';
                              if (b.status === 'non_disponible')
                                bgClass = 'bg-rose-500 hover:bg-rose-600 text-white';

                              return (
                                <button
                                  type="button"
                                  key={b.id}
                                  onClick={() => openReservationDetails(b.id)}
                                  style={{
                                    left: `${Math.max(0, leftOffsetPercent)}%`,
                                    width: `${Math.min(100, Math.max(2, widthPercent))}%`,
                                  }}
                                  className={`absolute h-7.5 rounded-lg px-2 flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer hover:scale-[1.01] hover:ring-2 hover:ring-black/20 hover:z-20 transition-all ${bgClass}`}
                                  title={`${b.id} — ${b.clientName || 'Réservé'} (${b.equipmentName})\nDu ${b.startDay} au ${b.endDay} ${MONTH_NAMES[currentMonth]} ${currentYear}\nStatut : ${b.status}\nCliquer pour inspecter ou modifier.`}
                                >
                                  <span className="truncate flex items-center gap-1">
                                    {isCutLeft && <span>◀</span>}
                                    <span>{b.id}</span>
                                    {viewMode === 'semaine' && b.clientName && (
                                      <span className="opacity-90 font-medium truncate hidden md:inline">
                                        · {b.clientName}
                                      </span>
                                    )}
                                    {isCutRight && <span>▶</span>}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Légende du Planning */}
              <div className="p-4 border-t border-border bg-[#faf8f5] flex flex-wrap items-center justify-between text-xs gap-4">
                <div className="flex flex-wrap items-center gap-5">
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
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">Non disponible</span>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground italic">
                  Cliquez sur une barre de réservation pour modifier ses dates ou libérer le matériel.
                </span>
              </div>
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

          {/* ── Liste Mobile des Réservations (lg:hidden) ── */}
          <div className="lg:hidden space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
                Aucune réservation ne correspond aux critères sélectionnés.
              </div>
            ) : (
              filteredReservations.map((res) => (
                <div key={res.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#173f22] block">
                        {res.id}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {res.clientName}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {res.clientPhone}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(res.status)}
                    </div>
                  </div>

                  <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Équipement</span>
                      <span className="font-semibold text-foreground">{res.equipmentName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Période</span>
                      <span className="text-foreground">{res.startDate} au {res.endDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Montant location</span>
                        <span className="font-bold text-[#c8436e] text-sm">
                          {res.totalRental.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block text-[11px]">Caution</span>
                        <span className="text-foreground font-semibold">
                          {res.deposit.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openReservationDetails(res.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-[#173f22] bg-white hover:bg-muted/60 transition-all cursor-pointer shadow-2xs"
                  >
                    Détails &amp; Suivi de réservation
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Tableau des réservations Desktop (hidden lg:block) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
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
                          onClick={() => openReservationDetails(res.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-gray-800 transition-colors cursor-pointer"
                        >
                          Détails &amp; Suivi
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
          {loading ? (
            <div className="col-span-full bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#173f22]" />
              <p className="text-xs">Chargement du catalogue de location...</p>
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground space-y-3">
              <Armchair className="h-10 w-10 text-gray-300 mx-auto" />
              <div>
                <p className="font-semibold text-gray-700 text-sm">Aucun équipement de location enregistré</p>
                <p className="text-xs text-gray-400 mt-1">Créez vos fiches matériel (chaises, tables, arches, vaisselle) pour les louer en ligne.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEquipmentDrawer()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} /> Ajouter un équipement
              </button>
            </div>
          ) : (
            equipmentList.map((eq) => (
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
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEquipmentDrawer(eq)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-gray-700 transition-colors cursor-pointer"
                      title="Modifier l'équipement"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Supprimer du catalogue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Side Drawer 1 : Détails & Modification de Réservation ── */}
      {selectedReservation && (
        <AdminDrawer
          isOpen={isReservationDrawerOpen}
          onClose={() => setIsReservationDrawerOpen(false)}
          size="lg"
          title={`Réservation #${selectedReservation.id}`}
          subtitle="Dossier de location événementielle et cautionnement."
          icon={<CalendarClock size={20} />}
          headerExtra={getStatusBadge(selectedReservation.status)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsReservationDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="submit"
                form="reservation-form"
                className="px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save size={15} /> Enregistrer les modifications
              </button>
            </>
          }
        >
          <form id="reservation-form" onSubmit={handleSaveReservation} className="space-y-5 text-xs">
            {/* Client Info */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <span className="font-bold text-[#173f22] uppercase tracking-wider text-[11px] block">
                Coordonnées Client
              </span>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nom :</span>
                <span className="font-semibold text-foreground">{selectedReservation.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-mono text-foreground">{selectedReservation.clientPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email :</span>
                <span className="text-foreground">{selectedReservation.clientEmail}</span>
              </div>
            </div>

            {/* Equipment & Duration */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <span className="font-bold text-[#173f22] uppercase tracking-wider text-[11px] block">
                Matériel Loué &amp; Dates
              </span>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Équipement :</span>
                <span className="font-semibold text-foreground">{selectedReservation.equipmentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantité :</span>
                <span className="font-bold text-[#173f22]">{selectedReservation.quantity} unité(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Période :</span>
                <span className="font-medium text-foreground">{selectedReservation.startDate} au {selectedReservation.endDate}</span>
              </div>
            </div>

            {/* Financial Recap & Caution */}
            <div className="p-4 rounded-2xl bg-[#edf8ef]/60 border border-emerald-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Montant total location :</span>
                <span className="text-base font-extrabold text-[#c8436e]">
                  {selectedReservation.totalRental.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60">
                <span className="text-muted-foreground">Caution de garantie :</span>
                <span className="font-bold text-[#173f22]">
                  {selectedReservation.deposit.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReleaseDeposit}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Restituer caution
                </button>
                <button
                  type="button"
                  onClick={handleReturnEquipment}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#193e23] hover:bg-[#13301b] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Valider retour matériel
                </button>
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block font-semibold text-muted-foreground mb-1.5">
                Statut de la réservation
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RentalReservationStatus)}
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs cursor-pointer"
              >
                <option value="confirmee">Confirmée</option>
                <option value="en_cours">En cours</option>
                <option value="en_attente">En attente</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-muted-foreground mb-1.5">
                Instructions &amp; Observations
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes sur la livraison, état du matériel..."
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs resize-none"
              />
            </div>
          </form>
        </AdminDrawer>
      )}

      {/* ── Side Drawer 2 : Ajout / Édition d'Équipement ── */}
      <AdminDrawer
        isOpen={isEquipmentDrawerOpen}
        onClose={() => setIsEquipmentDrawerOpen(false)}
        size="lg"
        title={editingEquipmentId ? 'Modifier l’équipement' : 'Ajouter un équipement'}
        subtitle="Catalogue officiel de location événementielle."
        icon={<Armchair size={20} />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEquipmentDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="equipment-form"
              className="px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save size={15} />
              {editingEquipmentId ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
            </button>
          </>
        }
      >
        <form id="equipment-form" onSubmit={handleSaveEquipment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Nom de l’équipement *</label>
            <input
              type="text"
              required
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              placeholder="Ex : Table ronde, Chaise Chiavari..."
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Catégorie *</label>
            <select
              value={eqCategory}
              onChange={(e) => setEqCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
            >
              <option value="mobilier">Mobilier événementiel</option>
              <option value="vaisselle">Vaisselle &amp; arts de la table</option>
              <option value="decoration">Décoration florale</option>
              <option value="accessoires">Accessoires &amp; lumières</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Prix par jour (FCFA) *</label>
              <input
                type="number"
                required
                min={0}
                value={eqPricePerDay}
                onChange={(e) => setEqPricePerDay(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Caution requise (FCFA) *</label>
              <input
                type="number"
                required
                min={0}
                value={eqDeposit}
                onChange={(e) => setEqDeposit(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Stock total *</label>
              <input
                type="number"
                required
                min={1}
                value={eqTotalStock}
                onChange={(e) => setEqTotalStock(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Stock disponible *</label>
              <input
                type="number"
                required
                min={0}
                value={eqAvailableStock}
                onChange={(e) => setEqAvailableStock(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Dimensions &amp; Spécifications</label>
            <input
              type="text"
              value={eqDimensions}
              onChange={(e) => setEqDimensions(e.target.value)}
              placeholder="Ex : Diamètre 180 cm · 8-10 personnes"
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Description</label>
            <textarea
              rows={2}
              value={eqDescription}
              onChange={(e) => setEqDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs"
            />
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
