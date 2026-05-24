import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCurrentUser, logout, isUserAdmin } from '@/lib/auth';
import type { User } from '@/lib/auth';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [router.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowUserMenu(false);
    router.push('/login');
  };

  const baseItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Équipes', href: '/equipes' },
    { label: 'Parrain', href: '/parrain' },
    { label: 'Tirage au sort', href: '/tirage' },
    { label: 'Supporters', href: '/supporters' },
    { label: 'Résultats', href: '/resultats' },
  ];

  // Ajouter l'onglet Admin uniquement si admin
  const navItems = user && isUserAdmin() 
    ? [...baseItems, { label: 'Admin', href: '/admin' }]
    : baseItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-primary to-secondary/10 border-b border-secondary/30 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start gap-8">
            <Link href="/" className="text-xl font-bold text-gold">
              Tournoi Teenbi
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-secondary/20 hover:text-gold ${
                    router.pathname === item.href
                      ? 'text-gold bg-secondary/20'
                      : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Profil utilisateur ou bouton connexion */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-secondary transition-all"
                >
                  <span className="text-sm font-semibold">{user.username}</span>
                  <span className="text-xs bg-accent/20 px-2 py-1 rounded text-accent font-bold">
                    {user.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-primary border border-secondary/30 rounded-lg shadow-lg overflow-hidden z-10">
                    <div className="px-4 py-3 border-b border-secondary/20">
                      <p className="text-sm text-secondary">{user.full_name || user.username}</p>
                      <p className="text-xs text-secondary/70">
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-secondary hover:bg-secondary/20 transition-all text-sm font-medium"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
