import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import { CatalogClient } from '@/components/catalog-client';
import { ProductGrid } from '@/components/product-grid';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';

const categories: Record<string, string> = {
  bouquets: 'Bouquets', roses: 'Roses', plantes: 'Plantes', 'paniers-de-fruits': 'Paniers de fruits',
  cadeaux: 'Cadeaux', mariages: 'Mariages', decoration: 'Décoration', 'deuil': 'Deuil',
  bougies: 'Bougies', vases: 'Vases & Bougies', occasions: 'Occasions spéciales', anniversaires: 'Anniversaires',
};

const contentSlugs = [...Object.keys(categories), 'recherche', 'evenements', 'livraison', 'a-propos', 'contact', 'faq', 'blog', 'conditions', 'confidentialite'];
export const dynamicParams = false;
export function generateStaticParams() { return contentSlugs.map((slug) => ({ slug })); }

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = categories[slug];
  if (title) return <CategoryPage title={title} slug={slug} />;
  if (slug === 'recherche') return <><main className="content-width page-main"><div className="page-copy"><h1>Recherche</h1><p>Recherchez un produit ou une catégorie dans la boutique.</p></div><CatalogClient /></main><SiteFooter /></>;
  if (slug === 'evenements') return <><main className="content-width page-main"><section className="page-banner shop-banner"><Image src="/images/mariage.webp" alt="Décoration florale de mariage" fill sizes="100vw" /><div><h1>Événements & mariages</h1><p>Des compositions florales pour vos célébrations et vos moments importants.</p></div></section><div className="content-links">{[['Mariages', '/mariages'], ['Anniversaires', '/anniversaires'], ['Décoration', '/decoration'], ['Deuil', '/deuil']].map(([label, href]) => <Link className="content-link-card" href={href} key={href}>{label}<ArrowRight size={16} /></Link>)}</div><div className="section-heading"><h2>Compositions pour vos événements</h2></div><ProductGrid products={products.filter((product) => product.category === 'Mariages')} /></main><SiteFooter /></>;
  if (slug === 'livraison') return <><main className="content-width page-main"><div className="page-copy"><span className="eyebrow">À Saly & Mbour</span><h1>La livraison de vos fleurs</h1><p>Choisissez une adresse à Saly ou Mbour et le mode de livraison qui vous convient au moment de la commande.</p></div><div className="info-card-grid"><article className="info-card"><h2>Livraison standard</h2><p>2 000 FCFA · Saly & Mbour</p><p>Le créneau disponible est choisi au checkout.</p></article><article className="info-card"><h2>Livraison express</h2><p>5 000 FCFA · Saly & Mbour</p><p>La disponibilité s’affiche au moment de la commande.</p></article></div><p className="muted-note">Pour une autre destination, contactez la boutique avant de passer commande.</p><Link className="button button-primary" href="/contact">Contacter la boutique <ArrowRight size={15} /></Link></main><SiteFooter /></>;
  if (slug === 'a-propos') return <><main className="content-width page-main"><div className="page-copy"><span className="eyebrow">Décofleur Plus</span><h1>Nature en élégance</h1><p>Fleuriste à Saly, Décofleur Plus propose des bouquets, plantes, décorations florales pour événements, paniers de fruits et idées cadeaux.</p><p>Chaque commande peut être personnalisée avec un message et un emballage cadeau.</p><Link className="button button-primary" href="/boutique">Découvrir la boutique <ArrowRight size={15} /></Link></div></main><SiteFooter /></>;
  if (slug === 'contact') return <><main className="content-width page-main"><div className="page-copy"><h1>Contactez-nous</h1><p>Une question sur une composition, une livraison ou un événement ? Écrivez à notre équipe.</p></div><div className="contact-layout"><section className="checkout-panel"><h2>Envoyez-nous un message</h2><ContactForm /></section><aside className="checkout-panel contact-details"><h2>La boutique</h2><p><MapPin size={16} /> Saly Portudal, Sénégal</p><p><Phone size={16} /> +221 77 941 78 60</p><Link href="/faq">Consulter les questions fréquentes</Link></aside></div></main><SiteFooter /></>;
  if (slug === 'faq') return <><main className="content-width page-main"><div className="page-copy"><h1>Questions fréquentes</h1></div><div className="faq-list"><details><summary>Où livrez-vous ?</summary><p>La livraison est proposée à Saly et Mbour. Contactez la boutique pour vérifier les autres destinations.</p></details><details><summary>Quels modes de paiement sont proposés ?</summary><p>Wave, Orange Money, Free Money, carte bancaire et paiement à la livraison sont affichés au checkout.</p></details><details><summary>Puis-je ajouter un message à mon bouquet ?</summary><p>Oui. La fiche produit permet d’ajouter une carte cadeau avec votre message personnalisé.</p></details><details><summary>Comment demander une composition pour un événement ?</summary><p>Contactez la boutique pour préciser la date, le lieu et votre demande de décoration florale.</p></details></div></main><SiteFooter /></>;
  if (slug === 'blog') return <><main className="content-width page-main"><div className="page-copy"><h1>Le journal Décofleur</h1></div><section className="empty-state"><h2>Aucun article disponible</h2><p>Les articles du journal seront publiés ici.</p></section></main><SiteFooter /></>;
  if (slug === 'conditions' || slug === 'confidentialite') return <><main className="content-width page-main"><div className="page-copy"><h1>{slug === 'conditions' ? 'Conditions Générales de Vente' : 'Politique de confidentialité'}</h1><p>Le texte officiel de ce document doit être fourni et validé par Décofleur Plus avant la mise en ligne.</p></div></main><SiteFooter /></>;
  notFound();
}

function CategoryPage({ title, slug }: { title: string; slug: string }) {
  return <><main className="content-width page-main"><section className="page-banner shop-banner"><Image src="/images/hero.webp" alt="Fleurs et compositions Décofleur Plus" fill sizes="100vw" /><div><h1>{title}</h1><p>Découvrez les créations Décofleur Plus pour cette catégorie.</p></div></section><div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><span>{title}</span></div><CatalogClient initialCategory={title} /><div className="category-crosslinks">{Object.entries(categories).filter(([other]) => other !== slug).slice(0, 6).map(([other, label]) => <Link href={`/${other}`} key={other}>{label}</Link>)}</div></main><SiteFooter /></>;
}
