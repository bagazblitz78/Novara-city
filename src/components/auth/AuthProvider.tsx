'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/components/auth/AuthContext';
import { fetchCurrentUser, logoutUser } from '@/lib/auth-client';
import type { SessionUser } from '@/lib/auth-client';

/**
 * Client-side session state.
 *
 * Loads the current user once on mount via GET /me, then keeps it in context
 * so the header and pages react to sign-in/sign-out without a full reload.
 * The server remains the authority — this is purely presentational state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((resolved) => {
      if (active) {
        setUser(resolved);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await logoutUser().catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
