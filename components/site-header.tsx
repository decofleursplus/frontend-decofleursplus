'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Heart, UserRound, ShoppingCart, MapPin, Truck, ShieldCheck, Phone } from 'lucide-react';
import { useCart } from '@/components/cart-provider';

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/boutique') return pathname.startsWith('/boutique') || pathname.startsWith('/produits/') || pathname.startsWith('/categories/') || ['/bouquets', '/roses', '/plantes', '/paniers-de-fruits', '/cadeaux', '/mariages', '/decoration', '/deuil', '/bougies', '/vases', '/occasions', '/anniversaires'].includes(pathname);
    if (href === '/evenements') return pathname === '/evenements';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const [query, setQuery] = useState('');

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="topbar-inner">
          <span><MapPin size={13} /> Saly Portudal, Sénégal</span>
          <span><Truck size={14} /> Livraison à Saly & Mbour</span>
          <span><ShieldCheck size={14} /> Paiement sécurisé</span>
          <a className="topbar-contact" href="tel:+221779417860"><Phone size={12} /> +221 77 941 78 60</a>
          
        </div>
      </div>
      <div className="header-main">
        <Link className="brand" href="/" aria-label="Décofleur Plus, accueil">
          <Image src="/logo_decofleur.jpeg" alt="Décofleur Plus" width={420} height={420} priority />
        </Link>
        <form className="search-box" onSubmit={search} role="search">
          <label className="sr-only" htmlFor="site-search">Rechercher un produit, une catégorie ou un événement</label>
          <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit, une catégorie, un événement…" />
          <button aria-label="Rechercher"><Search size={18} /></button>
        </form>
        <div className="header-actions">
          <Link href="/favoris"><Heart size={19} /><span>Favoris</span></Link>
          <Link href="/compte"><UserRound size={19} /><span>Mon compte</span></Link>
          <Link className="cart-link" href="/panier"><ShoppingCart size={20} /><span>Panier</span><b>{count}</b></Link>
        </div>
      </div>
      <nav className="main-nav" aria-label="Navigation principale">
        <Link href="/" className={isActive('/') ? 'active' : ''}>Accueil</Link>
        <Link href="/boutique" className={isActive('/boutique') ? 'active' : ''}>Nos produits <span className="chevron">⌄</span></Link>
        <Link href="/evenements" className={isActive('/evenements') ? 'active' : ''}>Événements <span className="chevron">⌄</span></Link>
        <Link href="/livraison" className={isActive('/livraison') ? 'active' : ''}>Livraison</Link>
        <Link href="/a-propos" className={isActive('/a-propos') ? 'active' : ''}>À propos</Link>
        <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
      </nav>
    </header>
  );
}
