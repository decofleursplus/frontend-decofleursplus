'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  Crown,
  Gem,
  Percent,
  Truck,
  Sparkles,
  Gift,
  Store,
  Sprout,
  RotateCcw,
  Share2,
  Star,
  Check,
} from 'lucide-react';
import { FacebookIcon, WhatsAppIcon } from '@/components/icons';

const sectionMeta: Record<string, { title: string; description: string }> = {
  adresses: { title: 'Mes adresses', description: 'Gérez les adresses utilisées pour vos livraisons.' },
  informations: { title: 'Mes informations', description: 'Mettez à jour vos coordonnées personnelles.' },
  fidelite: { title: 'Programme de fidélité', description: 'Cumulez des points et profitez d’avantages exclusifs !' },
  avis: { title: 'Mes avis', description: 'Retrouvez les avis laissés sur vos achats.' },
  notifications: { title: 'Mes notifications', description: 'Choisissez comment recevoir les nouvelles de vos commandes.' },
  'cartes-cadeaux': { title: 'Mes cartes cadeaux', description: 'Consultez et gérez vos cartes cadeaux.' },
  coupons: { title: 'Mes coupons et offres', description: 'Retrouvez les offres et bons de réduction associés à votre compte.' },
  parrainage: { title: 'Parrainez vos proches', description: 'Partagez Décofleur Plus avec vos proches et gagnez des récompenses.' },
};

export function AccountSection({ section }: { section: string }) {
  const page = sectionMeta[section];
  const [notice, setNotice] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  if (!page) {
    return (
      <section className="account-panel">
        <h1>Rubrique indisponible</h1>
        <Link href="/compte">Retour au tableau de bord</Link>
      </section>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Vos modifications ont été enregistrées avec succès.');
    setTimeout(() => setNotice(''), 4000);
  }

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCopyReferral = () => {
    const link = 'https://decofleurplus.sn/parrain/fatou-ba-94';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  return (
    <>
      {/* ── FIDÉLITÉ (Conforme Mockup Décofleur Plus UI Dashboard Collage-2.png) ── */}
      {section === 'fidelite' && (
        <div className="fidelity-page-container">
          {/* Header */}
          <div className="fidelity-header-row">
            <div>
              <h1 className="fidelity-page-title">Programme de fidélité</h1>
              <p className="fidelity-page-subtitle">Cumulez des points et profitez d&apos;avantages exclusifs !</p>
            </div>
            <div className="fidelity-header-quote">
              <span className="quote-line-1">Des fleurs, des récompenses</span>
              <span className="quote-line-2">et toujours plus de bonheur !</span>
              <span className="quote-heart">♡</span>
            </div>
          </div>

          {/* Top Grid: Hero Card + 4 Tier Cards */}
          <div className="fidelity-top-grid">
            {/* Left Big Card: Current Status */}
            <div className="fidelity-hero-card">
              <div className="fidelity-hero-body">
                <div className="fidelity-hero-badge">
                  <Crown size={34} className="gold-crown-icon" />
                </div>
                <div className="fidelity-hero-text">
                  <span className="fidelity-hero-uptitle">Votre niveau actuel</span>
                  <h2 className="fidelity-hero-level">Gold</h2>
                  <div className="fidelity-hero-points">28 500 points</div>
                  <p className="fidelity-hero-next">
                    Encore <strong>21 500 points</strong> pour atteindre le niveau <em>Platinum</em>
                  </p>
                </div>
              </div>
              <div className="fidelity-progress-section">
                <div className="fidelity-progress-track">
                  <div className="fidelity-progress-fill" style={{ width: '57%' }} />
                </div>
                <div className="fidelity-progress-label">Prochain niveau : Platinum</div>
              </div>
            </div>

            {/* Right: 4 Tiers */}
            <div className="fidelity-tiers-grid">
              <div className="fidelity-tier-card">
                <div className="tier-icon-wrap bronze">
                  <Crown size={22} />
                </div>
                <h3 className="tier-name">Bronze</h3>
                <span className="tier-points">0 - 10 000 pts</span>
                <strong className="tier-discount">-5%</strong>
              </div>

              <div className="fidelity-tier-card">
                <div className="tier-icon-wrap silver">
                  <Crown size={22} />
                </div>
                <h3 className="tier-name">Silver</h3>
                <span className="tier-points">10 000 - 25 000 pts</span>
                <strong className="tier-discount">-10%</strong>
              </div>

              <div className="fidelity-tier-card active">
                <div className="tier-icon-wrap gold">
                  <Crown size={22} />
                </div>
                <h3 className="tier-name">Gold</h3>
                <span className="tier-points">25 000 - 50 000 pts</span>
                <strong className="tier-discount">-15%</strong>
              </div>

              <div className="fidelity-tier-card">
                <div className="tier-icon-wrap platinum">
                  <Gem size={22} />
                </div>
                <h3 className="tier-name">Platinum</h3>
                <span className="tier-points">50 000+ pts</span>
                <strong className="tier-discount">-20%</strong>
              </div>
            </div>
          </div>

          {/* Middle: Vos avantages Gold */}
          <div className="fidelity-advantages-box">
            <h2 className="fidelity-section-title">Vos avantages Gold</h2>
            <div className="fidelity-benefits-row">
              <div className="fidelity-benefit-item">
                <div className="benefit-icon-circle">
                  <Percent size={18} />
                </div>
                <div className="benefit-desc">
                  <strong>-15%</strong>
                  <span>sur tous les produits</span>
                </div>
              </div>

              <div className="fidelity-benefit-item">
                <div className="benefit-icon-circle">
                  <Truck size={18} />
                </div>
                <div className="benefit-desc">
                  <strong>Livraison prioritaire</strong>
                  <span>à Saly & Mbour</span>
                </div>
              </div>

              <div className="fidelity-benefit-item">
                <div className="benefit-icon-circle">
                  <Sparkles size={18} />
                </div>
                <div className="benefit-desc">
                  <strong>Offres exclusives</strong>
                  <span>membres Gold</span>
                </div>
              </div>

              <div className="fidelity-benefit-item">
                <div className="benefit-icon-circle">
                  <Gift size={18} />
                </div>
                <div className="benefit-desc">
                  <strong>Cadeau d&apos;anniversaire</strong>
                  <span>spécial</span>
                </div>
              </div>

              <div className="fidelity-benefit-item">
                <div className="benefit-icon-circle">
                  <Store size={18} />
                </div>
                <div className="benefit-desc">
                  <strong>Accès aux ventes</strong>
                  <span>privées</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Columns: Historique + Coupons + Parrainage */}
          <div className="fidelity-bottom-grid">
            {/* Col 1: Historique de vos points */}
            <div className="fidelity-card-panel">
              <div className="fidelity-card-header">
                <h3>Historique de vos points</h3>
                <button type="button" className="fidelity-link-more">Voir tous →</button>
              </div>
              <div className="points-history-list">
                <div className="points-history-row">
                  <div className="points-badge green">
                    <Sprout size={16} />
                  </div>
                  <div className="points-info">
                    <strong className="points-val positive">+ 250 points</strong>
                    <span className="points-meta">Commande #DFP-2024-00158</span>
                  </div>
                  <span className="points-date">12 Mai 2024</span>
                </div>

                <div className="points-history-row">
                  <div className="points-badge green">
                    <Sprout size={16} />
                  </div>
                  <div className="points-info">
                    <strong className="points-val positive">+ 180 points</strong>
                    <span className="points-meta">Commande #DFP-2024-00157</span>
                  </div>
                  <span className="points-date">08 Mai 2024</span>
                </div>

                <div className="points-history-row">
                  <div className="points-badge green">
                    <Sprout size={16} />
                  </div>
                  <div className="points-info">
                    <strong className="points-val positive">+ 300 points</strong>
                    <span className="points-meta">Commande #DFP-2024-00156</span>
                  </div>
                  <span className="points-date">02 Mai 2024</span>
                </div>

                <div className="points-history-row">
                  <div className="points-badge red">
                    <RotateCcw size={16} />
                  </div>
                  <div className="points-info">
                    <strong className="points-val negative">- 500 points</strong>
                    <span className="points-meta">Utilisation bon de réduction</span>
                  </div>
                  <span className="points-date">28 Avr 2024</span>
                </div>
              </div>
            </div>

            {/* Col 2: Mes coupons et offres */}
            <div className="fidelity-card-panel">
              <div className="fidelity-card-header">
                <h3>Mes coupons et offres</h3>
                <button type="button" className="fidelity-link-more">Voir tous →</button>
              </div>
              <div className="fidelity-coupons-grid">
                {/* Pink coupon */}
                <div className="fidelity-coupon-card pink-theme">
                  <strong className="coupon-big-title">-15%</strong>
                  <span className="coupon-sub-text">Sur votre prochaine commande</span>
                  <small className="coupon-date-text">Valable jusqu&apos;au 30 Juin 2024</small>
                  <button
                    type="button"
                    className="coupon-action-btn pink-btn"
                    onClick={() => handleCopyCode('GOLD15')}
                  >
                    {copiedCode === 'GOLD15' ? 'Copié !' : 'Utiliser ce code'}
                  </button>
                  <div className="coupon-dashed-code pink-code">GOLD15</div>
                </div>

                {/* Green coupon */}
                <div className="fidelity-coupon-card green-theme">
                  <strong className="coupon-big-title green-text">Livraison gratuite</strong>
                  <span className="coupon-sub-text">À partir de 25 000 FCFA</span>
                  <small className="coupon-date-text">Valable jusqu&apos;au 30 Juin 2024</small>
                  <button
                    type="button"
                    className="coupon-action-btn green-btn"
                    onClick={() => handleCopyCode('LIVRAISON')}
                  >
                    {copiedCode === 'LIVRAISON' ? 'Copié !' : 'Utiliser ce code'}
                  </button>
                  <div className="coupon-dashed-code green-code">LIVRAISON</div>
                </div>
              </div>
            </div>

            {/* Col 3: Parrainez vos proches */}
            <div className="fidelity-card-panel referral-card-panel">
              <div className="fidelity-card-header">
                <h3>Parrainez vos proches</h3>
              </div>
              <p className="referral-promo-text">
                Offrez <strong>5 000 FCFA</strong> à vos amis et recevez <strong>5 000 points</strong> pour chaque parrainage !
              </p>
              <div className="referral-input-wrapper">
                <input
                  type="text"
                  readOnly
                  value="https://decofleurplus.sn/parrain/fatou-ba-94"
                  className="referral-url-field"
                />
                <button
                  type="button"
                  className="referral-copy-button"
                  onClick={handleCopyReferral}
                >
                  {copiedReferral ? <Check size={14} /> : null}
                  {copiedReferral ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <div className="referral-social-buttons">
                <a
                  href="https://wa.me/?text=Rejoins-moi%20sur%20D%C3%A9cofleur%20Plus%20!%20https://decofleurplus.sn/parrain/fatou-ba-94"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="referral-circle-btn wa"
                  aria-label="Partager sur WhatsApp"
                >
                  <WhatsAppIcon size={20} />
                </a>
                <a
                  href="https://facebook.com/sharer/sharer.php?u=https://decofleurplus.sn/parrain/fatou-ba-94"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="referral-circle-btn fb"
                  aria-label="Partager sur Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
                <button
                  type="button"
                  className="referral-circle-btn share"
                  onClick={handleCopyReferral}
                  aria-label="Partager le lien"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MES ADRESSES ── */}
      {section === 'adresses' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="address-preview">
            <b>
              Adresse principale — Maison Saly <span>Par défaut</span>
            </b>
            Route de la Plage, Résidence les Palmiers
            <br />
            Saly Portudal, Mbour · Sénégal
            <br />
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Tél : +221 77 123 45 67</span>
          </div>
          <form className="account-form" onSubmit={submit} style={{ marginTop: '20px' }}>
            <h2>Ajouter une nouvelle adresse</h2>
            <label>
              Nom de l’adresse (ex. Bureau, Villa Saly...)
              <input required placeholder="Maison, Bureau, Villa..." />
            </label>
            <label>
              Adresse complète
              <input required autoComplete="street-address" placeholder="Rue, numéro, repères..." />
            </label>
            <div className="checkout-fields">
              <label>
                Ville
                <input required defaultValue="Saly Portudal" />
              </label>
              <label>
                Téléphone de livraison
                <input required inputMode="tel" defaultValue="+221 77 123 45 67" />
              </label>
            </div>
            <button className="button button-primary" type="submit">
              Enregistrer cette adresse
            </button>
            {notice && <p className="success-note" role="status">{notice}</p>}
          </form>
        </section>
      )}

      {/* ── MES INFORMATIONS ── */}
      {section === 'informations' && (
        <form className="account-panel account-form" onSubmit={submit}>
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="checkout-fields">
            <label>
              Prénom
              <input autoComplete="given-name" defaultValue="Fatou" required />
            </label>
            <label>
              Nom
              <input autoComplete="family-name" defaultValue="Ba" required />
            </label>
            <label>
              Adresse e-mail
              <input type="email" autoComplete="email" defaultValue="fatou.ba@email.com" required />
            </label>
            <label>
              Téléphone mobile
              <input inputMode="tel" autoComplete="tel" defaultValue="+221 77 123 45 67" required />
            </label>
          </div>
          <button className="button button-primary" type="submit">
            Enregistrer les modifications
          </button>
          {notice && <p className="success-note" role="status">{notice}</p>}
        </form>
      )}

      {/* ── MES AVIS ── */}
      {section === 'avis' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="demo-orders">
            <div className="demo-order">
              <div className="demo-order-name">
                <Star size={24} color="#F6A811" fill="#F6A811" />
                <div>
                  <strong>Bouquet Élégance Rose</strong>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                    Avis posté le 14 Mai 2024 · ★★★★★ (5/5)
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#444' }}>
                    « Fleurs ultra fraîches livrées en avance à Saly, emballage magnifique. Bravo Décofleur Plus ! »
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NOTIFICATIONS ── */}
      {section === 'notifications' && (
        <form className="account-panel notification-options" onSubmit={submit}>
          <div className="account-title-row" style={{ width: '100%' }}>
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '12px', width: '100%', marginBottom: '16px' }}>
            <label>
              <input type="checkbox" defaultChecked /> Notifications SMS (mises à jour de commande en temps réel)
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Mises à jour WhatsApp (contact livreur et lien de suivi en direct)
            </label>
            <label>
              <input type="checkbox" defaultChecked /> E-mails de confirmation et factures PDF
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Offres exclusives membres Gold et ventes privées
            </label>
          </div>
          <button className="button button-primary" type="submit">
            Enregistrer mes préférences
          </button>
          {notice && <p className="success-note" role="status">{notice}</p>}
        </form>
      )}

      {/* ── CARTES CADEAUX ── */}
      {section === 'cartes-cadeaux' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="fidelity-coupon-card pink-theme" style={{ maxWidth: '420px', margin: '20px 0' }}>
            <strong className="coupon-big-title">25 000 FCFA</strong>
            <span className="coupon-sub-text">Carte Cadeau Décofleur Plus</span>
            <small className="coupon-date-text">Valable sans limite de durée sur tout le site</small>
            <div className="coupon-dashed-code pink-code" style={{ marginTop: '12px' }}>
              CADEAU-DFP-2024
            </div>
          </div>
          <Link className="button button-outline" href="/cadeaux">
            Offrir une nouvelle carte cadeau
          </Link>
        </section>
      )}

      {/* ── COUPONS ── */}
      {section === 'coupons' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="fidelity-coupons-grid" style={{ maxWidth: '640px', marginTop: '16px' }}>
            <div className="fidelity-coupon-card pink-theme">
              <strong className="coupon-big-title">-15%</strong>
              <span className="coupon-sub-text">Sur votre prochaine commande</span>
              <small className="coupon-date-text">Valable jusqu&apos;au 30 Juin 2024</small>
              <button
                type="button"
                className="coupon-action-btn pink-btn"
                onClick={() => handleCopyCode('GOLD15')}
              >
                {copiedCode === 'GOLD15' ? 'Copié !' : 'Utiliser ce code'}
              </button>
              <div className="coupon-dashed-code pink-code">GOLD15</div>
            </div>

            <div className="fidelity-coupon-card green-theme">
              <strong className="coupon-big-title green-text">Livraison gratuite</strong>
              <span className="coupon-sub-text">À partir de 25 000 FCFA</span>
              <small className="coupon-date-text">Valable jusqu&apos;au 30 Juin 2024</small>
              <button
                type="button"
                className="coupon-action-btn green-btn"
                onClick={() => handleCopyCode('LIVRAISON')}
              >
                {copiedCode === 'LIVRAISON' ? 'Copié !' : 'Utiliser ce code'}
              </button>
              <div className="coupon-dashed-code green-code">LIVRAISON</div>
            </div>
          </div>
        </section>
      )}

      {/* ── PARRAINAGE ── */}
      {section === 'parrainage' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>
          <div className="referral-card-panel" style={{ maxWidth: '520px', marginTop: '16px' }}>
            <p className="referral-promo-text">
              Offrez <strong>5 000 FCFA</strong> à vos amis et recevez <strong>5 000 points</strong> pour chaque parrainage !
            </p>
            <div className="referral-input-wrapper">
              <input
                type="text"
                readOnly
                value="https://decofleurplus.sn/parrain/fatou-ba-94"
                className="referral-url-field"
              />
              <button
                type="button"
                className="referral-copy-button"
                onClick={handleCopyReferral}
              >
                {copiedReferral ? <Check size={14} /> : null}
                {copiedReferral ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="referral-social-buttons">
              <a
                href="https://wa.me/?text=Rejoins-moi%20sur%20D%C3%A9cofleur%20Plus%20!%20https://decofleurplus.sn/parrain/fatou-ba-94"
                target="_blank"
                rel="noopener noreferrer"
                className="referral-circle-btn wa"
                aria-label="Partager sur WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </a>
              <a
                href="https://facebook.com/sharer/sharer.php?u=https://decofleurplus.sn/parrain/fatou-ba-94"
                target="_blank"
                rel="noopener noreferrer"
                className="referral-circle-btn fb"
                aria-label="Partager sur Facebook"
              >
                <FacebookIcon size={20} />
              </a>
              <button
                type="button"
                className="referral-circle-btn share"
                onClick={handleCopyReferral}
                aria-label="Partager le lien"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
