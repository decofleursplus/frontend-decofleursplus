'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, Heart, ShieldCheck, Truck, Flower2, Minus, Plus, Star, FileText } from 'lucide-react';
import { defaultVariant, formatPrice, isQuoteOnly, type Product } from '@/lib/products';
import { useCart } from '@/components/cart-provider';
import { ProductReviews } from '@/components/product-reviews';
import { usePublicSettings } from '@/lib/hooks/use-public-settings';

const MESSAGE_MAX = 500;

export function ProductDetail({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite } = useCart();
  const { settings } = usePublicSettings();
  const isFavorite = favorites.includes(product.id);
  const quoteOnly = isQuoteOnly(product);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const [variantId, setVariantId] = useState(defaultVariant(product)?.id ?? '');
  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) ?? null, [product.variants, variantId]);
  const stock = variant?.stockQuantity ?? 0;
  const available = Boolean(variant) && stock > 0 && !quoteOnly;

  const [quantity, setQuantity] = useState(1);
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [notice, setNotice] = useState('');

  const giftWrapFee = settings?.orderOptions.giftWrapFee ?? null;
  const cardMessageFee = settings?.orderOptions.cardMessageFee ?? null;
  const unitPrice = variant?.price ?? product.price;
  const oldPrice = variant ? variant.oldPrice : product.oldPrice ?? null;
  const optionsTotal = (giftWrap ? giftWrapFee ?? 0 : 0) + (messageEnabled && message.trim() ? cardMessageFee ?? 0 : 0);
  const total = unitPrice * quantity + optionsTotal;

  function selectVariant(id: string) {
    setVariantId(id);
    const next = product.variants.find((v) => v.id === id);
    if (next) setQuantity((q) => Math.max(1, Math.min(q, next.stockQuantity || 1)));
  }

  function addItem() {
    if (!variant || !available) return;
    add(product, variant, quantity, { giftWrap, cardMessage: messageEnabled ? message : '' });
    setNotice(`${quantity} × ${product.name}${product.variants.length > 1 ? ` (${variant.name})` : ''} ajouté au panier.`);
    window.setTimeout(() => setNotice(''), 3000);
  }

  return (
    <div className="product-detail-layout">
      <div className="detail-gallery">
        <div className="detail-thumbnails">
          {images.map((img, idx) => (
            <button
              key={img + idx}
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
          <Image src={selectedImage} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 580px" className="main-detail-img" />
          {product.badge && (
            <span className={`product-badge ${product.badgeType === 'discount' ? 'discount' : 'new'}`}>{product.badge}</span>
          )}
        </div>
      </div>

      <section className="detail-info">
        <div className="detail-meta-top">
          {quoteOnly ? (
            <div className="stock-pill in-stock">
              <FileText size={13} /> Réalisation sur devis
            </div>
          ) : (
            <div className={`stock-pill ${available ? 'in-stock' : 'out-of-stock'}`}>
              {available ? (
                <>
                  <Check size={13} /> {stock <= 5 ? `Plus que ${stock} en stock` : 'En stock'}
                </>
              ) : (
                'Épuisé pour le moment'
              )}
            </div>
          )}
          {variant?.sku && <span className="product-ref">Réf : {variant.sku}</span>}
        </div>

        <h1 className="detail-title">{product.name}</h1>

        <div className="detail-rating">
          {product.reviews > 0 ? (
            <>
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
              <span className="rating-count">
                ({product.reviews} avis client{product.reviews > 1 ? 's' : ''})
              </span>
            </>
          ) : (
            <span className="rating-count">Aucun avis pour le moment</span>
          )}
        </div>

        <div className="detail-pricing-row">
          <strong className="detail-price">{formatPrice(unitPrice)}</strong>
          {oldPrice && <span className="detail-old-price">{formatPrice(oldPrice)}</span>}
          {!quoteOnly && (quantity > 1 || optionsTotal > 0) && <span className="detail-subtotal">Total : {formatPrice(total)}</span>}
        </div>
        {product.promotion && (
          <p className="text-xs font-semibold text-rose-700 mt-1">
            {product.promotion.badgeText || product.promotion.name} : −{product.promotion.discountPercentage}% déjà appliqués
          </p>
        )}

        <p className="detail-description">{product.description}</p>

        {quoteOnly ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900 space-y-3">
            <p>
              Cette création est réalisée sur mesure. Décrivez votre projet : nous vous envoyons une proposition chiffrée.
            </p>
            <Link href={`/devis?produit=${encodeURIComponent(product.slug)}`} className="button-pill-pink button-large inline-flex">
              Demander un devis
            </Link>
          </div>
        ) : (
          <>
            {product.variants.length > 1 && (
              <fieldset className="size-choice">
                <legend>Choisir la taille :</legend>
                <div className="size-buttons-group">
                  {product.variants.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      className={`size-select-btn ${variantId === v.id ? 'selected' : ''}`}
                      onClick={() => selectVariant(v.id)}
                      disabled={v.stockQuantity <= 0}
                      aria-pressed={variantId === v.id}
                      title={v.stockQuantity <= 0 ? 'Épuisé' : undefined}
                    >
                      <span className="size-btn-name">{v.name}</span>
                      <span className="size-btn-price">{v.stockQuantity > 0 ? formatPrice(v.price) : 'Épuisé'}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="customization-options">
              <label className="option-checkbox-row">
                <input type="checkbox" checked={messageEnabled} onChange={(e) => setMessageEnabled(e.target.checked)} />
                <span className="checkbox-custom"></span>
                <span className="option-label">
                  Ajouter une carte avec votre message
                  {cardMessageFee !== null && <strong> (+ {formatPrice(cardMessageFee)})</strong>}
                </span>
              </label>

              {messageEnabled && (
                <div className="message-field-box">
                  <label htmlFor="card-message">Votre message pour le destinataire :</label>
                  <textarea
                    id="card-message"
                    maxLength={MESSAGE_MAX}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez quelques mots…"
                    rows={3}
                  />
                  <div className="char-counter">
                    {message.length}/{MESSAGE_MAX} caractères
                  </div>
                </div>
              )}

              <label className="option-checkbox-row">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
                <span className="checkbox-custom"></span>
                <span className="option-label">
                  Emballage cadeau
                  {giftWrapFee !== null && <strong> (+ {formatPrice(giftWrapFee)})</strong>}
                </span>
              </label>
            </div>
          </>
        )}

        <div className="detail-add-row">
          {!quoteOnly && (
            <div className="quantity-control-box">
              <span className="qty-label">Quantité</span>
              <div className="quantity-stepper">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Réduire la quantité">
                  <Minus size={14} />
                </button>
                <span className="qty-number" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))}
                  disabled={quantity >= stock}
                  aria-label="Augmenter la quantité"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {!quoteOnly && (
            <button type="button" className="button-pill-pink button-large flex-1" onClick={addItem} disabled={!available}>
              {available ? 'Ajouter au panier' : 'Épuisé'}
            </button>
          )}

          <button
            type="button"
            className={`favorite-large-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={() => toggleFavorite(product)}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFavorite}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {notice && (
          <div className="detail-success-notice" role="status">
            <Check size={18} /> {notice}{' '}
            <Link href="/panier" className="underline font-semibold">
              Voir le panier
            </Link>
          </div>
        )}

        <div className="detail-perks">
          <div className="perk-item">
            <Flower2 size={20} />
            <div>
              <strong>Fleurs fraîches</strong>
              <small>Composées à l’atelier</small>
            </div>
          </div>
          <div className="perk-item">
            <Truck size={20} />
            <div>
              <strong>Livraison ou retrait</strong>
              <small>Tarifs selon votre zone</small>
            </div>
          </div>
          <div className="perk-item">
            <ShieldCheck size={20} />
            <div>
              <strong>Prix garantis</strong>
              <small>Montant confirmé au panier</small>
            </div>
          </div>
        </div>

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
