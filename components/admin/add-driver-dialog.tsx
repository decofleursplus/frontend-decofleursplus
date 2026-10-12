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
import { UserPlus, Bike, Phone, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AddDriverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDriver: (driver: DeliveryDriver) => void;
}

export function AddDriverDialog({
  isOpen,
  onOpenChange,
  onAddDriver,
}: AddDriverDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+221 ');
  const [vehicle, setVehicle] = useState<DeliveryDriver['vehicle']>('Moto');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [status, setStatus] = useState<DeliveryDriver['status']>('disponible');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom du livreur est requis');
      return;
    }
    if (!phone.trim() || phone.trim() === '+221') {
      toast.error('Le numéro de téléphone est requis');
      return;
    }

    const newDriver: DeliveryDriver = {
      id: `drv-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim(),
      vehicle,
      vehiclePlate: vehiclePlate.trim() || undefined,
      status,
      activeDeliveriesCount: 0,
      rating: 5.0,
      avatar: name
        .trim()
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };

    onAddDriver(newDriver);
    toast.success(`Livreur ${newDriver.name} ajouté à la flotte`);
    onOpenChange(false);

    // Reset form
    setName('');
    setPhone('+221 ');
    setVehicle('Moto');
    setVehiclePlate('');
    setStatus('disponible');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1e2a1f] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#c1647a]" />
              Ajouter un livreur
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Enregistrez un nouveau coursier au sein de l&apos;équipe de livraison Décofleur Plus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">
                Nom complet du coursier *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Abdoulaye Ndiaye"
                className="text-xs h-9 bg-white"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                Numéro de téléphone *
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="text-xs h-9 bg-white font-mono"
                required
              />
            </div>

            {/* Type de véhicule & Immatriculation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 text-gray-400" />
                  Véhicule
                </label>
                <select
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
                <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  Immatriculation
                </label>
                <Input
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="Ex: DK-4820-BC"
                  className="text-xs h-9 bg-white font-mono uppercase"
                />
              </div>
            </div>

            {/* Statut initial */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                Statut initial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliveryDriver['status'])}
                className="w-full h-9 rounded-md border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
              >
                <option value="disponible">Disponible pour les courses</option>
                <option value="indisponible">Indisponible / En pause</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-[#f0ede6] gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs border-[#e7e4dd]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold px-4"
            >
              Enregistrer le livreur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
