import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '@/lib/auth';

/* eslint-disable react/no-unescaped-entities */

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      // Redirection basée sur le rôle
      if (result.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Erreur de connexion');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/95 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-2">TOURNOI TEENBI</h1>
          <p className="text-secondary text-lg">Plateforme de Gestion</p>
          <p className="text-secondary/70 text-sm mt-2">5ème Édition - De la Paternité</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-secondary/10 backdrop-blur-sm rounded-2xl border border-secondary/20 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Connexion</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Champ Nom d'utilisateur */}
            <div>
              <label className="block text-secondary mb-2 font-semibold">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                className="w-full px-4 py-3 rounded-lg bg-primary/50 border border-secondary/30 text-white placeholder-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                disabled={loading}
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-secondary mb-2 font-semibold">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 rounded-lg bg-primary/50 border border-secondary/30 text-white placeholder-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                disabled={loading}
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Info pour développement */}
          <div className="mt-6 pt-6 border-t border-secondary/20">
            <p className="text-secondary/70 text-xs text-center">
              <span className="font-semibold">Demo:</span> admin / 1234
            </p>
          </div>
        </div>

        {/* Informations utiles */}
        <div className="mt-8 text-center text-secondary/70 text-sm">
          <p>Plateforme Réservée</p>
          <p className="mt-1">Joueurs • Supporters • Administrateur</p>
        </div>
      </div>
    </div>
  );
}
