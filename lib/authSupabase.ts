import { supabase } from './supabase';

export type AppRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: AppRole;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Utilisateur admin par défaut (mot de passe: admin123)
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  role: 'admin',
  email: 'admin@tournoi-teenbi.com',
};

const DEFAULT_ADMIN_PASSWORD = 'admin123';

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

    // Vérifier l'admin par défaut (fonctionne sans Supabase)
    if (identifier === 'admin' && pwd === DEFAULT_ADMIN_PASSWORD) {
      localStorage.setItem('currentUser', JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: DEFAULT_ADMIN };
    }

    // Vérifier que Supabase est disponible
    if (!supabase) {
      return { success: false, error: 'Service indisponible. Veuillez réessayer plus tard.' };
    }

    // Connexion UNIQUEMENT via Supabase
    console.log('[Login] Trying Supabase for:', identifier);
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier}`);

    console.log('[Login] Supabase response:', { users, error });

    if (error) {
      console.error('[Login] Supabase error:', error);
      return { success: false, error: 'Erreur de connexion au service' };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'Identifiants invalides' };
    }

    const user = users[0];
    if (user.password_hash !== pwd) {
      return { success: false, error: 'Identifiants invalides' };
    }

    const authenticatedUser: User = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    };
    
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
    localStorage.setItem('isAuthenticated', 'true');
    return { success: true, user: authenticatedUser };
  } catch (e: any) {
    console.error('[Login] Exception:', e.message);
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    const emailTrim = email.trim();
    const usernameTrim = username.trim();

    // Vérifier que Supabase est disponible
    if (!supabase) {
      return { success: false, error: 'Service indisponible. Veuillez réessayer plus tard.' };
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${usernameTrim},email.eq.${emailTrim}`);

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
    }

    // Insérer dans Supabase UNIQUEMENT
    console.log('[SignUp] Inserting user into Supabase:', usernameTrim);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username: usernameTrim,
          email: emailTrim,
          password_hash: password,
          role: 'user',
        },
      ])
      .select()
      .single();

    console.log('[SignUp] Supabase response:', { newUser, error });

    if (error) {
      console.error('[SignUp] Supabase insert error:', error);
      return { success: false, error: `Erreur Supabase: ${error.message}` };
    }

    if (!newUser) {
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    const appUser: User = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
    };
    
    // Stocker seulement la session localement (pas les données utilisateur)
    localStorage.setItem('currentUser', JSON.stringify(appUser));
    localStorage.setItem('isAuthenticated', 'true');
    
    return { success: true, user: appUser };
  } catch (e: any) {
    console.error('[SignUp] Exception:', e.message);
    return { success: false, error: 'Erreur lors de la création du compte' };
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    // Note: Les votes restent stockés par utilisateur
  }
}
