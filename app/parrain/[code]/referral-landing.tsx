'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, Loader2, ShoppingBag, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import { lookupReferralCode, rememberReferralCode, type ReferralInvitation } from '@/lib/api/rewards';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

type State = { code: string; invitation: ReferralInvitation | null; error: string | null };

export function ReferralLanding({ code }: { code: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<State | null>(null);
  const loading = state?.code !== code;

  useEffect(() => {
    let active = true;
    lookupReferralCode(code)
      .then((invitation) => {
        rememberReferralCode(invitation.code);
        if (active) setState({ code, invitation, error: null });
      })
      .catch((err) => {
        if (!active) return;
        const message =
          err instanceof ApiClientError && err.status === 404
            ? 'Ce lien de parrainage n’est pas (ou plus) valide.'
            : 'Impossible de vérifier ce lien pour le moment. Réessayez dans un instant.';
        setState({ code, invitation: null, error: message });
      });
    return () => {
      active = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Vérification de votre invitation…
      </div>
    );
  }

  if (!state?.invitation) {
    return (
      <div className="rounded-2xl border border-[#ece5da] bg-white p-8 text-center shadow-sm">
        <Gift className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
        <h1 className="mt-4 font-serif text-2xl text-[#173f22]">Invitation introuvable</h1>
        <p className="mt-2 text-sm text-gray-600">{state?.error}</p>
        <Link href="/boutique" className="button-pill-pink mt-6 inline-flex">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const { invitation } = state;
  const signUpUrl = `/inscription?parrain=${encodeURIComponent(invitation.code)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ece5da] bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#173f22] to-[#245e34] px-6 py-10 text-center text-white">
        <Gift className="mx-auto h-12 w-12 text-[#f4b7c8]" aria-hidden="true" />
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/70">Invitation de {invitation.referrerFirstName}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight">
          {invitation.referrerFirstName} vous offre {fcfa(invitation.refereeDiscountValue)}
        </h1>
        <p className="mt-3 text-sm text-white/85">
          sur votre première commande de fleurs ou de décoration, dès {fcfa(invitation.refereeMinOrderAmount)} d’achat.
        </p>
      </div>
      <div className="space-y-5 p-6">
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fdf0f3] text-xs font-bold text-[#c1647a]">1</span>
            Créez votre compte : le code <strong className="font-mono">{invitation.code}</strong> est déjà renseigné.
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fdf0f3] text-xs font-bold text-[#c1647a]">2</span>
            Confirmez votre adresse email : votre bon de bienvenue vous est envoyé et apparaît dans « Mes coupons ».
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fdf0f3] text-xs font-bold text-[#c1647a]">3</span>
            Saisissez-le dans votre panier au moment de commander.
          </li>
        </ol>
        {user ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Vous êtes déjà connecté(e) : ce cadeau est réservé aux nouveaux clients. Partagez plutôt votre propre lien depuis{' '}
            <Link href="/compte/parrainage" className="font-semibold underline">
              Mon parrainage
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Link href={signUpUrl} className="button-pill-pink inline-flex items-center gap-2">
              <UserPlus size={16} /> Créer mon compte
            </Link>
            <Link href="/boutique" className="inline-flex items-center gap-2 rounded-full border border-[#e7e4dd] px-5 py-2.5 text-sm font-semibold text-[#173f22]">
              <ShoppingBag size={16} /> Voir la boutique
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
