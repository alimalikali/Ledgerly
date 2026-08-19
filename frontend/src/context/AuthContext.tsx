import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "displayCurrency">>) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session from the httpOnly cookie on load.
  useEffect(() => {
    api.auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setInitializing(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      initializing,
      login: async (email, password) => setUser(await api.auth.login(email, password)),
      register: async (name, email, password) => setUser(await api.auth.register(name, email, password)),
      logout: async () => {
        try {
          await api.auth.logout();
        } finally {
          setUser(null);
        }
      },
      updateProfile: async (patch) => {
        await api.auth.updateProfile(patch);
        setUser((prev) => (prev ? { ...prev, ...patch } : prev));
      },
    }),
    [user, initializing],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
