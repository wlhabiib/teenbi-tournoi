import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCurrentUser, logout, isUserAdmin } from '@/lib/authSupabase';
import type { User } from '@/lib/authSupabase';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [router.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const baseItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Équipes', href: '/equipes' },
    { label: 'Parrain', href: '/parrain' },
    { label: 'Tirage', href: '/tirage' },
    { label: 'Supporters', href: '/supporters' },
    { label: 'Résultats', href: '/resultats' },
  ];

  // Ajouter l'onglet Admin uniquement si admin
  const navItems = user && isUserAdmin() 
    ? [...baseItems, { label: 'Admin', href: '/admin' }]
    : baseItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-yellow-400/20 shadow-xl backdrop-blur-md hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] transition-shadow duration-300">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            TEENBI
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-300 relative group ${
                  router.pathname === item.href
                    ? 'text-yellow-300 bg-yellow-400/10'
                    : 'text-slate-300 hover:text-yellow-300'
                }`}
              >
                {item.label}
                {/* Lumière dorée au survol */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"></div>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ))}
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 hover:border-yellow-400/50 hover:bg-yellow-400/15 text-yellow-200 transition-all duration-300 group"
                >
                  <span className="hidden md:inline text-xs md:text-sm font-semibold">{user.username}</span>
                  <span className="text-xs bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-300 font-bold">
                    {user.role === 'admin' ? 'A' : 'U'}
                  </span>
                  {/* Lumière dorée */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"></div>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-yellow-400/20 rounded-lg shadow-lg overflow-hidden z-10 backdrop-blur-md">
                    <div className="px-4 py-3 border-b border-yellow-400/10 bg-gradient-to-r from-yellow-400/5 to-transparent">
                      <p className="text-xs md:text-sm text-yellow-200 font-semibold">{user.full_name || user.username}</p>
                      <p className="text-xs text-yellow-100/60">
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-yellow-200 hover:bg-yellow-400/10 hover:text-yellow-100 transition-all text-xs md:text-sm font-medium border-t border-yellow-400/10"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
              >
                Connexion
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-yellow-300 hover:bg-yellow-400/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 pt-2 border-t border-yellow-400/20 bg-gradient-to-b from-slate-900/50 to-transparent">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  router.pathname === item.href
                    ? 'text-yellow-300 bg-yellow-400/10'
                    : 'text-slate-300 hover:text-yellow-300 hover:bg-yellow-400/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
