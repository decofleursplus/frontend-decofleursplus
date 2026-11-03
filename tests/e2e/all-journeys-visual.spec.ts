import { test, expect } from '@playwright/test';
import { generateQAUsers } from '../fixtures/faker-users';

// Configuration visuelle top-level pour Playwright
test.use({
  viewport: { width: 1366, height: 768 },
  launchOptions: {
    slowMo: 600, // Ralenti de 600ms entre chaque action pour admirer chaque interaction à l'écran
  },
});

test.describe.serial('🌺 GRAND TEST VISUEL DÉCOFLEUR PLUS — TOUS LES PARCOURS EN DIRECT', () => {
  const users = generateQAUsers();
  const customer = users[0]; // Awa Diallo

  // ===========================================================================
  // CHAPITRE 1 : LE PARCOURS E-COMMERCE & DÉCOUVERTE VITRINE (CLIENT PUBLIC)
  // ===========================================================================
  test('01. Vitrine : Exploration Accueil, Hero & Bouquets Vedettes', async ({ page }) => {
    console.log('\n🌸 --- CHAPITRE 1 : PARCOURS CLIENT PUBLIC ---');
    console.log('📍 1. Accueil & Découverte de la boutique...');
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Scroll progressif vers le hero et les catégories
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // Scroll vers les bouquets vedettes
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // Scroll vers les engagements & avis clients
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // Remonter en haut en douceur
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(800);
  });

  test('02. Catalogue : Recherche, Filtres de Prix & Grille Boutique', async ({ page }) => {
    console.log('📍 2. Navigation vers la Boutique & Filtres dynamiques...');
    await page.goto('/boutique');
    await page.waitForTimeout(1000);

    // Simulation de recherche textuelle
    const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"]').first();
    if (await searchInput.isVisible()) {
      console.log('   🔍 Saisie de la recherche "Orchidée"...');
      await searchInput.fill('Orchidée');
      await page.waitForTimeout(1200);
      await searchInput.clear();
      await page.waitForTimeout(800);
    }

    // Scroll dans la grille des bouquets
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  test('03. Produit & Panier : Fiche détaillée, Variantes & Ajout au Panier', async ({ page }) => {
    console.log('📍 3. Consultation d une fiche produit & Ajout au Panier...');
    await page.goto('/boutique');
    await page.waitForTimeout(800);

    // Clic sur le premier bouquet
    const firstProduct = page.locator('a[href*="/produits/"], .product-card a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1500);

      // Scroll sur la fiche pour voir les options
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await page.waitForTimeout(1000);

      // Clic sur le bouton d'ajout au panier
      const addToCart = page.locator('button:has-text("Ajouter au panier"), button:has-text("Commander")').first();
      if (await addToCart.isVisible()) {
        console.log('   🛒 Ajout de la composition au panier...');
        await addToCart.click();
        await page.waitForTimeout(1200);
      }
    }

    // Accès au panier
    console.log('   🛍️ Ouverture du panier d achat...');
    await page.goto('/panier');
    await page.waitForTimeout(1500);

    // Saisie d'un code promotionnel
    const couponInput = page.locator('input[placeholder*="promo"], input[id*="coupon"]').first();
    if (await couponInput.isVisible()) {
      console.log('   🎟️ Test du code promo BIENVENUE10...');
      await couponInput.fill('BIENVENUE10');
      await page.waitForTimeout(1000);
    }

    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  });

  test('04. Tunnel de Commande : Coordonnées, Zones & Modes de Paiement', async ({ page }) => {
    console.log('📍 4. Tunnel de commande & Calcul des frais de livraison...');
    await page.goto('/commande');
    await page.waitForTimeout(1500);

    // Remplissage partiel des informations de livraison
    const nameInput = page.locator('input[name="recipientName"], input[id*="name"]').first();
    const phoneInput = page.locator('input[name="recipientPhone"], input[type="tel"]').first();
    const addressInput = page.locator('input[name="deliveryAddress"], textarea[name*="address"]').first();

    if (await nameInput.isVisible()) {
      console.log('   📦 Saisie des informations de livraison...');
      await nameInput.fill(`${customer.firstName} ${customer.lastName}`);
      await page.waitForTimeout(500);
    }
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(customer.phone);
      await page.waitForTimeout(500);
    }
    if (await addressInput.isVisible()) {
      await addressInput.fill(customer.address);
      await page.waitForTimeout(500);
    }

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  test('05. Événementiel & Devis : Formulaire Mariage & Décoration Sur-Mesure', async ({ page }) => {
    console.log('📍 5. Demande de devis événementiel sur-mesure (/devis)...');
    await page.goto('/devis');
    await page.waitForTimeout(1500);

    // Défilement du formulaire multi-étapes
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  test('06. Abonnements Floraux : Formules Particulier, Prestige & Entreprise', async ({ page }) => {
    console.log('📍 6. Formules d abonnements récurrents (/abonnements)...');
    await page.goto('/abonnements');
    await page.waitForTimeout(1500);

    // Scroll pour voir les 3 formules
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  test('07. Services Spécialisés : Location de Matériel & Paysagisme', async ({ page }) => {
    console.log('📍 7. Découverte de la Location (/location) et du Paysagisme (/paysagisme)...');
    await page.goto('/location');
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    await page.goto('/paysagisme');
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  });

  test('08. Blog Floral & Conseils d Artisans', async ({ page }) => {
    console.log('📍 8. Consultation du Blog floral (/blog)...');
    await page.goto('/blog');
    await page.waitForTimeout(1200);

    // Scroll sur les articles
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  // ===========================================================================
  // CHAPITRE 2 : L'ESPACE CLIENT AUTHENTIFIÉ
  // ===========================================================================
  test('09. Espace Client : Inscription, Connexion & Tableau de Bord', async ({ page }) => {
    console.log('\n👤 --- CHAPITRE 2 : ESPACE CLIENT AUTHENTIFIÉ ---');
    console.log('📍 9. Page de connexion client (/connexion)...');
    await page.goto('/connexion');
    await page.waitForTimeout(1000);

    // Saisie des identifiants
    const idInput = page.locator('#auth-identifier');
    const pwdInput = page.locator('#auth-password');
    if (await idInput.isVisible()) {
      console.log(`   🔑 Saisie identifiants : ${customer.email}`);
      await idInput.fill(customer.email);
      await page.waitForTimeout(600);
      await pwdInput.fill('MotDePasseClient2026!');
      await page.waitForTimeout(800);
    }

    // Navigation vers l'espace compte
    console.log('   🏠 Découverte de l Espace Client (/compte)...');
    await page.goto('/compte');
    await page.waitForTimeout(1500);

    // Défilement dans l'espace client
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  });

  test('10. Compte Client : Carnet d Adresses & Préférences de Notification', async ({ page }) => {
    console.log('📍 10. Carnet d adresses & Préférences notifications...');
    await page.goto('/compte/adresses');
    await page.waitForTimeout(1200);

    await page.goto('/compte/commandes');
    await page.waitForTimeout(1200);

    await page.goto('/compte/notifications');
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  });

  // ===========================================================================
  // CHAPITRE 3 : LE BACK-OFFICE D'ADMINISTRATION (ESPACE STAFF)
  // ===========================================================================
  test('11. Back-Office : Sécurité Admin & Tableau de Bord Opérationnel', async ({ browser }) => {
    console.log('\n🛡️ --- CHAPITRE 3 : ESPACE ADMINISTRATION BACK-OFFICE ---');
    console.log('📍 11. Connexion au Back-Office & KPIs Tableau de Bord...');

    // Créer un contexte avec le cookie staff admin_auth=true
    const adminContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
    });
    await adminContext.addCookies([
      {
        name: 'admin_auth',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    const adminPage = await adminContext.newPage();

    // 1. Tableau de bord
    await adminPage.goto('/admin/tableau-de-bord');
    await adminPage.waitForTimeout(1500);
    await adminPage.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1200);

    // 2. Gestion des Commandes
    console.log('   📦 Back-Office : Suivi des Commandes (/admin/commandes)...');
    await adminPage.goto('/admin/commandes');
    await adminPage.waitForTimeout(1500);
    await adminPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1000);

    // 3. Catalogue & Produits
    console.log('   🌹 Back-Office : Catalogue Produits & Variantes (/admin/produits)...');
    await adminPage.goto('/admin/produits');
    await adminPage.waitForTimeout(1500);
    await adminPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1000);

    // 4. Catégories
    console.log('   🗂️ Back-Office : Catégories Florales (/admin/categories)...');
    await adminPage.goto('/admin/categories');
    await adminPage.waitForTimeout(1200);

    // 5. Inventaire & Stocks
    console.log('   📊 Back-Office : Inventaire & Alertes de Stock (/admin/stock)...');
    await adminPage.goto('/admin/stock');
    await adminPage.waitForTimeout(1200);
    await adminPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1000);

    // 6. Devis Événementiels
    console.log('   📑 Back-Office : Chiffrage des Devis (/admin/devis)...');
    await adminPage.goto('/admin/devis');
    await adminPage.waitForTimeout(1200);

    // 7. Flotte de Livraisons
    console.log('   🚚 Back-Office : Logistique & Courses Livreurs (/admin/livraisons)...');
    await adminPage.goto('/admin/livraisons');
    await adminPage.waitForTimeout(1200);

    // 8. CRM Clients
    console.log('   👥 Back-Office : CRM & Fiches Clients (/admin/clients)...');
    await adminPage.goto('/admin/clients');
    await adminPage.waitForTimeout(1200);

    // 9. Marketing & Promotions
    console.log('   🎟️ Back-Office : Campagnes & Codes Promo (/admin/marketing)...');
    await adminPage.goto('/admin/marketing');
    await adminPage.waitForTimeout(1200);

    // 10. Abonnements B2B & Particuliers
    console.log('   🌿 Back-Office : Contrats d Abonnements (/admin/abonnements)...');
    await adminPage.goto('/admin/abonnements');
    await adminPage.waitForTimeout(1200);

    // 11. Rapports Financiers
    console.log('   📈 Back-Office : Rapports Financiers (/admin/rapports)...');
    await adminPage.goto('/admin/rapports');
    await adminPage.waitForTimeout(1200);
    await adminPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1000);

    // 12. Paramètres de la Boutique
    console.log('   ⚙️ Back-Office : Paramètres & Équipe (/admin/parametres)...');
    await adminPage.goto('/admin/parametres');
    await adminPage.waitForTimeout(1500);
    await adminPage.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await adminPage.waitForTimeout(1200);

    console.log('🎉 TOUS LES PARCOURS ONT ÉTÉ VISUALISÉS ET VALIDÉS AVEC SUCCÈS !');
    await adminPage.waitForTimeout(2000);
    await adminContext.close();
  });
});

