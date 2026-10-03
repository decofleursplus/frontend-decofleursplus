import { AuthForm } from '@/components/auth-form';

export default function SignInPage() {
  return (
    <main className="auth-viewport-wrapper">
      <AuthForm mode="connexion" />
    </main>
  );
}
