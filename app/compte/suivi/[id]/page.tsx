import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Check,
  Package,
  Truck,
  Home,
  FileText,
  Headphones,
  Phone,
  Star,
  MapPin,
  Mail,
  Smartphone,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { demoOrders } from '@/lib/account-data';
import { formatPrice } from '@/lib/products';

export const dynamicParams = false;
export function generateStaticParams() {
  return demoOrders.map(({ id }) => ({ id }));
}

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = demoOrders.find((item) => item.id === id);
  if (!order) notFound();

  const isEnCours = order.status === 'En cours';
  const orderItems = order.items ?? [
    { name: order.name, quantity: 1, price: order.price, image: '/images/hero.jpg' },
  ];
  const subtotal = order.subtotal ?? order.price;
  const shipping = order.shipping ?? 2000;
  const total = order.total ?? subtotal + shipping;
  const driver = order.driver ?? {
    name: 'Moussa Ndiaye',
    role: 'Votre livreur',
    rating: 4.8,
    reviews: 128,
    phone: '+221779417860',
    eta: 'entre 13h30 et 14h00',
    etaMinutes: 12,
  };

  return (
    <div className="track-order-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span>›</span>
        <Link href="/compte/commandes">Mes commandes</Link>
        <span>›</span>
        <span>Commande #{order.id}</span>
      </nav>

      {/* Header with Title and Actions */}
      <div className="track-header-row">
        <div>
          <h1 className="account-title">Suivi de commande</h1>
          <p className="order-meta-sub">
            Commande n° <strong>#{order.id}</strong> • Passée le {order.date} à 14h23
          </p>
        </div>
        <div className="track-header-actions">
          <button type="button" className="button-pill-outline button-small">
            <FileText size={15} color="var(--pink)" /> Facture PDF
          </button>
          <Link href="/contact" className="button-pill-outline button-small">
            <Headphones size={15} /> Contacter le support
          </Link>
          <Link href="/compte/commandes" className="button-pill-pink button-small">
            Retour aux commandes
          </Link>
        </div>
      </div>

      {/* 4-step Stepper Card */}
      <section className="track-stepper-card" aria-label="Étapes de la commande">
        <div className="stepper-track-line" />
        <div className="stepper-steps-grid">
          {/* Step 1 */}
          <div className="stepper-step completed">
            <div className="step-circle">
              <Check size={16} />
            </div>
            <strong className="step-label">Commande confirmée</strong>
            <span className="step-time">08 Mai - 14h23</span>
          </div>

          {/* Step 2 */}
          <div className="stepper-step completed">
            <div className="step-circle">
              <Package size={16} />
            </div>
            <strong className="step-label">Préparation en cours</strong>
            <span className="step-time">08 Mai - 16h10</span>
          </div>

          {/* Step 3 */}
          <div className={`stepper-step ${isEnCours ? 'active' : 'completed'}`}>
            <div className="step-circle">
              <Truck size={16} />
            </div>
            <strong className="step-label">En livraison</strong>
            <span className="step-time">09 Mai - 10h15</span>
          </div>

          {/* Step 4 */}
          <div className={`stepper-step ${order.status === 'Livrée' ? 'completed' : 'pending'}`}>
            <div className="step-circle">
              <Home size={16} />
            </div>
            <strong className="step-label">Livrée</strong>
            <span className="step-time">
              {order.status === 'Livrée' ? 'Livrée' : 'Prévue aujourd’hui avant 14h00'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Left Column & Right Details Column */}
      <div className="track-columns-grid">
        {/* Left Column: Live Status & Map & Notification Preferences */}
        <div className="track-left-col">
          {/* Delivery Live Status Card */}
          <section className="account-panel track-status-card">
            <div className="status-banner-header">
              <div className="status-vehicle-icon">
                <Truck size={24} />
              </div>
              <div className="status-banner-text">
                <h2>Votre commande est en livraison</h2>
                <p>Notre livreur est en route vers votre adresse.</p>
              </div>
            </div>

            <div className="eta-badge-wrap">
              <span className="eta-badge-pill">
                Arrivée estimée : entre 13h30 et 14h00
              </span>
            </div>

            {/* Courier Card */}
            <div className="courier-card">
              <div className="courier-avatar">
                <span>MN</span>
              </div>
              <div className="courier-details">
                <strong>{driver.name}</strong>
                <span className="courier-role">{driver.role}</span>
                <div className="courier-rating">
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span>{driver.rating}</span>
                  <small>({driver.reviews} avis)</small>
                </div>
              </div>
              <div className="courier-actions">
                <a
                  href={`tel:${driver.phone}`}
                  className="courier-action-circle phone"
                  aria-label={`Appeler ${driver.name}`}
                  title="Appeler"
                >
                  <Phone size={17} />
                </a>
                <a
                  href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="courier-action-circle whatsapp"
                  aria-label={`Écrire à ${driver.name} sur WhatsApp`}
                  title="WhatsApp"
                >
                  <WhatsAppIcon size={18} />
                </a>
              </div>
            </div>

            {/* Live Map Representation */}
            <div className="track-map-wrapper">
              <Image
                src="/images/order-map.jpg"
                alt="Itinéraire en direct Saly et Mbour"
                fill
                className="track-map-image"
                sizes="(max-width: 900px) 100vw, 650px"
              />
              <div className="map-courier-bubble">
                <Truck size={14} />
                <span>Le livreur est à {driver.etaMinutes} minutes de votre adresse</span>
              </div>
              <div className="map-destination-tag">
                <MapPin size={15} />
                <span>Votre adresse</span>
              </div>
            </div>
          </section>

          {/* Notification Preferences Card */}
          <section className="account-panel notification-pref-card">
            <h3>Préférences de notification</h3>
            <p className="pref-subtext">
              Recevez les mises à jour de votre commande selon vos préférences.
            </p>
            <div className="pref-checkboxes-grid">
              <label className="pref-check-box checked">
                <input type="checkbox" defaultChecked />
                <div className="pref-icon">
                  <Smartphone size={18} />
                </div>
                <div className="pref-text">
                  <strong>SMS</strong>
                  <span>+221 77 123 45 67</span>
                </div>
                <Check size={16} className="pref-check-icon" />
              </label>

              <label className="pref-check-box checked">
                <input type="checkbox" defaultChecked />
                <div className="pref-icon whatsapp-color">
                  <WhatsAppIcon size={18} />
                </div>
                <div className="pref-text">
                  <strong>WhatsApp</strong>
                  <span>+221 77 123 45 67</span>
                </div>
                <Check size={16} className="pref-check-icon" />
              </label>

              <label className="pref-check-box">
                <input type="checkbox" />
                <div className="pref-icon">
                  <Mail size={18} />
                </div>
                <div className="pref-text">
                  <strong>Email</strong>
                  <span>fatou.ba@email.com</span>
                </div>
                <Check size={16} className="pref-check-icon" />
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Details */}
        <aside className="account-panel track-details-sidebar">
          <div className="details-header">
            <h3>Détails de la commande</h3>
            <span className="status-pill-delivery">
              {isEnCours ? 'En livraison' : order.status}
            </span>
          </div>

          <div className="details-products-list">
            {orderItems.map((item, idx) => (
              <div key={idx} className="details-product-row">
                <div className="details-thumb-wrap">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="details-thumb-img"
                  />
                </div>
                <div className="details-product-meta">
                  <strong>{item.name}</strong>
                  <span className="details-product-qty">Quantité : {item.quantity}</span>
                  <span className="details-product-price">{formatPrice(item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="details-summary-breakdown">
            <div className="breakdown-row">
              <span>Sous-total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="breakdown-row">
              <span>Livraison (Saly)</span>
              <strong>{formatPrice(shipping)}</strong>
            </div>
            <div className="breakdown-row total-highlight">
              <span>Total</span>
              <strong className="pink-total-value">{formatPrice(total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
