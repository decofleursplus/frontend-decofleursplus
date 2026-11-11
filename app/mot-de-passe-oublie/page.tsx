import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Mot de passe oublié | Décofleur Plus',
  description:
    'Réinitialisez votre mot de passe pour retrouver facilement l’accès à votre compte Décofleur Plus.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout mode="mot-de-passe-oublie">
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
