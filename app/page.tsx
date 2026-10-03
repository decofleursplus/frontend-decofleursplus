import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flower2, Gift, Heart, Leaf, ShieldCheck, Sparkles, Sprout, Truck } from 'lucide-react';
import { products } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';

const categories = [
  { name: 'Bouquets', sub: 'Fleurs fraîches', image: '/images/bouquet-passion.webp', icon: Flower2 },
  { name: 'Plantes', sub: 'Intérieur & extérieur', image: '/images/plante.webp', icon: Sprout },
  { name: 'Paniers de fruits', sub: 'Frais et gourmands', image: '/images/fruits.webp', icon: Leaf },
  { name: 'Mariages', sub: 'Cérémonies & réceptions', image: '/images/mariage.webp', icon: Heart },
  { name: 'Cadeaux', sub: 'Pour toutes occasions', image: '/images/cadeau.webp', icon: Gift },
];

export default function HomePage() {
  return <><main>
    <section className="home-hero"><Image className="hero-photo" src="/images/hero.webp" alt="Bouquet de fleurs fraîches aux tons roses et crème" fill priority sizes="100vw" /><div className="hero-wash" /><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> Fleuriste à Saly</span><h1>Des fleurs, des idées,<br />des <em>émotions</em></h1><p>Fleuriste à Saly – Bouquets, plantes, décoration événementielle, paniers de fruits, cadeaux et plus encore.</p><Link className="button button-primary" href="/boutique">Découvrir nos produits <ArrowRight size={17} /></Link></div><p className="hero-script">L’élégance de la nature<br /><em>à chaque instant</em><Heart size={19} /></p></section>
    <section className="service-strip" aria-label="Nos services"><div><Truck /><span><b>Livraison rapide</b><small>à Saly & Mbour</small></span></div><div><ShieldCheck /><span><b>Paiement sécurisé</b><small>Wave · Orange Money</small></span></div><div><Flower2 /><span><b>Fleurs fraîches</b><small>et de qualité</small></span></div><div><Leaf /><span><b>Service client</b><small>à votre écoute</small></span></div></section>
    <section className="category-section content-width"><div className="category-grid">{categories.map(({ name, sub, image, icon: Icon }) => <Link className="category-card" key={name} href={`/boutique?category=${encodeURIComponent(name)}`}><div className="category-image"><Image src={image} alt="" fill sizes="160px" /></div><div className="category-label"><Icon size={14} /><b>{name}</b></div><span>{sub}</span></Link>)}</div></section>
    <section className="featured-section content-width"><aside className="event-feature"><Image src="/images/mariage.webp" alt="Décoration florale pour un mariage" fill sizes="300px" /><div><span className="eyebrow">Vos beaux moments</span><h2>Événements<br />& mariages</h2><p>Une décoration florale sur mesure pour les plus beaux moments.</p><Link className="button button-primary button-small" href="/evenements">En savoir plus <ArrowRight size={14} /></Link></div></aside><div className="featured-products"><div className="section-heading"><h2><Flower2 size={20} /> Nos produits phares</h2><Link href="/boutique">Voir tout <ArrowRight size={14} /></Link></div><ProductGrid products={products.slice(0, 4)} /></div></section>
  </main><SiteFooter /></>;
}
