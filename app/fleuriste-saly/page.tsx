import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Store,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getLocalLandingSchema } from '@/lib/seo/schema';
import { LiveProductGrid, ZoneFeeSentence } from '@/components/storefront/live-data';
import { SITE_CONFIG } from '@/lib/seo/config';

export const revalidate = 3600;

export const metadata: Metadata = constructMetadata({
  title: 'Fleuriste à Saly, Magasin de Décoration & Wedding Planner | Déco Fleurs Plus',
  description:
    'Déco Fleurs Plus (Déco Fleurs / Déco-Fleurs), artisan fleuriste, magasin de décoration & wedding planner à Saly-Portudal (Rue des Palmiers). Bouquets de roses fraîches, vases design, décoration d’intérieur et scénographie de mariages, livraison express en 2h.',
  canonical: '/fleuriste-saly',
  keywords: [
    'deco fleurs saly',
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'fleuriste à Saly',
    'fleuriste saly',
    'fleuriste saly portudal',
    'Magasins de décoration à SALY-PORTUDAL',
    'Magasins de décoration',
    'magasin de décoration saly',
    'wedding planner saly',
    'wedding planner senegal',
    'decoration',
    'decoration mariage saly',
    'bouquets',
    'livraison fleurs saly',
    'boutique fleurs saly',
    'bouquet roses saly',
    'fleuriste niakh niakhal',
    'fleuriste petite cote',
  ],
});

export default function FleuristeSalyPage() {
  const localSchema = getLocalLandingSchema({
    city: 'Saly Portudal',
    pageUrl: '/fleuriste-saly',
    description:
      'Boutique et atelier artisanal Décofleur Plus à Saly Portudal, Rue des Palmiers. Vente et livraison express en 2h de bouquets de roses, plantes et décoration florale.',
    deliveryTime: 'Livraison express en 2h chrono ou retrait boutique',
    isPhysicalStore: true,
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Livraison', href: '/livraison' },
    { label: 'Fleuriste Saly' },
  ];


  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={localSchema} />
      <BotanicalCorners />

      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Hero Section Saly */}
        <section className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 mb-10 shadow-md border border-neutral-100 bg-[#173f22]">
          <Image
            src="/images/boutique-equipe.jpg"
            alt="Atelier et boutique florale Décofleur Plus à Saly Portudal"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="relative z-10 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Store size={13} className="text-[#fbb6ce]" />
              Fleuriste &amp; Magasin de Décoration à Saly-Portudal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Votre Artisan Fleuriste &amp; Magasin de Décoration à Saly-Portudal
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Bienvenue chez <strong>Déco Fleurs Plus</strong> (également connu sous les noms <strong>Déco Fleurs</strong> ou <strong>Déco-Fleurs</strong> à Saly). Référence parmi les fleuristes et magasins de décoration à Saly-Portudal, notre boutique de la Rue des Palmiers vous accueille pour vos compositions florales sur mesure, vos vases design, la décoration de vos villas et événements, avec livraison express en 2h chrono.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/categories/bouquets"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all"
              >
                Découvrir nos créations
                <ArrowRight size={15} />
              </Link>
              <a
                href={`tel:${SITE_CONFIG.phoneSaly.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                <Phone size={14} />
                Appeler l’atelier ({SITE_CONFIG.phoneSaly})
              </a>
            </div>
          </div>
        </section>

        {/* Coordonnées & Horaires de la Boutique à Saly */}
        <section className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Adresse de l’atelier
            </h3>
            <p className="text-neutral-700 text-xs sm:text-sm font-semibold mb-1">
              {SITE_CONFIG.address.streetAddress}
            </p>
            <p className="text-neutral-500 text-xs">
              À quelques minutes de la plage et du centre commercial de Saly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Horaires d’ouverture
            </h3>
            <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
              <strong>Lundi – Samedi :</strong> 08h30 – 20h00<br />
              <strong>Dimanche :</strong> 09h00 – 15h00
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Livraison Express Saly 2h
            </h3>
            <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
              Livraison sur Saly Centre, Niakh Niakhal, Saly Tapée et Palm Beach. <ZoneFeeSentence zoneSlug="saly" />.
            </p>
          </div>
        </section>

        {/* Produits populaires à Saly */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173f22]">
                Créations florales confectionnées à Saly
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Fleurs coupées le jour même, adaptées au soleil de la Petite-Côte.
              </p>
            </div>
            <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#c8436e] hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>
          <LiveProductGrid />
        </section>

        {/* Section Magasin de Décoration à Saly-Portudal */}
        <section className="mb-14 p-8 md:p-10 rounded-3xl bg-linear-to-br from-[#173f22] to-[#1e522d] text-white shadow-md">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-semibold text-white mb-3">
              <Sparkles size={13} className="text-[#fbb6ce]" />
              Magasins de décoration à SALY-PORTUDAL
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight mb-4">
              Votre Magasin de Décoration &amp; d’Art Floral à Saly-Portudal
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Chez <strong>Déco Fleurs Plus</strong> (également connu sous les appellations <strong>Déco Fleurs</strong> ou <strong>Déco-Fleurs</strong>), notre adresse de Saly-Portudal réunit la passion d’un <strong>fleuriste à Saly</strong> et l’univers raffiné d’un <strong>magasin de décoration</strong>. Nous accompagnons résidents, propriétaires de villas et professionnels dans la valorisation de leurs espaces de vie :
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <h3 className="font-serif font-bold text-base text-white mb-2">
                Vases d’Art &amp; Céramiques
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Large choix de vases en verre soufflé, céramiques contemporaines et contenants design pensés pour sublimer vos tables et consoles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <h3 className="font-serif font-bold text-base text-white mb-2">
                Plantes &amp; Décor Végétal
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Orchidées d’exception, monsteras et plantes tropicales acclimatées pour apporter fraîcheur et élégance naturelle à votre intérieur.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <h3 className="font-serif font-bold text-base text-white mb-2">
                Scénographie &amp; Événements
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Décoration florale de mariages sur la plage, réceptions privées, location d’arches fleuries et de mobilier sur toute la Petite-Côte.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/categories/vases"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all"
            >
              Découvrir nos vases &amp; contenants
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
            >
              Demander un devis décoration
            </Link>
          </div>
        </section>

        {/* Abonnements & Aménagement de Villas à Saly */}
        <section className="mb-14 p-8 md:p-10 rounded-3xl bg-[#faf8f5] border border-neutral-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c8436e] block mb-2">
                Pour Propriétaires &amp; Résidents à Saly
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] leading-tight mb-4">
                Abonnements Floraux &amp; Fleurissement de Villas
              </h2>
              <p className="text-neutral-700 text-sm leading-relaxed mb-4">
                Vous possédez une villa ou séjournez régulièrement à Saly Portudal ? Profitez de nos formules d’abonnements floraux hebdomadaires ou bimensuels avec mise à disposition de vases d’exception et entretien à domicile.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/abonnements"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#173f22] text-white text-xs font-semibold hover:bg-[#112d18] transition-colors"
                >
                  Voir les formules d’abonnements
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/paysagisme"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Jardins &amp; Terrasses à Saly
                </Link>
              </div>
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/images/paysagisme/paysagisme-hero.jpg"
                alt="Fleurissement et jardin de villa à Saly Portudal"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* FAQ Locale Saly */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] mb-2 flex items-center justify-center gap-2">
              <HelpCircle size={24} className="text-[#c8436e]" />
              Questions fréquentes : Fleuriste Saly Portudal
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Réponses pratiques pour vos achats en boutique ou en livraison.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Puis-je venir choisir mes fleurs directement à la boutique ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Oui, avec grand plaisir ! Notre boutique de la Rue des Palmiers vous accueille du lundi au samedi de 08h30 à 20h00 et le dimanche de 09h00 à 15h00. Vous pouvez y admirer nos arrivages de fleurs fraîches, nos plantes et choisir votre composition sur place.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                En combien de temps puis-je être livré à Saly ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Sur toute la zone de Saly (Niakh Niakhal, Saly Tapée, Palm Beach), nos coursiers vous livrent en moins de 2 heures après confirmation de votre commande.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Où trouver un magasin de décoration et fleuriste à Saly-Portudal ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                <strong>Déco Fleurs Plus</strong> (aussi recherché sous <strong>Déco Fleurs</strong>, <strong>Déco-Fleurs</strong> ou <strong>deco fleurs saly</strong>) est situé Rue des Palmiers à Saly-Portudal. C’est à la fois un atelier d’artisan fleuriste et un magasin de décoration proposant vases haut de gamme, bougies parfumées, plantes tropicales d’intérieur, et prestations de décoration pour villas et mariages.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

