'use client';

import { useState } from 'react';
import type { BlogAuthor } from '@/lib/admin/mock-data/types';
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
import { UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AuthorProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  author?: BlogAuthor | null;
  /** Résout à true si l'API a enregistré l'auteur (la fenêtre se ferme alors). */
  onSave: (author: BlogAuthor) => Promise<boolean>;
}

/** Le formulaire est remonté (key) à chaque ouverture : il repart toujours de l'auteur édité. */
export function AuthorProfileDialog(props: AuthorProfileDialogProps) {
  return <AuthorProfileForm key={props.isOpen ? `ouvert-${props.author?.id ?? 'nouveau'}` : 'ferme'} {...props} />;
}

function AuthorProfileForm({
  isOpen,
  onOpenChange,
  author,
  onSave,
}: AuthorProfileDialogProps) {
  const [name, setName] = useState(author?.name ?? '');
  const [role, setRole] = useState(author ? author.role : 'Artisan Fleuriste');
  const [bio, setBio] = useState(author?.bio ?? '');
  const [avatar, setAvatar] = useState(author ? author.avatar || 'FD' : 'AF');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Veuillez renseigner le nom de l'auteur.");
      return;
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const savedAuthor: BlogAuthor = {
      id: author ? author.id : `author-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Rédacteur Décofleur',
      avatar: avatar.trim() || initials || 'DF',
      bio: bio.trim(),
      articlesCount: author ? author.articlesCount : 0,
    };

    if (!(await onSave(savedAuthor))) return;
    onOpenChange(false);
    toast.success(
      author
        ? `Profil de « ${savedAuthor.name} » mis à jour.`
        : `Auteur « ${savedAuthor.name} » ajouté.`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-md bg-white border-[#ece8e1] p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-[#f0eee8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#24582d]/10 flex items-center justify-center text-[#24582d]">
                <UserCheck size={18} />
              </div>
              <div>
                <DialogTitle className="text-lg font-serif text-[#1e2a1f]">
                  {author ? "Modifier l'auteur" : 'Ajouter un rédacteur / auteur'}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777]">
                  Les auteurs signent les articles et apparaissent sur la boutique
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#24582d] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {avatar || 'FD'}
              </div>
              <div className="flex-1">
                <Label htmlFor="author-avatar" className="text-xs font-semibold text-[#444]">
                  Initiales de l’avatar
                </Label>
                <Input
                  id="author-avatar"
                  value={avatar}
                  maxLength={3}
                  onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                  placeholder="FD"
                  className="mt-1 text-xs w-20 text-center font-bold"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="author-name" className="text-xs font-semibold text-[#444]">
                Nom & Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Fatou Diop"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="author-role" className="text-xs font-semibold text-[#444]">
                Rôle éditorial / Titre
              </Label>
              <Input
                id="author-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="ex: Maître Artisan Fleuriste"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="author-bio" className="text-xs font-semibold text-[#444]">
                Biographie courte
              </Label>
              <textarea
                id="author-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quelques lignes de présentation sur son parcours et son expertise..."
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
              {author ? 'Enregistrer' : 'Ajouter le rédacteur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
