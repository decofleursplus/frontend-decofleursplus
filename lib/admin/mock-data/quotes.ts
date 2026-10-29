import { LandscapeQuote } from './types';

export const initialQuotes: LandscapeQuote[] = [
  {
    id: 'DEV-2024-0089',
    createdAt: '14 mars 2024',
    clientName: 'Mamadou Diouf',
    clientEmail: 'm.diouf@teranga-group.sn',
    clientPhone: '+221 77 555 44 33',
    company: 'Teranga Group',
    prestationType: 'Conception de jardins',
    spaceType: 'Villa',
    surfaceArea: '350',
    desiredDate: '2024-04-15',
    location: 'Almadies, Dakar',
    description:
      'Projet de réaménagement paysager autour de notre villa avec piscine. Nous souhaitons une pelouse soignée, des massifs tropicaux colorés et un système d’arrosage goutte-à-goutte automatisé.',
    budget: '1 500 000 - 5 000 000 FCFA',
    maintenanceFrequency: 'Hebdomadaire (4 fois / mois)',
    photos: ['/images/paysagisme/paysagisme-villas.jpg', '/images/paysagisme/paysagisme-hero.jpg'],
    status: 'en_cours',
    notes: 'Visite sur site effectuée le 16 mars. Devis technique en cours de finalisation par notre paysagiste.',
    quoteAmount: 2850000,
    quoteItems: [
      { description: 'Étude paysagère et plan 3D d’implantation', qty: 1, unitPrice: 250000, total: 250000 },
      { description: 'Terrassement et préparation du sol enrichi (350 m²)', qty: 350, unitPrice: 2000, total: 700000 },
      { description: 'Fourniture et pose de gazon d’ornement tropical', qty: 350, unitPrice: 3000, total: 1050000 },
      { description: 'Massifs de bougainvilliers, hibiscus et agaves', qty: 1, unitPrice: 450000, total: 450000 },
      { description: 'Système d’arrosage automatique connecté 4 zones', qty: 1, unitPrice: 400000, total: 400000 },
    ],
  },
  {
    id: 'DEV-2024-0088',
    createdAt: '11 mars 2024',
    clientName: 'Aïssatou Ba',
    clientEmail: 'aissatou.ba@gmail.com',
    clientPhone: '+221 78 333 22 11',
    company: '',
    prestationType: 'Terrasses et balcons',
    spaceType: 'Terrasse',
    surfaceArea: '65',
    desiredDate: '2024-04-01',
    location: 'Saly Niakh Niakhal',
    description:
      'Végétalisation d’une grande terrasse avec vue mer. Besoin de bacs résistants aux embruns, plantes grimpantes sur pergola et éclairage LED discret.',
    budget: '500 000 - 1 500 000 FCFA',
    maintenanceFrequency: 'Bimensuel (2 fois / mois)',
    photos: ['/images/paysagisme/prestation-terrasses.jpg'],
    status: 'devis_envoye',
    notes: 'Proposition transmise par WhatsApp et email le 13 mars. En attente de signature client.',
    quoteAmount: 850000,
    quoteItems: [
      { description: 'Bacs en résine traités anti-UV et embruns (lot de 6)', qty: 6, unitPrice: 45000, total: 270000 },
      { description: 'Arbustes ornementaux (palmiers nains, oliviers, bougainvilliers)', qty: 1, unitPrice: 320000, total: 320000 },
      { description: 'Installation réseau micro-arrosage autonome', qty: 1, unitPrice: 160000, total: 160000 },
      { description: 'Main d’œuvre plantation et mise en route', qty: 1, unitPrice: 100000, total: 100000 },
    ],
  },
  {
    id: 'DEV-2024-0087',
    createdAt: '08 mars 2024',
    clientName: 'Hôtel Les Manguiers',
    clientEmail: 'direction@manguiers-saly.com',
    clientPhone: '+221 76 888 77 66',
    company: 'Hôtel Les Manguiers Saly',
    prestationType: 'Espaces professionnels',
    spaceType: 'Hôtel',
    surfaceArea: '800',
    desiredDate: '2024-05-01',
    location: 'Saly Tapée',
    description:
      'Remise à niveau complète des espaces verts de l’hôtel avant la haute saison : taille des palmiers, régénération des pelouses et fleurissement du restaurant extérieur.',
    budget: 'Plus de 5 000 000 FCFA',
    maintenanceFrequency: 'Contrat d’entretien annuel',
    photos: ['/images/paysagisme/paysagisme-hotels.jpg'],
    status: 'nouvelle',
    notes: 'Nouvelle demande prioritaire reçue via le site public.',
  },
  {
    id: 'DEV-2024-0086',
    createdAt: '03 mars 2024',
    clientName: 'Cheikh Ndiaye',
    clientEmail: 'c.ndiaye@innovsenegal.sn',
    clientPhone: '+221 77 444 88 99',
    company: 'Innov Sénégal SAS',
    prestationType: 'Décoration végétale intérieure',
    spaceType: 'Bureau',
    surfaceArea: '120',
    desiredDate: '2024-03-25',
    location: 'Point E, Dakar',
    description:
      'Mur végétal intérieur pour notre salle de réunion principale et 8 grands bacs de séparation végétale pour open-space.',
    budget: '1 500 000 - 5 000 000 FCFA',
    maintenanceFrequency: 'Bimensuel (2 fois / mois)',
    photos: ['/images/paysagisme/paysagisme-bureaux.jpg'],
    status: 'acceptee',
    notes: 'Acompte de 50% réglé. Début des travaux fixé au 26 mars.',
    quoteAmount: 2100000,
  },
];

export function addQuote(quote: Partial<LandscapeQuote> & {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  prestationType: string;
  spaceType: string;
  location: string;
  description: string;
  photos: string[];
}): void {
  const newQuote: LandscapeQuote = {
    id: quote.id,
    createdAt: quote.createdAt || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    clientName: quote.clientName,
    clientEmail: quote.clientEmail,
    clientPhone: quote.clientPhone,
    company: quote.company || '',
    prestationType: quote.prestationType,
    spaceType: quote.spaceType,
    surfaceArea: quote.surfaceArea || 'N/A',
    desiredDate: quote.desiredDate || 'À convenir',
    location: quote.location,
    description: quote.description,
    budget: quote.budget || 'À définir',
    maintenanceFrequency: quote.maintenanceFrequency,
    photos: quote.photos,
    status: quote.status || 'nouvelle',
    notes: quote.notes,
    quoteAmount: quote.quoteAmount,
    quoteItems: quote.quoteItems,
  };
  initialQuotes.unshift(newQuote);
}
