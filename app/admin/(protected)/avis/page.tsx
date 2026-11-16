'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Eye, EyeOff, Loader2, MessageSquareQuote, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteAdminReview,
  getAdminReviews,
  setAdminReviewApproved,
  type AdminReview,
  type AdminReviewList,
  type ReviewStatusFilter,
} from '@/lib/api/admin/reviews';
import { useAdminCan } from '@/components/admin/admin-sidebar-context';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STATUS_TABS: { value: ReviewStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'approved', label: 'Publiés' },
  { value: 'hidden', label: 'Masqués' },
];

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
      ))}
    </span>
  );
}

/** Back-office › Avis clients : modération des avis déposés sur les fiches produits. */
export default function AdminReviewsPage() {
  const can = useAdminCan();
  const canWrite = can('avis', 'write');
  const canDelete = can('avis', 'delete');
  const canOpenProduct = can('produits', 'read');

  const [status, setStatus] = useState<ReviewStatusFilter>('all');
  const [rating, setRating] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [reloadCount, setReloadCount] = useState(0);
  const [data, setData] = useState<AdminReviewList | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestKey = JSON.stringify([status, rating, search, page, pageSize, reloadCount]);
  const loading = loadedKey !== requestKey;

  // Une réponse arrivée après un changement de filtre est ignorée (elle écraserait la liste à jour)
  useEffect(() => {
    let current = true;
    getAdminReviews({ status, rating: rating || undefined, search, page, limit: pageSize })
      .then((res) => {
        if (!current) return;
        setData(res);
        setLoadError(null);
        // Page devenue vide (dernier avis supprimé ou masqué de la page) : on revient à la dernière page
        if (res.items.length === 0 && page > res.totalPages) setPage(res.totalPages);
      })
      .catch((err) => {
        if (current) setLoadError(err instanceof Error ? err.message : 'Avis indisponibles.');
      })
      .finally(() => {
        if (current) setLoadedKey(requestKey);
      });
    return () => {
      current = false;
    };
  }, [status, rating, search, page, pageSize, requestKey]);

  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;
    const timer = window.setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  const refresh = () => setReloadCount((n) => n + 1);

  const toggleApproved = (review: AdminReview) => {
    setBusyId(review.id);
    setAdminReviewApproved(review.id, !review.isApproved)
      .then(() => {
        toast.success(review.isApproved ? 'Avis masqué : il n’apparaît plus sur la boutique.' : 'Avis republié sur la boutique.');
        refresh();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Action impossible.'))
      .finally(() => setBusyId(null));
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setDeleting(true);
    deleteAdminReview(toDelete.id)
      .then(() => {
        toast.success('Avis supprimé.');
        setToDelete(null);
        refresh();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Suppression impossible.'))
      .finally(() => setDeleting(false));
  };

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title text-[#1e2a1f] font-bold">Avis clients</h1>
        <p className="admin-page-subtitle text-gray-500 mt-1">
          Avis déposés sur les fiches produits. Un avis masqué disparaît de la boutique et n’est plus compté dans la note du produit.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Statut des avis">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              onClick={() => {
                setStatus(t.value);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border shrink-0 ${status === t.value ? 'bg-[#c1647a] text-white border-[#c1647a]' : 'bg-white border-[#e7e4dd]'}`}
            >
              {t.label} ({data ? data.counts[t.value] : 0})
            </button>
          ))}
        </div>
        <select
          value={rating}
          onChange={(e) => {
            setRating(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Filtrer par note"
          className="h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs"
        >
          <option value={0}>Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} étoile{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 flex-1 px-3 rounded-xl border border-[#e7e4dd] bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Commentaire, auteur, email…"
            aria-label="Rechercher un avis"
            className="w-full h-10 text-xs outline-none"
          />
        </label>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl border border-[#e7e4dd] bg-white text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading && data ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {loadError}
        </div>
      )}

      {data === null && !loadError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e4dd] p-10 text-center text-xs text-gray-500">
          <MessageSquareQuote className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          {status === 'hidden' ? 'Aucun avis masqué' : status === 'approved' ? 'Aucun avis publié' : 'Aucun avis'}
          {rating || search ? ' pour ces critères' : ''}.
        </div>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ul className="space-y-2" aria-label="Liste des avis">
            {items.map((r) => (
              <li
                key={r.id}
                className={`bg-white rounded-2xl border p-4 text-xs ${r.isApproved ? 'border-[#e7e4dd]' : 'border-amber-300 bg-amber-50/40'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f4f1ea]">
                      {r.product.featuredImage && (
                        <Image src={r.product.featuredImage} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      {canOpenProduct ? (
                        <Link href={`/admin/produits/${r.product.id}`} className="font-semibold text-sm text-[#24582d] hover:underline">
                          {r.product.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-sm">{r.product.name}</span>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500">
                        <Stars rating={r.rating} />
                        <span>
                          par <strong className="text-gray-800">{r.userName}</strong>
                          {r.userEmail ? ` · ${r.userEmail}` : ''}
                          {!r.userId && <span className="ml-1 text-gray-400">(sans compte)</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}
                    >
                      {r.isApproved ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {r.isApproved ? 'Publié' : 'Masqué'}
                    </span>
                    <time dateTime={r.createdAt}>{dateTime(r.createdAt)}</time>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{r.comment}</p>

                {(canWrite || canDelete) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#f0ede6] pt-3">
                    <button
                      type="button"
                      hidden={!canWrite}
                      disabled={busyId === r.id}
                      onClick={() => toggleApproved(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e7e4dd] font-semibold disabled:opacity-50"
                    >
                      {busyId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : r.isApproved ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {r.isApproved ? 'Masquer' : 'Republier'}
                    </button>
                    <button
                      type="button"
                      hidden={!canDelete}
                      disabled={busyId === r.id}
                      onClick={() => setToDelete(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <AdminPagination
            page={data?.page ?? page}
            totalPages={data?.totalPages ?? 1}
            total={data?.total ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            itemLabel="avis"
            disabled={loading}
          />
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <DialogContent className="w-[94vw] max-w-md bg-white border border-[#e7e4dd] p-5 sm:p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold text-gray-900">Supprimer l’avis</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 pt-2 space-y-3">
              <span className="block">
                Supprimer définitivement l’avis de <strong className="text-gray-900">{toDelete?.userName}</strong> sur{' '}
                <strong className="text-gray-900">« {toDelete?.product.name} »</strong> ? Cette action est irréversible.
              </span>
              {toDelete?.isApproved && (
                <span className="block p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Pour le retirer de la boutique tout en le conservant, vous pouvez plutôt le masquer.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setToDelete(null)}
              className="border-[#e7e4dd] text-gray-600 hover:bg-gray-100 py-4 px-6"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white py-4 px-6 font-medium"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
