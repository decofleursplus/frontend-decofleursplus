'use client';

import React from 'react';
import Image from 'next/image';
import {
  PackageCheck,
  MapPin,
  Heart,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Mail,
  Headphones,
} from 'lucide-react';
import { FloralHeartDivider } from '@/components/icons';

type AuthLayoutMode = 'connexion' | 'inscription' | 'mot-de-passe-oublie' | 'admin-connexion';

interface AuthPageLayoutProps {
  mode: AuthLayoutMode;
  children: React.ReactNode;
}

const leftColumnContent = {
  connexion: {
    welcome: 'Bienvenue',
    brand: 'chez Décofleur Plus',
    intro:
      'Connectez-vous pour accéder à votre compte et profiter d’une expérience personnalisée. —',
    perks: [
      {
        icon: PackageCheck,
        title: 'Suivez vos commandes',
        subtitle: 'en temps réel',
      },
      {
        icon: MapPin,
        title: 'Gérez vos adresses',
        subtitle: 'de livraison',
      },
      {
        icon: Heart,
        title: 'Retrouvez vos produits favoris',
        subtitle: 'à tout moment',
      },
      {
        icon: Sparkles,
        title: 'Profitez d’offres exclusives',
        subtitle: 'et de promotions',
      },
    ],
  },
  'admin-connexion': {
    welcome: 'Administration',
    brand: 'Décofleur Plus',
    intro: 'Connectez-vous pour accéder au panneau de gestion de votre boutique.',
    perks: [
      {
        icon: ShoppingBag,
        title: 'Gérez vos commandes',
        subtitle: 'et expéditions en temps réel',
      },
      {
        icon: PackageCheck,
        title: 'Mettez à jour le catalogue',
        subtitle: 'et le suivi des stocks',
      },
      {
        icon: Heart,
        title: 'Fidélisez vos clients',
        subtitle: 'avec le CRM intégré',
      },
      {
        icon: ShieldCheck,
        title: 'Accès restreint & sécurisé',
        subtitle: 'réservé à l\'équipe',
      },
    ],
  },
  inscription: {
    welcome: 'Rejoignez',
    brand: 'Décofleur Plus',
    intro: 'Créez votre compte et profitez de nombreux avantages.',
    perks: [
      {
        icon: ShoppingBag,
        title: 'Commandez en toute simplicité',
        subtitle: 'en quelques clics',
      },
      {
        icon: PackageCheck,
        title: 'Suivez vos commandes',
        subtitle: 'en temps réel',
      },
      {
        icon: MapPin,
        title: 'Enregistrez vos adresses',
        subtitle: 'pour vos futures livraisons',
      },
      {
        icon: Sparkles,
        title: 'Profitez d’offres exclusives',
        subtitle: 'réservées aux membres',
      },
      {
        icon: Heart,
        title: 'Accédez à vos produits favoris',
        subtitle: 'sauvegardés dans votre liste',
      },
    ],
  },
  'mot-de-passe-oublie': {
    welcome: 'Récupération',
    brand: 'de votre compte',
    intro:
      'Réinitialisez votre mot de passe en toute sécurité et retrouvez rapidement l’accès à votre espace Décofleur Plus.',
    perks: [
      {
        icon: ShieldCheck,
        title: 'Sécurité garantie',
        subtitle: 'Lien de réinitialisation sécurisé',
      },
      {
        icon: Mail,
        title: 'Réception instantanée',
        subtitle: 'Par e-mail en un instant',
      },
      {
        icon: Headphones,
        title: 'Service client à votre écoute',
        subtitle: 'Basé à Saly, joignable 7j/7',
      },
    ],
  },
};

export function AuthPageLayout({ mode, children }: AuthPageLayoutProps) {
  const content = leftColumnContent[mode];

  return (
    <div className="auth-master-page">
      {/* ── 1. Desktop Immersive Floral BG Layer ── */}
      <div className="auth-desktop-bg-layer" aria-hidden="true">
        <Image
          src="/images/auth/auth-floral-bg-desktop.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 0px, 65vw"
          className="auth-desktop-bg-image"
        />
        <div className="auth-desktop-bg-gradient" />
      </div>

      {/* ── 2. Mobile Botanical Leaves in Corners ── */}
      <div className="auth-mobile-leaf-top-right" aria-hidden="true">
        <Image
          src="/images/auth/auth-botanical-leaf-corner.jpg"
          alt=""
          width={120}
          height={120}
          className="auth-mobile-leaf-img"
        />
      </div>
      <div className="auth-mobile-leaf-bottom-left" aria-hidden="true">
        <Image
          src="/images/auth/auth-botanical-leaf-corner.jpg"
          alt=""
          width={140}
          height={140}
          className="auth-mobile-leaf-img"
        />
      </div>

      {/* ── 3. Content Grid ── */}
      <div className="content-width auth-content-grid">
        {/* Left Column: Welcome & Value Propositions (Desktop) */}
        <aside className="auth-perks-column" aria-label="Présentation et avantages">
          <div className="auth-perks-inner">
            <header className="auth-greeting">
              <h1 className="auth-greeting-title">
                <span className="auth-greeting-top">{content.welcome}</span>
                <span className="auth-greeting-highlight">{content.brand}</span>
              </h1>
              <p className="auth-greeting-intro">{content.intro}</p>
            </header>

            {/* Perks List with refined circle badges */}
            <ul className="auth-perks-list">
              {content.perks.map((perk, index) => {
                const IconComponent = perk.icon;
                return (
                  <li key={index} className="auth-perk-item">
                    <span className="auth-perk-icon-wrap" aria-hidden="true">
                      <IconComponent size={18} />
                    </span>
                    <div className="auth-perk-text">
                      <strong className="auth-perk-title">{perk.title}</strong>
                      {perk.subtitle && (
                        <span className="auth-perk-sub">{perk.subtitle}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Floral Heart Ornament */}
            <div className="auth-left-divider">
              <FloralHeartDivider />
            </div>
          </div>
        </aside>

        {/* Right Column: Interactive White Form Card */}
        <main className="auth-card-column">
          {/* Mobile floral background behind the top of the form card */}
          <div className="auth-mobile-floral-arch" aria-hidden="true" />

          {/* Main Card */}
          <div className="auth-white-card">
            {children}
          </div>

          {/* Mobile bottom leaf flourish */}
          <div className="auth-mobile-bottom-leaf" aria-hidden="true">
            <FloralHeartDivider />
          </div>
        </main>
      </div>
    </div>
  );
}
