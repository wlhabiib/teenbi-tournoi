import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signUp } from '@/lib/authSupabase';

/* eslint-disable react/no-unescaped-entities */

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, fullName, username);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(result.error || 'Erreur lors de la création du compte');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      {/* Fond avec gradient dorée subtil */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              TOURNOI TEENBI
            </span>
          </h1>
          <p className="text-yellow-200 text-lg">Créer un compte</p>
          <p className="text-yellow-100/70 text-sm mt-2">Rejoignez la communauté</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-yellow-400/20 p-6 md:p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(250,204,21,0.15)] transition-all duration-500 group overflow-hidden relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            Créer un compte
          </h2>

          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✓</div>
              <p className="text-yellow-200 mb-4 font-semibold">Compte créé avec succès !</p>
              <p className="text-slate-300 text-sm">Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 md:space-y-5 relative z-10">
              <div className="group/input">
                <label className="block text-yellow-200 mb-2 font-semibold text-sm">Nom complet</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)] text-sm md:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="group/input">
                <label className="block text-yellow-200 mb-2 font-semibold text-sm">Nom d'utilisateur</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jeandupont"
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)] text-sm md:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="group/input">
                <label className="block text-yellow-200 mb-2 font-semibold text-sm">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@email.com"
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)] text-sm md:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="group/input">
                <label className="block text-yellow-200 mb-2 font-semibold text-sm">Mot de passe</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)] text-sm md:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="group/input">
                <label className="block text-yellow-200 mb-2 font-semibold text-sm">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)] text-sm md:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 md:p-4 text-red-300 text-xs md:text-sm animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 md:py-3 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-[0_0_80px_rgba(250,204,21,0.8),0_0_120px_rgba(250,204,21,0.5)] relative overflow-hidden group/btn text-sm md:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover/btn:translate-x-full duration-1000" />
                <span className="relative">{loading ? 'Création en cours...' : 'Créer mon compte'}</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-yellow-400/10 text-center relative z-10">
            <p className="text-slate-300 text-xs md:text-sm">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-secondary/70 text-sm">
          <p>Plateforme Réservée</p>
          <p className="mt-1">Joueurs • Supporters • Administrateurs</p>
        </div>
      </div>

      <style jsx>{`
        input:focus {
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.3), inset 0 0 8px rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </div>
  );
}

