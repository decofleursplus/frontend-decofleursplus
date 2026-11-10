'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { getMyOrders, CustomerOrder } from '@/lib/api/orders';
import { formatPrice } from '@/lib/products';
import { useAuth } from '@/components/auth-provider';

export default function AccountOrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((data) => {
        if (data && data.items) {
          setOrders(data.items);
        }
      })
      .catch(() => {
        // Ignorer
      })
      .finally(() => setLoading(false));
  }, []);

  const statusLabels: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'En attente', class: 'pending' },
    PAID: { label: 'Payée', class: 'paid' },
    PREPARING: { label: 'En préparation', class: 'pending' },
    READY: { label: 'Prête', class: 'pending' },
    IN_DELIVERY: { label: 'En livraison', class: 'pending' },
    DELIVERED: { label: 'Livrée', class: 'delivered' },
    CANCELLED: { label: 'Annulée', class: 'cancelled' },
  };

  return (
    <>
      <div className="account-title-row">
        <div>
          <h1 className="account-title">Mes commandes</h1>
          <p className="account-intro">Suivez vos commandes et retrouvez vos achats récents.</p>
        </div>
      </div>

      <section className="account-panel">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-neutral-500 gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span>Chargement de votre historique de commandes...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="demo-orders">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const itemImg = firstItem?.image || '/images/hero.jpg';
              const itemName = firstItem
                ? order.items.length > 1
                  ? `${firstItem.productName} + ${order.items.length - 1} autre(s)`
                  : firstItem.productName
                : `Commande #${order.orderNumber}`;

              const st = statusLabels[order.orderStatus] || {
                label: order.orderStatus,
                class: 'pending',
              };

              const isInProgress = ['PENDING', 'PAID', 'PREPARING', 'READY', 'IN_DELIVERY'].includes(
                order.orderStatus
              );

              return (
                <div className="demo-order" key={order.id}>
                  <Link
                    className="demo-order-name"
                    href={`/compte/commandes/${order.orderNumber}`}
                  >
                    <Image src={itemImg} alt={itemName || 'Article commandé'} width={40} height={40} className="rounded-lg object-cover" />
                    <span>{itemName}</span>
                  </Link>

                  <span>
                    #{order.orderNumber}
                    <br />
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                  <strong>{formatPrice(order.totalAmount)}</strong>

                  <div className="flex flex-col gap-1 items-start">
                    <span className={`order-status ${st.class}`}>
                      {st.label}
                    </span>
                    {order.paymentStatus === 'PENDING' && order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        À payer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      className="order-action"
                      href={`/compte/commandes/${order.orderNumber}`}
                    >
                      Détails
                    </Link>
                    {isInProgress && (
                      <Link
                        className="order-action text-[#173f22] font-semibold"
                        href={`/compte/suivi/${order.orderNumber}`}
                      >
                        Suivre
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-10 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-[#173f22]/10 text-[#173f22] rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={24} />
            </div>
            <h3 className="font-serif font-bold text-base text-neutral-800 mb-1">
              Vous n’avez pas encore passé de commande
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-4">
              Explorez nos bouquets de saison et créations florales à Saly &amp; Mbour.
            </p>
            <Link href="/boutique" className="button button-primary inline-flex items-center gap-1.5">
              Découvrir la boutique <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
