'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, ADMIN_TOKEN_KEY } from '@/lib/api/config';

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Veuillez saisir votre adresse e-mail et votre mot de passe.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ identifier: email, password }),
      cache: 'no-store',
    });

    const data = await res.json();

    if (res.ok && data?.success && data?.data) {
      const { user, token } = data.data;

      // Vérifier les permissions de l'utilisateur
      const staffRoles = ['ADMIN', 'MANAGER', 'FLORIST', 'DELIVERY', 'SALES', 'ACCOUNTANT'];
      if (!staffRoles.includes(user?.role)) {
        return {
          error: 'Accès refusé. Ce compte ne dispose pas des privilèges administrateur nécessaires.',
        };
      }

      const cookieStore = await cookies();
      cookieStore.set('admin_auth', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      if (token) {
        cookieStore.set(ADMIN_TOKEN_KEY, token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      cookieStore.set('admin_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      redirect('/admin/tableau-de-bord');
    }

    // Fallback mode démonstration si l'API renvoie une erreur
    if (email === 'admin@decofleur.com' && password === 'admin123') {
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      redirect('/admin/tableau-de-bord');
    }

    const errorMsg = data?.error?.message || data?.message || 'Identifiants invalides. Veuillez réessayer.';
    return { error: errorMsg };
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }

    // En cas d'erreur réseau avec le backend, autoriser le compte démo de secours
    if (email === 'admin@decofleur.com' && password === 'admin123') {
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      redirect('/admin/tableau-de-bord');
    }

    return { error: 'Impossible de contacter le serveur d’authentification. Veuillez réessayer.' };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  cookieStore.delete(ADMIN_TOKEN_KEY);
  cookieStore.delete('admin_user');
  redirect('/admin/connexion');
}
