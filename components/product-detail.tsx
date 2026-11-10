'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Heart, ShieldCheck, Truck, Flower2, Minus, Plus, Star, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/components/cart-provider';
import { ProductReviews } from '@/components/product-reviews';

export function ProductDetail({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite } = useCart();
  const isFavorite = favorites.includes(product.id);

  // Gallery
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  // Options
  const availableSizes = product.sizes || [
    { name: 'Petit', label: 'Petit', priceDelta: -5000 },
    { name: 'Moyen', label: 'Moyen - Standard', priceDelta: 0 },
    { name: 'Grand', label: 'Grand', priceDelta: 8000 },
  ];
  const [selectedSize, setSelectedSize] = useState(availableSizes.find((s) => s.name === 'Moyen')?.name || availableSizes[0].name);
  const [quantity, setQuantity] = useState(1);
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(true);
  const [notice, setNotice] = useState('');

  const currentSizeObj = availableSizes.find((s) => s.name === selectedSize) || availableSizes[0];
  const sizePrice = product.price + currentSizeObj.priceDelta;
  const unitPrice = sizePrice + (messageEnabled ? 2000 : 0) + (giftWrap ? 3000 : 0);
  const totalPrice = unitPrice * quantity;

  function addItem() {
    add(
      { ...product, price: unitPrice },
      quantity,
      {
        size: selectedSize,
        cardMessage: messageEnabled ? message : '',
        giftWrap,
      }
    );
    setNotice('Ajouté avec succès au panier !');
    window.setTimeout(() => setNotice(''), 2500);
  }

  return (
    <div className="product-detail-layout">
      {/* 1. Gallery Section */}
      <div className="detail-gallery">
        <div className="detail-thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`detail-thumb-btn ${selectedImage === img ? 'active' : ''}`}
              onClick={() => setSelectedImage(img)}
              aria-label={`Afficher l'image ${idx + 1}`}
            >
              <Image src={img} alt={`Aperçu ${idx + 1}`} width={74} height={74} className="thumb-img" />
            </button>
          ))}
        </div>
        <div className="detail-main-photo">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 580px"
            className="main-detail-img"
          />
          {product.badge && (
            <span className={`product-badge ${product.badge.startsWith('-') ? 'discount' : 'new'}`}>
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* 2. Info Section */}
      <section className="detail-info">
        <div className="detail-meta-top">
          <div className={`stock-pill ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
            {product.inStock ? (
              <>
                <Check size={13} /> En stock à l’atelier de Saly
              </>
            ) : (
              'Indisponible actuellement'
            )}
          </div>
          {product.reference && <span className="product-ref">Réf : {product.reference}</span>}
        </div>

        <h1 className="detail-title">{product.name}</h1>

        <div className="detail-rating">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'}
                stroke={i < Math.round(product.rating) ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
          <span className="rating-score">{product.rating.toFixed(1)}</span>
          <span className="rating-count">({product.reviews} avis clients)</span>
        </div>

        <div className="detail-pricing-row">
          <strong className="detail-price">{formatPrice(unitPrice)}</strong>
          {product.oldPrice && <span className="detail-old-price">{formatPrice(product.oldPrice)}</span>}
          {quantity > 1 && <span className="detail-subtotal">Total : {formatPrice(totalPrice)}</span>}
        </div>

        {product.dimensions && (
          <div className="dimensions-info">
            <Sparkles size={14} /> <span>Dimensions : {product.dimensions}</span>
          </div>
        )}

        <p className="detail-description">{product.description}</p>

        {/* Size Selection */}
        <fieldset className="size-choice">
          <legend>Choisir la taille :</legend>
          <div className="size-buttons-group">
            {availableSizes.map((s) => {
              const adjusted = product.price + s.priceDelta;
              const isSelected = selectedSize === s.name;
              return (
                <button
                  type="button"
                  key={s.name}
                  className={`size-select-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(s.name)}
                >
                  <span className="size-btn-name">{s.name}</span>
                  <span className="size-btn-price">{formatPrice(adjusted)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Customization Options */}
        <div className="customization-options">
          <label className="option-checkbox-row">
            <input
              type="checkbox"
              checked={messageEnabled}
              onChange={(e) => setMessageEnabled(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="option-label">
              Ajouter une carte cadeau personnalisée <strong>(+ 2 000 FCFA)</strong>
            </span>
          </label>

          {messageEnabled && (
            <div className="message-field-box">
              <label htmlFor="card-message">Votre message calligraphié pour le destinataire :</label>
              <textarea
                id="card-message"
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez vos quelques mots d'émotion ici…"
                rows={3}
              />
              <div className="char-counter">{message.length}/200 caractères</div>
            </div>
          )}

          <label className="option-checkbox-row">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="option-label">
              Emballage cadeau signature Décofleur Plus <strong>(+ 3 000 FCFA)</strong>
            </span>
          </label>
        </div>

        {/* Add to Cart Row */}
        <div className="detail-add-row">
          <div className="quantity-control-box">
            <span className="qty-label">Quantité</span>
            <div className="quantity-stepper">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Réduire la quantité"
              >
                <Minus size={14} />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Augmenter la quantité"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="button-pill-pink button-large flex-1"
            onClick={addItem}
            disabled={!product.inStock}
          >
            {product.inStock ? `Ajouter au panier` : 'Indisponible'}
          </button>

          <button
            type="button"
            className={`favorite-large-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={() => toggleFavorite(product.id)}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {notice && (
          <div className="detail-success-notice" role="status">
            <Check size={18} /> {notice}
          </div>
        )}

        {/* Reassurance Row */}
        <div className="detail-perks">
          <div className="perk-item">
            <Flower2 size={20} />
            <div>
              <strong>Fleurs fraîches</strong>
              <small>Coupées du jour</small>
            </div>
          </div>
          <div className="perk-item">
            <Truck size={20} />
            <div>
              <strong>Livraison Saly & Mbour</strong>
              <small>Ponctualité garantie</small>
            </div>
          </div>
          <div className="perk-item">
            <ShieldCheck size={20} />
            <div>
              <strong>Paiement sécurisé</strong>
              <small>Wave, Orange Money</small>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Ratings Accordion */}
        <ProductReviews
          productId={product.id}
          productName={product.name}
          initialRating={product.rating}
          initialReviewsCount={product.reviews}
        />
      </section>
    </div>
  );
}
