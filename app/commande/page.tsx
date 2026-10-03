'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Check, LockKeyhole, Truck } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/products';
import { SiteFooter } from '@/components/site-footer';

type Delivery = 'standard' | 'express';
type Payment = 'wave' | 'orange' | 'free' | 'card' | 'delivery';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [delivery, setDelivery] = useState<Delivery>('standard');
  const [payment, setPayment] = useState<Payment>('wave');
  const [notice, setNotice] = useState('');
  const [promo, setPromo] = useState('');
  const [promoFeedback, setPromoFeedback] = useState('');
  const shipping = delivery === 'standard' ? 2000 : 5000;

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Vos informations sont enregistrées pour cette démonstration. Le paiement n’est pas encore connecté.');
  }

  return <><main className="content-width page-main checkout-page"><div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><Link href="/panier">Panier</Link><span>›</span><span>Finaliser ma commande</span></div><div className="checkout-heading"><h1>Finaliser ma commande</h1><p>Renseignez vos informations pour compléter votre achat en toute sécurité.</p></div>{items.length ? <form className="checkout-layout" onSubmit={submitOrder}>
    <div className="checkout-form-column"><section className="checkout-panel"><h2>1. Adresse de livraison</h2><div className="checkout-fields"><label>Nom complet<input required autoComplete="name" placeholder="Votre nom et prénom" /></label><label>Téléphone<input required autoComplete="tel" inputMode="tel" placeholder="+221 77 000 00 00" /></label><label className="field-full">Adresse de livraison<input required autoComplete="street-address" placeholder="Quartier, rue, repère…" /></label><label>Ville<select defaultValue="Saly"><option>Saly</option><option>Mbour</option><option>Autre</option></select></label><label>Code postal<input autoComplete="postal-code" placeholder="Optionnel" /></label></div></section>
      <section className="checkout-panel"><h2>2. Mode de livraison</h2><div className="delivery-options"><label className={delivery === 'standard' ? 'delivery-option selected' : 'delivery-option'}><input type="radio" name="delivery" value="standard" checked={delivery === 'standard'} onChange={() => setDelivery('standard')} /><Truck /><span><b>Livraison standard</b><small>Livraison sous 24–48h · Saly & Mbour</small></span><strong>2 000 FCFA</strong></label><label className={delivery === 'express' ? 'delivery-option selected' : 'delivery-option'}><input type="radio" name="delivery" value="express" checked={delivery === 'express'} onChange={() => setDelivery('express')} /><Truck /><span><b>Livraison express</b><small>Livraison le jour même · Saly & Mbour</small></span><strong>5 000 FCFA</strong></label></div></section>
      <section className="checkout-panel"><h2>3. Date et heure de livraison</h2><div className="checkout-fields"><label>Date de livraison<input type="date" required /></label><label>Créneau horaire<select defaultValue="Entre 10h et 14h"><option>Entre 10h et 14h</option><option>Entre 14h et 18h</option></select></label><label className="field-full">Instructions (optionnel)<input placeholder="Ex. Laisser à la réception, appeler avant l’arrivée…" /></label></div></section>
    </div>
    <div className="checkout-payment-column"><section className="checkout-panel"><h2>4. Mode de paiement</h2><div className="payment-options">{([['wave', 'Wave'], ['orange', 'Orange Money'], ['free', 'Free Money'], ['card', 'Carte bancaire (Visa, Mastercard)'], ['delivery', 'Paiement à la livraison']] as [Payment, string][]).map(([value, label]) => <label className={payment === value ? 'payment-option selected' : 'payment-option'} key={value}><input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} /><span className={`payment-logo ${value}`}>{value === 'card' ? 'VISA' : value === 'delivery' ? '•••' : label.split(' ')[0]}</span><span>{label}</span>{payment === value && <Check size={14} />}</label>)}</div><button className="button button-primary pay-button" type="submit"><LockKeyhole size={15} /> Payer maintenant</button><p className="secure-note"><LockKeyhole size={13} /> Vos informations restent privées et sécurisées.</p></section></div>
    <aside className="checkout-panel checkout-recap"><h2>Récapitulatif de la commande</h2>{items.map(({ product, quantity, lineId, options }) => <div className="recap-item" key={lineId}><div className="recap-image"><Image src={product.image} alt={product.name} fill sizes="64px" /></div><span>{product.name}<small>Quantité : {quantity}{options ? ` · Taille : ${options.size ?? 'Standard'}` : ''}</small>{options?.cardMessage && <small>Carte cadeau : Oui</small>}{options?.giftWrap && <small>Emballage premium : Oui</small>}</span><strong>{formatPrice(product.price * quantity)}</strong></div>)}<div className="recap-line"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div><div className="recap-line"><span>Livraison ({delivery === 'standard' ? 'Standard' : 'Express'})</span><span>{formatPrice(shipping)}</span></div><div className="recap-total"><b>Total</b><strong>{formatPrice(subtotal + shipping)}</strong></div><div className="checkout-promo"><label className="promo-mini">Code promo<input placeholder="Entrer votre code" value={promo} onChange={(event) => setPromo(event.target.value)} /></label><button type="button" className="button button-outline" onClick={() => setPromoFeedback(promo ? 'La vérification des codes promo n’est pas connectée dans cet aperçu.' : 'Entrez un code promo.')}>Appliquer</button></div>{promoFeedback && <p className="promo-feedback" role="status">{promoFeedback}</p>}<label className="terms-check"><input type="checkbox" required /> J’accepte les Conditions Générales de Vente et la Politique de confidentialité.</label></aside>
    {notice && <p className="checkout-notice" role="status">{notice} <Link href="/commande/confirmation">Voir l’aperçu de confirmation →</Link></p>}
  </form> : <section className="cart-empty"><h1>Votre panier est vide</h1><p>Ajoutez un produit avant de finaliser votre commande.</p><Link className="button button-primary" href="/boutique">Découvrir la boutique</Link></section>}</main><SiteFooter /></>;
}
