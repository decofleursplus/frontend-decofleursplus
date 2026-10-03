'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Gift, Star, TicketPercent, UsersRound } from 'lucide-react';

const content: Record<string, { title: string; description: string }> = {
  adresses: { title: 'Mes adresses', description: 'Gérez les adresses utilisées pour vos livraisons.' },
  informations: { title: 'Mes informations', description: 'Mettez à jour vos coordonnées personnelles.' },
  fidelite: { title: 'Programme de fidélité', description: 'Retrouvez votre niveau, vos points et les avantages associés.' },
  avis: { title: 'Mes avis', description: 'Retrouvez les avis laissés sur vos achats.' },
  notifications: { title: 'Mes notifications', description: 'Choisissez comment recevoir les nouvelles de vos commandes.' },
  'cartes-cadeaux': { title: 'Mes cartes cadeaux', description: 'Consultez et gérez vos cartes cadeaux.' },
  coupons: { title: 'Mes coupons', description: 'Retrouvez les offres associées à votre compte.' },
  parrainage: { title: 'Parrainez vos proches', description: 'Partagez Décofleur Plus avec vos proches.' },
};

export function AccountSection({ section }: { section: string }) {
  const page = content[section];
  const [notice, setNotice] = useState('');
  if (!page) return <section className="account-panel"><h1>Rubrique indisponible</h1><Link href="/compte">Retour au tableau de bord</Link></section>;
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice('Vos modifications sont prêtes. Connectez-vous pour les enregistrer sur votre compte.'); }
  return <><div className="account-title-row"><div><h1 className="account-title">{page.title}</h1><p className="account-intro">{page.description}</p></div><span className="demo-note">Aperçu démo</span></div>
    {section === 'adresses' && <section className="account-panel"><div className="address-preview"><b>Adresse de démonstration — Saly</b>Route de Saly, Résidence les Palmiers<br />Saly, Mbour · Sénégal</div><form className="account-form" onSubmit={submit}><h2>Ajouter une adresse</h2><label>Nom de l’adresse<input required placeholder="Maison, bureau…" /></label><label>Adresse<input required autoComplete="street-address" /></label><div className="checkout-fields"><label>Ville<input required /></label><label>Téléphone<input required inputMode="tel" /></label></div><button className="button button-outline" type="submit">Ajouter cette adresse</button>{notice && <p className="success-note" role="status">{notice}</p>}</form></section>}
    {section === 'informations' && <form className="account-panel account-form" onSubmit={submit}><h2>Coordonnées du compte</h2><div className="checkout-fields"><label>Prénom<input autoComplete="given-name" required /></label><label>Nom<input autoComplete="family-name" required /></label><label>Adresse e-mail<input type="email" autoComplete="email" required /></label><label>Téléphone<input inputMode="tel" autoComplete="tel" required /></label></div><button className="button button-primary" type="submit">Enregistrer les modifications</button>{notice && <p className="success-note" role="status">{notice}</p>}</form>}
    {section === 'fidelite' && <><section className="loyalty-demo"><div><span>Votre niveau actuel</span><strong>Gold</strong><b>28 500 points</b><small>Aperçu de démonstration</small></div><p>Bronze<br /><b>0 — 10 000 pts</b></p><p>Silver<br /><b>10 000 — 25 000 pts</b></p><p>Gold<br /><b>25 000 — 50 000 pts</b></p><p>Platinum<br /><b>50 000+ pts</b></p></section><section className="account-panel"><h2>Vos avantages Gold</h2><p className="account-intro">Les seuils et avantages présentés sont ceux de la maquette.</p><div className="benefit-row"><span>−15% sur les produits</span><span>Livraison prioritaire</span><span>Offres exclusives</span></div></section></>}
    {section === 'avis' && <section className="empty-state account-panel"><Star size={23} /><h2>Aucun avis pour le moment</h2><p>Vos avis apparaîtront ici après vos achats.</p></section>}
    {section === 'notifications' && <form className="account-panel notification-options" onSubmit={submit}><h2>Préférences de notification</h2><p className="account-intro">Recevez des mises à jour sur vos commandes selon vos préférences.</p>{['SMS', 'WhatsApp', 'E-mail'].map((item) => <label key={item}><input type="checkbox" defaultChecked={item !== 'E-mail'} /> {item}</label>)}<button className="button button-outline" type="submit">Enregistrer mes préférences</button>{notice && <p className="success-note" role="status">{notice}</p>}</form>}
    {section === 'cartes-cadeaux' && <section className="empty-state account-panel"><Gift size={24} /><h2>Aucune carte cadeau enregistrée</h2><p>Vos cartes cadeaux apparaîtront ici.</p><Link className="button button-outline" href="/cadeaux">Voir les idées cadeaux</Link></section>}
    {section === 'coupons' && <section className="account-panel"><div className="coupon-demo"><TicketPercent /><div><strong>Offre de démonstration</strong><span>Les coupons seront affichés quand ils seront associés à votre compte.</span></div></div></section>}
    {section === 'parrainage' && <section className="account-panel referral-demo"><UsersRound size={25} /><h2>Partagez Décofleur Plus</h2><p>Le lien de parrainage apparaîtra lorsque le programme sera activé pour votre compte.</p><button className="button button-outline" type="button" disabled>Copier mon lien</button></section>}
  </>;
}
