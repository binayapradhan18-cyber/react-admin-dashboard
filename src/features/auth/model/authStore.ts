import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, SessionUser } from '../types';

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  setSession: (session: Session) => void;
  updateUser: (patch: Partial<Omit<SessionUser, 'id' | 'role'>>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      updateUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : {})),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: 'rad.auth',
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.token !== null);
