'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // Hardcoded credentials for demonstration
  if (email === 'admin@decofleur.com' && password === 'admin123') {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    redirect('/admin/tableau-de-bord');
  } else {
    return { error: 'Identifiants invalides. Veuillez réessayer.' };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  redirect('/admin/connexion');
}
