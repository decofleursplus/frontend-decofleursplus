'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Wand2,
} from 'lucide-react';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';
import { ApiClientError } from '@/lib/api/client';
import {
  createAdminStaffUser,
  updateAdminStaffUser,
  type CreatedStaffUser,
  type RoleDefinition,
  type StaffRole,
  type StaffStatus,
  type StaffUser,
} from '@/lib/api/admin/settings';

const MIN_PASSWORD_LENGTH = 8;

/** Mot de passe aléatoire lisible (sans caractères ambigus), avec majuscule, minuscule, chiffre et symbole. */
export function generateInitialPassword(length = 12): string {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '#@%+=!?'];
  const all = sets.join('');
  const random = (max: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  };
  const chars = sets.map((set) => set[random(set.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) return 'Seul un administrateur peut gérer les collaborateurs.';
    const details = error.details?.map((d) => d.message).filter(Boolean) ?? [];
    return details.length > 0 ? `${error.message} : ${details.join(' ; ')}` : error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

interface UserEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = création */
  user: StaffUser | null;
  /** Rôles proposés (lus depuis GET /admin/roles) ; les livreurs sont gérés dans le module Livraisons. */
  roles: RoleDefinition[];
  /** Le collaborateur édité est l'utilisateur connecté : rôle et statut verrouillés. */
  isSelf: boolean;
  /** Appelé uniquement après réponse positive de l'API, avec l'objet renvoyé par le serveur. */
  onSaved: (user: StaffUser | CreatedStaffUser, initialPassword: string | null) => void;
}

function UserEditorForm({
  user,
  roles,
  isSelf,
  onSaved,
  onCancel,
}: Omit<UserEditorDialogProps, 'isOpen' | 'onOpenChange'> & { onCancel: () => void }) {
  const isEditing = Boolean(user);
  const assignableRoles = roles.filter((r) => r.role !== 'DELIVERY');

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<StaffRole>(user?.role ?? 'MANAGER');
  const [status, setStatus] = useState<StaffStatus>(user?.status ?? 'actif');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [password, setPassword] = useState(() => (isEditing ? '' : generateInitialPassword()));
  const [showPassword, setShowPassword] = useState(!isEditing);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      toast.error('Format non supporté. Choisissez une image JPEG, PNG, WebP ou AVIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const urls = await uploadAdminMedia([file], 'products');
      setAvatar(urls[0]);
    } catch (err) {
      toast.error(errorMessage(err, 'Erreur lors du téléversement de la photo.'));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localErrors: Record<string, string> = {};
    if (firstName.trim().length === 0) localErrors.firstName = 'Le prénom est obligatoire.';
    if (!isEditing && !/^\S+@\S+\.\S+$/.test(email.trim())) localErrors.email = 'Adresse email invalide.';
    if (!isEditing && password.length < MIN_PASSWORD_LENGTH) {
      localErrors.password = `Le mot de passe initial doit comporter au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    if (isEditing && password.length > 0 && password.length < MIN_PASSWORD_LENGTH) {
      localErrors.password = `Le nouveau mot de passe doit comporter au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setSaving(true);
    try {
      if (user) {
        const updated = await updateAdminStaffUser(user.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          avatar: avatar || null,
          ...(isSelf ? {} : { role, status }),
          ...(password ? { password } : {}),
        });
        onSaved(updated, password || null);
      } else {
        const created = await createAdminStaffUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          role,
          password,
          avatar: avatar || null,
        });
        onSaved(created, password);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
      }
      toast.error(errorMessage(err, 'Le collaborateur n’a pas pu être enregistré.'));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-[11px] font-medium text-rose-600">{errors[key]}</p> : null;

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'ST';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2" noValidate>
      {/* Photo */}
      <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/60">
        <div className="relative shrink-0">
          <Avatar className="h-14 w-14 ring-2 ring-[#c1647a]/20 shadow-xs">
            <AvatarImage src={avatar || undefined} alt={firstName || 'Collaborateur'} className="object-cover" />
            <AvatarFallback className="bg-[#102617] text-white text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
          {isUploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs font-semibold text-gray-700 block">Photo du collaborateur</Label>
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
              className="h-8 text-xs gap-1.5 border-gray-200 hover:bg-white"
            >
              <Upload size={13} />
              <span>{avatar ? 'Changer la photo' : 'Choisir une photo'}</span>
            </Button>
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAvatar('')}
                disabled={isUploadingAvatar}
                className="h-8 text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <Trash2 size={13} />
                <span>Retirer</span>
              </Button>
            )}
          </div>
          <p className="text-[10.5px] text-gray-400">Facultatif — JPEG, PNG, WebP ou AVIF, 5 Mo max.</p>
        </div>
      </div>

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="userFirstName" className="text-xs font-semibold text-gray-700">
            Prénom <span className="text-[#c1647a]">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="userFirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex. Aïssatou"
              className="pl-9 text-xs h-9"
            />
          </div>
          {fieldError('firstName')}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="userLastName" className="text-xs font-semibold text-gray-700">
            Nom
          </Label>
          <Input
            id="userLastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ex. Ba"
            className="text-xs h-9"
          />
          {fieldError('lastName')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="userEmail" className="text-xs font-semibold text-gray-700">
            Email de connexion {!isEditing && <span className="text-[#c1647a]">*</span>}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="userEmail"
              type="email"
              value={email}
              disabled={isEditing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@decofleurplus.sn"
              className="pl-9 text-xs h-9"
            />
          </div>
          {isEditing && <p className="text-[10.5px] text-gray-400">L’adresse de connexion n’est pas modifiable.</p>}
          {fieldError('email')}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="userPhone" className="text-xs font-semibold text-gray-700">
            Téléphone
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
          {fieldError('phone')}
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5 rounded-xl border border-gray-200 p-3">
        <Label htmlFor="userPassword" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-gray-400" />
          {isEditing ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe initial'}
          {!isEditing && <span className="text-[#c1647a]">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="userPassword"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Laisser vide pour ne pas changer' : ''}
              autoComplete="new-password"
              className="text-xs h-9 pr-9 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPassword(generateInitialPassword());
              setShowPassword(true);
            }}
            className="h-9 text-xs gap-1.5"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Générer
          </Button>
        </div>
        {fieldError('password')}
        <p className="text-[10.5px] text-gray-500">
          {isEditing
            ? `Au moins ${MIN_PASSWORD_LENGTH} caractères. Il vous sera affiché une fois enregistré, pour le transmettre au collaborateur.`
            : `Au moins ${MIN_PASSWORD_LENGTH} caractères. Il vous sera réaffiché après la création pour que vous le transmettiez au collaborateur : il ne figure pas dans l’email d’invitation.`}
        </p>
      </div>

      {/* Rôle */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          Rôle <span className="text-[#c1647a]">*</span>
        </Label>
        {isSelf && (
          <p className="text-[11px] text-amber-700">Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.</p>
        )}
        <div className="grid grid-cols-1 gap-2 pt-1" role="radiogroup" aria-label="Rôle">
          {assignableRoles.map((r) => {
            const isSelected = role === r.role;
            return (
              <button
                type="button"
                key={r.key}
                role="radio"
                aria-checked={isSelected}
                disabled={isSelf}
                onClick={() => setRole(r.role)}
                className={`flex items-start justify-between rounded-lg border p-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected ? 'border-[#c1647a] bg-pink-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs text-gray-900">{r.label}</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{r.description}</p>
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-[#c1647a] shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
        {fieldError('role')}
        <p className="text-[10.5px] text-gray-400 italic pt-0.5">
          Les comptes livreurs se créent dans le module Livraisons, avec leur fiche livreur.
        </p>
      </div>

      {/* Statut (édition uniquement : un compte est créé actif) */}
      {isEditing && (
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-semibold text-gray-700">Statut du compte</Label>
          <div className="flex items-center gap-3">
            {(
              [
                { key: 'actif', label: 'Actif', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { key: 'inactif', label: 'Inactif (connexion bloquée)', color: 'text-gray-600 bg-gray-50 border-gray-200' },
              ] as const
            ).map((st) => (
              <label
                key={st.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                  isSelf ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${status === st.key ? `${st.color} ring-1 ring-[#c1647a]` : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="status"
                  checked={status === st.key}
                  disabled={isSelf}
                  onChange={() => setStatus(st.key)}
                  className="sr-only"
                />
                {st.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <DialogFooter className="pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isUploadingAvatar || saving}
          className="bg-[#c1647a] hover:bg-[#a84d63] text-white gap-1.5"
        >
          {(saving || isUploadingAvatar) && <Loader2 size={14} className="animate-spin" />}
          {isUploadingAvatar
            ? 'Téléversement…'
            : saving
              ? 'Enregistrement…'
              : isEditing
                ? 'Enregistrer les modifications'
                : 'Créer le collaborateur'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserEditorDialog({ isOpen, onOpenChange, user, roles, isSelf, onSaved }: UserEditorDialogProps) {
  const isEditing = Boolean(user);
  // Recrée le formulaire à chaque ouverture (nouveau mot de passe généré, champs réinitialisés)
  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setFormKey((k) => k + 1);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[540px] max-h-[calc(100vh-3rem)] overflow-y-auto p-4 sm:p-6">
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
                  ? 'Profil, rôle, statut et mot de passe du compte.'
                  : 'Le collaborateur reçoit un email d’invitation avec son identifiant et le lien de connexion.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <UserEditorForm
            key={`${user?.id ?? 'new'}-${formKey}`}
            user={user}
            roles={roles}
            isSelf={isSelf}
            onSaved={(saved, password) => {
              onSaved(saved, password);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
