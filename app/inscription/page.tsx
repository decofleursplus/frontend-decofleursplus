import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Créer un compte — Décofleur Plus',
  description:
    'Rejoignez la communauté Décofleur Plus pour profiter d’offres exclusives et commander vos bouquets en toute simplicité.',
};

export default function SignUpPage() {
  return (
    <AuthPageLayout mode="inscription">
      <RegisterForm />
    </AuthPageLayout>
  );
}
