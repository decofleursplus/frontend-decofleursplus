'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { ApiClientError } from '@/lib/api/client';

export function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="account-title-row">
      <div>
        <h1 className="account-title">{title}</h1>
        <p className="account-intro">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
      <Loader2 size={18} className="animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <span className="flex items-center gap-2">
        <AlertTriangle size={16} /> {message}
      </span>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 font-semibold underline">
        <RefreshCw size={14} /> Réessayer
      </button>
    </div>
  );
}

export function Notice({ kind, children }: { kind: 'success' | 'error'; children: ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={`my-3 rounded-lg border px-3 py-2 text-sm ${
        kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      {children}
    </p>
  );
}

/** Message d'une erreur API, détails de validation compris. */
export function errorText(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    const detail = error.details?.map((d) => d.message).filter(Boolean).join(' ; ');
    if (error.status === 401) return 'Votre session a expiré : reconnectez-vous.';
    return detail ? `${error.message} — ${detail}` : error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

/** Chargement d'une ressource avec états chargement / erreur / rechargement. */
export function useResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rechargement silencieux quand des données sont déjà affichées : les cartes restent montées
  // (et gardent leurs messages de confirmation) pendant l'actualisation.
  const hasData = useRef(false);
  const reload = useCallback(() => {
    if (!hasData.current) setLoading(true);
    setError(null);
    return load()
      .then((value) => {
        hasData.current = true;
        setData(value);
        return value;
      })
      .catch((err) => {
        setError(errorText(err, 'Chargement impossible.'));
        return null;
      })
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    load()
      .then((value) => {
        hasData.current = true;
        setData(value);
      })
      .catch((err) => setError(errorText(err, 'Chargement impossible.')))
      .finally(() => setLoading(false));
  }, [load]);

  return { data, setData, error, loading, reload };
}

export const formatDate = (iso: string | null | undefined, withTime = false) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
