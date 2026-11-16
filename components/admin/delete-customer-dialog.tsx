'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminCustomer } from '@/lib/api/admin/customers';
import { ApiClientError } from '@/lib/api/client';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { id: string; name: string; email: string; totalOrders?: number } | null;
  /** Appelé après la suppression (ou l’anonymisation) réussie */
  onDeleted: (result: { anonymized: boolean }) => void;
}

/**
 * Confirmation de « Supprimer le client » (droit Clients › Supprimer). Le serveur efface le client s’il n’a
 * aucun historique, sinon il anonymise ses données personnelles et désactive son compte.
 */
export function DeleteCustomerDialog({ open, onOpenChange, customer, onDeleted }: DeleteCustomerDialogProps) {
  const [deleting, setDeleting] = useState(false);
  if (!customer) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      const { anonymized } = await deleteAdminCustomer(customer.id);
      toast.success(anonymized ? 'Client anonymisé' : 'Client supprimé', {
        description: anonymized
          ? `Les données personnelles de ${customer.name} ont été effacées et son compte désactivé ; l’historique des commandes est conservé.`
          : `${customer.name} et son compte ont été définitivement supprimés.`,
      });
      onOpenChange(false);
      onDeleted({ anonymized });
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Le client n’a pas pu être supprimé.');
    } finally {
      setDeleting(false);
    }
  };

  const orders = customer.totalOrders ?? 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !deleting && onOpenChange(false)}>
      <DialogContent className="grid-cols-1 sm:max-w-md bg-white border border-[#e7e4dd] p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold text-gray-900">Supprimer le client ?</DialogTitle>
              <DialogDescription className="text-xs text-gray-500 truncate">
                {customer.name} · {customer.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 text-sm text-gray-600">
          <p>S’il n’a aucun historique, son compte et sa fiche sont définitivement supprimés.</p>
          <p>
            S’il a des commandes, ses données personnelles sont anonymisées et son compte désactivé ; l’historique des
            commandes est conservé.
          </p>
          {orders > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {orders > 1 ? `Ce client a ${orders} commandes : il sera anonymisé.` : 'Ce client a 1 commande : il sera anonymisé.'}
            </p>
          )}
          <p className="text-xs text-gray-500">Cette action est irréversible.</p>
        </div>

        <DialogFooter className="-mx-6 -mb-6 px-6 rounded-b-2xl border-[#f0ede6] gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={deleting} className="border-[#e7e4dd]">
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Supprimer le client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
