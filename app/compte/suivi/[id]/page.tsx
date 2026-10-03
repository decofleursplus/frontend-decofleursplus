import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { demoOrders } from '@/lib/account-data';

export const dynamicParams = false;
export function generateStaticParams() { return demoOrders.map(({ id }) => ({ id })); }

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = demoOrders.find((item) => item.id === id);
  if (!order) notFound();
  return <><div className="account-title-row"><div><Link className="back-link" href={`/compte/commandes/${id}`}><ArrowLeft size={14} /> Détail de la commande</Link><h1 className="account-title">Suivi de commande</h1><p className="account-intro">Commande n° {order.id} · Aperçu de démonstration</p></div><span className={`order-status ${order.status === 'En cours' ? 'pending' : ''}`}>{order.status}</span></div><section className="account-panel tracking-panel"><div className="tracking-copy"><h2><Truck size={19} /> Votre commande est {order.status === 'En cours' ? 'en livraison' : 'livrée'}</h2><p>Le suivi réel sera visible lorsque les commandes seront connectées.</p><span className="eta-pill">Statut : {order.status}</span><div className="driver-card"><div className="profile-initials">DP</div><span><b>Équipe livraison</b><small>Décofleur Plus · Saly</small></span></div><Link href="/contact">Contacter la boutique</Link></div><div className="tracking-map"><Image src="/images/order-map.webp" alt="Carte de Saly et Mbour telle que présentée dans la maquette" fill sizes="480px" /><span><MapPin size={16} /> Saly</span></div></section><section className="account-panel tracking-preferences"><h2>Préférences de notification</h2><p className="account-intro">Les notifications sont disponibles après connexion au compte client.</p><Link href="/compte/notifications">Gérer mes préférences →</Link></section></>;
}
