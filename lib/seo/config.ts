export const SITE_URL = 'https://www.decofleursplus.com';

export const SITE_CONFIG = {
  name: 'Décofleurs Plus',
  legalName: 'Décofleurs Plus SARL',
  alternateNames: [
    'Déco Fleurs Plus',
    'Déco-Fleurs',
    'Déco Fleurs',
    'deco fleurs saly',
    'Decofleurs Plus',
    'Deco Fleurs Saly',
  ],
  tagline: 'Nature en Élégance',
  url: SITE_URL,
  description:
    'Artisan fleuriste et magasin de décoration de prestige à Saly Portudal et Dakar. Bouquets de roses fraîches, décoration florale événementielle, objets déco, paysagisme et cadeaux livrés à Saly, Dakar, Somone et Mbour.',
  email: 'contact@decofleursplus.sn',
  phoneSaly: '+221 33 957 88 99',
  phoneDakar: '+221 77 941 78 60',
  whatsappNumber: '221779417860',
  whatsappUrl: 'https://wa.me/221779417860',
  currency: 'XOF',
  currencySymbol: 'FCFA',
  priceRange: '$$',
  defaultOgImage: '/images/og-decofleur.jpg',
  
  address: {
    streetAddress: 'Rue des Palmiers, Saly Portudal',
    addressLocality: 'Saly Portudal',
    addressRegion: 'Thiès / Petite-Côte',
    postalCode: '23000',
    addressCountry: 'SN',
  },
  
  geo: {
    latitude: 14.4431,
    longitude: -17.0272,
  },
  
  openingHoursSpecification: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:30',
      closes: '20:00',
    },
    {
      dayOfWeek: ['Sunday'],
      opens: '09:00',
      closes: '15:00',
    },
  ],
  
  social: {
    instagram: 'https://www.instagram.com/deco_fleurs_plus/',
    facebook: 'https://www.facebook.com/p/D%C3%A9co-Fleurs-Plus-61586988403846',
    tiktok: 'https://www.tiktok.com/@decofleursaly',
    whatsapp: 'https://wa.me/221779417860',
  },

  serviceAreas: [
    {
      name: 'Saly Portudal',
      type: 'Boutique physique & Atelier',
      deliveryTime: 'Livraison express en 2h',
      fee: 2000,
      freeAbove: 35000,
    },
    {
      name: 'Somone',
      type: 'Zone desservie',
      deliveryTime: 'Livraison le jour même',
      fee: 3000,
      freeAbove: 50000,
    },
    {
      name: 'Mbour & Petite-Côte',
      type: 'Zone desservie',
      deliveryTime: 'Livraison le jour même (avant 16h)',
      fee: 3000,
      freeAbove: 50000,
    },
    {
      name: 'Ngaparou & Nianing',
      type: 'Zone desservie',
      deliveryTime: 'Livraison dans la journée',
      fee: 4000,
      freeAbove: 60000,
    },
    {
      name: 'Dakar & Environs',
      type: 'Zone desservie par navette réfrigérée',
      deliveryTime: '24h ouvrées / Navette frigorifique sécurisée',
      fee: 5000,
      freeAbove: 75000,
      neighborhoods: ['Plateau', 'Almadies', 'Fann', 'Yoff', 'Ouakam', 'Mermoz', 'Point E', 'Ngor'],
    },
  ],
};

