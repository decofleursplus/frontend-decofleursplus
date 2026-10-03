import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const faqList = [
  {
    q: 'Où livrez-vous vos bouquets et paniers de fruits ?',
    a: 'Nous livrons quotidiennement sur toute la Petite Côte : Saly Portudal, Mbour, Ngaparou et La Somone. Pour une expédition vers Dakar ou une autre région du Sénégal, veuillez contacter notre équipe avant de valider votre panier.',
  },
  {
    q: 'Quels sont les modes de paiement acceptés ?',
    a: 'Nous acceptons Wave, Orange Money, Free Money, les cartes bancaires internationales (Visa, Mastercard), Apple Pay, ainsi que le paiement en espèces à la livraison pour les commandes confirmées.',
  },
  {
    q: 'Puis-je joindre une carte avec un message personnalisé ?',
    a: 'Absolument ! Lors de l’ajout du bouquet à votre panier ou au moment du checkout, vous pouvez cocher l’option Carte Cadeau personnalisée (+2 000 FCFA) et saisir votre texte. Notre équipe calligraphiera votre message avec le plus grand soin.',
  },
  {
    q: 'Comment s’organise la décoration d’un mariage ou d’une réception ?',
    a: 'Pour vos événements (mariages, anniversaires, dîners de gala), nous proposons un accompagnement sur mesure : arche florale, centres de table, allée nuptiale et bouquet de la mariée. Contactez-nous au moins 2 à 4 semaines à l’avance pour une visite de lieu et un devis personnalisé.',
  },
  {
    q: 'Quels sont vos délais de livraison à Saly et Mbour ?',
    a: 'La livraison standard est réalisée sur un créneau défini lors du passage de commande (matin ou après-midi). En cas d’urgence, notre service Express livre vos fleurs en moins de 90 minutes sur Saly et Mbour.',
  },
  {
    q: 'Comment fonctionne le programme de fidélité Décofleur Plus ?',
    a: 'Chaque commande passée vous rapporte des points fidélité (1 point pour chaque 1 000 FCFA dépensés). Selon votre statut (Bronze, Argent, Or, Platine), vous bénéficiez de réductions exclusives allant jusqu’à -20% et de livraisons offertes.',
  },
  {
    q: 'Vos fleurs et corbeilles de fruits sont-elles garanties fraîches ?',
    a: 'Oui, nous nous approvisionnons quotidiennement auprès de producteurs et grossistes sélectionnés. En cas de constat d’anomalie à la réception, notre service client remplace immédiatement votre composition ou vous rembourse.',
  },
  {
    q: 'Puis-je commander depuis l’étranger pour faire livrer un proche à Saly ?',
    a: 'Oui, c’est très fréquent ! De nombreux clients de la diaspora commandent depuis la France, l’Europe ou l’Amérique du Nord pour faire livrer un proche résidant ou en vacances à Saly. Vous pouvez régler par carte bancaire ou Wave et nous nous occupons de la surprise.',
  },
];

export function HomeFaq() {
  const topFiveFaq = faqList.slice(0, 5);

  return (
    <section id="faq" className="homepage-faq-section content-width" aria-label="Questions fréquentes">
      <div className="homepage-faq-header">
        <div className="section-eyebrow">
          <HelpCircle size={16} />
          <span>Besoin d’aide ?</span>
        </div>
        <h2>Questions Fréquentes (FAQ)</h2>
        <p>
          Retrouvez les réponses essentielles sur nos créations florales, nos livraisons sur la Petite Côte et nos modes de paiement sécurisés.
        </p>
      </div>

      <div className="faq-list">
        {topFiveFaq.map(({ q, a }, i) => (
          <details key={i} className="faq-accordion-item">
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
            <p>Notre équipe à Saly Portudal est à votre disposition 7j/7 pour vous conseiller.</p>
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
