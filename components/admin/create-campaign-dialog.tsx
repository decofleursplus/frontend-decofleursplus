'use client';

import { useEffect, useState } from 'react';
import type { CampaignChannel } from '@/lib/admin/mock-data/types';
import { getCampaignAudiences, type CampaignAudience } from '@/lib/api/admin/marketing';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MessageSquare, Megaphone } from 'lucide-react';
import { WhatsAppColorIcon } from '@/components/icons';
import { toast } from 'sonner';

export interface NewCampaignInput {
  name: string;
  channel: CampaignChannel;
  /** Code d'audience : all, newsletter, vip, entreprise, inactive */
  audience: string;
  messageContent: string;
}

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Résout à true si l'API a enregistré la campagne (la fenêtre se ferme alors). */
  onCreate: (campaign: NewCampaignInput) => Promise<boolean>;
}

const CHANNELS: { value: CampaignChannel; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppColorIcon size={16} /> },
  { value: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
];

/**
 * Nouvelle campagne (enregistrée en brouillon, envoyée ensuite depuis la liste).
 * Audiences et nombres de destinataires réels ; variables {prenom} et {lien_boutique} remplacées à l'envoi.
 */
export function CreateCampaignDialog({ isOpen, onOpenChange, onCreate }: CreateCampaignDialogProps) {
  if (!isOpen) return null;
  return <CampaignForm onOpenChange={onOpenChange} onCreate={onCreate} />;
}

function CampaignForm({ onOpenChange, onCreate }: Omit<CreateCampaignDialogProps, 'isOpen'>) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('email');
  const [audiences, setAudiences] = useState<CampaignAudience[] | null>(null);
  const [audience, setAudience] = useState('all');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [audienceError, setAudienceError] = useState<string | null>(null);

  useEffect(() => {
    getCampaignAudiences()
      .then(setAudiences)
      .catch((err) => setAudienceError(err instanceof Error ? err.message : 'Audiences indisponibles.'));
  }, []);

  const selected = audiences?.find((a) => a.code === audience);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return toast.error('Donnez un nom (objet) à la campagne.');
    if (message.trim().length < 10) return toast.error('Rédigez le message (10 caractères minimum).');
    setSaving(true);
    const ok = await onCreate({ name: name.trim(), channel, audience, messageContent: message.trim() });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#c1647a]" /> Nouvelle campagne
            </DialogTitle>
            <DialogDescription className="text-xs">La campagne est enregistrée en brouillon ; vous l’envoyez ensuite depuis la liste.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="campaign-name" className="text-xs font-semibold">
              Nom / objet de l’email *
            </Label>
            <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Offre spéciale Saint-Valentin" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold">Canal</span>
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setChannel(c.value)}
                  aria-pressed={channel === c.value}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    channel === c.value ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a]' : 'border-[#e7e4dd]'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {channel !== 'email' && (
              <p className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-900">
                Aucun fournisseur {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} n’est encore configuré : la campagne sera enregistrée mais ne pourra pas être envoyée automatiquement.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="campaign-audience" className="text-xs font-semibold">
              Audience
            </Label>
            <select id="campaign-audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full h-10 rounded-md border border-[#e7e4dd] px-3 text-sm bg-white">
              {(audiences ?? []).map((a) => (
                <option key={a.code} value={a.code}>
                  {a.label} ({a.count})
                </option>
              ))}
              {!audiences && <option value="all">Chargement…</option>}
            </select>
            {audienceError && <p className="text-[11px] text-red-700">{audienceError}</p>}
            {selected && selected.count === 0 && <p className="text-[11px] text-amber-700">Aucun destinataire dans cette audience pour le moment.</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="campaign-message" className="text-xs font-semibold">
              Message *
            </Label>
            <textarea
              id="campaign-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour {prenom}, découvrez notre nouvelle collection… {lien_boutique}"
              className="w-full rounded-md border border-[#e7e4dd] p-3 text-sm"
            />
            <p className="text-[11px] text-gray-500">Variables : {'{prenom}'} (prénom du client), {'{lien_boutique}'} (lien vers la boutique).</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#c1647a] hover:bg-[#a85266] text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer la campagne
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
