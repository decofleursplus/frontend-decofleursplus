import Link from 'next/link';
import { getProducts, type ProductFilterParams } from '@/lib/api/catalog';
import { getDeliveryZones, type DeliveryZone } from '@/lib/api/orders';
import { formatPrice } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';

/**
 * Grille de produits réels (rendu serveur) pour les pages éditoriales.
 * Si le catalogue est indisponible, un message l'indique au lieu d'une grille vide.
 */
export async function LiveProductGrid({ filters = {}, limit = 4 }: { filters?: ProductFilterParams; limit?: number }) {
  const items = await getProducts({ sort: 'popular', ...filters, limit })
    .then((res) => res.items)
    .catch((error) => {
      console.error('[Vitrine] Catalogue indisponible :', error);
      return null;
    });
  if (items === null) {
    return (
      <p className="text-sm text-neutral-600">
        Le catalogue est momentanément indisponible. <Link href="/boutique" className="underline">Réessayer depuis la boutique</Link>
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        Notre sélection est en cours de renouvellement. <Link href="/boutique" className="underline">Voir toute la boutique</Link>
      </p>
    );
  }
  return <ProductGrid products={items} />;
}

export async function loadZones(): Promise<DeliveryZone[] | null> {
  try {
    return await getDeliveryZones();
  } catch (error) {
    console.error('[Vitrine] Zones de livraison indisponibles :', error);
    return null;
  }
}

/** « Forfait 2 000 FCFA (offert dès 50 000 FCFA) » pour une zone, d'après le back-office. */
export function describeZoneFee(zone: DeliveryZone | undefined): string {
  if (!zone) return 'Tarif de livraison selon votre zone, affiché au panier';
  const free = zone.freeAbove ? ` (offert dès ${formatPrice(zone.freeAbove)})` : '';
  return `Forfait ${formatPrice(zone.fee)}${free}, express ${formatPrice(zone.expressFee)}`;
}

/** Phrase de tarif d'une zone, chargée côté serveur. */
export async function ZoneFeeSentence({ zoneSlug }: { zoneSlug: string }) {
  const zones = await loadZones();
  return <>{describeZoneFee(zones?.find((z) => z.slug === zoneSlug))}</>;
}
