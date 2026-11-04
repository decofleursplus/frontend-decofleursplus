'use client';

import { useState } from 'react';
import { Heart, Share2, Check } from 'lucide-react';
import { WhatsAppIcon, FacebookIcon } from '@/components/icons';
import { likeBlogArticle } from '@/lib/api/blog';

interface ArticleInteractionsProps {
  slug: string;
  initialLikes: number;
  title: string;
}

export function ArticleInteractions({ slug, initialLikes, title }: ArticleInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await likeBlogArticle(slug);
    } catch {
      // Non-blocking
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const encodedTitle = encodeURIComponent(title);
  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  return (
    <div className="flex items-center justify-between border-t border-b border-neutral-100 py-4 my-8">
      {/* Bouton J'aime */}
      <button
        type="button"
        onClick={handleLike}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-all ${
          liked
            ? 'bg-rose-50 border-rose-200 text-[#c8436e]'
            : 'border-neutral-200 text-neutral-600 hover:border-[#c8436e] hover:text-[#c8436e]'
        }`}
      >
        <Heart size={16} className={liked ? 'fill-[#c8436e] text-[#c8436e]' : ''} />
        <span>{likes} {likes > 1 ? 'J’aime' : 'J’aime'}</span>
      </button>

      {/* Partage */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 hidden sm:inline">Partager cet article :</span>
        
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${currentUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Partager sur WhatsApp"
        >
          <WhatsAppIcon size={14} />
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Partager sur Facebook"
        >
          <FacebookIcon size={14} />
        </a>

        {/* Copier le lien */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs transition-colors"
          title="Copier le lien de l’article"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600" />
              <span className="text-emerald-600">Lien copié !</span>
            </>
          ) : (
            <>
              <Share2 size={13} />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

