export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface DemoOrder {
  id: string;
  date: string;
  name: string;
  price: number;
  status: 'Livrée' | 'En cours' | 'Confirmée';
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  driver?: {
    name: string;
    role: string;
    rating: number;
    reviews: number;
    phone: string;
    eta: string;
    etaMinutes: number;
  };
}

export const demoOrders: DemoOrder[] = [
  {
    id: 'DFP-2024-00158',
    date: '12 Mai 2024',
    name: 'Bouquet Élégance Rose',
    price: 25000,
    status: 'Livrée',
    items: [
      { name: 'Bouquet Élégance Rose', quantity: 1, price: 25000, image: '/images/hero.jpg' },
    ],
    subtotal: 25000,
    shipping: 2000,
    total: 27000,
  },
  {
    id: 'DFP-2024-00157',
    date: '08 Mai 2024',
    name: 'Centre de table mariage',
    price: 35000,
    status: 'En cours',
    items: [
      { name: 'Centre de table mariage', quantity: 2, price: 35000, image: '/images/mariage.jpg' },
      { name: 'Décoration chaise fleurie', quantity: 8, price: 4500, image: '/images/bouquet-blanc.jpg' },
    ],
    subtotal: 79000,
    shipping: 2000,
    total: 81000,
    driver: {
      name: 'Moussa Ndiaye',
      role: 'Votre livreur',
      rating: 4.8,
      reviews: 128,
      phone: '+221779417860',
      eta: 'entre 13h30 et 14h00',
      etaMinutes: 12,
    },
  },
  {
    id: 'DFP-2024-00156',
    date: '02 Mai 2024',
    name: 'Plante d’intérieur Monstera',
    price: 18000,
    status: 'Livrée',
    items: [
      { name: 'Plante d’intérieur Monstera', quantity: 1, price: 18000, image: '/images/plante-monstera.jpg' },
    ],
    subtotal: 18000,
    shipping: 2000,
    total: 20000,
  },
];
