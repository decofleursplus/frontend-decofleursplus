'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Loader2, ShoppingBag, Eye } from 'lucide-react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { toast } from 'sonner';
import {
  DELIVERY_MODE_LABELS,
  ORDER_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  changeAdminOrderStatus,
  getAdminOrders,
  type AdminOrderDetail,
  type AdminOrdersFilters,
  type BackendOrderStatus,
} from '@/lib/api/admin/orders';

const STATUSES: BackendOrderStatus[] = ['PENDING', 'PAID', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED'];
const PAGE_SIZE = 25;
const fcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} F`;

/** Commandes : filtres, recherche, tri et pagination côté serveur ; actions selon les transitions autorisées. */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderDetail[] | null>(null);
  const [counts, setCounts] = useState<Record<BackendOrderStatus, number> | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [status, setStatus] = useState<BackendOrderStatus | 'all'>('all');
  const [deliveryMode, setDeliveryMode] = useState<AdminOrdersFilters['deliveryMode'] | 'all'>('all');
  const [sort, setSort] = useState<NonNullable<AdminOrdersFilters['sort']>>('date_desc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const load = useCallback(
    () =>
      getAdminOrders({
        page,
        limit: pageSize,
        status: status === 'all' ? undefined : status,
        deliveryMode: deliveryMode === 'all' ? undefined : deliveryMode,
        search,
        sort,
      })
        .then((res) => {
          setOrders(res.items);
          setCounts(res.counts);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof Error ? err.message : 'Impossible de charger les commandes.')),
    [page, pageSize, status, deliveryMode, search, sort],
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

  const refresh = () => {
    setRefreshing(true);
    void load().finally(() => setRefreshing(false));
  };

  const quickAction = async (order: AdminOrderDetail, to: BackendOrderStatus) => {
    setBusyId(order.id);
    try {
      await changeAdminOrderStatus(order.id, to);
      toast.success(`${order.orderNumber} : ${ORDER_STATUS_LABELS[to].toLowerCase()}.`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Changement de statut impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const allCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  /** Action principale proposée dans la liste (l'annulation, qui demande un motif, se fait depuis le détail). */
  const nextStep = (o: AdminOrderDetail) => o.allowedTransitions.find((t) => t !== 'CANCELLED' && t !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title text-[#1e2a1f] font-bold">Gestion des commandes</h1>
          <p className="admin-page-subtitle text-gray-500 mt-1">Suivez et traitez les commandes de vos clients.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#e7e4dd] bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border shrink-0 ${
              status === s ? 'bg-[#c1647a] text-white border-[#c1647a]' : 'bg-white text-gray-700 border-[#e7e4dd] hover:bg-[#faf8f4]'
            }`}
          >
            {s === 'all' ? 'Toutes' : ORDER_STATUS_LABELS[s]} <span className="opacity-80">({s === 'all' ? allCount : counts?.[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-2xl border border-[#e7e4dd]">
        <label className="flex items-center gap-2 flex-1 px-3 rounded-lg border border-[#e7e4dd] bg-[#faf8f4]">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="N° de commande, client, email, téléphone…"
            aria-label="Rechercher une commande"
            className="w-full h-10 bg-transparent text-xs outline-none"
          />
        </label>
        <select
          value={deliveryMode}
          onChange={(e) => {
            setDeliveryMode(e.target.value as typeof deliveryMode);
            setPage(1);
          }}
          aria-label="Mode de livraison"
          className="h-10 px-3 rounded-lg border border-[#e7e4dd] bg-white text-xs"
        >
          <option value="all">Tous les modes</option>
          {Object.entries(DELIVERY_MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Trier" className="h-10 px-3 rounded-lg border border-[#e7e4dd] bg-white text-xs">
          <option value="date_desc">Plus récentes</option>
          <option value="date_asc">Plus anciennes</option>
          <option value="amount_desc">Montant décroissant</option>
          <option value="amount_asc">Montant croissant</option>
        </select>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          <span>{loadError}</span>
          <button type="button" onClick={refresh} className="underline font-semibold">
            Réessayer
          </button>
        </div>
      )}

      {orders === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#c1647a]" /> Chargement des commandes…
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">
          <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          {search || status !== 'all' || deliveryMode !== 'all' ? 'Aucune commande pour ces critères.' : 'Aucune commande pour le moment.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[860px]">
            <thead className="bg-[#faf8f4] border-b border-[#e7e4dd] font-bold text-[#1e2a1f]">
              <tr>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Livraison</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {(orders ?? []).map((o) => {
                const next = nextStep(o);
                return (
                  <tr key={o.id} className="hover:bg-[#fcfaf7]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/commandes/${o.id}`} className="font-mono font-bold text-gray-900 hover:text-[#c1647a]">
                        {o.orderNumber}
                      </Link>
                      <span className="block text-[11px] text-gray-400">
                        {new Date(o.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {o.items.length} article(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{o.customerName}</span>
                      <span className="block text-[11px] text-gray-400">{o.customerPhone}</span>
                    </td>
                    <td className="px-4 py-3">
                      {DELIVERY_MODE_LABELS[o.deliveryMode]}
                      <span className="block text-[11px] text-gray-400">
                        {[o.deliveryZone?.name, o.timeSlot].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{fcfa(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      {PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod}
                      <span className={`block text-[11px] ${o.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>{PAYMENT_STATUS_LABELS[o.paymentStatus]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ORDER_STATUS_STYLES[o.orderStatus]}`}>{ORDER_STATUS_LABELS[o.orderStatus]}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {next && (
                          <button
                            type="button"
                            disabled={busyId === o.id}
                            onClick={() => void quickAction(o, next)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#c1647a] hover:bg-[#a85266] text-white font-semibold disabled:opacity-50"
                          >
                            {ORDER_ACTION_LABELS[next]}
                          </button>
                        )}
                        <Link href={`/admin/commandes/${o.id}`} className="p-1.5 rounded-lg border border-[#e7e4dd] hover:bg-gray-50" aria-label={`Détail de ${o.orderNumber}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            itemLabel="commandes"
            className="px-4 border-t border-[#e7e4dd] bg-[#faf8f4]"
          />
        </div>
      )}
    </div>
  );
}
