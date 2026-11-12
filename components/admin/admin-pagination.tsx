'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Absent : pas de sélecteur de taille de page. */
  onPageSizeChange?: (size: number) => void;
  /** Libellé pluriel des éléments, ex. « commandes ». */
  itemLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Numéros de page à afficher : 1 … p-1 p p+1 … n */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/**
 * Pagination standard du back-office (serveur ou client) :
 * « 1–25 sur 132 commandes », numéros de page et taille de page 10 / 25 / 50.
 */
export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'éléments',
  disabled = false,
  className = '',
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn =
    'h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-md border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3 text-xs text-gray-600 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span>
          {total === 0 ? `Aucun ${itemLabel.replace(/s$/, '')}` : `${from}–${to} sur ${total} ${itemLabel}`}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Par page</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-[#e7e4dd] bg-white px-1.5 text-xs"
              aria-label="Nombre d’éléments par page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {safeTotalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`${btn} border-[#e7e4dd] bg-white hover:bg-gray-50`}
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(page, safeTotalPages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`${btn} ${p === page ? 'border-[#24582d] bg-[#24582d] text-white' : 'border-[#e7e4dd] bg-white hover:bg-gray-50'}`}
                disabled={disabled}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            className={`${btn} border-[#e7e4dd] bg-white hover:bg-gray-50`}
            disabled={disabled || page >= safeTotalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
}

/** Pagination côté client d'une liste déjà chargée. */
export function paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { pageItems: items.slice((current - 1) * pageSize, current * pageSize), totalPages, page: current };
}
