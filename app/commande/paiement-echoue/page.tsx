import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';

export default function PaymentFailedPage() {
  return <><main className="content-width page-main state-page"><span className="state-icon error"><CircleAlert size={28} /></span><h1>Paiement non effectué</h1><p>Le paiement n’a pas été confirmé. Vérifiez le mode choisi ou contactez la boutique avant de réessayer.</p><div className="state-actions"><Link className="button button-primary" href="/commande">Retour au paiement</Link><Link className="button button-outline" href="/contact">Contacter la boutique</Link></div></main><SiteFooter /></>;
}
