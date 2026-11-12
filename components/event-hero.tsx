'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { HeroMockup } from '@/components/hero-mockup';
import { useActiveEvent } from '@/lib/hooks/use-active-event';
import { usePublicSettings } from '@/lib/hooks/use-public-settings';
import { whatsappHref } from '@/lib/shop-contact';

/** Hero de l'accueil : celui de l'événement saisonnier actif (back-office), sinon le hero standard. */
export function EventHero() {
  const { event } = useActiveEvent();
  const { settings } = usePublicSettings();

  if (!event) return <HeroMockup />;

  const whatsappUrl = settings
    ? whatsappHref(
        settings.boutique.whatsappNumber,
        event.whatsappMessage || `Bonjour, je souhaite des informations sur l'événement ${event.name}.`,
      )
    : '';

  const themeClass = `event-hero-theme-${event.themeColor || 'emerald'}`;

  return (
    <section
      className={`prototype-hero hero-with-bg event-hero-container ${themeClass}`}
      aria-label={`Événement à l'honneur : ${event.name}`}
    >
      {/* Background Floral Media with Smooth Fade */}
      <div className="hero-bg-media" aria-hidden="true">
        <Image
          src={event.bgImage || '/images/hero.jpg'}
          alt={event.name}
          fill
          priority
          className="hero-bg-img event-hero-bg-img"
          sizes="100vw"
        />
        <div className="hero-bg-overlay event-hero-overlay" />
      </div>

      <div className="content-width hero-inner event-hero-inner">
        <div className="hero-content-left event-hero-content">
          {/* Active Event Pill Badge */}
          <div className="event-hero-badge-wrap">
            {event.datesLabel && (
              <span className="event-hero-dates-badge">
                <Calendar size={12} />
                <span>{event.datesLabel}</span>
              </span>
            )}
          </div>

          {/* Dynamic Headline */}
          <h1 className="hero-headline event-hero-headline">
            {event.headline}{' '}
            <span className="headline-em event-hero-highlight">
              {event.headlineHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subline event-hero-subline">{event.subheadline}</p>

          {/* Actions: Primary CTA + Direct WhatsApp Ordering */}
          <div className="hero-actions event-hero-actions">
            <Link
              href={event.ctaLink || '/boutique'}
              className="button-pill-pink event-hero-cta-btn"
            >
              <span>{event.ctaText || 'Découvrir nos créations'}</span>
              <ArrowRight size={17} />
            </Link>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-pill-outline event-hero-whatsapp-btn"
              >
                <WhatsAppIcon size={18} />
                <span>Commander sur WhatsApp</span>
              </a>
            )}
          </div>

          {/* Reassurance Micro-banner */}
          {event.discountNote && (
            <div className="event-hero-note">
              <Clock size={13} className="text-[#a8793b]" />
              <span>{event.discountNote}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
