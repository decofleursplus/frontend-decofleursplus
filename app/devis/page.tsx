import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BotanicalCorners } from '@/components/botanical-corners';
import { SharedDevisForm, DevisServiceType, type CustomQuoteProduct } from '@/components/shared-devis-form';
import { getProductBySlug } from '@/lib/api/catalog';
import { isQuotable } from '@/lib/products';
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

/** `produit` : création demandée sur mesure (slug) ; `taille` : taille de référence choisie sur sa fiche. */
type DevisSearchParams = { type?: string; prestation?: string; produit?: string; taille?: string; inspiration?: string };

function DevisContent({
  searchParams,
}: {
  searchParams: Promise<DevisSearchParams>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-gray-500">Chargement du formulaire...</div>}>
      <DevisResolver searchParams={searchParams} />
    </Suspense>
  );
}

/** Création citée par le lien (`?produit=`), si elle se demande sur devis ; sinon aucun encart (lien périmé). */
async function quotableProduct(slug: string): Promise<CustomQuoteProduct | null> {
  if (!slug.trim()) return null;
  const product = await getProductBySlug(slug.trim()).catch(() => null);
  if (!product || !isQuotable(product)) return null;
  return { slug: product.slug, name: product.name, image: product.image, sizes: product.variants.map((v) => v.name) };
}

async function DevisResolver({
  searchParams,
}: {
  searchParams: Promise<DevisSearchParams>;
}) {
  const params = await searchParams;
  const initialType: DevisServiceType = params.type === 'paysagisme' ? 'paysagisme' : 'evenements';
  const initialPrestation = params.prestation || '';

  return (
    <SharedDevisForm
      initialServiceType={initialType}
      initialPrestation={initialPrestation}
      initialProduct={params.produit ?? ''}
      customProduct={await quotableProduct(params.produit ?? '')}
      initialReferenceSize={params.taille ?? ''}
      initialInspiration={params.inspiration ?? ''}
    />
  );
}

export default async function DevisPage(props: {
  searchParams: Promise<DevisSearchParams>;
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
