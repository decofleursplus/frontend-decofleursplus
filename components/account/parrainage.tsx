'use client';

import { Gift, Mail, MessageCircle, Share2, Sparkles, Users } from 'lucide-react';
import { FacebookIcon } from '@/components/icons';
import { getMyReferral, type MyReferral } from '@/lib/api/rewards';
import { CopyButton } from './copy-button';
import { ErrorState, LoadingState, SectionHeader, fcfa, formatDate, useResource } from './shared';

const STATUS: Record<MyReferral['referrals'][number]['status'], { label: string; className: string }> = {
  PENDING: { label: 'En attente de sa 1re commande', className: 'bg-amber-50 text-amber-700' },
  REWARDED: { label: 'Récompensé', className: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Annulé', className: 'bg-neutral-100 text-neutral-500' },
};

function ShareButtons({ data }: { data: MyReferral }) {
  const text = `Je t’offre ${fcfa(data.rewards.refereeDiscountValue)} sur ta première commande chez DécoFleur Plus, fleuriste à Saly : ${data.shareUrl}`;
  const links = [
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(text)}`, className: 'bg-[#25d366] text-white' },
    {
      label: 'Facebook',
      icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.shareUrl)}`,
      className: 'bg-[#1877f2] text-white',
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent('Un cadeau pour toi chez DécoFleur Plus')}&body=${encodeURIComponent(text)}`,
      className: 'bg-neutral-800 text-white',
    },
  ];
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, icon: Icon, href, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ${className}`}
        >
          <Icon size={14} /> {label}
        </a>
      ))}
      {canShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title: 'DécoFleur Plus', text, url: data.shareUrl }).catch(() => undefined)}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-700"
        >
          <Share2 size={14} /> Partager…
        </button>
      )}
    </div>
  );
}

export function ParrainageSection() {
  const { data, error, loading, reload } = useResource(getMyReferral);

  return (
    <section className="account-panel">
      <SectionHeader title="Parrainage" description="Faites découvrir DécoFleur Plus à vos proches et gagnez des points de fidélité." />
      {loading ? (
        <LoadingState label="Chargement de votre parrainage…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <div className="space-y-5">
          {!data.enabled && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Le programme de parrainage est momentanément suspendu : vos liens ne donnent plus droit aux avantages.
            </p>
          )}
          <div className="rounded-2xl bg-gradient-to-br from-[#173f22] to-[#245e34] p-5 text-white">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Gift size={26} className="shrink-0 text-[#f4b7c8]" />
                <p className="text-sm text-white/90">
                  <strong className="block text-base text-white">Vos proches reçoivent {fcfa(data.rewards.refereeDiscountValue)}</strong>
                  sur leur première commande dès {fcfa(data.rewards.refereeMinOrderAmount)} d’achat, à l’activation de leur compte.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles size={26} className="shrink-0 text-[#f4b7c8]" />
                <p className="text-sm text-white/90">
                  <strong className="block text-base text-white">
                    Vous gagnez {data.rewards.referrerRewardPoints.toLocaleString('fr-FR')} points
                  </strong>
                  dès que leur première commande est livrée.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Mon code</span>
                <strong className="block font-mono text-xl tracking-widest text-[#173f22]">{data.code}</strong>
              </div>
              <CopyButton value={data.code} label="Copier le code" />
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-neutral-50 p-2 pl-3">
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{data.shareUrl}</span>
              <CopyButton value={data.shareUrl} label="Copier le lien" />
            </div>
            <ShareButtons data={data} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['Filleuls', data.stats.total],
              ['Récompensés', data.stats.rewarded],
              ['En attente', data.stats.pending],
              ['Points gagnés', data.stats.pointsEarned],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-neutral-200 p-3 text-center">
                <strong className="block text-xl text-neutral-900">{Number(value).toLocaleString('fr-FR')}</strong>
                <span className="text-[11px] text-neutral-500">{label}</span>
              </div>
            ))}
          </div>

          <div>
            <h2 className="flex items-center gap-2">
              <Users size={18} className="text-[var(--pink)]" /> Mes filleuls
            </h2>
            {data.referrals.length === 0 ? (
              <p className="text-sm text-neutral-500">Personne ne s’est encore inscrit avec votre lien. Partagez-le !</p>
            ) : (
              <ul className="divide-y divide-neutral-100 text-sm">
                {data.referrals.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span>
                      <strong className="block text-neutral-900">{r.refereeName}</strong>
                      <span className="text-[11px] text-neutral-400">Inscrit(e) le {formatDate(r.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {r.status === 'REWARDED' && (
                        <strong className="text-emerald-700">+{r.rewardPoints.toLocaleString('fr-FR')} pts</strong>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS[r.status].className}`}>
                        {STATUS[r.status].label}
                      </span>
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
