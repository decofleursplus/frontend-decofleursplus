'use client';

import Image from 'next/image';
import type { FinancialTransaction } from '@/lib/admin/mock-data/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Copy,
  Calendar,
  User,
  Phone,
  FileText,
  ShieldCheck,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: FinancialTransaction | null;
}

export function TransactionDetailDialog({
  isOpen,
  onOpenChange,
  transaction,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(val);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier`);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'wave':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 border border-cyan-200">
            <Image src="/payment/wave.png" alt="Wave" width={14} height={14} className="object-contain" />
            Wave Sénégal
          </span>
        );
      case 'orange_money':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800 border border-orange-200">
            <Image src="/payment/orange-money-black.svg" alt="Orange Money" width={16} height={16} className="object-contain" />
            Orange Money
          </span>
        );
      case 'carte_bancaire':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
            <Image src="/payment/visa.svg" alt="Visa" width={16} height={12} className="object-contain" />
            <Image src="/payment/mastercard.svg" alt="Mastercard" width={15} height={12} className="object-contain" />
            Carte Bancaire
          </span>
        );
      case 'especes':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
            Espèces à la livraison
          </span>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'encaisse':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
            Encaissé & Validé
          </Badge>
        );
      case 'en_attente':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
            En attente d'encaissement
          </Badge>
        );
      case 'rembourse':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200">
            Remboursé au client
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="pr-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-gray-900">
                {transaction.ref}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(transaction.ref, 'Référence transaction')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900 mt-1">
            Détail de la transaction financière
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Enregistrement d'audit bancaire et de trésorerie pour la commande associée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1 text-sm">
          {/* Card montant net */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/60">
              <span className="text-xs font-medium uppercase text-gray-500">
                Montant Brut Encaissé
              </span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(transaction.grossAmount)}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span>Frais passerelle / commission</span>
                <span className="rounded bg-gray-200 px-1 py-0.5 text-[10px] font-semibold text-gray-700">
                  {transaction.gatewayFeeRate > 0
                    ? `${(transaction.gatewayFeeRate * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <span className="font-medium text-rose-600">
                - {formatCurrency(transaction.gatewayFee)}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-200/60">
              <span className="text-xs font-semibold uppercase text-emerald-800">
                Net perçu en trésorerie
              </span>
              <span className="text-lg font-extrabold text-emerald-600">
                {formatCurrency(transaction.netAmount)}
              </span>
            </div>
          </div>

          {/* Informations Commande & Client */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-gray-100 p-2.5">
              <span className="block text-[11px] font-medium text-gray-500 mb-0.5">
                Commande liée
              </span>
              <div className="flex items-center justify-between font-medium text-xs text-gray-900">
                <span className="text-[#c1647a] font-semibold">{transaction.orderRef}</span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(transaction.orderRef, 'Référence commande')
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-2.5">
              <span className="block text-[11px] font-medium text-gray-500 mb-0.5">
                Passerelle / Mode
              </span>
              <div>{getMethodBadge(transaction.paymentMethod)}</div>
            </div>

            <div className="rounded-lg border border-gray-100 p-2.5">
              <span className="block text-[11px] font-medium text-gray-500 mb-0.5">
                Client donneur d'ordre
              </span>
              <div className="font-medium text-xs text-gray-900">{transaction.customerName}</div>
              <div className="text-[11px] text-gray-500">{transaction.customerPhone}</div>
            </div>

            <div className="rounded-lg border border-gray-100 p-2.5">
              <span className="block text-[11px] font-medium text-gray-500 mb-0.5">
                Réf Passerelle
              </span>
              <div className="font-mono text-[11px] font-semibold text-gray-800 truncate" title={transaction.gatewayRef}>
                {transaction.gatewayRef || 'Non applicable (Espèces)'}
              </div>
            </div>
          </div>

          {/* Dates & Traçabilité */}
          <div className="rounded-lg border border-gray-100 bg-white p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                Date de l'opération :
              </span>
              <span className="font-medium text-gray-800">
                {new Date(transaction.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {transaction.settlementDate && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Règlement effectif :
                </span>
                <span className="font-medium text-gray-800">
                  {new Date(transaction.settlementDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {transaction.notes && (
              <div className="border-t border-gray-100 pt-1.5 text-gray-600 text-[11px]">
                <span className="font-medium text-gray-700">Note comptable :</span>{' '}
                {transaction.notes}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
