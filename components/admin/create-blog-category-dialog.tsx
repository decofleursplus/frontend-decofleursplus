'use client';

import { useState, useEffect } from 'react';
import type { BlogCategory } from '@/lib/admin/mock-data/types';
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
import { FolderTree, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CreateBlogCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BlogCategory | null;
  onSave: (category: BlogCategory) => void;
}

const COLOR_PRESETS = [
  { label: 'Rose Fleuriste', hex: '#d65d7a' },
  { label: 'Ambre Cérémonie', hex: '#c28b2d' },
  { label: 'Violet Orchidée', hex: '#8b5cf6' },
  { label: 'Vert Forêt', hex: '#2d7a46' },
  { label: 'Bleu Océan', hex: '#2563eb' },
  { label: 'Corail Chaud', hex: '#ea580c' },
];

export function CreateBlogCategoryDialog({
  isOpen,
  onOpenChange,
  category,
  onSave,
}: CreateBlogCategoryDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#d65d7a');
  const [coverImage, setCoverImage] = useState('/images/bouquet-detail.jpg');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description);
      setColor(category.color || '#d65d7a');
      setCoverImage(category.coverImage || '/images/bouquet-detail.jpg');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setColor('#d65d7a');
      setCoverImage('/images/bouquet-detail.jpg');
    }
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez renseigner un nom de catégorie.');
      return;
    }

    const savedCategory: BlogCategory = {
      id: category ? category.id : `bcat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      description: description.trim(),
      color,
      articlesCount: category ? category.articlesCount : 0,
      coverImage,
    };

    onSave(savedCategory);
    onOpenChange(false);
    toast.success(
      category
        ? `Catégorie « ${savedCategory.name} » mise à jour.`
        : `Catégorie « ${savedCategory.name} » créée.`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-[#ece8e1]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-[#f0eee8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#24582d]/10 flex items-center justify-center text-[#24582d]">
                <FolderTree size={18} />
              </div>
              <div>
                <DialogTitle className="text-lg font-serif text-[#1e2a1f]">
                  {category ? 'Modifier la catégorie' : 'Nouvelle catégorie de blog'}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777]">
                  Structurez vos articles par thématiques éditoriales
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="cat-name" className="text-xs font-semibold text-[#444]">
                Nom de la catégorie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ex: Soins & Entretien des Roses"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="cat-slug" className="text-xs font-semibold text-[#444]">
                Slug URL
              </Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="soins-entretien-roses"
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#444] mb-1.5 block">
                Couleur du badge
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColor(preset.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all"
                    style={{
                      borderColor: color === preset.hex ? preset.hex : '#e7e4dd',
                      backgroundColor: color === preset.hex ? `${preset.hex}15` : '#fff',
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-[11px] font-medium text-[#444]">{preset.label}</span>
                    {color === preset.hex && <Check size={12} style={{ color: preset.hex }} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cat-desc" className="text-xs font-semibold text-[#444]">
                Description de la thématique
              </Label>
              <textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez en quelques mots les sujets abordés dans cette catégorie..."
                className="mt-1 w-full p-2.5 rounded-md border border-[#e7e4dd] bg-white text-xs text-[#333] focus:outline-none focus:ring-2 focus:ring-[#24582d]/20"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-[#f0eee8] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-[#24582d] hover:bg-[#1a4021] text-white"
            >
              {category ? 'Enregistrer' : 'Créer la catégorie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
