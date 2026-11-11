'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark'; // 'light' for light backgrounds (default), 'dark' for dark backgrounds (footer)
  className?: string;
  isLink?: boolean;
}

export function BrandLogo({ variant = 'light', className = '', isLink = true }: BrandLogoProps) {
  const isDark = variant === 'dark';

  const content = (
    <div className={`brand-logo-container flex items-center select-none ${className}`}>
      <Image
        src={isDark ? '/images/logo-footer-white-v2.png' : '/images/logo-exact-v2.png'}
        alt="Décofleur Plus · Nature en Élégance"
        width={332}
        height={100}
        priority
        className="h-9 sm:h-11 md:h-12 w-auto object-contain shrink-0 transition-opacity hover:opacity-95"
      />
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="brand-logo-link inline-flex items-center" aria-label="Décofleur Plus, retour à l'accueil">
        {content}
      </Link>
    );
  }

  return content;
}
