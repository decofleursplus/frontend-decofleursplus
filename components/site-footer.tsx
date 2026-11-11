'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Heart } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from '@/components/icons';
import { BrandLogo } from '@/components/brand-logo';
import { SITE_CONFIG } from '@/lib/seo/config';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  }

  return (
    <footer className="bg-[#152e1e] text-neutral-200 pt-10 pb-24 md:pb-8 mt-12 border-t border-[#1e442c]" role="contentinfo">
      <div className="content-width">
        {/* Main 5-Column Grid matching the mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 items-start pb-8 border-b border-white/10">
          {/* Col 1: Brand Logo & Tagline */}
          <div className="lg:col-span-1 flex flex-col justify-start">
            <BrandLogo variant="dark" />
            <p className="mt-3 text-[12px] text-neutral-400 leading-relaxed font-sans">
              Maison florale d’exception · Saly Portudal, Petite Côte, Sénégal
            </p>
          </div>

          {/* Col 2: Liens rapides (inline with pipes matching mockup) */}
          <div className="lg:col-span-1">
            <h4 className="font-serif font-bold text-[15px] text-white tracking-wide mb-3">
              Liens rapides
            </h4>
            <div className="text-[13px] text-neutral-300 font-sans space-y-2">
              <p className="flex items-center gap-1.5 flex-wrap">
                <Link href="/" className="hover:text-[#f472b6] transition-colors">Accueil</Link>
                <span className="text-white/30">|</span>
                <Link href="/a-propos" className="hover:text-[#f472b6] transition-colors">À propos</Link>
                <span className="text-white/30">|</span>
                <Link href="/contact" className="hover:text-[#f472b6] transition-colors">Contact</Link>
              </p>
              <p className="flex items-center gap-1.5 flex-wrap">
                <Link href="/conditions" className="hover:text-[#f472b6] transition-colors">CGV</Link>
                <span className="text-white/30">|</span>
                <Link href="/confidentialite" className="hover:text-[#f472b6] transition-colors">Mentions légales</Link>
              </p>
            </div>
          </div>

          {/* Col 3: Suivez-nous */}
          <div className="lg:col-span-1">
            <h4 className="font-serif font-bold text-[15px] text-white tracking-wide mb-3">
              Suivez-nous
            </h4>
            <div className="flex items-center gap-2.5">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Déco Fleurs Plus"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c8436e] flex items-center justify-center text-white transition-all duration-300"
              >
                <FacebookIcon size={15} />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Déco Fleurs Plus"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c8436e] flex items-center justify-center text-white transition-all duration-300"
              >
                <InstagramIcon size={15} />
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Déco Fleurs Saly"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c8436e] flex items-center justify-center text-white transition-all duration-300"
              >
                <TikTokIcon size={15} />
              </a>
              <a
                href={SITE_CONFIG.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Déco Fleurs Plus"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center text-white transition-all duration-300"
              >
                <WhatsAppIcon size={15} />
              </a>
            </div>
          </div>

          {/* Col 4: Newsletter with dark input and pink square button */}
          <div className="lg:col-span-1">
            <h4 className="font-serif font-bold text-[15px] text-white tracking-wide mb-3">
              Inscrivez-vous à notre newsletter
            </h4>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 text-[12px] text-pink-300 bg-pink-900/30 px-3 py-2 rounded-lg border border-pink-700/50">
                <Check size={14} /> Merci pour votre inscription !
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex items-center max-w-[260px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                  aria-label="Votre adresse e-mail"
                  className="w-full bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-[12px] text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#c8436e]"
                />
                <button
                  type="submit"
                  aria-label="Valider inscription newsletter"
                  className="w-9 h-[34px] bg-[#c8436e] hover:bg-[#b5355e] text-white rounded-r-lg flex items-center justify-center transition-colors shrink-0"
                >
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Col 5: Right Calligraphic Quote with Heart */}
          <div className="lg:col-span-1 lg:text-right flex flex-col lg:items-end justify-center">
            <p className="font-serif italic text-[14px] text-neutral-300 leading-snug">
              Des fleurs fraîches,<br />
              un service d’exception<br />
              pour vos plus beaux moments.
            </p>
            <div className="flex items-center gap-2 mt-2 text-[#c8436e]" aria-hidden="true">
              <span className="w-8 h-[1px] bg-[#c8436e]/60" />
              <Heart size={14} className="fill-[#c8436e] text-[#c8436e]" />
              <span className="w-8 h-[1px] bg-[#c8436e]/60" />
            </div>
          </div>
        </div>

        {/* Local SEO Zones Bar */}
        <div className="pt-6 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-y-2 text-[12px] text-neutral-400 font-sans">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/70 font-semibold">Livraison &amp; Services locaux :</span>
            <Link href="/fleuriste-saly" className="hover:text-[#f472b6] transition-colors">Fleuriste Saly</Link>
            <span className="text-white/20">·</span>
            <Link href="/fleuriste-dakar" className="hover:text-[#f472b6] transition-colors">Fleuriste Dakar</Link>
            <span className="text-white/20">·</span>
            <Link href="/fleuriste-somone" className="hover:text-[#f472b6] transition-colors">Fleuriste Somone</Link>
            <span className="text-white/20">·</span>
            <Link href="/fleuriste-mbour" className="hover:text-[#f472b6] transition-colors">Fleuriste Mbour</Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-neutral-400">
            <Link href="/blog" className="hover:text-[#f472b6] transition-colors">Blog Floral</Link>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1">
              <Link href="/paysagisme" className="hover:text-[#f472b6] transition-colors">Paysagisme</Link>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">À venir</span>
            </span>
            <span className="text-white/20">·</span>
            <Link href="/location" className="hover:text-[#f472b6] transition-colors">Location événementielle</Link>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
          <span>© {new Date().getFullYear()} Décofleur Plus · Tous droits réservés</span>
          <span>Saly Portudal & Mbour · Petite Côte, Sénégal</span>
        </div>
      </div>
    </footer>
  );
}
