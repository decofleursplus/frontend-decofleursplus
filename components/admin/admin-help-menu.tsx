'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { canAccessAdminPath } from '@/lib/admin/access';
import { HELP_GUIDES, helpGuideForPath, helpGuideUrl, type HelpGuide } from '@/lib/admin/help-guides';

/** Lien vers un guide PDF, ouvert dans un nouvel onglet. */
function GuideLink({ guide, current }: { guide: HelpGuide; current: boolean }) {
  return (
    <a
      href={helpGuideUrl(guide)}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        current ? 'border-[#c1647a]/40 bg-[#fdf2f4]' : 'border-[#e7e4dd] bg-white hover:border-[#c1647a]/40 hover:bg-[#fdf8f9]'
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf8ef] text-[11px] font-bold text-[#24582d]">
        {guide.num}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-[#1e2a1f]">{guide.title}</span>
          <span className="shrink-0 text-[11px] text-gray-400">{guide.pages} p.</span>
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-500">{guide.summary}</span>
      </span>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
    </a>
  );
}

/**
 * Bouton « Aide » de la barre du haut : propose le guide du module affiché, puis les guides de tous les
 * modules accessibles au compte (PDF illustrés, publiés sur Cloudflare R2).
 */
export function AdminHelpMenu() {
  const pathname = usePathname() ?? '';
  const { access } = useAdminSidebar();
  const [open, setOpen] = useState(false);

  const current = helpGuideForPath(pathname);
  // Guides généraux toujours proposés ; les autres si l'écran (ou l'écran associé) est accessible au compte.
  // L'administrateur voit tout, y compris l'espace livreur pour former l'équipe.
  const guides = HELP_GUIDES.filter(
    (g) =>
      !g.path ||
      access?.role === 'ADMIN' ||
      canAccessAdminPath(access, g.path) ||
      Boolean(g.alsoPath && canAccessAdminPath(access, g.alsoPath)),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#e7e4dd] bg-white/85 px-2 text-[13px] font-semibold text-[#666] transition-colors hover:border-[#c1647a] hover:bg-white hover:text-[#c1647a] sm:px-2.5"
        title="Aide : guide du back-office"
        aria-label="Aide : guide du back-office"
        aria-haspopup="dialog"
      >
        <HelpCircle size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Aide</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-[460px]">
          <SheetHeader className="border-b border-[#f0eee8] p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#c1647a]">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <SheetTitle className="font-sans text-lg font-bold text-gray-900">Aide</SheetTitle>
                <SheetDescription className="text-xs text-gray-500">
                  Guides illustrés du back-office, écran par écran (PDF, nouvel onglet).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <section className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#c1647a]">Pour cet écran</h3>
              <GuideLink guide={current} current />
            </section>

            <section className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Tous les guides</h3>
              <ul className="space-y-2">
                {guides.map((guide) => (
                  <li key={guide.id}>
                    <GuideLink guide={guide} current={guide.id === current.id} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
