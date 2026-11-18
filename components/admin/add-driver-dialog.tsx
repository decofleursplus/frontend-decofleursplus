'use client';

import { useState } from 'react';
import type { DeliveryDriver } from '@/lib/admin/mock-data/types';
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
import { UserPlus, Bike, Phone, Hash, ShieldCheck, Mail, Pencil, KeyRound, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { RequiredStar } from '@/components/ui/required-star';

export interface DriverFormValues {
  name: string;
  phone: string;
  vehicle: DeliveryDriver['vehicle'];
  vehiclePlate?: string;
  available: boolean;
  /** Email de connexion : crée l'accès à l'espace livreur (identifiants envoyés par email). */
  accountEmail?: string;
}

interface AddDriverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Livreur à modifier ; absent = création. */
  driver?: DeliveryDriver | null;
  /** Résout à true si l'API a enregistré le livreur (la fenêtre se ferme alors). */
  onSubmit: (values: DriverFormValues) => Promise<boolean>;
}

/** Création ou modification d'un livreur (fiche, véhicule, disponibilité et accès à l'espace livreur). */
export function AddDriverDialog({ isOpen, onOpenChange, driver, onSubmit }: AddDriverDialogProps) {
  const editing = Boolean(driver);
  const [name, setName] = useState(driver?.name ?? '');
  const [phone, setPhone] = useState(driver?.phone ?? '+221 ');
  const [vehicle, setVehicle] = useState<DeliveryDriver['vehicle']>(driver?.vehicle ?? 'Moto');
  const [vehiclePlate, setVehiclePlate] = useState(driver?.vehiclePlate ?? '');
  const [status, setStatus] = useState<DeliveryDriver['status']>(driver?.status === 'indisponible' ? 'indisponible' : 'disponible');
  const [accountEmail, setAccountEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return void toast.error('Le nom du livreur est requis');
    if (!phone.trim() || phone.trim() === '+221') return void toast.error('Le numéro de téléphone est requis');
    if (accountEmail.trim() && !/^\S+@\S+\.\S+$/.test(accountEmail.trim())) return void toast.error('Adresse email invalide');

    setSubmitting(true);
    const ok = await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      vehicle,
      vehiclePlate: vehiclePlate.trim() || undefined,
      available: status !== 'indisponible',
      accountEmail: accountEmail.trim() || undefined,
    });
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1e2a1f] flex items-center gap-2">
              {editing ? <Pencil className="h-5 w-5 text-[#c1647a]" /> : <UserPlus className="h-5 w-5 text-[#c1647a]" />}
              {editing ? `Modifier ${driver?.name}` : 'Ajouter un livreur'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {editing
                ? 'Coordonnées, véhicule et disponibilité du livreur.'
                : 'Enregistrez un nouveau coursier au sein de l’équipe de livraison Décofleur Plus.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="driver-name" className="font-semibold text-gray-700 block">
                Nom complet du coursier <RequiredStar /></label>
              <Input id="driver-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Abdoulaye Ndiaye" className="text-xs h-9 bg-white" required />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="driver-phone" className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                Numéro de téléphone <RequiredStar /></label>
              <Input id="driver-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" className="text-xs h-9 bg-white font-mono" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="driver-vehicle" className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 text-gray-400" />
                  Véhicule
                </label>
                <select
                  id="driver-vehicle"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value as DeliveryDriver['vehicle'])}
                  className="w-full h-9 rounded-md border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
                >
                  <option value="Moto">Moto</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Fourgonnette">Fourgonnette</option>
                  <option value="Voiture">Voiture</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="driver-plate" className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  Immatriculation
                </label>
                <Input id="driver-plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="Ex : DK-4820-BC" className="text-xs h-9 bg-white font-mono uppercase" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="driver-status" className="font-semibold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                Disponibilité
              </label>
              <select
                id="driver-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliveryDriver['status'])}
                className="w-full h-9 rounded-md border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
              >
                <option value="disponible">Disponible pour les courses</option>
                <option value="indisponible">Indisponible / En pause</option>
              </select>
            </div>

            {!editing && (
              <div className="space-y-1.5 rounded-lg border border-[#e7e4dd] bg-[#faf8f4] p-3">
                <label htmlFor="driver-email" className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  Email de connexion (accès à l’espace livreur)
                </label>
                <Input
                  id="driver-email"
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="livreur@exemple.com"
                  className="text-xs h-9 bg-white"
                />
                <p className="text-[11px] text-gray-500">
                  Facultatif. Le livreur reçoit par email son identifiant et un mot de passe temporaire, qu’il devra changer
                  à sa première connexion. Vous pourrez aussi lui donner l’accès plus tard depuis sa fiche.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-[#f0ede6] gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs border-[#e7e4dd]">
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold px-4">
              {editing ? 'Enregistrer les modifications' : 'Enregistrer le livreur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface DriverCredentials {
  email: string;
  temporaryPassword: string;
  emailSent?: boolean;
}

/** Identifiants affichés une seule fois après la création ou la réinitialisation de l'accès d'un livreur. */
export function DriverCredentialsDialog({
  credentials,
  driverName,
  onClose,
}: {
  credentials: DriverCredentials | null;
  driverName: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(credentials)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1e2a1f] flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#c1647a]" />
            Accès de {driverName}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Mot de passe temporaire : {driverName} devra le changer à sa première connexion. Il ne sera plus affiché ensuite.
          </DialogDescription>
        </DialogHeader>
        {credentials && (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
            <div>
              <span className="text-gray-500">Identifiant : </span>
              <strong className="font-mono">{credentials.email}</strong>
            </div>
            <div>
              <span className="text-gray-500">Mot de passe temporaire : </span>
              <strong className="font-mono select-all">{credentials.temporaryPassword}</strong>
            </div>
            <div>
              <span className="text-gray-500">Connexion : </span>
              <span className="font-mono">/admin/connexion</span>
            </div>
            <p className={credentials.emailSent ? 'text-emerald-700' : 'text-amber-700'}>
              {credentials.emailSent
                ? 'Ses identifiants lui ont été envoyés par email.'
                : 'L’email n’a pas pu être envoyé : transmettez-lui ces identifiants (WhatsApp, SMS…).'}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() =>
              credentials &&
              void navigator.clipboard
                ?.writeText(`Identifiant : ${credentials.email}\nMot de passe temporaire : ${credentials.temporaryPassword}`)
                .then(() => toast.success('Identifiants copiés'))
            }
          >
            <Copy className="h-3.5 w-3.5" /> Copier
          </Button>
          <Button onClick={onClose} className="bg-[#173f22] hover:bg-[#12311a] text-white text-xs">
            J’ai noté
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
