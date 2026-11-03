# 🚨 Endpoints Feedback — DécoFleur Plus (Mise à jour Branche staging)

**Date :** 2026-11-03  
**Branche backend analysée :** `staging` (Commit `f37f5c6`)  
**Statut global :** Sur 149 endpoints recensés sur la branche `staging`, **la quasi-totalité des besoins du frontend (Commandes, Livraisons, NabooPay, CRM Clients, Abonnements, Blog, Marketing, Paramètres, Location) est désormais couverte par le backend !**

Ce document recense les quelques routes encore manquantes, les ajustements de conception à prévoir, et les règles d'intégration strictes entre le frontend et l'API backend.

---

## 1. Synthèse par Niveau de Priorité

| Priorité | Sujet | Type | Statut |
|---|---|---|---|
| 🟡 **MOYENNE** | Mot de passe oublié & réinitialisation | Route manquante | Non implémenté en V1 |
| 🟡 **MOYENNE** | OAuth Google & Facebook | Fonctionnalité manquante | Masquer boutons front |
| 🟢 **FAIBLE** | Dépôt d'avis clients (`POST /reviews`) | Route manquante | Affichage existant, dépôt non géré |
| 🟢 **FAIBLE** | Synchronisation serveur des favoris | Persistance | Conserver `localStorage` côté client |
| ℹ️ **INFO DEPL.** | Synchronisation Railway Staging | Déploiement cloud | Redéployer `staging` sur Railway |

---

## 2. Détail des Endpoints Manquants ou Partiels

### 2.1 Authentification — Mot de passe oublié
- **Besoin frontend :** Page `/mot-de-passe-oublie` demandant l'email/téléphone pour recevoir un lien ou code de réinitialisation.
- **État backend :** Aucun endpoint `/auth/forgot-password` ni `/auth/reset-password` n'est implémenté.
- **Spécification recommandée pour le backend :**
  ```http
  POST /api/v1/auth/forgot-password
  Content-Type: application/json
  { "email": "client@example.com" }
  // Réponse 200 : { "success": true, "data": { "message": "Email de réinitialisation envoyé" } }

  POST /api/v1/auth/reset-password
  Content-Type: application/json
  { "token": "jwt_reset_token", "newPassword": "NouveauPassword123!" }
  ```
- **Solution frontend en attendant :**
  Afficher sur la page `/mot-de-passe-oublie` un message d'assistance invitant l'utilisateur à contacter le support DécoFleur Plus via WhatsApp direct ou par téléphone pour réinitialiser son accès.

---

### 2.2 Connexion Sociale (Google / Facebook)
- **Besoin frontend :** Boutons « Continuer avec Google » et « Continuer avec Facebook » sur `/connexion` et `/inscription`.
- **État backend :** L'authentification repose uniquement sur `identifier (email/phone) + password` avec vérification bcrypt et génération JWT. Aucun provider OAuth (Google Client ID, Facebook App ID) n'est configuré côté serveur.
- **Action frontend :**
  Désactiver ou masquer temporairement ces boutons ou afficher un badge informatif « Bientôt disponible ».

---

### 2.3 Avis Clients & Notations (`Reviews`)
- **Besoin frontend :** Évaluation des bouquets (étoiles et commentaires clients).
- **État backend :** Le modèle `Product` contient les champs `rating` (Float, ex: 4.8) et `reviewsCount` (Int, ex: 12), mais il n'existe pas d'entité `Review` ni d'endpoint `POST /api/v1/products/:id/reviews` pour soumettre un avis public.
- **Action frontend :**
  Afficher la note et le nombre d'avis retournés par l'API pour chaque produit ; intercepter la soumission d'avis avec un message de remerciement local ou feedback modal.

---

### 2.4 Synchronisation des Favoris (`Wishlist`)
- **Besoin frontend :** Page `/favoris` pour sauvegarder des produits coup de cœur.
- **État backend :** Pas de table de favoris utilisateur en base de données.
- **Action frontend :**
  Conserver l'implémentation frontend actuelle basée sur le `localStorage` (`decofleur_favorites`). C'est rapide, performant, et cela fonctionne aussi bien pour les utilisateurs invités que connectés.

---

## 3. Règles Métier & Contraintes d'Intégration Strictes

### 3.1 Validation Zod Stricte (Aucun champ superflu)
Le backend utilise des schémas de validation stricts : **tout champ non prévu dans le schéma de requête provoque un rejet immédiat (`400 VALIDATION_ERROR`)**.
- ⚠️ **Dans `POST /orders` :** Ne jamais envoyer de `price`, `unitPrice`, `subtotal`, ou `totalAmount` ! Le backend recalcule obligatoirement les prix depuis sa base de données à partir de `variantId`.
- ⚠️ **Dans `POST /orders` :** Chaque ligne de commande doit contenir le **`variantId`** (UUID) de la variante du produit sélectionné (et non le productId seul).

### 3.2 Format des Identifiants & Téléphones
- Les IDs sont tous des **UUIDv4** côté backend (et non des entiers `"1"`, `"2"`).
- Les numéros de téléphone sont normalisés au format international E.164 (`+221771234567`). L'API tolère les saisies avec espaces ou tirets et les normalise automatiquement, mais il est recommandé d'envoyer un format propre.

### 3.3 Devis (`Quotes`) & Upload d'Images d'Inspiration
- La route `POST /api/v1/quotes` accepte directement la structure du `DevisForm` frontend.
- Pour les images d'inspiration : utiliser `POST /api/v1/quotes/uploads` (`multipart/form-data`, champ `files`), récupérer les URLs renvoyées, et les transmettre dans le champ `inspirationImages: string[]` lors de la soumission du devis.

### 3.4 Paiement en Ligne (NabooPay)
- Lors de `POST /api/v1/orders`, si la méthode sélectionnée est en ligne (`WAVE`, `ORANGE_MONEY`, `FREE_MONEY`, `CARD`), la réponse renvoie `checkoutUrl`.
- Le frontend doit immédiatement effectuer une redirection navigateur : `window.location.href = res.data.checkoutUrl`.
- À l'issue du paiement, NabooPay redirige le client vers :
  - Succès : `/commande/confirmation?orderNumber=CMD-AAAA-NNNN`
  - Échec : `/commande/paiement-echoue?orderNumber=CMD-AAAA-NNNN`
- Le webhook asynchrone sécurisé (`POST /api/v1/webhooks/naboopay`) valide ensuite la transaction et met à jour le statut en base.

### 3.5 Rôles Staff & Authentification Back-Office
- Le backend staging exige un rôle staff pour toutes les routes préfixées par `/api/v1/admin/*`.
- Rôles reconnus côté backend : `ADMIN`, `MANAGER`, `FLORIST`, `DELIVERY`, `SALES`, `ACCOUNTANT`.
- La page `/admin/connexion` vérifie le rôle après authentification et bloque l'accès aux clients standard avec le message explicite : *« Accès réservé à l'équipe DécoFleur Plus »*.
- Le client API `lib/api/client.ts` transmet automatiquement l'en-tête `Authorization: Bearer <token_admin>` via l'option `useAdminToken: true`.

### 3.6 Mappage Harmonisé des Statuts de Commande
- L'API backend utilise des constantes en majuscules anglaises (`PENDING`, `CONFIRMED`, `PROCESSING`, `READY_FOR_DELIVERY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
- Le frontend assure une conversion bidirectionnelle transparente vers la terminologie florale en français (`en_attente`, `en_preparation`, `en_livraison`, `livree`, `annulee`).

### 3.7 Résilience Hors-Ligne & Fallback Transparent
- L'ensemble des 16 modules d'administration ainsi que les parcours clients publics intègrent un double mécanisme de résilience :
  1. Appel réseau vers `https://backend-decofleursplus-staging.up.railway.app/api/v1`
  2. En cas d'indisponibilité temporaire du serveur distant ou d'erreur réseau, bascule instantanée et silencieuse sur les données locales avec notification discrète à l'utilisateur (`toast.warning('Chargement en mode hors-ligne')`).
  3. Chaque vue propose un bouton **« Actualiser »** avec indicateur de rotation pour forcer la synchronisation avec le serveur.

---

## 4. Note sur l'Environnement Staging (Railway)

| Environnement | Branche Git | URL de Base | État Actuel |
|---|---|---|---|
| **Staging Railway** | `staging` | `https://backend-decofleursplus-staging.up.railway.app/api/v1` | Actif (Synchronisé avec la branche `staging`) |
| **Local Backend** | `staging` | `http://localhost:5000/api/v1` | Prêt et documenté |

