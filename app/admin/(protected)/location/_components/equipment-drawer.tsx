'use client';

import { useState } from 'react';
import { Armchair, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { ImageUploader } from '@/components/admin/image-uploader';
import { ApiClientError } from '@/lib/api/client';
import {
  createAdminRentalEquipment,
  updateAdminRentalEquipment,
  type RentalEquipment,
  type RentalItemAdminStatus,
} from '@/lib/api/admin/rentals';

export const RENTAL_CATEGORY_OPTIONS = [
  { value: 'mobilier', label: 'Mobilier événementiel' },
  { value: 'vaisselle', label: 'Vaisselle & arts de la table' },
  { value: 'decoration', label: 'Décoration florale' },
  { value: 'accessoires', label: 'Accessoires & nappage' },
];

export const ITEM_STATUS_LABELS: Record<RentalItemAdminStatus, string> = {
  AVAILABLE: 'Disponible à la location',
  MAINTENANCE: 'En maintenance (non réservable)',
  UNAVAILABLE: 'Retiré du catalogue',
};

interface EquipmentDrawerProps {
  isOpen: boolean;
  /** Équipement à modifier ; null = création */
  equipment: RentalEquipment | null;
  onClose: () => void;
  onSaved: (equipment: RentalEquipment, created: boolean) => void;
}

type Errors = Partial<Record<string, string>>;

const inputClass =
  'w-full p-2.5 rounded-xl border border-border bg-[#faf8f5] focus:bg-white focus:border-[#173f22] outline-none text-xs';

function initialGallery(equipment: RentalEquipment | null): string[] {
  if (!equipment) return [];
  return equipment.images.length > 0 ? equipment.images : equipment.image ? [equipment.image] : [];
}

/** Le formulaire est remonté (key) à chaque ouverture : il repart toujours de l'équipement édité. */
export function EquipmentDrawer(props: EquipmentDrawerProps) {
  return <EquipmentDrawerForm key={props.isOpen ? `ouvert-${props.equipment?.id ?? 'nouveau'}` : 'ferme'} {...props} />;
}

function EquipmentDrawerForm({ isOpen, equipment, onClose, onSaved }: EquipmentDrawerProps) {
  const [name, setName] = useState(equipment?.name ?? '');
  const [category, setCategory] = useState(equipment?.category ?? 'mobilier');
  const [pricePerDay, setPricePerDay] = useState(equipment ? String(equipment.pricePerDay) : '');
  const [depositAmount, setDepositAmount] = useState(equipment ? String(equipment.deposit) : '');
  const [totalQuantity, setTotalQuantity] = useState(equipment ? String(equipment.totalStock) : '1');
  const [dimensions, setDimensions] = useState(equipment?.dimensions ?? '');
  const [description, setDescription] = useState(equipment?.description ?? '');
  const [images, setImages] = useState<string[]>(() => initialGallery(equipment));
  const [primaryImage, setPrimaryImage] = useState(() => equipment?.image ?? initialGallery(equipment)[0] ?? '');
  const [status, setStatus] = useState<RentalItemAdminStatus>(
    equipment?.itemStatus === 'MAINTENANCE' || equipment?.itemStatus === 'UNAVAILABLE' ? equipment.itemStatus : 'AVAILABLE',
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Le nom doit contenir au moins 2 caractères.';
    if (pricePerDay === '' || Number(pricePerDay) < 0) next.pricePerDay = 'Indiquez un prix par jour positif ou nul.';
    if (depositAmount === '' || Number(depositAmount) < 0) next.depositAmount = 'Indiquez une caution positive ou nulle.';
    if (!Number.isInteger(Number(totalQuantity)) || Number(totalQuantity) < 1) next.totalQuantity = 'Stock total minimum : 1.';
    if (description.trim().length < 2) next.description = 'La description est requise.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localErrors = validate();
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    const featured = primaryImage && images.includes(primaryImage) ? primaryImage : images[0];
    setSaving(true);
    try {
      let saved: RentalEquipment;
      if (equipment) {
        saved = await updateAdminRentalEquipment(equipment.id, {
          name: name.trim(),
          category,
          pricePerDay: Number(pricePerDay),
          depositAmount: Number(depositAmount),
          totalQuantity: Number(totalQuantity),
          description: description.trim(),
          dimensions: dimensions.trim() || null,
          images,
          featuredImage: featured ?? null,
          status,
        });
      } else {
        saved = await createAdminRentalEquipment({
          name: name.trim(),
          category,
          pricePerDay: Number(pricePerDay),
          depositAmount: Number(depositAmount),
          totalQuantity: Number(totalQuantity),
          description: description.trim(),
          dimensions: dimensions.trim() || undefined,
          images,
          featuredImage: featured,
        });
      }
      toast.success(
        equipment ? `Équipement « ${saved.name} » mis à jour.` : `Équipement « ${saved.name} » ajouté au catalogue de location.`,
      );
      onSaved(saved, !equipment);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details?.length) {
          const serverErrors: Errors = {};
          for (const d of err.details) serverErrors[d.path.split('.')[0]] = d.message;
          setErrors(serverErrors);
        }
        toast.error(err.message);
      } else {
        toast.error('L’enregistrement de l’équipement a échoué.');
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1 text-red-600 text-[11px]">{errors[key]}</p> : null;

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={equipment ? 'Modifier l’équipement' : 'Ajouter un équipement'}
      subtitle="Catalogue de location événementielle."
      icon={<Armchair size={20} />}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted text-xs cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="equipment-form"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#c8436e] hover:bg-[#b0355d] text-white font-semibold shadow-xs text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {equipment ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
          </button>
        </>
      }
    >
      <form id="equipment-form" onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
        <div>
          <label htmlFor="eq-name" className="block font-semibold text-muted-foreground mb-1">Nom de l’équipement *</label>
          <input
            id="eq-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Table ronde, Chaise Chiavari…"
            className={inputClass}
          />
          {fieldError('name')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="eq-category" className="block font-semibold text-muted-foreground mb-1">Catégorie *</label>
            <select id="eq-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {RENTAL_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
              {!RENTAL_CATEGORY_OPTIONS.some((o) => o.value === category) && (
                <option value={category}>{equipment?.categoryLabel ?? category}</option>
              )}
            </select>
            {fieldError('category')}
          </div>
          {equipment && (
            <div>
              <label htmlFor="eq-status" className="block font-semibold text-muted-foreground mb-1">Statut</label>
              <select
                id="eq-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as RentalItemAdminStatus)}
                className={inputClass}
              >
                {(Object.keys(ITEM_STATUS_LABELS) as RentalItemAdminStatus[]).map((s) => (
                  <option key={s} value={s}>{ITEM_STATUS_LABELS[s]}</option>
                ))}
              </select>
              {fieldError('status')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="eq-price" className="block font-semibold text-muted-foreground mb-1">Prix par jour (FCFA) *</label>
            <input
              id="eq-price"
              type="number"
              min={0}
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className={inputClass}
            />
            {fieldError('pricePerDay')}
          </div>
          <div>
            <label htmlFor="eq-deposit" className="block font-semibold text-muted-foreground mb-1">Caution par unité (FCFA) *</label>
            <input
              id="eq-deposit"
              type="number"
              min={0}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={inputClass}
            />
            {fieldError('depositAmount')}
          </div>
        </div>

        <div>
          <label htmlFor="eq-stock" className="block font-semibold text-muted-foreground mb-1">Stock total (unités) *</label>
          <input
            id="eq-stock"
            type="number"
            min={1}
            step={1}
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(e.target.value)}
            className={inputClass}
          />
          {fieldError('totalQuantity')}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Le stock disponible est calculé automatiquement à partir des réservations en cours
            {equipment ? ` (aujourd’hui : ${equipment.availableStock} / ${equipment.totalStock}).` : '.'}
          </p>
        </div>

        <div>
          <label htmlFor="eq-dimensions" className="block font-semibold text-muted-foreground mb-1">Dimensions &amp; spécifications</label>
          <input
            id="eq-dimensions"
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="Ex : Diamètre 180 cm · 8-10 personnes"
            className={inputClass}
          />
          {fieldError('dimensions')}
        </div>

        <div>
          <label htmlFor="eq-description" className="block font-semibold text-muted-foreground mb-1">Description *</label>
          <textarea
            id="eq-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          {fieldError('description')}
        </div>

        <div>
          <ImageUploader
            multiple
            folder="products"
            maxFiles={8}
            value={images}
            onChange={setImages}
            primaryImage={primaryImage}
            onPrimaryChange={setPrimaryImage}
            label="Photos de l’équipement"
            description="JPG, PNG, WebP — 5 Mo max. Cliquez sur une photo pour en faire la photo principale."
          />
          {fieldError('images')}
          {fieldError('featuredImage')}
        </div>
      </form>
    </AdminDrawer>
  );
}
