export const SITE_URL = 'https://www.decofleursplus.com';

export const SITE_CONFIG = {
  name: 'Décofleurs Plus',
  legalName: 'Décofleurs Plus SARL',
  tagline: 'Nature en Élégance',
  url: SITE_URL,
  description:
    'Fleuriste artisanal de prestige au Sénégal. Bouquets de roses fraîches, décoration florale de mariage, paysagisme et paniers gourmands livrés à Dakar, Saly, Somone et Mbour.',
  email: 'contact@decofleursplus.sn',
  phoneSaly: '+221 33 957 88 99',
  phoneDakar: '+221 77 941 78 60',
  whatsappNumber: '221779417860',
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
    instagram: 'https://instagram.com/decofleurplus',
    facebook: 'https://facebook.com/decofleurplus',
    tiktok: 'https://tiktok.com/@decofleurplus',
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

