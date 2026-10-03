import Image from 'next/image';
import Link from 'next/link';
import { products, formatPrice } from '@/lib/products';
import { demoOrders } from '@/lib/account-data';

export default function AccountOrdersPage() {
  return <><div className="account-title-row"><div><h1 className="account-title">Mes commandes</h1><p className="account-intro">Suivez vos commandes et retrouvez vos achats récents.</p></div><span className="demo-note">Aperçu démo</span></div><section className="account-panel"><div className="demo-orders">{demoOrders.map((order) => <div className="demo-order" key={order.id}><Link className="demo-order-name" href={`/compte/commandes/${order.id}`}><Image src={(products.find((product) => product.name === order.name) ?? products[0]).image} alt="" width={40} height={40} /><span>{order.name}</span></Link><span>#{order.id}<br />{order.date}</span><strong>{formatPrice(order.price)}</strong><span className={`order-status ${order.status === 'En cours' ? 'pending' : ''}`}>{order.status}</span><Link className="order-action" href={order.status === 'En cours' ? `/compte/suivi/${order.id}` : `/compte/commandes/${order.id}`}>{order.status === 'En cours' ? 'Suivre' : 'Détails'}</Link></div>)}</div></section></>;
}
