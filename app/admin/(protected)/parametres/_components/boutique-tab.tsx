'use client';

import { useRef, useState } from 'react';
import { Clock, Loader2, Mail, MapPin, Phone, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';
import type { AdminShopSettings, BoutiqueSettings, UpdateShopSettingsPayload } from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

type BoutiqueDraft = Pick<
  BoutiqueSettings,
  'shopName' | 'tagline' | 'contactEmail' | 'phoneDakar' | 'phoneSaly' | 'address' | 'logoUrl' | 'openingHours'
>;

function toDraft(b: BoutiqueSettings): BoutiqueDraft {
  return {
    shopName: b.shopName,
    tagline: b.tagline,
    contactEmail: b.contactEmail,
    phoneDakar: b.phoneDakar,
    phoneSaly: b.phoneSaly,
    address: b.address,
    logoUrl: b.logoUrl,
    openingHours: b.openingHours,
  };
}

export function BoutiqueTab({
  settings,
  canEdit,
  onSave,
}: {
  settings: AdminShopSettings;
  canEdit: boolean;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<AdminShopSettings>;
}) {
  const [draft, setDraft] = useState<BoutiqueDraft>(() => toDraft(settings.boutique));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const saved = toDraft(settings.boutique);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const set = (patch: Partial<BoutiqueDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const urls = await uploadAdminMedia([file], 'products');
      set({ logoUrl: urls[0] });
      toast.success('Logo téléversé. Cliquez sur « Enregistrer » pour l’appliquer.');
    } catch (err) {
      toast.error(describeError(err, 'Échec du téléversement du logo.'));
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const localErrors: Record<string, string> = {};
    if (!draft.shopName.trim()) localErrors['boutique.shopName'] = 'Le nom de la boutique est obligatoire.';
    if (!/^\S+@\S+\.\S+$/.test(draft.contactEmail.trim())) {
      localErrors['boutique.contactEmail'] = 'Adresse email invalide.';
    }
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      toast.error('Corrigez les champs signalés avant d’enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const updated = await onSave({ boutique: draft });
      setDraft(toDraft(updated.boutique));
      setErrors({});
      toast.success('Informations de la boutique enregistrées.');
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'Les informations de la boutique n’ont pas pu être enregistrées.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Informations de la boutique</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Identité, coordonnées publiques et horaires de l&apos;atelier.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving || !dirty || isUploadingLogo}
              className="bg-[#c1647a] hover:bg-[#a84d63] text-white text-xs gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5 text-xs">
        {!canEdit && <ReadOnlyNote />}
        <InfoNote>
          Ces informations sont celles que le serveur publie pour la vitrine (coordonnées, horaires, logo).
        </InfoNote>

        {/* Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
          <div className="relative h-20 w-20 rounded-xl border border-gray-200 bg-white p-2 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
            {draft.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.logoUrl} alt={`Logo ${draft.shopName}`} className="object-contain w-full h-full max-h-16" />
            ) : (
              <span className="text-[10px] text-gray-400">Aucun logo</span>
            )}
          </div>
          <div className="space-y-1.5">
            <h4 className="font-semibold text-gray-900 text-sm">Logo de l&apos;enseigne</h4>
            <p className="text-gray-500 text-[11px]">Formats JPG, PNG, WebP ou AVIF. 5 Mo maximum.</p>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo || !canEdit}
              className="hidden"
            />
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="gap-1.5 text-xs h-8 text-[#c1647a] border-[#c1647a]/30 hover:bg-pink-50"
              >
                {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>{isUploadingLogo ? 'Téléversement…' : 'Changer le logo'}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="shopName" className="font-semibold text-gray-700">
              Nom de la boutique <span className="text-[#c1647a]">*</span>
            </Label>
            <Input
              id="shopName"
              value={draft.shopName}
              disabled={!canEdit}
              onChange={(e) => set({ shopName: e.target.value })}
              className="h-9 text-xs"
            />
            <FieldError message={errors['boutique.shopName']} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="font-semibold text-gray-700">
              Slogan
            </Label>
            <Input
              id="tagline"
              value={draft.tagline}
              disabled={!canEdit}
              onChange={(e) => set({ tagline: e.target.value })}
              className="h-9 text-xs"
            />
            <FieldError message={errors['boutique.tagline']} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactEmail" className="font-semibold text-gray-700">
              Email de contact <span className="text-[#c1647a]">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="contactEmail"
                type="email"
                value={draft.contactEmail}
                disabled={!canEdit}
                onChange={(e) => set({ contactEmail: e.target.value })}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <FieldError message={errors['boutique.contactEmail']} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneDakar" className="font-semibold text-gray-700">
              Téléphone Dakar (service client & WhatsApp)
            </Label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="phoneDakar"
                value={draft.phoneDakar}
                disabled={!canEdit}
                onChange={(e) => set({ phoneDakar: e.target.value })}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <FieldError message={errors['boutique.phoneDakar']} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneSaly" className="font-semibold text-gray-700">
              Téléphone Saly (boutique & atelier)
            </Label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="phoneSaly"
                value={draft.phoneSaly}
                disabled={!canEdit}
                onChange={(e) => set({ phoneSaly: e.target.value })}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <FieldError message={errors['boutique.phoneSaly']} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="font-semibold text-gray-700">
            Adresse de l&apos;atelier
          </Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="address"
              value={draft.address}
              disabled={!canEdit}
              onChange={(e) => set({ address: e.target.value })}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <FieldError message={errors['boutique.address']} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="openingHours" className="font-semibold text-gray-700">
            Horaires d&apos;ouverture
          </Label>
          <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="openingHours"
              value={draft.openingHours}
              disabled={!canEdit}
              onChange={(e) => set({ openingHours: e.target.value })}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <FieldError message={errors['boutique.openingHours']} />
        </div>
      </CardContent>
    </Card>
  );
}
