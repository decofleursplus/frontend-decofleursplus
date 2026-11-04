import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SubscriptionForm } from '@/components/subscription-form';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getServiceSchema } from '@/lib/seo/schema';

export const metadata: Metadata = constructMetadata({
  title: 'Abonnements Floraux pour Villas & Entreprises | Saly, Dakar & Petite-Côte',
  description:
    'Formules d’abonnements floraux hebdomadaires et bimensuels au Sénégal : livraison de fleurs fraîches, vases design prêtés et renouvelés à Saly, Somone et Dakar.',
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

export default function AbonnementsPage() {
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
      q: 'Puis-je mettre en pause mon abonnement pendant un voyage ?',
      a: 'Oui. Un simple message WhatsApp au +221 77 941 78 60 au moins 48h avant votre livraison suffit pour suspendre vos passages sans aucun frais.',
    },
    {
      q: 'Comment fonctionne le prêt et l’échange des vases ?',
      a: 'À chaque passage, votre livreur DécoFleur Plus dépose votre composition dans un vase propre et garni d’eau, et récupère le vase précédent. Aucun vase à stocker ni à nettoyer.',
    },
    {
      q: 'Quelles sont les zones de livraison couvertes ?',
      a: 'Nous livrons nos abonnements à Saly Portudal, Saly Niakhniakhal, Mbour, Ngaparou, La Somone et Dakar.',
    },
    {
      q: 'L’abonnement est-il avec ou sans engagement ?',
      a: 'Tous nos abonnements sont 100% sans engagement. Vous pouvez changer de formule, espacer les livraisons ou résilier à tout moment sans préavis.',
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
            Choisissez votre formule. Vases de collection prêtés et renouvelés, sans engagement.
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
