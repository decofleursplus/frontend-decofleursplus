'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Heart } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/icons';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  }

  return (
    <footer className="prototype-footer">
      <div className="content-width footer-grid">
        {/* Brand Column */}
        <div className="footer-col-brand">
          <Link href="/" className="footer-logo-link" aria-label="Décofleur Plus">
            <Image
              src="/logo_decofleur.jpeg"
              alt="Décofleur Plus - Nature en Élégance"
              width={54}
              height={54}
              className="footer-logo-img"
              style={{ width: 'auto' }}
            />
          </Link>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h3 className="footer-heading">Liens rapides</h3>
          <ul className="footer-links">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/abonnements">Abonnements floraux</Link></li>
            <li><Link href="/a-propos">À propos</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/conditions">CGV</Link></li>
            <li><Link href="/confidentialite">Mentions légales</Link></li>
          </ul>
        </div>

        {/* Social Links Column */}
        <div className="footer-col">
          <h3 className="footer-heading">Suivez-nous</h3>
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YouTubeIcon size={20} />
            </a>
          </div>
        </div>

        {/* Newsletter Column */}
        <div className="footer-col footer-col-newsletter">
          <h3 className="footer-heading">Inscrivez-vous à notre newsletter</h3>
          {subscribed ? (
            <div className="newsletter-success">
              <Check size={16} /> Merci pour votre inscription !
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                required
                aria-label="Votre adresse e-mail pour la newsletter"
              />
              <button type="submit" aria-label="S'inscrire à la newsletter">
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Calligraphic Right Column */}
        <div className="footer-col-quote">
          <p className="footer-cursive-quote">
            Des fleurs fraîches,<br />
            un service d’exception<br />
            pour vos plus beaux moments.
          </p>
          <div className="footer-quote-flourish">
            <span className="flourish-line"></span>
            <Heart size={18} className="flourish-heart" />
            <span className="flourish-line"></span>
          </div>
        </div>
      </div>

      <div className="footer-sub-bottom">
        <div className="content-width footer-sub-inner">
          <span>© {new Date().getFullYear()} Décofleur Plus · Saly Portudal, Sénégal</span>
          <span>Fleuriste artisanal · Livraison Saly & Mbour</span>
        </div>
      </div>
    </footer>
  );
}
