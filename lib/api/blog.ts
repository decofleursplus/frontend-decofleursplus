import { apiClient } from './client';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  coverImage?: string | null;
  articlesCount: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  articlesCount: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryColor?: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  coverImage: string;
  coverImageCaption?: string | null;
  excerpt: string;
  content: string;
  readTime: string;
  status: 'publie' | 'brouillon' | 'planifie' | 'archive';
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
  tags: string[];
  relatedProductIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedArticles {
  items: BlogArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Liste les articles de blog publics
 * Endpoint: GET /api/v1/blog/articles
 */
export async function getBlogArticles(params?: {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedArticles> {
  try {
    const res = await apiClient.get<PaginatedArticles>('/blog/articles', { params });
    return res || { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  } catch {
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  }
}

/**
 * Détail d'un article de blog par son slug avec articles similaires
 * Endpoint: GET /api/v1/blog/articles/:slug
 */
export async function getBlogArticleBySlug(slug: string): Promise<{
  article: BlogArticle;
  relatedArticles: BlogArticle[];
} | null> {
  try {
    const res = await apiClient.get<{ article: BlogArticle; relatedArticles: BlogArticle[] }>(
      `/blog/articles/${encodeURIComponent(slug)}`
    );
    return res;
  } catch {
    return null;
  }
}

/**
 * Liker un article de blog
 * Endpoint: POST /api/v1/blog/articles/:slug/like
 */
export async function likeBlogArticle(slug: string): Promise<number | null> {
  try {
    const res = await apiClient.post<{ likesCount: number }>(
      `/blog/articles/${encodeURIComponent(slug)}/like`
    );
    return res?.likesCount ?? null;
  } catch {
    return null;
  }
}

/**
 * Liste des catégories du blog
 * Endpoint: GET /api/v1/blog/categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const categories = await apiClient.get<BlogCategory[]>('/blog/categories');
    return categories || [];
  } catch {
    return [];
  }
}

/**
 * Liste des auteurs du blog
 * Endpoint: GET /api/v1/blog/authors
 */
export async function getBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    const authors = await apiClient.get<BlogAuthor[]>('/blog/authors');
    return authors || [];
  } catch {
    return [];
  }
}
