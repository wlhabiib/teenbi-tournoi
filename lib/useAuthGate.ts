import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, isAuthenticated } from './authSupabase';

export function useAuthGate(publicPages: string[]) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const check = () => {
      const u = getCurrentUser();
      const authed = isAuthenticated();
      setUser(u);
      if (!authed && !publicPages.includes(router.pathname)) {
        router.replace('/login');
      }
      setReady(true);
    };
    check();
  }, [router, router.pathname, publicPages]);

  return { ready, user };
}

