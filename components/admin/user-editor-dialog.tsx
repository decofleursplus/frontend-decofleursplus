'use client';

import { useState, useRef } from 'react';
import type { AdminUser, AdminRoleKey, AdminUserStatus } from '@/lib/admin/mock-data/types';
import { adminRolesList } from '@/lib/admin/mock-data/settings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, Upload, Trash2, Loader2 } from 'lucide-react';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';

interface UserEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSave: (user: AdminUser) => void;
}

function UserEditorForm({
  user,
  onSave,
  onCancel,
}: {
  user: AdminUser | null;
  onSave: (user: AdminUser) => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+221 ');
  const [role, setRole] = useState<AdminRoleKey>(user?.role || 'gestionnaire');
  const [status, setStatus] = useState<AdminUserStatus>(user?.status || 'actif');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      toast.error('Format non supporté. Veuillez choisir une image (JPEG, PNG, WebP, AVIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const urls = await uploadAdminMedia([file], 'products');
      if (urls[0]) {
        setAvatar(urls[0]);
        toast.success('Photo du collaborateur téléversée avec succès.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du téléversement de la photo.';
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Photo retirée.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez renseigner le nom complet du collaborateur.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Veuillez renseigner une adresse email valide.');
      return;
    }

    const updatedUser: AdminUser = {
      id: user ? user.id : `USR-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '+221 77 000 00 00',
      role,
      status,
      avatar: avatar.trim() || undefined,
      lastLogin: user?.lastLogin,
      createdAt: user?.createdAt || new Date().toISOString(),
    };

    onSave(updatedUser);
    toast.success(
      isEditing
        ? `Le collaborateur ${updatedUser.name} a été mis à jour.`
        : `Le collaborateur ${updatedUser.name} a été créé avec succès.`
    );
  };

  const selectedRoleDef = adminRolesList.find((r) => r.key === role);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Avatar / Photo de profil du collaborateur */}
      <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/60">
        <div className="relative shrink-0">
          <Avatar className="h-14 w-14 ring-2 ring-[#c1647a]/20 shadow-xs">
            <AvatarImage src={avatar || undefined} alt={name || 'Collaborateur'} className="object-cover" />
            <AvatarFallback className="bg-[#102617] text-white text-sm font-bold">
              {name
                ? name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'ST'}
            </AvatarFallback>
          </Avatar>
          {isUploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <Label className="text-xs font-semibold text-gray-700 block">
            Photo du collaborateur
          </Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleAvatarFileChange}
              className="hidden"
              disabled={isUploadingAvatar}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="h-8 text-xs gap-1.5 border-gray-200 hover:bg-white cursor-pointer"
            >
              <Upload size={13} />
              <span>{avatar ? 'Changer la photo' : 'Choisir une photo'}</span>
            </Button>

            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="h-8 text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Retirer</span>
              </Button>
            )}
          </div>
          <p className="text-[10.5px] text-gray-400">JPEG, PNG, WebP ou AVIF, max 5 Mo</p>
        </div>
      </div>

      {/* Nom complet */}
      <div className="space-y-1.5">
        <Label htmlFor="userName" className="text-xs font-semibold text-gray-700">
          Prénom et Nom <span className="text-[#c1647a]">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Aïssatou Ba"
            className="pl-9 text-xs h-9"
            required
          />
        </div>
      </div>

      {/* Email & Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="userEmail" className="text-xs font-semibold text-gray-700">
            Email professionnel <span className="text-[#c1647a]">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="userEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@decofleurplus.sn"
              className="pl-9 text-xs h-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="userPhone" className="text-xs font-semibold text-gray-700">
            Téléphone mobile
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="userPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221 77 123 45 67"
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Sélection du rôle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-gray-700">
            Rôle & Attributions <span className="text-[#c1647a]">*</span>
          </Label>
          {selectedRoleDef && (
            <Badge className={selectedRoleDef.badgeClass}>{selectedRoleDef.label}</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {adminRolesList
            .filter((r) => r.key !== 'livreur')
            .map((r) => {
              const isSelected = role === r.key;
              return (
                <div
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`flex items-start justify-between rounded-lg border p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#c1647a] bg-pink-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-900">{r.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-[#c1647a] shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
        </div>
        <p className="text-[10.5px] text-gray-400 italic pt-0.5">
          Note : Les livreurs et coursiers sont gérés directement dans le module Livraisons.
        </p>
      </div>

      {/* Statut du compte */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-semibold text-gray-700">Statut du compte</Label>
        <div className="flex items-center gap-3">
          {[
            { key: 'actif', label: 'Actif', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { key: 'inactif', label: 'Inactif', color: 'text-gray-600 bg-gray-50 border-gray-200' },
            { key: 'en_attente', label: 'En attente', color: 'text-amber-700 bg-amber-50 border-amber-200' },
          ].map((st) => (
            <label
              key={st.key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                status === st.key
                  ? `${st.color} ring-1 ring-[#c1647a]`
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="status"
                checked={status === st.key}
                onChange={() => setStatus(st.key as AdminUserStatus)}
                className="sr-only"
              />
              {st.label}
            </label>
          ))}
        </div>
      </div>

      <DialogFooter className="pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isUploadingAvatar}
          className="bg-[#c1647a] hover:bg-[#a84d63] text-white cursor-pointer"
        >
          {isUploadingAvatar ? (
            <>
              <Loader2 size={14} className="animate-spin mr-1.5" />
              <span>Téléversement...</span>
            </>
          ) : isEditing ? (
            'Enregistrer les modifications'
          ) : (
            'Créer le collaborateur'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserEditorDialog({
  isOpen,
  onOpenChange,
  user,
  onSave,
}: UserEditorDialogProps) {
  const isEditing = Boolean(user);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#c1647a]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {isEditing ? 'Modifier le collaborateur' : 'Ajouter un collaborateur'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isEditing
                  ? 'Modifiez les informations d’accès et les autorisations de ce compte.'
                  : 'Créez un nouveau compte avec attribution de rôle pour l’équipe Décofleur Plus.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <UserEditorForm
            key={user?.id || 'new-user'}
            user={user}
            onSave={(savedUser) => {
              onSave(savedUser);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
