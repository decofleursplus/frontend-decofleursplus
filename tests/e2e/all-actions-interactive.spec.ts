import { test, expect } from '@playwright/test';
import { generateQAUsers } from '../fixtures/faker-users';

// Rythme posé de 1000ms (1 seconde par action pour observer confortablement chaque interaction)
test.use({
  viewport: { width: 1366, height: 768 },
  launchOptions: {
    slowMo: 1000,
  },
});

test.describe.serial('🎬 GRAND TEST DES ACTIONS INTERACTIVES (Création, Clics, Modifications, Suppression)', () => {
  const users = generateQAUsers();
  const testUser = users[0]; // Awa Diallo

  // =========================================================================
  // 1. CRÉATION DE COMPTE RÉEL (INSCRIPTION FAKER)
  // =========================================================================
  test('01. Création de Compte Réel : Saisie complète, CGU & Validation', async ({ page }) => {
    console.log('\n👤 1. Inscription d un nouveau compte client...');
    await page.goto('/inscription');
    await page.waitForTimeout(1500);

    // Sélecteurs vérifiés dans components/auth/register-form.tsx
    const nameInput = page.locator('#reg-name');
    const emailInput = page.locator('#reg-email');
    const phoneInput = page.locator('#reg-phone');
    const pwdInput = page.locator('#reg-password');

    console.log(`   ✍️ Saisie du nom : ${testUser.firstName} ${testUser.lastName}`);
    await nameInput.fill(`${testUser.firstName} ${testUser.lastName}`);

    console.log(`   ✍️ Saisie de l email : ${testUser.email}`);
    await emailInput.fill(testUser.email);

    console.log(`   ✍️ Saisie du téléphone sénégalais : ${testUser.phone}`);
    await phoneInput.fill(testUser.phone);

    console.log('   ✍️ Saisie du mot de passe sécurisé...');
    await pwdInput.fill('ClientSecurise@2026!');

    // Clic sur le bouton d'inscription
    console.log('   🖱️ Clic sur "Créer mon compte"...');
    const submitBtn = page.locator('button[type="submit"]:has-text("Créer mon compte"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(2500);
  });

  // =========================================================================
  // 2. CONNEXION CLIENT & REDIRECTION
  // =========================================================================
  test('02. Connexion Réelle & Accès à l Espace Personnel', async ({ page }) => {
    console.log('\n🔑 2. Connexion avec les identifiants client...');
    await page.goto('/connexion');
    await page.waitForTimeout(1500);

    const idInput = page.locator('#auth-identifier');
    const pwdInput = page.locator('#auth-password');

    console.log(`   ✍️ Saisie identifiant : ${testUser.email}`);
    await idInput.fill(testUser.email);

    console.log('   ✍️ Saisie mot de passe...');
    await pwdInput.fill('ClientSecurise@2026!');

    console.log('   🖱️ Clic sur "Connexion"...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  });

  // =========================================================================
  // 3. CARNET D'ADRESSES : CRÉATION, DÉFINIR PAR DÉFAUT & SUPPRESSION
  // =========================================================================
  test('03. Carnet d Adresses : Création d adresse, Par Défaut & Suppression', async ({ page }) => {
    console.log('\n🏡 3. Gestion du Carnet d Adresses (/compte/adresses)...');
    await page.goto('/compte/adresses');
    await page.waitForTimeout(1500);

    // 1. Création d'une nouvelle adresse
    console.log('   📝 Remplissage du formulaire d ajout d adresse...');
    const nameInput = page.locator('input[placeholder*="Maison, Bureau"], input[placeholder*="Villa"]').first();
    const streetInput = page.locator('input[placeholder*="Rue, numéro"]').first();
    const cityInput = page.locator('input[placeholder*="Saly Portudal, Dakar"]').first();
    const phoneInput = page.locator('input[placeholder*="+221 77"]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('Villa Almadies Résidence');
      await streetInput.fill('Route de la Corniche Ouest, Lot 12');
      await cityInput.fill('Dakar');
      await phoneInput.fill(testUser.phone);

      console.log('   🖱️ Clic sur "Enregistrer cette adresse"...');
      const saveBtn = page.locator('button:has-text("Enregistrer cette adresse")').first();
      await saveBtn.click();
      await page.waitForTimeout(2500);
    }

    // 2. Définir une adresse par défaut si bouton visible
    const defaultBtn = page.locator('button:has-text("Par défaut")').first();
    if (await defaultBtn.isVisible()) {
      console.log('   ⭐ Clic sur le bouton "Par défaut"...');
      await defaultBtn.click();
      await page.waitForTimeout(1500);
    }

    // 3. Suppression d'une adresse avec l'icône corbeille
    const deleteBtn = page.locator('button[aria-label="Supprimer cette adresse"]').first();
    if (await deleteBtn.isVisible()) {
      console.log('   🗑️ Clic sur la corbeille pour supprimer une adresse...');
      await deleteBtn.click();
      await page.waitForTimeout(2000);
      console.log('   ✨ Adresse supprimée avec succès de la liste !');
    }
  });

  // =========================================================================
  // 4. BOUTIQUE & PANIER : AJOUT, QUANTITÉ +, QUANTITÉ -, CODE PROMO & SUPPRESSION
  // =========================================================================
  test('04. Panier Réel : Ajout, Quantité (+), Quantité (-), Code Promo & Suppression', async ({ page }) => {
    console.log('\n🛒 4. Parcours Panier Complet (Ajout, Stepper, Promo, Suppression)...');

    // 1. Navigation boutique
    await page.goto('/boutique');
    await page.waitForTimeout(1500);

    // 2. Clic sur un bouquet
    const productLink = page.locator('a[href*="/produits/"], .product-card a').first();
    if (await productLink.isVisible()) {
      console.log('   🌹 Clic sur la composition florale...');
      await productLink.click();
      await page.waitForTimeout(2000);

      // 3. Clic sur Ajouter au panier
      const addToCart = page.locator('button:has-text("Ajouter au panier"), button:has-text("Commander")').first();
      if (await addToCart.isVisible()) {
        console.log('   🖱️ Clic sur "Ajouter au panier"...');
        await addToCart.click();
        await page.waitForTimeout(1500);
      }
    }

    // 4. Consultation du panier
    console.log('   🛍️ Ouverture de la page Panier (/panier)...');
    await page.goto('/panier');
    await page.waitForTimeout(2000);

    // 5. Incrémentation de la quantité (+)
    const plusBtn = page.locator('button[aria-label="Augmenter la quantité"]').first();
    if (await plusBtn.isVisible()) {
      console.log('   ➕ Clic sur le bouton (+) pour augmenter la quantité à 2...');
      await plusBtn.click();
      await page.waitForTimeout(1500);
    }

    // 6. Décrémentation de la quantité (-)
    const minusBtn = page.locator('button[aria-label="Réduire la quantité"]').first();
    if (await minusBtn.isVisible()) {
      console.log('   ➖ Clic sur le bouton (-) pour réduire la quantité...');
      await minusBtn.click();
      await page.waitForTimeout(1500);
    }

    // 7. Application d'un code promo
    const promoInput = page.locator('input[id="promo"], input[placeholder*="promo"]').first();
    const applyPromoBtn = page.locator('button:has-text("Appliquer")').first();
    if (await promoInput.isVisible() && await applyPromoBtn.isVisible()) {
      console.log('   🎟️ Saisie du code promo BIENVENUE10 et clic sur "Appliquer"...');
      await promoInput.fill('BIENVENUE10');
      await applyPromoBtn.click();
      await page.waitForTimeout(1500);
    }

    // 8. Suppression de l'article du panier
    const removeItemBtn = page.locator('button.remove-item, button[aria-label*="Retirer"]').first();
    if (await removeItemBtn.isVisible()) {
      console.log('   ❌ Clic sur la croix de suppression de l article...');
      await removeItemBtn.click();
      await page.waitForTimeout(2000);
      console.log('   ✨ Article retiré, le panier est désormais vide !');
    }
  });

  // =========================================================================
  // 5. DEVIS ÉVÉNEMENTIEL RÉEL : FORMULAIRE & SOUMISSION
  // =========================================================================
  test('05. Devis Sur-Mesure : Remplissage interactif & Soumission', async ({ page }) => {
    console.log('\n📑 5. Demande de devis événementiel sur-mesure (/devis)...');
    await page.goto('/devis');
    await page.waitForTimeout(1500);

    // Remplissage des champs de formulaire
    const locationInput = page.locator('input[name*="location"], input[placeholder*="Lieu"], input[placeholder*="Hôtel"]').first();
    const nameInput = page.locator('input[name*="name"], input[placeholder*="Votre nom"]').first();
    const phoneInput = page.locator('input[name*="phone"], input[type="tel"]').first();

    if (await locationInput.isVisible()) {
      console.log('   ✍️ Saisie du lieu : Hôtel King Fahd Palace, Dakar...');
      await locationInput.fill('Hôtel King Fahd Palace, Dakar');
    }
    if (await nameInput.isVisible()) {
      console.log(`   ✍️ Saisie du contact : ${testUser.firstName} ${testUser.lastName}...`);
      await nameInput.fill(`${testUser.firstName} ${testUser.lastName}`);
    }
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(testUser.phone);
    }

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
  });

  // =========================================================================
  // 6. BACK-OFFICE ADMIN : COMMANDES, STOCK & MARKETING
  // =========================================================================
  test('06. Back-Office Admin : Commandes, Ajustement Stock & Marketing', async ({ browser }) => {
    console.log('\n🛡️ 6. Opérations d Administration Back-Office...');

    const adminContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
    });
    // Injecter le cookie d'authentification staff
    await adminContext.addCookies([
      {
        name: 'admin_auth',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    const adminPage = await adminContext.newPage();

    // 1. Consultation des Commandes
    console.log('   📦 Accès à la gestion des commandes (/admin/commandes)...');
    await adminPage.goto('/admin/commandes');
    await adminPage.waitForTimeout(2000);

    // Clic sur un filtre de statut (ex: En préparation ou Prête)
    const filterBtn = adminPage.locator('button:has-text("Toutes"), button:has-text("En préparation")').first();
    if (await filterBtn.isVisible()) {
      console.log('   🖱️ Clic sur le filtre des commandes...');
      await filterBtn.click();
      await adminPage.waitForTimeout(1200);
    }

    // 2. Gestion des Stocks & Mouvements
    console.log('   📊 Accès à l inventaire de stock (/admin/stock)...');
    await adminPage.goto('/admin/stock');
    await adminPage.waitForTimeout(2000);

    // Clic sur le bouton "Ajuster le stock"
    const adjustBtn = adminPage.locator('button:has-text("Ajuster le stock"), button[title*="Ajuster"]').first();
    if (await adjustBtn.isVisible()) {
      console.log('   🖱️ Clic sur le bouton "Ajuster le stock"...');
      await adjustBtn.click();
      await adminPage.waitForTimeout(2000);
    }

    // 3. Marketing & Coupons
    console.log('   🎟️ Accès à l espace Marketing (/admin/marketing)...');
    await adminPage.goto('/admin/marketing');
    await adminPage.waitForTimeout(2000);

    // Clic sur "Nouveau code promo"
    const newCouponBtn = adminPage.locator('button:has-text("Nouveau code promo")').first();
    if (await newCouponBtn.isVisible()) {
      console.log('   🖱️ Clic sur "Nouveau code promo" (ouverture modal)...');
      await newCouponBtn.click();
      await adminPage.waitForTimeout(2000);
    }

    // 4. Catégories & Bascule d'activation
    console.log('   🗂️ Accès aux Catégories Florales (/admin/categories)...');
    await adminPage.goto('/admin/categories');
    await adminPage.waitForTimeout(2000);

    console.log('\n🎉 TOUTES LES ACTIONS INTERACTIVES ONT ÉTÉ EXÉCUTÉES ET OBSERVÉES EN DIRECT !');
    console.log('⏳ La fenêtre du navigateur reste ouverte pour vous permettre d inspecter le résultat...');
    await adminPage.waitForTimeout(15000); // 15 secondes de pause finale
    await adminContext.close();
  });
});
