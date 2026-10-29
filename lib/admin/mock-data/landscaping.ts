import { LandscapePrestation, LandscapeProject } from './types';

export const initialLandscapePrestations: LandscapePrestation[] = [
  {
    id: 'conception-jardins',
    title: 'Conception de jardins',
    subtitle: 'Étude et création sur mesure',
    category: 'Jardins',
    image: '/images/paysagisme/prestation-conception.jpg',
    description:
      'Plans 2D/3D personnalisés, sélection d’espèces végétales adaptées au climat côtier du Sénégal, création de massifs et allées minérales.',
    benefits: [
      'Étude personnalisée de votre sol et ensoleillement',
      'Modélisation 3D avant travaux',
      'Sélection rigoureuse d’espèces locales et résistantes',
      'Intégration d’arrosage goutte-à-goutte économe',
    ],
    features: ['Plans paysagers détaillés', 'Palette végétale sur mesure', 'Chiffrage transparent', 'Supervision des travaux'],
  },
  {
    id: 'terrasses-balcons',
    title: 'Terrasses et balcons',
    subtitle: 'Végétalisation et aménagement',
    category: 'Terrasses',
    image: '/images/paysagisme/prestation-terrasses.jpg',
    description:
      'Transformation de vos balcons et terrasses urbaines en îlots de fraîcheur : bacs sur mesure, pergolas fleuries, mobilier intégré et arrosage automatique.',
    benefits: [
      'Optimisation de l’espace et vue mer',
      'Bacs et jardinières résistants aux embruns',
      'Végétation brise-vue naturelle et fraîcheur',
      'Entretien allégé grâce à l’automatisation',
    ],
    features: ['Pergolas végétalisées', 'Plantes en pots design', 'Éclairage d’ambiance', 'Arrosage connecté'],
  },
  {
    id: 'espaces-exterieurs',
    title: 'Espaces extérieurs',
    subtitle: 'Villas, cours et jardins',
    category: 'Villas',
    image: '/images/paysagisme/prestation-exterieurs.jpg',
    description:
      'Aménagement global de propriétés résidentielles : pelouses d’ornement, palmeraies privées, fontaines, allées pavées et bordures florales.',
    benefits: [
      'Mise en valeur architecturale de la villa',
      'Espaces de détente et terrasses ombragées',
      'Fontaines et bassins d’agrément apaisants',
      'Harmonie parfaite entre bâti et nature',
    ],
    features: ['Gazons tropicaux denses', 'Palmiers majestueux', 'Cheminements en pierre naturelle', 'Éclairage paysager LED'],
  },
  {
    id: 'decoration-vegetale-interieure',
    title: 'Décoration végétale intérieure',
    subtitle: 'Plantes et aménagement',
    category: 'Intérieur',
    image: '/images/paysagisme/prestation-interieur.jpg',
    description:
      'Murs végétaux vivants, plantes d’intérieur d’exception (Monsteras, Ficus géants, Oiseaux de paradis) et poteries artisanales pour sublimer vos salons et coursives.',
    benefits: [
      'Purification naturelle de l’air intérieur',
      'Atmosphère sereine et biophilique',
      'Pots et céramiques haut de gamme',
      'Adaptation précise aux zones ombragées',
    ],
    features: ['Murs végétaux intérieurs', 'Arbres d’ornement en pot', 'Suivi nutritionnel', 'Contrats de soins réguliers'],
  },
  {
    id: 'espaces-professionnels',
    title: 'Espaces professionnels',
    subtitle: 'Hôtels, bureaux, restaurants',
    category: 'Professionnels',
    image: '/images/paysagisme/prestation-pro.jpg',
    description:
      'Création d’environnements stimulants pour vos collaborateurs et inoubliables pour vos clients. Accueil végétalisé, atriums et patios fleuris.',
    benefits: [
      'Image de marque éco-responsable et prestige',
      'Ambiance propice à la détente et au bien-être',
      'Attractivité renforcée pour restaurants et hôtels',
      'Service professionnel clé en main sans contrainte',
    ],
    features: ['Patios hôteliers', 'Atriums d’entreprises', 'Terrasses de restaurants', 'Entretien programmé'],
  },
  {
    id: 'entretien-espaces-verts',
    title: 'Entretien des espaces verts',
    subtitle: 'Suivi régulier et maintenance',
    category: 'Entretien',
    image: '/images/paysagisme/prestation-entretien.jpg',
    description:
      'Tonte, taille raisonnée, fertilisation biologique, surveillance sanitaire et maintenance des réseaux d’arrosage par nos équipes de jardiniers qualifiés.',
    benefits: [
      'Pérennité et splendeur de votre investissement',
      'Traitements 100% écologiques et préventifs',
      'Passages programmés hebdomadaires ou bimensuels',
      'Équipe dédiée et outillage professionnel silencieux',
    ],
    features: ['Tonte et régénération gazon', 'Taille d’arbres et haies', 'Fertilisation organique', 'Audit arrosage'],
  },
];

export const initialLandscapeProjects: LandscapeProject[] = [
  {
    id: 'villa-almadies',
    title: 'Villa Almadies',
    category: 'villas',
    categoryLabel: 'Villas & résidences',
    location: 'Almadies, Dakar',
    description:
      'Aménagement paysager complet d’une villa de maître avec piscine à débordement, deck en teck, massifs de bougainvilliers multicolores et palmiers royaux.',
    image: '/images/paysagisme/paysagisme-hero.jpg',
    featured: true,
    tags: ['Piscine', 'Gazon d’ornement', 'Palmiers', 'Terrasse teck'],
  },
  {
    id: 'residence-saly',
    title: 'Résidence Saly Niakh Niakhal',
    category: 'villas',
    categoryLabel: 'Villas & résidences',
    location: 'Saly Portudal',
    description:
      'Création d’un jardin tropical résistant au vent marin avec allée en opus incertum, agaves sculpturaux et massifs d’hibiscus éclatants.',
    image: '/images/paysagisme/paysagisme-villas.jpg',
    featured: false,
    tags: ['Villas', 'Opus incertum', 'Hibiscus', 'Saly'],
  },
  {
    id: 'hotel-le-safari',
    title: 'Hôtel Le Palmier Royal',
    category: 'hotels',
    categoryLabel: 'Hôtels & restaurants',
    location: 'Somone, Sénégal',
    description:
      'Végétalisation du patio restaurant en bord de lagune avec lanternes tressées, éclairage sous feuillage et banquettes lounge entourées de verdure.',
    image: '/images/paysagisme/paysagisme-hotels.jpg',
    featured: false,
    tags: ['Hôtellerie', 'Restaurant', 'Éclairage d’ambiance', 'Détente'],
  },
  {
    id: 'corporate-atrium',
    title: 'Siège Hub Afrique de l’Ouest',
    category: 'bureaux',
    categoryLabel: 'Bureaux & entreprises',
    location: 'Plateau, Dakar',
    description:
      'Implantation d’un mur végétal intérieur monumental de 12 mètres de hauteur dans l’atrium vitré et îlots de verdure avec ficus lyratas géants.',
    image: '/images/paysagisme/paysagisme-bureaux.jpg',
    featured: false,
    tags: ['Mur végétal', 'Atrium', 'Bureaux', 'Biophilie'],
  },
  {
    id: 'terrasse-fann-residence',
    title: 'Penthouse Fann Résidence',
    category: 'terrasses',
    categoryLabel: 'Terrasses & balcons',
    location: 'Fann, Dakar',
    description:
      'Pergola contemporaine en bois exotique avec bougainvilliers grimpants, salon extérieur et bacs design végétalisés avec vue plongeante sur l’océan.',
    image: '/images/paysagisme/prestation-terrasses.jpg',
    featured: false,
    tags: ['Rooftop', 'Pergola', 'Vue mer', 'Terrasse'],
  },
  {
    id: 'jardin-zen-ngaparou',
    title: 'Jardin Zen & Fontaine',
    category: 'jardins',
    categoryLabel: 'Jardins & espaces extérieurs',
    location: 'Ngaparou',
    description:
      'Conception d’un espace de détente avec fontaine en pierre taillée, pas japonais sur gazon soyeux et massifs d’oiseaux de paradis en pleine floraison.',
    image: '/images/paysagisme/prestation-exterieurs.jpg',
    featured: false,
    tags: ['Fontaine', 'Pas japonais', 'Oiseaux de paradis', 'Ngaparou'],
  },
];
