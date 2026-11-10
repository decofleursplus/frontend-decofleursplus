import { Suspense } from 'react';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Connexion — Décofleur Plus',
  description:
    'Connectez-vous à votre compte client Décofleur Plus pour suivre vos commandes, vos favoris et vos adresses.',
};

function AuthFallback() {
  return (
    <div className="auth-card-body flex items-center justify-center p-12">
      <Loader2 size={24} className="animate-spin text-[#173f22]" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthPageLayout mode="connexion">
      <Suspense fallback={<AuthFallback />}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
