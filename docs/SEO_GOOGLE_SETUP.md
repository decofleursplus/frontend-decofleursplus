# Guide Opérationnel — Configuration des Outils Google

Ce guide fournit les procédures pas-à-pas destinées à la direction et à l'équipe marketing de Décofleur Plus pour activer, configurer et administrer les outils officiels de Google :
1. **Google Search Console** (Indexation et surveillance technique).
2. **Google Business Profile** (Visibilité locale et cartographie Google Maps).
3. **Google Analytics 4** (Mesure d'audience et suivi des conversions).
4. **Google Merchant Center** (Fiches produits gratuites et visibilité e-commerce).
5. **Outils Officiels de Validation SEO** (Rich Results Test, Schema Validator, PageSpeed).

---

## 1. Google Search Console (GSC)

Google Search Console est l'outil indispensable fourni gratuitement par Google pour superviser la présence du site dans les résultats de recherche, soumettre les plans de site (*sitemaps*) et détecter les erreurs d'exploration.

### 1.1 Étape 1 : Créer la Propriété
1. Connectez-vous sur [Google Search Console](https://search.google.com/search-console) avec l'adresse email professionnelle de l'entreprise (ex: `contact@decofleurplus.com` ou le compte Google officiel).
2. Cliquez sur **Ajouter la propriété**.
3. Choisissez le type de propriété **Domaine** (recommandé car il couvre l'ensemble des sous-domaines et protocoles http/https) :
   - Saisissez : `decofleurplus.com`
   - Cliquez sur **Continuer**.

### 1.2 Étape 2 : Valider la Propriété
Deux méthodes sont disponibles :

#### Méthode A : Validation par Enregistrement DNS TXT (Recommandée)
1. Google Search Console vous affiche une chaîne de caractères unique de type :
   `google-site-verification=abc123xyz456...`
2. Connectez-vous à l'espace client de votre registraire de nom de domaine (OVH, Namecheap, Cloudflare, etc.).
3. Accédez à la zone DNS du domaine `decofleurplus.com`.
4. Ajoutez un enregistrement :
   - **Type** : `TXT`
   - **Sous-domaine / Hôte** : `@` (ou laissez vide selon le registraire)
   - **Valeur / Cible** : la chaîne fournie par Google.
5. Patientez quelques minutes puis cliquez sur **Valider** dans Search Console.

#### Méthode B : Validation par Variable d'Environnement
1. Dans Google Search Console, sélectionnez l'option **Préfixe de l'URL** avec `https://decofleurplus.com`.
2. Choisissez la méthode de validation **Balise HTML**.
3. Copiez la valeur de l'attribut `content` (ex: `abc123xyz456`).
4. Ajoutez la variable d'environnement dans votre fichier `.env.local` ou sur votre hébergeur (Railway/Vercel) :
   `NEXT_PUBLIC_GSC_VERIFICATION=abc123xyz456`
5. Déployez et retournez dans Google Search Console pour cliquer sur **Valider**.

### 1.3 Étape 3 : Soumettre le Sitemap Dynamique
1. Dans le menu latéral gauche de Search Console, cliquez sur **Sitemaps**.
2. Dans le champ "Ajouter un sitemap", saisissez exactement :
   `sitemap.xml`
   (l'URL complète soumise est : `https://decofleurplus.com/sitemap.xml`).
3. Cliquez sur **Envoyer**.
4. Le statut doit passer à **Succès** (vert). Google découvrira automatiquement l'ensemble des 107+ pages du site (boutique, catégories, produits, articles de blog, pages locales).

### 1.4 Étape 4 : Demander l'Indexation Prioritaire des Pages Clés
Pour accélérer la prise en compte par Google sans attendre le passage naturel du robot :
1. Utilisez la barre de recherche supérieure **Inspecter n'importe quelle URL**.
2. Testez successivement :
   - `https://decofleurplus.com/`
   - `https://decofleurplus.com/boutique`
   - `https://decofleurplus.com/fleuriste-saly`
   - `https://decofleurplus.com/fleuriste-dakar`
   - `https://decofleurplus.com/blog`
3. Si la page n'est pas encore sur Google, cliquez sur **Demander une indexation**.

---

## 2. Google Business Profile (Fiche Établissement)

Google Business Profile est le levier numéro 1 du référencement local. Il pilote l'apparition de Décofleur Plus dans Google Maps et dans le "Local Pack" (les 3 établissements affichés en haut des résultats de recherche).

> [!IMPORTANT]
> **Règle Déontologique et Anti-Suspension Google** :
> Décofleur Plus possède un atelier et une boutique physique réelle à **Saly Portudal**. Ne créez **JAMAIS** un faux établissement avec une fausse adresse physique à Dakar. Google suspend immédiatement les profils suspects. La méthode officielle et approuvée par Google consiste à déclarer Saly en établissement principal et à ajouter Dakar, Somone et Mbour en **Zones desservies**.

### 2.1 Informations à Déclarer dans le Profil

| Champ Google Profile | Valeur Officielle à Saisir | Remarques |
| :--- | :--- | :--- |
| **Nom de l'établissement** | `Décofleur Plus - Fleuriste & Décoration Florale` | Nom de marque clair et professionnel. |
| **Catégorie principale** | `Fleuriste` | Détermine l'affichage des filtres fleuristes. |
| **Catégories secondaires** | `Décorateur floral`, `Paysagiste`, `Service de livraison de fleurs`, `Boutique de cadeaux` | Couvre l'ensemble des métiers de l'entreprise. |
| **Adresse postale réelle** | `Rue des Palmiers, Saly Portudal, 23000, Sénégal` | Adresse où les clients peuvent se rendre physiquement. |
| **Coordonnées GPS** | `14.4431, -17.0272` | Position exacte de la boutique à Saly. |
| **Téléphone principal** | `+221 33 957 88 99` | Ligne fixe boutique. |
| **Téléphone mobile / WhatsApp**| `+221 77 941 78 60` | Numéro client pour les commandes et devis. |
| **Site Web** | `https://decofleurplus.com` | Lien canonique principal. |
| **Lien de prise de rendez-vous**| `https://decofleurplus.com/devis` | Pour les demandes d'aménagement ou de mariage. |

### 2.2 Configuration des Zones Desservies (*Service Area Business*)
Dans les paramètres de la fiche, activez la livraison et ajoutez les zones suivantes :
- **Saly Portudal** (Thiès)
- **Somone** (Thiès)
- **Mbour** (Thiès)
- **Ngaparou** (Thiès)
- **Dakar** (Région de Dakar : Almadies, Plateau, Fann, Ngor, Yoff, Ouakam, Mermoz)

### 2.3 Horaires d'Ouverture
- Lundi à Samedi : `08:30 – 19:30`
- Dimanche : `09:00 – 14:00` (ou continu selon permanence événementielle)

### 2.4 Photos et Visuels à Charger Obligatoirement
Pour obtenir un score d'optimisation de profil maximal :
1. **Photo de profil / Logo** : Logo Décofleur Plus haute définition sur fond blanc ou transparent.
2. **Photo de couverture** : Belle vue d'ensemble de la boutique ou d'un banquet floral d'exception.
3. **Extérieur** : Devanture visible de la boutique à Saly avec enseigne.
4. **Intérieur & Atelier** : Chambre froide, arrivages de fleurs fraîches, fleuristes en plein travail de composition.
5. **Produits phares** : 10 photos de bouquets emblématiques (Roses d'Équateur, compositions tropicales).
6. **Véhicule de livraison** : Photo valorisante de la navette frigorifique climatisée (rassure les clients de Dakar sur la conservation des fleurs).

---

## 3. Google Analytics 4 (GA4)

GA4 permet d'analyser l'origine du trafic (organique, direct, réseaux sociaux), le comportement des visiteurs et la rentabilité des actions SEO.

### 3.1 Étape 1 : Créer la Propriété GA4
1. Rendez-vous sur [Google Analytics](https://analytics.google.com/).
2. Créez un compte "Décofleur Plus" et une propriété GA4 "Site Web Décofleur Plus".
3. Fuseau horaire : **Sénégal (GMT+0)**.
4. Devise : **Franc CFA d'Afrique de l'Ouest (XOF)**.

### 3.2 Étape 2 : Créer le Flux de Données Web
1. Choisissez la plateforme **Web**.
2. URL du site : `https://decofleurplus.com`.
3. Nom du flux : `Décofleur Plus Web`.
4. Récupérez l'**ID de mesure** généré (format : `G-XXXXXXXXXX`).

### 3.3 Étape 3 : Intégrer l'Identifiant dans Décofleur Plus
Renseignez la variable d'environnement dans votre fichier `.env.local` ou dans les paramètres d'environnement de votre hébergeur (Railway, Vercel) :
```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```
Le tag Google Analytics 4 sera alors automatiquement actif sur l'ensemble des pages du site.

### 3.4 Événements Clés à Suivre en Conversion
Pour mesurer l'impact du SEO sur le chiffre d'affaires, marquez ces événements comme **Conversions** dans GA4 :
- `purchase` : Achat en ligne finalisé.
- `begin_checkout` : Entrée dans le tunnel de commande.
- `generate_lead` : Envoi d'une demande de devis (mariage ou paysagisme).
- `click_whatsapp` : Clic sur le bouton de contact direct WhatsApp.
- `click_phone` : Appel téléphonique depuis mobile.

---

## 4. Google Merchant Center (GMC)

Google Merchant Center permet de diffuser les produits du catalogue sur l'onglet "Google Shopping" et dans les encarts de produits gratuits des résultats de recherche.

### 4.1 Éligibilité et Spécificités pour le Sénégal
- Google propose les **Fiches gratuites (Free Listings)** pour les produits dans un nombre croissant de pays.
- Même si les campagnes Shopping Ads payantes ciblent principalement des marchés matures, le déploiement d'un flux de produits sur Merchant Center renforce considérablement la compréhension sémantique de vos produits par Google Search et Google Images.

### 4.2 Configuration du Compte
1. Accédez à [Google Merchant Center](https://merchants.google.com/).
2. Nom commercial : `Décofleur Plus`.
3. Pays : `Sénégal`.
4. Validez et revendiquez l'URL du site `https://decofleurplus.com` (automatique si votre compte Google est déjà propriétaire de la Search Console).
5. Méthode d'importation des produits :
   - Choisissez **Importation programmée** ou **Flux automatisé via balises Schema.org**.
   - Comme le site intègre les microdonnées complètes `Product` et `Offer` avec prix en FCFA, Googlebot lit directement les caractéristiques des produits.

---

## 5. Outils Officiels de Validation SEO

Avant et après toute mise en ligne majeure, utilisez ces 3 outils officiels pour valider la conformité technique du site :

### 5.1 Test des Résultats Enrichis Google (Rich Results Test)
- **URL de l'outil** : [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- **Objectif** : Vérifier que Google reconnaît les balises `Product`, `BreadcrumbList`, `Article` et `Florist`.
- **Pages à tester en priorité** :
  - Une fiche produit (ex: `https://decofleurplus.com/produits/bouquet-elegance-rose`)
  - Un article de blog (ex: `https://decofleurplus.com/blog/conserver-roses-dakar`)
  - La page d'accueil (`https://decofleurplus.com/`)
- **Résultat attendu** : Aucun avertissement critique, balisage valide.

### 5.2 Validateur Schema.org (Schema Markup Validator)
- **URL de l'outil** : [https://validator.schema.org/](https://validator.schema.org/)
- **Objectif** : Contrôler la syntaxe JSON-LD brute de l'organisation et des services.

### 5.3 Google PageSpeed Insights & Core Web Vitals
- **URL de l'outil** : [https://pagespeed.web.dev/](https://pagespeed.web.dev/)
- **Objectif** : Mesurer les performances réelles sur mobile et desktop (LCP, CLS, INP).
- **Cible** : Score de performance > 90 sur Desktop et > 80 sur Mobile (connexion 4G sénégalaise Orange/Free).

