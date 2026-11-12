'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Copy, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api/client';
import { ImageUploader } from '@/components/admin/image-uploader';
import {
  PRODUCT_STATUS_LABELS,
  duplicateAdminProduct,
  getCategoryOptions,
  removeAdminProduct,
  saveAdminProduct,
  type AdminProductDto,
  type AdminProductStatus,
  type CategoryOption,
} from '@/lib/api/admin/product-form';

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  minStockAlert: string;
}

const inputClass = 'w-full h-10 rounded-lg border border-[#e7e4dd] bg-white px-3 text-sm focus:outline-none focus:border-[#24582d]';
const NEW_VARIANT: VariantRow = { name: '', sku: '', price: '', stockQuantity: '0', minStockAlert: '3' };

const errorMessage = (err: unknown) =>
  err instanceof ApiClientError && err.details?.length
    ? err.details.map((d) => (d.path ? `${d.path} : ${d.message}` : d.message)).join(' · ')
    : err instanceof Error
      ? err.message
      : 'Enregistrement impossible.';

/**
 * Fiche produit complète (création et modification) : catégorie et sous-catégorie, statut (vente,
 * promotion, sur devis, masqué), mise en avant, prix et prix barré, photos et variantes avec stock.
 * Les variantes existantes gardent leur identifiant : rien n'est supprimé par erreur.
 */
export function ProductForm({ product }: { product?: AdminProductDto }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[] | null>(null);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.category.id ?? '');
  const [subCategoryId, setSubCategoryId] = useState(product?.subCategory?.id ?? '');
  const [status, setStatus] = useState<AdminProductStatus>(product?.status ?? 'ACTIVE');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [basePrice, setBasePrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.oldPrice ? String(product.oldPrice) : '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [primaryImage, setPrimaryImage] = useState(product?.image ?? '');
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: String(v.price),
          stockQuantity: String(v.stockQuantity),
          minStockAlert: String(v.minStockAlert),
        }))
      : [{ ...NEW_VARIANT, name: 'Standard' }],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategoryOptions()
      .then((list) => {
        setCategories(list);
        setCategoryId((current) => current || list[0]?.id || '');
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Catégories indisponibles.'));
  }, []);

  const subCategories = categories?.find((c) => c.id === categoryId)?.subCategories ?? [];
  const setVariant = (i: number, patch: Partial<VariantRow>) => setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(basePrice);
    const oldPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (name.trim().length < 2) return toast.error('Renseignez le nom du produit.');
    if (!description.trim()) return toast.error('Renseignez la description.');
    if (!categoryId) return toast.error('Choisissez une catégorie.');
    if (!(price >= 0) || basePrice === '') return toast.error('Renseignez le prix de vente.');
    if (oldPrice !== null && oldPrice <= price) return toast.error('Le prix barré doit être supérieur au prix de vente.');
    const rows = variants.filter((v) => v.name.trim());
    if (rows.length === 0) return toast.error('Ajoutez au moins une variante (ex. « Standard »).');
    if (rows.some((v) => v.price === '' || Number(v.price) < 0)) return toast.error('Chaque variante doit avoir un prix.');

    setSaving(true);
    try {
      const saved = await saveAdminProduct(product?.id ?? null, {
        categoryId,
        subCategoryId: subCategoryId || null,
        name: name.trim(),
        description: description.trim(),
        basePrice: price,
        compareAtPrice: oldPrice,
        isFeatured,
        status,
        featuredImage: primaryImage || images[0] || null,
        images,
        variants: rows.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          name: v.name.trim(),
          ...(v.sku.trim() ? { sku: v.sku.trim() } : {}),
          price: Number(v.price),
          stockQuantity: Math.max(0, Math.round(Number(v.stockQuantity) || 0)),
          minStockAlert: Math.max(0, Math.round(Number(v.minStockAlert) || 0)),
        })),
      });
      toast.success(product ? 'Produit mis à jour.' : `Produit « ${saved.name} » créé.`);
      router.push('/admin/produits');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const hideOrDelete = async (permanent: boolean) => {
    if (!product) return;
    const question = permanent
      ? `Supprimer définitivement « ${product.name} » ? (impossible s'il a déjà été commandé)`
      : `Masquer « ${product.name} » de la boutique ?`;
    if (!window.confirm(question)) return;
    try {
      const res = await removeAdminProduct(product.id, permanent);
      toast.success(res.deleted ? 'Produit supprimé définitivement.' : 'Produit masqué de la boutique.');
      router.push('/admin/produits');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const duplicate = async () => {
    if (!product) return;
    try {
      const copy = await duplicateAdminProduct(product.id);
      toast.success('Copie créée (masquée, stock à 0).');
      router.push(`/admin/produits/${copy.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/produits" className="p-2 rounded-lg border border-[#e7e4dd] hover:bg-gray-50" aria-label="Retour aux produits">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-[#1e2a1f]">{product ? `Modifier « ${product.name} »` : 'Ajouter un produit'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {product && (
            <>
              <button type="button" onClick={() => void duplicate()} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#e7e4dd] text-xs font-semibold">
                <Copy className="h-3.5 w-3.5" /> Dupliquer
              </button>
              {product.status !== 'HIDDEN' && (
                <button type="button" onClick={() => void hideOrDelete(false)} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#e7e4dd] text-xs font-semibold">
                  <EyeOff className="h-3.5 w-3.5" /> Masquer
                </button>
              )}
              <button type="button" onClick={() => void hideOrDelete(true)} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold">
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            </>
          )}
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#24582d] text-white text-xs font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-[#e7e4dd] p-5 space-y-4">
          <h2 className="text-sm font-bold">Informations générales</h2>
          <label className="block text-xs font-semibold">
            Nom du produit *
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs font-semibold">
            Description *
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-[#e7e4dd] p-3 text-sm" />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold">
              Catégorie *
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                }}
                className={`${inputClass} mt-1`}
              >
                {!categories && <option>Chargement…</option>}
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold">
              Sous-catégorie
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} disabled={subCategories.length === 0} className={`${inputClass} mt-1`}>
                <option value="">{subCategories.length ? 'Aucune' : 'Aucune sous-catégorie'}</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 space-y-4">
          <h2 className="text-sm font-bold">Vente</h2>
          <label className="block text-xs font-semibold">
            Statut
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminProductStatus)} className={`${inputClass} mt-1`}>
              {(Object.keys(PRODUCT_STATUS_LABELS) as AdminProductStatus[]).map((s) => (
                <option key={s} value={s}>
                  {PRODUCT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {status === 'ON_QUOTE' && <span className="block mt-1 font-normal text-gray-500">Affiché avec « Demander un devis » au lieu de « Ajouter au panier ».</span>}
            {status === 'HIDDEN' && <span className="block mt-1 font-normal text-gray-500">Invisible sur la boutique et dans la recherche.</span>}
            {status !== 'HIDDEN' && status !== 'ON_QUOTE' && (
              <span className="block mt-1 font-normal text-gray-500">Publié : sans stock, il reste visible avec le badge « En rupture » et l’achat désactivé.</span>
            )}
          </label>
          <label className="block text-xs font-semibold">
            Prix de vente (FCFA) *
            <input type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs font-semibold">
            Prix barré (facultatif)
            <input type="number" min={0} value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Mettre en avant (produits phares de l’accueil)
          </label>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Variantes, prix et stock</h2>
          <button type="button" onClick={() => setVariants((prev) => [...prev, { ...NEW_VARIANT }])} className="inline-flex items-center gap-1 text-xs font-semibold text-[#24582d]">
            <Plus className="h-3.5 w-3.5" /> Ajouter une variante
          </button>
        </div>
        <p className="text-[11px] text-gray-500">
          Ex. Petit / Moyen / Grand. Le SKU est généré s’il est vide. {product ? 'Une modification du stock est enregistrée comme mouvement d’inventaire.' : ''}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2 pr-2">Nom *</th>
                <th className="py-2 pr-2">SKU</th>
                <th className="py-2 pr-2">Prix (FCFA) *</th>
                <th className="py-2 pr-2">Stock</th>
                <th className="py-2 pr-2">Seuil d’alerte</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id ?? `nouvelle-${i}`}>
                  <td className="py-1 pr-2">
                    <input value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} aria-label={`Nom de la variante ${i + 1}`} className={inputClass} />
                  </td>
                  <td className="py-1 pr-2">
                    <input value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} aria-label={`SKU de la variante ${i + 1}`} className={inputClass} />
                  </td>
                  <td className="py-1 pr-2">
                    <input type="number" min={0} value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} aria-label={`Prix de la variante ${i + 1}`} className={inputClass} />
                  </td>
                  <td className="py-1 pr-2">
                    <input type="number" min={0} value={v.stockQuantity} onChange={(e) => setVariant(i, { stockQuantity: e.target.value })} aria-label={`Stock de la variante ${i + 1}`} className={inputClass} />
                  </td>
                  <td className="py-1 pr-2">
                    <input type="number" min={0} value={v.minStockAlert} onChange={(e) => setVariant(i, { minStockAlert: e.target.value })} aria-label={`Seuil d’alerte de la variante ${i + 1}`} className={inputClass} />
                  </td>
                  <td className="py-1">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                        className="p-2 rounded-lg border border-red-200 text-red-600"
                        aria-label={`Retirer la variante ${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#e7e4dd] p-5 space-y-3">
        <h2 className="text-sm font-bold">Photos</h2>
        <ImageUploader
          multiple
          folder="products"
          maxFiles={10}
          value={images}
          onChange={setImages}
          primaryImage={primaryImage}
          onPrimaryChange={setPrimaryImage}
          description="Glissez vos photos ou cliquez pour parcourir ; cliquez sur une photo pour en faire la photo principale."
        />
      </section>
    </form>
  );
}
