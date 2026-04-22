import { useEffect } from 'react';
import { getToken } from '@/src/api/auth';
import { useAuthStore } from '@/src/stores/useAuthStore';

export function useHydrateAuth() {
  const { setHydrated, logout } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    getToken().then((token) => {
      if (!mounted) return;
      if (!token) {
        logout();
      }
      setHydrated();
    });
    return () => { mounted = false; };
  }, []);
}
