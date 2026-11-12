'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { ApiClientError } from '@/lib/api/client';
import { GIFT_CARD_STATUS_LABELS, checkGiftCardBalance } from '@/lib/api/rewards';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

type Result = Awaited<ReturnType<typeof checkGiftCardBalance>>;

export function GiftCardBalance() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) return setError('Saisissez le code inscrit sur votre carte (ex : DFP-7K2Q-9MXA).');
    setError(null);
    setResult(null);
    setLoading(true);
    checkGiftCardBalance(code.trim())
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Vérification impossible pour le moment.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="rounded-2xl border border-[#ece5da] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-serif text-2xl text-[#173f22]">Consulter le solde d’une carte</h2>
      <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
        <label htmlFor="gc-balance-code" className="sr-only">
          Code de la carte
        </label>
        <input
          id="gc-balance-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="DFP-XXXX-XXXX"
          className="min-w-0 flex-1 rounded-xl border border-[#e7e4dd] px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider outline-none focus:border-[#c1647a]"
        />
        <button type="submit" disabled={loading} className="button-pill-pink inline-flex items-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Vérifier
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-4 rounded-xl border border-[#cfe6d3] bg-[#f3f8f4] p-4 text-sm text-[#173f22]" role="status">
          <p>
            Carte <strong className="font-mono">{result.code}</strong> · {GIFT_CARD_STATUS_LABELS[result.status]}
          </p>
          {result.status === 'PENDING_PAYMENT' ? (
            <p className="mt-1">Cette carte sera utilisable dès que son paiement aura été reçu.</p>
          ) : (
            <p className="mt-1">
              Solde disponible : <strong className="text-lg">{fcfa(result.balance)}</strong> sur {fcfa(result.initialAmount)}
              {result.expiresAt && <> · valable jusqu’au {new Date(result.expiresAt).toLocaleDateString('fr-FR')}</>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
