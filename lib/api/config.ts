/**
 * Configuration de l'API Backend DécoFleur Plus
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://backend-decofleursplus-staging.up.railway.app/api/v1';

export const AUTH_TOKEN_KEY = 'decofleur_jwt';
export const ADMIN_TOKEN_KEY = 'decofleur_admin_jwt';

export interface HealthCheckResponse {
  status: string;
  service: string;
}

/**
 * Vérifie l'état de santé du serveur backend
 */
export async function checkApiHealth(): Promise<{ isHealthy: boolean; details?: HealthCheckResponse }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { isHealthy: false };
    }

    const json = await res.json();
    return {
      isHealthy: json.success && json.data?.status === 'UP',
      details: json.data,
    };
  } catch (error) {
    console.error('[API Health Check Failed]:', error);
    return { isHealthy: false };
  }
}
