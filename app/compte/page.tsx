'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Crown, FileText, Heart, MapPin, PackageCheck, Star } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/components/cart-provider';
import { getCustomerProfile, type CustomerProfile } from '@/lib/api/customer';
import { getMyOrders, ORDER_STATUS_LABELS, type CustomerOrder } from '@/lib/api/orders';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/products';
import { ErrorState, LoadingState, errorText, formatDate } from '@/components/account/shared';

const TIER_LABEL: Record<string, string> = { Bronze: 'Bronze', Silver: 'Argent', Gold: 'Or', Platinum: 'Platine' };
const IN_PROGRESS = new Set(['PENDING', 'PAID', 'PREPARING', 'READY', 'IN_DELIVERY']);

export default function AccountDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { favoriteItems } = useCart();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([getCustomerProfile(), getMyOrders(1, 5)])
      .then(([p, o]) => {
        if (!active) return;
        setProfile(p);
        setOrders(o.items);
        setError(null);
      })
      .catch((err) => active && setError(errorText(err, 'Impossible de charger votre compte.')));
    return () => {
      active = false;
    };
  }, [isAuthenticated, reloadKey]);

  const displayName = (profile?.firstName || user?.name?.split(' ')[0]) ?? '';
  const address = profile?.defaultAddress ?? null;

  return (
    <div className="account-dashboard-wrapper">
      <div className="account-title-row">
        <div>
          <h1 className="account-title">Mon compte</h1>
          <p className="account-intro">Bienvenue{displayName ? ` ${displayName}` : ''} ! Voici un aperçu de votre espace.</p>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : !profile || !orders ? (
        <LoadingState label="Chargement de votre compte…" />
      ) : (
        <>
          <section className="account-stats-row" aria-label="Statistiques du compte">
            <div className="account-stat-card">
              <div className="stat-icon-wrap stat-orders">
                <PackageCheck size={20} />
              </div>
              <div className="stat-text-wrap">
                <strong className="stat-number">{profile.totalOrders}</strong>
                <span className="stat-label">Commandes</span>
              </div>
            </div>
            <div className="account-stat-card">
              <div className="stat-icon-wrap stat-points">
                <Star size={20} />
              </div>
              <div className="stat-text-wrap">
                <strong className="stat-number">{profile.loyaltyPoints.toLocaleString('fr-FR')}</strong>
                <span className="stat-label">Points fidélité</span>
              </div>
            </div>
            <div className="account-stat-card">
              <div className="stat-icon-wrap stat-level">
                <Crown size={20} />
              </div>
              <div className="stat-text-wrap">
                <strong className="stat-number gold-color">{TIER_LABEL[profile.loyaltyTier] ?? profile.loyaltyTier}</strong>
                <span className="stat-label">Votre niveau</span>
              </div>
            </div>
            <div className="account-stat-card">
              <div className="stat-icon-wrap stat-addresses">
                <MapPin size={20} />
              </div>
              <div className="stat-text-wrap">
                <strong className="stat-number">{formatPrice(profile.totalSpent)}</strong>
                <span className="stat-label">Total de vos achats</span>
              </div>
            </div>
          </section>

          <section className="account-panel dashboard-orders-panel">
            <div className="account-panel-heading">
              <h2>Mes dernières commandes</h2>
              <Link href="/compte/commandes" className="see-all-link">
                Voir toutes mes commandes <ArrowRight size={14} />
              </Link>
            </div>
            <div className="dashboard-orders-list">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const first = order.items[0];
                  const inProgress = IN_PROGRESS.has(order.orderStatus);
                  return (
                    <div key={order.id} className="dashboard-order-row">
                      <div className="order-row-id-date">
                        <span className="order-id">{order.orderNumber}</span>
                        <span className="order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="order-row-product">
                        <div className="order-row-thumb">
                          <Image src={first?.image || PRODUCT_PLACEHOLDER_IMAGE} alt={first?.productName ?? ''} fill sizes="48px" className="order-thumb-img" />
                        </div>
                        <strong className="order-prod-name">
                          {first?.productName}
                          {order.items.length > 1 ? ` + ${order.items.length - 1} article(s)` : ''}
                        </strong>
                      </div>
                      <div className="order-row-price">
                        <strong>{formatPrice(order.totalAmount)}</strong>
                      </div>
                      <div className="order-row-status">
                        <span className={`order-status-badge ${order.orderStatus === 'CANCELLED' ? 'cancelled' : inProgress ? 'pending' : 'delivered'}`}>
                          {ORDER_STATUS_LABELS[order.orderStatus]}
                        </span>
                      </div>
                      <div className="order-row-actions">
                        {inProgress && order.deliveryMode !== 'PICKUP' ? (
                          <Link href={`/compte/suivi/${encodeURIComponent(order.orderNumber)}`} className="button-pill-pink button-small">
                            Suivre
                          </Link>
                        ) : (
                          <Link href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}`} className="button-pill-outline button-small">
                            Détails
                          </Link>
                        )}
                        {order.orderStatus !== 'CANCELLED' && (
                          <Link
                            href={`/compte/commandes/${encodeURIComponent(order.orderNumber)}/facture`}
                            className="button-pill-outline button-small"
                          >
                            <FileText size={14} color="var(--pink)" /> Facture
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  <p>Vous n&apos;avez pas encore passé de commande.</p>
                  <Link href="/boutique" className="inline-block mt-3 text-xs font-semibold text-[#24582d] underline">
                    Découvrir nos créations florales
                  </Link>
                </div>
              )}
            </div>
          </section>

          <div className="account-lower-row">
            <section className="account-panel dashboard-address-card">
              <div className="account-panel-heading">
                <h2>Mon adresse principale</h2>
                <Link href="/compte/adresses" className="see-all-link">
                  Gérer mes adresses <ArrowRight size={14} />
                </Link>
              </div>
              <div className="default-address-box">
                <div className="address-box-icon">
                  <MapPin size={20} />
                </div>
                <div className="address-box-body">
                  {address ? (
                    <>
                      <div className="address-title-badge">
                        <strong>{address.name}</strong>
                        <span className="badge-default">Par défaut</span>
                      </div>
                      <p className="address-lines">
                        {address.street}
                        <br />
                        {address.city}
                        <br />
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>Tél : {address.phone}</span>
                      </p>
                    </>
                  ) : (
                    <p className="address-lines">
                      Aucune adresse enregistrée.{' '}
                      <Link href="/compte/adresses" style={{ color: 'var(--pink)', textDecoration: 'underline' }}>
                        En ajouter une
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="account-panel dashboard-favorites-card">
              <div className="account-panel-heading">
                <h2>Mes favoris</h2>
                <Link href="/compte/favoris" className="see-all-link">
                  Voir tous <ArrowRight size={14} />
                </Link>
              </div>
              {favoriteItems.length > 0 ? (
                <div className="dashboard-favorites-grid">
                  {favoriteItems.slice(0, 3).map((fav) => (
                    <Link href={`/produits/${fav.slug}`} key={fav.id} className="dashboard-favorite-thumb" aria-label={fav.name}>
                      <Image src={fav.image} alt={fav.name} fill sizes="110px" />
                      <span className="fav-heart-tag">
                        <Heart size={13} fill="var(--pink)" color="var(--pink)" />
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">
                  Aucun favori pour l’instant. <Link href="/boutique" className="underline">Parcourir la boutique</Link>
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
