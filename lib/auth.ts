import { supabase } from './supabase';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Récupérer l'utilisateur actuel depuis localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// Vérifier si l'utilisateur est admin
export function isUserAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

// Fonction de connexion
export async function login(username: string, password: string): Promise<AuthResponse> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Récupérer l'utilisateur par nom d'utilisateur
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username);

    if (error) {
      return { success: false, error: 'Erreur lors de la vérification des identifiants' };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'Identifiants invalides' };
    }

    const user = users[0];

    // Pour ce projet, nous utilisons une simple vérification
    // En production, utiliser bcryptjs pour comparer les hashs
    if (user.password_hash === password || user.password_hash === `hash_${password}`) {
      // Connexion réussie
      const authenticatedUser: User = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      };

      // Sauvegarder la session
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      localStorage.setItem('isAuthenticated', 'true');

      return { success: true, user: authenticatedUser };
    } else {
      return { success: false, error: 'Identifiants invalides' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

// Fonction de déconnexion
export function logout(): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
}

// Vérifier si authentifié
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
}
