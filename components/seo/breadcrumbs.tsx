import React from 'react';
import Link from 'next/link';
import { JsonLd } from './json-ld';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  // Prepare Schema.org JSON-LD items (must have full or relative URL for each step)
  const schemaItems = items.map((item, index) => ({
    name: item.label,
    url: item.href || (index === 0 ? '/' : ''),
  })).filter((item) => Boolean(item.url));

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Fil d'Ariane" className={`breadcrumbs ${className}`.trim()}>
        <ol className="flex items-center flex-wrap gap-1.5 m-0 p-0 list-none text-xs sm:text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-neutral-400 select-none text-[11px]" aria-hidden="true">
                    ›
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:underline text-neutral-600 hover:text-[#c8436e] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'text-neutral-900 font-medium truncate max-w-[220px] sm:max-w-none' : 'text-neutral-600'}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

