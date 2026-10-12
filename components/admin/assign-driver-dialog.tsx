'use client';

import { useState, useEffect } from 'react';
import type { AdminDelivery, DeliveryDriver } from '@/lib/admin/mock-data/types';
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
import { Badge } from '@/components/ui/badge';
import { Truck, Bike, Clock, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AssignDriverDialogProps {
  delivery: AdminDelivery | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  drivers: DeliveryDriver[];
  onAssign: (deliveryId: string, driverId: string, timeSlot: string, notes?: string) => void;
}

export function AssignDriverDialog({
  delivery,
  isOpen,
  onOpenChange,
  drivers,
  onAssign,
}: AssignDriverDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  useEffect(() => {
    if (delivery) {
      setSelectedDriverId(delivery.driverId || '');
      setTimeSlot(delivery.timeSlot || '');
      setCustomNote(delivery.notes || '');
    }
  }, [delivery]);

  if (!delivery) return null;

  const handleConfirm = () => {
    if (!selectedDriverId) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }
    const chosenDriver = drivers.find((d) => d.id === selectedDriverId);
    onAssign(delivery.id, selectedDriverId, timeSlot, customNote);
    onOpenChange(false);
    toast.success(`Livraison assignée à ${chosenDriver?.name ?? 'Livreur'}`);
  };

  const getVehicleIcon = (vehicle: DeliveryDriver['vehicle']) => {
    switch (vehicle) {
      case 'Moto':
      case 'Scooter':
        return <Bike className="h-4 w-4" />;
      case 'Fourgonnette':
      case 'Voiture':
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-6 [&_[data-slot=dialog-close]]:right-6 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
            <Truck className="h-5 w-5 text-[#c1647a]" />
            Assigner un livreur
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs">
            Sélectionnez le livreur en charge d&apos;acheminer la livraison{' '}
            <span className="font-semibold text-gray-800">{delivery.id}</span> (Commande{' '}
            {delivery.orderRef}).
          </DialogDescription>
        </DialogHeader>

        {/* Delivery Recap Card */}
        <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-gray-900">{delivery.customerName}</span>
              <span className="text-gray-500">({delivery.customerPhone})</span>
            </div>
            <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none text-[11px] font-medium">
              {delivery.deliveryZone}
            </Badge>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{delivery.deliveryAddress}</span>
          </div>
          <div className="text-gray-500 text-[11px] pt-1 border-t border-[#f0ede6] flex justify-between">
            <span>Colis : {delivery.itemsSummary}</span>
            <span className="font-medium text-gray-700">{delivery.deliveryMode}</span>
          </div>
        </div>

        {/* Drivers List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 block">
            Choisir un livreur disponible
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {drivers.map((drv) => {
              const isSelected = selectedDriverId === drv.id;
              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(drv.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#c1647a] bg-[#fdf2f4]/60 shadow-xs ring-1 ring-[#c1647a]'
                      : 'border-[#e7e4dd] bg-white hover:bg-[#faf8f4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-[#c1647a] text-white'
                          : 'bg-[#f0ede6] text-gray-700'
                      }`}
                    >
                      {drv.avatar || drv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{drv.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1">
                          {getVehicleIcon(drv.vehicle)}
                          {drv.vehicle} {drv.vehiclePlate ? `(${drv.vehiclePlate})` : ''}
                        </span>
                        <span>•</span>
                        <span>{drv.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {drv.status === 'disponible' ? (
                      <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[10px] font-medium">
                        Disponible
                      </Badge>
                    ) : drv.status === 'en_course' ? (
                      <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none text-[10px] font-medium">
                        {drv.activeDeliveriesCount} en cours
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] font-medium">
                        Indisponible
                      </Badge>
                    )}

                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#c1647a] bg-[#c1647a] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time slot & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              Créneau horaire prévu
            </label>
            <Input
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="Ex: 14:30 - 15:30"
              className="text-xs h-10 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
              <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
              Consignes au livreur
            </label>
            <Input
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Appeler à l'arrivée..."
              className="text-xs h-10 bg-white"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-[#f0ede6] gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs h-10 px-4 border-[#e7e4dd]"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDriverId}
            className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5"
          >
            Confirmer l&apos;assignation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
