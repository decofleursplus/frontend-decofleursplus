/**
 * Mesure d'audience de la boutique (compteur maison, affiché dans Back-office › Rapports › Visiteurs).
 *
 * Chaque navigateur reçoit un identifiant tiré au hasard, gardé dans le stockage local : aucune donnée
 * personnelle n'est envoyée. Pages du back-office et navigateurs où l'équipe est connectée au
 * back-office ne sont pas comptés.
 */
import { API_BASE_URL } from './config';
import { getAdminAuthToken } from './auth-token';

const VISITOR_KEY = 'dfp_visitor_id';
const SESSION_KEY = 'dfp_visit_started';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function randomUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Navigateurs anciens ou page hors HTTPS : UUID v4 à partir de getRandomValues
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Identifiant du navigateur ; null si le stockage est bloqué (navigation privée stricte) : pas de mesure. */
function visitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !UUID.test(id)) {
      id = randomUuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Page d'origine (Google, Facebook, WhatsApp…), envoyée à la première page de la session seulement. */
function sessionReferrer(): string | null {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return null;
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // stockage de session indisponible : le référent est envoyé à chaque page, le serveur garde le premier du jour
  }
  return document.referrer || null;
}

/** Dernière page comptée par cet onglet (un composant remonté ne la recompte pas). */
let lastTracked: { path: string; at: number } | null = null;

/** Compte une page vue de la boutique. Sans effet visible : une erreur réseau est ignorée. */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || !path || path.startsWith('/admin')) return;
  if (getAdminAuthToken()) return;
  const now = Date.now();
  if (lastTracked && lastTracked.path === path && now - lastTracked.at < 2000) return;
  lastTracked = { path, at: now };
  const id = visitorId();
  if (!id) return;
  fetch(`${API_BASE_URL}/analytics/page-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: id, path, referrer: sessionReferrer() }),
    keepalive: true,
  }).catch(() => {});
}
