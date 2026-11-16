import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Décofleur Plus · Nature en élégance',
    short_name: 'Décofleur',
    description: 'Bouquets, plantes, cadeaux et décoration florale à Saly et Mbour.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    // Fond de l'écran de démarrage, identique au fond blanc des icônes
    background_color: '#ffffff',
    theme_color: '#193e23',
    categories: ['shopping', 'lifestyle'],
    icons: [
      // Logo officiel sur fond blanc (générés depuis /logo_decofleur_transparent.png)
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Back-office Admin',
        short_name: 'Admin',
        description: 'Accès direct à la gestion Décofleur Plus',
        url: '/admin/tableau-de-bord',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Boutique & Fleurs',
        short_name: 'Boutique',
        description: 'Catalogue des créations florales',
        url: '/boutique',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
