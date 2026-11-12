import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Info, Ruler, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ApiClientError } from '@/lib/api/client';
import { getRentalBySlug, type RentalEquipment } from '@/lib/api/rentals';
import { constructMetadata } from '@/lib/seo/metadata';
import { formatFcfa } from '@/lib/rental-utils';
import { RentalDetailBooking, RentalGallery } from '../_components/rental-detail-client';

/**
 * Récupère l'équipement : `null` uniquement si le serveur répond 404.
 * Toute autre erreur remonte vers la page d'erreur (bouton « Réessayer »).
 */
async function fetchEquipment(slug: string): Promise<RentalEquipment | null> {
  try {
    return await getRentalBySlug(slug);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const equipment = await fetchEquipment(slug).catch(() => null);
  if (!equipment) {
    return constructMetadata({ title: 'Équipement introuvable', noIndex: true });
  }
  return constructMetadata({
    title: `Location ${equipment.name} | ${equipment.categoryLabel}`,
    description: `${equipment.description.slice(0, 150)} — ${formatFcfa(equipment.pricePerDay)} / jour, caution ${formatFcfa(equipment.deposit)}.`,
    canonical: `/location/${equipment.slug}`,
    image: equipment.image ?? undefined,
  });
}

export default async function RentalEquipmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const equipment = await fetchEquipment(slug);
  if (!equipment) notFound();

  const gallery = equipment.images.length > 0 ? equipment.images : equipment.image ? [equipment.image] : [];

  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20">
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Location événementielle', href: '/location' },
            { label: equipment.name },
          ]}
        />

        <Link
          href="/location#catalogue"
          className="inline-flex items-center gap-1.5 mt-2 mb-5 text-xs font-semibold text-[#173f22] hover:text-[#c8436e]"
        >
          <ArrowLeft size={14} /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          <div className="space-y-6">
            <RentalGallery images={gallery} name={equipment.name} />

            <section className="space-y-3">
              <span className="text-[11px] font-semibold text-[#c8436e] uppercase tracking-wider">
                {equipment.categoryLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173f22]">{equipment.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#c8436e]">{formatFcfa(equipment.pricePerDay)}</span>
                <span className="text-sm text-gray-500">/ jour et par unité</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{equipment.description}</p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <ShieldCheck size={16} className="text-[#173f22] mb-1.5" />
                <span className="block text-gray-500">Caution par unité</span>
                <strong className="text-sm text-gray-900">{formatFcfa(equipment.deposit)}</strong>
                <span className="block text-[11px] text-gray-500 mt-1">Restituée au retour du matériel en bon état.</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <Info size={16} className="text-[#173f22] mb-1.5" />
                <span className="block text-gray-500">Stock</span>
                <strong className="text-sm text-gray-900">
                  {equipment.totalStock} unité{equipment.totalStock > 1 ? 's' : ''}
                </strong>
                <span className="block text-[11px] text-gray-500 mt-1">
                  La disponibilité exacte est vérifiée sur vos dates.
                </span>
              </div>
              {equipment.dimensions && (
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                  <Ruler size={16} className="text-[#173f22] mb-1.5" />
                  <span className="block text-gray-500">Dimensions</span>
                  <strong className="text-sm text-gray-900">{equipment.dimensions}</strong>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="py-3 px-5 border-b border-gray-100">
              <span className="text-[10px] uppercase tracking-wider text-[#c8436e] font-semibold">Réservation</span>
              <h2 className="text-base font-serif font-bold text-[#173f22] leading-tight">Vérifier et réserver</h2>
            </div>
            <RentalDetailBooking equipment={equipment} />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
