import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { getCurrentUser, isAuthenticated } from "@/lib/authSupabase";

// Pages publiques (pas besoin de connexion)
const PUBLIC_PAGES = ["/login", "/signup"];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      const authenticated = isAuthenticated();

      if (authenticated && user) {
        setIsLoading(false);
        return;
      }

      // Rediriger vers login si pas authentifié et page protégée
      if (!PUBLIC_PAGES.includes(router.pathname)) {
        router.replace("/login");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading && !PUBLIC_PAGES.includes(router.pathname)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1200 0%, #0d0900 50%, #000000 100%)',
        }}
      >
        {/* Halos dorés */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 70%)' }} />

        {/* Icône */}
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,197,24,0.5),0_0_120px_rgba(245,197,24,0.2)] border-2 border-yellow-400/40">
            <img src="/icon-teenbi.jpeg" alt="Teenbi" className="w-full h-full object-cover" />
          </div>
          {/* Anneau doré animé */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-yellow-400/30 animate-ping" />
        </div>

        {/* Nom */}
        <h1 className="text-4xl font-black tracking-widest mb-2" style={{ background: 'linear-gradient(135deg, #f5c518, #fde68a, #f5c518)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TEENBI
        </h1>
        <p className="text-yellow-400/60 text-sm tracking-widest uppercase mb-10">Tournoi de Fraternité</p>

        {/* Barre de chargement */}
        <div className="w-48 h-0.5 bg-yellow-400/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;

