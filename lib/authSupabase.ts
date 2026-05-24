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
  // Récupérer l'utilisateur depuis localStorage
  const user = getCurrentUser();
  return user || null;
}

export async function login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const identifier = usernameOrEmail.trim();
    
    // Rechercher l'utilisateur par username ou email dans la table users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier}`);

    if (error || !users || users.length === 0) {
      return { success: false, error: 'Identifiants invalides' };
    }

    const user = users[0];

    // Vérifier le mot de passe (stocké en plain text dans la démo)
    if (user.password_hash !== password) {
      return { success: false, error: 'Identifiants invalides' };
    }

    // Créer l'objet utilisateur pour l'app
    const appUser: User = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
    };

    // Stocker en localStorage
    localStorage.setItem('currentUser', JSON.stringify(appUser));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: appUser };
  } catch (e: any) {
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

export async function signUp(email: string, password: string, fullName: string, username: string): Promise<AuthResponse> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const emailTrim = email.trim();
    const usernameTrim = username.trim();

    // Vérifier si username ou email existent déjà
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${usernameTrim},email.eq.${emailTrim}`);

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
    }

    // Insérer le nouvel utilisateur dans la table users
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username: usernameTrim,
          email: emailTrim,
          full_name: fullName,
          password_hash: password,  // En production, utiliser bcrypt !
          role: 'user',
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    // Créer l'objet utilisateur pour l'app
    const appUser: User = {
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.full_name,
      role: newUser.role,
      email: newUser.email,
    };

    // Stocker en localStorage
    localStorage.setItem('currentUser', JSON.stringify(appUser));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: appUser };
  } catch (e: any) {
    return { success: false, error: 'Erreur lors de la création du compte' };
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

