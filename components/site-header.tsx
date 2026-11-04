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
  LayoutGrid,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { BrandLogo } from '@/components/brand-logo';

export function SiteHeader() {
  const { count, favorites } = useCart();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(name);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 350);
  };

  const closeDropdownInstantly = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(null);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusReturnTarget = menuTriggerRef.current;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-drawer-open');
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
      document.body.classList.remove('mobile-drawer-open');
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
          className="mobile-menu-trigger touch-manipulation cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMobileMenuOpen(true);
          }}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Menu size={24} className="pointer-events-none" />
        </button>

        {/* Brand Logo matching client mockup */}
        <BrandLogo variant="light" />

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

        {/* Desktop Header Action Icons */}
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

        {/* Mobile Header Action Icons (Search + Pink Cart) */}
        {!isAuthRoute && (
          <div className="mobile-header-actions">
            <button
              type="button"
              className="mobile-header-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Rechercher"
              aria-expanded={mobileSearchOpen}
            >
              <Search size={22} />
            </button>
            <Link href="/panier" className="mobile-header-btn mobile-cart-btn" aria-label="Mon panier">
              <ShoppingCart size={22} />
              <span className="mobile-cart-badge">{count}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && !isAuthRoute && (
        <div className="mobile-search-expand">
          <form className="mobile-search-form" onSubmit={search} role="search">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une catégorie…"
            />
            <button type="submit" aria-label="Rechercher">
              <Search size={18} />
            </button>
          </form>
        </div>
      )}

      {/* 3. Navigation Bar with Dropdowns (hidden on auth routes) */}
      {!isAuthRoute && (
        <nav className="main-nav-bar" aria-label="Navigation principale">
        <div className="content-width main-nav-inner">
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Accueil
          </Link>

          {/* Products Dropdown */}
          <div
            className={`nav-item-dropdown ${openDropdown === 'produits' ? 'is-active' : ''}`}
            onMouseEnter={() => handleDropdownEnter('produits')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              href="/boutique"
              className={`nav-link ${isActive('/boutique') ? 'active' : ''}`}
            >
              Nos produits <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'produits' && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => handleDropdownEnter('produits')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/boutique" className="dropdown-item" onClick={closeDropdownInstantly}>Tous les produits</Link>
                <Link href="/categories/bouquets" className="dropdown-item" onClick={closeDropdownInstantly}>Bouquets élégants</Link>
                <Link href="/categories/roses" className="dropdown-item" onClick={closeDropdownInstantly}>Roses fraîches</Link>
                <Link href="/categories/plantes" className="dropdown-item" onClick={closeDropdownInstantly}>Plantes d’intérieur</Link>
                <Link href="/categories/paniers-de-fruits" className="dropdown-item" onClick={closeDropdownInstantly}>Paniers de fruits</Link>
                <Link href="/categories/cadeaux" className="dropdown-item" onClick={closeDropdownInstantly}>Coffrets cadeaux</Link>
                <Link href="/categories/bougies" className="dropdown-item" onClick={closeDropdownInstantly}>Bougies & senteurs</Link>
                <Link href="/categories/vases" className="dropdown-item" onClick={closeDropdownInstantly}>Vases & contenants</Link>
              </div>
            )}
          </div>

          {/* Events Dropdown */}
          <div
            className={`nav-item-dropdown ${openDropdown === 'evenements' ? 'is-active' : ''}`}
            onMouseEnter={() => handleDropdownEnter('evenements')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              href="/evenements"
              className={`nav-link ${isActive('/evenements') ? 'active' : ''}`}
            >
              Événements <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'evenements' && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => handleDropdownEnter('evenements')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/evenements" className="dropdown-item" onClick={closeDropdownInstantly}>Tous les événements</Link>
                <Link href="/mariages" className="dropdown-item" onClick={closeDropdownInstantly}>Mariages & réceptions</Link>
                <Link href="/decoration" className="dropdown-item" onClick={closeDropdownInstantly}>Décoration sur mesure</Link>
                <Link href="/anniversaires" className="dropdown-item" onClick={closeDropdownInstantly}>Anniversaires & fêtes</Link>
                <Link href="/deuil" className="dropdown-item" onClick={closeDropdownInstantly}>Cérémonies de deuil</Link>
              </div>
            )}
          </div>

          {/* Paysagisme Dropdown (Sans devis inclus, page propre) */}
          <div
            className={`nav-item-dropdown ${openDropdown === 'paysagisme' ? 'is-active' : ''}`}
            onMouseEnter={() => handleDropdownEnter('paysagisme')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              href="/paysagisme"
              className={`nav-link ${isActive('/paysagisme') ? 'active' : ''}`}
            >
              Paysagisme <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'paysagisme' && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => handleDropdownEnter('paysagisme')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/paysagisme" className="dropdown-item" onClick={closeDropdownInstantly}>Paysagisme & Aménagement</Link>
                <Link href="/paysagisme/prestations" className="dropdown-item" onClick={closeDropdownInstantly}>Nos prestations</Link>
                <Link href="/paysagisme/realisations" className="dropdown-item" onClick={closeDropdownInstantly}>Galerie des réalisations</Link>
              </div>
            )}
          </div>

          {/* Location Événementielle (Mockup Screen 5) */}
          <Link
            href="/location"
            className={`nav-link ${isActive('/location') ? 'active' : ''}`}
          >
            Location
          </Link>

          {/* Demander un Devis (Page dédiée propre) */}
          <Link
            href="/devis"
            className={`nav-link font-medium ${isActive('/devis') ? 'active' : ''}`}
          >
            Devis
          </Link>

          {/* Abonnements Floraux */}
          <Link
            href="/abonnements"
            className={`nav-link ${isActive('/abonnements') ? 'active' : ''}`}
          >
            Abonnements
          </Link>

          {/* Blog */}
          <Link
            href="/blog"
            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
          >
            Blog
          </Link>

          {/* About Dropdown */}
          <div
            className={`nav-item-dropdown ${openDropdown === 'apropos' ? 'is-active' : ''}`}
            onMouseEnter={() => handleDropdownEnter('apropos')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              href="/a-propos"
              className={`nav-link ${isActive('/a-propos') ? 'active' : ''}`}
            >
              À propos <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            {openDropdown === 'apropos' && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => handleDropdownEnter('apropos')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/a-propos" className="dropdown-item" onClick={closeDropdownInstantly}>Notre histoire</Link>
                <Link href="/livraison" className="dropdown-item" onClick={closeDropdownInstantly}>Livraison & Zones</Link>
                <Link href="/contact" className="dropdown-item" onClick={closeDropdownInstantly}>Contact</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      )}

      {/* 4. Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div id="mobile-navigation-drawer" className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu de navigation" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header mt-16 pb-8">
              <div className="drawer-brand-block">
                <BrandLogo variant="light" />
              </div>
            
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
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link">
                Accueil
              </Link>

              {/* Accordéon: Nos produits */}
              <div className="drawer-section">
                <button
                  type="button"
                  onClick={() => toggleSection('produits')}
                  className="drawer-accordion-btn"
                  aria-expanded={!!expandedSections['produits']}
                >
                  <span>Nos produits</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-[#7a8a7c] ${
                      expandedSections['produits'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections['produits'] && (
                  <div className="drawer-sublinks">
                    <Link href="/boutique" onClick={() => setMobileMenuOpen(false)}>Tous les produits</Link>
                    <Link href="/categories/bouquets" onClick={() => setMobileMenuOpen(false)}>Bouquets élégants</Link>
                    <Link href="/categories/roses" onClick={() => setMobileMenuOpen(false)}>Roses fraîches</Link>
                    <Link href="/categories/plantes" onClick={() => setMobileMenuOpen(false)}>Plantes d’intérieur</Link>
                    <Link href="/categories/paniers-de-fruits" onClick={() => setMobileMenuOpen(false)}>Paniers de fruits</Link>
                    <Link href="/categories/cadeaux" onClick={() => setMobileMenuOpen(false)}>Coffrets cadeaux</Link>
                    <Link href="/categories/bougies" onClick={() => setMobileMenuOpen(false)}>Bougies & senteurs</Link>
                    <Link href="/categories/vases" onClick={() => setMobileMenuOpen(false)}>Vases & contenants</Link>
                  </div>
                )}
              </div>

              {/* Accordéon: Événements */}
              <div className="drawer-section">
                <button
                  type="button"
                  onClick={() => toggleSection('evenements')}
                  className="drawer-accordion-btn"
                  aria-expanded={!!expandedSections['evenements']}
                >
                  <span>Événements &amp; Mariages</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-[#7a8a7c] ${
                      expandedSections['evenements'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections['evenements'] && (
                  <div className="drawer-sublinks">
                    <Link href="/evenements" onClick={() => setMobileMenuOpen(false)}>Tous les événements</Link>
                    <Link href="/mariages" onClick={() => setMobileMenuOpen(false)}>Mariages &amp; réceptions</Link>
                    <Link href="/decoration" onClick={() => setMobileMenuOpen(false)}>Décoration sur mesure</Link>
                    <Link href="/anniversaires" onClick={() => setMobileMenuOpen(false)}>Anniversaires &amp; fêtes</Link>
                    <Link href="/deuil" onClick={() => setMobileMenuOpen(false)}>Cérémonies de deuil</Link>
                  </div>
                )}
              </div>

              {/* Accordéon: Paysagisme (Sans Emoji) */}
              <div className="drawer-section">
                <button
                  type="button"
                  onClick={() => toggleSection('paysagisme')}
                  className="drawer-accordion-btn font-semibold text-[#173f22]"
                  aria-expanded={!!expandedSections['paysagisme']}
                >
                  <span>Paysagisme &amp; Aménagement</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-[#173f22] ${
                      expandedSections['paysagisme'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections['paysagisme'] && (
                  <div className="drawer-sublinks">
                    <Link href="/paysagisme" onClick={() => setMobileMenuOpen(false)}>Paysagisme &amp; Aménagement</Link>
                    <Link href="/paysagisme/prestations" onClick={() => setMobileMenuOpen(false)}>Nos prestations</Link>
                    <Link href="/paysagisme/realisations" onClick={() => setMobileMenuOpen(false)}>Galerie réalisations</Link>
                  </div>
                )}
              </div>

              {/* Lien direct: Location Événementielle (Sans Emoji) */}
              <Link href="/location" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link font-semibold text-[#c8436e]">
                Location Événementielle
              </Link>

              {/* Lien direct: Demander un devis sur mesure (Sans Emoji) */}
              <Link href="/devis" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link font-bold text-[#173f22]">
                Demander un devis sur mesure
              </Link>

              {/* Lien direct: Abonnements floraux */}
              <Link href="/abonnements" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link">
                Abonnements floraux
              </Link>

              {/* Accordéon: À propos & Services */}
              <div className="drawer-section">
                <button
                  type="button"
                  onClick={() => toggleSection('apropos')}
                  className="drawer-accordion-btn"
                  aria-expanded={!!expandedSections['apropos']}
                >
                  <span>À propos de nous</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-[#7a8a7c] ${
                      expandedSections['apropos'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections['apropos'] && (
                  <div className="drawer-sublinks">
                    <Link href="/a-propos" onClick={() => setMobileMenuOpen(false)}>Notre histoire &amp; équipe</Link>
                    <Link href="/livraison" onClick={() => setMobileMenuOpen(false)}>Livraison à domicile &amp; zones</Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                  </div>
                )}
              </div>

              {/* Lien direct: Blog */}
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link">
                Blog &amp; Conseils
              </Link>

              {/* Lien direct: Contact */}
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="drawer-main-link">
                Contact
              </Link>
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

      {/* 5. Mobile Bottom Navigation Bar (5 tabs as shown in phone mockup) */}
      {!isAuthRoute && (
        <nav className="mobile-bottom-bar" aria-label="Navigation rapide">
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`bottom-tab ${pathname === '/' ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon-wrap"><House size={20} /></span>
            <span className="bottom-tab-label">Accueil</span>
          </Link>
          <Link
            href="/boutique"
            aria-current={isActive('/boutique') ? 'page' : undefined}
            className={`bottom-tab ${isActive('/boutique') ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon-wrap"><LayoutGrid size={20} /></span>
            <span className="bottom-tab-label">Catégories</span>
          </Link>
          <Link
            href="/favoris"
            aria-current={pathname === '/favoris' ? 'page' : undefined}
            className={`bottom-tab ${pathname === '/favoris' ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon-wrap">
              <Heart size={20} />
              {favorites.length > 0 && <span className="bottom-badge pink">{favorites.length}</span>}
            </span>
            <span className="bottom-tab-label">Favoris</span>
          </Link>
          <Link
            href="/panier"
            aria-current={pathname === '/panier' ? 'page' : undefined}
            className={`bottom-tab ${pathname === '/panier' ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon-wrap">
              <ShoppingCart size={20} />
              <span className="bottom-badge pink">{count}</span>
            </span>
            <span className="bottom-tab-label">Panier</span>
          </Link>
          <Link
            href={isAuthenticated ? '/compte' : '/connexion'}
            aria-current={pathname.startsWith('/compte') ? 'page' : undefined}
            className={`bottom-tab ${pathname.startsWith('/compte') || pathname === '/connexion' ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon-wrap"><UserRound size={20} /></span>
            <span className="bottom-tab-label">Compte</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
