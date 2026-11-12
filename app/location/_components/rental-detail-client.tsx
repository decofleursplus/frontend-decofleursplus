'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import type { RentalEquipment } from '@/lib/api/rentals';
import { RentalBookingForm } from './rental-booking-form';

export function RentalGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        {current ? (
          <Image src={current} alt={name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <Package size={56} />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === active ? 'border-[#c8436e]' : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`Afficher la photo ${idx + 1}`}
            >
              <Image src={url} alt={`${name} — photo ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Formulaire de réservation de la fiche équipement (la page elle-même est rendue côté serveur). */
export function RentalDetailBooking({ equipment }: { equipment: RentalEquipment }) {
  return <RentalBookingForm equipment={equipment} />;
}
