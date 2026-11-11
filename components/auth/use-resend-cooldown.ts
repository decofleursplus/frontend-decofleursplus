'use client';

import { useCallback, useEffect, useState } from 'react';

/** Compte à rebours (en secondes) avant de pouvoir redemander un code. */
export function useResendCooldown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const restart = useCallback((seconds: number) => setSecondsLeft(Math.max(0, Math.ceil(seconds))), []);

  return { secondsLeft, canResend: secondsLeft <= 0, restart };
}
