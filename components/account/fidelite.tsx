'use client';

import { Crown, Gem, Sparkles, Star } from 'lucide-react';
import { getMyLoyalty, type LoyaltyTier } from '@/lib/api/customer';
import { ErrorState, LoadingState, SectionHeader, formatDate, useResource } from './shared';

const TIER_LABEL: Record<LoyaltyTier, string> = { Bronze: 'Bronze', Silver: 'Argent', Gold: 'Or', Platinum: 'Platine' };
const TIER_ICON: Record<LoyaltyTier, typeof Star> = { Bronze: Star, Silver: Sparkles, Gold: Crown, Platinum: Gem };

export function FideliteSection() {
  const { data, error, loading, reload } = useResource(getMyLoyalty);

  return (
    <section className="account-panel">
      <SectionHeader title="Programme de fidélité" description="Vos points et votre niveau de fidélité." />
      {loading ? (
        <LoadingState label="Chargement de votre programme…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-[#173f22] to-[#245e34] p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-white/70">Mon solde</span>
                <strong className="block text-3xl font-serif">{data.points.toLocaleString('fr-FR')} points</strong>
                <span className="text-sm">Niveau {TIER_LABEL[data.tier]}</span>
              </div>
              {(() => {
                const Icon = TIER_ICON[data.tier];
                return <Icon size={44} className="text-white/80" />;
              })()}
            </div>
            {data.nextTier ? (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-[#f4b7c8]"
                    style={{
                      width: `${Math.min(100, Math.round((data.points / data.nextTier.minPoints) * 100))}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/85">
                  Encore {data.nextTier.pointsToGo.toLocaleString('fr-FR')} points pour atteindre le niveau {TIER_LABEL[data.nextTier.tier]}.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/85">Vous avez atteint le plus haut niveau. Merci pour votre fidélité !</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700">
            <strong className="block mb-1">Comment gagner des points ?</strong>
            Chaque commande livrée (ou retirée en boutique) vous rapporte 1 point par tranche de {data.fcfaPerPoint.toLocaleString('fr-FR')} FCFA
            payés. Les points sont crédités automatiquement dès la livraison.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.tiers.map((t) => {
              const Icon = TIER_ICON[t.tier];
              const reached = data.points >= t.minPoints;
              return (
                <div key={t.tier} className={`rounded-xl border p-3 text-center ${t.tier === data.tier ? 'border-[var(--pink)] bg-pink-50' : 'border-neutral-200'}`}>
                  <Icon size={20} className={`mx-auto ${reached ? 'text-[var(--pink)]' : 'text-neutral-300'}`} />
                  <span className="block text-sm font-semibold mt-1">{TIER_LABEL[t.tier]}</span>
                  <span className="block text-[11px] text-neutral-500">dès {t.minPoints.toLocaleString('fr-FR')} pts</span>
                </div>
              );
            })}
          </div>

          <div>
            <h2>Historique</h2>
            {data.history.length === 0 ? (
              <p className="text-sm text-neutral-500">Vos points apparaîtront ici après votre première commande livrée.</p>
            ) : (
              <ul className="divide-y divide-neutral-100 text-sm">
                {data.history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <span className="block">{h.reason}</span>
                      <span className="block text-[11px] text-neutral-400">{formatDate(h.createdAt, true)}</span>
                    </span>
                    <span className="text-right">
                      <strong className={h.points >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {h.points >= 0 ? '+' : ''}
                        {h.points.toLocaleString('fr-FR')} pts
                      </strong>
                      <span className="block text-[11px] text-neutral-400">Solde : {h.balance.toLocaleString('fr-FR')}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
