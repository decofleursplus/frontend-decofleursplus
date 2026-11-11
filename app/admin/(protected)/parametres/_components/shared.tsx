'use client';

import { AlertTriangle, Info, Loader2, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api/client';

/** Message exact renvoyé par l'API, complété par le détail des champs refusés. */
export function describeError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) {
      return 'Votre rôle ne vous autorise pas à effectuer cette action.';
    }
    const details = error.details?.map((d) => d.message).filter(Boolean) ?? [];
    return details.length > 0 ? `${error.message} : ${details.join(' ; ')}` : error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Erreurs de validation indexées par chemin de champ (ex. « boutique.contactEmail »). */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError) || !error.details) return {};
  return Object.fromEntries(error.details.map((d) => [d.path, d.message]));
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 403;
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16 text-xs text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin text-[#c1647a]" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
  forbidden = false,
}: {
  message: string;
  onRetry?: () => void;
  forbidden?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-10 text-center text-xs text-rose-900"
    >
      {forbidden ? (
        <Lock className="h-5 w-5 text-rose-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-rose-500" />
      )}
      <p className="max-w-md font-medium">{message}</p>
      {onRetry && !forbidden && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 border-rose-200 bg-white text-xs text-rose-700 hover:bg-rose-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function InfoNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' }) {
  const styles =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50/70 text-amber-900'
      : 'border-sky-200 bg-sky-50/60 text-sky-900';
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed ${styles}`}>
      {tone === 'warning' ? (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
}

export function ReadOnlyNote() {
  return (
    <InfoNote tone="warning">
      Consultation seule : votre rôle ne permet pas de modifier cette section. Seul un administrateur peut
      enregistrer des changements.
    </InfoNote>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] font-medium text-rose-600">{message}</p>;
}

export function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

export function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
