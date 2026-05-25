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

    // Essayer Supabase si disponible
    if (supabase) {
      try {
        console.log('[Login] Trying Supabase for:', identifier);
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${identifier},email.eq.${identifier}`);

        console.log('[Login] Supabase response:', { users, error });

        if (!error && users && users.length > 0) {
          const user = users[0];
          if (user.password_hash === pwd) {
            const authenticatedUser: User = {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email,
            };
            localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
            localStorage.setItem('isAuthenticated', 'true');
            return { success: true, user: authenticatedUser };
          }
        }
      } catch (e: any) {
        console.error('[Login] Supabase error:', e.message);
      }
    } else {
      console.log('[Login] Supabase client is null');
    }

    // Vérifier les utilisateurs locaux
    const localUsers = getLocalUsers();
    const localUser = localUsers.find(u => (u.username === identifier || u.email === identifier) && u.password_hash === pwd);
    if (localUser) {
      const authUser: User = {
        id: localUser.id,
        username: localUser.username,
        role: localUser.role as AppRole,
        email: localUser.email,
      };
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: authUser };
    }

    return { success: false, error: 'Identifiants invalides' };
  } catch (e: any) {
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    const emailTrim = email.trim();
    const usernameTrim = username.trim();

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

        if (!error && newUser) {
          const appUser: User = {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            email: newUser.email,
          };
          localStorage.setItem('currentUser', JSON.stringify(appUser));
          localStorage.setItem('isAuthenticated', 'true');
          return { success: true, user: appUser };
        }
        if (error) {
          console.error('[SignUp] Supabase insert error:', error);
        }
      } catch (e: any) {
        console.error('[SignUp] Supabase exception:', e.message);
      }
    }

    // Fallback: créer un utilisateur local
    const localUsers = getLocalUsers();
    if (localUsers.find(u => u.username === usernameTrim || u.email === emailTrim)) {
      return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
    }
    
    const newLocalUser = {
      id: 'local-' + Date.now(),
      username: usernameTrim,
      email: emailTrim,
      password_hash: password,
      role: 'user',
    };
    
    localUsers.push(newLocalUser);
    saveLocalUsers(localUsers);
    
    const appUser: User = {
      id: newLocalUser.id,
      username: newLocalUser.username,
      role: newLocalUser.role as AppRole,
      email: newLocalUser.email,
    };
    localStorage.setItem('currentUser', JSON.stringify(appUser));
    localStorage.setItem('isAuthenticated', 'true');
    return { success: true, user: appUser };
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

// Local storage helpers for users
function getLocalUsers(): any[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('localUsers');
  return raw ? JSON.parse(raw) : [];
}

function saveLocalUsers(users: any[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('localUsers', JSON.stringify(users));
  }
}
