'use client';

import Image from 'next/image';
import Link from 'next/link';

export const mockupCategoriesList = [
  {
    id: 'bouquets',
    title: 'Bouquets élégants',
    shortTitle: 'Bouquets',
    subtitle: 'Fleurs fraîches et raffinées',
    href: '/bouquets',
    iconSrc: '/images/categories/bouquets.png',
  },
  {
    id: 'decoration',
    title: 'Décoration sur mesure',
    shortTitle: 'Décoration',
    subtitle: 'Espaces, maisons, bureaux',
    href: '/decoration',
    iconSrc: '/images/categories/decoration.png',
  },
  {
    id: 'evenements',
    title: 'Mariages & événements',
    shortTitle: 'Événements',
    subtitle: 'Cérémonies, réceptions',
    href: '/evenements',
    iconSrc: '/images/categories/evenements.png',
  },
  {
    id: 'livraison',
    title: 'Livraison à domicile',
    shortTitle: 'Livraison',
    subtitle: 'Rapide et fiable à Saly & Mbour',
    href: '/livraison',
    iconSrc: '/images/categories/livraison.png',
  },
  {
    id: 'fruits',
    title: 'Paniers de fruits',
    shortTitle: 'Fruits',
    subtitle: 'Frais et gourmands',
    href: '/paniers-de-fruits',
    iconSrc: '/images/categories/fruits.png',
  },
  {
    id: 'cadeaux',
    title: 'Cadeaux',
    shortTitle: 'Cadeaux',
    subtitle: 'Pour toutes occasions',
    href: '/cadeaux',
    iconSrc: '/images/categories/cadeaux.png',
  },
  {
    id: 'vaisselle',
    title: 'Location de vaisselle',
    shortTitle: 'Vaisselle',
    subtitle: 'Assiettes, verres & nappage',
    href: '/location',
    iconSrc: '/images/categories/vaisselle.png',
  },
];

export function MockupCategories() {
  return (
    <section className="mockup-categories-section" aria-label="Catégories principales">
      <div className="content-width">
        {/* Desktop: A continuous elegant white band with 7 columns divided by subtle vertical lines */}
        <div className="hidden md:grid md:grid-cols-7 bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-4 px-2">
          {mockupCategoriesList.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group flex flex-col items-center text-center px-2 py-1 transition-all duration-300 hover:-translate-y-0.5 ${
                index < mockupCategoriesList.length - 1 ? 'border-r border-neutral-200/70' : ''
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2 shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={cat.iconSrc}
                  alt={cat.title}
                  width={46}
                  height={46}
                  className="object-contain w-auto h-auto max-w-[44px] max-h-[44px]"
                />
              </div>
              <h3 className="font-serif font-bold text-[13px] lg:text-[14px] leading-tight text-[#173f22] group-hover:text-[#c8436e] transition-colors mb-0.5">
                {cat.title}
              </h3>
              <p className="text-[10.5px] lg:text-[11px] leading-tight text-neutral-500 font-sans line-clamp-1">
                {cat.subtitle}
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile: 2 rows (4 items top, 3 items bottom centered) exactly like the smartphone mockup */}
        <div className="md:hidden bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex flex-col gap-4">
          {/* Row 1: 4 items */}
          <div className="grid grid-cols-4 gap-2 justify-items-center">
            {mockupCategoriesList.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center text-center w-full max-w-[76px]"
              >
                <div className="w-10 h-10 flex items-center justify-center mb-1 shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Image
                    src={cat.iconSrc}
                    alt={cat.shortTitle}
                    width={38}
                    height={38}
                    className="object-contain w-auto h-auto max-w-[36px] max-h-[36px]"
                  />
                </div>
                <span className="text-[11px] font-medium text-[#173f22] leading-tight group-hover:text-[#c8436e]">
                  {cat.shortTitle}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2: 3 items centered */}
          <div className="flex justify-center gap-6">
            {mockupCategoriesList.slice(4, 7).map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center text-center w-[76px]"
              >
                <div className="w-10 h-10 flex items-center justify-center mb-1 shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Image
                    src={cat.iconSrc}
                    alt={cat.shortTitle}
                    width={38}
                    height={38}
                    className="object-contain w-auto h-auto max-w-[36px] max-h-[36px]"
                  />
                </div>
                <span className="text-[11px] font-medium text-[#173f22] leading-tight group-hover:text-[#c8436e]">
                  {cat.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
