'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Send, ExternalLink, Loader2, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: AdminCustomer | { name: string; email: string; segment?: string } | null;
  defaultSubject?: string;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  customer,
  defaultSubject = '',
}: SendEmailDialogProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [sendCopy, setSendCopy] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage('');
      setIsSending(false);
    }
  }, [open, defaultSubject]);

  if (!customer) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const templates = [
    {
      title: 'Suivi de commande',
      subject: `Décofleur Plus — Mise à jour de votre commande`,
      body: `Bonjour ${customer.name},\n\nNous vous informons que votre commande chez Décofleur Plus est en cours de préparation par nos fleuristes.\n\nNous vous tiendrons informé dès que votre bouquet sera confié à notre livreur.\n\nCordialement,\nL'équipe Décofleur Plus`,
    },
    {
      title: 'Avantage fidélité',
      subject: `Décofleur Plus — Une attention particulière pour vous`,
      body: `Bonjour ${customer.name},\n\nToute l'équipe Décofleur Plus vous remercie pour votre fidélité.\n\nÀ cette occasion, nous avons le plaisir de vous offrir une réduction exclusive de 10% sur votre prochain bouquet avec le code PRIVILEGE10.\n\nÀ très bientôt,\nL'équipe Décofleur Plus`,
    },
    {
      title: 'Prise de contact',
      subject: `Votre demande auprès de Décofleur Plus`,
      body: `Bonjour ${customer.name},\n\nNous faisons suite à votre récent échange. N'hésitez pas à nous préciser votre besoin pour que nous puissions vous accompagner au mieux.\n\nBien chaleureusement,\nL'équipe Décofleur Plus`,
    },
  ];

  const handleApplyTemplate = (tpl: (typeof templates)[0]) => {
    setSubject(tpl.subject);
    setMessage(tpl.body);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Veuillez renseigner un objet pour le message.');
      return;
    }
    if (!message.trim()) {
      toast.error('Veuillez rédiger le contenu du message.');
      return;
    }

    setIsSending(true);

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false);
      toast.success('E-mail envoyé avec succès !', {
        description: `Votre message a été transmis à ${customer.name} (${customer.email}).`,
      });
      onOpenChange(false);
    }, 700);
  };

  const mailtoHref = `mailto:${customer.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border border-[#e7e4dd] p-6 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#24582d]">
            <div className="p-2 bg-[#edf8ef] rounded-xl text-[#24582d]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Envoyer un e-mail
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Rédigez et envoyez un message directement depuis le back-office.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Customer Mini Card */}
        <div className="flex items-center justify-between p-3 bg-[#faf8f4] border border-[#e7e4dd] rounded-xl my-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#e7e4dd]">
              <AvatarFallback className="bg-[#edf8ef] text-[#24582d] font-bold text-sm">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm text-[#1e2a1f]">{customer.name}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <span>{customer.email}</span>
              </div>
            </div>
          </div>
          {customer.segment && (
            <Badge
              className={
                customer.segment === 'vip'
                  ? 'bg-purple-100 text-purple-800 border-purple-200 text-xs'
                  : customer.segment === 'entreprise'
                  ? 'bg-amber-100 text-amber-800 text-xs'
                  : 'bg-blue-100 text-blue-800 text-xs'
              }
            >
              {customer.segment === 'vip' && <Star className="w-3 h-3 mr-1 fill-current" />}
              {customer.segment.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Quick Template Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#c1647a]" />
            Modèles rapides :
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="text-xs px-2.5 py-1 rounded-lg border border-[#e7e4dd] bg-white hover:bg-[#edf8ef] hover:border-[#24582d]/30 text-gray-700 transition-colors"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="space-y-4 pt-2 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="text-xs font-semibold text-gray-700">
              Objet du message <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email-subject"
              placeholder="Ex: Suivi de votre commande Décofleur Plus..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 text-sm h-10 w-full"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-body" className="text-xs font-semibold text-gray-700">
                Message <span className="text-red-500">*</span>
              </Label>
              <span className="text-[11px] text-gray-400">
                {message.length} caractères
              </span>
            </div>
            <textarea
              id="email-body"
              rows={5}
              placeholder="Rédigez votre message personnalisé ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#e7e4dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24582d]/20 transition-all resize-none min-h-[120px] box-border"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={sendCopy}
                onChange={(e) => setSendCopy(e.target.checked)}
                className="rounded border-[#e7e4dd] text-[#24582d] focus:ring-[#24582d]/20 accent-[#24582d]"
              />
              <span>M&apos;envoyer une copie en CCI (contact@decofleurplus.com)</span>
            </label>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-[#f0eee8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="border-[#e7e4dd] text-gray-600 py-4 px-6 hover:bg-gray-100"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              className="bg-[#24582d] hover:bg-[#1b4322] text-white! shadow-xs gap-2 py-4 px-6"
              style={{ backgroundColor: '#24582d', color: '#ffffff' }}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Envoyer l&apos;e-mail</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
