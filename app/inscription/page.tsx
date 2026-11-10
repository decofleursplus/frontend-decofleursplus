import { Suspense } from 'react';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { RegisterForm } from '@/components/auth/register-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Créer un compte — Décofleur Plus',
  description:
    'Rejoignez la communauté Décofleur Plus pour profiter d’offres exclusives et commander vos bouquets en toute simplicité.',
};

function AuthFallback() {
  return (
    <div className="auth-card-body flex items-center justify-center p-12">
      <Loader2 size={24} className="animate-spin text-[#173f22]" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthPageLayout mode="inscription">
      <Suspense fallback={<AuthFallback />}>
        <RegisterForm />
      </Suspense>
    </AuthPageLayout>
  );
}
