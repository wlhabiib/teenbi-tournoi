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

// Utilisateur admin par défaut
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  full_name: 'Administrateur',
  role: 'admin',
  email: 'admin@tournoi-teenbi.com',
};

// Stocker les utilisateurs en mémoire/localStorage
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
  const user = getCurrentUser();
  return user || null;
}

export async function login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  try {
    const identifier = usernameOrEmail.trim();
    const pwd = password.trim();

    // Admin local prédéfini
    if ((identifier === 'admin' || identifier === 'admin@tournoi-teenbi.com') && pwd === '1234') {
      localStorage.setItem('currentUser', JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: DEFAULT_ADMIN };
    }

    // Vérifier dans localStorage (utilisateurs créés localement)
    const storedUser = localStorage.getItem(`user_${identifier}`);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.password_hash === pwd) {
          const appUser: User = {
            id: userData.id,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            email: userData.email,
          };
          localStorage.setItem('currentUser', JSON.stringify(appUser));
          localStorage.setItem('isAuthenticated', 'true');
          return { success: true, user: appUser };
        }
      } catch (e) {
        // Erreur parsing
      }
    }

    // Essayer Supabase si disponible
    if (supabase) {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${identifier},email.eq.${identifier}`);

        if (!error && users && users.length > 0) {
          const user = users[0];
          if (user.password_hash === pwd) {
            const authenticatedUser: User = {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              role: user.role,
              email: user.email,
            };
            localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
            localStorage.setItem('isAuthenticated', 'true');
            return { success: true, user: authenticatedUser };
          }
        }
      } catch (e) {
        // Supabase non disponible, continuer
      }
    }

    return { success: false, error: 'Identifiants invalides' };
  } catch (e: any) {
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

export async function signUp(email: string, password: string, fullName: string, username: string): Promise<AuthResponse> {
  try {
    const emailTrim = email.trim();
    const usernameTrim = username.trim();

    // Vérifier si username ou email existent (localStorage + Supabase)
    const existingUser = localStorage.getItem(`user_${usernameTrim}`);
    if (existingUser) {
      return { success: false, error: 'Nom d\'utilisateur déjà utilisé' };
    }

    // Essayer Supabase si disponible
    if (supabase) {
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${usernameTrim},email.eq.${emailTrim}`);

        if (existingUsers && existingUsers.length > 0) {
          return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
        }

        // Insérer dans Supabase
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([
            {
              username: usernameTrim,
              email: emailTrim,
              full_name: fullName,
              password_hash: password,
              role: 'user',
            },
          ])
          .select()
          .single();

        if (!error && newUser) {
          const appUser: User = {
            id: newUser.id,
            username: newUser.username,
            full_name: newUser.full_name,
            role: newUser.role,
            email: newUser.email,
          };
          localStorage.setItem('currentUser', JSON.stringify(appUser));
          localStorage.setItem('isAuthenticated', 'true');
          return { success: true, user: appUser };
        }
      } catch (e) {
        // Supabase non disponible, utiliser localStorage
      }
    }

    // Fallback: stocker localement
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: usernameTrim,
      full_name: fullName,
      role: 'user',
      email: emailTrim,
    };

    // Stocker le mot de passe en localStorage (démo uniquement!)
    localStorage.setItem(`user_${usernameTrim}`, JSON.stringify({ ...newUser, password_hash: password }));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: newUser };
  } catch (e: any) {
    return { success: false, error: 'Erreur lors de la création du compte' };
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }
}

