'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, ADMIN_TOKEN_KEY } from '@/lib/api/config';

export async function loginAdmin(_prevState: unknown, formData: FormData) {
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

    let data: {
      success?: boolean;
      data?: { user: { id: string; name?: string; firstName?: string; lastName?: string; email: string; role: string; avatar?: string | null }; token: string };
      error?: { message?: string; code?: string };
      message?: string;
    } | null = null;
    try {
      data = await res.json();
    } catch {
      return {
        error: `Erreur du serveur d'authentification (${res.status}). Veuillez réessayer plus tard.`,
      };
    }

    if (res.ok && data?.success && data?.data) {
      const { user, token } = data.data;

      // Vérifier les permissions de l'utilisateur
      const staffRoles = ['ADMIN', 'MANAGER', 'FLORIST', 'DELIVERY', 'SALES', 'ACCOUNTANT'];
      if (!staffRoles.includes(user?.role)) {
        return {
          error: 'Accès refusé. Ce compte ne dispose pas des privilèges administrateur nécessaires.',
        };
      }

      if (!token) {
        return {
          error: 'Jeton de sécurité non fourni par le serveur. Veuillez contacter le support technique.',
        };
      }

      const cookieStore = await cookies();
      const cookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      };

      cookieStore.set('admin_auth', 'true', cookieOptions);
      cookieStore.set(ADMIN_TOKEN_KEY, token, cookieOptions);
      cookieStore.set(
        'admin_user',
        JSON.stringify({
          id: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin',
          email: user.email,
          role: user.role,
          avatar: user.avatar || null,
        }),
        cookieOptions
      );

      redirect('/admin/tableau-de-bord');
    }

    const errorMsg =
      data?.error?.message ||
      data?.message ||
      (res.status === 401
        ? 'Identifiants invalides (email ou mot de passe incorrect).'
        : 'Échec de la connexion. Veuillez vérifier vos identifiants.');

    return { error: errorMsg };
  } catch (err: unknown) {
    // Si redirect a été levé par Next.js, propager l'exception de redirection
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as { digest: unknown }).digest === 'string' && (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }

    console.error('[Admin Login Error]:', err);
    return {
      error: 'Impossible de contacter le serveur d’authentification. Veuillez vérifier votre connexion.',
    };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const deleteOptions = { path: '/' };
  cookieStore.delete({ name: 'admin_auth', ...deleteOptions });
  cookieStore.delete({ name: ADMIN_TOKEN_KEY, ...deleteOptions });
  cookieStore.delete({ name: 'admin_user', ...deleteOptions });
  redirect('/admin/connexion');
}
