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

export const demoOrders: DemoOrder[] = [];
