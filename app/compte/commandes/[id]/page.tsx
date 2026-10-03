import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, PackageCheck, Truck } from 'lucide-react';
import { demoOrders } from '@/lib/account-data';
import { products, formatPrice } from '@/lib/products';

export const dynamicParams = false;
export function generateStaticParams() { return demoOrders.map(({ id }) => ({ id })); }

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = demoOrders.find((item) => item.id === id);
  if (!order) notFound();
  const product = products.find((item) => item.name === order.name) ?? products[0];
  return <><div className="account-title-row"><div><Link className="back-link" href="/compte/commandes"><ArrowLeft size={14} /> Mes commandes</Link><h1 className="account-title">Commande n° {order.id}</h1><p className="account-intro">Passée le {order.date} · Aperçu de démonstration</p></div><Link className="button button-outline button-small" href={`/compte/suivi/${order.id}`}>Suivre la commande</Link></div><section className="account-panel"><div className="order-timeline"><div className="complete"><span><Check /></span><b>Commande confirmée</b><small>{order.date}</small></div><div className={order.status === 'En cours' ? 'complete' : 'complete'}><span><PackageCheck /></span><b>Préparation en cours</b><small>État de démonstration</small></div><div className={order.status === 'En cours' ? 'current' : 'complete'}><span><Truck /></span><b>{order.status === 'En cours' ? 'En livraison' : 'Livrée'}</b><small>{order.status}</small></div></div></section><div className="order-detail-columns"><section className="account-panel"><div className="account-panel-heading"><h2>Détail de la commande</h2><span className={`order-status ${order.status === 'En cours' ? 'pending' : ''}`}>{order.status}</span></div><div className="order-product"><Image src={product.image} alt={product.name} width={75} height={75} /><span><b>{product.name}</b><small>Quantité : 1</small></span><strong>{formatPrice(order.price)}</strong></div><div className="recap-line"><span>Sous-total</span><span>{formatPrice(order.price)}</span></div><div className="recap-line"><span>Livraison</span><span>Selon l’adresse choisie</span></div></section><section className="account-panel"><h2>Adresse de livraison</h2><div className="address-preview"><b>Adresse de démonstration</b>Saly Portudal, Sénégal</div><p className="account-intro">Les coordonnées client et le statut réel ne sont pas connectés.</p></section></div><p className="demo-note">Commande d’exemple issue de la maquette, aucune transaction réelle n’a été passée.</p></>;
}
