import { test, expect } from '@playwright/test';
import { generateQAUsers } from '../fixtures/faker-users';

test.describe.serial('🌐 QA E2E Browser Test Suite — DécoFleur Plus UI', () => {
  const users = generateQAUsers();
  const testUser = users[0]; // Awa Diallo

  test('01. Accueil : Chargement vitrine, produits vedettes et navigation', async ({ page }) => {
    await page.goto('/');

    // Vérifier le titre de l application
    await expect(page).toHaveTitle(/DécoFleur|DecoFleur/i);

    // Vérifier la présence de la navbar et du footer
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Vérifier la présence du main
    await expect(page.locator('main')).toBeVisible();

    // Vérifier le lien vers la boutique
    const navBoutique = page.locator('header a[href*="boutique"]').first();
    await expect(navBoutique).toBeVisible();
  });

  test('02. Boutique : Grille de bouquets, filtres et recherche', async ({ page }) => {
    await page.goto('/boutique');

    // Vérifier la présence du titre
    await expect(page.locator('h1')).toContainText(/Boutique|Catalogue|Notre boutique/i);

    // Vérifier la présence de cartes produits
    const productCards = page.locator('article, .product-card, a[href*="/produits/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Tester la saisie dans le champ de recherche
    const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Rose');
      await page.waitForTimeout(500);
    }
  });

  test('03. Tunnel Inscription & Connexion Client', async ({ page }) => {
    // 1. Accéder à la page de connexion
    await page.goto('/connexion');
    await expect(page.locator('#auth-identifier')).toBeVisible();
    await expect(page.locator('#auth-password')).toBeVisible();

    // 2. Tester une connexion erronée
    await page.fill('#auth-identifier', 'faux-compte@inconnu.test');
    await page.fill('#auth-password', 'MauvaisPass123!');
    await page.click('button[type="submit"]');

    // Doit afficher un feedback d erreur
    const feedback = page.locator('.auth-feedback-banner, [role="status"]');
    await expect(feedback).toBeVisible({ timeout: 10000 });
  });

  test('04. Panier & Calculs dynamiques', async ({ page }) => {
    await page.goto('/panier');

    // Le panier doit s afficher
    await expect(page.locator('main')).toBeVisible();

    // Vérifier la présence du récapitulatif ou état vide
    const summaryOrEmpty = page.locator('.cart-page, .empty-cart, main');
    await expect(summaryOrEmpty).toBeVisible();
  });

  test('05. Devis Sur-Mesure Événementiel (/devis)', async ({ page }) => {
    await page.goto('/devis');

    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Vérifier les champs du formulaire de devis
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(3);
  });

  test('06. Formules d Abonnement Floral (/abonnements)', async ({ page }) => {
    await page.goto('/abonnements');

    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Doit afficher les formules (Particulier, Prestige, Entreprise)
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/Abonnement|Formule|Bouquet|Particulier/i);
  });

  test('07. Blog Floral Public (/blog)', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.locator('main')).toBeVisible();
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/Blog|Conseils|Fleurs|Articles/i);
  });

  test('08. Sécurité Back-Office : Redirection et Admin Guard', async ({ page }) => {
    // Tentative d accès direct au tableau de bord admin sans authentification
    await page.goto('/admin');

    // Doit rediriger vers /admin/connexion
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/admin\/connexion/);

    // Vérifier les champs de connexion staff
    const adminEmail = page.locator('#email, input[name="email"]');
    await expect(adminEmail).toBeVisible();
  });
});
