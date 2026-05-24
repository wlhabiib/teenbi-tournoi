import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import '@/styles/ui-effects.css';



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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
          </div>
          <p className="text-yellow-300 mt-4">Chargement...</p>
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

