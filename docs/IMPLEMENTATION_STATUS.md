# Décofleur Plus — Implementation Status

## Completed

- Socle Next.js 16.3.8 App Router, React 19.3, TypeScript 6 et Tailwind CSS 4.
- Shell client partagé avec recherche, navigation, panier et favoris.
- Accueil, boutique, recherche/filtres, catégories, fiches produit, favoris, panier et checkout frontend.
- Tailles, carte/message, emballage, quantités, prix, favoris et paniers distincts préservés entre les pages via `localStorage`.
- Authentification frontend, dashboard compte, commandes/suivi et sections adresses, profil, fidélité, avis, notifications, cartes cadeaux, coupons et parrainage.
- Pages événements, catégories, livraison, à propos, contact, FAQ, états de confirmation/échec, chargement, erreur, indisponibilité et 404.
- Slugs dynamiques limités aux routes disponibles ; chemins invalides contrôlés HTTP 404.
- Dernière vérification : `pnpm lint`, `pnpm exec tsc --noEmit` et `pnpm build` réussis. Routes principales et routes 404 contrôlées ; interactions recherche, filtres, panier, variantes, favoris, persistance et soumission checkout exercées dans Chromium desktop.
- `README.md` documente démarrage et commandes de validation.

## In progress

- Revue visuelle finale face aux captures à 1536 px. Géométrie et absence de débordement vérifiées sur plusieurs parcours dans Chromium ; inspection directe de la capture bloquée par le prévisualiseur local.
- Extraction des composants UI en une bibliothèque dédiée ; la plupart des contrôles sont actuellement stylés dans `app/globals.css`.

## Remaining

- Lire les exigences métier du cahier des charges numérisé ; une version texte/OCR est nécessaire.
- Ajouter les articles du blog à partir de contenu validé.
- Terminer l’audit visuel/accessibilité complet pour toutes les pages.
- Relier les formulaires, compte, panier, inventaire, commandes, coupons, notifications et paiement aux services métier quand ils seront disponibles.
- Ne pas commencer le responsive mobile/PWA ni le back-office dans cette phase.

## Known issues

- Aucune API/backend d’authentification ou de commande n’est connecté. Le checkout et les chiffres du dashboard sont des démonstrations clairement étiquetées.
- Le PDF « Cahiers de charges DécofleurPlus » est une numérisation sans couche texte ; `pdftotext` ne permet pas de le relire et Tesseract n’est pas installé.
- Le lanceur sandbox échoue avec « mountinfo path is not absolute » pour les outils filesystem. Les commandes ont été exécutées avec le contournement d’accès autorisé ; la configuration du lanceur est hors du dépôt.
- Le prévisualiseur d’images local échoue sur la même panne sandbox, empêchant l’inspection finale des captures Chromium.

## Important decisions

- Les visuels floraux affichés sont des recadrages des mockups fournis ; le logo original est utilisé tel quel.
- Les comptes de catégories sont calculés sur les huit produits intégrés, sans prétendre disposer des 124 produits de la maquette.
- Les exemples de commande/fidélité issus des captures sont signalés comme démonstration.
- Le checkout affiche les options du mockup, mais ne prétend pas créer une commande ou effectuer un paiement.
