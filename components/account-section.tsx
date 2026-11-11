'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  Lock,
  Loader2,
  Calendar,
  Pause,
  Play,
  XCircle,
  Bell,
  Inbox,
  CheckCheck,
  CheckCircle2,
} from 'lucide-react';
import { FacebookIcon, WhatsAppIcon } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  CustomerProfile,
  CustomerAddress,
} from '@/lib/api/customer';
import { getMyQuotes, QuoteItem } from '@/lib/api/quotes';
import {
  getMySubscriptions,
  pauseMySubscription,
  resumeMySubscription,
  cancelMySubscription,
  CustomerSubscription,
} from '@/lib/api/subscriptions';

const sectionMeta: Record<string, { title: string; description: string }> = {
  abonnements: { title: 'Mes abonnements floraux', description: 'Gérez vos formules florales hebdomadaires et bimensuelles avec livraison automatique à Saly et Petite Côte.' },
  devis: { title: 'Mes devis événementiels', description: 'Consultez et suivez l’état de vos demandes de scénographie et devis sur mesure.' },
  adresses: { title: 'Mes adresses', description: 'Gérez les adresses utilisées pour vos livraisons.' },
  informations: { title: 'Mes informations', description: 'Mettez à jour vos coordonnées personnelles.' },
  fidelite: { title: 'Programme de fidélité', description: 'Cumulez des points et profitez d’avantages exclusifs !' },
  avis: { title: 'Mes avis', description: 'Retrouvez les avis laissés sur vos achats.' },
  notifications: { title: 'Mes notifications', description: 'Consultez l’historique de vos alertes, suivis de commande et messages.' },
  'cartes-cadeaux': { title: 'Mes cartes cadeaux', description: 'Consultez et gérez vos cartes cadeaux.' },
  coupons: { title: 'Mes coupons et offres', description: 'Retrouvez les offres et bons de réduction associés à votre compte.' },
  parrainage: { title: 'Parrainez vos proches', description: 'Partagez Décofleur Plus avec vos proches et gagnez des récompenses.' },
};

export function AccountSection({ section }: { section: string }) {
  const page = sectionMeta[section];
  const { user, updateUser } = useAuth();
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Profil client
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Adresses
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Saly Portudal');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrDefault, setNewAddrDefault] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Devis
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Abonnements floraux
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Notifications Client (Boîte de réception)
  const [clientNotifications, setClientNotifications] = useState([
    {
      id: 'cl-1',
      type: 'DELIVERY_UPDATE',
      title: 'Votre commande CMD-2026-0042 est en cours de livraison',
      message: 'Votre livreur Abdou est en route vers les Almadies. Livraison estimée vers 14h30.',
      isRead: false,
      createdAt: 'Il y a 25 min',
      orderNumber: 'CMD-2026-0042',
    },
    {
      id: 'cl-2',
      type: 'PAYMENT',
      title: 'Paiement Wave validé avec succès',
      message: 'Votre règlement de 45 000 FCFA pour la commande CMD-2026-0042 a été confirmé.',
      isRead: false,
      createdAt: 'Il y a 2h',
      orderNumber: 'CMD-2026-0042',
    },
    {
      id: 'cl-3',
      type: 'LOYALTY',
      title: 'Félicitations ! 450 points fidélité crédités',
      message: 'Votre statut Gold est actif. Vous bénéficiez de -10% avec votre code fidélité.',
      isRead: true,
      createdAt: 'Hier',
      orderNumber: null,
    },
    {
      id: 'cl-4',
      type: 'SUBSCRIPTION',
      title: 'Rappel pour votre prochain bouquet d’abonnement',
      message: 'Votre livraison de roses fraîches à la villa de Saly est prévue ce vendredi matin.',
      isRead: true,
      createdAt: 'Il y a 3 jours',
      orderNumber: null,
    },
  ]);

  // Chargement des données selon la section active
  useEffect(() => {
    let active = true;

    async function loadData() {
      if (section === 'informations' || section === 'fidelite') {
        try {
          setProfileLoading(true);
          const p = await getCustomerProfile();
          if (active && p) {
            setProfile(p);
            setFirstName(p.firstName || '');
            setLastName(p.lastName || '');
            setPhone(p.phone || '');
            setEmail(p.email || '');
          }
        } catch {
          if (active && user) {
            const parts = (user.name || '').split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
          }
        } finally {
          if (active) setProfileLoading(false);
        }
      }

      if (section === 'adresses') {
        try {
          setAddressesLoading(true);
          const addrs = await getCustomerAddresses();
          if (active) setAddresses(addrs || []);
        } catch {
          // ignore
        } finally {
          if (active) setAddressesLoading(false);
        }
      }

      if (section === 'devis') {
        try {
          setQuotesLoading(true);
          const q = await getMyQuotes();
          if (active) setQuotes(q || []);
        } catch {
          // ignore
        } finally {
          if (active) setQuotesLoading(false);
        }
      }

      if (section === 'abonnements') {
        try {
          setSubscriptionsLoading(true);
          const subs = await getMySubscriptions();
          if (active) setSubscriptions(subs || []);
        } catch {
          // ignore
        } finally {
          if (active) setSubscriptionsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [section, user]);

  async function handlePauseSubscription(sub: CustomerSubscription) {
    if (!window.confirm('Voulez-vous mettre en pause cet abonnement floral ?')) return;
    setActionLoadingId(sub.id);
    try {
      const ok = await pauseMySubscription(sub.subscriptionNumber);
      if (ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'PAUSED' } : s))
        );
        setNotice('Abonnement mis en pause.');
      } else {
        setErrorNotice('Erreur lors de la mise en pause.');
      }
    } catch {
      setErrorNotice('Erreur réseau.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResumeSubscription(sub: CustomerSubscription) {
    setActionLoadingId(sub.id);
    try {
      const ok = await resumeMySubscription(sub.subscriptionNumber);
      if (ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'ACTIVE' } : s))
        );
        setNotice('Abonnement réactivé avec succès.');
      } else {
        setErrorNotice('Erreur lors de la réactivation.');
      }
    } catch {
      setErrorNotice('Erreur réseau.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancelSubscription(sub: CustomerSubscription) {
    if (!window.confirm('Êtes-vous sûr de vouloir résilier cet abonnement floral ?')) return;
    setActionLoadingId(sub.id);
    try {
      const ok = await cancelMySubscription(sub.subscriptionNumber);
      if (ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'CANCELLED' } : s))
        );
        setNotice('Abonnement résilié.');
      } else {
        setErrorNotice('Erreur lors de la résiliation.');
      }
    } catch {
      setErrorNotice('Erreur réseau.');
    } finally {
      setActionLoadingId(null);
    }
  }

  const handleMarkAllClientNotifsAsRead = () => {
    setClientNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotice('Toutes vos notifications sont marquées comme lues.');
  };

  const handleToggleClientNotifRead = (id: string) => {
    setClientNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  if (!page) {
    return (
      <section className="account-panel">
        <h1>Rubrique indisponible</h1>
        <Link href="/compte">Retour au tableau de bord</Link>
      </section>
    );
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setErrorNotice('');
    try {
      setProfileLoading(true);
      const updated = await updateCustomerProfile({
        firstName,
        lastName,
        phone,
      });
      setProfile(updated);
      updateUser({
        name: `${firstName} ${lastName}`.trim(),
        phone,
      });
      setNotice('Vos informations personnelles ont été enregistrées avec succès.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setErrorNotice('');
    if (newPassword.length < 6) {
      setErrorNotice('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorNotice('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      setPasswordLoading(true);
      await changeCustomerPassword({ currentPassword, newPassword });
      setNotice('Votre mot de passe a été modifié avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Mot de passe actuel incorrect ou erreur serveur.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setErrorNotice('');
    try {
      setAddressSubmitting(true);
      const created = await createCustomerAddress({
        name: newAddrName,
        street: newAddrStreet,
        city: newAddrCity,
        phone: newAddrPhone,
        isDefault: newAddrDefault,
      });
      if (created.isDefault) {
        setAddresses((prev) => [
          created,
          ...prev.map((a) => ({ ...a, isDefault: false })),
        ]);
      } else {
        setAddresses((prev) => [...prev, created]);
      }
      setNewAddrName('');
      setNewAddrStreet('');
      setNewAddrPhone('');
      setNewAddrDefault(false);
      setNotice('Adresse ajoutée avec succès.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || "Erreur lors de l'enregistrement de l'adresse.");
    } finally {
      setAddressSubmitting(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await deleteCustomerAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setNotice('Adresse supprimée.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Impossible de supprimer cette adresse.');
    }
  }

  async function handleSetDefaultAddress(id: string) {
    try {
      await setDefaultCustomerAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
      setNotice('Adresse principale mise à jour.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Erreur lors de la mise à jour.');
    }
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
          {(() => {
            const currentPoints = profile?.loyaltyPoints ?? 0;
            const currentTier = profile?.loyaltyTier || 'Bronze';
            let nextTierName = 'Silver';
            let pointsToNext = Math.max(0, 5000 - currentPoints);
            let progressPercent = Math.min(100, Math.round((currentPoints / 5000) * 100));

            if (currentTier === 'Silver') {
              nextTierName = 'Gold';
              pointsToNext = Math.max(0, 15000 - currentPoints);
              progressPercent = Math.min(100, Math.round(((currentPoints - 5000) / 10000) * 100));
            } else if (currentTier === 'Gold') {
              nextTierName = 'Platinum';
              pointsToNext = Math.max(0, 50000 - currentPoints);
              progressPercent = Math.min(100, Math.round(((currentPoints - 15000) / 35000) * 100));
            } else if (currentTier === 'Platinum') {
              nextTierName = 'Niveau maximum';
              pointsToNext = 0;
              progressPercent = 100;
            }

            return (
              <div className="fidelity-top-grid">
                {/* Left Big Card: Current Status */}
                <div className="fidelity-hero-card">
                  <div className="fidelity-hero-body">
                    <div className="fidelity-hero-badge">
                      <Crown size={34} className="gold-crown-icon" />
                    </div>
                    <div className="fidelity-hero-text">
                      <span className="fidelity-hero-uptitle">Votre niveau actuel</span>
                      <h2 className="fidelity-hero-level">{currentTier}</h2>
                      <div className="fidelity-hero-points">{currentPoints.toLocaleString('fr-FR')} points</div>
                      {currentTier !== 'Platinum' ? (
                        <p className="fidelity-hero-next">
                          Encore <strong>{pointsToNext.toLocaleString('fr-FR')} points</strong> pour atteindre le niveau <em>{nextTierName}</em>
                        </p>
                      ) : (
                        <p className="fidelity-hero-next">
                          Félicitations, vous bénéficiez du statut privilège <em>Platinum</em> !
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="fidelity-progress-section">
                    <div className="fidelity-progress-track">
                      <div className="fidelity-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="fidelity-progress-label">Prochain niveau : {nextTierName} ({progressPercent}%)</div>
                  </div>
                </div>

                {/* Right: 4 Tiers */}
                <div className="fidelity-tiers-grid">
                  <div className={`fidelity-tier-card ${currentTier === 'Bronze' ? 'active' : ''}`}>
                    <div className="tier-icon-wrap bronze">
                      <Crown size={22} />
                    </div>
                    <h3 className="tier-name">Bronze</h3>
                    <span className="tier-points">&lt; 5 000 pts</span>
                    <strong className="tier-discount">-5%</strong>
                  </div>

                  <div className={`fidelity-tier-card ${currentTier === 'Silver' ? 'active' : ''}`}>
                    <div className="tier-icon-wrap silver">
                      <Crown size={22} />
                    </div>
                    <h3 className="tier-name">Silver</h3>
                    <span className="tier-points">5 000 - 15 000 pts</span>
                    <strong className="tier-discount">-10%</strong>
                  </div>

                  <div className={`fidelity-tier-card ${currentTier === 'Gold' ? 'active' : ''}`}>
                    <div className="tier-icon-wrap gold">
                      <Crown size={22} />
                    </div>
                    <h3 className="tier-name">Gold</h3>
                    <span className="tier-points">15 000 - 50 000 pts</span>
                    <strong className="tier-discount">-15%</strong>
                  </div>

                  <div className={`fidelity-tier-card ${currentTier === 'Platinum' ? 'active' : ''}`}>
                    <div className="tier-icon-wrap platinum">
                      <Gem size={22} />
                    </div>
                    <h3 className="tier-name">Platinum</h3>
                    <span className="tier-points">50 000+ pts</span>
                    <strong className="tier-discount">-20%</strong>
                  </div>
                </div>
              </div>
            );
          })()}

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

          {notice && <p className="success-note" role="status" style={{ marginBottom: '15px' }}>{notice}</p>}
          {errorNotice && <p className="error-note" role="status" style={{ color: 'var(--danger, #ef4444)', marginBottom: '15px' }}>{errorNotice}</p>}

          {addressesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 0' }}>
              <Loader2 size={18} className="auth-spinner" />
              <span>Chargement de vos adresses…</span>
            </div>
          ) : addresses.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--surface-subtle, #f9fafb)', borderRadius: '8px', marginBottom: '20px' }}>
              <p>Aucune adresse enregistrée pour le moment. Ajoutez votre première adresse ci-dessous.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
              {addresses.map((addr) => (
                <div key={addr.id} className="address-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <b>
                      {addr.name}{' '}
                      {addr.isDefault && (
                        <span style={{ background: 'var(--pink)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '6px' }}>
                          Par défaut
                        </span>
                      )}
                    </b>
                    <br />
                    {addr.street}
                    <br />
                    {addr.city} · Sénégal
                    <br />
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Tél : {addr.phone}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="button-pill-outline button-small"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Par défaut
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="button-pill-outline button-small"
                      style={{ fontSize: '12px', padding: '4px 10px', color: '#ef4444', borderColor: '#fca5a5' }}
                      aria-label="Supprimer cette adresse"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className="account-form" onSubmit={handleAddAddress} style={{ marginTop: '20px' }}>
            <h2>Ajouter une nouvelle adresse</h2>
            <label>
              Nom de l’adresse (ex. Bureau, Villa Saly...)
              <input
                required
                placeholder="Maison, Bureau, Villa..."
                value={newAddrName}
                onChange={(e) => setNewAddrName(e.target.value)}
              />
            </label>
            <label>
              Adresse complète
              <input
                required
                autoComplete="street-address"
                placeholder="Rue, numéro, repères..."
                value={newAddrStreet}
                onChange={(e) => setNewAddrStreet(e.target.value)}
              />
            </label>
            <div className="checkout-fields">
              <label>
                Ville
                <input
                  required
                  placeholder="Saly Portudal, Dakar, Mbour..."
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                />
              </label>
              <label>
                Téléphone de livraison
                <input
                  required
                  inputMode="tel"
                  placeholder="+221 77 123 45 67"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                />
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '10px 0' }}>
              <input
                type="checkbox"
                checked={newAddrDefault}
                onChange={(e) => setNewAddrDefault(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>Définir comme adresse de livraison par défaut</span>
            </label>
            <button className="button button-primary" type="submit" disabled={addressSubmitting}>
              {addressSubmitting ? 'Enregistrement en cours…' : 'Enregistrer cette adresse'}
            </button>
          </form>
        </section>
      )}

      {/* ── MES INFORMATIONS ── */}
      {section === 'informations' && (
        <div className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
          </div>

          {notice && <p className="success-note" role="status" style={{ marginBottom: '15px' }}>{notice}</p>}
          {errorNotice && <p className="error-note" role="status" style={{ color: 'var(--danger, #ef4444)', marginBottom: '15px' }}>{errorNotice}</p>}

          <form className="account-form" onSubmit={handleSaveProfile}>
            <h2>Coordonnées personnelles</h2>
            <div className="checkout-fields">
              <label>
                Prénom
                <input
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label>
                Nom
                <input
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
              <label>
                Adresse e-mail (liée au compte)
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled
                  style={{ background: 'var(--surface-subtle, #f3f4f6)', cursor: 'not-allowed' }}
                />
              </label>
              <label>
                Téléphone mobile
                <input
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={profileLoading}>
              {profileLoading ? 'Enregistrement en cours…' : 'Enregistrer les modifications'}
            </button>
          </form>

          <hr style={{ margin: '30px 0', borderColor: 'var(--border, #e5e7eb)' }} />

          {/* Formulaire Changement de mot de passe */}
          <form className="account-form" onSubmit={handleChangePassword}>
            <h2>Modifier mon mot de passe</h2>
            <div className="checkout-fields">
              <label>
                Mot de passe actuel
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label>
                Nouveau mot de passe
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="6 caractères minimum"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label style={{ gridColumn: 'span 2' }}>
                Confirmer le nouveau mot de passe
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Répétez le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Modification en cours…' : 'Changer mon mot de passe'}
            </button>
          </form>
        </div>
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

      {/* ── NOTIFICATIONS (BOÎTE DE RÉCEPTION UNIQUEMENT) ── */}
      {section === 'notifications' && (
        <section className="account-panel">
          <div className="account-title-row" style={{ width: '100%', marginBottom: '16px' }}>
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">
                Consultez l’historique de vos alertes, suivis de commande et messages.
              </p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span>
                  {clientNotifications.length} notification{clientNotifications.length > 1 ? 's' : ''} au total
                </span>
                {clientNotifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                    {clientNotifications.filter((n) => !n.isRead).length} non-lue{clientNotifications.filter((n) => !n.isRead).length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {clientNotifications.some((n) => !n.isRead) && (
                <button
                  type="button"
                  onClick={handleMarkAllClientNotifsAsRead}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline"
                >
                  <CheckCheck size={14} />
                  <span>Tout marquer comme lu</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {clientNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleToggleClientNotifRead(n.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    !n.isRead
                      ? 'border-emerald-200 bg-emerald-50/40 shadow-2xs'
                      : 'border-neutral-200/80 bg-white hover:bg-neutral-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200 shadow-2xs shrink-0 mt-0.5">
                      {n.type === 'DELIVERY_UPDATE' ? (
                        <Truck size={16} className="text-emerald-700" />
                      ) : n.type === 'PAYMENT' ? (
                        <CheckCircle2 size={16} className="text-blue-700" />
                      ) : n.type === 'LOYALTY' ? (
                        <Crown size={16} className="text-amber-600" />
                      ) : (
                        <Sprout size={16} className="text-purple-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-neutral-900">
                          {n.title}
                        </strong>
                        <span className="text-[11px] text-neutral-400 shrink-0">{n.createdAt}</span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      {n.orderNumber && (
                        <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                          <Link
                            href="/compte/commandes"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Détails de la commande {n.orderNumber}</span>
                            <span>→</span>
                          </Link>
                          {!n.isRead && (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {notice && <p className="success-note mt-3" role="status">{notice}</p>}
        </section>
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

      {/* ── DEVIS ── */}
      {section === 'devis' && (
        <section className="account-panel">
          <div className="account-title-row">
            <div>
              <h1 className="account-title">{page.title}</h1>
              <p className="account-intro">{page.description}</p>
            </div>
            <Link href="/devis" className="button button-primary text-sm flex items-center gap-1.5">
              <Plus size={15} /> Nouveau devis
            </Link>
          </div>

          {quotesLoading ? (
            <div className="flex items-center justify-center p-8 text-neutral-500 gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span>Chargement de vos devis...</span>
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100 mt-4">
              <div className="w-12 h-12 bg-pink-50 text-[#c8436e] rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="font-serif font-bold text-base text-neutral-800 mb-1">
                Aucune demande de devis en cours
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
                Vous préparez un mariage, un anniversaire ou la décoration florale de votre villa à Saly ? Demandez une étude personnalisée gratuite.
              </p>
              <Link href="/devis" className="button button-primary">
                Créer un devis sur mesure
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 mt-4">
              {quotes.map((q) => {
                const statusLabels: Record<string, { label: string; color: string }> = {
                  NEW: { label: 'Reçu · En attente', color: 'bg-amber-100 text-amber-800' },
                  UNDER_REVIEW: { label: 'En cours d’étude', color: 'bg-blue-100 text-blue-800' },
                  SENT: { label: 'Proposition prête', color: 'bg-emerald-100 text-emerald-800' },
                  ACCEPTED: { label: 'Devis accepté', color: 'bg-emerald-100 text-emerald-900' },
                  REFUSED: { label: 'Refusé', color: 'bg-neutral-100 text-neutral-600' },
                  CONVERTED_TO_ORDER: { label: 'Converti en commande', color: 'bg-purple-100 text-purple-800' },
                };
                const statusInfo = statusLabels[q.status] || { label: q.status, color: 'bg-neutral-100 text-neutral-700' };

                return (
                  <div
                    key={q.id}
                    className="p-4 bg-white border border-neutral-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-900">{q.quoteNumber}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600">
                        <strong>{q.eventType}</strong> · {q.eventLocation}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Créé le {new Date(q.createdAt).toLocaleDateString('fr-FR')} {q.eventDate ? `· Événement le ${new Date(q.eventDate).toLocaleDateString('fr-FR')}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {q.quotedAmount != null && (
                        <div className="text-right">
                          <span className="text-xs text-neutral-500 block">Montant proposé</span>
                          <strong className="text-base text-[#173f22]">
                            {q.quotedAmount.toLocaleString('fr-FR')} FCFA
                          </strong>
                        </div>
                      )}
                      <a
                        href={`https://wa.me/221779417860?text=${encodeURIComponent(`Bonjour Décofleur Plus, je vous contacte concernant mon devis ${q.quoteNumber}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-outline text-xs flex items-center gap-1.5"
                      >
                        <WhatsAppIcon size={14} /> Contacter l’atelier
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {section === 'abonnements' && (
        <section className="account-panel">
          <h1>{page.title}</h1>
          <p className="account-panel-desc">{page.description}</p>

          {notice && <p className="account-notice success">{notice}</p>}
          {errorNotice && <p className="account-notice error">{errorNotice}</p>}

          {subscriptionsLoading ? (
            <div className="flex items-center justify-center p-12 text-neutral-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span>Chargement de vos formules florales...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl mt-4">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">
                Aucun abonnement floral actif
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
                Recevez chaque semaine ou toutes les deux semaines un bouquet frais de saison dans son vase garni, livré directement à votre domicile ou bureau à Saly et Petite Côte.
              </p>
              <Link href="/abonnement" className="button button-primary">
                Découvrir nos formules florales
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 mt-4">
              {subscriptions.map((sub) => {
                const statusStyles: Record<string, { label: string; color: string }> = {
                  ACTIVE: { label: 'Actif', color: 'bg-emerald-100 text-emerald-800' },
                  PAUSED: { label: 'En pause', color: 'bg-amber-100 text-amber-800' },
                  CANCELLED: { label: 'Résilié', color: 'bg-neutral-100 text-neutral-600' },
                  PENDING: { label: 'En attente', color: 'bg-blue-100 text-blue-800' },
                };
                const statusInfo = statusStyles[sub.status] || { label: sub.status, color: 'bg-neutral-100 text-neutral-700' };
                const isLoadingThis = actionLoadingId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="p-5 bg-white border border-neutral-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-900 text-base">
                          Formule {sub.plan}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          #{sub.subscriptionNumber}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-700">
                        Rythme : <strong>{sub.frequency === 'HEBDOMADAIRE' ? 'Hebdomadaire (4 passages / mois)' : 'Bimensuel (2 passages / mois)'}</strong>
                        {' · '}Jour : <strong>{sub.deliveryDay}</strong>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Adresse : {sub.address || sub.location} · Destinataire : {sub.recipientName} ({sub.phone})
                      </div>
                      {sub.nextDeliveryDate && (
                        <div className="text-xs text-[#173f22] font-medium mt-1">
                          Prochaine livraison prévue le {new Date(sub.nextDeliveryDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {sub.monthlyAmount != null && (
                        <div className="text-right">
                          <span className="text-xs text-neutral-400 block">Tarif mensuel</span>
                          <strong className="text-base text-[#173f22]">
                            {sub.monthlyAmount.toLocaleString('fr-FR')} FCFA
                          </strong>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {sub.status === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() => handlePauseSubscription(sub)}
                            className="button button-outline text-xs flex items-center gap-1"
                          >
                            <Pause size={13} />
                            <span>Pause</span>
                          </button>
                        )}

                        {sub.status === 'PAUSED' && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() => handleResumeSubscription(sub)}
                            className="button button-outline text-xs flex items-center gap-1 text-emerald-700 border-emerald-300"
                          >
                            <Play size={13} />
                            <span>Reprendre</span>
                          </button>
                        )}

                        {sub.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() => handleCancelSubscription(sub)}
                            className="button button-outline text-xs flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle size={13} />
                            <span>Résilier</span>
                          </button>
                        )}

                        <a
                          href={`https://wa.me/221779417860?text=${encodeURIComponent(`Bonjour Décofleur Plus, je vous contacte concernant mon abonnement ${sub.subscriptionNumber}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-outline text-xs flex items-center gap-1.5"
                          title="Assistance WhatsApp"
                        >
                          <WhatsAppIcon size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}
