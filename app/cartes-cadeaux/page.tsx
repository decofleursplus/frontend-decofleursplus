import type { Metadata } from 'next';
import { GiftCardPurchase } from './gift-card-purchase';
import { GiftCardBalance } from './gift-card-balance';

export const metadata: Metadata = {
  title: 'Cartes cadeaux | Décofleur Plus',
  description:
    'Offrez une carte cadeau Décofleur Plus : vos proches choisissent leurs fleurs et créations, en une ou plusieurs fois. Valable 12 mois.',
};

export default function GiftCardsPage() {
  return (
    <main className="content-width page-main">
      <section className="mx-auto max-w-5xl py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c1647a]">Faire plaisir</p>
        <h1 className="mt-2 font-serif text-3xl text-[#173f22] sm:text-4xl">Cartes cadeaux</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
          Offrez le plaisir de choisir : la carte est envoyée par email au destinataire avec votre message. Elle s’utilise sur toute la
          boutique, en une ou plusieurs fois, pendant 12 mois.
        </p>
        <div className="mt-8">
          <GiftCardPurchase />
        </div>
        <div id="solde" className="mt-12 scroll-mt-24">
          <GiftCardBalance />
        </div>
      </section>
    </main>
  );
}
