'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { logoutAdmin } from '@/app/admin/connexion/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

// Seuls les modules n'apparaissant pas dans le bottom navbar (Dashboard, Commandes, Produits, Livraisons)
const drawerMenuItems = [
  { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
  { label: 'Clients & CRM', href: '/admin/clients', icon: Users },
  { label: 'Gestion du Stock', href: '/admin/stock', icon: Package },
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

  if (!isMobileDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
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
      <aside className="relative flex flex-col w-[85%] max-w-[320px] h-full bg-[#fbfaf8] border-r border-[#ece8df] shadow-2xl z-10 animate-in slide-in-from-left duration-250 ease-out overflow-hidden">
        {/* Header du Drawer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ece8df] bg-white/90 backdrop-blur-md">
          <Link
            href="/admin/tableau-de-bord"
            onClick={closeMobileDrawer}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo_decofleur.jpeg"
              alt="Décofleur Plus"
              width={34}
              height={34}
              className="h-8 w-8 object-contain rounded-md"
            />
            <div className="flex flex-col">
              <span className="font-serif italic font-semibold text-base text-[#193e23] leading-none">
                Décofleur Plus
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#c1647a] mt-0.5">
                Back-office
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileDrawer}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profil utilisateur connecté */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#edf8ef] to-[#faf8f2] border-b border-[#e5e0d4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-emerald-300">
              <AvatarFallback className="bg-[#193e23] text-white text-xs font-bold">
                A
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 leading-tight">Admin</span>
              <span className="text-[10.5px] text-gray-500 leading-none">admin@decofleur.com</span>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
            Super Admin
          </span>
        </div>

        {/* Section PWA : Installation ou état de l'app (subtile et discrète) */}
        <div className="px-3 pt-2.5 pb-1">
          {isStandalone ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/50 text-emerald-800 text-[11px] font-medium">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate">Application installée</span>
            </div>
          ) : installPrompt ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-gray-200/70 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                  <Smartphone size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11.5px] font-semibold text-gray-800 leading-tight truncate">Installer l'application</span>
                  <span className="text-[9.5px] text-gray-500 leading-tight truncate">Accès direct écran d'accueil</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
              >
                <Download size={11} />
                <span>Installer</span>
              </button>
            </div>
          ) : isIosSafari ? (
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/50 text-amber-900 text-[10px] leading-tight">
              <strong>Astuce iOS :</strong> Touchez <span className="underline font-semibold">Partager</span> puis <span className="font-semibold">« Sur l'écran d'accueil »</span>.
            </div>
          ) : null}
        </div>

        {/* Liste plate des modules (sans les 4 du bottom bar, sans sectionnage) */}
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
                        ? 'bg-gradient-to-r from-[#edf8ef] to-[#e8f4ea] text-[#193e23] font-bold border border-[#193e23]/10 shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-100/70 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      size={17}
                      className={isActive ? 'text-[#c1647a]' : 'text-gray-500'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c1647a]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer du Drawer : Boutique & Déconnexion */}
        <div className="p-3 border-t border-[#ece8df] bg-white/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-gray-400" />
              <span>Voir la boutique publique</span>
            </span>
            <span className="text-[10px] text-gray-400">Ouvrir ↗</span>
          </Link>

          <form action={logoutAdmin} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50/60 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut size={14} className="text-rose-600" />
              <span>Se déconnecter</span>
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
