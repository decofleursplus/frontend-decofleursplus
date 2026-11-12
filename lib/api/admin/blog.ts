import { apiClient } from '../client';
import type {
  BlogArticle,
  BlogCategory,
  BlogAuthor,
  BlogArticleStatus,
} from '@/lib/admin/mock-data/types';

export interface GetAdminBlogArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  authorId?: string;
  status?: string;
  isFeatured?: boolean;
}

// Transform raw backend blog article
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformBlogArticle(raw: any): BlogArticle {
  let status: BlogArticleStatus = 'brouillon';
  const s = (raw.status || '').toUpperCase();
  if (s === 'PUBLISHED' || s === 'PUBLIE') status = 'publie';
  else if (s === 'SCHEDULED' || s === 'PROGRAMME' || s === 'PLANIFIE') status = 'planifie';
  else if (s === 'ARCHIVED' || s === 'ARCHIVE') status = 'archive';

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    categoryId: raw.categoryId || raw.category?.id || '',
    categoryName: raw.category?.name || raw.categoryName || 'Sans catégorie',
    categoryColor: raw.category?.color || raw.categoryColor || '#d65d7a',
    authorId: raw.authorId || raw.author?.id || '',
    authorName: raw.author?.name || raw.authorName || 'Équipe Décofleur Plus',
    authorAvatar: raw.author?.avatar || raw.authorAvatar || 'FD',
    authorRole: raw.author?.role || raw.authorRole || 'Artisan Fleuriste',
    authorBio: raw.author?.bio || raw.authorBio || '',
    coverImage: raw.coverImage || raw.image || '/images/bouquet-detail.jpg',
    coverImageCaption: raw.coverImageCaption || '',
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    // Le backend renvoie déjà « 4 min de lecture » : ne pas rajouter le suffixe à chaque sauvegarde.
    readTime: raw.readTime ? (/^\d+$/.test(String(raw.readTime)) ? `${raw.readTime} min de lecture` : String(raw.readTime)) : '',
    status,
    publishedAt: raw.publishedAt || raw.createdAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    viewsCount: Number(raw.viewsCount ?? raw.views ?? 0),
    likesCount: Number(raw.likesCount ?? raw.likes ?? 0),
    isFeatured: Boolean(raw.isFeatured),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    seoTitle: raw.seoTitle || raw.title,
    seoDescription: raw.seoDescription || raw.excerpt,
    relatedProductIds: Array.isArray(raw.relatedProductIds) ? raw.relatedProductIds : [],
  };
}

// Transform raw backend blog category
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformBlogCategory(raw: any): BlogCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description || '',
    color: raw.color || '#24582d',
    articlesCount: Number(raw.articlesCount ?? raw._count?.articles ?? 0),
    coverImage: raw.coverImage || '/images/bouquet-detail.jpg',
  };
}

// Transform raw backend blog author
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformBlogAuthor(raw: any): BlogAuthor {
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role || 'Artisan Fleuriste',
    avatar: raw.avatar || (raw.name ? raw.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FD'),
    bio: raw.bio || '',
    articlesCount: Number(raw.articlesCount ?? raw._count?.articles ?? 0),
  };
}

/**
 * Fetch blog articles with filters
 */
export async function getAdminBlogArticles(params?: GetAdminBlogArticlesParams): Promise<BlogArticle[]> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.categorySlug && params.categorySlug !== 'all') q.set('categorySlug', params.categorySlug);
    if (params?.authorId && params.authorId !== 'all') q.set('authorId', params.authorId);
    if (params?.status && params.status !== 'all') q.set('status', params.status.toUpperCase());
    if (params?.isFeatured !== undefined) q.set('isFeatured', String(params.isFeatured));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/blog/articles${queryStr}`, {
      useAdminToken: true,
      cache: 'no-store',
    });

    const dataObj = res?.data ?? res;
    if (Array.isArray(dataObj)) return dataObj.map(transformBlogArticle);
    if (Array.isArray(dataObj?.items)) return dataObj.items.map(transformBlogArticle);
    if (Array.isArray(dataObj?.articles)) return dataObj.articles.map(transformBlogArticle);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Articles indisponibles');
  }
  return [];
}

/**
 * Fetch a single blog article by ID
 */
export async function getAdminBlogArticleById(id: string): Promise<BlogArticle | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/admin/blog/articles/${id}`, {
      useAdminToken: true,
      cache: 'no-store',
    });
    const dataObj = res?.data ?? res;
    if (dataObj && (dataObj.id || dataObj.title)) {
      return transformBlogArticle(dataObj);
    }
  } catch (err) {
    console.warn(`[AdminBlogAPI] Article introuvable ou erreur pour ${id}:`, err);
  }
  return null;
}

/**
 * Create blog article
 */
export async function createAdminBlogArticle(body: {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId: string;
  authorId?: string;
  isFeatured?: boolean;
  status?: string;
}): Promise<BlogArticle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/blog/articles', body, {
    useAdminToken: true,
  });
  const dataObj = res?.data ?? res;
  return transformBlogArticle(dataObj);
}

/**
 * Update blog article
 */
export async function updateAdminBlogArticle(id: string, body: Partial<BlogArticle>): Promise<BlogArticle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/blog/articles/${id}`, body, {
    useAdminToken: true,
  });
  const dataObj = res?.data ?? res;
  return transformBlogArticle(dataObj);
}

/**
 * Delete blog article
 */
export async function deleteAdminBlogArticle(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/blog/articles/${id}`, {
    useAdminToken: true,
  });
  return true;
}

/**
 * Create blog category
 */
export async function createAdminBlogCategory(body: {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}): Promise<BlogCategory> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/blog/categories', body, {
    useAdminToken: true,
  });
  return transformBlogCategory(res);
}

/**
 * Update blog category
 */
export async function updateAdminBlogCategory(id: string, body: Partial<BlogCategory>): Promise<BlogCategory> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/blog/categories/${id}`, body, {
    useAdminToken: true,
  });
  return transformBlogCategory(res);
}

/**
 * Delete blog category
 */
export async function deleteAdminBlogCategory(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/blog/categories/${id}`, {
    useAdminToken: true,
  });
  return true;
}

/**
 * Create blog author
 */
export async function createAdminBlogAuthor(body: {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
}): Promise<BlogAuthor> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/admin/blog/authors', body, {
    useAdminToken: true,
  });
  return transformBlogAuthor(res);
}

/**
 * Update blog author
 */
export async function updateAdminBlogAuthor(id: string, body: Partial<BlogAuthor>): Promise<BlogAuthor> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.patch<any>(`/admin/blog/authors/${id}`, body, {
    useAdminToken: true,
  });
  return transformBlogAuthor(res);
}

/**
 * Delete blog author
 */
export async function deleteAdminBlogAuthor(id: string): Promise<boolean> {
  await apiClient.delete(`/admin/blog/authors/${id}`, {
    useAdminToken: true,
  });
  return true;
}

/** Duplique un article (copie en brouillon, slug unique) — POST /admin/blog/articles/:id/duplicate. */
export async function duplicateAdminBlogArticle(id: string): Promise<BlogArticle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>(`/admin/blog/articles/${id}/duplicate`, undefined, { useAdminToken: true });
  return transformBlogArticle(res?.data ?? res);
}

/** Catégories du blog avec leur nombre d'articles. */
export async function getAdminBlogCategories(): Promise<BlogCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.get<any[]>('/blog/categories', { cache: 'no-store' });
  return res.map(transformBlogCategory);
}

/** Auteurs du blog. */
export async function getAdminBlogAuthors(): Promise<BlogAuthor[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.get<any[]>('/blog/authors', { cache: 'no-store' });
  return res.map(transformBlogAuthor);
}
