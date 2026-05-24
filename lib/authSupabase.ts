import { supabase } from './supabase';

export type AppRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  full_name?: string;
  role: AppRole;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

function mapSupabaseUserToAppUser(appUser: any): User {
  return {
    id: appUser.id,
    username: appUser.user_metadata?.username || appUser.user_metadata?.preferred_username || appUser.user_metadata?.full_name || 'user',
    full_name: appUser.user_metadata?.full_name,
    role: (appUser.user_metadata?.role as AppRole) || 'user',
    email: appUser.email,
  };
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
}

export function isUserAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export async function refreshUserFromSession(): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  const sessionUser = data.session?.user;
  if (!sessionUser) return null;

  const appUser = mapSupabaseUserToAppUser(sessionUser);
  localStorage.setItem('currentUser', JSON.stringify(appUser));
  localStorage.setItem('isAuthenticated', 'true');
  return appUser;
}

export async function login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Supabase auth login se fait par email. On tente d'abord.
    const identifier = usernameOrEmail.trim();

    // Si c'est un email => login direct.
    const isEmail = identifier.includes('@');

    let emailToLogin = identifier;

    // Sinon: rechercher l'email depuis la table users (si elle existe) ou via un mapping.
    // Ici on utilise la table `profiles` (si vous l'avez). Sinon fallback sur `users`.
    if (!isEmail) {
      const { data: u1 } = await supabase
        .from('users')
        .select('email')
        .eq('username', identifier)
        .maybeSingle();

      if (!u1?.email) {
        return { success: false, error: 'Identifiants invalides' };
      }

      emailToLogin = u1.email;
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) return { success: false, error: error.message };

    const sessionUser = authData.user;
    const appUser = mapSupabaseUserToAppUser(sessionUser);

    localStorage.setItem('currentUser', JSON.stringify(appUser));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: appUser };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erreur lors de la connexion' };
  }
}

export async function signUp(email: string, password: string, fullName: string, username: string): Promise<AuthResponse> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // 1) Supabase Auth signUp
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          role: 'user',
        },
      },
    });

    if (error) return { success: false, error: error.message };

    // 2) Stockage local (l'utilisateur peut être en attente email confirmation selon config)
    if (data.user) {
      const appUser = mapSupabaseUserToAppUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(appUser));
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: appUser };
    }

    // Si user pas auto connecté (confirmation), on renvoie succès pour redirection.
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erreur lors de la création du compte' };
  }
}

export function logout(): void {
  if (!supabase) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    }
    return;
  }

  // Supabase signOut (async) mais on purge local tout de suite.
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }

  supabase.auth.signOut();
}

