import { apiClient } from '../client';

export interface UploadedFile {
  key?: string;
  url: string;
  contentType?: string;
  size?: number;
  filename?: string;
}

export interface UploadResponse {
  urls?: string[];
  files?: UploadedFile[];
}

/**
 * Téléverse un ou plusieurs fichiers images vers le stockage cloud via le backend
 * Endpoint: POST /api/v1/admin/uploads?folder=products|categories
 * Mode strict : lève une exception si le téléversement échoue afin de bloquer l'enregistrement.
 */
export async function uploadAdminMedia(
  files: File[],
  folder: 'products' | 'categories' | string = 'products'
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  // Le backend n'accepte que 'products' ou 'categories' dans l'enum de validation
  const safeFolder = folder === 'categories' ? 'categories' : 'products';

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', safeFolder);

  try {
    const res = await apiClient.post<UploadResponse | string[]>(
      `/admin/uploads?folder=${encodeURIComponent(safeFolder)}`,
      formData,
      { isAdmin: true }
    );

    let urls: string[] = [];
    if (Array.isArray(res)) {
      urls = res;
    } else if (res?.urls && Array.isArray(res.urls)) {
      urls = res.urls;
    } else if (res?.files && Array.isArray(res.files)) {
      urls = res.files.map((f) => f.url);
    }

    if (urls.length === 0) {
      throw new Error('Le serveur n’a renvoyé aucune URL valide pour les fichiers téléversés.');
    }

    return urls;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue lors du téléversement sur le serveur distant.';
    console.error('[Upload Admin] Échec du téléversement cloud:', error);
    throw new Error(`Téléversement impossible : ${message}`);
  }
}
