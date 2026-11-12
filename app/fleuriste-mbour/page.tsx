import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getLocalLandingSchema } from '@/lib/seo/schema';
import { LiveProductGrid, ZoneFeeSentence } from '@/components/storefront/live-data';

export const metadata: Metadata = constructMetadata({
  title: 'Fleuriste Mbour · Livraison de Bouquets & Cadeaux | Décofleur Plus',
  description:
    'Fleuriste artisanal pour Mbour et la Petite-Côte. Livraison de fleurs fraîches, paniers de fruits locaux et coffrets cadeaux le jour même à Grand Mbour, Tefess et Oncad. Paiement Wave & OM.',
  canonical: '/fleuriste-mbour',
  keywords: [
    'fleuriste mbour',
    'livraison fleurs mbour',
    'bouquet de fleurs mbour',
    'fleuriste tefess',
    'cadeaux mbour senegal',
    'panier de fruits mbour',
    'fleuriste petite cote',
  ],
});

export default function FleuristeMbourPage() {
  const localSchema = getLocalLandingSchema({
    city: 'Mbour',
    pageUrl: '/fleuriste-mbour',
    description:
      'Service de vente et de livraison de fleurs fraîches à Mbour par Décofleur Plus (situé à Saly). Livraison le jour même à Grand Mbour, Mbour Sérère, Oncad et Tefess.',
    deliveryTime: 'Livraison le jour même (avant 16h)',
    isPhysicalStore: false,
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Livraison', href: '/livraison' },
    { label: 'Fleuriste Mbour' },
  ];


  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <JsonLd data={localSchema} />
      <BotanicalCorners />

      <main className="content-width page-main">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Hero Section Mbour */}
        <section className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 mb-10 shadow-md border border-neutral-100 bg-[#173f22]">
          <Image
            src="/images/fruits.jpg"
            alt="Bouquets et paniers de fruits livrés à Mbour par Décofleur Plus"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="relative z-10 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Gift size={13} className="text-[#fbb6ce]" />
              Livraison rapide sur toute la ville de Mbour
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Fleuriste &amp; Livraison de Fleurs à Mbour
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Depuis notre atelier mitoyen de Saly, nous livrons vos bouquets de roses, corbeilles de fruits gourmandes et compositions florales pour toutes les célébrations familiales et professionnelles à Mbour.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/categories/bouquets"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8436e] hover:bg-[#b0355d] text-white font-medium text-xs sm:text-sm shadow-md transition-all"
              >
                Commander en ligne
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/categories/paniers-de-fruits"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm transition-all"
              >
                Paniers de fruits du terroir
              </Link>
            </div>
          </div>
        </section>

        {/* Services & Quartiers de Mbour */}
        <section className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Quartiers de Mbour
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Grand Mbour, Mbour Sérère, Tefess, Oncad, Zone Sonatel, Santessou et environs immédiats.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Course dans la journée
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Commandez le matin pour une livraison soignée dans l’après-midi. <ZoneFeeSentence zoneSlug="mbour" />.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-100 bg-[#faf8f5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#173f22]/10 text-[#173f22] flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173f22] mb-2">
              Paiement Wave &amp; OM
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Réglez en 1 clic sans frais supplémentaires par Wave ou Orange Money, avec confirmation immédiate sur votre mobile.
            </p>
          </div>
        </section>

        {/* Sélection de produits */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173f22]">
                Créations populaires pour Mbour
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Bouquets d’anniversaire, corbeilles de fruits et cadeaux d’exception.
              </p>
            </div>
            <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#c8436e] hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>
          <LiveProductGrid />
        </section>

        {/* FAQ Locale Mbour */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173f22] mb-2 flex items-center justify-center gap-2">
              <HelpCircle size={24} className="text-[#c8436e]" />
              FAQ : Fleuriste Mbour
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Questions courantes sur nos livraisons de fleurs et corbeilles à Mbour.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Puis-je faire livrer anonymement ou avec un mot doux personnalisé ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Absolument ! Lors de la commande, indiquez votre message personnalisé : nos fleuristes le calligraphient à la main sur une carte élégante glissée dans le bouquet. Vous pouvez également demander une remise surprise anonyme.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#173f22] mb-1.5">
                Fournissez-vous des fleurs pour les cérémonies religieuses ou de deuil à Mbour ?
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Oui, nous composons des couronnes, coussins et gerbes de fleurs blanches de recueillement, livrés avec discrétion au domicile de la famille ou sur le lieu de culte.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

