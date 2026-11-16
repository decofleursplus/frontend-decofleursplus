'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { logoutAdmin } from '../connexion/actions';

const MIN_LENGTH = 8;

export function ChangeTemporaryPasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_LENGTH) return setError(`Le nouveau mot de passe doit comporter au moins ${MIN_LENGTH} caractères.`);
    if (next !== confirm) return setError('Les deux nouveaux mots de passe ne sont pas identiques.');
    if (next === current) return setError('Choisissez un mot de passe différent du mot de passe temporaire.');
    setError(null);
    setSaving(true);
    try {
      await apiClient.patch('/customers/me/password', { currentPassword: current, newPassword: next }, { useAdminToken: true });
      // Le back-office s'ouvre sur le premier écran autorisé pour ce compte
      router.replace('/admin/tableau-de-bord');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Le mot de passe n’a pas pu être modifié. Réessayez.');
      setSaving(false);
    }
  };

  const type = show ? 'text' : 'password';

  return (
    <AuthPageLayout mode="admin-connexion">
      <div className="text-center mb-8">
        <ShieldCheck className="mx-auto mb-3 h-9 w-9 text-[#24582d]" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre mot de passe</h1>
        <p className="text-sm text-gray-500">
          Vous utilisez un mot de passe temporaire. Pour accéder au back-office, remplacez-le par un mot de passe connu de
          vous seul.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="p-3 text-sm text-[#c1647a] bg-[#fdf5f7] border border-[#f9e1e6] rounded-md text-center">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-[#444]">
            Mot de passe temporaire (reçu par email)
          </Label>
          <Input id="current-password" type={type} autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-password" className="text-[#444]">
              Nouveau mot de passe
            </Label>
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
              aria-label={show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          <Input id="new-password" type={type} autoComplete="new-password" required minLength={MIN_LENGTH} value={next} onChange={(e) => setNext(e.target.value)} />
          <p className="text-xs text-gray-500">Au moins {MIN_LENGTH} caractères.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-[#444]">
            Confirmer le nouveau mot de passe
          </Label>
          <Input id="confirm-password" type={type} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" disabled={saving || !current || !next || !confirm} className="w-full bg-[#24582d] hover:bg-[#1d4724] text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? 'Enregistrement…' : 'Enregistrer et accéder au back-office'}
        </Button>
      </form>
      <form action={logoutAdmin} className="mt-4 text-center">
        <button type="submit" className="text-xs text-gray-500 underline-offset-2 hover:underline">
          Se déconnecter
        </button>
      </form>
    </AuthPageLayout>
  );
}
