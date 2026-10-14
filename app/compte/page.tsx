import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Heart,
  MapPin,
  PackageCheck,
  Star,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { demoOrders } from '@/lib/account-data';
import { formatPrice } from '@/lib/products';

export default function AccountDashboard() {
  return (
    <div className="account-dashboard-wrapper">
      {/* Title Header */}
      <div className="account-title-row">
        <div>
          <h1 className="account-title">Mon compte</h1>
          <p className="account-intro">
            Bienvenue Fatou ! Voici un aperçu de votre espace personnel.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <section className="account-stats-row" aria-label="Statistiques du compte">
        <div className="account-stat-card">
          <div className="stat-icon-wrap stat-orders">
            <PackageCheck size={20} />
          </div>
          <div className="stat-text-wrap">
            <strong className="stat-number">12</strong>
            <span className="stat-label">Commandes</span>
          </div>
        </div>

        <div className="account-stat-card">
          <div className="stat-icon-wrap stat-points">
            <Star size={20} />
          </div>
          <div className="stat-text-wrap">
            <strong className="stat-number">28 500</strong>
            <span className="stat-label">Points fidélité</span>
          </div>
        </div>

        <div className="account-stat-card">
          <div className="stat-icon-wrap stat-level">
            <Crown size={20} />
          </div>
          <div className="stat-text-wrap">
            <strong className="stat-number gold-color">Gold</strong>
            <span className="stat-label">Votre niveau</span>
          </div>
        </div>

        <div className="account-stat-card">
          <div className="stat-icon-wrap stat-addresses">
            <MapPin size={20} />
          </div>
          <div className="stat-text-wrap">
            <strong className="stat-number">3</strong>
            <span className="stat-label">Adresses enregistrées</span>
          </div>
        </div>
      </section>

      {/* Mes dernières commandes */}
      <section className="account-panel dashboard-orders-panel">
        <div className="account-panel-heading">
          <h2>Mes dernières commandes</h2>
          <Link href="/compte/commandes" className="see-all-link">
            Voir toutes mes commandes <ArrowRight size={14} />
          </Link>
        </div>

        <div className="dashboard-orders-list">
          {demoOrders.map((order) => {
            const isEnCours = order.status === 'En cours';
            const item = order.items?.[0] ?? {
              name: order.name,
              price: order.price,
              image: '/images/hero.jpg',
            };

            return (
              <div key={order.id} className="dashboard-order-row">
                <div className="order-row-id-date">
                  <span className="order-id">#{order.id}</span>
                  <span className="order-date">{order.date}</span>
                </div>

                <div className="order-row-product">
                  <div className="order-row-thumb">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="order-thumb-img"
                    />
                  </div>
                  <strong className="order-prod-name">{item.name}</strong>
                </div>

                <div className="order-row-price">
                  <strong>{formatPrice(order.price)}</strong>
                </div>

                <div className="order-row-status">
                  <span className={`order-status-badge ${isEnCours ? 'pending' : 'delivered'}`}>
                    {isEnCours ? 'En cours' : 'Livrée'}
                  </span>
                </div>

                <div className="order-row-actions">
                  {isEnCours ? (
                    <Link
                      href={`/compte/suivi/${order.id}`}
                      className="button-pill-pink button-small"
                    >
                      Suivre
                    </Link>
                  ) : (
                    <Link
                      href={`/compte/commandes/${order.id}`}
                      className="button-pill-outline button-small"
                    >
                      Voir les détails
                    </Link>
                  )}
                  <button type="button" className="button-pill-outline button-small">
                    <FileText size={14} color="var(--pink)" /> Facture PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Mes adresses & Mes favoris */}
      <div className="account-lower-row">
        {/* Mes adresses */}
        <section className="account-panel dashboard-address-card">
          <div className="account-panel-heading">
            <h2>Mes adresses</h2>
            <Link href="/compte/adresses" className="see-all-link">
              Gérer mes adresses <ArrowRight size={14} />
            </Link>
          </div>

          <div className="default-address-box">
            <div className="address-box-icon">
              <MapPin size={20} />
            </div>
            <div className="address-box-body">
              <div className="address-title-badge">
                <strong>Maison - Saly</strong>
                <span className="badge-default">Par défaut</span>
              </div>
              <p className="address-lines">
                Route de Saly, Résidence les Palmiers<br />
                Saly, Mbour - Sénégal
              </p>
            </div>
          </div>
        </section>

        {/* Mes favoris */}
        <section className="account-panel dashboard-favorites-card">
          <div className="account-panel-heading">
            <h2>Mes favoris</h2>
            <Link href="/favoris" className="see-all-link">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-favorites-grid">
            {[
              { name: 'Bouquet Élégance Rose', image: '/images/hero.jpg' },
              { name: 'Plante Monstera', image: '/images/plante-monstera.jpg' },
              { name: 'Bouquet Blanc', image: '/images/bouquet-blanc.jpg' },
            ].map((fav, i) => (
              <Link href="/favoris" key={i} className="dashboard-favorite-thumb">
                <Image src={fav.image} alt={fav.name} fill sizes="110px" />
                <span className="fav-heart-tag">
                  <Heart size={13} fill="var(--pink)" color="var(--pink)" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
