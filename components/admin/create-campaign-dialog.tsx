'use client';

import { useState } from 'react';
import type { AdminCampaign, CampaignChannel } from '@/lib/admin/mock-data/types';
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
import {
  Megaphone,
  Smartphone,
  Mail,
  Users,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { WhatsAppColorIcon } from '@/components/icons';
import { toast } from 'sonner';

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (campaign: AdminCampaign) => void;
}

const audiences = [
  { label: 'Tous les clients', count: 1240 },
  { label: 'Clients VIP Décofleur Gold', count: 180 },
  { label: 'Clients fidèles réguliers', count: 520 },
  { label: 'Clients inactifs depuis > 30 jours', count: 340 },
  { label: 'Zone Saly & Mbour uniquement', count: 680 },
];

export function CreateCampaignDialog({
  isOpen,
  onOpenChange,
  onCreate,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('whatsapp');
  const [selectedAudience, setSelectedAudience] = useState(audiences[0].label);
  const [scheduleMode, setScheduleMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [message, setMessage] = useState(
    'Bonjour {prenom} 🌸 Décofleur Plus vous gâte : profitez de -15% sur toutes nos créations avec le code {code_promo} ! Découvrez notre boutique : {lien_boutique}'
  );

  const currentAudienceCount =
    audiences.find((a) => a.label === selectedAudience)?.count || 1240;

  const insertVariable = (variable: string) => {
    setMessage((prev) => `${prev} ${variable}`);
  };

  const getPreviewText = () => {
    return message
      .replace(/{prenom}/g, 'Awa')
      .replace(/{code_promo}/g, 'PRINTEMPS15')
      .replace(/{lien_boutique}/g, 'decofleurplus.sn');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez renseigner le nom de la campagne');
      return;
    }

    if (!message.trim()) {
      toast.error('Veuillez rédiger le contenu du message');
      return;
    }

    const nowFormatted = `Aujourd'hui à ${new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newCampaign: AdminCampaign = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      channel,
      audience: `${selectedAudience} (${currentAudienceCount} contacts)`,
      recipientCount: currentAudienceCount,
      sentAt: scheduleMode === 'immediate' ? nowFormatted : undefined,
      scheduledAt: scheduleMode === 'scheduled' ? scheduledDateTime : undefined,
      status: scheduleMode === 'immediate' ? 'envoyee' : 'programmee',
      openRate: scheduleMode === 'immediate' ? (channel === 'whatsapp' ? 95.0 : 88.0) : 0,
      clickRate: scheduleMode === 'immediate' ? 32.5 : 0,
      conversionCount: 0,
      revenueGenerated: 0,
      messageContent: message.trim(),
    };

    onCreate(newCampaign);
    if (scheduleMode === 'immediate') {
      toast.success(
        `Campagne ${channel.toUpperCase()} envoyée à ${currentAudienceCount} contacts !`
      );
    } else {
      toast.success(
        `Campagne ${channel.toUpperCase()} programmée pour le ${scheduledDateTime} !`
      );
    }
    onOpenChange(false);

    // Reset
    setName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 custom-modal-scroll [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 sm:[&_[data-slot=dialog-close]]:top-8 sm:[&_[data-slot=dialog-close]]:right-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-xl font-bold text-[#1e2a1f] flex items-center gap-2.5">
              <Megaphone className="h-5 w-5 text-[#c1647a]" />
              Créer une campagne marketing
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Diffusez vos annonces et offres promotionnelles via WhatsApp, SMS ou Email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 text-xs">
            {/* Nom */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Nom de la campagne *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Saint-Valentin 2024, Vente Flash Roses"
                className="text-xs h-10 bg-white"
                required
              />
            </div>

            {/* Canal */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Canal de diffusion *</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    channel === 'whatsapp'
                      ? 'border-[#25D366] bg-[#dcfce7] text-[#166534] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <WhatsAppColorIcon size={22} className="shrink-0" />
                  <span className="text-xs font-semibold whitespace-nowrap">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    channel === 'sms'
                      ? 'border-[#3d5a99] bg-[#e5eaff] text-[#3d5a99] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Smartphone className="h-4 w-4 text-[#3d5a99]" />
                  <span className="text-xs font-semibold whitespace-nowrap">SMS Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    channel === 'email'
                      ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a] font-bold shadow-xs'
                      : 'border-[#e7e4dd] bg-white text-gray-600 hover:bg-[#faf8f4]'
                  }`}
                >
                  <Mail className="h-4 w-4 text-[#c1647a]" />
                  <span className="text-xs font-semibold whitespace-nowrap">Email</span>
                </button>
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-xs flex items-center justify-between whitespace-nowrap">
                <span>Audience ciblée</span>
                <span className="text-gray-400 font-normal">
                  {currentAudienceCount.toLocaleString('fr-FR')} destinataires
                </span>
              </Label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
              >
                {audiences.map((aud) => (
                  <option key={aud.label} value={aud.label}>
                    {aud.label} ({aud.count} contacts)
                  </option>
                ))}
              </select>
            </div>

            {/* Message & Variables */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Contenu du message *</Label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-400">Insérer variable :</span>
                  <button
                    type="button"
                    onClick={() => insertVariable('{prenom}')}
                    className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {'{prenom}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{code_promo}')}
                    className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {'{code_promo}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{lien_boutique}')}
                    className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {'{lien_boutique}'}
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-[#e7e4dd] p-3 text-xs bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#c1647a] custom-modal-scroll"
                required
              />
            </div>

            {/* Aperçu mobile direct */}
            <div className="space-y-1.5">
              <Label className="text-gray-500 font-medium text-xs flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 text-[#c1647a]" />
                Aperçu du rendu client ({channel.toUpperCase()})
              </Label>
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  channel === 'whatsapp'
                    ? 'bg-[#e7f8ee] border-[#bbf7d0] text-gray-900 shadow-xs'
                    : channel === 'sms'
                    ? 'bg-[#f4f7fb] border-[#d8e2ee] text-gray-900'
                    : 'bg-white border-[#e7e4dd] text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 text-[11px] text-gray-500 border-b border-black/5 pb-1">
                  {channel === 'whatsapp' && <WhatsAppColorIcon size={14} className="shrink-0" />}
                  <span className="font-bold text-gray-800">Décofleur Plus</span>
                  <span>•</span>
                  <span>Aujourd’hui</span>
                </div>
                <p className="whitespace-pre-wrap">{getPreviewText()}</p>
              </div>
            </div>

            {/* Envoi Immédiat ou Programmé */}
            <div className="space-y-2 pt-2 border-t border-[#f0ede6]">
              <Label className="font-semibold text-gray-700 text-xs whitespace-nowrap block">Moment d&apos;envoi</Label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleMode === 'immediate'}
                    onChange={() => setScheduleMode('immediate')}
                    className="text-[#c1647a] focus:ring-[#c1647a]"
                  />
                  <span className="font-medium text-gray-800">Envoi immédiat</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleMode === 'scheduled'}
                    onChange={() => setScheduleMode('scheduled')}
                    className="text-[#c1647a] focus:ring-[#c1647a]"
                  />
                  <span className="font-medium text-gray-800">Programmer pour plus tard</span>
                </label>
              </div>

              {scheduleMode === 'scheduled' && (
                <div className="pt-2">
                  <Input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="text-xs h-10 bg-white"
                    required={scheduleMode === 'scheduled'}
                  />
                </div>
              )}
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
              className="bg-[#c1647a] hover:bg-[#a85266] text-white text-xs font-semibold h-10 px-5 gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {scheduleMode === 'immediate' ? 'Diffuser la campagne' : 'Programmer l’envoi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
