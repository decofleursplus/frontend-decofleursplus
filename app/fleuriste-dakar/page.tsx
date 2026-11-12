import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Truck,
  Clock,
  MapPin,
  Phone,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getLocalLandingSchema } from '@/lib/seo/schema';
import { LiveProductGrid, ZoneFeeSentence } from '@/components/storefront/live-data';

export const metadata: Metadata = constructMetadata({
  title: 'Fleuriste Dakar & Livraison de Fleurs Fraîches | Décofleur Plus',
  description:
    'Livraison de fleurs à Dakar en 24h ouvrées par navette réfrigérée sécurisée. Bouquets de roses fraîches, décoration de mariage et scénographie florale aux Almadies, Plateau, Mermoz, Fann.',
  canonical: '/fleuriste-dakar',
  keywords: [
    'fleuriste dakar',
    'livraison fleurs dakar',
    'bouquet de fleurs dakar',
    'roses dakar',
    'fleuriste almadies',
    'livraison fleurs dakar plateau',
    'decoration florale dakar',
    'decoration mariage dakar',
    'fleuriste senegal en ligne',
  ],
});

export default function FleuristeDakarPage() {
  const localSchema = getLocalLandingSchema({
    city: 'Dakar',
    pageUrl: '/fleuriste-dakar',
    description:
      'Service de livraison de bouquets et décoration florale d’exception à Dakar par Décofleur Plus. Acheminement frigorifique quotidien vers les Almadies, Plateau, Fann, Mermoz et Yoff.',
    deliveryTime: '24h ouvrées par navette réfrigérée',
    isPhysicalStore: false,
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Livraison', href: '/livraison' },
    { label: 'Fleuriste Dakar' },
  ];


  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={localSchema} />
      <BotanicalCorners />

      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Hero Section Dakar */}
        <section className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 mb-10 shadow-md border border-neutral-100 bg-[#173f22]">
          <Image
            src="/images/mariage.jpg"
            alt="Livraison de fleurs d'exception à Dakar par Décofleur Plus"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="relative z-10 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Sparkles size={13} className="text-[#fbb6ce]" />
              Navette frigorifique quotidienne Petite-Côte → Dakar
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Fleuriste de Prestige &amp; Livraison de Fleurs à Dakar
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Depuis notre atelier artisanal, nous acheminons vos plus beaux bouquets de roses, créations événementielles et corbeilles de fruits directement à Dakar dans des conditions de fraîcheur irréprochables.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/categories/bouquets"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all"
              >
                Commander un bouquet
                <ArrowRight size={15} />
              </Link>
              <a
                href="https://wa.me/221779417860?text=Bonjour%20D%C3%A9cofleur%20Plus,%20je%20souhaite%20commander%20des%20fleurs%20pour%20Dakar."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                <Phone size={14} />
                WhatsApp Direct Dakar
              </a>
            </div>
          </div>
        </section>

        {/* Spécificités de la Livraison à Dakar */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] mb-3">
              Comment fonctionne notre service floral pour Dakar ?
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Pour garantir que vos fleurs arrivent aussi éclatantes qu’à la coupe, nous avons banni les transports ordinaires au profit d’une chaîne du froid maîtrisée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
                <Truck size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
                Navette réfrigérée sécurisée
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Vos compositions voyagent en véhicule climatisé avec réserve d’eau nutritive, protégées de la chaleur et des embouteillages de l’autoroute à péage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
                Tous quartiers desservis
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Almadies, Plateau, Fann Résidence, Point E, Mermoz, Ouakam, Ngor, Yoff, Mamelles, Hann Maristes et banlieue proche.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
                Délai 24h &amp; Précision
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Commandez la veille pour une livraison le lendemain sur le créneau de votre choix, à domicile, au bureau ou sur votre lieu de réception.
              </p>
            </div>
          </div>
        </section>

        {/* Sélection de créations livrables à Dakar */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173f22]">
                Nos bouquets phares plébiscités à Dakar
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Compositions résistantes et majestueuses préparées avec soin le matin même du départ.
              </p>
            </div>
            <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#c8436e] hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>
          <LiveProductGrid />
        </section>

        {/* Prestations Événementielles à Dakar */}
        <section className="mb-14 bg-gradient-to-br from-[#173f22]/5 to-[#c8436e]/5 p-8 md:p-10 rounded-3xl border border-neutral-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c8436e] block mb-2">
                Scénographie &amp; Événements
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] leading-tight mb-4">
                Mariages, Galas &amp; Décoration d’Entreprise à Dakar
              </h2>
              <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-4">
                Notre brigade de maîtres fleuristes se déplace à Dakar pour concevoir des scénographies monumentales : arches de fleurs fraîches pour mariages dans les palaces dakarois, fleurissement de salons d’affaires au Plateau, et aménagement végétal de terrasses aux Almadies.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/devis?type=evenements"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#173f22] text-white text-xs font-semibold hover:bg-[#112d18] transition-colors"
                >
                  Demander un devis sur mesure
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/paysagisme"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Aménagement paysager Dakar
                </Link>
              </div>
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/images/paysagisme/villas.jpg"
                alt="Aménagement paysager et végétalisation de villa à Dakar"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* FAQ Locale Dakar */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] mb-2 flex items-center justify-center gap-2">
              <HelpCircle size={24} className="text-[#c8436e]" />
              Questions fréquentes sur la livraison à Dakar
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Tout ce qu’il faut savoir pour commander vos fleurs à Dakar en toute sérénité.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Quel est le tarif de livraison pour Dakar ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Livraison dans tous les quartiers de la capitale (Plateau, Almadies, Fann, Yoff, etc.) : <ZoneFeeSentence zoneSlug="dakar" />. Le montant exact est confirmé au panier.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Puis-je commander pour une livraison le jour même à Dakar ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Pour garantir la fraîcheur maximale via notre navette quotidienne, les commandes pour Dakar doivent être passées avant 16h la veille. Pour une urgence absolue le jour même, contactez notre équipe sur WhatsApp (+221 77 941 78 60) pour vérifier la faisabilité d’une course spéciale.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Comment payer ma commande depuis Dakar ou l’étranger ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Nous acceptons Wave Sénégal (sans frais), Orange Money ainsi que les cartes bancaires Visa et Mastercard pour les règlements depuis l’étranger ou la diaspora.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

