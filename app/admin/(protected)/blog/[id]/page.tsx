'use client';

import { use } from 'react';
import Link from 'next/link';
import { adminBlogArticles } from '@/lib/admin/mock-data/blog';
import { ArticleForm } from '@/components/admin/article-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

interface EditBlogArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogArticlePage({ params }: EditBlogArticlePageProps) {
  const { id } = use(params);

  const article = adminBlogArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#edf8ef] text-[#24582d] flex items-center justify-center mb-4 shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1e2a1f]">Article introuvable</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          L&apos;article demandé n&apos;existe pas ou a peut-être été supprimé.
        </p>
        <Button
          render={<Link href="/admin/blog" />}
          className="mt-6 bg-[#24582d] hover:bg-[#1a4021] text-white text-xs font-semibold px-5 shadow-xs"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au journal
        </Button>
      </div>
    );
  }

  return <ArticleForm initialArticle={article} />;
}
