import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SharedDevisForm, DevisServiceType } from '@/components/shared-devis-form';
import { SiteFooter } from '@/components/site-footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export const metadata: Metadata = constructMetadata({
  title: 'Demande de Devis Floral & Paysager sur Mesure | Saly & Dakar',
  description:
    'Chiffrage personnalisé gratuit sous 24h pour vos projets d’aménagement paysager, création de jardins, scénographie de mariages et décoration événementielle au Sénégal.',
  canonical: '/devis',
  keywords: [
    'devis fleuriste dakar',
    'devis mariage saly',
    'devis paysagiste senegal',
    'chiffrage decoration florale',
  ],
});

function DevisContent({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; prestation?: string }>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-gray-500">Chargement du formulaire...</div>}>
      <DevisResolver searchParams={searchParams} />
    </Suspense>
  );
}

async function DevisResolver({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; prestation?: string }>;
}) {
  const params = await searchParams;
  const initialType: DevisServiceType = params.type === 'evenements' ? 'evenements' : 'paysagisme';
  const initialPrestation = params.prestation || '';

  return (
    <SharedDevisForm
      initialServiceType={initialType}
      initialPrestation={initialPrestation}
    />
  );
}

export default async function DevisPage(props: {
  searchParams: Promise<{ type?: string; prestation?: string }>;
}) {
  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] flex flex-col justify-between overflow-x-hidden">
      <BotanicalCorners />

      <main className="content-width px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex-1">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Demande de devis' }]} className="mb-4" />
        <div className="text-center max-w-xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#173f22] tracking-tight">
            Demande de devis
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Parlez-nous de votre projet, nos spécialistes vous accompagnent à chaque étape.
          </p>
        </div>

        <DevisContent searchParams={props.searchParams} />
      </main>

      <SiteFooter />
    </div>
  );
}
