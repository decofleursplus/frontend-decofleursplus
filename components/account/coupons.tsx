'use client';

import Link from 'next/link';
import { Gift, Sparkles, TicketPercent, Users } from 'lucide-react';
import { couponValueLabel, getMyCoupons, type MyCoupon, type MyCouponStatus } from '@/lib/api/rewards';
import { CopyButton } from './copy-button';
import { ErrorState, LoadingState, SectionHeader, fcfa, formatDate, useResource } from './shared';

const STATUS: Record<MyCouponStatus, { label: string; className: string }> = {
  actif: { label: 'Utilisable', className: 'bg-emerald-50 text-emerald-700' },
  utilise: { label: 'Utilisé', className: 'bg-neutral-100 text-neutral-500' },
  expire: { label: 'Expiré', className: 'bg-neutral-100 text-neutral-500' },
  epuise: { label: 'Épuisé', className: 'bg-neutral-100 text-neutral-500' },
  inactif: { label: 'Désactivé', className: 'bg-neutral-100 text-neutral-500' },
  programme: { label: 'Bientôt', className: 'bg-amber-50 text-amber-700' },
};

const ORIGIN: Record<MyCoupon['origin'], { label: string; icon: typeof Gift }> = {
  LOYALTY: { label: 'Bon fidélité', icon: Gift },
  REFERRAL: { label: 'Cadeau de parrainage', icon: Users },
  MANUAL: { label: 'Offre du moment', icon: Sparkles },
};

function CouponCard({ coupon }: { coupon: MyCoupon }) {
  const origin = ORIGIN[coupon.origin];
  const Icon = origin.icon;
  const status = coupon.usable ? STATUS.actif : STATUS[coupon.status === 'actif' ? 'utilise' : coupon.status];
  return (
    <li className={`rounded-2xl border p-4 ${coupon.usable ? 'border-[#f1d6dd] bg-white' : 'border-neutral-100 bg-neutral-50 opacity-80'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdf0f3] text-[var(--pink)]">
            <Icon size={18} />
          </span>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{origin.label}</span>
            <strong className="block text-lg text-neutral-900">{couponValueLabel(coupon)}</strong>
            {coupon.description && <span className="block text-sm text-neutral-600">{coupon.description}</span>}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-neutral-200 pt-3">
        <span className="font-mono text-base font-bold tracking-widest text-[#173f22]">{coupon.code}</span>
        {coupon.usable && <CopyButton value={coupon.code} label="Copier le code" />}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Valable jusqu’au {formatDate(coupon.endDate)}
        {coupon.minOrderAmount ? ` · dès ${fcfa(coupon.minOrderAmount)} d’achat` : ''}
        {coupon.personal ? ' · réservé à votre compte' : ''}
      </p>
    </li>
  );
}

export function CouponsSection() {
  const { data, error, loading, reload } = useResource(getMyCoupons);

  return (
    <section className="account-panel">
      <SectionHeader
        title="Mes coupons"
        description="Vos bons de réduction et les offres du moment. Saisissez le code dans votre panier, connecté à votre compte."
      />
      {loading ? (
        <LoadingState label="Chargement de vos coupons…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <div className="space-y-6">
          <div>
            <h2 className="flex items-center gap-2">
              <TicketPercent size={18} className="text-[var(--pink)]" /> Mes bons
            </h2>
            {data.personal.length === 0 ? (
              <p className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
                Aucun bon pour le moment. Échangez vos points dans{' '}
                <Link href="/compte/fidelite" className="font-semibold text-[var(--pink)] underline">
                  Ma fidélité
                </Link>{' '}
                ou{' '}
                <Link href="/compte/parrainage" className="font-semibold text-[var(--pink)] underline">
                  parrainez un proche
                </Link>
                .
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {data.personal.map((c) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--pink)]" /> Offres du moment
            </h2>
            {data.offers.length === 0 ? (
              <p className="text-sm text-neutral-500">Aucune offre en cours. Inscrivez-vous à la lettre d’information pour être prévenu.</p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {data.offers.map((c) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
