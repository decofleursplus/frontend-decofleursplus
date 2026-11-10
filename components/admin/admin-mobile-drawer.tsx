'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FolderTree,
  Users,
  Package,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  ExternalLink,
  Download,
  Smartphone,
  CheckCircle2,
  Building2,
  Boxes,
  FileSpreadsheet,
  Armchair,
  Trees,
  Repeat,
} from 'lucide-react';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { logoutAdmin } from '@/app/admin/connexion/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAdminUser, AdminSessionUser } from '@/lib/api/auth-token';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

// Seuls les modules n'apparaissant pas dans le bottom navbar (Dashboard, Commandes, Produits, Livraisons)
const drawerMenuItems = [
  { label: 'Abonnements', href: '/admin/abonnements', icon: Repeat },
  { label: 'Fournisseurs', href: '/admin/fournisseurs', icon: Building2, badge: 'À venir' },
  { label: 'Approvisionnements', href: '/admin/approvisionnements', icon: Boxes, badge: 'À venir' },
  { label: 'Gestion du Stock', href: '/admin/stock', icon: Package },
  { label: 'Clients & CRM', href: '/admin/clients', icon: Users },
  { label: 'Demandes de Devis', href: '/admin/devis', icon: FileSpreadsheet },
  { label: 'Location de Matériel', href: '/admin/location', icon: Armchair },
  { label: 'Paysagisme & Projets', href: '/admin/paysagisme', icon: Trees, badge: 'À venir' },
  { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
  { label: 'Marketing & Promos', href: '/admin/marketing', icon: Megaphone },
  { label: 'Blog & Articles', href: '/admin/blog', icon: FileText },
  { label: 'Rapports & Finances', href: '/admin/rapports', icon: BarChart3 },
  { label: 'Paramètres & Équipe', href: '/admin/parametres', icon: Settings },
];

export function AdminMobileDrawer() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, closeMobileDrawer } = useAdminSidebar();

  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [currentUser] = useState<AdminSessionUser | null>(() => getAdminUser());

  // Fermer le drawer avec la touche Echap
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  // Écoute de l'événement PWA installable
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
      setIsStandalone(standalone);

      const isApple =
        /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIosSafari(isApple && !standalone);
    };

    checkStandalone();

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Fermer le drawer lors d'une navigation
  useEffect(() => {
    if (isMobileDrawerOpen) {
      closeMobileDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Bloquer le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsStandalone(true);
    }
  };

  if (!mounted || !isMobileDrawerOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation du back-office"
    >
      {/* Backdrop sombre avec flou */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeMobileDrawer}
        aria-hidden="true"
      />

      {/* Panneau latéral glissant depuis la gauche */}
      <aside className="relative flex flex-col w-[85%] max-w-[320px] h-full bg-gradient-to-b from-[#102617] via-[#0d2114] to-[#08170d] text-white border-r border-white/10 z-10 animate-in slide-in-from-left duration-250 ease-out overflow-hidden">
        {/* Header du Drawer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <Link
            href="/admin/tableau-de-bord"
            onClick={closeMobileDrawer}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <Image
              src="/logo_decofleur_darkbg.png"
              alt="Décofleur Plus"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
              style={{ width: 'auto' }}
            />
            <div className="flex flex-col">
              <span className="font-serif italic font-semibold text-base text-white leading-none">
                Décofleur Plus
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#ff5c8a] mt-0.5">
                Back-office
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileDrawer}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profil utilisateur connecté & Déconnexion Rapide */}
        <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 ring-2 ring-emerald-500/30">
                <AvatarImage
                  src="/images/admin-avatar.jpg"
                  alt={currentUser?.name || 'Admin'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#193e23] text-white text-xs font-bold">
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white leading-tight truncate">
                {currentUser?.name || 'Administrateur'}
              </span>
              <span className="text-[10.5px] text-white/60 leading-none truncate max-w-[130px]">
                {currentUser?.email || 'Session active'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {currentUser?.role || 'Staff'}
            </span>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900/80 hover:text-white transition-colors cursor-pointer"
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Section PWA : Installation ou état de l'app (subtile et discrète) */}
        <div className="px-3 pt-2.5 pb-1">
          {isStandalone ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-medium">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">Application installée</span>
            </div>
          ) : installPrompt ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  <Smartphone size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11.5px] font-semibold text-white leading-tight truncate">Installer l&apos;application</span>
                  <span className="text-[9.5px] text-white/60 leading-tight truncate">Accès direct écran d&apos;accueil</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/50 transition-colors cursor-pointer"
              >
                <Download size={11} />
                <span>Installer</span>
              </button>
            </div>
          ) : isIosSafari ? (
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[10px] leading-tight">
              <strong>Astuce iOS :</strong> Touchez <span className="underline font-semibold">Partager</span> puis <span className="font-semibold">« Sur l&apos;écran d&apos;accueil »</span>.
            </div>
          ) : null}
        </div>

        {/* Liste des modules */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {drawerMenuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/tableau-de-bord' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileDrawer}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/50 to-emerald-700/60 text-white font-semibold border border-white/15 shadow-xs'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon
                      size={17}
                      className={isActive ? 'text-[#ff5c8a]' : 'text-white/60'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff5c8a]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer du Drawer : Boutique & Déconnexion */}
        <div className="p-3 border-t border-white/10 bg-black/25 space-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-white/60" />
              <span>Voir la boutique publique</span>
            </span>
            <span className="text-[10px] text-white/60">Ouvrir ↗</span>
          </Link>

          <form action={logoutAdmin} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-800/40 bg-rose-950/40 text-xs font-semibold text-rose-200 hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              <LogOut size={14} className="text-rose-300" />
              <span>Se déconnecter</span>
            </button>
          </form>
        </div>
      </aside>
    </div>,
    document.body
  );
}
