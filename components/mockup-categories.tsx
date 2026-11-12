'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStoreCategories } from '@/lib/hooks/use-store-categories';
import type { ApiCategory } from '@/lib/api/catalog';

interface Tile {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  /** Pictogramme dessiné (prioritaire) ou photo de la catégorie, affichée en médaillon */
  icon?: string;
  photo?: string | null;
}

/** Pictogrammes disponibles pour certaines catégories (par slug). */
const CATEGORY_ICONS: Record<string, string> = {
  bouquets: '/images/categories/bouquets.png',
  cadeaux: '/images/categories/cadeaux.png',
  decoration: '/images/categories/decoration.png',
  'paniers-de-fruits': '/images/categories/fruits.png',
  fruits: '/images/categories/fruits.png',
};

/** Rubriques de services (hors catalogue) toujours proposées. */
const SERVICE_TILES: Tile[] = [
  { id: 'evenements', title: 'Mariages & événements', subtitle: 'Cérémonies, réceptions', href: '/evenements', icon: '/images/categories/evenements.png' },
  { id: 'livraison', title: 'Livraison à domicile', subtitle: 'Zones et tarifs', href: '/livraison', icon: '/images/categories/livraison.png' },
  { id: 'location', title: 'Location événementielle', subtitle: 'Vaisselle, mobilier & décor', href: '/location', icon: '/images/categories/vaisselle.png' },
];

const MAX_CATEGORIES = 4;

const toTile = (c: ApiCategory): Tile => ({
  id: c.id,
  title: c.name,
  subtitle: c.description || `${c.productCount ?? 0} création${(c.productCount ?? 0) > 1 ? 's' : ''}`,
  href: `/categories/${c.slug}`,
  icon: CATEGORY_ICONS[c.slug],
  photo: c.imageUrl,
});

function TileVisual({ tile, size }: { tile: Tile; size: number }) {
  if (tile.icon) {
    return (
      <Image src={tile.icon} alt="" width={size} height={size} className="object-contain w-auto h-auto" style={{ maxWidth: size - 2, maxHeight: size - 2 }} />
    );
  }
  if (tile.photo) {
    return <Image src={tile.photo} alt="" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return <span className="rounded-full bg-[#173f22]/10" style={{ width: size, height: size }} />;
}

/** Bandeau de l'accueil : catégories réelles de la boutique (back-office) + rubriques de services. */
export function MockupCategories() {
  const categories = useStoreCategories();
  const loading = categories === null;
  const tiles = [...(categories ?? []).slice(0, MAX_CATEGORIES).map(toTile), ...SERVICE_TILES];
  const columns = loading ? MAX_CATEGORIES + SERVICE_TILES.length : tiles.length;

  return (
    <section className="mockup-categories-section" aria-label="Catégories principales" aria-busy={loading}>
      <div className="content-width">
        {/* Desktop : bande blanche continue, colonnes séparées par de fins filets */}
        <div
          className="hidden md:grid bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-4 px-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {loading &&
            Array.from({ length: MAX_CATEGORIES }, (_, i) => (
              <div key={`s${i}`} className="flex flex-col items-center gap-2 px-2 py-1 border-r border-neutral-200/70" aria-hidden="true">
                <span className="w-11 h-11 rounded-full bg-neutral-100 animate-pulse" />
                <span className="h-3 w-20 rounded bg-neutral-100 animate-pulse" />
              </div>
            ))}
          {(loading ? SERVICE_TILES : tiles).map((tile, index, list) => (
            <Link
              key={tile.id}
              href={tile.href}
              className={`group flex flex-col items-center text-center px-2 py-1 transition-all duration-300 hover:-translate-y-0.5 ${
                index < list.length - 1 ? 'border-r border-neutral-200/70' : ''
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2 shrink-0 transition-transform duration-300 group-hover:scale-110">
                <TileVisual tile={tile} size={46} />
              </div>
              <h3 className="font-serif font-bold text-[13px] lg:text-[14px] leading-tight text-[#173f22] group-hover:text-[#c8436e] transition-colors mb-0.5">
                {tile.title}
              </h3>
              <p className="text-[10.5px] lg:text-[11px] leading-tight text-neutral-500 font-sans line-clamp-1">{tile.subtitle}</p>
            </Link>
          ))}
        </div>

        {/* Mobile : grille compacte de pictogrammes */}
        <div className="md:hidden bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 justify-items-center">
            {tiles.map((tile) => (
              <Link key={tile.id} href={tile.href} className="group flex flex-col items-center text-center w-full max-w-[76px]">
                <div className="w-10 h-10 flex items-center justify-center mb-1 shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <TileVisual tile={tile} size={38} />
                </div>
                <span className="text-[11px] font-medium text-[#173f22] leading-tight group-hover:text-[#c8436e] line-clamp-2">{tile.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
