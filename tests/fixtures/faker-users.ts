// Générateur de numéros sénégalais réalistes (+221 77 / 78 / 76 / 70) garantis uniques par run
function generateSenegalesePhone(suffixIndex: number, runSeed: number): string {
  const prefixes = ['77', '78', '76', '70'];
  const prefix = prefixes[suffixIndex % prefixes.length];
  // Utiliser les derniers chiffres du timestamp + index pour garantir l'unicité
  const uniqueDigits = String((runSeed + suffixIndex * 7919) % 9000000 + 1000000);
  return `+221${prefix}${uniqueDigits}`;
}

export interface QAUserPersona {
  id: number;
  personaName: string;
  role: 'CLIENT' | 'ADMIN';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  address: string;
  notes: string;
  scenarioDescription: string;
  boundaryPayloads?: {
    invalidEmail?: string;
    invalidPhone?: string;
    xssPayload?: string;
    tooLongString?: string;
  };
}

export function generateQAUsers(): QAUserPersona[] {
  const runSeed = Math.floor(Date.now() % 8000000);
  const RUN_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  return [
    {
      id: 1,
      personaName: 'Standard Shopper',
      role: 'CLIENT',
      firstName: 'Awa',
      lastName: 'Diallo',
      email: `qa-faker-standard-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(1, runSeed),
      password: 'StandardUser@2026!',
      city: 'Dakar',
      address: 'Corniche Ouest, Fann Résidence Villa 4',
      notes: 'Commande classique de bouquet avec paiement Wave',
      scenarioDescription: 'Parcours nominal : Inscription -> Consultation catalogue -> Panier -> Commande standard',
    },
    {
      id: 2,
      personaName: 'Promo & Discount Hunter',
      role: 'CLIENT',
      firstName: 'Moussa',
      lastName: 'Sow',
      email: `qa-faker-promo-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(2, runSeed),
      password: 'PromoHunter@2026!',
      city: 'Saly',
      address: 'Résidence Palmeraie, Saly Portudal',
      notes: 'Test intensif de codes promo valides, invalides, expirés et limites',
      scenarioDescription: 'Validation coupons -> Application de réductions -> Achat avec promo',
    },
    {
      id: 3,
      personaName: 'Event Quote Requester',
      role: 'CLIENT',
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      email: `qa-faker-quote-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(3, runSeed),
      password: 'EventQuote@2026!',
      city: 'Mbour',
      address: 'Route des Almadies, Somone',
      notes: 'Demande de devis mariage / décoration florale',
      scenarioDescription: 'Soumission devis sur-mesure -> Upload inspiration -> Consultation dans l espace client',
    },
    {
      id: 4,
      personaName: 'Floral Subscriber',
      role: 'CLIENT',
      firstName: 'Ibrahima',
      lastName: 'Ba',
      email: `qa-faker-sub-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(4, runSeed),
      password: 'Subscriber@2026!',
      city: 'Dakar',
      address: 'Almadies Zone 12, Lot 4',
      notes: 'Abonnement floral hebdomadaire prestige',
      scenarioDescription: 'Souscription abonnement -> Consultation contrat -> Pause temporaire -> Reprise',
    },
    {
      id: 5,
      personaName: 'Order Canceler & Tracking',
      role: 'CLIENT',
      firstName: 'Marieme',
      lastName: 'Camara',
      email: `qa-faker-cancel-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(5, runSeed),
      password: 'OrderCancel@2026!',
      city: 'Dakar',
      address: 'Plateau Rue Carnot x Huart',
      notes: 'Création puis annulation rapide de commande',
      scenarioDescription: 'Commande -> Suivi livraison temps réel -> Annulation et remise en stock',
    },
    {
      id: 6,
      personaName: 'Account & Address Manager',
      role: 'CLIENT',
      firstName: 'Cheikh',
      lastName: 'Fall',
      email: `qa-faker-account-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(6, runSeed),
      password: 'AccountMgr@2026!',
      city: 'Dakar',
      address: 'Mermoz Pyrotechnie Villa 88',
      notes: 'Multi-adresses, fidélité et modification mot de passe',
      scenarioDescription: 'Ajout 3 adresses -> Changement adresse par défaut -> Changement mot de passe -> Points fidélité',
    },
    {
      id: 7,
      personaName: 'Boundary & Edge Case Hunter',
      role: 'CLIENT',
      firstName: 'Khadija',
      lastName: 'Kane',
      email: `qa-faker-boundaries-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(7, runSeed),
      password: 'BoundaryTest@2026!',
      city: 'Dakar',
      address: 'Point E Rue 5bis',
      notes: 'Payloads limites, caractères spéciaux, injection XSS et types erronés',
      scenarioDescription: 'Test de robustesse des formulaires et validation Zod stricte backend',
      boundaryPayloads: {
        invalidEmail: 'not-an-email-at-all',
        invalidPhone: '1234',
        xssPayload: '<script>alert("xss")</script>',
        tooLongString: 'A'.repeat(5000),
      },
    },
    {
      id: 8,
      personaName: 'Security & Access Auditor',
      role: 'CLIENT',
      firstName: 'Ousmane',
      lastName: 'Seck',
      email: `qa-faker-security-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(8, runSeed),
      password: 'SecurityAudit@2026!',
      city: 'Dakar',
      address: 'Yoff Tonghor',
      notes: 'Audit de sécurité : tentative de contournement des rôles admin',
      scenarioDescription: 'Appels aux endpoints /admin/* sans token, avec token client, ou avec token corrompu',
    },
    {
      id: 9,
      personaName: 'Blog Engager & Favorites',
      role: 'CLIENT',
      firstName: 'Aminata',
      lastName: 'Toure',
      email: `qa-faker-cart-blog-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(9, runSeed),
      password: 'BlogEngager@2026!',
      city: 'Somone',
      address: 'Somone Lagune',
      notes: 'Engagement blog (likes, lecture articles) et gestion des favoris',
      scenarioDescription: 'Consultation blog -> Like article -> Consultation catégories d articles -> Favoris',
    },
    {
      id: 10,
      personaName: 'Admin & Operations Persona',
      role: 'ADMIN',
      firstName: 'Modou',
      lastName: 'Diop',
      email: `qa-faker-admin-${RUN_ID}@qa-decofleur.test`,
      phone: generateSenegalesePhone(10, runSeed),
      password: 'AdminOps@2026!',
      city: 'Dakar',
      address: 'Siège DécoFleur Plus, Dakar',
      notes: 'Supervision et opérations Back-Office',
      scenarioDescription: 'Vérification protection Back-Office, endpoints admin et tableau de bord',
    },
  ];
}
