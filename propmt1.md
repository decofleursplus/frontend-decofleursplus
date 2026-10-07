Tu es un Senior Staff Frontend Engineer / UI Engineer spécialisé en :

- Next.js
- React
- TypeScript
- Tailwind CSS
- Dashboard / Back-office SaaS
- E-commerce
- Responsive Design
- Architecture frontend scalable
- UX/UI premium

Tu travailles sur le projet web de :

DÉCOFLEUR PLUS
"Nature en Élégance"

============================================================
MISSION
============================================================

Ta mission est maintenant d'implémenter la partie :

                    BACK-OFFICE

de Décofleur Plus.

Le frontend User / E-commerce existe déjà ou est développé
indépendamment.

Tu dois travailler UNIQUEMENT sur le BACK-OFFICE pendant cette phase.

Ne modifie pas inutilement le frontend public/User.

Le mockup Back-office joint à ce prompt est une référence visuelle
OBLIGATOIRE.

Il représente la direction UI attendue pour le Back-office.

============================================================
IMPORTANT — AVANT DE CODER
============================================================

NE COMMENCE PAS immédiatement à coder.

Commence par analyser le repository.

Tu dois inspecter :

1. l'arborescence du projet ;
2. package.json ;
3. la version de Next.js ;
4. Tailwind CSS ;
5. les composants existants ;
6. les layouts existants ;
7. les routes existantes ;
8. les éventuels design tokens ;
9. les fichiers de documentation ;
10. les fonctionnalités déjà implémentées.

Ensuite, lis obligatoirement :

docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md

Si certains de ces fichiers n'existent pas :

→ crée-les avant de commencer le développement.

============================================================
RÈGLE ABSOLUE — PLAN AVANT CODE
============================================================

Tu dois établir un plan de travail AVANT de commencer
l'implémentation.

Mets à jour :

docs/IMPLEMENTATION_PLAN.md

et crée une section :

# Phase 3 — Back-office

Cette section doit contenir une checklist exhaustive.

Exemple :

## Foundation
- [ ] Back-office architecture
- [ ] Admin layout
- [ ] Sidebar
- [ ] Topbar
- [ ] Responsive-ready structure
- [ ] Design tokens

## Dashboard
- [ ] Dashboard layout
- [ ] KPI cards
- [ ] Sales chart
- [ ] Orders distribution
- [ ] Recent orders
- [ ] Best selling products

## Products
- [ ] Product listing
- [ ] Product filters
- [ ] Product search
- [ ] Product creation
- [ ] Product editing
- [ ] Product detail
- [ ] Product images
- [ ] Product stock
- [ ] Product pricing
- [ ] Promotions
- [ ] Featured products

etc.

Le plan doit être suffisamment détaillé pour qu'un autre agent puisse
reprendre exactement le travail sans avoir besoin de lire cette
conversation.

============================================================
RÈGLE ABSOLUE — CHECKLIST
============================================================

Tu dois travailler TÂCHE PAR TÂCHE.

Pour chaque tâche :

1. analyser ce qui est nécessaire ;
2. implémenter ;
3. vérifier ;
4. corriger les éventuels problèmes ;
5. effectuer une vérification visuelle ;
6. vérifier qu'aucune régression n'a été introduite ;
7. mettre à jour docs/IMPLEMENTATION_PLAN.md ;
8. mettre à jour docs/IMPLEMENTATION_STATUS.md ;
9. seulement ensuite considérer la tâche comme terminée.

Une tâche terminée doit être marquée :

[x]

Une tâche non terminée doit rester :

[ ]

NE COCHE JAMAIS une tâche simplement parce que le code a été écrit.

La tâche doit être réellement terminée.

============================================================
RÈGLE CRITIQUE — APRÈS CHAQUE TÂCHE
============================================================

Après CHAQUE tâche terminée, tu dois mettre à jour :

docs/IMPLEMENTATION_PLAN.md

ET

docs/IMPLEMENTATION_STATUS.md

avant de passer à la tâche suivante.

Cela est obligatoire.

Le repository doit toujours refléter l'état réel du développement.

Je peux interrompre ton travail à n'importe quel moment et remplacer
ton modèle par Gemini 3.1 Pro, Claude Opus ou un autre agent.

Le nouvel agent doit pouvoir reprendre immédiatement.

============================================================
IMPLEMENTATION_STATUS.md
============================================================

Maintiens ce fichier à jour.

Il doit toujours contenir au minimum :

# Current Status

## Current Phase

## Completed

## Currently Working On

## Next Tasks

## Remaining

## Known Issues

## Technical Decisions

## Files Recently Modified

## Last Completed Task

## Recommended Next Task

Exemple :

Current Phase:
Phase 3 — Back-office

Completed:
- Admin layout
- Sidebar
- Dashboard
- Product table

Currently Working On:
Product editor

Next Tasks:
- Product images
- Product variants
- Product stock

Known Issues:
- Chart mobile adaptation pending

Last Completed Task:
Product listing

Recommended Next Task:
Product creation form

============================================================
SOURCE DE VÉRITÉ VISUELLE
============================================================

Le mockup Back-office joint à ce prompt est la référence visuelle.

Tu dois respecter autant que possible :

- structure ;
- proportions ;
- spacing ;
- couleurs ;
- typographies ;
- composants ;
- boutons ;
- tableaux ;
- cartes ;
- badges ;
- navigation ;
- sidebar ;
- topbar ;
- icônes ;
- hiérarchie ;
- densité ;
- disposition ;
- états visuels.

NE REDESIGNE PAS le Back-office selon tes propres préférences.

NE CHANGE PAS arbitrairement le design.

NE transforme pas l'interface en dashboard SaaS générique.

Le résultat doit clairement appartenir à Décofleur Plus.


NE PAS créer une interface qui donne une impression
"AI-generated".

NE PAS ajouter :

- cartes inutiles ;
- statistiques fictives ;
- widgets décoratifs ;
- sections de remplissage ;
- faux boutons ;
- faux indicateurs ;
- éléments HTML inutiles ;
- icônes sans fonction ;
- textes génériques ;
- lorem ipsum ;
- contenu artificiel ;
- composants répétés uniquement pour remplir l'espace.

Chaque élément visible doit avoir une vraie raison d'exister.

Si une zone n'a pas besoin d'un élément :

NE RIEN AJOUTER.

La simplicité propre est préférable à la surcharge.

============================================================
QUALITÉ VISUELLE
============================================================

Le Back-office doit être :

- premium ;
- professionnel ;
- moderne ;
- propre ;
- lisible ;
- structuré ;
- cohérent ;
- rapide à utiliser ;
- visuellement élégant.

Il ne doit PAS ressembler à :

- un template admin générique ;
- un dashboard généré automatiquement ;
- une collection de cartes ;
- une interface surchargée.

L'effet "WAOUH" doit venir de la qualité d'exécution.

Pas de la quantité d'éléments.



============================================================
ARCHITECTURE BACK-OFFICE
============================================================

Construis une architecture claire.

Le Back-office doit être séparé logiquement du frontend public.

Exemple conceptuel :

/admin
/admin/dashboard
/admin/orders
/admin/orders/[id]
/admin/products
/admin/products/new
/admin/products/[id]
/admin/customers
/admin/customers/[id]
/admin/categories
/admin/inventory
/admin/deliverers
/admin/marketing
/admin/crm
/admin/blog
/admin/reports
/admin/finance
/admin/settings

Adapte cette architecture à l'architecture réelle du projet.

NE crée pas de routes inutilement.

============================================================
ADMIN LAYOUT
============================================================

Le layout administrateur doit notamment prévoir :

- Sidebar ;
- Topbar ;
- zone principale ;
- navigation active ;
- breadcrumbs lorsque pertinent ;
- notifications ;
- profil administrateur ;
- recherche globale si prévue ;
- responsive-ready architecture.

La Sidebar doit être cohérente avec le mockup.

Les groupes doivent être clairement organisés.

============================================================
DASHBOARD
============================================================

Implémente le dashboard administrateur conformément au mockup.

Il doit notamment pouvoir présenter :

- chiffre d'affaires ;
- commandes ;
- clients ;
- produits ;
- ventes ;
- évolution ;
- répartition des commandes ;
- commandes récentes ;
- produits les plus vendus.

NE crée pas de statistiques supplémentaires simplement
pour remplir le dashboard.

Les données de démonstration doivent rester cohérentes.
  
Ne crée pas de chiffres arbitraires contradictoires entre les pages.

============================================================
GESTION DES PRODUITS
============================================================

Implémente :

- liste produits ;
- recherche ;
- filtres ;
- catégories ;
- statut ;
- stock ;
- prix ;
- promotions ;
- produits vedettes ;
- pagination ;
- création ;
- modification ;
- suppression ;
- détail produit ;
- images ;
- variantes si nécessaires ;
- SEO si prévu.

La page doit respecter le mockup.

Utilise des composants réutilisables.

============================================================
FICHE PRODUIT ADMIN
============================================================

Le détail produit doit permettre de gérer les informations
nécessaires au cahier des charges.

Prévoir lorsque pertinent :

- nom ;
- description ;
- images ;
- catégorie ;
- prix ;
- prix promotionnel ;
- stock ;
- SKU ;
- dimensions ;
- variantes ;
- disponibilité ;
- produit vedette ;
- SEO ;
- produits associés.

NE PAS afficher tous ces champs systématiquement si le mockup
ou le contexte ne les nécessite pas.

La priorité reste :

mockup + cahier des charges + UX.

============================================================
COMMANDES
============================================================

Implémente :

- liste des commandes ;
- recherche ;
- filtres ;
- statuts ;
- date ;
- client ;
- montant ;
- actions ;
- pagination ;
- détail commande.

Statuts possibles selon le cahier des charges :

- nouvelle ;
- en préparation ;
- en livraison ;
- livrée ;
- annulée ;
- remboursée.

Les changements de statut doivent être clairs.

Les actions destructives doivent demander confirmation.

============================================================
DÉTAIL COMMANDE
============================================================

Afficher clairement :

- numéro commande ;
- client ;
- produits ;
- quantités ;
- montant ;
- livraison ;
- paiement ;
- adresse ;
- statut ;
- historique ;
- notes si nécessaire.

Les informations doivent être hiérarchisées.

Ne pas transformer cette page en accumulation de cartes.

============================================================
CLIENTS
============================================================

Implémente :

- liste clients ;
- recherche ;
- filtres ;
- statut ;
- segmentation ;
- historique ;
- profil client ;
- commandes ;
- fidélité ;
- informations utiles.

Le profil client doit permettre une compréhension rapide
de la relation avec la boutique.

============================================================
STOCK
============================================================

Prévoir les interfaces nécessaires pour :

- entrées ;
- sorties ;
- inventaire ;
- stock faible ;
- pertes ;
- historique.

Les alertes doivent être visibles mais pas agressives.

============================================================
LIVREURS
============================================================

Prévoir :

- liste des livreurs ;
- statut ;
- position ;
- commandes ;
- historique ;
- performance ;
- paiements.

simule discrement le principe du GPS ici

============================================================
CRM / MARKETING
============================================================

Prévoir selon le cahier des charges :

CRM :

- segmentation ;
- campagnes ;
- clients VIP ;
- historique.

Marketing :

- promotions ;
- coupons ;
- campagnes ;
- relance panier ;
- offres.

Ne pas créer de fonctionnalités marketing qui ne sont pas prévues.

============================================================
BLOG / CONTENU
============================================================

Prévoir les interfaces nécessaires à la gestion :

- articles ;
- catégories ;
- publication ;
- brouillons ;
- SEO.

============================================================
FINANCES / RAPPORTS
============================================================

Prévoir les interfaces nécessaires pour :

- chiffre d'affaires ;
- paiements ;
- remboursements ;
- rapports ;
- statistiques.

Les graphiques doivent rester lisibles.

Ne pas multiplier les graphiques sans valeur.

============================================================
PARAMÈTRES
============================================================

Prévoir les paramètres nécessaires :

- boutique ;
- utilisateurs ;
- rôles ;
- permissions ;
- paiement ;
- livraison ;
- notifications ;
- paramètres généraux.

============================================================
COMPOSANTS RÉUTILISABLES
============================================================

Créer/réutiliser des composants tels que :

- AdminSidebar
- AdminTopbar
- PageHeader
- Breadcrumb
- KPI
- DataTable
- TableToolbar
- FilterBar
- SearchInput
- StatusBadge
- ProductCard
- ProductTable
- OrderTable
- CustomerTable
- EmptyState
- LoadingState
- ErrorState
- Modal
- ConfirmationDialog
- Drawer
- Tabs
- FormField
- Select
- Pagination
- Toast

mais uniquement lorsque leur réutilisation est pertinente.

NE crée pas un composant uniquement pour respecter une liste.

============================================================
RESPONSIVE
============================================================

Cette phase est principalement consacrée au Back-office desktop.

Cependant :

l'architecture et les composants doivent être conçus de manière
à pouvoir être rendus responsive dans la phase suivante.

NE construis donc pas un DOM impossible à adapter au mobile.

La phase suivante sera consacrée au :

BACK-OFFICE RESPONSIVE / PWA.

============================================================
ANIMATIONS
============================================================

Ajoute des animations modernes et discrètes.

Exemples :

- apparition des KPI ;
- hover ;
- transitions ;
- ouverture de modal ;
- drawer ;
- feedback des actions ;
- changement de statut ;
- notifications.

L'animation doit rester rapide et professionnelle.

Respecter :

prefers-reduced-motion.

NE PAS utiliser des animations uniquement pour faire joli.

============================================================
ACCESSIBILITÉ
============================================================

Respecter :

- semantic HTML ;
- clavier ;
- focus ;
- labels ;
- aria ;
- contraste ;
- navigation ;
- boutons accessibles ;
- reduced motion.

============================================================
PERFORMANCE
============================================================

Ne pas sacrifier les performances.

Privilégier :

- Server Components lorsque pertinent ;
- composants légers ;
- images optimisées ;
- code splitting ;
- lazy loading ;
- peu de JavaScript inutile.

Ne pas installer une grosse librairie pour une fonctionnalité
simplement réalisable avec les outils existants.

============================================================
DONNÉES
============================================================

utilise une couche de données mockée propre et centralisée.

NE disperse PAS les données fictives dans tous les composants.

Les données doivent être cohérentes entre :

- dashboard ;
- produits ;
- commandes ;
- clients ;
- stock.

Un même produit doit garder le même nom, prix et image
dans les différentes interfaces.

============================================================
PAS DE DONNÉES FICTIVES ABUSIVES
============================================================

Les données mockées sont autorisées pour permettre
le développement de l'interface.

Mais elles doivent être :

- cohérentes ;
- réalistes ;
- limitées ;
- centralisées ;
- clairement identifiables comme données de démonstration.

NE PAS créer 500 lignes de faux clients simplement
pour rendre un tableau impressionnant.

============================================================
OVERFLOW
============================================================

AUCUN overflow involontaire.

Après chaque interface importante, vérifier :

- horizontal overflow ;
- tableaux ;
- boutons ;
- titres ;
- badges ;
- images ;
- modals ;
- dropdowns ;
- sidebar ;
- contenu principal.

NE PAS cacher un problème avec :

overflow-hidden

sans comprendre sa cause.

Corrige le layout.

============================================================
PAS DE HTML INUTILE
============================================================

Chaque élément doit avoir une fonction.

Évite :

- div inutiles ;
- wrappers inutiles ;
- composants inutiles ;
- sections vides ;
- éléments décoratifs sans raison ;
- duplication DOM.

La structure doit rester simple et maintenable.

============================================================
RÈGLE "NO AI GENERATED UI"
============================================================

Avant chaque validation :

pose-toi ces questions :

1. Est-ce que chaque élément sert réellement à quelque chose ?
2. Est-ce que cette section est demandée ou nécessaire ?
3. Est-ce que ce bouton correspond à une vraie action ?
4. Est-ce que cette statistique est utile ?
5. Est-ce que cette carte apporte une information ?
6. Est-ce que cette icône a une fonction ?
7. Est-ce que je suis en train de remplir artificiellement l'espace ?
8. Est-ce que cette interface ressemble à un produit professionnel
   ou à une génération automatique ?

Si un élément n'apporte aucune valeur :

SUPPRIME-LE.

============================================================
VALIDATION VISUELLE
============================================================

Pour chaque page terminée :

compare l'implémentation au mockup.

Vérifie :

- structure ;
- proportions ;
- spacing ;
- couleurs ;
- typography ;
- images ;
- alignement ;
- navigation ;
- boutons ;
- densité ;
- responsive readiness.

Corrige les différences importantes avant de cocher la tâche.

============================================================
VALIDATION TECHNIQUE
============================================================

Avant de cocher une tâche :

- TypeScript valide ;
- lint valide si disponible ;
- build valide ;
- aucune erreur console importante ;
- aucune route cassée ;
- aucune import inutilisée ;
- aucun composant inutilisé ;
- aucun overflow connu ;
- pas de régression évidente.

============================================================
MISE À JOUR DU PLAN
============================================================

APRÈS CHAQUE TÂCHE :

1. mets à jour IMPLEMENTATION_PLAN.md ;
2. coche uniquement la tâche réellement terminée ;
3. mets à jour IMPLEMENTATION_STATUS.md ;
4. indique le prochain travail recommandé.

Exemple :

Avant :

- [ ] Gestion des produits

Après :

- [x] Gestion des produits

Puis dans IMPLEMENTATION_STATUS.md :

Last Completed Task:
Gestion des produits

Next Recommended Task:
Détail produit

============================================================
SI TU RENCONTRES UN PROBLÈME
============================================================

NE contourne pas silencieusement le problème.

Documente-le dans :

docs/KNOWN_ISSUES.md

et dans :

docs/IMPLEMENTATION_STATUS.md

avec :

- problème ;
- impact ;
- cause probable ;
- workaround éventuel ;
- solution recommandée.

============================================================
SI TU DOIS PRENDRE UNE DÉCISION
============================================================

Priorité :

1. mockup ;
2. cahier des charges ;
3. UI_RULES.md ;
4. UI_DECISIONS.md ;
5. architecture existante ;
6. UX ;
7. accessibilité ;
8. performance ;
9. simplicité.

NE prends pas une décision uniquement parce qu'elle est
plus facile à coder.

============================================================
NE PAS SUR-ENGINEER
============================================================

Construis uniquement ce qui est nécessaire à cette phase.

Ne crée pas prématurément :

- architecture complexe ;
- abstractions inutiles ;
- système générique universel ;
- centaines de composants ;
- infrastructure backend complète ;
- système multi-tenant complexe.

Le but est :

PROPRE
SCALABLE
MAINTENABLE
SIMPLE
PROFESSIONNEL

============================================================
FIN DE MISSION
============================================================

Ne considère pas la mission terminée simplement parce que
les principales pages existent.

La phase est terminée lorsque :

- toutes les tâches prévues sont cochées ;
- les interfaces correspondent aux mockups ;
- le design est cohérent ;
- les composants sont réutilisables ;
- aucune section inutile n'a été ajoutée ;
- aucun overflow connu ne subsiste ;
- les routes fonctionnent ;
- le build fonctionne ;
- les erreurs critiques sont corrigées ;
- la documentation est à jour ;
- IMPLEMENTATION_STATUS.md permet à un autre agent
  de reprendre immédiatement.

============================================================
COMMENCE MAINTENANT
============================================================

1. Analyse le repository.
2. Lis tous les fichiers docs/*.md existants.
3. Analyse le mockup Back-office fourni.
4. Compare le mockup avec l'état actuel du projet.
5. Identifie ce qui existe déjà.
6. Identifie ce qui manque.
7. Mets à jour docs/IMPLEMENTATION_PLAN.md.
8. Mets à jour docs/IMPLEMENTATION_STATUS.md.
9. Seulement ensuite commence l'implémentation.
10. Travaille tâche par tâche.
11. Mets à jour les fichiers de suivi APRÈS CHAQUE TÂCHE.

NE COMMENCE PAS PAR CODER AU HASARD.

COMMENCE PAR LE PLAN.