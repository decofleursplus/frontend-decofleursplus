'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons';

const STORAGE_KEY = 'decofleur_whatsapp_btn_pos';
const BTN_SIZE_DESKTOP = 52;
const BTN_SIZE_MOBILE = 48;
const EDGE_MARGIN = 16;
const TOP_MARGIN = 64; // Espace de sécurité sous le header
const BOTTOM_NAVBAR_CLEARANCE = 84; // Espace au-dessus de la barre d'onglets mobile

interface Position {
  x: number;
  y: number;
}

export function FloatingWhatsApp() {
  const pathname = usePathname();

  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const justFinishedDragRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startBtnPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef<Position | null>(null);

  // Synchroniser la référence courante
  currentPosRef.current = position;

  // Calcul des limites d'écran
  const getBounds = useCallback(() => {
    if (typeof window === 'undefined') {
      return { minX: 16, maxX: 300, minY: 64, maxY: 600, btnSize: 52, winW: 375, winH: 667, isMobile: true };
    }
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobile = winW <= 768;
    const btnSize = isMobile ? BTN_SIZE_MOBILE : BTN_SIZE_DESKTOP;
    const bottomClearance = isMobile ? BOTTOM_NAVBAR_CLEARANCE : 24;

    const minX = EDGE_MARGIN;
    const maxX = Math.max(EDGE_MARGIN, winW - btnSize - EDGE_MARGIN);
    const minY = TOP_MARGIN;
    const maxY = Math.max(minY, winH - btnSize - bottomClearance);

    return { minX, maxX, minY, maxY, btnSize, winW, winH, isMobile };
  }, []);

  // Clamper la position dans les limites strictes de l'écran
  const clampPosition = useCallback(
    (pos: Position): Position => {
      const { minX, maxX, minY, maxY } = getBounds();
      return {
        x: Math.min(Math.max(pos.x, minX), maxX),
        y: Math.min(Math.max(pos.y, minY), maxY),
      };
    },
    [getBounds]
  );

  // Aimantation sur le bord gauche ou droit le plus proche
  const snapToEdge = useCallback(
    (pos: Position): Position => {
      const { minX, maxX, minY, maxY, btnSize, winW } = getBounds();
      const clampedY = Math.min(Math.max(pos.y, minY), maxY);
      const centerX = pos.x + btnSize / 2;
      const snapX = centerX < winW / 2 ? minX : maxX;
      return { x: snapX, y: clampedY };
    },
    [getBounds]
  );

  // Position par défaut
  const getDefaultPosition = useCallback((): Position => {
    const { maxX, maxY } = getBounds();
    return { x: maxX, y: maxY };
  }, [getBounds]);

  // Initialisation au montage (SSR-safe + LocalStorage)
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Position;
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          setPosition(snapToEdge(parsed));
          return;
        }
      }
    } catch {
      // Ignorer erreur localStorage
    }
    setPosition(getDefaultPosition());
  }, [getDefaultPosition, snapToEdge]);

  // Recalage automatique lors du redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (currentPosRef.current) {
        setPosition(snapToEdge(currentPosRef.current));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [snapToEdge]);

  // Listeners universels (Pointer, Mouse et Touch)
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!pointerDownRef.current) return;

      const dx = clientX - startPointerRef.current.x;
      const dy = clientY - startPointerRef.current.y;
      const distance = Math.hypot(dx, dy);

      // Seuil de 5px pour distinguer un tap/clic d'un vrai glisser
      if (!hasDraggedRef.current && distance > 5) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      }

      if (hasDraggedRef.current) {
        const targetPos = {
          x: startBtnPosRef.current.x + dx,
          y: startBtnPosRef.current.y + dy,
        };
        setPosition(clampPosition(targetPos));
      }
    };

    const handleEnd = () => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;

      if (hasDraggedRef.current) {
        setIsDragging(false);
        justFinishedDragRef.current = true;

        const current = currentPosRef.current || startBtnPosRef.current;
        const snapped = snapToEdge(current);
        setPosition(snapped);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
        } catch {
          // ignore
        }

        // Réinitialiser le verrou de drag après le cycle de clic
        setTimeout(() => {
          justFinishedDragRef.current = false;
          hasDraggedRef.current = false;
        }, 150);
      } else {
        setIsDragging(false);
      }
    };

    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', handleEnd);

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [clampPosition, snapToEdge]);

  // Début du contact
  const handleStart = (clientX: number, clientY: number) => {
    pointerDownRef.current = true;
    hasDraggedRef.current = false;
    startPointerRef.current = { x: clientX, y: clientY };

    const initialPos = currentPosRef.current || getDefaultPosition();
    startBtnPosRef.current = { ...initialPos };
  };

  // Annuler le clic si un glisser a eu lieu
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasDraggedRef.current || justFinishedDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      justFinishedDragRef.current = false;
      hasDraggedRef.current = false;
    }
  };

  // Masquer sur les routes admin / back-office
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage = encodeURIComponent(
    'Bonjour DécoFleur Plus, je souhaite un renseignement ou passer une commande.'
  );

  // Position calculée
  const inlineStyles: React.CSSProperties = isMounted && position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : {};

  return (
    <aside aria-label="Assistance WhatsApp">
      <a
        href={`https://wa.me/221779417860?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        aria-label="Contacter DécoFleur Plus sur WhatsApp (+221 77 941 78 60)"
        title="Glisser pour déplacer le bouton ou cliquer pour discuter sur WhatsApp"
        className={`floating-whatsapp-btn ${isDragging ? 'is-dragging' : ''} ${
          isMounted ? 'is-positioned' : ''
        }`}
        style={inlineStyles}
        onPointerDown={(e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          handleStart(e.clientX, e.clientY);
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          handleStart(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onClick={handleClick}
      >
        <span className="sr-only">Contacter sur WhatsApp (Bouton déplaçable)</span>
        <WhatsAppIcon size={28} className="text-white pointer-events-none" />
        <span className="floating-whatsapp-ping pointer-events-none" aria-hidden="true" />
      </a>
    </aside>
  );
}
