'use client';

import Image from 'next/image';

interface BotanicalCornersProps {
  className?: string;
}

export function BotanicalCorners({ className = '' }: BotanicalCornersProps) {
  return (
    <div className={`botanical-corners-container ${className}`} aria-hidden="true">
      {/* Top Left Leaf Sprig */}
      <div className="botanical-corner botanical-corner-tl">
        <Image
          src="/images/corner-leaves.png"
          alt=""
          width={220}
          height={220}
          priority
          className="botanical-leaf-img"
        />
      </div>

      {/* Top Right Leaf Sprig (Mirrored) */}
      <div className="botanical-corner botanical-corner-tr">
        <Image
          src="/images/corner-leaves.png"
          alt=""
          width={220}
          height={220}
          priority
          className="botanical-leaf-img"
        />
      </div>
    </div>
  );
}
