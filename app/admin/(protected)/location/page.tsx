'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Armchair,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api/client';
import { getAdminUser } from '@/lib/api/auth-token';
import {
  deleteAdminRentalEquipment,
  getAdminRentalEquipment,
  getAdminRentalReservations,
  type AdminRentalReservationList,
  type RentalEquipment,
  type RentalItemAdminStatus,
  type RentalReservationStatus,
} from '@/lib/api/admin/rentals';
import { formatFcfa, formatRentalPeriod } from '@/lib/rental-utils';
import { EquipmentDrawer, ITEM_STATUS_LABELS, RENTAL_CATEGORY_OPTIONS } from './_components/equipment-drawer';
import { GanttPlanning } from './_components/gantt-planning';
import { ReservationDrawer } from './_components/reservation-drawer';
import { DepositStatusBadge, ReservationStatusBadge } from './_components/reservation-status';

type Tab = 'calendrier' | 'reservations' | 'equipements';

const STATUS_TABS: { value: 'all' | RentalReservationStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'DISPATCHED', label: 'En cours' },
  { value: 'RETURNED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
];

const PAGE_SIZE = 20;
const MANAGER_ROLES = ['ADMIN', 'MANAGER'];

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiClientError ? err.message : fallback);

export default function AdminLocationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calendrier');
  const [canManageEquipment, setCanManageEquipment] = useState(false);

  // Rafraîchissement croisé (planning + liste) après chaque modification
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshAll = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Réservations (paginées côté serveur) ──
  const [statusFilter, setStatusFilter] = useState<'all' | RentalReservationStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reservations, setReservations] = useState<AdminRentalReservationList | null>(null);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

  // ── Équipements ──
  const [equipment, setEquipment] = useState<RentalEquipment[]>([]);
  const [equipmentStatus, setEquipmentStatus] = useState<'all' | RentalItemAdminStatus>('all');
  const [equipmentCategory, setEquipmentCategory] = useState('all');
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<RentalEquipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RentalEquipment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCanManageEquipment(MANAGER_ROLES.includes(getAdminUser()?.role ?? ''));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setReservationsLoading(true);
    getAdminRentalReservations({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setReservations(res);
        setReservationsError(null);
      })
      .catch((err) => {
        if (!cancelled) setReservationsError(errorMessage(err, 'Impossible de charger les réservations.'));
      })
      .finally(() => {
        if (!cancelled) setReservationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter, search, page, refreshKey]);

  const loadEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    try {
      const items = await getAdminRentalEquipment({
        status: equipmentStatus === 'all' ? undefined : equipmentStatus,
        category: equipmentCategory,
      });
      setEquipment(items);
      setEquipmentError(null);
    } catch (err) {
      setEquipmentError(errorMessage(err, 'Impossible de charger le catalogue de location.'));
    } finally {
      setEquipmentLoading(false);
    }
  }, [equipmentStatus, equipmentCategory]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment, refreshKey]);

  const counts = reservations?.counts;
  const countFor = (value: 'all' | RentalReservationStatus): number | null => {
    if (!counts) return null;
    if (value === 'all') return Object.values(counts).reduce((s, n) => s + n, 0);
    return counts[value];
  };

  const openEquipmentDrawer = (eq: RentalEquipment | null) => {
    setEditingEquipment(eq);
    setEquipmentDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteAdminRentalEquipment(deleteTarget.id);
      toast.success(
        result.deleted
          ? `Équipement « ${deleteTarget.name} » supprimé définitivement.`
          : `« ${deleteTarget.name} » a déjà des réservations : il est retiré du catalogue et conservé pour l’historique.`,
      );
      setDeleteTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(errorMessage(err, 'La suppression a échoué.'));
    } finally {
      setDeleting(false);
    }
  };

  const tabClass = (tab: Tab) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 ${
      activeTab === tab ? 'bg-[#193e23] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  const pendingCount = counts?.PENDING ?? 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">Équipements &amp; Réservations de Location</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catalogue de location événementielle, disponibilités et planning des réservations.
          </p>
        </div>
        {canManageEquipment && (
          <button
            type="button"
            onClick={() => openEquipmentDrawer(null)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Plus size={18} /> Ajouter un équipement
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button type="button" onClick={() => setActiveTab('calendrier')} className={tabClass('calendrier')}>
          Planning (Gantt)
        </button>
        <button type="button" onClick={() => setActiveTab('reservations')} className={tabClass('reservations')}>
          Réservations ({countFor('all') ?? '…'})
          {pendingCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">
              {pendingCount} en attente
            </span>
          )}
        </button>
        <button type="button" onClick={() => setActiveTab('equipements')} className={tabClass('equipements')}>
          Catalogue des équipements ({equipmentLoading && equipment.length === 0 ? '…' : equipment.length})
        </button>
      </div>

      {activeTab === 'calendrier' && (
        <GanttPlanning refreshKey={refreshKey} onOpenReservation={setSelectedReservationId} />
      )}

      {/* ── Réservations ── */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  statusFilter === tab.value ? 'bg-[#193e23] text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab.label} ({countFor(tab.value) ?? '…'})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par numéro, client, téléphone, email, équipement..."
              aria-label="Rechercher une réservation"
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput('')} className="text-muted-foreground cursor-pointer" aria-label="Effacer">
                <X size={14} />
              </button>
            )}
          </div>

          {reservationsError ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-3">
              <AlertCircle className="mx-auto text-red-500" size={24} />
              <p className="text-sm text-red-700">{reservationsError}</p>
              <button type="button" onClick={refreshAll} className="px-4 py-2 rounded-xl bg-[#193e23] text-white text-xs font-semibold cursor-pointer">
                Réessayer
              </button>
            </div>
          ) : !reservations && reservationsLoading ? (
            <div className="bg-white rounded-2xl border border-border p-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="animate-spin" size={18} /> Chargement des réservations…
            </div>
          ) : reservations && reservations.items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center text-muted-foreground text-sm">
              {search || statusFilter !== 'all'
                ? 'Aucune réservation ne correspond à ces critères.'
                : 'Aucune réservation de location pour le moment. Les demandes faites sur la page publique « Location » apparaîtront ici.'}
            </div>
          ) : reservations ? (
            <div className={`space-y-4 transition-opacity ${reservationsLoading ? 'opacity-60' : ''}`}>
              {/* Mobile */}
              <div className="lg:hidden space-y-3">
                {reservations.items.map((res) => (
                  <div key={res.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#173f22] block">{res.reservationNumber}</span>
                        <span className="font-semibold text-foreground text-sm">{res.clientName}</span>
                        <span className="text-xs text-muted-foreground block">{res.clientPhone}</span>
                      </div>
                      <ReservationStatusBadge status={res.status} />
                    </div>
                    <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/60 text-xs space-y-1.5">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Équipement</span>
                        <span className="font-semibold text-right">{res.quantity} × {res.equipmentName}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Période</span>
                        <span className="text-right">{formatRentalPeriod(res.startDate, res.endDate)}</span>
                      </div>
                      <div className="flex justify-between gap-2 pt-1 border-t border-border/40">
                        <span className="font-bold text-[#c8436e]">{formatFcfa(res.totalRental)}</span>
                        <DepositStatusBadge status={res.depositStatus} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReservationId(res.id)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-[#173f22] bg-white hover:bg-muted/60 cursor-pointer"
                    >
                      Détails &amp; suivi
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" data-testid="reservations-table">
                    <thead className="bg-[#faf8f5] text-xs font-semibold text-[#526655] border-b border-border">
                      <tr>
                        <th className="py-3.5 px-4">N° réservation</th>
                        <th className="py-3.5 px-4">Client</th>
                        <th className="py-3.5 px-4">Équipement</th>
                        <th className="py-3.5 px-4">Dates</th>
                        <th className="py-3.5 px-4">Montant &amp; caution</th>
                        <th className="py-3.5 px-4">Statut</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs sm:text-sm">
                      {reservations.items.map((res) => (
                        <tr key={res.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#173f22]">{res.reservationNumber}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-foreground">{res.clientName}</div>
                            <div className="text-xs text-muted-foreground">{res.clientPhone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">{res.quantity} × {res.equipmentName}</td>
                          <td className="py-3.5 px-4 text-muted-foreground">{formatRentalPeriod(res.startDate, res.endDate)}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#c8436e]">{formatFcfa(res.totalRental)}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              {formatFcfa(res.deposit)} <DepositStatusBadge status={res.depositStatus} />
                            </div>
                          </td>
                          <td className="py-3.5 px-4"><ReservationStatusBadge status={res.status} /></td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReservationId(res.id)}
                              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-gray-800 cursor-pointer"
                            >
                              Détails &amp; suivi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination serveur */}
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground" data-testid="reservations-pagination">
                <span>
                  {reservations.total} réservation{reservations.total > 1 ? 's' : ''} · page {reservations.page} / {reservations.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || reservationsLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Précédent
                  </button>
                  <button
                    type="button"
                    disabled={page >= reservations.totalPages || reservationsLoading}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    Suivant <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Catalogue des équipements ── */}
      {activeTab === 'equipements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={equipmentCategory}
              onChange={(e) => setEquipmentCategory(e.target.value)}
              aria-label="Filtrer par catégorie"
              className="px-3 py-2 rounded-xl bg-white border border-border text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {RENTAL_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={equipmentStatus}
              onChange={(e) => setEquipmentStatus(e.target.value as 'all' | RentalItemAdminStatus)}
              aria-label="Filtrer par statut"
              className="px-3 py-2 rounded-xl bg-white border border-border text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              {(Object.keys(ITEM_STATUS_LABELS) as RentalItemAdminStatus[]).map((s) => (
                <option key={s} value={s}>{ITEM_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {equipmentError ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-3">
              <AlertCircle className="mx-auto text-red-500" size={24} />
              <p className="text-sm text-red-700">{equipmentError}</p>
              <button type="button" onClick={loadEquipment} className="px-4 py-2 rounded-xl bg-[#193e23] text-white text-xs font-semibold cursor-pointer">
                Réessayer
              </button>
            </div>
          ) : equipmentLoading && equipment.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#173f22]" />
              <p className="text-xs">Chargement du catalogue de location…</p>
            </div>
          ) : equipment.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground space-y-3">
              <Armchair className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700 text-sm">
                {equipmentStatus !== 'all' || equipmentCategory !== 'all'
                  ? 'Aucun équipement ne correspond à ces filtres.'
                  : 'Aucun équipement de location enregistré'}
              </p>
              {canManageEquipment && equipmentStatus === 'all' && equipmentCategory === 'all' && (
                <button
                  type="button"
                  onClick={() => openEquipmentDrawer(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold text-xs cursor-pointer"
                >
                  <Plus size={15} /> Ajouter un équipement
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="equipment-grid">
              {equipment.map((eq) => (
                <div key={eq.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col justify-between" data-testid="equipment-card">
                  <div>
                    <div className="relative aspect-[16/10] w-full bg-muted/40">
                      {eq.image ? (
                        <Image src={eq.image} alt={eq.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Package size={36} /></div>
                      )}
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-[#193e23]">
                        Dispo aujourd’hui : {eq.availableStock} / {eq.totalStock}
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-semibold text-[#c8436e] uppercase tracking-wider">{eq.categoryLabel}</span>
                      <h3 className="font-serif font-bold text-lg text-[#173f22] mt-0.5">{eq.name}</h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-extrabold text-[#c8436e]">{formatFcfa(eq.pricePerDay)}</span>
                        <span className="text-xs text-muted-foreground">/ jour</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Caution : <strong>{formatFcfa(eq.deposit)}</strong></div>
                    </div>
                  </div>
                  <div className="p-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        eq.itemStatus === 'AVAILABLE' ? 'text-emerald-600' : eq.itemStatus === 'MAINTENANCE' ? 'text-amber-600' : 'text-red-600'
                      }`}
                    >
                      {eq.itemStatus === 'AVAILABLE' ? 'En catalogue' : eq.itemStatus === 'MAINTENANCE' ? 'En maintenance' : 'Retiré du catalogue'}
                    </span>
                    {canManageEquipment && (
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => openEquipmentDrawer(eq)} className="p-1.5 rounded-lg border border-border hover:bg-muted text-gray-700 cursor-pointer" title="Modifier l'équipement" aria-label={`Modifier ${eq.name}`}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(eq)} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" title="Supprimer du catalogue" aria-label={`Supprimer ${eq.name}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ReservationDrawer
        reservationId={selectedReservationId}
        onClose={() => setSelectedReservationId(null)}
        onChanged={refreshAll}
      />

      <EquipmentDrawer
        isOpen={equipmentDrawerOpen}
        equipment={editingEquipment}
        onClose={() => setEquipmentDrawerOpen(false)}
        onSaved={() => {
          setEquipmentDrawerOpen(false);
          refreshAll();
        }}
      />

      {/* Confirmation de suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-sm">
            <h2 className="font-serif font-bold text-lg text-[#173f22]">Supprimer « {deleteTarget.name} » ?</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              S’il n’a jamais été réservé, l’équipement est supprimé définitivement. S’il a déjà des réservations, il est
              seulement retiré du catalogue (statut « retiré ») pour conserver l’historique.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 rounded-xl border border-border text-xs font-semibold cursor-pointer">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />} Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
