import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCurrentUser, login, refreshUserFromSession } from '@/lib/authSupabase';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/* eslint-disable react/no-unescaped-entities */

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Si une session existe déjà, on recharge l’utilisateur et on redirige.
    refreshUserFromSession().then(() => {
      const user = getCurrentUser();
      if (user) {
        router.push(user.role === 'admin' ? '/admin' : '/');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await login(usernameOrEmail, password);

    if (result.success && result.user) {
      router.push(result.user.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.error || 'Erreur de connexion');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
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
          <p className="text-yellow-200 text-lg">Plateforme de Gestion</p>
          <p className="text-yellow-100/70 text-sm mt-2">Connexion sécurisée</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-yellow-400/20 p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(250,204,21,0.15)] transition-all duration-500 group overflow-hidden relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            Connexion
          </h2>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="group/input">
              <label className="block text-yellow-200 mb-2 font-semibold text-sm">Nom d'utilisateur ou Email</label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin ou email"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)]"
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
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-yellow-400/20 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_50px_rgba(250,204,21,0.5),0_0_80px_rgba(250,204,21,0.3)]"
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-[0_0_80px_rgba(250,204,21,0.8),0_0_120px_rgba(250,204,21,0.5)] relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover/btn:translate-x-full duration-1000" />
              <span className="relative">{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-yellow-400/10 text-center relative z-10 space-y-4">
            {/* Bouton installation PWA */}
            {isInstalled ? (
              <p className="text-green-400 text-sm font-semibold">✅ Application déjà installée</p>
            ) : installPrompt ? (
              <button
                onClick={handleInstallPWA}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-slate-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_25px_rgba(250,204,21,0.5)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.9),0_0_45px_rgba(250,204,21,0.7)] border border-yellow-300/50"
              >
                <span className="text-xl">📲</span>
                <span>Installer l&apos;application</span>
              </button>
            ) : (
              <button
                onClick={() => alert("Pour installer :\n\n📱 Android : Menu navigateur (⋮) → « Ajouter à l'écran d'accueil »\n\n🍎 iPhone : Bouton Partager (□↑) → « Sur l'écran d'accueil »\n\n💻 Chrome/Edge PC : icône ⊕ dans la barre d'adresse")}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-slate-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_25px_rgba(250,204,21,0.5)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.9),0_0_45px_rgba(250,204,21,0.7)] border border-yellow-300/50"
              >
                <span className="text-xl">📲</span>
                <span>Installer l&apos;application</span>
              </button>
            )}
            <p className="text-slate-300 text-sm">
              Pas de compte ?{' '}
              <Link href="/signup" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-secondary/70 text-sm">
          <p>Plateforme Réservée</p>
          <p className="mt-1">Joueurs • Supporters • Administrateurs</p>
        </div>
      </div>
    </div>
  );
}

