import type { AdminCategory } from './types';

export const adminCategories: AdminCategory[] = [
  {
    id: 'cat-1',
    name: 'Bouquets',
    description: 'Compositions de fleurs fraîches et bouquets de saison',
    productCount: 78,
    status: 'actif',
  },
  {
    id: 'cat-2',
    name: 'Plantes',
    description: "Plantes d'intérieur, plantes vertes et arbustes d'extérieur",
    productCount: 62,
    status: 'actif',
  },
  {
    id: 'cat-3',
    name: 'Fruits & Légumes',
    description: 'Paniers de fruits frais et assortiments gourmands',
    productCount: 20,
    status: 'actif',
  },
  {
    id: 'cat-4',
    name: 'Cadeaux',
    description: 'Coffrets cadeaux, vases élégants et bougies parfumées',
    productCount: 45,
    status: 'actif',
  },
  {
    id: 'cat-5',
    name: 'Décorations',
    description: 'Décorations florales pour réceptions, intérieurs et fêtes',
    productCount: 30,
    status: 'actif',
  },
  {
    id: 'cat-6',
    name: 'Mariages & Événements',
    description: 'Arches, centres de table et compositions sur-mesure pour cérémonies',
    productCount: 25,
    status: 'actif',
  },
  {
    id: 'cat-7',
    name: 'Abonnements Floraux',
    description: 'Livraisons régulières de fleurs fraîches pour particuliers et entreprises',
    productCount: 0,
    status: 'inactif',
  },
];
