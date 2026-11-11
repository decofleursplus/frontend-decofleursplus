'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminShopSettings, NotificationSettings, UpdateShopSettingsPayload } from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

type BooleanKey = {
  [K in keyof NotificationSettings]: NotificationSettings[K] extends boolean ? K : never;
}[keyof NotificationSettings];

const CHANNELS: { key: BooleanKey; label: string }[] = [
  { key: 'emailEnabled', label: 'Email' },
  { key: 'whatsappEnabled', label: 'WhatsApp' },
  { key: 'smsEnabled', label: 'SMS' },
];

const EVENTS: { key: BooleanKey; label: string; desc: string }[] = [
  { key: 'onNewOrder', label: 'Nouvelle commande', desc: 'Prévenir l’équipe à chaque nouvelle commande.' },
  { key: 'onDriverAssigned', label: 'Livreur assigné', desc: 'Prévenir le client lorsqu’un livreur prend en charge sa commande.' },
  { key: 'onDelivered', label: 'Commande livrée', desc: 'Confirmer la livraison au client.' },
  { key: 'onLowStock', label: 'Stock bas', desc: 'Alerter l’équipe lorsqu’un produit passe sous son seuil d’alerte.' },
];

export function NotificationsTab({
  settings,
  canEdit,
  onSave,
}: {
  settings: AdminShopSettings;
  canEdit: boolean;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<AdminShopSettings>;
}) {
  const [draft, setDraft] = useState<NotificationSettings>(() => ({ ...settings.notifications }));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.notifications);
  const set = (patch: Partial<NotificationSettings>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    const localErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(draft.adminAlertEmail.trim())) {
      localErrors['notifications.adminAlertEmail'] = 'Adresse email invalide.';
    }
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      toast.error('Corrigez les champs signalés avant d’enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const updated = await onSave({ notifications: draft });
      setDraft({ ...updated.notifications });
      setErrors({});
      toast.success('Préférences de notification enregistrées.');
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'Les préférences de notification n’ont pas pu être enregistrées.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Notifications & alertes</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Canaux souhaités, événements à signaler et contacts d&apos;alerte de la gérance.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving || !dirty}
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2 text-xs">
        {!canEdit && <ReadOnlyNote />}
        <InfoNote tone="warning">
          Ces préférences sont enregistrées sur le serveur, mais ne pilotent pas encore les envois : les emails
          transactionnels et les notifications internes partent aujourd&apos;hui indépendamment de ces réglages, et
          aucun fournisseur WhatsApp ou SMS n&apos;est connecté.
        </InfoNote>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Canaux souhaités</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CHANNELS.map((channel) => (
              <div
                key={channel.key}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
              >
                <span className="font-medium text-gray-800">{channel.label}</span>
                <Switch
                  aria-label={channel.label}
                  checked={draft[channel.key]}
                  disabled={!canEdit}
                  onCheckedChange={(checked) => set({ [channel.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900">Événements à signaler</h4>
          <div className="space-y-2">
            {EVENTS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-gray-900 block">{item.label}</span>
                  <span className="text-[11px] text-gray-400">{item.desc}</span>
                </div>
                <Switch
                  aria-label={item.label}
                  checked={draft[item.key]}
                  disabled={!canEdit}
                  onCheckedChange={(checked) => set({ [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="space-y-1.5">
            <Label htmlFor="adminAlertPhone" className="font-semibold text-gray-700">
              Téléphone d&apos;alerte de la gérance
            </Label>
            <Input
              id="adminAlertPhone"
              value={draft.adminAlertPhone}
              disabled={!canEdit}
              onChange={(e) => set({ adminAlertPhone: e.target.value })}
              className="h-9 text-xs"
            />
            <FieldError message={errors['notifications.adminAlertPhone']} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adminAlertEmail" className="font-semibold text-gray-700">
              Email d&apos;alerte de la gérance
            </Label>
            <Input
              id="adminAlertEmail"
              type="email"
              value={draft.adminAlertEmail}
              disabled={!canEdit}
              onChange={(e) => set({ adminAlertEmail: e.target.value })}
              className="h-9 text-xs"
            />
            <FieldError message={errors['notifications.adminAlertEmail']} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
