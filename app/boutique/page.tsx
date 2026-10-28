import Image from 'next/image';
import Link from 'next/link';
import { CatalogClient } from '@/components/catalog-client';
import { SiteFooter } from '@/components/site-footer';
import { BotanicalCorners } from '@/components/botanical-corners';

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  return (
    <div className="relative min-h-screen bg-white text-[#1c2e20] overflow-x-hidden">
      <BotanicalCorners />
      <main className="content-width page-main">
        <section className="page-banner shop-banner">
          <Image src="/images/hero.jpg" alt="Composition florale" fill sizes="100vw" priority />
          <div>
            <h1>Notre boutique</h1>
            <p>
              Découvrez notre collection de fleurs, plantes, cadeaux et décorations{' '}
              <br />
              pour toutes vos occasions spéciales.
            </p>
          </div>
        </section>
        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Boutique</span>
        </div>
        <CatalogClient initialQuery={params.q ?? ''} initialCategory={params.category ?? ''} />
      </main>
      <SiteFooter />
    </div>
  );
}
