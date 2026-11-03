'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Search,
  Sparkles,
  ArrowRight,
  User,
  Tag,
  Loader2,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import {
  getBlogArticles,
  getBlogCategories,
  BlogArticle,
  BlogCategory,
} from '@/lib/api/blog';

export default function BlogIndexPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBlogCategories().catch(() => []),
      getBlogArticles().catch(() => ({ items: [] })),
    ])
      .then(([cats, arts]) => {
        setCategories(cats);
        if (arts?.items) {
          setArticles(arts.items);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesCat =
      selectedCategory === 'all' ||
      art.categorySlug === selectedCategory ||
      art.categoryId === selectedCategory;

    const matchesQuery =
      !searchQuery.trim() ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  return (
    <>
      <main className="content-width page-main blog-page pb-16">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Blog Floral</span>
        </nav>

        {/* Hero Header */}
        <section className="bg-gradient-to-br from-[#173f22]/5 via-[#c8436e]/5 to-transparent rounded-3xl p-8 md:p-12 border border-neutral-100 mb-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#173f22]/10 rounded-full text-xs font-semibold text-[#173f22] mb-3 shadow-xs">
            <Sparkles size={13} className="text-[#c8436e]" />
            <span>Le Carnet Floral DécoFleur Plus</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#173f22] max-w-2xl mx-auto leading-tight mb-4">
            Inspirations, astuces florales &amp; art de vivre à Saly
          </h1>

          <p className="text-neutral-600 max-w-xl mx-auto text-sm md:text-base mb-6">
            Découvrez nos secrets pour faire durer vos bouquets sous le soleil sénégalais, des idées scénographiques pour vos événements et les tendances de saison.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un conseil, une fleur, une idée..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-full text-sm shadow-xs focus:outline-hidden focus:border-[#173f22] transition-colors"
            />
          </div>
        </section>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#173f22] text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Tous les articles
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === c.slug
                  ? 'bg-[#173f22] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-16 gap-2 text-neutral-500">
            <Loader2 size={24} className="animate-spin" />
            <span>Chargement des articles...</span>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <Link
                  href={`/blog/${art.slug}`}
                  className="relative aspect-16/10 overflow-hidden bg-neutral-100 block"
                >
                  <Image
                    src={art.coverImage || '/images/hero.jpg'}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#173f22] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs">
                    {art.categoryName}
                  </span>
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {art.readTime || '3 min'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{' '}
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#c8436e] transition-colors leading-snug mb-2 line-clamp-2">
                    <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                  </h2>

                  <p className="text-xs text-neutral-600 line-clamp-3 mb-4 flex-1">
                    {art.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-[#173f22]">
                        {art.authorName ? art.authorName.charAt(0) : 'D'}
                      </div>
                      <span className="text-xs font-medium text-neutral-700 truncate max-w-[120px]">
                        {art.authorName || 'Atelier DécoFleur'}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${art.slug}`}
                      className="text-xs font-semibold text-[#173f22] group-hover:text-[#c8436e] flex items-center gap-1 transition-colors"
                    >
                      Lire <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-neutral-100">
            <BookOpen size={32} className="mx-auto text-neutral-400 mb-2" />
            <h3 className="font-serif font-bold text-lg text-neutral-800 mb-1">
              Aucun article trouvé
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-4">
              Essayez un autre mot-clé ou sélectionnez une autre catégorie d’articles.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="button button-outline text-xs"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
