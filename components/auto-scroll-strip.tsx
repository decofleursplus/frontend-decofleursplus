'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type AutoScrollStripProps = {
  children: ReactNode;
  className: string;
  interval?: number;
};

export function AutoScrollStrip({
  children,
  className,
  interval = 2800,
}: AutoScrollStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      stop();
      if (!mobileQuery.matches || reducedMotionQuery.matches || pausedRef.current) return;

      timer = setInterval(() => {
        const firstItem = strip.firstElementChild as HTMLElement | null;
        if (!firstItem || strip.scrollWidth <= strip.clientWidth) return;

        const styles = window.getComputedStyle(strip);
        const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
        const step = firstItem.getBoundingClientRect().width + gap;
        const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;

        strip.scrollTo({
          left: atEnd ? 0 : strip.scrollLeft + step,
          behavior: 'smooth',
        });
      }, interval);
    };

    const update = () => {
      stop();
      start();
    };

    mobileQuery.addEventListener('change', update);
    reducedMotionQuery.addEventListener('change', update);
    start();

    return () => {
      stop();
      mobileQuery.removeEventListener('change', update);
      reducedMotionQuery.removeEventListener('change', update);
    };
  }, [interval]);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      ref={stripRef}
      className={className}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      {children}
    </div>
  );
}
