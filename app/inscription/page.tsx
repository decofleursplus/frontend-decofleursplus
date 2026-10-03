import { AuthForm } from '@/components/auth-form';

export default function SignUpPage() {
  return (
    <main className="auth-viewport-wrapper">
      <AuthForm mode="inscription" />
    </main>
  );
}
