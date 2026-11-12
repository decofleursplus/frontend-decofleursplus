'use client';

import { useRef, useState } from 'react';
import { AtSign, Globe, Loader2, Music2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';
import type { AdminShopSettings, SeoSettings, UpdateShopSettingsPayload } from '@/lib/api/admin/settings';
import { describeError, FieldError, fieldErrorsOf, InfoNote, ReadOnlyNote } from './shared';

const SOCIAL: { key: 'instagramUrl' | 'facebookUrl' | 'tiktokUrl'; label: string; placeholder: string; icon: typeof AtSign }[] = [
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…', icon: AtSign },
  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/…', icon: Globe },
  { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@…', icon: Music2 },
];

const isUrlOrEmpty = (value: string) => value.trim() === '' || /^https?:\/\/\S+$/i.test(value.trim());

export function SeoTab({
  settings,
  canEdit,
  onSave,
}: {
  settings: AdminShopSettings;
  canEdit: boolean;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<AdminShopSettings>;
}) {
  const [draft, setDraft] = useState<SeoSettings>(() => ({ ...settings.seo }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.seo);
  const set = (patch: Partial<SeoSettings>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadAdminMedia([file], 'products');
      set({ ogImageUrl: urls[0] });
      toast.success('Image téléversée. Cliquez sur « Enregistrer » pour l’appliquer.');
    } catch (err) {
      toast.error(describeError(err, 'Échec du téléversement de l’image.'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const localErrors: Record<string, string> = {};
    for (const social of SOCIAL) {
      if (!isUrlOrEmpty(draft[social.key])) {
        localErrors[`seo.${social.key}`] = 'URL invalide : elle doit commencer par http:// ou https://';
      }
    }
    if (draft.metaTitle.length > 160) localErrors['seo.metaTitle'] = '160 caractères maximum.';
    if (draft.metaDescription.length > 400) localErrors['seo.metaDescription'] = '400 caractères maximum.';
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      toast.error('Corrigez les champs signalés avant d’enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const updated = await onSave({
        seo: {
          ...draft,
          instagramUrl: draft.instagramUrl.trim(),
          facebookUrl: draft.facebookUrl.trim(),
          tiktokUrl: draft.tiktokUrl.trim(),
        },
      });
      setDraft({ ...updated.seo });
      setErrors({});
      toast.success('Référencement et réseaux sociaux enregistrés.');
    } catch (err) {
      setErrors(fieldErrorsOf(err));
      toast.error(describeError(err, 'Les réglages SEO n’ont pas pu être enregistrés.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Référencement & réseaux sociaux</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Titre et description du site, image de partage et liens vers vos réseaux sociaux.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving || uploading || !dirty}
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
          Les liens des réseaux sociaux sont publiés pour la vitrine via les paramètres publics de la boutique. Le titre,
          la description, les mots-clés et l&apos;image de partage sont enregistrés, mais les pages publiques utilisent
          encore les métadonnées définies dans le code du site.
        </InfoNote>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaTitle" className="font-semibold text-gray-700">
              Titre du site (balise title)
            </Label>
            <span className={`text-[10px] ${draft.metaTitle.length > 160 ? 'text-rose-600' : 'text-gray-400'}`}>
              {draft.metaTitle.length}/160
            </span>
          </div>
          <Input
            id="metaTitle"
            value={draft.metaTitle}
            disabled={!canEdit}
            onChange={(e) => set({ metaTitle: e.target.value })}
            className="h-9 text-xs"
          />
          <FieldError message={errors['seo.metaTitle']} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaDescription" className="font-semibold text-gray-700">
              Description (meta description)
            </Label>
            <span className={`text-[10px] ${draft.metaDescription.length > 400 ? 'text-rose-600' : 'text-gray-400'}`}>
              {draft.metaDescription.length}/400
            </span>
          </div>
          <Textarea
            id="metaDescription"
            rows={3}
            value={draft.metaDescription}
            disabled={!canEdit}
            onChange={(e) => set({ metaDescription: e.target.value })}
            className="text-xs"
          />
          <FieldError message={errors['seo.metaDescription']} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="keywords" className="font-semibold text-gray-700">
            Mots-clés (séparés par des virgules)
          </Label>
          <Input
            id="keywords"
            value={draft.keywords}
            disabled={!canEdit}
            onChange={(e) => set({ keywords: e.target.value })}
            className="h-9 text-xs"
          />
          <FieldError message={errors['seo.keywords']} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
          <div className="h-20 w-36 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
            {draft.ogImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.ogImageUrl} alt="Image de partage" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-gray-400">Aucune image</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="ogImageUrl" className="font-semibold text-gray-700">
              Image de partage (réseaux sociaux)
            </Label>
            <Input
              id="ogImageUrl"
              value={draft.ogImageUrl}
              disabled={!canEdit}
              onChange={(e) => set({ ogImageUrl: e.target.value })}
              className="h-9 text-xs"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleImage}
              disabled={!canEdit || uploading}
            />
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="gap-1.5 text-xs h-8 text-[#c1647a] border-[#c1647a]/30 hover:bg-pink-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? 'Téléversement…' : 'Téléverser une image'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900">Réseaux sociaux</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SOCIAL.map((social) => {
              const Icon = social.icon;
              return (
                <div key={social.key} className="space-y-1.5">
                  <Label htmlFor={social.key} className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    {social.label}
                  </Label>
                  <Input
                    id={social.key}
                    value={draft[social.key]}
                    placeholder={social.placeholder}
                    disabled={!canEdit}
                    onChange={(e) => set({ [social.key]: e.target.value })}
                    className="h-9 text-xs"
                  />
                  <FieldError message={errors[`seo.${social.key}`]} />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">Laissez un champ vide pour ne pas afficher ce réseau.</p>
        </div>
      </CardContent>
    </Card>
  );
}
