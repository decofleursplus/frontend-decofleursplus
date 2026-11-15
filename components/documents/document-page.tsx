'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';

/**
 * Page d'affichage d'un document commercial : barre d'actions (retour, impression / PDF),
 * états de chargement et d'erreur, puis le document lui-même.
 */
export function DocumentPage({
  backHref,
  backLabel,
  loading,
  error,
  unavailable,
  children,
}: {
  backHref: string;
  backLabel: string;
  loading: boolean;
  error: string | null;
  /** Document non émis (ex. commande annulée, devis non chiffré) : message à la place */
  unavailable?: string | null;
  children: ReactNode;
}) {
  const back = (
    <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a4741] hover:text-[#173f22]">
      <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
    </Link>
  );

  if (error || unavailable) {
    return (
      <div className="space-y-4">
        {back}
        <p
          role={error ? 'alert' : 'status'}
          className={`rounded-xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-[#ece5da] bg-white text-[#4a4741]'}`}
        >
          {error ?? unavailable}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-[#6b665f]">
        <Loader2 className="h-4 w-4 animate-spin" /> Préparation du document…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="invoice-actions flex flex-wrap items-center justify-between gap-2">
        {back}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#c1647a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#a85266]"
        >
          <Printer className="h-3.5 w-3.5" /> Imprimer / enregistrer en PDF
        </button>
      </div>
      {children}
    </div>
  );
}
