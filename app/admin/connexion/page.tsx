'use client';

import { useActionState } from 'react';
import { loginAdmin } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, undefined);

  return (
    <AuthPageLayout mode="admin-connexion">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace d&apos;administration</h1>
        <p className="text-sm text-gray-500">
          Veuillez vous connecter pour accéder au back-office.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <div className="p-3 text-sm text-[#c1647a] bg-[#fdf5f7] border border-[#f9e1e6] rounded-md text-center">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#444]">
            Adresse e-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@decofleur.com"
            required
            className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 h-12"
            defaultValue="admin@decofleur.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[#444]">
              Mot de passe
            </Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="border-[#e7e4dd] focus-visible:ring-[#24582d]/20 h-12"
            defaultValue="admin123"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#c1647a] hover:bg-[#a95568] !text-white h-12 text-base font-medium rounded-xl mt-4"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
