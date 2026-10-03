import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Connexion — Décofleur Plus',
  description:
    'Connectez-vous à votre compte client Décofleur Plus pour suivre vos commandes, vos favoris et vos adresses.',
};

export default function SignInPage() {
  return (
    <AuthPageLayout mode="connexion">
      <LoginForm />
    </AuthPageLayout>
  );
}
