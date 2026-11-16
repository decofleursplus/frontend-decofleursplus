import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_TOKEN_KEY } from '@/lib/api/config';
import { ChangeTemporaryPasswordForm } from './change-password-form';

/**
 * Premier passage d'un collaborateur (ou mot de passe réinitialisé par l'administrateur) :
 * il doit remplacer son mot de passe temporaire avant d'accéder au back-office.
 */
export default async function AdminChangePasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_KEY) || cookieStore.get('df_admin_token');
  if (cookieStore.get('admin_auth')?.value !== 'true' || !token?.value) redirect('/admin/connexion');
  return <ChangeTemporaryPasswordForm />;
}
