'use client';

import { createContext, useContext } from 'react';
import type { SessionUser } from '@/lib/auth-client';

/**
 * Session context.
 *
 * Provided by AuthProvider in the root layout. `user` is null while signed
 * out or still loading; `loading` distinguishes the two so the header can
 * avoid a signed-out flash before the first /me response lands.
 */

export type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => undefined,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
