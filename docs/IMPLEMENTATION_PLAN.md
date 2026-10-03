# Décofleur Plus — Implementation Plan

## Portée et références

- [x] Inspecter le dépôt — Dépôt initial sans code applicatif ; prompt, règles, maquettes, logo et PDF présents.
- [x] Lire `rules.md` et `propmt1.md` — Le mockup est la référence visuelle principale ; le scope est le frontend client desktop.
- [ ] Extraire et relire le cahier des charges — Le PDF de 11 pages est numérisé et `pdftotext` n’en extrait rien ; une lecture/OCR reste nécessaire.
- [x] Examiner les mockups et le logo — Les captures montrent les parcours e-commerce, compte client, suivi, checkout et fidélité ; logo fourni intégré.

## Phase 1 — Foundation

- [x] Initialiser Next.js App Router, React, TypeScript et Tailwind — `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `app/`. Build de production réussi.
- [x] Définir les tokens et styles globaux — `app/globals.css`. Palette forêt/rose/crème, échelle typographique, espacements, focus et reduced motion présents.
- [x] Intégrer le logo et la hiérarchie typographique — `public/logo_decofleur.jpeg`, `app/layout.tsx`, styles globaux. Logo conservé sans déformation ; Georgia/Arial système.
- [x] Définir les types et données cohérentes — `lib/products.ts`. Huit produits du mockup restent identiques entre accueil, catalogue, fiche et panier.

## Phase 2 — Composants partagés

- [x] Construire le shell desktop — `components/site-header.tsx`, `components/site-footer.tsx`. Topbar, recherche, navigation, compte, favoris, panier et footer ; liens natifs clavier.
- [ ] Extraire les primitives UI — Boutons, champs, prix, notes, fil d’Ariane et états sont stylés, mais la bibliothèque réutilisable dédiée reste à consolider.
- [ ] Finaliser les composants commerce — `components/product-card.tsx`, `components/product-grid.tsx`, `components/catalog-client.tsx`, `components/cart-provider.tsx`, `components/account-sidebar.tsx`. Cartes et grille réutilisées ; cartes catégorie et lignes panier restent intégrées aux pages.
- [x] Ajouter les interactions principales et les animations sobres — Hover/focus, états de formulaire, panier/favoris persistants, animation contrôlée par `prefers-reduced-motion`.

## Phase 3 — Parcours e-commerce public

- [x] Accueil — `/`. Hero, catégories, services et produits phares construits ; route et grille vérifiées dans Chromium.
- [x] Boutique, catégories, recherche et filtres — `/boutique`, `/categories/[slug]`, pages catégorie et `/recherche`. Recherche, filtres de prix, catégorie, disponibilité, nouveauté, tri et état vide vérifiés.
- [x] Fiche produit — `/produits/[slug]`. Tailles, carte/message, emballage, disponibilité, favoris et ajout panier implémentés ; variantes testées dans Chromium.
- [x] Favoris et panier — `/favoris`, `/panier`. Favoris/panier stockés localement ; quantité, options, total et panier vide vérifiés.
- [x] Livraison, paiement, checkout et états de commande — `/livraison`, `/commande`, `/commande/confirmation`, `/commande/paiement-echoue`. Formulaire, choix de livraison/paiement et récapitulatif testés ; l’interface précise qu’aucun paiement réel n’est connecté.

## Phase 4 — Compte client

- [x] Authentification frontend — `/connexion`, `/inscription`, `/mot-de-passe-oublie`. Formulaires et validations de navigateur ; service de compte non connecté.
- [x] Espace client, commandes et suivi — `/compte`, `/compte/commandes`, `/compte/commandes/[id]`, `/compte/suivi/[id]`. Écrans de démonstration issus du mockup.
- [x] Profil, adresses, favoris, avis et notifications — Sections `/compte/*`, plus `/favoris`. Formulaires, état vide et préférences présents.
- [x] Fidélité, coupons, parrainage et cartes cadeaux — Sections `/compte/fidelite`, `/compte/coupons`, `/compte/parrainage`, `/compte/cartes-cadeaux`. Valeurs reprises du mockup étiquetées « démo » ; offres non fournies présentées comme indisponibles.

## Phase 5 — Contenu et états système

- [x] Événements et catégories — `/evenements`, `/mariages`, `/decoration`, `/deuil`, `/anniversaires`, `/plantes`, `/cadeaux`, `/bougies`, `/vases`, `/occasions` et autres catégories prévues. Contenu limité aux produits disponibles dans les maquettes.
- [x] Pages institutionnelles — `/a-propos`, `/contact`, `/faq`, `/livraison`. Formulaire de contact et retours d’état présents ; CGV/confidentialité signalées à valider.
- [ ] Blog et articles — `/blog` dispose d’un état vide ; aucun article source n’a été fourni.
- [x] États système — `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, fiche produit indisponible, paiement échoué, confirmation de démonstration et états vides.

## Phase 6 — Validation et finition desktop

- [x] Vérifier TypeScript, ESLint et build — `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` réussis sur le dernier état.
- [ ] Comparer visuellement chaque page desktop aux mockups — La capture Chromium est générée, mais le prévisualiseur local échoue sur la panne sandbox `mountinfo`.
- [ ] Vérifier complètement clavier, focus, contraste, reduced motion et débordements — Recherche, filtres, panier, favoris, variantes et checkout testés en Chromium à 1536 px ; revue visuelle/accessibilité complète à faire.
- [x] Maintenir `docs/IMPLEMENTATION_STATUS.md` — État, limites et décisions mis à jour.

## Décisions et limites

- Cette phase couvre seulement le frontend client desktop ; responsive mobile/PWA et back-office exclus.
- Le dépôt d’origine ne contenait pas de code ; l’application a été créée sans migration.
- Le cahier des charges reste à lire : le PDF est numérisé et aucun outil OCR n’est disponible dans l’environnement.
- Authentification, commandes, stock, coupons, notifications, livraison et paiement ne sont reliés à aucun backend.
- Les images florales du site sont des extraits des images fournies dans les maquettes ; les nombres de fidélité/commandes visibles sont étiquetés comme démonstration.
- Les routes dynamiques limitent les slugs aux valeurs disponibles et les chemins inconnus renvoient HTTP 404.
