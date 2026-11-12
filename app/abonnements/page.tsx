import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SubscriptionForm } from '@/components/subscription-form';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getServiceSchema } from '@/lib/seo/schema';
import { getSubscriptionDeliveryZones } from '@/lib/api/subscriptions';

export const metadata: Metadata = constructMetadata({
  title: 'Abonnements Floraux pour Villas & Entreprises | Saly, Dakar & Petite-Côte',
  description:
    'Formules d’abonnements floraux hebdomadaires et bimensuels au Sénégal : livraison de fleurs fraîches, vases prêtés et renouvelés sur la Petite-Côte et à Dakar.',
  canonical: '/abonnements',
  image: '/images/hero.jpg',
  keywords: [
    'abonnement floral dakar',
    'abonnement fleurs saly',
    'fleurs villa saly portudal',
    'fleurissement entreprise senegal',
    'livraison fleurs reguliere',
  ],
});

export default async function AbonnementsPage() {
  // Zones réellement desservies (paramétrées dans le back-office). En cas d'échec, la FAQ
  // renvoie simplement vers le formulaire, qui affiche lui-même l'erreur de chargement.
  const zoneNames = await getSubscriptionDeliveryZones()
    .then((zones) => zones.map((zone) => zone.name))
    .catch(() => [] as string[]);

  const subscriptionServiceSchema = getServiceSchema({
    name: 'Abonnements Floraux & Végétaux Récurrents',
    description:
      'Livraison régulière de compositions florales de prestige avec rotation de vases de collection pour particuliers, villas et entreprises à Saly, Dakar et Petite-Côte.',
    url: '/abonnements',
    image: '/images/hero.jpg',
  });

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Abonnements Floraux' },
  ];

  const faqs = [
    {
      q: 'Comment se passe le paiement de l’abonnement ?',
      a: 'Aucun paiement en ligne n’est demandé à la souscription. Vous indiquez le mode de règlement souhaité (espèces à la livraison ou transfert mobile), puis notre équipe vous contacte pour confirmer l’abonnement et convenir du règlement avant le premier passage. Un email récapitulatif vous est envoyé dès l’enregistrement.',
    },
    {
      q: 'Puis-je mettre en pause mon abonnement pendant un voyage ?',
      a: 'Oui. Si vous avez souscrit en étant connecté à votre compte, la suspension et la reprise se font depuis votre espace client, rubrique « Abonnements ». Sinon, contactez notre équipe (coordonnées en bas de page) : pendant la suspension, aucun passage n’est effectué.',
    },
    {
      q: 'Comment fonctionne le prêt et l’échange des vases ?',
      a: 'À chaque passage, votre livreur DécoFleur Plus dépose votre composition dans un vase propre et garni d’eau, et récupère le vase précédent. Aucun vase à stocker ni à nettoyer.',
    },
    {
      q: 'Quelles sont les zones de livraison couvertes ?',
      a:
        zoneNames.length > 0
          ? `Nous livrons actuellement nos abonnements dans les zones suivantes : ${zoneNames.join(', ')}. La livraison est incluse dans le prix de la formule.`
          : 'Les zones desservies sont proposées à l’étape « Livraison » du formulaire ci-dessus. La livraison est incluse dans le prix de la formule.',
    },
    {
      q: 'L’abonnement est-il avec ou sans engagement ?',
      a: 'Tous nos abonnements sont sans engagement : vous pouvez les suspendre ou les résilier à tout moment. Pour changer de formule ou de rythme, contactez notre équipe.',
    },
  ];

  return (
    <>
      <JsonLd data={subscriptionServiceSchema} />
      <main className="content-width page-main abonnements-page-main">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />

        {/* Compact Header (Above the fold) */}
        <header className="abonnements-compact-header">
          <div className="abo-eyebrow">SERVICES FLORAUX RÉCURRENTS · SALY &amp; PETITE CÔTE</div>
          <h1 className="abo-title">Abonnements Floraux &amp; Végétaux</h1>
          <p className="abo-subtitle">
            Choisissez votre formule. Vases prêtés et renouvelés, sans engagement.
          </p>
        </header>

        {/* 4-Step Interactive Flow that fits strictly in the viewport */}
        <SubscriptionForm defaultPlan="particulier" />

        {/* Compact Practical FAQ */}
        <section className="abonnements-compact-faq">
          <h2 className="faq-compact-title">Questions fréquentes sur les abonnements</h2>
          <div className="faq-compact-grid">
            {faqs.map((faq, idx) => (
              <details key={idx} className="faq-compact-item">
                <summary className="faq-compact-q">
                  <span>{faq.q}</span>
                </summary>
                <p className="faq-compact-a">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
