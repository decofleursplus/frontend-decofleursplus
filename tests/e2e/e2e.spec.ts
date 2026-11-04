import { test, expect } from '@playwright/test';

test.describe.serial('🌸 DécoFleur Plus — Suite E2E Réelle (API Live & Sans Mocks)', () => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testUser = {
    name: 'Aminata Ndiaye',
    email: `client-e2e-${timestamp}@decofleur-tests.sn`,
    phone: `+22177${Math.floor(1000000 + Math.random() * 8999999)}`,
    password: 'Password@2026!',
  };

  // =========================================================================
  // 1. INSCRIPTION CLIENT RÉELLE VIA LE FORMULAIRE WEB
  // =========================================================================
  test('01. Inscription d un nouveau client réel avec persistance en base', async ({ page }) => {
    await page.goto('/inscription');
    await expect(page.locator('#reg-name')).toBeVisible();

    // Remplissage des coordonnées réelles
    await page.fill('#reg-name', testUser.name);
    await page.fill('#reg-email', testUser.email);
    await page.fill('#reg-phone', testUser.phone);
    await page.fill('#reg-password', testUser.password);

    // Validation du formulaire d'inscription
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Vérification du succès (écran de succès)
    const successHeader = page.getByRole('heading', { name: /Compte créé avec succès/i });
    await expect(successHeader).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 2. CONNEXION CLIENT RÉELLE & SESSION
  // =========================================================================
  test('02. Connexion avec les identifiants créés et persistance de session', async ({ page }) => {
    await page.goto('/connexion');
    await expect(page.locator('#auth-identifier')).toBeVisible();
    await expect(page.locator('#auth-password')).toBeVisible();

    // Saisie des identifiants réels
    await page.fill('#auth-identifier', testUser.email);
    await page.fill('#auth-password', testUser.password);

    // Clic connexion
    await page.click('button[type="submit"]');

    // Vérification de la redirection vers l'espace compte
    await expect(page).toHaveURL(/.*\/compte/, { timeout: 15000 });
    await expect(page.locator('main')).toBeVisible();
  });

  // =========================================================================
  // 3. ESPACE MON COMPTE & AJOUT D'UNE VRAIE ADRESSE DE LIVRAISON
  // =========================================================================
  test('03. Gestion de compte et ajout d une nouvelle adresse de livraison', async ({ page }) => {
    // Connexion préalable pour avoir la session active
    await page.goto('/connexion');
    await page.fill('#auth-identifier', testUser.email);
    await page.fill('#auth-password', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/compte/, { timeout: 15000 });

    // Navigation vers la section adresses
    await page.goto('/compte/adresses');
    await expect(page.locator('h1.account-title, h1')).toContainText(/adresses/i);

    // Formulaire d'ajout d'une adresse
    const addrNameInput = page.locator('input[placeholder*="Maison, Bureau"]');
    const addrStreetInput = page.locator('input[placeholder*="Rue, numéro"]');
    const addrCityInput = page.locator('input[placeholder*="Saly Portudal, Dakar"]');
    const addrPhoneInput = page.locator('input[placeholder*="+221"]');

    await expect(addrNameInput).toBeVisible();
    await addrNameInput.fill(`Villa Saly ${randomSuffix}`);
    await addrStreetInput.fill('Route de la Corniche, Fann Résidence');
    await addrCityInput.fill('Saly Portudal');
    await addrPhoneInput.fill(testUser.phone);

    // Soumission de l'adresse
    const addBtn = page.locator('button[type="submit"]:has-text("Enregistrer cette adresse")');
    await addBtn.click();

    // Vérifier que la nouvelle adresse apparaît bien dans la liste
    await expect(page.getByText(`Villa Saly ${randomSuffix}`)).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 4. BOUTIQUE & VITRINE : RENDU PROPRE DE L'EMPTY STATE SANS MOCKS
  // =========================================================================
  test('04. Boutique : Affichage propre de l Empty State soigné quand le catalogue est vide', async ({ page }) => {
    await page.goto('/boutique');

    // Vérification de la structure de la boutique
    await expect(page.locator('h1')).toContainText(/Boutique|Catalogue/i);

    // Vérifier l'empty state élégant sans aucun produit mocké
    const emptyStateTitle = page.getByRole('heading', { name: /Notre nouvelle collection florale arrive très bientôt/i });
    await expect(emptyStateTitle).toBeVisible({ timeout: 15000 });

    // Vérifier la présence des boutons d'action
    const devisLink = page.locator('a[href*="/devis"]:has-text("Demander un devis")').first();
    await expect(devisLink).toBeVisible();

    // S'assurer qu'aucun ancien bouquet mocké (ex: Bouquet Élégance Rose) n'est présent
    const mockProduct = page.getByText('Bouquet Élégance Rose');
    await expect(mockProduct).not.toBeVisible();
  });

  // =========================================================================
  // 5. PANIER VIDE & SÉCURISATION DU TUNNEL DE COMMANDE (/commande)
  // =========================================================================
  test('05. Tunnel de commande : Écran dédié au panier vide avec formulaire de paiement bloqué', async ({ page }) => {
    // 1. Accès au panier vide
    await page.goto('/panier');
    await expect(page.locator('main')).toBeVisible();

    // 2. Accès direct à la page de commande avec panier vide
    await page.goto('/commande');

    // L'écran dédié au panier vide doit être affiché
    const emptyCartHeading = page.getByRole('heading', { name: /Votre panier est vide/i });
    await expect(emptyCartHeading).toBeVisible({ timeout: 10000 });

    // Le bouton pour découvrir la boutique doit être proposé
    const browseShopBtn = page.locator('a[href*="/boutique"]:has-text("Découvrir la boutique")');
    await expect(browseShopBtn).toBeVisible();

    // Les anciens mock-items (mock-1, mock-2) ne doivent pas exister
    await expect(page.getByText('mock-1')).not.toBeVisible();
    await expect(page.getByText('mock-2')).not.toBeVisible();

    // Le bouton de validation finale de paiement ne doit PAS être accessible
    const paySubmitBtn = page.locator('button[type="submit"]:has-text("Confirmer et payer")');
    await expect(paySubmitBtn).not.toBeVisible();
  });

  // =========================================================================
  // 6. DEVIS SUR-MESURE : SOUMISSION RÉELLE ENVOYÉE AU BACKEND
  // =========================================================================
  test('06. Demande de devis événementiel : Remplissage et envoi réel au backend', async ({ page }) => {
    await page.goto('/devis');
    await expect(page.locator('h1')).toContainText(/Demande de devis/i);

    // Étape 1 : Coordonnées
    const nameInput = page.locator('#fullName');
    const emailInput = page.locator('#email');
    const phoneInput = page.locator('#phone');

    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(testUser.name);
    await emailInput.fill(testUser.email);
    await phoneInput.fill(testUser.phone);

    // Passer à l'étape 2
    const nextBtn1 = page.locator('button[type="submit"]:has-text("Continuer vers mon projet")');
    await nextBtn1.click();

    // Étape 2 : Détails du projet
    const locationInput = page.locator('#location');
    await expect(locationInput).toBeVisible({ timeout: 10000 });
    await locationInput.fill('Saly Portudal, Résidence Palmeraie');

    const descInput = page.locator('#description');
    await descInput.fill('Aménagement floral complet pour réception de mariage à Saly.');

    // Passer à l'étape 3
    const nextBtn2 = page.locator('button[type="submit"]:has-text("Étape suivante")');
    await nextBtn2.click();

    // Étape 3 : Soumission finale du devis
    const submitQuoteBtn = page.locator('button[type="submit"]:has-text("Envoyer ma demande de devis")');
    await expect(submitQuoteBtn).toBeVisible({ timeout: 10000 });
    await submitQuoteBtn.click();

    // Étape 4 : Écran de confirmation avec référence générée par l'API
    const confirmHeading = page.getByRole('heading', { name: /Votre demande de devis est enregistrée/i });
    await expect(confirmHeading).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 7. FORMULES D'ABONNEMENT FLORAL (/abonnements)
  // =========================================================================
  test('07. Abonnements floraux : Chargement des formules et détails', async ({ page }) => {
    await page.goto('/abonnements');
    await expect(page.locator('main')).toBeVisible();

    // Vérifier la présence du titre et des formules
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toMatch(/Abonnement|Formule|Bouquet|Particulier/i);
  });

  // =========================================================================
  // 8. SÉCURITÉ : VÉRIFICATION DU BLOCAGE STRICT DE L'ADMINISTRATION
  // =========================================================================
  test('08. Sécurité Back-Office : Redirection et protection AdminGuard pour les profils non staff', async ({ browser }) => {
    // Utiliser un contexte indépendant sans token d'administrateur
    const anonymousContext = await browser.newContext();
    const anonPage = await anonymousContext.newPage();

    await anonPage.goto('/admin/commandes');

    // Doit être redirigé vers une page de connexion (client ou admin) et ne pas afficher les commandes staff
    await anonPage.waitForURL(/(connexion|login)/, { timeout: 15000 });
    expect(anonPage.url()).toMatch(/(connexion|login)/);

    await anonymousContext.close();
  });
});
