'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copie un texte (code, lien) dans le presse-papiers avec un retour visuel. */
export function CopyButton({ value, label = 'Copier', className = '' }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => setCopied(false));
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[var(--pink)] hover:text-[var(--pink)] ${className}`}
      aria-label={`${label} : ${value}`}
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? 'Copié' : label}
    </button>
  );
}
