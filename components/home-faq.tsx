import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { getPublicSettings, type PublicShopSettings } from '@/lib/api/settings';
import { formatPrice } from '@/lib/products';

function paymentAnswer(settings: PublicShopSettings | null): string {
  if (!settings) return 'Les moyens de paiement disponibles sont affichés à l’étape de paiement de votre commande.';
  const p = settings.payments;
  const methods = [p.wave && 'Wave', p.orangeMoney && 'Orange Money', p.card && 'la carte bancaire', p.cash && 'le paiement en espèces à la livraison'].filter(
    Boolean,
  ) as string[];
  const list = methods.length > 1 ? `${methods.slice(0, -1).join(', ')} et ${methods[methods.length - 1]}` : methods[0];
  const cap = p.cash && p.cashMaxAmount ? ` (paiement à la livraison jusqu’à ${formatPrice(p.cashMaxAmount)})` : '';
  return `Nous acceptons ${list}${cap}. Le choix se fait à l’étape de paiement de votre commande.`;
}

/** Les réponses qui dépendent des réglages de la boutique (paiements, tarifs des options) sont lues dans les paramètres. */
function buildFaq(settings: PublicShopSettings | null) {
  const cardFee = settings ? formatPrice(settings.orderOptions.cardMessageFee) : null;
  return [
    {
      q: 'Où livrez-vous vos bouquets et paniers de fruits ?',
      a: 'Nous livrons sur la Petite Côte (Saly Portudal, Mbour, Ngaparou, La Somone) et jusqu’à Dakar selon nos zones de livraison. Les tarifs et délais de chaque zone sont détaillés sur la page Livraison et calculés automatiquement dans votre panier.',
    },
    { q: 'Quels sont les modes de paiement acceptés ?', a: paymentAnswer(settings) },
    {
      q: 'Puis-je joindre une carte avec un message personnalisé ?',
      a: `Oui. Sur la fiche produit, cochez l’option « carte message »${cardFee ? ` (${cardFee} par article)` : ''} et saisissez votre texte : notre équipe le joint à votre composition.`,
    },
    {
      q: 'Comment s’organise la décoration d’un mariage ou d’une réception ?',
      a: 'Pour vos événements (mariages, anniversaires, dîners de gala), nous proposons un accompagnement sur mesure : arche florale, centres de table, allée nuptiale et bouquet de la mariée. Faites une demande de devis gratuite au moins 2 à 4 semaines à l’avance : vous recevez notre proposition chiffrée dans votre espace client.',
    },
    {
      q: 'Comment fonctionne le programme de fidélité ?',
      a: 'Avec un compte client, chaque commande livrée vous rapporte 1 point par tranche de 100 FCFA. Vos points et votre niveau (Bronze, Argent, Or, Platine) sont visibles dans « Ma fidélité ».',
    },
    {
      q: 'Puis-je suivre ma commande ?',
      a: 'Oui : depuis « Mes commandes », suivez chaque étape (préparation, prise en charge par le livreur, livraison) et recevez des notifications à chaque changement de statut.',
    },
  ];
}

export async function HomeFaq() {
  const settings = await getPublicSettings().catch(() => null);
  const faq = buildFaq(settings);

  return (
    <section id="faq" className="homepage-faq-section content-width" aria-label="Questions fréquentes">
      <div className="homepage-faq-header">
        <div className="section-eyebrow">
          <HelpCircle size={16} />
          <span>Besoin d’aide ?</span>
        </div>
        <h2>Questions Fréquentes (FAQ)</h2>
        <p>Retrouvez les réponses essentielles sur nos créations florales, nos livraisons sur la Petite Côte et nos modes de paiement.</p>
      </div>

      <div className="faq-list">
        {faq.map(({ q, a }) => (
          <details key={q} className="faq-accordion-item">
            <summary className="faq-summary">
              <span>{q}</span>
            </summary>
            <div className="faq-answer">
              <p>{a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="homepage-faq-footer">
        <div className="faq-footer-card">
          <div>
            <h3>Une question particulière ou un projet d’événement ?</h3>
            <p>Notre équipe est à votre disposition pour vous conseiller.</p>
          </div>
          <div className="faq-footer-actions">
            <Link href="/contact" className="button-pill-pink button-small">
              Nous contacter <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
