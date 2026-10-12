'use client';

import type { AdminDelivery, DeliveryStatus } from '@/lib/admin/mock-data/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Printer,
  Bike,
  Package,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DeliveryDetailSheetProps {
  delivery: AdminDelivery | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (deliveryId: string, newStatus: DeliveryStatus) => void;
  onOpenAssignDriver: (delivery: AdminDelivery) => void;
  onOpenComplete?: (delivery: AdminDelivery) => void;
}

export function DeliveryDetailSheet({
  delivery,
  isOpen,
  onOpenChange,
  onStatusChange,
  onOpenAssignDriver,
  onOpenComplete,
}: DeliveryDetailSheetProps) {
  if (!delivery) return null;

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'a_livrer':
        return (
          <Badge className="bg-[#fff8cc] text-[#9a7b00] border-none font-medium text-xs">
            À livrer
          </Badge>
        );
      case 'en_cours':
        return (
          <Badge className="bg-[#e5eaff] text-[#3d5a99] border-none font-medium text-xs">
            En cours d&apos;acheminement
          </Badge>
        );
      case 'livree':
        return (
          <Badge className="bg-[#dcfce7] text-[#166534] border-none font-medium text-xs">
            Livrée avec succès
          </Badge>
        );
      case 'echec':
        return (
          <Badge className="bg-[#ffe5e5] text-[#cc0000] border-none font-medium text-xs">
            Échec de livraison
          </Badge>
        );
    }
  };

  const handlePrint = () => {
    toast.success(`Impression du bon de livraison ${delivery.id}...`);
    window.print();
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    delivery.deliveryAddress
  )}`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-[#e7e4dd] bg-[#faf8f4]/60">
          <SheetHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#1e2a1f] bg-white px-2.5 py-1 rounded-lg border border-[#e7e4dd]">
                  {delivery.id}
                </span>
                {getStatusBadge(delivery.status)}
              </div>
              <Badge className="bg-white text-gray-700 border border-[#e7e4dd] text-xs font-normal">
                {delivery.deliveryMode}
              </Badge>
            </div>

            <SheetTitle className="text-xl font-bold text-[#1e2a1f]">
              Détails de la livraison
            </SheetTitle>
            <SheetDescription className="text-xs text-gray-500">
              Commande associée :{' '}
              <Link
                href={`/admin/commandes`}
                className="text-[#c1647a] hover:underline font-semibold"
              >
                {delivery.orderRef}
              </Link>{' '}
              • Programmée le {delivery.scheduledDate} ({delivery.timeSlot})
            </SheetDescription>
          </SheetHeader>

          {/* Quick Action Buttons Bar */}
          <div className="mt-4 pt-3 border-t border-[#e7e4dd] flex flex-wrap items-center gap-2">
            {delivery.status === 'a_livrer' && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    if (onOpenComplete) {
                      onOpenComplete(delivery);
                    } else {
                      onStatusChange(delivery.id, 'livree');
                      toast.success('Livraison marquée comme terminée');
                    }
                  }}
                  className="bg-[#166534] hover:bg-[#14532d] text-white text-xs h-8 font-medium gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Marquer comme livrée
                </Button>
                {delivery.driverId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onStatusChange(delivery.id, 'en_cours');
                      toast.success('Course passée en cours d’acheminement');
                    }}
                    className="text-xs h-8 border-[#3d5a99]/30 text-[#3d5a99] hover:bg-[#e5eaff]/50 gap-1.5 font-medium"
                  >
                    <Truck className="h-3.5 w-3.5 text-[#3d5a99]" />
                    Démarrer la course
                  </Button>
                )}
              </>
            )}

            {delivery.status === 'en_cours' && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    if (onOpenComplete) {
                      onOpenComplete(delivery);
                    } else {
                      onStatusChange(delivery.id, 'livree');
                      toast.success('Livraison validée avec succès');
                    }
                  }}
                  className="bg-[#166534] hover:bg-[#14532d] text-white text-xs h-8 font-medium gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Marquer comme livrée
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onStatusChange(delivery.id, 'echec');
                    toast.error('Livraison marquée en échec');
                  }}
                  className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Signaler un échec
                </Button>
              </>
            )}

            {delivery.status === 'echec' && (
              <Button
                size="sm"
                onClick={() => {
                  onStatusChange(delivery.id, 'a_livrer');
                  toast.info('Livraison replanifiée');
                }}
                className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs h-8 font-medium gap-1.5"
              >
                Replanifier la livraison
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs h-8 border-[#e7e4dd] text-gray-700 hover:bg-[#faf8f4] gap-1.5 ml-auto"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer bon
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Tracking Stepper */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Suivi en temps réel
            </h4>
            <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-4 space-y-3">
              {(delivery.trackingSteps || [
                { step: 'preparation', label: 'Commande préparée en boutique', completed: true },
                { step: 'prise_en_charge', label: 'Prise en charge livreur', completed: delivery.status !== 'a_livrer' },
                { step: 'en_acheminement', label: 'En cours d’acheminement', completed: delivery.status === 'en_cours' || delivery.status === 'livree' },
                { step: 'livre', label: 'Remis au destinataire', completed: delivery.status === 'livree' },
              ]).map((st, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx < 3 && (
                    <div
                      className={`absolute left-3.5 top-6 w-0.5 h-6 ${
                        st.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      st.completed
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {st.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 pt-1 flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        st.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {st.label}
                    </span>
                    {st.time && (
                      <span className="text-[11px] text-gray-400 font-mono">
                        {st.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient & Location Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Destinataire & Emplacement
            </h4>
            <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-bold text-sm text-gray-900">
                      {delivery.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 pl-6">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <a
                      href={`tel:${delivery.customerPhone}`}
                      className="text-[#c1647a] hover:underline font-medium"
                    >
                      {delivery.customerPhone}
                    </a>
                  </div>
                </div>
                <Badge className="bg-[#fdf2f4] text-[#c1647a] border-none font-medium">
                  {delivery.deliveryZone}
                </Badge>
              </div>

              <div className="pt-2 border-t border-[#f0ede6] space-y-2">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{delivery.deliveryAddress}</p>
                </div>
                <div className="pl-6 pt-1">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Ouvrir l&apos;itinéraire sur Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Driver */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Livreur assigné
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAssignDriver(delivery)}
                className="text-xs text-[#c1647a] hover:text-[#a85266] p-0 h-auto font-medium"
              >
                {delivery.driverId ? 'Modifier' : 'Assigner'}
              </Button>
            </div>

            {delivery.driverId ? (
              <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#fdf2f4] text-[#c1647a] font-bold flex items-center justify-center text-sm border border-[#f0dde2]">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{delivery.driverName}</h5>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {delivery.driverVehicle || 'Moto'} • {delivery.driverPhone}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${delivery.driverPhone}`}
                  className="p-2 rounded-lg border border-[#e7e4dd] text-gray-600 hover:bg-[#faf8f4] transition-colors"
                  title="Appeler le livreur"
                >
                  <Phone className="h-4 w-4 text-[#c1647a]" />
                </a>
              </div>
            ) : (
              <div className="bg-[#fff8cc]/40 border border-[#fff099] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#9a7b00]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Aucun livreur n&apos;a encore été affecté à cette livraison.</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onOpenAssignDriver(delivery)}
                  className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs h-7 font-medium shrink-0"
                >
                  Assigner
                </Button>
              </div>
            )}
          </div>

          {/* Package & Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Détails du colis & Horaire
            </h4>
            <div className="bg-white border border-[#e7e4dd] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Articles :</span>
                  <span className="text-gray-900 font-semibold">{delivery.itemsSummary}</span>
                </div>
                <span className="font-mono font-bold text-gray-900">
                  {delivery.deliveryFee > 0
                    ? `${delivery.deliveryFee.toLocaleString('fr-FR')} FCFA`
                    : 'Offerte'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#f0ede6] flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Date : {delivery.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-800">{delivery.timeSlot}</span>
                </div>
              </div>

              {delivery.deliveredAt && (
                <div className="pt-2 border-t border-[#f0ede6] text-green-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>
                    Livraison effectuée le {delivery.deliveredAt}
                    {delivery.recipientName ? ` (Réceptionnée par ${delivery.recipientName})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Instructions */}
          {delivery.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Consignes de livraison
              </h4>
              <div className="bg-[#fcfaf7] border border-[#e7e4dd] rounded-xl p-3 text-gray-700 leading-relaxed italic">
                &ldquo;{delivery.notes}&rdquo;
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
