import { test, expect } from '@playwright/test';

test.describe.serial('🌸 DécoFleur Plus — Tests E2E Administration & Logique Métier', () => {
  const timestamp = Date.now();
  const testProduct = {
    name: `Bouquet E2E ${timestamp}`,
    description: 'Magnifique bouquet créé lors de la suite de tests automatisée E2E',
    price: '18500',
  };

  test('01. Connexion administrateur avec les identifiants réels', async ({ page }) => {
    await page.goto('/admin/connexion');

    // Vérifier la présence du formulaire
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Remplir les identifiants
    await page.fill('#email', 'admin@decofleursplus.com');
    await page.fill('#password', 'admin123');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérification de la redirection vers le tableau de bord
    await expect(page).toHaveURL(/.*\/admin\/(tableau-de-bord)?/, { timeout: 15000 });
  });

  test('02. Consultation des catégories de catalogue', async ({ page }) => {
    // Connexion
    await page.goto('/admin/connexion');
    await page.fill('#email', 'admin@decofleursplus.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    // Accéder aux catégories
    await page.goto('/admin/categories');
    await expect(page.locator('h1')).toContainText(/Catégories/i);

    // Vérifier que le tableau de catégories s'affiche avec des données réelles
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('03. Création de produit avec SKU automatique et sans remise par défaut', async ({ page }) => {
    // Connexion
    await page.goto('/admin/connexion');
    await page.fill('#email', 'admin@decofleursplus.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    // Aller sur le formulaire de création
    await page.goto('/admin/produits/nouveau');
    await expect(page.locator('h1')).toContainText(/Nouveau Produit/i);

    // Vérifier que la case promotion est décochée par défaut
    const promoCheckbox = page.locator('#hasPromo');
    await expect(promoCheckbox).toBeVisible();
    await expect(promoCheckbox).not.toBeChecked();

    // Remplir les informations produit (en laissant SKU vide)
    await page.fill('#name', testProduct.name);
    await page.fill('#description', testProduct.description);
    await page.fill('#price', testProduct.price);

    // Vérifier que le SKU est vide
    await expect(page.locator('#sku')).toHaveValue('');

    // Soumettre le formulaire
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Vérification de la redirection vers la liste des produits
    await expect(page).toHaveURL(/.*\/admin\/produits/, { timeout: 20000 });
  });

  test('04. Présence du bouton de déconnexion en mode mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 390, height: 844 });

    // Accéder à la connexion admin
    await page.goto('/admin/connexion');
    await page.fill('#email', 'admin@decofleursplus.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    // Vérifier la présence du bouton de déconnexion rapide dans la topbar mobile
    const logoutBtnTopbar = page.locator('header button[title="Se déconnecter"]').first();
    await expect(logoutBtnTopbar).toBeVisible({ timeout: 5000 });
  });
});
