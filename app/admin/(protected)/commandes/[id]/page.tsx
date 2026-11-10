'use client';

import { use, useState, useEffect } from 'react';
import type { AdminOrder } from '@/lib/admin/mock-data/types';
import { getAdminOrderById, updateAdminOrderStatus } from '@/lib/api/admin/orders';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Truck, MapPin, CreditCard, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await getAdminOrderById(id);
        if (active) setOrder(found);
      } catch (err) {
        if (active) {
          setOrder(null);
          const msg = err instanceof ApiClientError ? err.message : 'Erreur lors du chargement de la commande';
          toast.error(msg);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSetInDelivery = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateAdminOrderStatus(order.id, { status: 'en_livraison' });
      setOrder(updated);
      toast.success('Commande passée en livraison avec succès !');
    } catch {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#c1647a]" />
        <p className="text-gray-500 text-sm">Chargement de la commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">Commande introuvable</h1>
        <p className="text-gray-500 mt-2">La commande demandée n&apos;existe pas.</p>
        <Button render={<Link href="/admin/commandes" />} variant="cta" className="mt-6 bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs">
          Retour aux commandes
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_preparation':
        return <Badge className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
      case 'en_livraison':
        return <Badge className="bg-blue-100 text-blue-800">En livraison</Badge>;
      case 'livree':
        return <Badge className="bg-green-100 text-green-800">Livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      case 'remboursee':
        return <Badge className="bg-gray-100 text-gray-800">Remboursée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white/90 rounded-2xl shadow-sm backdrop-blur-sm relative z-10" style={{
      backgroundImage: 'url(/images/floral-bg.jpg)',
      backgroundBlendMode: 'overlay',
      backgroundSize: '400px',
      backgroundRepeat: 'repeat',
      backgroundColor: 'rgba(255, 255, 255, 0.95)'
    }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Button variant="outline" size="icon" render={<Link href="/admin/commandes" />} className="h-9 w-9 rounded-xl border-[#e7e4dd] shrink-0 mt-0.5 sm:mt-0">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-[#1e2a1f]">Commande {order.ref}</h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none border-[#e7e4dd] text-gray-600 text-xs sm:text-sm"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Imprimer
          </Button>
          {order.status !== 'en_livraison' && order.status !== 'livree' && (
            <Button
              variant="cta"
              onClick={handleSetInDelivery}
              disabled={updating}
              className="flex-1 sm:flex-none bg-[#c1647a] hover:bg-[#a9576a] !text-white shadow-xs text-xs sm:text-sm"
            >
              {updating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-white" /> : <Truck className="mr-1.5 h-3.5 w-3.5 text-white" />}
              Mettre en livraison
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base text-[#1e2a1f]">Articles de la commande</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-[#f0eee8] pb-4 last:border-0 last:pb-0 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-[10px] text-gray-400">Pas d&apos;image</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-[#1e2a1f] truncate max-w-[140px] sm:max-w-none">{item.productName}</div>
                        <div className="text-[11px] sm:text-xs text-gray-500">{formatCurrency(item.unitPrice)} × {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-[#1e2a1f] shrink-0 text-right ml-2">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f]">Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium text-[#1e2a1f]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span className="font-medium text-[#1e2a1f]">
                    {order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'Gratuit'}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#f0eee8] flex justify-between">
                  <span className="font-medium text-[#1e2a1f]">Total</span>
                  <span className="font-bold text-[#24582d] text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f] flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-400" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-[#1e2a1f]">{order.customerName}</div>
              <Link href={`/admin/clients/${order.customerId}`} className="text-sm text-blue-600 hover:underline">
                Voir le profil
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f] flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Mode</div>
                <div className="text-gray-600">{order.deliveryMode}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Adresse</div>
                <div className="text-gray-600">{order.deliveryAddress}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e2a1f] flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
                Moyen de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">{order.paymentMethod}</div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e2a1f]">Notes de commande</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 italic bg-[#faf8f4] p-3 rounded-md border border-[#e7e4dd]">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
