'use client';

import { useState, useEffect } from 'react';
import type { AdminDelivery } from '@/lib/admin/mock-data/types';
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
import { CheckCircle2, User, Clock, MapPin, Package, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CompleteDeliveryDialogProps {
  delivery: AdminDelivery | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (deliveryId: string, recipientName: string, notes?: string) => void;
}

export function CompleteDeliveryDialog({
  delivery,
  isOpen,
  onOpenChange,
  onComplete,
}: CompleteDeliveryDialogProps) {
  const [recipientName, setRecipientName] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (delivery) {
      setRecipientName(delivery.customerName || '');
      setCompletionNotes('');

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    }
  }, [delivery]);

  if (!delivery) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error('Veuillez indiquer le nom de la personne ayant réceptionné le colis');
      return;
    }

    onComplete(delivery.id, recipientName.trim(), completionNotes.trim() || undefined);
    toast.success(`Livraison ${delivery.id} marquée comme terminée avec succès`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-6 [&_[data-slot=dialog-close]]:right-6 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-[#166534]" />
              Marquer la livraison comme terminée
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Validez la remise du colis et clôturez la course{' '}
              <span className="font-semibold text-gray-800">{delivery.id}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {/* Recap Card */}
            <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold text-gray-900">{delivery.customerName}</span>
                <span className="text-gray-500">{delivery.deliveryZone}</span>
              </div>
              <div className="flex items-start gap-1.5 text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{delivery.deliveryAddress}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 pt-1 border-t border-[#f0ede6]">
                <Package className="h-3.5 w-3.5 text-gray-400" />
                <span className="line-clamp-1">{delivery.itemsSummary}</span>
              </div>
            </div>

            {/* Recipient Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
                <User className="h-3.5 w-3.5 text-gray-400" />
                Nom de la personne ayant réceptionné *
              </label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Awa Diop (ou M. Diallo, gardien...)"
                className="text-xs h-10 bg-white"
                required
              />
              <p className="text-[11px] text-gray-400">
                Par défaut le nom du client, modifiable si remis à un proche ou gardien.
              </p>
            </div>

            {/* Auto timestamp */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-center justify-between text-[#166534]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-xs">Horodatage de fin de course</span>
              </div>
              <span className="font-mono font-bold text-xs">
                Aujourd&apos;hui à {currentTime}
              </span>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                Observation / Note de remise (optionnel)
              </label>
              <Input
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Ex: Remis en main propre, bouquet vérifié intact"
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
              type="submit"
              className="bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold h-10 px-5 gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmer la remise
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
