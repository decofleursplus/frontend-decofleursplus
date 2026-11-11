'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Armchair,
  ArrowRightLeft,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/client';
import { getAdminRentalGantt, type GanttBooking, type GanttCalendar } from '@/lib/api/admin/rentals';
import { RESERVATION_STATUS_LABELS, formatFcfa, formatRentalPeriod } from '@/lib/rental-utils';
import { GANTT_BAR_CLASSES } from './reservation-status';
import { RENTAL_CATEGORY_OPTIONS } from './equipment-drawer';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const LANE_HEIGHT = 34;

interface GanttPlanningProps {
  /** Incrémenté par le parent pour recharger après une modification */
  refreshKey: number;
  onOpenReservation: (reservationId: string) => void;
}

/** Répartit les réservations d'un équipement sur des lignes sans chevauchement. */
function assignLanes(bookings: GanttBooking[]): { booking: GanttBooking; lane: number }[] {
  const sorted = [...bookings].sort((a, b) => a.startDay - b.startDay || a.endDay - b.endDay);
  const laneEnds: number[] = [];
  return sorted.map((booking) => {
    let lane = laneEnds.findIndex((end) => end < booking.startDay);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(booking.endDay);
    } else {
      laneEnds[lane] = booking.endDay;
    }
    return { booking, lane };
  });
}

/** Taux d'occupation (en %) sur une plage de jours, à partir des unités réservées par jour. */
function occupancyFor(daily: number[], totalUnits: number, firstDay: number, lastDay: number): number {
  const slice = daily.slice(firstDay - 1, lastDay);
  if (totalUnits <= 0 || slice.length === 0) return 0;
  const reserved = slice.reduce((sum, n) => sum + Math.min(n, totalUnits), 0);
  return Math.round((reserved / (totalUnits * slice.length)) * 1000) / 10;
}

export function GanttPlanning({ refreshKey, onOpenReservation }: GanttPlanningProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'mois' | 'semaine'>('mois');
  const [weekIndex, setWeekIndex] = useState(() => Math.floor((now.getDate() - 1) / 7));
  const [mobileView, setMobileView] = useState<'agenda' | 'gantt'>('agenda');

  const [data, setData] = useState<GanttCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminRentalGantt({ month, year, category })
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiClientError ? err.message : 'Impossible de charger le planning.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, category, refreshKey, retryKey]);

  const daysInMonth = data?.daysInMonth ?? new Date(year, month + 1, 0).getDate();

  const weeks = useMemo(() => {
    const list: { index: number; startDay: number; endDay: number; days: number[] }[] = [];
    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(start + 6, daysInMonth);
      list.push({ index: list.length, startDay: start, endDay: end, days: Array.from({ length: end - start + 1 }, (_, i) => start + i) });
    }
    return list;
  }, [daysInMonth]);

  const currentWeek = weeks[Math.min(weekIndex, weeks.length - 1)] ?? weeks[0];
  const periodStart = viewMode === 'semaine' ? currentWeek.startDay : 1;
  const periodEnd = viewMode === 'semaine' ? currentWeek.endDay : daysInMonth;
  const timelineDays = viewMode === 'semaine' ? currentWeek.days : Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const equipmentRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.equipment ?? []).filter((eq) => !term || eq.name.toLowerCase().includes(term));
  }, [data, search]);

  const visibleIds = useMemo(() => new Set(equipmentRows.map((eq) => eq.id)), [equipmentRows]);

  const periodBookings = useMemo(
    () =>
      (data?.bookings ?? []).filter(
        (b) => visibleIds.has(b.equipmentId) && b.startDay <= periodEnd && b.endDay >= periodStart,
      ),
    [data, visibleIds, periodStart, periodEnd],
  );

  // Taux d'occupation : celui du serveur pour le mois complet sans filtre texte ;
  // sinon recalculé exactement sur les équipements affichés et la période choisie.
  const occupancy = useMemo(() => {
    if (!data) return 0;
    const term = search.trim();
    if (viewMode === 'mois' && !term) return data.occupancyRate;
    if (!term) return occupancyFor(data.dailyReservedUnits, data.totalUnits, periodStart, periodEnd);
    const daily = Array.from({ length: daysInMonth }, (_, i) =>
      data.bookings
        .filter((b) => visibleIds.has(b.equipmentId) && b.startDay <= i + 1 && b.endDay >= i + 1)
        .reduce((sum, b) => sum + b.quantity, 0),
    );
    const units = equipmentRows.reduce((sum, eq) => sum + eq.totalStock, 0);
    return occupancyFor(daily, units, periodStart, periodEnd);
  }, [data, search, viewMode, periodStart, periodEnd, daysInMonth, visibleIds, equipmentRows]);

  const changeMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setWeekIndex(0);
  };

  const goToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setWeekIndex(Math.floor((today.getDate() - 1) / 7));
  };

  const isWeekend = (day: number) => {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
  };
  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null;

  return (
    <div className="space-y-4 animate-in fade-in duration-200" data-testid="gantt-planning">
      {/* Contrôles */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs w-full sm:w-60">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer équipement..."
              aria-label="Filtrer les équipements du planning"
              className="bg-transparent outline-none w-full placeholder:text-muted-foreground"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Effacer">
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Catégorie"
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium outline-none cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {RENTAL_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-2 bg-[#faf8f5] px-2 py-1 rounded-xl border border-border">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer" aria-label="Mois précédent">
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif font-bold text-base text-[#173f22] min-w-[130px] text-center select-none" data-testid="gantt-month">
              {MONTH_NAMES[month]} {year}
            </span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer" aria-label="Mois suivant">
              <ChevronRight size={16} />
            </button>
          </div>
          <button type="button" onClick={goToday} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted cursor-pointer">
            Aujourd’hui
          </button>
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border text-xs font-semibold">
            {(['mois', 'semaine'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-white shadow-xs text-[#173f22] font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'mois' ? 'Mois' : 'Semaine'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'semaine' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-2xs">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setWeekIndex((i) => Math.max(0, i - 1))} disabled={weekIndex === 0} className="p-1.5 rounded-lg border border-border bg-[#faf8f5] hover:bg-muted disabled:opacity-40 cursor-pointer" aria-label="Semaine précédente">
              <ChevronLeft size={14} />
            </button>
            <span className="font-semibold text-xs text-[#173f22]">
              Semaine {currentWeek.index + 1} : du {currentWeek.startDay} au {currentWeek.endDay} {MONTH_NAMES[month]} {year}
            </span>
            <button type="button" onClick={() => setWeekIndex((i) => Math.min(weeks.length - 1, i + 1))} disabled={weekIndex >= weeks.length - 1} className="p-1.5 rounded-lg border border-border bg-[#faf8f5] hover:bg-muted disabled:opacity-40 cursor-pointer" aria-label="Semaine suivante">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {weeks.map((w) => (
              <button
                key={w.index}
                type="button"
                onClick={() => setWeekIndex(w.index)}
                className={`px-3 py-1 rounded-xl text-center flex flex-col items-center min-w-[58px] shrink-0 cursor-pointer ${
                  currentWeek.index === w.index ? 'bg-[#173f22] text-white' : 'bg-[#faf8f5] border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-xs font-bold leading-tight">S{w.index + 1}</span>
                <span className="text-[10px] leading-tight">({w.startDay}-{w.endDay})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicateurs calculés sur les données réelles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8f5] p-3 rounded-2xl border border-border text-xs">
        <div className="p-2">
          <span className="text-muted-foreground block text-[11px]">Période affichée</span>
          <span className="font-bold text-[#173f22] text-sm">
            {viewMode === 'semaine' ? `Du ${periodStart} au ${periodEnd} ${MONTH_NAMES[month].toLowerCase()}` : `${MONTH_NAMES[month]} ${year}`}
          </span>
        </div>
        <div className="p-2 border-l border-border/60">
          <span className="text-muted-foreground block text-[11px]">Réservations sur la période</span>
          <span className="font-bold text-[#173f22] text-sm" data-testid="gantt-bookings-count">
            {periodBookings.length} dossier{periodBookings.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-2 border-l border-border/60">
          <span className="text-muted-foreground block text-[11px]">Équipements affichés</span>
          <span className="font-bold text-[#173f22] text-sm">
            {equipmentRows.length} référence{equipmentRows.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-2 border-l border-border/60" title="Unités-jours réservées ÷ unités-jours disponibles (réservations annulées exclues)">
          <span className="text-muted-foreground block text-[11px]">Taux d’occupation</span>
          <span className="font-bold text-[#c8436e] text-sm" data-testid="gantt-occupancy">
            {data ? `${occupancy.toLocaleString('fr-FR')} %` : '—'}
          </span>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="mx-auto text-red-500" size={24} />
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="px-4 py-2 rounded-xl bg-[#193e23] text-white text-xs font-semibold cursor-pointer">
            Réessayer
          </button>
        </div>
      ) : !data && loading ? (
        <div className="bg-white rounded-2xl border border-border p-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Chargement du planning…
        </div>
      ) : data ? (
        <>
          {/* Commutateur mobile */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl border border-border shadow-2xs">
            <span className="text-xs font-semibold text-[#173f22]">Affichage :</span>
            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-border/70">
              <button type="button" onClick={() => setMobileView('agenda')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${mobileView === 'agenda' ? 'bg-[#193e23] text-white' : 'text-muted-foreground'}`}>
                <CalendarDays size={14} /> Agenda
              </button>
              <button type="button" onClick={() => setMobileView('gantt')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${mobileView === 'gantt' ? 'bg-[#193e23] text-white' : 'text-muted-foreground'}`}>
                <BarChart3 size={14} /> Planning
              </button>
            </div>
          </div>

          {/* Agenda mobile */}
          {mobileView === 'agenda' && (
            <div className="lg:hidden space-y-3">
              {periodBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">
                  Aucune réservation sur cette période.
                </div>
              ) : (
                [...periodBookings]
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                  .map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onOpenReservation(b.id)}
                      className="w-full text-left bg-white rounded-2xl border border-border p-4 shadow-xs space-y-2 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#173f22] block">{b.reservationNumber}</span>
                          <span className="font-bold text-sm text-foreground">{b.quantity} × {b.equipmentName}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${GANTT_BAR_CLASSES[b.status]}`}>
                          {RESERVATION_STATUS_LABELS[b.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-[#faf8f5] p-2.5 rounded-xl border border-border/60 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Client</span>
                          <span className="font-semibold truncate block">{b.clientName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Période</span>
                          <span className="font-semibold">{formatRentalPeriod(b.startDate, b.endDate)}</span>
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          )}

          {/* Grille Gantt */}
          <div className={`${mobileView === 'gantt' ? 'block' : 'hidden lg:block'} space-y-2`}>
            <div className="lg:hidden flex items-center gap-2 p-2.5 bg-blue-50/70 text-blue-800 rounded-xl text-xs border border-blue-200">
              <ArrowRightLeft size={14} className="shrink-0 text-blue-600" />
              <span>Glissez horizontalement pour parcourir les {timelineDays.length} jours.</span>
            </div>

            <div className={`bg-white rounded-2xl border border-border overflow-hidden shadow-xs transition-opacity ${loading ? 'opacity-60' : ''}`}>
              <div className="overflow-x-auto no-scrollbar">
                <div style={{ minWidth: viewMode === 'semaine' ? '820px' : '1100px' }}>
                  <div className="flex border-b border-border bg-[#faf8f5] text-xs font-semibold text-muted-foreground">
                    <div className="w-56 shrink-0 p-3.5 border-r border-border text-[#173f22] flex items-center justify-between">
                      <span>Équipements ({equipmentRows.length})</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Dispo aujourd’hui</span>
                    </div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))` }}>
                      {timelineDays.map((day) => (
                        <div
                          key={day}
                          className={`p-2 text-center border-r border-border last:border-r-0 flex flex-col items-center ${isWeekend(day) ? 'bg-amber-50/40' : ''} ${todayDay === day ? 'bg-[#fdf0f4]' : ''}`}
                        >
                          <span className={`text-[10px] uppercase font-bold ${isWeekend(day) ? 'text-[#c8436e]' : 'text-muted-foreground'}`}>
                            {WEEKDAY_NAMES[new Date(year, month, day).getDay()]}
                          </span>
                          <span className={`text-xs font-extrabold mt-0.5 ${todayDay === day ? 'text-[#c8436e]' : 'text-foreground'}`}>{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {equipmentRows.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      {data.equipment.length === 0 ? 'Aucun équipement dans cette catégorie.' : 'Aucun équipement ne correspond au filtre.'}
                    </div>
                  ) : (
                    equipmentRows.map((eq) => {
                      const lanes = assignLanes(periodBookings.filter((b) => b.equipmentId === eq.id));
                      const laneCount = Math.max(1, ...lanes.map((l) => l.lane + 1));
                      return (
                        <div key={eq.id} className="flex border-b border-border last:border-b-0 hover:bg-muted/10" data-testid="gantt-row">
                          <div className="w-56 shrink-0 p-3.5 border-r border-border text-xs flex items-center gap-2">
                            <Armchair size={15} className="text-[#c8436e] shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold block truncate">{eq.name}</span>
                              <span className="text-[10px] text-muted-foreground block">
                                {eq.availableStock} / {eq.totalStock} dispo · {formatFcfa(eq.pricePerDay)}/j
                                {eq.itemStatus !== 'AVAILABLE' && ' · hors catalogue'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 relative" style={{ height: laneCount * LANE_HEIGHT + 14 }}>
                            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))` }}>
                              {timelineDays.map((d) => (
                                <div key={d} className={`border-r border-border/40 last:border-r-0 h-full ${isWeekend(d) ? 'bg-amber-50/20' : ''} ${todayDay === d ? 'bg-[#fdf0f4]/60' : ''}`} />
                              ))}
                            </div>
                            {lanes.map(({ booking: b, lane }) => {
                              const vStart = Math.max(b.startDay, periodStart);
                              const vEnd = Math.min(b.endDay, periodEnd);
                              const total = timelineDays.length;
                              const left = ((vStart - periodStart) / total) * 100;
                              const width = ((vEnd - vStart + 1) / total) * 100;
                              const cutLeft = b.startsBeforeMonth || b.startDay < periodStart;
                              const cutRight = b.endsAfterMonth || b.endDay > periodEnd;
                              return (
                                <button
                                  type="button"
                                  key={b.id}
                                  onClick={() => onOpenReservation(b.id)}
                                  style={{ left: `${left}%`, width: `${width}%`, top: 7 + lane * LANE_HEIGHT, height: LANE_HEIGHT - 6 }}
                                  className={`absolute rounded-lg px-2 flex items-center text-[10px] font-bold shadow-xs cursor-pointer hover:ring-2 hover:ring-black/20 hover:z-20 transition-all ${GANTT_BAR_CLASSES[b.status]}`}
                                  title={`${b.reservationNumber} — ${b.clientName}\n${b.quantity} × ${b.equipmentName}\n${formatRentalPeriod(b.startDate, b.endDate)}\nStatut : ${RESERVATION_STATUS_LABELS[b.status]}`}
                                  data-testid="gantt-bar"
                                >
                                  <span className="truncate">
                                    {cutLeft && '◀ '}
                                    {b.reservationNumber} · {b.quantity}u · {b.clientName}
                                    {cutRight && ' ▶'}
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

              <div className="p-4 border-t border-border bg-[#faf8f5] flex flex-wrap items-center justify-between text-xs gap-4">
                <div className="flex flex-wrap items-center gap-5">
                  {(['PENDING', 'CONFIRMED', 'DISPATCHED', 'RETURNED'] as const).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${GANTT_BAR_CLASSES[s].split(' ')[0]}`} />
                      <span className="text-muted-foreground">{RESERVATION_STATUS_LABELS[s]}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground italic">
                  Cliquez sur une barre pour ouvrir la réservation (statut, caution, notes). Les réservations annulées ne sont pas affichées.
                </span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
