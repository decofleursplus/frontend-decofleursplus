'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface UserEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSave: (user: AdminUser) => void;
}

export function UserEditorDialog({
  isOpen,
  onOpenChange,
  user,
  onSave,
}: UserEditorDialogProps) {
  const isEditing = Boolean(user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRoleKey>('gestionnaire');
  const [status, setStatus] = useState<AdminUserStatus>('actif');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setRole(user.role);
      setStatus(user.status);
      setAvatar(user.avatar || '');
    } else {
      setName('');
      setEmail('');
      setPhone('+221 ');
      setRole('gestionnaire');
      setStatus('actif');
      setAvatar('');
    }
  }, [user, isOpen]);

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
    onOpenChange(false);
  };

  const selectedRoleDef = adminRolesList.find((r) => r.key === role);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto p-4 sm:p-6">
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

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nom & Avatar */}
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
              {adminRolesList.map((r) => {
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
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Créer le collaborateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
