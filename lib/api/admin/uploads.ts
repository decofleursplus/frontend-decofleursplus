import { apiClient } from '../client';

export interface UploadResponse {
  urls: string[];
  files?: Array<{
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }>;
}

/**
 * Téléverse un ou plusieurs fichiers images vers le stockage cloud via le backend
 * Endpoint: POST /api/v1/admin/uploads
 */
export async function uploadAdminMedia(
  files: File[],
  folder: string = 'products'
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  try {
    const res = await apiClient.post<UploadResponse | string[]>(
      `/admin/uploads?folder=${encodeURIComponent(folder)}`,
      formData,
      { isAdmin: true }
    );

    if (Array.isArray(res)) {
      return res;
    }
    if (res?.urls && Array.isArray(res.urls)) {
      return res.urls;
    }
    if (res?.files && Array.isArray(res.files)) {
      return res.files.map((f) => f.url);
    }
    return [];
  } catch (error) {
    console.warn('[Upload Admin] Impossible d’uploader sur le serveur distant, utilisation de prévisualisations locales:', error);
    // Créer des URLs d'objet locales pour permettre la prévisualisation immédiate en dev / test
    return files.map((file) => URL.createObjectURL(file));
  }
}
