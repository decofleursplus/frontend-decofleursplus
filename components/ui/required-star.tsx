import React from 'react';

/** Astérisque stylisée pour les champs obligatoires — rose thème DécoFleur (#c1647a). */
export function RequiredStar({ className }: { className?: string }) {
  return (
    <span className={`text-[#c1647a] ml-0.5 select-none font-bold ${className || ''}`} aria-hidden="true">
      *
    </span>
  );
}

export default RequiredStar;

