import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Waves,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getLocalLandingSchema } from '@/lib/seo/schema';
import { LiveProductGrid, ZoneFeeSentence } from '@/components/storefront/live-data';

export const metadata: Metadata = constructMetadata({
  title: 'Fleuriste Somone — Livraison de Fleurs & Décoration Événementielle | Décofleur Plus',
  description:
    'Livraison de fleurs le jour même à la Somone (lagune, villas de plage, résidences). Décors floraux de mariage bohème, arches florales côtières et paniers de fruits frais livrés avec soin.',
  canonical: '/fleuriste-somone',
  keywords: [
    'fleuriste somone',
    'livraison fleurs somone',
    'mariage lagune somone',
    'arche florale somone',
    'bouquet somone senegal',
    'fleuriste petite cote',
  ],
});

export default function FleuristeSomonePage() {
  const localSchema = getLocalLandingSchema({
    city: 'Somone',
    pageUrl: '/fleuriste-somone',
    description:
      'Service de livraison de bouquets et décoration florale de mariage à la Somone par Décofleur Plus (situé à 15 min à Saly). Livraison le jour même en bord de lagune et résidences.',
    deliveryTime: 'Livraison le jour même (avant 14h)',
    isPhysicalStore: false,
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Livraison', href: '/livraison' },
    { label: 'Fleuriste Somone' },
  ];


  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={localSchema} />
      <BotanicalCorners />

      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Hero Section Somone */}
        <section className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 mb-10 shadow-md border border-neutral-100 bg-[#173f22]">
          <Image
            src="/images/mariage.jpg"
            alt="Décoration florale de mariage et bouquets à la Somone par Décofleur Plus"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="relative z-10 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Waves size={13} className="text-[#fbb6ce]" />
              À 15 minutes de notre atelier de Saly
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Artisan Fleuriste &amp; Livraison à la Somone
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Situé à quelques minutes de la lagune de la Somone, notre atelier compose et livre vos bouquets de fleurs fraîches, corbeilles de fruits et arches florales côtières directement dans vos villas et écolodges.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/categories/bouquets"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all"
              >
                Commander un bouquet
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/devis?type=evenements"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                Devis Mariage à la Somone
              </Link>
            </div>
          </div>
        </section>

        {/* Points Forts Somone */}
        <section className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Livraison le jour même
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Toute commande passée avant 14h est acheminée à votre villa de la Somone dans l’après-midi. <ZoneFeeSentence zoneSlug="somone-ngaparou" />.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Mariages &amp; Cérémonies de Plage
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Arches en bois flotté, fleurs résistantes à la brise marine et chemins de table pour vos réceptions féeriques face à la lagune.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Repérage &amp; Service VIP
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Nos designers se déplacent gratuitement à la Somone pour évaluer la scénographie de votre événement ou le fleurissement de votre terrasse.
            </p>
          </div>
        </section>

        {/* Produits phares */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173f22]">
                Créations idéales pour la Somone
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Bouquets romantiques, paniers tropicaux et centres de table côtiers.
              </p>
            </div>
            <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#c8436e] hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>
          <LiveProductGrid />
        </section>

        {/* FAQ Locale Somone */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] mb-2 flex items-center justify-center gap-2">
              <HelpCircle size={24} className="text-[#c8436e]" />
              FAQ — Fleuriste Somone
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Questions pratiques sur les livraisons et décorations à la Somone.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Livrez-vous jusqu’aux restaurants et cabanes de la lagune ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Oui, nos livreurs connaissent parfaitement la Somone et peuvent remettre votre composition en main propre à votre table de restaurant, écolodge ou villa privée.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Comment conserver les fleurs face à l’air marin de la Somone ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Toutes nos créations sont accompagnées d’une fiole de conservateur et d’une réserve d’eau. Nous vous conseillons de placer le vase à l’abri des courants d’air directs et de recouper les tiges en biseau tous les 2 jours.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

