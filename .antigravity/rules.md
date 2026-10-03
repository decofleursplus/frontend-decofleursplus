# Décofleur Plus — UI / Frontend Rules

Ce document contient les règles obligatoires de qualité visuelle, structurelle
et UX du projet Décofleur Plus.

Ces règles s'appliquent à toutes les phases du projet :

1. User Desktop
2. User Responsive / PWA
3. Back-office Desktop
4. Back-office Responsive / PWA

Toute implémentation UI doit respecter ces règles.

---

# 1. SOURCE DE VÉRITÉ

Les mockups fournis dans le projet constituent la principale référence visuelle.

Le code doit reproduire fidèlement :

- la structure ;
- la hiérarchie ;
- les proportions ;
- les espacements ;
- les composants ;
- les couleurs ;
- les typographies ;
- les images ;
- les CTA ;
- les informations ;
- les comportements visibles.

Ne pas redesign le produit sans raison.

Ne pas ajouter des éléments simplement parce qu'ils sont courants
dans les applications modernes.

Le développeur doit implémenter ce qui est nécessaire au produit,
pas ce qui permet simplement de remplir visuellement une page.

---

# 2. INTERDICTION DU "AI-GENERATED LOOK"

Le rendu final ne doit jamais donner l'impression d'avoir été généré
automatiquement par une IA.

Le résultat doit ressembler au travail d'une équipe frontend/UI professionnelle.

ÉVITER ABSOLUMENT :

- sections ajoutées uniquement pour remplir l'écran ;
- cartes inutiles ;
- statistiques fictives ;
- badges décoratifs sans fonction ;
- icônes sans fonction ;
- gradients ajoutés sans raison ;
- blobs décoratifs excessifs ;
- illustrations génériques ;
- éléments flottants sans utilité ;
- textes génériques ;
- lorem ipsum ;
- slogans inventés ;
- faux avis clients ;
- faux chiffres ;
- faux indicateurs ;
- faux boutons ;
- composants répétés uniquement pour créer du volume ;
- tableaux artificiellement remplis ;
- espaces remplis par des éléments arbitraires.

Chaque élément visible doit avoir une raison d'exister.

---

# 3. PRINCIPE "NO FILLER"

NE JAMAIS ajouter du contenu uniquement parce qu'une page semble vide.

Une page vide n'est pas nécessairement un problème.

Si le contenu réel disponible est limité :

→ conserver un espace propre
→ utiliser une hiérarchie visuelle simple
→ éventuellement utiliser un état vide approprié

mais NE PAS inventer du contenu.

Exemple interdit :

Ajouter :

- "Nos engagements"
- "Pourquoi nous choisir"
- "Nos chiffres"
- "Nos partenaires"
- "Témoignages"
- "Nos valeurs"

uniquement pour remplir la page si ces sections ne sont pas prévues
par le cahier des charges ou le mockup.

---

# 4. PAS DE HTML INUTILE

Chaque élément HTML doit avoir une fonction.

Éviter :

- div imbriquées inutilement ;
- wrappers sans rôle ;
- containers supplémentaires sans nécessité ;
- spans utilisés uniquement pour la décoration ;
- sections vides ;
- éléments cachés inutiles ;
- composants dupliqués ;
- structures DOM excessivement profondes.

Avant d'ajouter un wrapper, vérifier :

"Est-ce que cet élément est réellement nécessaire ?"

Si la réponse est non :

→ ne pas l'ajouter.

---

# 5. STRUCTURE DU DOM

La structure doit rester propre et logique.

Privilégier :

- semantic HTML ;
- header ;
- nav ;
- main ;
- section ;
- article ;
- aside ;
- footer ;
- button ;
- form ;
- label ;
- input ;
- etc.

Éviter de construire toute l'application avec des `div`.

La structure HTML doit refléter la structure logique de l'interface.

---

# 6. COHÉRENCE VISUELLE

Toutes les pages doivent sembler appartenir au même produit.

Maintenir une cohérence stricte concernant :

- couleurs ;
- typographies ;
- tailles de titres ;
- tailles de texte ;
- boutons ;
- border-radius ;
- ombres ;
- espacements ;
- icônes ;
- cartes ;
- inputs ;
- badges ;
- états ;
- animations.

Ne pas créer un nouveau style de bouton pour chaque page.

Ne pas créer plusieurs styles de cartes pour le même usage.

Réutiliser les composants existants.

---

# 7. DESIGN TOKENS

Les valeurs visuelles importantes doivent être centralisées.

Éviter de créer arbitrairement :

```css
margin: 13px;
margin: 17px;
margin: 19px;
margin: 23px;
sans justification.
Utiliser un système cohérent d'espacement.
Même principe pour :
- couleurs ;
- radius ;
- typography ;
- shadows ;
- transitions ;
- breakpoints.
Le design doit avoir un système, pas une succession de décisions isolées.
8. ESPACEMENTS
Les espacements doivent être intentionnels.
Éviter :
- espaces gigantesques ;
- éléments collés ;
- sections trop serrées ;
- padding incohérent ;
- alignements approximatifs.
Les éléments ayant la même fonction doivent généralement utiliser
les mêmes règles d'espacement.
9. ALIGNEMENT
Les éléments doivent être correctement alignés.
Vérifier systématiquement :
- alignement horizontal ;
- alignement vertical ;
- grille ;
- largeur des containers ;
- marges ;
- colonnes ;
- boutons ;
- titres ;
- images.
Un élément ne doit pas sembler "presque aligné".
10. OVERFLOW
AUCUN overflow involontaire n'est acceptable.
Vérifier particulièrement :
- textes longs ;
- boutons ;
- tableaux ;
- cartes ;
- images ;
- menus ;
- modals ;
- drawers ;
- dropdowns ;
- navigation ;
- formulaires ;
- prix ;
- badges ;
- titres.
INTERDICTION de résoudre un problème de layout simplement avec :
overflow: hidden;

si cela masque réellement le problème.
overflow: hidden ne doit pas être utilisé comme pansement.
Identifier la cause réelle du débordement et corriger le layout.
11. RESPONSIVE
Le responsive doit être réellement conçu.
NE PAS simplement :
Desktop
↓
tout mettre en colonne

Pour chaque composant, déterminer son comportement selon la taille
de l'écran.
Exemples :
Desktop :
Sidebar + contenu
Mobile :
Drawer + contenu
Desktop :
Tableau
Mobile :
Cards / liste / scroll contrôlé
Desktop :
Navigation horizontale
Mobile :
Bottom navigation / drawer
Desktop :
Multi-column
Mobile :
Stack logique
12. MOBILE
Sur mobile :
- aucun contenu ne doit sortir de l'écran ;
- aucun texte ne doit être coupé involontairement ;
- aucun bouton ne doit être inaccessible ;
- aucun élément ne doit être trop petit pour être utilisé ;
- les interactions doivent être adaptées au tactile ;
- les formulaires doivent rester lisibles ;
- les images doivent conserver leur ratio ;
- les CTA doivent rester facilement accessibles.
Tester au minimum plusieurs largeurs de viewport.
13. IMAGES
Les images doivent :
- conserver leur ratio ;
- être correctement recadrées ;
- ne pas être étirées ;
- ne pas être déformées ;
- utiliser une stratégie object-fit cohérente ;
- avoir des dimensions adaptées.
NE PAS utiliser une image différente uniquement pour remplir un espace
si aucune image correspondante n'existe.
14. TEXTE
Le contenu doit rester crédible et cohérent avec le produit.
INTERDICTION d'utiliser :
- lorem ipsum ;
- texte aléatoire ;
- titres génériques ;
- paragraphes artificiels ;
- chiffres inventés ;
- métriques inventées.
Si une donnée réelle n'est pas disponible :
→ utiliser un placeholder explicite lorsque nécessaire
→ ou laisser l'état approprié vide.
Ne jamais transformer une absence de données en données fictives.
15. PRODUITS
Les produits affichés dans les mockups doivent conserver :
- leur nom ;
- leur image ;
- leur prix ;
- leur catégorie ;
- leur statut ;
- leurs informations principales.
Ne pas changer arbitrairement les produits entre les pages.
Un produit affiché dans le catalogue doit rester cohérent lorsqu'il
apparaît dans :
- fiche produit ;
- panier ;
- commande ;
- favoris ;
- recommandations.
16. ÉTATS UI
Prévoir correctement les états nécessaires :
- loading ;
- loaded ;
- empty ;
- error ;
- success ;
- disabled ;
- unavailable ;
- out of stock ;
- processing ;
- completed.
Chaque état doit avoir une représentation claire.
Ne pas créer plusieurs variantes visuelles inutiles.
17. FORMULAIRES
Les formulaires doivent être :
- clairs ;
- structurés ;
- accessibles ;
- correctement espacés ;
- faciles à comprendre.
Chaque champ doit avoir :
- label ;
- état ;
- validation ;
- message d'erreur lorsque nécessaire.
Les erreurs doivent être affichées près du champ concerné.
18. BOUTONS
Chaque bouton doit correspondre à une action réelle.
NE PAS ajouter :
- "Découvrir"
- "En savoir plus"
- "Commencer"
- "Explorer"
simplement parce qu'il faut un bouton.
Un CTA doit avoir une vraie fonction.
Les boutons doivent avoir des états :
- default ;
- hover ;
- active ;
- focus ;
- disabled ;
- loading lorsque nécessaire.
19. ICÔNES
Les icônes doivent avoir une fonction ou améliorer clairement
la compréhension.
NE PAS ajouter des icônes décoratives partout.
Utiliser un système d'icônes cohérent.
Ne pas mélanger plusieurs styles d'icônes sans justification.
20. ANIMATIONS
Les animations doivent améliorer l'expérience.
Utiliser :
- transitions ;
- micro-interactions ;
- hover ;
- feedback ;
- apparition ;
- déplacement subtil.
Éviter :
- animations permanentes ;
- éléments qui flottent sans raison ;
- effets excessifs ;
- transitions lentes ;
- animations distrayantes.
Objectif :
Premium + fluide + moderne.
Pas :
"Site généré par IA avec des animations partout."
Respecter :
prefers-reduced-motion

21. "WAOUH" = QUALITÉ, PAS SURCHARGE
L'effet "WAOUH" ne doit pas venir d'une accumulation d'effets.
Il doit venir de :
- qualité visuelle ;
- précision ;
- fluidité ;
- cohérence ;
- belles images ;
- micro-interactions ;
- typographie ;
- transitions ;
- détails bien exécutés.
La simplicité bien exécutée est préférable à une interface surchargée.
22. DESIGN SYSTEM
Avant de créer un nouveau composant visuel, vérifier si un composant
existant peut être réutilisé.
Si un composant existant correspond :
→ réutiliser.
Si une nouvelle variante est nécessaire :
→ créer une variante explicite.
NE PAS dupliquer un composant presque identique.
23. COMPOSANTS
Les composants doivent avoir une responsabilité claire.
Éviter les composants géants contenant toute la logique d'une page.
Éviter également de créer un composant pour chaque petit élément
sans valeur réutilisable.
Chercher le bon équilibre.
24. ACCESSIBILITÉ
Respecter au minimum :
- navigation clavier ;
- focus visible ;
- labels ;
- aria lorsque nécessaire ;
- contraste ;
- boutons accessibles ;
- alt text pour les images pertinentes ;
- reduced motion.
L'accessibilité ne doit pas être ajoutée à la fin.
25. PERFORMANCE
Ne pas sacrifier les performances pour le rendu visuel.
Privilégier :
- Server Components lorsque pertinent ;
- images optimisées ;
- lazy loading approprié ;
- code splitting ;
- composants légers ;
- animations GPU-friendly ;
- peu de JavaScript inutile.
Ne pas installer une librairie pour résoudre un problème
qui peut être résolu simplement.
26. DÉPENDANCES
Avant d'ajouter une dépendance :
1. vérifier si le projet possède déjà une solution ;
2. vérifier si Next.js ou CSS permet de résoudre le problème ;
3. vérifier si une dépendance existante peut être réutilisée.
Éviter les dépendances inutiles.
27. PAS DE CODE MORT
Ne pas laisser :
- imports inutilisés ;
- composants inutilisés ;
- variables inutilisées ;
- CSS inutilisé ;
- routes inutilisées ;
- données fictives inutilisées ;
- TODO oubliés.
Nettoyer avant de considérer une tâche terminée.
28. VALIDATION VISUELLE
Après chaque groupe important de modifications :
Vérifier visuellement :
- desktop ;
- tablet lorsque pertinent ;
- mobile lorsque pertinent.
Comparer avec le mockup.
Vérifier :
- proportions ;
- spacing ;
- couleurs ;
- images ;
- alignement ;
- typographie ;
- overflow ;
- responsive ;
- interactions.
29. VALIDATION TECHNIQUE
Avant de cocher une tâche :
- TypeScript sans erreur ;
- build valide ;
- lint valide si configuré ;
- aucune erreur console importante ;
- aucun warning critique ;
- aucune route cassée ;
- aucun overflow connu ;
- aucune régression visible.
30. RÈGLE DE FINITION
Une fonctionnalité n'est PAS terminée simplement parce que :
"ça fonctionne".
Elle est terminée lorsque :
- ça fonctionne ;
- c'est propre ;
- c'est cohérent ;
- c'est responsive si nécessaire ;
- ça correspond au mockup ;
- il n'y a pas d'éléments inutiles ;
- il n'y a pas d'overflow ;
- il n'y a pas de duplication inutile ;
- l'interface semble conçue par une équipe professionnelle.
31. RÈGLE DE DÉCISION
En cas d'hésitation entre plusieurs solutions :
Priorité :
1. Mockup
2. Cahier des charges
3. Design system existant
4. Cohérence avec les interfaces existantes
5. UX
6. Accessibilité
7. Performance
8. Simplicité technique
Ne pas prendre une décision uniquement parce qu'elle est
"plus jolie".
32. RÈGLE ABSOLUE
NE RIEN AJOUTER SANS RAISON.
Chaque élément de l'interface doit pouvoir répondre à la question :
"Pourquoi cet élément existe-t-il ?"
Si aucune réponse claire n'existe :
→ ne pas l'ajouter.
Le produit doit être :
PROPRE
STRUCTURÉ
COHÉRENT
RESPONSIVE
PERFORMANT
ÉLÉGANT
FONCTIONNEL
et surtout :
NE PAS DONNER L'IMPRESSION D'ÊTRE GÉNÉRÉ PAR UNE IA.