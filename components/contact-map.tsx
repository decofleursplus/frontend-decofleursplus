'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Car } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/config';

/** `address` vient des paramètres de la boutique ; le repère utilise les coordonnées de la configuration du site. */
export function ContactMap({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const lat = SITE_CONFIG.geo.latitude;
  const lon = SITE_CONFIG.geo.longitude;

  function copyAddress() {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;

  // OpenStreetMap embed coordinates for Saly Portudal
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.025}%2C${lat - 0.018}%2C${lon + 0.025}%2C${lat + 0.018}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="contact-map-wrapper">
      <div className="contact-map-header">
        <div className="flex items-center gap-2">
          <span className="contact-map-pin-icon" aria-hidden="true">
            <MapPin size={16} />
          </span>
          <span className="font-semibold text-sm text-[#1A341E]">
            Localisation de la Boutique
          </span>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
          Saly Portudal
        </span>
      </div>

      {/* Interactive Map Iframe */}
      <div className="contact-map-frame-container">
        <iframe
          title="Carte DécoFleur Plus Saly Portudal"
          src={osmEmbedUrl}
          className="contact-map-iframe"
          loading="lazy"
        />

        {/* Floating marker overlay */}
        <div className="contact-map-overlay-badge">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs text-[#1A341E]">DécoFleur Plus</span>
          </div>
          <span className="text-[11px] text-gray-600 block mt-0.5">{address}</span>
        </div>
      </div>

      {/* Action buttons below map */}
      <div className="contact-map-actions">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-action-btn map-action-google"
          title="Ouvrir dans Google Maps"
        >
          <Navigation size={13} />
          <span>Google Maps</span>
          <ExternalLink size={11} className="opacity-60" />
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-action-btn map-action-waze"
          title="Itinéraire Waze"
        >
          <Car size={13} />
          <span>Waze</span>
          <ExternalLink size={11} className="opacity-60" />
        </a>

        <button
          type="button"
          onClick={copyAddress}
          className="map-action-btn map-action-copy"
          title="Copier l’adresse complète"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-700" />
              <span className="text-emerald-800 font-semibold">Copiée !</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copier l’adresse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
