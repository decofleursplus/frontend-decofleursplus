'use client';

import { useState, useRef, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateMyStaffProfile, uploadMyStaffAvatar, type StaffProfile } from '@/lib/api/admin/staff-profile';
import { getAdminUser, setAdminUser, AdminSessionUser } from '@/lib/api/auth-token';

interface AdminProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: AdminSessionUser | null;
  onUserUpdated?: (user: AdminSessionUser) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Session admin mise à jour à partir du profil renvoyé par le serveur (source de vérité). */
function toSessionUser(profile: StaffProfile, current: AdminSessionUser | null): AdminSessionUser {
  return {
    ...current,
    id: profile.id,
    name: profile.name || current?.name || profile.email,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar,
  };
}
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

function AdminProfileDialogInner({
  onClose,
  currentUser,
  onUserUpdated,
}: {
  onClose: () => void;
  currentUser?: AdminSessionUser | null;
  onUserUpdated?: (user: AdminSessionUser) => void;
}) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialUser = currentUser || getAdminUser();
  const [activeUser, setActiveUser] = useState<AdminSessionUser | null>(initialUser);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUser?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const err = 'Format non supporté. Veuillez choisir une image au format JPEG, PNG, WebP ou AVIF.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const err = 'Fichier trop volumineux. La taille maximale autorisée est de 5 Mo.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      onClose();
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Envoi et enregistrement sur le profil en un seul appel (route ouverte à tous les rôles de l'équipe)
      const profile = await uploadMyStaffAvatar(selectedFile);
      const updatedUser = toSessionUser(profile, activeUser || getAdminUser());

      setAdminUser(updatedUser);
      setActiveUser(updatedUser);
      onUserUpdated?.(updatedUser);

      toast.success('Photo de profil mise à jour avec succès !');
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Une erreur est survenue lors du téléversement.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const profile = await updateMyStaffProfile({ avatar: null });
      const updatedUser = toSessionUser(profile, activeUser || getAdminUser());

      setAdminUser(updatedUser);
      setActiveUser(updatedUser);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUserUpdated?.(updatedUser);

      toast.success('Photo de profil supprimée.');
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la suppression de la photo.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const initials = activeUser?.name
    ? activeUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <DialogContent className="w-[92vw] max-w-md p-5 sm:p-6 rounded-2xl bg-white shadow-2xl border border-[#e7e4dd]">
      <DialogHeader className="text-left space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#193e23] border border-emerald-200/60">
            <Camera size={18} />
          </div>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-gray-900">
              Photo de profil
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Personnalisez votre avatar dans l&apos;espace d&apos;administration.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-emerald-600/20 shadow-md">
              <AvatarImage
                src={previewUrl || undefined}
                alt={activeUser?.name || 'Profil admin'}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#102617] text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Changer la photo"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:pointer-events-none"
            >
              <Camera size={22} />
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-800">
              {activeUser?.name || 'Administrateur'}
            </p>
            <p className="text-[11px] text-gray-500">
              {activeUser?.email || 'admin@decofleursplus.com'}
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Buttons for choosing/removing photo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto text-xs h-9 gap-1.5 border-[#e7e4dd] hover:bg-[#edf8ef] hover:text-[#193e23] hover:border-emerald-300"
          >
            <Upload size={14} />
            <span>{previewUrl ? 'Changer l&apos;image' : 'Choisir une image'}</span>
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="w-full sm:w-auto text-xs h-9 gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 size={14} />
              <span>Supprimer la photo</span>
            </Button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Requirements & Info */}
        <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100 text-[11px] text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">Recommandations :</p>
          <p>• Formats acceptés : JPEG, PNG, WebP, AVIF</p>
          <p>• Poids maximal : 5 Mo (ratio 1:1 carré recommandé)</p>
        </div>
      </div>

      <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isUploading}
          className="w-full sm:w-auto text-xs h-9"
        >
          Annuler
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isUploading || !selectedFile}
          className="w-full sm:w-auto text-xs h-9 bg-[#193e23] hover:bg-[#13301b] text-white gap-1.5 cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Téléversement...</span>
            </>
          ) : (
            <span>Enregistrer la photo</span>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function AdminProfileDialog({
  isOpen,
  onOpenChange,
  currentUser,
  onUserUpdated,
}: AdminProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <AdminProfileDialogInner
          onClose={() => onOpenChange(false)}
          currentUser={currentUser}
          onUserUpdated={onUserUpdated}
        />
      )}
    </Dialog>
  );
}
