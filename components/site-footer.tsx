'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><strong>Décofleur <em>Plus</em></strong><p>Nature en élégance — vos fleurs fraîches, préparées avec soin à Saly.</p></div><div><h2>La boutique</h2><Link href="/boutique">Nos produits</Link><Link href="/evenements">Événements & mariages</Link><Link href="/livraison">Livraison</Link></div><div><h2>À votre écoute</h2><Link href="/contact">Contact</Link><Link href="/faq">Questions fréquentes</Link><Link href="/a-propos">À propos</Link></div><div className="footer-contact"><h2>Nous trouver</h2><span><MapPin size={15} /> Saly Portudal, Sénégal</span><a className="footer-phone" href="tel:+221779417860"><Phone size={15} /> +221 77 941 78 60</a></div></div><div className="footer-bottom"><span>© 2026 Décofleur Plus</span><span>Paiement sécurisé · Livraison à Saly & Mbour</span></div></footer>;
}
