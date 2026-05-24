import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, isAuthenticated, isUserAdmin } from './authSupabase';

export function useRequireAdmin(publicLoadingFallback: React.ReactNode = null) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => {
      const authed = isAuthenticated();
      const user = getCurrentUser();
      if (!authed || !user || !isUserAdmin()) {
        router.replace('/login');
      }
      setReady(true);
    };
    check();
  }, [router]);

  return { ready };
}

