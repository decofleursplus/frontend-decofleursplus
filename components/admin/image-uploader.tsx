'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';

export interface ImageUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  primaryImage?: string;
  onPrimaryChange?: (url: string) => void;
  folder?: 'products' | 'categories';
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function ImageUploader({
  value = [],
  onChange,
  primaryImage,
  onPrimaryChange,
  folder = 'products',
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
  disabled = false,
  className = '',
  label,
  description = 'Format JPG, PNG, WebP. Max 5 Mo.',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];
  const currentPrimary = primaryImage || images[0] || '';

  const handleFiles = async (filesList: FileList | File[]) => {
    if (disabled || isUploading) return;

    const rawFiles = Array.from(filesList);
    if (rawFiles.length === 0) return;

    // 1. Filtrer et valider les formats
    const validFiles: File[] = [];
    for (const file of rawFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Format non supporté pour "${file.name}". Utilisez JPG, PNG, WebP ou AVIF.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Le fichier "${file.name}" dépasse la taille maximale autorisée de ${maxSizeMB} Mo.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 2. Vérifier la limite de fichiers
    let filesToUpload = validFiles;
    if (!multiple) {
      filesToUpload = [validFiles[0]];
    } else if (images.length + validFiles.length > maxFiles) {
      const remainingSlots = Math.max(0, maxFiles - images.length);
      if (remainingSlots === 0) {
        toast.error(`Nombre maximal de photos atteint (${maxFiles} photos max).`);
        return;
      }
      toast.warning(`Seules les ${remainingSlots} premières photos ont été retenues (limite : ${maxFiles}).`);
      filesToUpload = validFiles.slice(0, remainingSlots);
    }

    // 3. Téléversement strict vers le serveur
    setIsUploading(true);
    try {
      const uploadedUrls = await uploadAdminMedia(filesToUpload, folder);

      if (uploadedUrls.length > 0) {
        let updatedList: string[];
        if (!multiple) {
          updatedList = uploadedUrls.slice(0, 1);
          if (onPrimaryChange) {
            onPrimaryChange(updatedList[0]);
          }
        } else {
          updatedList = [...images, ...uploadedUrls];
          // Si aucune image principale n'est définie, la première devient principale
          if (!currentPrimary && onPrimaryChange && updatedList.length > 0) {
            onPrimaryChange(updatedList[0]);
          }
        }

        if (onChange) {
          onChange(updatedList);
        }
        toast.success(
          uploadedUrls.length === 1
            ? 'Image téléversée avec succès !'
            : `${uploadedUrls.length} images téléversées avec succès !`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Échec du téléversement sur le serveur.';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    const nextImages = images.filter((url) => url !== urlToRemove);
    if (onChange) {
      onChange(nextImages);
    }
    // Si on supprime l'image principale, désigner la première restante
    if (urlToRemove === currentPrimary && onPrimaryChange) {
      onPrimaryChange(nextImages[0] || '');
    }
  };

  const handleSetPrimary = (url: string) => {
    if (onPrimaryChange) {
      onPrimaryChange(url);
      toast.success('Image principale mise à jour.');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#1e2a1f]">{label}</label>
          {multiple && (
            <span className="text-xs text-gray-500">
              {images.length} / {maxFiles}
            </span>
          )}
        </div>
      )}

      {/* Galerie des images existantes */}
      {images.length > 0 && (
        <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((url, idx) => {
            const isPrimary = url === currentPrimary;
            return (
              <div
                key={`${url}-${idx}`}
                className={`relative group rounded-xl overflow-hidden border bg-white shadow-2xs aspect-square flex items-center justify-center ${
                  isPrimary ? 'border-[#c1647a] ring-2 ring-[#c1647a]/20' : 'border-[#e7e4dd]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Aperçu ${idx + 1}`}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bouquet-passion.jpg';
                  }}
                />

                {/* Badge Principale */}
                {isPrimary && multiple && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c1647a] text-white shadow-xs">
                    <Star size={10} className="fill-white" />
                    Principale
                  </span>
                )}

                {/* Overlay d'actions au survol */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {!isPrimary && multiple && onPrimaryChange && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(url)}
                      className="text-[11px] h-7 bg-white/90 hover:bg-white text-gray-800 shadow-xs"
                    >
                      <Star size={12} className="mr-1 text-amber-500" />
                      Principale
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemove(url)}
                    className="h-7 w-7 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xs"
                    title="Supprimer la photo"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone de drop et bouton d'upload */}
      {(!multiple && images.length === 0) || (multiple && images.length < maxFiles) ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''
          } ${
            isDragging
              ? 'border-[#c1647a] bg-[#faf3f5]'
              : 'border-[#e7e4dd] hover:border-[#c1647a]/50 hover:bg-[#faf8f4]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center text-gray-500">
            {isUploading ? (
              <Loader2 size={20} className="animate-spin text-[#c1647a]" />
            ) : (
              <Upload size={20} className="text-gray-500" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-medium text-gray-700">
              {isUploading
                ? 'Téléversement vers le serveur en cours...'
                : multiple
                ? 'Cliquez pour ajouter des photos'
                : images.length > 0
                ? 'Remplacer la photo'
                : 'Cliquez pour sélectionner une photo'}
            </p>
            <p className="text-[11px] text-gray-400">
              {isUploading ? 'Veuillez patienter...' : description}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
