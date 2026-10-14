'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaRegistration() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosInstallHelp, setIosInstallHelp] = useState(false);

  useEffect(() => {
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.register('/sw.js').catch(() => {
          // The storefront remains usable when offline support is unavailable.
        });
      }
    };
    if ('serviceWorker' in navigator) {
      if (document.readyState === 'complete') registerServiceWorker();
      else window.addEventListener('load', registerServiceWorker, { once: true });
    }

    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIosInstallHelp(false);
    };
    const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const iosHelpTimer = window.setTimeout(() => setIosInstallHelp(isAppleMobile && !isStandalone), 0);
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('load', registerServiceWorker);
      window.clearTimeout(iosHelpTimer);
    };
  }, []);

  if ((!installPrompt && !iosInstallHelp) || dismissed) return null;

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setInstallPrompt(null);
  }

  return (
    <aside className="pwa-install-banner" aria-label="Installer Décofleur Plus">
      <span className="pwa-install-mark" aria-hidden="true">
        <Image src="/logo_decofleur.jpeg" alt="" width={42} height={42} style={{ width: 'auto' }} />
      </span>
      <span className="pwa-install-copy"><strong>Décofleur Plus</strong><small>{iosInstallHelp ? 'Dans Safari : Partager, puis « Sur l’écran d’accueil ».' : 'Ajoutez la boutique à votre écran d’accueil.'}</small></span>
      {installPrompt && <button className="pwa-install-action" onClick={() => void install()}><Download size={16} /> Installer</button>}
      <button className="pwa-install-dismiss" onClick={() => setDismissed(true)} aria-label="Masquer" type="button"><X size={17} /></button>
    </aside>
  );
}
