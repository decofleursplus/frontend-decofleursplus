'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Heart, ShieldCheck, Truck, Flower2, Minus, Plus, Star } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/components/cart-provider';

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState('Moyen');
  const [quantity, setQuantity] = useState(1);
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(true);
  const [notice, setNotice] = useState('');
  const sizePrice = product.price + (size === 'Petit' ? -10000 : size === 'Grand' ? 10000 : 0);
  const price = sizePrice + (messageEnabled ? 2000 : 0) + (giftWrap ? 3000 : 0);

  function addItem() {
    add({ ...product, price }, quantity, { size, cardMessage: messageEnabled ? message : '', giftWrap });
    setNotice('Votre bouquet a été ajouté au panier.');
    window.setTimeout(() => setNotice(''), 2200);
  }

  return (
    <div className="product-detail-layout">
      <div className="detail-gallery"><div className="detail-thumbnails"><Image src={product.image} alt="Vue du bouquet" width={72} height={72} /><Image src={product.image} alt="Détail de la composition" width={72} height={72} /><Image src="/images/bouquet-blanc.webp" alt="Composition florale" width={72} height={72} /></div><div className="detail-main-photo"><Image src={product.image} alt={product.name} fill priority sizes="560px" /></div></div>
      <section className="detail-info"><div className={`stock-pill ${product.inStock ? '' : 'out-of-stock'}`}>{product.inStock ? <><Check size={13} /> En stock</> : 'Indisponible'}</div><h1>{product.name}</h1><div className="detail-rating"><span><Star size={15} fill="currentColor" /> {product.rating}</span> ({product.reviews} avis clients)</div><strong className="detail-price">{formatPrice(sizePrice)}</strong><p className="detail-description">{product.description}</p>
        <fieldset className="size-choice"><legend>Choisissez la taille</legend><div>{[['Petit', product.price - 10000], ['Moyen', product.price], ['Grand', product.price + 10000]].map(([label, amount]) => <button type="button" key={String(label)} className={size === label ? 'selected' : ''} onClick={() => setSize(String(label))}><b>{label}</b><span>{formatPrice(Number(amount))}</span></button>)}</div></fieldset>
        <label className="option-check"><input type="checkbox" checked={messageEnabled} onChange={(event) => setMessageEnabled(event.target.checked)} /> Ajouter une carte cadeau (+ 2 000 FCFA)</label>
        {messageEnabled && <label className="message-field">Votre message personnalisé<textarea maxLength={200} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Écrivez votre message ici…" /><small>{message.length}/200 caractères</small></label>}
        <label className="option-check"><input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} /> Emballage premium (+ 3 000 FCFA)</label>
        <div className="add-row"><div><span>Quantité</span><div className="quantity-stepper"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Réduire la quantité"><Minus size={14} /></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)} aria-label="Augmenter la quantité"><Plus size={14} /></button></div></div><button className="button button-primary add-detail-button" onClick={addItem} disabled={!product.inStock}>{product.inStock ? 'Ajouter au panier' : 'Indisponible'}</button><button className="favorite-large" aria-label="Ajouter aux favoris"><Heart size={19} /></button></div>
        {notice && <p className="success-note" role="status">{notice}</p>}
        <div className="detail-perks"><div><Flower2 /><span>Fleurs fraîches<small>sélectionnées avec soin</small></span></div><div><Truck /><span>Livraison à Saly & Mbour<small>Rapide et fiable</small></span></div><div><ShieldCheck /><span>Paiement sécurisé<small>Wave, Orange Money</small></span></div></div>
      </section>
      <aside className="detail-note"><h3>Une attention qui fait la différence</h3><p>Ajoutez un message personnalisé et rendez votre cadeau unique.</p></aside>
    </div>
  );
}
