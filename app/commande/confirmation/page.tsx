import Link from 'next/link';
import { Check, Flower2 } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';

export default function OrderConfirmationPage() {
  return <><main className="content-width page-main state-page"><span className="state-icon success"><Check size={28} /></span><span className="demo-note">Aperçu de démonstration</span><h1>Confirmation de commande</h1><p>Cette interface montre l’étape qui suivra une confirmation réelle. Aucun paiement ni commande n’a été créé depuis cette démonstration.</p><div className="state-actions"><Link className="button button-primary" href="/boutique">Continuer mes achats</Link><Link className="button button-outline" href="/compte/commandes">Voir mes commandes</Link></div><Flower2 className="state-flower" /></main><SiteFooter /></>;
}
