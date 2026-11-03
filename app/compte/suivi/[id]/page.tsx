'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Loader2,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { demoOrders } from '@/lib/account-data';
import { formatPrice } from '@/lib/products';
import { getOrderTracking, getMyOrder, DeliveryTracking, CustomerOrder } from '@/lib/api/orders';

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [liveOrder, setLiveOrder] = useState<CustomerOrder | null>(null);
  const [liveTracking, setLiveTracking] = useState<DeliveryTracking | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo order
  const demoOrder = demoOrders.find((item) => item.id === id) || demoOrders[0];

  useEffect(() => {
    let active = true;

    async function loadTrackingData() {
      try {
        const [ord, trk] = await Promise.all([
          getMyOrder(id).catch(() => null),
          getOrderTracking(id).catch(() => null),
        ]);

        if (active) {
          if (ord) setLiveOrder(ord);
          if (trk) setLiveTracking(trk);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrackingData();
    return () => {
      active = false;
    };
  }, [id]);

  const orderNumber = liveOrder?.orderNumber || liveTracking?.orderNumber || id;
  const isEnCours = liveOrder
    ? ['PENDING', 'PAID', 'PREPARING', 'READY', 'IN_DELIVERY'].includes(liveOrder.orderStatus)
    : demoOrder.status === 'En cours';

  const orderItems = liveOrder
    ? liveOrder.items.map((it) => ({
        name: it.productName,
        quantity: it.quantity,
        price: it.totalPrice,
        image: it.image || '/images/hero.jpg',
      }))
    : demoOrder.items ?? [
        { name: demoOrder.name, quantity: 1, price: demoOrder.price, image: '/images/hero.jpg' },
      ];

  const subtotal = liveOrder ? liveOrder.subtotal : demoOrder.subtotal ?? demoOrder.price;
  const shipping = liveOrder ? liveOrder.deliveryFee : demoOrder.shipping ?? 2000;
  const total = liveOrder ? liveOrder.totalAmount : demoOrder.total ?? subtotal + shipping;

  const driver = liveTracking?.driver
    ? {
        name: liveTracking.driver.name,
        role: 'Votre livreur',
        rating: 4.9,
        reviews: 42,
        phone: liveTracking.driver.phone,
        eta: liveTracking.timeSlot || 'entre 13h30 et 14h00',
        etaMinutes: 15,
      }
    : demoOrder.driver ?? {
        name: 'Moussa Ndiaye',
        role: 'Votre livreur',
        rating: 4.8,
        reviews: 128,
        phone: '+221779417860',
        eta: 'entre 13h30 et 14h00',
        etaMinutes: 12,
      };

  const deliveryAddress =
    liveTracking?.deliveryAddress || liveOrder?.deliveryAddress || 'Route de Saly, Résidence les Palmiers, Saly';

  // Déterminer l'état des étapes
  const steps = liveTracking?.steps;
  const prepDone = steps ? steps.find((s) => s.step === 'preparation')?.completed : true;
  const pickupDone = steps ? steps.find((s) => s.step === 'prise_en_charge')?.completed : true;
  const deliveryDone = steps ? steps.find((s) => s.step === 'en_acheminement')?.completed : isEnCours;
  const finalDone = steps
    ? steps.find((s) => s.step === 'livre')?.completed
    : liveOrder?.orderStatus === 'DELIVERED';

  return (
    <div className="track-order-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span>›</span>
        <Link href="/compte/commandes">Mes commandes</Link>
        <span>›</span>
        <span>Commande #{orderNumber}</span>
      </nav>

      {/* Header with Title and Actions */}
      <div className="track-header-row">
        <div>
          <h1 className="account-title">Suivi de commande</h1>
          <p className="order-meta-sub">
            Commande n° <strong>#{orderNumber}</strong> •{' '}
            {liveOrder
              ? `Passée le ${new Date(liveOrder.createdAt).toLocaleDateString('fr-FR')}`
              : `Passée le ${demoOrder.date} à 14h23`}
          </p>
        </div>
        <div className="track-header-actions">
          <Link href="/contact" className="button-pill-outline button-small">
            <Headphones size={15} /> Contacter le support
          </Link>
          <Link href="/compte/commandes" className="button-pill-pink button-small">
            Retour aux commandes
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
          <Loader2 size={14} className="animate-spin" />
          <span>Synchronisation du suivi en direct avec l’atelier...</span>
        </div>
      )}

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
            <span className="step-time">
              {liveOrder ? new Date(liveOrder.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '14h23'}
            </span>
          </div>

          {/* Step 2 */}
          <div className={`stepper-step ${prepDone ? 'completed' : 'pending'}`}>
            <div className="step-circle">
              <Package size={16} />
            </div>
            <strong className="step-label">Préparation en atelier</strong>
            <span className="step-time">{prepDone ? 'Terminée' : 'En cours'}</span>
          </div>

          {/* Step 3 */}
          <div className={`stepper-step ${deliveryDone ? (finalDone ? 'completed' : 'active') : 'pending'}`}>
            <div className="step-circle">
              <Truck size={16} />
            </div>
            <strong className="step-label">En livraison</strong>
            <span className="step-time">{deliveryDone ? 'En route' : 'En attente'}</span>
          </div>

          {/* Step 4 */}
          <div className={`stepper-step ${finalDone ? 'completed' : 'pending'}`}>
            <div className="step-circle">
              <Home size={16} />
            </div>
            <strong className="step-label">Livrée</strong>
            <span className="step-time">
              {finalDone ? 'Livrée' : 'Prévue aujourd’hui'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Left Column & Right Details Column */}
      <div className="track-columns-grid">
        {/* Left Column: Live Status & Map */}
        <div className="track-left-col">
          <section className="account-panel track-status-card">
            <div className="status-banner-header">
              <div className="status-vehicle-icon">
                <Truck size={24} />
              </div>
              <div className="status-banner-text">
                <h2>
                  {finalDone
                    ? 'Votre commande a été livrée !'
                    : isEnCours
                    ? 'Votre commande est en livraison'
                    : 'Commande enregistrée'}
                </h2>
                <p>
                  {finalDone
                    ? 'Merci de votre confiance en Décofleur Plus Saly Portudal.'
                    : 'Notre livreur achemine votre bouquet frais avec soin.'}
                </p>
              </div>
            </div>

            <div className="eta-badge-wrap">
              <span className="eta-badge-pill">
                Créneau : {liveTracking?.timeSlot || driver.eta}
              </span>
            </div>

            {/* Courier Card */}
            <div className="courier-card">
              <div className="courier-avatar">
                <span>{driver.name.slice(0, 2).toUpperCase()}</span>
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
                <span>Le livreur est en route vers votre adresse</span>
              </div>
              <div className="map-destination-tag">
                <MapPin size={15} />
                <span>{deliveryAddress}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Details */}
        <div className="track-right-col">
          <section className="account-panel track-recap-card">
            <h3>Détails de la commande</h3>

            <div className="track-recap-items">
              {orderItems.map((item, index) => (
                <div key={index} className="track-recap-item">
                  <div className="recap-item-image">
                    <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-lg object-cover" />
                  </div>
                  <div className="recap-item-info">
                    <strong>{item.name}</strong>
                    <span>Quantité : {item.quantity}</span>
                  </div>
                  <strong className="recap-item-price">{formatPrice(item.price)}</strong>
                </div>
              ))}
            </div>

            <div className="track-totals-breakdown">
              <div className="totals-row">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Frais de livraison</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="totals-row total-highlight">
                <strong>Total payé</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <div className="track-address-card">
              <div className="track-address-icon">
                <MapPin size={18} />
              </div>
              <div className="track-address-info">
                <strong>Adresse de livraison</strong>
                <p>{deliveryAddress}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
