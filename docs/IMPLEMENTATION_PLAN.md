# Décofleur Plus — Implementation Plan

## Portée et références

- [x] Inspecter le dépôt — Dépôt initial sans code applicatif ; prompt, règles, maquettes, logo et PDF présents.
- [x] Lire `rules.md` et `propmt1.md` — Le mockup est la référence visuelle principale ; conformité stricte aux règles de qualité.
- [x] Extraire et relire le cahier des charges — 11 pages converties en images haute résolution et lues intégralement. Intégration de toutes les exigences : paiements (Wave, Orange Money, Free Money, Carte, Espèces), zones de livraison Saly & Mbour, personnalisation (carte message, emballage), programme de fidélité, blog floral, contact WhatsApp.
- [x] Examiner les mockups et le logo — Prototype 1536x1024 reproduit à 100% : barre d’annonces, top bar, hero floral avec cursive, bandeau 7 catégories, section split avec bannière événementielle, 4 produits phares, badges réassurance, encart carte cadeau, témoignages clients et footer complet.

## Phase 1 — Foundation

- [x] Initialiser Next.js App Router, React, TypeScript et Tailwind — `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `app/`. Build de production réussi.
- [x] Définir les tokens et styles globaux — `app/globals.css`. Palette forêt (#19331C) / rose signature (#DE2A6B) / crème (#FDF8F5), échelle typographique agrandie selon demande utilisateur, espacements, focus et reduced motion.
- [x] Intégrer le logo et la hiérarchie typographique — `public/logo_decofleur.jpeg`, `app/layout.tsx`, styles globaux. Typographie serif Georgia pour les titres d’exception et sans-serif moderne pour le texte.
- [x] Définir les types et données cohérentes — `lib/products.ts`. Produits alignés avec précision sur la maquette : Bouquet Élégance Rose (-10%, 25 000 FCFA), Panier de fruits tropicaux (18 000 FCFA), Centre de table mariage (-15%, 35 000 FCFA), Coffret cadeau luxe (22 000 FCFA), tailles (Petit, Moyen, Grand), dimensions, références.

## Phase 2 — Composants partagés

- [x] Construire le shell desktop et mobile — `components/site-header.tsx`, `components/site-footer.tsx`. Barre d’annonces supérieure avec réseaux sociaux, recherche centrale, navigation avec dropdowns interactifs, menu tiroir mobile et barre de navigation mobile inférieure (5 onglets).
- [x] Extraire les primitives UI — Boutons pill signature rose, icônes SVG de marques (Facebook, Instagram, TikTok, YouTube, WhatsApp), étoiles de notation, badges promotions/nouveau, accordéons FAQ.
- [x] Finaliser les composants commerce — `components/product-card.tsx`, `components/product-grid.tsx`, `components/product-detail.tsx`, `components/catalog-client.tsx`, `components/cart-provider.tsx`. Bouton « Ajouter au panier » pleine largeur, galerie photos avec bascule d’aperçu, choix des tailles et message personnalisé.
- [x] Ajouter les interactions principales et les animations sobres — Micro-interactions au survol, bascule des favoris, persistance du panier, bouton d’assistance WhatsApp flottant.

## Phase 3 — Parcours e-commerce public

- [x] Accueil — `/`. Reproduction exacte du prototype desktop et mobile : Hero, bandeau 7 catégories, bannière mariages, grille des 4 produits vedettes, réassurance, carte cadeau, témoignages étoiles et footer.
- [x] Boutique, catégories, recherche et filtres — `/boutique`, `/categories/[slug]`, pages catégories et `/recherche`. Filtres de prix, catégorie, disponibilité, tri et état vide.
- [x] Fiche produit — `/produits/[slug]`. Galerie multi-angles, sélection de taille avec calcul dynamique du prix, carte message calligraphiée (+2 000 FCFA), emballage signature (+3 000 FCFA), stock et recommandations.
- [x] Favoris et panier — `/favoris`, `/panier`. Persistance locale, calculs dynamiques de livraison et TVA, code promo instantané.
- [x] Livraison, paiement, checkout et états de commande — `/livraison`, `/commande`, `/commande/confirmation`, `/commande/paiement-echoue`. Choix de créneaux, modes Standard/Express/Retrait boutique, modes de paiement Wave, Orange Money, CB et espèces.

## Phase 4 — Compte client

- [x] Authentification frontend — `/connexion`, `/inscription`, `/mot-de-passe-oublie`.
- [x] Espace client, commandes et suivi — `/compte`, `/compte/commandes`, `/compte/commandes/[id]`, `/compte/suivi/[id]`. Carte de livraison de Saly/Mbour intégrée en haute résolution.
- [x] Profil, adresses, favoris, avis et notifications — Sections `/compte/*`, formulaire de préférences.
- [x] Fidélité, coupons, parrainage et cartes cadeaux — Niveaux Bronze, Argent, Or, Platine et historique de points fidélité.

## Phase 5 — Contenu et états système

- [x] Événements et catégories — `/evenements`, `/mariages`, `/decoration`, `/deuil`, `/anniversaires`, `/plantes`, `/cadeaux`, `/bougies`, `/vases`, `/occasions`.
- [x] Pages institutionnelles enrichies —
  - `/a-propos` : Grande photo d’atelier à Saly, histoire de la maison florale, engagements et valeurs artisanales.
  - `/contact` : Repositionné et sublimé avec coordonnées complètes (Route de la Plage Saly, téléphone direct, horaires Lun-Dim), bouton WhatsApp instantané et formulaire avec sélecteur de sujet.
  - `/faq` : Accordéons interactifs traitant des livraisons, paiements Wave/OM, commandes depuis l'étranger, garanties de fraîcheur et événements.
  - `/livraison` : Grille tarifaire Standard (2 000 FCFA), Express (5 000 FCFA) et Retrait boutique gratuit, avec carte de couverture géographique.
- [x] Blog et articles floraux — `/blog`. 4 articles complets et pertinents : entretien sous le climat de Saly, mariages sur la Petite Côte, corbeilles de fruits tropicaux et plantes dépolluantes.
- [x] États système — `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, gestion des états vides et confirmation.

## Phase 6 — Validation et finition

- [x] Vérifier TypeScript, ESLint et build — `pnpm exec tsc --noEmit` sans erreur, `pnpm lint` sans avertissement, `pnpm build` avec 69/69 routes générées avec succès.
- [x] Comparer visuellement chaque page aux mockups — Captures d’écran Chromium à 1536 px (Desktop) et 390 px (Mobile iPhone) validées et conformes au prototype.
- [x] Vérifier clavier, focus, contraste, reduced motion et débordements — Aucun débordement horizontal, contrastes WCAG respectés, interactions fluides.
- [x] Maintenir `docs/IMPLEMENTATION_STATUS.md` — Statut complet à jour.

## Phase 8 — Tableaux de Bord & Conformité Collage UI (Collage-2.png)

- [x] 8.1. Carrousel Témoignages : centrer le titre « ♡ Ils nous font confiance » et disposer les flèches de navigation (`<` et `>`) de part et d'autre des cartes sur la même ligne horizontale (`components/testimonial-carousel.tsx`, `app/globals.css`).
- [x] 8.2. FAQ Homepage : centrer les bandes d'accordéons dans un conteneur dédié de 840px max et limiter l'affichage aux 5 questions essentielles (`components/home-faq.tsx`).
- [x] 8.3. Navigation & Page FAQ : retirer l'entrée FAQ du menu déroulant « À propos » et du tiroir mobile (`components/site-header.tsx`), et supprimer la page dédiée `/faq` avec redirection permanente vers l'ancre `/#faq` (`app/[slug]/page.tsx`).
- [x] 8.4. Suivi de Commande (`/compte/suivi/[id]`) : intégrer le stepper 4 étapes avec le jalon « En livraison » actif (`Commande confirmée` -> `Préparation en cours` -> `En livraison` (actif) -> `Livrée`), reproduire la carte du livreur Moussa Ndiaye (note 4.8★, boutons Appel direct et WhatsApp), la carte d'itinéraire Saly/Mbour et la sélection des canaux de notification (`app/compte/suivi/[id]/page.tsx`).
- [x] 8.5. Mon Compte (`/compte`) : reproduire l'interface complète du cadran supérieur gauche du collage (carte de profil Fatou Ba, 4 cartes de métriques : 12 commandes, 28 500 pts, Niveau Gold, 3 adresses, tableau de commandes récentes avec boutons d'actions contextuels « Voir les détails », « Suivre », « Facture PDF », et modules Mes adresses / Mes favoris).
- [x] 8.6. Finaliser ma Commande (`/commande`) : reproduire les 5 étapes numérotées du cadran inférieur gauche (1. Adresse de livraison enregistrée, 2. Mode de livraison Standard/Express avec recherche cartographique Saly/Mbour, 3. Date et créneau horaire, 4. Instructions livreur, 5. Mode de paiement avec badges officiels Wave, Orange Money, Carte Bancaire et Espèces), récapitulatif détaillé avec code promo et bouton de paiement sécurisé.
- [x] 8.7. Programme de Fidélité (`/compte/fidelite`) : reproduire fidèlement le cadran inférieur droit (citation calligraphiée fleurie, carte héro Gold 28 500 pts avec jauge vers Platinum, grille des 4 statuts avec pourcentages de remise, liste des 5 avantages Gold exclusifs, historique de points, coupons actifs `GOLD15` et `LIVRAISON`, et bloc parrainage avec code et partage direct).
- [x] 8.8. Validation technique et captures d'écran Chromium : validation sans faute de `tsc` et `eslint`, génération de 69/69 routes statiques sous Next.js Turbopack, et captures d'écran Chromium validées pour chaque section.



