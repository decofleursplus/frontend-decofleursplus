'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, ExternalLink, FileText, HelpCircle, PlayCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { canAccessAdminPath } from '@/lib/admin/access';
import {
  HELP_GUIDES,
  formatVideoDuration,
  helpGuideForPath,
  helpGuideUrl,
  helpVideoFor,
  helpVideoPosterUrl,
  helpVideoUrl,
  type HelpGuide,
} from '@/lib/admin/help-guides';

/** Carte d'un guide : le PDF (nouvel onglet) et, s'il existe, la vidéo de démonstration (lecteur intégré). */
function GuideCard({ guide, current, onPlay }: { guide: HelpGuide; current: boolean; onPlay: (guide: HelpGuide) => void }) {
  const video = helpVideoFor(guide);
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${
        current ? 'border-[#c1647a]/40 bg-[#fdf2f4]' : 'border-[#e7e4dd] bg-white'
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf8ef] text-[11px] font-bold text-[#24582d]">
        {guide.num}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#1e2a1f]">{guide.title}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-500">{guide.summary}</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <a
            href={helpGuideUrl(guide)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[#e7e4dd] bg-white px-2 py-1 text-[11.5px] font-semibold text-[#1e2a1f] transition-colors hover:border-[#c1647a]/50 hover:text-[#c1647a]"
            aria-label={`Guide PDF : ${guide.title} (${guide.pages} pages, nouvel onglet)`}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Guide PDF · {guide.pages} p.
            <ExternalLink className="h-3 w-3 text-gray-400" aria-hidden="true" />
          </a>
          {video && (
            <button
              type="button"
              onClick={() => onPlay(guide)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#c1647a] px-2 py-1 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#a85266]"
              aria-label={`Vidéo : ${guide.title} (${formatVideoDuration(video.seconds)})`}
            >
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Vidéo · {formatVideoDuration(video.seconds)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Bouton « Aide » de la barre du haut : propose le guide du module affiché, puis les guides de tous les
 * modules accessibles au compte, chacun en PDF illustré et en vidéo de démonstration (publiés sur Cloudflare R2).
 */
export function AdminHelpMenu() {
  const pathname = usePathname() ?? '';
  const { access } = useAdminSidebar();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<HelpGuide | null>(null);

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
  const video = playing ? helpVideoFor(playing) : null;

  const play = (guide: HelpGuide) => {
    setOpen(false);
    setPlaying(guide);
  };

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
                  Guides illustrés (PDF) et vidéos de démonstration du back-office, écran par écran.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <section className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#c1647a]">Pour cet écran</h3>
              <GuideCard guide={current} current onPlay={play} />
            </section>

            <section className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Tous les guides</h3>
              <ul className="space-y-2">
                {guides.map((guide) => (
                  <li key={guide.id}>
                    <GuideCard guide={guide} current={guide.id === current.id} onPlay={play} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(playing && video)} onOpenChange={(isOpen) => !isOpen && setPlaying(null)}>
        <DialogContent className="gap-0 overflow-hidden bg-[#11161a] p-0 text-white sm:max-w-4xl">
          {playing && video && (
            <>
              <video
                key={video.file}
                src={helpVideoUrl(video)}
                poster={helpVideoPosterUrl(video)}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black"
              >
                Votre navigateur ne peut pas lire cette vidéo.
              </video>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 pr-12 text-[#1e2a1f]">
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-bold">
                    Vidéo {playing.num} · {playing.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {formatVideoDuration(video.seconds)} · commentée et sous-titrée
                  </DialogDescription>
                </div>
                <a
                  href={helpGuideUrl(playing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e7e4dd] px-2.5 py-1.5 text-xs font-semibold hover:border-[#c1647a]/50 hover:text-[#c1647a]"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Guide PDF
                  <ExternalLink className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
