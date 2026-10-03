import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';

export default function NotFound() {
  return <><main className="content-width cart-empty"><span className="eyebrow">404 · Page introuvable</span><h1>Cette page a fané</h1><p>Le lien demandé n’existe plus ou a été déplacé. Retrouvez nos fleurs et compositions depuis la boutique.</p><Link className="button button-primary" href="/boutique">Retourner à la boutique</Link></main><SiteFooter /></>;
}
