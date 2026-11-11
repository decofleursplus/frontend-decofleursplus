'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Calendar,
  Palette,
  Image as ImageIcon,
  Check,
  ShoppingBag,
  Search,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadAdminMedia } from '@/lib/api/admin/uploads';
import { WhatsAppColorIcon } from '@/components/icons';
import { products as allProducts } from '@/lib/products';
import {
  type SeasonalEvent,
  type EventThemeColor,
  stripEmojis,
} from '@/lib/events-data';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SeasonalEvent | null;
  isLive: boolean;
  onSave: (updatedEvent: SeasonalEvent, activateImmediately?: boolean) => void;
}

const themeOptions: {
  key: EventThemeColor;
  label: string;
  dot: string;
  badgeBg: string;
  badgeText: string;
  border: string;
}[] = [
  { key: 'emerald', label: 'Vert Atelier', dot: '#193e23', badgeBg: '#edf8ef', badgeText: '#193e23', border: '#b8dfbe' },
  { key: 'ruby', label: 'Rubis Délicat', dot: '#981b36', badgeBg: '#fdf2f4', badgeText: '#981b36', border: '#f7c2cb' },
  { key: 'gold', label: 'Or Champagne', dot: '#8f621e', badgeBg: '#fefcf8', badgeText: '#8f621e', border: '#edd7b4' },
  { key: 'purple', label: 'Lilas Élégant', dot: '#6b21a8', badgeBg: '#faf5ff', badgeText: '#6b21a8', border: '#e0c9fc' },
  { key: 'rose', label: 'Rose Poudré', dot: '#be185d', badgeBg: '#fdf2f8', badgeText: '#be185d', border: '#f9bedd' },
  { key: 'amber', label: 'Ambre Boisé', dot: '#b45309', badgeBg: '#fffbeb', badgeText: '#b45309', border: '#fcd34d' },
  { key: 'festive', label: 'Carmin Fêtes', dot: '#991b1b', badgeBg: '#fef2f2', badgeText: '#991b1b', border: '#fca5a5' },
  { key: 'standard', label: 'Signature Maison', dot: '#193e23', badgeBg: '#f4f8f4', badgeText: '#193e23', border: '#d9e7dc' },
];

const availableImages = [
  { path: '/images/events/tabaski.jpg', label: 'Tabaski (Aïd el-Kébir)' },
  { path: '/images/events/magal.jpg', label: 'Grand Magal de Touba' },
  { path: '/images/events/gamou.jpg', label: 'Gamou de Tivaouane' },
  { path: '/images/events/korite.jpg', label: 'Korité (Aïd el-Fitr)' },
  { path: '/images/events/saint-valentin.jpg', label: 'Saint-Valentin' },
  { path: '/images/events/femmes-8mars.jpg', label: '8 Mars : Droits des Femmes' },
  { path: '/images/events/fete-meres.jpg', label: 'Fête des Mères' },
  { path: '/images/events/fete-peres.jpg', label: 'Fête des Pères' },
  { path: '/images/events/noel-fetes.jpg', label: 'Noël & Fin d’année' },
  { path: '/images/hero.jpg', label: 'Atelier floral signature' },
];

const categorySuggestions = [
  'Fête religieuse',
  'Romance & Amour',
  'Fête familiale',
  'Saisonnier & Fêtes',
  'Célébration personnalisée',
];

export function EditEventDialog(props: EditEventDialogProps) {
  if (!props.open || !props.event) return null;
  return <EditEventDialogInner key={props.event.id} {...props} event={props.event} />;
}

function EditEventDialogInner({
  open,
  onOpenChange,
  event,
  isLive,
  onSave,
}: EditEventDialogProps & { event: SeasonalEvent }) {
  const [formData, setFormData] = useState<SeasonalEvent>(event);
  const [productSearch, setProductSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo.');
      return;
    }

    setIsUploading(true);
    try {
      const urls = await uploadAdminMedia([file], 'products');
      if (urls[0]) {
        setFormData((prev) => ({ ...prev, bgImage: urls[0] }));
        toast.success('Photo d’ambiance téléversée avec succès sur le serveur.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Échec du téléversement de la photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Produits sélectionnés
  const selectedProductIds = formData.featuredProductIds || [];
  const selectedProducts = useMemo(() => {
    return allProducts.filter(
      (p) => selectedProductIds.includes(p.id) || selectedProductIds.includes(p.slug)
    );
  }, [selectedProductIds]);

  // Catalogue filtré pour sélection rapide
  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.reference && p.reference.toLowerCase().includes(q))
    );
  }, [productSearch]);

  const handleToggleProduct = (productId: string) => {
    const isSelected = selectedProductIds.includes(productId);
    let nextIds: string[];
    if (isSelected) {
      nextIds = selectedProductIds.filter((id) => id !== productId);
    } else {
      if (selectedProductIds.length >= 4) {
        nextIds = [...selectedProductIds.slice(0, 3), productId];
      } else {
        nextIds = [...selectedProductIds, productId];
      }
    }
    setFormData({ ...formData, featuredProductIds: nextIds });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      const sanitized: SeasonalEvent = {
        ...formData,
        name: stripEmojis(formData.name),
        badge: '',
        categoryLabel: stripEmojis(formData.categoryLabel),
        headline: stripEmojis(formData.headline),
        headlineHighlight: stripEmojis(formData.headlineHighlight),
      };
      onSave(sanitized, false);
      onOpenChange(false);
    }
  };

  const currentTheme =
    themeOptions.find((t) => t.key === formData.themeColor) || themeOptions[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth: '48rem', width: '94vw' }}
        className="w-full max-h-[92vh] overflow-hidden flex flex-col p-0 bg-white border-zinc-200 rounded-2xl shadow-2xl"
      >
        {/* En-tête sobre et clair */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 bg-zinc-50/70">
          <DialogHeader className="p-0 space-y-1.5 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: currentTheme.dot }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {formData.categoryLabel || 'Célébration'}
                </span>
              </div>

              {isLive ? (
                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold gap-1.5 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Actuellement en direct sur le site
                </Badge>
              ) : (
                <Badge variant="outline" className="text-zinc-600 border-zinc-200 text-xs font-normal">
                  Inactif
                </Badge>
              )}
            </div>

            <DialogTitle className="text-lg sm:text-xl font-bold text-zinc-900 font-serif">
              {formData.name || 'Nouvelle célébration'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Personnalisez les textes, l’ambiance et les 4 créations associées pour cette fête.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Corps scrollable avec séparations bien nettes */}
        <form
          id="edit-event-form"
          onSubmit={handleFormSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6"
        >
          {/* SECTION 1 : INFORMATIONS CLÉS */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>1. Informations générales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold text-zinc-700">
                  Nom de l’événement <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Tabaski (Aïd el-Kébir)"
                  className="h-9 text-xs bg-white border-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold text-zinc-700">
                  Période / Date affichée
                </Label>
                <Input
                  value={formData.datesLabel}
                  onChange={(e) => setFormData({ ...formData, datesLabel: e.target.value })}
                  placeholder="Ex: 14 Février ou Période de la fête"
                  className="h-9 text-xs bg-white border-zinc-200"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold text-zinc-700">
                  Catégorie
                </Label>
                <select
                  value={formData.categoryLabel}
                  onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {categorySuggestions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!categorySuggestions.includes(formData.categoryLabel) && formData.categoryLabel && (
                    <option value={formData.categoryLabel}>
                      {formData.categoryLabel}
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 : ACCROCHES DE LA BANNIÈRE (HERO) */}
          <div className="space-y-3.5 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
              <span>2. Textes d’accroche en vitrine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">
                  Titre principal <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Ex: Pour la Tabaski, célébrez le partage"
                  className="h-9 text-xs bg-white border-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">
                  Partie accentuée (en couleur)
                </Label>
                <Input
                  value={formData.headlineHighlight}
                  onChange={(e) =>
                    setFormData({ ...formData, headlineHighlight: e.target.value })
                  }
                  placeholder="Ex: dans la grâce & la beauté !"
                  className="h-9 text-xs bg-white border-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">
                Sous-titre descriptif
              </Label>
              <Textarea
                value={formData.subheadline}
                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                rows={2}
                placeholder="Description poétique et invitation à découvrir la collection..."
                className="text-xs bg-white border-zinc-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">
                  Texte du bouton d’action
                </Label>
                <Input
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Ex: Découvrir la collection Tabaski"
                  className="h-9 text-xs bg-white border-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <WhatsAppColorIcon size={13} />
                  <span>Message pré-rempli WhatsApp</span>
                </Label>
                <Input
                  value={formData.whatsappMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappMessage: e.target.value })
                  }
                  placeholder="Bonjour DécoFleur Plus..."
                  className="h-9 text-xs bg-white border-zinc-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 : THÈME COULEUR & VISUEL */}
          <div className="space-y-3.5 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <Palette className="h-3.5 w-3.5 text-zinc-400" />
              <span>3. Ambiance visuelle &amp; Thème chromatique</span>
            </div>

            {/* Sélecteur de couleur */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">
                Palette de couleur
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {themeOptions.map((t) => {
                  const isSelected = formData.themeColor === t.key;
                  return (
                    <button
                      type="button"
                      key={t.key}
                      onClick={() => setFormData({ ...formData, themeColor: t.key })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: t.dot }}
                        />
                        <span className="text-xs font-medium truncate">{t.label}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sélecteur et importation d'image d'ambiance */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Image d’ambiance</span>
                </Label>

                {/* Bouton d'upload direct depuis l'ordinateur */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="event-image-upload-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs border-zinc-200 text-zinc-700 hover:text-zinc-900 gap-1.5 shadow-2xs"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c1647a]" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                    <span>{isUploading ? 'Téléversement...' : 'Choisir une photo sur mon ordinateur'}</span>
                  </Button>
                </div>
              </div>

              {/* Aperçu si photo personnalisée importée */}
              {formData.bgImage && !formData.bgImage.startsWith('/images/') && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border border-emerald-300 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.bgImage}
                        alt="Photo personnalisée importée"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-900">
                          Photo personnalisée active
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 truncate">
                        Téléversée sur le serveur
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, bgImage: '/images/hero.jpg' })}
                    className="h-7 px-2 text-xs text-emerald-800 hover:text-red-600 hover:bg-emerald-100/50"
                  >
                    Rétablir la galerie
                  </Button>
                </div>
              )}

              {/* Galerie de sélection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-500">
                  Ou choisir parmi la collection d’ambiances :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {availableImages.map((img) => {
                    const isSelected = formData.bgImage === img.path;
                    return (
                      <div
                        key={img.path}
                        onClick={() => setFormData({ ...formData, bgImage: img.path })}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-zinc-900 ring-2 ring-zinc-900/20 shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="relative h-14 w-full bg-zinc-100">
                          <Image
                            src={img.path}
                            alt={img.label}
                            fill
                            className="object-cover"
                            sizes="140px"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-zinc-900 text-white p-0.5 rounded-full shadow-xs">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-[10px] text-zinc-700 font-medium truncate text-center">
                          {img.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 : SÉLECTION DES CRÉATIONS ASSOCIÉES */}
          <div className="space-y-3.5 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
                <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
                <span>4. Créations mises en avant sur la vitrine</span>
              </div>
              <Badge variant="outline" className="text-xs font-medium border-zinc-200 text-zinc-700">
                {selectedProductIds.length} / 4 sélectionnées
              </Badge>
            </div>

            {/* Produits actuellement sélectionnés */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="relative group p-2 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-2.5"
                >
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200 bg-white">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-zinc-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {p.price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleProduct(p.id)}
                    className="h-5 w-5 rounded-full bg-zinc-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-zinc-500 transition-colors shrink-0"
                    title="Retirer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {selectedProducts.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-zinc-400 italic bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  Aucun produit spécifique sélectionné. Les 4 premières créations de la boutique seront affichées par défaut.
                </div>
              )}
            </div>

            {/* Barre de recherche dans le catalogue */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  placeholder="Rechercher une création à ajouter (ex: Lys, Panier, Rose)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white border-zinc-200"
                />
              </div>

              {/* Résultats rapides du catalogue */}
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {filteredCatalog.slice(0, 8).map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-900 font-medium border border-emerald-200'
                          : 'hover:bg-zinc-50 text-zinc-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative h-7 w-7 rounded overflow-hidden shrink-0 border border-zinc-200">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="28px"
                          />
                        </div>
                        <span className="truncate">{p.name}</span>
                        <span className="text-[10px] text-zinc-400">({p.category})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-medium text-zinc-600">
                          {p.price.toLocaleString('fr-FR')} F
                        </span>
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center border text-[10px] ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-zinc-300 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Pied de boîte de dialogue clair et efficace */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-zinc-600 hover:text-zinc-900"
          >
            Annuler
          </Button>

          <Button
            type="submit"
            form="edit-event-form"
            className="bg-[#193e23] hover:bg-[#122e1a] text-white text-xs font-semibold px-6 h-9 shadow-xs"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
