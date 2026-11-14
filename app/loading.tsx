import Image from 'next/image';

export default function Loading() {
  return (
    <main
      className="content-width flex flex-col items-center justify-center min-h-[460px] py-16 text-center select-none"
      role="status"
      aria-label="Chargement de Déco Fleurs Plus"
    >
      <div className="relative flex items-center justify-center w-28 h-28 mb-4">
        {/* Anneau de chargement animé aux couleurs de la marque */}
        <div className="absolute inset-0 rounded-full border-2 border-[#fbb6ce]/40 border-t-[#c8436e] border-r-[#193e23] animate-spin" />
        {/* Halo doux */}
        <div className="absolute inset-2 rounded-full bg-[#193e23]/5 animate-pulse" />
        {/* Logo officiel Déco Fleurs */}
        <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs p-2">
          <Image
            src="/images/logo-exact-v2.png"
            alt="Déco Fleurs Plus"
            width={120}
            height={80}
            priority
            className="w-auto h-10 object-contain"
          />
        </div>
      </div>
      <p className="font-serif text-sm tracking-wide text-[#1c2e20] font-medium">
        Chargement de vos créations florales…
      </p>
      <span className="text-xs text-neutral-400 mt-1">Déco Fleurs Plus · Nature en Élégance</span>
    </main>
  );
}
