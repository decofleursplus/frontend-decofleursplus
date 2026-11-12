'use client';

import { useEffect, useState } from 'react';
import type { CampaignChannel } from '@/lib/admin/mock-data/types';
import { getCampaignAudiences, type CampaignAudience } from '@/lib/api/admin/marketing';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Megaphone, Lock } from 'lucide-react';
import { WhatsAppColorIcon } from '@/components/icons';

/** Champs exacts attendus par POST /admin/marketing/campaigns (la campagne est créée en brouillon). */
export interface NewCampaignInput {
  name: string;
  channel: CampaignChannel;
  /** Code d'audience renvoyé par GET /admin/marketing/campaigns/audiences */
  audience: string;
  messageContent: string;
}

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Résout à true si l'API a enregistré la campagne (le panneau se ferme alors). */
  onCreate: (campaign: NewCampaignInput) => Promise<boolean>;
}

/**
 * Canaux : seul l'email est envoyé par l'API. WhatsApp est affiché mais désactivé
 * tant qu'aucun fournisseur n'est configuré (l'envoi répondrait 503).
 */
const CHANNELS: { value: CampaignChannel; label: string; icon: React.ReactNode; available: boolean }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" />, available: true },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppColorIcon size={16} />, available: false },
];

/** Panneau latéral « Nouvelle campagne » ; le formulaire repart de zéro à chaque ouverture. */
export function CreateCampaignDialog({ isOpen, onOpenChange, onCreate }: CreateCampaignDialogProps) {
  if (!isOpen) return null;
  return <CampaignDrawer onOpenChange={onOpenChange} onCreate={onCreate} />;
}

function CampaignDrawer({ onOpenChange, onCreate }: Omit<CreateCampaignDialogProps, 'isOpen'>) {
  const [name, setName] = useState('');
  const [audiences, setAudiences] = useState<CampaignAudience[] | null>(null);
  const [audience, setAudience] = useState('all');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const channel: CampaignChannel = 'email';

  useEffect(() => {
    getCampaignAudiences()
      .then(setAudiences)
      .catch((err) => setAudienceError(err instanceof Error ? err.message : 'Audiences indisponibles.'));
  }, []);

  const selected = audiences?.find((a) => a.code === audience);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Donnez un nom (objet de l’email) à la campagne.';
    if (message.trim().length < 10) next.message = 'Rédigez le message (10 caractères minimum).';
    if (!audiences?.some((a) => a.code === audience)) next.audience = 'Choisissez une audience.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    const ok = await onCreate({ name: name.trim(), channel, audience, messageContent: message.trim() });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <AdminDrawer
      isOpen
      onClose={() => onOpenChange(false)}
      size="lg"
      icon={<Megaphone size={20} />}
      title="Nouvelle campagne"
      subtitle="Enregistrée en brouillon : vous l’envoyez ensuite depuis la liste."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="campaign-form" disabled={saving} className="bg-[#c1647a] hover:bg-[#a85266] text-white gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer la campagne
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={submit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="campaign-name" className="text-xs font-semibold">
            Nom / objet de l’email *
          </Label>
          <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Offre spéciale Saint-Valentin" />
          {errors.name && <p className="text-[11px] text-red-600">{errors.name}</p>}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-xs font-semibold mb-1.5">Canal d’envoi</legend>
          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={!c.available}
                aria-pressed={channel === c.value}
                title={c.available ? undefined : 'Aucun fournisseur configuré pour ce canal'}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  channel === c.value
                    ? 'border-[#c1647a] bg-[#fdf2f4] text-[#c1647a]'
                    : 'border-[#e7e4dd] text-gray-400 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {c.icon} {c.label}
                </span>
                {!c.available && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                    <Lock className="h-3 w-3" /> Indisponible
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">
            WhatsApp sera activé dès qu’un fournisseur d’envoi sera branché. Pour l’instant, les campagnes partent par email.
          </p>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="campaign-audience" className="text-xs font-semibold">
            Audience *
          </Label>
          <select
            id="campaign-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            disabled={!audiences}
            className="w-full h-10 rounded-md border border-[#e7e4dd] px-3 text-sm bg-white"
          >
            {(audiences ?? []).map((a) => (
              <option key={a.code} value={a.code}>
                {a.label} ({a.count} destinataire{a.count > 1 ? 's' : ''})
              </option>
            ))}
            {!audiences && <option value="all">Chargement…</option>}
          </select>
          {audienceError && <p className="text-[11px] text-red-700">{audienceError}</p>}
          {errors.audience && <p className="text-[11px] text-red-600">{errors.audience}</p>}
          {selected && selected.count === 0 && <p className="text-[11px] text-amber-700">Aucun destinataire dans cette audience pour le moment.</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="campaign-message" className="text-xs font-semibold">
            Message *
          </Label>
          <textarea
            id="campaign-message"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour {prenom}, découvrez notre nouvelle collection… {lien_boutique}"
            className="w-full rounded-md border border-[#e7e4dd] p-3 text-sm"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Variables : {'{prenom}'} (prénom du client), {'{lien_boutique}'} (lien vers la boutique).</span>
            <span>{message.length} car.</span>
          </div>
          {errors.message && <p className="text-[11px] text-red-600">{errors.message}</p>}
        </div>
      </form>
    </AdminDrawer>
  );
}
