/**
 * Guides du back-office (un PDF par module) publiés sur Cloudflare R2, ouverts depuis le bouton « Aide ».
 * Générés par guide-utilisateur/render.mjs ; une nouvelle version est publiée dans un nouveau dossier daté
 * (guide-utilisateur/upload-r2.mjs), puis HELP_GUIDES_VERSION est mis à jour ici.
 */
export const HELP_GUIDES_VERSION = '2026-11-19';

const DEFAULT_BASE_URL = `https://pub-69eb0dcdef4244f49946a2556c863719.r2.dev/guides/back-office/${HELP_GUIDES_VERSION}`;

/** Dossier des guides ; NEXT_PUBLIC_ADMIN_GUIDES_URL permet de le changer sans modifier le code. */
export const HELP_GUIDES_BASE_URL = (process.env.NEXT_PUBLIC_ADMIN_GUIDES_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

export interface HelpGuide {
  id: string;
  num: string;
  title: string;
  summary: string;
  file: string;
  pages: number;
  /** Écran du back-office décrit par le guide (null : guide général, toujours proposé) */
  path: string | null;
  /** Autre écran qui donne aussi accès au guide (ex. l'espace livreur, utile à qui gère les livraisons) */
  alsoPath?: string;
}

export const HELP_GUIDES: HelpGuide[] = [
  { id: 'prise-en-main', num: '01', title: 'Prise en main', summary: 'Se connecter, choisir son mot de passe, se repérer dans le back-office et lire le tableau de bord.', file: '01-prise-en-main.pdf', pages: 46, path: null },
  { id: 'commandes', num: '02', title: 'Commandes', summary: 'Suivre, faire avancer, annuler, facturer et exporter les commandes de vos clients.', file: '02-commandes.pdf', pages: 20, path: '/admin/commandes' },
  { id: 'livraisons', num: '03', title: 'Livraisons', summary: 'Organiser les courses, affecter les livreurs, suivre les remises et gérer votre flotte.', file: '03-livraisons.pdf', pages: 28, path: '/admin/livraisons' },
  { id: 'mes-livraisons', num: '04', title: 'Espace livreur', summary: "Ce que voit et fait un livreur connecté : ses courses, l'itinéraire, la remise ou l'échec.", file: '04-mes-livraisons.pdf', pages: 9, path: '/admin/mes-livraisons', alsoPath: '/admin/livraisons' },
  { id: 'devis', num: '05', title: 'Devis', summary: 'Recevoir les demandes de devis, chiffrer une proposition, l’envoyer au client et la transformer en commande.', file: '05-devis.pdf', pages: 26, path: '/admin/devis' },
  { id: 'messages', num: '06', title: 'Messages & newsletter', summary: 'Lire et traiter les messages du formulaire de contact, et gérer les inscrits à la lettre d’information.', file: '06-messages.pdf', pages: 12, path: '/admin/messages' },
  { id: 'clients', num: '07', title: 'Clients', summary: 'Retrouver vos clients, suivre leur valeur, mettre à jour leur fiche et communiquer avec eux.', file: '07-clients.pdf', pages: 18, path: '/admin/clients' },
  { id: 'abonnements', num: '08', title: 'Abonnements', summary: 'Suivre les abonnés aux bouquets livrés chaque semaine ou toutes les deux semaines, leurs passages et les formules proposées sur le site.', file: '08-abonnements.pdf', pages: 22, path: '/admin/abonnements' },
  { id: 'location', num: '09', title: 'Location de matériel', summary: "Gérer le matériel événementiel proposé à la location, les réservations des clients, les cautions et le planning d'occupation.", file: '09-location.pdf', pages: 26, path: '/admin/location' },
  { id: 'paysagisme', num: '10', title: 'Paysagisme', summary: 'Publier sur le site les prestations de paysagisme et la galerie des réalisations.', file: '10-paysagisme.pdf', pages: 16, path: '/admin/paysagisme' },
  { id: 'produits', num: '11', title: 'Produits', summary: 'Créer, publier, modifier et retirer les produits du catalogue de la boutique.', file: '11-produits.pdf', pages: 28, path: '/admin/produits' },
  { id: 'stock', num: '12', title: 'Stock', summary: 'Suivre le stock de chaque taille, régler les alertes et enregistrer les entrées, sorties et inventaires.', file: '12-stock.pdf', pages: 10, path: '/admin/stock' },
  { id: 'approvisionnements', num: '13', title: 'Approvisionnements', summary: 'Commander la marchandise à vos fournisseurs, la faire entrer en stock à son arrivée et suivre le paiement de leurs factures.', file: '13-approvisionnements.pdf', pages: 28, path: '/admin/approvisionnements' },
  { id: 'fournisseurs', num: '14', title: 'Fournisseurs', summary: "Tenir le carnet de vos grossistes et partenaires : coordonnées, conditions d'achat et historique de ce que vous leur avez acheté.", file: '14-fournisseurs.pdf', pages: 16, path: '/admin/fournisseurs' },
  { id: 'categories', num: '15', title: 'Catégories', summary: 'Organiser le catalogue en catégories et sous-catégories visibles sur la boutique.', file: '15-categories.pdf', pages: 13, path: '/admin/categories' },
  { id: 'avis', num: '16', title: 'Avis clients', summary: 'Lire et modérer les avis déposés par les clients sur les fiches produits.', file: '16-avis.pdf', pages: 8, path: '/admin/avis' },
  { id: 'marketing', num: '17', title: 'Marketing', summary: 'Habiller la vitrine pour chaque fête, créer des codes promo et des promotions, envoyer des campagnes e-mail et relancer les paniers abandonnés.', file: '17-marketing.pdf', pages: 50, path: '/admin/marketing' },
  { id: 'annonces', num: '18', title: 'Annonces aux clients', summary: 'Afficher un message en haut du site et prévenir vos clients dans leur espace et par e-mail.', file: '18-annonces.pdf', pages: 9, path: '/admin/annonces' },
  { id: 'cartes-cadeaux', num: '19', title: 'Cartes cadeaux', summary: 'Encaisser les cartes cadeaux commandées sur le site, en émettre en boutique et suivre leur solde.', file: '19-cartes-cadeaux.pdf', pages: 18, path: '/admin/cartes-cadeaux' },
  { id: 'blog', num: '20', title: 'Blog & contenu', summary: 'Rédiger, publier et organiser les articles du journal du site pour conseiller et inspirer vos clients.', file: '20-blog.pdf', pages: 36, path: '/admin/blog' },
  { id: 'rapports', num: '21', title: 'Rapports', summary: 'Suivre les ventes, la trésorerie et les encaissements de la boutique, puis les exporter pour votre comptabilité.', file: '21-rapports.pdf', pages: 18, path: '/admin/rapports' },
  { id: 'parametres', num: '22', title: 'Paramètres', summary: "Régler l'identité de la boutique, l'équipe et ses droits, la livraison, le paiement, la fidélité, le formulaire de devis, les e-mails automatiques et les réseaux sociaux.", file: '22-parametres.pdf', pages: 54, path: '/admin/parametres' },
  { id: 'reperes-et-aide', num: '23', title: 'Repères et aide', summary: 'Par profil, statuts, droits par défaut, questions fréquentes, index des écrans.', file: '23-reperes-et-aide.pdf', pages: 18, path: null },
];

export const helpGuideUrl = (guide: HelpGuide) => `${HELP_GUIDES_BASE_URL}/${guide.file}`;

/**
 * Vidéos de démonstration (une par module : MP4 1080p commenté et sous-titré, image d'aperçu JPG), publiées sur
 * Cloudflare R2 à côté des guides. Générées par guide-utilisateur/video/ ; chaque nouvelle version va dans un
 * nouveau dossier daté, puis HELP_VIDEOS_VERSION est mis à jour ici.
 */
export const HELP_VIDEOS_VERSION = '2026-11-19';

const DEFAULT_VIDEOS_URL = `https://pub-69eb0dcdef4244f49946a2556c863719.r2.dev/guides/back-office/videos/${HELP_VIDEOS_VERSION}`;

/** Dossier des vidéos ; NEXT_PUBLIC_ADMIN_VIDEOS_URL permet de le changer sans modifier le code. */
export const HELP_VIDEOS_BASE_URL = (process.env.NEXT_PUBLIC_ADMIN_VIDEOS_URL || DEFAULT_VIDEOS_URL).replace(/\/+$/, '');

export interface HelpVideo {
  /** Fichier MP4 ; l'image d'aperçu porte le même nom en .jpg */
  file: string;
  seconds: number;
}

/** Vidéo de chaque guide (par identifiant de guide) ; les guides sans vidéo n'affichent que le PDF. */
export const HELP_VIDEOS: Partial<Record<string, HelpVideo>> = {
  'prise-en-main': { file: '01-prise-en-main.mp4', seconds: 288 },
  commandes: { file: '02-commandes.mp4', seconds: 268 },
  livraisons: { file: '03-livraisons.mp4', seconds: 267 },
  'mes-livraisons': { file: '04-espace-livreur.mp4', seconds: 176 },
};

export const helpVideoFor = (guide: HelpGuide): HelpVideo | null => HELP_VIDEOS[guide.id] ?? null;
export const helpVideoUrl = (video: HelpVideo) => `${HELP_VIDEOS_BASE_URL}/${video.file}`;
export const helpVideoPosterUrl = (video: HelpVideo) => `${HELP_VIDEOS_BASE_URL}/${video.file.replace(/\.mp4$/, '.jpg')}`;

/** « 4 min 48 » */
export function formatVideoDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}`;
}

/** Guide de l'écran affiché (le tableau de bord et les écrans sans guide propre renvoient à la prise en main). */
export function helpGuideForPath(pathname: string): HelpGuide {
  const match = HELP_GUIDES.find((g) => g.path && (pathname === g.path || pathname.startsWith(`${g.path}/`)));
  return match ?? HELP_GUIDES[0];
}
