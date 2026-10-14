'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Heart,
  UserRound,
  ShoppingCart,
  MapPin,
  Truck,
  ShieldCheck,
  Phone,
  Menu,
  X,
  ChevronDown,
  House,
  Flower2,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';

export function SiteHeader() {
  const { count, favorites } = useCart();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusReturnTarget = menuTriggerRef.current;
    document.body.style.overflow = 'hidden';
    const focusCloseButton = window.requestAnimationFrame(() => menuCloseRef.current?.focus());
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
      if (event.key === 'Tab') {
        const drawer = document.getElementById('mobile-navigation-drawer');
        const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(focusCloseButton);
      window.removeEventListener('keydown', closeOnEscape);
      focusReturnTarget?.focus();
    };
  }, [mobileMenuOpen]);

  const authRoutes = ['/connexion', '/inscription', '/mot-de-passe-oublie'];
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/boutique') {
      return (
        pathname.startsWith('/boutique') ||
        pathname.startsWith('/produits/') ||
        pathname.startsWith('/categories/') ||
        ['/bouquets', '/roses', '/plantes', '/paniers-de-fruits', '/cadeaux', '/bougies', '/vases'].includes(pathname)
      );
    }
    if (href === '/evenements') {
      return (
        pathname === '/evenements' ||
        ['/mariages', '/decoration', '/deuil', '/anniversaires', '/occasions'].includes(pathname)
      );
    }
    if (href === '/abonnements') {
      return pathname.startsWith('/abonnements');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className={`site-header${isAuthRoute ? ' auth-route-header' : ''}`}>
      {/* 1. Top Announcement Bar */}
      <div className="topbar">
        <div className="content-width topbar-inner">
          <div className="topbar-left">
            <span><MapPin size={13} /> Saly Portudal, Sénégal</span>
            <span className="topbar-sep">•</span>
            <span><Truck size={14} /> Livraison à Saly & Mbour</span>
            <span className="topbar-sep">•</span>
            <span><ShieldCheck size={14} /> Paiement sécurisé</span>
          </div>
          <div className="topbar-right">
            <a className="topbar-phone" href="tel:+221779417860">
              <Phone size={13} /> +221 77 941 78 60
            </a>
            <div className="topbar-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={14} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokIcon size={14} />
              </a>
            </div>
            {isAuthenticated ? (
              <Link href="/compte" className="topbar-account" title={`Connecté en tant que ${user?.name}`}>
                <UserRound size={14} />
                <span>{user?.name || 'Mon compte'}</span>
              </Link>
            ) : (
              <Link href="/connexion" className="topbar-account">
                <UserRound size={14} />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="content-width header-main">
        {/* Mobile menu button */}
        <button
          ref={menuTriggerRef}
          className="mobile-menu-trigger"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Menu size={24} />
        </button>

        {/* Brand Logo */}
        <Link className="brand" href="/" aria-label="Décofleur Plus, accueil">
          <Image
            src="/logo_decofleur_cropped.png"
            alt="Décofleur Plus - Nature en Élégance"
            width={90}
            height={66}
            priority
            className="brand-logo"
            style={{ width: 'auto' }}
          />
        </Link>

        {/* Centered Search Bar */}
        {!isAuthRoute && (
          <form className="search-box" onSubmit={search} role="search">
            <label className="sr-only" htmlFor="site-search">
              Rechercher un produit, une catégorie ou un événement
            </label>
            <input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit, une catégorie, un événement…"
            />
            <button type="submit" aria-label="Rechercher">
              <Search size={18} />
            </button>
          </form>
        )}

        {/* Header Action Icons */}
        <div className="header-actions">
          {!isAuthRoute && (
            <Link href="/favoris" className="action-icon-link" aria-label="Mes favoris">
              <div className="icon-with-badge">
                <Heart size={20} />
                {favorites.length > 0 && <span className="action-badge">{favorites.length}</span>}
              </div>
              <span className="action-label-text">Favoris</span>
            </Link>
          )}
          <Link
            href={isAuthenticated ? '/compte' : '/connexion'}
            className="action-icon-link"
            aria-label="Mon compte"
          >
            <div className="icon-with-badge">
              <UserRound size={20} />
            </div>
            <span className="action-label-text">
              {isAuthenticated ? (user?.name?.split(' ')[0] || 'Mon compte') : 'Mon compte'}
            </span>
          </Link>
          {!isAuthRoute && (
            <Link href="/panier" className="action-icon-link cart-pill-link" aria-label="Mon panier">
              <div className="icon-with-badge">
                <ShoppingCart size={20} className="text-pink-600" />
                <span className="action-badge pink-badge">{count}</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Navigation Bar with Dropdowns (hidden on auth routes) */}
      {!isAuthRoute && (
        <nav className="main-nav-bar" aria-label="Navigation principale">
        <div className="content-width main-nav-inner">
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Accueil
          </Link>

          {/* Products Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setOpenDropdown('produits')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/boutique"
              className={`nav-link ${isActive('/boutique') ? 'active' : ''}`}
            >
              Nos produits <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'produits' && (
              <div className="dropdown-menu">
                <Link href="/boutique" className="dropdown-item">Tous les produits</Link>
                <Link href="/bouquets" className="dropdown-item">Bouquets élégants</Link>
                <Link href="/roses" className="dropdown-item">Roses fraîches</Link>
                <Link href="/plantes" className="dropdown-item">Plantes d’intérieur</Link>
                <Link href="/paniers-de-fruits" className="dropdown-item">Paniers de fruits</Link>
                <Link href="/cadeaux" className="dropdown-item">Coffrets cadeaux</Link>
                <Link href="/bougies" className="dropdown-item">Bougies & senteurs</Link>
                <Link href="/vases" className="dropdown-item">Vases & contenants</Link>
              </div>
            )}
          </div>

          {/* Events Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setOpenDropdown('evenements')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/evenements"
              className={`nav-link ${isActive('/evenements') ? 'active' : ''}`}
            >
              Événements <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'evenements' && (
              <div className="dropdown-menu">
                <Link href="/evenements" className="dropdown-item">Tous les événements</Link>
                <Link href="/mariages" className="dropdown-item">Mariages & réceptions</Link>
                <Link href="/decoration" className="dropdown-item">Décoration sur mesure</Link>
                <Link href="/anniversaires" className="dropdown-item">Anniversaires & fêtes</Link>
                <Link href="/deuil" className="dropdown-item">Cérémonies de deuil</Link>
              </div>
            )}
          </div>

          {/* Abonnements Floraux */}
          <Link
            href="/abonnements"
            className={`nav-link ${isActive('/abonnements') ? 'active' : ''}`}
          >
            Abonnements
          </Link>

          {/* Delivery Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setOpenDropdown('livraison')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/livraison"
              className={`nav-link ${isActive('/livraison') ? 'active' : ''}`}
            >
              Livraison <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'livraison' && (
              <div className="dropdown-menu">
                <Link href="/livraison" className="dropdown-item">Zones & Tarifs</Link>
                <Link href="/livraison#saly" className="dropdown-item">Livraison à Saly</Link>
                <Link href="/livraison#mbour" className="dropdown-item">Livraison à Mbour</Link>
                <Link href="/compte/commandes" className="dropdown-item">Suivi de commande</Link>
              </div>
            )}
          </div>

          {/* About Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setOpenDropdown('apropos')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/a-propos"
              className={`nav-link ${isActive('/a-propos') ? 'active' : ''}`}
            >
              À propos <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'apropos' && (
              <div className="dropdown-menu">
                <Link href="/a-propos" className="dropdown-item">Notre histoire</Link>
                <Link href="/blog" className="dropdown-item">Le journal floral (Blog)</Link>
              </div>
            )}
          </div>

          <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            Contact
          </Link>
        </div>
      </nav>
      )}

      {/* 4. Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div id="mobile-navigation-drawer" className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu de navigation" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header mt-16 pb-8">
              <Image
                src="/logo_decofleur_cropped.png"
                alt="Décofleur Plus"
                width={72}
                height={52}
                className="drawer-logo"
                style={{ width: 'auto' }}
              />
            
              <button
                ref={menuCloseRef}
                className="drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mobile-drawer-links">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              <Link href="/boutique" onClick={() => setMobileMenuOpen(false)}>Nos produits</Link>
              <Link href="/bouquets" onClick={() => setMobileMenuOpen(false)}>↳ Bouquets</Link>
              <Link href="/plantes" onClick={() => setMobileMenuOpen(false)}>↳ Plantes</Link>
              <Link href="/paniers-de-fruits" onClick={() => setMobileMenuOpen(false)}>↳ Paniers de fruits</Link>
              <Link href="/cadeaux" onClick={() => setMobileMenuOpen(false)}>↳ Cadeaux</Link>
              <Link href="/evenements" onClick={() => setMobileMenuOpen(false)}>Événements & Mariages</Link>
              <Link href="/abonnements" onClick={() => setMobileMenuOpen(false)}>Abonnements floraux</Link>
              <Link href="/livraison" onClick={() => setMobileMenuOpen(false)}>Livraison à domicile</Link>
              <Link href="/a-propos" onClick={() => setMobileMenuOpen(false)}>À propos de nous</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog & Conseils</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </nav>

            <div className="mobile-drawer-footer">
              <a href="tel:+221779417860" className="drawer-phone">
                <Phone size={16} /> +221 77 941 78 60
              </a>
              <div className="drawer-socials">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookIcon size={18} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramIcon size={18} /></a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><TikTokIcon size={18} /></a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Navigation Bar (as shown in phone mockup!) */}
      {!isAuthRoute && (
        <nav className="mobile-bottom-bar" aria-label="Navigation rapide">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={`bottom-tab ${pathname === '/' ? 'active' : ''}`}>
            <span className="bottom-tab-icon-wrap"><House size={20} /></span>
            <span className="bottom-tab-label">Accueil</span>
          </Link>
          <Link href="/boutique" aria-current={isActive('/boutique') ? 'page' : undefined} className={`bottom-tab ${isActive('/boutique') ? 'active' : ''}`}>
            <span className="bottom-tab-icon-wrap"><Flower2 size={20} /></span>
            <span className="bottom-tab-label">Catégories</span>
          </Link>
          <Link href="/panier" aria-current={pathname === '/panier' ? 'page' : undefined} className={`bottom-tab ${pathname === '/panier' ? 'active' : ''}`}>
            <span className="bottom-tab-icon-wrap">
              <ShoppingCart size={20} />
              {count > 0 && <span className="bottom-badge pink">{count}</span>}
            </span>
            <span className="bottom-tab-label">Panier</span>
          </Link>
          <Link href={isAuthenticated ? '/compte' : '/connexion'} aria-current={pathname.startsWith('/compte') ? 'page' : undefined} className={`bottom-tab ${pathname.startsWith('/compte') || pathname === '/connexion' ? 'active' : ''}`}>
            <span className="bottom-tab-icon-wrap"><UserRound size={20} /></span>
            <span className="bottom-tab-label">Compte</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
