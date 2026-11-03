import { test, expect } from '@playwright/test';
import { generateQAUsers } from '../fixtures/faker-users';

test.use({
  viewport: { width: 1366, height: 768 },
  launchOptions: {
    slowMo: 700, // Ralentit les actions de 700ms pour voir distinctement chaque interaction
  },
});

test.describe('🎬 Démonstration Visuelle du Parcours Client — DécoFleur Plus', () => {

  const users = generateQAUsers();
  const persona = users[0]; // Awa Diallo

  test('Parcours Client Visuel : Vitrine -> Boutique -> Panier -> Devis -> Abonnements -> Connexion', async ({ page }) => {
    // -------------------------------------------------------------
    // ÉTAPE 1 : Page d'Accueil & Découverte Vitrine
    // -------------------------------------------------------------
    console.log('🌸 1. Arrivée sur la page d accueil...');
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Scroll pour admirer la bannière et les bouquets vedettes
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // -------------------------------------------------------------
    // ÉTAPE 2 : Navigation vers la Boutique & Filtres
    // -------------------------------------------------------------
    console.log('💐 2. Navigation vers la Boutique florale...');
    const boutiqueLink = page.locator('header a[href*="boutique"]').first();
    await boutiqueLink.click();
    await expect(page).toHaveURL(/.*boutique/);
    await page.waitForTimeout(1000);

    // Recherche d'un bouquet avec frappe visible
    const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"]').first();
    if (await searchInput.isVisible()) {
      console.log('🔍 Recherche "Rose" dans le catalogue...');
      await searchInput.fill('Rose');
      await page.waitForTimeout(1500);
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }

    // Scroll dans la boutique
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // Clic sur le premier produit disponible pour ouvrir la fiche
    const firstProduct = page.locator('a[href*="/produits/"], .product-card a').first();
    if (await firstProduct.isVisible()) {
      console.log('🌹 Ouverture de la fiche produit détaillée...');
      await firstProduct.click();
      await page.waitForTimeout(2000);

      // Scroll sur la fiche produit
      await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
      await page.waitForTimeout(1000);

      // Clic sur le bouton d'ajout au panier si présent
      const addToCartBtn = page.locator('button:has-text("Ajouter au panier"), button:has-text("Commander")').first();
      if (await addToCartBtn.isVisible()) {
        console.log('🛒 Ajout du bouquet au panier...');
        await addToCartBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // -------------------------------------------------------------
    // ÉTAPE 3 : Consultation du Panier
    // -------------------------------------------------------------
    console.log('🛍️ 3. Accès au panier d achat...');
    await page.goto('/panier');
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // Test de saisie d'un code promo dans le panier
    const couponInput = page.locator('input[placeholder*="promo"], input[name*="coupon"], input[id*="coupon"]').first();
    if (await couponInput.isVisible()) {
      console.log('🎟️ Saisie du code promo BIENVENUE10...');
      await couponInput.fill('BIENVENUE10');
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------
    // ÉTAPE 4 : Demande de Devis Événementiel Sur-Mesure
    // -------------------------------------------------------------
    console.log('📋 4. Navigation vers le formulaire de devis sur-mesure...');
    await page.goto('/devis');
    await page.waitForTimeout(1500);

    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------
    // ÉTAPE 5 : Formules d'Abonnement Floral
    // -------------------------------------------------------------
    console.log('🌿 5. Découverte des abonnements floraux récurrents...');
    await page.goto('/abonnements');
    await page.waitForTimeout(1500);

    // Parcourir les formules (Particulier, Prestige, Entreprise)
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // -------------------------------------------------------------
    // ÉTAPE 6 : Consultation du Blog Floral
    // -------------------------------------------------------------
    console.log('📰 6. Lecture des articles et conseils du blog floral...');
    await page.goto('/blog');
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // -------------------------------------------------------------
    // ÉTAPE 7 : Page de Connexion & Espace Client
    // -------------------------------------------------------------
    console.log('🔐 7. Accès à la page de connexion client...');
    await page.goto('/connexion');
    await page.waitForTimeout(1000);

    // Remplissage avec le persona Faker
    const idInput = page.locator('#auth-identifier');
    const pwdInput = page.locator('#auth-password');

    if (await idInput.isVisible()) {
      console.log(`👤 Saisie des identifiants Faker pour ${persona.firstName} ${persona.lastName}...`);
      await idInput.fill(persona.email);
      await page.waitForTimeout(600);
      await pwdInput.fill('MotDePasseTest2026!');
      await page.waitForTimeout(800);
    }

    console.log('✅ Démonstration visuelle terminée avec succès !');
    await page.waitForTimeout(2000);
  });
});

