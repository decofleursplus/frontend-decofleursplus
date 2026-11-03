import { test, expect, APIRequestContext } from '@playwright/test';
import { generateQAUsers, QAUserPersona } from '../fixtures/faker-users';
import { QAApiClient } from '../helpers/api-client';

test.describe.serial('🧪 QA Test Suite Complète — API DécoFleur Plus', () => {
  let users: QAUserPersona[];
  let clientTokens: Map<number, string> = new Map();
  let availableCategories: any[] = [];
  let sampleProduct: any = null;
  let sampleVariantId: string = '';
  let sampleDeliveryZone: any = null;

  async function getOrCreateToken(request: APIRequestContext, user: QAUserPersona): Promise<string> {
    if (clientTokens.has(user.id)) {
      return clientTokens.get(user.id)!;
    }
    const api = new QAApiClient(request);
    const regRes = await api.post('/auth/register', {
      email: user.email,
      phone: user.phone,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    let token = '';
    if (regRes.status === 200 || regRes.status === 201) {
      token = regRes.body.data.token;
    } else {
      const loginRes = await api.post('/auth/login', {
        identifier: user.email,
        password: user.password,
      });
      token = loginRes.body.data?.token || '';
    }
    clientTokens.set(user.id, token);
    return token;
  }

  test.beforeAll(async () => {
    users = generateQAUsers();
  });

  // =========================================================================
  // 1. HEALTHCHECK
  // =========================================================================
  test('01. Healthcheck du serveur backend Staging', async ({ request }) => {
    const api = new QAApiClient(request);
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.status).toBe('UP');
  });

  // =========================================================================
  // 2. AUTHENTIFICATION & CRÉATION DES 10 UTILISATEURS FAKER
  // =========================================================================
  test('02. Inscription et connexion multi-identifiant des clients Faker', async ({ request }) => {
    const api = new QAApiClient(request);

    // Inscrire les 6 premiers utilisateurs clients
    for (const u of users.slice(0, 6)) {
      const token = await getOrCreateToken(request, u);
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(20);

      // Tester la connexion par Email
      const loginEmailRes = await api.post('/auth/login', {
        identifier: u.email,
        password: u.password,
      });
      expect(loginEmailRes.status).toBe(200);
      expect(loginEmailRes.body.success).toBe(true);

      // Tester la connexion par Téléphone
      const loginPhoneRes = await api.post('/auth/login', {
        identifier: u.phone,
        password: u.password,
      });
      expect(loginPhoneRes.status).toBe(200);
      expect(loginPhoneRes.body.success).toBe(true);

      // Vérifier le profil /auth/me
      const authApi = new QAApiClient(request, token);
      const meRes = await authApi.get('/auth/me');
      expect(meRes.status).toBe(200);
      const returnedEmail = meRes.body.data?.email || meRes.body.data?.user?.email;
      expect(returnedEmail).toBe(u.email);
    }
  });

  test('03. Rejet strict des doublons et mots de passe invalides', async ({ request }) => {
    const api = new QAApiClient(request);
    const existingUser = users[0];

    // Tentative avec email déjà existant
    const dupEmailRes = await api.post('/auth/register', {
      email: existingUser.email,
      phone: '+221779998877',
      password: 'AnotherPassword@2026!',
      firstName: 'Clone',
      lastName: 'Email',
    });
    expect([400, 409]).toContain(dupEmailRes.status);
    expect(dupEmailRes.body.success).toBe(false);

    // Tentative de connexion avec mauvais mot de passe
    const badPassRes = await api.post('/auth/login', {
      identifier: existingUser.email,
      password: 'WrongPassword123!',
    });
    expect(badPassRes.status).toBe(401);
    expect(badPassRes.body.success).toBe(false);
  });

  // =========================================================================
  // 3. CATALOGUE PUBLIC & RECHERCHE
  // =========================================================================
  test('04. Exploration du catalogue, filtres, variantes et 404', async ({ request }) => {
    const api = new QAApiClient(request);

    // Liste des catégories
    const catRes = await api.get('/categories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.success).toBe(true);
    availableCategories = Array.isArray(catRes.body.data) ? catRes.body.data : catRes.body.data?.categories || [];

    // Liste des produits avec pagination
    const prodRes = await api.get('/products', { limit: '10', page: '1' });
    expect(prodRes.status).toBe(200);
    expect(prodRes.body.success).toBe(true);
    const products = Array.isArray(prodRes.body.data)
      ? prodRes.body.data
      : prodRes.body.data?.items || prodRes.body.data?.products || [];

    if (products.length > 0) {
      sampleProduct = products[0];
      const slug = sampleProduct.slug || sampleProduct.id;
      const detailRes = await api.get(`/products/${slug}`);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.success).toBe(true);

      const fullProduct = detailRes.body.data?.product || detailRes.body.data;
      const variants = fullProduct?.variants || fullProduct?.sizes || [];
      if (variants.length > 0) {
        sampleVariantId = variants[0]?.id;
      }
    } else {
      console.warn('⚠️ [QA Notice] Aucune donnée de catalogue seedée sur Staging (0 catégories, 0 produits).');
    }

    // Tester la route 404 produit inexistant
    const notFoundRes = await api.get('/products/bouquet-fantome-inexistant-xyz-999');
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body.success).toBe(false);
  });

  // =========================================================================
  // 4. ESPACE CLIENT & GESTION DU COMPTE (USER 6)
  // =========================================================================
  test('05. Gestion de profil, carnet de 3 adresses et mot de passe (User 6)', async ({ request }) => {
    const user = users[5]; // User 6
    const token = await getOrCreateToken(request, user);
    const api = new QAApiClient(request, token);

    // 1. Mise à jour du profil
    const updateRes = await api.patch('/customers/me', {
      firstName: 'Cheikh Modifié',
      phone: user.phone,
    });
    expect([200, 204]).toContain(updateRes.status);

    // 2. Ajout de 3 adresses (CreateAddressSchema : name, street, city, phone, isDefault)
    const addressesPayload = [
      {
        name: 'Maison Fann',
        street: 'Villa 14, Route de Fann',
        city: 'Dakar',
        phone: user.phone,
        isDefault: true,
      },
      {
        name: 'Bureau Plateau',
        street: 'Immeuble SDI, 3e étage',
        city: 'Dakar',
        phone: user.phone,
        isDefault: false,
      },
      {
        name: 'Résidence Saly',
        street: 'Résidence Palm Beach',
        city: 'Saly',
        phone: user.phone,
        isDefault: false,
      },
    ];

    const createdAddressIds: string[] = [];
    for (const addr of addressesPayload) {
      const addRes = await api.post('/customers/me/addresses', addr);
      expect([200, 201]).toContain(addRes.status);
      const addrId = addRes.body.data?.address?.id || addRes.body.data?.id;
      if (addrId) createdAddressIds.push(addrId);
    }

    // 3. Liste des adresses
    const listRes = await api.get('/customers/me/addresses');
    expect(listRes.status).toBe(200);
    const currentAddresses = Array.isArray(listRes.body.data) ? listRes.body.data : listRes.body.data?.addresses || [];
    expect(currentAddresses.length).toBeGreaterThanOrEqual(1);

    // 4. Définir la 2e comme adresse par défaut (si créée)
    if (createdAddressIds.length >= 2) {
      const defRes = await api.post(`/customers/me/addresses/${createdAddressIds[1]}/default`);
      expect([200, 204]).toContain(defRes.status);
    }

    // 5. Suppression de la 3e adresse (si créée)
    if (createdAddressIds.length >= 3) {
      const delRes = await api.delete(`/customers/me/addresses/${createdAddressIds[2]}`);
      expect([200, 204]).toContain(delRes.status);
    }

    // 6. Profil enrichi & points fidélité
    const fidRes = await api.get('/customers/me');
    expect(fidRes.status).toBe(200);
    expect(fidRes.body.data?.loyaltyTier).toBeDefined();

    // 7. Mise à jour mot de passe
    const newPass = 'NewComplexPassword@2026!';
    const passRes = await api.patch('/customers/me/password', {
      currentPassword: user.password,
      newPassword: newPass,
    });
    expect([200, 204]).toContain(passRes.status);

    // Vérifier re-connexion avec nouveau mot de passe
    const reLogin = await new QAApiClient(request).post('/auth/login', {
      identifier: user.email,
      password: newPass,
    });
    expect(reLogin.status).toBe(200);
  });

  // =========================================================================
  // 5. ZONES DE LIVRAISON & DEVIS PANIER (USER 1)
  // =========================================================================
  test('06. Zones de livraison et calcul de devis panier (User 1)', async ({ request }) => {
    const api = new QAApiClient(request);

    // Récupération des zones de livraison
    const zonesRes = await api.get('/delivery-zones');
    expect(zonesRes.status).toBe(200);
    const zones = Array.isArray(zonesRes.body.data) ? zonesRes.body.data : zonesRes.body.data?.zones || [];

    if (zones.length > 0) {
      sampleDeliveryZone = zones[0];

      if (sampleVariantId) {
        // Calcul de devis panier (quoteCartSchema : items, deliveryMode, deliveryZoneId)
        const quoteRes = await api.post('/orders/quote', {
          items: [{ variantId: sampleVariantId, quantity: 2 }],
          deliveryMode: 'STANDARD',
          deliveryZoneId: sampleDeliveryZone.id,
        });
        expect(quoteRes.status).toBe(200);
        expect(quoteRes.body.success).toBe(true);
      }
    } else {
      console.warn('⚠️ [QA Notice] Aucune zone de livraison seedée sur Staging.');
    }
  });

  // =========================================================================
  // 6. PROMOTIONS & VALIDATION CODE PROMO (USER 2)
  // =========================================================================
  test('07. Test coupons promotionnels et promotions actives (User 2)', async ({ request }) => {
    const api = new QAApiClient(request);

    // Promotions actives vitrine
    const promoRes = await api.get('/promotions/active');
    expect(promoRes.status).toBe(200);
    expect(promoRes.body.success).toBe(true);

    // Test coupon inexistant (validateCouponSchema : code, subtotal)
    const invalidCouponRes = await api.post('/coupons/validate', {
      code: 'FAUX_CODE_PROMO_999',
      subtotal: 50000,
    });
    expect([400, 404]).toContain(invalidCouponRes.status);
    expect(invalidCouponRes.body.success).toBe(false);
  });

  // =========================================================================
  // 7. DEVIS ÉVÉNEMENTIEL SUR-MESURE (USER 3)
  // =========================================================================
  test('08. Demande de devis événementiel et suivi client (User 3)', async ({ request }) => {
    const user = users[2]; // User 3
    const token = await getOrCreateToken(request, user);
    const api = new QAApiClient(request, token);

    // submitQuoteSchema : eventType, eventDate, location, budget, name, phone, email, notes, estimatedGuests, inspirationImages
    const devisPayload = {
      eventType: 'MARIAGE',
      eventDate: '2026-12-24T00:00:00.000Z',
      location: 'Hôtel King Fahd Palace, Dakar',
      budget: '1 000 000 - 2 500 000 FCFA',
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      notes: 'Décoration florale de table présidentielle et arche fleurie pour cérémonie',
      estimatedGuests: 250,
      inspirationImages: [],
    };

    const submitRes = await api.post('/quotes', devisPayload);
    expect([200, 201]).toContain(submitRes.status);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data?.quoteNumber).toBeDefined();

    // Consultation dans l'espace client
    const mineRes = await api.get('/quotes/mine');
    expect(mineRes.status).toBe(200);
    const quotes = Array.isArray(mineRes.body.data) ? mineRes.body.data : mineRes.body.data?.quotes || [];
    expect(quotes.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // 8. ABONNEMENT FLORAL & CYCLE DE VIE (USER 4)
  // =========================================================================
  test('09. Formules, souscription, pause et reprise abonnement (User 4)', async ({ request }) => {
    const user = users[3]; // User 4
    const token = await getOrCreateToken(request, user);
    const api = new QAApiClient(request, token);

    // 1. Liste des formules
    const plansRes = await api.get('/subscriptions/plans');
    expect(plansRes.status).toBe(200);
    const plans = Array.isArray(plansRes.body.data) ? plansRes.body.data : plansRes.body.data?.plans || [];
    expect(plans.length).toBeGreaterThanOrEqual(3);

    // 2. Souscription (subscribeSchema : plan, frequency, deliveryDay, recipientName, phone, location, address, paymentMethod)
    const subPayload = {
      plan: 'PRESTIGE',
      frequency: 'HEBDOMADAIRE',
      deliveryDay: 'SAMEDI',
      recipientName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      location: user.city,
      address: user.address,
      notes: 'Déposer à l accueil si absent',
      paymentMethod: 'WAVE',
    };

    const createRes = await api.post('/subscriptions', subPayload);
    expect([200, 201]).toContain(createRes.status);
    expect(createRes.body.success).toBe(true);

    // 3. Liste de mes abonnements
    const mineRes = await api.get('/subscriptions/mine');
    expect(mineRes.status).toBe(200);
    const subs = Array.isArray(mineRes.body.data) ? mineRes.body.data : mineRes.body.data?.subscriptions || [];
    expect(subs.length).toBeGreaterThan(0);
    const subNumber = subs[0]?.subscriptionNumber || subs[0]?.id;

    // 4. Pause temporaire
    if (subNumber) {
      const pauseRes = await api.patch(`/subscriptions/mine/${subNumber}/pause`, {
        reason: 'Voyage d affaires',
      });
      expect([200, 204]).toContain(pauseRes.status);

      // 5. Reprise de l abonnement
      const resumeRes = await api.patch(`/subscriptions/mine/${subNumber}/resume`);
      expect([200, 204]).toContain(resumeRes.status);
    }
  });

  // =========================================================================
  // 9. CYCLE DE VIE COMMANDE (USER 5)
  // =========================================================================
  test('10. Commandes client : Historique et validation (User 5)', async ({ request }) => {
    const user = users[4]; // User 5
    const token = await getOrCreateToken(request, user);
    const api = new QAApiClient(request, token);

    // Consultation de l historique (doit réussir même avec 0 commande)
    const ordersMine = await api.get('/orders/mine');
    expect(ordersMine.status).toBe(200);
    expect(ordersMine.body.success).toBe(true);

    if (sampleVariantId && sampleDeliveryZone) {
      const orderPayload = {
        items: [{ variantId: sampleVariantId, quantity: 1 }],
        deliveryMode: 'STANDARD',
        deliveryZoneId: sampleDeliveryZone.id,
        paymentMethod: 'CASH_ON_DELIVERY',
        recipientName: `${user.firstName} ${user.lastName}`,
        recipientPhone: user.phone,
        deliveryAddress: user.address,
        notes: 'Joyeux Anniversaire !',
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (orderRes.status === 201 || orderRes.status === 200) {
        const orderNumber = orderRes.body.data?.order?.orderNumber || orderRes.body.data?.orderNumber;
        const trackingRes = await api.get(`/orders/mine/${orderNumber}/tracking`);
        expect(trackingRes.status).toBe(200);

        const cancelRes = await api.post(`/orders/mine/${orderNumber}/cancel`, { reason: 'Erreur' });
        expect([200, 204]).toContain(cancelRes.status);
      }
    }
  });

  // =========================================================================
  // 10. BLOG FLORAL & INTERACTIONS (USER 9)
  // =========================================================================
  test('11. Consultation du blog, likes et catégories (User 9)', async ({ request }) => {
    const api = new QAApiClient(request);

    // Catégories du blog
    const catRes = await api.get('/blog/categories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.success).toBe(true);

    // Liste des auteurs
    const authRes = await api.get('/blog/authors');
    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);

    // Liste des articles
    const artRes = await api.get('/blog/articles', { limit: '5' });
    expect(artRes.status).toBe(200);
    expect(artRes.body.success).toBe(true);
    const articles = Array.isArray(artRes.body.data)
      ? artRes.body.data
      : artRes.body.data?.items || artRes.body.data?.articles || [];

    if (articles.length > 0) {
      const slug = articles[0]?.slug;
      const readRes = await api.get(`/blog/articles/${slug}`);
      expect(readRes.status).toBe(200);

      const likeRes = await api.post(`/blog/articles/${slug}/like`);
      expect([200, 201]).toContain(likeRes.status);
    }
  });

  // =========================================================================
  // 11. BOUNDARY & EDGE CASE HUNTER (USER 7)
  // =========================================================================
  test('12. Chasse aux bugs et validation stricte Zod (User 7)', async ({ request }) => {
    const api = new QAApiClient(request);

    // 1. Email sans @
    const badEmail = await api.post('/auth/register', {
      email: 'not-an-email',
      phone: '+221770001122',
      password: 'Password123!',
      firstName: 'Bad',
      lastName: 'Email',
    });
    expect(badEmail.status).toBe(400);
    expect(badEmail.body.success).toBe(false);

    // 2. Numéro de téléphone vide ou manquant (rejet 400 attendu)
    const emptyPhone = await api.post('/auth/register', {
      email: `empty-phone-${Date.now()}@qa-decofleur.test`,
      phone: '',
      password: 'Password123!',
      firstName: 'Bad',
      lastName: 'Phone',
    });
    expect(emptyPhone.status).toBe(400);
    expect(emptyPhone.body.success).toBe(false);

    // 3. Tentative d injection de champs interdits (rejeté par .strict())
    const user5Token = await getOrCreateToken(request, users[4]);
    const authApi = new QAApiClient(request, user5Token);

    const priceInjectionOrder = await authApi.post('/orders', {
      items: [{ variantId: '00000000-0000-0000-0000-000000000000', quantity: 1, price: 10 }],
      deliveryMode: 'STANDARD',
      totalAmount: 10,
    });
    expect(priceInjectionOrder.status).toBe(400);
    expect(priceInjectionOrder.body.success).toBe(false);

    // 4. Quantité nulle ou négative
    const negativeQty = await authApi.post('/orders', {
      items: [{ variantId: '00000000-0000-0000-0000-000000000000', quantity: -2 }],
      deliveryMode: 'STANDARD',
    });
    expect(negativeQty.status).toBe(400);

    // 5. Pagination aberrante (page négative)
    const negativePage = await api.get('/products', { page: '-10' });
    expect([200, 400]).toContain(negativePage.status);
    if (negativePage.status === 200) {
      expect(negativePage.body.success).toBe(true);
    }
  });

  // =========================================================================
  // 12. AUDIT DE SÉCURITÉ & CONTRÔLE D ACCÈS ADMIN (USER 8)
  // =========================================================================
  test('13. Contrôle strict d accès aux routes /admin (User 8)', async ({ request }) => {
    // 1. Sans token du tout
    const anonymousApi = new QAApiClient(request);
    const noTokenOrders = await anonymousApi.get('/admin/orders');
    expect(noTokenOrders.status).toBe(401);

    const noTokenDashboard = await anonymousApi.get('/admin/dashboard');
    expect(noTokenDashboard.status).toBe(401);

    // 2. Avec token d un CLIENT standard (User 1)
    const clientToken = await getOrCreateToken(request, users[0]);
    const clientAuditApi = new QAApiClient(request, clientToken);

    const clientAdminOrders = await clientAuditApi.get('/admin/orders');
    expect([401, 403]).toContain(clientAdminOrders.status);

    const clientAdminCustomers = await clientAuditApi.get('/admin/customers');
    expect([401, 403]).toContain(clientAdminCustomers.status);

    const clientAdminSettings = await clientAuditApi.get('/admin/settings');
    expect([401, 403]).toContain(clientAdminSettings.status);

    // 3. Avec un token JWT altéré/falsifié
    const forgedApi = new QAApiClient(request, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
    const forgedRes = await forgedApi.get('/admin/dashboard');
    expect(forgedRes.status).toBe(401);
  });
});
