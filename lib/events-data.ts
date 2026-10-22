export type EventThemeColor =
  | 'emerald'
  | 'ruby'
  | 'gold'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'festive'
  | 'standard';

export interface SeasonalEvent {
  id: string;
  name: string;
  categoryLabel: string;
  datesLabel: string;
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  whatsappMessage: string;
  themeColor: EventThemeColor;
  bgImage: string;
  isActive: boolean;
  collectionTitle: string;
  collectionDesc: string;
  discountNote?: string;
  featuredProductIds: string[];
}

export function stripEmojis(str: string): string {
  if (!str) return str;
  return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();
}

export const initialSeasonalEvents: SeasonalEvent[] = [
  {
    id: 'tabaski',
    name: 'Tabaski (Aïd el-Kébir)',
    categoryLabel: 'Fête religieuse',
    datesLabel: 'Période de la Tabaski',
    headline: 'Pour la Tabaski, célébrez le partage',
    headlineHighlight: 'dans la grâce & la beauté !',
    subheadline:
      'Sublimez vos réceptions familiales, honorez vos convives et partagez des émotions chaleureuses avec nos bouquets de fête, lys majestueux et corbeilles de fruits frais.',
    badge: 'Spécial Tabaski · Aïd el-Kébir',
    ctaText: 'Découvrir la collection Tabaski',
    ctaLink: '/boutique?event=tabaski',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite passer une commande spéciale pour la fête de Tabaski.',
    themeColor: 'emerald',
    bgImage: '/images/events/tabaski_evocative.jpg',
    isActive: true,
    collectionTitle: 'Créations d’Exception pour la Tabaski',
    collectionDesc:
      'Des centres de table harmonieux, des lys blancs immaculés et des corbeilles généreuses pour une célébration royale.',
    discountNote: 'Livraison express garantie à Saly & Mbour la veille et le jour de la fête.',
    featuredProductIds: [
      'bouquet-lys-blanc',
      'panier-fruits-tropicaux',
      'orchidee-phalaenopsis',
      'bouquet-soleil',
    ],
  },
  {
    id: 'saint-valentin',
    name: 'Saint-Valentin',
    categoryLabel: 'Romance & Amour',
    datesLabel: '14 Février',
    headline: 'Déclarez votre amour avec l’élégance',
    headlineHighlight: 'de nos roses d’exception !',
    subheadline:
      'Cœurs de roses rouges passionnées, coffrets précieux avec chocolats fins et bouquets tendres livrés avec discrétion et délicatesse sur toute la Petite Côte.',
    badge: 'Collection Saint-Valentin',
    ctaText: 'Commander nos roses d’amour',
    ctaLink: '/boutique?event=saint-valentin',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite réserver une surprise florale pour la Saint-Valentin.',
    themeColor: 'ruby',
    bgImage: '/images/events/saint_valentin_evocative.jpg',
    isActive: false,
    collectionTitle: 'Sélection Passion Saint-Valentin',
    collectionDesc:
      'Des créations envoûtantes pensées pour faire battre les cœurs et immortaliser votre déclaration.',
    discountNote: 'Pensez à pré-réserver votre livraison pour garantir les plus beaux boutons de roses.',
    featuredProductIds: [
      'bouquet-passion',
      'bouquet-elegance-rose',
      'composition-orchidee-blanche',
      'panier-fruits-tropicaux',
    ],
  },
  {
    id: 'korite',
    name: 'Korité (Aïd el-Fitr)',
    categoryLabel: 'Fête religieuse',
    datesLabel: 'Fin du Ramadan · Aïd el-Fitr',
    headline: 'Pour la Korité, partagez la joie',
    headlineHighlight: 'et la douceur des fleurs fraîches !',
    subheadline:
      'Après le mois béni, offrez à votre maison et à vos proches des senteurs printanières, des orchidées raffinées et des attentions fleuries pleines de bénédiction.',
    badge: 'Spécial Korité · Aïd el-Fitr',
    ctaText: 'Explorer les créations Korité',
    ctaLink: '/boutique?event=korite',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite commander pour la fête de la Korité.',
    themeColor: 'gold',
    bgImage: '/images/events/korite_evocative.jpg',
    isActive: false,
    collectionTitle: 'Douceur & Sérénité pour la Korité',
    collectionDesc:
      'Compositions florales lumineuses et paniers gourmands pour des retrouvailles empreintes d’élégance.',
    featuredProductIds: [
      'bouquet-blanc',
      'orchidee-phalaenopsis',
      'panier-fruits-tropicaux',
      'bouquet-elegance-rose',
    ],
  },
  {
    id: 'magal',
    name: 'Grand Magal de Touba',
    categoryLabel: 'Commémoration & Hospitalité',
    datesLabel: '18 Safar',
    headline: 'Pour le Grand Magal de Touba, sublimez',
    headlineHighlight: 'l’accueil et le Berndé d’honneur !',
    subheadline:
      'Compositions florales de prestige et corbeilles de primeurs de haute qualité pour honorer vos hôtes et magnifier vos salons de réception pendant les célébrations.',
    badge: 'Grand Magal de Touba',
    ctaText: 'Découvrir la sélection Magal',
    ctaLink: '/boutique?event=magal',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite un devis ou une commande pour le Grand Magal de Touba.',
    themeColor: 'emerald',
    bgImage: '/images/events/magal_evocative.jpg',
    isActive: false,
    collectionTitle: 'Hospitalité & Berndé d’Exception',
    collectionDesc:
      'Orchidées majestueuses, lys immaculés et corbeilles garnies dédiées à un accueil chaleureux et raffiné.',
    featuredProductIds: [
      'bouquet-lys-blanc',
      'orchidee-phalaenopsis',
      'panier-fruits-tropicaux',
      'plante-monstera',
    ],
  },
  {
    id: 'gamou',
    name: 'Gamou de Tivaouane (Mawlid)',
    categoryLabel: 'Commémoration & Tradition',
    datesLabel: '12 Rabia al-Awwal',
    headline: 'Pour le Gamou de Tivaouane, célébrez',
    headlineHighlight: 'la lumière et la ferveur !',
    subheadline:
      'Bouquets de recueillement et fleurs blanches parfumées pour habiller vos demeures et témoigner vos vœux les plus sincères.',
    badge: 'Spécial Gamou · Mawlid',
    ctaText: 'Voir la sélection Gamou',
    ctaLink: '/boutique?event=gamou',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite passer une commande pour le Gamou de Tivaouane.',
    themeColor: 'emerald',
    bgImage: '/images/events/gamou_evocative.jpg',
    isActive: false,
    collectionTitle: 'Pureté & Bénédictions Florales',
    collectionDesc:
      'L’artisanat floral au service de la paix, de la prière et du respect des traditions.',
    featuredProductIds: [
      'bouquet-lys-blanc',
      'bouquet-blanc',
      'orchidee-phalaenopsis',
      'bouquet-soleil',
    ],
  },
  {
    id: 'femmes-8mars',
    name: '8 Mars — Journée de la Femme',
    categoryLabel: 'Hommage & Célébration',
    datesLabel: '8 Mars',
    headline: '8 Mars : Honorez les femmes d’exception',
    headlineHighlight: 'qui illuminent votre vie !',
    subheadline:
      'Offrez un bouquet vibrant d’énergie, de force et de délicatesse. Orchidées mauves, roses lumineuses et compositions sur mesure pour remercier collègues, mères et sœurs.',
    badge: 'Journée Internationale des Droits des Femmes',
    ctaText: 'Offrir un bouquet pour le 8 Mars',
    ctaLink: '/boutique?event=8mars',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite commander des fleurs pour la Journée de la Femme du 8 Mars.',
    themeColor: 'purple',
    bgImage: '/images/events/femmes-8mars.jpg',
    isActive: false,
    collectionTitle: 'Hommage aux Femmes Inspirantes',
    collectionDesc:
      'Des créations florales empreintes de distinction, de fraîcheur et de respect.',
    featuredProductIds: [
      'bouquet-elegance-rose',
      'composition-orchidee-blanche',
      'bouquet-soleil',
      'panier-fruits-tropicaux',
    ],
  },
  {
    id: 'fete-meres',
    name: 'Fête des Mères',
    categoryLabel: 'Fête familiale',
    datesLabel: 'Dernier dimanche de Mai',
    headline: 'Fête des Mères : Dites-lui tout votre amour',
    headlineHighlight: 'en fleurs et en émotions !',
    subheadline:
      'Elle mérite ce qu’il y a de plus beau. Pivoines tendres, roses douces et coffrets fleuris conçus avec patience et dévouement par nos maîtres artisans fleuristes.',
    badge: 'Célébration Fête des Mères',
    ctaText: 'Gâter maman avec nos créations',
    ctaLink: '/boutique?event=fete-meres',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite réserver un bouquet pour la Fête des Mères.',
    themeColor: 'rose',
    bgImage: '/images/events/fete-meres.jpg',
    isActive: false,
    collectionTitle: 'Tendresse Infinie pour Maman',
    collectionDesc:
      'Des bouquets pastel, des notes sucrées et des cartes calligraphiées pour un instant inoubliable.',
    featuredProductIds: [
      'bouquet-elegance-rose',
      'bouquet-passion',
      'panier-fruits-tropicaux',
      'orchidee-phalaenopsis',
    ],
  },
  {
    id: 'fete-peres',
    name: 'Fête des Pères',
    categoryLabel: 'Fête familiale',
    datesLabel: 'Troisième dimanche de Juin',
    headline: 'Fête des Pères : Des attentions nobles & racées',
    headlineHighlight: 'pour lui témoigner votre estime !',
    subheadline:
      'Plantes graphiques durables, monstera majestueuses, paniers de fruits gorgés de soleil et compositions d’intérieur au caractère affirmé.',
    badge: 'Célébration Fête des Pères',
    ctaText: 'Découvrir les idées Fête des Pères',
    ctaLink: '/boutique?event=fete-peres',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je cherche une création pour la Fête des Pères.',
    themeColor: 'amber',
    bgImage: '/images/events/fete-peres.jpg',
    isActive: false,
    collectionTitle: 'Plantes Nobles & Cadeaux de Caractère',
    collectionDesc:
      'Une sélection élégante mêlant végétation d’architecte et primeurs vitaminés.',
    featuredProductIds: [
      'plante-monstera',
      'panier-fruits-tropicaux',
      'orchidee-phalaenopsis',
      'bouquet-soleil',
    ],
  },
  {
    id: 'noel-fetes',
    name: 'Noël & Fin d’année',
    categoryLabel: 'Saisonnier & Fin d’année',
    datesLabel: 'Décembre & Nouvel An',
    headline: 'Illuminez vos fêtes de fin d’année',
    headlineHighlight: 'd’une féérie florale inoubliable !',
    subheadline:
      'Centres de table de réveillon, touches de cannelle et de sapin doré, roses carmin veloutées : transformez votre table de fête en un conte enchanteur.',
    badge: 'Noël & Nouvel An',
    ctaText: 'Explorer la collection des fêtes',
    ctaLink: '/boutique?event=noel',
    whatsappMessage:
      'Bonjour DécoFleur Plus, je souhaite réserver mes décors et fleurs pour les fêtes de fin d’année.',
    themeColor: 'festive',
    bgImage: '/images/events/noel-fetes.jpg',
    isActive: false,
    collectionTitle: 'Féérie Végétale & Réveillons Royaux',
    collectionDesc:
      'Sublimez vos tablées avec nos décors chaleureux et nos arrangements festifs.',
    featuredProductIds: [
      'bouquet-passion',
      'bouquet-lys-blanc',
      'panier-fruits-tropicaux',
      'composition-orchidee-blanche',
    ],
  },
];

export const standardBoutiqueEvent: SeasonalEvent = {
  id: 'standard',
  name: 'Boutique Standard (Hors Événement)',
  categoryLabel: 'Boutique Standard',
  datesLabel: 'Toute l’année',
  headline: 'Des fleurs, des fruits, des idées,',
  headlineHighlight: 'des émotions !',
  subheadline:
    'Artisan fleuriste à Saly Portudal. Bouquets de saison, scénographie d’exception et abonnements floraux pour villas, hôtels et particuliers.',
  badge: 'Maison d’Art Floral & Végétal',
  ctaText: 'Voir tout le catalogue',
  ctaLink: '/boutique',
  whatsappMessage:
    'Bonjour DécoFleur Plus, je souhaite un renseignement ou passer une commande.',
  themeColor: 'standard',
  bgImage: '/images/hero.jpg',
  isActive: false,
  collectionTitle: 'Nos créations phares',
  collectionDesc:
    'Découvrez les pièces signatures de notre atelier de création florale à Saly Portudal.',
  featuredProductIds: [
    'bouquet-elegance-rose',
    'panier-fruits-tropicaux',
    'bouquet-passion',
    'composition-orchidee-blanche',
  ],
};

const STORAGE_KEY = 'decofleur_seasonal_events_v3';
const ACTIVE_EVENT_STORAGE_KEY = 'decofleur_active_event_id_v3';

function sanitizeEvent(ev: SeasonalEvent): SeasonalEvent {
  if (!ev || typeof ev !== 'object') return ev;
  return {
    ...ev,
    badge: stripEmojis(ev.badge || ''),
    categoryLabel: stripEmojis(ev.categoryLabel || ''),
    name: stripEmojis(ev.name || ''),
  };
}

/**
 * Charge tous les événements depuis le stockage local (avec repli garanti sur les événements par défaut)
 */
export function getStoredSeasonalEvents(): SeasonalEvent[] {
  if (typeof window === 'undefined') {
    return initialSeasonalEvents;
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migration v2 -> v3
    if (!raw) {
      const v2Raw = localStorage.getItem('decofleur_seasonal_events_v2');
      if (v2Raw) {
        raw = v2Raw;
      }
    }

    if (!raw) {
      return initialSeasonalEvents;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filtrer les entrées valides (ignorer un éventuel standard enregistré par erreur)
      const validItems = parsed
        .filter((e) => e && typeof e === 'object' && e.id && e.id !== 'standard')
        .map(sanitizeEvent);

      // Garantir que toutes les célébrations par défaut sont TOUJOURS présentes
      const combined = [...validItems];
      for (const initEv of initialSeasonalEvents) {
        if (!combined.some((e) => e.id === initEv.id)) {
          combined.push(initEv);
        }
      }

      if (combined.length > 0) {
        return combined;
      }
    }
    return initialSeasonalEvents;
  } catch {
    return initialSeasonalEvents;
  }
}

/**
 * Récupère l'événement actif actuel
 */
export function getActiveSeasonalEvent(): SeasonalEvent {
  if (typeof window === 'undefined') {
    return initialSeasonalEvents.find((e) => e.isActive) || initialSeasonalEvents[0];
  }
  try {
    let activeId = localStorage.getItem(ACTIVE_EVENT_STORAGE_KEY);
    if (!activeId) {
      activeId = localStorage.getItem('decofleur_active_event_id_v2');
    }
    const events = getStoredSeasonalEvents();
    if (activeId === 'standard') {
      return standardBoutiqueEvent;
    }
    if (activeId) {
      const found = events.find((e) => e.id === activeId);
      if (found) return sanitizeEvent(found);
    }
    const foundActive = events.find((e) => e.isActive);
    if (foundActive) return sanitizeEvent(foundActive);
    return standardBoutiqueEvent;
  } catch {
    return standardBoutiqueEvent;
  }
}

/**
 * Active un événement spécifique par son ID (ou 'standard')
 */
export function setActiveSeasonalEvent(eventId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_EVENT_STORAGE_KEY, eventId);
    const events = getStoredSeasonalEvents();
    const updated = events.map((ev) => ({
      ...ev,
      isActive: ev.id === eventId,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('decofleur-event-changed', { detail: { eventId } }));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde de l’événement actif :', err);
  }
}

/**
 * Met à jour un événement dans la liste
 */
export function saveSeasonalEvents(events: SeasonalEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = events.map(sanitizeEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    const active = sanitized.find((e) => e.isActive);
    if (active) {
      localStorage.setItem(ACTIVE_EVENT_STORAGE_KEY, active.id);
    }
    window.dispatchEvent(new CustomEvent('decofleur-event-changed', { detail: { events: sanitized } }));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des événements :', err);
  }
}

/**
 * Duplique un événement existant
 */
export function duplicateSeasonalEvent(eventId: string): SeasonalEvent | null {
  const events = getStoredSeasonalEvents();
  const source = events.find((e) => e.id === eventId);
  if (!source) return null;

  const newId = `event-${Date.now()}`;
  const duplicated: SeasonalEvent = {
    ...source,
    id: newId,
    name: `${source.name} (Copie)`,
    isActive: false,
  };

  const nextEvents = [duplicated, ...events];
  saveSeasonalEvents(nextEvents);
  return duplicated;
}

/**
 * Supprime un événement personnalisé
 */
export function deleteSeasonalEvent(eventId: string): boolean {
  const events = getStoredSeasonalEvents();
  // Ne pas supprimer si c'est le dernier événement ou si actif
  const target = events.find((e) => e.id === eventId);
  if (!target) return false;

  const nextEvents = events.filter((e) => e.id !== eventId);
  saveSeasonalEvents(nextEvents);

  if (target.isActive) {
    setActiveSeasonalEvent('standard');
  }

  return true;
}

