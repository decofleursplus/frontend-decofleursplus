import { AuthForm } from '@/components/auth-form';

export default function ForgotPasswordPage() {
  return (
    <main className="auth-viewport-wrapper">
      <AuthForm mode="reset" />
    </main>
  );
}
