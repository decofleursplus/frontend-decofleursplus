'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type AdminDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: AdminDrawerSize;
  maxWidthClass?: string;
}

const SIZE_CLASSES: Record<AdminDrawerSize, string> = {
  sm: 'max-w-md',      // ~448px
  md: 'max-w-lg',      // ~512px
  lg: 'max-w-2xl',     // ~672px
  xl: 'max-w-3xl',     // ~768px
  '2xl': 'max-w-4xl',   // ~896px
  full: 'max-w-full',
};

export function AdminDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerExtra,
  children,
  footer,
  size = 'md',
  maxWidthClass,
}: AdminDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquer le scroll d'arrière-plan de la page, gérer le padding pour éviter le layout shift, et écouter la touche Échap
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const resolvedWidthClass = maxWidthClass || SIZE_CLASSES[size] || 'max-w-lg';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* ── Overlay d'arrière-plan avec flou ultra-léger et assombrissement doux ── */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Volet latéral (Side Drawer) pleine hauteur contrainte ── */}
      <div
        className={`relative z-10 w-full ${resolvedWidthClass} bg-white shadow-2xl flex flex-col h-full max-h-screen animate-in slide-in-from-right duration-300 border-l border-border overflow-hidden`}
      >
        {/* En-tête sticky / fixe en haut */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border flex items-center justify-between bg-white shrink-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {icon && (
              <div className="p-2 rounded-xl bg-[#173f22]/10 text-[#173f22] shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#173f22] truncate">
                  {title}
                </h2>
                {headerExtra}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors shrink-0 cursor-pointer"
            aria-label="Fermer le panneau"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps scrollable avec scrollbar masquée (no-scrollbar), overscroll-contain et min-h-0 anti-overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain no-scrollbar">
          {children}
        </div>

        {/* Pied de page sticky en bas avec safe-area mobile */}
        {footer && (
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 pb-[max(14px,env(safe-area-inset-bottom))] border-t border-border bg-[#faf8f5] flex items-center justify-end gap-3 shrink-0 z-10 shadow-2xs">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

