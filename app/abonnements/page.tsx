import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SubscriptionForm } from '@/components/subscription-form';

export const metadata: Metadata = {
  title: 'Abonnements Floraux — DécoFleur Plus Saly',
  description:
    'Abonnements floraux pour particuliers, villas, hôtels et entreprises à Saly et Mbour. Livraison hebdomadaire ou bimensuelle de fleurs fraîches avec vase inclus.',
};

export default function AbonnementsPage() {
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
      <main className="content-width page-main abonnements-page-main">
        {/* Compact Breadcrumb */}
        <div className="breadcrumbs">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Abonnements Floraux</span>
        </div>

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
