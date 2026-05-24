import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();

  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Équipes', href: '/equipes' },
    { label: 'Tirage au sort', href: '/tirage' },
    { label: 'Supporters', href: '/supporters' },
    { label: 'Résultats', href: '/resultats' },
    { label: 'Admin', href: '/admin' },
  ];

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
        </div>
      </div>
    </nav>
  );
}
