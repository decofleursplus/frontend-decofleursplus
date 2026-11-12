'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import type { BlogArticle, BlogCategory } from '@/lib/admin/mock-data/types';

interface BlogExplorerProps {
  initialArticles: BlogArticle[];
  categories: BlogCategory[];
}

export function BlogExplorer({ initialArticles, categories }: BlogExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = initialArticles.filter((art) => {
    const matchesCat =
      selectedCategory === 'all' ||
      art.categoryId === selectedCategory ||
      art.categoryName.toLowerCase() === selectedCategory.toLowerCase();

    const matchesQuery =
      !searchQuery.trim() ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-md mx-auto relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher un conseil floral, une variété..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-full text-sm shadow-xs focus:outline-hidden focus:border-[#173f22] transition-colors"
          aria-label="Rechercher un article"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#173f22] text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Tous les articles ({initialArticles.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#173f22] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: cat.color || '#2d7a46' }}
            />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-100">
          <BookOpen size={40} className="mx-auto text-neutral-300 mb-3" />
          <h3 className="font-serif text-lg font-bold text-neutral-700">Aucun article trouvé</h3>
          <p className="text-neutral-500 text-sm mt-1">
            Essayez de modifier votre recherche ou sélectionnez une autre catégorie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredArticles.map((article) => {
            const formattedDate = article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Récemment';

            return (
              <article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col group"
              >
                {/* Cover Image */}
                <Link
                  href={`/blog/${article.slug}`}
                  className="relative aspect-16/10 overflow-hidden block bg-neutral-100"
                >
                  <Image
                    src={article.coverImage || '/images/bouquet-detail.jpg'}
                    alt={article.coverImageCaption || article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                    style={{ backgroundColor: article.categoryColor || '#173f22' }}
                  >
                    {article.categoryName}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        <span>{article.readTime}</span>
                      </span>
                    </div>

                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#173f22] group-hover:text-[#c8436e] transition-colors leading-snug mb-2.5 line-clamp-2">
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="text-neutral-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#173f22]/10 text-[#173f22] text-[10px] font-bold flex items-center justify-center">
                        {article.authorAvatar || 'FD'}
                      </div>
                      <span className="text-xs text-neutral-700 font-medium">
                        {article.authorName}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#173f22] group-hover:text-[#c8436e] transition-colors"
                    >
                      <span>Lire l’article</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

