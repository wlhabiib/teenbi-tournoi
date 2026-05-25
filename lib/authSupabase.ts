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

    console.log('[SignUp] Starting signup for:', usernameTrim, emailTrim);

    // Vérifier que Supabase est disponible
    if (!supabase) {
      console.error('[SignUp] Supabase client is null!');
      return { success: false, error: 'Service indisponible. Veuillez réessayer plus tard.' };
    }
    console.log('[SignUp] Supabase client OK');

    // Vérifier si l'utilisateur existe déjà
    console.log('[SignUp] Checking existing users...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${usernameTrim},email.eq.${emailTrim}`);

    console.log('[SignUp] Check existing result:', { existingUsers, checkError });

    if (checkError) {
      console.error('[SignUp] Error checking existing users:', checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('[SignUp] User already exists');
      return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
    }

    // Insérer dans Supabase UNIQUEMENT
    console.log('[SignUp] Inserting user into Supabase:', usernameTrim);
    const insertData = {
      username: usernameTrim,
      email: emailTrim,
      password_hash: password,
      role: 'user',
    };
    console.log('[SignUp] Insert data:', insertData);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    console.log('[SignUp] Supabase insert response:', { newUser, error });

    if (error) {
      console.error('[SignUp] Supabase insert error:', error);
      console.error('[SignUp] Error code:', error.code);
      console.error('[SignUp] Error details:', error.details);
      console.error('[SignUp] Error hint:', error.hint);
      return { success: false, error: `Erreur Supabase: ${error.message} (Code: ${error.code})` };
    }

    if (!newUser) {
      console.error('[SignUp] No user returned after insert');
      return { success: false, error: 'Erreur lors de la création du compte - aucune donnée retournée' };
    }

    console.log('[SignUp] User created successfully:', newUser);

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
    console.error('[SignUp] Exception:', e);
    console.error('[SignUp] Exception message:', e.message);
    console.error('[SignUp] Exception stack:', e.stack);
    return { success: false, error: `Erreur lors de la création du compte: ${e.message}` };
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    // Note: Les votes restent stockés par utilisateur
  }
}
