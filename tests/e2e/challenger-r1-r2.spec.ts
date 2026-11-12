import { test, expect, type BrowserContext, type Page, type Route } from '@playwright/test';

// Helper to set admin session cookies
async function setAdminSession(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'admin_auth',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'df_admin_token',
      value: 'mock-admin-challenge-token-jwt-2026',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'admin_user',
      value: encodeURIComponent(
        JSON.stringify({
          id: 'admin-emp-01',
          name: 'Cheikh Admin',
          email: 'cheikh.admin@decofleursplus.sn',
          role: 'ADMIN',
          avatar: null,
        })
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
}

// Helper to mock client session
async function setClientSession(page: Page, context: BrowserContext) {
  const clientUser = {
    id: 'user-client-emp-01',
    name: 'Awa Diop',
    email: 'awa.diop@decofleursplus.sn',
    phone: '+221 77 555 12 34',
    provider: 'email',
    role: 'CLIENT',
  };

  // Intercept backend auth check if triggered
  await page.route('**/api/v1/auth/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { user: clientUser },
      }),
    });
  });

  await context.addCookies([
    {
      name: 'df_auth_token',
      value: 'mock-client-jwt-token-2026',
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.addInitScript((userObj: typeof clientUser) => {
    localStorage.setItem('df_auth_token', 'mock-client-jwt-token-2026');
    localStorage.setItem('decofleur_user_session', JSON.stringify(userObj));
  }, clientUser);
}

// =============================================================================
// REQUIREMENT 1 (R1): UI GATING, UNBACKED PAGES & "À VENIR" BADGES
// =============================================================================

test.describe('R1. Unbacked Pages & Action Button Disabling', () => {
  test.beforeEach(async ({ context }) => {
    await setAdminSession(context);
  });

  test('R1.1 Admin Fournisseurs: Action button is disabled and badge is present', async ({ page }) => {
    await page.goto('/admin/fournisseurs');
    await expect(page.locator('h1')).toContainText(/Gestion des fournisseurs/i);

    // Verify "À venir" badge in header
    const headerBadge = page.locator('h1 ~ span, div:has(> h1) span').filter({ hasText: 'À venir' }).first();
    await expect(headerBadge).toBeVisible();

    // Verify "Ajouter un fournisseur" button is disabled
    const addBtn = page.getByRole('button', { name: /Ajouter un fournisseur/i });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeDisabled();
    await expect(addBtn).toHaveAttribute('aria-disabled', 'true');
    await expect(addBtn).toHaveClass(/opacity-50/);
    await expect(addBtn).toHaveClass(/cursor-not-allowed/);
    await expect(addBtn).toContainText('À venir');
  });

  test('R1.2 Admin Fournisseur Detail: "Passer une commande" is disabled', async ({ page }) => {
    await page.goto('/admin/fournisseurs/sup-01');

    // Page may render details or fallback "Fournisseur introuvable" with badge
    const badge = page.getByText('À venir').first();
    await expect(badge).toBeVisible();

    // If detail rendered, check order button
    const orderBtn = page.locator('button').filter({ hasText: /Passer une commande/i });
    if (await orderBtn.count() > 0) {
      await expect(orderBtn).toBeDisabled();
      await expect(orderBtn).toHaveAttribute('aria-disabled', 'true');
      await expect(orderBtn).toHaveClass(/cursor-not-allowed/);
    }
  });

  test('R1.3 Admin Approvisionnements: "Nouvelle commande" disabled & factures link badged', async ({ page }) => {
    await page.goto('/admin/approvisionnements');
    await expect(page.locator('h1')).toContainText(/Commandes fournisseurs/i);

    // Header badge
    const badge = page.getByText('À venir').first();
    await expect(badge).toBeVisible();

    // Factures link has "À venir"
    const facturesLink = page.getByRole('link', { name: /Factures fournisseurs/i });
    await expect(facturesLink).toBeVisible();
    await expect(facturesLink).toContainText('À venir');

    // "Nouvelle commande" button is disabled
    const newOrderBtn = page.getByRole('button', { name: /Nouvelle commande/i });
    await expect(newOrderBtn).toBeVisible();
    await expect(newOrderBtn).toBeDisabled();
    await expect(newOrderBtn).toHaveAttribute('aria-disabled', 'true');
    await expect(newOrderBtn).toHaveClass(/cursor-not-allowed/);
  });

  test('R1.4 Admin Factures: "Ajouter une facture" is disabled', async ({ page }) => {
    await page.goto('/admin/approvisionnements/factures');
    await expect(page.locator('h1')).toContainText(/Factures fournisseurs/i);

    // Header badge
    const badge = page.getByText('À venir').first();
    await expect(badge).toBeVisible();

    // "Ajouter une facture" button is disabled
    const addInvoiceBtn = page.getByRole('button', { name: /Ajouter une facture/i });
    await expect(addInvoiceBtn).toBeVisible();
    await expect(addInvoiceBtn).toBeDisabled();
    await expect(addInvoiceBtn).toHaveAttribute('aria-disabled', 'true');
    await expect(addInvoiceBtn).toHaveClass(/cursor-not-allowed/);
  });

  test('R1.5 Admin Réception: "Enregistrer la réception" is disabled', async ({ page }) => {
    await page.goto('/admin/approvisionnements/reception/CF-2024-0001');

    const badge = page.getByText('À venir').first();
    await expect(badge).toBeVisible();

    const saveBtn = page.locator('button').filter({ hasText: /Enregistrer la réception/i });
    if (await saveBtn.count() > 0) {
      await expect(saveBtn).toBeDisabled();
      await expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
      await expect(saveBtn).toHaveClass(/cursor-not-allowed/);
    }
  });

  test('R1.6 Admin Paysagisme: Action buttons disabled across tabs', async ({ page }) => {
    await page.goto('/admin/paysagisme');
    await expect(page.locator('h1')).toContainText(/Paysagisme/i);

    // Header badge
    const badge = page.getByText('À venir').first();
    await expect(badge).toBeVisible();

    // Prestations tab action button
    const addBtn = page.locator('button').filter({ hasText: /Ajouter une prestation/i });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeDisabled();
    await expect(addBtn).toHaveAttribute('aria-disabled', 'true');

    // Switch to Réalisations tab
    await page.getByRole('button', { name: /Nos prestations/i }).click();
    const realisationsTab = page.locator('button').filter({ hasText: /prestations/i }).locator('..').getByRole('button', { name: /réalisations/i });
    if (await realisationsTab.count() > 0) {
      await realisationsTab.click();
      const addRealisationBtn = page.locator('button').filter({ hasText: /Ajouter une réalisation/i });
      await expect(addRealisationBtn).toBeVisible();
      await expect(addRealisationBtn).toBeDisabled();
    }
  });
});

test.describe('R1. Navigation & Public Badges', () => {
  test('R1.7 Admin Desktop Sidebar: Displays "À venir" badges', async ({ page, context }) => {
    await setAdminSession(context);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/tableau-de-bord');

    const sidebar = page.locator('.admin-sidebar');
    await expect(sidebar).toBeVisible();

    // Check badges for Fournisseurs, Approvisionnements, Paysagisme
    const fournisseursLink = sidebar.getByRole('link', { name: /Fournisseurs/i });
    await expect(fournisseursLink).toContainText('À venir');

    const approLink = sidebar.getByRole('link', { name: /Approvisionnements/i });
    await expect(approLink).toContainText('À venir');

    const paysagismeLink = sidebar.getByRole('link', { name: /Paysagisme/i });
    await expect(paysagismeLink).toContainText('À venir');
  });

  test('R1.8 Admin Mobile Drawer: Displays "À venir" badges on mobile viewport', async ({ page, context }) => {
    await setAdminSession(context);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/tableau-de-bord');

    // Open mobile drawer
    const menuBtn = page.locator('button.admin-topbar-mobile-menu-btn');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Check menu items in drawer
    const drawer = page.locator('aside').filter({ hasText: /Fournisseurs/i });
    await expect(drawer).toBeVisible();

    const fournisseursItem = drawer.getByRole('link', { name: /Fournisseurs/i });
    await expect(fournisseursItem).toContainText('À venir');

    const approItem = drawer.getByRole('link', { name: /Approvisionnements/i });
    await expect(approItem).toContainText('À venir');

    const paysagismeItem = drawer.getByRole('link', { name: /Paysagisme & Projets/i });
    await expect(paysagismeItem).toContainText('À venir');
  });

  test('R1.9 Client Desktop Header: Paysagisme dropdown has "À venir" badge', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const paysagismeDropdown = page.locator('.nav-item-dropdown').filter({ hasText: /Paysagisme/i });
    await expect(paysagismeDropdown).toBeVisible();
    await expect(paysagismeDropdown.locator('.nav-link')).toContainText('À venir');

    // Hover or trigger dropdown
    await paysagismeDropdown.hover();
    const dropdownMenu = paysagismeDropdown.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    const sublinks = dropdownMenu.locator('a');
    const count = await sublinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(sublinks.nth(i)).toContainText('À venir');
    }
  });

  test('R1.10 Client Mobile Drawer: Paysagisme accordion has "À venir" badge', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Open mobile hamburger menu
    const menuBtn = page.locator('button.mobile-menu-trigger');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const drawer = page.locator('#mobile-navigation-drawer');
    await expect(drawer).toBeVisible();

    // Paysagisme accordion header
    const paysagismeSection = drawer.locator('.drawer-section').filter({ hasText: /Paysagisme & Aménagement/i });
    await expect(paysagismeSection).toBeVisible();
    await expect(paysagismeSection).toContainText('À venir');

    // Click accordion to expand
    await paysagismeSection.locator('button').click();
    const sublinks = paysagismeSection.locator('.drawer-sublinks a');
    const count = await sublinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(sublinks.nth(i)).toContainText('À venir');
    }
  });

  test('R1.11 Client Footer: Paysagisme link has "À venir" badge', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const paysagismeWrap = footer.locator('span').filter({ hasText: /Paysagisme/i }).filter({ hasText: /À venir/i });
    await expect(paysagismeWrap).toBeVisible();
  });
});

test.describe('R1. Devis Routing & Default Service Type', () => {
  test('R1.12 Direct navigation to /devis defaults to evenements with Paysagisme badge', async ({ page }) => {
    await page.goto('/devis');
    await expect(page.locator('h1')).toContainText(/Demande de devis/i);

    // Verify "Paysagisme & Espaces Verts" toggle has "À venir" badge
    const paysagismeToggle = page.getByRole('button', { name: /Paysagisme & Espaces Verts/i });
    await expect(paysagismeToggle).toBeVisible();
    await expect(paysagismeToggle).toContainText('À venir');

    // Verify "Événements & Scénographie" is selected by default
    const evenementsToggle = page.getByRole('button', { name: /Événements & Scénographie/i });
    await expect(evenementsToggle).toBeVisible();

    // Active button in shared-devis-form uses bg-[#c8436e] for evenements
    await expect(evenementsToggle).toHaveClass(/bg-\[#c8436e\]/);
    await expect(paysagismeToggle).not.toHaveClass(/bg-\[#173f22\]/);
  });
});

// =============================================================================
// REQUIREMENT 2 (R2): MOBILE LOGOUT (CLIENT & ADMIN)
// =============================================================================

test.describe('R2. Client Mobile Drawer Logout', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12/13/14', width: 390, height: 844 },
  ];

  for (const vp of mobileViewports) {
    test(`R2.1 ${vp.name} (${vp.width}x${vp.height}): User profile block & logout immediately visible without scrolling`, async ({ page, context }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setClientSession(page, context);

      await page.goto('/');

      // Open mobile drawer
      const menuBtn = page.locator('button.mobile-menu-trigger');
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      const drawer = page.locator('#mobile-navigation-drawer');
      await expect(drawer).toBeVisible();

      // Find user profile / logout container
      const userBox = drawer.locator('div').filter({ hasText: 'Awa Diop' }).first();
      await expect(userBox).toBeVisible();

      const logoutBtn = drawer.getByRole('button', { name: /Déconnexion/i });
      await expect(logoutBtn).toBeVisible();

      // Verify logout button is inside the immediate viewport (no scroll needed)
      const logoutBox = await logoutBtn.boundingBox();
      expect(logoutBox).not.toBeNull();
      if (logoutBox) {
        expect(logoutBox.y).toBeGreaterThan(0);
        expect(logoutBox.y + logoutBox.height).toBeLessThanOrEqual(vp.height);
      }

      // Click logout and verify redirect to '/' and drawer closed
      await logoutBtn.click();
      await expect(page).toHaveURL(/.*\/$/);

      // Verify user session is cleared in localStorage
      const userInStorage = await page.evaluate(() => localStorage.getItem('decofleur_user_session'));
      expect(userInStorage).toBeNull();
    });
  }
});

test.describe('R2. Client Account (/compte) Mobile Logout', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12/13/14', width: 390, height: 844 },
  ];

  for (const vp of mobileViewports) {
    test(`R2.2 ${vp.name} (${vp.width}x${vp.height}): .account-sidebar .account-signout is NOT hidden and functional`, async ({ page, context }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setClientSession(page, context);

      await page.goto('/compte');

      const signoutBtn = page.locator('.account-sidebar .account-signout');
      await expect(signoutBtn).toBeVisible();

      // Verify computed style is NOT display: none
      const displayStyle = await signoutBtn.evaluate((el) => window.getComputedStyle(el).display);
      expect(displayStyle).not.toBe('none');
      expect(displayStyle).toBe('inline-flex');

      // Verify minimum touch target height
      const boundingBox = await signoutBtn.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
      }

      // Verify accessible label
      await expect(signoutBtn).toHaveAttribute('aria-label', 'Se déconnecter');

      // Click logout
      await signoutBtn.click();
      await expect(page).toHaveURL(/.*\/$/);

      // Verify user cleared
      const userInStorage = await page.evaluate(() => localStorage.getItem('decofleur_user_session'));
      expect(userInStorage).toBeNull();
    });
  }
});

test.describe('R2. Admin Mobile Logout (Topbar & Mobile Drawer)', () => {
  test('R2.3 Admin mobile topbar logout button is visible and triggers logoutAdmin', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setAdminSession(context);

    await page.goto('/admin/tableau-de-bord');

    // Dedicated topbar mobile logout button
    const topbarLogoutForm = page.locator('header .admin-topbar-actions form.lg\\:hidden');
    await expect(topbarLogoutForm).toBeVisible();

    const topbarLogoutBtn = topbarLogoutForm.locator('button[aria-label="Se déconnecter"]');
    await expect(topbarLogoutBtn).toBeVisible();

    // Click logout -> should redirect to /admin/connexion
    await topbarLogoutBtn.click();
    await expect(page).toHaveURL(/.*\/admin\/connexion/);

    // Verify cookies removed
    const cookies = await context.cookies();
    const adminAuth = cookies.find((c) => c.name === 'admin_auth');
    expect(adminAuth).toBeUndefined();
  });

  test('R2.4 Admin mobile drawer logout buttons are visible, accessible and trigger logoutAdmin', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setAdminSession(context);

    await page.goto('/admin/tableau-de-bord');

    // Open mobile drawer
    const menuBtn = page.locator('button.admin-topbar-mobile-menu-btn');
    await menuBtn.click();

    // Check header quick logout button
    const headerLogout = page.locator('button[title="Se déconnecter"]').first();
    await expect(headerLogout).toBeVisible();
    await expect(headerLogout).toHaveAttribute('aria-label', 'Se déconnecter');

    // Check footer logout button
    const footerLogout = page.locator('form button[aria-label="Se déconnecter"]').last();
    await expect(footerLogout).toBeVisible();
    await expect(footerLogout).toContainText('Se déconnecter');

    // Click footer logout
    await footerLogout.click();
    await expect(page).toHaveURL(/.*\/admin\/connexion/);
  });
});
